import Phaser from 'phaser';

/**
 * Handles drawing of the menu background and decorative frame
 */
export class MenuBackground {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Draw the main background with gradient and texture
   */
  drawBackground(width: number, height: number): Phaser.GameObjects.Graphics {
    const bg = this.scene.add.graphics();
    bg.setDepth(0);

    // Base color
    bg.fillStyle(0x0a0400, 1);
    bg.fillRect(0, 0, width, height);

    bg.fillStyle(0x1a0a00, 0.9);
    bg.fillRect(0, 0, width, height);

    // Center glow
    const centerX = width / 2;
    const centerY = height / 2;
    for (let i = 10; i > 0; i--) {
      const alpha = 0.02 * i;
      const radius = 100 + i * 80;
      bg.fillStyle(0x3a2010, alpha);
      bg.fillCircle(centerX, centerY - 50, radius);
    }

    // Subtle texture
    bg.lineStyle(1, 0x2a1808, 0.15);
    for (let y = 0; y < height; y += 8) {
      const offset = y % 16 === 0 ? 4 : 0;
      for (let x = offset; x < width; x += 20) {
        bg.lineBetween(x, y, x + 10, y);
      }
    }

    // Top vignette
    bg.fillStyle(0x000000, 0.4);
    bg.fillRect(0, 0, width, 80);
    bg.fillStyle(0x000000, 0.2);
    bg.fillRect(0, 80, width, 60);

    // Bottom vignette
    bg.fillStyle(0x000000, 0.4);
    bg.fillRect(0, height - 60, width, 60);
    bg.fillStyle(0x000000, 0.2);
    bg.fillRect(0, height - 100, width, 40);

    return bg;
  }

  /**
   * Draw the decorative frame around the menu
   */
  drawDecorativeFrame(width: number, height: number): Phaser.GameObjects.Graphics {
    const frame = this.scene.add.graphics();
    frame.setDepth(5);

    const padding = 60;
    const frameWidth = width - padding * 2;
    const frameHeight = height - padding * 2;
    const x = padding;
    const y = padding;

    // Shadow
    frame.fillStyle(0x000000, 0.5);
    frame.fillRoundedRect(x + 8, y + 8, frameWidth, frameHeight, 20);

    // Main frame
    frame.fillStyle(0x1a0a00, 1);
    frame.fillRoundedRect(x, y, frameWidth, frameHeight, 20);

    // Border layers
    frame.lineStyle(6, 0x8b6914, 1);
    frame.strokeRoundedRect(x + 4, y + 4, frameWidth - 8, frameHeight - 8, 18);

    frame.lineStyle(2, 0xd4a574, 1);
    frame.strokeRoundedRect(x + 12, y + 12, frameWidth - 24, frameHeight - 24, 14);

    frame.lineStyle(1, 0x4a3520, 0.5);
    frame.strokeRoundedRect(x + 18, y + 18, frameWidth - 36, frameHeight - 36, 12);

    // Corner decorations
    const corners = [
      { cx: x + 25, cy: y + 25 },
      { cx: x + frameWidth - 25, cy: y + 25 },
      { cx: x + 25, cy: y + frameHeight - 25 },
      { cx: x + frameWidth - 25, cy: y + frameHeight - 25 },
    ];

    corners.forEach((c) => {
      frame.fillStyle(0xd4a574, 1);
      frame.fillCircle(c.cx, c.cy, 15);

      frame.fillStyle(0x6b4914, 1);
      frame.fillCircle(c.cx, c.cy, 10);

      frame.fillStyle(0xffd700, 1);
      frame.fillCircle(c.cx, c.cy, 5);

      frame.fillStyle(0xfffacd, 0.7);
      frame.fillCircle(c.cx - 1, c.cy - 1, 2);
    });

    // Edge ornaments
    this.drawOrnament(frame, width / 2, y + 15, true);
    this.drawOrnament(frame, width / 2, y + frameHeight - 15, true);
    this.drawOrnament(frame, x + 15, height / 2, false);
    this.drawOrnament(frame, x + frameWidth - 15, height / 2, false);

    return frame;
  }

  private drawOrnament(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    horizontal: boolean
  ): void {
    const size = 40;

    graphics.fillStyle(0xd4a574, 1);
    if (horizontal) {
      graphics.beginPath();
      graphics.moveTo(x - size, y);
      graphics.lineTo(x, y - 8);
      graphics.lineTo(x + size, y);
      graphics.lineTo(x, y + 8);
      graphics.closePath();
      graphics.fillPath();
    } else {
      graphics.beginPath();
      graphics.moveTo(x, y - size);
      graphics.lineTo(x + 8, y);
      graphics.lineTo(x, y + size);
      graphics.lineTo(x - 8, y);
      graphics.closePath();
      graphics.fillPath();
    }

    // Center gem
    graphics.fillStyle(0xffd700, 0.8);
    graphics.fillCircle(x, y, 6);
    graphics.fillStyle(0xfffacd, 0.6);
    graphics.fillCircle(x - 1, y - 1, 3);
  }
}
