import Phaser from 'phaser';
import { PathSystem } from '../managers';

export interface CreepConfig {
  type: string;
  maxHealth: number;
  speed: number;        // pixels per second
  armor: number;
  goldReward: number;
  // Special abilities
  hasShield?: boolean;     // Blocks first 3 hits completely
  canJump?: boolean;       // Leaps forward 150px every 4 seconds
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
  },
  jumper: {
    type: 'jumper',
    maxHealth: 120,
    speed: 70,
    armor: 1,
    goldReward: 30,
    canJump: true
  },
  shielded: {
    type: 'shielded',
    maxHealth: 100,
    speed: 65,
    armor: 0,
    goldReward: 35,
    hasShield: true
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
  private isDying: boolean = false;  // True during death animation
  
  // Graphics components
  private bodyGraphics!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFg!: Phaser.GameObjects.Graphics;
  
  // Animation
  private bounceTime: number = 0;
  private faceDirection: number = 1; // 1 = right, -1 = left
  
  // Status effects
  private slowAmount: number = 0;      // 0-1, current slow percentage
  private slowEndTime: number = 0;     // timestamp when slow ends
  private poisonStacks: { damage: number; endTime: number }[] = [];
  private poisonTickTimer: number = 0;
  private statusGraphics!: Phaser.GameObjects.Graphics;
  
  // Special abilities
  private shieldHitsRemaining: number = 0;   // Shield blocks remaining
  private shieldGraphics!: Phaser.GameObjects.Graphics;
  private jumpCooldown: number = 0;          // Time until next jump
  private isJumping: boolean = false;        // Currently in jump animation
  private jumpWarningTime: number = 0;       // Flash warning before jump
  private readonly JUMP_COOLDOWN = 4000;     // 4 seconds between jumps
  private readonly JUMP_DISTANCE = 150;      // Jump 150px forward
  private readonly JUMP_WARNING_DURATION = 500; // Flash white 0.5s before jump

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create graphics for the creep body
    this.bodyGraphics = scene.add.graphics();
    this.healthBarBg = scene.add.graphics();
    this.healthBarFg = scene.add.graphics();
    this.statusGraphics = scene.add.graphics();
    this.shieldGraphics = scene.add.graphics();
    
    this.add([this.bodyGraphics, this.healthBarBg, this.healthBarFg, this.statusGraphics, this.shieldGraphics]);
    
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
    
    // Initialize special abilities
    this.shieldHitsRemaining = this.config.hasShield ? 3 : 0;
    this.jumpCooldown = this.config.canJump ? this.JUMP_COOLDOWN : 0;
    this.isJumping = false;
    this.jumpWarningTime = 0;
    
    // Set initial position
    const startPos = pathSystem.getStartPoint();
    this.setPosition(startPos.x, startPos.y);
    
    this.setActive(true);
    this.setVisible(true);
    
    this.drawCreep();
    this.updateHealthBar();
    this.updateShieldVisual();
  }

  /**
   * Draw the creep based on its type
   */
  private drawCreep(): void {
    this.bodyGraphics.clear();
    
    const type = this.config.type;
    
    // Apply jump warning flash (white tint)
    const isFlashing = this.jumpWarningTime > 0;
    
    switch (type) {
      case 'furball':
        this.drawFurball(isFlashing);
        break;
      case 'runner':
        this.drawRunner(isFlashing);
        break;
      case 'tank':
        this.drawTank(isFlashing);
        break;
      case 'boss':
        this.drawBoss(isFlashing);
        break;
      case 'jumper':
        this.drawJumper(isFlashing);
        break;
      case 'shielded':
        this.drawShielded(isFlashing);
        break;
      default:
        this.drawFurball(isFlashing);
    }
  }

  private drawFurball(_isFlashing: boolean = false): void {
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

  private drawRunner(_isFlashing: boolean = false): void {
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

  private drawTank(_isFlashing: boolean = false): void {
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

  private drawBoss(_isFlashing: boolean = false): void {
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
   * Draw Elite Jumper - athletic creature with spring legs
   */
  private drawJumper(isFlashing: boolean = false): void {
    const g = this.bodyGraphics;
    const bounce = this.isJumping ? -15 : Math.sin(this.bounceTime * 10) * 5;
    const legSquat = this.isJumping ? 0.5 : 1;
    
    // Flash white when about to jump
    const bodyColor = isFlashing ? 0xFFFFFF : 0x32CD32; // Lime green
    const darkColor = isFlashing ? 0xDDDDDD : 0x228B22;
    
    // Shadow (smaller when jumping)
    const shadowAlpha = this.isJumping ? 0.15 : 0.3;
    g.fillStyle(0x000000, shadowAlpha);
    g.fillEllipse(0, 20, 26, 10);
    
    // Spring legs
    g.fillStyle(darkColor, 1);
    g.fillEllipse(-8, 14 * legSquat, 6, 10 * legSquat);
    g.fillEllipse(8, 14 * legSquat, 6, 10 * legSquat);
    
    // Body (athletic build)
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -4 + bounce, 20, 18);
    
    // Spots pattern
    g.fillStyle(darkColor, 1);
    g.fillCircle(-6, -8 + bounce, 4);
    g.fillCircle(4, -2 + bounce, 5);
    g.fillCircle(-3, 4 + bounce, 3);
    
    // Head
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(10 * this.faceDirection, -8 + bounce, 12, 10);
    
    // Big springy ears
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -26 + bounce, 6, 16);
    g.fillEllipse(8 * this.faceDirection, -24 + bounce, 5, 14);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(0, -24 + bounce, 3, 10);
    g.fillEllipse(8 * this.faceDirection, -22 + bounce, 2.5, 9);
    
    // Eyes (alert, energetic)
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * this.faceDirection, -10 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * this.faceDirection, -12 + bounce, 2);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(18 * this.faceDirection, -6 + bounce, 3);
    
    // Jump dust cloud effect
    if (this.isJumping) {
      g.fillStyle(0xDEB887, 0.5);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 15 + Math.random() * 10;
        g.fillCircle(Math.cos(angle) * dist, 20 + Math.random() * 5, 4 + Math.random() * 3);
      }
    }
  }

  /**
   * Draw Elite Shielded - mystical creature with magical barrier
   */
  private drawShielded(_isFlashing: boolean = false): void {
    const g = this.bodyGraphics;
    const bounce = Math.sin(this.bounceTime * 7) * 3;
    const shimmer = Math.sin(this.bounceTime * 15) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body (mystical purple-blue)
    g.fillStyle(0x9400D3, 1); // Dark violet
    g.fillEllipse(0, -3 + bounce, 22, 20);
    
    // Magical markings
    g.fillStyle(0xE6E6FA, 0.6 + shimmer); // Lavender
    g.fillCircle(-5, -8 + bounce, 3);
    g.fillCircle(5, 0 + bounce, 4);
    g.fillCircle(-2, 6 + bounce, 2);
    // Rune-like pattern
    g.lineStyle(2, 0xE6E6FA, 0.5);
    g.beginPath();
    g.moveTo(-8, -2 + bounce);
    g.lineTo(0, -10 + bounce);
    g.lineTo(8, -2 + bounce);
    g.strokePath();
    
    // Head
    g.fillStyle(0xBA55D3, 1); // Medium orchid
    g.fillEllipse(10 * this.faceDirection, -5 + bounce, 12, 10);
    
    // Mystical gem on forehead
    g.fillStyle(0x00FFFF, 0.8 + shimmer);
    g.fillCircle(8 * this.faceDirection, -14 + bounce, 4);
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(6 * this.faceDirection, -15 + bounce, 1.5);
    
    // Eyes (glowing)
    g.fillStyle(0x00FFFF, 0.9);
    g.fillCircle(14 * this.faceDirection, -7 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * this.faceDirection, -8 + bounce, 2);
    
    // Ears (with magical tips)
    g.fillStyle(0x9400D3, 1);
    g.fillEllipse(0, -22 + bounce, 5, 12);
    g.fillEllipse(6 * this.faceDirection, -20 + bounce, 4, 10);
    g.fillStyle(0x00FFFF, 0.7);
    g.fillCircle(0, -30 + bounce, 3);
    g.fillCircle(6 * this.faceDirection, -27 + bounce, 2.5);
    
    // Feet
    g.fillStyle(0x7B68EE, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  /**
   * Update the shield visual effect
   */
  private updateShieldVisual(): void {
    this.shieldGraphics.clear();
    
    if (this.shieldHitsRemaining <= 0) return;
    
    const shimmer = Math.sin(this.bounceTime * 10) * 0.15;
    const pulse = 1 + Math.sin(this.bounceTime * 5) * 0.05;
    
    // Outer glow
    this.shieldGraphics.fillStyle(0x00BFFF, 0.15 + shimmer);
    this.shieldGraphics.fillCircle(0, -5, 38 * pulse);
    
    // Main shield bubble
    this.shieldGraphics.lineStyle(3, 0x00BFFF, 0.6 + shimmer);
    this.shieldGraphics.strokeCircle(0, -5, 32 * pulse);
    
    // Inner shield
    this.shieldGraphics.lineStyle(2, 0x87CEEB, 0.4);
    this.shieldGraphics.strokeCircle(0, -5, 28 * pulse);
    
    // Shield hit indicators (small circles showing remaining hits)
    const indicatorY = -42;
    for (let i = 0; i < this.shieldHitsRemaining; i++) {
      const indicatorX = (i - 1) * 10;
      this.shieldGraphics.fillStyle(0x00FFFF, 0.9);
      this.shieldGraphics.fillCircle(indicatorX, indicatorY, 4);
      this.shieldGraphics.lineStyle(1, 0xFFFFFF, 1);
      this.shieldGraphics.strokeCircle(indicatorX, indicatorY, 4);
    }
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
    
    const currentTime = this.scene.time.now;
    
    // Update status effects
    this.updateStatusEffects(delta, currentTime);
    
    // Update jump ability
    this.updateJumpAbility(delta);
    
    // Update animation time
    this.bounceTime += delta / 1000;
    
    // Calculate effective speed (with slow)
    const speedMultiplier = this.slowEndTime > currentTime ? (1 - this.slowAmount) : 1;
    const effectiveSpeed = this.config.speed * speedMultiplier;
    
    // Move along path (unless jumping)
    if (!this.isJumping) {
      const moveDistance = (effectiveSpeed * delta) / 1000;
      this.distanceTraveled += moveDistance;
    }
    
    // Get new position from path
    const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
    
    // Update facing direction based on movement
    if (pathData.direction.x !== 0) {
      this.faceDirection = pathData.direction.x > 0 ? 1 : -1;
    }
    
    // Set position (unless mid-jump, which is handled by tween)
    if (!this.isJumping) {
      this.setPosition(pathData.position.x, pathData.position.y);
    }
    
    // Redraw with animation
    this.drawCreep();
    
    // Update shield visual
    if (this.shieldHitsRemaining > 0) {
      this.updateShieldVisual();
    }
    
    // Draw status indicators
    this.drawStatusEffects(currentTime);
    
    // Check if reached end
    if (this.pathSystem.hasReachedEnd(this.distanceTraveled)) {
      this.reachEnd();
    }
  }

  /**
   * Update jump ability (cooldown, warning, execution)
   */
  private updateJumpAbility(delta: number): void {
    if (!this.config.canJump || this.isJumping) return;
    
    // Update jump warning timer
    if (this.jumpWarningTime > 0) {
      this.jumpWarningTime -= delta;
      
      // Time to jump!
      if (this.jumpWarningTime <= 0) {
        this.executeJump();
      }
      return;
    }
    
    // Update jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= delta;
      
      // Start warning phase
      if (this.jumpCooldown <= 0) {
        this.jumpWarningTime = this.JUMP_WARNING_DURATION;
      }
    }
  }

  /**
   * Execute the jump - leap forward along the path
   */
  private executeJump(): void {
    this.isJumping = true;
    
    // Calculate new distance after jump
    const newDistance = this.distanceTraveled + this.JUMP_DISTANCE;
    const targetData = this.pathSystem.getPositionAt(newDistance);
    
    // Create dust cloud at start position
    this.showJumpDustCloud();
    
    // Animate the jump
    this.scene.tweens.add({
      targets: this,
      x: targetData.position.x,
      y: targetData.position.y,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.distanceTraveled = newDistance;
        this.isJumping = false;
        this.jumpCooldown = this.JUMP_COOLDOWN;
        
        // Dust cloud at landing
        this.showJumpDustCloud();
      }
    });
    
    // Arc the creep up during jump
    this.scene.tweens.add({
      targets: this,
      y: '-=40',
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  /**
   * Show dust cloud effect for jump
   */
  private showJumpDustCloud(): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dust = this.scene.add.graphics();
      dust.fillStyle(0xDEB887, 0.7);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);
      dust.setPosition(this.x, this.y + 15);
      dust.setDepth(25);
      
      this.scene.tweens.add({
        targets: dust,
        x: this.x + Math.cos(angle) * 30,
        y: this.y + 15 + Math.sin(angle) * 15,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => dust.destroy()
      });
    }
  }

  /**
   * Update status effects (poison ticks, slow expiry)
   */
  private updateStatusEffects(delta: number, currentTime: number): void {
    // Process poison stacks
    if (this.poisonStacks.length > 0) {
      this.poisonTickTimer += delta;
      
      // Tick every 1000ms (1 second)
      if (this.poisonTickTimer >= 1000) {
        this.poisonTickTimer = 0;
        
        // Calculate total poison damage from active stacks (max 3)
        let totalPoisonDamage = 0;
        this.poisonStacks = this.poisonStacks.filter(stack => {
          if (currentTime < stack.endTime) {
            totalPoisonDamage += stack.damage;
            return true;
          }
          return false;
        });
        
        // Apply poison damage (ignores armor - it's magic)
        if (totalPoisonDamage > 0 && this.isActive) {
          this.currentHealth -= totalPoisonDamage;
          this.updateHealthBar();
          this.showPoisonDamage(totalPoisonDamage);
          
          if (this.currentHealth <= 0) {
            this.die();
          }
        }
      }
    }
    
    // Clear slow if expired
    if (this.slowEndTime > 0 && currentTime >= this.slowEndTime) {
      this.slowAmount = 0;
      this.slowEndTime = 0;
    }
  }

  /**
   * Show poison damage number
   */
  private showPoisonDamage(damage: number): void {
    const text = this.scene.add.text(this.x, this.y - 40, `-${damage}`, {
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Draw status effect indicators
   */
  private drawStatusEffects(currentTime: number): void {
    this.statusGraphics.clear();
    
    const isSlowed = this.slowEndTime > currentTime;
    const isPoisoned = this.poisonStacks.length > 0;
    
    if (isSlowed) {
      // Draw ice particles around creep
      this.statusGraphics.fillStyle(0x87ceeb, 0.6);
      for (let i = 0; i < 4; i++) {
        const angle = (currentTime / 500 + i * Math.PI / 2) % (Math.PI * 2);
        const x = Math.cos(angle) * 18;
        const y = Math.sin(angle) * 10 - 5;
        this.statusGraphics.fillCircle(x, y, 3);
      }
    }
    
    if (isPoisoned) {
      // Draw poison bubbles
      this.statusGraphics.fillStyle(0x00ff00, 0.5);
      const stackCount = Math.min(this.poisonStacks.length, 3);
      for (let i = 0; i < stackCount; i++) {
        const angle = (currentTime / 400 + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 8 + 5;
        this.statusGraphics.fillCircle(x, y, 2 + i);
      }
    }
  }

  /**
   * Apply slow effect (doesn't stack, refreshes duration)
   */
  applySlow(percent: number, durationMs: number): void {
    const currentTime = this.scene.time.now;
    this.slowAmount = percent;
    this.slowEndTime = currentTime + durationMs;
  }

  /**
   * Apply poison effect (stacks up to 3 times)
   */
  applyPoison(damagePerSecond: number, durationMs: number): void {
    const currentTime = this.scene.time.now;
    
    // Max 3 stacks
    if (this.poisonStacks.length >= 3) {
      // Refresh oldest stack
      this.poisonStacks[0] = {
        damage: damagePerSecond,
        endTime: currentTime + durationMs
      };
    } else {
      this.poisonStacks.push({
        damage: damagePerSecond,
        endTime: currentTime + durationMs
      });
    }
  }

  /**
   * Take damage from a tower
   */
  takeDamage(amount: number, isMagic: boolean = false): number {
    // Don't take damage if already dead
    if (!this.isActive) {
      return 0;
    }
    
    // Check if shield blocks the hit
    if (this.shieldHitsRemaining > 0) {
      this.shieldHitsRemaining--;
      this.showShieldBlockEffect();
      this.updateShieldVisual();
      
      // Shield breaks completely - show break effect
      if (this.shieldHitsRemaining === 0) {
        this.showShieldBreakEffect();
      }
      
      return 0; // No damage taken
    }
    
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
   * Show shield block effect
   */
  private showShieldBlockEffect(): void {
    // Flash the shield
    this.scene.tweens.add({
      targets: this.shieldGraphics,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
    
    // Show "BLOCKED" text
    const text = this.scene.add.text(this.x, this.y - 50, 'BLOCKED', {
      fontSize: '14px',
      color: '#00BFFF',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 25,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show shield break effect
   */
  private showShieldBreakEffect(): void {
    // Create shield fragments
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fragment = this.scene.add.graphics();
      fragment.fillStyle(0x00BFFF, 0.8);
      fragment.fillCircle(0, 0, 5);
      fragment.setPosition(this.x, this.y - 5);
      fragment.setDepth(100);
      
      this.scene.tweens.add({
        targets: fragment,
        x: this.x + Math.cos(angle) * 50,
        y: this.y - 5 + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        onComplete: () => fragment.destroy()
      });
    }
    
    // Show "SHIELD BROKEN" text
    const text = this.scene.add.text(this.x, this.y - 60, 'SHIELD BROKEN!', {
      fontSize: '16px',
      color: '#FF6347',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Called when creep reaches the castle
   */
  private reachEnd(): void {
    // Prevent multiple calls
    if (!this.isActive) {
      console.log('Creep.reachEnd: Already inactive, skipping');
      return;
    }
    
    console.log(`Creep.reachEnd: Creep reached end at (${this.x}, ${this.y})`);
    this.isActive = false;
    this.emit('reachedEnd', this);
    this.deactivate();
  }

  /**
   * Called when creep dies
   */
  private die(): void {
    // Prevent multiple death calls
    if (!this.isActive || this.isDying) {
      console.log('Creep.die: Already dead/dying, skipping');
      return;
    }
    
    this.isActive = false;
    this.isDying = true;
    
    // Store gold reward before any state changes
    const goldReward = this.config.goldReward;
    
    console.log(`Creep.die: Creep dying, goldReward=${goldReward}`);
    
    // Emit the died event IMMEDIATELY so the creep is removed from active list
    // This prevents the creep from being reused while the death animation plays
    this.emit('died', this, goldReward);
    
    // Death effect animation (purely visual, doesn't affect game state)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete: () => {
        console.log('Creep.die: Death tween complete, deactivating');
        this.deactivate();
      }
    });
  }

  /**
   * Deactivate and return to pool
   */
  deactivate(): void {
    this.isActive = false;
    this.isDying = false;
    this.setActive(false);
    this.setVisible(false);
    this.setAlpha(1);
    this.setScale(1);
    this.bodyGraphics.clear();
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    this.statusGraphics.clear();
    this.shieldGraphics.clear();
    
    // Reset status effects
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.poisonStacks = [];
    this.poisonTickTimer = 0;
    
    // Reset abilities
    this.shieldHitsRemaining = 0;
    this.jumpCooldown = 0;
    this.isJumping = false;
    this.jumpWarningTime = 0;
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
   * Check if creep can be reused (not active AND not dying)
   */
  canBeReused(): boolean {
    return !this.isActive && !this.isDying;
  }

  /**
   * Get current health
   */
  getCurrentHealth(): number {
    return this.currentHealth;
  }
}
