import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for the base Boss creep type (purple/royal boss)
 */
export class BaseBossRenderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 3;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;

    g.fillStyle(0x800080, 0.2);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0x800080, 0.1);
    g.fillCircle(0, 0, 60 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 50, 18);

    g.fillStyle(0x4b0082, 1);
    g.fillEllipse(0, 0 + bounce, 44 * pulse, 38 * pulse);

    g.fillStyle(0x6a0dad, 1);
    g.fillEllipse(-10, -10 + bounce, 16, 20);
    g.fillEllipse(10, 5 + bounce, 18, 16);
    g.fillStyle(0x8b008b, 1);
    g.fillEllipse(0, -5 + bounce, 12, 14);

    g.fillStyle(0x9370db, 1);
    g.fillEllipse(18 * faceDirection, -5 + bounce, 18, 16);

    g.fillStyle(0xffd700, 1);
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

    g.fillStyle(0xff0000, 1);
    g.fillCircle(14 * faceDirection, -12 + bounce, 5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 4);
    g.fillCircle(20 * faceDirection, 2 + bounce, 3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(12 * faceDirection, -14 + bounce, 2);
    g.fillCircle(22 * faceDirection, -10 + bounce, 1.5);

    g.fillStyle(0x2f0040, 1);
    g.fillEllipse(26 * faceDirection, 4 + bounce, 8, 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(22 * faceDirection, 1 + bounce, 3, 4);
    g.fillRect(27 * faceDirection, 2 + bounce, 3, 3);

    g.fillStyle(0x4b0082, 1);
    g.fillEllipse(-25, 10 + bounce, 10, 8);
    g.fillEllipse(25, 10 + bounce, 10, 8);

    g.fillStyle(0x3a0066, 1);
    g.fillEllipse(-15, 28, 12, 8);
    g.fillEllipse(15, 28, 12, 8);
  }
}
