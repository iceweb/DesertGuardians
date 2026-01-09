import Phaser from 'phaser';
import { CreepManager } from './CreepManager';
import { PathSystem } from './PathSystem';
import { Creep } from '../objects';
import { WAVE_CONFIGS } from '../data/WaveData';
import type { WaveCreepGroup, WaveType } from '../data/WaveData';

/**
 * Tracks state for a single creep group being spawned
 */
interface GroupSpawnState {
  group: WaveCreepGroup;
  spawned: number;              // How many have been spawned
  finished: boolean;            // All spawned for this group
  creepType: string;            // Type of creep in this group
  lastSpawnedCreep: Creep | null; // Reference to last creep spawned in this group
}

/**
 * WaveManager controls wave progression and creep spawning.
 * Groups spawn sequentially - next group starts when:
 * 1. All creeps of current group are dead/leaked, OR
 * 2. Last spawned creep of current group has traveled 50% of the path
 */
export class WaveManager {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  private pathSystem!: PathSystem;
  
  private currentWave: number = 0;
  private waveInProgress: boolean = false;
  private waveStarted: boolean = false;
  
  // Sequential group spawning state
  private groupQueue: GroupSpawnState[] = [];  // Groups waiting to spawn
  private currentGroup: GroupSpawnState | null = null;  // Currently spawning group
  private spawnTimer: Phaser.Time.TimerEvent | null = null;  // Timer for current group
  private groupCreeps: Set<Creep> = new Set();  // Track creeps spawned by current group
  
  // Wave tracking
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
    this.creepManager.onBabySpawned = this.handleBabySpawned.bind(this);
    
    console.log(`WaveManager: Initialized with ${WAVE_CONFIGS.length} waves configured`);
  }

  /**
   * Set the path system (needed to check 50% path progress)
   */
  setPathSystem(pathSystem: PathSystem): void {
    this.pathSystem = pathSystem;
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
    
    console.log(`WaveManager: Starting Wave ${this.currentWave} with ${this.creepsToSpawn} creeps in ${waveDef.creeps.length} groups`);
    
    this.onWaveStart?.(this.currentWave);
    
    // Show special wave announcement if applicable
    if (waveDef.waveType && waveDef.announcement) {
      this.showWaveAnnouncement(waveDef.waveType, waveDef.announcement);
    }
    
    // Queue all groups for sequential spawning
    this.groupQueue = waveDef.creeps.map(group => ({
      group,
      spawned: 0,
      finished: false,
      creepType: group.type,
      lastSpawnedCreep: null
    }));
    
    // Start spawning the first group immediately
    this.startNextGroup();
    
    return true;
  }

  /**
   * Start spawning the next group in the queue
   */
  private startNextGroup(): void {
    if (this.groupQueue.length === 0) {
      console.log('WaveManager: All groups spawned');
      this.currentGroup = null;
      return;
    }
    
    // Get next group from queue
    this.currentGroup = this.groupQueue.shift()!;
    this.groupCreeps.clear();
    
    console.log(`WaveManager: Starting group ${this.currentGroup.creepType} (${this.currentGroup.group.count} creeps)`);
    
    // Start spawning this group
    this.spawnNextInGroup();
  }

  /**
   * Spawn the next creep in the current group
   */
  private spawnNextInGroup(): void {
    if (!this.currentGroup) return;
    
    const group = this.currentGroup;
    if (group.spawned >= group.group.count) {
      // Group finished spawning
      group.finished = true;
      console.log(`WaveManager: Group ${group.creepType} finished spawning all ${group.spawned} creeps`);
      return;
    }
    
    // Spawn one creep
    const creep = this.creepManager.spawn(group.group.type, this.currentWave);
    group.spawned++;
    this.creepsSpawned++;
    
    if (creep) {
      group.lastSpawnedCreep = creep;
      this.groupCreeps.add(creep);
    }
    
    console.log(`WaveManager: Spawned ${group.creepType} #${group.spawned}/${group.group.count}, total: ${this.creepsSpawned}/${this.creepsToSpawn}`);
    
    this.onWaveProgress?.(this.creepsSpawned, this.creepsToSpawn);
    
    // Schedule next spawn if more creeps in this group
    if (group.spawned < group.group.count) {
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledInterval = group.group.intervalMs / gameSpeed;
      this.spawnTimer = this.scene.time.delayedCall(scaledInterval, () => this.spawnNextInGroup());
    } else {
      // Mark group as finished
      group.finished = true;
      console.log(`WaveManager: Group ${group.creepType} finished spawning`);
    }
  }

  /**
   * Update method - checks if next group should start
   * Called each frame from GameScene
   */
  update(): void {
    if (!this.waveInProgress) return;
    if (!this.currentGroup) return;
    if (!this.currentGroup.finished) return;  // Still spawning current group
    if (this.groupQueue.length === 0) return;  // No more groups to spawn
    
    // Check if we should start the next group
    if (this.shouldStartNextGroup()) {
      this.startNextGroup();
    }
  }

  /**
   * Check if conditions are met to start the next group:
   * 1. All creeps from current group are dead/leaked, OR
   * 2. Last spawned creep has traveled 50% of the path
   */
  private shouldStartNextGroup(): boolean {
    if (!this.currentGroup) return true;
    
    // Get active creeps of the current group's type
    const activeCreeps = this.creepManager.getActiveCreeps();
    const groupTypeCreeps = activeCreeps.filter(c => 
      c.getConfig().type === this.currentGroup!.creepType && this.groupCreeps.has(c)
    );
    
    // Condition 1: All creeps from this group are dead/leaked
    if (groupTypeCreeps.length === 0) {
      console.log(`WaveManager: All ${this.currentGroup.creepType} creeps cleared - starting next group`);
      return true;
    }
    
    // Condition 2: Check if last spawned creep has traveled 50% of path
    if (this.currentGroup.lastSpawnedCreep && this.pathSystem) {
      const lastCreep = this.currentGroup.lastSpawnedCreep;
      
      // Make sure the creep is still active
      if (lastCreep.getIsActive()) {
        const distanceTraveled = lastCreep.getDistanceTraveled();
        const totalDistance = this.pathSystem.getTotalLength();
        const progress = distanceTraveled / totalDistance;
        
        if (progress >= 0.5) {
          console.log(`WaveManager: Last ${this.currentGroup.creepType} at ${(progress * 100).toFixed(0)}% - starting next group`);
          return true;
        }
      } else {
        // Last creep is no longer active, check if any remain
        if (groupTypeCreeps.length === 0) {
          return true;
        }
        // Update lastSpawnedCreep to the last remaining one
        this.currentGroup.lastSpawnedCreep = groupTypeCreeps[groupTypeCreeps.length - 1];
      }
    }
    
    return false;
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
   * Handle baby creeps spawned from broodmother death
   */
  private handleBabySpawned(count: number): void {
    // Add spawned babies to the total count for wave completion tracking
    this.creepsToSpawn += count;
    console.log(`WaveManager.handleBabySpawned: Added ${count} babies, new total: ${this.creepsToSpawn}`);
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
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
    this.groupQueue = [];
    this.currentGroup = null;
    this.groupCreeps.clear();
    this.creepManager.clearAll();
    this.currentWave = 0;
    this.waveInProgress = false;
    this.waveStarted = false;
    this.totalCreepsKilled = 0;
    this.totalGoldEarned = 0;
  }

  /**
   * Show a special wave announcement
   */
  private showWaveAnnouncement(waveType: WaveType, text: string): void {
    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2 - 50;
    
    // Get color based on wave type
    const colors = this.getAnnouncementColors(waveType);
    
    // Create background panel
    const panelWidth = 400;
    const panelHeight = 80;
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 16);
    panel.lineStyle(3, colors.border, 1);
    panel.strokeRoundedRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 16);
    panel.setDepth(200);
    panel.setScrollFactor(0);
    
    // Create announcement text
    const announcement = this.scene.add.text(centerX, centerY, text, {
      fontSize: '28px',
      color: colors.text,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    announcement.setOrigin(0.5);
    announcement.setDepth(201);
    announcement.setScrollFactor(0);
    
    // Animate in
    panel.setAlpha(0);
    announcement.setAlpha(0);
    announcement.setScale(0.5);
    
    this.scene.tweens.add({
      targets: [panel, announcement],
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.scene.tweens.add({
      targets: announcement,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Pulse effect for boss waves
    if (waveType === 'boss') {
      this.scene.tweens.add({
        targets: announcement,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        delay: 400
      });
    }
    
    // Determine display duration
    const duration = waveType === 'boss' ? 3000 : waveType === 'chaos' ? 2500 : 2000;
    
    // Animate out and destroy
    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: [panel, announcement],
        alpha: 0,
        y: centerY - 30,
        duration: 400,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          panel.destroy();
          announcement.destroy();
        }
      });
    });
  }

  /**
   * Get colors for announcement based on wave type
   */
  private getAnnouncementColors(waveType: WaveType): { text: string; border: number } {
    switch (waveType) {
      case 'boss':
        return { text: '#FF4444', border: 0xFF0000 };
      case 'flying':
        return { text: '#FFD700', border: 0xFFAA00 };
      case 'digger':
        return { text: '#D2691E', border: 0x8B4513 };
      case 'ghost':
        return { text: '#9370DB', border: 0x8A2BE2 };
      case 'broodmother':
        return { text: '#32CD32', border: 0x228B22 };
      case 'chaos':
        return { text: '#FF6347', border: 0xFF4500 };
      default:
        return { text: '#FFFFFF', border: 0xFFFFFF };
    }
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.reset();
  }
}
