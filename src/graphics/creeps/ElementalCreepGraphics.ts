import Phaser from 'phaser';

export class ElementalCreepGraphics {

  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number
  ): void {
    switch (type) {
      case 'flame':
        ElementalCreepGraphics.drawFlame(g, bounceTime, faceDirection);
        break;
      case 'plaguebearer':
        ElementalCreepGraphics.drawPlaguebearer(g, bounceTime, faceDirection);
        break;
    }
  }

  static drawFlame(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const flicker = Math.sin(bounceTime * 15) * 2;
    const pulse = 1 + Math.sin(bounceTime * 10) * 0.15;

    g.fillStyle(0x000000, 0.2 + Math.sin(bounceTime * 20) * 0.1);
    g.fillEllipse(0, 18, 22, 8);

    g.fillStyle(0xFF4500, 0.4);
    g.fillCircle(0, -5 + flicker, 22 * pulse);

    g.fillStyle(0xFF6600, 1);
    g.fillEllipse(0, -3 + flicker, 18 * pulse, 16 * pulse);

    g.fillStyle(0xFFAA00, 1);
    g.fillEllipse(0, -5 + flicker, 12, 10);

    g.fillStyle(0xFFDD00, 1);
    g.fillCircle(0, -6 + flicker, 6);

    g.fillStyle(0xFFFFAA, 0.9);
    g.fillCircle(0, -7 + flicker, 3);

    const flameColors = [0xFF4500, 0xFF6600, 0xFFAA00];
    for (let i = 0; i < 5; i++) {
      const angle = (bounceTime * 8 + i * 1.2) % (Math.PI * 2);
      const flameHeight = 8 + Math.sin(angle) * 6;
      const x = (i - 2) * 4;
      const color = flameColors[i % 3];

      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(x - 3, -12 + flicker);
      g.lineTo(x, -12 - flameHeight + flicker);
      g.lineTo(x + 3, -12 + flicker);
      g.closePath();
      g.fill();
    }

    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(-4 * faceDirection, -6 + flicker, 3);
    g.fillCircle(4 * faceDirection, -6 + flicker, 3);
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(-4 * faceDirection, -6 + flicker, 2);
    g.fillCircle(4 * faceDirection, -6 + flicker, 2);
  }

  static drawPlaguebearer(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 6) * 2;
    const sway = Math.sin(bounceTime * 4) * 0.1;

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 20, 20, 6);

    const legPhase = Math.sin(bounceTime * 6);
    g.fillStyle(0x556B2F, 1);
    g.fillRect(-6 + legPhase * 2, 5, 4, 15);
    g.fillRect(2 - legPhase * 2, 5, 4, 15);

    g.fillStyle(0x3d4f2f, 1);
    g.fillEllipse(-4 + legPhase * 2, 18, 5, 3);
    g.fillEllipse(4 - legPhase * 2, 18, 5, 3);

    g.fillStyle(0x4a5d23, 1);
    g.beginPath();
    g.moveTo(-10, 8);
    g.lineTo(-12, -8 + bounce);
    g.lineTo(0, -12 + bounce);
    g.lineTo(12, -8 + bounce);
    g.lineTo(10, 8);
    g.closePath();
    g.fill();

    g.fillStyle(0x3d4f2f, 1);
    g.fillRect(-2, -5 + bounce, 4, 12);

    g.fillStyle(0xc8b896, 1);
    g.fillRect(-14, -4 + bounce + sway * 10, 5, 3);
    g.fillRect(9, -4 + bounce - sway * 10, 5, 3);

    g.fillStyle(0xb8a886, 1);
    g.fillCircle(-16, -3 + bounce + sway * 10, 3);
    g.fillCircle(16, -3 + bounce - sway * 10, 3);

    g.fillStyle(0x3d4f2f, 1);
    g.fillCircle(0, -18 + bounce, 10);

    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(2 * faceDirection, -17 + bounce, 7, 8);

    g.fillStyle(0xc8b896, 1);
    g.fillCircle(2 * faceDirection, -17 + bounce, 5);

    g.fillStyle(0x00FF88, 1);
    g.fillCircle(-1 * faceDirection + 2 * faceDirection, -19 + bounce, 2);
    g.fillCircle(3 * faceDirection + 2 * faceDirection, -19 + bounce, 2);

    for (let i = 0; i < 3; i++) {
      const angle = (bounceTime * 3 + i * 2) % (Math.PI * 2);
      const dist = 12 + Math.sin(angle) * 4;
      const px = Math.cos(angle + bounceTime) * dist;
      const py = Math.sin(angle + bounceTime) * dist * 0.5 - 5 + bounce;
      const alpha = 0.3 + Math.sin(angle) * 0.2;

      g.fillStyle(0x00FF88, alpha);
      g.fillCircle(px, py, 2);
    }
  }
}
