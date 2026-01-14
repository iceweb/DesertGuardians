import Phaser from 'phaser';

export function drawRapidFireTower(g: Phaser.GameObjects.Graphics, level: number): void {

  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 25, 52, 18);

  const baseWidth = 30;
  const towerHeight = 37;

  if (level === 1) {

    g.fillStyle(0x8b7355, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 20);

    g.lineStyle(1, 0x6b5344, 0.4);
    for (let y = 8; y < 22; y += 6) {
      g.lineBetween(-baseWidth + 2, y, baseWidth - 2, y);
    }

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-18, -towerHeight, 36, towerHeight + 5);
    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(-14, -towerHeight + 5, 28, towerHeight - 3);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-4, -towerHeight - 15, 8, 18);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -towerHeight - 15, 4);

    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight + 8, 6);
  } else if (level === 2) {

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-baseWidth + 3, 6, (baseWidth - 3) * 2, 18);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-baseWidth - 5, 5, 8, 20);
    g.fillRect(baseWidth - 3, 5, 8, 20);

    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(-22, 14, 3);
    g.fillCircle(22, 14, 3);
    g.fillCircle(-12, 14, 2);
    g.fillCircle(12, 14, 2);

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-24, -towerHeight, 48, towerHeight + 5);
    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(-20, -towerHeight + 5, 40, towerHeight - 3);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-12, -towerHeight - 18, 8, 22);
    g.fillRect(4, -towerHeight - 18, 8, 22);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(-8, -towerHeight - 18, 4);
    g.fillCircle(8, -towerHeight - 18, 4);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(14, -towerHeight, 8, 30);
    g.fillStyle(0xffcc00, 0.6);
    g.fillCircle(18, -towerHeight + 10, 4);

    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(0, -towerHeight + 10, 8);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-6, -towerHeight + 15, 12, 10);
  } else {

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(-baseWidth + 4, 4, (baseWidth - 4) * 2, 20);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-baseWidth - 8, 2, 12, 24);
    g.fillRect(baseWidth - 4, 2, 12, 24);

    g.fillStyle(0x2a2a2a, 1);
    for (let x = -28; x <= 28; x += 14) {
      g.fillCircle(x, 12, 3);
    }

    g.fillStyle(0xffcc00, 1);
    g.fillRect(-baseWidth - 6, -2, 10, 6);
    g.fillRect(baseWidth - 4, -2, 10, 6);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(-baseWidth - 3, -2, 3, 6);
    g.fillRect(baseWidth, -2, 3, 6);

    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(-30, -towerHeight, 60, towerHeight + 2);
    g.fillStyle(0x7a7a7a, 1);
    g.fillRect(-26, -towerHeight + 5, 52, towerHeight - 8);

    g.fillStyle(0x5a5a5a, 0.9);
    g.fillRect(-36, -towerHeight + 15, 10, 40);
    g.fillRect(26, -towerHeight + 15, 10, 40);

    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight - 15, 18);
    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(0, -towerHeight - 15, 14);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bx = Math.cos(angle) * 10;
      const by = Math.sin(angle) * 10 - towerHeight - 15;
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(bx, by, 4);
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(bx, by, 2);
    }

    g.fillStyle(0xff4400, 0.6);
    g.fillCircle(0, -towerHeight - 15, 5);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-28, -towerHeight - 5, 10, 35);
    g.fillRect(18, -towerHeight - 5, 10, 35);

    g.fillStyle(0xffcc00, 0.8);
    for (let y = -towerHeight; y < -towerHeight + 28; y += 6) {
      g.fillRect(-26, y, 6, 4);
      g.fillRect(20, y, 6, 4);
    }

    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-6, -towerHeight - 35, 12, 18);
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(0, -towerHeight - 28, 4);
    g.lineStyle(1, 0xff0000, 0.5);
    g.strokeCircle(0, -towerHeight - 28, 8);

    g.lineStyle(2, 0x4a4a4a, 1);
    g.lineBetween(20, -towerHeight - 10, 20, -towerHeight - 35);
    g.lineBetween(-20, -towerHeight - 10, -20, -towerHeight - 30);
    g.fillStyle(0x00ff00, 1);
    g.fillCircle(20, -towerHeight - 37, 4);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(-20, -towerHeight - 32, 3);

    g.fillStyle(0x5a5a5a, 1);
    g.fillCircle(0, -towerHeight + 12, 12);
    g.fillStyle(0x87ceeb, 0.5);
    g.fillCircle(0, -towerHeight + 10, 8);
  }

  g.fillStyle(0x2a2a2a, 1);
  g.fillRect(-8, -40, 4, 12);
  g.fillRect(4, -40, 4, 12);
  if (level >= 2) {
    g.fillRect(-8, -58, 4, 10);
    g.fillRect(4, -58, 4, 10);
  }
}
