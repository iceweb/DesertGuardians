import Phaser from 'phaser';

export function drawAuraTower(g: Phaser.GameObjects.Graphics, level: number): void {

  const scale = 0.5;

  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 25 * scale, 50 * scale, 18 * scale);

  const baseWidth = 28 * scale;

  if (level === 1) {

    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth, 8 * scale, baseWidth * 2, 20 * scale);
    g.fillStyle(0x5a4a4a, 1);
    g.fillRect(-baseWidth + 3 * scale, 10 * scale, (baseWidth - 3 * scale) * 2, 16 * scale);
  } else if (level === 2) {

    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth - 4 * scale, 6 * scale, (baseWidth + 4 * scale) * 2, 24 * scale);
    g.fillStyle(0x5a4a4a, 1);
    g.fillRect(-baseWidth, 8 * scale, baseWidth * 2, 20 * scale);

    g.lineStyle(2, 0xcc3333, 0.8);
    g.lineBetween(-baseWidth - 4 * scale, 6 * scale, baseWidth + 4 * scale, 6 * scale);
    g.lineBetween(-baseWidth - 4 * scale, 30 * scale, baseWidth + 4 * scale, 30 * scale);
  } else {

    g.fillStyle(0x3a2a2a, 1);
    g.fillRect(-baseWidth - 6 * scale, 4 * scale, (baseWidth + 6 * scale) * 2, 28 * scale);
    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth - 2 * scale, 6 * scale, (baseWidth + 2 * scale) * 2, 24 * scale);

    g.fillStyle(0xffd700, 0.7);
    g.fillRect(-baseWidth - 8 * scale, 2 * scale, 8 * scale, 32 * scale);
    g.fillRect(baseWidth, 2 * scale, 8 * scale, 32 * scale);

    g.lineStyle(3, 0xff4444, 0.9);
    g.lineBetween(-baseWidth - 2 * scale, 4 * scale, baseWidth + 2 * scale, 4 * scale);
  }

  const pillarHeight = (35 + level * 8) * scale;
  const pillarWidth = (14 + level * 2) * scale;

  g.fillStyle(0x3a2a2a, 1);
  g.beginPath();
  g.moveTo(-pillarWidth, 10 * scale);
  g.lineTo(-pillarWidth + 4 * scale, -pillarHeight);
  g.lineTo(pillarWidth - 4 * scale, -pillarHeight);
  g.lineTo(pillarWidth, 10 * scale);
  g.closePath();
  g.fillPath();

  g.fillStyle(0x4a3a3a, 1);
  g.beginPath();
  g.moveTo(-pillarWidth + 4 * scale, 8 * scale);
  g.lineTo(-pillarWidth + 6 * scale, -pillarHeight + 2 * scale);
  g.lineTo(0, -pillarHeight + 2 * scale);
  g.lineTo(0, 8 * scale);
  g.closePath();
  g.fillPath();

  g.lineStyle(2, 0xcc3333, 0.6 + level * 0.1);
  for (let i = 0; i < level; i++) {
    const runeY = (-10 - i * 18) * scale;
    g.lineBetween(-pillarWidth + 6 * scale, runeY, pillarWidth - 6 * scale, runeY);
    g.lineBetween(-pillarWidth + 8 * scale, runeY - 6 * scale, pillarWidth - 8 * scale, runeY - 6 * scale);
  }

  const platY = -pillarHeight - 5 * scale;
  g.fillStyle(0x5a4a4a, 1);
  g.fillEllipse(0, platY, (24 + level * 3) * scale, 10 * scale);
  g.fillStyle(0x4a3a3a, 1);
  g.fillEllipse(0, platY - 2 * scale, (20 + level * 2) * scale, 8 * scale);

  if (level >= 2) {
    g.fillStyle(0x3a2a2a, 1);

    g.beginPath();
    g.moveTo((-18 - level * 2) * scale, platY);
    g.lineTo((-14 - level) * scale, platY - (15 + level * 3) * scale);
    g.lineTo((-10 - level) * scale, platY);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo((18 + level * 2) * scale, platY);
    g.lineTo((14 + level) * scale, platY - (15 + level * 3) * scale);
    g.lineTo((10 + level) * scale, platY);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff4444, 0.4);
    g.fillCircle((-14 - level) * scale, platY - (12 + level * 2) * scale, 4 * scale);
    g.fillCircle((14 + level) * scale, platY - (12 + level * 2) * scale, 4 * scale);
  }

  const orbY = platY - (12 + level * 3) * scale;
  const orbSize = (10 + level * 3) * scale;

  g.fillStyle(0x2a1a1a, 1);
  g.fillCircle(0, orbY, orbSize);

  g.fillStyle(0x441111, 0.8);
  g.fillCircle(0, orbY, orbSize - 3 * scale);

  if (level === 3) {

    g.lineStyle(2, 0xffd700, 0.6);
    g.strokeCircle(0, orbY, orbSize + 8 * scale);

    g.fillStyle(0xffd700, 0.8);
    g.beginPath();
    g.moveTo(-8 * scale, orbY - orbSize - 2 * scale);
    g.lineTo(-4 * scale, orbY - orbSize - 12 * scale);
    g.lineTo(0, orbY - orbSize - 6 * scale);
    g.lineTo(4 * scale, orbY - orbSize - 12 * scale);
    g.lineTo(8 * scale, orbY - orbSize - 2 * scale);
    g.closePath();
    g.fillPath();
  }
}

export function drawAuraRangeCircle(
  g: Phaser.GameObjects.Graphics,
  range: number
): void {
  g.clear();
  g.lineStyle(4, 0xff4444, 0.5);
  g.strokeCircle(0, 0, range);
  g.fillStyle(0xff4444, 0.1);
  g.fillCircle(0, 0, range);
}
