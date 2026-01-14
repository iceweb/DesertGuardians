import { describe, it, expect } from 'vitest';

// Test utility functions and damage calculations that are independent of Phaser

describe('Damage Calculations', () => {
  describe('Physical Damage Calculation', () => {
    it('should apply armor reduction correctly', () => {
      const calculateDamage = (baseDamage: number, armor: number): number => {
        return Math.max(1, baseDamage - armor);
      };

      expect(calculateDamage(20, 0)).toBe(20);
      expect(calculateDamage(20, 5)).toBe(15);
      expect(calculateDamage(20, 20)).toBe(1); // Minimum 1 damage
      expect(calculateDamage(20, 25)).toBe(1); // Can't go below 1
    });

    it('should apply air damage bonus correctly', () => {
      const calculateAirDamage = (
        baseDamage: number,
        isFlying: boolean,
        airDamageBonus: number
      ): number => {
        if (isFlying && airDamageBonus > 0) {
          return baseDamage * (1 + airDamageBonus);
        }
        return baseDamage;
      };

      expect(calculateAirDamage(10, false, 2.0)).toBe(10);
      expect(calculateAirDamage(10, true, 2.0)).toBe(30); // 10 * 3.0
      expect(calculateAirDamage(15, true, 1.0)).toBe(30); // 15 * 2.0
    });
  });

  describe('Splash Damage Calculation', () => {
    it('should calculate splash damage falloff', () => {
      const calculateSplashDamage = (
        baseDamage: number,
        distanceFromCenter: number,
        splashRadius: number
      ): number => {
        if (distanceFromCenter > splashRadius) return 0;
        // Linear falloff from center
        const falloff = 1 - distanceFromCenter / splashRadius;
        return Math.floor(baseDamage * falloff);
      };

      expect(calculateSplashDamage(100, 0, 100)).toBe(100); // Center
      expect(calculateSplashDamage(100, 50, 100)).toBe(50); // Half distance
      expect(calculateSplashDamage(100, 100, 100)).toBe(0); // Edge
      expect(calculateSplashDamage(100, 150, 100)).toBe(0); // Outside
    });
  });

  describe('Critical Hit Calculation', () => {
    it('should apply crit multiplier when crit occurs', () => {
      const calculateCritDamage = (
        baseDamage: number,
        critOccurred: boolean,
        critMultiplier: number
      ): number => {
        return critOccurred ? baseDamage * critMultiplier : baseDamage;
      };

      expect(calculateCritDamage(50, false, 2.0)).toBe(50);
      expect(calculateCritDamage(50, true, 2.0)).toBe(100);
      expect(calculateCritDamage(50, true, 1.5)).toBe(75);
    });
  });

  describe('Aura Buff Calculation', () => {
    it('should apply aura damage multiplier', () => {
      const applyAuraBuff = (baseDamage: number, auraDamageMultiplier: number): number => {
        return Math.floor(baseDamage * (1 + auraDamageMultiplier));
      };

      expect(applyAuraBuff(100, 0.2)).toBe(120); // +20%
      expect(applyAuraBuff(100, 0.3)).toBe(130); // +30%
      expect(applyAuraBuff(100, 0.5)).toBe(150); // +50%
    });

    it('should stack multiple aura buffs', () => {
      const applyMultipleAuras = (baseDamage: number, auraMultipliers: number[]): number => {
        const totalMultiplier = auraMultipliers.reduce((sum, mult) => sum + mult, 0);
        return Math.floor(baseDamage * (1 + totalMultiplier));
      };

      expect(applyMultipleAuras(100, [0.2, 0.3])).toBe(150); // +50% total
      expect(applyMultipleAuras(100, [0.2, 0.2, 0.2])).toBe(160); // +60% total
    });
  });
});

describe('Distance Calculations', () => {
  it('should calculate distance between two points', () => {
    const distance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    expect(distance(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
    expect(distance(0, 0, 0, 0)).toBe(0);
    expect(distance(0, 0, 10, 0)).toBe(10);
    expect(distance(0, 0, 0, 10)).toBe(10);
  });

  it('should detect if target is in range', () => {
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

    expect(isInRange(0, 0, 100, 0, 100)).toBe(true);
    expect(isInRange(0, 0, 101, 0, 100)).toBe(false);
    expect(isInRange(100, 100, 150, 100, 60)).toBe(true);
    expect(isInRange(100, 100, 200, 100, 60)).toBe(false);
  });
});

describe('Gold and Economy', () => {
  describe('Kill Reward Calculation', () => {
    it('should return base gold reward', () => {
      const getGoldReward = (baseReward: number): number => baseReward;

      expect(getGoldReward(10)).toBe(10);
      expect(getGoldReward(25)).toBe(25);
    });
  });

  describe('Tower Cost Calculation', () => {
    it('should calculate total tower investment', () => {
      const calculateTowerInvestment = (buildCost: number, upgradeCosts: number[]): number => {
        return buildCost + upgradeCosts.reduce((sum, cost) => sum + cost, 0);
      };

      // Archer path: build 50, upgrades 110, 280, 800
      expect(calculateTowerInvestment(50, [110])).toBe(160);
      expect(calculateTowerInvestment(50, [110, 280])).toBe(440);
      expect(calculateTowerInvestment(50, [110, 280, 800])).toBe(1240);
    });

    it('should calculate sell value (typically 60-70%)', () => {
      const calculateSellValue = (investment: number, sellPercent: number = 0.6): number => {
        return Math.floor(investment * sellPercent);
      };

      expect(calculateSellValue(100, 0.6)).toBe(60);
      expect(calculateSellValue(150, 0.6)).toBe(90);
      expect(calculateSellValue(100, 0.7)).toBe(70);
    });
  });

  describe('Mine Income', () => {
    it('should calculate wave income from mines', () => {
      const calculateMineIncome = (mineLevels: number[]): number => {
        const incomePerLevel: Record<number, number> = { 0: 0, 1: 12, 2: 22, 3: 40 };
        return mineLevels.reduce((sum, level) => sum + incomePerLevel[level], 0);
      };

      expect(calculateMineIncome([1, 1, 1])).toBe(36);
      expect(calculateMineIncome([2, 2, 2])).toBe(66);
      expect(calculateMineIncome([3, 3, 3])).toBe(120);
      expect(calculateMineIncome([1, 2, 3])).toBe(74);
      expect(calculateMineIncome([0, 0, 0])).toBe(0);
    });
  });
});

describe('Wave Progression', () => {
  it('should calculate wave difficulty scaling', () => {
    const getWaveDifficultyMultiplier = (waveNumber: number): number => {
      // Example: linear scaling
      return 1 + (waveNumber - 1) * 0.1;
    };

    expect(getWaveDifficultyMultiplier(1)).toBe(1);
    expect(getWaveDifficultyMultiplier(10)).toBeCloseTo(1.9);
    expect(getWaveDifficultyMultiplier(35)).toBeCloseTo(4.4);
  });
});
