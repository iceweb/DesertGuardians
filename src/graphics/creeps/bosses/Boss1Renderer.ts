import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss 1 (green frog-like boss)
 */
export class Boss1Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.04;

    g.fillStyle(0xff6600, 0.12);
    g.fillCircle(0, 0, 35 * pulse);

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 32, 12);

    g.fillStyle(0x55aa44, 1);
    g.beginPath();
    g.moveTo(-12 * faceDirection, 8 + bounce);
    g.lineTo(-24 * faceDirection, 14 + bounce);
    g.lineTo(-30 * faceDirection, 8 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.lineTo(-18 * faceDirection, 6 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x44cc33, 1);
    g.fillEllipse(0, 0 + bounce, 26, 20);

    g.fillStyle(0xff8833, 0.7);
    g.fillCircle(-6, -4 + bounce, 4);
    g.fillCircle(4, 2 + bounce, 5);
    g.fillCircle(-2, 8 + bounce, 3);

    g.fillStyle(0x88dd77, 1);
    g.fillEllipse(0, 6 + bounce, 16, 10);

    g.fillStyle(0x55bb44, 1);
    g.fillEllipse(14 * faceDirection, -6 + bounce, 14, 12);

    g.fillStyle(0x66cc55, 1);
    g.fillEllipse(22 * faceDirection, -4 + bounce, 8, 6);

    g.fillStyle(0xffdd00, 1);
    g.fillCircle(12 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -8 + bounce, 4);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(13 * faceDirection, -10 + bounce, 1.5, 4);
    g.fillEllipse(21 * faceDirection, -8 + bounce, 1, 3);

    g.fillStyle(0xff4444, 1);
    g.fillRect(26 * faceDirection, -3 + bounce, 6, 1);
    g.fillRect(30 * faceDirection, -4 + bounce, 3, 1);
    g.fillRect(30 * faceDirection, -2 + bounce, 3, 1);

    g.fillStyle(0xff6600, 1);
    for (let i = 0; i < 3; i++) {
      const spineX = -8 + i * 6;
      g.beginPath();
      g.moveTo(spineX - 2, -10 + bounce);
      g.lineTo(spineX, -14 + bounce);
      g.lineTo(spineX + 2, -10 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x339922, 1);
    g.fillCircle(-12, 18, 5);
    g.fillCircle(12, 18, 5);
    g.fillCircle(-16, 8 + bounce, 4);
    g.fillCircle(16, 8 + bounce, 4);
  }
}
