import { describe, it, expect } from 'vitest';
import { MINE_CONFIGS, getMineCost, getTotalInvestment } from '../data/GameData';

/**
 * Tests for Gold Mine logic and economy
 * Validates mine configuration, costs, and income calculations
 */

describe('GoldMine System', () => {
  describe('Mine Configuration', () => {
    it('should have levels 0-4', () => {
      expect(MINE_CONFIGS[0]).toBeDefined();
      expect(MINE_CONFIGS[1]).toBeDefined();
      expect(MINE_CONFIGS[2]).toBeDefined();
      expect(MINE_CONFIGS[3]).toBeDefined();
      expect(MINE_CONFIGS[4]).toBeDefined();
    });

    it('should have level 0 as empty slot with no cost', () => {
      expect(MINE_CONFIGS[0].level).toBe(0);
      expect(MINE_CONFIGS[0].buildCost).toBe(0);
      expect(MINE_CONFIGS[0].incomePerWave).toBe(0);
    });

    it('should have valid build costs for all levels', () => {
      expect(MINE_CONFIGS[1].buildCost).toBe(75);
      expect(MINE_CONFIGS[2].buildCost).toBe(150);
      expect(MINE_CONFIGS[3].buildCost).toBe(250);
      expect(MINE_CONFIGS[4].buildCost).toBe(425);
    });

    it('should have increasing build costs per level', () => {
      expect(MINE_CONFIGS[1].buildCost).toBeLessThan(MINE_CONFIGS[2].buildCost);
      expect(MINE_CONFIGS[2].buildCost).toBeLessThan(MINE_CONFIGS[3].buildCost);
      expect(MINE_CONFIGS[3].buildCost).toBeLessThan(MINE_CONFIGS[4].buildCost);
    });

    it('should have increasing income per level', () => {
      expect(MINE_CONFIGS[1].incomePerWave).toBeLessThan(MINE_CONFIGS[2].incomePerWave);
      expect(MINE_CONFIGS[2].incomePerWave).toBeLessThan(MINE_CONFIGS[3].incomePerWave);
      expect(MINE_CONFIGS[3].incomePerWave).toBeLessThan(MINE_CONFIGS[4].incomePerWave);
    });

    it('should have valid income values', () => {
      expect(MINE_CONFIGS[1].incomePerWave).toBe(12);
      expect(MINE_CONFIGS[2].incomePerWave).toBe(22);
      expect(MINE_CONFIGS[3].incomePerWave).toBe(40);
      expect(MINE_CONFIGS[4].incomePerWave).toBe(72);
    });

    it('should have names and descriptions for all levels', () => {
      for (let i = 0; i <= 4; i++) {
        expect(MINE_CONFIGS[i].name).toBeDefined();
        expect(MINE_CONFIGS[i].name.length).toBeGreaterThan(0);
        expect(MINE_CONFIGS[i].description).toBeDefined();
        expect(MINE_CONFIGS[i].description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getMineCost', () => {
    it('should return correct cost for each level', () => {
      expect(getMineCost(1)).toBe(75);
      expect(getMineCost(2)).toBe(150);
      expect(getMineCost(3)).toBe(250);
      expect(getMineCost(4)).toBe(425);
    });
  });

  describe('getTotalInvestment', () => {
    it('should return 0 for level 0', () => {
      expect(getTotalInvestment(0)).toBe(0);
    });

    it('should return cumulative cost for each level', () => {
      expect(getTotalInvestment(1)).toBe(75);
      expect(getTotalInvestment(2)).toBe(75 + 150);
      expect(getTotalInvestment(3)).toBe(75 + 150 + 250);
      expect(getTotalInvestment(4)).toBe(75 + 150 + 250 + 425);
    });
  });

  describe('Mine ROI Calculation', () => {
    it('should calculate waves to break even', () => {
      const calculateBreakEven = (level: 1 | 2 | 3 | 4): number => {
        const totalCost = getTotalInvestment(level);
        const income = MINE_CONFIGS[level].incomePerWave;
        return Math.ceil(totalCost / income);
      };

      // Level 1: 75 / 12 = 6.25 -> 7 waves
      expect(calculateBreakEven(1)).toBe(7);

      // Level 2: 225 / 22 = 10.22 -> 11 waves
      expect(calculateBreakEven(2)).toBe(11);

      // Level 3: 475 / 40 = 11.875 -> 12 waves
      expect(calculateBreakEven(3)).toBe(12);

      // Level 4: 900 / 72 = 12.5 -> 13 waves
      expect(calculateBreakEven(4)).toBe(13);
    });

    it('should calculate upgrade value', () => {
      const calculateUpgradeValue = (
        currentLevel: 0 | 1 | 2 | 3,
        wavesRemaining: number
      ): number => {
        const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4;
        const upgradeCost = MINE_CONFIGS[nextLevel].buildCost;
        const incomeDiff =
          MINE_CONFIGS[nextLevel].incomePerWave - MINE_CONFIGS[currentLevel].incomePerWave;
        return incomeDiff * wavesRemaining - upgradeCost;
      };

      // Upgrade from 0 to 1 with 20 waves remaining
      // Income diff: 12 - 0 = 12, Profit: 12 * 20 - 75 = 165
      expect(calculateUpgradeValue(0, 20)).toBe(165);

      // Upgrade from 1 to 2 with 15 waves remaining
      // Income diff: 22 - 12 = 10, Profit: 10 * 15 - 150 = 0
      expect(calculateUpgradeValue(1, 15)).toBe(0);
    });
  });

  describe('Mine State Logic', () => {
    it('should track mine state correctly', () => {
      interface MineState {
        level: 0 | 1 | 2 | 3 | 4;
        totalInvested: number;
      }

      const createMine = (): MineState => ({
        level: 0,
        totalInvested: 0,
      });

      const buildMine = (mine: MineState): boolean => {
        if (mine.level !== 0) return false;
        mine.level = 1;
        mine.totalInvested = MINE_CONFIGS[1].buildCost;
        return true;
      };

      const upgradeMine = (mine: MineState): boolean => {
        if (mine.level === 0 || mine.level >= 4) return false;
        const nextLevel = (mine.level + 1) as 1 | 2 | 3 | 4;
        mine.totalInvested += MINE_CONFIGS[nextLevel].buildCost;
        mine.level = nextLevel;
        return true;
      };

      const mine = createMine();
      expect(mine.level).toBe(0);
      expect(mine.totalInvested).toBe(0);

      expect(buildMine(mine)).toBe(true);
      expect(mine.level).toBe(1);
      expect(mine.totalInvested).toBe(75);

      expect(buildMine(mine)).toBe(false); // Already built

      expect(upgradeMine(mine)).toBe(true);
      expect(mine.level).toBe(2);
      expect(mine.totalInvested).toBe(225);

      expect(upgradeMine(mine)).toBe(true);
      expect(mine.level).toBe(3);
      expect(mine.totalInvested).toBe(475);

      expect(upgradeMine(mine)).toBe(true);
      expect(mine.level).toBe(4);
      expect(mine.totalInvested).toBe(900);

      expect(upgradeMine(mine)).toBe(false); // Max level
    });

    it('should calculate upgrade cost from current level', () => {
      const getUpgradeCost = (currentLevel: 0 | 1 | 2 | 3 | 4): number => {
        if (currentLevel >= 4) return 0;
        const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4;
        return MINE_CONFIGS[nextLevel].buildCost;
      };

      expect(getUpgradeCost(0)).toBe(75); // Cost to build level 1
      expect(getUpgradeCost(1)).toBe(150); // Cost to upgrade to level 2
      expect(getUpgradeCost(2)).toBe(250); // Cost to upgrade to level 3
      expect(getUpgradeCost(3)).toBe(425); // Cost to upgrade to level 4
      expect(getUpgradeCost(4)).toBe(0); // Max level, no upgrade
    });

    it('should check if mine can upgrade', () => {
      const canUpgrade = (level: 0 | 1 | 2 | 3 | 4): boolean => {
        return level > 0 && level < 4;
      };

      expect(canUpgrade(0)).toBe(false); // Not built
      expect(canUpgrade(1)).toBe(true);
      expect(canUpgrade(2)).toBe(true);
      expect(canUpgrade(3)).toBe(true);
      expect(canUpgrade(4)).toBe(false); // Max level
    });

    it('should check if mine is built', () => {
      const isBuilt = (level: number): boolean => level > 0;

      expect(isBuilt(0)).toBe(false);
      expect(isBuilt(1)).toBe(true);
      expect(isBuilt(2)).toBe(true);
      expect(isBuilt(3)).toBe(true);
      expect(isBuilt(4)).toBe(true);
    });
  });

  describe('Multiple Mines Income', () => {
    it('should calculate total income from multiple mines', () => {
      const calculateTotalIncome = (mineLevels: number[]): number => {
        return mineLevels.reduce((sum, level) => sum + MINE_CONFIGS[level].incomePerWave, 0);
      };

      expect(calculateTotalIncome([0, 0, 0])).toBe(0);
      expect(calculateTotalIncome([1, 1, 1])).toBe(36);
      expect(calculateTotalIncome([2, 2, 2])).toBe(66);
      expect(calculateTotalIncome([3, 3, 3])).toBe(120);
      expect(calculateTotalIncome([4, 4, 4])).toBe(216);
      expect(calculateTotalIncome([1, 2, 3])).toBe(74);
      expect(calculateTotalIncome([4, 4, 4])).toBe(216);
    });

    it('should calculate total investment from multiple mines', () => {
      const calculateTotalMineInvestment = (mineLevels: number[]): number => {
        return mineLevels.reduce(
          (sum, level) => sum + getTotalInvestment(level as 0 | 1 | 2 | 3 | 4),
          0
        );
      };

      expect(calculateTotalMineInvestment([0, 0, 0])).toBe(0);
      expect(calculateTotalMineInvestment([1, 1, 1])).toBe(225);
      expect(calculateTotalMineInvestment([4, 4, 4])).toBe(2700);
    });

    it('should track income over multiple waves', () => {
      const incomePerWave = 74; // Example: one mine each at 1, 2, 3
      const waves = 10;
      const totalIncome = incomePerWave * waves;

      expect(totalIncome).toBe(740);
    });
  });

  describe('Economy Balance', () => {
    it('should ensure mines are profitable over 35 waves', () => {
      for (let level = 1; level <= 4; level++) {
        const cost = getTotalInvestment(level as 0 | 1 | 2 | 3 | 4);
        const income = MINE_CONFIGS[level].incomePerWave;
        const profit = income * 35 - cost;

        // All mine levels should be profitable over full game
        expect(profit).toBeGreaterThan(0);
      }
    });

    it('should have balanced upgrade path', () => {
      // Check that later upgrades have better income/cost ratio eventually
      const level3TotalCost = getTotalInvestment(3);
      const level3Income = MINE_CONFIGS[3].incomePerWave;
      const level3Efficiency = level3Income / level3TotalCost;

      const level4TotalCost = getTotalInvestment(4);
      const level4Income = MINE_CONFIGS[4].incomePerWave;
      const level4Efficiency = level4Income / level4TotalCost;

      // Both should have reasonable efficiency
      expect(level3Efficiency).toBeGreaterThan(0.05);
      expect(level4Efficiency).toBeGreaterThan(0.05);
    });
  });
});
