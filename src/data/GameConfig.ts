/**
 * Centralized game configuration constants.
 * Edit values here to adjust game balance without modifying code in multiple places.
 */

export const GAME_CONFIG = {
  // === PLAYER RESOURCES ===
  /** Starting gold at the beginning of a new game */
  STARTING_GOLD: 220,
  
  /** Maximum castle HP (lives) */
  MAX_CASTLE_HP: 25,
  
  // === SCORING ===
  /** Points awarded per wave completed */
  WAVE_BONUS_POINTS: 100,
  
  /** Points awarded per remaining gold */
  GOLD_BONUS_MULTIPLIER: 1,
  
  /** Points awarded per remaining HP */
  HP_BONUS_POINTS: 500,
  
  // === WAVE TIMING ===
  /** Countdown duration before each wave (seconds) */
  WAVE_COUNTDOWN_SECONDS: 3,
  
  /** Delay between wave completion and bonus display (ms) */
  WAVE_COMPLETE_DELAY: 500,
  
  // === CREEP SCALING ===
  /** HP multiplier increase per wave (e.g., 0.10 = 10% per wave) */
  WAVE_HP_SCALING: 0.10,  // Increased from 0.08 for harder late game
  
  /** Maximum HP multiplier cap */
  MAX_HP_MULTIPLIER: 3.5,  // Increased from 2.5 for much harder late game
  
  // === TOWER COSTS ===
  /** Base cost to build an archer tower */
  ARCHER_BUILD_COST: 70,
  
  // === GAME SPEED ===
  /** Normal game speed multiplier */
  NORMAL_SPEED: 1,
  
  /** Fast forward game speed multiplier */
  FAST_SPEED: 2,
  
  /** Turbo game speed multiplier */
  TURBO_SPEED: 3,
} as const;

// Type for accessing config values
export type GameConfigKey = keyof typeof GAME_CONFIG;
