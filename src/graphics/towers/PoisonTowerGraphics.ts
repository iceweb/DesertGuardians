import Phaser from 'phaser';

export function drawPoisonTower(g: Phaser.GameObjects.Graphics, level: number): void {
  if (level === 1) {
    g.fillStyle(0x00ff00, 0.05);
    g.fillCircle(0, -25, 40);
  } else if (level === 2) {
    g.fillStyle(0x00ff00, 0.06);
    g.fillCircle(0, -30, 55);
    g.fillStyle(0x88ff00, 0.04);
    g.fillCircle(0, -30, 70);
  } else {
    g.fillStyle(0x00ff00, 0.08);
    g.fillCircle(0, -35, 70);
    g.fillStyle(0x88ff00, 0.05);
    g.fillCircle(0, -35, 90);
    g.fillStyle(0xaaff00, 0.03);
    g.fillCircle(0, -35, 110);
  }

  g.fillStyle(0x2a3a2a, 0.3);
  g.fillEllipse(0, 25, 50, 18);

  const baseWidth = 30;
  const towerHeight = 40;

  if (level === 1) {
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
    g.fillStyle(0x3a2a1a, 1);

    g.beginPath();
    g.moveTo(-22, 25);
    g.lineTo(-18, 8);
    g.lineTo(-12, 10);
    g.lineTo(-15, 25);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(22, 25);
    g.lineTo(18, 8);
    g.lineTo(12, 10);
    g.lineTo(15, 25);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-18, 8);
    g.lineTo(-14, -towerHeight);
    g.lineTo(14, -towerHeight);
    g.lineTo(18, 8);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x2a2a2a, 1);
    g.fillEllipse(0, -towerHeight - 3, 18, 8);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-14, -towerHeight - 6, 28, 6);

    g.fillStyle(0x00ff00, 0.9);
    g.fillEllipse(0, -towerHeight - 5, 12, 4);

    g.fillStyle(0x88ff88, 0.7);
    g.fillCircle(-4, -towerHeight - 8, 2);
    g.fillCircle(3, -towerHeight - 10, 1.5);
  } else if (level === 2) {
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22);
    g.fillStyle(0x3a2a1a, 1);

    g.beginPath();
    g.moveTo(-28, 27);
    g.lineTo(-22, 5);
    g.lineTo(-14, 8);
    g.lineTo(-18, 27);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(28, 27);
    g.lineTo(22, 5);
    g.lineTo(14, 8);
    g.lineTo(18, 27);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-10, 27);
    g.lineTo(-8, 12);
    g.lineTo(-2, 12);
    g.lineTo(-4, 27);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-22, 8);
    g.lineTo(-16, -towerHeight);
    g.lineTo(-10, -towerHeight - 2);
    g.lineTo(10, -towerHeight - 2);
    g.lineTo(16, -towerHeight);
    g.lineTo(22, 8);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x2a1a0a, 0.5);
    g.beginPath();
    g.moveTo(-16, 0);
    g.lineTo(-12, -towerHeight + 5);
    g.strokePath();
    g.beginPath();
    g.moveTo(16, 0);
    g.lineTo(12, -towerHeight + 5);
    g.strokePath();

    g.fillStyle(0x2a2a2a, 1);
    g.fillEllipse(0, -towerHeight - 4, 24, 10);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-20, -towerHeight - 9, 40, 8);

    g.fillStyle(0x00ff22, 0.9);
    g.fillEllipse(0, -towerHeight - 7, 18, 6);
    g.fillStyle(0x66ff66, 0.7);
    g.fillCircle(-6, -towerHeight - 10, 3);
    g.fillCircle(5, -towerHeight - 9, 2.5);
    g.fillCircle(-2, -towerHeight - 12, 2);

    g.fillStyle(0x88ff88, 0.6);
    g.fillCircle(-4, -towerHeight - 18, 3);
    g.fillCircle(4, -towerHeight - 22, 2.5);
    g.fillCircle(-6, -towerHeight - 28, 2);

    g.lineStyle(3, 0x2a4a2a, 1);
    g.beginPath();
    g.moveTo(-24, 15);
    g.lineTo(-28, -15);
    g.lineTo(-25, -30);
    g.strokePath();
    g.beginPath();
    g.moveTo(24, 15);
    g.lineTo(28, -10);
    g.lineTo(25, -25);
    g.strokePath();
  } else {
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-baseWidth, 3, baseWidth * 2, 26);
    g.fillStyle(0x3a2a1a, 1);

    g.beginPath();
    g.moveTo(-38, 29);
    g.lineTo(-30, 3);
    g.lineTo(-20, 6);
    g.lineTo(-26, 29);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(38, 29);
    g.lineTo(30, 3);
    g.lineTo(20, 6);
    g.lineTo(26, 29);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-18, 29);
    g.lineTo(-14, 10);
    g.lineTo(-6, 10);
    g.lineTo(-10, 29);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(18, 29);
    g.lineTo(14, 10);
    g.lineTo(6, 10);
    g.lineTo(10, 29);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x2a4a1a, 0.5);
    g.fillCircle(-25, 24, 10);
    g.fillCircle(25, 24, 10);
    g.fillCircle(0, 26, 12);

    g.fillStyle(0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-28, 8);
    g.lineTo(-20, -towerHeight);
    g.lineTo(-12, -towerHeight - 3);
    g.lineTo(12, -towerHeight - 3);
    g.lineTo(20, -towerHeight);
    g.lineTo(28, 8);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x2a1a0a, 0.6);
    g.beginPath();
    g.moveTo(-22, 0);
    g.lineTo(-16, -towerHeight + 8);
    g.strokePath();
    g.beginPath();
    g.moveTo(22, 0);
    g.lineTo(16, -towerHeight + 8);
    g.strokePath();
    g.beginPath();
    g.moveTo(0, 5);
    g.lineTo(0, -towerHeight + 5);
    g.strokePath();

    g.lineStyle(2, 0x00ff00, 0.4);
    g.lineBetween(-18, -20, -22, -15);
    g.lineBetween(16, -30, 20, -25);
    g.lineBetween(-14, -50, -18, -45);

    g.fillStyle(0x2a2a2a, 1);
    g.fillEllipse(0, -towerHeight - 5, 32, 14);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-28, -towerHeight - 12, 56, 10);

    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-30, -towerHeight - 14, 60, 4);

    g.fillStyle(0x00ff44, 0.95);
    g.fillEllipse(0, -towerHeight - 10, 26, 8);

    g.fillStyle(0x00ff00, 0.7);
    g.fillEllipse(-20, -towerHeight, 4, 12);
    g.fillEllipse(22, -towerHeight + 2, 5, 14);
    g.fillEllipse(-12, -towerHeight + 5, 3, 10);
    g.fillEllipse(14, -towerHeight + 8, 4, 12);

    g.fillStyle(0x00ff00, 0.3);
    g.fillEllipse(-28, 20, 12, 5);
    g.fillEllipse(26, 18, 10, 4);

    g.fillStyle(0x88ff88, 0.8);
    g.fillCircle(-8, -towerHeight - 14, 4);
    g.fillCircle(6, -towerHeight - 13, 3.5);
    g.fillCircle(-3, -towerHeight - 16, 3);
    g.fillCircle(10, -towerHeight - 15, 2.5);
    g.fillCircle(-12, -towerHeight - 12, 2);

    g.fillStyle(0x88ff88, 0.5);
    g.fillCircle(-5, -towerHeight - 25, 5);
    g.fillCircle(6, -towerHeight - 32, 4);
    g.fillCircle(-8, -towerHeight - 40, 4.5);
    g.fillCircle(3, -towerHeight - 48, 4);
    g.fillCircle(-4, -towerHeight - 55, 3.5);
    g.fillCircle(5, -towerHeight - 62, 3);

    g.lineStyle(4, 0x2a5a2a, 1);
    g.beginPath();
    g.moveTo(-32, 18);
    g.lineTo(-40, -25);
    g.lineTo(-35, -50);
    g.strokePath();
    g.beginPath();
    g.moveTo(32, 18);
    g.lineTo(40, -20);
    g.lineTo(35, -45);
    g.strokePath();

    g.lineStyle(2, 0x3a6a3a, 0.8);
    g.beginPath();
    g.moveTo(-26, 20);
    g.lineTo(-45, -10);
    g.strokePath();
    g.beginPath();
    g.moveTo(26, 20);
    g.lineTo(45, -5);
    g.strokePath();

    g.fillStyle(0xccccaa, 1);
    g.fillCircle(0, -25, 8);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(-3, -27, 2);
    g.fillCircle(3, -27, 2);
    g.fillRect(-2, -23, 4, 3);
  }
}
