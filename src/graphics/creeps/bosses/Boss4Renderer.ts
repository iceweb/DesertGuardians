import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss 4 (dragon-like boss with wings)
 */
export class Boss4Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean
  ): void {
    const hover = Math.sin(bounceTime * 3) * 3;
    const wingFlap = Math.sin(bounceTime * 4) * 0.25;
    const breathe = 1 + Math.sin(bounceTime * 4) * 0.04;

    // Fire aura
    g.fillStyle(0xff4400, 0.12);
    g.fillCircle(0, -5 + hover, 60 * breathe);
    g.fillStyle(0xffaa00, 0.08);
    g.fillCircle(0, -5 + hover, 50 * breathe);

    // Shadow
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 35, 55, 18);

    // Tail
    g.fillStyle(0xaa5533, 1);
    g.beginPath();
    g.moveTo(-18 * faceDirection, 10 + hover);
    g.lineTo(-38 * faceDirection, 20 + hover);
    g.lineTo(-52 * faceDirection, 16 + hover);
    g.lineTo(-50 * faceDirection, 10 + hover);
    g.lineTo(-36 * faceDirection, 12 + hover);
    g.lineTo(-20 * faceDirection, 4 + hover);
    g.closePath();
    g.fillPath();

    // Tail spines
    g.fillStyle(0x663322, 1);
    for (let i = 0; i < 3; i++) {
      const tx = (-28 - i * 10) * faceDirection;
      g.beginPath();
      g.moveTo(tx - 2 * faceDirection, 10 + hover);
      g.lineTo(tx, 4 + hover);
      g.lineTo(tx + 2 * faceDirection, 10 + hover);
      g.closePath();
      g.fillPath();
    }

    // Wings
    g.fillStyle(0x883322, 1);
    g.beginPath();
    g.moveTo(-16, -6 + hover);
    g.lineTo(-40, -30 + hover + wingFlap * 35);
    g.lineTo(-55, -20 + hover + wingFlap * 30);
    g.lineTo(-50, 0 + hover + wingFlap * 20);
    g.lineTo(-40, 12 + hover + wingFlap * 10);
    g.lineTo(-22, 6 + hover);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(16, -6 + hover);
    g.lineTo(40, -30 + hover + wingFlap * 35);
    g.lineTo(55, -20 + hover + wingFlap * 30);
    g.lineTo(50, 0 + hover + wingFlap * 20);
    g.lineTo(40, 12 + hover + wingFlap * 10);
    g.lineTo(22, 6 + hover);
    g.closePath();
    g.fillPath();

    // Wing bones
    g.lineStyle(2, 0x662211, 0.9);
    g.beginPath();
    g.moveTo(-18, -4 + hover);
    g.lineTo(-42, -18 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(-20, 2 + hover);
    g.lineTo(-46, -6 + hover + wingFlap * 22);
    g.strokePath();
    g.beginPath();
    g.moveTo(18, -4 + hover);
    g.lineTo(42, -18 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(20, 2 + hover);
    g.lineTo(46, -6 + hover + wingFlap * 22);
    g.strokePath();

    // Wing tips
    g.fillStyle(0x332211, 1);
    g.fillCircle(-40, -28 + hover + wingFlap * 32, 3);
    g.fillCircle(40, -28 + hover + wingFlap * 32, 3);

    // Body
    g.fillStyle(0xbb6644, 1);
    g.fillEllipse(0, 4 + hover, 40 * breathe, 32 * breathe);

    // Belly scales
    g.fillStyle(0xddcc99, 1);
    g.fillEllipse(0, 10 + hover, 24, 18);
    g.fillStyle(0xeeddaa, 0.8);
    for (let i = 0; i < 5; i++) {
      g.fillRect(-12, 2 + i * 4 + hover, 24, 2);
    }

    // Back spines
    g.fillStyle(0x774422, 1);
    for (let i = 0; i < 7; i++) {
      const spineX = -16 + i * 5;
      const spineH = 12 + Math.sin(bounceTime * 3 + i * 0.5) * 2;
      g.beginPath();
      g.moveTo(spineX - 4, -14 + hover);
      g.lineTo(spineX, -14 - spineH + hover);
      g.lineTo(spineX + 4, -14 + hover);
      g.closePath();
      g.fillPath();
    }

    // Legs
    g.fillStyle(0xaa5533, 1);
    g.fillEllipse(-16, 20 + hover, 12, 16);
    g.fillEllipse(16, 20 + hover, 12, 16);
    g.fillEllipse(-24, 8 + hover, 10, 12);
    g.fillEllipse(24, 8 + hover, 10, 12);

    // Feet
    g.fillStyle(0x553322, 1);
    g.fillEllipse(-16, 34, 12, 7);
    g.fillEllipse(16, 34, 12, 7);
    g.fillCircle(-22, 35, 3);
    g.fillCircle(-10, 36, 3);
    g.fillCircle(10, 36, 3);
    g.fillCircle(22, 35, 3);

    // Neck
    g.fillStyle(0xbb6644, 1);
    g.fillEllipse(16 * faceDirection, -14 + hover, 14, 18);

    // Head base
    g.fillStyle(0xcc7755, 1);
    g.fillEllipse(28 * faceDirection, -18 + hover, 18, 16);

    // Snout
    g.fillStyle(0xdd8866, 1);
    g.fillEllipse(42 * faceDirection, -16 + hover, 12, 10);

    // Horns
    g.fillStyle(0x443322, 1);
    g.beginPath();
    g.moveTo(22 * faceDirection, -30 + hover);
    g.lineTo(16 * faceDirection, -44 + hover);
    g.lineTo(14 * faceDirection, -42 + hover);
    g.lineTo(18 * faceDirection, -30 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(34 * faceDirection, -28 + hover);
    g.lineTo(38 * faceDirection, -42 + hover);
    g.lineTo(36 * faceDirection, -40 + hover);
    g.lineTo(30 * faceDirection, -28 + hover);
    g.closePath();
    g.fillPath();

    // Head crest
    g.fillStyle(0x885544, 1);
    g.beginPath();
    g.moveTo(24 * faceDirection, -26 + hover);
    g.lineTo(28 * faceDirection, -32 + hover);
    g.lineTo(32 * faceDirection, -26 + hover);
    g.closePath();
    g.fillPath();

    // Eye
    g.fillStyle(0xff6600, 1);
    g.fillEllipse(32 * faceDirection, -22 + hover, 5, 6);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(33 * faceDirection, -22 + hover, 2, 5);
    g.fillStyle(0xffff00, 0.6);
    g.fillCircle(31 * faceDirection, -24 + hover, 1.5);

    // Nostrils with smoke
    g.fillStyle(0x332222, 1);
    g.fillCircle(50 * faceDirection, -18 + hover, 2);
    g.fillCircle(48 * faceDirection, -14 + hover, 2);
    g.fillStyle(0x666666, 0.4);
    g.fillCircle(54 * faceDirection, -20 + hover, 4);
    g.fillCircle(56 * faceDirection, -22 + hover, 3);

    // Open mouth with fire
    g.fillStyle(0xaa5533, 1);
    g.fillEllipse(42 * faceDirection, -8 + hover, 12, 8);
    g.fillStyle(0xff4400, 0.6);
    g.fillEllipse(48 * faceDirection, -8 + hover, 8, 5);
    g.fillStyle(0xffaa00, 0.4);
    g.fillCircle(54 * faceDirection, -8 + hover, 4);

    // Teeth
    g.fillStyle(0xffffee, 1);
    g.fillRect(36 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(40 * faceDirection, -13 + hover, 2, 6);
    g.fillRect(44 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(48 * faceDirection, -11 + hover, 2, 4);
  }
}
