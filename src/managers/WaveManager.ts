import Phaser from 'phaser';
import { CreepManager } from './CreepManager';
import { Creep } from '../objects';
import { WAVE_CONFIGS } from '../data/WaveData';
import type { WaveCreepGroup } from '../data/WaveData';

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
  public onCreepKilled?: (goldReward: number, deathX: number, deathY: number) => void;
  public onCreepLeaked?: () => void;
  public onWaveProgress?: (spawned: number, total: number) => void;
  
  // Game speed getter (provided by GameScene)
  public getGameSpeed?: () => number;

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
      if (spawned >= group.count) {
        console.log(`WaveManager.spawnOne: Already spawned ${spawned}/${group.count}, stopping`);
        return;
      }
      
      const creep = this.creepManager.spawn(group.type);
      spawned++;
      this.creepsSpawned++;
      
      console.log(`WaveManager.spawnOne: Spawned ${group.type} #${spawned}/${group.count}, total spawned: ${this.creepsSpawned}/${this.creepsToSpawn}, creep: ${creep ? 'success' : 'FAILED'}`);
      
      this.onWaveProgress?.(this.creepsSpawned, this.creepsToSpawn);
      
      if (spawned < group.count) {
        // Scale spawn interval by game speed
        const gameSpeed = this.getGameSpeed?.() || 1;
        const scaledInterval = group.intervalMs / gameSpeed;
        const timer = this.scene.time.delayedCall(scaledInterval, spawnOne);
        this.spawnTimers.push(timer);
      }
    };
    
    // Apply delay if specified, spawn immediately if no delay
    const delay = group.delayStart || 0;
    if (delay > 0) {
      // Scale initial delay by game speed
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledDelay = delay / gameSpeed;
      const timer = this.scene.time.delayedCall(scaledDelay, spawnOne);
      this.spawnTimers.push(timer);
    } else {
      // Spawn first one immediately, then schedule the rest
      spawnOne();
    }
  }

  /**
   * Handle creep death
   */
  private handleCreepDied(_creep: Creep, goldReward: number, deathX: number, deathY: number): void {
    this.creepsKilled++;
    this.totalCreepsKilled++;
    this.totalGoldEarned += goldReward;
    
    this.onCreepKilled?.(goldReward, deathX, deathY);
    this.checkWaveComplete();
  }

  /**
   * Handle creep reaching the end
   */
  private handleCreepReachedEnd(_creep: Creep): void {
    console.log(`WaveManager.handleCreepReachedEnd called, creepsLeaked before: ${this.creepsLeaked}`);
    this.creepsLeaked++;
    
    this.onCreepLeaked?.();
    this.checkWaveComplete();
  }

  /**
   * Check if the wave is complete
   */
  private checkWaveComplete(): void {
    const totalHandled = this.creepsKilled + this.creepsLeaked;
    const activeCount = this.creepManager.getActiveCount();
    
    console.log(`WaveManager.checkWaveComplete: killed=${this.creepsKilled}, leaked=${this.creepsLeaked}, totalHandled=${totalHandled}, creepsToSpawn=${this.creepsToSpawn}, activeCount=${activeCount}, waveInProgress=${this.waveInProgress}`);
    
    if (!this.waveInProgress) {
      console.log('WaveManager.checkWaveComplete: Wave not in progress, skipping');
      return;
    }
    
    if (totalHandled >= this.creepsToSpawn && activeCount === 0) {
      this.waveInProgress = false;
      
      console.log(`WaveManager: Wave ${this.currentWave} complete! Killed: ${this.creepsKilled}, Leaked: ${this.creepsLeaked}`);
      
      this.onWaveComplete?.(this.currentWave);
      
      // Check if all waves done
      if (this.currentWave >= WAVE_CONFIGS.length) {
        this.onAllWavesComplete?.();
      }
    } else {
      console.log(`WaveManager.checkWaveComplete: Wave not complete yet - need ${this.creepsToSpawn - totalHandled} more creeps handled or ${activeCount} active creeps to die`);
      // Debug: Show details of remaining active creeps when only a few left
      if (activeCount <= 3 && activeCount > 0) {
        this.creepManager.debugActiveCreeps();
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
