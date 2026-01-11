/**
 * Centralized game configuration constants.
 * Edit values here to adjust game balance without modifying code in multiple places.
 */

export const GAME_CONFIG = {
  // === PLAYER RESOURCES ===
  /** Starting gold at the beginning of a new game */
  STARTING_GOLD: 250,
  
  /** Maximum castle HP (lives) */
  MAX_CASTLE_HP: 25,
  
  // === SCORING ===
  /** Points awarded per wave completed (35 waves × 100 = 3500) */
  WAVE_BONUS_POINTS: 100,
  
  /** Points multiplier for gold earned (15000g × 0.2 = 3000) */
  GOLD_BONUS_MULTIPLIER: 0.2,
  
  /** Points awarded per remaining HP (25 HP × 100 = 2500) */
  HP_BONUS_POINTS: 100,
  
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
  ARCHER_BUILD_COST: 50,
  
  // === GAME SPEED ===
  /** Normal game speed multiplier (1.4 = 40% faster base speed) */
  NORMAL_SPEED: 1.4,
  
  /** Fast forward game speed multiplier */
  FAST_SPEED: 2.8,
  
  /** Turbo game speed multiplier */
  TURBO_SPEED: 4.2,
  
  // === TOWER PLACEMENT ===
  /** Buffer distance from path for tower placement */
  TOWER_PATH_BUFFER: 40,
  
  /** Tower collision radius for placement */
  TOWER_RADIUS: 25,
  
  /** Minimum gap between towers */
  TOWER_SPACING: 20,
  
  /** Default projectile spawn offset from tower center */
  DEFAULT_PROJECTILE_OFFSET: { x: 0, y: -40 },
  
  // === CREEP ABILITIES ===
  /** Cooldown between jumps (ms) */
  JUMP_COOLDOWN: 4000,
  
  /** Distance traveled when jumping */
  JUMP_DISTANCE: 150,
  
  /** Warning flash duration before jump (ms) */
  JUMP_WARNING_DURATION: 500,
  
  /** Duration digger walks before stopping to dig (ms) */
  DIGGER_WALK_DURATION: 3000,
  
  /** Duration digger pauses before starting to burrow (ms) */
  DIGGER_STOP_DURATION: 400,
  
  /** Duration of burrow phase for digger (ms) */
  BURROW_DURATION: 2500,
  
  /** Duration of resurfacing animation (ms) */
  DIGGER_RESURFACE_DURATION: 600,
  
  /** Duration above ground for digger (ms) - legacy, now uses DIGGER_WALK_DURATION */
  SURFACE_DURATION: 3000,
  
  /** Distance traveled while burrowed (pixels) */
  DIGGER_TUNNEL_DISTANCE: 120,
  
  /** Duration of ghost phase when triggered (ms) */
  GHOST_PHASE_DURATION: 5000,
  
  /** HP threshold to trigger ghost phase (0.15 = 15%) */
  GHOST_PHASE_THRESHOLD: 0.15,
  
  /** Cooldown between boss dispel abilities (ms) */
  DISPEL_COOLDOWN: 12000,
  
  /** Duration of immunity to slow/poison after dispelling (ms) */
  DISPEL_IMMUNITY_DURATION: 2000,
  
  // === WAVE BONUSES ===
  /** Base gold bonus for completing a wave */
  WAVE_GOLD_BONUS_BASE: 15,
  
  /** Additional gold bonus increment */
  WAVE_GOLD_BONUS_INCREMENT: 5,
  
  /** Waves between bonus increments */
  WAVE_GOLD_BONUS_INTERVAL: 5,
  
  // === VETERAN SYSTEM ===
  /** Veteran ranks - towers earn ranks by accumulating kills */
  VETERAN_RANKS: [
    { name: 'Recruit', minKills: 0, damageBonus: 0 },
    { name: 'Corporal', minKills: 25, damageBonus: 0.05 },
    { name: 'Sergeant', minKills: 60, damageBonus: 0.10 },
    { name: 'Captain', minKills: 120, damageBonus: 0.15 },
  ],
} as const;

// Type for accessing config values
export type GameConfigKey = keyof typeof GAME_CONFIG;
