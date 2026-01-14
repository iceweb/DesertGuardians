import { describe, it, expect } from 'vitest';
import { TOWER_CONFIGS, BRANCH_OPTIONS } from '../data/TowerData';

describe('TowerData', () => {
  describe('BRANCH_OPTIONS', () => {
    it('should have 7 branches', () => {
      expect(BRANCH_OPTIONS).toHaveLength(7);
    });

    it('should include all expected branches', () => {
      expect(BRANCH_OPTIONS).toContain('archer');
      expect(BRANCH_OPTIONS).toContain('rapidfire');
      expect(BRANCH_OPTIONS).toContain('sniper');
      expect(BRANCH_OPTIONS).toContain('rockcannon');
      expect(BRANCH_OPTIONS).toContain('icetower');
      expect(BRANCH_OPTIONS).toContain('poison');
      expect(BRANCH_OPTIONS).toContain('aura');
    });
  });

  describe('TOWER_CONFIGS', () => {
    it('should have valid key matching the config key property', () => {
      for (const [key, config] of Object.entries(TOWER_CONFIGS)) {
        expect(config.key).toBe(key);
      }
    });

    it('should have valid stats for all towers', () => {
      for (const [_key, config] of Object.entries(TOWER_CONFIGS)) {
        expect(config.stats.range).toBeGreaterThan(0);
        expect(config.stats.damage).toBeGreaterThanOrEqual(0);
        expect(config.stats.fireRate).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid levels (1-4)', () => {
      for (const config of Object.values(TOWER_CONFIGS)) {
        expect(config.level).toBeGreaterThanOrEqual(1);
        expect(config.level).toBeLessThanOrEqual(4);
      }
    });

    it('should have valid tower types', () => {
      const validTypes = ['physical', 'magic', 'support'];
      for (const config of Object.values(TOWER_CONFIGS)) {
        expect(validTypes).toContain(config.type);
      }
    });

    it('should have valid branches from BRANCH_OPTIONS', () => {
      for (const config of Object.values(TOWER_CONFIGS)) {
        expect(BRANCH_OPTIONS).toContain(config.branch);
      }
    });
  });

  describe('Archer branch', () => {
    it('should have levels 1-4', () => {
      expect(TOWER_CONFIGS['archer_1']).toBeDefined();
      expect(TOWER_CONFIGS['archer_2']).toBeDefined();
      expect(TOWER_CONFIGS['archer_3']).toBeDefined();
      expect(TOWER_CONFIGS['archer_4']).toBeDefined();
    });

    it('should have air damage bonus on all levels', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`archer_${i}`];
        expect(config.stats.airDamageBonus).toBeDefined();
        expect(config.stats.airDamageBonus).toBe(2.0);
      }
    });

    it('should have increasing damage per level', () => {
      const damages = [1, 2, 3, 4].map((i) => TOWER_CONFIGS[`archer_${i}`].stats.damage);
      for (let i = 1; i < damages.length; i++) {
        expect(damages[i]).toBeGreaterThan(damages[i - 1]);
      }
    });

    it('should only have buildCost on level 1', () => {
      expect(TOWER_CONFIGS['archer_1'].buildCost).toBeDefined();
      expect(TOWER_CONFIGS['archer_2'].buildCost).toBeUndefined();
      expect(TOWER_CONFIGS['archer_3'].buildCost).toBeUndefined();
      expect(TOWER_CONFIGS['archer_4'].buildCost).toBeUndefined();
    });
  });

  describe('Ice tower branch', () => {
    it('should have slow properties', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`icetower_${i}`];
        expect(config.stats.slowPercent).toBeDefined();
        expect(config.stats.slowPercent).toBeGreaterThan(0);
        expect(config.stats.slowPercent).toBeLessThanOrEqual(1);
        expect(config.stats.slowDuration).toBeGreaterThan(0);
        expect(config.stats.maxSlowTargets).toBeGreaterThan(0);
      }
    });

    it('should have increasing slow effect per level', () => {
      const slowPercents = [1, 2, 3, 4].map(
        (i) => TOWER_CONFIGS[`icetower_${i}`].stats.slowPercent!
      );
      for (let i = 1; i < slowPercents.length; i++) {
        expect(slowPercents[i]).toBeGreaterThanOrEqual(slowPercents[i - 1]);
      }
    });
  });

  describe('Poison tower branch', () => {
    it('should have DoT properties', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`poison_${i}`];
        expect(config.stats.dotDamage).toBeDefined();
        expect(config.stats.dotDamage).toBeGreaterThan(0);
        expect(config.stats.dotDuration).toBeGreaterThan(0);
      }
    });
  });

  describe('Rock cannon branch', () => {
    it('should have splash radius', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`rockcannon_${i}`];
        expect(config.stats.splashRadius).toBeDefined();
        expect(config.stats.splashRadius).toBeGreaterThan(0);
      }
    });

    it('should have increasing splash radius per level', () => {
      const splashRadii = [1, 2, 3, 4].map(
        (i) => TOWER_CONFIGS[`rockcannon_${i}`].stats.splashRadius!
      );
      for (let i = 1; i < splashRadii.length; i++) {
        expect(splashRadii[i]).toBeGreaterThan(splashRadii[i - 1]);
      }
    });
  });

  describe('Aura tower branch', () => {
    it('should have 0 fire rate and damage (support tower)', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`aura_${i}`];
        expect(config.stats.fireRate).toBe(0);
        expect(config.stats.damage).toBe(0);
      }
    });

    it('should have aura damage multiplier', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`aura_${i}`];
        expect(config.stats.auraDamageMultiplier).toBeDefined();
        expect(config.stats.auraDamageMultiplier).toBeGreaterThan(0);
      }
    });

    it('should have type support', () => {
      for (let i = 1; i <= 4; i++) {
        const config = TOWER_CONFIGS[`aura_${i}`];
        expect(config.type).toBe('support');
      }
    });
  });

  describe('Upgrade costs', () => {
    it('should have upgrade costs for all non-base towers', () => {
      for (const config of Object.values(TOWER_CONFIGS)) {
        if (config.level > 1 || config.branch !== 'archer') {
          expect(config.upgradeCost).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should have higher upgrade costs at higher levels within same branch', () => {
      const branches = ['rapidfire', 'sniper', 'rockcannon', 'icetower', 'poison'];
      for (const branch of branches) {
        const levels = [1, 2, 3].map((i) => TOWER_CONFIGS[`${branch}_${i}`]);
        for (let i = 1; i < levels.length; i++) {
          expect(levels[i].upgradeCost).toBeGreaterThan(levels[i - 1].upgradeCost);
        }
      }
    });
  });
});
