import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss Guard 3 (flame demon guard with dual flaming swords)
 */
export class BossGuard3Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    const swordSwing = Math.sin(bounceTime * 3) * 8;
    const flameFlicker = Math.sin(bounceTime * 12) * 0.3 + 0.7;
    const flameWave = Math.sin(bounceTime * 8);

    // Fire aura
    g.fillStyle(0xff4400, 0.2 * flameFlicker);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0xff6600, 0.15 * flameFlicker);
    g.fillCircle(0, 0, 56 * pulse);
    g.fillStyle(0xffaa00, 0.1 * flameFlicker);
    g.fillCircle(0, 0, 62 * pulse);

    // Floating embers
    for (let i = 0; i < 6; i++) {
      const angle = bounceTime * 2 + i * (Math.PI / 3);
      const dist = 35 + Math.sin(bounceTime * 4 + i) * 8;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist * 0.6;
      g.fillStyle(0xff6600, 0.6 + Math.sin(bounceTime * 8 + i) * 0.3);
      g.fillCircle(ex, ey, 2 + Math.sin(bounceTime * 6 + i) * 1);
    }

    // Shadow
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 30, 44, 16);

    // Cape (burning)
    g.fillStyle(0x441111, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -12 + bounce);
    g.lineTo(-32 * faceDirection, 28 + bounce + swordSwing * 0.4);
    g.lineTo(-24 * faceDirection, 30 + bounce);
    g.lineTo(-4 * faceDirection, 10 + bounce);
    g.closePath();
    g.fillPath();

    // Cape flames
    for (let i = 0; i < 5; i++) {
      const fx = -32 * faceDirection + i * 2 * faceDirection;
      const fy = 28 + bounce + Math.sin(bounceTime * 10 + i) * 3;
      g.fillStyle(0xff4400, 0.7);
      g.fillCircle(fx, fy, 3);
      g.fillStyle(0xffaa00, 0.5);
      g.fillCircle(fx, fy - 4, 2);
    }

    // Legs (dark armor)
    g.fillStyle(0x333333, 1);
    g.fillRect(-14, 10 + bounce, 8, 18);
    g.fillRect(6, 10 + bounce, 8, 18);

    // Leg flames
    g.fillStyle(0xff4400, 0.6);
    g.fillRect(-12, 14 + bounce, 4, 2);
    g.fillRect(-12, 20 + bounce, 4, 2);
    g.fillRect(8, 14 + bounce, 4, 2);
    g.fillRect(8, 20 + bounce, 4, 2);

    // Feet
    g.fillStyle(0x222222, 1);
    g.fillEllipse(-10, 28, 12, 7);
    g.fillEllipse(10, 28, 12, 7);
    g.fillStyle(0xff6600, 0.7 * flameFlicker);
    g.fillCircle(-14, 26, 3);
    g.fillCircle(14, 26, 3);

    // Body (dark armor)
    g.fillStyle(0x222222, 1);
    g.fillEllipse(0, 0 + bounce, 36, 28);

    // Scale mail
    g.fillStyle(0x333333, 1);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        g.fillEllipse(-12 + col * 6, -8 + row * 6 + bounce, 5, 4);
      }
    }

    // Fire runes on armor
    g.fillStyle(0xff4400, 0.6 * flameFlicker);
    g.fillRect(-10, -2 + bounce, 20, 2);
    g.fillRect(-8, 4 + bounce, 16, 2);

    // Central fire orb
    g.fillStyle(0xff6600, 0.8 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 6);
    g.fillStyle(0xffaa00, 0.6 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 4);

    // Left flaming sword
    g.save();
    g.translateCanvas(-20 * faceDirection, -8 + bounce);
    g.rotateCanvas((-swordSwing * 0.03 - 0.3) * faceDirection);

    // Blade
    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -32, 4, 36);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -32, 2, 36);

    // Fire along blade
    for (let i = 0; i < 8; i++) {
      const flameY = -30 + i * 4;
      const flameSize = 4 + Math.sin(bounceTime * 12 + i) * 2;
      const flameOffset = Math.sin(bounceTime * 10 + i * 0.5) * 3;
      g.fillStyle(0xff4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xffaa00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xffff00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }

    // Blade tip flame
    g.fillStyle(0xff6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -32);
    g.lineTo(0, -42 - flameWave * 3);
    g.lineTo(2, -32);
    g.closePath();
    g.fillPath();

    // Guard
    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);

    // Handle
    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();

    // Right flaming sword
    g.save();
    g.translateCanvas(26 * faceDirection, -10 + bounce);
    g.rotateCanvas((swordSwing * 0.03 + 0.3) * faceDirection);

    // Blade
    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -34, 4, 38);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -34, 2, 38);

    // Fire along blade
    for (let i = 0; i < 9; i++) {
      const flameY = -32 + i * 4;
      const flameSize = 5 + Math.sin(bounceTime * 11 + i * 1.1) * 2;
      const flameOffset = Math.sin(bounceTime * 9 + i * 0.7) * 3;
      g.fillStyle(0xff4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xffaa00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xffff00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }

    // Blade tip flame
    g.fillStyle(0xff6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -34);
    g.lineTo(0, -46 - flameWave * 4);
    g.lineTo(2, -34);
    g.closePath();
    g.fillPath();

    // Guard
    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);

    // Handle
    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();

    // Arms (with fire)
    g.fillStyle(0x333333, 1);
    g.fillEllipse(-16 * faceDirection, -6 + bounce, 10, 8);
    g.fillEllipse(20 * faceDirection, -6 + bounce, 10, 8);

    // Shoulder flames
    g.fillStyle(0xff4400, 0.7 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -10 + bounce, 5);
    g.fillStyle(0xffaa00, 0.5 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -13 + bounce, 3);
    g.fillCircle(20 * faceDirection, -13 + bounce, 3);

    // Head (demon helmet)
    g.fillStyle(0x222222, 1);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 18, 16);

    // Face plate
    g.fillStyle(0x333333, 1);
    g.beginPath();
    g.moveTo(12 * faceDirection, -26 + bounce);
    g.lineTo(22 * faceDirection, -18 + bounce);
    g.lineTo(20 * faceDirection, -8 + bounce);
    g.lineTo(8 * faceDirection, -6 + bounce);
    g.lineTo(4 * faceDirection, -18 + bounce);
    g.closePath();
    g.fillPath();

    // Visor
    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 4);
    g.fillStyle(0xff4400, 0.9 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 3);
    g.fillCircle(18 * faceDirection, -18 + bounce, 3);
    g.fillStyle(0xffff00, 0.7 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 1.5);
    g.fillCircle(18 * faceDirection, -18 + bounce, 1.5);

    // Horns
    g.fillStyle(0x222222, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -24 + bounce);
    g.lineTo(-4 * faceDirection, -38 + bounce);
    g.lineTo(4 * faceDirection, -26 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(14 * faceDirection, -26 + bounce);
    g.lineTo(18 * faceDirection, -40 + bounce);
    g.lineTo(18 * faceDirection, -26 + bounce);
    g.closePath();
    g.fillPath();

    // Horn flames
    g.fillStyle(0xff4400, 0.8 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -40 + bounce + flameWave * 2, 4);
    g.fillCircle(18 * faceDirection, -42 + bounce + flameWave * 2, 4);
    g.fillStyle(0xffaa00, 0.6 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -44 + bounce + flameWave * 3, 3);
    g.fillCircle(18 * faceDirection, -46 + bounce + flameWave * 3, 3);
    g.fillStyle(0xffff00, 0.4 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -47 + bounce + flameWave * 4, 2);
    g.fillCircle(18 * faceDirection, -49 + bounce + flameWave * 4, 2);
  }
}
