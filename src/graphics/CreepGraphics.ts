import Phaser from 'phaser';

/**
 * CreepGraphics handles all creep rendering/drawing logic.
 * Extracted from Creep to keep files under 500 LOC.
 */
export class CreepGraphics {
  /**
   * Draw a creep based on type
   */
  static drawCreep(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean = false,
    isJumping: boolean = false
  ): void {
    g.clear();
    
    switch (type) {
      case 'furball':
        CreepGraphics.drawFurball(g, bounceTime, faceDirection);
        break;
      case 'runner':
        CreepGraphics.drawRunner(g, bounceTime, faceDirection);
        break;
      case 'tank':
        CreepGraphics.drawTank(g, bounceTime, faceDirection);
        break;
      case 'boss':
      case 'boss_1':
      case 'boss_2':
      case 'boss_3':
      case 'boss_4':
      case 'boss_5':
        CreepGraphics.drawBoss(g, bounceTime, faceDirection);
        break;
      case 'jumper':
        CreepGraphics.drawJumper(g, bounceTime, faceDirection, isFlashing, isJumping);
        break;
      case 'shielded':
        CreepGraphics.drawShielded(g, bounceTime, faceDirection);
        break;
      case 'flying':
        CreepGraphics.drawFlying(g, bounceTime, faceDirection);
        break;
      case 'digger':
        CreepGraphics.drawDigger(g, bounceTime, faceDirection);
        break;
      case 'ghost':
        CreepGraphics.drawGhost(g, bounceTime, faceDirection);
        break;
      case 'broodmother':
        CreepGraphics.drawBroodmother(g, bounceTime, faceDirection);
        break;
      case 'baby':
        CreepGraphics.drawBaby(g, bounceTime, faceDirection);
        break;
      default:
        CreepGraphics.drawFurball(g, bounceTime, faceDirection);
    }
  }

  static drawFurball(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 8) * 3;
    const squish = 1 + Math.sin(bounceTime * 8) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body (fluffy ball)
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(0 * faceDirection, -5 + bounce, 24 * squish, 22 / squish);
    
    // Fur texture
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(-6 * faceDirection, -8 + bounce, 8, 10);
    g.fillEllipse(6 * faceDirection, -2 + bounce, 10, 8);
    
    // Face
    g.fillStyle(0xDEB887, 1);
    g.fillEllipse(8 * faceDirection, -6 + bounce, 12, 10);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(10 * faceDirection, -9 + bounce, 3);
    g.fillCircle(14 * faceDirection, -7 + bounce, 2);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(9 * faceDirection, -10 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(16 * faceDirection, -4 + bounce, 3);
    
    // Ears
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(-4 * faceDirection, -20 + bounce, 6, 10);
    g.fillEllipse(4 * faceDirection, -22 + bounce, 6, 10);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(-4 * faceDirection, -19 + bounce, 3, 6);
    g.fillEllipse(4 * faceDirection, -21 + bounce, 3, 6);
    
    // Feet
    g.fillStyle(0x654321, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  static drawRunner(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 12) * 4;
    const legPhase = Math.sin(bounceTime * 12);
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 16, 24, 8);
    
    // Legs (animated)
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(-6, 12 + legPhase * 4, 5, 8);
    g.fillEllipse(6, 12 - legPhase * 4, 5, 8);
    
    // Body
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(0 * faceDirection, -2 + bounce, 18, 16);
    
    // Stripe
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(0, -2 + bounce, 14, 8);
    
    // Head
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(10 * faceDirection, -6 + bounce, 12, 10);
    
    // Ears
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(2 * faceDirection, -22 + bounce, 5, 14);
    g.fillEllipse(8 * faceDirection, -20 + bounce, 5, 12);
    g.fillStyle(0xFFB6C1, 0.6);
    g.fillEllipse(2 * faceDirection, -20 + bounce, 2, 8);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 2, 7);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -8 + bounce, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -9 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF1493, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 2);
  }

  static drawTank(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 22, 40, 14);
    
    // Body
    g.fillStyle(0x696969, 1);
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
    g.fillEllipse(14 * faceDirection, -2 + bounce, 14, 12);
    
    // Helmet
    g.fillStyle(0x505050, 1);
    g.fillRect(8 * faceDirection, -12 + bounce, 14, 6);
    
    // Eyes
    g.fillStyle(0xFF0000, 0.8);
    g.fillCircle(18 * faceDirection, -4 + bounce, 3);
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 1.5);
    
    // Tusks
    g.fillStyle(0xFFFFF0, 1);
    g.beginPath();
    g.moveTo(20 * faceDirection, 2 + bounce);
    g.lineTo(28 * faceDirection, -2 + bounce);
    g.lineTo(26 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
    
    // Feet
    g.fillStyle(0x404040, 1);
    g.fillEllipse(-12, 18, 10, 6);
    g.fillEllipse(12, 18, 10, 6);
  }

  static drawBoss(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 3;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    
    // Glow
    g.fillStyle(0x800080, 0.2);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0x800080, 0.1);
    g.fillCircle(0, 0, 60 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 50, 18);
    
    // Body
    g.fillStyle(0x4B0082, 1);
    g.fillEllipse(0, 0 + bounce, 44 * pulse, 38 * pulse);
    
    // Fur pattern
    g.fillStyle(0x6A0DAD, 1);
    g.fillEllipse(-10, -10 + bounce, 16, 20);
    g.fillEllipse(10, 5 + bounce, 18, 16);
    g.fillStyle(0x8B008B, 1);
    g.fillEllipse(0, -5 + bounce, 12, 14);
    
    // Face
    g.fillStyle(0x9370DB, 1);
    g.fillEllipse(18 * faceDirection, -5 + bounce, 18, 16);
    
    // Crown
    g.fillStyle(0xFFD700, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -35 + bounce);
    g.lineTo(-4 * faceDirection, -45 + bounce);
    g.lineTo(0, -35 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(4 * faceDirection, -38 + bounce);
    g.lineTo(10 * faceDirection, -50 + bounce);
    g.lineTo(14 * faceDirection, -38 + bounce);
    g.closePath();
    g.fillPath();
    
    // Eyes (3)
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(14 * faceDirection, -12 + bounce, 5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 4);
    g.fillCircle(20 * faceDirection, 2 + bounce, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * faceDirection, -14 + bounce, 2);
    g.fillCircle(22 * faceDirection, -10 + bounce, 1.5);
    
    // Mouth
    g.fillStyle(0x2F0040, 1);
    g.fillEllipse(26 * faceDirection, 4 + bounce, 8, 6);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(22 * faceDirection, 1 + bounce, 3, 4);
    g.fillRect(27 * faceDirection, 2 + bounce, 3, 3);
    
    // Arms
    g.fillStyle(0x4B0082, 1);
    g.fillEllipse(-25, 10 + bounce, 10, 8);
    g.fillEllipse(25, 10 + bounce, 10, 8);
    
    // Feet
    g.fillStyle(0x3A0066, 1);
    g.fillEllipse(-15, 28, 12, 8);
    g.fillEllipse(15, 28, 12, 8);
  }

  static drawJumper(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean,
    isJumping: boolean
  ): void {
    const bounce = isJumping ? -15 : Math.sin(bounceTime * 10) * 5;
    const legSquat = isJumping ? 0.5 : 1;
    
    const bodyColor = isFlashing ? 0xFFFFFF : 0x32CD32;
    const darkColor = isFlashing ? 0xDDDDDD : 0x228B22;
    
    // Shadow
    const shadowAlpha = isJumping ? 0.15 : 0.3;
    g.fillStyle(0x000000, shadowAlpha);
    g.fillEllipse(0, 20, 26, 10);
    
    // Legs
    g.fillStyle(darkColor, 1);
    g.fillEllipse(-8, 14 * legSquat, 6, 10 * legSquat);
    g.fillEllipse(8, 14 * legSquat, 6, 10 * legSquat);
    
    // Body
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -4 + bounce, 20, 18);
    
    // Spots
    g.fillStyle(darkColor, 1);
    g.fillCircle(-6, -8 + bounce, 4);
    g.fillCircle(4, -2 + bounce, 5);
    g.fillCircle(-3, 4 + bounce, 3);
    
    // Head
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(10 * faceDirection, -8 + bounce, 12, 10);
    
    // Ears
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -26 + bounce, 6, 16);
    g.fillEllipse(8 * faceDirection, -24 + bounce, 5, 14);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(0, -24 + bounce, 3, 10);
    g.fillEllipse(8 * faceDirection, -22 + bounce, 2.5, 9);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -10 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * faceDirection, -12 + bounce, 2);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(18 * faceDirection, -6 + bounce, 3);
    
    // Jump dust
    if (isJumping) {
      g.fillStyle(0xDEB887, 0.5);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 15 + Math.random() * 10;
        g.fillCircle(Math.cos(angle) * dist, 20 + Math.random() * 5, 4 + Math.random() * 3);
      }
    }
  }

  static drawShielded(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 7) * 3;
    const shimmer = Math.sin(bounceTime * 15) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body
    g.fillStyle(0x9400D3, 1);
    g.fillEllipse(0, -3 + bounce, 22, 20);
    
    // Markings
    g.fillStyle(0xE6E6FA, 0.6 + shimmer);
    g.fillCircle(-5, -8 + bounce, 3);
    g.fillCircle(5, 0 + bounce, 4);
    g.fillCircle(-2, 6 + bounce, 2);
    g.lineStyle(2, 0xE6E6FA, 0.5);
    g.beginPath();
    g.moveTo(-8, -2 + bounce);
    g.lineTo(0, -10 + bounce);
    g.lineTo(8, -2 + bounce);
    g.strokePath();
    
    // Head
    g.fillStyle(0xBA55D3, 1);
    g.fillEllipse(10 * faceDirection, -5 + bounce, 12, 10);
    
    // Gem
    g.fillStyle(0x00FFFF, 0.8 + shimmer);
    g.fillCircle(8 * faceDirection, -14 + bounce, 4);
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(6 * faceDirection, -15 + bounce, 1.5);
    
    // Eyes
    g.fillStyle(0x00FFFF, 0.9);
    g.fillCircle(14 * faceDirection, -7 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -8 + bounce, 2);
    
    // Ears
    g.fillStyle(0x9400D3, 1);
    g.fillEllipse(0, -22 + bounce, 5, 12);
    g.fillEllipse(6 * faceDirection, -20 + bounce, 4, 10);
    g.fillStyle(0x00FFFF, 0.7);
    g.fillCircle(0, -30 + bounce, 3);
    g.fillCircle(6 * faceDirection, -27 + bounce, 2.5);
    
    // Feet
    g.fillStyle(0x7B68EE, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  /**
   * Draw flying creep - winged creature that hovers
   */
  static drawFlying(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const hover = Math.sin(bounceTime * 6) * 6;
    const wingFlap = Math.sin(bounceTime * 20) * 0.4;
    
    // Shadow (further below to show height)
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 25, 20, 8);
    
    // Wings
    g.fillStyle(0x87CEEB, 0.7);
    // Left wing
    g.beginPath();
    g.moveTo(-8, -5 + hover);
    g.lineTo(-28, -15 + hover + wingFlap * 20);
    g.lineTo(-25, -5 + hover + wingFlap * 15);
    g.lineTo(-18, 0 + hover + wingFlap * 10);
    g.closePath();
    g.fillPath();
    // Right wing
    g.beginPath();
    g.moveTo(8, -5 + hover);
    g.lineTo(28, -15 + hover + wingFlap * 20);
    g.lineTo(25, -5 + hover + wingFlap * 15);
    g.lineTo(18, 0 + hover + wingFlap * 10);
    g.closePath();
    g.fillPath();
    
    // Wing shine
    g.fillStyle(0xADD8E6, 0.5);
    g.fillEllipse(-20, -10 + hover + wingFlap * 15, 6, 4);
    g.fillEllipse(20, -10 + hover + wingFlap * 15, 6, 4);
    
    // Body
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(0, -2 + hover, 16, 14);
    
    // Belly
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(0, 2 + hover, 10, 8);
    
    // Head
    g.fillStyle(0x4169E1, 1);
    g.fillCircle(10 * faceDirection, -6 + hover, 8);
    
    // Eyes
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -8 + hover, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -8 + hover, 2);
    
    // Beak
    g.fillStyle(0xFFA500, 1);
    g.beginPath();
    g.moveTo(16 * faceDirection, -6 + hover);
    g.lineTo(24 * faceDirection, -4 + hover);
    g.lineTo(16 * faceDirection, -2 + hover);
    g.closePath();
    g.fillPath();
    
    // Tail feathers
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(-12 * faceDirection, 4 + hover, 8, 4);
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(-14 * faceDirection, 6 + hover, 6, 3);
  }

  /**
   * Draw digger creep - mole-like with claws
   */
  static drawDigger(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 8) * 2;
    const digMotion = Math.sin(bounceTime * 12) * 3;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 16, 28, 10);
    
    // Body
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(0, 0 + bounce, 22, 18);
    
    // Fur
    g.fillStyle(0x654321, 1);
    g.fillEllipse(0, -6 + bounce, 18, 10);
    
    // Head
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(12 * faceDirection, -2 + bounce, 14, 12);
    
    // Snout
    g.fillStyle(0xDEB887, 1);
    g.fillEllipse(20 * faceDirection, 0 + bounce, 8, 6);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(26 * faceDirection, 0 + bounce, 4);
    
    // Eyes (small, beady)
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -6 + bounce, 2);
    
    // Claws (front)
    g.fillStyle(0x2F2F2F, 1);
    // Left claw
    g.beginPath();
    g.moveTo(-10, 8 + bounce);
    g.lineTo(-18, 12 + digMotion);
    g.lineTo(-14, 8 + digMotion);
    g.lineTo(-20, 14 + digMotion);
    g.lineTo(-12, 10 + digMotion);
    g.lineTo(-16, 16 + digMotion);
    g.lineTo(-8, 12 + bounce);
    g.closePath();
    g.fillPath();
    // Right claw
    g.beginPath();
    g.moveTo(10, 8 + bounce);
    g.lineTo(18, 12 - digMotion);
    g.lineTo(14, 8 - digMotion);
    g.lineTo(20, 14 - digMotion);
    g.lineTo(12, 10 - digMotion);
    g.lineTo(16, 16 - digMotion);
    g.lineTo(8, 12 + bounce);
    g.closePath();
    g.fillPath();
    
    // Ears
    g.fillStyle(0x8B4513, 1);
    g.fillCircle(4 * faceDirection, -14 + bounce, 5);
    g.fillCircle(-4 * faceDirection, -12 + bounce, 4);
  }

  /**
   * Draw ghost creep - ethereal and translucent
   */
  static drawGhost(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const float = Math.sin(bounceTime * 4) * 5;
    const waver = Math.sin(bounceTime * 8) * 2;
    
    // No shadow (floating)
    
    // Ethereal glow
    g.fillStyle(0x9370DB, 0.15);
    g.fillCircle(0, -5 + float, 35);
    
    // Main body
    g.fillStyle(0xE6E6FA, 0.7);
    g.fillEllipse(0, -8 + float, 22, 20);
    
    // Wavy bottom
    g.fillStyle(0xE6E6FA, 0.6);
    g.beginPath();
    g.moveTo(-14, 5 + float);
    g.lineTo(-10, 15 + float + waver);
    g.lineTo(-4, 10 + float - waver);
    g.lineTo(0, 18 + float + waver);
    g.lineTo(4, 10 + float - waver);
    g.lineTo(10, 15 + float + waver);
    g.lineTo(14, 5 + float);
    g.closePath();
    g.fillPath();
    
    // Inner glow
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillEllipse(0, -10 + float, 14, 12);
    
    // Face
    g.fillStyle(0x9370DB, 0.8);
    g.fillCircle(6 * faceDirection, -10 + float, 10);
    
    // Eyes (hollow)
    g.fillStyle(0x000000, 0.8);
    g.fillEllipse(4 * faceDirection, -12 + float, 4, 5);
    g.fillEllipse(10 * faceDirection, -11 + float, 3, 4);
    
    // Eye glow
    g.fillStyle(0x00FFFF, 0.6);
    g.fillCircle(4 * faceDirection, -11 + float, 1.5);
    g.fillCircle(10 * faceDirection, -10 + float, 1);
    
    // Mouth
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(8 * faceDirection, -4 + float, 5, 3);
    
    // Wispy trails
    g.fillStyle(0xE6E6FA, 0.3);
    const trailY = 20 + float;
    g.fillEllipse(-8, trailY, 4, 8 + waver);
    g.fillEllipse(0, trailY + 3, 3, 10 - waver);
    g.fillEllipse(8, trailY + 1, 4, 9 + waver);
  }

  /**
   * Draw broodmother creep - large, bloated with babies inside
   */
  static drawBroodmother(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 3) * 2;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.03;
    const babyMove = Math.sin(bounceTime * 8);
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 38, 14);
    
    // Legs (8 spider-like)
    g.fillStyle(0x228B22, 1);
    for (let i = 0; i < 4; i++) {
      const legAngle = (i - 1.5) * 0.4;
      const legX = Math.cos(legAngle) * 20;
      const legY = 10 + Math.sin(bounceTime * 6 + i) * 2;
      // Left legs
      g.lineStyle(3, 0x228B22, 1);
      g.beginPath();
      g.moveTo(-10, 0 + bounce);
      g.lineTo(-legX - 5, legY);
      g.lineTo(-legX - 10, legY + 8);
      g.strokePath();
      // Right legs
      g.beginPath();
      g.moveTo(10, 0 + bounce);
      g.lineTo(legX + 5, legY);
      g.lineTo(legX + 10, legY + 8);
      g.strokePath();
    }
    
    // Main body (bloated abdomen)
    g.fillStyle(0x228B22, 1);
    g.fillEllipse(0, 2 + bounce, 32 * pulse, 26 * pulse);
    
    // Abdomen pattern
    g.fillStyle(0x32CD32, 0.6);
    g.fillEllipse(0, 5 + bounce, 24 * pulse, 18 * pulse);
    
    // Babies visible inside (bumps)
    g.fillStyle(0x90EE90, 0.5);
    g.fillCircle(-8 + babyMove * 2, -2 + bounce, 6);
    g.fillCircle(6 - babyMove * 2, 4 + bounce, 7);
    g.fillCircle(-4 + babyMove, 10 + bounce, 5);
    g.fillCircle(8 + babyMove, 8 + bounce, 6);
    
    // Thorax
    g.fillStyle(0x228B22, 1);
    g.fillEllipse(16 * faceDirection, -8 + bounce, 14, 12);
    
    // Head
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(24 * faceDirection, -10 + bounce, 8);
    
    // Eyes (multiple)
    g.fillStyle(0x000000, 1);
    g.fillCircle(22 * faceDirection, -14 + bounce, 3);
    g.fillCircle(28 * faceDirection, -12 + bounce, 2.5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 2);
    g.fillCircle(28 * faceDirection, -6 + bounce, 2);
    g.fillStyle(0xFF0000, 0.6);
    g.fillCircle(22 * faceDirection, -14 + bounce, 1.5);
    g.fillCircle(28 * faceDirection, -12 + bounce, 1);
    
    // Mandibles
    g.fillStyle(0x006400, 1);
    g.beginPath();
    g.moveTo(28 * faceDirection, -4 + bounce);
    g.lineTo(34 * faceDirection, 0 + bounce);
    g.lineTo(30 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(26 * faceDirection, -2 + bounce);
    g.lineTo(32 * faceDirection, 4 + bounce);
    g.lineTo(28 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
  }

  /**
   * Draw baby creep - tiny version that spawns from broodmother
   */
  static drawBaby(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 15) * 2;
    const scurry = Math.sin(bounceTime * 20) * 1;
    
    // Tiny shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 8, 12, 4);
    
    // Tiny legs
    g.lineStyle(1, 0x228B22, 1);
    for (let i = 0; i < 3; i++) {
      const legOffset = (i - 1) * 4;
      g.beginPath();
      g.moveTo(-4, bounce);
      g.lineTo(-8 + scurry, 6 + legOffset);
      g.strokePath();
      g.beginPath();
      g.moveTo(4, bounce);
      g.lineTo(8 - scurry, 6 + legOffset);
      g.strokePath();
    }
    
    // Body
    g.fillStyle(0x90EE90, 1);
    g.fillEllipse(0, bounce, 10, 8);
    
    // Head
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(6 * faceDirection, -2 + bounce, 5);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(8 * faceDirection, -3 + bounce, 1.5);
    g.fillCircle(6 * faceDirection, -1 + bounce, 1);
  }

  /**
   * Draw shield visual effect
   */
  static drawShield(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    shieldHitsRemaining: number
  ): void {
    g.clear();
    
    if (shieldHitsRemaining <= 0) return;
    
    const shimmer = Math.sin(bounceTime * 10) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.05;
    
    // Outer glow
    g.fillStyle(0x00BFFF, 0.15 + shimmer);
    g.fillCircle(0, -5, 38 * pulse);
    
    // Main bubble
    g.lineStyle(3, 0x00BFFF, 0.6 + shimmer);
    g.strokeCircle(0, -5, 32 * pulse);
    
    // Inner shield
    g.lineStyle(2, 0x87CEEB, 0.4);
    g.strokeCircle(0, -5, 28 * pulse);
    
    // Hit indicators
    const indicatorY = -42;
    for (let i = 0; i < shieldHitsRemaining; i++) {
      const indicatorX = (i - 1) * 10;
      g.fillStyle(0x00FFFF, 0.9);
      g.fillCircle(indicatorX, indicatorY, 4);
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillCircle(indicatorX - 1, indicatorY - 1, 1.5);
    }
  }

  /**
   * Draw status effects (slow, poison)
   */
  static drawStatusEffects(
    g: Phaser.GameObjects.Graphics,
    currentTime: number,
    slowAmount: number,
    slowEndTime: number,
    poisonStacks: { damage: number; endTime: number }[]
  ): void {
    g.clear();
    
    // Slow effect (ice crystals)
    if (slowAmount > 0 && currentTime < slowEndTime) {
      const intensity = slowAmount;
      const pulse = Math.sin(currentTime * 0.005) * 0.2;
      
      g.fillStyle(0x87CEEB, 0.3 + pulse);
      g.fillCircle(0, -5, 30);
      
      // Ice crystals
      const numCrystals = Math.floor(intensity * 6) + 2;
      for (let i = 0; i < numCrystals; i++) {
        const angle = (i / numCrystals) * Math.PI * 2 + currentTime * 0.002;
        const dist = 18 + Math.sin(currentTime * 0.003 + i) * 4;
        const crystalX = Math.cos(angle) * dist;
        const crystalY = -5 + Math.sin(angle) * dist * 0.6;
        
        g.fillStyle(0xADD8E6, 0.8);
        g.beginPath();
        g.moveTo(crystalX, crystalY - 6);
        g.lineTo(crystalX + 3, crystalY);
        g.lineTo(crystalX, crystalY + 4);
        g.lineTo(crystalX - 3, crystalY);
        g.closePath();
        g.fillPath();
        
        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(crystalX - 1, crystalY - 2, 1.5);
      }
    }
    
    // Poison effect (bubbles)
    const activePoisonStacks = poisonStacks.filter(s => currentTime < s.endTime);
    if (activePoisonStacks.length > 0) {
      const intensity = Math.min(activePoisonStacks.length / 3, 1);
      
      // Poison aura
      g.fillStyle(0x00FF00, 0.1 + intensity * 0.1);
      g.fillCircle(0, -5, 25);
      
      // Bubbles
      const numBubbles = activePoisonStacks.length * 2 + 2;
      for (let i = 0; i < numBubbles; i++) {
        const bubbleTime = currentTime * 0.003 + i * 1.5;
        const bubbleY = -5 - ((bubbleTime * 10) % 35);
        const bubbleX = Math.sin(bubbleTime * 2 + i) * 12;
        const bubbleSize = 2 + (i % 3);
        const bubbleAlpha = 0.7 - ((bubbleTime * 10) % 35) / 50;
        
        if (bubbleAlpha > 0) {
          g.fillStyle(0x32CD32, bubbleAlpha);
          g.fillCircle(bubbleX, bubbleY, bubbleSize);
          g.fillStyle(0x90EE90, bubbleAlpha * 0.7);
          g.fillCircle(bubbleX - 1, bubbleY - 1, bubbleSize * 0.4);
        }
      }
      
      // Drips
      g.fillStyle(0x228B22, 0.5);
      for (let i = 0; i < activePoisonStacks.length; i++) {
        const dripX = -10 + i * 10;
        const dripPhase = (currentTime * 0.004 + i) % 1;
        const dripY = 10 + dripPhase * 15;
        g.fillEllipse(dripX, dripY, 3, 4 + dripPhase * 2);
      }
    }
  }

  /**
   * Draw death animation
   */
  static drawDeathAnimation(
    g: Phaser.GameObjects.Graphics,
    deathProgress: number,
    creepType: string
  ): void {
    g.clear();
    
    // Get base color for creep type
    let baseColor = 0x8B4513;
    switch (creepType) {
      case 'runner': baseColor = 0x6495ED; break;
      case 'tank': baseColor = 0x696969; break;
      case 'boss':
      case 'boss_1':
      case 'boss_2':
      case 'boss_3':
      case 'boss_4':
      case 'boss_5':
        baseColor = 0x4B0082; break;
      case 'jumper': baseColor = 0x32CD32; break;
      case 'shielded': baseColor = 0x9400D3; break;
      case 'flying': baseColor = 0x4169E1; break;
      case 'digger': baseColor = 0x8B4513; break;
      case 'ghost': baseColor = 0x9370DB; break;
      case 'broodmother': baseColor = 0x228B22; break;
      case 'baby': baseColor = 0x90EE90; break;
    }
    
    // Explosion particles
    const numParticles = 12;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const dist = deathProgress * 40;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist * 0.7;
      const size = (1 - deathProgress) * 8;
      const alpha = 1 - deathProgress;
      
      if (size > 0) {
        g.fillStyle(baseColor, alpha);
        g.fillCircle(x, y, size);
        
        // Sparkle
        g.fillStyle(0xFFFFFF, alpha * 0.7);
        g.fillCircle(x, y, size * 0.4);
      }
    }
    
    // Center flash
    const flashSize = (1 - deathProgress) * 20;
    if (flashSize > 0) {
      g.fillStyle(0xFFFFFF, (1 - deathProgress) * 0.8);
      g.fillCircle(0, -5, flashSize);
    }
  }

  /**
   * Draw health bar
   */
  static drawHealthBar(
    bgGraphics: Phaser.GameObjects.Graphics,
    fgGraphics: Phaser.GameObjects.Graphics,
    healthPercent: number,
    maxHealth: number
  ): void {
    bgGraphics.clear();
    fgGraphics.clear();
    
    const barWidth = Math.min(40, 20 + maxHealth / 50);
    const barHeight = 4;
    const barY = -35;
    
    // Background
    bgGraphics.fillStyle(0x000000, 0.7);
    bgGraphics.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    
    // Health
    const healthWidth = barWidth * healthPercent;
    let healthColor = 0x00ff00;
    if (healthPercent < 0.3) {
      healthColor = 0xff0000;
    } else if (healthPercent < 0.6) {
      healthColor = 0xffff00;
    }
    
    fgGraphics.fillStyle(healthColor, 1);
    fgGraphics.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
  }
}
