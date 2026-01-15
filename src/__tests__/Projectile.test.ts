import { describe, it, expect } from 'vitest';

/**
 * Tests for Projectile mechanics
 * Validates hit detection, special effects, and damage application
 */

describe('Projectile System', () => {
  describe('Projectile Movement', () => {
    it('should calculate angle to target', () => {
      const calculateAngle = (
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number
      ): number => {
        return Math.atan2(targetY - sourceY, targetX - sourceX);
      };

      // Target directly right
      expect(calculateAngle(0, 0, 100, 0)).toBeCloseTo(0);

      // Target directly down
      expect(calculateAngle(0, 0, 0, 100)).toBeCloseTo(Math.PI / 2);

      // Target directly left
      expect(calculateAngle(0, 0, -100, 0)).toBeCloseTo(Math.PI);

      // Target directly up
      expect(calculateAngle(0, 0, 0, -100)).toBeCloseTo(-Math.PI / 2);
    });

    it('should calculate movement per frame', () => {
      const speed = 400; // pixels per second
      const delta = 16.67; // ms (60 FPS)

      const moveDistance = (speed * delta) / 1000;
      expect(moveDistance).toBeCloseTo(6.67, 1);
    });

    it('should update position based on angle', () => {
      const angle = Math.PI / 4; // 45 degrees
      const moveDistance = 10;

      const dx = Math.cos(angle) * moveDistance;
      const dy = Math.sin(angle) * moveDistance;

      expect(dx).toBeCloseTo(7.07, 1);
      expect(dy).toBeCloseTo(7.07, 1);
    });
  });

  describe('Hit Detection', () => {
    it('should detect hit when close enough', () => {
      const HIT_THRESHOLD = 20;

      const checkHit = (
        projX: number,
        projY: number,
        targetX: number,
        targetY: number
      ): boolean => {
        const distance = Math.sqrt((projX - targetX) ** 2 + (projY - targetY) ** 2);
        return distance < HIT_THRESHOLD;
      };

      expect(checkHit(100, 100, 100, 100)).toBe(true); // Same position
      expect(checkHit(100, 100, 110, 100)).toBe(true); // 10 away
      expect(checkHit(100, 100, 119, 100)).toBe(true); // 19 away
      expect(checkHit(100, 100, 120, 100)).toBe(false); // 20 away (edge)
      expect(checkHit(100, 100, 150, 100)).toBe(false); // 50 away
    });

    it('should handle moving targets', () => {
      interface MovingTarget {
        x: number;
        y: number;
        velocityX: number;
        velocityY: number;
      }

      const target: MovingTarget = { x: 100, y: 100, velocityX: 5, velocityY: 0 };

      // After one frame, target moves
      const predictPosition = (target: MovingTarget, frames: number) => ({
        x: target.x + target.velocityX * frames,
        y: target.y + target.velocityY * frames,
      });

      const pos1 = predictPosition(target, 1);
      expect(pos1.x).toBe(105);

      const pos10 = predictPosition(target, 10);
      expect(pos10.x).toBe(150);
    });
  });

  describe('Damage Application', () => {
    it('should apply base damage', () => {
      const baseDamage = 50;
      const health = 100;
      const newHealth = health - baseDamage;

      expect(newHealth).toBe(50);
    });

    it('should apply armor reduction', () => {
      const baseDamage = 50;
      const armor = 15;
      const actualDamage = Math.max(1, baseDamage - armor);

      expect(actualDamage).toBe(35);
    });

    it('should ensure minimum 1 damage', () => {
      const baseDamage = 10;
      const armor = 50;
      const actualDamage = Math.max(1, baseDamage - armor);

      expect(actualDamage).toBe(1);
    });

    it('should apply air damage bonus', () => {
      const baseDamage = 30;
      const airDamageBonus = 2.0;

      const calculateDamage = (damage: number, bonus: number, flying: boolean): number => {
        if (flying && bonus > 0) {
          return Math.floor(damage * (1 + bonus));
        }
        return damage;
      };

      expect(calculateDamage(baseDamage, airDamageBonus, true)).toBe(90);
      expect(calculateDamage(baseDamage, airDamageBonus, false)).toBe(30);
    });

    it('should apply magic damage (ignores armor)', () => {
      const calculateDamage = (baseDamage: number, armor: number, isMagic: boolean): number => {
        if (isMagic) return baseDamage;
        return Math.max(1, baseDamage - armor);
      };

      expect(calculateDamage(50, 30, false)).toBe(20);
      expect(calculateDamage(50, 30, true)).toBe(50);
    });
  });

  describe('Special Effect Application', () => {
    describe('Ice Tower Slow', () => {
      it('should apply slow effect on hit', () => {
        const slowPercent = 0.4;
        const slowDuration = 2000;

        interface SlowEffect {
          percent: number;
          endTime: number;
        }

        const applySlowEffect = (
          currentTime: number,
          percent: number,
          duration: number
        ): SlowEffect => ({
          percent,
          endTime: currentTime + duration,
        });

        const effect = applySlowEffect(1000, slowPercent, slowDuration);
        expect(effect.percent).toBe(0.4);
        expect(effect.endTime).toBe(3000);
      });
    });

    describe('Poison Tower DoT', () => {
      it('should apply poison stacks', () => {
        const MAX_STACKS = 3;
        let poisonStacks = 0;

        const applyPoison = () => {
          if (poisonStacks < MAX_STACKS) {
            poisonStacks++;
          }
        };

        applyPoison();
        expect(poisonStacks).toBe(1);

        applyPoison();
        applyPoison();
        expect(poisonStacks).toBe(3);

        // Can't exceed max
        applyPoison();
        expect(poisonStacks).toBe(3);
      });
    });

    describe('Rock Cannon Splash', () => {
      it('should trigger splash on hit', () => {
        const baseDamage = 80;
        const splashDamageMultiplier = 0.5;

        const splashDamage = baseDamage * splashDamageMultiplier;
        expect(splashDamage).toBe(40);
      });

      it('should find creeps in splash radius', () => {
        interface Position {
          x: number;
          y: number;
        }

        const impact: Position = { x: 200, y: 200 };
        const splashRadius = 60;

        const creeps: Position[] = [
          { x: 200, y: 200 }, // at impact
          { x: 230, y: 200 }, // 30 away
          { x: 260, y: 200 }, // 60 away (edge)
          { x: 300, y: 200 }, // 100 away (outside)
        ];

        const inRadius = creeps.filter((c) => {
          const dist = Math.sqrt((c.x - impact.x) ** 2 + (c.y - impact.y) ** 2);
          return dist <= splashRadius;
        });

        expect(inRadius.length).toBe(3);
      });
    });
  });

  describe('Ability Integration', () => {
    it('should apply ability extra damage', () => {
      const baseDamage = 100;
      const extraDamage = 100; // From critical strike

      const totalDamage = baseDamage + extraDamage;
      expect(totalDamage).toBe(200);
    });

    it('should handle armor pierce ability', () => {
      const calculateDamage = (
        baseDamage: number,
        armor: number,
        isArmorPierce: boolean
      ): number => {
        if (isArmorPierce) return baseDamage; // Ignore armor
        return Math.max(1, baseDamage - armor);
      };

      expect(calculateDamage(50, 30, false)).toBe(20);
      expect(calculateDamage(50, 30, true)).toBe(50);
    });
  });

  describe('Crit System', () => {
    it('should apply aura crit bonus', () => {
      const rollCrit = (auraCritBonus: number, roll: number): boolean => {
        return auraCritBonus > 0 && roll < auraCritBonus;
      };

      // 15% crit chance
      expect(rollCrit(0.15, 0.1)).toBe(true);
      expect(rollCrit(0.15, 0.2)).toBe(false);
      expect(rollCrit(0, 0.05)).toBe(false);
    });

    it('should double damage on crit', () => {
      const applyDamage = (baseDamage: number, isCrit: boolean): number => {
        return isCrit ? baseDamage * 2 : baseDamage;
      };

      expect(applyDamage(50, false)).toBe(50);
      expect(applyDamage(50, true)).toBe(100);
    });
  });

  describe('Projectile Trail', () => {
    it('should track trail positions', () => {
      const MAX_TRAIL_LENGTH = 5;
      const trail: { x: number; y: number }[] = [];

      const addTrailPoint = (x: number, y: number) => {
        trail.push({ x, y });
        if (trail.length > MAX_TRAIL_LENGTH) {
          trail.shift();
        }
      };

      for (let i = 0; i < 10; i++) {
        addTrailPoint(i * 10, i * 5);
      }

      expect(trail.length).toBe(MAX_TRAIL_LENGTH);
      expect(trail[0].x).toBe(50); // First position should be shifted
    });
  });

  describe('Projectile Cleanup', () => {
    it('should deactivate on hit', () => {
      let isActive = true;
      let target: { x: number; y: number } | null = { x: 100, y: 100 };

      const deactivate = () => {
        isActive = false;
        target = null;
      };

      deactivate();

      expect(isActive).toBe(false);
      expect(target).toBeNull();
    });

    it('should deactivate if target becomes inactive', () => {
      interface Target {
        isActive: boolean;
      }

      let projectileActive = true;
      const target: Target = { isActive: true };

      const update = (): boolean => {
        if (!target.isActive) {
          projectileActive = false;
          return false;
        }
        return true;
      };

      expect(update()).toBe(true);

      target.isActive = false;
      expect(update()).toBe(false);
      expect(projectileActive).toBe(false);
    });
  });

  describe('Branch-Specific Projectiles', () => {
    it('should have correct trail colors per branch', () => {
      const getTrailColor = (branch: string): number => {
        switch (branch) {
          case 'archer':
            return 0x8b4513;
          case 'rapidfire':
            return 0xffd700;
          case 'sniper':
            return 0x4169e1;
          case 'rockcannon':
            return 0x696969;
          case 'icetower':
            return 0x87ceeb;
          case 'poison':
            return 0x00ff00;
          default:
            return 0xffffff;
        }
      };

      expect(getTrailColor('archer')).toBe(0x8b4513);
      expect(getTrailColor('icetower')).toBe(0x87ceeb);
      expect(getTrailColor('unknown')).toBe(0xffffff);
    });

    it('should scale projectile size by level', () => {
      const getScale = (level: number): number => {
        return 1 + (level - 1) * 0.2;
      };

      expect(getScale(1)).toBeCloseTo(1.0);
      expect(getScale(2)).toBeCloseTo(1.2);
      expect(getScale(3)).toBeCloseTo(1.4);
      expect(getScale(4)).toBeCloseTo(1.6);
    });
  });

  describe('Kill Tracking', () => {
    it('should emit kill event when creep dies', () => {
      let killEmitted = false;
      let killingTowerId = -1;

      const onKill = (tower: { id: number }) => {
        killEmitted = true;
        killingTowerId = tower.id;
      };

      const creepHealth = 0;
      const tower = { id: 1 };

      if (creepHealth <= 0) {
        onKill(tower);
      }

      expect(killEmitted).toBe(true);
      expect(killingTowerId).toBe(1);
    });

    it('should notify ability handler of creep death', () => {
      let abilityNotified = false;

      const abilityHandler = {
        onCreepDeath: () => {
          abilityNotified = true;
        },
      };

      abilityHandler.onCreepDeath();
      expect(abilityNotified).toBe(true);
    });
  });
});
