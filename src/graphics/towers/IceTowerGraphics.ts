import Phaser from 'phaser';

export function drawIceTower(g: Phaser.GameObjects.Graphics, level: number): void {
  if (level === 1) {
    g.fillStyle(0x87ceeb, 0.1);
    g.fillCircle(0, 0, 42);
  } else if (level === 2) {
    g.fillStyle(0x87ceeb, 0.12);
    g.fillCircle(0, 0, 55);
    g.fillStyle(0xaaddff, 0.08);
    g.fillCircle(0, 0, 70);
  } else {
    g.fillStyle(0x87ceeb, 0.15);
    g.fillCircle(0, 0, 70);
    g.fillStyle(0xaaddff, 0.1);
    g.fillCircle(0, 0, 90);
    g.fillStyle(0xccffff, 0.05);
    g.fillCircle(0, 0, 110);
  }

  g.fillStyle(0x4a6080, 0.3);
  g.fillEllipse(0, 4, 50 + level * 6, 20 + level * 2);

  if (level === 1) {
    g.fillStyle(0x88c8e8, 1);
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 - Math.PI / 8;
      const x = Math.cos(angle) * 28;
      const y = Math.sin(angle) * 24;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();

    g.fillStyle(0xa8e0f8, 1);
    g.fillCircle(0, 0, 22);

    g.lineStyle(1, 0xffffff, 0.4);
    g.lineBetween(-15, -8, 10, 5);
    g.lineBetween(-8, 10, 5, -12);
    g.lineBetween(8, -5, -5, 8);

    g.fillStyle(0x6090c0, 1);
    g.fillCircle(0, 0, 12);

    g.fillStyle(0x5080b0, 1);
    g.fillCircle(0, -4, 8);

    g.fillStyle(0x304060, 1);
    g.fillCircle(0, -2, 5);

    g.fillStyle(0x66ddff, 1);
    g.fillCircle(-2, -3, 1.5);
    g.fillCircle(2, -3, 1.5);

    g.fillStyle(0x99ccdd, 1);
    g.fillRect(-2, 6, 4, 18);

    g.fillStyle(0xaaeeff, 1);
    g.beginPath();
    g.moveTo(0, 24);
    g.lineTo(-4, 28);
    g.lineTo(0, 34);
    g.lineTo(4, 28);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xccffff, 1);
    g.fillCircle(0, 28, 3);

    g.fillStyle(0xb0e8ff, 0.8);
    g.beginPath();
    g.moveTo(-24, -10);
    g.lineTo(-22, -18);
    g.lineTo(-20, -10);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(22, -6);
    g.lineTo(25, -14);
    g.lineTo(28, -6);
    g.closePath();
    g.fillPath();
  } else if (level === 2) {
    g.fillStyle(0x70b8d8, 1);
    g.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const outerR = 36 + (i % 2) * 6;
      const x = Math.cos(angle) * outerR;
      const y = Math.sin(angle) * (outerR * 0.85);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();

    g.fillStyle(0x98d0f0, 1);
    g.fillCircle(0, 0, 28);

    g.fillStyle(0xb8e8ff, 1);
    g.fillCircle(0, 0, 22);

    g.lineStyle(1, 0xffffff, 0.5);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x1 = Math.cos(angle) * 8;
      const y1 = Math.sin(angle) * 8;
      const x2 = Math.cos(angle) * 20;
      const y2 = Math.sin(angle) * 20;
      g.lineBetween(x1, y1, x2, y2);
    }

    g.fillStyle(0xaae0ff, 0.9);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
      const x = Math.cos(angle) * 32;
      const y = Math.sin(angle) * 28;
      g.beginPath();
      g.moveTo(x - 4, y + 3);
      g.lineTo(x, y - 10);
      g.lineTo(x + 4, y + 3);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x5888b8, 1);
    g.fillCircle(0, 0, 14);

    g.fillStyle(0x4878a8, 1);
    g.fillCircle(0, -5, 10);

    g.fillStyle(0x284060, 1);
    g.fillCircle(0, -3, 6);

    g.fillStyle(0x44ddff, 1);
    g.fillCircle(-2.5, -4, 2);
    g.fillCircle(2.5, -4, 2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-2.5, -4, 0.8);
    g.fillCircle(2.5, -4, 0.8);

    g.fillStyle(0x6090c0, 1);
    g.fillCircle(-10, 2, 5);
    g.fillCircle(10, 2, 5);
    g.fillStyle(0x88ccee, 1);
    g.fillCircle(-10, 0, 3);
    g.fillCircle(10, 0, 3);

    g.fillStyle(0x88bbcc, 1);
    g.fillRect(-2.5, 8, 5, 22);

    g.fillStyle(0x99ddff, 1);
    g.beginPath();
    g.moveTo(0, 30);
    g.lineTo(-6, 36);
    g.lineTo(0, 46);
    g.lineTo(6, 36);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xccffff, 1);
    g.fillCircle(0, 36, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 35, 2);

    g.fillStyle(0xccffff, 0.8);
    g.fillCircle(-18, -18, 3);
    g.fillCircle(20, -15, 2.5);
    g.fillCircle(-22, 12, 2);
    g.fillCircle(18, 18, 2.5);
  } else {
    g.fillStyle(0x5898c8, 1);
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const outerR = 48 + (i % 2) * 8;
      const x = Math.cos(angle) * outerR;
      const y = Math.sin(angle) * (outerR * 0.85);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();

    g.fillStyle(0x78b8e0, 1);
    g.fillCircle(0, 0, 42);

    g.fillStyle(0x98d8f8, 1);
    g.fillCircle(0, 0, 36);

    g.lineStyle(2, 0xffffff, 0.5);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = Math.cos(angle) * 10;
      const y1 = Math.sin(angle) * 10;
      const x2 = Math.cos(angle) * 32;
      const y2 = Math.sin(angle) * 32;
      g.lineBetween(x1, y1, x2, y2);

      const midX = Math.cos(angle) * 22;
      const midY = Math.sin(angle) * 22;
      const perpAngle = angle + Math.PI / 2;
      g.lineBetween(midX, midY, midX + Math.cos(perpAngle) * 6, midY + Math.sin(perpAngle) * 6);
      g.lineBetween(midX, midY, midX - Math.cos(perpAngle) * 6, midY - Math.sin(perpAngle) * 6);
    }

    g.fillStyle(0x99ddff, 0.95);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x = Math.cos(angle) * 44;
      const y = Math.sin(angle) * 38;
      g.beginPath();
      g.moveTo(x - 5, y + 4);
      g.lineTo(x, y - 16);
      g.lineTo(x + 5, y + 4);
      g.closePath();
      g.fillPath();

      g.fillStyle(0xccffff, 0.7);
      g.fillCircle(x, y - 8, 3);
      g.fillStyle(0x99ddff, 0.95);
    }

    g.fillStyle(0x4070a0, 1);
    g.fillCircle(0, 0, 18);

    g.fillStyle(0x3868a0, 0.9);
    g.beginPath();
    g.moveTo(-12, 8);
    g.lineTo(-18, 22);
    g.lineTo(0, 16);
    g.lineTo(18, 22);
    g.lineTo(12, 8);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x3860a0, 1);
    g.fillCircle(0, -6, 12);

    g.fillStyle(0xaaeeff, 1);
    g.beginPath();
    g.moveTo(-8, -14);
    g.lineTo(-6, -20);
    g.lineTo(-3, -14);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-2, -16);
    g.lineTo(0, -24);
    g.lineTo(2, -16);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(3, -14);
    g.lineTo(6, -20);
    g.lineTo(8, -14);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x203850, 1);
    g.fillCircle(0, -4, 7);

    g.fillStyle(0x22ccff, 1);
    g.fillCircle(-3, -5, 2.5);
    g.fillCircle(3, -5, 2.5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-3, -5, 1);
    g.fillCircle(3, -5, 1);

    g.fillStyle(0x5088b8, 1);
    g.fillCircle(-14, 2, 7);
    g.fillCircle(14, 2, 7);
    g.fillStyle(0x88ccee, 1);
    g.fillCircle(-14, 0, 4);
    g.fillCircle(14, 0, 4);

    g.fillStyle(0xaaeeff, 1);
    g.beginPath();
    g.moveTo(-16, -4);
    g.lineTo(-14, -12);
    g.lineTo(-12, -4);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(12, -4);
    g.lineTo(14, -12);
    g.lineTo(16, -4);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x77aacc, 1);
    g.fillRect(-3, 10, 6, 28);

    g.fillStyle(0xaaddff, 0.8);
    g.fillCircle(0, 18, 3);
    g.fillCircle(0, 28, 3);

    g.fillStyle(0x88ddff, 1);
    g.beginPath();
    g.moveTo(0, 38);
    g.lineTo(-10, 48);
    g.lineTo(0, 64);
    g.lineTo(10, 48);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xbbffff, 1);
    g.beginPath();
    g.moveTo(0, 42);
    g.lineTo(-5, 48);
    g.lineTo(0, 58);
    g.lineTo(5, 48);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 50, 4);

    g.fillStyle(0xccffff, 0.9);
    const particles = [
      [-28, -26, 4],
      [30, -22, 3.5],
      [-32, 8, 3],
      [28, 14, 3],
      [-20, 26, 2.5],
      [24, 28, 2.5],
      [-36, -10, 2],
      [38, -8, 2],
      [-8, -32, 3],
      [10, -30, 2.5],
    ];
    particles.forEach(([px, py, size]) => {
      g.fillCircle(px as number, py as number, size as number);
    });

    g.lineStyle(2, 0x66ddff, 0.25);
    g.beginPath();
    g.arc(0, 0, 55, 0, Math.PI * 0.4);
    g.strokePath();
    g.beginPath();
    g.arc(0, 0, 55, Math.PI, Math.PI * 1.3);
    g.strokePath();
    g.lineStyle(1, 0xaaeeff, 0.15);
    g.beginPath();
    g.arc(0, 0, 62, Math.PI * 0.5, Math.PI * 0.9);
    g.strokePath();
    g.beginPath();
    g.arc(0, 0, 62, Math.PI * 1.4, Math.PI * 1.8);
    g.strokePath();
  }
}
