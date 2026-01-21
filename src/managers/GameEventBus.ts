import Phaser from 'phaser';
import type { Tower } from '../objects/Tower';
import type { Creep } from '../objects/Creep';

/**
 * Game Event Types - Defines all events that can flow through the event bus
 */
export const GameEventType = {
  // Wave Events
  WAVE_STARTED: 'wave:started',
  WAVE_COMPLETED: 'wave:completed',
  WAVE_SPAWNING: 'wave:spawning',
  ALL_WAVES_COMPLETE: 'wave:allComplete',

  // Creep Events
  CREEP_SPAWNED: 'creep:spawned',
  CREEP_DIED: 'creep:died',
  CREEP_ESCAPED: 'creep:escaped',
  CREEP_DAMAGED: 'creep:damaged',

  // Tower Events
  TOWER_BUILT: 'tower:built',
  TOWER_UPGRADED: 'tower:upgraded',
  TOWER_SOLD: 'tower:sold',
  TOWER_SELECTED: 'tower:selected',
  TOWER_DESELECTED: 'tower:deselected',
  TOWER_ABILITY_TRIGGERED: 'tower:abilityTriggered',

  // Combat Events
  PROJECTILE_FIRED: 'combat:projectileFired',
  PROJECTILE_HIT: 'combat:projectileHit',
  DAMAGE_DEALT: 'combat:damageDealt',
  CRITICAL_HIT: 'combat:criticalHit',

  // Economy Events
  GOLD_CHANGED: 'economy:goldChanged',
  GOLD_EARNED: 'economy:goldEarned',
  GOLD_SPENT: 'economy:goldSpent',
  MINE_COLLECTED: 'economy:mineCollected',

  // Player Events
  LIVES_CHANGED: 'player:livesChanged',
  PLAYER_DAMAGED: 'player:damaged',
  PLAYER_DIED: 'player:died',

  // UI Events
  MENU_OPENED: 'ui:menuOpened',
  MENU_CLOSED: 'ui:menuClosed',
  TOOLTIP_SHOW: 'ui:tooltipShow',
  TOOLTIP_HIDE: 'ui:tooltipHide',

  // Game State Events
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_OVER: 'game:over',
  GAME_WON: 'game:won',
} as const;

export type GameEventType = (typeof GameEventType)[keyof typeof GameEventType];

/**
 * Event data payloads for each event type
 */
export interface GameEventData {
  // Wave Events
  [GameEventType.WAVE_STARTED]: { waveNumber: number; totalWaves: number };
  [GameEventType.WAVE_COMPLETED]: { waveNumber: number; reward: number };
  [GameEventType.WAVE_SPAWNING]: { waveNumber: number; creepsRemaining: number };
  [GameEventType.ALL_WAVES_COMPLETE]: { totalWaves: number };

  // Creep Events
  [GameEventType.CREEP_SPAWNED]: { creep: Creep; waveNumber: number };
  [GameEventType.CREEP_DIED]: { creep: Creep; killer?: Tower; goldReward: number };
  [GameEventType.CREEP_ESCAPED]: { creep: Creep; damageToPlayer: number };
  [GameEventType.CREEP_DAMAGED]: { creep: Creep; damage: number; source?: Tower };

  // Tower Events
  [GameEventType.TOWER_BUILT]: { tower: Tower; cost: number };
  [GameEventType.TOWER_UPGRADED]: { tower: Tower; cost: number; previousKey: string };
  [GameEventType.TOWER_SOLD]: { tower: Tower; refund: number };
  [GameEventType.TOWER_SELECTED]: { tower: Tower };
  [GameEventType.TOWER_DESELECTED]: { tower: Tower | null };
  [GameEventType.TOWER_ABILITY_TRIGGERED]: { tower: Tower; abilityId: string };

  // Combat Events
  [GameEventType.PROJECTILE_FIRED]: { tower: Tower; target: Creep };
  [GameEventType.PROJECTILE_HIT]: { tower: Tower; target: Creep; damage: number };
  [GameEventType.DAMAGE_DEALT]: { source: Tower; target: Creep; amount: number };
  [GameEventType.CRITICAL_HIT]: {
    source: Tower;
    target: Creep;
    amount: number;
    multiplier: number;
  };

  // Economy Events
  [GameEventType.GOLD_CHANGED]: { oldAmount: number; newAmount: number; delta: number };
  [GameEventType.GOLD_EARNED]: { amount: number; source: string };
  [GameEventType.GOLD_SPENT]: { amount: number; purpose: string };
  [GameEventType.MINE_COLLECTED]: { mineId: string; amount: number };

  // Player Events
  [GameEventType.LIVES_CHANGED]: { oldLives: number; newLives: number };
  [GameEventType.PLAYER_DAMAGED]: { damage: number; source: Creep };
  [GameEventType.PLAYER_DIED]: { finalWave: number; score: number };

  // UI Events
  [GameEventType.MENU_OPENED]: { menuId: string };
  [GameEventType.MENU_CLOSED]: { menuId: string };
  [GameEventType.TOOLTIP_SHOW]: { content: string; x: number; y: number };
  [GameEventType.TOOLTIP_HIDE]: Record<string, never>;

  // Game State Events
  [GameEventType.GAME_STARTED]: { difficulty: string };
  [GameEventType.GAME_PAUSED]: Record<string, never>;
  [GameEventType.GAME_RESUMED]: Record<string, never>;
  [GameEventType.GAME_OVER]: { won: boolean; wave: number; score: number };
  [GameEventType.GAME_WON]: { wave: number; score: number };
}

/**
 * Event handler type for type-safe event subscriptions
 */
export type GameEventHandler<T extends GameEventType> = (data: GameEventData[T]) => void;

/**
 * GameEventBus - Centralized event system for decoupled manager communication
 *
 * Usage:
 * ```
 * // Subscribe to events
 * eventBus.on(GameEventType.CREEP_DIED, (data) => {
 *   console.log(`Creep killed, earned ${data.goldReward} gold`);
 * });
 *
 * // Emit events
 * eventBus.emit(GameEventType.CREEP_DIED, { creep, killer: tower, goldReward: 10 });
 * ```
 */
export class GameEventBus {
  private static instance: GameEventBus | null = null;
  private emitter: Phaser.Events.EventEmitter;
  private debugMode: boolean = false;

  private constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Get the singleton instance of the GameEventBus
   */
  static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  /**
   * Reset the singleton instance (useful for testing or game restart)
   */
  static reset(): void {
    if (GameEventBus.instance) {
      GameEventBus.instance.removeAllListeners();
      GameEventBus.instance = null;
    }
  }

  /**
   * Enable or disable debug logging for all events
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to a game event
   */
  on<T extends GameEventType>(eventType: T, handler: GameEventHandler<T>): this {
    this.emitter.on(eventType, handler);
    return this;
  }

  /**
   * Subscribe to a game event, but only trigger once
   */
  once<T extends GameEventType>(eventType: T, handler: GameEventHandler<T>): this {
    this.emitter.once(eventType, handler);
    return this;
  }

  /**
   * Unsubscribe from a game event
   */
  off<T extends GameEventType>(eventType: T, handler: GameEventHandler<T>): this {
    this.emitter.off(eventType, handler);
    return this;
  }

  /**
   * Emit a game event with type-safe data
   */
  emit<T extends GameEventType>(eventType: T, data: GameEventData[T]): this {
    if (this.debugMode) {
      console.warn(`[GameEventBus] ${eventType}`, data);
    }
    this.emitter.emit(eventType, data);
    return this;
  }

  /**
   * Remove all listeners for all events
   */
  removeAllListeners(): this {
    this.emitter.removeAllListeners();
    return this;
  }

  /**
   * Remove all listeners for a specific event
   */
  removeListeners<T extends GameEventType>(eventType: T): this {
    this.emitter.removeAllListeners(eventType);
    return this;
  }

  /**
   * Get the number of listeners for a specific event
   */
  listenerCount<T extends GameEventType>(eventType: T): number {
    return this.emitter.listenerCount(eventType);
  }
}

// Export a convenience function to get the event bus instance
export function getEventBus(): GameEventBus {
  return GameEventBus.getInstance();
}
