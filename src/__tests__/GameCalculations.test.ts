import { describe, it, expect } from 'vitest';
import {
  calculateHPMultiplier,
  calculateArmorMultiplier,
  calculateScaledHealth,
  calculateScaledArmor,
  calculateDamageAfterArmor,
  calculateEffectiveArmor,
  calculateDistance,
  isInRange,
  calculateSlowMultiplier,
  calculateStackedSlowMultiplier,
  calculatePoisonDamage,
  calculateSplashDamage,
  calculateScore,
  calculateSellValue,
  calculateTowerDPS,
  lerp,
  clamp,
  calculateAngle,
  normalizeAngle,
} from '../utils/GameCalculations';
import { GAME_CONFIG } from '../data/GameConfig';

/**
 * Tests for GameCalculations utility functions
 * These are pure functions with real game logic - no mocks needed
 */

describe('GameCalculations', () => {
  describe('HP and Armor Scaling', () => {
    describe('calculateHPMultiplier', () => {
      it('should return 1.0 for wave 1', () => {
        expect(calculateHPMultiplier(1)).toBe(1);
      });

      it('should increase HP multiplier each wave', () => {
        const wave5 = calculateHPMultiplier(5);
        const wave10 = calculateHPMultiplier(10);
        const wave20 = calculateHPMultiplier(20);

        expect(wave10).toBeGreaterThan(wave5);
        expect(wave20).toBeGreaterThan(wave10);
      });

      it('should use WAVE_HP_SCALING from config', () => {
        const wave2 = calculateHPMultiplier(2);
        expect(wave2).toBeCloseTo(1 + GAME_CONFIG.WAVE_HP_SCALING, 5);
      });

      it('should cap at MAX_HP_MULTIPLIER', () => {
        const veryHighWave = calculateHPMultiplier(100);
        expect(veryHighWave).toBe(GAME_CONFIG.MAX_HP_MULTIPLIER);
      });

      it('should reach max multiplier by wave 35', () => {
        const wave35 = calculateHPMultiplier(35);
        expect(wave35).toBe(GAME_CONFIG.MAX_HP_MULTIPLIER);
      });
    });

    describe('calculateArmorMultiplier', () => {
      it('should return 1.0 for creeps without base armor', () => {
        expect(calculateArmorMultiplier(10, false)).toBe(1);
        expect(calculateArmorMultiplier(35, false)).toBe(1);
      });

      it('should return 1.0 for wave 1 with armor', () => {
        expect(calculateArmorMultiplier(1, true)).toBe(1);
      });

      it('should increase for later waves with armor', () => {
        const wave10 = calculateArmorMultiplier(10, true);
        expect(wave10).toBeGreaterThan(1);
      });

      it('should cap at MAX_ARMOR_MULTIPLIER', () => {
        const veryHighWave = calculateArmorMultiplier(100, true);
        expect(veryHighWave).toBe(GAME_CONFIG.MAX_ARMOR_MULTIPLIER);
      });
    });

    describe('calculateScaledHealth', () => {
      it('should return base health for wave 1', () => {
        expect(calculateScaledHealth(100, 1)).toBe(100);
      });

      it('should scale health based on wave', () => {
        const wave1Health = calculateScaledHealth(100, 1);
        const wave10Health = calculateScaledHealth(100, 10);
        expect(wave10Health).toBeGreaterThan(wave1Health);
      });

      it('should apply difficulty multiplier', () => {
        const normalHealth = calculateScaledHealth(100, 10, 1.0);
        const hardHealth = calculateScaledHealth(100, 10, 1.5);
        expect(hardHealth).toBeGreaterThan(normalHealth);
        expect(hardHealth).toBe(Math.floor(normalHealth * 1.5));
      });

      it('should floor the result', () => {
        const health = calculateScaledHealth(101, 2, 1.1);
        expect(Number.isInteger(health)).toBe(true);
      });
    });

    describe('calculateScaledArmor', () => {
      it('should return 0 for creeps without armor', () => {
        expect(calculateScaledArmor(0, 10)).toBe(0);
      });

      it('should return base armor for wave 1', () => {
        expect(calculateScaledArmor(10, 1)).toBe(10);
      });

      it('should scale armor for later waves', () => {
        const wave1Armor = calculateScaledArmor(10, 1);
        const wave20Armor = calculateScaledArmor(10, 20);
        expect(wave20Armor).toBeGreaterThan(wave1Armor);
      });
    });
  });

  describe('Damage Calculations', () => {
    describe('calculateDamageAfterArmor', () => {
      it('should return full damage when armor is 0', () => {
        expect(calculateDamageAfterArmor(100, 0)).toBe(100);
      });

      it('should return full damage when armor is negative', () => {
        expect(calculateDamageAfterArmor(100, -10)).toBe(100);
      });

      it('should reduce damage based on armor', () => {
        // Formula: damage * (100 / (100 + armor))
        // With 100 armor: 100 * (100/200) = 50
        const result = calculateDamageAfterArmor(100, 100);
        expect(result).toBe(50);
      });

      it('should never reduce damage below 1', () => {
        const result = calculateDamageAfterArmor(10, 10000);
        expect(result).toBeGreaterThanOrEqual(1);
      });

      it('should floor the result', () => {
        const result = calculateDamageAfterArmor(77, 33);
        expect(Number.isInteger(result)).toBe(true);
      });

      it('should calculate correctly for various armor values', () => {
        // 50 armor: 100 * (100/150) = 66.67 -> 66
        expect(calculateDamageAfterArmor(100, 50)).toBe(66);
        // 25 armor: 100 * (100/125) = 80
        expect(calculateDamageAfterArmor(100, 25)).toBe(80);
        // 200 armor: 100 * (100/300) = 33.33 -> 33
        expect(calculateDamageAfterArmor(100, 200)).toBe(33);
      });
    });

    describe('calculateEffectiveArmor', () => {
      it('should subtract armor penetration from base armor', () => {
        expect(calculateEffectiveArmor(100, 30)).toBe(70);
      });

      it('should not go below 0', () => {
        expect(calculateEffectiveArmor(50, 100)).toBe(0);
      });

      it('should return full armor when penetration is 0', () => {
        expect(calculateEffectiveArmor(100, 0)).toBe(100);
      });
    });

    describe('calculatePoisonDamage', () => {
      it('should multiply base damage by stacks', () => {
        expect(calculatePoisonDamage(10, 3, 10)).toBe(30);
      });

      it('should cap stacks at maxStacks', () => {
        expect(calculatePoisonDamage(10, 15, 10)).toBe(100);
      });

      it('should return 0 for 0 stacks', () => {
        expect(calculatePoisonDamage(10, 0, 10)).toBe(0);
      });
    });

    describe('calculateSplashDamage', () => {
      it('should return full damage at center', () => {
        expect(calculateSplashDamage(100, 0, 50)).toBe(100);
      });

      it('should return 0 outside splash radius', () => {
        expect(calculateSplashDamage(100, 60, 50)).toBe(0);
      });

      it('should reduce damage with distance', () => {
        const center = calculateSplashDamage(100, 0, 50);
        const halfway = calculateSplashDamage(100, 25, 50);
        const edge = calculateSplashDamage(100, 49, 50);

        expect(halfway).toBeLessThan(center);
        expect(edge).toBeLessThan(halfway);
      });

      it('should respect minimum damage percent at edge', () => {
        // At edge with 30% minimum, should get at least 30% damage
        const edgeDamage = calculateSplashDamage(100, 49.9, 50, 0.3);
        expect(edgeDamage).toBeGreaterThanOrEqual(30);
      });
    });
  });

  describe('Distance and Range', () => {
    describe('calculateDistance', () => {
      it('should return 0 for same point', () => {
        expect(calculateDistance(100, 100, 100, 100)).toBe(0);
      });

      it('should calculate horizontal distance', () => {
        expect(calculateDistance(0, 0, 100, 0)).toBe(100);
      });

      it('should calculate vertical distance', () => {
        expect(calculateDistance(0, 0, 0, 100)).toBe(100);
      });

      it('should calculate diagonal distance (Pythagorean)', () => {
        // 3-4-5 triangle
        expect(calculateDistance(0, 0, 3, 4)).toBe(5);
      });

      it('should work with negative coordinates', () => {
        expect(calculateDistance(-50, -50, 50, 50)).toBeCloseTo(141.42, 1);
      });
    });

    describe('isInRange', () => {
      it('should return true when target is within range', () => {
        expect(isInRange(0, 0, 50, 0, 100)).toBe(true);
      });

      it('should return true when target is exactly at range', () => {
        expect(isInRange(0, 0, 100, 0, 100)).toBe(true);
      });

      it('should return false when target is outside range', () => {
        expect(isInRange(0, 0, 150, 0, 100)).toBe(false);
      });

      it('should work with diagonal distances', () => {
        // Point at (70, 70) is ~99 units from origin
        expect(isInRange(0, 0, 70, 70, 100)).toBe(true);
        // Point at (80, 80) is ~113 units from origin
        expect(isInRange(0, 0, 80, 80, 100)).toBe(false);
      });
    });
  });

  describe('Status Effects', () => {
    describe('calculateSlowMultiplier', () => {
      it('should return 1.0 for 0% slow', () => {
        expect(calculateSlowMultiplier(0)).toBe(1);
      });

      it('should return 0.5 for 50% slow', () => {
        expect(calculateSlowMultiplier(50)).toBe(0.5);
      });

      it('should return 0 for 100% slow (freeze)', () => {
        expect(calculateSlowMultiplier(100)).toBe(0);
      });

      it('should clamp to 0-1 range', () => {
        expect(calculateSlowMultiplier(150)).toBe(0);
        expect(calculateSlowMultiplier(-50)).toBe(1);
      });
    });

    describe('calculateStackedSlowMultiplier', () => {
      it('should return 1.0 for empty array', () => {
        expect(calculateStackedSlowMultiplier([])).toBe(1);
      });

      it('should apply single slow normally', () => {
        expect(calculateStackedSlowMultiplier([50])).toBe(0.5);
      });

      it('should have diminishing returns for multiple slows', () => {
        // Two 50% slows should NOT stack to 100% (freeze)
        const stacked = calculateStackedSlowMultiplier([50, 50]);
        expect(stacked).toBeGreaterThan(0);
        expect(stacked).toBeLessThan(0.5);
      });

      it('should prioritize stronger slows', () => {
        // 30% then 50% should give same result as 50% then 30%
        const result1 = calculateStackedSlowMultiplier([30, 50]);
        const result2 = calculateStackedSlowMultiplier([50, 30]);
        expect(result1).toBeCloseTo(result2, 5);
      });
    });
  });

  describe('Score and Economy', () => {
    describe('calculateScore', () => {
      it('should give base score from waves reached', () => {
        const score = calculateScore(10, 0, 0, 600, false);
        expect(score).toBeGreaterThanOrEqual(1000); // 10 * 100
      });

      it('should add gold bonus', () => {
        const noGold = calculateScore(10, 0, 0, 600, false);
        const withGold = calculateScore(10, 1000, 0, 600, false);
        expect(withGold).toBeGreaterThan(noGold);
      });

      it('should add HP bonus', () => {
        const noHP = calculateScore(10, 0, 0, 600, false);
        const withHP = calculateScore(10, 0, 20, 600, false);
        expect(withHP).toBeGreaterThan(noHP);
      });

      it('should apply victory multiplier', () => {
        const loss = calculateScore(10, 500, 10, 600, false);
        const victory = calculateScore(10, 500, 10, 600, true);
        expect(victory).toBeGreaterThan(loss);
      });

      it('should give time bonus for fast victories', () => {
        const slowVictory = calculateScore(35, 1000, 20, 1200, true); // 20 minutes
        const fastVictory = calculateScore(35, 1000, 20, 600, true); // 10 minutes
        expect(fastVictory).toBeGreaterThan(slowVictory);
      });
    });

    describe('calculateSellValue', () => {
      it('should return percentage of build cost', () => {
        const value = calculateSellValue(100, [], 0.6);
        expect(value).toBe(60);
      });

      it('should include upgrade costs', () => {
        const noUpgrades = calculateSellValue(100, [], 0.6);
        const withUpgrades = calculateSellValue(100, [50, 100], 0.6);
        expect(withUpgrades).toBeGreaterThan(noUpgrades);
        expect(withUpgrades).toBe(Math.floor(250 * 0.6)); // (100 + 50 + 100) * 0.6
      });

      it('should floor the result', () => {
        const value = calculateSellValue(101, [51], 0.6);
        expect(Number.isInteger(value)).toBe(true);
      });
    });

    describe('calculateTowerDPS', () => {
      it('should calculate damage per second correctly', () => {
        // 100 damage every 500ms = 200 DPS
        expect(calculateTowerDPS(100, 500)).toBe(200);
      });

      it('should handle slow fire rates', () => {
        // 500 damage every 2000ms = 250 DPS
        expect(calculateTowerDPS(500, 2000)).toBe(250);
      });

      it('should handle fast fire rates', () => {
        // 25 damage every 100ms = 250 DPS
        expect(calculateTowerDPS(25, 100)).toBe(250);
      });
    });
  });

  describe('Math Utilities', () => {
    describe('lerp', () => {
      it('should return start when t=0', () => {
        expect(lerp(0, 100, 0)).toBe(0);
      });

      it('should return end when t=1', () => {
        expect(lerp(0, 100, 1)).toBe(100);
      });

      it('should return midpoint when t=0.5', () => {
        expect(lerp(0, 100, 0.5)).toBe(50);
      });

      it('should clamp t to 0-1 range', () => {
        expect(lerp(0, 100, -1)).toBe(0);
        expect(lerp(0, 100, 2)).toBe(100);
      });

      it('should work with negative values', () => {
        expect(lerp(-50, 50, 0.5)).toBe(0);
      });
    });

    describe('clamp', () => {
      it('should return value when within range', () => {
        expect(clamp(50, 0, 100)).toBe(50);
      });

      it('should return min when value is below', () => {
        expect(clamp(-10, 0, 100)).toBe(0);
      });

      it('should return max when value is above', () => {
        expect(clamp(150, 0, 100)).toBe(100);
      });

      it('should handle edge cases', () => {
        expect(clamp(0, 0, 100)).toBe(0);
        expect(clamp(100, 0, 100)).toBe(100);
      });
    });

    describe('calculateAngle', () => {
      it('should return 0 for point to the right', () => {
        expect(calculateAngle(0, 0, 100, 0)).toBe(0);
      });

      it('should return PI/2 for point below', () => {
        expect(calculateAngle(0, 0, 0, 100)).toBeCloseTo(Math.PI / 2, 5);
      });

      it('should return PI for point to the left', () => {
        expect(Math.abs(calculateAngle(0, 0, -100, 0))).toBeCloseTo(Math.PI, 5);
      });

      it('should return -PI/2 for point above', () => {
        expect(calculateAngle(0, 0, 0, -100)).toBeCloseTo(-Math.PI / 2, 5);
      });
    });

    describe('normalizeAngle', () => {
      it('should keep angles in 0-2PI range unchanged', () => {
        expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI, 5);
      });

      it('should normalize negative angles', () => {
        const normalized = normalizeAngle(-Math.PI / 2);
        expect(normalized).toBeGreaterThanOrEqual(0);
        expect(normalized).toBeLessThan(Math.PI * 2);
        expect(normalized).toBeCloseTo(Math.PI * 1.5, 5);
      });

      it('should normalize angles > 2PI', () => {
        const normalized = normalizeAngle(Math.PI * 3);
        expect(normalized).toBeCloseTo(Math.PI, 5);
      });
    });
  });
});
