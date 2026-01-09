import Phaser from 'phaser';

/**
 * PoisonAnimator provides dynamic animated graphics for the Poison Tower.
 * Features:
 * - Rotating plague doctor/alchemist that tracks targets (top-down view)
 * - Bubbling potions and toxic sprayer
 * - Poison gas particle effects
 * - Vial throw / spray animation on fire
 * - Cheering animation on kills (holds up vial)
 */
export class PoisonAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  
  // Alchemist container (holds all rotating parts)
  private alchemistContainer: Phaser.GameObjects.Container;
  private alchemistGraphics: Phaser.GameObjects.Graphics;
  private weaponGraphics: Phaser.GameObjects.Graphics;
  private effectGraphics: Phaser.GameObjects.Graphics;
  private particleGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private alchemistAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;
  
  // Bubbling animation
  private bubblePhase: number = 0;
  
  // Throw/spray animation
  private throwProgress: number = 0;
  private isThrowingActive: boolean = false;
  
  // Poison cloud
  private cloudTimer: number = 0;
  
  // Ambient particles
  private particles: { x: number; y: number; vx: number; vy: number; life: number; size: number }[] = [];
  private particleTimer: number = 0;
  
  // Cheering state
  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;
  
  // Tower heights per level
  private readonly ALCHEMIST_Y = [-28, -35, -42];
  
  // Weapon positions in local space
  // Level 1-2: Throwing arm (points LEFT like archer)
  // Level 3: Spray nozzle (points UP like cannon)
  private readonly THROW_ARM_LOCAL_X = -15;
  private readonly THROW_ARM_LOCAL_Y = 5;
  private readonly NOZZLE_LOCAL_Y = -22;
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create base graphics
    this.baseGraphics = scene.add.graphics();
    
    // Create alchemist container
    this.alchemistContainer = scene.add.container(0, this.ALCHEMIST_Y[level - 1]);
    this.alchemistContainer.setScale(1.3);  // Scale up character 30%
    
    // Create graphics for rotating parts
    this.alchemistGraphics = scene.add.graphics();
    this.weaponGraphics = scene.add.graphics();
    this.effectGraphics = scene.add.graphics();
    this.particleGraphics = scene.add.graphics();
    
    // Add rotating parts to alchemist container
    this.alchemistContainer.add([
      this.weaponGraphics,
      this.alchemistGraphics,
      this.effectGraphics,
      this.particleGraphics
    ]);
    
    // Add everything to main container
    this.container.add([this.baseGraphics, this.alchemistContainer]);
    
    // Initial draw
    this.drawBase();
    this.drawAlchemist();
    this.drawWeapon();
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.alchemistContainer.setY(this.ALCHEMIST_Y[level - 1]);
    this.drawBase();
    this.drawAlchemist();
    this.drawWeapon();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth alchemist rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.alchemistAngle);
      const rotationSpeed = 5.0;
      
      if (Math.abs(angleDiff) > 0.01) {
        this.alchemistAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.alchemistAngle = Phaser.Math.Angle.Wrap(this.alchemistAngle);
      }
    }
    
    // Bubbling animation
    this.bubblePhase += dt * 4;
    
    // Throw animation
    if (this.isThrowingActive) {
      this.throwProgress = Math.max(0, this.throwProgress - 3.0 * dt);
      if (this.throwProgress <= 0) {
        this.isThrowingActive = false;
      }
      this.drawWeapon();
    }
    
    // Poison cloud
    if (this.cloudTimer > 0) {
      this.cloudTimer -= dt;
      this.drawCloud();
    }
    
    // Update particles
    this.updateParticles(dt);
    
    // Spawn new particles occasionally
    this.particleTimer += dt;
    if (this.particleTimer > 0.3) {
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
      this.drawAlchemist();
      this.drawWeapon();
    }
    
    // Apply rotation
    this.alchemistContainer.setRotation(this.alchemistAngle);
    
    // Redraw for bubbling
    this.drawWeapon();
    this.drawParticles();
  }
  
  /**
   * Set target position for alchemist to aim at
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    const alchemistWorldY = towerY + this.ALCHEMIST_Y[this.level - 1];
    
    // Level 3 sprayer points UP, others throw from LEFT
    if (this.level === 3) {
      this.targetAngle = Phaser.Math.Angle.Between(towerX, alchemistWorldY, targetX, targetY) + Math.PI / 2;
    } else {
      this.targetAngle = Phaser.Math.Angle.Between(towerX, alchemistWorldY, targetX, targetY) + Math.PI;
    }
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
    this.isThrowingActive = true;
    this.throwProgress = 1.0;
    this.cloudTimer = 0.25;
    
    // Spawn poison particles
    for (let i = 0; i < 4; i++) {
      this.spawnParticle();
    }
    
    this.drawWeapon();
    this.drawCloud();
    
    return this.getProjectileSpawnOffset();
  }
  
  /**
   * Get the projectile spawn position offset from tower center
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    let localX: number, localY: number;
    
    if (this.level === 3) {
      // Spray nozzle points UP
      localX = 0;
      localY = this.NOZZLE_LOCAL_Y;
    } else {
      // Throwing arm points LEFT
      localX = this.THROW_ARM_LOCAL_X - 10;  // Extended throw position
      localY = this.THROW_ARM_LOCAL_Y;
    }
    
    const cos = Math.cos(this.alchemistAngle);
    const sin = Math.sin(this.alchemistAngle);
    
    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;
    
    return {
      x: rotatedX,
      y: rotatedY + this.ALCHEMIST_Y[this.level - 1]
    };
  }
  
  /**
   * Called when alchemist kills a creep
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
    
    // Burst of toxic particles
    for (let i = 0; i < 6; i++) {
      this.spawnParticle();
    }
  }
  
  /**
   * Spawn a poison gas particle
   */
  private spawnParticle(): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = 8 + Math.random() * 15;
    this.particles.push({
      x: (Math.random() - 0.5) * 25,
      y: (Math.random() - 0.5) * 25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 8,  // Float upward
      life: 1.0 + Math.random() * 0.5,
      size: 2 + Math.random() * 3
    });
    
    // Limit particles
    if (this.particles.length > 12) {
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
      p.size += dt * 2;  // Particles expand
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
    
    // Shadow with toxic tint - consistent size
    g.fillStyle(0x228822, 0.3);
    g.fillEllipse(0, 25, 50, 18);
    
    const baseWidth = 28;
    const towerHeight = 35;
    
    // Base platform - laboratory style
    if (level === 1) {
      // Wooden base with stains
      g.fillStyle(0x6b5a44, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x7b6a54, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      // Toxic stains
      g.fillStyle(0x44aa44, 0.3);
      g.fillCircle(-baseWidth + 8, 16, 5);
      g.fillCircle(baseWidth - 10, 18, 4);
    } else if (level === 2) {
      // Metal base with hazard stripes
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
      // Hazard stripes
      g.fillStyle(0xaaaa44, 1);
      for (let i = -baseWidth; i < baseWidth - 4; i += 8) {
        g.fillRect(i, 8, 4, 20);
      }
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth + 3, 12, (baseWidth - 3) * 2, 12);
    } else {
      // Heavy industrial base
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 24);
      // Hazard stripes
      g.fillStyle(0x888844, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 4);
      g.fillRect(-baseWidth, 28, baseWidth * 2, 4);
      // Warning symbols
      g.fillStyle(0x44aa44, 0.5);
      g.fillCircle(-baseWidth / 2, 20, 6);
      g.fillCircle(baseWidth / 2, 20, 6);
    }
    
    // Tower body - alchemist's tower
    if (level === 1) {
      g.fillStyle(0x7b6a54, 1);
      g.beginPath();
      g.moveTo(-20, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(20, 10);
      g.closePath();
      g.fillPath();
      // Window
      g.fillStyle(0x44aa44, 0.4);
      g.fillRect(-6, -25, 12, 14);
    } else if (level === 2) {
      g.fillStyle(0x5a5a5a, 1);
      g.beginPath();
      g.moveTo(-24, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(24, 10);
      g.closePath();
      g.fillPath();
      // Pipes on sides
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-26, -towerHeight + 10, 6, towerHeight);
      g.fillRect(20, -towerHeight + 10, 6, towerHeight);
      // Toxic glow windows
      g.fillStyle(0x66cc66, 0.5);
      g.fillRect(-8, -30, 16, 16);
      g.fillRect(-6, -55, 12, 12);
    } else {
      g.fillStyle(0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(-28, 10);
      g.lineTo(-26, -towerHeight);
      g.lineTo(26, -towerHeight);
      g.lineTo(28, 10);
      g.closePath();
      g.fillPath();
      // Industrial pipes
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-30, -towerHeight + 10, 8, towerHeight);
      g.fillRect(22, -towerHeight + 10, 8, towerHeight);
      // Tank visible
      g.fillStyle(0x44aa44, 0.6);
      g.fillEllipse(0, -towerHeight / 2, 16, 20);
      g.fillStyle(0x66cc66, 0.4);
      g.fillEllipse(0, -towerHeight / 2 - 2, 12, 16);
    }
    
    // Cauldron/tank at base
    const cauldronY = this.ALCHEMIST_Y[level - 1] + 20;
    g.fillStyle(0x3a3a3a, 1);
    g.fillEllipse(level === 1 ? 10 : 0, cauldronY, 14 + level * 2, 10 + level);
    // Bubbling poison in cauldron
    g.fillStyle(0x44aa44, 0.8);
    g.fillEllipse(level === 1 ? 10 : 0, cauldronY - 2, 10 + level * 2, 6 + level);
    // Bubbles
    g.fillStyle(0x66cc66, 0.6);
    const bubbleOffset = Math.sin(this.bubblePhase) * 2;
    g.fillCircle((level === 1 ? 10 : 0) - 4, cauldronY - 4 + bubbleOffset, 2);
    g.fillCircle((level === 1 ? 10 : 0) + 3, cauldronY - 3 - bubbleOffset, 1.5);
    
    // Platform
    const platY = this.ALCHEMIST_Y[level - 1] + 10;
    g.fillStyle(0x5a5a5a, 1);
    g.fillEllipse(0, platY, 28, 12);
    g.fillStyle(0x6a6a6a, 1);
    g.fillEllipse(0, platY - 2, 24, 10);
  }
  
  /**
   * Draw the alchemist/plague doctor figure - TOP-DOWN VIEW
   */
  private drawAlchemist(): void {
    const g = this.alchemistGraphics;
    g.clear();
    
    const bodyY = 10;
    
    // Colors
    const robeColor = this.level === 1 ? 0x4a4a3a :
                      this.level === 2 ? 0x3a3a2a : 0x888844;
    const robeDark = this.level === 1 ? 0x3a3a2a :
                     this.level === 2 ? 0x2a2a1a : 0x666622;
    const maskColor = 0x2a2a2a;
    
    if (this.isCheeringActive) {
      this.drawCheeringAlchemist(g, bodyY, robeColor, robeDark, maskColor);
      return;
    }
    
    // === ARMS ===
    // Left arm holding vial/sprayer
    g.fillStyle(robeColor, 1);
    g.fillRect(-14, bodyY - 6, 10, 10);
    
    // Right arm
    g.fillStyle(robeColor, 1);
    g.fillRect(4, bodyY - 4, 10, 8);
    
    // Gloves
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(-16, bodyY - 2, 4);
    g.fillCircle(8, bodyY, 4);
    
    // === ROBES ===
    g.fillStyle(robeColor, 1);
    g.fillEllipse(0, bodyY + 6, 26, 18);
    g.fillStyle(robeDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 12);
    g.fillEllipse(8, bodyY + 6, 6, 12);
    
    // Belt with vials
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-12, bodyY + 2, 24, 4);
    // Vials on belt
    g.fillStyle(0x44aa44, 0.8);
    g.fillRect(-8, bodyY, 3, 5);
    g.fillRect(-2, bodyY, 3, 5);
    g.fillRect(4, bodyY, 3, 5);
    
    // === HEAD/MASK ===
    if (this.level === 1) {
      // Goggles and bandana
      g.fillStyle(0x4a4a3a, 1);
      g.fillCircle(0, bodyY - 5, 9);
      // Goggles
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(-4, bodyY - 7, 5, 4);
      g.fillEllipse(4, bodyY - 7, 5, 4);
      // Goggle lenses
      g.fillStyle(0x66aa66, 0.6);
      g.fillCircle(-4, bodyY - 7, 2);
      g.fillCircle(4, bodyY - 7, 2);
    } else if (this.level === 2) {
      // Plague doctor mask
      g.fillStyle(maskColor, 1);
      g.fillCircle(0, bodyY - 6, 11);
      // Beak
      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.moveTo(-4, bodyY - 10);
      g.lineTo(0, bodyY - 20);
      g.lineTo(4, bodyY - 10);
      g.closePath();
      g.fillPath();
      // Eye holes with green glow
      g.fillStyle(0x44aa44, 0.8);
      g.fillCircle(-5, bodyY - 8, 3);
      g.fillCircle(5, bodyY - 8, 3);
    } else {
      // Full hazmat helmet
      g.fillStyle(0x888844, 1);
      g.fillCircle(0, bodyY - 7, 14);
      // Face plate
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-10, bodyY - 14, 20, 10);
      // Visor with green reflection
      g.fillStyle(0x44aa44, 0.5);
      g.fillRect(-8, bodyY - 13, 16, 8);
      // Breathing apparatus
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(-12, bodyY - 2, 4);
      g.fillCircle(12, bodyY - 2, 4);
    }
  }
  
  /**
   * Draw cheering alchemist
   */
  private drawCheeringAlchemist(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    robeColor: number,
    robeDark: number,
    maskColor: number
  ): void {
    const raiseOffset = this.cheerArmAngle * 8;
    
    // === ROBES ===
    g.fillStyle(robeColor, 1);
    g.fillEllipse(0, bodyY + 6, 26, 18);
    g.fillStyle(robeDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 12);
    g.fillEllipse(8, bodyY + 6, 6, 12);
    
    // Belt
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-12, bodyY + 2, 24, 4);
    
    // === ARM raised with vial ===
    g.fillStyle(robeColor, 1);
    g.fillRect(-4, bodyY - 18 - raiseOffset, 8, 18);
    
    // Gloved hand holding vial
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, bodyY - 20 - raiseOffset, 4);
    
    // Bubbling vial
    g.fillStyle(0x44aa44, 0.9);
    g.fillRect(-3, bodyY - 28 - raiseOffset, 6, 8);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-4, bodyY - 28 - raiseOffset, 8, 2);
    // Bubbles in vial
    g.fillStyle(0x66cc66, 0.8);
    const bubbleOffset = Math.sin(this.bubblePhase * 2) * 2;
    g.fillCircle(-1, bodyY - 24 - raiseOffset + bubbleOffset, 1.5);
    g.fillCircle(1, bodyY - 26 - raiseOffset - bubbleOffset, 1);
    
    // Other arm down
    g.fillStyle(robeColor, 1);
    g.fillRect(6, bodyY - 2, 8, 10);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(10, bodyY + 6, 4);
    
    // === HEAD/MASK ===
    if (this.level === 1) {
      g.fillStyle(0x4a4a3a, 1);
      g.fillCircle(0, bodyY - 5, 9);
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(-4, bodyY - 7, 5, 4);
      g.fillEllipse(4, bodyY - 7, 5, 4);
      g.fillStyle(0x66aa66, 0.6);
      g.fillCircle(-4, bodyY - 7, 2);
      g.fillCircle(4, bodyY - 7, 2);
    } else if (this.level === 2) {
      g.fillStyle(maskColor, 1);
      g.fillCircle(0, bodyY - 6, 11);
      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.moveTo(-4, bodyY - 10);
      g.lineTo(0, bodyY - 20);
      g.lineTo(4, bodyY - 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x44aa44, 0.8);
      g.fillCircle(-5, bodyY - 8, 3);
      g.fillCircle(5, bodyY - 8, 3);
    } else {
      g.fillStyle(0x888844, 1);
      g.fillCircle(0, bodyY - 7, 14);
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-10, bodyY - 14, 20, 10);
      g.fillStyle(0x44aa44, 0.5);
      g.fillRect(-8, bodyY - 13, 16, 8);
    }
  }
  
  /**
   * Draw the weapon (vial/sprayer)
   */
  private drawWeapon(): void {
    const g = this.weaponGraphics;
    g.clear();
    
    if (this.isCheeringActive) {
      return;  // Vial drawn in cheering pose
    }
    
    const bodyY = 10;
    
    if (this.level < 3) {
      // === THROWING VIAL ===
      const throwOffset = this.isThrowingActive ? this.throwProgress * 10 : 0;
      const vialX = this.THROW_ARM_LOCAL_X - throwOffset;
      const vialY = this.THROW_ARM_LOCAL_Y;
      
      // Vial
      g.fillStyle(0x44aa44, 0.9);
      g.fillRect(vialX - 3, vialY - 4, 6, 8);
      // Cork
      g.fillStyle(0x6b5a44, 1);
      g.fillRect(vialX - 2, vialY - 6, 4, 3);
      // Bubbles in vial
      g.fillStyle(0x66cc66, 0.7);
      const bubbleOffset = Math.sin(this.bubblePhase) * 1;
      g.fillCircle(vialX - 1, vialY + bubbleOffset, 1.5);
      g.fillCircle(vialX + 1, vialY - 1 - bubbleOffset, 1);
      
      // Level 2: Additional vials ready
      if (this.level === 2) {
        g.fillStyle(0x44aa44, 0.7);
        g.fillRect(vialX + 8, vialY - 2, 4, 6);
        g.fillStyle(0x8844aa, 0.7);
        g.fillRect(vialX + 14, vialY - 2, 4, 6);
      }
    } else {
      // === LEVEL 3: TOXIC SPRAYER ===
      const recoilOffset = this.isThrowingActive ? this.throwProgress * 4 : 0;
      
      // Sprayer tank (backpack)
      g.fillStyle(0x4a4a4a, 1);
      g.fillEllipse(0, bodyY + 8, 16, 12);
      g.fillStyle(0x44aa44, 0.6);
      g.fillEllipse(0, bodyY + 8, 12, 8);
      
      // Spray hose
      g.lineStyle(3, 0x3a3a3a, 1);
      g.lineBetween(-4, bodyY, -4, bodyY - 10);
      g.lineBetween(-4, bodyY - 10, 0, bodyY - 14);
      
      // Spray nozzle
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-4, bodyY - 22 + recoilOffset, 8, 10);
      // Nozzle tip
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-3, bodyY - 26 + recoilOffset, 6, 5);
      // Toxic glow at tip
      g.fillStyle(0x44aa44, 0.6);
      g.fillCircle(0, bodyY - 26 + recoilOffset, 3);
    }
  }
  
  /**
   * Draw poison cloud effect
   */
  private drawCloud(): void {
    const g = this.effectGraphics;
    g.clear();
    
    if (this.cloudTimer <= 0) return;
    
    const alpha = this.cloudTimer / 0.25;
    let cloudX: number, cloudY: number;
    
    if (this.level < 3) {
      cloudX = this.THROW_ARM_LOCAL_X - 15;
      cloudY = this.THROW_ARM_LOCAL_Y;
    } else {
      cloudX = 0;
      cloudY = 10 + this.NOZZLE_LOCAL_Y - 8;
    }
    
    // Poison cloud puffs
    const expand = (1 - alpha) * 15;
    g.fillStyle(0x44aa44, alpha * 0.5);
    g.fillCircle(cloudX - 5 - expand, cloudY, 8 + expand / 2);
    g.fillCircle(cloudX + 5 + expand, cloudY - 3, 6 + expand / 2);
    g.fillCircle(cloudX, cloudY - 8 - expand, 7 + expand / 2);
    
    // Toxic mist
    g.fillStyle(0x66cc66, alpha * 0.3);
    g.fillCircle(cloudX, cloudY - 5, 12 + expand);
  }
  
  /**
   * Draw ambient poison gas particles
   */
  private drawParticles(): void {
    const g = this.particleGraphics;
    g.clear();
    
    for (const p of this.particles) {
      const alpha = Math.min(1, p.life) * 0.5;
      // Alternate between green and purple
      const color = p.x > 0 ? 0x44aa44 : 0x8844aa;
      g.fillStyle(color, alpha);
      g.fillCircle(p.x, p.y, p.size);
    }
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.alchemistGraphics.destroy();
    this.weaponGraphics.destroy();
    this.effectGraphics.destroy();
    this.particleGraphics.destroy();
    this.alchemistContainer.destroy();
  }
}
