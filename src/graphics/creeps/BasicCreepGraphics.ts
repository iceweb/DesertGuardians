import Phaser from 'phaser';

/**
 * BasicCreepGraphics handles drawing for basic creep types.
 */
export class BasicCreepGraphics {
  /**
   * Draw a basic creep based on type
   */
  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number
  ): void {
    switch (type) {
      case 'furball':
        BasicCreepGraphics.drawFurball(g, bounceTime, faceDirection);
        break;
      case 'runner':
        BasicCreepGraphics.drawRunner(g, bounceTime, faceDirection);
        break;
      case 'tank':
        BasicCreepGraphics.drawTank(g, bounceTime, faceDirection);
        break;
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
}
