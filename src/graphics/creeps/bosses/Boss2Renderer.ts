import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss 2 (turtle-like boss)
 */
export class Boss2Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;

    g.fillStyle(0x668844, 0.15);
    g.fillCircle(0, 0, 45 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 45, 14);

    g.fillStyle(0x556644, 1);
    g.beginPath();
    g.moveTo(-14 * faceDirection, 6 + bounce);
    g.lineTo(-32 * faceDirection, 12 + bounce);
    g.lineTo(-40 * faceDirection, 8 + bounce);
    g.lineTo(-38 * faceDirection, 2 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.lineTo(-16 * faceDirection, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x445533, 1);
    g.beginPath();
    g.moveTo(-26 * faceDirection, 2 + bounce);
    g.lineTo(-28 * faceDirection, -4 + bounce);
    g.lineTo(-30 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x556644, 1);
    g.fillEllipse(-14, 14 + bounce, 10, 14);
    g.fillEllipse(10, 16 + bounce, 8, 12);

    g.fillStyle(0x667755, 1);
    g.fillEllipse(0, 2 + bounce, 36, 26);

    g.fillStyle(0x778866, 1);
    g.fillEllipse(-8, -4 + bounce, 12, 10);
    g.fillEllipse(6, -2 + bounce, 14, 12);
    g.fillStyle(0x889977, 0.8);
    g.fillEllipse(-2, 8 + bounce, 18, 10);

    g.fillStyle(0x445533, 1);
    for (let i = 0; i < 5; i++) {
      const spineX = -12 + i * 6;
      const spineH = 6 + Math.sin(bounceTime * 4 + i) * 1;
      g.beginPath();
      g.moveTo(spineX - 3, -12 + bounce);
      g.lineTo(spineX, -12 - spineH + bounce);
      g.lineTo(spineX + 3, -12 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x556644, 1);
    g.fillEllipse(-20, 6 + bounce, 10, 8);
    g.fillEllipse(22, 4 + bounce, 10, 8);

    g.fillStyle(0x222211, 1);
    g.fillCircle(-24, 10 + bounce, 3);
    g.fillCircle(-28, 8 + bounce, 2);
    g.fillCircle(26, 8 + bounce, 3);
    g.fillCircle(30, 6 + bounce, 2);

    g.fillStyle(0x778866, 1);
    g.fillEllipse(16 * faceDirection, -6 + bounce, 18, 14);

    g.fillStyle(0x889977, 1);
    g.fillEllipse(28 * faceDirection, -4 + bounce, 12, 8);

    g.fillStyle(0x333322, 1);
    g.fillCircle(34 * faceDirection, -6 + bounce, 2);
    g.fillCircle(32 * faceDirection, -2 + bounce, 2);

    g.fillStyle(0xddaa00, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 1.5, 4);

    g.fillStyle(0xff6688, 1);
    g.fillRect(36 * faceDirection, -3 + bounce, 8, 1);
    g.fillRect(42 * faceDirection, -4 + bounce, 4, 1);
    g.fillRect(42 * faceDirection, -2 + bounce, 4, 1);

    g.fillStyle(0x556644, 1);
    g.fillEllipse(26 * faceDirection, 2 + bounce, 10, 6);
    g.fillStyle(0xffffee, 1);
    g.fillRect(22 * faceDirection, 0 + bounce, 2, 3);
    g.fillRect(26 * faceDirection, 1 + bounce, 2, 2);
    g.fillRect(30 * faceDirection, 0 + bounce, 2, 3);

    g.fillStyle(0x445533, 1);
    g.fillEllipse(-14, 26, 10, 6);
    g.fillEllipse(10, 26, 8, 5);
  }
}
