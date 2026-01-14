import { describe, it, expect } from 'vitest';
import {
  CREEP_TYPES,
  WAVE_CONFIGS,
  MINE_CONFIGS,
  getMineCost,
  getTotalInvestment,
} from '../data/GameData';

describe('GameData', () => {
  describe('CREEP_TYPES', () => {
    it('should have required properties for all creep types', () => {
      for (const [key, creep] of Object.entries(CREEP_TYPES)) {
        expect(creep.type).toBe(key);
        expect(creep.maxHealth).toBeGreaterThan(0);
        expect(creep.speed).toBeGreaterThan(0);
        expect(creep.armor).toBeGreaterThanOrEqual(0);
        expect(creep.goldReward).toBeGreaterThan(0);
      }
    });

    it('should have valid special ability flags', () => {
      const jumper = CREEP_TYPES['jumper'];
      expect(jumper.canJump).toBe(true);

      const flying = CREEP_TYPES['flying'];
      expect(flying.isFlying).toBe(true);

      const shielded = CREEP_TYPES['shielded'];
      expect(shielded.hasShield).toBe(true);

      const ghost = CREEP_TYPES['ghost'];
      expect(ghost.hasGhostPhase).toBe(true);

      const digger = CREEP_TYPES['digger'];
      expect(digger.canDig).toBe(true);
    });

    it('should have valid boss configurations', () => {
      const bosses = ['boss_1', 'boss_2', 'boss_3', 'boss_4', 'boss_5'];
      for (const bossKey of bosses) {
        const boss = CREEP_TYPES[bossKey];
        expect(boss).toBeDefined();
        expect(boss.canDispel).toBe(true);
        expect(boss.dispelImmunity).toBeGreaterThan(0);
        expect(boss.sizeScale).toBeGreaterThanOrEqual(1.0);
      }
    });

    it('should have valid broodmother spawn configuration', () => {
      const broodmother = CREEP_TYPES['broodmother'];
      expect(broodmother.spawnOnDeath).toBeDefined();
      expect(broodmother.spawnOnDeath!.type).toBe('baby');
      expect(broodmother.spawnOnDeath!.count).toBe(8);
    });

    it('should have elemental creeps with correct damage restrictions', () => {
      const flame = CREEP_TYPES['flame'];
      expect(flame.onlyDamagedBy).toBe('ice');

      const plaguebearer = CREEP_TYPES['plaguebearer'];
      expect(plaguebearer.onlyDamagedBy).toBe('poison');
    });
  });

  describe('WAVE_CONFIGS', () => {
    it('should have 35 waves', () => {
      expect(WAVE_CONFIGS).toHaveLength(35);
    });

    it('should have sequential wave numbers', () => {
      WAVE_CONFIGS.forEach((wave, index) => {
        expect(wave.waveNumber).toBe(index + 1);
      });
    });

    it('should have valid creep references in all waves', () => {
      for (const wave of WAVE_CONFIGS) {
        for (const group of wave.creeps) {
          expect(CREEP_TYPES[group.type]).toBeDefined();
          expect(group.count).toBeGreaterThan(0);
          expect(group.intervalMs).toBeGreaterThan(0);
        }
      }
    });

    it('should have boss waves with announcements', () => {
      const bossWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'boss');
      expect(bossWaves.length).toBeGreaterThan(0);

      for (const wave of bossWaves) {
        expect(wave.announcement).toBeDefined();
        expect(wave.announcement!.length).toBeGreaterThan(0);
      }
    });

    it('should have final wave as boss wave with parallel spawn', () => {
      const finalWave = WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
      expect(finalWave.waveNumber).toBe(35);
      expect(finalWave.waveType).toBe('boss');
      expect(finalWave.parallelSpawn).toBe(true);
    });
  });

  describe('MINE_CONFIGS', () => {
    it('should have levels 0-3', () => {
      expect(MINE_CONFIGS[0]).toBeDefined();
      expect(MINE_CONFIGS[1]).toBeDefined();
      expect(MINE_CONFIGS[2]).toBeDefined();
      expect(MINE_CONFIGS[3]).toBeDefined();
    });

    it('should have increasing income per level', () => {
      expect(MINE_CONFIGS[0].incomePerWave).toBe(0);
      expect(MINE_CONFIGS[1].incomePerWave).toBeLessThan(MINE_CONFIGS[2].incomePerWave);
      expect(MINE_CONFIGS[2].incomePerWave).toBeLessThan(MINE_CONFIGS[3].incomePerWave);
    });

    it('should have increasing build costs', () => {
      expect(MINE_CONFIGS[1].buildCost).toBeLessThan(MINE_CONFIGS[2].buildCost);
      expect(MINE_CONFIGS[2].buildCost).toBeLessThan(MINE_CONFIGS[3].buildCost);
    });
  });

  describe('getMineCost', () => {
    it('should return correct cost for each level', () => {
      expect(getMineCost(1)).toBe(75);
      expect(getMineCost(2)).toBe(150);
      expect(getMineCost(3)).toBe(250);
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
    });
  });
});
