import Phaser from 'phaser';

/**
 * CannonAnimator provides dynamic animated graphics for the Rock Cannon tower.
 * Features:
 * - Rotating cannon that tracks targets (top-down view)
 * - Recoil animation when firing
 * - Smoke/blast effect at muzzle
 * - Cheering animation on kills (fist pump)
 */
export class CannonAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Cannon container (holds all rotating parts, positioned at tower top)
  private cannonContainer: Phaser.GameObjects.Container;
  private operatorGraphics: Phaser.GameObjects.Graphics;
  private cannonGraphics: Phaser.GameObjects.Graphics;
  private effectGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private cannonAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;
  
  // Recoil animation
  private recoilProgress: number = 0;  // 0 = normal, 1 = fully recoiled
  private isRecoiling: boolean = false;
  
  // Muzzle blast
  private blastTimer: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Tower heights per level (Y position of operator from tower base at y=0)
  private readonly OPERATOR_Y = [-30, -38, -45];
  
  // Cannon barrel length for projectile spawn
  private readonly BARREL_LENGTH = [25, 32, 42];
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics (static tower, doesn't rotate)
    this.baseGraphics = scene.add.graphics();
    
    // Create cannon container that will rotate as a unit
    this.cannonContainer = scene.add.container(0, this.OPERATOR_Y[level - 1]);
    this.cannonContainer.setScale(1.3);  // Scale up character 30%
    
    // Create graphics for rotating parts
    this.operatorGraphics = scene.add.graphics();
    this.cannonGraphics = scene.add.graphics();
    this.effectGraphics = scene.add.graphics();
    
    // Add rotating parts to cannon container
    this.cannonContainer.add([
      this.cannonGraphics,
      this.operatorGraphics,
      this.effectGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.cannonContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawOperator();
    this.drawCannon();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.cannonContainer.setY(this.OPERATOR_Y[level - 1]);
    this.drawBase();
    this.drawOperator();
    this.drawCannon();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth cannon rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.cannonAngle);
      const rotationSpeed = 4.0;  // Cannon rotates slower than other towers
      
      if (Math.abs(angleDiff) > 0.01) {
        this.cannonAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.cannonAngle = Phaser.Math.Angle.Wrap(this.cannonAngle);
      }
    }
    
    // Update recoil animation
    if (this.isRecoiling) {
      this.recoilProgress = Math.max(0, this.recoilProgress - 3.0 * dt);
      if (this.recoilProgress <= 0) {
        this.isRecoiling = false;
      }
      this.drawCannon();
    }
    
    // Muzzle blast
    if (this.blastTimer > 0) {
      this.blastTimer -= dt;
      this.drawBlast();
    }
    
    // Update cheering animation
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 15) * 0.5 + 0.5;
      
      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawOperator();
    }
    
    // Apply rotation to cannon container
    this.cannonContainer.setRotation(this.cannonAngle);
  }
  
  /**
   * Set target position for cannon to aim at
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    // Cannon points UP in local space, so add PI/2
    const operatorWorldY = towerY + this.OPERATOR_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, operatorWorldY, targetX, targetY) + Math.PI / 2;
  }
  
  /**
   * Clear target - cannon returns to idle
   */
  clearTarget(): void {
    this.hasTarget = false;
  }
  
  /**
   * Called when tower fires
   */
  onFire(): { x: number; y: number } {
    // Trigger recoil
    this.isRecoiling = true;
    this.recoilProgress = 1.0;
    
    // Trigger blast effect
    this.blastTimer = 0.2;
    
    this.drawCannon();
    this.drawBlast();
    
    return this.getProjectileSpawnOffset();
  }
  
  /**
   * Get the projectile spawn position offset from tower center
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    // Cannon tip in local space (points UP, so negative Y)
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const localX = 0;
    const localY = -barrelLength;
    
    // Transform by rotation
    const cos = Math.cos(this.cannonAngle);
    const sin = Math.sin(this.cannonAngle);
    
    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;
    
    // Add the cannon container's Y offset
    return {
      x: rotatedX,
      y: rotatedY + this.OPERATOR_Y[this.level - 1]
    };
  }
  
  /**
   * Called when cannon kills a creep - triggers cheering
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
  }
  
  /**
   * Draw the static tower base
   */
  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();
    
    const level = this.level;
    
    // Shadow - consistent size
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 55, 20);
    
    const baseWidth = 36;
    const towerHeight = 38;
    
    // Base platform - reinforced concrete/metal
    if (level === 1) {
      // Wooden reinforced base
      g.fillStyle(0x6b5344, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
      g.fillStyle(0x7b6354, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 16);
      // Metal bands
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 3);
      g.fillRect(-baseWidth, 25, baseWidth * 2, 3);
    } else if (level === 2) {
      // Metal plated base
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 24);
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 20);
      // Rivets
      g.fillStyle(0x3a3a3a, 1);
      for (let i = -baseWidth + 6; i < baseWidth - 4; i += 10) {
        g.fillCircle(i, 14, 2);
        g.fillCircle(i, 26, 2);
      }
    } else {
      // Heavy fortified base
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 28);
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 24);
      // Brass trim
      g.fillStyle(0xb8860b, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 3);
      g.fillRect(-baseWidth, 33, baseWidth * 2, 3);
      // Heavy rivets
      g.fillStyle(0x8b6914, 1);
      for (let i = -baseWidth + 6; i < baseWidth - 4; i += 8) {
        g.fillCircle(i, 14, 3);
        g.fillCircle(i, 28, 3);
      }
    }
    
    // Tower body - bunker style
    if (level === 1) {
      g.fillStyle(0x7b6354, 1);
      g.beginPath();
      g.moveTo(-26, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(26, 10);
      g.closePath();
      g.fillPath();
      // Window slit
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-6, -25, 12, 8);
    } else if (level === 2) {
      g.fillStyle(0x5a5a5a, 1);
      g.beginPath();
      g.moveTo(-30, 10);
      g.lineTo(-26, -towerHeight);
      g.lineTo(26, -towerHeight);
      g.lineTo(30, 10);
      g.closePath();
      g.fillPath();
      // Reinforced corners
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-32, -towerHeight, 8, towerHeight + 10);
      g.fillRect(24, -towerHeight, 8, towerHeight + 10);
      // View slits
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-8, -30, 16, 10);
      g.fillRect(-8, -55, 16, 8);
    } else {
      g.fillStyle(0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(-36, 10);
      g.lineTo(-32, -towerHeight);
      g.lineTo(32, -towerHeight);
      g.lineTo(36, 10);
      g.closePath();
      g.fillPath();
      // Heavy armor plating
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-38, -towerHeight, 10, towerHeight + 10);
      g.fillRect(28, -towerHeight, 10, towerHeight + 10);
      // Brass decorations
      g.fillStyle(0xb8860b, 1);
      g.fillRect(-36, -towerHeight, 72, 4);
      g.fillRect(-36, -towerHeight + 30, 72, 2);
      // Armored slits
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, -35, 20, 12);
      g.fillRect(-10, -65, 20, 10);
    }
    
    // Ammunition storage visible at base
    if (level >= 2) {
      g.fillStyle(0x8b6914, 1);
      g.fillCircle(-18, -10, 6);
      g.fillCircle(-8, -10, 6);
      g.fillStyle(0xa07a1a, 1);
      g.fillCircle(-18, -12, 3);
      g.fillCircle(-8, -12, 3);
    }
    if (level === 3) {
      g.fillCircle(8, -10, 6);
      g.fillCircle(18, -10, 6);
      g.fillStyle(0xa07a1a, 1);
      g.fillCircle(8, -12, 3);
      g.fillCircle(18, -12, 3);
    }
    
    // Platform for cannon
    const platY = this.OPERATOR_Y[level - 1] + 12;
    g.fillStyle(0x4a4a4a, 1);
    g.fillEllipse(0, platY, 34, 14);
    g.fillStyle(0x5a5a5a, 1);
    g.fillEllipse(0, platY - 2, 30, 12);
    // Rotation ring
    g.lineStyle(2, 0x3a3a3a, 1);
    g.strokeEllipse(0, platY - 2, 28, 10);
  }
  
  /**
   * Draw the operator figure - TOP-DOWN VIEW
   */
  private drawOperator(): void {
    const g = this.operatorGraphics;
    g.clear();
    
    const bodyY = 10;
    
    // Colors
    const uniformColor = this.level === 1 ? 0x5c4033 :
                         this.level === 2 ? 0x4a5a3a : 0x3a3a3a;
    const uniformDark = this.level === 1 ? 0x3a2820 :
                        this.level === 2 ? 0x3a4a2a : 0x2a2a2a;
    const skinColor = 0xdeb887;
    const helmetColor = this.level === 1 ? 0xc9a06c :
                        this.level === 2 ? 0x4a5a3a : 0x2a2a2a;
    
    if (this.isCheeringActive) {
      this.drawCheeringOperator(g, bodyY, uniformColor, uniformDark, skinColor, helmetColor);
      return;
    }
    
    // === ARMS bracing against cannon ===
    // Both arms forward on cannon handles
    g.fillStyle(uniformColor, 1);
    g.fillRect(-10, bodyY - 12, 8, 14);  // Left arm
    g.fillRect(2, bodyY - 12, 8, 14);   // Right arm
    
    // Gloved hands on handles
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(-6, bodyY - 14, 4);
    g.fillCircle(6, bodyY - 14, 4);
    
    // === SHOULDERS/BODY ===
    g.fillStyle(uniformColor, 1);
    g.fillEllipse(0, bodyY + 4, 30, 18);
    g.fillStyle(uniformDark, 1);
    g.fillEllipse(-10, bodyY + 4, 6, 12);
    g.fillEllipse(10, bodyY + 4, 6, 12);
    
    // Ear protection muffs visible on sides of head
    if (this.level >= 2) {
      g.fillStyle(0xcc4400, 1);
      g.fillCircle(-12, bodyY - 4, 5);
      g.fillCircle(12, bodyY - 4, 5);
    }
    
    // === HEAD/HELMET ===
    if (this.level === 1) {
      // Hard hat
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
      g.fillStyle(0xd9b07c, 1);
      g.fillCircle(-2, bodyY - 6, 4);  // Highlight
    } else if (this.level === 2) {
      // Military helmet
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.fillStyle(0x3a4a2a, 1);
      g.fillCircle(-3, bodyY - 8, 5);
      // Helmet band
      g.lineStyle(2, 0x2a3a1a, 1);
      g.strokeCircle(0, bodyY - 5, 10);
    } else {
      // Blast visor helmet
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      // Visor
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, bodyY - 14, 20, 8);
      g.fillStyle(0x3a5a6a, 0.5);  // Visor reflection
      g.fillRect(-8, bodyY - 13, 6, 6);
      // Brass trim
      g.lineStyle(2, 0xb8860b, 1);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }
  
  /**
   * Draw cheering operator
   */
  private drawCheeringOperator(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    uniformColor: number,
    uniformDark: number,
    skinColor: number,
    helmetColor: number
  ): void {
    const pumpOffset = this.cheerArmAngle * 8;
    
    // === SHOULDERS/BODY ===
    g.fillStyle(uniformColor, 1);
    g.fillEllipse(0, bodyY + 4, 30, 18);
    g.fillStyle(uniformDark, 1);
    g.fillEllipse(-10, bodyY + 4, 6, 12);
    g.fillEllipse(10, bodyY + 4, 6, 12);
    
    // === ARM raised in fist pump ===
    g.fillStyle(uniformColor, 1);
    g.fillRect(-4, bodyY - 18 - pumpOffset, 8, 18);
    
    // Fist
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, bodyY - 20 - pumpOffset, 5);
    
    // Other arm down
    g.fillStyle(uniformColor, 1);
    g.fillRect(8, bodyY - 4, 8, 10);
    g.fillStyle(skinColor, 1);
    g.fillCircle(12, bodyY + 4, 4);
    
    // === HEAD/HELMET ===
    if (this.level === 1) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
    } else if (this.level === 2) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.lineStyle(2, 0x2a3a1a, 1);
      g.strokeCircle(0, bodyY - 5, 10);
      // Ear muffs
      g.fillStyle(0xcc4400, 1);
      g.fillCircle(-12, bodyY - 4, 5);
      g.fillCircle(12, bodyY - 4, 5);
    } else {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, bodyY - 14, 20, 8);
      g.lineStyle(2, 0xb8860b, 1);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }
  
  /**
   * Draw the cannon - points UP in local space
   */
  private drawCannon(): void {
    const g = this.cannonGraphics;
    g.clear();
    
    const bodyY = 10;
    const recoilOffset = this.recoilProgress * 8;
    
    // Cannon colors
    const barrelColor = this.level === 1 ? 0x4a4a4a :
                        this.level === 2 ? 0x3a3a3a : 0x2a2a2a;
    const barrelHighlight = this.level === 1 ? 0x5a5a5a :
                            this.level === 2 ? 0x4a4a4a : 0x3a3a3a;
    const brassColor = 0xb8860b;
    
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const barrelWidth = 8 + this.level * 2;
    
    // === CANNON BASE (fixed part) ===
    g.fillStyle(barrelColor, 1);
    g.fillCircle(0, bodyY - 6, 10 + this.level * 2);
    g.fillStyle(barrelHighlight, 1);
    g.fillCircle(-2, bodyY - 8, 4 + this.level);
    
    // === CANNON BARREL (recoils) ===
    // Main barrel
    g.fillStyle(barrelColor, 1);
    g.fillRect(-barrelWidth / 2, bodyY - barrelLength + recoilOffset, barrelWidth, barrelLength - 4);
    
    // Barrel highlight
    g.fillStyle(barrelHighlight, 1);
    g.fillRect(-barrelWidth / 2 + 2, bodyY - barrelLength + 4 + recoilOffset, 3, barrelLength - 10);
    
    // Muzzle brake (widened end)
    g.fillStyle(barrelColor, 1);
    g.fillRect(-barrelWidth / 2 - 2, bodyY - barrelLength - 4 + recoilOffset, barrelWidth + 4, 6);
    
    // Reinforcement rings
    g.lineStyle(2, barrelHighlight, 1);
    g.strokeRect(-barrelWidth / 2 - 1, bodyY - barrelLength / 2 + recoilOffset, barrelWidth + 2, 4);
    
    // Level 2+: Add brass fittings
    if (this.level >= 2) {
      g.fillStyle(brassColor, 1);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - barrelLength - 2 + recoilOffset, barrelWidth + 2, 3);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - 8, barrelWidth + 2, 3);
    }
    
    // Level 3: Add decorative elements
    if (this.level === 3) {
      // Sight on top of barrel
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-2, bodyY - barrelLength / 2 - 4 + recoilOffset, 4, 8);
      // Extra brass rings
      g.fillStyle(brassColor, 1);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - barrelLength / 2 - 2 + recoilOffset, barrelWidth + 2, 2);
    }
    
    // Cannon handles (for operator to grip)
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-14, bodyY - 10, 4, 8);
    g.fillRect(10, bodyY - 10, 4, 8);
  }
  
  /**
   * Draw muzzle blast effect
   */
  private drawBlast(): void {
    const g = this.effectGraphics;
    g.clear();
    
    if (this.blastTimer <= 0) return;
    
    const alpha = this.blastTimer / 0.2;
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const blastY = 10 - barrelLength - 5;
    
    // Smoke puffs
    g.fillStyle(0x666666, alpha * 0.6);
    g.fillCircle(-8, blastY - 5, 8 * (1 + (1 - alpha) * 0.5));
    g.fillCircle(8, blastY - 5, 8 * (1 + (1 - alpha) * 0.5));
    g.fillCircle(0, blastY - 10, 10 * (1 + (1 - alpha) * 0.5));
    
    // Muzzle flash
    g.fillStyle(0xffaa00, alpha * 0.8);
    g.fillCircle(0, blastY, 6);
    g.fillStyle(0xffff00, alpha);
    g.fillCircle(0, blastY, 3);
    
    // Flash rays
    g.lineStyle(2, 0xffaa00, alpha * 0.6);
    g.lineBetween(0, blastY, -10, blastY - 12);
    g.lineBetween(0, blastY, 10, blastY - 12);
    g.lineBetween(0, blastY, 0, blastY - 15);
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.operatorGraphics.destroy();
    this.cannonGraphics.destroy();
    this.effectGraphics.destroy();
    this.cannonContainer.destroy();
  }
}
