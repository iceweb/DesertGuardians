import Phaser from 'phaser';
import { CreepManager } from './CreepManager';
import { Creep } from '../objects';

export interface WaveCreepGroup {
  type: string;
  count: number;
  intervalMs: number;
  delayStart?: number;
}

export interface WaveDef {
  waveNumber: number;
  creeps: WaveCreepGroup[];
}

// Hardcoded wave configurations for all 25 waves
export const WAVE_CONFIGS: WaveDef[] = [
  // Wave 1: Introduction - easy furballs
  { waveNumber: 1, creeps: [{ type: 'furball', count: 8, intervalMs: 1500 }] },
  
  // Wave 2: More furballs
  { waveNumber: 2, creeps: [{ type: 'furball', count: 12, intervalMs: 1200 }] },
  
  // Wave 3: First runners
  { waveNumber: 3, creeps: [
    { type: 'furball', count: 6, intervalMs: 1500 },
    { type: 'runner', count: 4, intervalMs: 800, delayStart: 3000 }
  ]},
  
  // Wave 4: Runner focused
  { waveNumber: 4, creeps: [{ type: 'runner', count: 10, intervalMs: 700 }] },
  
  // Wave 5: Mixed assault
  { waveNumber: 5, creeps: [
    { type: 'furball', count: 8, intervalMs: 1200 },
    { type: 'runner', count: 8, intervalMs: 600, delayStart: 2000 }
  ]},
  
  // Wave 6: First tanks
  { waveNumber: 6, creeps: [
    { type: 'furball', count: 10, intervalMs: 1000 },
    { type: 'tank', count: 2, intervalMs: 3000, delayStart: 5000 }
  ]},
  
  // Wave 7: Tank focus
  { waveNumber: 7, creeps: [{ type: 'tank', count: 5, intervalMs: 2500 }] },
  
  // Wave 8: Speed and armor mix
  { waveNumber: 8, creeps: [
    { type: 'runner', count: 12, intervalMs: 500 },
    { type: 'tank', count: 3, intervalMs: 2000, delayStart: 3000 }
  ]},
  
  // Wave 9: Pre-boss buildup
  { waveNumber: 9, creeps: [
    { type: 'furball', count: 15, intervalMs: 800 },
    { type: 'tank', count: 4, intervalMs: 2000, delayStart: 4000 }
  ]},
  
  // Wave 10: FIRST BOSS
  { waveNumber: 10, creeps: [
    { type: 'furball', count: 10, intervalMs: 1000 },
    { type: 'boss', count: 1, intervalMs: 1000, delayStart: 5000 }
  ]},
  
  // Wave 11: Recovery wave
  { waveNumber: 11, creeps: [{ type: 'furball', count: 15, intervalMs: 900 }] },
  
  // Wave 12: Runner swarm
  { waveNumber: 12, creeps: [{ type: 'runner', count: 20, intervalMs: 400 }] },
  
  // Wave 13: Heavy tanks
  { waveNumber: 13, creeps: [{ type: 'tank', count: 8, intervalMs: 2000 }] },
  
  // Wave 14: Mixed chaos
  { waveNumber: 14, creeps: [
    { type: 'furball', count: 10, intervalMs: 800 },
    { type: 'runner', count: 10, intervalMs: 500, delayStart: 2000 },
    { type: 'tank', count: 4, intervalMs: 2500, delayStart: 4000 }
  ]},
  
  // Wave 15: Tank army
  { waveNumber: 15, creeps: [
    { type: 'tank', count: 10, intervalMs: 1800 },
    { type: 'furball', count: 8, intervalMs: 1000, delayStart: 3000 }
  ]},
  
  // Wave 16: Speed challenge
  { waveNumber: 16, creeps: [
    { type: 'runner', count: 25, intervalMs: 350 }
  ]},
  
  // Wave 17: Heavy mixed
  { waveNumber: 17, creeps: [
    { type: 'tank', count: 6, intervalMs: 2000 },
    { type: 'runner', count: 15, intervalMs: 400, delayStart: 3000 }
  ]},
  
  // Wave 18: Endurance test
  { waveNumber: 18, creeps: [
    { type: 'furball', count: 20, intervalMs: 600 },
    { type: 'tank', count: 5, intervalMs: 2500, delayStart: 2000 }
  ]},
  
  // Wave 19: Pre-boss 2
  { waveNumber: 19, creeps: [
    { type: 'runner', count: 15, intervalMs: 500 },
    { type: 'tank', count: 8, intervalMs: 1500, delayStart: 4000 }
  ]},
  
  // Wave 20: DOUBLE BOSS
  { waveNumber: 20, creeps: [
    { type: 'tank', count: 5, intervalMs: 2000 },
    { type: 'boss', count: 2, intervalMs: 8000, delayStart: 5000 }
  ]},
  
  // Wave 21: Aftermath
  { waveNumber: 21, creeps: [
    { type: 'furball', count: 20, intervalMs: 500 },
    { type: 'runner', count: 15, intervalMs: 400, delayStart: 3000 }
  ]},
  
  // Wave 22: Tank siege
  { waveNumber: 22, creeps: [
    { type: 'tank', count: 12, intervalMs: 1500 },
    { type: 'runner', count: 10, intervalMs: 600, delayStart: 5000 }
  ]},
  
  // Wave 23: Elite intro (using existing types, harder configs)
  { waveNumber: 23, creeps: [
    { type: 'runner', count: 20, intervalMs: 300 },
    { type: 'tank', count: 8, intervalMs: 1200, delayStart: 3000 },
    { type: 'boss', count: 1, intervalMs: 1000, delayStart: 8000 }
  ]},
  
  // Wave 24: Penultimate
  { waveNumber: 24, creeps: [
    { type: 'tank', count: 15, intervalMs: 1000 },
    { type: 'runner', count: 20, intervalMs: 350, delayStart: 4000 },
    { type: 'boss', count: 2, intervalMs: 5000, delayStart: 10000 }
  ]},
  
  // Wave 25: FINAL WAVE
  { waveNumber: 25, creeps: [
    { type: 'furball', count: 15, intervalMs: 400 },
    { type: 'runner', count: 20, intervalMs: 300, delayStart: 2000 },
    { type: 'tank', count: 10, intervalMs: 1000, delayStart: 4000 },
    { type: 'boss', count: 3, intervalMs: 6000, delayStart: 8000 }
  ]}
];

/**
 * WaveManager controls wave progression and creep spawning.
 */
export class WaveManager {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  
  private currentWave: number = 0;
  private waveInProgress: boolean = false;
  private waveStarted: boolean = false;
  
  // Spawning state
  private spawnTimers: Phaser.Time.TimerEvent[] = [];
  private creepsToSpawn: number = 0;
  private creepsSpawned: number = 0;
  private creepsKilled: number = 0;
  private creepsLeaked: number = 0;
  
  // Stats
  private totalCreepsKilled: number = 0;
  private totalGoldEarned: number = 0;
  
  // Event callbacks
  public onWaveStart?: (waveNumber: number) => void;
  public onWaveComplete?: (waveNumber: number) => void;
  public onAllWavesComplete?: () => void;
  public onCreepKilled?: (goldReward: number) => void;
  public onCreepLeaked?: () => void;
  public onWaveProgress?: (spawned: number, total: number) => void;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    this.scene = scene;
    this.creepManager = creepManager;
    
    // Connect creep manager events
    this.creepManager.onCreepDied = this.handleCreepDied.bind(this);
    this.creepManager.onCreepReachedEnd = this.handleCreepReachedEnd.bind(this);
    
    console.log(`WaveManager: Initialized with ${WAVE_CONFIGS.length} waves configured`);
  }

  /**
   * Start the next wave
   */
  startWave(): boolean {
    if (this.waveInProgress) {
      console.warn('WaveManager: Wave already in progress');
      return false;
    }
    
    if (this.currentWave >= WAVE_CONFIGS.length) {
      console.log('WaveManager: All waves completed!');
      this.onAllWavesComplete?.();
      return false;
    }
    
    this.currentWave++;
    this.waveInProgress = true;
    this.waveStarted = true;
    this.creepsSpawned = 0;
    this.creepsKilled = 0;
    this.creepsLeaked = 0;
    
    const waveDef = WAVE_CONFIGS[this.currentWave - 1];
    
    // Calculate total creeps in wave
    this.creepsToSpawn = waveDef.creeps.reduce((sum, group) => sum + group.count, 0);
    
    console.log(`WaveManager: Starting Wave ${this.currentWave} with ${this.creepsToSpawn} creeps`);
    
    this.onWaveStart?.(this.currentWave);
    
    // Start spawning each group
    for (const group of waveDef.creeps) {
      this.startSpawningGroup(group);
    }
    
    return true;
  }

  /**
   * Start spawning a group of creeps
   */
  private startSpawningGroup(group: WaveCreepGroup): void {
    let spawned = 0;
    
    const spawnOne = () => {
      if (spawned >= group.count) return;
      
      this.creepManager.spawn(group.type);
      spawned++;
      this.creepsSpawned++;
      
      this.onWaveProgress?.(this.creepsSpawned, this.creepsToSpawn);
      
      if (spawned < group.count) {
        const timer = this.scene.time.delayedCall(group.intervalMs, spawnOne);
        this.spawnTimers.push(timer);
      }
    };
    
    // Apply delay if specified
    const delay = group.delayStart || 0;
    const timer = this.scene.time.delayedCall(delay, spawnOne);
    this.spawnTimers.push(timer);
  }

  /**
   * Handle creep death
   */
  private handleCreepDied(_creep: Creep, goldReward: number): void {
    this.creepsKilled++;
    this.totalCreepsKilled++;
    this.totalGoldEarned += goldReward;
    
    this.onCreepKilled?.(goldReward);
    this.checkWaveComplete();
  }

  /**
   * Handle creep reaching the end
   */
  private handleCreepReachedEnd(_creep: Creep): void {
    this.creepsLeaked++;
    
    this.onCreepLeaked?.();
    this.checkWaveComplete();
  }

  /**
   * Check if the wave is complete
   */
  private checkWaveComplete(): void {
    const totalHandled = this.creepsKilled + this.creepsLeaked;
    
    if (totalHandled >= this.creepsToSpawn && this.creepManager.getActiveCount() === 0) {
      this.waveInProgress = false;
      
      console.log(`WaveManager: Wave ${this.currentWave} complete! Killed: ${this.creepsKilled}, Leaked: ${this.creepsLeaked}`);
      
      this.onWaveComplete?.(this.currentWave);
      
      // Check if all waves done
      if (this.currentWave >= WAVE_CONFIGS.length) {
        this.onAllWavesComplete?.();
      }
    }
  }

  /**
   * Get current wave number
   */
  getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Get total number of waves
   */
  getTotalWaves(): number {
    return WAVE_CONFIGS.length;
  }

  /**
   * Check if wave is in progress
   */
  isWaveInProgress(): boolean {
    return this.waveInProgress;
  }

  /**
   * Check if any wave has been started
   */
  hasStarted(): boolean {
    return this.waveStarted;
  }

  /**
   * Get wave progress
   */
  getWaveProgress(): { spawned: number; total: number; killed: number; leaked: number } {
    return {
      spawned: this.creepsSpawned,
      total: this.creepsToSpawn,
      killed: this.creepsKilled,
      leaked: this.creepsLeaked
    };
  }

  /**
   * Get total stats
   */
  getTotalStats(): { killed: number; goldEarned: number } {
    return {
      killed: this.totalCreepsKilled,
      goldEarned: this.totalGoldEarned
    };
  }

  /**
   * Clear all timers and reset
   */
  reset(): void {
    for (const timer of this.spawnTimers) {
      timer.destroy();
    }
    this.spawnTimers = [];
    this.creepManager.clearAll();
    this.currentWave = 0;
    this.waveInProgress = false;
    this.waveStarted = false;
    this.totalCreepsKilled = 0;
    this.totalGoldEarned = 0;
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.reset();
  }
}
