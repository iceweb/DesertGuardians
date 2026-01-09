import Phaser from 'phaser';

/**
 * IceAnimator provides dynamic animated graphics for the Ice Tower.
 * Features:
 * - Rotating frost mage that tracks targets (top-down view)
 * - Magical staff with ice crystal
 * - Ambient ice particles
 * - Frost burst on fire
 * - Cheering animation on kills (staff raised with ice spiral)
 */
export class IceAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Mage container (holds all rotating parts)
  private mageContainer: Phaser.GameObjects.Container;
  private mageGraphics: Phaser.GameObjects.Graphics;
  private staffGraphics: Phaser.GameObjects.Graphics;
  private effectGraphics: Phaser.GameObjects.Graphics;
  private particleGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private mageAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;
  
  // Crystal glow
  private crystalGlowPhase: number = 0;
  
  // Frost burst
  private burstTimer: number = 0;
  
  // Ambient particles
  private particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  private particleTimer: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Tower heights per level
  private readonly MAGE_Y = [-55, -70, -85];
  
  // Staff position in local space (points LEFT like archer's bow)
  private readonly STAFF_LOCAL_X = -18;
  private readonly STAFF_LOCAL_Y = 8;
  private readonly CRYSTAL_TIP_OFFSET = [18, 22, 28];
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics
    this.baseGraphics = scene.add.graphics();
    
    // Create mage container
    this.mageContainer = scene.add.container(0, this.MAGE_Y[level - 1]);
    
    // Create graphics for rotating parts
    this.mageGraphics = scene.add.graphics();
    this.staffGraphics = scene.add.graphics();
    this.effectGraphics = scene.add.graphics();
    this.particleGraphics = scene.add.graphics();
    
    // Add rotating parts to mage container
    this.mageContainer.add([
      this.staffGraphics,
      this.mageGraphics,
      this.effectGraphics,
      this.particleGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.mageContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawMage();
    this.drawStaff();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.mageContainer.setY(this.MAGE_Y[level - 1]);
    this.drawBase();
    this.drawMage();
    this.drawStaff();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth mage rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.mageAngle);
      const rotationSpeed = 5.0;
      
      if (Math.abs(angleDiff) > 0.01) {
        this.mageAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.mageAngle = Phaser.Math.Angle.Wrap(this.mageAngle);
      }
    }
    
    // Crystal glow animation
    this.crystalGlowPhase += dt * 3;
    
    // Frost burst
    if (this.burstTimer > 0) {
      this.burstTimer -= dt;
      this.drawBurst();
    }
    
    // Update particles
    this.updateParticles(dt);
    
    // Spawn new particles occasionally
    this.particleTimer += dt;
    if (this.particleTimer > 0.2) {
      this.particleTimer = 0;
      this.spawnParticle();
    }
    
    // Update cheering animation
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 12) * 0.5 + 0.5;
      
      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawMage();
      this.drawStaff();
    }
    
    // Apply rotation
    this.mageContainer.setRotation(this.mageAngle);
    
    // Redraw staff for glow animation
    this.drawStaff();
    this.drawParticles();
  }
  
  /**
   * Set target position for mage to aim at
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    // Staff points LEFT in local space (like archer's bow)
    const mageWorldY = towerY + this.MAGE_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, mageWorldY, targetX, targetY) + Math.PI;
  }
  
  /**
   * Clear target
   */
  clearTarget(): void {
    this.hasTarget = false;
  }
  
  /**
   * Called when tower fires
   */
  onFire(): { x: number; y: number } {
    this.burstTimer = 0.2;
    
    // Spawn extra particles on fire
    for (let i = 0; i < 5; i++) {
      this.spawnParticle();
    }
    
    this.drawBurst();
    
    return this.getProjectileSpawnOffset();
  }
  
  /**
   * Get the projectile spawn position offset from tower center
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    // Crystal tip position in local space
    const tipOffset = this.CRYSTAL_TIP_OFFSET[this.level - 1];
    const localX = this.STAFF_LOCAL_X - tipOffset;
    const localY = this.STAFF_LOCAL_Y;
    
    const cos = Math.cos(this.mageAngle);
    const sin = Math.sin(this.mageAngle);
    
    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;
    
    return {
      x: rotatedX,
      y: rotatedY + this.MAGE_Y[this.level - 1]
    };
  }
  
  /**
   * Called when mage kills a creep
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
    
    // Burst of particles on kill
    for (let i = 0; i < 8; i++) {
      this.spawnParticle();
    }
  }
  
  /**
   * Spawn an ice particle
   */
  private spawnParticle(): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = 10 + Math.random() * 20;
    this.particles.push({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 10,  // Float upward
      life: 0.8 + Math.random() * 0.4
    });
    
    // Limit particles
    if (this.particles.length > 15) {
      this.particles.shift();
    }
  }
  
  /**
   * Update particle positions
   */
  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw the static tower base
   */
  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();
    
    const level = this.level;
    
    // Shadow with ice tint
    g.fillStyle(0x4466aa, 0.3);
    g.fillEllipse(0, 25, 50 + level * 5, 18 + level * 2);
    
    const baseWidth = 26 + level * 5;
    const towerHeight = 40 + level * 15;
    
    // Base platform - icy stone
    if (level === 1) {
      g.fillStyle(0x6688aa, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x7799bb, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      // Ice crystals on base
      g.fillStyle(0xaaddff, 0.6);
      g.fillTriangle(-baseWidth + 5, 10, -baseWidth + 10, 10, -baseWidth + 7, 0);
      g.fillTriangle(baseWidth - 10, 10, baseWidth - 5, 10, baseWidth - 7, 2);
    } else if (level === 2) {
      g.fillStyle(0x5577aa, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
      g.fillStyle(0x6688bb, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 16);
      // Frost patterns
      g.lineStyle(1, 0xccddff, 0.5);
      for (let i = -baseWidth + 4; i < baseWidth - 4; i += 8) {
        g.lineBetween(i, 12, i + 4, 24);
        g.lineBetween(i + 4, 12, i, 24);
      }
      // Ice spikes
      g.fillStyle(0xaaddff, 0.7);
      g.fillTriangle(-baseWidth, 8, -baseWidth + 8, 8, -baseWidth + 4, -5);
      g.fillTriangle(baseWidth - 8, 8, baseWidth, 8, baseWidth - 4, -5);
    } else {
      g.fillStyle(0x4466aa, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 24);
      g.fillStyle(0x5577bb, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 20);
      // Heavy frost
      g.fillStyle(0xccffff, 0.3);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 6);
      // Large ice formations
      g.fillStyle(0x88ccff, 0.8);
      g.fillTriangle(-baseWidth - 5, 10, -baseWidth + 6, 10, -baseWidth, -10);
      g.fillTriangle(baseWidth - 6, 10, baseWidth + 5, 10, baseWidth, -10);
    }
    
    // Tower body - frozen stone
    if (level === 1) {
      g.fillStyle(0x7799bb, 1);
      g.beginPath();
      g.moveTo(-20, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(20, 10);
      g.closePath();
      g.fillPath();
      // Ice window
      g.fillStyle(0xaaddff, 0.5);
      g.fillRect(-6, -25, 12, 16);
    } else if (level === 2) {
      g.fillStyle(0x6688bb, 1);
      g.beginPath();
      g.moveTo(-24, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(24, 10);
      g.closePath();
      g.fillPath();
      // Ice veins
      g.lineStyle(2, 0xaaddff, 0.4);
      g.lineBetween(-10, 5, -15, -towerHeight + 10);
      g.lineBetween(10, 5, 15, -towerHeight + 10);
      // Icy windows
      g.fillStyle(0x88ccff, 0.6);
      g.fillRect(-8, -30, 16, 18);
      g.fillRect(-6, -55, 12, 14);
    } else {
      g.fillStyle(0x5577aa, 1);
      g.beginPath();
      g.moveTo(-28, 10);
      g.lineTo(-26, -towerHeight);
      g.lineTo(26, -towerHeight);
      g.lineTo(28, 10);
      g.closePath();
      g.fillPath();
      // Frozen pillars
      g.fillStyle(0x88ccff, 0.7);
      g.fillRect(-30, -towerHeight, 8, towerHeight + 10);
      g.fillRect(22, -towerHeight, 8, towerHeight + 10);
      // Ice crystal formations on walls
      g.fillStyle(0xccffff, 0.5);
      for (let y = -towerHeight + 15; y < 0; y += 20) {
        g.fillTriangle(-24, y, -24, y + 10, -30, y + 5);
        g.fillTriangle(24, y, 24, y + 10, 30, y + 5);
      }
    }
    
    // Mage platform - frozen
    const platY = this.MAGE_Y[level - 1] + 10;
    g.fillStyle(0x88aacc, 1);
    g.fillEllipse(0, platY, 28 + level * 4, 12 + level * 2);
    g.fillStyle(0xaaccee, 1);
    g.fillEllipse(0, platY - 2, 24 + level * 4, 10 + level * 2);
    // Frost rim
    g.lineStyle(1, 0xccffff, 0.6);
    g.strokeEllipse(0, platY - 2, 24 + level * 4, 10 + level * 2);
  }
  
  /**
   * Draw the frost mage figure - TOP-DOWN VIEW
   */
  private drawMage(): void {
    const g = this.mageGraphics;
    g.clear();
    
    const bodyY = 10;
    
    // Colors
    const robeColor = this.level === 1 ? 0x4466aa :
                      this.level === 2 ? 0x3355aa : 0x2244aa;
    const robeDark = this.level === 1 ? 0x335599 :
                     this.level === 2 ? 0x224499 : 0x113388;
    const robeLight = this.level === 1 ? 0x5577bb :
                      this.level === 2 ? 0x4466bb : 0x3355bb;
    const skinColor = 0xc9d9e9;  // Pale, frosty skin
    
    if (this.isCheeringActive) {
      this.drawCheeringMage(g, bodyY, robeColor, robeDark, robeLight, skinColor);
      return;
    }
    
    // === ARMS ===
    // Left arm holding staff
    g.fillStyle(robeColor, 1);
    g.fillRect(-16, bodyY - 6, 10, 10);
    g.fillStyle(skinColor, 1);
    g.fillCircle(-18, bodyY - 2, 4);
    
    // Right arm extended toward staff
    g.fillStyle(robeColor, 1);
    g.fillRect(-8, bodyY - 4, 12, 8);
    g.fillStyle(skinColor, 1);
    g.fillCircle(-10, bodyY, 4);
    
    // === ROBES (flowing) ===
    g.fillStyle(robeColor, 1);
    g.fillEllipse(0, bodyY + 6, 24 + this.level * 2, 16 + this.level * 2);
    g.fillStyle(robeDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 14);
    g.fillEllipse(8, bodyY + 6, 6, 14);
    g.fillStyle(robeLight, 1);
    g.fillEllipse(0, bodyY + 8, 10, 8);
    
    // Robe frost trim
    g.lineStyle(1, 0xccddff, 0.5);
    g.strokeEllipse(0, bodyY + 6, 24 + this.level * 2, 16 + this.level * 2);
    
    // === HOOD ===
    if (this.level === 1) {
      g.fillStyle(robeColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
      g.fillStyle(robeDark, 1);
      g.beginPath();
      g.moveTo(-6, bodyY - 10);
      g.lineTo(0, bodyY - 16);
      g.lineTo(6, bodyY - 10);
      g.closePath();
      g.fillPath();
      // Face
      g.fillStyle(skinColor, 1);
      g.fillCircle(0, bodyY - 6, 5);
    } else if (this.level === 2) {
      g.fillStyle(robeColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.fillStyle(robeDark, 1);
      g.beginPath();
      g.moveTo(-8, bodyY - 12);
      g.lineTo(0, bodyY - 20);
      g.lineTo(8, bodyY - 12);
      g.closePath();
      g.fillPath();
      // Frost crown
      g.fillStyle(0xaaddff, 0.6);
      g.fillTriangle(-4, bodyY - 18, 0, bodyY - 24, 4, bodyY - 18);
    } else {
      // Grand archmage hood with ice crown
      g.fillStyle(robeColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      g.fillStyle(robeDark, 1);
      g.beginPath();
      g.moveTo(-10, bodyY - 14);
      g.lineTo(0, bodyY - 24);
      g.lineTo(10, bodyY - 14);
      g.closePath();
      g.fillPath();
      // Ice crown
      g.fillStyle(0x88ccff, 0.8);
      g.fillTriangle(-8, bodyY - 20, -4, bodyY - 28, 0, bodyY - 20);
      g.fillTriangle(0, bodyY - 20, 4, bodyY - 28, 8, bodyY - 20);
      g.fillStyle(0xccffff, 0.9);
      g.fillTriangle(-2, bodyY - 22, 0, bodyY - 32, 2, bodyY - 22);
    }
  }
  
  /**
   * Draw cheering mage
   */
  private drawCheeringMage(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    robeColor: number,
    robeDark: number,
    _robeLight: number,
    skinColor: number
  ): void {
    const raiseOffset = this.cheerArmAngle * 8;
    
    // === ROBES ===
    g.fillStyle(robeColor, 1);
    g.fillEllipse(0, bodyY + 6, 24 + this.level * 2, 16 + this.level * 2);
    g.fillStyle(robeDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 14);
    g.fillEllipse(8, bodyY + 6, 6, 14);
    
    // === ARMS raised with staff overhead ===
    g.fillStyle(robeColor, 1);
    g.fillRect(-10, bodyY - 18 - raiseOffset, 8, 18);
    g.fillRect(2, bodyY - 18 - raiseOffset, 8, 18);
    
    g.fillStyle(skinColor, 1);
    g.fillCircle(-6, bodyY - 20 - raiseOffset, 4);
    g.fillCircle(6, bodyY - 20 - raiseOffset, 4);
    
    // === HOOD ===
    g.fillStyle(robeColor, 1);
    g.fillCircle(0, bodyY - 5, 11 + this.level);
    g.fillStyle(robeDark, 1);
    g.beginPath();
    g.moveTo(-7, bodyY - 12);
    g.lineTo(0, bodyY - 20);
    g.lineTo(7, bodyY - 12);
    g.closePath();
    g.fillPath();
    
    if (this.level >= 2) {
      g.fillStyle(0xaaddff, 0.6);
      g.fillTriangle(-3, bodyY - 18, 0, bodyY - 24, 3, bodyY - 18);
    }
  }
  
  /**
   * Draw the magical staff with ice crystal
   */
  private drawStaff(): void {
    const g = this.staffGraphics;
    g.clear();
    
    const bodyY = 10;
    const staffX = this.STAFF_LOCAL_X;
    const staffY = this.STAFF_LOCAL_Y;
    
    if (this.isCheeringActive) {
      // Staff raised overhead
      const raiseOffset = this.cheerArmAngle * 8;
      const cheerY = bodyY - 24 - raiseOffset;
      const staffLength = this.CRYSTAL_TIP_OFFSET[this.level - 1];
      
      // Staff horizontal
      g.fillStyle(0x6688aa, 1);
      g.fillRect(-staffLength, cheerY - 2, staffLength * 2, 4);
      
      // Crystals on both ends
      const glowAlpha = (Math.sin(this.crystalGlowPhase) + 1) * 0.3 + 0.4;
      g.fillStyle(0x88ccff, glowAlpha);
      g.fillTriangle(-staffLength - 8, cheerY, -staffLength, cheerY - 5, -staffLength, cheerY + 5);
      g.fillTriangle(staffLength + 8, cheerY, staffLength, cheerY - 5, staffLength, cheerY + 5);
      
      // Ice spiral around staff
      g.lineStyle(2, 0xaaddff, 0.6);
      for (let i = 0; i < 6; i++) {
        const t = (this.crystalGlowPhase + i * 0.5) % (Math.PI * 2);
        const x = Math.cos(t) * 8 + (i - 3) * 8;
        const y = cheerY + Math.sin(t) * 4;
        g.fillStyle(0xccffff, 0.5);
        g.fillCircle(x, y, 2);
      }
      return;
    }
    
    // Staff colors
    const staffColor = 0x6688aa;
    const crystalColor = 0x88ccff;
    
    const tipOffset = this.CRYSTAL_TIP_OFFSET[this.level - 1];
    
    // === STAFF SHAFT ===
    g.lineStyle(3 + this.level, staffColor, 1);
    g.lineBetween(staffX, staffY - 15, staffX - tipOffset + 5, staffY);
    
    // Staff highlight
    g.lineStyle(1, 0x99aacc, 0.5);
    g.lineBetween(staffX + 1, staffY - 14, staffX - tipOffset + 6, staffY - 1);
    
    // === ICE CRYSTAL ===
    const crystalX = staffX - tipOffset;
    const crystalY = staffY;
    
    // Crystal glow
    const glowAlpha = (Math.sin(this.crystalGlowPhase) + 1) * 0.3 + 0.2;
    g.fillStyle(0xaaddff, glowAlpha);
    g.fillCircle(crystalX, crystalY, 8 + this.level * 2);
    
    // Main crystal
    g.fillStyle(crystalColor, 0.8);
    g.beginPath();
    g.moveTo(crystalX - 8 - this.level, crystalY);
    g.lineTo(crystalX, crystalY - 6 - this.level);
    g.lineTo(crystalX + 4, crystalY);
    g.lineTo(crystalX, crystalY + 6 + this.level);
    g.closePath();
    g.fillPath();
    
    // Crystal highlight
    g.fillStyle(0xccffff, 0.9);
    g.fillTriangle(
      crystalX - 4, crystalY - 2,
      crystalX, crystalY - 4 - this.level / 2,
      crystalX + 1, crystalY
    );
    
    // Level 2+: Additional crystal shards
    if (this.level >= 2) {
      g.fillStyle(crystalColor, 0.6);
      g.fillTriangle(crystalX - 6, crystalY - 4, crystalX - 10, crystalY - 8, crystalX - 4, crystalY - 8);
      g.fillTriangle(crystalX - 6, crystalY + 4, crystalX - 10, crystalY + 8, crystalX - 4, crystalY + 8);
    }
    
    // Level 3: Crystal formation
    if (this.level === 3) {
      g.fillStyle(0xaaddff, 0.7);
      g.fillTriangle(crystalX - 12, crystalY, crystalX - 18, crystalY - 5, crystalX - 18, crystalY + 5);
    }
  }
  
  /**
   * Draw frost burst effect
   */
  private drawBurst(): void {
    const g = this.effectGraphics;
    g.clear();
    
    if (this.burstTimer <= 0) return;
    
    const alpha = this.burstTimer / 0.2;
    const tipOffset = this.CRYSTAL_TIP_OFFSET[this.level - 1];
    const burstX = this.STAFF_LOCAL_X - tipOffset;
    const burstY = this.STAFF_LOCAL_Y;
    
    // Frost burst rings
    const ringSize = (1 - alpha) * 20 + 10;
    g.lineStyle(3, 0x88ccff, alpha * 0.8);
    g.strokeCircle(burstX, burstY, ringSize);
    g.lineStyle(2, 0xccffff, alpha * 0.6);
    g.strokeCircle(burstX, burstY, ringSize * 0.6);
    
    // Ice shards bursting out
    g.fillStyle(0xaaddff, alpha * 0.7);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = ringSize * 0.8;
      const x = burstX + Math.cos(angle) * dist;
      const y = burstY + Math.sin(angle) * dist;
      g.fillCircle(x, y, 3);
    }
  }
  
  /**
   * Draw ambient ice particles
   */
  private drawParticles(): void {
    const g = this.particleGraphics;
    g.clear();
    
    for (const p of this.particles) {
      const alpha = Math.min(1, p.life);
      g.fillStyle(0xccffff, alpha * 0.6);
      g.fillCircle(p.x, p.y, 2);
    }
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.mageGraphics.destroy();
    this.staffGraphics.destroy();
    this.effectGraphics.destroy();
    this.particleGraphics.destroy();
    this.mageContainer.destroy();
  }
}
