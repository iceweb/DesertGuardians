import type { TowerBranch } from '../data';

export const AbilityIconType = {
  EXPLOSION: 'explosion',
  EARTHQUAKE: 'earthquake',
  SHRAPNEL: 'shrapnel',
  CROSSHAIR: 'crosshair',
  DIAMOND_BULLET: 'diamond',
  SKULL: 'skull',
  ICE_BLOCK: 'iceblock',
  SNOWFLAKE: 'snowflake',
  CRYSTAL: 'crystal',
  POISON_SKULL: 'poisonskull',
  FLASK: 'flask',
  ACID_DROP: 'aciddrop',
  BULLET_SPIRAL: 'spiral',
  RICOCHET: 'ricochet',
  FLAME_BULLET: 'flame',
  CROSSED_SWORDS: 'swords',
  STAR_BURST: 'star',
  LIGHTNING: 'lightning',
  TRIPLE_ARROW: 'triplearrow',
  PIERCE_ARROW: 'piercearrow',
  SPEED_BOW: 'speedbow',
} as const;
export type AbilityIconType = typeof AbilityIconType[keyof typeof AbilityIconType];

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  triggerChance: number;
  isPassive?: boolean;
  passiveTickRate?: number;
  icon: {
    type: AbilityIconType;
    primaryColor: number;
    secondaryColor: number;
  };
  effectParams: {
    damage?: number;
    damageMultiplier?: number;
    radius?: number;
    duration?: number;
    count?: number;
    armorReduction?: number;
    speedMultiplier?: number;
    hpThreshold?: number;
    bounceRange?: number;
    bounceCount?: number;
    bounceDamageMultiplier?: number;
    burnDamage?: number;
    burnDuration?: number;
  };
}

export const TOWER_ABILITIES: Record<TowerBranch, AbilityDefinition[]> = {
  rockcannon: [
    {
      id: 'cannon_aftershock',
      name: 'Aftershock',
      description: '3 secondary explosions around impact (50% damage)',
      triggerChance: 0.25,
      icon: { type: AbilityIconType.EXPLOSION, primaryColor: 0xffaa00, secondaryColor: 0xff6600 },
      effectParams: { count: 3, radius: 50, damageMultiplier: 0.5, duration: 500 }
    },
    {
      id: 'cannon_earthquake',
      name: 'Earthquake',
      description: 'Ground zone dealing damage for 3s',
      triggerChance: 0.20,
      icon: { type: AbilityIconType.EARTHQUAKE, primaryColor: 0x8b4513, secondaryColor: 0x5c4033 },
      effectParams: { radius: 85, duration: 3000, damage: 8 }
    },
    {
      id: 'cannon_shrapnel',
      name: 'Shrapnel Burst',
      description: '6 fragments dealing 25% damage each',
      triggerChance: 0.30,
      icon: { type: AbilityIconType.SHRAPNEL, primaryColor: 0x808080, secondaryColor: 0x5a5a5a },
      effectParams: { count: 6, radius: 8, damageMultiplier: 0.25 }
    }
  ],
  sniper: [
    {
      id: 'sniper_critical',
      name: 'Critical Strike',
      description: 'Double damage (stacks with crit)',
      triggerChance: 0.10,
      icon: { type: AbilityIconType.CROSSHAIR, primaryColor: 0xff0000, secondaryColor: 0xcc0000 },
      effectParams: { damageMultiplier: 2.0 }
    },
    {
      id: 'sniper_pierce',
      name: 'Armor Pierce',
      description: 'Shot ignores 100% armor',
      triggerChance: 0.20,
      icon: { type: AbilityIconType.DIAMOND_BULLET, primaryColor: 0x00bfff, secondaryColor: 0x0080ff },
      effectParams: {}
    },
    {
      id: 'sniper_headshot',
      name: 'Headshot',
      description: 'Instant kill if HP < 25%, else +50% damage',
      triggerChance: 0.08,
      icon: { type: AbilityIconType.SKULL, primaryColor: 0x1a1a1a, secondaryColor: 0xff0000 },
      effectParams: { hpThreshold: 0.25, damageMultiplier: 1.5 }
    }
  ],
  icetower: [
    {
      id: 'ice_trap',
      name: 'Ice Trap',
      description: 'Freeze target completely for 2s',
      triggerChance: 0.15,
      icon: { type: AbilityIconType.ICE_BLOCK, primaryColor: 0x88ccff, secondaryColor: 0xffffff },
      effectParams: { duration: 2000 }
    },
    {
      id: 'ice_frostnova',
      name: 'Frost Nova',
      description: 'Slow all creeps within 80px',
      triggerChance: 0.20,
      icon: { type: AbilityIconType.SNOWFLAKE, primaryColor: 0xffffff, secondaryColor: 0x88ccff },
      effectParams: { radius: 80 }
    },
    {
      id: 'ice_shatter',
      name: 'Shatter',
      description: 'If slowed, deal +100% damage and remove slow',
      triggerChance: 0.12,
      icon: { type: AbilityIconType.CRYSTAL, primaryColor: 0x87ceeb, secondaryColor: 0x4169e1 },
      effectParams: { damageMultiplier: 2.0 }
    }
  ],
  poison: [
    {
      id: 'poison_plague',
      name: 'Plague Spread',
      description: 'On death, spread poison to nearby creeps',
      triggerChance: 0.18,
      icon: { type: AbilityIconType.POISON_SKULL, primaryColor: 0x00ff00, secondaryColor: 0x228b22 },
      effectParams: { radius: 60 }
    },
    {
      id: 'poison_explosion',
      name: 'Toxic Explosion',
      description: 'At max stacks, explode for 40 damage',
      triggerChance: 0.15,
      icon: { type: AbilityIconType.FLASK, primaryColor: 0x32cd32, secondaryColor: 0x00ff00 },
      effectParams: { damage: 40, radius: 60 }
    },
    {
      id: 'poison_corrosive',
      name: 'Corrosive Acid',
      description: 'Reduce armor by 2 per stack (max -6)',
      triggerChance: 0.25,
      icon: { type: AbilityIconType.ACID_DROP, primaryColor: 0x9acd32, secondaryColor: 0xadff2f },
      effectParams: { armorReduction: 2 }
    }
  ],
  rapidfire: [
    {
      id: 'rapid_bulletstorm',
      name: 'Bullet Storm',
      description: 'Next 5 shots at 2x speed',
      triggerChance: 0.12,
      icon: { type: AbilityIconType.BULLET_SPIRAL, primaryColor: 0xffcc00, secondaryColor: 0xff9900 },
      effectParams: { count: 5, speedMultiplier: 2.0 }
    },
    {
      id: 'rapid_ricochet',
      name: 'Ricochet',
      description: 'Bounce to nearest creep for 50% damage',
      triggerChance: 0.20,
      icon: { type: AbilityIconType.RICOCHET, primaryColor: 0xffd700, secondaryColor: 0xffaa00 },
      effectParams: { bounceRange: 100, bounceCount: 1, bounceDamageMultiplier: 0.5 }
    },
    {
      id: 'rapid_incendiary',
      name: 'Incendiary Rounds',
      description: 'Apply burn: 5 dmg/sec for 3s',
      triggerChance: 0.15,
      icon: { type: AbilityIconType.FLAME_BULLET, primaryColor: 0xff6600, secondaryColor: 0xff3300 },
      effectParams: { burnDamage: 5, burnDuration: 3000 }
    }
  ],
  aura: [
    {
      id: 'aura_warcry',
      name: 'War Cry',
      description: 'Buffed towers gain +25% attack speed for 4s',
      triggerChance: 0.10,
      isPassive: true,
      passiveTickRate: 1000,
      icon: { type: AbilityIconType.CROSSED_SWORDS, primaryColor: 0xff4444, secondaryColor: 0xcc0000 },
      effectParams: { duration: 4000, speedMultiplier: 0.25 }
    },
    {
      id: 'aura_critaura',
      name: 'Critical Aura',
      description: 'Buffed towers gain +15% crit chance',
      triggerChance: 1.0,
      isPassive: true,
      icon: { type: AbilityIconType.STAR_BURST, primaryColor: 0xffa500, secondaryColor: 0xffd700 },
      effectParams: { }
    },
    {
      id: 'aura_overcharge',
      name: 'Overcharge',
      description: 'Randomly reset one tower\'s cooldown',
      triggerChance: 0.08,
      isPassive: true,
      passiveTickRate: 1000,
      icon: { type: AbilityIconType.LIGHTNING, primaryColor: 0xffd700, secondaryColor: 0xffff00 },
      effectParams: { }
    }
  ],
  archer: [
    {
      id: 'archer_multishot',
      name: 'Multi-Shot',
      description: 'Fire 3 arrows in a spread pattern',
      triggerChance: 0.20,
      icon: { type: AbilityIconType.TRIPLE_ARROW, primaryColor: 0xffd700, secondaryColor: 0x8b5a2b },
      effectParams: { count: 3 }
    },
    {
      id: 'archer_piercing',
      name: 'Piercing Arrow',
      description: 'Arrow passes through, hitting 2 more creeps',
      triggerChance: 0.15,
      icon: { type: AbilityIconType.PIERCE_ARROW, primaryColor: 0x4169e1, secondaryColor: 0x6495ed },
      effectParams: { count: 2, damageMultiplier: 1.0 }
    },
    {
      id: 'archer_quickdraw',
      name: 'Quick Draw',
      description: 'Next shot has no cooldown',
      triggerChance: 0.25,
      icon: { type: AbilityIconType.SPEED_BOW, primaryColor: 0xffd700, secondaryColor: 0xffaa00 },
      effectParams: { }
    }
  ]
};
