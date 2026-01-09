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
  spawnOnDeath?: {         // Spawns creeps when killed
    type: string;
    count: number;
  };
  sizeScale?: number;      // Visual size multiplier (default 1.0)
}

export const CREEP_TYPES: Record<string, CreepConfig> = {
  // === STANDARD CREEPS ===
  furball: {
    type: 'furball',
    maxHealth: 55,
    speed: 85,
    armor: 0,
    goldReward: 6
  },
  runner: {
    type: 'runner',
    maxHealth: 35,
    speed: 150,
    armor: 0,
    goldReward: 5
  },
  tank: {
    type: 'tank',
    maxHealth: 240,
    speed: 50,
    armor: 5,
    goldReward: 15
  },
  jumper: {
    type: 'jumper',
    maxHealth: 140,
    speed: 75,
    armor: 2,
    goldReward: 18,
    canJump: true
  },
  shielded: {
    type: 'shielded',
    maxHealth: 120,
    speed: 70,
    armor: 1,
    goldReward: 20,
    hasShield: true
  },

  // === SPECIAL ABILITY CREEPS ===
  flying: {
    type: 'flying',
    maxHealth: 80,
    speed: 110,
    armor: 0,
    goldReward: 10,
    isFlying: true
  },
  digger: {
    type: 'digger',
    maxHealth: 70,
    speed: 80,
    armor: 1,
    goldReward: 12,
    canDig: true
  },
  ghost: {
    type: 'ghost',
    maxHealth: 100,
    speed: 60,
    armor: 0,
    goldReward: 12,
    hasGhostPhase: true
  },
  broodmother: {
    type: 'broodmother',
    maxHealth: 200,
    speed: 40,
    armor: 2,
    goldReward: 18,
    sizeScale: 1.4,
    spawnOnDeath: {
      type: 'baby',
      count: 4
    }
  },
  baby: {
    type: 'baby',
    maxHealth: 15,
    speed: 130,
    armor: 0,
    goldReward: 1,
    sizeScale: 0.5
  },

  // === SCALED BOSSES ===
  boss: {
    type: 'boss',
    maxHealth: 1200,
    speed: 45,
    armor: 3,
    goldReward: 50,
    sizeScale: 1.0
  },
  boss_1: {
    type: 'boss_1',
    maxHealth: 800,
    speed: 50,
    armor: 2,
    goldReward: 50,
    sizeScale: 1.0
  },
  boss_2: {
    type: 'boss_2',
    maxHealth: 1440,
    speed: 50,
    armor: 3,
    goldReward: 90,
    sizeScale: 1.15
  },
  boss_3: {
    type: 'boss_3',
    maxHealth: 2400,
    speed: 40,
    armor: 4,
    goldReward: 140,
    sizeScale: 1.3
  },
  boss_4: {
    type: 'boss_4',
    maxHealth: 4000,
    speed: 35,
    armor: 5,
    goldReward: 200,
    sizeScale: 1.5
  },
  boss_5: {
    type: 'boss_5',
    maxHealth: 6400,
    speed: 30,
    armor: 6,
    goldReward: 300,
    sizeScale: 1.7
  }
};
