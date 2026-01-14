import Phaser from 'phaser';
import { drawStar } from './towers/TowerGraphicsBase';

export class GoldMineGraphics {

  static drawMine(
    graphics: Phaser.GameObjects.Graphics,
    level: 0 | 1 | 2 | 3,
    width: number = 60,
    height: number = 60
  ): void {
    graphics.clear();

    switch (level) {
      case 0:
        this.drawEmptySlot(graphics, width, height);
        break;
      case 1:
        this.drawLevel1(graphics, width, height);
        break;
      case 2:
        this.drawLevel2(graphics, width, height);
        break;
      case 3:
        this.drawLevel3(graphics, width, height);
        break;
    }
  }

  private static drawEmptySlot(g: Phaser.GameObjects.Graphics, _width: number, _height: number): void {
    const cx = 0;
    const cy = 0;

    const sketchColor = 0x8b6914;
    const sketchAlpha = 0.7;

    g.lineStyle(2, sketchColor, sketchAlpha * 0.6);

    g.lineBetween(cx - 35, cy + 20, cx - 20, cy - 15);
    g.lineBetween(cx - 33, cy + 18, cx - 18, cy - 12);

    g.lineBetween(cx + 35, cy + 20, cx + 20, cy - 15);
    g.lineBetween(cx + 33, cy + 18, cx + 18, cy - 12);

    g.lineBetween(cx - 20, cy - 15, cx, cy - 25);
    g.lineBetween(cx + 20, cy - 15, cx, cy - 25);

    g.lineBetween(cx - 28, cy + 5, cx - 15, cy - 8);
    g.lineBetween(cx + 28, cy + 5, cx + 15, cy - 8);

    g.lineStyle(2.5, sketchColor, sketchAlpha);

    g.lineBetween(cx - 18, cy + 22, cx - 18, cy - 5);
    g.lineBetween(cx - 14, cy + 22, cx - 14, cy - 5);
    g.lineBetween(cx - 18, cy + 22, cx - 14, cy + 22);
    g.lineBetween(cx - 18, cy - 5, cx - 14, cy - 5);

    g.lineBetween(cx + 18, cy + 22, cx + 18, cy - 5);
    g.lineBetween(cx + 14, cy + 22, cx + 14, cy - 5);
    g.lineBetween(cx + 18, cy + 22, cx + 14, cy + 22);
    g.lineBetween(cx + 18, cy - 5, cx + 14, cy - 5);

    g.lineBetween(cx - 22, cy - 8, cx + 22, cy - 8);
    g.lineBetween(cx - 22, cy - 12, cx + 22, cy - 12);
    g.lineBetween(cx - 22, cy - 8, cx - 22, cy - 12);
    g.lineBetween(cx + 22, cy - 8, cx + 22, cy - 12);

    g.lineStyle(1.5, sketchColor, sketchAlpha * 0.5);
    for (let i = -10; i <= 10; i += 3) {
      g.lineBetween(cx + i, cy - 3, cx + i, cy + 18);
    }

    for (let i = 0; i <= 20; i += 4) {
      g.lineBetween(cx - 10, cy - 3 + i, cx + 10, cy - 3 + i);
    }

    g.lineStyle(1.5, sketchColor, sketchAlpha * 0.8);
    g.lineBetween(cx - 8, cy + 22, cx - 10, cy + 35);
    g.lineBetween(cx + 8, cy + 22, cx + 10, cy + 35);

    g.lineBetween(cx - 12, cy + 26, cx + 12, cy + 26);
    g.lineBetween(cx - 13, cy + 32, cx + 13, cy + 32);

    g.lineStyle(2, sketchColor, sketchAlpha);

    g.lineBetween(cx + 22, cy + 25, cx + 32, cy - 5);

    g.lineBetween(cx + 28, cy - 2, cx + 38, cy + 5);
    g.lineBetween(cx + 28, cy - 2, cx + 26, cy - 10);

    g.lineStyle(1.5, 0xdaa520, sketchAlpha);
    this.drawSketchyCircle(g, cx - 25, cy + 28, 5);
    this.drawSketchyCircle(g, cx - 20, cy + 32, 4);

    g.lineStyle(2, 0xdaa520, 0.8);

    this.drawSketchyCircle(g, cx, cy + 42, 8);

    g.lineBetween(cx, cy + 38, cx, cy + 46);
    g.lineBetween(cx - 3, cy + 40, cx + 3, cy + 40);
    g.lineBetween(cx - 3, cy + 44, cx + 3, cy + 44);
  }

  private static drawSketchyCircle(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number): void {
    const segments = 12;
    const wobble = radius * 0.15;

    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      const r1 = radius + (Math.random() - 0.5) * wobble;
      const r2 = radius + (Math.random() - 0.5) * wobble;

      const x1 = x + Math.cos(angle1) * r1;
      const y1 = y + Math.sin(angle1) * r1;
      const x2 = x + Math.cos(angle2) * r2;
      const y2 = y + Math.sin(angle2) * r2;

      g.lineBetween(x1, y1, x2, y2);
    }
  }

  private static drawLevel1(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;

    g.fillStyle(0x5c4a38, 1);
    g.beginPath();
    g.moveTo(cx - hw - 10, cy + hh);
    g.lineTo(cx - hw + 5, cy - 5);
    g.lineTo(cx - 15, cy - hh + 5);
    g.lineTo(cx + 15, cy - hh + 5);
    g.lineTo(cx + hw - 5, cy - 5);
    g.lineTo(cx + hw + 10, cy + hh);
    g.closePath();
    g.fill();

    g.fillStyle(0x4a3a2a, 0.7);
    g.fillCircle(cx - 20, cy - 10, 6);
    g.fillCircle(cx + 22, cy - 8, 5);
    g.fillCircle(cx - 25, cy + 5, 4);
    g.fillCircle(cx + 28, cy + 8, 5);
    g.fillCircle(cx, cy - 20, 7);

    g.fillStyle(0x0a0805, 1);
    g.fillRoundedRect(cx - 18, cy - 8, 36, 32, 4);

    g.fillStyle(0x1a1510, 0.5);
    g.fillRect(cx - 14, cy - 4, 28, 24);

    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(cx - 22, cy - 12, 7, 40);
    g.fillRect(cx + 15, cy - 12, 7, 40);

    g.fillRect(cx - 26, cy - 18, 52, 10);

    g.lineStyle(1, 0x654321, 0.6);
    g.lineBetween(cx - 19, cy - 8, cx - 19, cy + 20);
    g.lineBetween(cx - 17, cy - 6, cx - 17, cy + 18);
    g.lineBetween(cx + 18, cy - 8, cx + 18, cy + 20);
    g.lineBetween(cx + 20, cy - 6, cx + 20, cy + 18);

    g.lineBetween(cx - 22, cy - 14, cx + 22, cy - 14);
    g.lineBetween(cx - 20, cy - 12, cx + 20, cy - 12);

    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(cx - 19, cy - 4, 1.5);
    g.fillCircle(cx - 19, cy + 12, 1.5);
    g.fillCircle(cx + 19, cy - 4, 1.5);
    g.fillCircle(cx + 19, cy + 12, 1.5);

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(cx - 10, cy + 24, 3, 14);
    g.fillRect(cx + 7, cy + 24, 3, 14);

    g.fillStyle(0x6b4423, 1);
    g.fillRect(cx - 14, cy + 27, 28, 3);
    g.fillRect(cx - 14, cy + 33, 28, 3);

    g.fillStyle(0xffd700, 0.9);
    g.fillCircle(cx - 7, cy + 20, 4);
    g.fillCircle(cx + 5, cy + 18, 3);
    g.fillCircle(cx - 2, cy + 22, 2.5);

    g.fillStyle(0xffec8b, 0.7);
    g.fillCircle(cx - 6, cy + 18, 1.5);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(cx - 28, cy - 2, 4, 8);
    g.fillStyle(0xffaa00, 0.8);
    g.fillCircle(cx - 26, cy + 2, 3);
    g.fillStyle(0xffdd44, 0.5);
    g.fillCircle(cx - 26, cy + 2, 5);

    this.drawLevelIndicator(g, 1);
  }

  private static drawLevel2(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;

    g.fillStyle(0x5c4a38, 1);
    g.beginPath();
    g.moveTo(cx - hw - 15, cy + hh + 5);
    g.lineTo(cx - hw, cy - 10);
    g.lineTo(cx - 20, cy - hh);
    g.lineTo(cx + 20, cy - hh);
    g.lineTo(cx + hw, cy - 10);
    g.lineTo(cx + hw + 15, cy + hh + 5);
    g.closePath();
    g.fill();

    g.fillStyle(0x4a3a2a, 0.8);
    g.fillCircle(cx - 25, cy - 12, 8);
    g.fillCircle(cx + 26, cy - 10, 7);
    g.fillCircle(cx, cy - 22, 9);
    g.fillCircle(cx - 30, cy + 8, 6);
    g.fillCircle(cx + 32, cy + 10, 6);

    g.fillStyle(0x6a6055, 1);
    g.fillRoundedRect(cx - 28, cy - 18, 56, 48, 6);

    g.fillStyle(0x050403, 1);
    g.fillRoundedRect(cx - 20, cy - 10, 40, 34, 5);

    g.fillStyle(0x1a1510, 0.4);
    g.fillRect(cx - 16, cy - 6, 32, 26);

    g.fillStyle(0x7a4a1b, 1);
    g.fillRect(cx - 24, cy - 14, 9, 44);
    g.fillRect(cx + 15, cy - 14, 9, 44);
    g.fillRect(cx - 28, cy - 20, 56, 12);

    g.fillStyle(0x707070, 1);

    g.fillRect(cx - 28, cy - 20, 10, 4);
    g.fillRect(cx - 28, cy - 20, 4, 10);

    g.fillRect(cx + 18, cy - 20, 10, 4);
    g.fillRect(cx + 24, cy - 20, 4, 10);

    g.fillRect(cx - 28, cy + 22, 10, 4);
    g.fillRect(cx - 28, cy + 18, 4, 8);

    g.fillRect(cx + 18, cy + 22, 10, 4);
    g.fillRect(cx + 24, cy + 18, 4, 8);

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(cx - 25, cy - 2, 5, 12);
    g.fillRect(cx + 20, cy - 2, 5, 12);

    g.fillStyle(0x8a8a8a, 1);
    g.fillCircle(cx - 22, cy, 2);
    g.fillCircle(cx - 22, cy + 8, 2);
    g.fillCircle(cx + 22, cy, 2);
    g.fillCircle(cx + 22, cy + 8, 2);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(cx - 12, cy + 24, 4, 16);
    g.fillRect(cx + 8, cy + 24, 4, 16);

    g.fillStyle(0x5a3a1a, 1);
    g.fillRect(cx - 16, cy + 26, 32, 4);
    g.fillRect(cx - 16, cy + 34, 32, 4);

    this.drawMinecart(g, cx, cy + 12, 1.0, true);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(cx - 32, cy - 4, 5, 10);
    g.fillRect(cx + 27, cy - 4, 5, 10);
    g.fillStyle(0xffaa00, 0.9);
    g.fillCircle(cx - 30, cy + 2, 4);
    g.fillCircle(cx + 30, cy + 2, 4);
    g.fillStyle(0xffdd44, 0.4);
    g.fillCircle(cx - 30, cy + 2, 7);
    g.fillCircle(cx + 30, cy + 2, 7);

    g.fillStyle(0x6a4a2a, 1);
    g.fillRect(cx - 35, cy + 15, 6, 25);
    g.fillRect(cx + 29, cy + 15, 6, 25);

    this.drawLevelIndicator(g, 2);
  }

  private static drawLevel3(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;

    g.fillStyle(0xffd700, 0.15);
    g.fillCircle(cx, cy, hw + 20);
    g.fillStyle(0xffd700, 0.1);
    g.fillCircle(cx, cy, hw + 30);

    g.fillStyle(0x5c4a38, 1);
    g.beginPath();
    g.moveTo(cx - hw - 20, cy + hh + 10);
    g.lineTo(cx - hw - 5, cy - 15);
    g.lineTo(cx - 25, cy - hh - 5);
    g.lineTo(cx + 25, cy - hh - 5);
    g.lineTo(cx + hw + 5, cy - 15);
    g.lineTo(cx + hw + 20, cy + hh + 10);
    g.closePath();
    g.fill();

    g.fillStyle(0x7a7065, 1);
    g.fillRoundedRect(cx - 32, cy - 22, 64, 56, 8);

    g.lineStyle(3, 0xdaa520, 1);
    g.strokeRoundedRect(cx - 32, cy - 22, 64, 56, 8);

    g.fillStyle(0xffd700, 0.2);
    g.fillRoundedRect(cx - 26, cy - 16, 52, 46, 6);

    g.fillStyle(0x030201, 1);
    g.fillRoundedRect(cx - 20, cy - 8, 40, 34, 6);

    g.fillStyle(0xffa500, 0.15);
    g.fillRoundedRect(cx - 16, cy - 4, 32, 26, 4);

    g.fillStyle(0xdaa520, 1);

    g.fillRect(cx - 24, cy - 12, 8, 42);
    g.fillStyle(0xffd700, 1);
    g.fillRect(cx - 23, cy - 10, 2, 38);

    g.fillStyle(0xdaa520, 1);
    g.fillRect(cx + 16, cy - 12, 8, 42);
    g.fillStyle(0xffd700, 1);
    g.fillRect(cx + 21, cy - 10, 2, 38);

    g.fillStyle(0xdaa520, 1);
    g.fillRect(cx - 28, cy - 18, 56, 12);

    g.fillStyle(0xffd700, 1);
    g.fillRect(cx - 28, cy - 20, 56, 4);
    g.fillRect(cx - 28, cy - 10, 56, 3);

    g.fillStyle(0xffec8b, 1);
    g.fillCircle(cx - 20, cy - 6, 3);
    g.fillCircle(cx + 20, cy - 6, 3);
    g.fillCircle(cx - 20, cy + 10, 3);
    g.fillCircle(cx + 20, cy + 10, 3);

    g.fillStyle(0xff6b6b, 1);
    g.fillCircle(cx, cy - 14, 4);
    g.fillStyle(0xff9999, 0.8);
    g.fillCircle(cx - 1, cy - 15, 2);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(cx - 12, cy + 26, 4, 16);
    g.fillRect(cx + 8, cy + 26, 4, 16);
    g.fillStyle(0xdaa520, 1);
    g.fillRect(cx - 11, cy + 26, 2, 16);
    g.fillRect(cx + 11, cy + 26, 2, 16);

    g.fillStyle(0x8b6914, 1);
    g.fillRect(cx - 16, cy + 28, 32, 4);
    g.fillRect(cx - 16, cy + 36, 32, 4);

    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 8, cy + 18, 6);
    g.fillCircle(cx + 6, cy + 16, 5);
    g.fillCircle(cx - 2, cy + 14, 5);
    g.fillCircle(cx + 10, cy + 20, 4);
    g.fillCircle(cx - 10, cy + 22, 4);
    g.fillCircle(cx, cy + 20, 4);
    g.fillCircle(cx + 4, cy + 22, 3);

    g.fillStyle(0xffc107, 1);
    g.fillRect(cx - 6, cy + 10, 12, 4);
    g.fillRect(cx - 4, cy + 7, 8, 3);

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx - 5, cy + 12, 2);
    g.fillCircle(cx + 7, cy + 14, 1.5);
    g.fillCircle(cx - 8, cy + 16, 1.5);
    g.fillCircle(cx + 3, cy + 18, 1);

    g.fillStyle(0xdaa520, 1);
    g.fillRect(cx - 38, cy - 8, 8, 14);
    g.fillRect(cx + 30, cy - 8, 8, 14);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(cx - 34, cy, 5);
    g.fillCircle(cx + 34, cy, 5);
    g.fillStyle(0xffee88, 0.5);
    g.fillCircle(cx - 34, cy, 10);
    g.fillCircle(cx + 34, cy, 10);

    this.drawLevelIndicator(g, 3);
  }

  static drawMinecart(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number = 1, hasGold: boolean = true): void {
    const s = scale;

    g.fillStyle(0x5a4535, 1);
    g.beginPath();
    g.moveTo(x - 14 * s, y + 8 * s);
    g.lineTo(x - 10 * s, y - 6 * s);
    g.lineTo(x + 10 * s, y - 6 * s);
    g.lineTo(x + 14 * s, y + 8 * s);
    g.closePath();
    g.fill();

    g.fillStyle(0x6a5545, 1);
    g.fillRect(x - 12 * s, y - 8 * s, 24 * s, 4 * s);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(x - 12 * s, y - 2 * s, 24 * s, 2 * s);
    g.fillRect(x - 13 * s, y + 4 * s, 26 * s, 2 * s);

    g.fillStyle(0x6a6a6a, 1);
    g.fillCircle(x - 10 * s, y - 1 * s, 1.5 * s);
    g.fillCircle(x + 10 * s, y - 1 * s, 1.5 * s);
    g.fillCircle(x - 11 * s, y + 5 * s, 1.5 * s);
    g.fillCircle(x + 11 * s, y + 5 * s, 1.5 * s);

    if (hasGold) {

      g.fillStyle(0xffd700, 1);
      g.fillCircle(x - 4 * s, y - 4 * s, 5 * s);
      g.fillCircle(x + 4 * s, y - 3 * s, 4 * s);
      g.fillCircle(x, y - 6 * s, 4 * s);
      g.fillCircle(x - 6 * s, y - 2 * s, 3 * s);
      g.fillCircle(x + 6 * s, y - 1 * s, 3 * s);

      g.fillStyle(0xffec8b, 0.8);
      g.fillCircle(x - 3 * s, y - 6 * s, 2 * s);
      g.fillCircle(x + 5 * s, y - 4 * s, 1.5 * s);
    }

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(x - 16 * s, y + 8 * s, 32 * s, 3 * s);

    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(x - 12 * s, y + 12 * s, 5 * s);
    g.fillCircle(x + 12 * s, y + 12 * s, 5 * s);

    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(x - 12 * s, y + 12 * s, 2 * s);
    g.fillCircle(x + 12 * s, y + 12 * s, 2 * s);

    g.lineStyle(1.5 * s, 0x3a3a3a, 1);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      g.lineBetween(
        x - 12 * s + Math.cos(angle) * 2 * s,
        y + 12 * s + Math.sin(angle) * 2 * s,
        x - 12 * s + Math.cos(angle) * 5 * s,
        y + 12 * s + Math.sin(angle) * 5 * s
      );
      g.lineBetween(
        x + 12 * s + Math.cos(angle) * 2 * s,
        y + 12 * s + Math.sin(angle) * 2 * s,
        x + 12 * s + Math.cos(angle) * 5 * s,
        y + 12 * s + Math.sin(angle) * 5 * s
      );
    }
  }

  static drawWagon(graphics: Phaser.GameObjects.Graphics, goldAmount: number = 1): void {
    graphics.clear();

    const scale = 1.2;

    this.drawMinecart(graphics, 0, 0, scale, goldAmount > 0);

    if (goldAmount >= 2) {
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(-8 * scale, -8 * scale, 3 * scale);
      graphics.fillCircle(8 * scale, -7 * scale, 3 * scale);
    }
    if (goldAmount >= 3) {
      graphics.fillStyle(0xffec8b, 1);
      graphics.fillCircle(0, -10 * scale, 4 * scale);

      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(-2 * scale, -9 * scale, 1.5 * scale);
      graphics.fillCircle(4 * scale, -8 * scale, 1 * scale);
    }
  }

  static drawLevelIndicator(g: Phaser.GameObjects.Graphics, level: number): void {
    if (level === 1) {

      g.fillStyle(0xcd7f32, 1);
      drawStar(g, 0, -38, 4);
    } else if (level === 2) {

      g.fillStyle(0xc0c0c0, 1);
      drawStar(g, -8, -38, 4);
      drawStar(g, 8, -38, 4);
    } else if (level === 3) {

      g.fillStyle(0xffd700, 0.3);
      g.fillCircle(0, -40, 12);
      g.fillStyle(0xffd700, 1);
      drawStar(g, -12, -38, 4);
      drawStar(g, 0, -42, 5);
      drawStar(g, 12, -38, 4);
    }
  }

  static createShimmerTween(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: graphics,
      alpha: { from: 0.7, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  static createIdleTween(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: graphics,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
