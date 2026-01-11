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
    maxHealth: 280,  // Increased from 240
    speed: 50,
    armor: 6,  // Increased from 5
    goldReward: 15
  },
  jumper: {
    type: 'jumper',
    maxHealth: 160,  // Increased from 140
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
    hasShield: true  // Now blocks 5 hits
  },

  // === SPECIAL ABILITY CREEPS ===
  flying: {
    type: 'flying',
    maxHealth: 95,  // Increased from 80
    speed: 115,  // Slightly faster
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
    canDig: true  // Each digger digs its own tunnel
  },
  ghost: {
    type: 'ghost',
    maxHealth: 175,  // Increased from 150
    speed: 75,  // Slightly faster
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
    maxHealth: 16,  // One-shot by ice tower (18 damage at level 3)
    speed: 90,
    armor: 0,
    goldReward: 8,
    onlyDamagedBy: 'ice'
  },
  plaguebearer: {
    type: 'plaguebearer',
    maxHealth: 55,  // Killed by poison DoT (12 dmg/sec * 5s = 60 damage)
    speed: 65,
    armor: 0,
    goldReward: 10,
    onlyDamagedBy: 'poison'
  },

  // === SCALED BOSSES ===
  boss_1: {
    type: 'boss_1',
    maxHealth: 1200,
    speed: 50,
    armor: 3,
    goldReward: 60,
    sizeScale: 1.0,
    canDispel: true
  },
  boss_2: {
    type: 'boss_2',
    maxHealth: 2200,
    speed: 48,
    armor: 4,
    goldReward: 100,
    sizeScale: 1.15,
    canDispel: true
  },
  boss_3: {
    type: 'boss_3',
    maxHealth: 3600,
    speed: 40,
    armor: 5,
    goldReward: 160,
    sizeScale: 1.3,
    canDispel: true
  },
  boss_4: {
    type: 'boss_4',
    maxHealth: 5500,
    speed: 35,
    armor: 6,
    goldReward: 240,
    sizeScale: 1.5,
    canDispel: true
  },
  boss_5: {
    type: 'boss_5',
    maxHealth: 9000,
    speed: 30,
    armor: 7,
    goldReward: 400,
    sizeScale: 1.7,
    canDispel: true
  },

  // === BOSS GUARDS (accompany last 3 bosses) ===
  boss_guard: {
    type: 'boss_guard',
    maxHealth: 800,
    speed: 38,
    armor: 5,
    goldReward: 40,
    sizeScale: 1.2,
    hasShield: true
  },

  // === GENERIC BOSS (legacy) ===
  boss: {
    type: 'boss',
    maxHealth: 1500,
    speed: 45,
    armor: 4,
    goldReward: 60,
    sizeScale: 1.1,
    canDispel: true
  }
};
