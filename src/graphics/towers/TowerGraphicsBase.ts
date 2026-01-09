import Phaser from 'phaser';

/**
 * Shared utilities for tower graphics rendering.
 */

/**
 * Draw range indicator circle
 */
export function drawRangeCircle(
  g: Phaser.GameObjects.Graphics,
  range: number
): void {
  g.clear();
  g.lineStyle(4, 0xffffff, 0.4);
  g.strokeCircle(0, 0, range);
  g.fillStyle(0xffffff, 0.1);
  g.fillCircle(0, 0, range);
}

/**
 * Draw a star shape
 */
export function drawStar(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number
): void {
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.5;
    points.push(x + Math.cos(angle) * r);
    points.push(y + Math.sin(angle) * r);
  }
  g.fillPoints(points, true);
}

/**
 * Draw level indicator (stars based on level)
 */
export function drawLevelIndicator(
  g: Phaser.GameObjects.Graphics,
  level: number
): void {
  if (level === 2) {
    // Two silver stars
    g.fillStyle(0xc0c0c0, 1);
    drawStar(g, -8, -98, 5);
    drawStar(g, 8, -98, 5);
  } else if (level === 3) {
    // Three gold stars with glow
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(0, -100, 15);
    g.fillStyle(0xffd700, 1);
    drawStar(g, -12, -98, 5);
    drawStar(g, 0, -102, 6);
    drawStar(g, 12, -98, 5);
  }
}
