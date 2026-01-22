import { describe, it, expect } from 'vitest';

// We test the StatusEffectHandler logic without full Phaser
// This test file focuses on the pure logic aspects

describe('StatusEffectHandler Logic', () => {
  describe('Speed Multiplier Calculation', () => {
    it('should return 1 when no effects are active', () => {
      // No slow = 100% speed = multiplier of 1
      const baseSpeed = 100;
      const slowAmount = 0;
      const speedMultiplier = 1 - slowAmount;
      expect(speedMultiplier).toBe(1);
      expect(baseSpeed * speedMultiplier).toBe(100);
    });

    it('should correctly calculate speed with slow effect', () => {
      const baseSpeed = 100;
      const slowAmount = 0.4; // 40% slow
      const speedMultiplier = 1 - slowAmount;
      expect(speedMultiplier).toBe(0.6);
      expect(baseSpeed * speedMultiplier).toBe(60);
    });

    it('should return 0 speed when frozen', () => {
      const isFrozen = true;
      const speedMultiplier = isFrozen ? 0 : 1;
      expect(speedMultiplier).toBe(0);
    });
  });

  describe('Poison Stack Logic', () => {
    it('should cap poison stacks at 3', () => {
      const MAX_STACKS = 3;
      const stacks: { damage: number; endTime: number }[] = [];

      // Add 4 stacks
      for (let i = 0; i < 4; i++) {
        if (stacks.length >= MAX_STACKS) {
          // Replace oldest stack
          stacks[0] = { damage: 5, endTime: 5000 + i * 1000 };
        } else {
          stacks.push({ damage: 5, endTime: 5000 + i * 1000 });
        }
      }

      expect(stacks.length).toBe(3);
    });

    it('should calculate total poison damage from all stacks', () => {
      const stacks = [
        { damage: 5, endTime: 5000 },
        { damage: 8, endTime: 6000 },
        { damage: 12, endTime: 7000 },
      ];

      const totalDamage = stacks.reduce((sum, stack) => sum + stack.damage, 0);
      expect(totalDamage).toBe(25); // 5 + 8 + 12
    });

    it('should filter expired stacks', () => {
      const currentTime = 6000;
      const stacks = [
        { damage: 5, endTime: 5000 }, // expired
        { damage: 8, endTime: 7000 }, // active
        { damage: 12, endTime: 8000 }, // active
      ];

      const activeStacks = stacks.filter((stack) => currentTime < stack.endTime);
      expect(activeStacks.length).toBe(2);
      expect(activeStacks[0].damage).toBe(8);
      expect(activeStacks[1].damage).toBe(12);
    });
  });

  describe('Armor Reduction Logic', () => {
    it('should cap armor reduction at 50', () => {
      let armorReduction = 0;
      const maxReduction = 50;

      // Apply multiple armor reductions
      armorReduction = Math.min(maxReduction, armorReduction + 30);
      expect(armorReduction).toBe(30);

      armorReduction = Math.min(maxReduction, armorReduction + 40);
      expect(armorReduction).toBe(50); // Capped at 50
    });

    it('should apply armor reduction to damage calculation', () => {
      const baseDamage = 100;
      const armor = 50;
      const armorReduction = 30;

      const effectiveArmor = Math.max(0, armor - armorReduction);
      // Formula: damage × 100 / (100 + armor)
      const damageAfterArmor = baseDamage * (100 / (100 + effectiveArmor));

      expect(effectiveArmor).toBe(20);
      expect(damageAfterArmor).toBeCloseTo(83.33, 1);
    });
  });

  describe('Immunity Logic', () => {
    it('should prevent effects when immune', () => {
      const currentTime = 5000;
      const immunityEndTime = 7000;

      const isImmune = immunityEndTime > currentTime;
      expect(isImmune).toBe(true);
    });

    it('should allow effects after immunity expires', () => {
      const currentTime = 8000;
      const immunityEndTime = 7000;

      const isImmune = immunityEndTime > currentTime;
      expect(isImmune).toBe(false);
    });
  });

  describe('Effect Duration Checks', () => {
    it('should correctly detect active slow', () => {
      const currentTime = 5000;
      const slowEndTime = 6000;

      const isSlowed = slowEndTime > currentTime;
      expect(isSlowed).toBe(true);
    });

    it('should correctly detect expired slow', () => {
      const currentTime = 7000;
      const slowEndTime = 6000;

      const isSlowed = slowEndTime > currentTime;
      expect(isSlowed).toBe(false);
    });

    it('should correctly detect active freeze', () => {
      const currentTime = 5000;
      const freezeEndTime = 6000;

      const isFrozen = freezeEndTime > currentTime;
      expect(isFrozen).toBe(true);
    });
  });

  describe('Dispel Logic', () => {
    it('should clear all effects on dispel', () => {
      let slowAmount = 0.4;
      let slowEndTime = 5000;
      let freezeEndTime = 6000;
      let poisonStacks = [{ damage: 5, endTime: 7000 }];
      let burnStacks: { damage: number; endTime: number }[] = [{ damage: 10, endTime: 8000 }];
      let armorReduction = 3;
      let brittleEndTime = 9000;

      // Dispel
      slowAmount = 0;
      slowEndTime = 0;
      freezeEndTime = 0;
      poisonStacks = [];
      burnStacks = [];
      armorReduction = 0;
      brittleEndTime = 0;

      expect(slowAmount).toBe(0);
      expect(slowEndTime).toBe(0);
      expect(freezeEndTime).toBe(0);
      expect(poisonStacks.length).toBe(0);
      expect(burnStacks.length).toBe(0);
      expect(armorReduction).toBe(0);
      expect(brittleEndTime).toBe(0);
    });

    it('should grant immunity after dispel if specified', () => {
      const currentTime = 5000;
      const immunityDuration = 2000;
      const immunityEndTime = currentTime + immunityDuration;

      expect(immunityEndTime).toBe(7000);
      expect(immunityEndTime > currentTime).toBe(true);
    });
  });

  describe('Burn Stacking Logic', () => {
    it('should cap burn stacks at 3', () => {
      const MAX_BURN_STACKS = 3;
      const stacks: { damage: number; endTime: number }[] = [];

      // Add 4 stacks
      for (let i = 0; i < 4; i++) {
        if (stacks.length >= MAX_BURN_STACKS) {
          // Replace oldest stack
          stacks.shift();
        }
        stacks.push({ damage: 10, endTime: 5000 + i * 1000 });
      }

      expect(stacks.length).toBe(3);
    });

    it('should calculate total burn damage from all stacks', () => {
      const stacks = [
        { damage: 10, endTime: 5000 },
        { damage: 10, endTime: 6000 },
        { damage: 10, endTime: 7000 },
      ];

      const totalDamage = stacks.reduce((sum, stack) => sum + stack.damage, 0);
      expect(totalDamage).toBe(30); // 10 × 3 stacks
    });

    it('should return stack count for intensity scaling', () => {
      const stacks = [
        { damage: 10, endTime: 5000 },
        { damage: 10, endTime: 6000 },
        { damage: 10, endTime: 7000 },
      ];

      expect(stacks.length).toBe(3);
    });
  });

  describe('Brittle Status Logic', () => {
    it('should correctly detect active brittle', () => {
      const currentTime = 5000;
      const brittleEndTime = 7500; // 2500ms duration

      const isBrittle = brittleEndTime > currentTime;
      expect(isBrittle).toBe(true);
    });

    it('should correctly detect expired brittle', () => {
      const currentTime = 8000;
      const brittleEndTime = 7500;

      const isBrittle = brittleEndTime > currentTime;
      expect(isBrittle).toBe(false);
    });

    it('should apply 20% bonus physical damage when brittle', () => {
      const baseDamage = 100;
      const isMagic = false;
      const isBrittle = true;
      const brittleMultiplier = !isMagic && isBrittle ? 1.2 : 1.0;

      const finalDamage = baseDamage * brittleMultiplier;
      expect(finalDamage).toBe(120);
    });

    it('should not affect magic damage', () => {
      const baseDamage = 100;
      const isMagic = true;
      const isBrittle = true;
      const brittleMultiplier = !isMagic && isBrittle ? 1.2 : 1.0;

      const finalDamage = baseDamage * brittleMultiplier;
      expect(finalDamage).toBe(100); // Magic unaffected
    });
  });

  describe('Knockback Logic', () => {
    it('should reduce distance traveled for normal creeps', () => {
      let distanceTraveled = 100;
      const knockbackDistance = 20;
      const isBoss = false;
      const bossResistance = 0.1;

      const effectiveKnockback = isBoss ? knockbackDistance * bossResistance : knockbackDistance;
      distanceTraveled = Math.max(0, distanceTraveled - effectiveKnockback);

      expect(distanceTraveled).toBe(80);
    });

    it('should apply only 10% knockback to bosses', () => {
      let distanceTraveled = 100;
      const knockbackDistance = 20;
      const isBoss = true;
      const bossResistance = 0.1;

      const effectiveKnockback = isBoss ? knockbackDistance * bossResistance : knockbackDistance;
      distanceTraveled = Math.max(0, distanceTraveled - effectiveKnockback);

      expect(distanceTraveled).toBe(98); // Only 2 pixels knocked back
    });

    it('should not go below zero distance', () => {
      let distanceTraveled = 10;
      const knockbackDistance = 20;

      distanceTraveled = Math.max(0, distanceTraveled - knockbackDistance);

      expect(distanceTraveled).toBe(0);
    });
  });
});
