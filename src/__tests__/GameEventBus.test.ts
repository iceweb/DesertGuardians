import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEventBus, GameEventType, getEventBus } from '../managers/GameEventBus';

// Mock Phaser EventEmitter
vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class MockEventEmitter {
        private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();
        private onceListeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

        on(event: string, fn: (...args: unknown[]) => void) {
          if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
          }
          this.listeners.get(event)!.push(fn);
        }

        once(event: string, fn: (...args: unknown[]) => void) {
          if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
          }
          this.onceListeners.get(event)!.push(fn);
        }

        off(event: string, fn: (...args: unknown[]) => void) {
          const listeners = this.listeners.get(event);
          if (listeners) {
            const idx = listeners.indexOf(fn);
            if (idx > -1) listeners.splice(idx, 1);
          }
        }

        emit(event: string, ...args: unknown[]) {
          const listeners = this.listeners.get(event) || [];
          listeners.forEach((fn) => fn(...args));

          const onceListeners = this.onceListeners.get(event) || [];
          onceListeners.forEach((fn) => fn(...args));
          this.onceListeners.set(event, []);
        }

        removeAllListeners(event?: string) {
          if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
          } else {
            this.listeners.clear();
            this.onceListeners.clear();
          }
        }

        listenerCount(event: string): number {
          return (
            (this.listeners.get(event)?.length || 0) + (this.onceListeners.get(event)?.length || 0)
          );
        }
      },
    },
  },
}));

describe('GameEventBus', () => {
  beforeEach(() => {
    // Reset singleton before each test
    GameEventBus.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = GameEventBus.getInstance();
      const instance2 = GameEventBus.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return a new instance after reset', () => {
      const instance1 = GameEventBus.getInstance();
      GameEventBus.reset();
      const instance2 = GameEventBus.getInstance();
      expect(instance1).not.toBe(instance2);
    });

    it('should provide convenience getEventBus function', () => {
      const instance = getEventBus();
      expect(instance).toBe(GameEventBus.getInstance());
    });
  });

  describe('Event Subscription', () => {
    it('should register and call event handlers', () => {
      const eventBus = GameEventBus.getInstance();
      const handler = vi.fn();

      eventBus.on(GameEventType.WAVE_STARTED, handler);
      eventBus.emit(GameEventType.WAVE_STARTED, { waveNumber: 1, totalWaves: 10 });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ waveNumber: 1, totalWaves: 10 });
    });

    it('should call handler on every emit', () => {
      const eventBus = GameEventBus.getInstance();
      const handler = vi.fn();

      eventBus.on(GameEventType.GOLD_CHANGED, handler);
      eventBus.emit(GameEventType.GOLD_CHANGED, { oldAmount: 100, newAmount: 150, delta: 50 });
      eventBus.emit(GameEventType.GOLD_CHANGED, { oldAmount: 150, newAmount: 200, delta: 50 });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should support once subscription', () => {
      const eventBus = GameEventBus.getInstance();
      const handler = vi.fn();

      eventBus.once(GameEventType.GAME_STARTED, handler);
      eventBus.emit(GameEventType.GAME_STARTED, { difficulty: 'normal' });
      eventBus.emit(GameEventType.GAME_STARTED, { difficulty: 'hard' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ difficulty: 'normal' });
    });

    it('should support multiple handlers for same event', () => {
      const eventBus = GameEventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(GameEventType.CREEP_DIED, handler1);
      eventBus.on(GameEventType.CREEP_DIED, handler2);
      eventBus.emit(GameEventType.CREEP_DIED, {
        creep: {} as import('../objects/Creep').Creep,
        goldReward: 10,
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Unsubscription', () => {
    it('should unsubscribe handler with off', () => {
      const eventBus = GameEventBus.getInstance();
      const handler = vi.fn();

      eventBus.on(GameEventType.TOWER_BUILT, handler);
      eventBus.off(GameEventType.TOWER_BUILT, handler);
      eventBus.emit(GameEventType.TOWER_BUILT, {
        tower: {} as import('../objects/Tower').Tower,
        cost: 50,
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should remove all listeners for specific event', () => {
      const eventBus = GameEventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(GameEventType.WAVE_COMPLETED, handler1);
      eventBus.on(GameEventType.WAVE_COMPLETED, handler2);
      eventBus.removeListeners(GameEventType.WAVE_COMPLETED);
      eventBus.emit(GameEventType.WAVE_COMPLETED, { waveNumber: 1, reward: 100 });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should remove all listeners with removeAllListeners', () => {
      const eventBus = GameEventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on(GameEventType.GAME_PAUSED, handler1);
      eventBus.on(GameEventType.GAME_RESUMED, handler2);
      eventBus.removeAllListeners();
      eventBus.emit(GameEventType.GAME_PAUSED, {});
      eventBus.emit(GameEventType.GAME_RESUMED, {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Listener Count', () => {
    it('should return correct listener count', () => {
      const eventBus = GameEventBus.getInstance();

      expect(eventBus.listenerCount(GameEventType.PROJECTILE_FIRED)).toBe(0);

      eventBus.on(GameEventType.PROJECTILE_FIRED, () => {});
      expect(eventBus.listenerCount(GameEventType.PROJECTILE_FIRED)).toBe(1);

      eventBus.on(GameEventType.PROJECTILE_FIRED, () => {});
      expect(eventBus.listenerCount(GameEventType.PROJECTILE_FIRED)).toBe(2);
    });
  });

  describe('Chaining', () => {
    it('should support method chaining', () => {
      const eventBus = GameEventBus.getInstance();
      const handler = vi.fn();

      const result = eventBus
        .on(GameEventType.MENU_OPENED, handler)
        .emit(GameEventType.MENU_OPENED, { menuId: 'settings' })
        .off(GameEventType.MENU_OPENED, handler);

      expect(result).toBe(eventBus);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Types', () => {
    it('should have all expected wave events', () => {
      expect(GameEventType.WAVE_STARTED).toBe('wave:started');
      expect(GameEventType.WAVE_COMPLETED).toBe('wave:completed');
      expect(GameEventType.WAVE_SPAWNING).toBe('wave:spawning');
      expect(GameEventType.ALL_WAVES_COMPLETE).toBe('wave:allComplete');
    });

    it('should have all expected creep events', () => {
      expect(GameEventType.CREEP_SPAWNED).toBe('creep:spawned');
      expect(GameEventType.CREEP_DIED).toBe('creep:died');
      expect(GameEventType.CREEP_ESCAPED).toBe('creep:escaped');
      expect(GameEventType.CREEP_DAMAGED).toBe('creep:damaged');
    });

    it('should have all expected tower events', () => {
      expect(GameEventType.TOWER_BUILT).toBe('tower:built');
      expect(GameEventType.TOWER_UPGRADED).toBe('tower:upgraded');
      expect(GameEventType.TOWER_SOLD).toBe('tower:sold');
      expect(GameEventType.TOWER_SELECTED).toBe('tower:selected');
      expect(GameEventType.TOWER_DESELECTED).toBe('tower:deselected');
    });

    it('should have all expected economy events', () => {
      expect(GameEventType.GOLD_CHANGED).toBe('economy:goldChanged');
      expect(GameEventType.GOLD_EARNED).toBe('economy:goldEarned');
      expect(GameEventType.GOLD_SPENT).toBe('economy:goldSpent');
      expect(GameEventType.MINE_COLLECTED).toBe('economy:mineCollected');
    });

    it('should have all expected game state events', () => {
      expect(GameEventType.GAME_STARTED).toBe('game:started');
      expect(GameEventType.GAME_PAUSED).toBe('game:paused');
      expect(GameEventType.GAME_RESUMED).toBe('game:resumed');
      expect(GameEventType.GAME_OVER).toBe('game:over');
      expect(GameEventType.GAME_WON).toBe('game:won');
    });
  });
});
