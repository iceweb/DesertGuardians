import Phaser from 'phaser';
import { Projectile } from '../objects/Projectile';
import type { ProjectileConfig } from '../objects/Projectile';
import { Creep } from '../objects/Creep';
import { CreepManager } from './CreepManager';

/**
 * ProjectileManager handles object pooling and lifecycle of all projectiles.
 */
export class ProjectileManager {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  private pool: Projectile[] = [];
  private activeProjectiles: Projectile[] = [];
  private readonly POOL_SIZE = 100;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    this.scene = scene;
    this.creepManager = creepManager;
    
    // Initialize the pool
    this.initializePool();
    
    console.log('ProjectileManager: Initialized');
  }

  /**
   * Create initial pool of projectiles
   */
  private initializePool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const projectile = new Projectile(this.scene);
      
      // Listen for splash damage events
      projectile.on('splash', this.handleSplash, this);
      
      this.pool.push(projectile);
    }
    
    console.log(`ProjectileManager: Pool initialized with ${this.POOL_SIZE} projectiles`);
  }

  /**
   * Get a projectile from the pool
   */
  private getFromPool(): Projectile | null {
    const projectile = this.pool.find(p => !p.getIsActive());
    return projectile || null;
  }

  /**
   * Fire a projectile from a tower at a target
   */
  fire(x: number, y: number, target: Creep, config: ProjectileConfig): Projectile | null {
    const projectile = this.getFromPool();
    
    if (!projectile) {
      console.warn('ProjectileManager: Pool exhausted');
      return null;
    }
    
    projectile.fire(x, y, target, config);
    this.activeProjectiles.push(projectile);
    
    return projectile;
  }

  /**
   * Handle splash damage from Rock Cannon
   */
  private handleSplash(x: number, y: number, radius: number, damage: number, isMagic: boolean): void {
    const creeps = this.creepManager.getActiveCreeps();
    
    for (const creep of creeps) {
      const distance = Phaser.Math.Distance.Between(x, y, creep.x, creep.y);
      if (distance <= radius) {
        creep.takeDamage(damage, isMagic);
      }
    }
    
    // Show splash effect
    this.showSplashEffect(x, y, radius);
  }

  /**
   * Show visual splash effect
   */
  private showSplashEffect(x: number, y: number, radius: number): void {
    const splash = this.scene.add.graphics();
    splash.fillStyle(0xff6600, 0.4);
    splash.fillCircle(x, y, radius);
    splash.lineStyle(3, 0xff3300, 0.8);
    splash.strokeCircle(x, y, radius);
    splash.setDepth(25);
    
    this.scene.tweens.add({
      targets: splash,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      onComplete: () => splash.destroy()
    });
  }

  /**
   * Update all active projectiles
   */
  update(delta: number): void {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      const stillActive = projectile.update(delta);
      
      if (!stillActive) {
        this.activeProjectiles.splice(i, 1);
      }
    }
  }

  /**
   * Get count of active projectiles
   */
  getActiveCount(): number {
    return this.activeProjectiles.length;
  }

  /**
   * Clear all active projectiles
   */
  clearAll(): void {
    for (const projectile of [...this.activeProjectiles]) {
      projectile.deactivate();
    }
    this.activeProjectiles = [];
  }

  /**
   * Destroy the manager and all projectiles
   */
  destroy(): void {
    this.clearAll();
    for (const projectile of this.pool) {
      projectile.destroy();
    }
    this.pool = [];
  }
}
