import Phaser from 'phaser';

/**
 * Handles drawing of desert-themed decorations for the menu scene
 */
export class MenuDecorations {
  private scene: Phaser.Scene;
  private decorations: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Draw all desert decorations
   */
  draw(width: number, height: number): Phaser.GameObjects.Graphics {
    this.decorations = this.scene.add.graphics();
    this.decorations.setDepth(10);

    // Pyramids
    this.drawPyramidSilhouette(150, height - 100, 80);
    this.drawPyramidSilhouette(250, height - 100, 50);
    this.drawPyramidSilhouette(width - 180, height - 100, 90);
    this.drawPyramidSilhouette(width - 280, height - 100, 55);

    // Palms
    this.drawPalmSilhouette(100, height - 95);
    this.drawPalmSilhouette(width - 100, height - 95);
    this.drawPalmSilhouette(320, height - 95);
    this.drawPalmSilhouette(width - 320, height - 95);

    // Stars
    this.drawStars(width, 150);

    // Moon
    this.drawMoon(width - 180, 130);

    // Scarabs
    this.drawScarabDecoration(width / 2 - 200, 180);
    this.drawScarabDecoration(width / 2 + 200, 180);

    // Cacti
    this.drawCactus(130, height / 2 - 60);
    this.drawCactus(width - 130, height / 2 - 60);

    // Rocks
    this.drawRocks(120, height / 2 + 60);
    this.drawRocks(width - 120, height / 2 + 60);
    this.drawRocks(140, height / 2 + 120);
    this.drawRocks(width - 140, height / 2 + 120);

    return this.decorations;
  }

  private drawPyramidSilhouette(x: number, y: number, size: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    g.fillStyle(0x2a1a08, 0.8);
    g.beginPath();
    g.moveTo(x - size, y);
    g.lineTo(x, y - size * 0.8);
    g.lineTo(x + size, y);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x4a3520, 0.5);
    g.lineBetween(x, y - size * 0.8, x + size, y);
  }

  private drawPalmSilhouette(x: number, y: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    g.fillStyle(0x1a0a00, 0.9);

    // Trunk
    g.fillRect(x - 3, y - 40, 6, 45);

    // Fronds
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i - 2) * 0.4;
      const length = 25;
      g.lineStyle(3, 0x1a0a00, 0.9);
      g.beginPath();
      g.moveTo(x, y - 40);
      g.lineTo(x + Math.cos(angle) * length, y - 40 + Math.sin(angle) * length);
      g.strokePath();
    }
  }

  private drawStars(width: number, _maxY: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    const starPositions = [
      { x: 100, y: 100 },
      { x: 200, y: 80 },
      { x: 350, y: 110 },
      { x: 500, y: 90 },
      { x: 650, y: 105 },
      { x: 800, y: 85 },
      { x: width - 100, y: 100 },
      { x: width - 200, y: 85 },
      { x: width - 350, y: 95 },
      { x: width - 500, y: 110 },
    ];

    starPositions.forEach((pos) => {
      const size = 1 + Math.random() * 2;
      const alpha = 0.4 + Math.random() * 0.4;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(pos.x, pos.y, size);

      g.fillStyle(0xffd700, alpha * 0.3);
      g.fillCircle(pos.x, pos.y, size + 2);
    });
  }

  private drawMoon(x: number, y: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    // Glow
    g.fillStyle(0xffd700, 0.1);
    g.fillCircle(x, y, 40);
    g.fillStyle(0xffd700, 0.15);
    g.fillCircle(x, y, 30);

    // Moon body
    g.fillStyle(0xffeedd, 0.9);
    g.fillCircle(x, y, 20);

    // Crescent shadow
    g.fillStyle(0x1a0a00, 1);
    g.fillCircle(x + 8, y - 2, 16);
  }

  private drawScarabDecoration(x: number, y: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    g.fillStyle(0xffd700, 0.6);
    g.fillEllipse(x, y, 20, 14);
    g.fillStyle(0xc9a86c, 0.8);
    g.fillEllipse(x, y - 2, 16, 10);
    g.fillStyle(0xffd700, 0.4);
    g.fillCircle(x, y - 2, 4);
  }

  private drawCactus(x: number, y: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    // Main body
    g.fillStyle(0x2d5a1e, 0.85);
    g.fillRoundedRect(x - 8, y - 40, 16, 60, 6);

    // Left arm
    g.fillRoundedRect(x - 28, y - 20, 20, 12, 5);
    g.fillRoundedRect(x - 28, y - 35, 12, 20, 5);

    // Right arm
    g.fillRoundedRect(x + 8, y - 10, 20, 12, 5);
    g.fillRoundedRect(x + 16, y - 30, 12, 25, 5);

    // Highlights
    g.fillStyle(0x4a8a3a, 0.5);
    g.fillRoundedRect(x - 5, y - 38, 4, 55, 3);
    g.fillRoundedRect(x - 25, y - 33, 4, 15, 2);
    g.fillRoundedRect(x + 19, y - 28, 4, 20, 2);

    // Spines
    g.fillStyle(0xc9a86c, 0.6);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(x - 8, y - 35 + i * 12, 1);
      g.fillCircle(x + 8, y - 35 + i * 12, 1);
    }
  }

  private drawRocks(x: number, y: number): void {
    if (!this.decorations) return;
    const g = this.decorations;

    // Main rock
    g.fillStyle(0x4a3a2a, 0.9);
    g.beginPath();
    g.moveTo(x - 20, y + 10);
    g.lineTo(x - 15, y - 8);
    g.lineTo(x - 5, y - 15);
    g.lineTo(x + 8, y - 12);
    g.lineTo(x + 18, y - 5);
    g.lineTo(x + 20, y + 10);
    g.closePath();
    g.fillPath();

    // Highlight
    g.fillStyle(0x6a5a4a, 0.7);
    g.beginPath();
    g.moveTo(x - 12, y - 5);
    g.lineTo(x - 5, y - 12);
    g.lineTo(x + 5, y - 10);
    g.lineTo(x, y - 2);
    g.closePath();
    g.fillPath();

    // Small rock
    g.fillStyle(0x3a2a1a, 0.85);
    g.beginPath();
    g.moveTo(x + 15, y + 10);
    g.lineTo(x + 20, y);
    g.lineTo(x + 30, y - 3);
    g.lineTo(x + 35, y + 5);
    g.lineTo(x + 32, y + 10);
    g.closePath();
    g.fillPath();

    // Pebbles
    g.fillStyle(0x5a4a3a, 0.8);
    g.fillCircle(x - 25, y + 8, 4);
    g.fillCircle(x + 40, y + 7, 3);
    g.fillStyle(0x4a3a2a, 0.7);
    g.fillCircle(x - 28, y + 5, 2);
  }

  destroy(): void {
    this.decorations?.destroy();
    this.decorations = null;
  }
}
