import Phaser from 'phaser';

export function drawRangeCircle(g: Phaser.GameObjects.Graphics, range: number): void {
  g.clear();
  g.lineStyle(4, 0xffffff, 0.4);
  g.strokeCircle(0, 0, range);
  g.fillStyle(0xffffff, 0.1);
  g.fillCircle(0, 0, range);
}

export function drawStar(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.5;
    points.push(x + Math.cos(angle) * r);
    points.push(y + Math.sin(angle) * r);
  }
  g.fillPoints(points, true);
}

export function drawLevelIndicator(g: Phaser.GameObjects.Graphics, level: number): void {
  if (level === 2) {
    g.fillStyle(0xc0c0c0, 1);
    drawStar(g, -8, -98, 5);
    drawStar(g, 8, -98, 5);
  } else if (level === 3) {
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(0, -100, 15);
    g.fillStyle(0xffd700, 1);
    drawStar(g, -12, -98, 5);
    drawStar(g, 0, -102, 6);
    drawStar(g, 12, -98, 5);
  } else if (level === 4) {
    g.fillStyle(0xffd700, 0.5);
    g.fillCircle(0, -102, 22);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(0, -102, 18);
    g.fillStyle(0xffd700, 1);
    drawStar(g, -15, -96, 5);
    drawStar(g, -5, -104, 6);
    drawStar(g, 5, -104, 6);
    drawStar(g, 15, -96, 5);

    g.fillStyle(0xff4444, 1);
    g.beginPath();
    g.moveTo(0, -114);
    g.lineTo(4, -108);
    g.lineTo(0, -102);
    g.lineTo(-4, -108);
    g.closePath();
    g.fillPath();
  }
}
