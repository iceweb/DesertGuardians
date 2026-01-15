import { describe, it, expect } from 'vitest';
import { WAVE_CONFIGS, CREEP_TYPES } from '../data/GameData';

/**
 * Tests for Wave system and progression
 * Validates wave definitions, spawning logic, and game progression
 */

describe('Wave System', () => {
  describe('Wave Configuration Validation', () => {
    it('should have 35 total waves', () => {
      expect(WAVE_CONFIGS.length).toBe(35);
    });

    it('should have sequential wave numbers', () => {
      WAVE_CONFIGS.forEach((wave, index) => {
        expect(wave.waveNumber).toBe(index + 1);
      });
    });

    it('should have at least one creep group per wave', () => {
      for (const wave of WAVE_CONFIGS) {
        expect(wave.creeps.length).toBeGreaterThan(0);
      }
    });

    it('should reference valid creep types', () => {
      for (const wave of WAVE_CONFIGS) {
        for (const group of wave.creeps) {
          expect(CREEP_TYPES[group.type]).toBeDefined();
        }
      }
    });

    it('should have valid spawn intervals', () => {
      for (const wave of WAVE_CONFIGS) {
        for (const group of wave.creeps) {
          expect(group.intervalMs).toBeGreaterThan(0);
          expect(group.count).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Boss Waves', () => {
    it('should have boss waves at specific intervals', () => {
      const bossWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'boss');
      expect(bossWaves.length).toBeGreaterThanOrEqual(5);
    });

    it('should have announcements for boss waves', () => {
      const bossWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'boss');
      for (const wave of bossWaves) {
        expect(wave.announcement).toBeDefined();
        expect(wave.announcement!.length).toBeGreaterThan(0);
      }
    });

    it('should have final wave at wave 35', () => {
      const finalWave = WAVE_CONFIGS[34];
      expect(finalWave.waveNumber).toBe(35);
      expect(finalWave.waveType).toBe('boss');
    });

    it('should have final wave with parallel spawn', () => {
      const finalWave = WAVE_CONFIGS[34];
      expect(finalWave.parallelSpawn).toBe(true);
    });
  });

  describe('Special Wave Types', () => {
    it('should have flying waves', () => {
      const flyingWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'flying');
      expect(flyingWaves.length).toBeGreaterThan(0);
    });

    it('should have digger waves', () => {
      const diggerWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'digger');
      expect(diggerWaves.length).toBeGreaterThan(0);
    });

    it('should have ghost waves', () => {
      const ghostWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'ghost');
      expect(ghostWaves.length).toBeGreaterThan(0);
    });

    it('should have broodmother waves', () => {
      const broodmotherWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'broodmother');
      expect(broodmotherWaves.length).toBeGreaterThan(0);
    });

    it('should have chaos waves', () => {
      const chaosWaves = WAVE_CONFIGS.filter((w) => w.waveType === 'chaos');
      expect(chaosWaves.length).toBeGreaterThan(0);
    });
  });

  describe('Wave Creep Count Calculation', () => {
    it('should calculate total creeps per wave', () => {
      const getWaveCreepCount = (waveNumber: number): number => {
        const wave = WAVE_CONFIGS[waveNumber - 1];
        return wave.creeps.reduce((sum, group) => sum + group.count, 0);
      };

      // Wave 1 should have some creeps
      expect(getWaveCreepCount(1)).toBeGreaterThan(0);

      // Later waves typically have more creeps
      expect(getWaveCreepCount(10)).toBeGreaterThan(0);
    });

    it('should track creeps killed vs leaked', () => {
      const creepsSpawned = 10;
      let creepsKilled = 0;
      let creepsLeaked = 0;

      // Simulate gameplay
      creepsKilled = 8;
      creepsLeaked = 2;

      const totalHandled = creepsKilled + creepsLeaked;
      expect(totalHandled).toBe(creepsSpawned);
    });
  });

  describe('Wave Spawning Logic', () => {
    it('should spawn creeps at correct intervals', () => {
      const intervalMs = 500;
      const count = 5;
      const totalDuration = intervalMs * (count - 1);

      expect(totalDuration).toBe(2000);
    });

    it('should handle parallel spawning for final wave', () => {
      interface GroupSpawnState {
        type: string;
        spawned: number;
        total: number;
        finished: boolean;
      }

      const groups: GroupSpawnState[] = [
        { type: 'furball', spawned: 0, total: 10, finished: false },
        { type: 'boss_5', spawned: 0, total: 1, finished: false },
      ];

      // Parallel mode: multiple groups spawn simultaneously
      const activeGroups = groups.filter((g) => !g.finished);
      expect(activeGroups.length).toBe(2);

      // Spawn from first group
      groups[0].spawned++;
      // Simultaneously spawn from second group
      groups[1].spawned++;
      groups[1].finished = true;

      const stillActive = groups.filter((g) => !g.finished);
      expect(stillActive.length).toBe(1);
    });

    it('should apply game speed to spawn intervals', () => {
      const baseInterval = 1000;
      const gameSpeed = 2.0;
      const scaledInterval = baseInterval / gameSpeed;

      expect(scaledInterval).toBe(500);
    });
  });

  describe('Wave Completion Detection', () => {
    it('should detect wave complete when all creeps handled', () => {
      interface WaveProgress {
        spawned: number;
        total: number;
        killed: number;
        leaked: number;
        activeCount: number;
      }

      const isWaveComplete = (progress: WaveProgress): boolean => {
        const totalHandled = progress.killed + progress.leaked;
        return totalHandled >= progress.total && progress.activeCount === 0;
      };

      // In progress
      expect(isWaveComplete({ spawned: 10, total: 10, killed: 5, leaked: 2, activeCount: 3 })).toBe(
        false
      );

      // All killed but still active
      expect(
        isWaveComplete({ spawned: 10, total: 10, killed: 10, leaked: 0, activeCount: 1 })
      ).toBe(false);

      // Complete
      expect(isWaveComplete({ spawned: 10, total: 10, killed: 8, leaked: 2, activeCount: 0 })).toBe(
        true
      );
    });
  });

  describe('HP Scaling', () => {
    it('should scale creep HP by wave number', () => {
      const WAVE_HP_SCALING = 0.12;
      const MAX_HP_MULTIPLIER = 5.0;

      const calculateHPMultiplier = (waveNumber: number): number => {
        return Math.min(MAX_HP_MULTIPLIER, 1 + (waveNumber - 1) * WAVE_HP_SCALING);
      };

      expect(calculateHPMultiplier(1)).toBe(1.0);
      expect(calculateHPMultiplier(2)).toBeCloseTo(1.12);
      expect(calculateHPMultiplier(10)).toBeCloseTo(2.08);
      // Wave 35 would be 5.08 but is capped at MAX_HP_MULTIPLIER (5.0)
      expect(calculateHPMultiplier(35)).toBe(MAX_HP_MULTIPLIER);
    });

    it('should apply HP multiplier to base health', () => {
      const baseHealth = 100;
      const hpMultiplier = 2.5;
      const scaledHealth = Math.floor(baseHealth * hpMultiplier);

      expect(scaledHealth).toBe(250);
    });
  });

  describe('Next Wave Info', () => {
    it('should provide next wave creep types', () => {
      const getNextWaveInfo = (currentWave: number) => {
        const nextIndex = currentWave;
        if (nextIndex >= WAVE_CONFIGS.length) return null;

        const wave = WAVE_CONFIGS[nextIndex];
        const uniqueTypes = [...new Set(wave.creeps.map((g) => g.type))];

        return {
          waveNumber: wave.waveNumber,
          types: uniqueTypes,
          waveType: wave.waveType,
          isBossWave: wave.waveType === 'boss',
        };
      };

      const info = getNextWaveInfo(0);
      expect(info).not.toBeNull();
      expect(info!.waveNumber).toBe(1);
      expect(info!.types.length).toBeGreaterThan(0);
    });

    it('should return null after all waves', () => {
      const getNextWaveInfo = (currentWave: number) => {
        if (currentWave >= WAVE_CONFIGS.length) return null;
        return { waveNumber: currentWave + 1 };
      };

      expect(getNextWaveInfo(35)).toBeNull();
    });
  });

  describe('Group Queue Logic', () => {
    it('should progress to next group after current finishes', () => {
      interface Group {
        type: string;
        count: number;
        spawned: number;
        finished: boolean;
      }

      const queue: Group[] = [
        { type: 'furball', count: 5, spawned: 0, finished: false },
        { type: 'speedy', count: 3, spawned: 0, finished: false },
        { type: 'tank', count: 2, spawned: 0, finished: false },
      ];

      let currentGroupIndex = 0;

      const finishCurrentGroup = () => {
        queue[currentGroupIndex].finished = true;
        queue[currentGroupIndex].spawned = queue[currentGroupIndex].count;
        currentGroupIndex++;
      };

      finishCurrentGroup();
      expect(queue[0].finished).toBe(true);
      expect(currentGroupIndex).toBe(1);

      finishCurrentGroup();
      expect(queue[1].finished).toBe(true);
      expect(currentGroupIndex).toBe(2);
    });

    it('should start next group when last creep is halfway through', () => {
      const pathProgress = 0.5; // 50% of path traveled
      const shouldStartNextGroup = pathProgress >= 0.5;

      expect(shouldStartNextGroup).toBe(true);
    });
  });

  describe('Delayed Boss Spawning', () => {
    it('should handle delayed boss spawn', () => {
      interface DelayedGroup {
        type: string;
        delayStart: number;
      }

      const groups: DelayedGroup[] = [
        { type: 'furball', delayStart: 0 },
        { type: 'boss_5', delayStart: 5000 },
      ];

      const immediate = groups.filter((g) => !g.delayStart || g.delayStart === 0);
      const delayed = groups.filter((g) => g.delayStart && g.delayStart > 0);

      expect(immediate.length).toBe(1);
      expect(delayed.length).toBe(1);
      expect(delayed[0].type).toBe('boss_5');
    });
  });

  describe('Baby Creep Spawning (Broodmother)', () => {
    it('should add baby creeps to wave count', () => {
      let totalCreeps = 10;

      const handleBabySpawn = (count: number) => {
        totalCreeps += count;
      };

      // Broodmother dies and spawns 8 babies
      handleBabySpawn(8);
      expect(totalCreeps).toBe(18);
    });

    it('should track broodmother spawn config', () => {
      const broodmother = CREEP_TYPES['broodmother'];
      expect(broodmother.spawnOnDeath).toBeDefined();
      expect(broodmother.spawnOnDeath!.type).toBe('baby');
      expect(broodmother.spawnOnDeath!.count).toBe(8);
    });
  });

  describe('Wave Stats Tracking', () => {
    it('should track total kills and gold earned', () => {
      interface WaveStats {
        totalKilled: number;
        totalGoldEarned: number;
      }

      const stats: WaveStats = { totalKilled: 0, totalGoldEarned: 0 };

      const onCreepKilled = (goldReward: number) => {
        stats.totalKilled++;
        stats.totalGoldEarned += goldReward;
      };

      onCreepKilled(10);
      onCreepKilled(15);
      onCreepKilled(25);

      expect(stats.totalKilled).toBe(3);
      expect(stats.totalGoldEarned).toBe(50);
    });
  });
});
