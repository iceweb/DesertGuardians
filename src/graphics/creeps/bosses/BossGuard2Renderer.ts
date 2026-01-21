import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss Guard 2 (elite turtle guard with golden armor)
 */
export class BossGuard2Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.04;
    const swordSwing = Math.sin(bounceTime * 3) * 6;

    // Golden aura
    g.fillStyle(0x88aa44, 0.25);
    g.fillCircle(0, 0, 42 * pulse);
    g.fillStyle(0xaaaa44, 0.15);
    g.fillCircle(0, 0, 48 * pulse);

    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 40, 14);

    // Cape
    g.fillStyle(0x883322, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -10 + bounce);
    g.lineTo(-28 * faceDirection, 24 + bounce + swordSwing * 0.3);
    g.lineTo(-20 * faceDirection, 26 + bounce);
    g.lineTo(-4 * faceDirection, 8 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0xccaa44, 1);
    g.strokePath();

    // Legs
    g.fillStyle(0x556655, 1);
    g.fillRect(-12, 10 + bounce, 7, 16);
    g.fillRect(5, 10 + bounce, 7, 16);

    // Knee guards
    g.fillStyle(0xbb9944, 1);
    g.fillCircle(-8, 12 + bounce, 4);
    g.fillCircle(8, 12 + bounce, 4);

    // Feet
    g.fillStyle(0x444444, 1);
    g.fillEllipse(-8, 26, 10, 6);
    g.fillEllipse(8, 26, 10, 6);

    // Body (heavy armor)
    g.fillStyle(0x667766, 1);
    g.fillEllipse(0, 0 + bounce, 32, 24);

    // Scale mail
    g.fillStyle(0x778877, 1);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillEllipse(-9 + col * 6, -6 + row * 6 + bounce, 5, 4);
      }
    }

    // Gold trim
    g.lineStyle(2, 0xccaa44, 1);
    g.strokeEllipse(0, -2 + bounce, 20, 12);

    // Shield (larger, ornate)
    g.fillStyle(0x665544, 1);
    g.beginPath();
    g.moveTo(-22 * faceDirection, -18 + bounce);
    g.lineTo(-32 * faceDirection, -8 + bounce);
    g.lineTo(-32 * faceDirection, 10 + bounce);
    g.lineTo(-22 * faceDirection, 20 + bounce);
    g.lineTo(-14 * faceDirection, 10 + bounce);
    g.lineTo(-14 * faceDirection, -8 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, 0xccaa44, 1);
    g.strokePath();

    // Shield emblem
    g.fillStyle(0xaa6622, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 8);
    g.fillStyle(0xcc8833, 1);
    g.beginPath();
    g.moveTo(-23 * faceDirection, -6 + bounce);
    g.lineTo(-18 * faceDirection, 4 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();

    // Shield gem
    g.fillStyle(0xff4400, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 3);

    // Arm
    g.fillStyle(0x667766, 1);
    g.fillEllipse(20 * faceDirection, -2 + bounce, 10, 8);
    g.fillStyle(0xbb9944, 1);
    g.fillCircle(18 * faceDirection, -6 + bounce, 5);

    // Sword
    g.save();
    g.translateCanvas(24 * faceDirection, -12 + bounce);
    g.rotateCanvas(swordSwing * 0.02 * faceDirection);

    // Blade
    g.fillStyle(0x999999, 1);
    g.fillRect(-3, -28, 6, 32);
    g.fillStyle(0xbbbbbb, 1);
    g.fillRect(-1, -28, 2, 32);

    // Blade edge highlight
    g.fillStyle(0xdddddd, 1);
    g.fillRect(2, -26, 1, 28);

    // Blade tip
    g.fillStyle(0xcccccc, 1);
    g.beginPath();
    g.moveTo(-3, -28);
    g.lineTo(0, -38);
    g.lineTo(3, -28);
    g.closePath();
    g.fillPath();

    // Cross guard (ornate)
    g.fillStyle(0xccaa44, 1);
    g.fillRect(-10, 2, 20, 4);
    g.beginPath();
    g.moveTo(-10, 4);
    g.lineTo(-14, 0);
    g.lineTo(-10, 2);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(10, 4);
    g.lineTo(14, 0);
    g.lineTo(10, 2);
    g.closePath();
    g.fillPath();

    // Handle
    g.fillStyle(0x553322, 1);
    g.fillRect(-2, 6, 4, 10);
    g.fillStyle(0xccaa44, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-2, 7 + i * 2, 4, 1);
    }

    // Pommel
    g.fillStyle(0xccaa44, 1);
    g.fillCircle(0, 18, 3);
    g.restore();

    // Head
    g.fillStyle(0x667766, 1);
    g.fillEllipse(8 * faceDirection, -16 + bounce, 16, 14);

    // Helmet
    g.fillStyle(0x556655, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 12);

    // Helmet visor
    g.fillStyle(0x000000, 1);
    g.fillRect(12 * faceDirection, -16 + bounce, 8, 3);
    g.fillStyle(0xffdd44, 0.9);
    g.fillCircle(14 * faceDirection, -15 + bounce, 2);
    g.fillCircle(18 * faceDirection, -15 + bounce, 2);

    // Helmet crest (golden)
    g.fillStyle(0xccaa44, 1);
    g.beginPath();
    g.moveTo(4 * faceDirection, -22 + bounce);
    g.lineTo(8 * faceDirection, -36 + bounce);
    g.lineTo(12 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();

    // Side horn
    g.fillStyle(0x888866, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -18 + bounce);
    g.lineTo(-8 * faceDirection, -26 + bounce);
    g.lineTo(0 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }
}
