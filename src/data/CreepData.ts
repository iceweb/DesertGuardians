export interface CreepConfig {
  type: string;
  maxHealth: number;
  speed: number;        // pixels per second
  armor: number;
  goldReward: number;
  // Special abilities
  hasShield?: boolean;     // Blocks first 3 hits completely
  canJump?: boolean;       // Leaps forward 150px every 4 seconds
}

export const CREEP_TYPES: Record<string, CreepConfig> = {
  furball: {
    type: 'furball',
    maxHealth: 55,
    speed: 85,
    armor: 0,
    goldReward: 7
  },
  runner: {
    type: 'runner',
    maxHealth: 35,
    speed: 150,
    armor: 0,
    goldReward: 6
  },
  tank: {
    type: 'tank',
    maxHealth: 240,
    speed: 50,
    armor: 5,
    goldReward: 18
  },
  boss: {
    type: 'boss',
    maxHealth: 1200,
    speed: 45,
    armor: 3,
    goldReward: 75
  },
  jumper: {
    type: 'jumper',
    maxHealth: 140,
    speed: 75,
    armor: 2,
    goldReward: 22,
    canJump: true
  },
  shielded: {
    type: 'shielded',
    maxHealth: 120,
    speed: 70,
    armor: 1,
    goldReward: 25,
    hasShield: true
  }
};
