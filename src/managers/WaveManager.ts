import Phaser from 'phaser';
import { CreepManager } from './CreepManager';
import { PathSystem } from './MapPathSystem';
import { Creep } from '../objects';
import { WAVE_CONFIGS, CREEP_TYPES } from '../data/GameData';
import type { WaveCreepGroup, WaveType } from '../data/GameData';

/**
 * Event types emitted by WaveManager
 */
export type WaveManagerEvents = {
  waveStart: [waveNumber: number];
  waveComplete: [waveNumber: number];
  waveProgress: [spawned: number, total: number];
  allWavesComplete: [];
  creepKilled: [goldReward: number, deathX: number, deathY: number];
  creepLeaked: [creep: Creep];
  finalWaveStarted: [];
  finalBossSpawning: [];
};

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
 * 
 * Emits events: waveStart, waveComplete, waveProgress, allWavesComplete, creepKilled, creepLeaked
 */
export class WaveManager extends Phaser.Events.EventEmitter {
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
  private pendingBossGroups: GroupSpawnState[] = [];  // Boss/guard groups waiting to spawn after all sequential groups
  
  // Parallel spawning state (for final wave)
  private parallelGroups: GroupSpawnState[] = [];  // Groups spawning in parallel
  private parallelTimers: Map<string, Phaser.Time.TimerEvent> = new Map();  // Timers for parallel groups
  private isParallelMode: boolean = false;  // Whether current wave uses parallel spawning
  
  // Wave tracking
  private creepsToSpawn: number = 0;
  private creepsSpawned: number = 0;
  private creepsKilled: number = 0;
  private creepsLeaked: number = 0;
  
  // Stats
  private totalCreepsKilled: number = 0;
  private totalGoldEarned: number = 0;
  
  // Game speed getter (provided by GameScene)
  public getGameSpeed?: () => number;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    super(); // Initialize EventEmitter
    this.scene = scene;
    this.creepManager = creepManager;
    
    // Connect creep manager events
    this.creepManager.onCreepDied = this.handleCreepDied.bind(this);
    this.creepManager.onCreepReachedEnd = this.handleCreepReachedEnd.bind(this);
    this.creepManager.onBabySpawned = this.handleBabySpawned.bind(this);
    

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

      this.emit('allWavesComplete');
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
    

    
    this.emit('waveStart', this.currentWave);
    
    // Emit final wave event if this is wave 35
    if (this.currentWave === WAVE_CONFIGS.length) {

      this.emit('finalWaveStarted');
    }
    
    // Show special wave announcement if applicable
    if (waveDef.waveType && waveDef.announcement) {
      this.showWaveAnnouncement(waveDef.waveType, waveDef.announcement);
    }
    
    // Check if this wave uses parallel spawning (e.g., final wave)
    this.isParallelMode = waveDef.parallelSpawn === true;
    
    // Create group states
    const allGroups = waveDef.creeps.map(group => ({
      group,
      spawned: 0,
      finished: false,
      creepType: group.type,
      lastSpawnedCreep: null
    }));
    
    if (this.isParallelMode) {
      // PARALLEL MODE: All groups spawn simultaneously

      this.parallelGroups = allGroups;
      this.groupQueue = [];
      this.startParallelSpawning();
    } else {
      // SEQUENTIAL MODE: Normal groups spawn one after another (50% path rule)
      // Boss/guard groups always spawn LAST (together, after all normal groups finish)
      const isBossOrGuard = (type: string) => type.includes('boss');
      
      const sequentialGroups = allGroups.filter(g => !isBossOrGuard(g.creepType));
      const bossGuardGroups = allGroups.filter(g => isBossOrGuard(g.creepType));
      
      this.groupQueue = sequentialGroups;
      this.parallelGroups = [];
      this.pendingBossGroups = bossGuardGroups;  // Store for spawning after sequential groups
      
      this.startNextGroup();
    }
    
    return true;
  }

  /**
   * Start parallel spawning - groups without delayStart spawn immediately,
   * groups with delayStart spawn after their delay (but still in parallel with each other)
   */
  private startParallelSpawning(): void {
    // Separate groups into immediate and delayed
    const immediateGroups = this.parallelGroups.filter(g => !g.group.delayStart || g.group.delayStart === 0);
    const delayedGroups = this.parallelGroups.filter(g => g.group.delayStart && g.group.delayStart > 0);
    

    
    // Ensure at least 2 groups spawn immediately for endgame waves
    // If only 1 immediate group, also start the first delayed group immediately
    if (immediateGroups.length < 2 && delayedGroups.length > 0) {
      const firstDelayed = delayedGroups.shift()!;
      immediateGroups.push(firstDelayed);

    }
    
    // Start immediate groups now
    for (const group of immediateGroups) {
      this.startParallelGroup(group);
    }
    
    // Schedule delayed groups
    for (const group of delayedGroups) {
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledDelay = group.group.delayStart! / gameSpeed;
      this.scene.time.delayedCall(scaledDelay, () => {

        
        // Emit final boss event when boss_5 starts spawning
        if (group.creepType === 'boss_5') {

          this.emit('finalBossSpawning');
        }
        
        this.startParallelGroup(group);
      });
    }
  }

  /**
   * Start spawning a single group in parallel mode
   */
  private startParallelGroup(groupState: GroupSpawnState): void {
    const spawnNext = () => {
      if (groupState.spawned >= groupState.group.count) {
        groupState.finished = true;
        return;
      }
      
      const creep = this.creepManager.spawn(groupState.group.type, this.currentWave);
      groupState.spawned++;
      this.creepsSpawned++;
      
      if (creep) {
        groupState.lastSpawnedCreep = creep;
      }
      
      this.emit('waveProgress', this.creepsSpawned, this.creepsToSpawn);
      
      // Schedule next spawn for this group
      if (groupState.spawned < groupState.group.count) {
        const gameSpeed = this.getGameSpeed?.() || 1;
        const scaledInterval = groupState.group.intervalMs / gameSpeed;
        const timer = this.scene.time.delayedCall(scaledInterval, spawnNext);
        this.parallelTimers.set(groupState.creepType, timer);
      }
    };
    
    // Start immediately
    spawnNext();
  }

  /**
   * Start spawning the next group in the queue
   */
  private startNextGroup(): void {
    if (this.groupQueue.length === 0) {

      // Don't spawn boss groups here - let checkNextGroupStart handle it when 50% path or all dead
      return;
    }
    
    // Get next group from queue
    this.currentGroup = this.groupQueue.shift()!;
    this.groupCreeps.clear();
    
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
    

    
    this.emit('waveProgress', this.creepsSpawned, this.creepsToSpawn);
    
    // Schedule next spawn if more creeps in this group
    if (group.spawned < group.group.count) {
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledInterval = group.group.intervalMs / gameSpeed;
      this.spawnTimer = this.scene.time.delayedCall(scaledInterval, () => this.spawnNextInGroup());
    } else {
      // Mark group as finished spawning
      group.finished = true;

      // Boss groups will be triggered by checkNextGroupStart() when conditions are met
    }
  }

  /**
   * Update method - checks if next group should start
   * Called each frame from GameScene
   */
  update(): void {
    if (!this.waveInProgress) return;
    if (this.isParallelMode) return; // Parallel mode doesn't need update checks
    
    this.checkNextGroupStart();
  }

  /**
   * Check and start next group immediately if conditions are met
   */
  private checkNextGroupStart(): void {
    if (!this.waveInProgress) return;
    if (this.isParallelMode) return;
    if (!this.currentGroup) return;
    if (!this.currentGroup.finished) return;  // Still spawning current group
    
    // Check if we should start the next group (either sequential or boss)
    const hasMoreGroups = this.groupQueue.length > 0 || this.pendingBossGroups.length > 0;
    if (!hasMoreGroups) return;  // No more groups to spawn
    
    if (this.shouldStartNextGroup()) {
      if (this.groupQueue.length > 0) {
        // Start next sequential group
        this.startNextGroup();
      } else if (this.pendingBossGroups.length > 0) {
        // All sequential groups done and conditions met - spawn boss groups
        for (const bossGroup of this.pendingBossGroups) {
          this.startParallelGroup(bossGroup);
        }
        this.pendingBossGroups = [];
        this.currentGroup = null;  // Clear current group since we're done with sequential spawning
      }
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
    
    this.emit('creepKilled', goldReward, deathX, deathY);
    
    // Immediately check if next group should start (no frame delay)
    this.checkNextGroupStart();
    
    this.checkWaveComplete();
  }

  /**
   * Handle creep reaching the end
   */
  private handleCreepReachedEnd(creep: Creep): void {

    this.creepsLeaked++;
    
    this.emit('creepLeaked', creep);
    
    // Immediately check if next group should start (no frame delay)
    this.checkNextGroupStart();
    
    this.checkWaveComplete();
  }

  /**
   * Handle baby creeps spawned from broodmother death
   */
  private handleBabySpawned(count: number): void {
    // Add spawned babies to the total count for wave completion tracking
    this.creepsToSpawn += count;

  }

  /**
   * Check if the wave is complete
   */
  private checkWaveComplete(): void {
    const totalHandled = this.creepsKilled + this.creepsLeaked;
    const activeCount = this.creepManager.getActiveCount();
    

    
    if (!this.waveInProgress) {

      return;
    }
    
    if (totalHandled >= this.creepsToSpawn && activeCount === 0) {
      this.waveInProgress = false;
      

      
      this.emit('waveComplete', this.currentWave);
      
      // Check if all waves done
      if (this.currentWave >= WAVE_CONFIGS.length) {
        this.emit('allWavesComplete');
      }
    } else {

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
   * Get info about the next wave (creep types, wave number, wave type)
   * Returns null if all waves are complete
   */
  getNextWaveInfo(): { 
    types: Array<{ type: string; description: string }>; 
    waveNumber: number; 
    waveType?: WaveType;
    isBossWave: boolean;
  } | null {
    const nextWaveIndex = this.currentWave;  // 0-indexed (after wave 1 completes, this is 1 for wave 2)
    if (nextWaveIndex >= WAVE_CONFIGS.length) return null;
    
    const waveDef = WAVE_CONFIGS[nextWaveIndex];
    
    // Get unique creep types with their descriptions
    const uniqueTypes = [...new Set(waveDef.creeps.map(g => g.type))];
    const typesWithDescriptions = uniqueTypes.map(type => ({
      type,
      description: CREEP_TYPES[type]?.description || 'Unknown creep type.'
    }));
    
    return {
      types: typesWithDescriptions,
      waveNumber: waveDef.waveNumber,
      waveType: waveDef.waveType,
      isBossWave: waveDef.waveType === 'boss'
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
    // Clear parallel timers
    for (const timer of this.parallelTimers.values()) {
      timer.destroy();
    }
    this.parallelTimers.clear();
    this.parallelGroups = [];
    this.pendingBossGroups = [];
    this.isParallelMode = false;
    
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
    
    // Create container for announcement
    const container = this.scene.add.container(centerX, centerY);
    container.setDepth(250);
    container.setScrollFactor(0);
    
    // Create announcement text first to measure it
    const announcement = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: colors.text,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 500 }
    });
    announcement.setOrigin(0.5);
    
    // Create background panel sized to fit text
    const panelWidth = Math.max(420, announcement.width + 40);
    const panelHeight = Math.max(80, announcement.height + 30);
    const panelBg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.85);
    panelBg.setStrokeStyle(4, colors.border);
    container.add(panelBg);
    container.add(announcement);
    
    // Start invisible and scaled down
    container.setAlpha(0);
    container.setScale(0.5);
    
    // Animate in
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Pulse effect for boss waves
    if (waveType === 'boss') {
      this.scene.tweens.add({
        targets: container,
        scale: 1.08,
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
        targets: container,
        alpha: 0,
        y: centerY - 40,
        scale: 0.8,
        duration: 400,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          container.destroy();
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
      case 'flame':
        return { text: '#FF6600', border: 0xFF4400 };
      case 'plaguebearer':
        return { text: '#00FF88', border: 0x00CC66 };
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
