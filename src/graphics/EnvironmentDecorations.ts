import Phaser from 'phaser';
import { THEME } from '../data/ThemeConfig';

export class EnvironmentDecorations {
  static drawPalmTree(scene: Phaser.Scene, x: number, y: number, scale: number = 1): void {
    const palm = scene.add.graphics();
    palm.setDepth(10);

    palm.fillStyle(THEME.colors.warmShadow, 0.22);
    palm.fillEllipse(x + 30, y + 10, 60 * scale, 20 * scale);

    palm.fillStyle(0x8b6914, 1);
    palm.beginPath();
    palm.moveTo(x - 8 * scale, y);
    palm.lineTo(x - 5 * scale, y - 80 * scale);
    palm.lineTo(x + 5 * scale, y - 85 * scale);
    palm.lineTo(x + 8 * scale, y);
    palm.closePath();
    palm.fillPath();

    palm.lineStyle(2, 0x6b4f10, 0.6);
    for (let i = 0; i < 6; i++) {
      const ty = y - 10 - i * 12 * scale;
      palm.lineBetween(x - 6 * scale, ty, x + 6 * scale, ty);
    }

    const frondColors = [0x2a7a2a, 0x2f8a33, 0x3a9a5a];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 50 + Math.random() * 20;
      palm.fillStyle(frondColors[i % 3], 1);
      EnvironmentDecorations.drawFrond(palm, x, y - 85 * scale, angle, length * scale);
    }

    palm.fillStyle(0x8b4513, 1);
    palm.fillCircle(x - 5 * scale, y - 78 * scale, 5 * scale);
    palm.fillCircle(x + 6 * scale, y - 80 * scale, 4 * scale);
  }

  private static drawFrond(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    angle: number,
    length: number
  ): void {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length * 0.6 - 20;
    const midX = x + Math.cos(angle) * length * 0.5;
    const midY = y + Math.sin(angle) * length * 0.3 - 25;

    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.lineTo(midX - 10, midY);
    graphics.lineTo(endX, endY);
    graphics.lineTo(midX + 10, midY);
    graphics.closePath();
    graphics.fillPath();

    graphics.lineStyle(1, 0x1a6b1a, 0.5);
    graphics.lineBetween(x, y, endX, endY);
  }

  static drawRocks(scene: Phaser.Scene, x: number, y: number): void {
    const rocks = scene.add.graphics();
    rocks.setDepth(5);

    rocks.fillStyle(THEME.colors.warmShadow, 0.22);
    rocks.fillEllipse(x + 10, y + 20, 60, 15);

    rocks.fillStyle(0x7a6855, 1);
    rocks.beginPath();
    rocks.moveTo(x - 25, y + 15);
    rocks.lineTo(x - 20, y - 15);
    rocks.lineTo(x + 5, y - 25);
    rocks.lineTo(x + 25, y - 10);
    rocks.lineTo(x + 30, y + 15);
    rocks.closePath();
    rocks.fillPath();

    rocks.fillStyle(0x9a8875, 1);
    rocks.beginPath();
    rocks.moveTo(x - 15, y - 5);
    rocks.lineTo(x - 10, y - 18);
    rocks.lineTo(x + 10, y - 20);
    rocks.lineTo(x + 5, y - 5);
    rocks.closePath();
    rocks.fillPath();

    rocks.fillStyle(0x6a5845, 1);
    rocks.fillCircle(x + 35, y + 5, 10);
    rocks.fillCircle(x - 35, y + 10, 8);
    rocks.fillStyle(0x8a7865, 1);
    rocks.fillCircle(x + 38, y, 6);
    rocks.fillStyle(THEME.colors.warmHighlight, 0.18);
    rocks.fillEllipse(x - 5, y - 8, 20, 8);
  }

  static drawRuins(scene: Phaser.Scene, x: number, y: number): void {
    const ruins = scene.add.graphics();
    ruins.setDepth(4);

    ruins.fillStyle(THEME.colors.warmShadow, 0.18);
    ruins.fillEllipse(x, y + 40, 100, 25);

    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x - 40, y - 30, 18, 60);
    ruins.fillStyle(0xd9c8a6, 1);
    ruins.fillRect(x - 38, y - 28, 14, 55);

    ruins.fillStyle(0xb9a886, 1);
    ruins.beginPath();
    ruins.moveTo(x - 42, y - 30);
    ruins.lineTo(x - 35, y - 45);
    ruins.lineTo(x - 25, y - 35);
    ruins.lineTo(x - 22, y - 30);
    ruins.closePath();
    ruins.fillPath();

    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x + 15, y - 10, 20, 40);
    ruins.fillStyle(0xd9c8a6, 1);
    ruins.fillRect(x + 17, y - 8, 16, 36);

    ruins.fillStyle(0xb9a886, 1);
    ruins.fillRect(x - 10, y + 15, 35, 18);
    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x - 8, y + 17, 31, 12);

    ruins.lineStyle(1, 0xa99876, 0.6);
    ruins.lineBetween(x - 36, y, x - 26, y);
    ruins.lineBetween(x - 36, y + 10, x - 26, y + 10);
    ruins.lineBetween(x + 19, y + 5, x + 31, y + 5);
    ruins.fillStyle(THEME.colors.warmHighlight, 0.12);
    ruins.fillRect(x - 38, y - 28, 14, 10);
  }

  static drawOasis(scene: Phaser.Scene, x: number, y: number): void {
    const oasis = scene.add.graphics();
    oasis.setDepth(3);

    oasis.fillStyle(0x1a4a6b, 0.75);
    oasis.fillEllipse(x, y, 100, 40);

    oasis.fillStyle(0x4a90a8, 0.9);
    oasis.fillEllipse(x, y - 3, 95, 35);

    oasis.fillStyle(0x6ab0c8, 0.6);
    oasis.fillEllipse(x - 20, y - 8, 40, 15);

    oasis.fillStyle(0x228b22, 0.8);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const grassX = x + Math.cos(angle) * 55;
      const grassY = y + Math.sin(angle) * 22;
      oasis.fillTriangle(grassX, grassY, grassX - 4, grassY + 12, grassX + 4, grassY + 12);
    }
  }

  static drawCactus(scene: Phaser.Scene, x: number, y: number, scale: number = 1): void {
    const cactus = scene.add.graphics();
    cactus.setDepth(8);

    cactus.fillStyle(THEME.colors.warmShadow, 0.22);
    cactus.fillEllipse(x + 10, y + 5, 40 * scale, 12 * scale);

    cactus.fillStyle(0x2d5a27, 1);
    cactus.fillRoundedRect(x - 12 * scale, y - 70 * scale, 24 * scale, 75 * scale, 10 * scale);

    cactus.fillStyle(0x3d7a37, 1);
    cactus.fillRoundedRect(x - 6 * scale, y - 65 * scale, 12 * scale, 65 * scale, 5 * scale);

    cactus.fillStyle(0x2d5a27, 1);
    cactus.fillRoundedRect(x - 35 * scale, y - 45 * scale, 25 * scale, 15 * scale, 6 * scale);
    cactus.fillRoundedRect(x - 35 * scale, y - 55 * scale, 15 * scale, 25 * scale, 6 * scale);

    cactus.fillRoundedRect(x + 10 * scale, y - 35 * scale, 25 * scale, 15 * scale, 6 * scale);
    cactus.fillRoundedRect(x + 22 * scale, y - 50 * scale, 15 * scale, 30 * scale, 6 * scale);

    cactus.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 8; i++) {
      cactus.fillCircle(x + (Math.random() - 0.5) * 18 * scale, y - 20 - i * 7 * scale, 1.5);
    }

    cactus.fillStyle(THEME.colors.warmHighlight, 0.12);
    cactus.fillRoundedRect(x - 3 * scale, y - 65 * scale, 6 * scale, 55 * scale, 3 * scale);

    if (Math.random() > 0.5) {
      cactus.fillStyle(0xff69b4, 1);
      cactus.fillCircle(x, y - 72 * scale, 6 * scale);
      cactus.fillStyle(0xffb6c1, 1);
      cactus.fillCircle(x - 2, y - 74 * scale, 3 * scale);
    }
  }

  static drawScarab(scene: Phaser.Scene, x: number, y: number): void {
    const scarab = scene.add.graphics();
    scarab.setDepth(6);

    const scale = 0.8 + Math.random() * 0.4;

    scarab.fillStyle(0xffd700, 0.2);
    scarab.fillCircle(x, y, 18 * scale);
    scarab.fillStyle(0xffd700, 0.1);
    scarab.fillCircle(x, y, 25 * scale);

    scarab.fillStyle(THEME.colors.warmShadow, 0.2);
    scarab.fillEllipse(x + 3, y + 8 * scale, 16 * scale, 6 * scale);

    scarab.fillStyle(0xdaa520, 1);
    scarab.fillEllipse(x, y, 14 * scale, 10 * scale);

    scarab.fillStyle(0xffd700, 1);
    scarab.fillEllipse(x, y - 2 * scale, 12 * scale, 7 * scale);

    scarab.lineStyle(1, 0xb8860b, 0.8);
    scarab.lineBetween(x, y - 8 * scale, x, y + 8 * scale);

    scarab.lineStyle(1, 0xcd853f, 0.5);
    scarab.lineBetween(x - 5 * scale, y - 3 * scale, x + 5 * scale, y - 3 * scale);
    scarab.lineBetween(x - 6 * scale, y, x + 6 * scale, y);
    scarab.lineBetween(x - 5 * scale, y + 3 * scale, x + 5 * scale, y + 3 * scale);

    scarab.fillStyle(0xb8860b, 1);
    scarab.fillCircle(x, y - 10 * scale, 5 * scale);

    scarab.fillStyle(0x00ffff, 0.9);
    scarab.fillCircle(x - 2 * scale, y - 11 * scale, 1.5 * scale);
    scarab.fillCircle(x + 2 * scale, y - 11 * scale, 1.5 * scale);

    scarab.lineStyle(1.5, 0x8b6914, 1);
    scarab.lineBetween(x - 2 * scale, y - 14 * scale, x - 5 * scale, y - 17 * scale);
    scarab.lineBetween(x + 2 * scale, y - 14 * scale, x + 5 * scale, y - 17 * scale);

    scarab.lineStyle(1, 0x8b6914, 0.9);
    scarab.lineBetween(x - 6 * scale, y - 4 * scale, x - 12 * scale, y - 8 * scale);
    scarab.lineBetween(x - 7 * scale, y, x - 13 * scale, y - 2 * scale);
    scarab.lineBetween(x - 6 * scale, y + 4 * scale, x - 12 * scale, y + 6 * scale);
    scarab.lineBetween(x + 6 * scale, y - 4 * scale, x + 12 * scale, y - 8 * scale);
    scarab.lineBetween(x + 7 * scale, y, x + 13 * scale, y - 2 * scale);
    scarab.lineBetween(x + 6 * scale, y + 4 * scale, x + 12 * scale, y + 6 * scale);

    scarab.fillStyle(0xfffacd, 0.4);
    scarab.fillEllipse(x - 3 * scale, y - 3 * scale, 4 * scale, 3 * scale);
  }

  static drawDesertFlower(scene: Phaser.Scene, x: number, y: number): void {
    const flower = scene.add.graphics();
    flower.setDepth(5);

    flower.lineStyle(2, 0x3d7a37, 1);
    flower.lineBetween(x, y, x, y - 20);
    flower.lineBetween(x, y - 10, x - 8, y - 5);
    flower.lineBetween(x, y - 10, x + 8, y - 5);

    flower.fillStyle(0x4a8a44, 1);
    flower.fillEllipse(x - 10, y - 3, 8, 4);
    flower.fillEllipse(x + 10, y - 3, 8, 4);

    const petalColors = [0xff6b6b, 0xffa500, 0xffff00, 0xff69b4, 0x9370db];
    const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    flower.fillStyle(petalColor, 1);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * 6;
      const py = y - 20 + Math.sin(angle) * 6;
      flower.fillCircle(px, py, 4);
    }

    flower.fillStyle(0xffd700, 1);
    flower.fillCircle(x, y - 20, 3);
  }

  static drawTumbleweed(scene: Phaser.Scene, x: number, y: number): void {
    const tumbleweed = scene.add.graphics();
    tumbleweed.setDepth(5);

    tumbleweed.fillStyle(THEME.colors.warmShadow, 0.18);
    tumbleweed.fillEllipse(x + 3, y + 12, 25, 8);

    const size = 12 + Math.random() * 8;
    tumbleweed.fillStyle(0x8b7355, 0.9);
    tumbleweed.fillCircle(x, y, size);

    tumbleweed.lineStyle(1, 0x6b5344, 0.8);
    for (let i = 0; i < 12; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + (Math.random() - 0.5) * 2;
      const r1 = size * 0.3;
      const r2 = size * 0.9;
      tumbleweed.lineBetween(
        x + Math.cos(angle1) * r1,
        y + Math.sin(angle1) * r1,
        x + Math.cos(angle2) * r2,
        y + Math.sin(angle2) * r2
      );
    }

    tumbleweed.fillStyle(0xa08060, 0.5);
    tumbleweed.fillCircle(x - 3, y - 3, size * 0.4);
  }

  static drawPottery(scene: Phaser.Scene, x: number, y: number): void {
    const pottery = scene.add.graphics();
    pottery.setDepth(6);

    pottery.fillStyle(THEME.colors.warmShadow, 0.22);
    pottery.fillEllipse(x + 5, y + 20, 30, 10);

    pottery.fillStyle(0xb8860b, 1);
    pottery.beginPath();
    pottery.moveTo(x - 12, y + 18);
    pottery.lineTo(x - 18, y);
    pottery.lineTo(x - 15, y - 15);
    pottery.lineTo(x - 8, y - 22);
    pottery.lineTo(x + 8, y - 22);
    pottery.lineTo(x + 15, y - 15);
    pottery.lineTo(x + 18, y);
    pottery.lineTo(x + 12, y + 18);
    pottery.closePath();
    pottery.fillPath();

    pottery.fillStyle(0xa07608, 1);
    pottery.fillRect(x - 6, y - 28, 12, 8);

    pottery.fillStyle(0x8b6914, 1);
    pottery.fillRect(x - 8, y - 30, 16, 4);

    pottery.lineStyle(2, 0x654321, 0.7);
    pottery.lineBetween(x - 16, y - 5, x + 16, y - 5);
    pottery.lineBetween(x - 14, y + 8, x + 14, y + 8);

    pottery.fillStyle(0x4a3520, 0.6);
    for (let i = -12; i <= 12; i += 6) {
      pottery.fillCircle(x + i, y - 10, 2);
    }

    pottery.fillStyle(0xd4a856, 0.4);
    pottery.fillEllipse(x - 8, y - 5, 6, 12);

    pottery.fillStyle(THEME.colors.warmHighlight, 0.12);
    pottery.fillEllipse(x - 4, y - 8, 6, 16);

    if (Math.random() > 0.6) {
      pottery.fillStyle(0xb8860b, 0.8);
      pottery.beginPath();
      pottery.moveTo(x + 25, y + 15);
      pottery.lineTo(x + 35, y + 10);
      pottery.lineTo(x + 38, y + 18);
      pottery.lineTo(x + 30, y + 20);
      pottery.closePath();
      pottery.fillPath();
    }
  }

  static drawScorpion(scene: Phaser.Scene, x: number, y: number): void {
    const scorpion = scene.add.graphics();
    scorpion.setDepth(7);

    const facing = Math.random() > 0.5 ? 1 : -1;

    scorpion.fillStyle(0x2a1a0a, 1);
    scorpion.fillEllipse(x, y, 12, 8);

    scorpion.fillCircle(x + 8 * facing, y, 5);

    scorpion.fillStyle(0x3a2a1a, 1);
    for (let i = 1; i <= 4; i++) {
      scorpion.fillCircle(x - (6 + i * 4) * facing, y - i * 2, 3);
    }

    scorpion.fillStyle(0x1a0a00, 1);
    scorpion.fillTriangle(x - 24 * facing, y - 10, x - 22 * facing, y - 6, x - 28 * facing, y - 8);

    scorpion.lineStyle(2, 0x2a1a0a, 1);
    scorpion.lineBetween(x + 10 * facing, y - 2, x + 18 * facing, y - 6);
    scorpion.lineBetween(x + 10 * facing, y + 2, x + 18 * facing, y + 6);
    scorpion.fillStyle(0x3a2a1a, 1);
    scorpion.fillCircle(x + 20 * facing, y - 6, 3);
    scorpion.fillCircle(x + 20 * facing, y + 6, 3);

    scorpion.lineStyle(1, 0x2a1a0a, 0.8);
    for (let i = -1; i <= 1; i += 2) {
      scorpion.lineBetween(x - 3, y, x - 3 + i * 8, y + 6);
      scorpion.lineBetween(x + 3, y, x + 3 + i * 8, y + 6);
    }
  }
}
