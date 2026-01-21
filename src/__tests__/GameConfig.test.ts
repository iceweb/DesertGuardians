import { describe, it, expect } from 'vitest';
import { GAME_CONFIG } from '../data/GameConfig';

describe('GameConfig', () => {
  describe('Starting Values', () => {
    it('should have valid starting gold', () => {
      expect(GAME_CONFIG.STARTING_GOLD).toBeGreaterThan(0);
      expect(GAME_CONFIG.STARTING_GOLD).toBe(250);
    });

    it('should have valid max castle HP', () => {
      expect(GAME_CONFIG.MAX_CASTLE_HP).toBeGreaterThan(0);
      expect(GAME_CONFIG.MAX_CASTLE_HP).toBe(25);
    });
  });

  describe('Wave Bonuses', () => {
    it('should have valid wave bonus points', () => {
      expect(GAME_CONFIG.WAVE_BONUS_POINTS).toBeGreaterThan(0);
    });

    it('should have valid gold bonus multiplier', () => {
      expect(GAME_CONFIG.GOLD_BONUS_MULTIPLIER).toBeGreaterThan(0);
      expect(GAME_CONFIG.GOLD_BONUS_MULTIPLIER).toBeLessThanOrEqual(1);
    });

    it('should have valid HP bonus points', () => {
      expect(GAME_CONFIG.HP_BONUS_POINTS).toBeGreaterThan(0);
    });

    it('should have valid wave gold bonus configuration', () => {
      expect(GAME_CONFIG.WAVE_GOLD_BONUS_BASE).toBeGreaterThan(0);
      expect(GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT).toBeGreaterThan(0);
      expect(GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('Wave Timing', () => {
    it('should have valid wave countdown', () => {
      expect(GAME_CONFIG.WAVE_COUNTDOWN_SECONDS).toBeGreaterThan(0);
    });

    it('should have valid wave complete delay', () => {
      expect(GAME_CONFIG.WAVE_COMPLETE_DELAY).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Wave Scaling', () => {
    it('should have valid HP scaling factor', () => {
      expect(GAME_CONFIG.WAVE_HP_SCALING).toBeGreaterThan(0);
      expect(GAME_CONFIG.WAVE_HP_SCALING).toBeLessThan(1);
    });

    it('should have valid max HP multiplier', () => {
      expect(GAME_CONFIG.MAX_HP_MULTIPLIER).toBeGreaterThan(1);
    });

    it('should have valid armor scaling factor', () => {
      expect(GAME_CONFIG.WAVE_ARMOR_SCALING).toBeGreaterThan(0);
      expect(GAME_CONFIG.WAVE_ARMOR_SCALING).toBeLessThan(GAME_CONFIG.WAVE_HP_SCALING);
    });

    it('should have valid max armor multiplier', () => {
      expect(GAME_CONFIG.MAX_ARMOR_MULTIPLIER).toBeGreaterThan(1);
    });

    it('should calculate HP multiplier correctly', () => {
      const calculateHPMultiplier = (waveNumber: number): number => {
        return Math.min(
          GAME_CONFIG.MAX_HP_MULTIPLIER,
          1 + (waveNumber - 1) * GAME_CONFIG.WAVE_HP_SCALING
        );
      };

      expect(calculateHPMultiplier(1)).toBe(1);
      expect(calculateHPMultiplier(10)).toBeCloseTo(1.72);
      expect(calculateHPMultiplier(35)).toBe(GAME_CONFIG.MAX_HP_MULTIPLIER);
    });

    it('should calculate armor multiplier correctly', () => {
      const calculateArmorMultiplier = (waveNumber: number): number => {
        return Math.min(
          GAME_CONFIG.MAX_ARMOR_MULTIPLIER,
          1 + (waveNumber - 1) * GAME_CONFIG.WAVE_ARMOR_SCALING
        );
      };

      expect(calculateArmorMultiplier(1)).toBe(1);
      expect(calculateArmorMultiplier(10)).toBeCloseTo(1.36);
    });
  });

  describe('Game Speed Settings', () => {
    it('should have valid speed multipliers', () => {
      expect(GAME_CONFIG.NORMAL_SPEED).toBeGreaterThan(0);
      expect(GAME_CONFIG.FAST_SPEED).toBeGreaterThan(GAME_CONFIG.NORMAL_SPEED);
      expect(GAME_CONFIG.TURBO_SPEED).toBeGreaterThan(GAME_CONFIG.FAST_SPEED);
    });

    it('should scale intervals correctly with speed', () => {
      const baseInterval = 1000;

      const normalInterval = baseInterval / GAME_CONFIG.NORMAL_SPEED;
      const fastInterval = baseInterval / GAME_CONFIG.FAST_SPEED;
      const turboInterval = baseInterval / GAME_CONFIG.TURBO_SPEED;

      expect(fastInterval).toBeLessThan(normalInterval);
      expect(turboInterval).toBeLessThan(fastInterval);
    });
  });

  describe('Tower Placement', () => {
    it('should have valid tower path buffer', () => {
      expect(GAME_CONFIG.TOWER_PATH_BUFFER).toBeGreaterThan(0);
    });

    it('should have valid tower radius', () => {
      expect(GAME_CONFIG.TOWER_RADIUS).toBeGreaterThan(0);
    });

    it('should have valid tower spacing', () => {
      expect(GAME_CONFIG.TOWER_SPACING).toBeGreaterThan(0);
    });

    it('should have archer build cost', () => {
      expect(GAME_CONFIG.ARCHER_BUILD_COST).toBeGreaterThan(0);
      expect(GAME_CONFIG.ARCHER_BUILD_COST).toBe(50);
    });
  });

  describe('Projectile Settings', () => {
    it('should have valid default projectile offset', () => {
      expect(GAME_CONFIG.DEFAULT_PROJECTILE_OFFSET).toBeDefined();
      expect(typeof GAME_CONFIG.DEFAULT_PROJECTILE_OFFSET.x).toBe('number');
      expect(typeof GAME_CONFIG.DEFAULT_PROJECTILE_OFFSET.y).toBe('number');
    });
  });

  describe('Creep Ability Timings', () => {
    describe('Jump Mechanics', () => {
      it('should have valid jump cooldown', () => {
        expect(GAME_CONFIG.JUMP_COOLDOWN).toBeGreaterThan(0);
      });

      it('should have valid jump distance', () => {
        expect(GAME_CONFIG.JUMP_DISTANCE).toBeGreaterThan(0);
      });

      it('should have valid jump warning duration', () => {
        expect(GAME_CONFIG.JUMP_WARNING_DURATION).toBeGreaterThan(0);
        expect(GAME_CONFIG.JUMP_WARNING_DURATION).toBeLessThan(GAME_CONFIG.JUMP_COOLDOWN);
      });
    });

    describe('Digger Mechanics', () => {
      it('should have valid digger walk duration', () => {
        expect(GAME_CONFIG.DIGGER_WALK_DURATION).toBeGreaterThan(0);
      });

      it('should have valid digger stop duration', () => {
        expect(GAME_CONFIG.DIGGER_STOP_DURATION).toBeGreaterThan(0);
        expect(GAME_CONFIG.DIGGER_STOP_DURATION).toBeLessThan(GAME_CONFIG.DIGGER_WALK_DURATION);
      });

      it('should have valid burrow duration', () => {
        expect(GAME_CONFIG.BURROW_DURATION).toBeGreaterThan(0);
      });

      it('should have valid digger resurface duration', () => {
        expect(GAME_CONFIG.DIGGER_RESURFACE_DURATION).toBeGreaterThan(0);
      });

      it('should have valid surface duration', () => {
        expect(GAME_CONFIG.SURFACE_DURATION).toBeGreaterThan(0);
      });

      it('should have valid digger tunnel distance', () => {
        expect(GAME_CONFIG.DIGGER_TUNNEL_DISTANCE).toBeGreaterThan(0);
      });

      it('should calculate digger cycle duration', () => {
        const cycleDuration =
          GAME_CONFIG.DIGGER_WALK_DURATION +
          GAME_CONFIG.DIGGER_STOP_DURATION +
          GAME_CONFIG.BURROW_DURATION +
          GAME_CONFIG.DIGGER_RESURFACE_DURATION;

        expect(cycleDuration).toBeGreaterThan(0);
      });
    });

    describe('Ghost Mechanics', () => {
      it('should have valid ghost phase duration', () => {
        expect(GAME_CONFIG.GHOST_PHASE_DURATION).toBeGreaterThan(0);
      });

      it('should have valid ghost phase threshold', () => {
        expect(GAME_CONFIG.GHOST_PHASE_THRESHOLD).toBeGreaterThan(0);
        expect(GAME_CONFIG.GHOST_PHASE_THRESHOLD).toBeLessThan(1);
      });
    });

    describe('Dispel Mechanics', () => {
      it('should have valid dispel cooldown', () => {
        expect(GAME_CONFIG.DISPEL_COOLDOWN).toBeGreaterThan(0);
      });

      it('should have valid dispel immunity duration', () => {
        expect(GAME_CONFIG.DISPEL_IMMUNITY_DURATION).toBeGreaterThan(0);
        expect(GAME_CONFIG.DISPEL_IMMUNITY_DURATION).toBeLessThan(GAME_CONFIG.DISPEL_COOLDOWN);
      });
    });
  });

  describe('Veteran System', () => {
    it('should have valid veteran ranks', () => {
      expect(GAME_CONFIG.VETERAN_RANKS).toBeDefined();
      expect(GAME_CONFIG.VETERAN_RANKS.length).toBeGreaterThan(0);
    });

    it('should have sequential kill thresholds', () => {
      for (let i = 1; i < GAME_CONFIG.VETERAN_RANKS.length; i++) {
        expect(GAME_CONFIG.VETERAN_RANKS[i].minKills).toBeGreaterThan(
          GAME_CONFIG.VETERAN_RANKS[i - 1].minKills
        );
      }
    });

    it('should have increasing damage bonus', () => {
      for (let i = 1; i < GAME_CONFIG.VETERAN_RANKS.length; i++) {
        expect(GAME_CONFIG.VETERAN_RANKS[i].damageBonus).toBeGreaterThanOrEqual(
          GAME_CONFIG.VETERAN_RANKS[i - 1].damageBonus
        );
      }
    });

    it('should have names for all ranks', () => {
      for (const rank of GAME_CONFIG.VETERAN_RANKS) {
        expect(rank.name).toBeDefined();
        expect(rank.name.length).toBeGreaterThan(0);
      }
    });

    it('should determine correct rank from kill count', () => {
      const getVeteranRank = (kills: number): number => {
        let rankIndex = 0;
        for (let i = GAME_CONFIG.VETERAN_RANKS.length - 1; i >= 0; i--) {
          if (kills >= GAME_CONFIG.VETERAN_RANKS[i].minKills) {
            rankIndex = i;
            break;
          }
        }
        return rankIndex;
      };

      expect(getVeteranRank(0)).toBe(0);
      expect(getVeteranRank(49)).toBe(0);
      expect(getVeteranRank(50)).toBe(1);
      expect(getVeteranRank(149)).toBe(1);
      expect(getVeteranRank(150)).toBe(2);
      expect(getVeteranRank(350)).toBe(3);
    });

    it('should calculate veteran damage bonus', () => {
      const getVeteranDamageMultiplier = (rankIndex: number): number => {
        return 1 + GAME_CONFIG.VETERAN_RANKS[rankIndex].damageBonus;
      };

      expect(getVeteranDamageMultiplier(0)).toBe(1);
      expect(getVeteranDamageMultiplier(1)).toBe(1.05);
      expect(getVeteranDamageMultiplier(2)).toBe(1.1);
      expect(getVeteranDamageMultiplier(3)).toBe(1.15);
    });
  });
});
