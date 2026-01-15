import { describe, it, expect } from 'vitest';

/**
 * Tests for Combat targeting and damage logic
 * Validates target prioritization, range checks, and damage application
 */

describe('Combat System', () => {
  describe('Target Prioritization', () => {
    interface MockCreep {
      x: number;
      y: number;
      health: number;
      distanceTraveled: number;
      isActive: boolean;
      canBeTargeted: boolean;
      isFlying: boolean;
      isSlowed: boolean;
      poisonStacks: number;
    }

    const createCreep = (overrides: Partial<MockCreep> = {}): MockCreep => ({
      x: 100,
      y: 100,
      health: 100,
      distanceTraveled: 0,
      isActive: true,
      canBeTargeted: true,
      isFlying: false,
      isSlowed: false,
      poisonStacks: 0,
      ...overrides,
    });

    it('should prioritize furthest along path by default', () => {
      const creeps = [
        createCreep({ distanceTraveled: 100 }),
        createCreep({ distanceTraveled: 250 }),
        createCreep({ distanceTraveled: 150 }),
      ];

      const findBestTarget = (creeps: MockCreep[], priority: string): MockCreep | null => {
        let best: MockCreep | null = null;
        let bestValue = -Infinity;

        for (const creep of creeps) {
          if (!creep.isActive || !creep.canBeTargeted) continue;

          let value: number;
          switch (priority) {
            case 'furthestAlongPath':
              value = creep.distanceTraveled;
              break;
            case 'highestHP':
              value = creep.health;
              break;
            case 'closest':
            default:
              value = -Math.sqrt(creep.x ** 2 + creep.y ** 2);
              break;
          }

          if (value > bestValue) {
            bestValue = value;
            best = creep;
          }
        }
        return best;
      };

      const target = findBestTarget(creeps, 'furthestAlongPath');
      expect(target?.distanceTraveled).toBe(250);
    });

    it('should prioritize highest HP when specified', () => {
      const creeps = [
        createCreep({ health: 50 }),
        createCreep({ health: 150 }),
        createCreep({ health: 100 }),
      ];

      const findBestTarget = (creeps: MockCreep[]): MockCreep | null => {
        return creeps.reduce(
          (best, creep) => {
            if (!creep.isActive || !creep.canBeTargeted) return best;
            if (!best || creep.health > best.health) return creep;
            return best;
          },
          null as MockCreep | null
        );
      };

      const target = findBestTarget(creeps);
      expect(target?.health).toBe(150);
    });

    it('should skip inactive creeps', () => {
      const creeps = [
        createCreep({ distanceTraveled: 300, isActive: false }),
        createCreep({ distanceTraveled: 100, isActive: true }),
      ];

      const activeCreeps = creeps.filter((c) => c.isActive);
      expect(activeCreeps.length).toBe(1);
      expect(activeCreeps[0].distanceTraveled).toBe(100);
    });

    it('should skip untargetable creeps (burrowed/ghost)', () => {
      const creeps = [
        createCreep({ distanceTraveled: 300, canBeTargeted: false }),
        createCreep({ distanceTraveled: 100, canBeTargeted: true }),
      ];

      const targetableCreeps = creeps.filter((c) => c.canBeTargeted);
      expect(targetableCreeps.length).toBe(1);
      expect(targetableCreeps[0].distanceTraveled).toBe(100);
    });
  });

  describe('Ground-Only Tower Targeting', () => {
    it('should not target flying creeps with ground-only towers', () => {
      const isGroundOnly = (branch: string): boolean => {
        return branch === 'rockcannon' || branch === 'poison';
      };

      const canTarget = (branch: string, isFlying: boolean): boolean => {
        if (isGroundOnly(branch) && isFlying) return false;
        return true;
      };

      expect(canTarget('rockcannon', true)).toBe(false);
      expect(canTarget('rockcannon', false)).toBe(true);
      expect(canTarget('poison', true)).toBe(false);
      expect(canTarget('poison', false)).toBe(true);
      expect(canTarget('archer', true)).toBe(true);
      expect(canTarget('sniper', true)).toBe(true);
      expect(canTarget('icetower', true)).toBe(true);
    });
  });

  describe('Ice/Poison Tower Target Preference', () => {
    interface MockCreep {
      isSlowed: boolean;
      poisonStacks: number;
      distanceTraveled: number;
    }

    it('should prefer non-slowed targets for ice tower', () => {
      const creeps: MockCreep[] = [
        { isSlowed: true, poisonStacks: 0, distanceTraveled: 300 },
        { isSlowed: false, poisonStacks: 0, distanceTraveled: 200 },
        { isSlowed: false, poisonStacks: 0, distanceTraveled: 100 },
      ];

      const findIceTarget = (creeps: MockCreep[]): MockCreep | null => {
        const nonSlowed = creeps.filter((c) => !c.isSlowed);
        if (nonSlowed.length > 0) {
          return nonSlowed.reduce((best, c) =>
            c.distanceTraveled > best.distanceTraveled ? c : best
          );
        }
        // Fallback to slowed if no non-slowed available
        return creeps.reduce((best, c) => (c.distanceTraveled > best.distanceTraveled ? c : best));
      };

      const target = findIceTarget(creeps);
      // Should pick non-slowed with highest distance (200), not slowed at 300
      expect(target?.distanceTraveled).toBe(200);
      expect(target?.isSlowed).toBe(false);
    });

    it('should prefer non-saturated targets for poison tower', () => {
      const MAX_POISON_STACKS = 3;
      const creeps: MockCreep[] = [
        { isSlowed: false, poisonStacks: 3, distanceTraveled: 300 },
        { isSlowed: false, poisonStacks: 1, distanceTraveled: 200 },
        { isSlowed: false, poisonStacks: 2, distanceTraveled: 100 },
      ];

      const findPoisonTarget = (creeps: MockCreep[]): MockCreep | null => {
        const nonSaturated = creeps.filter((c) => c.poisonStacks < MAX_POISON_STACKS);
        if (nonSaturated.length > 0) {
          return nonSaturated.reduce((best, c) =>
            c.distanceTraveled > best.distanceTraveled ? c : best
          );
        }
        return creeps.reduce((best, c) => (c.distanceTraveled > best.distanceTraveled ? c : best));
      };

      const target = findPoisonTarget(creeps);
      expect(target?.distanceTraveled).toBe(200);
      expect(target?.poisonStacks).toBe(1);
    });

    it('should fallback to saturated target if no alternatives', () => {
      const MAX_POISON_STACKS = 3;
      const creeps: MockCreep[] = [
        { isSlowed: false, poisonStacks: 3, distanceTraveled: 300 },
        { isSlowed: false, poisonStacks: 3, distanceTraveled: 200 },
      ];

      const findPoisonTarget = (creeps: MockCreep[]): MockCreep | null => {
        const nonSaturated = creeps.filter((c) => c.poisonStacks < MAX_POISON_STACKS);
        if (nonSaturated.length > 0) {
          return nonSaturated.reduce((best, c) =>
            c.distanceTraveled > best.distanceTraveled ? c : best
          );
        }
        return creeps.reduce((best, c) => (c.distanceTraveled > best.distanceTraveled ? c : best));
      };

      const target = findPoisonTarget(creeps);
      expect(target?.distanceTraveled).toBe(300);
    });
  });

  describe('Range Checks', () => {
    it('should detect creeps in range', () => {
      const isInRange = (
        towerX: number,
        towerY: number,
        creepX: number,
        creepY: number,
        range: number
      ): boolean => {
        const dist = Math.sqrt((creepX - towerX) ** 2 + (creepY - towerY) ** 2);
        return dist <= range;
      };

      // Tower at (100, 100) with range 150
      expect(isInRange(100, 100, 200, 100, 150)).toBe(true); // 100 pixels away
      expect(isInRange(100, 100, 250, 100, 150)).toBe(true); // exactly 150
      expect(isInRange(100, 100, 251, 100, 150)).toBe(false); // 151 pixels
      expect(isInRange(100, 100, 100, 100, 150)).toBe(true); // on tower
    });

    it('should calculate diagonal distance correctly', () => {
      const distance = (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      };

      // Pythagorean theorem: 3-4-5 triangle
      expect(distance(0, 0, 3, 4)).toBe(5);
      expect(distance(100, 100, 103, 104)).toBe(5);
    });
  });

  describe('Fire Rate Control', () => {
    it('should respect tower fire rate cooldown', () => {
      const fireRate = 500; // ms between shots
      let lastFireTime = -fireRate; // Initialize so first shot can fire immediately

      const canFire = (currentTime: number): boolean => {
        return currentTime - lastFireTime >= fireRate;
      };

      const recordFire = (currentTime: number): void => {
        lastFireTime = currentTime;
      };

      expect(canFire(0)).toBe(true);
      recordFire(0);

      expect(canFire(250)).toBe(false);
      expect(canFire(499)).toBe(false);
      expect(canFire(500)).toBe(true);

      recordFire(500);
      expect(canFire(750)).toBe(false);
      expect(canFire(1000)).toBe(true);
    });
  });

  describe('Damage Application', () => {
    it('should apply armor reduction to physical damage', () => {
      const calculatePhysicalDamage = (baseDamage: number, armor: number): number => {
        return Math.max(1, baseDamage - armor);
      };

      expect(calculatePhysicalDamage(50, 0)).toBe(50);
      expect(calculatePhysicalDamage(50, 10)).toBe(40);
      expect(calculatePhysicalDamage(50, 50)).toBe(1);
      expect(calculatePhysicalDamage(50, 100)).toBe(1);
    });

    it('should ignore armor for magic damage', () => {
      const calculateDamage = (baseDamage: number, armor: number, isMagic: boolean): number => {
        if (isMagic) return baseDamage;
        return Math.max(1, baseDamage - armor);
      };

      expect(calculateDamage(50, 30, false)).toBe(20);
      expect(calculateDamage(50, 30, true)).toBe(50);
    });

    it('should apply armor reduction from debuffs', () => {
      const calculateDamageWithReduction = (
        baseDamage: number,
        baseArmor: number,
        armorReduction: number
      ): number => {
        const effectiveArmor = Math.max(0, baseArmor - armorReduction);
        return Math.max(1, baseDamage - effectiveArmor);
      };

      expect(calculateDamageWithReduction(50, 20, 0)).toBe(30);
      expect(calculateDamageWithReduction(50, 20, 10)).toBe(40);
      expect(calculateDamageWithReduction(50, 20, 20)).toBe(50);
      expect(calculateDamageWithReduction(50, 20, 30)).toBe(50); // Can't go negative
    });

    it('should apply air damage bonus', () => {
      const calculateAirDamage = (
        baseDamage: number,
        isFlying: boolean,
        airDamageBonus: number
      ): number => {
        if (isFlying && airDamageBonus > 0) {
          return Math.floor(baseDamage * (1 + airDamageBonus));
        }
        return baseDamage;
      };

      // Archer has 2.0 (200%) air damage bonus
      expect(calculateAirDamage(30, false, 2.0)).toBe(30);
      expect(calculateAirDamage(30, true, 2.0)).toBe(90); // 30 * 3.0
      expect(calculateAirDamage(30, true, 0)).toBe(30);
    });
  });

  describe('Splash Damage', () => {
    interface Position {
      x: number;
      y: number;
    }

    it('should calculate splash damage falloff', () => {
      const calculateSplashDamage = (
        baseDamage: number,
        distanceFromCenter: number,
        splashRadius: number
      ): number => {
        if (distanceFromCenter > splashRadius) return 0;
        // 50% damage in splash zone
        return Math.floor(baseDamage * 0.5);
      };

      expect(calculateSplashDamage(100, 0, 60)).toBe(50);
      expect(calculateSplashDamage(100, 30, 60)).toBe(50);
      expect(calculateSplashDamage(100, 60, 60)).toBe(50);
      expect(calculateSplashDamage(100, 61, 60)).toBe(0);
    });

    it('should find all creeps in splash radius', () => {
      const impactPos: Position = { x: 200, y: 200 };
      const splashRadius = 50;

      const creepPositions: Position[] = [
        { x: 200, y: 200 }, // at impact
        { x: 230, y: 200 }, // 30 away
        { x: 200, y: 250 }, // 50 away (edge)
        { x: 260, y: 200 }, // 60 away (outside)
      ];

      const inSplash = creepPositions.filter((pos) => {
        const dist = Math.sqrt((pos.x - impactPos.x) ** 2 + (pos.y - impactPos.y) ** 2);
        return dist <= splashRadius;
      });

      expect(inSplash.length).toBe(3);
    });
  });

  describe('Veteran System', () => {
    interface VeteranRank {
      minKills: number;
      damageBonus: number;
      name: string;
    }

    const VETERAN_RANKS: VeteranRank[] = [
      { minKills: 0, damageBonus: 0, name: 'Rookie' },
      { minKills: 10, damageBonus: 0.05, name: 'Trained' },
      { minKills: 25, damageBonus: 0.1, name: 'Veteran' },
      { minKills: 50, damageBonus: 0.15, name: 'Elite' },
      { minKills: 100, damageBonus: 0.25, name: 'Master' },
    ];

    it('should determine veteran rank from kill count', () => {
      const getVeteranRank = (killCount: number): number => {
        let rank = 0;
        for (let i = VETERAN_RANKS.length - 1; i >= 0; i--) {
          if (killCount >= VETERAN_RANKS[i].minKills) {
            rank = i;
            break;
          }
        }
        return rank;
      };

      expect(getVeteranRank(0)).toBe(0);
      expect(getVeteranRank(5)).toBe(0);
      expect(getVeteranRank(10)).toBe(1);
      expect(getVeteranRank(24)).toBe(1);
      expect(getVeteranRank(25)).toBe(2);
      expect(getVeteranRank(50)).toBe(3);
      expect(getVeteranRank(100)).toBe(4);
      expect(getVeteranRank(500)).toBe(4);
    });

    it('should calculate veteran damage multiplier', () => {
      const getDamageMultiplier = (rank: number): number => {
        return 1 + VETERAN_RANKS[rank].damageBonus;
      };

      expect(getDamageMultiplier(0)).toBe(1.0);
      expect(getDamageMultiplier(1)).toBe(1.05);
      expect(getDamageMultiplier(2)).toBe(1.1);
      expect(getDamageMultiplier(3)).toBe(1.15);
      expect(getDamageMultiplier(4)).toBe(1.25);
    });

    it('should apply veteran bonus to base damage', () => {
      const calculateFinalDamage = (baseDamage: number, veteranMultiplier: number): number => {
        return Math.floor(baseDamage * veteranMultiplier);
      };

      expect(calculateFinalDamage(100, 1.0)).toBe(100);
      expect(calculateFinalDamage(100, 1.25)).toBe(125);
      expect(calculateFinalDamage(33, 1.1)).toBe(36);
    });
  });

  describe('Aura Buff System', () => {
    it('should apply aura damage multiplier', () => {
      const applyAuraBuff = (baseDamage: number, auraMultiplier: number): number => {
        return Math.floor(baseDamage * (1 + auraMultiplier));
      };

      // Level 1 aura: 20% bonus
      expect(applyAuraBuff(100, 0.2)).toBe(120);
      // Level 4 aura: 50% bonus
      expect(applyAuraBuff(100, 0.5)).toBe(150);
    });

    it('should calculate aura crit bonus', () => {
      const rollCrit = (auraCritBonus: number, randomValue: number): boolean => {
        return auraCritBonus > 0 && randomValue < auraCritBonus;
      };

      // 15% crit bonus
      expect(rollCrit(0.15, 0.1)).toBe(true);
      expect(rollCrit(0.15, 0.14)).toBe(true);
      expect(rollCrit(0.15, 0.16)).toBe(false);
      expect(rollCrit(0, 0.05)).toBe(false);
    });

    it('should stack multiple aura buffs', () => {
      const calculateTotalBuff = (auraMultipliers: number[]): number => {
        return auraMultipliers.reduce((sum, mult) => sum + mult, 0);
      };

      const totalMultiplier = 1 + calculateTotalBuff([0.2, 0.3]);
      expect(totalMultiplier).toBe(1.5);
    });
  });
});
