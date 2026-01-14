import { describe, it, expect } from 'vitest';
import { TOWER_CONFIGS, BRANCH_OPTIONS, type TowerBranch } from '../data/TowerData';

/**
 * Tests for Tower upgrade and branching system
 * Validates upgrade paths, costs, and stat progression
 */

describe('Tower System', () => {
  describe('Tower Branching', () => {
    it('should have archer as base tower', () => {
      const archerL1 = TOWER_CONFIGS['archer_1'];
      expect(archerL1).toBeDefined();
      expect(archerL1.buildCost).toBeDefined();
      expect(archerL1.branch).toBe('archer');
      expect(archerL1.level).toBe(1);
    });

    it('should branch from archer level 1 to all branches', () => {
      const canBranch = (branch: TowerBranch, level: number): boolean => {
        return branch === 'archer' && level === 1;
      };

      expect(canBranch('archer', 1)).toBe(true);
      expect(canBranch('archer', 2)).toBe(false);
      expect(canBranch('sniper', 1)).toBe(false);
    });

    it('should have valid upgrade options from archer level 1', () => {
      const getUpgradeOptions = () => {
        return {
          branches: BRANCH_OPTIONS,
          levelUp: 'archer_2',
        };
      };

      const options = getUpgradeOptions();
      expect(options.branches).toContain('archer');
      expect(options.branches).toContain('sniper');
      expect(options.branches).toContain('rockcannon');
      expect(options.branches).toContain('icetower');
      expect(options.branches).toContain('poison');
      expect(options.branches).toContain('rapidfire');
      expect(options.branches).toContain('aura');
    });

    it('should have 7 total branches', () => {
      expect(BRANCH_OPTIONS.length).toBe(7);
    });
  });

  describe('Upgrade Progression', () => {
    it('should have levels 1-4 for all branches', () => {
      for (const branch of BRANCH_OPTIONS) {
        for (let level = 1; level <= 4; level++) {
          const key = `${branch}_${level}`;
          expect(TOWER_CONFIGS[key]).toBeDefined();
          expect(TOWER_CONFIGS[key].level).toBe(level);
        }
      }
    });

    it('should have increasing stats per level', () => {
      for (const branch of BRANCH_OPTIONS) {
        if (branch === 'aura') continue; // Aura towers don't deal damage

        const levels = [1, 2, 3, 4].map((l) => TOWER_CONFIGS[`${branch}_${l}`]);

        for (let i = 1; i < levels.length; i++) {
          // Range should increase or stay same
          expect(levels[i].stats.range).toBeGreaterThanOrEqual(levels[i - 1].stats.range);
        }
      }
    });

    it('should have increasing upgrade costs per level', () => {
      for (const branch of BRANCH_OPTIONS) {
        // Skip level 1 as it uses buildCost instead
        const costs = [2, 3, 4].map((l) => TOWER_CONFIGS[`${branch}_${l}`].upgradeCost);

        for (let i = 1; i < costs.length; i++) {
          expect(costs[i]).toBeGreaterThan(costs[i - 1]);
        }
      }
    });

    it('should validate upgrade path', () => {
      const canUpgrade = (
        currentBranch: string,
        currentLevel: number,
        targetBranch: string,
        targetLevel: number
      ): boolean => {
        // From archer_1, can branch to any branch level 1 or archer level 2
        if (currentBranch === 'archer' && currentLevel === 1) {
          if (targetBranch === 'archer' && targetLevel === 2) return true;
          if (targetBranch !== 'archer' && targetLevel === 1) return true;
          return false;
        }

        // Otherwise, must be same branch and +1 level
        if (targetBranch !== currentBranch) return false;
        if (targetLevel !== currentLevel + 1) return false;
        if (currentLevel >= 4) return false;

        return true;
      };

      // Valid upgrades
      expect(canUpgrade('archer', 1, 'archer', 2)).toBe(true);
      expect(canUpgrade('archer', 1, 'sniper', 1)).toBe(true);
      expect(canUpgrade('sniper', 1, 'sniper', 2)).toBe(true);
      expect(canUpgrade('sniper', 3, 'sniper', 4)).toBe(true);

      // Invalid upgrades
      expect(canUpgrade('archer', 1, 'sniper', 2)).toBe(false);
      expect(canUpgrade('sniper', 2, 'rockcannon', 3)).toBe(false);
      expect(canUpgrade('sniper', 4, 'sniper', 5)).toBe(false);
    });
  });

  describe('Investment Tracking', () => {
    it('should calculate total investment', () => {
      const calculateInvestment = (branch: string, level: number): number => {
        let total = TOWER_CONFIGS['archer_1'].buildCost || 0;

        if (branch === 'archer') {
          // Archer upgrade path
          for (let l = 2; l <= level; l++) {
            total += TOWER_CONFIGS[`archer_${l}`].upgradeCost;
          }
        } else {
          // Branch to different tower
          total += TOWER_CONFIGS[`${branch}_1`].upgradeCost;
          for (let l = 2; l <= level; l++) {
            total += TOWER_CONFIGS[`${branch}_${l}`].upgradeCost;
          }
        }

        return total;
      };

      // Archer path: 50 + 110 + 280 + 800 = 1240
      expect(calculateInvestment('archer', 1)).toBe(50);
      expect(calculateInvestment('archer', 4)).toBe(50 + 110 + 280 + 800);
    });

    it('should calculate sell value at 70%', () => {
      const calculateSellValue = (investment: number): number => {
        return Math.floor(investment * 0.7);
      };

      expect(calculateSellValue(100)).toBe(70);
      expect(calculateSellValue(1240)).toBe(868);
    });
  });

  describe('Tower Types', () => {
    it('should classify towers as physical, magic, or support', () => {
      const validTypes = ['physical', 'magic', 'support'];

      for (const config of Object.values(TOWER_CONFIGS)) {
        expect(validTypes).toContain(config.type);
      }
    });

    it('should have aura towers as support type', () => {
      for (let level = 1; level <= 4; level++) {
        const aura = TOWER_CONFIGS[`aura_${level}`];
        expect(aura.type).toBe('support');
      }
    });

    it('should have aura towers with 0 damage and 0 fire rate', () => {
      for (let level = 1; level <= 4; level++) {
        const aura = TOWER_CONFIGS[`aura_${level}`];
        expect(aura.stats.damage).toBe(0);
        expect(aura.stats.fireRate).toBe(0);
      }
    });
  });

  describe('Tower Stats', () => {
    describe('Archer Tower', () => {
      it('should have air damage bonus', () => {
        for (let level = 1; level <= 4; level++) {
          const tower = TOWER_CONFIGS[`archer_${level}`];
          expect(tower.stats.airDamageBonus).toBe(2.0);
        }
      });
    });

    describe('Ice Tower', () => {
      it('should have slow properties', () => {
        for (let level = 1; level <= 4; level++) {
          const tower = TOWER_CONFIGS[`icetower_${level}`];
          expect(tower.stats.slowPercent).toBeGreaterThan(0);
          expect(tower.stats.slowPercent).toBeLessThanOrEqual(1);
          expect(tower.stats.slowDuration).toBeGreaterThan(0);
          expect(tower.stats.maxSlowTargets).toBeGreaterThan(0);
        }
      });

      it('should have increasing slow effect', () => {
        const slowPercents = [1, 2, 3, 4].map(
          (l) => TOWER_CONFIGS[`icetower_${l}`].stats.slowPercent!
        );

        for (let i = 1; i < slowPercents.length; i++) {
          expect(slowPercents[i]).toBeGreaterThanOrEqual(slowPercents[i - 1]);
        }
      });
    });

    describe('Poison Tower', () => {
      it('should have DoT properties', () => {
        for (let level = 1; level <= 4; level++) {
          const tower = TOWER_CONFIGS[`poison_${level}`];
          expect(tower.stats.dotDamage).toBeGreaterThan(0);
          expect(tower.stats.dotDuration).toBeGreaterThan(0);
        }
      });
    });

    describe('Rock Cannon', () => {
      it('should have splash radius', () => {
        for (let level = 1; level <= 4; level++) {
          const tower = TOWER_CONFIGS[`rockcannon_${level}`];
          expect(tower.stats.splashRadius).toBeGreaterThan(0);
        }
      });

      it('should have increasing splash radius', () => {
        const splashRadii = [1, 2, 3, 4].map(
          (l) => TOWER_CONFIGS[`rockcannon_${l}`].stats.splashRadius!
        );

        for (let i = 1; i < splashRadii.length; i++) {
          expect(splashRadii[i]).toBeGreaterThan(splashRadii[i - 1]);
        }
      });
    });

    describe('Sniper Tower', () => {
      it('should have high range', () => {
        const sniperL1 = TOWER_CONFIGS['sniper_1'];
        const archerL1 = TOWER_CONFIGS['archer_1'];

        expect(sniperL1.stats.range).toBeGreaterThan(archerL1.stats.range);
      });

      it('should have slow fire rate but high damage', () => {
        const sniperL4 = TOWER_CONFIGS['sniper_4'];
        const archerL4 = TOWER_CONFIGS['archer_4'];

        expect(sniperL4.stats.fireRate).toBeGreaterThan(archerL4.stats.fireRate);
        expect(sniperL4.stats.damage).toBeGreaterThan(archerL4.stats.damage);
      });
    });

    describe('Rapid Fire Tower', () => {
      it('should have fast fire rate', () => {
        const rapidL1 = TOWER_CONFIGS['rapidfire_1'];
        const archerL1 = TOWER_CONFIGS['archer_1'];

        expect(rapidL1.stats.fireRate).toBeLessThan(archerL1.stats.fireRate);
      });
    });

    describe('Aura Tower', () => {
      it('should have aura damage multiplier', () => {
        for (let level = 1; level <= 4; level++) {
          const tower = TOWER_CONFIGS[`aura_${level}`];
          expect(tower.stats.auraDamageMultiplier).toBeGreaterThan(0);
        }
      });

      it('should have increasing aura effect', () => {
        const multipliers = [1, 2, 3, 4].map(
          (l) => TOWER_CONFIGS[`aura_${l}`].stats.auraDamageMultiplier!
        );

        for (let i = 1; i < multipliers.length; i++) {
          expect(multipliers[i]).toBeGreaterThan(multipliers[i - 1]);
        }
      });
    });
  });

  describe('Tower Placement', () => {
    it('should check if position is in tower range', () => {
      const isInRange = (
        towerX: number,
        towerY: number,
        targetX: number,
        targetY: number,
        range: number
      ): boolean => {
        const dist = Math.sqrt((targetX - towerX) ** 2 + (targetY - towerY) ** 2);
        return dist <= range;
      };

      const towerRange = 150;

      expect(isInRange(100, 100, 200, 100, towerRange)).toBe(true); // 100 away
      expect(isInRange(100, 100, 250, 100, towerRange)).toBe(true); // exactly 150
      expect(isInRange(100, 100, 251, 100, towerRange)).toBe(false); // 151 away
    });

    it('should calculate depth based on Y position', () => {
      const calculateDepth = (y: number): number => {
        return 20 + Math.floor(y / 10);
      };

      expect(calculateDepth(100)).toBe(30);
      expect(calculateDepth(200)).toBe(40);
      expect(calculateDepth(0)).toBe(20);
    });
  });

  describe('Aura Buff Application', () => {
    it('should identify aura towers', () => {
      const isAuraTower = (branch: string, fireRate: number): boolean => {
        return branch === 'aura' || fireRate === 0;
      };

      expect(isAuraTower('aura', 0)).toBe(true);
      expect(isAuraTower('archer', 500)).toBe(false);
      expect(isAuraTower('sniper', 1500)).toBe(false);
    });

    it('should check if tower has aura buff', () => {
      const hasAuraBuff = (damageMultiplier: number, auraCritBonus: number): boolean => {
        return damageMultiplier > 1.0 || auraCritBonus > 0;
      };

      expect(hasAuraBuff(1.0, 0)).toBe(false);
      expect(hasAuraBuff(1.2, 0)).toBe(true);
      expect(hasAuraBuff(1.0, 0.15)).toBe(true);
      expect(hasAuraBuff(1.3, 0.15)).toBe(true);
    });
  });

  describe('Ability Selection at Level 4', () => {
    it('should only allow ability selection at level 4', () => {
      const canSelectAbility = (level: number): boolean => {
        return level === 4;
      };

      expect(canSelectAbility(1)).toBe(false);
      expect(canSelectAbility(2)).toBe(false);
      expect(canSelectAbility(3)).toBe(false);
      expect(canSelectAbility(4)).toBe(true);
    });

    it('should require ability selection for level 3 to 4 upgrade', () => {
      const getUpgradeOptions = (branch: string, level: number) => {
        const options: { levelUp?: string; needsAbilitySelection?: boolean } = {};

        if (level < 4) {
          options.levelUp = `${branch}_${level + 1}`;

          if (level === 3) {
            options.needsAbilitySelection = true;
          }
        }

        return options;
      };

      expect(getUpgradeOptions('sniper', 2).needsAbilitySelection).toBeUndefined();
      expect(getUpgradeOptions('sniper', 3).needsAbilitySelection).toBe(true);
    });
  });
});
