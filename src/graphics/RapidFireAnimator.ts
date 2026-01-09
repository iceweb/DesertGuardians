import Phaser from 'phaser';

/**
 * RapidFireAnimator provides dynamic animated graphics for the RapidFire tower.
 * Features:
 * - Rotating turret platform that tracks targets
 * - Spinning Gatling gun barrels
 * - Animated gunner figure
 * - Cheering animation on kills
 */
export class RapidFireAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Turret container (holds all rotating parts, positioned at tower top)
  private turretContainer: Phaser.GameObjects.Container;
  private turretGraphics: Phaser.GameObjects.Graphics;
  private barrelGraphics: Phaser.GameObjects.Graphics;
  private gunnerGraphics: Phaser.GameObjects.Graphics;
  private muzzleFlashGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private turretAngle: number = 0;
  private targetAngle: number = 0;
  private barrelRotation: number = 0;
  private barrelSpinSpeed: number = 0;
  private isFiring: boolean = false;
  private fireCooldown: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Muzzle flash
  private muzzleFlashTimer: number = 0;
  
  // Tower heights per level (Y position of turret pivot from tower base at y=0)
  private readonly TURRET_Y = [-57, -69, -81]; // Negative because up is negative Y
  
  // Barrel tip offset from turret center (for projectile spawn)
  private readonly BARREL_LENGTH = [25, 30, 45];
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics (static, doesn't rotate)
    this.baseGraphics = scene.add.graphics();
    
    // Create turret container that will rotate as a unit
    // Position it at the top of the tower
    this.turretContainer = scene.add.container(0, this.TURRET_Y[level - 1]);
    
    // Create graphics for rotating parts (all drawn centered at 0,0)
    this.turretGraphics = scene.add.graphics();
    this.barrelGraphics = scene.add.graphics();
    this.gunnerGraphics = scene.add.graphics();
    this.muzzleFlashGraphics = scene.add.graphics();
    
    // Add rotating parts to turret container
    this.turretContainer.add([
      this.turretGraphics,
      this.barrelGraphics,
      this.gunnerGraphics,
      this.muzzleFlashGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.turretContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawTurret();
    this.drawBarrels();
    this.drawGunner();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    // Update turret container position for new level
    this.turretContainer.setY(this.TURRET_Y[level - 1]);
    this.drawBase();
    this.drawTurret();
    this.drawBarrels();
    this.drawGunner();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth turret rotation towards target
    const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.turretAngle);
    const rotationSpeed = 5.0; // radians per second
    
    if (Math.abs(angleDiff) > 0.01) {
      this.turretAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
      this.turretAngle = Phaser.Math.Angle.Wrap(this.turretAngle);
    }
    
    // Update barrel spin
    if (this.isFiring || this.barrelSpinSpeed > 0.1) {
      // Accelerate when firing, decelerate otherwise
      if (this.isFiring) {
        const maxSpeed = 20 + this.level * 10; // faster spin at higher levels
        this.barrelSpinSpeed = Math.min(this.barrelSpinSpeed + 50 * dt, maxSpeed);
      } else {
        this.barrelSpinSpeed = Math.max(0, this.barrelSpinSpeed - 10 * dt);
      }
      
      this.barrelRotation += this.barrelSpinSpeed * dt;
      this.drawBarrels();
    }
    
    // Fire cooldown (for muzzle flash timing)
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0) {
        this.isFiring = false;
      }
    }
    
    // Muzzle flash decay
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer -= dt;
      this.drawMuzzleFlash();
    }
    
    // Cheering animation
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      
      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      } else {
        // Pump arms up and down
        this.cheerArmAngle = Math.sin(this.cheerTimer * 20) * 0.5;
      }
      this.drawGunner();
    }
    
    // Rotate the entire turret container
    this.turretContainer.setRotation(this.turretAngle);
  }
  
  /**
   * Set target position for turret tracking
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    // Calculate angle from tower position to target
    // Add PI/2 because the turret graphics point "up" (negative Y) by default
    const turretWorldY = towerY + this.TURRET_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, turretWorldY, targetX, targetY) + Math.PI / 2;
  }
  
  /**
   * Clear target (turret stops tracking)
   */
  clearTarget(): void {
    // Keep current angle, just stop tracking
  }
  
  /**
   * Called when tower fires - returns the barrel tip position for projectile spawn
   */
  onFire(): { x: number; y: number } {
    this.isFiring = true;
    this.fireCooldown = 0.12; // Short cooldown to keep firing state
    this.muzzleFlashTimer = 0.06;
    this.drawMuzzleFlash();
    
    // Calculate barrel tip position in local coordinates
    // Barrel points "up" (negative Y) in local space, then rotated by turretAngle
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const turretY = this.TURRET_Y[this.level - 1];
    
    // The barrel tip is at (0, -barrelLength) in turret-local space
    // After rotation by turretAngle:
    const tipLocalX = Math.sin(this.turretAngle) * barrelLength;
    const tipLocalY = -Math.cos(this.turretAngle) * barrelLength + turretY;
    
    return { x: tipLocalX, y: tipLocalY };
  }
  
  /**
   * Get current barrel tip offset (for projectile spawning)
   */
  getBarrelTipOffset(): { x: number; y: number } {
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const turretY = this.TURRET_Y[this.level - 1];
    
    const tipLocalX = Math.sin(this.turretAngle) * barrelLength;
    const tipLocalY = -Math.cos(this.turretAngle) * barrelLength + turretY;
    
    return { x: tipLocalX, y: tipLocalY };
  }
  
  /**
   * Called when this tower kills a creep
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8; // Cheer for 0.8 seconds
  }
  
  /**
   * Draw the static base of the tower
   */
  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();
    
    const baseWidth = 25 + this.level * 6;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50 + this.level * 8, 18 + this.level * 2);
    
    if (this.level === 1) {
      // Simple sandbag base
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      g.lineStyle(1, 0x6b5344, 0.4);
      for (let y = 8; y < 22; y += 6) {
        g.lineBetween(-baseWidth + 2, y, baseWidth - 2, y);
      }
      // Metal tower body
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-18, -52, 36, 57);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-14, -47, 28, 49);
    } else if (this.level === 2) {
      // Reinforced bunker base
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth + 3, 6, (baseWidth - 3) * 2, 18);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth - 5, 5, 8, 20);
      g.fillRect(baseWidth - 3, 5, 8, 20);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-22, 14, 3);
      g.fillCircle(22, 14, 3);
      // Reinforced tower
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-24, -64, 48, 69);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-20, -59, 40, 61);
      // Ammo storage
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(20, -45, 10, 30);
      g.fillStyle(0xffcc00, 0.6);
      g.fillCircle(25, -30, 4);
    } else {
      // Massive fortress base
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-baseWidth + 4, 4, (baseWidth - 4) * 2, 20);
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth - 8, 2, 12, 24);
      g.fillRect(baseWidth - 4, 2, 12, 24);
      g.fillStyle(0x2a2a2a, 1);
      for (let x = -28; x <= 28; x += 14) {
        g.fillCircle(x, 12, 3);
      }
      // Warning stripes
      g.fillStyle(0xffcc00, 1);
      g.fillRect(-baseWidth - 6, -2, 10, 6);
      g.fillRect(baseWidth - 4, -2, 10, 6);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-baseWidth - 3, -2, 3, 6);
      g.fillRect(baseWidth, -2, 3, 6);
      // Heavy armored tower
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-30, -76, 60, 78);
      g.fillStyle(0x7a7a7a, 1);
      g.fillRect(-26, -71, 52, 69);
      // Side armor
      g.fillStyle(0x5a5a5a, 0.9);
      g.fillRect(-36, -61, 10, 45);
      g.fillRect(26, -61, 10, 45);
      // Ammo belts
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-32, -55, 8, 35);
      g.fillRect(24, -55, 8, 35);
      g.fillStyle(0xffcc00, 0.8);
      for (let y = -50; y < -20; y += 6) {
        g.fillRect(-30, y, 4, 4);
        g.fillRect(26, y, 4, 4);
      }
    }
    
    // Ammo slits on tower body
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -40, 4, 12);
    g.fillRect(4, -40, 4, 12);
  }
  
  /**
   * Draw the rotating turret platform (centered at 0,0 for proper rotation)
   */
  private drawTurret(): void {
    const g = this.turretGraphics;
    g.clear();
    
    if (this.level === 1) {
      // Simple circular platform
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 14);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 10);
      g.lineStyle(2, 0x3a3a3a, 1);
      g.strokeCircle(0, 0, 12);
    } else if (this.level === 2) {
      // Reinforced platform with shield
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 18);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 14);
      // Gun shield (front protection)
      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.arc(0, -8, 14, -0.9, 0.9, false);
      g.lineTo(10, 0);
      g.lineTo(-10, 0);
      g.closePath();
      g.fillPath();
    } else {
      // Heavy armored turret
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 22);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 18);
      // Heavy armor shield
      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.arc(0, -10, 18, -1.0, 1.0, false);
      g.lineTo(14, 0);
      g.lineTo(-14, 0);
      g.closePath();
      g.fillPath();
      // Targeting sensor (above turret)
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-3, -35, 6, 10);
      g.fillStyle(0xff0000, 0.8);
      g.fillCircle(0, -28, 3);
      g.lineStyle(1, 0xff0000, 0.4);
      g.strokeCircle(0, -28, 6);
    }
  }
  
  /**
   * Draw the rotating Gatling barrels (centered at 0,0)
   */
  private drawBarrels(): void {
    const g = this.barrelGraphics;
    g.clear();
    
    if (this.level === 1) {
      // Single barrel pointing up (negative Y)
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-3, -25, 6, 20);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(0, -25, 3);
    } else if (this.level === 2) {
      // Dual barrels
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-7, -30, 5, 24);
      g.fillRect(2, -30, 5, 24);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-4.5, -30, 3);
      g.fillCircle(4.5, -30, 3);
    } else {
      // 6-barrel Gatling gun!
      const barrelCount = 6;
      const barrelSpread = 7;
      
      // Central barrel housing
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(0, -12, 10);
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, -12, 7);
      
      // Draw each barrel based on current rotation
      for (let i = 0; i < barrelCount; i++) {
        const angle = (i / barrelCount) * Math.PI * 2 + this.barrelRotation;
        const bx = Math.cos(angle) * barrelSpread;
        const by = Math.sin(angle) * barrelSpread - 12;
        
        // Barrel depth effect
        const depthFactor = (Math.sin(angle) + 1) / 2;
        const barrelThickness = 2.5 + depthFactor * 1.5;
        
        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(bx, by, barrelThickness);
        
        // Barrel extension (for front barrels)
        if (by < -8) {
          g.fillStyle(0x2a2a2a, 1);
          g.fillRect(bx - 2, -45, 4, 33 + by + 12);
          g.fillStyle(0x1a1a1a, 1);
          g.fillCircle(bx, -45, 2);
        }
      }
      
      // Central hub
      if (this.isFiring) {
        g.fillStyle(0xff4400, 0.6);
        g.fillCircle(0, -12, 4);
      } else {
        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(0, -12, 4);
      }
    }
  }
  
  /**
   * Draw the animated soldier gunner figure - TOP-DOWN VIEW
   * We see: top of helmet, shoulders, arms reaching forward to gun
   */
  private drawGunner(): void {
    const g = this.gunnerGraphics;
    g.clear();
    
    // Soldier sits behind gun, we look DOWN from above
    // Gun is at negative Y (forward), soldier's back is at positive Y
    const bodyY = 20;  // Center of soldier's body/shoulders
    
    // Colors
    const uniformColor = 0x556b2f;     // Olive drab uniform
    const uniformDark = 0x3d4d23;      // Darker uniform for shading
    const helmetColor = 0x4a5d23;      // Army green helmet
    const helmetDark = 0x3a4a1a;       // Darker helmet
    const helmetLight = 0x5a6d33;      // Lighter helmet highlight
    const metalColor = 0x4a4a4a;       // Metal parts
    const metalDark = 0x2a2a2a;        // Dark metal
    const gloveColor = 0x3a3a2a;       // Tactical gloves
    const skinColor = 0xdeb887;        // Skin for hands (level 1)
    
    // === GUNNER SEAT (behind soldier) ===
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-10, bodyY + 12, 20, 8);  // Seat back
    g.fillStyle(metalDark, 1);
    g.fillRect(-12, bodyY + 10, 4, 12);  // Left frame
    g.fillRect(8, bodyY + 10, 4, 12);    // Right frame
    
    if (this.level === 1) {
      // --- LEVEL 1: Basic soldier, top-down view ---
      
      // === ARMS reaching forward to gun ===
      if (this.isCheeringActive) {
        // Arms raised up and out to sides (V shape from above)
        const armSpread = this.cheerArmAngle * 8;
        g.fillStyle(uniformColor, 1);
        // Left arm angled out
        g.fillRect(-18 - armSpread, bodyY - 10, 8, 18);
        g.fillRect(10 + armSpread, bodyY - 10, 8, 18);
        // Fists at top
        g.fillStyle(skinColor, 1);
        g.fillCircle(-14 - armSpread, bodyY - 12, 5);
        g.fillCircle(14 + armSpread, bodyY - 12, 5);
      } else {
        // Arms extending forward (toward gun at -Y)
        // Upper arms (from shoulders going forward)
        g.fillStyle(uniformColor, 1);
        g.fillRect(-14, bodyY - 8, 7, 16);   // Left arm
        g.fillRect(7, bodyY - 8, 7, 16);     // Right arm
        // Shading on arms
        g.fillStyle(uniformDark, 1);
        g.fillRect(-14, bodyY - 8, 2, 16);
        g.fillRect(12, bodyY - 8, 2, 16);
        // Hands gripping gun controls
        g.fillStyle(skinColor, 1);
        g.fillCircle(-10, bodyY - 10, 4);    // Left hand
        g.fillCircle(10, bodyY - 10, 4);     // Right hand
      }
      
      // === SHOULDERS (wide oval shape from above) ===
      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 4, 24, 12);
      // Shoulder shading for 3D roundness
      g.fillStyle(uniformDark, 1);
      g.fillEllipse(-9, bodyY + 4, 6, 10);
      g.fillEllipse(9, bodyY + 4, 6, 10);
      // Center back (lighter)
      g.fillStyle(0x657b3f, 1);
      g.fillEllipse(0, bodyY + 6, 8, 6);
      
      // === HELMET (top view - large circle) ===
      // Main helmet dome
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 12);
      // Helmet highlight (light hitting top)
      g.fillStyle(helmetLight, 1);
      g.fillCircle(-2, bodyY - 6, 5);
      // Helmet rim shadow
      g.fillStyle(helmetDark, 1);
      g.beginPath();
      g.arc(0, bodyY - 4, 12, 0.3, Math.PI - 0.3, false);
      g.strokePath();
      
      // Cap brim (sticks out front)
      g.fillStyle(helmetDark, 1);
      g.fillEllipse(0, bodyY - 14, 10, 4);
      
    } else if (this.level === 2) {
      // --- LEVEL 2: Tactical soldier, top-down view ---
      
      // === ARMS ===
      if (this.isCheeringActive) {
        const armSpread = this.cheerArmAngle * 10;
        g.fillStyle(uniformColor, 1);
        g.fillRect(-20 - armSpread, bodyY - 12, 9, 20);
        g.fillRect(11 + armSpread, bodyY - 12, 9, 20);
        // Gloved fists
        g.fillStyle(gloveColor, 1);
        g.fillCircle(-15 - armSpread, bodyY - 14, 5);
        g.fillCircle(15 + armSpread, bodyY - 14, 5);
      } else {
        // Arms forward
        g.fillStyle(uniformColor, 1);
        g.fillRect(-16, bodyY - 10, 8, 18);
        g.fillRect(8, bodyY - 10, 8, 18);
        g.fillStyle(uniformDark, 1);
        g.fillRect(-16, bodyY - 10, 2, 18);
        g.fillRect(14, bodyY - 10, 2, 18);
        // Gloved hands
        g.fillStyle(gloveColor, 1);
        g.fillCircle(-12, bodyY - 12, 5);
        g.fillCircle(12, bodyY - 12, 5);
      }
      
      // === SHOULDERS with tactical vest ===
      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 4, 28, 14);
      // Tactical vest (darker on back)
      g.fillStyle(0x4a4a4a, 1);
      g.fillEllipse(0, bodyY + 6, 22, 10);
      // Shoulder pads
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(-12, bodyY + 2, 6);
      g.fillCircle(12, bodyY + 2, 6);
      
      // === HELMET (military style, top view) ===
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      // Helmet texture/camo pattern
      g.fillStyle(helmetDark, 1);
      g.fillCircle(-5, bodyY - 8, 4);
      g.fillCircle(4, bodyY - 4, 5);
      g.fillCircle(-3, bodyY - 2, 3);
      // Highlight
      g.fillStyle(helmetLight, 1);
      g.fillCircle(-3, bodyY - 9, 4);
      
      // Goggle strap across helmet
      g.fillStyle(metalDark, 1);
      g.fillRect(-14, bodyY - 7, 28, 3);
      // Goggles resting on helmet
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(0, bodyY - 16, 12, 5);
      g.fillStyle(0x444444, 1);
      g.fillEllipse(-4, bodyY - 16, 4, 3);
      g.fillEllipse(4, bodyY - 16, 4, 3);
      
    } else {
      // --- LEVEL 3: Elite operator, top-down view ---
      
      // === ARMS with full gear ===
      if (this.isCheeringActive) {
        const armSpread = this.cheerArmAngle * 12;
        g.fillStyle(uniformColor, 1);
        g.fillRect(-22 - armSpread, bodyY - 14, 10, 22);
        g.fillRect(12 + armSpread, bodyY - 14, 10, 22);
        // Elbow pads visible
        g.fillStyle(metalDark, 1);
        g.fillCircle(-17 - armSpread, bodyY, 5);
        g.fillCircle(17 + armSpread, bodyY, 5);
        // Tactical gloves
        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(-17 - armSpread, bodyY - 16, 6);
        g.fillCircle(17 + armSpread, bodyY - 16, 6);
      } else {
        // Arms reaching forward to gun
        g.fillStyle(uniformColor, 1);
        g.fillRect(-18, bodyY - 12, 9, 20);
        g.fillRect(9, bodyY - 12, 9, 20);
        g.fillStyle(uniformDark, 1);
        g.fillRect(-18, bodyY - 12, 2, 20);
        g.fillRect(16, bodyY - 12, 2, 20);
        // Elbow pads
        g.fillStyle(metalDark, 1);
        g.fillCircle(-13, bodyY + 4, 5);
        g.fillCircle(13, bodyY + 4, 5);
        // Tactical gloves on gun
        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(-13, bodyY - 14, 6);
        g.fillCircle(13, bodyY - 14, 6);
        // Glove details
        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(-13, bodyY - 14, 3);
        g.fillCircle(13, bodyY - 14, 3);
      }
      
      // === SHOULDERS with heavy plate carrier ===
      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 5, 32, 16);
      // Plate carrier back
      g.fillStyle(0x4a4a4a, 1);
      g.fillEllipse(0, bodyY + 7, 26, 12);
      // Back plate (rectangular)
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-8, bodyY + 2, 16, 10);
      // MOLLE straps
      g.fillStyle(0x3a3a3a, 1);
      for (let i = 0; i < 4; i++) {
        g.fillRect(-7, bodyY + 3 + i * 2.5, 14, 1);
      }
      // Shoulder armor plates
      g.fillStyle(metalColor, 1);
      g.fillEllipse(-14, bodyY + 2, 8, 10);
      g.fillEllipse(14, bodyY + 2, 8, 10);
      g.fillStyle(0x5a5a5a, 1);
      g.fillEllipse(-14, bodyY + 1, 5, 7);
      g.fillEllipse(14, bodyY + 1, 5, 7);
      
      // Hydration tube (goes to helmet)
      g.lineStyle(2, 0x3a4a3a, 1);
      g.lineBetween(5, bodyY + 6, 8, bodyY - 8);
      
      // Radio on back
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-12, bodyY + 8, 6, 8);
      // Antenna
      g.lineStyle(2, 0x1a1a1a, 1);
      g.lineBetween(-9, bodyY + 8, -9, bodyY - 2);
      
      // === ADVANCED HELMET (top view) ===
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 8, 16);
      // Helmet cover camo
      g.fillStyle(helmetDark, 1);
      g.fillCircle(-6, bodyY - 10, 5);
      g.fillCircle(5, bodyY - 6, 6);
      g.fillCircle(-2, bodyY - 4, 4);
      g.fillCircle(7, bodyY - 12, 4);
      // Highlight
      g.fillStyle(helmetLight, 1);
      g.fillCircle(-4, bodyY - 12, 5);
      
      // Helmet rails (sides)
      g.fillStyle(metalDark, 1);
      g.fillRect(-18, bodyY - 10, 4, 8);
      g.fillRect(14, bodyY - 10, 4, 8);
      
      // NVG mount on front of helmet
      g.fillStyle(metalDark, 1);
      g.fillRect(-5, bodyY - 22, 10, 6);
      g.fillStyle(metalColor, 1);
      g.fillRect(-4, bodyY - 21, 8, 4);
      // NVG tubes (folded up)
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(-3, bodyY - 24, 3);
      g.fillCircle(3, bodyY - 24, 3);
      
      // Ear protection (comms headset) visible on sides
      g.fillStyle(metalDark, 1);
      g.fillCircle(-15, bodyY - 6, 5);
      g.fillCircle(15, bodyY - 6, 5);
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(-15, bodyY - 6, 3);
      g.fillCircle(15, bodyY - 6, 3);
      
      // Helmet band
      g.fillStyle(0x4a5a3a, 1);
      g.beginPath();
      g.arc(0, bodyY - 8, 14, Math.PI * 0.2, Math.PI * 0.8, false);
      g.strokePath();
    }
  }
  
  /**
   * Draw muzzle flash effect (at barrel tip)
   */
  private drawMuzzleFlash(): void {
    const g = this.muzzleFlashGraphics;
    g.clear();
    
    if (this.muzzleFlashTimer <= 0) return;
    
    // Flash at barrel tip (negative Y direction from turret center)
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const flashY = -barrelLength - 5;
    
    const alpha = this.muzzleFlashTimer / 0.06;
    const size = 5 + this.level * 2;
    
    // Bright flash
    g.fillStyle(0xffff00, alpha * 0.8);
    g.fillCircle(0, flashY, size);
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, flashY, size * 0.5);
    
    // Sparks
    g.fillStyle(0xffaa00, alpha * 0.6);
    for (let i = 0; i < 2 + this.level; i++) {
      const sparkX = (Math.random() - 0.5) * size * 1.5;
      const sparkY = flashY + (Math.random() - 0.5) * size;
      g.fillCircle(sparkX, sparkY, 1 + Math.random());
    }
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.turretGraphics.destroy();
    this.barrelGraphics.destroy();
    this.gunnerGraphics.destroy();
    this.muzzleFlashGraphics.destroy();
    this.turretContainer.destroy();
  }
}
