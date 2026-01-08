import Phaser from 'phaser';
import { Creep } from '../objects';
import { PathSystem } from './PathSystem';

/**
 * CreepManager handles object pooling and lifecycle of all creeps.
 */
export class CreepManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pool: Creep[] = [];
  private activeCreeps: Creep[] = [];
  private readonly POOL_SIZE = 50;
  
  // Event callbacks
  public onCreepDied?: (creep: Creep, goldReward: number) => void;
  public onCreepReachedEnd?: (creep: Creep) => void;

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
      
      this.pool.push(creep);
    }
    
    console.log(`CreepManager: Initialized pool with ${this.POOL_SIZE} creeps`);
  }

  /**
   * Get a creep from the pool
   */
  private getFromPool(): Creep | null {
    // Find an inactive creep in the pool
    const creep = this.pool.find(c => !c.getIsActive());
    return creep || null;
  }

  /**
   * Spawn a creep of a given type
   */
  spawn(creepType: string): Creep | null {
    const creep = this.getFromPool();
    
    if (!creep) {
      console.warn('CreepManager: Pool exhausted, cannot spawn creep');
      return null;
    }
    
    creep.spawn(this.pathSystem, creepType);
    this.activeCreeps.push(creep);
    
    return creep;
  }

  /**
   * Handle creep death
   */
  private handleCreepDied(creep: Creep, goldReward: number): void {
    this.removeFromActive(creep);
    this.onCreepDied?.(creep, goldReward);
  }

  /**
   * Handle creep reaching the end
   */
  private handleCreepReachedEnd(creep: Creep): void {
    this.removeFromActive(creep);
    this.onCreepReachedEnd?.(creep);
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
