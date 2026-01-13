export interface TowerStats {
  range: number;
  fireRate: number;      // ms between shots (0 = non-attacking, e.g., aura tower)
  damage: number;
  splashRadius?: number; // for Rock Cannon
  slowPercent?: number;  // for Ice Tower
  slowDuration?: number; // for Ice Tower
  maxSlowTargets?: number; // for Ice Tower - max creeps this tower can have slowed at once
  dotDamage?: number;    // for Poison Tower
  dotDuration?: number;  // for Poison Tower
  critChance?: number;   // for Sniper
  critMultiplier?: number;
  auraDamageMultiplier?: number; // for Aura Tower - damage buff for nearby towers
  airDamageBonus?: number; // Bonus damage multiplier vs flying units (e.g., 2.0 = +200% = 3x total)
}

export type TowerBranch = 'archer' | 'rapidfire' | 'sniper' | 'rockcannon' | 'icetower' | 'poison' | 'aura';

export interface TowerConfig {
  key: string;
  name: string;
  type: 'physical' | 'magic' | 'support';
  branch: TowerBranch;
  level: 1 | 2 | 3 | 4;
  buildCost?: number;        // Only for archer (the only buildable tower)
  upgradeCost: number;       // Cost to upgrade TO this config
  description: string;
  stats: TowerStats;
}

// Branch upgrade options from Archer (includes archer as upgrade path)
export const BRANCH_OPTIONS: TowerBranch[] = ['archer', 'rapidfire', 'sniper', 'rockcannon', 'icetower', 'poison', 'aura'];

// All tower configurations keyed by "branch_level" (e.g., "archer_1", "sniper_2")
export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  // === ARCHER (Standard - the only buildable tower) ===
  archer_1: {
    key: 'archer_1',
    name: 'Archer Tower',
    type: 'physical',
    branch: 'archer',
    level: 1,
    buildCost: 50,
    upgradeCost: 0,
    description: 'Basic tower. Highly effective vs air (+200% damage). Can branch into specialized towers.',
    stats: {
      range: 200,
      fireRate: 900,
      damage: 10,
      airDamageBonus: 2.0
    }
  },
  archer_2: {
    key: 'archer_2',
    name: 'Archer Tower II',
    type: 'physical',
    branch: 'archer',
    level: 2,
    upgradeCost: 110,
    description: 'Improved archer. Highly effective vs air (+200% damage). Can still branch.',
    stats: {
      range: 220,
      fireRate: 800,
      damage: 15,
      airDamageBonus: 2.0
    }
  },
  archer_3: {
    key: 'archer_3',
    name: 'Archer Tower III',
    type: 'physical',
    branch: 'archer',
    level: 3,
    upgradeCost: 280,
    description: 'Master archer. Highly effective vs air (+200% damage). Elite damage.',
    stats: {
      range: 250,
      fireRate: 700,
      damage: 19,  // Reduced from 22 for aura balance
      airDamageBonus: 2.0
    }
  },
  archer_4: {
    key: 'archer_4',
    name: 'Elite Archer',
    type: 'physical',
    branch: 'archer',
    level: 4,
    upgradeCost: 800,
    description: 'Legendary marksman. Highly effective vs air (+200% damage). Endgame devastation.',
    stats: {
      range: 280,
      fireRate: 550,
      damage: 45,
      airDamageBonus: 2.0
    }
  },

  // === RAPID FIRE ===
  rapidfire_1: {
    key: 'rapidfire_1',
    name: 'Rapid Fire',
    type: 'physical',
    branch: 'rapidfire',
    level: 1,
    upgradeCost: 120,
    description: 'High attack speed, low damage. Weak vs armor.',
    stats: {
      range: 180,
      fireRate: 320,
      damage: 8
    }
  },
  rapidfire_2: {
    key: 'rapidfire_2',
    name: 'Rapid Fire II',
    type: 'physical',
    branch: 'rapidfire',
    level: 2,
    upgradeCost: 200,
    description: 'Even faster attacks. Shreds unarmored targets.',
    stats: {
      range: 190,
      fireRate: 260,
      damage: 11  // Reduced from 13 for aura balance
    }
  },
  rapidfire_3: {
    key: 'rapidfire_3',
    name: 'Rapid Fire III',
    type: 'physical',
    branch: 'rapidfire',
    level: 3,
    upgradeCost: 420,
    description: 'Machine gun fury. Devastating DPS.',
    stats: {
      range: 200,
      fireRate: 220,
      damage: 15  // Reduced from 18 for aura balance
    }
  },

  // === SNIPER ===
  sniper_1: {
    key: 'sniper_1',
    name: 'Sniper Tower',
    type: 'physical',
    branch: 'sniper',
    level: 1,
    upgradeCost: 150,
    description: 'Long range, high damage per shot.',
    stats: {
      range: 300,
      fireRate: 2200,
      damage: 60
    }
  },
  sniper_2: {
    key: 'sniper_2',
    name: 'Sniper Tower II',
    type: 'physical',
    branch: 'sniper',
    level: 2,
    upgradeCost: 240,
    description: 'Deadly precision. Increased damage and range.',
    stats: {
      range: 330,
      fireRate: 2000,
      damage: 77  // Reduced from 90 for aura balance
    }
  },
  sniper_3: {
    key: 'sniper_3',
    name: 'Sniper Tower III',
    type: 'physical',
    branch: 'sniper',
    level: 3,
    upgradeCost: 480,
    description: 'Assassin elite. Maximum damage and range.',
    stats: {
      range: 360,
      fireRate: 1800,
      damage: 110  // Reduced from 130 for aura balance
    }
  },

  // === ROCK CANNON ===
  rockcannon_1: {
    key: 'rockcannon_1',
    name: 'Rock Cannon',
    type: 'physical',
    branch: 'rockcannon',
    level: 1,
    upgradeCost: 130,
    description: 'Splash damage in 70px radius.',
    stats: {
      range: 220,
      fireRate: 1800,
      damage: 25,
      splashRadius: 70
    }
  },
  rockcannon_2: {
    key: 'rockcannon_2',
    name: 'Rock Cannon II',
    type: 'physical',
    branch: 'rockcannon',
    level: 2,
    upgradeCost: 230,
    description: 'Bigger explosions. 85px splash radius.',
    stats: {
      range: 240,
      fireRate: 1700,
      damage: 32,  // Reduced from 38 for aura balance
      splashRadius: 85
    }
  },
  rockcannon_3: {
    key: 'rockcannon_3',
    name: 'Rock Cannon III',
    type: 'physical',
    branch: 'rockcannon',
    level: 3,
    upgradeCost: 460,
    description: 'Devastation. 100px splash radius.',
    stats: {
      range: 260,
      fireRate: 1500,
      damage: 47,  // Reduced from 55 for aura balance
      splashRadius: 100
    }
  },

  // === ICE TOWER ===
  icetower_1: {
    key: 'icetower_1',
    name: 'Ice Tower',
    type: 'magic',
    branch: 'icetower',
    level: 1,
    upgradeCost: 65,
    description: 'Slows enemies by 40% for 2s. Max 2 targets.',
    stats: {
      range: 180,
      fireRate: 1100,
      damage: 8,
      slowPercent: 0.4,
      slowDuration: 2000,
      maxSlowTargets: 2
    }
  },
  icetower_2: {
    key: 'icetower_2',
    name: 'Ice Tower II',
    type: 'magic',
    branch: 'icetower',
    level: 2,
    upgradeCost: 130,
    description: 'Freezing cold. 50% slow for 2.5s. Max 3 targets.',
    stats: {
      range: 200,
      fireRate: 1000,
      damage: 12,
      slowPercent: 0.5,
      slowDuration: 2500,
      maxSlowTargets: 3
    }
  },
  icetower_3: {
    key: 'icetower_3',
    name: 'Ice Tower III',
    type: 'magic',
    branch: 'icetower',
    level: 3,
    upgradeCost: 240,
    description: 'Absolute zero. 60% slow for 3s. Max 4 targets.',
    stats: {
      range: 220,
      fireRate: 900,
      damage: 18,
      slowPercent: 0.6,
      slowDuration: 3000,
      maxSlowTargets: 4
    }
  },

  // === POISON ===
  poison_1: {
    key: 'poison_1',
    name: 'Poison Tower',
    type: 'magic',
    branch: 'poison',
    level: 1,
    upgradeCost: 65,
    description: 'DoT: 5 dmg/sec for 5s. Stacks 3x. Ignores armor. Great vs armored!',
    stats: {
      range: 200,
      fireRate: 1400,
      damage: 5,
      dotDamage: 5,
      dotDuration: 5000
    }
  },
  poison_2: {
    key: 'poison_2',
    name: 'Poison Tower II',
    type: 'magic',
    branch: 'poison',
    level: 2,
    upgradeCost: 130,
    description: 'Deadly venom. 8 dmg/sec for 5s. Stacks 3x. Great vs armored!',
    stats: {
      range: 220,
      fireRate: 1300,
      damage: 8,
      dotDamage: 8,
      dotDuration: 5000
    }
  },
  poison_3: {
    key: 'poison_3',
    name: 'Poison Tower III',
    type: 'magic',
    branch: 'poison',
    level: 3,
    upgradeCost: 240,
    description: 'Plague bringer. 12 dmg/sec for 6s. Stacks 3x. Great vs armored!',
    stats: {
      range: 240,
      fireRate: 1150,
      damage: 12,
      dotDamage: 12,
      dotDuration: 6000
    }
  },

  // === AURA TOWER (Support - buffs nearby towers) ===
  aura_1: {
    key: 'aura_1',
    name: 'Aura Tower',
    type: 'support',
    branch: 'aura',
    level: 1,
    upgradeCost: 100,
    description: 'Buffs nearby towers +20% damage. Does not attack.',
    stats: {
      range: 90,       // Aura radius - affects ~2-3 adjacent towers
      fireRate: 0,     // 0 = non-attacking tower
      damage: 0,
      auraDamageMultiplier: 0.20
    }
  },
  aura_2: {
    key: 'aura_2',
    name: 'Aura Tower II',
    type: 'support',
    branch: 'aura',
    level: 2,
    upgradeCost: 200,
    description: 'Buffs nearby towers +30% damage. Wider aura.',
    stats: {
      range: 105,      // Larger aura radius
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.30
    }
  },
  aura_3: {
    key: 'aura_3',
    name: 'Aura Tower III',
    type: 'support',
    branch: 'aura',
    level: 3,
    upgradeCost: 400,
    description: 'Buffs nearby towers +40% damage. Maximum power.',
    stats: {
      range: 120,      // Maximum aura radius
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.40
    }
  },
  aura_4: {
    key: 'aura_4',
    name: 'Aura Tower IV',
    type: 'support',
    branch: 'aura',
    level: 4,
    upgradeCost: 600,
    description: 'Ultimate support. +50% damage buff. Special ability.',
    stats: {
      range: 140,
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.50
    }
  },

  // === LEVEL 4 UPGRADES WITH SPECIAL ABILITIES ===
  
  rapidfire_4: {
    key: 'rapidfire_4',
    name: 'Rapid Fire IV',
    type: 'physical',
    branch: 'rapidfire',
    level: 4,
    upgradeCost: 650,
    description: 'Ultimate rapid fire. Special ability unlocked.',
    stats: {
      range: 220,
      fireRate: 200,
      damage: 18
    }
  },
  
  sniper_4: {
    key: 'sniper_4',
    name: 'Sniper Tower IV',
    type: 'physical',
    branch: 'sniper',
    level: 4,
    upgradeCost: 750,
    description: 'Elite assassin. Special ability unlocked.',
    stats: {
      range: 400,
      fireRate: 1700,
      damage: 140
    }
  },
  
  rockcannon_4: {
    key: 'rockcannon_4',
    name: 'Rock Cannon IV',
    type: 'physical',
    branch: 'rockcannon',
    level: 4,
    upgradeCost: 700,
    description: 'Siege weapon. 110px splash. Special ability.',
    stats: {
      range: 280,
      fireRate: 1400,
      damage: 58,
      splashRadius: 110
    }
  },
  
  icetower_4: {
    key: 'icetower_4',
    name: 'Ice Tower IV',
    type: 'magic',
    branch: 'icetower',
    level: 4,
    upgradeCost: 500,
    description: 'Absolute zero. 65% slow for 3.5s. Special ability.',
    stats: {
      range: 240,
      fireRate: 850,
      damage: 24,
      slowPercent: 0.65,
      slowDuration: 3500,
      maxSlowTargets: 5
    }
  },
  
  poison_4: {
    key: 'poison_4',
    name: 'Poison Tower IV',
    type: 'magic',
    branch: 'poison',
    level: 4,
    upgradeCost: 500,
    description: 'Plague master. 15 dmg/s for 6s. Great vs armored! Special ability.',
    stats: {
      range: 260,
      fireRate: 1100,
      damage: 15,
      dotDamage: 15,
      dotDuration: 6000
    }
  }
};
