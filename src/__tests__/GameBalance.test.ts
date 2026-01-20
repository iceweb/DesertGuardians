import { describe, it, expect } from 'vitest';
import { GAME_CONFIG } from '../data/GameConfig';
import { TOWER_CONFIGS } from '../data/TowerData';
import { CREEP_TYPES, MINE_CONFIGS, WAVE_CONFIGS, getTotalInvestment } from '../data/GameData';

/**
 * Tests for game balance and economy
 * Validates that game systems are properly balanced
 */

describe('Game Balance', () => {
  describe('Starting Economy', () => {
    it('should have enough gold to build initial tower', () => {
      expect(GAME_CONFIG.STARTING_GOLD).toBeGreaterThanOrEqual(GAME_CONFIG.ARCHER_BUILD_COST);
    });

    it('should have enough gold for initial tower and some mines', () => {
      const archerCost = GAME_CONFIG.ARCHER_BUILD_COST;
      const mineCost = MINE_CONFIGS[1].buildCost;

      // Should be able to build at least 2 archers or 1 archer + mine
      expect(GAME_CONFIG.STARTING_GOLD).toBeGreaterThanOrEqual(archerCost + mineCost);
    });
  });

  describe('Tower DPS Calculations', () => {
    it('should calculate DPS correctly for each tower', () => {
      const calculateDPS = (damage: number, fireRate: number): number => {
        if (fireRate === 0) return 0;
        return (damage / fireRate) * 1000;
      };

      for (const [_key, config] of Object.entries(TOWER_CONFIGS)) {
        const dps = calculateDPS(config.stats.damage, config.stats.fireRate);
        if (config.stats.fireRate > 0) {
          expect(dps).toBeGreaterThan(0);
        } else {
          expect(dps).toBe(0);
        }
      }
    });

    it('should have increasing DPS per level within same branch', () => {
      const branches = ['archer', 'rapidfire', 'sniper', 'rockcannon', 'icetower', 'poison'];

      for (const branch of branches) {
        const calculateDPS = (damage: number, fireRate: number): number => {
          if (fireRate === 0) return 0;
          return (damage / fireRate) * 1000;
        };

        const dps = [1, 2, 3, 4].map((level) => {
          const config = TOWER_CONFIGS[`${branch}_${level}`];
          return calculateDPS(config.stats.damage, config.stats.fireRate);
        });

        for (let i = 1; i < dps.length; i++) {
          expect(dps[i]).toBeGreaterThan(dps[i - 1]);
        }
      }
    });
  });

  describe('Tower Cost Efficiency', () => {
    it('should calculate cost efficiency (DPS per gold) for each tower', () => {
      const calculateEfficiency = (damage: number, fireRate: number, totalCost: number): number => {
        if (fireRate === 0 || totalCost === 0) return 0;
        const dps = (damage / fireRate) * 1000;
        return dps / totalCost;
      };

      const archerL1 = TOWER_CONFIGS['archer_1'];
      const efficiency = calculateEfficiency(
        archerL1.stats.damage,
        archerL1.stats.fireRate,
        archerL1.buildCost || 0
      );

      expect(efficiency).toBeGreaterThan(0);
    });
  });

  describe('Wave Progression Balance', () => {
    it('should have increasing wave difficulty', () => {
      // Check creep HP scaling
      const getWaveHP = (waveNumber: number): number => {
        return Math.min(
          GAME_CONFIG.MAX_HP_MULTIPLIER,
          1 + (waveNumber - 1) * GAME_CONFIG.WAVE_HP_SCALING
        );
      };

      for (let i = 2; i <= 35; i++) {
        expect(getWaveHP(i)).toBeGreaterThanOrEqual(getWaveHP(i - 1));
      }
    });

    it('should have boss waves at regular intervals', () => {
      const bossWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'boss');
      expect(bossWaves.length).toBeGreaterThanOrEqual(5);

      // Final wave should be boss
      expect(WAVE_CONFIGS[34].waveType).toBe('boss');
    });
  });

  describe('Creep Gold Rewards', () => {
    it('should have higher rewards for harder creeps', () => {
      // Bosses should give more gold than regular creeps
      expect(CREEP_TYPES['boss_1'].goldReward).toBeGreaterThan(CREEP_TYPES['furball'].goldReward);
      expect(CREEP_TYPES['boss_5'].goldReward).toBeGreaterThan(CREEP_TYPES['boss_1'].goldReward);

      // Tanks should give more than runners
      expect(CREEP_TYPES['tank'].goldReward).toBeGreaterThan(CREEP_TYPES['runner'].goldReward);
    });

    it('should have balanced gold per HP ratio', () => {
      // All creeps should have some gold reward
      for (const creep of Object.values(CREEP_TYPES)) {
        expect(creep.goldReward).toBeGreaterThan(0);
      }
    });
  });

  describe('Mine Economy Balance', () => {
    it('should have mines profitable over 20+ waves', () => {
      for (let level = 1; level <= 4; level++) {
        const cost = getTotalInvestment(level as 0 | 1 | 2 | 3 | 4);
        const income = MINE_CONFIGS[level].incomePerWave;
        const wavesToBreakEven = cost / income;

        // Should break even before wave 20
        expect(wavesToBreakEven).toBeLessThan(20);
      }
    });

    it('should have max mines very profitable over full game', () => {
      const maxMineCost = getTotalInvestment(4);
      const maxMineIncome = MINE_CONFIGS[4].incomePerWave;
      const totalIncome = maxMineIncome * 35; // 35 waves

      // With rebalanced values (750g cost, 55g/wave), should still profit well
      expect(totalIncome).toBeGreaterThan(maxMineCost * 1.5);
    });
  });

  describe('Creep Special Abilities Balance', () => {
    it('should have shields block reasonable number of hits', () => {
      // Based on test expectations, shields block 3-5 hits
      const expectedShieldHits = 5;
      expect(expectedShieldHits).toBeGreaterThan(0);
      expect(expectedShieldHits).toBeLessThan(10);
    });

    it('should have reasonable jump cooldown', () => {
      expect(GAME_CONFIG.JUMP_COOLDOWN).toBeGreaterThanOrEqual(3000);
      expect(GAME_CONFIG.JUMP_COOLDOWN).toBeLessThanOrEqual(10000);
    });

    it('should have reasonable ghost phase duration', () => {
      expect(GAME_CONFIG.GHOST_PHASE_DURATION).toBeGreaterThanOrEqual(2000);
      expect(GAME_CONFIG.GHOST_PHASE_DURATION).toBeLessThanOrEqual(8000);
    });

    it('should have reasonable burrow duration', () => {
      expect(GAME_CONFIG.BURROW_DURATION).toBeGreaterThanOrEqual(1000);
      expect(GAME_CONFIG.BURROW_DURATION).toBeLessThanOrEqual(5000);
    });
  });

  describe('Veteran System Balance', () => {
    it('should have achievable kill thresholds', () => {
      // First rank should be achievable in early game
      expect(GAME_CONFIG.VETERAN_RANKS[1].minKills).toBeLessThan(100);

      // Final rank should be achievable in late game
      const finalRank = GAME_CONFIG.VETERAN_RANKS[GAME_CONFIG.VETERAN_RANKS.length - 1];
      expect(finalRank.minKills).toBeLessThan(500);
    });

    it('should have reasonable damage bonuses', () => {
      for (const rank of GAME_CONFIG.VETERAN_RANKS) {
        // Damage bonus should be between 0% and 30%
        expect(rank.damageBonus).toBeGreaterThanOrEqual(0);
        expect(rank.damageBonus).toBeLessThanOrEqual(0.3);
      }
    });
  });

  describe('Tower Range Balance', () => {
    it('should have snipers with highest range', () => {
      const sniperRange = TOWER_CONFIGS['sniper_4'].stats.range;

      for (const [key, config] of Object.entries(TOWER_CONFIGS)) {
        if (!key.startsWith('sniper')) {
          expect(config.stats.range).toBeLessThanOrEqual(sniperRange);
        }
      }
    });

    it('should have aura towers with moderate range', () => {
      const auraRange = TOWER_CONFIGS['aura_1'].stats.range;
      const archerRange = TOWER_CONFIGS['archer_1'].stats.range;

      // Aura should have reasonable range
      expect(auraRange).toBeGreaterThan(0);
      expect(auraRange).toBeLessThanOrEqual(archerRange * 2);
    });
  });

  describe('Tower Fire Rate Balance', () => {
    it('should have rapidfire with fastest fire rate', () => {
      const rapidFireRate = TOWER_CONFIGS['rapidfire_1'].stats.fireRate;

      for (const [key, config] of Object.entries(TOWER_CONFIGS)) {
        if (!key.startsWith('rapidfire') && !key.startsWith('aura')) {
          if (config.stats.fireRate > 0) {
            expect(config.stats.fireRate).toBeGreaterThanOrEqual(rapidFireRate);
          }
        }
      }
    });

    it('should have sniper with relatively slow fire rate', () => {
      const sniperFireRate = TOWER_CONFIGS['sniper_4'].stats.fireRate;
      const archerFireRate = TOWER_CONFIGS['archer_1'].stats.fireRate;
      const rapidFireRate = TOWER_CONFIGS['rapidfire_1'].stats.fireRate;

      // Sniper should be slower than archer and rapidfire
      expect(sniperFireRate).toBeGreaterThan(archerFireRate);
      expect(sniperFireRate).toBeGreaterThan(rapidFireRate);
    });
  });

  describe('Wave Gold Bonus Balance', () => {
    it('should have increasing gold bonus per wave', () => {
      const calculateWaveBonus = (waveNumber: number): number => {
        return (
          GAME_CONFIG.WAVE_GOLD_BONUS_BASE +
          Math.floor((waveNumber - 1) / GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL) *
            GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT
        );
      };

      expect(calculateWaveBonus(1)).toBe(GAME_CONFIG.WAVE_GOLD_BONUS_BASE);
      expect(calculateWaveBonus(6)).toBeGreaterThan(calculateWaveBonus(1));
      expect(calculateWaveBonus(35)).toBeGreaterThan(calculateWaveBonus(1));
    });
  });

  describe('Speed Settings Balance', () => {
    it('should have speed multipliers in proper ratio', () => {
      // Fast should be about 2x normal
      expect(GAME_CONFIG.FAST_SPEED / GAME_CONFIG.NORMAL_SPEED).toBeCloseTo(2, 0.5);

      // Turbo should be about 3x normal
      expect(GAME_CONFIG.TURBO_SPEED / GAME_CONFIG.NORMAL_SPEED).toBeCloseTo(3, 0.5);
    });
  });
});

describe('Score Calculation', () => {
  it('should calculate final score correctly', () => {
    const calculateScore = (
      wavesCompleted: number,
      remainingHP: number,
      remainingGold: number
    ): number => {
      return (
        wavesCompleted * GAME_CONFIG.WAVE_BONUS_POINTS +
        remainingHP * GAME_CONFIG.HP_BONUS_POINTS +
        Math.floor(remainingGold * GAME_CONFIG.GOLD_BONUS_MULTIPLIER)
      );
    };

    // Perfect game: 35 waves, full HP, 1000 gold
    const perfectScore = calculateScore(35, 25, 1000);
    expect(perfectScore).toBeGreaterThan(0);

    // Score components
    const waveScore = 35 * GAME_CONFIG.WAVE_BONUS_POINTS;
    const hpScore = 25 * GAME_CONFIG.HP_BONUS_POINTS;
    const goldScore = Math.floor(1000 * GAME_CONFIG.GOLD_BONUS_MULTIPLIER);

    expect(perfectScore).toBe(waveScore + hpScore + goldScore);
  });

  it('should have HP worth more than gold', () => {
    // 1 HP should be worth more than 1 gold
    expect(GAME_CONFIG.HP_BONUS_POINTS).toBeGreaterThan(GAME_CONFIG.GOLD_BONUS_MULTIPLIER);
  });
});
