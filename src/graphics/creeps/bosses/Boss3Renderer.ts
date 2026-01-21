import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss 3 (winged beast boss)
 */
export class Boss3Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 3.5) * 3;
    const wingFlutter = Math.sin(bounceTime * 6) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.04;

    g.fillStyle(0xff6622, 0.12);
    g.fillCircle(0, -5 + bounce, 50 * pulse);
    g.fillStyle(0xffaa44, 0.08);
    g.fillCircle(0, -5 + bounce, 42 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 48, 16);

    g.fillStyle(0x886644, 1);
    g.beginPath();
    g.moveTo(-16 * faceDirection, 8 + bounce);
    g.lineTo(-36 * faceDirection, 16 + bounce);
    g.lineTo(-48 * faceDirection, 12 + bounce);
    g.lineTo(-46 * faceDirection, 6 + bounce);
    g.lineTo(-32 * faceDirection, 8 + bounce);
    g.lineTo(-18 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-46 * faceDirection, 9 + bounce);
    g.lineTo(-54 * faceDirection, 6 + bounce);
    g.lineTo(-50 * faceDirection, 12 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x775533, 0.85);

    g.beginPath();
    g.moveTo(-14, -8 + bounce);
    g.lineTo(-28, -18 + bounce + wingFlutter * 20);
    g.lineTo(-32, -10 + bounce + wingFlutter * 15);
    g.lineTo(-26, -2 + bounce + wingFlutter * 10);
    g.lineTo(-16, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(14, -8 + bounce);
    g.lineTo(28, -18 + bounce + wingFlutter * 20);
    g.lineTo(32, -10 + bounce + wingFlutter * 15);
    g.lineTo(26, -2 + bounce + wingFlutter * 10);
    g.lineTo(16, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x664422, 0.6);
    g.beginPath();
    g.moveTo(-16, -6 + bounce);
    g.lineTo(-26, -12 + bounce + wingFlutter * 15);
    g.strokePath();
    g.beginPath();
    g.moveTo(16, -6 + bounce);
    g.lineTo(26, -12 + bounce + wingFlutter * 15);
    g.strokePath();

    g.fillStyle(0x997755, 1);
    g.fillEllipse(0, 2 + bounce, 34, 28);

    g.fillStyle(0xbbaa88, 1);
    g.fillEllipse(0, 8 + bounce, 22, 14);
    g.fillStyle(0xccbb99, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-10, 2 + i * 4 + bounce, 20, 2);
    }

    g.fillStyle(0x664422, 1);
    for (let i = 0; i < 6; i++) {
      const spineX = -14 + i * 5;
      const spineH = 10 + Math.sin(bounceTime * 4 + i) * 2;
      g.beginPath();
      g.moveTo(spineX - 3, -14 + bounce);
      g.lineTo(spineX, -14 - spineH + bounce);
      g.lineTo(spineX + 3, -14 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x886655, 1);
    g.fillEllipse(-18, 16 + bounce, 10, 14);
    g.fillEllipse(18, 16 + bounce, 10, 14);
    g.fillEllipse(-22, 6 + bounce, 8, 10);
    g.fillEllipse(22, 6 + bounce, 8, 10);

    g.fillStyle(0x443322, 1);
    g.fillEllipse(-18, 28, 10, 6);
    g.fillEllipse(18, 28, 10, 6);
    g.fillCircle(-22, 29, 3);
    g.fillCircle(-14, 30, 3);
    g.fillCircle(14, 30, 3);
    g.fillCircle(22, 29, 3);

    g.fillStyle(0x997755, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 12, 14);

    g.fillStyle(0xaa8866, 1);
    g.fillEllipse(22 * faceDirection, -12 + bounce, 16, 14);

    g.fillStyle(0xbb9977, 1);
    g.fillEllipse(34 * faceDirection, -10 + bounce, 10, 8);

    g.fillStyle(0x775544, 1);
    g.beginPath();
    g.moveTo(16 * faceDirection, -22 + bounce);
    g.lineTo(20 * faceDirection, -28 + bounce);
    g.lineTo(24 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(24 * faceDirection, -20 + bounce);
    g.lineTo(28 * faceDirection, -26 + bounce);
    g.lineTo(32 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff8800, 1);
    g.fillEllipse(24 * faceDirection, -16 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(25 * faceDirection, -16 + bounce, 1.5, 4);

    g.fillStyle(0x333322, 1);
    g.fillCircle(40 * faceDirection, -12 + bounce, 2);
    g.fillStyle(0x888888, 0.4);
    g.fillCircle(44 * faceDirection, -14 + bounce, 3);

    g.fillStyle(0x886655, 1);
    g.fillEllipse(34 * faceDirection, -4 + bounce, 10, 6);
    g.fillStyle(0xff4400, 0.5);
    g.fillEllipse(38 * faceDirection, -4 + bounce, 6, 4);
    g.fillStyle(0xffffee, 1);
    g.fillRect(30 * faceDirection, -6 + bounce, 2, 4);
    g.fillRect(34 * faceDirection, -7 + bounce, 2, 5);
    g.fillRect(38 * faceDirection, -6 + bounce, 2, 4);
  }
}
