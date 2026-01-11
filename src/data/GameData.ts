/**
 * Game Data - Combined configuration for Creeps, Waves, and Mines
 * Extracted from separate files for better organization (~500 LOC)
 */

// ============================================================================
// CREEP DATA
// ============================================================================

export interface CreepConfig {
  type: string;
  maxHealth: number;
  speed: number;        // pixels per second
  armor: number;
  goldReward: number;
  // Special abilities
  hasShield?: boolean;     // Blocks first 3 hits completely
  canJump?: boolean;       // Leaps forward 150px every 4 seconds
  isFlying?: boolean;      // Immune to ground-only towers (Rock Cannon, Poison)
  canDig?: boolean;        // Burrows underground for 2s every 5s (invulnerable)
  hasGhostPhase?: boolean; // Becomes invulnerable for 3s when dropping below 15% HP
  canDispel?: boolean;     // Bosses periodically dispel slow/poison effects
  spawnOnDeath?: {         // Spawns creeps when killed
    type: string;
    count: number;
  };
  sizeScale?: number;      // Visual size multiplier (default 1.0)
  onlyDamagedBy?: 'ice' | 'poison';  // Can only be damaged by this tower type
}

export const CREEP_TYPES: Record<string, CreepConfig> = {
  // === STANDARD CREEPS ===
  furball: {
    type: 'furball',
    maxHealth: 55,
    speed: 85,
    armor: 0,
    goldReward: 7
  },
  runner: {
    type: 'runner',
    maxHealth: 22,
    speed: 150,
    armor: 0,
    goldReward: 5
  },
  tank: {
    type: 'tank',
    maxHealth: 280,
    speed: 50,
    armor: 6,
    goldReward: 15
  },
  jumper: {
    type: 'jumper',
    maxHealth: 160,
    speed: 75,
    armor: 2,
    goldReward: 18,
    canJump: true
  },
  shielded: {
    type: 'shielded',
    maxHealth: 200,
    speed: 75,
    armor: 3,
    goldReward: 25,
    hasShield: true
  },

  // === SPECIAL ABILITY CREEPS ===
  flying: {
    type: 'flying',
    maxHealth: 95,
    speed: 115,
    armor: 0,
    goldReward: 10,
    isFlying: true
  },
  digger: {
    type: 'digger',
    maxHealth: 120,
    speed: 90,
    armor: 3,
    goldReward: 15,
    canDig: true
  },
  ghost: {
    type: 'ghost',
    maxHealth: 175,
    speed: 75,
    armor: 0,
    goldReward: 14,
    hasGhostPhase: true
  },
  broodmother: {
    type: 'broodmother',
    maxHealth: 450,
    speed: 35,
    armor: 5,
    goldReward: 25,
    sizeScale: 1.5,
    spawnOnDeath: {
      type: 'baby',
      count: 8
    }
  },
  baby: {
    type: 'baby',
    maxHealth: 28,
    speed: 125,
    armor: 0,
    goldReward: 2,
    sizeScale: 0.8
  },

  // === ELEMENTAL CREEPS (require specific towers) ===
  flame: {
    type: 'flame',
    maxHealth: 16,
    speed: 90,
    armor: 0,
    goldReward: 8,
    onlyDamagedBy: 'ice'
  },
  plaguebearer: {
    type: 'plaguebearer',
    maxHealth: 55,
    speed: 65,
    armor: 0,
    goldReward: 10,
    onlyDamagedBy: 'poison'
  },

  // === SCALED BOSSES ===
  boss_1: { type: 'boss_1', maxHealth: 1200, speed: 50, armor: 3, goldReward: 60, sizeScale: 1.0, canDispel: true },
  boss_2: { type: 'boss_2', maxHealth: 2200, speed: 48, armor: 4, goldReward: 100, sizeScale: 1.15, canDispel: true },
  boss_3: { type: 'boss_3', maxHealth: 3600, speed: 40, armor: 5, goldReward: 160, sizeScale: 1.3, canDispel: true },
  boss_4: { type: 'boss_4', maxHealth: 5500, speed: 35, armor: 6, goldReward: 240, sizeScale: 1.5, canDispel: true },
  boss_5: { type: 'boss_5', maxHealth: 9000, speed: 30, armor: 7, goldReward: 400, sizeScale: 1.7, canDispel: true },

  // === BOSS GUARDS ===
  boss_guard: { type: 'boss_guard', maxHealth: 800, speed: 38, armor: 5, goldReward: 40, sizeScale: 1.2, hasShield: true },

  // === GENERIC BOSS (legacy) ===
  boss: { type: 'boss', maxHealth: 1500, speed: 45, armor: 4, goldReward: 60, sizeScale: 1.1, canDispel: true }
};

// ============================================================================
// WAVE DATA
// ============================================================================

export interface WaveCreepGroup {
  type: string;
  count: number;
  intervalMs: number;
  delayStart?: number;
}

export type WaveType = 'normal' | 'boss' | 'flying' | 'digger' | 'ghost' | 'broodmother' | 'chaos' | 'flame' | 'plaguebearer';

export interface WaveDef {
  waveNumber: number;
  creeps: WaveCreepGroup[];
  waveType?: WaveType;
  announcement?: string;
  parallelSpawn?: boolean;
}

/**
 * All 35 wave configurations
 */
export const WAVE_CONFIGS: WaveDef[] = [
  // === EARLY GAME: Waves 1-5 ===
  { waveNumber: 1, creeps: [{ type: 'furball', count: 8, intervalMs: 1400 }] },
  { waveNumber: 2, creeps: [{ type: 'furball', count: 12, intervalMs: 1100 }] },
  { waveNumber: 3, creeps: [
    { type: 'furball', count: 8, intervalMs: 1200 },
    { type: 'runner', count: 8, intervalMs: 600, delayStart: 9000 }
  ]},
  { waveNumber: 4, creeps: [{ type: 'runner', count: 18, intervalMs: 500 }] },
  { waveNumber: 5, creeps: [
    { type: 'furball', count: 12, intervalMs: 900 },
    { type: 'runner', count: 12, intervalMs: 500, delayStart: 10500 }
  ]},
  
  // === EARLY-MID GAME: Waves 6-10 ===
  { waveNumber: 6, creeps: [
    { type: 'furball', count: 14, intervalMs: 800 },
    { type: 'tank', count: 3, intervalMs: 2500, delayStart: 11000 }
  ]},
  { waveNumber: 7, waveType: 'boss', announcement: '🦎 GIANT GECKO APPROACHES!', creeps: [
    { type: 'furball', count: 10, intervalMs: 800 },
    { type: 'runner', count: 8, intervalMs: 500, delayStart: 7700 },
    { type: 'boss_1', count: 1, intervalMs: 1000, delayStart: 11700 }
  ]},
  { waveNumber: 8, creeps: [
    { type: 'runner', count: 16, intervalMs: 450 },
    { type: 'jumper', count: 5, intervalMs: 1800, delayStart: 7250 }
  ]},
  { waveNumber: 9, waveType: 'flying', announcement: '⚠️ FLYING WAVE!\nArchers & Snipers only!', creeps: [
    { type: 'flying', count: 10, intervalMs: 1000 },
    { type: 'furball', count: 8, intervalMs: 900, delayStart: 9500 }
  ]},
  { waveNumber: 10, creeps: [
    { type: 'tank', count: 6, intervalMs: 1600 },
    { type: 'runner', count: 12, intervalMs: 400, delayStart: 8500 }
  ]},
  
  // === MID GAME: Waves 11-17 ===
  { waveNumber: 11, waveType: 'ghost', announcement: '👻 GHOST WAVE!\nThey phase when low HP!', creeps: [
    { type: 'ghost', count: 10, intervalMs: 1200 },
    { type: 'furball', count: 12, intervalMs: 700, delayStart: 13100 }
  ]},
  { waveNumber: 12, creeps: [
    { type: 'furball', count: 16, intervalMs: 650 },
    { type: 'tank', count: 6, intervalMs: 1600, delayStart: 10250 },
    { type: 'jumper', count: 6, intervalMs: 1600, delayStart: 18750 }
  ]},
  { waveNumber: 13, waveType: 'digger', announcement: '🕳️ DIGGER WAVE!\nThey burrow underground!', creeps: [
    { type: 'digger', count: 12, intervalMs: 1100 },
    { type: 'runner', count: 12, intervalMs: 500, delayStart: 12600 }
  ]},
  { waveNumber: 14, waveType: 'boss', announcement: '🦎 KOMODO WARLORD APPROACHES!', creeps: [
    { type: 'runner', count: 12, intervalMs: 500 },
    { type: 'tank', count: 5, intervalMs: 1800, delayStart: 6000 },
    { type: 'boss_2', count: 1, intervalMs: 1000, delayStart: 13700 }
  ]},
  { waveNumber: 15, creeps: [
    { type: 'furball', count: 18, intervalMs: 650 },
    { type: 'shielded', count: 6, intervalMs: 1800, delayStart: 9600 },
    { type: 'tank', count: 7, intervalMs: 1400, delayStart: 16700 }
  ]},
  { waveNumber: 16, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER WAVE!\nSpawns babies on death!', creeps: [
    { type: 'furball', count: 16, intervalMs: 700 },
    { type: 'broodmother', count: 3, intervalMs: 3500, delayStart: 9300 }
  ]},
  { waveNumber: 17, creeps: [
    { type: 'runner', count: 28, intervalMs: 350 },
    { type: 'jumper', count: 10, intervalMs: 1200, delayStart: 8100 },
    { type: 'shielded', count: 6, intervalMs: 1600, delayStart: 19800 }
  ]},
  
  // === MID-LATE GAME: Waves 18-24 ===
  { waveNumber: 18, waveType: 'flying', announcement: '⚠️ FLYING SWARM!\nGround towers can\'t hit!', creeps: [
    { type: 'flying', count: 22, intervalMs: 650 },
    { type: 'runner', count: 18, intervalMs: 350, delayStart: 11750 }
  ]},
  { waveNumber: 19, creeps: [
    { type: 'tank', count: 16, intervalMs: 1200 },
    { type: 'shielded', count: 8, intervalMs: 1500, delayStart: 15900 }
  ]},
  { waveNumber: 20, waveType: 'ghost', announcement: '👻 GHOST WAVE!\nDamage fast before they phase!', creeps: [
    { type: 'ghost', count: 14, intervalMs: 1000 },
    { type: 'digger', count: 10, intervalMs: 1200, delayStart: 11300 }
  ]},
  { waveNumber: 21, waveType: 'boss', announcement: '🐉 DRAKE CHAMPION APPROACHES!\nWith Drake Warrior Escorts!', creeps: [
    { type: 'tank', count: 12, intervalMs: 1200 },
    { type: 'shielded', count: 8, intervalMs: 1400, delayStart: 10300 },
    { type: 'jumper', count: 12, intervalMs: 1200, delayStart: 18000 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 28000 },
    { type: 'boss_3', count: 1, intervalMs: 500, delayStart: 28000 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 28000 }
  ]},
  { waveNumber: 22, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER WAVE!\nKill fast, expect babies!', creeps: [
    { type: 'tank', count: 10, intervalMs: 1200 },
    { type: 'broodmother', count: 4, intervalMs: 3000, delayStart: 7500 }
  ]},
  { waveNumber: 23, creeps: [
    { type: 'runner', count: 40, intervalMs: 250 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 9200 }
  ]},
  { waveNumber: 24, waveType: 'digger', announcement: '🕳️ DIGGER ASSAULT!\nStrike when they surface!', creeps: [
    { type: 'digger', count: 18, intervalMs: 900 },
    { type: 'shielded', count: 10, intervalMs: 1300, delayStart: 13500 }
  ]},
  
  // === LATE GAME: Waves 25-30 ===
  { waveNumber: 25, creeps: [
    { type: 'tank', count: 14, intervalMs: 1100 },
    { type: 'shielded', count: 12, intervalMs: 1200, delayStart: 12200 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 23200 }
  ]},
  { waveNumber: 26, waveType: 'flame', announcement: '🔥 FLAME WAVE! USE ICE TOWERS!', creeps: [
    { type: 'flame', count: 18, intervalMs: 1000 },
    { type: 'runner', count: 22, intervalMs: 350, delayStart: 14400 }
  ]},
  { waveNumber: 27, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER SWARM!\nMany spiders incoming!', creeps: [
    { type: 'shielded', count: 10, intervalMs: 1200 },
    { type: 'broodmother', count: 6, intervalMs: 2500, delayStart: 7500 }
  ]},
  { waveNumber: 28, waveType: 'boss', announcement: '🐉 YOUNG DRAGON APPROACHES!\nWith Drake Warrior Escorts!', creeps: [
    { type: 'shielded', count: 12, intervalMs: 1100 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 10300 },
    { type: 'tank', count: 12, intervalMs: 1300, delayStart: 21600 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 33000 },
    { type: 'boss_4', count: 1, intervalMs: 500, delayStart: 33000 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 33000 }
  ]},
  { waveNumber: 29, waveType: 'ghost', announcement: '👻 ELITE GHOSTS!\n5 sec immunity at 15% HP!', creeps: [
    { type: 'ghost', count: 20, intervalMs: 800 },
    { type: 'tank', count: 12, intervalMs: 1200, delayStart: 13500 }
  ]},
  { waveNumber: 30, waveType: 'plaguebearer', announcement: '☠️ PLAGUEBEARER WAVE! USE POISON TOWERS!', creeps: [
    { type: 'plaguebearer', count: 16, intervalMs: 1100 },
    { type: 'tank', count: 12, intervalMs: 1200, delayStart: 14500 }
  ]},
  
  // === ENDGAME: Waves 31-35 ===
  { waveNumber: 31, waveType: 'broodmother', announcement: '🕷️ NIGHTMARE WAVE!\nGhosts + Broodmothers!', parallelSpawn: true, creeps: [
    { type: 'ghost', count: 18, intervalMs: 850 },
    { type: 'broodmother', count: 5, intervalMs: 2500 },
    { type: 'jumper', count: 16, intervalMs: 900, delayStart: 19900 }
  ]},
  { waveNumber: 32, parallelSpawn: true, creeps: [
    { type: 'furball', count: 30, intervalMs: 400 },
    { type: 'runner', count: 35, intervalMs: 250 },
    { type: 'tank', count: 20, intervalMs: 900, delayStart: 17700 },
    { type: 'shielded', count: 16, intervalMs: 1000, delayStart: 33600 },
    { type: 'jumper', count: 18, intervalMs: 900, delayStart: 47300 }
  ]},
  { waveNumber: 33, waveType: 'digger', announcement: '🕳️ DIGGER MASS ASSAULT!\n25 underground burrowers!', parallelSpawn: true, creeps: [
    { type: 'digger', count: 25, intervalMs: 700 },
    { type: 'tank', count: 16, intervalMs: 950 }
  ]},
  { waveNumber: 34, waveType: 'chaos', announcement: '⚠️ CHAOS WAVE!\nAll special creep types!', parallelSpawn: true, creeps: [
    { type: 'flying', count: 18, intervalMs: 700 },
    { type: 'digger', count: 14, intervalMs: 800 },
    { type: 'ghost', count: 14, intervalMs: 800, delayStart: 19900 },
    { type: 'broodmother', count: 5, intervalMs: 2400, delayStart: 29400 },
    { type: 'tank', count: 16, intervalMs: 900, delayStart: 38300 }
  ]},
  { waveNumber: 35, waveType: 'boss', announcement: '🐉 ELDER DRAGON LORD!\nTHE FINAL CHALLENGE!', parallelSpawn: true, creeps: [
    { type: 'runner', count: 30, intervalMs: 300 },
    { type: 'flying', count: 18, intervalMs: 650 },
    { type: 'ghost', count: 14, intervalMs: 850 },
    { type: 'shielded', count: 16, intervalMs: 900 },
    { type: 'tank', count: 18, intervalMs: 850 },
    { type: 'broodmother', count: 5, intervalMs: 2400 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 25000 },
    { type: 'boss_5', count: 1, intervalMs: 500, delayStart: 25000 },
    { type: 'boss_guard', count: 1, intervalMs: 500, delayStart: 25000 }
  ]}
];

// ============================================================================
// MINE DATA
// ============================================================================

export interface MineConfig {
  level: 0 | 1 | 2 | 3;
  buildCost: number;
  incomePerWave: number;
  name: string;
  description: string;
}

export const MINE_CONFIGS: Record<number, MineConfig> = {
  0: {
    level: 0,
    buildCost: 0,
    incomePerWave: 0,
    name: 'Empty Mine Slot',
    description: 'Build a gold mine to generate income each wave.'
  },
  1: {
    level: 1,
    buildCost: 75,
    incomePerWave: 12,
    name: 'Gold Mine',
    description: 'A basic mine that produces 12g per wave.'
  },
  2: {
    level: 2,
    buildCost: 150,
    incomePerWave: 22,
    name: 'Gold Mine II',
    description: 'An improved mine that produces 22g per wave.'
  },
  3: {
    level: 3,
    buildCost: 250,
    incomePerWave: 40,
    name: 'Gold Mine III',
    description: 'A master mine that produces 40g per wave.'
  }
};

/**
 * Get the cost to build or upgrade to a specific level
 */
export function getMineCost(targetLevel: 1 | 2 | 3): number {
  return MINE_CONFIGS[targetLevel].buildCost;
}

/**
 * Get total gold invested to reach a specific level
 */
export function getTotalInvestment(level: 0 | 1 | 2 | 3): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += MINE_CONFIGS[i].buildCost;
  }
  return total;
}
