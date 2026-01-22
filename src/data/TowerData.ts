export interface TowerStats {
  range: number;
  fireRate: number;
  damage: number;
  splashRadius?: number;
  slowPercent?: number;
  slowDuration?: number;
  maxSlowTargets?: number;
  dotDamage?: number;
  dotDuration?: number;
  critChance?: number;
  critMultiplier?: number;
  auraDamageMultiplier?: number;
  airDamageBonus?: number;
}

export type TowerBranch =
  | 'archer'
  | 'rapidfire'
  | 'sniper'
  | 'rockcannon'
  | 'icetower'
  | 'poison'
  | 'aura';

export interface TowerConfig {
  key: string;
  name: string;
  type: 'physical' | 'magic' | 'support';
  branch: TowerBranch;
  level: 1 | 2 | 3 | 4;
  buildCost?: number;
  upgradeCost: number;
  description: string;
  stats: TowerStats;
}

export const BRANCH_OPTIONS: TowerBranch[] = [
  'archer',
  'rapidfire',
  'sniper',
  'rockcannon',
  'icetower',
  'poison',
  'aura',
];

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  archer_1: {
    key: 'archer_1',
    name: 'Archer Tower',
    type: 'physical',
    branch: 'archer',
    level: 1,
    buildCost: 50,
    upgradeCost: 0,
    description: 'Basic tower with +200% damage vs flying units. Upgrade to specialize.',
    stats: {
      range: 200,
      fireRate: 900,
      damage: 10,
      airDamageBonus: 2.0,
    },
  },
  archer_2: {
    key: 'archer_2',
    name: 'Archer Tower II',
    type: 'physical',
    branch: 'archer',
    level: 2,
    upgradeCost: 110,
    description: 'Improved archer with +200% damage vs flying. Can still specialize.',
    stats: {
      range: 220,
      fireRate: 800,
      damage: 15,
      airDamageBonus: 2.0,
    },
  },
  archer_3: {
    key: 'archer_3',
    name: 'Archer Tower III',
    type: 'physical',
    branch: 'archer',
    level: 3,
    upgradeCost: 280,
    description: 'Master archer with +200% damage vs flying. High single-target DPS.',
    stats: {
      range: 250,
      fireRate: 700,
      damage: 19,
      airDamageBonus: 2.0,
    },
  },
  archer_4: {
    key: 'archer_4',
    name: 'Elite Archer',
    type: 'physical',
    branch: 'archer',
    level: 4,
    upgradeCost: 800,
    description: 'Elite marksman. +200% vs flying. Abilities: Multi-Shot, Piercing, or Knockback.',
    stats: {
      range: 280,
      fireRate: 550,
      damage: 45,
      airDamageBonus: 2.0,
    },
  },

  rapidfire_1: {
    key: 'rapidfire_1',
    name: 'Rapid Fire',
    type: 'physical',
    branch: 'rapidfire',
    level: 1,
    upgradeCost: 120,
    description: 'Extremely fast attacks. Great vs unarmored. Weak vs heavy armor.',
    stats: {
      range: 185,
      fireRate: 300,
      damage: 10,
    },
  },
  rapidfire_2: {
    key: 'rapidfire_2',
    name: 'Rapid Fire II',
    type: 'physical',
    branch: 'rapidfire',
    level: 2,
    upgradeCost: 200,
    description: 'Faster attacks. Melts unarmored targets. Use with poison/ice vs armor.',
    stats: {
      range: 195,
      fireRate: 250,
      damage: 14,
    },
  },
  rapidfire_3: {
    key: 'rapidfire_3',
    name: 'Rapid Fire III',
    type: 'physical',
    branch: 'rapidfire',
    level: 3,
    upgradeCost: 420,
    description: 'Machine gun fury. ~95 DPS vs unarmored. Pair with armor shred.',
    stats: {
      range: 210,
      fireRate: 210,
      damage: 20,
    },
  },

  sniper_1: {
    key: 'sniper_1',
    name: 'Sniper Tower',
    type: 'physical',
    branch: 'sniper',
    level: 1,
    upgradeCost: 150,
    description: 'Long range, high single-shot damage. Best for priority targets.',
    stats: {
      range: 300,
      fireRate: 2200,
      damage: 60,
    },
  },
  sniper_2: {
    key: 'sniper_2',
    name: 'Sniper Tower II',
    type: 'physical',
    branch: 'sniper',
    level: 2,
    upgradeCost: 240,
    description: 'Extended range (330px). Focus-fires high-threat targets.',
    stats: {
      range: 330,
      fireRate: 2000,
      damage: 77,
    },
  },
  sniper_3: {
    key: 'sniper_3',
    name: 'Sniper Tower III',
    type: 'physical',
    branch: 'sniper',
    level: 3,
    upgradeCost: 480,
    description: 'Assassin elite. 360px range. Excellent for picking off bosses.',
    stats: {
      range: 360,
      fireRate: 1800,
      damage: 110,
    },
  },

  rockcannon_1: {
    key: 'rockcannon_1',
    name: 'Rock Cannon',
    type: 'physical',
    branch: 'rockcannon',
    level: 1,
    upgradeCost: 130,
    description: 'AOE splash damage (70px). Excellent against swarms.',
    stats: {
      range: 220,
      fireRate: 1800,
      damage: 25,
      splashRadius: 70,
    },
  },
  rockcannon_2: {
    key: 'rockcannon_2',
    name: 'Rock Cannon II',
    type: 'physical',
    branch: 'rockcannon',
    level: 2,
    upgradeCost: 230,
    description: 'Bigger explosions (85px splash). Clears grouped enemies.',
    stats: {
      range: 240,
      fireRate: 1700,
      damage: 32,
      splashRadius: 85,
    },
  },
  rockcannon_3: {
    key: 'rockcannon_3',
    name: 'Rock Cannon III',
    type: 'physical',
    branch: 'rockcannon',
    level: 3,
    upgradeCost: 460,
    description: 'Massive 100px splash. Place where enemies cluster.',
    stats: {
      range: 260,
      fireRate: 1500,
      damage: 47,
      splashRadius: 100,
    },
  },

  icetower_1: {
    key: 'icetower_1',
    name: 'Ice Tower',
    type: 'magic',
    branch: 'icetower',
    level: 1,
    upgradeCost: 65,
    description: '80% armor penetration. Slows 40% for 2s. Prefers unslowed targets.',
    stats: {
      range: 180,
      fireRate: 1400,
      damage: 8,
      slowPercent: 0.4,
      slowDuration: 2000,
      maxSlowTargets: 2,
    },
  },
  icetower_2: {
    key: 'icetower_2',
    name: 'Ice Tower II',
    type: 'magic',
    branch: 'icetower',
    level: 2,
    upgradeCost: 130,
    description: '80% armor pen. 50% slow for 2.5s. Essential crowd control.',
    stats: {
      range: 200,
      fireRate: 1300,
      damage: 12,
      slowPercent: 0.5,
      slowDuration: 2500,
      maxSlowTargets: 3,
    },
  },
  icetower_3: {
    key: 'icetower_3',
    name: 'Ice Tower III',
    type: 'magic',
    branch: 'icetower',
    level: 3,
    upgradeCost: 240,
    description: '80% armor pen. 60% slow for 3s. Core for late-game.',
    stats: {
      range: 220,
      fireRate: 1200,
      damage: 18,
      slowPercent: 0.6,
      slowDuration: 3000,
      maxSlowTargets: 4,
    },
  },

  poison_1: {
    key: 'poison_1',
    name: 'Poison Tower',
    type: 'magic',
    branch: 'poison',
    level: 1,
    upgradeCost: 65,
    description: '80% armor pen. DoT: 5/s for 5s, stacks 3x. Best vs armored!',
    stats: {
      range: 200,
      fireRate: 1800,
      damage: 5,
      dotDamage: 5,
      dotDuration: 5000,
    },
  },
  poison_2: {
    key: 'poison_2',
    name: 'Poison Tower II',
    type: 'magic',
    branch: 'poison',
    level: 2,
    upgradeCost: 130,
    description: '80% armor pen. DoT: 8/s for 5s, stacks 3x. Melts armored waves.',
    stats: {
      range: 220,
      fireRate: 1650,
      damage: 8,
      dotDamage: 8,
      dotDuration: 5000,
    },
  },
  poison_3: {
    key: 'poison_3',
    name: 'Poison Tower III',
    type: 'magic',
    branch: 'poison',
    level: 3,
    upgradeCost: 240,
    description: '80% armor pen. DoT: 12/s for 6s, stacks 3x. Essential for bosses.',
    stats: {
      range: 240,
      fireRate: 1500,
      damage: 12,
      dotDamage: 12,
      dotDuration: 6000,
    },
  },

  aura_1: {
    key: 'aura_1',
    name: 'Aura Tower',
    type: 'support',
    branch: 'aura',
    level: 1,
    upgradeCost: 100,
    description: 'Buffs nearby towers +20% damage. Place next to DPS towers.',
    stats: {
      range: 90,
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.2,
    },
  },
  aura_2: {
    key: 'aura_2',
    name: 'Aura Tower II',
    type: 'support',
    branch: 'aura',
    level: 2,
    upgradeCost: 200,
    description: '+30% damage buff. 105px range. Affects more towers.',
    stats: {
      range: 105,
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.3,
    },
  },
  aura_3: {
    key: 'aura_3',
    name: 'Aura Tower III',
    type: 'support',
    branch: 'aura',
    level: 3,
    upgradeCost: 400,
    description: '+40% damage buff. 120px range. Huge DPS multiplier.',
    stats: {
      range: 120,
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.4,
    },
  },
  aura_4: {
    key: 'aura_4',
    name: 'Aura Tower IV',
    type: 'support',
    branch: 'aura',
    level: 4,
    upgradeCost: 600,
    description: '+50% buff. Abilities: War Cry speed, Critical Aura, or Echo Multicast.',
    stats: {
      range: 140,
      fireRate: 0,
      damage: 0,
      auraDamageMultiplier: 0.5,
    },
  },

  rapidfire_4: {
    key: 'rapidfire_4',
    name: 'Rapid Fire IV',
    type: 'physical',
    branch: 'rapidfire',
    level: 4,
    upgradeCost: 650,
    description: '~144 DPS. Abilities: Bullet Storm, Ricochet, or Incendiary Burn.',
    stats: {
      range: 230,
      fireRate: 180,
      damage: 26,
    },
  },

  sniper_4: {
    key: 'sniper_4',
    name: 'Sniper Tower IV',
    type: 'physical',
    branch: 'sniper',
    level: 4,
    upgradeCost: 750,
    description: '400px range. Abilities: Critical Strike, Armor Pierce, or Headshot.',
    stats: {
      range: 400,
      fireRate: 1700,
      damage: 140,
    },
  },

  rockcannon_4: {
    key: 'rockcannon_4',
    name: 'Rock Cannon IV',
    type: 'physical',
    branch: 'rockcannon',
    level: 4,
    upgradeCost: 700,
    description: '110px splash. Abilities: Aftershock, Tremor Slow, or Shrapnel.',
    stats: {
      range: 280,
      fireRate: 1400,
      damage: 58,
      splashRadius: 110,
    },
  },

  icetower_4: {
    key: 'icetower_4',
    name: 'Ice Tower IV',
    type: 'magic',
    branch: 'icetower',
    level: 4,
    upgradeCost: 500,
    description: '80% armor pen. 65% slow, 3.5s. Ice Trap/Frost Nova/Deep Freeze.',
    stats: {
      range: 240,
      fireRate: 1100,
      damage: 24,
      slowPercent: 0.65,
      slowDuration: 3500,
      maxSlowTargets: 5,
    },
  },

  poison_4: {
    key: 'poison_4',
    name: 'Poison Tower IV',
    type: 'magic',
    branch: 'poison',
    level: 4,
    upgradeCost: 500,
    description: '80% armor pen. ~56 base DPS (3 stacks). Plague/Toxic/Corrosive.',
    stats: {
      range: 260,
      fireRate: 1400,
      damage: 15,
      dotDamage: 15,
      dotDuration: 6000,
    },
  },
};
