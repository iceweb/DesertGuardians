import Phaser from 'phaser';
import { Creep } from './Creep';
import type { TowerBranch, TowerStats } from './Tower';
import type { Tower } from './Tower';

export interface ProjectileConfig {
  speed: number;
  damage: number;
  isMagic: boolean;
  branch: TowerBranch;
  stats: TowerStats;
  level: number;  // Tower level for visual scaling
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
  private sourceTower: Tower | null = null;
  
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
  fire(x: number, y: number, target: Creep, config: ProjectileConfig, sourceTower?: Tower): void {
    this.setPosition(x, y);
    this.target = target;
    this.config = config;
    this.speed = config.speed;
    this.isActive = true;
    this.trailPositions = [];
    this.sourceTower = sourceTower || null;
    
    this.setActive(true);
    this.setVisible(true);
    
    this.drawProjectile();
  }

  /**
   * Draw projectile based on tower type and level
   */
  private drawProjectile(): void {
    this.graphics.clear();
    
    if (!this.config) return;
    
    const level = this.config.level || 1;
    const scale = 1 + (level - 1) * 0.2; // 1.0, 1.2, 1.4 for levels 1-3
    
    switch (this.config.branch) {
      case 'archer':
        this.drawArcherProjectile(level, scale);
        break;
        
      case 'rapidfire':
        this.drawRapidFireProjectile(level, scale);
        break;
        
      case 'sniper':
        this.drawSniperProjectile(level, scale);
        break;
        
      case 'rockcannon':
        this.drawRockCannonProjectile(level, scale);
        break;
        
      case 'icetower':
        this.drawIceProjectile(level, scale);
        break;
        
      case 'poison':
        this.drawPoisonProjectile(level, scale);
        break;
        
      default:
        // Generic projectile
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillCircle(0, 0, 5 * scale);
    }
  }

  /**
   * Draw archer arrow - more elaborate at higher levels
   */
  private drawArcherProjectile(level: number, scale: number): void {
    const arrowLength = 16 * scale;
    const arrowWidth = 4 * scale;
    
    // Arrow shaft
    this.graphics.fillStyle(level >= 3 ? 0x654321 : 0x8b4513, 1);
    this.graphics.fillRect(-arrowLength / 2, -arrowWidth / 2, arrowLength, arrowWidth);
    
    // Arrow head - larger and more detailed at higher levels
    const headSize = 4 + level * 2;
    this.graphics.fillStyle(level >= 3 ? 0xcccccc : 0xaaaaaa, 1);
    this.graphics.fillTriangle(arrowLength / 2, 0, arrowLength / 2 + headSize, -headSize, arrowLength / 2 + headSize, headSize);
    
    // Fletching - more elaborate at higher levels
    this.graphics.fillStyle(level >= 3 ? 0xff6633 : 0xcc6633, 1);
    this.graphics.fillTriangle(-arrowLength / 2, 0, -arrowLength / 2 - 4 * scale, -3 * scale, -arrowLength / 2 - 4 * scale, 3 * scale);
    
    if (level >= 2) {
      // Extra fletching
      this.graphics.fillStyle(level >= 3 ? 0xffd700 : 0xaa5522, 1);
      this.graphics.fillTriangle(-arrowLength / 2 + 3, 0, -arrowLength / 2 - 2 * scale, -2 * scale, -arrowLength / 2 - 2 * scale, 2 * scale);
    }
    
    if (level >= 3) {
      // Golden glow effect
      this.graphics.fillStyle(0xffd700, 0.3);
      this.graphics.fillCircle(arrowLength / 2 + headSize / 2, 0, headSize);
    }
  }

  /**
   * Draw rapid fire bullet - more at higher levels
   */
  private drawRapidFireProjectile(level: number, scale: number): void {
    const bulletSize = 4 * scale;
    
    // Main bullet
    this.graphics.fillStyle(level >= 3 ? 0xffaa00 : 0xffd700, 1);
    this.graphics.fillCircle(0, 0, bulletSize);
    this.graphics.fillStyle(level >= 3 ? 0xffff44 : 0xffff00, 0.8);
    this.graphics.fillCircle(0, 0, bulletSize * 0.5);
    
    if (level >= 2) {
      // Tracer effect
      this.graphics.fillStyle(0xffffff, 0.6);
      this.graphics.fillCircle(-bulletSize, 0, bulletSize * 0.4);
    }
    
    if (level >= 3) {
      // Fire effect around bullet
      this.graphics.fillStyle(0xff6600, 0.5);
      this.graphics.fillCircle(0, 0, bulletSize * 1.5);
      this.graphics.fillStyle(0xff0000, 0.3);
      this.graphics.fillCircle(-bulletSize * 0.5, 0, bulletSize * 0.8);
    }
  }

  /**
   * Draw sniper round - more powerful looking at higher levels
   */
  private drawSniperProjectile(level: number, scale: number): void {
    const bulletLength = 20 * scale;
    const bulletWidth = 4 * scale;
    
    // Core round
    this.graphics.fillStyle(level >= 3 ? 0x6495ed : 0x4169e1, 1);
    this.graphics.fillRect(-bulletLength / 2, -bulletWidth / 2, bulletLength, bulletWidth);
    this.graphics.fillStyle(level >= 3 ? 0x87ceeb : 0x6495ed, 1);
    this.graphics.fillRect(-bulletLength / 2 + 2, -bulletWidth / 4, bulletLength - 4, bulletWidth / 2);
    
    if (level >= 2) {
      // Energy trail
      this.graphics.fillStyle(0x4169e1, 0.5);
      this.graphics.fillRect(-bulletLength, -bulletWidth / 4, bulletLength / 2, bulletWidth / 2);
    }
    
    if (level >= 3) {
      // Armor piercing tip
      this.graphics.fillStyle(0xffd700, 1);
      this.graphics.fillTriangle(bulletLength / 2, 0, bulletLength / 2 + 6, -2, bulletLength / 2 + 6, 2);
      // Energy glow
      this.graphics.fillStyle(0x00ffff, 0.3);
      this.graphics.fillCircle(bulletLength / 2, 0, bulletWidth * 2);
    }
  }

  /**
   * Draw boulder - larger and more detailed at higher levels
   */
  private drawRockCannonProjectile(level: number, scale: number): void {
    const rockSize = 10 * scale;
    
    // Main boulder
    this.graphics.fillStyle(level >= 3 ? 0x7a7a7a : 0x696969, 1);
    this.graphics.fillCircle(0, 0, rockSize);
    this.graphics.fillStyle(level >= 3 ? 0x9a9a9a : 0x808080, 1);
    this.graphics.fillCircle(-2 * scale, -2 * scale, rockSize * 0.8);
    this.graphics.fillStyle(level >= 3 ? 0x5a5a5a : 0x5a5a5a, 1);
    this.graphics.fillCircle(3 * scale, 3 * scale, rockSize * 0.4);
    
    if (level >= 2) {
      // Cracks/details
      this.graphics.lineStyle(1, 0x4a4a4a, 0.5);
      this.graphics.lineBetween(-rockSize * 0.5, -rockSize * 0.3, rockSize * 0.3, rockSize * 0.2);
    }
    
    if (level >= 3) {
      // Flaming boulder
      this.graphics.fillStyle(0xff6600, 0.4);
      this.graphics.fillCircle(0, 0, rockSize * 1.3);
      this.graphics.fillStyle(0xff0000, 0.3);
      this.graphics.fillCircle(-rockSize * 0.3, -rockSize * 0.3, rockSize * 0.6);
    }
  }

  /**
   * Draw ice shard - more crystalline at higher levels
   */
  private drawIceProjectile(level: number, scale: number): void {
    const shardSize = 8 * scale;
    
    // Main ice shard
    this.graphics.fillStyle(level >= 3 ? 0xa0e0ff : 0x87ceeb, 0.9);
    this.graphics.fillTriangle(-shardSize, 0, 0, -shardSize * 0.6, shardSize, 0);
    this.graphics.fillTriangle(-shardSize, 0, 0, shardSize * 0.6, shardSize, 0);
    
    // Inner crystal
    this.graphics.fillStyle(level >= 3 ? 0xffffff : 0xe0ffff, 0.7);
    this.graphics.fillTriangle(-shardSize * 0.5, 0, 0, -shardSize * 0.4, shardSize * 0.5, 0);
    
    if (level >= 2) {
      // Additional crystal spikes
      this.graphics.fillStyle(0xc0e0ff, 0.6);
      this.graphics.fillTriangle(0, -shardSize * 0.4, shardSize * 0.3, -shardSize * 0.8, shardSize * 0.5, -shardSize * 0.3);
      this.graphics.fillTriangle(0, shardSize * 0.4, shardSize * 0.3, shardSize * 0.8, shardSize * 0.5, shardSize * 0.3);
    }
    
    if (level >= 3) {
      // Frost aura
      this.graphics.fillStyle(0xffffff, 0.3);
      this.graphics.fillCircle(0, 0, shardSize * 1.2);
      // Sparkle
      this.graphics.fillStyle(0xffffff, 0.9);
      this.graphics.fillCircle(shardSize * 0.3, -shardSize * 0.2, 2);
    }
  }

  /**
   * Draw poison glob - more toxic at higher levels
   */
  private drawPoisonProjectile(level: number, scale: number): void {
    const globSize = 6 * scale;
    
    // Main glob
    this.graphics.fillStyle(level >= 3 ? 0x00cc00 : 0x00aa00, 0.9);
    this.graphics.fillCircle(0, 0, globSize);
    this.graphics.fillStyle(level >= 3 ? 0x44ff44 : 0x00ff00, 0.7);
    this.graphics.fillCircle(-1 * scale, -1 * scale, globSize * 0.7);
    this.graphics.fillStyle(level >= 3 ? 0xaaffaa : 0x88ff88, 0.5);
    this.graphics.fillCircle(-2 * scale, -2 * scale, globSize * 0.35);
    
    if (level >= 2) {
      // Dripping effect
      this.graphics.fillStyle(0x00ff00, 0.6);
      this.graphics.fillCircle(globSize * 0.5, globSize * 0.3, globSize * 0.3);
      this.graphics.fillCircle(-globSize * 0.4, globSize * 0.4, globSize * 0.25);
    }
    
    if (level >= 3) {
      // Toxic aura
      this.graphics.fillStyle(0x00ff00, 0.2);
      this.graphics.fillCircle(0, 0, globSize * 1.5);
      // Bubbles
      this.graphics.fillStyle(0x88ff88, 0.7);
      this.graphics.fillCircle(-globSize * 0.6, -globSize * 0.6, 2);
      this.graphics.fillCircle(globSize * 0.5, -globSize * 0.4, 1.5);
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
    
    // Emit hit event for audio (before takeDamage modifies shield/armor state)
    const hitType = this.target.getShieldHitsRemaining() > 0 ? 'shield' 
      : this.target.getConfig().armor > 0 ? 'armor' 
      : 'flesh';
    this.emit('hit', hitType);
    
    // Check if target was alive before damage
    const wasAlive = this.target.getIsActive();
    
    // Apply damage
    this.target.takeDamage(damage, this.config.isMagic);
    
    // Check if we killed the target
    if (wasAlive && !this.target.getIsActive() && this.sourceTower) {
      this.emit('kill', this.sourceTower);
    }
    
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
