import Phaser from 'phaser';

/**
 * SpecialCreepGraphics handles drawing for special ability creep types.
 */
export class SpecialCreepGraphics {
  /**
   * Draw a special creep based on type
   */
  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean = false,
    isJumping: boolean = false,
    isBurrowed: boolean = false
  ): void {
    switch (type) {
      case 'flying':
        SpecialCreepGraphics.drawFlying(g, bounceTime, faceDirection);
        break;
      case 'ghost':
        SpecialCreepGraphics.drawGhost(g, bounceTime, faceDirection);
        break;
      case 'shielded':
        SpecialCreepGraphics.drawShielded(g, bounceTime, faceDirection);
        break;
      case 'jumper':
        SpecialCreepGraphics.drawJumper(g, bounceTime, faceDirection, isFlashing, isJumping);
        break;
      case 'digger':
        if (isBurrowed) {
          SpecialCreepGraphics.drawBurrowedTunnel(g, bounceTime, faceDirection);
        } else {
          SpecialCreepGraphics.drawDigger(g, bounceTime, faceDirection);
        }
        break;
      case 'broodmother':
        SpecialCreepGraphics.drawBroodmother(g, bounceTime, faceDirection);
        break;
      case 'baby':
        SpecialCreepGraphics.drawBaby(g, bounceTime, faceDirection);
        break;
    }
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
   * Draw burrowed tunnel shadow - moving dirt mound showing underground movement
   */
  static drawBurrowedTunnel(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const rumble = Math.sin(bounceTime * 15) * 1.5;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.08;
    
    // Ground disturbance / tunnel shadow
    g.fillStyle(0x3d2817, 0.7);
    g.fillEllipse(0 + rumble, 12, 35 * pulse, 12 * pulse);
    
    // Darker center of tunnel
    g.fillStyle(0x2a1a0f, 0.6);
    g.fillEllipse(0 + rumble, 12, 22, 7);
    
    // Moving dirt mound on top
    g.fillStyle(0x8B4513, 0.8);
    g.fillEllipse(faceDirection * 6 + rumble, 8, 18 * pulse, 10 * pulse);
    
    // Lighter dirt highlights
    g.fillStyle(0xA0522D, 0.6);
    g.fillEllipse(faceDirection * 8 + rumble * 0.5, 5, 10, 6);
    
    // Small dirt particles erupting
    for (let i = 0; i < 3; i++) {
      const particleAngle = bounceTime * 6 + i * 2.1;
      const particleX = Math.sin(particleAngle) * 8;
      const particleY = 4 + Math.cos(particleAngle * 1.5) * 3;
      const particleSize = 2 + Math.sin(particleAngle * 0.7) * 1;
      const alpha = 0.4 + Math.sin(particleAngle) * 0.2;
      
      g.fillStyle(0x8B4513, alpha);
      g.fillCircle(particleX + rumble, particleY, particleSize);
    }
    
    // Direction indicator (claw tips emerging briefly)
    if (Math.sin(bounceTime * 5) > 0.7) {
      g.fillStyle(0x2F2F2F, 0.5);
      g.fillCircle(faceDirection * 15 + rumble, 10, 3);
      g.fillCircle(faceDirection * 12 + rumble, 8, 2);
    }
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
}
