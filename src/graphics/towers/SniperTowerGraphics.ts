import Phaser from 'phaser';

export function drawSniperTower(g: Phaser.GameObjects.Graphics, level: number): void {
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 25, 42, 16);

  const baseWidth = 24;
  const towerHeight = 55;

  if (level === 1) {
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 18);
    g.fillStyle(0x5a4a3a, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 12);

    g.fillStyle(0x7a6a5a, 1);
    g.beginPath();
    g.moveTo(-12, 8);
    g.lineTo(-8, -towerHeight);
    g.lineTo(8, -towerHeight);
    g.lineTo(12, 8);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-14, -towerHeight - 3, 28, 6);

    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -towerHeight - 8, 5);
    g.fillRect(-3, -towerHeight - 5, 6, 8);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(5, -towerHeight - 10, 18, 3);
  } else if (level === 2) {
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 14);

    g.fillStyle(0x6a6a6a, 1);
    g.beginPath();
    g.moveTo(-14, 8);
    g.lineTo(-10, -towerHeight);
    g.lineTo(10, -towerHeight);
    g.lineTo(14, 8);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x4a4a4a, 0.6);
    g.lineBetween(-12, 0, 8, -towerHeight + 20);
    g.lineBetween(12, 0, -8, -towerHeight + 20);
    g.lineBetween(-11, -35, 11, -35);

    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-18, -towerHeight - 5, 36, 8);
    g.lineStyle(1, 0x3a3a3a, 1);
    g.strokeRect(-18, -towerHeight - 5, 36, 8);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-4, -towerHeight - 22, 8, 18);
    g.fillStyle(0x4a4a8a, 1);
    g.fillCircle(0, -towerHeight - 18, 8);
    g.fillStyle(0x6a6aaa, 1);
    g.fillCircle(0, -towerHeight - 18, 5);

    g.lineStyle(1, 0xff0000, 0.8);
    g.lineBetween(-6, -towerHeight - 18, 6, -towerHeight - 18);
    g.lineBetween(0, -towerHeight - 24, 0, -towerHeight - 12);

    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(-2, -towerHeight - 2, 6);
    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(-2, -towerHeight - 4, 5);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(4, -towerHeight - 8, 28, 4);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(32, -towerHeight - 6, 2);

    g.fillStyle(0x4a4a6a, 1);
    g.fillRect(12, -towerHeight - 12, 10, 4);
  } else {
    g.fillStyle(0x4a5a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22);
    g.fillStyle(0x3a4a3a, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 16);

    g.fillStyle(0x5a6a5a, 0.5);
    g.fillCircle(-12, 14, 8);
    g.fillCircle(8, 16, 6);
    g.fillCircle(-5, 18, 5);

    g.fillStyle(0x5a6a5a, 1);
    g.beginPath();
    g.moveTo(-16, 8);
    g.lineTo(-12, -towerHeight);
    g.lineTo(12, -towerHeight);
    g.lineTo(16, 8);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x4a5a4a, 0.8);
    g.beginPath();
    g.moveTo(-14, 0);
    g.lineTo(-10, -towerHeight + 10);
    g.lineTo(-6, -towerHeight + 10);
    g.lineTo(-8, 0);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(14, 0);
    g.lineTo(10, -towerHeight + 10);
    g.lineTo(6, -towerHeight + 10);
    g.lineTo(8, 0);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x4a5a4a, 1);
    g.fillRect(-22, -towerHeight - 8, 44, 12);
    g.fillStyle(0x3a4a3a, 1);
    g.fillRect(-20, -towerHeight - 6, 40, 8);

    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -towerHeight - 35, 16, 28);
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight - 28, 12);

    g.fillStyle(0x8888cc, 1);
    g.fillCircle(0, -towerHeight - 28, 9);
    g.fillStyle(0xaaaaff, 0.8);
    g.fillCircle(0, -towerHeight - 28, 6);

    g.lineStyle(2, 0xff0000, 1);
    g.lineBetween(-10, -towerHeight - 28, 10, -towerHeight - 28);
    g.lineBetween(0, -towerHeight - 38, 0, -towerHeight - 18);
    g.lineStyle(1, 0xff0000, 0.6);
    g.strokeCircle(0, -towerHeight - 28, 12);
    g.strokeCircle(0, -towerHeight - 28, 16);

    g.lineStyle(2, 0xff0000, 0.4);
    g.lineBetween(0, -towerHeight - 40, 50, -towerHeight + 20);
    g.lineStyle(1, 0xff0000, 0.2);
    g.lineBetween(1, -towerHeight - 40, 52, -towerHeight + 20);
    g.lineBetween(-1, -towerHeight - 40, 48, -towerHeight + 20);

    g.fillStyle(0x4a5a3a, 1);
    g.fillCircle(-4, -towerHeight - 2, 7);

    g.lineStyle(1, 0x5a6a4a, 1);
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI;
      g.lineBetween(
        -4,
        -towerHeight - 2,
        -4 + Math.cos(angle) * 12,
        -towerHeight - 2 + Math.sin(angle) * 12
      );
    }

    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(4, -towerHeight - 10, 40, 5);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(4, -towerHeight - 12, 8, 4);
    g.fillRect(38, -towerHeight - 14, 10, 6);

    g.fillStyle(0x4a4a6a, 1);
    g.fillRect(16, -towerHeight - 18, 16, 8);
    g.fillStyle(0x6a6aaa, 1);
    g.fillCircle(24, -towerHeight - 14, 5);

    g.fillStyle(0x4a4a4a, 1);
    g.beginPath();
    g.moveTo(22, -towerHeight);
    g.lineTo(32, -towerHeight - 15);
    g.lineTo(26, -towerHeight - 15);
    g.lineTo(22, -towerHeight - 3);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x00ff00, 1);
    g.fillCircle(-18, -towerHeight, 3);
    g.fillStyle(0x00ff00, 0.5);
    g.fillCircle(-18, -towerHeight, 6);
  }
}
