import Phaser from 'phaser';

export function drawArcherTower(g: Phaser.GameObjects.Graphics, level: number): void {
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 25, 50, 18);

  const baseWidth = level === 4 ? 36 : 32;
  const towerHeight = level === 4 ? 50 : 42;

  if (level === 1) {
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
    g.fillStyle(0x9a6a3b, 1);
    g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);

    g.lineStyle(1, 0x6b4020, 0.4);
    for (let i = -baseWidth + 6; i < baseWidth - 6; i += 8) {
      g.lineBetween(i, 10, i, 24);
    }
  } else if (level === 2) {
    g.fillStyle(0x8b7355, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 22);
    g.fillStyle(0x9a8265, 1);
    g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 18);

    g.lineStyle(1, 0x6b5344, 0.5);
    g.lineBetween(-baseWidth + 4, 17, baseWidth - 4, 17);
    g.lineBetween(-10, 10, -10, 28);
    g.lineBetween(10, 10, 10, 28);
  } else {
    g.fillStyle(level === 4 ? 0xb8a385 : 0xa89375, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 26);
    g.fillStyle(level === 4 ? 0xd8c8a5 : 0xc8b395, 1);
    g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 22);

    g.lineStyle(level === 4 ? 3 : 2, 0xffd700, level === 4 ? 1 : 0.8);
    g.lineBetween(-baseWidth, 8, baseWidth, 8);
    g.lineBetween(-baseWidth, 34, baseWidth, 34);

    g.fillStyle(0xffd700, level === 4 ? 0.9 : 0.6);
    g.fillRect(-baseWidth - 3, 5, 6, 32);
    g.fillRect(baseWidth - 3, 5, 6, 32);

    if (level === 4) {
      g.fillStyle(0xffd700, 0.7);
      g.fillRect(-baseWidth - 6, 2, 12, 36);
      g.fillRect(baseWidth - 6, 2, 12, 36);
    }
  }

  if (level === 1) {
    g.fillStyle(0xb88a5c, 1);
    g.beginPath();
    g.moveTo(-22, 10);
    g.lineTo(-18, -towerHeight);
    g.lineTo(18, -towerHeight);
    g.lineTo(22, 10);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x8b6a3c, 0.5);
    g.lineBetween(-20, -15, 20, -15);
    g.lineBetween(-19, -35, 19, -35);
  } else if (level === 2) {
    g.fillStyle(0xd4a574, 1);
    g.beginPath();
    g.moveTo(-26, 10);
    g.lineTo(-22, -towerHeight);
    g.lineTo(22, -towerHeight);
    g.lineTo(26, 10);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x9a8265, 1);
    g.fillRect(-28, -towerHeight, 8, towerHeight + 10);
    g.fillRect(20, -towerHeight, 8, towerHeight + 10);

    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -35, 16, 22);
    g.fillStyle(0xe8c896, 1);
    g.fillRect(-10, -38, 20, 4);
  } else {
    g.fillStyle(level === 4 ? 0xf4c594 : 0xe4b584, 1);
    g.beginPath();
    g.moveTo(-32, 10);
    g.lineTo(-28, -towerHeight);
    g.lineTo(28, -towerHeight);
    g.lineTo(32, 10);
    g.closePath();
    g.fillPath();

    g.fillStyle(level === 4 ? 0xffe8b6 : 0xf8d8a6, 1);
    g.beginPath();
    g.moveTo(-24, 5);
    g.lineTo(-20, -towerHeight + 5);
    g.lineTo(20, -towerHeight + 5);
    g.lineTo(24, 5);
    g.closePath();
    g.fillPath();

    g.fillStyle(level === 4 ? 0xd9b07c : 0xc9a06c, 1);
    g.beginPath();
    g.moveTo(-40, 25);
    g.lineTo(-32, -30);
    g.lineTo(-28, -30);
    g.lineTo(-32, 25);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(40, 25);
    g.lineTo(32, -30);
    g.lineTo(28, -30);
    g.lineTo(32, 25);
    g.closePath();
    g.fillPath();

    g.lineStyle(level === 4 ? 3 : 2, 0xffd700, level === 4 ? 1 : 0.9);
    g.strokeRect(-10, -38, 20, 28);
    g.strokeRect(-10, -75, 20, 28);

    if (level === 4) {
      g.lineStyle(2, 0xffd700, 0.8);
      g.lineBetween(-24, -20, 24, -20);
      g.lineBetween(-22, -55, 22, -55);
    }
  }

  g.fillStyle(0x2a1a0a, 1);
  g.fillRect(-8, -30, 16, 22);
  g.fillStyle(0x1a0a00, 1);
  g.fillRect(-5, -28, 10, 18);

  if (level >= 2) {
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -60, 16, 18);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -58, 10, 14);
  }

  const battY = -towerHeight - 10;
  if (level === 1) {
    g.fillStyle(0xa98a5c, 1);
    g.fillRect(-20, battY, 10, 10);
    g.fillRect(-5, battY, 10, 10);
    g.fillRect(10, battY, 10, 10);
  } else if (level === 2) {
    g.fillStyle(0xc9a06c, 1);
    g.fillRect(-26, battY, 12, 14);
    g.fillRect(-8, battY, 16, 14);
    g.fillRect(14, battY, 12, 14);

    g.fillStyle(0xb99060, 1);
    g.fillCircle(-26, battY + 7, 10);
    g.fillCircle(26, battY + 7, 10);
  } else {
    g.fillStyle(level === 4 ? 0xe9c08c : 0xd9b07c, 1);
    g.fillRect(-32, battY, 14, 16);
    g.fillRect(-12, battY, 24, 16);
    g.fillRect(18, battY, 14, 16);

    g.fillStyle(0xffd700, level === 4 ? 1 : 0.8);
    g.fillRect(-32, battY - 3, 14, 4);
    g.fillRect(-12, battY - 3, 24, 4);
    g.fillRect(18, battY - 3, 14, 4);

    g.fillStyle(level === 4 ? 0xd9b07c : 0xc9a06c, 1);
    g.fillCircle(-35, battY + 8, 12);
    g.fillCircle(35, battY + 8, 12);

    g.fillStyle(0xffd700, 1);
    g.beginPath();
    g.moveTo(-35, battY - 5);
    g.lineTo(-32, battY - 20);
    g.lineTo(-38, battY - 5);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(35, battY - 5);
    g.lineTo(32, battY - 20);
    g.lineTo(38, battY - 5);
    g.closePath();
    g.fillPath();

    if (level === 4) {
      g.fillStyle(0xffd700, 1);
      g.beginPath();
      g.moveTo(-35, battY - 18);
      g.lineTo(-35, battY - 35);
      g.lineTo(-32, battY - 18);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(35, battY - 18);
      g.lineTo(35, battY - 35);
      g.lineTo(32, battY - 18);
      g.closePath();
      g.fillPath();

      g.fillStyle(0xff4444, 1);
      g.fillCircle(-35, battY - 28, 3);
      g.fillCircle(35, battY - 28, 3);
    }
  }

  if (level === 1) {
    g.fillStyle(0x4a3020, 1);
    g.fillCircle(0, battY - 12, 7);
    g.fillStyle(0x8b4513, 1);
    g.fillRect(-4, battY - 8, 8, 10);

    g.lineStyle(2, 0x654321, 1);
    g.beginPath();
    g.arc(8, battY - 3, 14, -1.5, 1.5, false);
    g.strokePath();
  } else if (level === 2) {
    g.fillStyle(0x5a4030, 1);
    g.fillCircle(0, battY - 14, 9);
    g.fillStyle(0x6a6a6a, 1);
    g.fillCircle(0, battY - 16, 7);
    g.fillStyle(0x8b4513, 1);
    g.fillRect(-6, battY - 8, 12, 14);

    g.lineStyle(3, 0x754321, 1);
    g.beginPath();
    g.arc(12, battY - 5, 18, -1.5, 1.5, false);
    g.strokePath();
    g.lineStyle(1, 0xc0c0c0, 1);
    g.lineBetween(10, battY - 20, 10, battY + 10);
  } else {
    g.fillStyle(0x5a4030, 1);
    g.fillCircle(0, battY - 16, 10);
    g.fillStyle(0xffd700, 1);
    g.fillRect(-6, battY - 24, 12, 4);
    g.fillTriangle(-6, battY - 24, -8, battY - 28, -4, battY - 24);
    g.fillTriangle(0, battY - 24, 0, battY - 30, 0, battY - 24);
    g.fillTriangle(6, battY - 24, 8, battY - 28, 4, battY - 24);

    g.fillStyle(level === 4 ? 0xffd700 : 0xcc3333, 0.9);
    g.beginPath();
    g.moveTo(-8, battY - 10);
    g.lineTo(-15, battY + 15);
    g.lineTo(0, battY + 12);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, 0xffd700, 1);
    g.beginPath();
    g.arc(14, battY - 7, 22, -1.5, 1.5, false);
    g.strokePath();
    g.lineStyle(1, 0xffffff, 1);
    g.lineBetween(14, battY - 28, 14, battY + 14);

    g.fillStyle(0x3a2010, 0.6);
    g.fillCircle(-20, battY - 10, 6);
    g.fillCircle(20, battY - 10, 6);

    if (level === 4) {
      g.fillStyle(0xffd700, 0.2);
      g.fillCircle(0, battY - 12, 25);
      g.fillStyle(0xffd700, 0.1);
      g.fillCircle(0, battY - 12, 35);

      g.fillStyle(0x3a2010, 0.5);
      g.fillCircle(0, battY - 8, 5);
    }
  }

  if (level === 1) {
    g.fillStyle(0xcc3333, 1);
    g.fillTriangle(-22, -towerHeight + 5, -30, -towerHeight + 12, -22, -towerHeight + 20);
  } else if (level === 2) {
    g.fillStyle(0x3366cc, 1);
    g.fillTriangle(-28, -towerHeight + 5, -40, -towerHeight + 18, -28, -towerHeight + 30);
    g.fillStyle(0xcc3333, 1);
    g.fillTriangle(28, -towerHeight + 5, 40, -towerHeight + 18, 28, -towerHeight + 30);

    g.fillStyle(0xffffff, 1);
    g.fillCircle(-32, -towerHeight + 17, 4);
  } else {
    g.fillStyle(0xffd700, 1);
    g.fillRect(-38, -towerHeight - 25, 4, 50);
    g.fillRect(34, -towerHeight - 25, 4, 50);
    g.fillStyle(level === 4 ? 0xffd700 : 0x990000, 1);
    g.beginPath();
    g.moveTo(-34, -towerHeight - 20);
    g.lineTo(-50, -towerHeight);
    g.lineTo(-34, -towerHeight + 15);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(38, -towerHeight - 20);
    g.lineTo(54, -towerHeight);
    g.lineTo(38, -towerHeight + 15);
    g.closePath();
    g.fillPath();

    g.fillStyle(level === 4 ? 0xff4444 : 0xffd700, 1);
    g.fillCircle(-42, -towerHeight, 6);
    g.fillCircle(46, -towerHeight, 6);

    g.fillStyle(0xffd700, 1);
    g.fillRect(-12, battY - 35, 24, 8);
    g.fillTriangle(-12, battY - 35, -8, battY - 45, -4, battY - 35);
    g.fillTriangle(0, battY - 35, 0, battY - 48, 0, battY - 35);
    g.fillTriangle(12, battY - 35, 8, battY - 45, 4, battY - 35);

    if (level === 4) {
      g.fillStyle(0xffd700, 1);
      g.fillRect(-14, battY - 38, 28, 12);
      g.fillTriangle(-14, battY - 38, -10, battY - 55, -6, battY - 38);
      g.fillTriangle(0, battY - 38, 0, battY - 60, 0, battY - 38);
      g.fillTriangle(14, battY - 38, 10, battY - 55, 6, battY - 38);

      g.fillStyle(0xff4444, 1);
      g.fillCircle(-10, battY - 48, 3);
      g.fillCircle(0, battY - 52, 4);
      g.fillCircle(10, battY - 48, 3);

      g.fillStyle(0xffd700, 0.3);
      g.fillCircle(0, battY - 45, 20);
    }
  }
}
