/**
 * ActionQueue - Reliable UI action execution system
 *
 * Problem: When clicking UI buttons (especially at high game speeds), the action
 * callback can fail to execute if:
 * 1. The UI element is destroyed between click detection and callback execution
 * 2. Game state changes during the async gap (setTimeout)
 * 3. Multiple rapid clicks cause race conditions
 *
 * Solution: Capture all necessary action data synchronously on click, then
 * process actions in a controlled manner during the next frame.
 */

export interface QueuedAction {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

type ActionHandler = (data: Record<string, unknown>) => void;

class ActionQueueImpl {
  private static instance: ActionQueueImpl;
  private queue: QueuedAction[] = [];
  private handlers: Map<string, ActionHandler> = new Map();
  private readonly MAX_AGE_MS = 500; // Discard actions older than 500ms

  private constructor() {}

  public static getInstance(): ActionQueueImpl {
    if (!ActionQueueImpl.instance) {
      ActionQueueImpl.instance = new ActionQueueImpl();
    }
    return ActionQueueImpl.instance;
  }

  /**
   * Register a handler for a specific action type
   */
  public registerHandler(type: string, handler: ActionHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Unregister a handler
   */
  public unregisterHandler(type: string): void {
    this.handlers.delete(type);
  }

  /**
   * Queue an action to be processed. Call this synchronously from pointerdown.
   * All relevant data must be captured at this moment.
   */
  public enqueue(type: string, data: Record<string, unknown>): void {
    this.queue.push({
      type,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Process all queued actions. Call this at the start of the game update loop.
   */
  public processQueue(): void {
    const now = Date.now();

    while (this.queue.length > 0) {
      const action = this.queue.shift()!;

      // Skip stale actions
      if (now - action.timestamp > this.MAX_AGE_MS) {
        console.warn(`[ActionQueue] Discarding stale action: ${action.type}`);
        continue;
      }

      const handler = this.handlers.get(action.type);
      if (handler) {
        try {
          handler(action.data);
        } catch (error) {
          console.error(`[ActionQueue] Error processing action ${action.type}:`, error);
        }
      } else {
        console.warn(`[ActionQueue] No handler for action type: ${action.type}`);
      }
    }
  }

  /**
   * Clear all pending actions (e.g., on scene shutdown)
   */
  public clear(): void {
    this.queue = [];
  }

  /**
   * Check if there are pending actions
   */
  public hasPending(): boolean {
    return this.queue.length > 0;
  }
}

export const ActionQueue = ActionQueueImpl.getInstance();
