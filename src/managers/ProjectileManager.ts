import Phaser from 'phaser';
import { Projectile } from '../objects/Projectile';
import type { ProjectileConfig } from '../objects/Projectile';
import { Creep } from '../objects/Creep';
import { CreepManager } from './CreepManager';
import type { Tower } from '../objects/Tower';

/**
 * ProjectileManager handles object pooling and lifecycle of all projectiles.
 * Extends EventEmitter to allow GameScene to listen for hit events for audio.
 */
export class ProjectileManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  private pool: Projectile[] = [];
  private activeProjectiles: Projectile[] = [];
  private readonly POOL_SIZE = 100;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    super();
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
      
      // Listen for hit events and forward to GameScene for audio
      projectile.on('hit', this.handleHit, this);
      
      // Listen for kill events to notify source tower
      projectile.on('kill', this.handleKill, this);
      
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
  fire(x: number, y: number, target: Creep, config: ProjectileConfig, sourceTower?: Tower): Projectile | null {
    const projectile = this.getFromPool();
    
    if (!projectile) {
      console.warn('ProjectileManager: Pool exhausted');
      return null;
    }
    
    projectile.fire(x, y, target, config, sourceTower);
    this.activeProjectiles.push(projectile);
    
    return projectile;
  }

  /**
   * Handle hit event from projectile and forward it for audio
   */
  private handleHit(hitType: 'shield' | 'armor' | 'flesh'): void {
    this.emit('hit', hitType);
  }

  /**
   * Handle kill event - notify the source tower for animations
   */
  private handleKill(tower: Tower): void {
    tower.onKill();
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
   * Show visual splash effect - explosion animation where cannonball lands
   */
  private showSplashEffect(x: number, y: number, radius: number): void {
    // Create main explosion flash - draw at origin and position the graphics
    const explosionFlash = this.scene.add.graphics();
    explosionFlash.setPosition(x, y);
    explosionFlash.fillStyle(0xffaa00, 0.9);
    explosionFlash.fillCircle(0, 0, radius * 0.3);
    explosionFlash.setDepth(26);
    
    this.scene.tweens.add({
      targets: explosionFlash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 150,
      onComplete: () => explosionFlash.destroy()
    });
    
    // Create explosion ring - draw at origin and position the graphics
    const explosionRing = this.scene.add.graphics();
    explosionRing.setPosition(x, y);
    explosionRing.lineStyle(4, 0xff6600, 1);
    explosionRing.strokeCircle(0, 0, radius * 0.2);
    explosionRing.setDepth(25);
    
    this.scene.tweens.add({
      targets: explosionRing,
      alpha: 0,
      scaleX: 4,
      scaleY: 4,
      duration: 300,
      onComplete: () => explosionRing.destroy()
    });
    
    // Create debris particles flying outward
    const numDebris = 8;
    for (let i = 0; i < numDebris; i++) {
      const angle = (i / numDebris) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      const debris = this.scene.add.graphics();
      debris.setPosition(x, y);
      
      // Random debris color (brown/grey rocks)
      const colors = [0x8b4513, 0x696969, 0xa0522d, 0x808080];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      
      debris.fillStyle(color, 1);
      debris.fillCircle(0, 0, size);
      debris.setDepth(24);
      
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;
      
      // Arc the debris upward then down
      this.scene.tweens.add({
        targets: debris,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => debris.destroy()
      });
    }
    
    // Create dust cloud - draw at origin and position the graphics
    const dustCloud = this.scene.add.graphics();
    dustCloud.setPosition(x, y);
    dustCloud.fillStyle(0xdeb887, 0.5);
    dustCloud.fillCircle(0, 0, radius * 0.5);
    dustCloud.setDepth(23);
    
    this.scene.tweens.add({
      targets: dustCloud,
      alpha: 0,
      scaleX: 2,
      scaleY: 1.5,
      y: y - 20,
      duration: 500,
      onComplete: () => dustCloud.destroy()
    });
    
    // Create smaller secondary explosions
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 0.6;
      const offsetY = (Math.random() - 0.5) * radius * 0.6;
      
      this.scene.time.delayedCall(50 + i * 40, () => {
        const spark = this.scene.add.graphics();
        spark.setPosition(x + offsetX, y + offsetY);
        spark.fillStyle(0xffcc00, 0.8);
        spark.fillCircle(0, 0, 8);
        spark.setDepth(25);
        
        this.scene.tweens.add({
          targets: spark,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 200,
          onComplete: () => spark.destroy()
        });
      });
    }
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
