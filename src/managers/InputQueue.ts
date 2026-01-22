/**
 * InputQueue - Priority input handling system
 *
 * Captures clicks at DOM level (bypassing Phaser's internal queue) to ensure
 * no clicks are lost during heavy game frames (e.g., 3x speed with many creeps).
 *
 * The queue stores click events and processes them at the start of each frame,
 * guaranteeing reliable click registration even under load.
 */

export interface QueuedClick {
  x: number;
  y: number;
  timestamp: number;
  processed: boolean;
}

export interface ClickHandler {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  callback: () => void;
  priority: number; // Higher = processed first
  active: boolean;
}

export class InputQueue {
  private static instance: InputQueue | null = null;

  private clickQueue: QueuedClick[] = [];
  private handlers: Map<string, ClickHandler> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private boundClickHandler: ((e: MouseEvent) => void) | null = null;
  private enabled: boolean = true;

  // Debounce protection
  private lastClickTime: number = 0;
  private readonly DEBOUNCE_MS = 50;

  // Max queue size to prevent memory issues
  private readonly MAX_QUEUE_SIZE = 10;

  // Click timeout - don't process clicks older than this
  private readonly CLICK_TIMEOUT_MS = 500;

  private constructor() {}

  static getInstance(): InputQueue {
    if (!InputQueue.instance) {
      InputQueue.instance = new InputQueue();
    }
    return InputQueue.instance;
  }

  /**
   * Initialize the queue with the game canvas
   */
  init(canvas: HTMLCanvasElement): void {
    if (this.canvas === canvas) return;

    this.cleanup();

    this.canvas = canvas;
    this.boundClickHandler = this.handleDOMClick.bind(this);

    // Capture at DOM level with capture phase for earliest possible detection
    canvas.addEventListener('mousedown', this.boundClickHandler, { capture: true });
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      capture: true,
      passive: false,
    });
  }

  /**
   * Handle raw DOM click event
   */
  private handleDOMClick(e: MouseEvent): void {
    if (!this.enabled) return;

    const now = performance.now();

    // Debounce protection
    if (now - this.lastClickTime < this.DEBOUNCE_MS) {
      return;
    }
    this.lastClickTime = now;

    // Get click position relative to canvas
    const rect = this.canvas!.getBoundingClientRect();
    const scaleX = this.canvas!.width / rect.width;
    const scaleY = this.canvas!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    this.queueClick(x, y, now);
  }

  /**
   * Handle touch events
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled) return;
    if (e.touches.length === 0) return;

    const now = performance.now();

    if (now - this.lastClickTime < this.DEBOUNCE_MS) {
      return;
    }
    this.lastClickTime = now;

    const touch = e.touches[0];
    const rect = this.canvas!.getBoundingClientRect();
    const scaleX = this.canvas!.width / rect.width;
    const scaleY = this.canvas!.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.queueClick(x, y, now);
  }

  /**
   * Add click to queue
   */
  private queueClick(x: number, y: number, timestamp: number): void {
    // Limit queue size
    if (this.clickQueue.length >= this.MAX_QUEUE_SIZE) {
      this.clickQueue.shift();
    }

    this.clickQueue.push({
      x,
      y,
      timestamp,
      processed: false,
    });
  }

  /**
   * Register a click handler for a specific area
   */
  registerHandler(handler: ClickHandler): void {
    this.handlers.set(handler.id, handler);
  }

  /**
   * Unregister a handler
   */
  unregisterHandler(id: string): void {
    this.handlers.delete(id);
  }

  /**
   * Update handler bounds (for moving UI elements)
   */
  updateHandlerBounds(
    id: string,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    const handler = this.handlers.get(id);
    if (handler) {
      handler.bounds = bounds;
    }
  }

  /**
   * Set handler active state
   */
  setHandlerActive(id: string, active: boolean): void {
    const handler = this.handlers.get(id);
    if (handler) {
      handler.active = active;
    }
  }

  /**
   * Process queued clicks - call this at the START of update loop
   */
  processQueue(): void {
    if (!this.enabled) return;

    const now = performance.now();

    // Get sorted handlers by priority (highest first)
    const sortedHandlers = Array.from(this.handlers.values())
      .filter((h) => h.active)
      .sort((a, b) => b.priority - a.priority);

    // Process each unprocessed click
    for (const click of this.clickQueue) {
      if (click.processed) continue;

      // Skip old clicks
      if (now - click.timestamp > this.CLICK_TIMEOUT_MS) {
        click.processed = true;
        continue;
      }

      // Try to match against handlers
      for (const handler of sortedHandlers) {
        if (this.isPointInBounds(click.x, click.y, handler.bounds)) {
          try {
            handler.callback();
          } catch (error) {
            console.error(`InputQueue: Handler ${handler.id} threw error:`, error);
          }
          click.processed = true;
          break; // Only one handler per click
        }
      }

      // Mark as processed even if no handler matched
      click.processed = true;
    }

    // Clear processed clicks
    this.clickQueue = this.clickQueue.filter((c) => !c.processed);
  }

  /**
   * Check if point is within bounds
   */
  private isPointInBounds(
    x: number,
    y: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  /**
   * Get pending clicks (for debugging or manual processing)
   */
  getPendingClicks(): QueuedClick[] {
    return this.clickQueue.filter((c) => !c.processed);
  }

  /**
   * Check if there are any pending clicks
   */
  hasPendingClicks(): boolean {
    return this.clickQueue.some((c) => !c.processed);
  }

  /**
   * Enable/disable the queue
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all queued clicks
   */
  clearQueue(): void {
    this.clickQueue = [];
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.canvas && this.boundClickHandler) {
      this.canvas.removeEventListener('mousedown', this.boundClickHandler, { capture: true });
    }
    this.canvas = null;
    this.boundClickHandler = null;
    this.clickQueue = [];
    this.handlers.clear();
  }

  /**
   * Destroy the singleton instance
   */
  static destroy(): void {
    if (InputQueue.instance) {
      InputQueue.instance.cleanup();
      InputQueue.instance = null;
    }
  }
}
