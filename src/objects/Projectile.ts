import Phaser from 'phaser';
import { Creep } from './Creep';
import type { TowerBranch, TowerStats } from './Tower';

export interface ProjectileConfig {
  speed: number;
  damage: number;
  isMagic: boolean;
  branch: TowerBranch;
  stats: TowerStats;
}

/**
 * Projectile class for tower attacks
 */
export class Projectile extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private target: Creep | null = null;
  private config: ProjectileConfig | null = null;
  private isActive: boolean = false;
  private speed: number = 400;
  
  // Trail effect
  private trail: Phaser.GameObjects.Graphics;
  private trailPositions: { x: number; y: number }[] = [];
  
  constructor(scene: Phaser.Scene) {
    super(scene, -100, -100);
    
    this.graphics = scene.add.graphics();
    this.trail = scene.add.graphics();
    this.trail.setDepth(14);
    
    this.add(this.graphics);
    
    scene.add.existing(this);
    this.setDepth(15);
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Fire the projectile at a target
   */
  fire(x: number, y: number, target: Creep, config: ProjectileConfig): void {
    this.setPosition(x, y);
    this.target = target;
    this.config = config;
    this.speed = config.speed;
    this.isActive = true;
    this.trailPositions = [];
    
    this.setActive(true);
    this.setVisible(true);
    
    this.drawProjectile();
  }

  /**
   * Draw projectile based on tower type
   */
  private drawProjectile(): void {
    this.graphics.clear();
    
    if (!this.config) return;
    
    switch (this.config.branch) {
      case 'archer':
        // Arrow
        this.graphics.fillStyle(0x8b4513, 1);
        this.graphics.fillRect(-8, -2, 16, 4);
        this.graphics.fillStyle(0xaaaaaa, 1);
        this.graphics.fillTriangle(8, 0, 14, -4, 14, 4);
        this.graphics.fillStyle(0xcc6633, 1);
        this.graphics.fillTriangle(-8, 0, -12, -3, -12, 3);
        break;
        
      case 'rapidfire':
        // Fast bullet
        this.graphics.fillStyle(0xffd700, 1);
        this.graphics.fillCircle(0, 0, 4);
        this.graphics.fillStyle(0xffff00, 0.8);
        this.graphics.fillCircle(0, 0, 2);
        break;
        
      case 'sniper':
        // High-velocity round
        this.graphics.fillStyle(0x4169e1, 1);
        this.graphics.fillRect(-10, -2, 20, 4);
        this.graphics.fillStyle(0x6495ed, 1);
        this.graphics.fillRect(-8, -1, 16, 2);
        break;
        
      case 'rockcannon':
        // Boulder
        this.graphics.fillStyle(0x696969, 1);
        this.graphics.fillCircle(0, 0, 10);
        this.graphics.fillStyle(0x808080, 1);
        this.graphics.fillCircle(-2, -2, 8);
        this.graphics.fillStyle(0x5a5a5a, 1);
        this.graphics.fillCircle(3, 3, 4);
        break;
        
      case 'icetower':
        // Ice shard
        this.graphics.fillStyle(0x87ceeb, 0.9);
        this.graphics.fillTriangle(-8, 0, 0, -5, 8, 0);
        this.graphics.fillTriangle(-8, 0, 0, 5, 8, 0);
        this.graphics.fillStyle(0xe0ffff, 0.7);
        this.graphics.fillTriangle(-4, 0, 0, -3, 4, 0);
        break;
        
      case 'poison':
        // Poison glob
        this.graphics.fillStyle(0x00aa00, 0.9);
        this.graphics.fillCircle(0, 0, 6);
        this.graphics.fillStyle(0x00ff00, 0.7);
        this.graphics.fillCircle(-1, -1, 4);
        this.graphics.fillStyle(0x88ff88, 0.5);
        this.graphics.fillCircle(-2, -2, 2);
        break;
        
      default:
        // Generic projectile
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillCircle(0, 0, 5);
    }
  }

  /**
   * Update projectile movement
   */
  update(delta: number): boolean {
    if (!this.isActive || !this.target || !this.config) {
      return false;
    }
    
    // Check if target is still valid
    if (!this.target.getIsActive()) {
      this.deactivate();
      return false;
    }
    
    // Store trail position
    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > 5) {
      this.trailPositions.shift();
    }
    
    // Draw trail
    this.drawTrail();
    
    // Calculate direction to target
    const targetX = this.target.x;
    const targetY = this.target.y;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    
    // Rotate projectile to face target
    this.rotation = angle;
    
    // Move towards target
    const moveDistance = (this.speed * delta) / 1000;
    const dx = Math.cos(angle) * moveDistance;
    const dy = Math.sin(angle) * moveDistance;
    
    this.x += dx;
    this.y += dy;
    
    // Check if we hit the target
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    if (distance < 20) {
      this.hitTarget();
      return false;
    }
    
    return true;
  }

  /**
   * Draw trail effect
   */
  private drawTrail(): void {
    this.trail.clear();
    
    if (this.trailPositions.length < 2 || !this.config) return;
    
    const color = this.getTrailColor();
    
    for (let i = 0; i < this.trailPositions.length; i++) {
      const alpha = (i + 1) / this.trailPositions.length * 0.5;
      const size = ((i + 1) / this.trailPositions.length) * 3;
      
      this.trail.fillStyle(color, alpha);
      this.trail.fillCircle(this.trailPositions[i].x, this.trailPositions[i].y, size);
    }
  }

  /**
   * Get trail color based on branch
   */
  private getTrailColor(): number {
    if (!this.config) return 0xffffff;
    
    switch (this.config.branch) {
      case 'archer': return 0x8b4513;
      case 'rapidfire': return 0xffd700;
      case 'sniper': return 0x4169e1;
      case 'rockcannon': return 0x696969;
      case 'icetower': return 0x87ceeb;
      case 'poison': return 0x00ff00;
      default: return 0xffffff;
    }
  }

  /**
   * Handle hitting the target
   */
  private hitTarget(): void {
    if (!this.target || !this.config) {
      this.deactivate();
      return;
    }
    
    const stats = this.config.stats;
    let damage = this.config.damage;
    
    // Sniper crit chance
    if (this.config.branch === 'sniper' && stats.critChance) {
      if (Math.random() < stats.critChance) {
        damage *= stats.critMultiplier || 2;
        // Show crit effect
        this.showCritEffect();
      }
    }
    
    // Apply damage
    this.target.takeDamage(damage, this.config.isMagic);
    
    // Special effects
    this.applySpecialEffects();
    
    // Splash damage for Rock Cannon
    if (this.config.branch === 'rockcannon' && stats.splashRadius) {
      this.emit('splash', this.target.x, this.target.y, stats.splashRadius, damage * 0.5, this.config.isMagic);
    }
    
    this.deactivate();
  }

  /**
   * Apply special effects based on tower type
   */
  private applySpecialEffects(): void {
    if (!this.target || !this.config) return;
    
    const stats = this.config.stats;
    
    // Ice Tower slow effect
    if (this.config.branch === 'icetower' && stats.slowPercent && stats.slowDuration) {
      this.target.applySlow(stats.slowPercent, stats.slowDuration);
    }
    
    // Poison Tower DoT effect
    if (this.config.branch === 'poison' && stats.dotDamage && stats.dotDuration) {
      this.target.applyPoison(stats.dotDamage, stats.dotDuration);
    }
  }

  /**
   * Show crit effect
   */
  private showCritEffect(): void {
    // Create a brief flash at the impact point
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xff0000, 0.8);
    flash.fillCircle(this.x, this.y, 15);
    flash.setDepth(30);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Deactivate the projectile
   */
  deactivate(): void {
    this.isActive = false;
    this.target = null;
    this.config = null;
    this.trailPositions = [];
    this.trail.clear();
    
    this.setActive(false);
    this.setVisible(false);
    this.setPosition(-100, -100);
  }

  /**
   * Check if projectile is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Destroy the projectile
   */
  destroy(fromScene?: boolean): void {
    this.trail.destroy();
    super.destroy(fromScene);
  }
}
