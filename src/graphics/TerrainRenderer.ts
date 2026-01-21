import Phaser from 'phaser';
import { THEME } from '../data/ThemeConfig';

/**
 * Handles rendering of sky background and desert terrain
 */
export class TerrainRenderer {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  drawSkyBackground(): Phaser.GameObjects.Graphics {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    const sky = this.scene.add.graphics();
    sky.setDepth(-100);

    // Gradient colors from top to bottom
    const colors = [
      { y: 0, color: 0x6fc1e6 },
      { y: 0.35, color: 0xa8d6ee },
      { y: 0.65, color: 0xf5cfa0 },
      { y: 0.85, color: 0xe9a868 },
      { y: 1, color: 0xd9935a },
    ];

    // Draw gradient sky
    for (let i = 0; i < colors.length - 1; i++) {
      const startY = colors[i].y * height;
      const endY = colors[i + 1].y * height;
      const steps = Math.ceil(endY - startY);

      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const r1 = (colors[i].color >> 16) & 0xff;
        const g1 = (colors[i].color >> 8) & 0xff;
        const b1 = colors[i].color & 0xff;
        const r2 = (colors[i + 1].color >> 16) & 0xff;
        const g2 = (colors[i + 1].color >> 8) & 0xff;
        const b2 = colors[i + 1].color & 0xff;

        const r = Math.floor(r1 + (r2 - r1) * t);
        const g = Math.floor(g1 + (g2 - g1) * t);
        const b = Math.floor(b1 + (b2 - b1) * t);

        sky.fillStyle((r << 16) | (g << 8) | b, 1);
        sky.fillRect(0, startY + j, width, 2);
      }
    }

    // Sun
    sky.fillStyle(0xfffacd, 0.9);
    sky.fillCircle(1600, 120, 60);
    sky.fillStyle(0xffff99, 0.5);
    sky.fillCircle(1600, 120, 80);
    sky.fillStyle(0xffff66, 0.2);
    sky.fillCircle(1600, 120, 110);

    // Atmospheric haze layers
    sky.fillStyle(0xf6c46b, 0.18);
    sky.fillRect(0, height * 0.45, width, height * 0.2);

    sky.fillStyle(THEME.colors.warmHighlight, 0.12);
    sky.fillRect(0, height * 0.6, width, height * 0.2);

    sky.fillStyle(THEME.colors.warmShadow, 0.08);
    sky.fillRect(0, 0, width, height * 0.15);

    return sky;
  }

  drawDesertTerrain(): Phaser.GameObjects.Graphics {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    const terrain = this.scene.add.graphics();
    terrain.setDepth(-50);

    // Base sand color
    terrain.fillStyle(THEME.colors.sandLight, 1);
    terrain.fillRect(0, 0, width, height);

    // Mid-ground dunes
    terrain.fillStyle(THEME.colors.sandMid, 0.9);
    this.drawDune(terrain, -100, height * 0.7, 600, 200);
    this.drawDune(terrain, 400, height * 0.65, 800, 250);
    this.drawDune(terrain, 1000, height * 0.7, 700, 220);
    this.drawDune(terrain, 1500, height * 0.68, 600, 230);

    // Foreground dunes
    terrain.fillStyle(THEME.colors.sandDark, 0.6);
    this.drawDune(terrain, 100, height * 0.8, 500, 150);
    this.drawDune(terrain, 700, height * 0.78, 600, 180);
    this.drawDune(terrain, 1300, height * 0.82, 550, 160);

    // Wind ripples
    terrain.fillStyle(THEME.colors.warmHighlight, 0.28);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = 100 + Math.random() * (height - 150);
      terrain.fillEllipse(x, y, 80 + Math.random() * 120, 15 + Math.random() * 25);
    }

    // Atmospheric gradients
    terrain.fillStyle(0xf6c46b, 0.18);
    terrain.fillRect(0, 0, width, height * 0.22);

    terrain.fillStyle(THEME.colors.warmHighlight, 0.12);
    terrain.fillRect(0, height * 0.18, width, height * 0.24);

    terrain.fillStyle(THEME.colors.warmShadow, 0.08);
    terrain.fillRect(0, height * 0.55, width, height * 0.45);

    // Sand texture lines
    terrain.lineStyle(1, 0xcbb896, 0.25);
    for (let y = 150; y < height; y += 40) {
      terrain.beginPath();
      terrain.moveTo(0, y);
      for (let x = 0; x < width; x += 20) {
        terrain.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 5);
      }
      terrain.strokePath();
    }

    return terrain;
  }

  private drawDune(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    baseY: number,
    w: number,
    h: number
  ): void {
    graphics.beginPath();
    graphics.moveTo(x, baseY + h);

    for (let t = 0; t <= 1; t += 0.02) {
      const px = x + w * t;
      const py = baseY + h - h * Math.sin(t * Math.PI) * (0.8 + Math.sin(t * 2) * 0.2);
      graphics.lineTo(px, py);
    }

    graphics.lineTo(x + w, baseY + h);
    graphics.closePath();
    graphics.fillPath();
  }
}
