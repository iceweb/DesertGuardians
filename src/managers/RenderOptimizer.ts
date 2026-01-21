import Phaser from 'phaser';

/**
 * Utility class for optimizing rendering performance.
 * Provides patterns for dirty-flag tracking and texture caching.
 */
export class RenderOptimizer {
  /**
   * Tracks whether a graphics object needs to be redrawn.
   * Use with graphics that don't change every frame.
   */
  static createDirtyTracker(): DirtyTracker {
    return new DirtyTracker();
  }

  /**
   * Creates a texture cache for complex graphics that rarely change.
   * Useful for tower/creep appearances that only change on level up or damage.
   */
  static createTextureCache(scene: Phaser.Scene, maxSize: number = 50): TextureCache {
    return new TextureCache(scene, maxSize);
  }

  /**
   * Creates a graphics pool to reduce allocation overhead.
   */
  static createGraphicsPool(scene: Phaser.Scene, initialSize: number = 10): GraphicsPool {
    return new GraphicsPool(scene, initialSize);
  }
}

/**
 * Tracks dirty state for graphics objects to avoid unnecessary redraws.
 *
 * Usage:
 * ```
 * const tracker = RenderOptimizer.createDirtyTracker();
 *
 * // When data changes:
 * tracker.markDirty();
 *
 * // In update loop:
 * if (tracker.isDirty()) {
 *   redrawGraphics();
 *   tracker.markClean();
 * }
 * ```
 */
export class DirtyTracker {
  private dirty: boolean = true;
  private lastState: string = '';

  markDirty(): void {
    this.dirty = true;
  }

  markClean(): void {
    this.dirty = false;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  /**
   * Check if state has changed using a hash string.
   * Automatically marks dirty if state differs.
   */
  checkState(currentState: string): boolean {
    if (currentState !== this.lastState) {
      this.lastState = currentState;
      this.dirty = true;
    }
    return this.dirty;
  }

  /**
   * Generate a state hash from multiple values.
   */
  static hashState(...values: (string | number | boolean)[]): string {
    return values.map((v) => String(v)).join('|');
  }
}

/**
 * Caches rendered graphics as reusable textures.
 * Useful for complex static graphics like creep/tower base appearances.
 *
 * Usage:
 * ```
 * const cache = RenderOptimizer.createTextureCache(scene);
 *
 * const key = `creep_${type}_${level}`;
 * let texture = cache.get(key);
 *
 * if (!texture) {
 *   texture = cache.renderToTexture(key, 64, 64, (graphics) => {
 *     drawCreep(graphics, type, level);
 *   });
 * }
 *
 * sprite.setTexture(texture);
 * ```
 */
export class TextureCache {
  private scene: Phaser.Scene;
  private maxSize: number;
  private cache: Map<string, string> = new Map();
  private accessOrder: string[] = [];

  constructor(scene: Phaser.Scene, maxSize: number) {
    this.scene = scene;
    this.maxSize = maxSize;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): string | undefined {
    if (this.cache.has(key)) {
      // Move to end of access order (LRU)
      const idx = this.accessOrder.indexOf(key);
      if (idx > -1) {
        this.accessOrder.splice(idx, 1);
        this.accessOrder.push(key);
      }
      return this.cache.get(key);
    }
    return undefined;
  }

  /**
   * Render a graphics drawing function to a cached texture.
   */
  renderToTexture(
    key: string,
    width: number,
    height: number,
    drawFn: (graphics: Phaser.GameObjects.Graphics) => void
  ): string {
    if (this.cache.has(key)) {
      return key;
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.accessOrder.shift();
      if (oldest) {
        this.scene.textures.remove(oldest);
        this.cache.delete(oldest);
      }
    }

    // Create render texture
    const rt = this.scene.add.renderTexture(0, 0, width, height);
    rt.setVisible(false);

    // Draw to graphics
    const graphics = this.scene.add.graphics();
    graphics.setPosition(width / 2, height / 2);
    drawFn(graphics);

    // Render graphics to texture
    rt.draw(graphics, width / 2, height / 2);
    rt.saveTexture(key);

    // Cleanup
    graphics.destroy();
    rt.destroy();

    this.cache.set(key, key);
    this.accessOrder.push(key);

    return key;
  }

  clear(): void {
    for (const key of this.cache.keys()) {
      this.scene.textures.remove(key);
    }
    this.cache.clear();
    this.accessOrder = [];
  }

  destroy(): void {
    this.clear();
  }
}

/**
 * Object pool for Graphics objects to reduce GC pressure.
 *
 * Usage:
 * ```
 * const pool = RenderOptimizer.createGraphicsPool(scene);
 *
 * const graphics = pool.acquire();
 * graphics.fillCircle(0, 0, 10);
 * // ... use graphics ...
 * pool.release(graphics);
 * ```
 */
export class GraphicsPool {
  private scene: Phaser.Scene;
  private available: Phaser.GameObjects.Graphics[] = [];
  private inUse: Set<Phaser.GameObjects.Graphics> = new Set();

  constructor(scene: Phaser.Scene, initialSize: number) {
    this.scene = scene;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createGraphics());
    }
  }

  private createGraphics(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.setVisible(false);
    return g;
  }

  acquire(): Phaser.GameObjects.Graphics {
    let graphics: Phaser.GameObjects.Graphics;

    if (this.available.length > 0) {
      graphics = this.available.pop()!;
    } else {
      graphics = this.createGraphics();
    }

    graphics.clear();
    graphics.setVisible(true);
    graphics.setPosition(0, 0);
    graphics.setScale(1);
    graphics.setAlpha(1);
    graphics.setDepth(0);

    this.inUse.add(graphics);
    return graphics;
  }

  release(graphics: Phaser.GameObjects.Graphics): void {
    if (!this.inUse.has(graphics)) return;

    graphics.clear();
    graphics.setVisible(false);
    this.inUse.delete(graphics);
    this.available.push(graphics);
  }

  releaseAll(): void {
    for (const g of this.inUse) {
      g.clear();
      g.setVisible(false);
      this.available.push(g);
    }
    this.inUse.clear();
  }

  destroy(): void {
    for (const g of this.available) {
      g.destroy();
    }
    for (const g of this.inUse) {
      g.destroy();
    }
    this.available = [];
    this.inUse.clear();
  }

  getStats(): { available: number; inUse: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
    };
  }
}

/**
 * Batches multiple draw calls for better performance.
 * Useful when drawing many similar objects.
 */
export class DrawBatcher {
  private drawCalls: (() => void)[] = [];

  /**
   * Queue a draw call for batched execution.
   */
  queue(drawFn: () => void): void {
    this.drawCalls.push(drawFn);
  }

  /**
   * Execute all queued draw calls and clear the queue.
   */
  flush(): void {
    for (const fn of this.drawCalls) {
      fn();
    }
    this.drawCalls = [];
  }

  /**
   * Clear the queue without executing.
   */
  clear(): void {
    this.drawCalls = [];
  }

  get pendingCount(): number {
    return this.drawCalls.length;
  }
}

/**
 * Frame rate throttler for expensive operations.
 * Ensures operations only run every N frames.
 */
export class FrameThrottler {
  private frameInterval: number;
  private frameCount: number = 0;

  constructor(frameInterval: number = 2) {
    this.frameInterval = frameInterval;
  }

  /**
   * Check if operation should run this frame.
   * Call this in update() - automatically increments frame counter.
   */
  shouldUpdate(): boolean {
    this.frameCount++;
    if (this.frameCount >= this.frameInterval) {
      this.frameCount = 0;
      return true;
    }
    return false;
  }

  /**
   * Force next shouldUpdate() to return true.
   */
  forceNext(): void {
    this.frameCount = this.frameInterval - 1;
  }

  setInterval(interval: number): void {
    this.frameInterval = Math.max(1, interval);
  }
}
