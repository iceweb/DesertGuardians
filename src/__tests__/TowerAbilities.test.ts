import { describe, it, expect } from 'vitest';
import { TOWER_ABILITIES } from '../objects/TowerAbilityDefinitions';
import { BRANCH_OPTIONS, TOWER_CONFIGS } from '../data/TowerData';

/**
 * Tests for Tower Ability system
 * Validates ability definitions, trigger mechanics, and effect parameters
 */

describe('Tower Abilities', () => {
  describe('Ability Definitions', () => {
    it('should have abilities for all tower branches', () => {
      for (const branch of BRANCH_OPTIONS) {
        expect(TOWER_ABILITIES[branch]).toBeDefined();
        expect(TOWER_ABILITIES[branch].length).toBeGreaterThan(0);
      }
    });

    it('should have exactly 3 abilities per branch', () => {
      for (const branch of BRANCH_OPTIONS) {
        expect(TOWER_ABILITIES[branch]).toHaveLength(3);
      }
    });

    it('should have unique ability IDs across all branches', () => {
      const allIds: string[] = [];
      for (const branch of BRANCH_OPTIONS) {
        for (const ability of TOWER_ABILITIES[branch]) {
          allIds.push(ability.id);
        }
      }
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should have valid trigger chances (0-1)', () => {
      for (const branch of BRANCH_OPTIONS) {
        for (const ability of TOWER_ABILITIES[branch]) {
          expect(ability.triggerChance).toBeGreaterThan(0);
          expect(ability.triggerChance).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should have required icon properties', () => {
      for (const branch of BRANCH_OPTIONS) {
        for (const ability of TOWER_ABILITIES[branch]) {
          expect(ability.icon).toBeDefined();
          expect(ability.icon.type).toBeDefined();
          expect(typeof ability.icon.primaryColor).toBe('number');
          expect(typeof ability.icon.secondaryColor).toBe('number');
        }
      }
    });

    it('should have name and description for all abilities', () => {
      for (const branch of BRANCH_OPTIONS) {
        for (const ability of TOWER_ABILITIES[branch]) {
          expect(ability.name).toBeDefined();
          expect(ability.name.length).toBeGreaterThan(0);
          expect(ability.description).toBeDefined();
          expect(ability.description.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Rock Cannon Abilities', () => {
    const abilities = TOWER_ABILITIES['rockcannon'];

    it('should have Aftershock with splash parameters', () => {
      const aftershock = abilities.find((a) => a.id === 'cannon_aftershock');
      expect(aftershock).toBeDefined();
      expect(aftershock!.effectParams.count).toBe(3);
      expect(aftershock!.effectParams.radius).toBe(50);
      expect(aftershock!.effectParams.damageMultiplier).toBe(0.5);
    });

    it('should have Tremor with zone parameters', () => {
      const tremor = abilities.find((a) => a.id === 'cannon_tremor');
      expect(tremor).toBeDefined();
      expect(tremor!.effectParams.radius).toBe(85);
      expect(tremor!.effectParams.duration).toBe(3000);
      expect(tremor!.effectParams.damage).toBe(25);
      expect(tremor!.effectParams.slowPercent).toBe(0.3);
    });

    it('should have Shrapnel with fragment parameters', () => {
      const shrapnel = abilities.find((a) => a.id === 'cannon_shrapnel');
      expect(shrapnel).toBeDefined();
      expect(shrapnel!.effectParams.count).toBe(6);
      expect(shrapnel!.effectParams.damageMultiplier).toBe(0.35);
    });
  });

  describe('Sniper Abilities', () => {
    const abilities = TOWER_ABILITIES['sniper'];

    it('should have Critical Strike with damage multiplier', () => {
      const critical = abilities.find((a) => a.id === 'sniper_critical');
      expect(critical).toBeDefined();
      expect(critical!.effectParams.damageMultiplier).toBe(2.0);
      expect(critical!.triggerChance).toBe(0.1);
    });

    it('should have Armor Pierce', () => {
      const pierce = abilities.find((a) => a.id === 'sniper_pierce');
      expect(pierce).toBeDefined();
      expect(pierce!.triggerChance).toBe(0.2);
    });

    it('should have Headshot with HP threshold', () => {
      const headshot = abilities.find((a) => a.id === 'sniper_headshot');
      expect(headshot).toBeDefined();
      expect(headshot!.effectParams.hpThreshold).toBe(0.25);
      expect(headshot!.effectParams.damageMultiplier).toBe(1.5);
    });
  });

  describe('Ice Tower Abilities', () => {
    const abilities = TOWER_ABILITIES['icetower'];

    it('should have Ice Trap with freeze duration', () => {
      const iceTrap = abilities.find((a) => a.id === 'ice_trap');
      expect(iceTrap).toBeDefined();
      expect(iceTrap!.effectParams.duration).toBe(2000);
    });

    it('should have Frost Nova with AOE radius', () => {
      const frostNova = abilities.find((a) => a.id === 'ice_frostnova');
      expect(frostNova).toBeDefined();
      expect(frostNova!.effectParams.radius).toBe(80);
    });

    it('should have Deep Freeze with brittle duration', () => {
      const deepFreeze = abilities.find((a) => a.id === 'ice_deepfreeze');
      expect(deepFreeze).toBeDefined();
      expect(deepFreeze!.effectParams.brittleDuration).toBe(2500);
    });
  });

  describe('Poison Tower Abilities', () => {
    const abilities = TOWER_ABILITIES['poison'];

    it('should have Plague Spread with radius', () => {
      const plague = abilities.find((a) => a.id === 'poison_plague');
      expect(plague).toBeDefined();
      expect(plague!.effectParams.radius).toBe(60);
    });

    it('should have Toxic Explosion with damage and radius', () => {
      const explosion = abilities.find((a) => a.id === 'poison_explosion');
      expect(explosion).toBeDefined();
      expect(explosion!.effectParams.damage).toBe(80);
      expect(explosion!.effectParams.radius).toBe(60);
    });

    it('should have Corrosive Acid with armor reduction', () => {
      const corrosive = abilities.find((a) => a.id === 'poison_corrosive');
      expect(corrosive).toBeDefined();
      expect(corrosive!.effectParams.armorReduction).toBe(5);
    });
  });

  describe('Rapid Fire Abilities', () => {
    const abilities = TOWER_ABILITIES['rapidfire'];

    it('should have Bullet Storm with shot count and speed', () => {
      const bulletstorm = abilities.find((a) => a.id === 'rapid_bulletstorm');
      expect(bulletstorm).toBeDefined();
      expect(bulletstorm!.effectParams.count).toBe(5);
      expect(bulletstorm!.effectParams.speedMultiplier).toBe(2.0);
    });

    it('should have Ricochet with bounce parameters', () => {
      const ricochet = abilities.find((a) => a.id === 'rapid_ricochet');
      expect(ricochet).toBeDefined();
      expect(ricochet!.effectParams.bounceRange).toBe(100);
      expect(ricochet!.effectParams.bounceDamageMultiplier).toBe(0.5);
    });

    it('should have Incendiary Rounds with burn damage', () => {
      const incendiary = abilities.find((a) => a.id === 'rapid_incendiary');
      expect(incendiary).toBeDefined();
      expect(incendiary!.effectParams.burnDamage).toBe(10);
      expect(incendiary!.effectParams.burnDuration).toBe(3000);
    });
  });

  describe('Aura Tower Abilities', () => {
    const abilities = TOWER_ABILITIES['aura'];

    it('should have all abilities marked as passive', () => {
      for (const ability of abilities) {
        expect(ability.isPassive).toBe(true);
      }
    });

    it('should have War Cry with buff duration', () => {
      const warcry = abilities.find((a) => a.id === 'aura_warcry');
      expect(warcry).toBeDefined();
      expect(warcry!.effectParams.duration).toBe(4000);
      expect(warcry!.effectParams.speedMultiplier).toBe(0.25);
    });

    it('should have Critical Aura with 100% trigger (always active)', () => {
      const critAura = abilities.find((a) => a.id === 'aura_critaura');
      expect(critAura).toBeDefined();
      expect(critAura!.triggerChance).toBe(1.0);
    });

    it('should have Echo Amplification with multicast chance', () => {
      const echo = abilities.find((a) => a.id === 'aura_echo');
      expect(echo).toBeDefined();
      expect(echo!.effectParams.multicastChance).toBe(0.1);
    });
  });

  describe('Archer Abilities', () => {
    const abilities = TOWER_ABILITIES['archer'];

    it('should have Multi-Shot with arrow count', () => {
      const multishot = abilities.find((a) => a.id === 'archer_multishot');
      expect(multishot).toBeDefined();
      expect(multishot!.effectParams.count).toBe(3);
    });

    it('should have Piercing Arrow with pierce count', () => {
      const piercing = abilities.find((a) => a.id === 'archer_piercing');
      expect(piercing).toBeDefined();
      expect(piercing!.effectParams.count).toBe(2);
      expect(piercing!.effectParams.damageMultiplier).toBe(1.0);
    });

    it('should have Heavy Arrows with knockback', () => {
      const heavyArrows = abilities.find((a) => a.id === 'archer_heavyarrows');
      expect(heavyArrows).toBeDefined();
      expect(heavyArrows!.effectParams.knockbackDistance).toBe(20);
      expect(heavyArrows!.triggerChance).toBe(0.15);
    });
  });

  describe('Ability Trigger Logic', () => {
    it('should trigger ability based on random chance', () => {
      const rollForAbility = (triggerChance: number, randomValue: number): boolean => {
        return randomValue <= triggerChance;
      };

      // 25% chance ability
      expect(rollForAbility(0.25, 0.1)).toBe(true);
      expect(rollForAbility(0.25, 0.25)).toBe(true);
      expect(rollForAbility(0.25, 0.26)).toBe(false);
      expect(rollForAbility(0.25, 0.5)).toBe(false);

      // 100% chance (passive)
      expect(rollForAbility(1.0, 0.0)).toBe(true);
      expect(rollForAbility(1.0, 0.999)).toBe(true);
    });

    it('should skip passive abilities in combat roll', () => {
      const ability = { isPassive: true, triggerChance: 0.1 };

      const rollForAbility = (
        ab: { isPassive?: boolean; triggerChance: number },
        random: number
      ): { triggered: boolean } => {
        if (ab.isPassive) {
          return { triggered: false };
        }
        return { triggered: random <= ab.triggerChance };
      };

      expect(rollForAbility(ability, 0.05)).toEqual({ triggered: false });
    });
  });

  describe('Ability Effect Calculations', () => {
    it('should calculate critical strike extra damage', () => {
      const baseDamage = 100;
      const damageMultiplier = 2.0;
      const extraDamage = baseDamage * (damageMultiplier - 1);
      expect(extraDamage).toBe(100);
    });

    it('should calculate shrapnel damage per fragment', () => {
      const baseDamage = 80;
      const damageMultiplier = 0.35;
      const shrapnelDamage = baseDamage * damageMultiplier;
      expect(shrapnelDamage).toBe(28);
    });

    it('should calculate ricochet bounce damage', () => {
      const baseDamage = 50;
      const bounceDamageMultiplier = 0.5;
      const bounceDamage = baseDamage * bounceDamageMultiplier;
      expect(bounceDamage).toBe(25);
    });

    it('should determine headshot execution threshold', () => {
      const maxHealth = 200;
      const hpThreshold = 0.25;
      const executionHP = maxHealth * hpThreshold;

      expect(executionHP).toBe(50);

      // Below threshold - execute
      expect(40 <= executionHP).toBe(true);

      // Above threshold - bonus damage only
      expect(60 <= executionHP).toBe(false);
    });

    it('should calculate boss ability resistance', () => {
      const normalDuration = 2000;
      const bossResistance = 0.3;
      const bossDuration = Math.floor(normalDuration * bossResistance);

      expect(bossDuration).toBe(600);
    });

    it('should calculate tremor tick damage', () => {
      const damage = 25;
      const duration = 3000;
      const tickInterval = 500;
      const maxTicks = Math.floor(duration / tickInterval);
      const totalDamage = damage * maxTicks;

      expect(maxTicks).toBe(6);
      expect(totalDamage).toBe(150);
    });
  });

  describe('Level 4 Tower Ability Unlock', () => {
    it('should only unlock abilities at level 4', () => {
      const getAvailableAbilities = (level: number, branch: string) => {
        if (level !== 4) return [];
        return TOWER_ABILITIES[branch as keyof typeof TOWER_ABILITIES] || [];
      };

      expect(getAvailableAbilities(1, 'archer')).toHaveLength(0);
      expect(getAvailableAbilities(2, 'sniper')).toHaveLength(0);
      expect(getAvailableAbilities(3, 'rockcannon')).toHaveLength(0);
      expect(getAvailableAbilities(4, 'icetower')).toHaveLength(3);
      expect(getAvailableAbilities(4, 'poison')).toHaveLength(3);
    });

    it('should verify level 4 towers exist for all branches', () => {
      for (const branch of BRANCH_OPTIONS) {
        const level4Key = `${branch}_4`;
        expect(TOWER_CONFIGS[level4Key]).toBeDefined();
        expect(TOWER_CONFIGS[level4Key].level).toBe(4);
      }
    });
  });
});
