import Phaser from 'phaser';
import { PathSystem } from '../managers';

export interface CreepConfig {
  type: string;
  maxHealth: number;
  speed: number;        // pixels per second
  armor: number;
  goldReward: number;
}

export const CREEP_TYPES: Record<string, CreepConfig> = {
  furball: {
    type: 'furball',
    maxHealth: 50,
    speed: 80,
    armor: 0,
    goldReward: 10
  },
  runner: {
    type: 'runner',
    maxHealth: 30,
    speed: 150,
    armor: 0,
    goldReward: 8
  },
  tank: {
    type: 'tank',
    maxHealth: 200,
    speed: 50,
    armor: 4,
    goldReward: 25
  },
  boss: {
    type: 'boss',
    maxHealth: 1000,
    speed: 40,
    armor: 2,
    goldReward: 100
  }
};

/**
 * Creep game object that follows a path from spawn to castle.
 * Rendered using graphics (no sprites needed).
 */
export class Creep extends Phaser.GameObjects.Container {
  private config!: CreepConfig;
  private pathSystem!: PathSystem;
  private distanceTraveled: number = 0;
  private currentHealth: number = 0;
  private isActive: boolean = false;
  
  // Graphics components
  private bodyGraphics!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFg!: Phaser.GameObjects.Graphics;
  
  // Animation
  private bounceTime: number = 0;
  private faceDirection: number = 1; // 1 = right, -1 = left

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create graphics for the creep body
    this.bodyGraphics = scene.add.graphics();
    this.healthBarBg = scene.add.graphics();
    this.healthBarFg = scene.add.graphics();
    
    this.add([this.bodyGraphics, this.healthBarBg, this.healthBarFg]);
    
    scene.add.existing(this);
    this.setDepth(30);
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Initialize/reset the creep for spawning
   */
  spawn(pathSystem: PathSystem, creepType: string): void {
    this.pathSystem = pathSystem;
    this.config = CREEP_TYPES[creepType] || CREEP_TYPES.furball;
    this.distanceTraveled = 0;
    this.currentHealth = this.config.maxHealth;
    this.isActive = true;
    this.bounceTime = Math.random() * Math.PI * 2; // Random start phase
    
    // Set initial position
    const startPos = pathSystem.getStartPoint();
    this.setPosition(startPos.x, startPos.y);
    
    this.setActive(true);
    this.setVisible(true);
    
    this.drawCreep();
    this.updateHealthBar();
  }

  /**
   * Draw the creep based on its type
   */
  private drawCreep(): void {
    this.bodyGraphics.clear();
    
    const type = this.config.type;
    
    switch (type) {
      case 'furball':
        this.drawFurball();
        break;
      case 'runner':
        this.drawRunner();
        break;
      case 'tank':
        this.drawTank();
        break;
      case 'boss':
        this.drawBoss();
        break;
      default:
        this.drawFurball();
    }
  }

  private drawFurball(): void {
    const g = this.bodyGraphics;
    const bounce = Math.sin(this.bounceTime * 8) * 3;
    const squish = 1 + Math.sin(this.bounceTime * 8) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body (fluffy ball)
    g.fillStyle(0x8B4513, 1); // Brown fur
    g.fillEllipse(0 * this.faceDirection, -5 + bounce, 24 * squish, 22 / squish);
    
    // Fur texture (lighter patches)
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(-6 * this.faceDirection, -8 + bounce, 8, 10);
    g.fillEllipse(6 * this.faceDirection, -2 + bounce, 10, 8);
    
    // Face
    g.fillStyle(0xDEB887, 1); // Tan face
    g.fillEllipse(8 * this.faceDirection, -6 + bounce, 12, 10);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(10 * this.faceDirection, -9 + bounce, 3);
    g.fillCircle(14 * this.faceDirection, -7 + bounce, 2);
    // Eye shine
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(9 * this.faceDirection, -10 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(16 * this.faceDirection, -4 + bounce, 3);
    
    // Ears
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(-4 * this.faceDirection, -20 + bounce, 6, 10);
    g.fillEllipse(4 * this.faceDirection, -22 + bounce, 6, 10);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(-4 * this.faceDirection, -19 + bounce, 3, 6);
    g.fillEllipse(4 * this.faceDirection, -21 + bounce, 3, 6);
    
    // Tiny feet
    g.fillStyle(0x654321, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  private drawRunner(): void {
    const g = this.bodyGraphics;
    const bounce = Math.sin(this.bounceTime * 12) * 4; // Faster bounce
    const legPhase = Math.sin(this.bounceTime * 12);
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 16, 24, 8);
    
    // Legs (animated running)
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(-6, 12 + legPhase * 4, 5, 8);
    g.fillEllipse(6, 12 - legPhase * 4, 5, 8);
    
    // Body (sleek)
    g.fillStyle(0x6495ED, 1); // Cornflower blue
    g.fillEllipse(0 * this.faceDirection, -2 + bounce, 18, 16);
    
    // Stripe
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(0, -2 + bounce, 14, 8);
    
    // Head
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(10 * this.faceDirection, -6 + bounce, 12, 10);
    
    // Big ears (for speed!)
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(2 * this.faceDirection, -22 + bounce, 5, 14);
    g.fillEllipse(8 * this.faceDirection, -20 + bounce, 5, 12);
    g.fillStyle(0xFFB6C1, 0.6);
    g.fillEllipse(2 * this.faceDirection, -20 + bounce, 2, 8);
    g.fillEllipse(8 * this.faceDirection, -18 + bounce, 2, 7);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * this.faceDirection, -8 + bounce, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * this.faceDirection, -9 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF1493, 1);
    g.fillCircle(18 * this.faceDirection, -4 + bounce, 2);
  }

  private drawTank(): void {
    const g = this.bodyGraphics;
    const bounce = Math.sin(this.bounceTime * 5) * 2; // Slower bounce
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 22, 40, 14);
    
    // Body (big and round)
    g.fillStyle(0x696969, 1); // Dark gray
    g.fillEllipse(0, 0 + bounce, 32, 28);
    
    // Armor plates
    g.fillStyle(0x808080, 1);
    g.fillEllipse(0, -8 + bounce, 26, 14);
    g.fillStyle(0x505050, 1);
    g.beginPath();
    g.arc(0, -5 + bounce, 18, -2.5, -0.6, false);
    g.lineTo(0, -5 + bounce);
    g.closePath();
    g.fillPath();
    
    // Head
    g.fillStyle(0x808080, 1);
    g.fillEllipse(14 * this.faceDirection, -2 + bounce, 14, 12);
    
    // Helmet
    g.fillStyle(0x505050, 1);
    g.fillRect(8 * this.faceDirection, -12 + bounce, 14, 6);
    
    // Eyes (small, determined)
    g.fillStyle(0xFF0000, 0.8);
    g.fillCircle(18 * this.faceDirection, -4 + bounce, 3);
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(18 * this.faceDirection, -4 + bounce, 1.5);
    
    // Tusks
    g.fillStyle(0xFFFFF0, 1);
    g.beginPath();
    g.moveTo(20 * this.faceDirection, 2 + bounce);
    g.lineTo(28 * this.faceDirection, -2 + bounce);
    g.lineTo(26 * this.faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
    
    // Feet
    g.fillStyle(0x404040, 1);
    g.fillEllipse(-12, 18, 10, 6);
    g.fillEllipse(12, 18, 10, 6);
  }

  private drawBoss(): void {
    const g = this.bodyGraphics;
    const bounce = Math.sin(this.bounceTime * 4) * 3;
    const pulse = 1 + Math.sin(this.bounceTime * 6) * 0.05;
    
    // Ominous glow
    g.fillStyle(0x800080, 0.2);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0x800080, 0.1);
    g.fillCircle(0, 0, 60 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 50, 18);
    
    // Body (massive fluffy creature)
    g.fillStyle(0x4B0082, 1); // Indigo
    g.fillEllipse(0, 0 + bounce, 44 * pulse, 38 * pulse);
    
    // Fur pattern
    g.fillStyle(0x6A0DAD, 1);
    g.fillEllipse(-10, -10 + bounce, 16, 20);
    g.fillEllipse(10, 5 + bounce, 18, 16);
    g.fillStyle(0x8B008B, 1);
    g.fillEllipse(0, -5 + bounce, 12, 14);
    
    // Face
    g.fillStyle(0x9370DB, 1);
    g.fillEllipse(18 * this.faceDirection, -5 + bounce, 18, 16);
    
    // Crown/horns
    g.fillStyle(0xFFD700, 1);
    g.beginPath();
    g.moveTo(-8 * this.faceDirection, -35 + bounce);
    g.lineTo(-4 * this.faceDirection, -45 + bounce);
    g.lineTo(0, -35 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(4 * this.faceDirection, -38 + bounce);
    g.lineTo(10 * this.faceDirection, -50 + bounce);
    g.lineTo(14 * this.faceDirection, -38 + bounce);
    g.closePath();
    g.fillPath();
    
    // Eyes (3 of them!)
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(14 * this.faceDirection, -12 + bounce, 5);
    g.fillCircle(24 * this.faceDirection, -8 + bounce, 4);
    g.fillCircle(20 * this.faceDirection, 2 + bounce, 3);
    // Eye shine
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * this.faceDirection, -14 + bounce, 2);
    g.fillCircle(22 * this.faceDirection, -10 + bounce, 1.5);
    
    // Mouth
    g.fillStyle(0x2F0040, 1);
    g.fillEllipse(26 * this.faceDirection, 4 + bounce, 8, 6);
    // Teeth
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(22 * this.faceDirection, 1 + bounce, 3, 4);
    g.fillRect(27 * this.faceDirection, 2 + bounce, 3, 3);
    
    // Tiny arms
    g.fillStyle(0x4B0082, 1);
    g.fillEllipse(-25, 10 + bounce, 10, 8);
    g.fillEllipse(25, 10 + bounce, 10, 8);
    
    // Feet
    g.fillStyle(0x3A0066, 1);
    g.fillEllipse(-15, 28, 12, 8);
    g.fillEllipse(15, 28, 12, 8);
  }

  /**
   * Update health bar display
   */
  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    
    const barWidth = 30;
    const barHeight = 4;
    const yOffset = -35;
    
    // Don't show health bar if full health
    if (this.currentHealth >= this.config.maxHealth) {
      return;
    }
    
    // Background
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, yOffset - 1, barWidth + 2, barHeight + 2);
    
    // Health fill
    const healthPercent = this.currentHealth / this.config.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBarFg.fillStyle(fillColor, 1);
    this.healthBarFg.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);
  }

  /**
   * Update creep movement and animation
   */
  update(delta: number): void {
    if (!this.isActive) return;
    
    // Update animation time
    this.bounceTime += delta / 1000;
    
    // Move along path
    const moveDistance = (this.config.speed * delta) / 1000;
    this.distanceTraveled += moveDistance;
    
    // Get new position from path
    const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
    
    // Update facing direction based on movement
    if (pathData.direction.x !== 0) {
      this.faceDirection = pathData.direction.x > 0 ? 1 : -1;
    }
    
    // Set position
    this.setPosition(pathData.position.x, pathData.position.y);
    
    // Redraw with animation
    this.drawCreep();
    
    // Check if reached end
    if (this.pathSystem.hasReachedEnd(this.distanceTraveled)) {
      this.reachEnd();
    }
  }

  /**
   * Take damage from a tower
   */
  takeDamage(amount: number, isMagic: boolean = false): number {
    // Apply armor (magic ignores armor)
    const actualDamage = isMagic ? amount : Math.max(1, amount - this.config.armor);
    this.currentHealth -= actualDamage;
    
    this.updateHealthBar();
    
    // Flash effect - briefly make the creep white
    this.bodyGraphics.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      this.bodyGraphics.setAlpha(1);
    });
    
    if (this.currentHealth <= 0) {
      this.die();
    }
    
    return actualDamage;
  }

  /**
   * Called when creep reaches the castle
   */
  private reachEnd(): void {
    this.isActive = false;
    this.emit('reachedEnd', this);
    this.deactivate();
  }

  /**
   * Called when creep dies
   */
  private die(): void {
    this.isActive = false;
    
    // Death effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete: () => {
        this.emit('died', this, this.config.goldReward);
        this.deactivate();
      }
    });
  }

  /**
   * Deactivate and return to pool
   */
  deactivate(): void {
    this.isActive = false;
    this.setActive(false);
    this.setVisible(false);
    this.setAlpha(1);
    this.setScale(1);
    this.bodyGraphics.clear();
    this.healthBarBg.clear();
    this.healthBarFg.clear();
  }

  /**
   * Get the creep's current config
   */
  getConfig(): CreepConfig {
    return this.config;
  }

  /**
   * Get distance traveled along path
   */
  getDistanceTraveled(): number {
    return this.distanceTraveled;
  }

  /**
   * Get remaining distance to end
   */
  getDistanceRemaining(): number {
    return this.pathSystem.getDistanceRemaining(this.distanceTraveled);
  }

  /**
   * Check if creep is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current health
   */
  getCurrentHealth(): number {
    return this.currentHealth;
  }
}
