import Phaser from 'phaser';
import { THEME } from '../../data/ThemeConfig';

export class BasicCreepGraphics {
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

  static drawFurball(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const bounce = Math.sin(bounceTime * 8) * 3;
    const squish = 1 + Math.sin(bounceTime * 8) * 0.1;

    g.fillStyle(THEME.colors.warmShadow, 0.28);
    g.fillEllipse(0, 18, 28, 10);

    g.fillStyle(0x8b4513, 1);
    g.fillEllipse(0 * faceDirection, -5 + bounce, 24 * squish, 22 / squish);

    g.fillStyle(0xa0522d, 1);
    g.fillEllipse(-6 * faceDirection, -8 + bounce, 8, 10);
    g.fillEllipse(6 * faceDirection, -2 + bounce, 10, 8);

    g.fillStyle(0xdeb887, 1);
    g.fillEllipse(8 * faceDirection, -6 + bounce, 12, 10);

    g.fillStyle(THEME.colors.warmHighlight, 0.15);
    g.fillEllipse(-4 * faceDirection, -12 + bounce, 10, 6);

    g.fillStyle(0x000000, 1);
    g.fillCircle(10 * faceDirection, -9 + bounce, 3);
    g.fillCircle(14 * faceDirection, -7 + bounce, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(9 * faceDirection, -10 + bounce, 1);

    g.fillStyle(0xff69b4, 1);
    g.fillCircle(16 * faceDirection, -4 + bounce, 3);

    g.fillStyle(0x8b4513, 1);
    g.fillEllipse(-4 * faceDirection, -20 + bounce, 6, 10);
    g.fillEllipse(4 * faceDirection, -22 + bounce, 6, 10);
    g.fillStyle(0xffb6c1, 0.7);
    g.fillEllipse(-4 * faceDirection, -19 + bounce, 3, 6);
    g.fillEllipse(4 * faceDirection, -21 + bounce, 3, 6);

    g.fillStyle(0x654321, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  static drawRunner(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const bounce = Math.sin(bounceTime * 12) * 4;
    const legPhase = Math.sin(bounceTime * 12);

    g.fillStyle(THEME.colors.warmShadow, 0.26);
    g.fillEllipse(0, 16, 24, 8);

    g.fillStyle(0x4169e1, 1);
    g.fillEllipse(-6, 12 + legPhase * 4, 5, 8);
    g.fillEllipse(6, 12 - legPhase * 4, 5, 8);

    g.fillStyle(0x6495ed, 1);
    g.fillEllipse(0 * faceDirection, -2 + bounce, 18, 16);

    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(-4 * faceDirection, -8 + bounce, 10, 6);

    g.fillStyle(0x4169e1, 1);
    g.fillEllipse(0, -2 + bounce, 14, 8);

    g.fillStyle(0x6495ed, 1);
    g.fillEllipse(10 * faceDirection, -6 + bounce, 12, 10);

    g.fillStyle(0x6495ed, 1);
    g.fillEllipse(2 * faceDirection, -22 + bounce, 5, 14);
    g.fillEllipse(8 * faceDirection, -20 + bounce, 5, 12);
    g.fillStyle(0xffb6c1, 0.6);
    g.fillEllipse(2 * faceDirection, -20 + bounce, 2, 8);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 2, 7);

    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -8 + bounce, 3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(13 * faceDirection, -9 + bounce, 1);

    g.fillStyle(0xff1493, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 2);
  }

  static drawTank(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 5) * 2;

    g.fillStyle(THEME.colors.warmShadow, 0.28);
    g.fillEllipse(0, 22, 40, 14);

    g.fillStyle(0x696969, 1);
    g.fillEllipse(0, 0 + bounce, 32, 28);

    g.fillStyle(0x808080, 1);
    g.fillEllipse(0, -8 + bounce, 26, 14);
    g.fillStyle(0xffffff, 0.1);
    g.fillEllipse(-4 * faceDirection, -12 + bounce, 14, 6);
    g.fillStyle(0x505050, 1);
    g.beginPath();
    g.arc(0, -5 + bounce, 18, -2.5, -0.6, false);
    g.lineTo(0, -5 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x808080, 1);
    g.fillEllipse(14 * faceDirection, -2 + bounce, 14, 12);

    g.fillStyle(0x505050, 1);
    g.fillRect(8 * faceDirection, -12 + bounce, 14, 6);

    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(18 * faceDirection, -4 + bounce, 3);
    g.fillStyle(0xffff00, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 1.5);

    g.fillStyle(0xfffff0, 1);
    g.beginPath();
    g.moveTo(20 * faceDirection, 2 + bounce);
    g.lineTo(28 * faceDirection, -2 + bounce);
    g.lineTo(26 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x404040, 1);
    g.fillEllipse(-12, 18, 10, 6);
    g.fillEllipse(12, 18, 10, 6);
  }
}
