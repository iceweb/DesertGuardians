import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss Guard 1 (frog warrior guard)
 */
export class BossGuard1Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;
    const swordSwing = Math.sin(bounceTime * 3) * 5;

    // Green aura
    g.fillStyle(0x447744, 0.2);
    g.fillCircle(0, 0, 36 * pulse);

    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 26, 36, 12);

    // Cape
    g.fillStyle(0x224422, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -8 + bounce);
    g.lineTo(-24 * faceDirection, 20 + bounce + swordSwing * 0.3);
    g.lineTo(-18 * faceDirection, 22 + bounce);
    g.lineTo(-6 * faceDirection, 5 + bounce);
    g.closePath();
    g.fillPath();

    // Legs
    g.fillStyle(0x445544, 1);
    g.fillRect(-10, 10 + bounce, 6, 14);
    g.fillRect(4, 10 + bounce, 6, 14);

    // Feet
    g.fillStyle(0x333333, 1);
    g.fillEllipse(-7, 24, 8, 5);
    g.fillEllipse(7, 24, 8, 5);

    // Body (armor)
    g.fillStyle(0x556655, 1);
    g.fillEllipse(0, 0 + bounce, 28, 22);

    // Chest plate
    g.fillStyle(0x667766, 1);
    g.fillEllipse(4 * faceDirection, -2 + bounce, 18, 14);

    // Armor detail
    g.fillStyle(0x778877, 0.9);
    g.fillRect(-8, -4 + bounce, 16, 4);
    g.fillRect(-6, 2 + bounce, 12, 3);

    // Shield
    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -14 + bounce);
    g.lineTo(-28 * faceDirection, 0 + bounce);
    g.lineTo(-20 * faceDirection, 16 + bounce);
    g.lineTo(-14 * faceDirection, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x776655, 1);
    g.strokePath();

    // Shield emblem
    g.fillStyle(0x44aa44, 1);
    g.fillCircle(-20 * faceDirection, 0 + bounce, 6);
    g.fillStyle(0x55cc55, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -4 + bounce);
    g.lineTo(-17 * faceDirection, 2 + bounce);
    g.lineTo(-23 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    // Arm
    g.fillStyle(0x556655, 1);
    g.fillEllipse(18 * faceDirection, 0 + bounce, 8, 6);

    // Sword
    g.fillStyle(0x888888, 1);
    g.save();
    g.translateCanvas(22 * faceDirection, -10 + bounce);
    g.rotateCanvas(swordSwing * 0.02 * faceDirection);

    // Blade
    g.fillRect(-2, -24, 4, 28);
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(-1, -24, 2, 28);

    // Blade tip
    g.fillStyle(0xbbbbbb, 1);
    g.beginPath();
    g.moveTo(-2, -24);
    g.lineTo(0, -32);
    g.lineTo(2, -24);
    g.closePath();
    g.fillPath();

    // Cross guard
    g.fillStyle(0x664422, 1);
    g.fillRect(-6, 2, 12, 3);

    // Handle
    g.fillStyle(0x442211, 1);
    g.fillRect(-2, 5, 4, 8);
    g.restore();

    // Head
    g.fillStyle(0x556655, 1);
    g.fillEllipse(6 * faceDirection, -14 + bounce, 14, 12);

    // Helmet
    g.fillStyle(0x445544, 1);
    g.fillRect(8 * faceDirection, -16 + bounce, 8, 8);

    // Helmet visor
    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -14 + bounce, 6, 2);

    // Eye glow
    g.fillStyle(0x88ff88, 0.8);
    g.fillCircle(12 * faceDirection, -13 + bounce, 2);

    // Helmet crest
    g.fillStyle(0x667766, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -20 + bounce);
    g.lineTo(6 * faceDirection, -28 + bounce);
    g.lineTo(10 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }
}
