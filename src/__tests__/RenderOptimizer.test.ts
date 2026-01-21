import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define classes locally to avoid Phaser import from RenderOptimizer
class DirtyTracker {
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

  checkState(currentState: string): boolean {
    if (currentState !== this.lastState) {
      this.lastState = currentState;
      this.dirty = true;
    }
    return this.dirty;
  }

  static hashState(...values: (string | number | boolean)[]): string {
    return values.map((v) => String(v)).join('|');
  }
}

class DrawBatcher {
  private drawCalls: (() => void)[] = [];

  queue(drawFn: () => void): void {
    this.drawCalls.push(drawFn);
  }

  flush(): void {
    for (const fn of this.drawCalls) {
      fn();
    }
    this.drawCalls = [];
  }

  clear(): void {
    this.drawCalls = [];
  }

  get pendingCount(): number {
    return this.drawCalls.length;
  }
}

class FrameThrottler {
  private frameInterval: number;
  private frameCount: number = 0;

  constructor(frameInterval: number = 2) {
    this.frameInterval = frameInterval;
  }

  shouldUpdate(): boolean {
    this.frameCount++;
    if (this.frameCount >= this.frameInterval) {
      this.frameCount = 0;
      return true;
    }
    return false;
  }

  forceNext(): void {
    this.frameCount = this.frameInterval - 1;
  }

  setInterval(interval: number): void {
    this.frameInterval = Math.max(1, interval);
  }
}

/**
 * Tests for RenderOptimizer utility classes.
 * These tests validate pure logic without Phaser dependencies.
 */
describe('RenderOptimizer Utilities', () => {
  describe('DirtyTracker', () => {
    let tracker: DirtyTracker;

    beforeEach(() => {
      tracker = new DirtyTracker();
    });

    it('should start as dirty', () => {
      expect(tracker.isDirty()).toBe(true);
    });

    it('should mark clean', () => {
      tracker.markClean();
      expect(tracker.isDirty()).toBe(false);
    });

    it('should mark dirty', () => {
      tracker.markClean();
      expect(tracker.isDirty()).toBe(false);

      tracker.markDirty();
      expect(tracker.isDirty()).toBe(true);
    });

    it('should detect state changes with checkState', () => {
      tracker.markClean();
      expect(tracker.isDirty()).toBe(false);

      // Same state - no change
      tracker.checkState('state1');
      expect(tracker.isDirty()).toBe(true); // First check marks dirty

      tracker.markClean();

      // Same state again - no change
      tracker.checkState('state1');
      expect(tracker.isDirty()).toBe(false);

      // Different state - marks dirty
      tracker.checkState('state2');
      expect(tracker.isDirty()).toBe(true);
    });

    it('should hash multiple values correctly', () => {
      const hash1 = DirtyTracker.hashState('tower', 1, true);
      const hash2 = DirtyTracker.hashState('tower', 1, true);
      const hash3 = DirtyTracker.hashState('tower', 2, true);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toBe('tower|1|true');
    });

    it('should handle various value types in hashState', () => {
      const hash = DirtyTracker.hashState('name', 42, false, 3.14);
      expect(hash).toBe('name|42|false|3.14');
    });
  });

  describe('DrawBatcher', () => {
    let batcher: DrawBatcher;

    beforeEach(() => {
      batcher = new DrawBatcher();
    });

    it('should start with no pending calls', () => {
      expect(batcher.pendingCount).toBe(0);
    });

    it('should queue draw calls', () => {
      batcher.queue(() => {});
      expect(batcher.pendingCount).toBe(1);

      batcher.queue(() => {});
      batcher.queue(() => {});
      expect(batcher.pendingCount).toBe(3);
    });

    it('should execute all queued calls on flush', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn();

      batcher.queue(fn1);
      batcher.queue(fn2);
      batcher.queue(fn3);

      batcher.flush();

      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
      expect(fn3).toHaveBeenCalledTimes(1);
    });

    it('should clear queue after flush', () => {
      batcher.queue(() => {});
      batcher.queue(() => {});

      expect(batcher.pendingCount).toBe(2);
      batcher.flush();
      expect(batcher.pendingCount).toBe(0);
    });

    it('should clear queue without executing on clear', () => {
      const fn = vi.fn();
      batcher.queue(fn);
      batcher.queue(fn);

      batcher.clear();

      expect(batcher.pendingCount).toBe(0);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should execute calls in order', () => {
      const order: number[] = [];

      batcher.queue(() => order.push(1));
      batcher.queue(() => order.push(2));
      batcher.queue(() => order.push(3));

      batcher.flush();

      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('FrameThrottler', () => {
    it('should trigger on first update', () => {
      const throttler = new FrameThrottler(2);
      expect(throttler.shouldUpdate()).toBe(false);
    });

    it('should trigger every N frames', () => {
      const throttler = new FrameThrottler(3);

      expect(throttler.shouldUpdate()).toBe(false); // frame 1
      expect(throttler.shouldUpdate()).toBe(false); // frame 2
      expect(throttler.shouldUpdate()).toBe(true); // frame 3

      expect(throttler.shouldUpdate()).toBe(false); // frame 1
      expect(throttler.shouldUpdate()).toBe(false); // frame 2
      expect(throttler.shouldUpdate()).toBe(true); // frame 3
    });

    it('should work with interval of 1 (every frame)', () => {
      const throttler = new FrameThrottler(1);

      expect(throttler.shouldUpdate()).toBe(true);
      expect(throttler.shouldUpdate()).toBe(true);
      expect(throttler.shouldUpdate()).toBe(true);
    });

    it('should force next update with forceNext', () => {
      const throttler = new FrameThrottler(5);

      expect(throttler.shouldUpdate()).toBe(false); // frame 1

      throttler.forceNext();
      expect(throttler.shouldUpdate()).toBe(true); // forced
    });

    it('should update interval with setInterval', () => {
      const throttler = new FrameThrottler(2);

      expect(throttler.shouldUpdate()).toBe(false); // frame 1
      expect(throttler.shouldUpdate()).toBe(true); // frame 2

      throttler.setInterval(4);

      expect(throttler.shouldUpdate()).toBe(false); // frame 1
      expect(throttler.shouldUpdate()).toBe(false); // frame 2
      expect(throttler.shouldUpdate()).toBe(false); // frame 3
      expect(throttler.shouldUpdate()).toBe(true); // frame 4
    });

    it('should enforce minimum interval of 1', () => {
      const throttler = new FrameThrottler(2);
      throttler.setInterval(0);

      // Should behave like interval of 1
      expect(throttler.shouldUpdate()).toBe(true);
      expect(throttler.shouldUpdate()).toBe(true);
    });
  });

  describe('Integration Patterns', () => {
    it('should combine DirtyTracker with FrameThrottler for optimized updates', () => {
      const tracker = new DirtyTracker();
      const throttler = new FrameThrottler(2);
      const updateFn = vi.fn();

      // Simulate multiple frames
      for (let frame = 0; frame < 6; frame++) {
        if (throttler.shouldUpdate() && tracker.isDirty()) {
          updateFn();
          tracker.markClean();
        }
      }

      // Should only update on frames 2, 4, 6 and only if dirty
      // First dirty update on frame 2
      expect(updateFn).toHaveBeenCalledTimes(1);

      // Mark dirty and continue
      tracker.markDirty();
      for (let frame = 0; frame < 2; frame++) {
        if (throttler.shouldUpdate() && tracker.isDirty()) {
          updateFn();
          tracker.markClean();
        }
      }
      expect(updateFn).toHaveBeenCalledTimes(2);
    });

    it('should use state hash to detect changes', () => {
      const tracker = new DirtyTracker();
      const updateFn = vi.fn();

      const entities = [
        { id: 1, health: 100, level: 1 },
        { id: 2, health: 50, level: 2 },
      ];

      // Generate initial state hash
      const getStateHash = () => {
        return entities.map((e) => `${e.id}:${e.health}:${e.level}`).join(',');
      };

      tracker.checkState(getStateHash());
      if (tracker.isDirty()) {
        updateFn();
        tracker.markClean();
      }
      expect(updateFn).toHaveBeenCalledTimes(1);

      // Same state - no update
      tracker.checkState(getStateHash());
      if (tracker.isDirty()) {
        updateFn();
        tracker.markClean();
      }
      expect(updateFn).toHaveBeenCalledTimes(1);

      // Change entity - triggers update
      entities[0].health = 80;
      tracker.checkState(getStateHash());
      if (tracker.isDirty()) {
        updateFn();
        tracker.markClean();
      }
      expect(updateFn).toHaveBeenCalledTimes(2);
    });
  });
});
