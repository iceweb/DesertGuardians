import Phaser from 'phaser';

/**
 * ArcherAnimator provides dynamic animated graphics for the Archer tower.
 * Features:
 * - Rotating archer that tracks targets (top-down view)
 * - Bow draw animation when firing
 * - Arrow release visual
 * - Cheering animation on kills
 */
export class ArcherAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Archer container (holds all rotating parts, positioned at tower top)
  private archerContainer: Phaser.GameObjects.Container;
  private archerGraphics: Phaser.GameObjects.Graphics;
  private bowGraphics: Phaser.GameObjects.Graphics;
  private arrowGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private archerAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;
  
  // Bow draw animation
  private bowDrawProgress: number = 0;  // 0 = relaxed, 1 = fully drawn
  private isDrawing: boolean = false;
  private drawSpeed: number = 4.0;  // How fast to draw bow
  
  // Arrow release flash
  private arrowReleaseTimer: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Tower heights per level (Y position of archer from tower base at y=0)
  private readonly ARCHER_Y = [-35, -42, -50];
  
  // Bow position in local space (used for arrow spawn calculation)
  private readonly BOW_LOCAL_X = -20;
  private readonly BOW_LOCAL_Y = 10;
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics (static tower, doesn't rotate)
    this.baseGraphics = scene.add.graphics();
    
    // Create archer container that will rotate as a unit
    this.archerContainer = scene.add.container(0, this.ARCHER_Y[level - 1]);
    this.archerContainer.setScale(1.3);  // Scale up character 30%
    
    // Create graphics for rotating parts
    this.archerGraphics = scene.add.graphics();
    this.bowGraphics = scene.add.graphics();
    this.arrowGraphics = scene.add.graphics();
    
    // Add rotating parts to archer container
    this.archerContainer.add([
      this.archerGraphics,
      this.bowGraphics,
      this.arrowGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.archerContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawArcher();
    this.drawBow();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.archerContainer.setY(this.ARCHER_Y[level - 1]);
    this.drawBase();
    this.drawArcher();
    this.drawBow();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth archer rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.archerAngle);
      const rotationSpeed = 6.0;
      
      if (Math.abs(angleDiff) > 0.01) {
        this.archerAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.archerAngle = Phaser.Math.Angle.Wrap(this.archerAngle);
      }
    }
    
    // Update bow draw
    if (this.isDrawing) {
      this.bowDrawProgress = Math.min(1, this.bowDrawProgress + this.drawSpeed * dt);
    } else {
      // Slowly relax bow when not drawing
      this.bowDrawProgress = Math.max(0, this.bowDrawProgress - 2.0 * dt);
    }
    
    // Arrow release flash
    if (this.arrowReleaseTimer > 0) {
      this.arrowReleaseTimer -= dt;
    }
    
    // Update cheering animation
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 15) * 0.5 + 0.5;
      
      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawArcher();
      this.drawBow();
    }
    
    // Apply rotation to archer container
    // The bow points LEFT in local space, and targetAngle already accounts for this
    this.archerContainer.setRotation(this.archerAngle);
    
    // Redraw bow based on draw progress
    if (this.bowDrawProgress > 0 || this.arrowReleaseTimer > 0) {
      this.drawBow();
      this.drawArrowRelease();
    }
  }
  
  /**
   * Set target position for archer to aim at
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    // Calculate angle from archer to target
    // The archer is drawn with bow pointing to the LEFT (-X in local space)
    // So we need to offset by PI to make the bow point at the target
    const archerWorldY = towerY + this.ARCHER_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, archerWorldY, targetX, targetY) + Math.PI;
    this.isDrawing = true;  // Start drawing bow when targeting
  }
  
  /**
   * Clear target - archer returns to idle
   */
  clearTarget(): void {
    this.hasTarget = false;
    this.isDrawing = false;
  }
  
  /**
   * Called when tower fires
   */
  onFire(): { x: number; y: number } {
    // Release arrow - trigger flash
    this.arrowReleaseTimer = 0.15;
    this.bowDrawProgress = 0;  // Bow snaps back
    
    // Start drawing again immediately if still targeting
    if (this.hasTarget) {
      this.isDrawing = true;
    }
    
    this.drawBow();
    this.drawArrowRelease();
    
    return this.getProjectileSpawnOffset();
  }
  
  /**
   * Get the arrow spawn position offset from tower center
   * The bow is at (BOW_LOCAL_X, BOW_LOCAL_Y) in local archer space, pointing LEFT
   * After rotation, we need to transform this to tower-relative coordinates
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    // Bow position in archer-local space
    const bowLocalX = this.BOW_LOCAL_X;
    const bowLocalY = this.BOW_LOCAL_Y;
    
    // The archerContainer is at ARCHER_Y and rotated by archerAngle
    // Transform bow position by rotation
    const cos = Math.cos(this.archerAngle);
    const sin = Math.sin(this.archerAngle);
    
    // Rotate the local bow position
    const rotatedX = bowLocalX * cos - bowLocalY * sin;
    const rotatedY = bowLocalX * sin + bowLocalY * cos;
    
    // Add the archer container's Y offset
    const archerY = this.ARCHER_Y[this.level - 1];
    
    return {
      x: rotatedX,
      y: rotatedY + archerY
    };
  }
  
  /**
   * Called when archer kills a creep - triggers cheering
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
    this.isDrawing = false;  // Stop drawing to cheer
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
    g.fillEllipse(0, 25, 50, 18);
    
    const baseWidth = 32;
    const towerHeight = 42;
    
    // Base platform
    if (level === 1) {
      // Wooden base
      g.fillStyle(0x8b5a2b, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x9a6a3b, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      g.lineStyle(1, 0x6b4020, 0.4);
      for (let i = -baseWidth + 6; i < baseWidth - 6; i += 8) {
        g.lineBetween(i, 10, i, 24);
      }
    } else if (level === 2) {
      // Stone base
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 22);
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 18);
      g.lineStyle(1, 0x6b5344, 0.5);
      g.lineBetween(-baseWidth + 4, 17, baseWidth - 4, 17);
      g.lineBetween(-10, 10, -10, 28);
      g.lineBetween(10, 10, 10, 28);
    } else {
      // Grand marble base with gold
      g.fillStyle(0xa89375, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 26);
      g.fillStyle(0xc8b395, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 22);
      g.lineStyle(2, 0xffd700, 0.8);
      g.lineBetween(-baseWidth, 8, baseWidth, 8);
      g.lineBetween(-baseWidth, 34, baseWidth, 34);
      g.fillStyle(0xffd700, 0.6);
      g.fillRect(-baseWidth - 3, 5, 6, 32);
      g.fillRect(baseWidth - 3, 5, 6, 32);
    }
    
    // Tower body
    if (level === 1) {
      g.fillStyle(0xb88a5c, 1);
      g.beginPath();
      g.moveTo(-22, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(22, 10);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0x8b6a3c, 0.5);
      g.lineBetween(-20, -15, 20, -15);
      g.lineBetween(-19, -35, 19, -35);
    } else if (level === 2) {
      g.fillStyle(0xd4a574, 1);
      g.beginPath();
      g.moveTo(-26, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(26, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-28, -towerHeight, 8, towerHeight + 10);
      g.fillRect(20, -towerHeight, 8, towerHeight + 10);
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -35, 16, 22);
      g.fillStyle(0xe8c896, 1);
      g.fillRect(-10, -38, 20, 4);
    } else {
      g.fillStyle(0xe4b584, 1);
      g.beginPath();
      g.moveTo(-32, 10);
      g.lineTo(-28, -towerHeight);
      g.lineTo(28, -towerHeight);
      g.lineTo(32, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xf8d8a6, 1);
      g.beginPath();
      g.moveTo(-24, 5);
      g.lineTo(-20, -towerHeight + 5);
      g.lineTo(20, -towerHeight + 5);
      g.lineTo(24, 5);
      g.closePath();
      g.fillPath();
      // Flying buttresses
      g.fillStyle(0xc9a06c, 1);
      g.beginPath();
      g.moveTo(-40, 25);
      g.lineTo(-32, -30);
      g.lineTo(-28, -30);
      g.lineTo(-32, 25);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(40, 25);
      g.lineTo(32, -30);
      g.lineTo(28, -30);
      g.lineTo(32, 25);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, 0xffd700, 0.9);
      g.strokeRect(-10, -38, 20, 28);
      g.strokeRect(-10, -75, 20, 28);
    }
    
    // Windows
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -30, 16, 22);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -28, 10, 18);
    
    if (level >= 2) {
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -60, 16, 18);
      g.fillStyle(0x1a0a00, 1);
      g.fillRect(-5, -58, 10, 14);
    }
    
    // Battlements
    const battY = -towerHeight - 10;
    if (level === 1) {
      g.fillStyle(0xa98a5c, 1);
      g.fillRect(-20, battY, 10, 10);
      g.fillRect(-5, battY, 10, 10);
      g.fillRect(10, battY, 10, 10);
    } else if (level === 2) {
      g.fillStyle(0xbaa27c, 1);
      g.fillRect(-24, battY, 8, 12);
      g.fillRect(-8, battY, 8, 12);
      g.fillRect(8, battY, 8, 12);
      g.fillRect(16, battY, 8, 12);
    } else {
      g.fillStyle(0xcab28c, 1);
      for (let i = -28; i <= 22; i += 10) {
        g.fillRect(i, battY - 5, 8, 16);
      }
      g.lineStyle(1, 0xffd700, 0.7);
      for (let i = -28; i <= 22; i += 10) {
        g.strokeRect(i, battY - 5, 8, 16);
      }
    }
    
    // Platform (circular top where archer stands)
    const platY = this.ARCHER_Y[level - 1] + 10;
    g.fillStyle(0x8b7355, 1);
    g.fillEllipse(0, platY, 30, 12);
    g.fillStyle(0x9a8265, 1);
    g.fillEllipse(0, platY - 2, 26, 10);
  }
  
  /**
   * Draw the archer figure - TOP-DOWN VIEW
   * We see: top of hood/helmet, shoulders, arms with bow
   */
  private drawArcher(): void {
    const g = this.archerGraphics;
    g.clear();
    
    // Archer body at center, facing "forward" (negative Y in local space)
    const bodyY = 10;
    
    // Colors
    const cloakColor = this.level === 1 ? 0x2d5016 : 
                       this.level === 2 ? 0x1a4d1a : 0x0d3d0d;  // Green cloak, darker at higher levels
    const cloakDark = this.level === 1 ? 0x1d4010 :
                      this.level === 2 ? 0x0d3d0d : 0x062d06;
    const cloakLight = this.level === 1 ? 0x3d6026 :
                       this.level === 2 ? 0x2a5d2a : 0x1d4d1d;
    const skinColor = 0xdeb887;
    const leatherColor = 0x5c4033;
    const leatherDark = 0x3a2820;
    const metalColor = 0x6a6a6a;
    
    if (this.isCheeringActive) {
      // === CHEERING POSE ===
      this.drawCheeringArcher(g, bodyY, cloakColor, cloakDark, cloakLight, skinColor);
      return;
    }
    
    if (this.level === 1) {
      // --- LEVEL 1: Simple ranger ---
      
      // === ARMS (bow arm left, draw arm right from archer's POV) ===
      // Left arm holding bow (extends to the left side)
      g.fillStyle(cloakColor, 1);
      g.fillRect(-18, bodyY - 6, 12, 8);
      g.fillStyle(skinColor, 1);
      g.fillCircle(-20, bodyY - 2, 4);  // Left hand on bow
      
      // Right arm drawing string (pulls back behind body)
      const drawPull = this.bowDrawProgress * 8;
      g.fillStyle(cloakColor, 1);
      g.fillRect(6, bodyY - 4 + drawPull, 10, 8);
      g.fillStyle(skinColor, 1);
      g.fillCircle(10, bodyY + 2 + drawPull, 4);  // Right hand on string
      
      // === SHOULDERS/CLOAK ===
      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 6, 22, 14);
      g.fillStyle(cloakDark, 1);
      g.fillEllipse(-8, bodyY + 6, 6, 12);
      g.fillEllipse(8, bodyY + 6, 6, 12);
      g.fillStyle(cloakLight, 1);
      g.fillEllipse(0, bodyY + 8, 8, 6);
      
      // === HOOD (top view) ===
      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
      // Hood peak at front
      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-6, bodyY - 10);
      g.lineTo(0, bodyY - 16);
      g.lineTo(6, bodyY - 10);
      g.closePath();
      g.fillPath();
      // Hood highlight
      g.fillStyle(cloakLight, 1);
      g.fillCircle(-2, bodyY - 6, 4);
      
    } else if (this.level === 2) {
      // --- LEVEL 2: Skilled archer with leather armor ---
      
      // === ARMS ===
      g.fillStyle(leatherColor, 1);
      g.fillRect(-20, bodyY - 7, 14, 9);
      g.fillStyle(leatherDark, 1);
      g.fillRect(-20, bodyY - 7, 3, 9);
      g.fillStyle(skinColor, 1);
      g.fillCircle(-22, bodyY - 2, 5);
      
      const drawPull = this.bowDrawProgress * 10;
      g.fillStyle(leatherColor, 1);
      g.fillRect(6, bodyY - 5 + drawPull, 12, 9);
      g.fillStyle(skinColor, 1);
      g.fillCircle(12, bodyY + 2 + drawPull, 5);
      
      // Leather arm guard on draw arm
      g.fillStyle(leatherDark, 1);
      g.fillRect(8, bodyY - 2 + drawPull, 6, 5);
      
      // === SHOULDERS with leather pauldrons ===
      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 6, 26, 16);
      g.fillStyle(leatherColor, 1);
      g.fillCircle(-10, bodyY + 4, 7);
      g.fillCircle(10, bodyY + 4, 7);
      g.fillStyle(leatherDark, 1);
      g.fillCircle(-10, bodyY + 4, 4);
      g.fillCircle(10, bodyY + 4, 4);
      
      // Back quiver visible
      g.fillStyle(leatherColor, 1);
      g.fillRect(4, bodyY + 2, 8, 16);
      g.fillStyle(0x8b7355, 1);  // Arrow fletchings
      for (let i = 0; i < 3; i++) {
        g.fillRect(5 + i * 2, bodyY + 3, 2, 4);
      }
      
      // === HOOD ===
      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-8, bodyY - 12);
      g.lineTo(0, bodyY - 20);
      g.lineTo(8, bodyY - 12);
      g.closePath();
      g.fillPath();
      g.fillStyle(cloakLight, 1);
      g.fillCircle(-3, bodyY - 8, 5);
      
    } else {
      // --- LEVEL 3: Master archer with elite gear ---
      
      // === ARMS with metal vambraces ===
      g.fillStyle(cloakColor, 1);
      g.fillRect(-22, bodyY - 8, 16, 10);
      g.fillStyle(metalColor, 1);
      g.fillRect(-20, bodyY - 6, 6, 6);  // Metal vambrace
      g.fillStyle(skinColor, 1);
      g.fillCircle(-24, bodyY - 3, 5);
      
      const drawPull = this.bowDrawProgress * 12;
      g.fillStyle(cloakColor, 1);
      g.fillRect(6, bodyY - 6 + drawPull, 14, 10);
      g.fillStyle(metalColor, 1);
      g.fillRect(10, bodyY - 4 + drawPull, 6, 6);  // Metal vambrace
      g.fillStyle(skinColor, 1);
      g.fillCircle(14, bodyY + 2 + drawPull, 5);
      
      // === SHOULDERS with metal pauldrons ===
      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 7, 30, 18);
      g.fillStyle(metalColor, 1);
      g.fillEllipse(-12, bodyY + 4, 10, 12);
      g.fillEllipse(12, bodyY + 4, 10, 12);
      g.fillStyle(0x8a8a8a, 1);
      g.fillEllipse(-12, bodyY + 3, 6, 8);
      g.fillEllipse(12, bodyY + 3, 6, 8);
      
      // Elite quiver
      g.fillStyle(leatherColor, 1);
      g.fillRect(5, bodyY + 2, 10, 18);
      g.fillStyle(0xffd700, 0.5);  // Gold trim
      g.fillRect(5, bodyY + 2, 10, 2);
      g.fillStyle(0x8b7355, 1);  // Arrow fletchings
      for (let i = 0; i < 4; i++) {
        g.fillRect(6 + i * 2, bodyY + 4, 2, 4);
      }
      
      // === HELMET (instead of hood) ===
      g.fillStyle(metalColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      // Helmet crest
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-3, bodyY - 18, 6, 10);
      // Helmet highlight
      g.fillStyle(0x8a8a8a, 1);
      g.fillCircle(-4, bodyY - 10, 6);
      // Face guard
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-8, bodyY - 16, 16, 6);
      // Gold trim on helmet
      g.lineStyle(2, 0xffd700, 0.8);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }
  
  /**
   * Draw cheering archer pose - raises bow overhead in victory
   */
  private drawCheeringArcher(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    cloakColor: number,
    cloakDark: number,
    _cloakLight: number,
    skinColor: number
  ): void {
    // Pumping bow up and down overhead
    const pumpOffset = this.cheerArmAngle * 8;
    
    // Bow colors
    const bowWood = this.level === 1 ? 0x8b4513 :
                    this.level === 2 ? 0x654321 : 0x4a3728;
    
    // === SHOULDERS/CLOAK (base) ===
    g.fillStyle(cloakColor, 1);
    g.fillEllipse(0, bodyY + 6, 28, 18);
    g.fillStyle(cloakDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 12);
    g.fillEllipse(8, bodyY + 6, 6, 12);
    
    // Quiver still visible on back
    if (this.level >= 2) {
      g.fillStyle(0x5c4033, 1);
      g.fillRect(4, bodyY + 2, 8, 14);
      g.fillStyle(0x8b7355, 1);
      for (let i = 0; i < 3; i++) {
        g.fillRect(5 + i * 2, bodyY + 3, 2, 4);
      }
    }
    
    // === ARMS raised holding bow overhead ===
    // Both arms go up to hold the bow
    g.fillStyle(cloakColor, 1);
    // Left arm reaching up
    g.fillRect(-12, bodyY - 18 - pumpOffset, 8, 16);
    // Right arm reaching up
    g.fillRect(4, bodyY - 18 - pumpOffset, 8, 16);
    
    // Hands gripping bow
    g.fillStyle(skinColor, 1);
    g.fillCircle(-8, bodyY - 20 - pumpOffset, 4);
    g.fillCircle(8, bodyY - 20 - pumpOffset, 4);
    
    // === BOW held horizontally overhead ===
    const bowY = bodyY - 24 - pumpOffset;
    const bowLength = 16 + this.level * 3;
    
    // Bow limbs (horizontal)
    g.lineStyle(3 + this.level, bowWood, 1);
    g.lineBetween(-bowLength, bowY, bowLength, bowY);
    
    // Bow curve (slight arc upward)
    g.fillStyle(bowWood, 1);
    g.fillEllipse(0, bowY - 3, bowLength * 1.8, 6);
    g.fillStyle(cloakColor, 1);  // Cut out bottom half
    g.fillRect(-bowLength - 2, bowY, bowLength * 2 + 4, 6);
    
    // Bow tips
    if (this.level === 3) {
      g.fillStyle(0xffd700, 1);
      g.fillCircle(-bowLength, bowY, 3);
      g.fillCircle(bowLength, bowY, 3);
    }
    
    // === HOOD/HELMET ===
    if (this.level < 3) {
      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 4, 10 + this.level);
      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-6, bodyY - 10);
      g.lineTo(0, bodyY - 16);
      g.lineTo(6, bodyY - 10);
      g.closePath();
      g.fillPath();
    } else {
      g.fillStyle(0x6a6a6a, 1);
      g.fillCircle(0, bodyY - 6, 14);
      g.fillStyle(0x8a8a8a, 1);
      g.fillCircle(-4, bodyY - 10, 6);
      // Helmet crest
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-3, bodyY - 18, 6, 8);
    }
  }
  
  /**
   * Draw a curved bow using arc segments
   */
  private drawBowCurve(
    g: Phaser.GameObjects.Graphics,
    x: number,
    yStart: number,
    yEnd: number,
    curveDepth: number
  ): void {
    // Approximate curve with multiple line segments
    const segments = 8;
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = yStart + (yEnd - yStart) * t;
      // Parabolic curve: maximum curve at middle
      const curveOffset = curveDepth * 4 * t * (1 - t);
      points.push({ x: x - curveOffset, y: y });
    }
    
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.strokePath();
  }
  
  /**
   * Draw the bow - curves to the left of the archer
   */
  private drawBow(): void {
    const g = this.bowGraphics;
    g.clear();
    
    if (this.isCheeringActive) {
      // Hide bow when cheering
      return;
    }
    
    const bodyY = 10;
    const bowX = -20;
    
    // Bow colors based on level
    const bowWood = this.level === 1 ? 0x8b4513 :
                    this.level === 2 ? 0x654321 : 0x4a3728;
    const bowLight = this.level === 1 ? 0xa05a23 :
                     this.level === 2 ? 0x755331 : 0x5a4738;
    const stringColor = this.level === 3 ? 0xffd700 : 0xcccccc;
    
    // Bow curve (side view from top - appears as curved line)
    const bowLength = 18 + this.level * 4;
    const bowCurve = 6 + this.level * 2;
    
    // Draw bow limbs using custom curve function
    g.lineStyle(3 + this.level, bowWood, 1);
    this.drawBowCurve(g, bowX, bodyY - bowLength, bodyY + bowLength, bowCurve);
    
    // Bow highlight
    g.lineStyle(1, bowLight, 0.6);
    this.drawBowCurve(g, bowX + 1, bodyY - bowLength + 2, bodyY + bowLength - 2, bowCurve - 1);
    
    // Bow string
    const drawPull = this.bowDrawProgress * (8 + this.level * 2);
    g.lineStyle(1, stringColor, 0.9);
    g.beginPath();
    g.moveTo(bowX, bodyY - bowLength);
    g.lineTo(bowX + drawPull, bodyY);  // String pulled back
    g.lineTo(bowX, bodyY + bowLength);
    g.strokePath();
    
    // Arrow nocked on string (when drawn)
    if (this.bowDrawProgress > 0.2) {
      const arrowTip = bowX - 10 + drawPull;
      const arrowBack = bowX + drawPull + 5;
      
      // Arrow shaft
      g.lineStyle(2, 0x8b7355, 1);
      g.lineBetween(arrowTip, bodyY, arrowBack, bodyY);
      
      // Arrow head
      g.fillStyle(0x6a6a6a, 1);
      g.beginPath();
      g.moveTo(arrowTip - 6, bodyY);
      g.lineTo(arrowTip, bodyY - 3);
      g.lineTo(arrowTip, bodyY + 3);
      g.closePath();
      g.fillPath();
      
      // Fletching
      g.fillStyle(0xcc0000, 0.8);
      g.beginPath();
      g.moveTo(arrowBack, bodyY);
      g.lineTo(arrowBack + 4, bodyY - 3);
      g.lineTo(arrowBack + 4, bodyY + 3);
      g.closePath();
      g.fillPath();
    }
    
    // Level 3: Add decorative elements to bow
    if (this.level === 3) {
      g.fillStyle(0xffd700, 1);
      g.fillCircle(bowX, bodyY - bowLength, 3);
      g.fillCircle(bowX, bodyY + bowLength, 3);
      g.fillCircle(bowX - bowCurve / 2, bodyY, 2);
    }
  }
  
  /**
   * Draw arrow release flash effect
   */
  private drawArrowRelease(): void {
    const g = this.arrowGraphics;
    g.clear();
    
    if (this.arrowReleaseTimer <= 0) return;
    
    const alpha = this.arrowReleaseTimer / 0.15;
    const bodyY = 10;
    
    // Motion blur effect in arrow direction
    g.fillStyle(0xffcc00, alpha * 0.5);
    g.fillRect(-30, bodyY - 2, 20, 4);
    
    // Small flash at bow
    g.fillStyle(0xffffff, alpha * 0.8);
    g.fillCircle(-22, bodyY, 4);
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.archerGraphics.destroy();
    this.bowGraphics.destroy();
    this.arrowGraphics.destroy();
    this.archerContainer.destroy();
  }
}
