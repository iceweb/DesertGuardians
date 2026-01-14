import Phaser from 'phaser';
import { Creep } from '../objects';
import { PathSystem } from './MapPathSystem';

/**
 * CreepManager handles object pooling and lifecycle of all creeps.
 */
export class CreepManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pool: Creep[] = [];
  private activeCreeps: Creep[] = [];
  private readonly POOL_SIZE = 120;  // Increased for late game waves with many babies
  private currentWaveNumber: number = 1;  // Track wave for baby spawning
  
  // Event callbacks
  public onCreepDied?: (creep: Creep, goldReward: number, deathX: number, deathY: number) => void;
  public onCreepReachedEnd?: (creep: Creep) => void;
  public onBabySpawned?: (count: number) => void;  // Notify WaveManager of extra creeps
  public onBossFirstHit?: (creep: Creep) => void;  // First hit on boss
  public onBossPainThreshold?: (creep: Creep) => void;  // Boss at 25% health

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    
    // Pre-populate the pool
    this.initializePool();
  }

  /**
   * Create initial pool of creeps
   */
  private initializePool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const creep = new Creep(this.scene, -100, -100);
      creep.deactivate();
      
      // Setup event listeners
      creep.on('died', this.handleCreepDied, this);
      creep.on('reachedEnd', this.handleCreepReachedEnd, this);
      creep.on('spawnOnDeath', this.handleSpawnOnDeath, this);
      creep.on('bossFirstHit', this.handleBossFirstHit, this);
      creep.on('bossPainThreshold', this.handleBossPainThreshold, this);
      
      this.pool.push(creep);
    }
    
    console.log(`CreepManager: Initialized pool with ${this.POOL_SIZE} creeps`);
  }

  /**
   * Get a creep from the pool
   */
  private getFromPool(): Creep | null {
    // Find a creep that can be reused (not active AND not dying)
    const creep = this.pool.find(c => c.canBeReused());
    return creep || null;
  }

  /**
   * Spawn a creep of a given type with wave-based scaling
   */
  spawn(creepType: string, waveNumber: number = 1): Creep | null {
    const creep = this.getFromPool();
    
    if (!creep) {
      console.warn('CreepManager: Pool exhausted, cannot spawn creep');
      return null;
    }
    
    this.currentWaveNumber = waveNumber;  // Track for baby spawning
    creep.spawn(this.pathSystem, creepType, waveNumber);
    this.activeCreeps.push(creep);
    
    return creep;
  }

  /**
   * Spawn a creep at a specific position (for baby creeps at mother's death location)
   */
  private spawnAtPosition(creepType: string, deathX: number, deathY: number, distanceTraveled: number, waveNumber: number): Creep | null {
    const creep = this.getFromPool();
    
    if (!creep) {
      console.warn('CreepManager: Pool exhausted, cannot spawn baby creep');
      return null;
    }
    
    creep.spawn(this.pathSystem, creepType, waveNumber);
    
    // Spawn at mother's exact death position with small random spread
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 30;
    creep.setPosition(deathX + offsetX, deathY + offsetY);
    
    // Override distanceTraveled so babies continue from where mother died
    (creep as any).distanceTraveled = distanceTraveled;
    
    this.activeCreeps.push(creep);
    
    return creep;
  }

  /**
   * Handle creep death
   */
  private handleCreepDied(creep: Creep, goldReward: number): void {
    // Capture creep position before removing from active list
    const deathX = creep.x;
    const deathY = creep.y;
    this.removeFromActive(creep);
    this.onCreepDied?.(creep, goldReward, deathX, deathY);
  }

  /**
   * Handle creep reaching the end
   */
  private handleCreepReachedEnd(creep: Creep): void {
    console.log(`CreepManager.handleCreepReachedEnd called, activeCreeps before: ${this.activeCreeps.length}`);
    this.removeFromActive(creep);
    console.log(`CreepManager.handleCreepReachedEnd, activeCreeps after: ${this.activeCreeps.length}, calling onCreepReachedEnd: ${!!this.onCreepReachedEnd}`);
    this.onCreepReachedEnd?.(creep);
  }

  /**
   * Handle spawning babies when a broodmother dies
   */
  private handleSpawnOnDeath(_parentCreep: Creep, babyType: string, count: number, deathX: number, deathY: number, distanceTraveled: number): void {
    console.log(`CreepManager.handleSpawnOnDeath: Spawning ${count} ${babyType} at (${deathX}, ${deathY})`);
    
    for (let i = 0; i < count; i++) {
      // Stagger baby spawns slightly
      this.scene.time.delayedCall(i * 100, () => {
        const baby = this.spawnAtPosition(babyType, deathX, deathY, distanceTraveled, this.currentWaveNumber);
        if (baby) {
          // Only notify WaveManager for babies that ACTUALLY spawned
          this.onBabySpawned?.(1);
        }
      });
    }
  }

  /**
   * Handle first hit on a boss
   */
  private handleBossFirstHit(creep: Creep): void {
    this.onBossFirstHit?.(creep);
  }

  /**
   * Handle boss reaching 25% health threshold
   */
  private handleBossPainThreshold(creep: Creep): void {
    this.onBossPainThreshold?.(creep);
  }

  /**
   * Remove a creep from the active list
   */
  private removeFromActive(creep: Creep): void {
    const index = this.activeCreeps.indexOf(creep);
    if (index !== -1) {
      this.activeCreeps.splice(index, 1);
    }
  }

  /**
   * Update all active creeps
   */
  update(delta: number): void {
    for (const creep of this.activeCreeps) {
      creep.update(delta);
    }
  }

  /**
   * Get all active creeps
   */
  getActiveCreeps(): Creep[] {
    return this.activeCreeps;
  }

  /**
   * Get count of active creeps
   */
  getActiveCount(): number {
    return this.activeCreeps.length;
  }

  /**
   * Debug: Log all active creeps and their states
   */
  debugActiveCreeps(): void {
    console.log(`CreepManager DEBUG: ${this.activeCreeps.length} active creeps:`);
    for (let i = 0; i < this.activeCreeps.length; i++) {
      const creep = this.activeCreeps[i];
      console.log(`  [${i}] type=${creep.getConfig().type}, pos=(${creep.x.toFixed(0)}, ${creep.y.toFixed(0)}), isActive=${creep.getIsActive()}, visible=${creep.visible}, hp=${creep.getCurrentHealth()}`);
    }
  }

  /**
   * Clear all active creeps
   */
  clearAll(): void {
    for (const creep of [...this.activeCreeps]) {
      creep.deactivate();
    }
    this.activeCreeps = [];
  }

  /**
   * Destroy the manager and all creeps
   */
  destroy(): void {
    this.clearAll();
    for (const creep of this.pool) {
      creep.destroy();
    }
    this.pool = [];
  }
}
