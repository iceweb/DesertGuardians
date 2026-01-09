import Phaser from 'phaser';

/**
 * SniperAnimator provides dynamic animated graphics for the Sniper tower.
 * Features:
 * - Rotating sniper rifle that tracks targets (top-down view)
 * - Prone/crouched sniper operator
 * - Scope glint effect when targeting
 * - Muzzle flash on fire
 * - Cheering animation on kills (rifle raised)
 */
export class SniperAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Sniper container (holds all rotating parts)
  private sniperContainer: Phaser.GameObjects.Container;
  private sniperGraphics: Phaser.GameObjects.Graphics;
  private rifleGraphics: Phaser.GameObjects.Graphics;
  private effectGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private sniperAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;
  
  // Scope glint
  private scopeGlintTimer: number = 0;
  private scopeGlintPhase: number = 0;
  
  // Muzzle flash
  private flashTimer: number = 0;
  
  // Recoil
  private recoilProgress: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Tower heights per level
  private readonly SNIPER_Y = [-32, -40, -48];
  
  // Rifle barrel length for projectile spawn
  private readonly BARREL_LENGTH = [35, 45, 55];
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics
    this.baseGraphics = scene.add.graphics();
    
    // Create sniper container
    this.sniperContainer = scene.add.container(0, this.SNIPER_Y[level - 1]);
    this.sniperContainer.setScale(1.3);  // Scale up character 30%
    
    // Create graphics for rotating parts
    this.sniperGraphics = scene.add.graphics();
    this.rifleGraphics = scene.add.graphics();
    this.effectGraphics = scene.add.graphics();
    
    // Add rotating parts to sniper container
    this.sniperContainer.add([
      this.rifleGraphics,
      this.sniperGraphics,
      this.effectGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.sniperContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawSniper();
    this.drawRifle();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.sniperContainer.setY(this.SNIPER_Y[level - 1]);
    this.drawBase();
    this.drawSniper();
    this.drawRifle();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth sniper rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.sniperAngle);
      const rotationSpeed = 3.0;  // Sniper aims slowly but precisely
      
      if (Math.abs(angleDiff) > 0.01) {
        this.sniperAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.sniperAngle = Phaser.Math.Angle.Wrap(this.sniperAngle);
      }
      
      // Scope glint animation when targeting
      this.scopeGlintTimer += dt;
      this.scopeGlintPhase = (Math.sin(this.scopeGlintTimer * 3) + 1) * 0.5;
    } else {
      this.scopeGlintPhase = 0;
    }
    
    // Update recoil
    if (this.recoilProgress > 0) {
      this.recoilProgress = Math.max(0, this.recoilProgress - 4.0 * dt);
      this.drawRifle();
    }
    
    // Muzzle flash
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      this.drawFlash();
    }
    
    // Update cheering animation
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 15) * 0.5 + 0.5;
      
      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawSniper();
      this.drawRifle();
    }
    
    // Apply rotation
    this.sniperContainer.setRotation(this.sniperAngle);
    
    // Redraw for scope glint
    if (this.hasTarget) {
      this.drawRifle();
    }
  }
  
  /**
   * Set target position for sniper to aim at
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    // Rifle points UP in local space
    const sniperWorldY = towerY + this.SNIPER_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, sniperWorldY, targetX, targetY) + Math.PI / 2;
  }
  
  /**
   * Clear target
   */
  clearTarget(): void {
    this.hasTarget = false;
    this.scopeGlintPhase = 0;
  }
  
  /**
   * Called when tower fires
   */
  onFire(): { x: number; y: number } {
    this.recoilProgress = 1.0;
    this.flashTimer = 0.1;  // Sniper has brief, precise flash
    
    // Scope glint briefly disappears
    this.scopeGlintPhase = 0;
    
    this.drawRifle();
    this.drawFlash();
    
    return this.getProjectileSpawnOffset();
  }
  
  /**
   * Get the projectile spawn position offset from tower center
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const localX = 0;
    const localY = -barrelLength;
    
    const cos = Math.cos(this.sniperAngle);
    const sin = Math.sin(this.sniperAngle);
    
    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;
    
    return {
      x: rotatedX,
      y: rotatedY + this.SNIPER_Y[this.level - 1]
    };
  }
  
  /**
   * Called when sniper kills a creep
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
    g.fillEllipse(0, 25, 48, 18);
    
    const baseWidth = 28;
    const towerHeight = 40;
    
    // Base platform - camouflaged/hidden
    if (level === 1) {
      // Wooden hide
      g.fillStyle(0x6b5a44, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x7b6a54, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      // Grass/camo tufts
      g.fillStyle(0x4a5a3a, 0.7);
      g.fillCircle(-baseWidth + 5, 12, 5);
      g.fillCircle(baseWidth - 5, 12, 5);
    } else if (level === 2) {
      // Ghillie/camo base
      g.fillStyle(0x4a5a3a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
      g.fillStyle(0x5a6a4a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 16);
      // Camo pattern
      g.fillStyle(0x3a4a2a, 0.8);
      for (let i = -baseWidth + 4; i < baseWidth - 4; i += 6) {
        g.fillCircle(i, 14 + (i % 3), 4);
      }
    } else {
      // Advanced camo/stealth base
      g.fillStyle(0x3a4a3a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 24);
      g.fillStyle(0x4a5a4a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 20);
      // Tactical mesh pattern
      g.lineStyle(1, 0x2a3a2a, 0.5);
      for (let i = -baseWidth + 4; i < baseWidth - 2; i += 8) {
        g.lineBetween(i, 10, i + 4, 30);
        g.lineBetween(i + 4, 10, i, 30);
      }
    }
    
    // Tower body - observation post style
    if (level === 1) {
      g.fillStyle(0x7b6a54, 1);
      g.beginPath();
      g.moveTo(-20, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(20, 10);
      g.closePath();
      g.fillPath();
      // Window slit
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-8, -30, 16, 6);
    } else if (level === 2) {
      g.fillStyle(0x5a6a4a, 1);
      g.beginPath();
      g.moveTo(-24, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(24, 10);
      g.closePath();
      g.fillPath();
      // Camo netting over tower
      g.fillStyle(0x4a5a3a, 0.6);
      g.beginPath();
      g.moveTo(-28, 5);
      g.lineTo(-24, -towerHeight + 5);
      g.lineTo(24, -towerHeight + 5);
      g.lineTo(28, 5);
      g.closePath();
      g.fillPath();
      // Observation slits
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, -35, 20, 8);
      g.fillRect(-10, -60, 20, 6);
    } else {
      g.fillStyle(0x4a5a4a, 1);
      g.beginPath();
      g.moveTo(-28, 10);
      g.lineTo(-26, -towerHeight);
      g.lineTo(26, -towerHeight);
      g.lineTo(28, 10);
      g.closePath();
      g.fillPath();
      // Heavy ghillie covering
      g.fillStyle(0x3a4a3a, 0.7);
      for (let y = -towerHeight + 10; y < 10; y += 12) {
        for (let x = -24; x < 24; x += 8) {
          g.fillCircle(x + (y % 4), y, 6);
        }
      }
      // High-tech observation equipment
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-12, -40, 24, 12);
      g.fillStyle(0x4a6a7a, 0.5);
      g.fillRect(-10, -38, 8, 8);  // Display
    }
    
    // Sniper nest platform
    const platY = this.SNIPER_Y[level - 1] + 10;
    g.fillStyle(0x4a5a3a, 1);
    g.fillEllipse(0, platY, 28, 12);
    g.fillStyle(0x5a6a4a, 1);
    g.fillEllipse(0, platY - 2, 24, 10);
  }
  
  /**
   * Draw the sniper figure - TOP-DOWN VIEW (prone/crouched position)
   */
  private drawSniper(): void {
    const g = this.sniperGraphics;
    g.clear();
    
    const bodyY = 10;
    
    // Colors based on level (ghillie progression)
    const ghillieColor = this.level === 1 ? 0x5a6a4a :
                         this.level === 2 ? 0x4a5a3a : 0x3a4a2a;
    const ghillieDark = this.level === 1 ? 0x4a5a3a :
                        this.level === 2 ? 0x3a4a2a : 0x2a3a1a;
    const skinColor = 0xc9a07c;  // Camo paint
    
    if (this.isCheeringActive) {
      this.drawCheeringSniper(g, bodyY, ghillieColor, ghillieDark, skinColor);
      return;
    }
    
    // Sniper is in prone position - elongated body shape
    // === BODY (prone, stretched out) ===
    g.fillStyle(ghillieColor, 1);
    g.fillEllipse(0, bodyY + 6, 22, 26);
    
    // Ghillie suit texture
    g.fillStyle(ghillieDark, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * (6 + this.level);
      const y = bodyY + 6 + Math.sin(angle) * (8 + this.level);
      g.fillCircle(x, y, 3);
    }
    
    // === ARMS extended forward on rifle ===
    g.fillStyle(ghillieColor, 1);
    g.fillRect(-6, bodyY - 14, 12, 16);
    
    // Hands (camo gloves)
    g.fillStyle(0x3a3a2a, 1);
    g.fillCircle(-4, bodyY - 16, 4);
    g.fillCircle(4, bodyY - 16, 4);
    
    // === HEAD (with cap/hood) ===
    if (this.level === 1) {
      // Scout cap
      g.fillStyle(0x5a5a4a, 1);
      g.fillCircle(0, bodyY - 6, 9);
      // Cap brim
      g.fillStyle(0x4a4a3a, 1);
      g.fillRect(-8, bodyY - 12, 16, 4);
    } else if (this.level === 2) {
      // Ghillie hood
      g.fillStyle(ghillieColor, 1);
      g.fillCircle(0, bodyY - 6, 11);
      // Hood strands
      g.fillStyle(ghillieDark, 0.8);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI - Math.PI / 2;
        g.fillCircle(Math.cos(angle) * 10, bodyY - 6 + Math.sin(angle) * 10, 3);
      }
    } else {
      // Full ghillie head covering
      g.fillStyle(ghillieColor, 1);
      g.fillCircle(0, bodyY - 7, 13);
      // Dense ghillie strands
      g.fillStyle(ghillieDark, 0.9);
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        g.fillCircle(Math.cos(angle) * 12, bodyY - 7 + Math.sin(angle) * 12, 4);
      }
      // Face opening - barely visible
      g.fillStyle(0x2a2a1a, 1);
      g.fillEllipse(0, bodyY - 10, 6, 4);
    }
  }
  
  /**
   * Draw cheering sniper
   */
  private drawCheeringSniper(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    ghillieColor: number,
    ghillieDark: number,
    _skinColor: number
  ): void {
    const raiseOffset = this.cheerArmAngle * 10;
    
    // === BODY (kneeling up to celebrate) ===
    g.fillStyle(ghillieColor, 1);
    g.fillEllipse(0, bodyY + 4, 24, 22);
    
    // Ghillie texture
    g.fillStyle(ghillieDark, 0.7);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * (8 + this.level);
      const y = bodyY + 4 + Math.sin(angle) * (6 + this.level);
      g.fillCircle(x, y, 3);
    }
    
    // === ARM raised with rifle ===
    g.fillStyle(ghillieColor, 1);
    g.fillRect(-4, bodyY - 20 - raiseOffset, 8, 20);
    
    // Hand
    g.fillStyle(0x3a3a2a, 1);
    g.fillCircle(0, bodyY - 22 - raiseOffset, 4);
    
    // === HEAD ===
    if (this.level < 3) {
      g.fillStyle(ghillieColor, 1);
      g.fillCircle(0, bodyY - 6, 10 + this.level);
    } else {
      g.fillStyle(ghillieColor, 1);
      g.fillCircle(0, bodyY - 7, 13);
      g.fillStyle(ghillieDark, 0.9);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        g.fillCircle(Math.cos(angle) * 11, bodyY - 7 + Math.sin(angle) * 11, 4);
      }
    }
  }
  
  /**
   * Draw the sniper rifle - points UP in local space
   */
  private drawRifle(): void {
    const g = this.rifleGraphics;
    g.clear();
    
    if (this.isCheeringActive) {
      // Draw rifle raised overhead
      const raiseOffset = this.cheerArmAngle * 10;
      const bodyY = 10;
      const rifleY = bodyY - 24 - raiseOffset;
      const rifleLength = this.BARREL_LENGTH[this.level - 1] * 0.7;
      
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-rifleLength / 2, rifleY - 3, rifleLength, 6);
      return;
    }
    
    const bodyY = 10;
    const recoilOffset = this.recoilProgress * 5;
    
    // Rifle colors
    const rifleColor = 0x2a2a2a;
    const rifleLight = 0x3a3a3a;
    
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const barrelWidth = 4 + this.level;
    
    // === RIFLE STOCK (behind sniper) ===
    g.fillStyle(rifleColor, 1);
    g.fillRect(-barrelWidth / 2, bodyY - 4 + recoilOffset, barrelWidth + 2, 18);
    
    // === RIFLE BARREL ===
    g.fillStyle(rifleColor, 1);
    g.fillRect(-barrelWidth / 2, bodyY - barrelLength + recoilOffset, barrelWidth, barrelLength);
    
    // Barrel highlight
    g.fillStyle(rifleLight, 1);
    g.fillRect(-barrelWidth / 2 + 1, bodyY - barrelLength + 5 + recoilOffset, 2, barrelLength - 15);
    
    // === SCOPE ===
    const scopeY = bodyY - barrelLength / 2 + recoilOffset;
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(-3, scopeY - 8, 6, 16);
    
    // Scope lens
    g.fillStyle(0x2a4a5a, 1);
    g.fillCircle(0, scopeY - 10, 4);
    
    // Scope glint effect
    if (this.scopeGlintPhase > 0 && this.hasTarget) {
      const glintAlpha = this.scopeGlintPhase * 0.8;
      g.fillStyle(0xffffff, glintAlpha);
      g.fillCircle(-1, scopeY - 11, 2);
    }
    
    // === BIPOD ===
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-8, bodyY - 20, 2, 8);
    g.fillRect(6, bodyY - 20, 2, 8);
    
    // === MUZZLE BRAKE (level 2+) ===
    if (this.level >= 2) {
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - barrelLength - 4 + recoilOffset, barrelWidth + 2, 5);
      // Brake slots
      g.fillStyle(0x0a0a0a, 1);
      g.fillRect(-barrelWidth / 2 - 2, bodyY - barrelLength - 3 + recoilOffset, 1, 3);
      g.fillRect(barrelWidth / 2 + 1, bodyY - barrelLength - 3 + recoilOffset, 1, 3);
    }
    
    // === SUPPRESSOR (level 3) ===
    if (this.level === 3) {
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-4, bodyY - barrelLength - 12 + recoilOffset, 8, 10);
    }
  }
  
  /**
   * Draw muzzle flash effect
   */
  private drawFlash(): void {
    const g = this.effectGraphics;
    g.clear();
    
    if (this.flashTimer <= 0) return;
    
    const alpha = this.flashTimer / 0.1;
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const flashY = 10 - barrelLength - (this.level === 3 ? 12 : 4);
    
    // Small, precise muzzle flash
    g.fillStyle(0xffaa00, alpha * 0.7);
    g.fillCircle(0, flashY - 2, 4);
    g.fillStyle(0xffff00, alpha);
    g.fillCircle(0, flashY - 2, 2);
    
    // Brief flash line
    g.lineStyle(1, 0xffaa00, alpha * 0.5);
    g.lineBetween(0, flashY, 0, flashY - 8);
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.sniperGraphics.destroy();
    this.rifleGraphics.destroy();
    this.effectGraphics.destroy();
    this.sniperContainer.destroy();
  }
}
