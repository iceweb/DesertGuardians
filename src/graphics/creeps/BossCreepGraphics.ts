import Phaser from 'phaser';

export class BossCreepGraphics {
  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    if (isPained) {
      const painShake = Math.sin(bounceTime * 30) * 2;
      g.setPosition(painShake, 0);
    } else {
      g.setPosition(0, 0);
    }

    switch (type) {
      case 'boss':
        BossCreepGraphics.drawBoss(g, bounceTime, faceDirection, isPained);
        break;
      case 'boss_1':
        BossCreepGraphics.drawBoss1(g, bounceTime, faceDirection, isPained);
        break;
      case 'boss_2':
        BossCreepGraphics.drawBoss2(g, bounceTime, faceDirection, isPained);
        break;
      case 'boss_3':
        BossCreepGraphics.drawBoss3(g, bounceTime, faceDirection, isPained);
        break;
      case 'boss_4':
        BossCreepGraphics.drawBoss4(g, bounceTime, faceDirection, isPained);
        break;
      case 'boss_5':
        BossCreepGraphics.drawBoss5(g, bounceTime, faceDirection, isPained);
        break;
    }

    if (isPained) {
      BossCreepGraphics.drawPainOverlay(g, bounceTime);
    }
  }

  private static drawPainOverlay(g: Phaser.GameObjects.Graphics, bounceTime: number): void {
    const painPulse = 0.3 + Math.sin(bounceTime * 8) * 0.15;

    g.fillStyle(0xff0000, painPulse * 0.4);
    g.fillCircle(0, 0, 55);

    g.fillStyle(0xff3300, painPulse * 0.3);
    g.fillCircle(0, 0, 40);

    const numDrips = 3;
    for (let i = 0; i < numDrips; i++) {
      const dripY = ((bounceTime * 40 + i * 30) % 60) - 10;
      const dripX = Math.sin(i * 2.5) * 20;
      const dripAlpha = Math.max(0, 1 - dripY / 50);
      g.fillStyle(0x8b0000, dripAlpha * 0.7);
      g.fillCircle(dripX, dripY, 3 - dripY / 30);
    }
  }

  static drawBoss(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean = false
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 3;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;

    g.fillStyle(0x800080, 0.2);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0x800080, 0.1);
    g.fillCircle(0, 0, 60 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 50, 18);

    g.fillStyle(0x4b0082, 1);
    g.fillEllipse(0, 0 + bounce, 44 * pulse, 38 * pulse);

    g.fillStyle(0x6a0dad, 1);
    g.fillEllipse(-10, -10 + bounce, 16, 20);
    g.fillEllipse(10, 5 + bounce, 18, 16);
    g.fillStyle(0x8b008b, 1);
    g.fillEllipse(0, -5 + bounce, 12, 14);

    g.fillStyle(0x9370db, 1);
    g.fillEllipse(18 * faceDirection, -5 + bounce, 18, 16);

    g.fillStyle(0xffd700, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -35 + bounce);
    g.lineTo(-4 * faceDirection, -45 + bounce);
    g.lineTo(0, -35 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(4 * faceDirection, -38 + bounce);
    g.lineTo(10 * faceDirection, -50 + bounce);
    g.lineTo(14 * faceDirection, -38 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff0000, 1);
    g.fillCircle(14 * faceDirection, -12 + bounce, 5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 4);
    g.fillCircle(20 * faceDirection, 2 + bounce, 3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(12 * faceDirection, -14 + bounce, 2);
    g.fillCircle(22 * faceDirection, -10 + bounce, 1.5);

    g.fillStyle(0x2f0040, 1);
    g.fillEllipse(26 * faceDirection, 4 + bounce, 8, 6);
    g.fillStyle(0xffffff, 1);
    g.fillRect(22 * faceDirection, 1 + bounce, 3, 4);
    g.fillRect(27 * faceDirection, 2 + bounce, 3, 3);

    g.fillStyle(0x4b0082, 1);
    g.fillEllipse(-25, 10 + bounce, 10, 8);
    g.fillEllipse(25, 10 + bounce, 10, 8);

    g.fillStyle(0x3a0066, 1);
    g.fillEllipse(-15, 28, 12, 8);
    g.fillEllipse(15, 28, 12, 8);
  }

  static drawBoss1(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean = false
  ): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.04;

    g.fillStyle(0xff6600, 0.12);
    g.fillCircle(0, 0, 35 * pulse);

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 32, 12);

    g.fillStyle(0x55aa44, 1);
    g.beginPath();
    g.moveTo(-12 * faceDirection, 8 + bounce);
    g.lineTo(-24 * faceDirection, 14 + bounce);
    g.lineTo(-30 * faceDirection, 8 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.lineTo(-18 * faceDirection, 6 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x44cc33, 1);
    g.fillEllipse(0, 0 + bounce, 26, 20);

    g.fillStyle(0xff8833, 0.7);
    g.fillCircle(-6, -4 + bounce, 4);
    g.fillCircle(4, 2 + bounce, 5);
    g.fillCircle(-2, 8 + bounce, 3);

    g.fillStyle(0x88dd77, 1);
    g.fillEllipse(0, 6 + bounce, 16, 10);

    g.fillStyle(0x55bb44, 1);
    g.fillEllipse(14 * faceDirection, -6 + bounce, 14, 12);

    g.fillStyle(0x66cc55, 1);
    g.fillEllipse(22 * faceDirection, -4 + bounce, 8, 6);

    g.fillStyle(0xffdd00, 1);
    g.fillCircle(12 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -8 + bounce, 4);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(13 * faceDirection, -10 + bounce, 1.5, 4);
    g.fillEllipse(21 * faceDirection, -8 + bounce, 1, 3);

    g.fillStyle(0xff4444, 1);
    g.fillRect(26 * faceDirection, -3 + bounce, 6, 1);
    g.fillRect(30 * faceDirection, -4 + bounce, 3, 1);
    g.fillRect(30 * faceDirection, -2 + bounce, 3, 1);

    g.fillStyle(0xff6600, 1);
    for (let i = 0; i < 3; i++) {
      const spineX = -8 + i * 6;
      g.beginPath();
      g.moveTo(spineX - 2, -10 + bounce);
      g.lineTo(spineX, -14 + bounce);
      g.lineTo(spineX + 2, -10 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x339922, 1);
    g.fillCircle(-12, 18, 5);
    g.fillCircle(12, 18, 5);
    g.fillCircle(-16, 8 + bounce, 4);
    g.fillCircle(16, 8 + bounce, 4);
  }

  static drawBoss2(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean = false
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;

    g.fillStyle(0x668844, 0.15);
    g.fillCircle(0, 0, 45 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 45, 14);

    g.fillStyle(0x556644, 1);
    g.beginPath();
    g.moveTo(-14 * faceDirection, 6 + bounce);
    g.lineTo(-32 * faceDirection, 12 + bounce);
    g.lineTo(-40 * faceDirection, 8 + bounce);
    g.lineTo(-38 * faceDirection, 2 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.lineTo(-16 * faceDirection, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x445533, 1);
    g.beginPath();
    g.moveTo(-26 * faceDirection, 2 + bounce);
    g.lineTo(-28 * faceDirection, -4 + bounce);
    g.lineTo(-30 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x556644, 1);
    g.fillEllipse(-14, 14 + bounce, 10, 14);
    g.fillEllipse(10, 16 + bounce, 8, 12);

    g.fillStyle(0x667755, 1);
    g.fillEllipse(0, 2 + bounce, 36, 26);

    g.fillStyle(0x778866, 1);
    g.fillEllipse(-8, -4 + bounce, 12, 10);
    g.fillEllipse(6, -2 + bounce, 14, 12);
    g.fillStyle(0x889977, 0.8);
    g.fillEllipse(-2, 8 + bounce, 18, 10);

    g.fillStyle(0x445533, 1);
    for (let i = 0; i < 5; i++) {
      const spineX = -12 + i * 6;
      const spineH = 6 + Math.sin(bounceTime * 4 + i) * 1;
      g.beginPath();
      g.moveTo(spineX - 3, -12 + bounce);
      g.lineTo(spineX, -12 - spineH + bounce);
      g.lineTo(spineX + 3, -12 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x556644, 1);
    g.fillEllipse(-20, 6 + bounce, 10, 8);
    g.fillEllipse(22, 4 + bounce, 10, 8);

    g.fillStyle(0x222211, 1);
    g.fillCircle(-24, 10 + bounce, 3);
    g.fillCircle(-28, 8 + bounce, 2);
    g.fillCircle(26, 8 + bounce, 3);
    g.fillCircle(30, 6 + bounce, 2);

    g.fillStyle(0x778866, 1);
    g.fillEllipse(16 * faceDirection, -6 + bounce, 18, 14);

    g.fillStyle(0x889977, 1);
    g.fillEllipse(28 * faceDirection, -4 + bounce, 12, 8);

    g.fillStyle(0x333322, 1);
    g.fillCircle(34 * faceDirection, -6 + bounce, 2);
    g.fillCircle(32 * faceDirection, -2 + bounce, 2);

    g.fillStyle(0xddaa00, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 1.5, 4);

    g.fillStyle(0xff6688, 1);
    g.fillRect(36 * faceDirection, -3 + bounce, 8, 1);
    g.fillRect(42 * faceDirection, -4 + bounce, 4, 1);
    g.fillRect(42 * faceDirection, -2 + bounce, 4, 1);

    g.fillStyle(0x556644, 1);
    g.fillEllipse(26 * faceDirection, 2 + bounce, 10, 6);
    g.fillStyle(0xffffee, 1);
    g.fillRect(22 * faceDirection, 0 + bounce, 2, 3);
    g.fillRect(26 * faceDirection, 1 + bounce, 2, 2);
    g.fillRect(30 * faceDirection, 0 + bounce, 2, 3);

    g.fillStyle(0x445533, 1);
    g.fillEllipse(-14, 26, 10, 6);
    g.fillEllipse(10, 26, 8, 5);
  }

  static drawBoss3(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean = false
  ): void {
    const bounce = Math.sin(bounceTime * 3.5) * 3;
    const wingFlutter = Math.sin(bounceTime * 6) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.04;

    g.fillStyle(0xff6622, 0.12);
    g.fillCircle(0, -5 + bounce, 50 * pulse);
    g.fillStyle(0xffaa44, 0.08);
    g.fillCircle(0, -5 + bounce, 42 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 48, 16);

    g.fillStyle(0x886644, 1);
    g.beginPath();
    g.moveTo(-16 * faceDirection, 8 + bounce);
    g.lineTo(-36 * faceDirection, 16 + bounce);
    g.lineTo(-48 * faceDirection, 12 + bounce);
    g.lineTo(-46 * faceDirection, 6 + bounce);
    g.lineTo(-32 * faceDirection, 8 + bounce);
    g.lineTo(-18 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-46 * faceDirection, 9 + bounce);
    g.lineTo(-54 * faceDirection, 6 + bounce);
    g.lineTo(-50 * faceDirection, 12 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x775533, 0.85);

    g.beginPath();
    g.moveTo(-14, -8 + bounce);
    g.lineTo(-28, -18 + bounce + wingFlutter * 20);
    g.lineTo(-32, -10 + bounce + wingFlutter * 15);
    g.lineTo(-26, -2 + bounce + wingFlutter * 10);
    g.lineTo(-16, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(14, -8 + bounce);
    g.lineTo(28, -18 + bounce + wingFlutter * 20);
    g.lineTo(32, -10 + bounce + wingFlutter * 15);
    g.lineTo(26, -2 + bounce + wingFlutter * 10);
    g.lineTo(16, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x664422, 0.6);
    g.beginPath();
    g.moveTo(-16, -6 + bounce);
    g.lineTo(-26, -12 + bounce + wingFlutter * 15);
    g.strokePath();
    g.beginPath();
    g.moveTo(16, -6 + bounce);
    g.lineTo(26, -12 + bounce + wingFlutter * 15);
    g.strokePath();

    g.fillStyle(0x997755, 1);
    g.fillEllipse(0, 2 + bounce, 34, 28);

    g.fillStyle(0xbbaa88, 1);
    g.fillEllipse(0, 8 + bounce, 22, 14);
    g.fillStyle(0xccbb99, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-10, 2 + i * 4 + bounce, 20, 2);
    }

    g.fillStyle(0x664422, 1);
    for (let i = 0; i < 6; i++) {
      const spineX = -14 + i * 5;
      const spineH = 10 + Math.sin(bounceTime * 4 + i) * 2;
      g.beginPath();
      g.moveTo(spineX - 3, -14 + bounce);
      g.lineTo(spineX, -14 - spineH + bounce);
      g.lineTo(spineX + 3, -14 + bounce);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x886655, 1);
    g.fillEllipse(-18, 16 + bounce, 10, 14);
    g.fillEllipse(18, 16 + bounce, 10, 14);
    g.fillEllipse(-22, 6 + bounce, 8, 10);
    g.fillEllipse(22, 6 + bounce, 8, 10);

    g.fillStyle(0x443322, 1);
    g.fillEllipse(-18, 28, 10, 6);
    g.fillEllipse(18, 28, 10, 6);
    g.fillCircle(-22, 29, 3);
    g.fillCircle(-14, 30, 3);
    g.fillCircle(14, 30, 3);
    g.fillCircle(22, 29, 3);

    g.fillStyle(0x997755, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 12, 14);

    g.fillStyle(0xaa8866, 1);
    g.fillEllipse(22 * faceDirection, -12 + bounce, 16, 14);

    g.fillStyle(0xbb9977, 1);
    g.fillEllipse(34 * faceDirection, -10 + bounce, 10, 8);

    g.fillStyle(0x775544, 1);
    g.beginPath();
    g.moveTo(16 * faceDirection, -22 + bounce);
    g.lineTo(20 * faceDirection, -28 + bounce);
    g.lineTo(24 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(24 * faceDirection, -20 + bounce);
    g.lineTo(28 * faceDirection, -26 + bounce);
    g.lineTo(32 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff8800, 1);
    g.fillEllipse(24 * faceDirection, -16 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(25 * faceDirection, -16 + bounce, 1.5, 4);

    g.fillStyle(0x333322, 1);
    g.fillCircle(40 * faceDirection, -12 + bounce, 2);
    g.fillStyle(0x888888, 0.4);
    g.fillCircle(44 * faceDirection, -14 + bounce, 3);

    g.fillStyle(0x886655, 1);
    g.fillEllipse(34 * faceDirection, -4 + bounce, 10, 6);
    g.fillStyle(0xff4400, 0.5);
    g.fillEllipse(38 * faceDirection, -4 + bounce, 6, 4);
    g.fillStyle(0xffffee, 1);
    g.fillRect(30 * faceDirection, -6 + bounce, 2, 4);
    g.fillRect(34 * faceDirection, -7 + bounce, 2, 5);
    g.fillRect(38 * faceDirection, -6 + bounce, 2, 4);
  }

  static drawBoss4(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    _isPained: boolean = false
  ): void {
    const hover = Math.sin(bounceTime * 3) * 3;
    const wingFlap = Math.sin(bounceTime * 4) * 0.25;
    const breathe = 1 + Math.sin(bounceTime * 4) * 0.04;

    g.fillStyle(0xff4400, 0.12);
    g.fillCircle(0, -5 + hover, 60 * breathe);
    g.fillStyle(0xffaa00, 0.08);
    g.fillCircle(0, -5 + hover, 50 * breathe);

    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 35, 55, 18);

    g.fillStyle(0xaa5533, 1);
    g.beginPath();
    g.moveTo(-18 * faceDirection, 10 + hover);
    g.lineTo(-38 * faceDirection, 20 + hover);
    g.lineTo(-52 * faceDirection, 16 + hover);
    g.lineTo(-50 * faceDirection, 10 + hover);
    g.lineTo(-36 * faceDirection, 12 + hover);
    g.lineTo(-20 * faceDirection, 4 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x663322, 1);
    for (let i = 0; i < 3; i++) {
      const tx = (-28 - i * 10) * faceDirection;
      g.beginPath();
      g.moveTo(tx - 2 * faceDirection, 10 + hover);
      g.lineTo(tx, 4 + hover);
      g.lineTo(tx + 2 * faceDirection, 10 + hover);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x883322, 1);

    g.beginPath();
    g.moveTo(-16, -6 + hover);
    g.lineTo(-40, -30 + hover + wingFlap * 35);
    g.lineTo(-55, -20 + hover + wingFlap * 30);
    g.lineTo(-50, 0 + hover + wingFlap * 20);
    g.lineTo(-40, 12 + hover + wingFlap * 10);
    g.lineTo(-22, 6 + hover);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(16, -6 + hover);
    g.lineTo(40, -30 + hover + wingFlap * 35);
    g.lineTo(55, -20 + hover + wingFlap * 30);
    g.lineTo(50, 0 + hover + wingFlap * 20);
    g.lineTo(40, 12 + hover + wingFlap * 10);
    g.lineTo(22, 6 + hover);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x662211, 0.9);
    g.beginPath();
    g.moveTo(-18, -4 + hover);
    g.lineTo(-42, -18 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(-20, 2 + hover);
    g.lineTo(-46, -6 + hover + wingFlap * 22);
    g.strokePath();
    g.beginPath();
    g.moveTo(18, -4 + hover);
    g.lineTo(42, -18 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(20, 2 + hover);
    g.lineTo(46, -6 + hover + wingFlap * 22);
    g.strokePath();

    g.fillStyle(0x332211, 1);
    g.fillCircle(-40, -28 + hover + wingFlap * 32, 3);
    g.fillCircle(40, -28 + hover + wingFlap * 32, 3);

    g.fillStyle(0xbb6644, 1);
    g.fillEllipse(0, 4 + hover, 40 * breathe, 32 * breathe);

    g.fillStyle(0xddcc99, 1);
    g.fillEllipse(0, 10 + hover, 24, 18);
    g.fillStyle(0xeeddaa, 0.8);
    for (let i = 0; i < 5; i++) {
      g.fillRect(-12, 2 + i * 4 + hover, 24, 2);
    }

    g.fillStyle(0x774422, 1);
    for (let i = 0; i < 7; i++) {
      const spineX = -16 + i * 5;
      const spineH = 12 + Math.sin(bounceTime * 3 + i * 0.5) * 2;
      g.beginPath();
      g.moveTo(spineX - 4, -14 + hover);
      g.lineTo(spineX, -14 - spineH + hover);
      g.lineTo(spineX + 4, -14 + hover);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0xaa5533, 1);
    g.fillEllipse(-16, 20 + hover, 12, 16);
    g.fillEllipse(16, 20 + hover, 12, 16);

    g.fillEllipse(-24, 8 + hover, 10, 12);
    g.fillEllipse(24, 8 + hover, 10, 12);

    g.fillStyle(0x553322, 1);
    g.fillEllipse(-16, 34, 12, 7);
    g.fillEllipse(16, 34, 12, 7);
    g.fillCircle(-22, 35, 3);
    g.fillCircle(-10, 36, 3);
    g.fillCircle(10, 36, 3);
    g.fillCircle(22, 35, 3);

    g.fillStyle(0xbb6644, 1);
    g.fillEllipse(16 * faceDirection, -14 + hover, 14, 18);

    g.fillStyle(0xcc7755, 1);
    g.fillEllipse(28 * faceDirection, -18 + hover, 18, 16);

    g.fillStyle(0xdd8866, 1);
    g.fillEllipse(42 * faceDirection, -16 + hover, 12, 10);

    g.fillStyle(0x443322, 1);
    g.beginPath();
    g.moveTo(22 * faceDirection, -30 + hover);
    g.lineTo(16 * faceDirection, -44 + hover);
    g.lineTo(14 * faceDirection, -42 + hover);
    g.lineTo(18 * faceDirection, -30 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(34 * faceDirection, -28 + hover);
    g.lineTo(38 * faceDirection, -42 + hover);
    g.lineTo(36 * faceDirection, -40 + hover);
    g.lineTo(30 * faceDirection, -28 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x885544, 1);
    g.beginPath();
    g.moveTo(24 * faceDirection, -26 + hover);
    g.lineTo(28 * faceDirection, -32 + hover);
    g.lineTo(32 * faceDirection, -26 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff6600, 1);
    g.fillEllipse(32 * faceDirection, -22 + hover, 5, 6);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(33 * faceDirection, -22 + hover, 2, 5);
    g.fillStyle(0xffff00, 0.6);
    g.fillCircle(31 * faceDirection, -24 + hover, 1.5);

    g.fillStyle(0x332222, 1);
    g.fillCircle(50 * faceDirection, -18 + hover, 2);
    g.fillCircle(48 * faceDirection, -14 + hover, 2);
    g.fillStyle(0x666666, 0.4);
    g.fillCircle(54 * faceDirection, -20 + hover, 4);
    g.fillCircle(56 * faceDirection, -22 + hover, 3);

    g.fillStyle(0xaa5533, 1);
    g.fillEllipse(42 * faceDirection, -8 + hover, 12, 8);
    g.fillStyle(0xff4400, 0.6);
    g.fillEllipse(48 * faceDirection, -8 + hover, 8, 5);
    g.fillStyle(0xffaa00, 0.4);
    g.fillCircle(54 * faceDirection, -8 + hover, 4);

    g.fillStyle(0xffffee, 1);
    g.fillRect(36 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(40 * faceDirection, -13 + hover, 2, 6);
    g.fillRect(44 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(48 * faceDirection, -11 + hover, 2, 4);
  }

  static drawBoss5(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const hover = Math.sin(bounceTime * 2) * 3;
    const wingFlap = Math.sin(bounceTime * 3) * 0.4;
    const breathe = 1 + Math.sin(bounceTime * 2) * 0.03;
    const fireFlicker = Math.sin(bounceTime * 12) * 0.3 + 0.7;
    const painShake = isPained ? Math.sin(bounceTime * 25) * 3 : 0;

    const scalesDark = 0x1a0a0a;
    const scalesMid = 0x2a1515;
    const scalesLight = 0x3a2020;
    const underbelly = 0x4a3030;
    const eyeGlow = 0xff2200;
    const fireCore = 0xff6600;
    const boneColor = 0xccbbaa;
    const scarColor = 0x550000;

    g.fillStyle(0x000000, 0.3);
    g.fillCircle(painShake, hover, 75 * breathe);
    g.fillStyle(scalesDark, 0.15);
    g.fillCircle(painShake, hover, 60 * breathe);

    if (isPained) {
      g.fillStyle(0xff0000, 0.15 * fireFlicker);
      g.fillCircle(painShake, hover, 70);
    }

    g.fillStyle(0x000000, 0.6);
    g.fillEllipse(0, 42, 70, 20);

    g.fillStyle(scalesDark, 1);

    g.beginPath();
    g.moveTo(-18 * faceDirection + painShake, 15 + hover);
    g.lineTo(-35 * faceDirection, 22 + hover);
    g.lineTo(-55 * faceDirection, 18 + hover);
    g.lineTo(-72 * faceDirection, 8 + hover);
    g.lineTo(-70 * faceDirection, 5 + hover);
    g.lineTo(-52 * faceDirection, 12 + hover);
    g.lineTo(-32 * faceDirection, 15 + hover);
    g.lineTo(-16 * faceDirection + painShake, 8 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(boneColor, 1);
    for (let i = 0; i < 5; i++) {
      const tx = (-25 - i * 10) * faceDirection;
      const ty = 10 + hover + Math.sin(i * 0.8) * 3;
      g.beginPath();
      g.moveTo(tx - 3 * faceDirection, ty + 3);
      g.lineTo(tx, ty - 8 - i);
      g.lineTo(tx + 3 * faceDirection, ty + 3);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(boneColor, 1);
    g.beginPath();
    g.moveTo(-68 * faceDirection, 8 + hover);
    g.lineTo(-82 * faceDirection, 2 + hover);
    g.lineTo(-80 * faceDirection, 12 + hover);
    g.closePath();
    g.fillPath();

    const wingAngle = wingFlap * 45;

    g.fillStyle(scalesDark, 1);
    g.beginPath();
    g.moveTo(-20 + painShake, -5 + hover);
    g.lineTo(-55, -45 + hover + wingAngle);
    g.lineTo(-75, -35 + hover + wingAngle * 0.8);
    g.lineTo(-72, -10 + hover + wingAngle * 0.5);
    g.lineTo(-60, 15 + hover + wingAngle * 0.3);
    g.lineTo(-35, 12 + hover);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(20 + painShake, -5 + hover);
    g.lineTo(55, -45 + hover + wingAngle);
    g.lineTo(75, -35 + hover + wingAngle * 0.8);
    g.lineTo(72, -10 + hover + wingAngle * 0.5);
    g.lineTo(60, 15 + hover + wingAngle * 0.3);
    g.lineTo(35, 12 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x0a0505, 0.9);

    g.beginPath();
    g.moveTo(-22 + painShake, -3 + hover);
    g.lineTo(-50, -38 + hover + wingAngle);
    g.lineTo(-68, -28 + hover + wingAngle * 0.8);
    g.lineTo(-65, -5 + hover + wingAngle * 0.5);
    g.lineTo(-55, 12 + hover + wingAngle * 0.3);
    g.lineTo(-30, 10 + hover);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(22 + painShake, -3 + hover);
    g.lineTo(50, -38 + hover + wingAngle);
    g.lineTo(68, -28 + hover + wingAngle * 0.8);
    g.lineTo(65, -5 + hover + wingAngle * 0.5);
    g.lineTo(55, 12 + hover + wingAngle * 0.3);
    g.lineTo(30, 10 + hover);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, scalesMid, 1);

    g.beginPath();
    g.moveTo(-22 + painShake, -3 + hover);
    g.lineTo(-55, -42 + hover + wingAngle);
    g.strokePath();
    g.beginPath();
    g.moveTo(-26 + painShake, 0 + hover);
    g.lineTo(-62, -18 + hover + wingAngle * 0.6);
    g.strokePath();
    g.beginPath();
    g.moveTo(-28 + painShake, 5 + hover);
    g.lineTo(-58, 8 + hover + wingAngle * 0.3);
    g.strokePath();

    g.beginPath();
    g.moveTo(22 + painShake, -3 + hover);
    g.lineTo(55, -42 + hover + wingAngle);
    g.strokePath();
    g.beginPath();
    g.moveTo(26 + painShake, 0 + hover);
    g.lineTo(62, -18 + hover + wingAngle * 0.6);
    g.strokePath();
    g.beginPath();
    g.moveTo(28 + painShake, 5 + hover);
    g.lineTo(58, 8 + hover + wingAngle * 0.3);
    g.strokePath();

    g.fillStyle(boneColor, 1);
    g.fillCircle(-55, -44 + hover + wingAngle, 4);
    g.fillCircle(55, -44 + hover + wingAngle, 4);

    g.beginPath();
    g.moveTo(-55, -48 + hover + wingAngle);
    g.lineTo(-52, -55 + hover + wingAngle);
    g.lineTo(-50, -47 + hover + wingAngle);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(55, -48 + hover + wingAngle);
    g.lineTo(52, -55 + hover + wingAngle);
    g.lineTo(50, -47 + hover + wingAngle);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x000000, 0.8);
    for (let i = 0; i < 3; i++) {
      const holeX = -45 + i * 8;
      const holeY = -15 + hover + wingAngle * 0.4 + i * 5;
      g.fillCircle(holeX, holeY, 3 + Math.random());
    }

    g.fillStyle(scalesMid, 1);
    g.fillEllipse(painShake, 5 + hover, 48 * breathe, 40 * breathe);

    g.fillStyle(scalesDark, 1);
    g.fillEllipse(painShake - 5, -8 + hover, 35, 25);
    g.fillEllipse(painShake + 5, 2 + hover, 38, 28);

    g.lineStyle(2, scarColor, 0.8);
    g.beginPath();
    g.moveTo(-15 + painShake, -5 + hover);
    g.lineTo(10 + painShake, 15 + hover);
    g.strokePath();
    g.beginPath();
    g.moveTo(8 + painShake, -10 + hover);
    g.lineTo(-5 + painShake, 8 + hover);
    g.strokePath();

    g.fillStyle(underbelly, 1);
    g.fillEllipse(painShake, 18 + hover, 30, 20);

    g.lineStyle(1, scalesDark, 0.6);
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(-15 + painShake, 10 + i * 4 + hover);
      g.lineTo(15 + painShake, 10 + i * 4 + hover);
      g.strokePath();
    }

    g.fillStyle(boneColor, 1);
    for (let i = 0; i < 7; i++) {
      const spineX = -14 + i * 5 + painShake;
      const spineH = 22 + Math.sin(bounceTime * 4 + i * 0.5) * 2;
      const spineW = 4 - i * 0.3;
      g.beginPath();
      g.moveTo(spineX - spineW, -20 + hover);
      g.lineTo(spineX, -20 - spineH + hover);
      g.lineTo(spineX + spineW, -20 + hover);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(scalesDark, 1);
    g.fillRect(-18 + painShake, -22 + hover, 36, 5);

    g.fillStyle(scalesMid, 1);
    g.fillEllipse(-20 + painShake, 28 + hover, 16, 20);
    g.fillEllipse(20 + painShake, 28 + hover, 16, 20);

    g.fillEllipse(-30 + painShake, 12 + hover, 14, 16);
    g.fillEllipse(30 + painShake, 12 + hover, 14, 16);

    g.fillStyle(scalesDark, 1);
    g.fillEllipse(-20, 42, 16, 8);
    g.fillEllipse(20, 42, 16, 8);

    g.fillStyle(boneColor, 1);

    g.beginPath();
    g.moveTo(-28, 44);
    g.lineTo(-32, 48);
    g.lineTo(-26, 46);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-20, 46);
    g.lineTo(-20, 52);
    g.lineTo(-16, 46);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-12, 44);
    g.lineTo(-8, 48);
    g.lineTo(-14, 46);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(28, 44);
    g.lineTo(32, 48);
    g.lineTo(26, 46);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(20, 46);
    g.lineTo(20, 52);
    g.lineTo(16, 46);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(12, 44);
    g.lineTo(8, 48);
    g.lineTo(14, 46);
    g.closePath();
    g.fillPath();

    g.fillStyle(scalesMid, 1);
    g.beginPath();
    g.moveTo(12 * faceDirection + painShake, -12 + hover);
    g.lineTo(25 * faceDirection, -22 + hover);
    g.lineTo(35 * faceDirection, -28 + hover);
    g.lineTo(38 * faceDirection, -25 + hover);
    g.lineTo(28 * faceDirection, -18 + hover);
    g.lineTo(16 * faceDirection + painShake, -5 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(scalesDark, 1);
    for (let i = 0; i < 4; i++) {
      const nx = (15 + i * 6) * faceDirection;
      const ny = -14 - i * 4 + hover;
      g.fillCircle(nx, ny, 5 - i * 0.5);
    }

    g.fillStyle(scalesMid, 1);
    g.fillEllipse(42 * faceDirection, -30 + hover, 24, 22);

    g.fillStyle(scalesLight, 1);
    g.beginPath();
    g.moveTo(48 * faceDirection, -38 + hover);
    g.lineTo(68 * faceDirection, -32 + hover);
    g.lineTo(72 * faceDirection, -28 + hover);
    g.lineTo(68 * faceDirection, -22 + hover);
    g.lineTo(48 * faceDirection, -18 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(scalesDark, 1);
    g.beginPath();
    g.moveTo(30 * faceDirection, -42 + hover);
    g.lineTo(52 * faceDirection, -44 + hover);
    g.lineTo(56 * faceDirection, -38 + hover);
    g.lineTo(50 * faceDirection, -36 + hover);
    g.lineTo(32 * faceDirection, -38 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(boneColor, 1);

    g.beginPath();
    g.moveTo(28 * faceDirection, -42 + hover);
    g.lineTo(20 * faceDirection, -52 + hover);
    g.lineTo(12 * faceDirection, -62 + hover);
    g.lineTo(8 * faceDirection, -68 + hover);
    g.lineTo(12 * faceDirection, -66 + hover);
    g.lineTo(18 * faceDirection, -58 + hover);
    g.lineTo(26 * faceDirection, -48 + hover);
    g.lineTo(32 * faceDirection, -40 + hover);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(48 * faceDirection, -44 + hover);
    g.lineTo(55 * faceDirection, -58 + hover);
    g.lineTo(58 * faceDirection, -55 + hover);
    g.lineTo(52 * faceDirection, -42 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x998877, 1);
    g.fillCircle(8 * faceDirection, -70 + hover, 3);
    g.fillCircle(55 * faceDirection, -60 + hover, 2);

    g.fillStyle(0x000000, 1);
    g.fillEllipse(44 * faceDirection, -34 + hover, 9, 10);

    g.fillStyle(eyeGlow, 1);
    g.fillEllipse(44 * faceDirection, -34 + hover, 7, 8);

    g.fillStyle(0x000000, 1);
    g.fillEllipse(45 * faceDirection, -34 + hover, 2, 7);

    g.fillStyle(0xffaa00, 0.6);
    g.fillCircle(42 * faceDirection, -36 + hover, 2);

    g.fillStyle(eyeGlow, 0.5);
    g.fillEllipse(36 * faceDirection, -32 + hover, 4, 5);
    g.fillStyle(0x000000, 0.8);
    g.fillEllipse(36 * faceDirection, -32 + hover, 1, 4);

    g.fillStyle(0x000000, 1);
    g.fillCircle(66 * faceDirection, -30 + hover, 4);
    g.fillCircle(64 * faceDirection, -24 + hover, 3);

    g.fillStyle(0x333333, 0.4 * fireFlicker);
    g.fillCircle(70 * faceDirection, -34 + hover, 5);
    g.fillStyle(0x222222, 0.3 * fireFlicker);
    g.fillCircle(73 * faceDirection, -38 + hover, 4);

    g.fillStyle(scalesLight, 1);
    g.beginPath();
    g.moveTo(50 * faceDirection, -20 + hover);
    g.lineTo(70 * faceDirection, -18 + hover);
    g.lineTo(68 * faceDirection, -10 + hover);
    g.lineTo(48 * faceDirection, -12 + hover);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x110000, 1);
    g.fillEllipse(58 * faceDirection, -14 + hover, 12, 6);
    g.fillStyle(fireCore, 0.5 * fireFlicker);
    g.fillEllipse(58 * faceDirection, -14 + hover, 8, 4);

    g.fillStyle(boneColor, 1);

    g.beginPath();
    g.moveTo(52 * faceDirection, -20 + hover);
    g.lineTo(54 * faceDirection, -8 + hover);
    g.lineTo(56 * faceDirection, -20 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(60 * faceDirection, -19 + hover);
    g.lineTo(63 * faceDirection, -6 + hover);
    g.lineTo(66 * faceDirection, -19 + hover);
    g.closePath();
    g.fillPath();

    g.fillRect(68 * faceDirection, -18 + hover, 2, 5);
    g.fillRect(48 * faceDirection, -19 + hover, 2, 4);

    g.beginPath();
    g.moveTo(55 * faceDirection, -10 + hover);
    g.lineTo(57 * faceDirection, -18 + hover);
    g.lineTo(59 * faceDirection, -10 + hover);
    g.closePath();
    g.fillPath();

    if (isPained) {
      g.fillStyle(fireCore, 0.9 * fireFlicker);
      g.fillEllipse(75 * faceDirection, -14 + hover, 15, 10);
      g.fillStyle(0xffaa00, 0.7 * fireFlicker);
      g.fillEllipse(88 * faceDirection, -14 + hover, 12, 8);
      g.fillStyle(0xffff66, 0.5 * fireFlicker);
      g.fillCircle(98 * faceDirection, -14 + hover, 6);
    }

    for (let i = 0; i < 6; i++) {
      const angle = bounceTime * 1.2 + i * 1.1;
      const dist = 50 + Math.sin(bounceTime * 2 + i) * 15;
      const ex = Math.cos(angle) * dist * 0.8;
      const ey = Math.sin(angle) * dist * 0.5 + hover;
      const emberAlpha = 0.5 + Math.sin(bounceTime * 8 + i * 2) * 0.3;
      g.fillStyle(fireCore, emberAlpha * 0.6);
      g.fillCircle(ex, ey, 2);
      g.fillStyle(0xffff66, emberAlpha * 0.4);
      g.fillCircle(ex, ey - 2, 1);
    }
  }

  static drawBossGuard1(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;
    const swordSwing = Math.sin(bounceTime * 3) * 5;

    g.fillStyle(0x447744, 0.2);
    g.fillCircle(0, 0, 36 * pulse);

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 26, 36, 12);

    g.fillStyle(0x224422, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -8 + bounce);
    g.lineTo(-24 * faceDirection, 20 + bounce + swordSwing * 0.3);
    g.lineTo(-18 * faceDirection, 22 + bounce);
    g.lineTo(-6 * faceDirection, 5 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x445544, 1);
    g.fillRect(-10, 10 + bounce, 6, 14);
    g.fillRect(4, 10 + bounce, 6, 14);

    g.fillStyle(0x333333, 1);
    g.fillEllipse(-7, 24, 8, 5);
    g.fillEllipse(7, 24, 8, 5);

    g.fillStyle(0x556655, 1);
    g.fillEllipse(0, 0 + bounce, 28, 22);

    g.fillStyle(0x667766, 1);
    g.fillEllipse(4 * faceDirection, -2 + bounce, 18, 14);

    g.fillStyle(0x778877, 0.9);
    g.fillRect(-8, -4 + bounce, 16, 4);
    g.fillRect(-6, 2 + bounce, 12, 3);

    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -14 + bounce);
    g.lineTo(-28 * faceDirection, 0 + bounce);
    g.lineTo(-20 * faceDirection, 16 + bounce);
    g.lineTo(-14 * faceDirection, 0 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x776655, 1);
    g.strokePath();

    g.fillStyle(0x44aa44, 1);
    g.fillCircle(-20 * faceDirection, 0 + bounce, 6);
    g.fillStyle(0x55cc55, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -4 + bounce);
    g.lineTo(-17 * faceDirection, 2 + bounce);
    g.lineTo(-23 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x556655, 1);
    g.fillEllipse(18 * faceDirection, 0 + bounce, 8, 6);

    g.fillStyle(0x888888, 1);
    g.save();
    g.translateCanvas(22 * faceDirection, -10 + bounce);
    g.rotateCanvas(swordSwing * 0.02 * faceDirection);

    g.fillRect(-2, -24, 4, 28);
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(-1, -24, 2, 28);

    g.fillStyle(0xbbbbbb, 1);
    g.beginPath();
    g.moveTo(-2, -24);
    g.lineTo(0, -32);
    g.lineTo(2, -24);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x664422, 1);
    g.fillRect(-6, 2, 12, 3);

    g.fillStyle(0x442211, 1);
    g.fillRect(-2, 5, 4, 8);
    g.restore();

    g.fillStyle(0x556655, 1);
    g.fillEllipse(6 * faceDirection, -14 + bounce, 14, 12);

    g.fillStyle(0x445544, 1);
    g.fillRect(8 * faceDirection, -16 + bounce, 8, 8);

    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -14 + bounce, 6, 2);

    g.fillStyle(0x88ff88, 0.8);
    g.fillCircle(12 * faceDirection, -13 + bounce, 2);

    g.fillStyle(0x667766, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -20 + bounce);
    g.lineTo(6 * faceDirection, -28 + bounce);
    g.lineTo(10 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }

  static drawBossGuard2(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.04;
    const swordSwing = Math.sin(bounceTime * 3) * 6;

    g.fillStyle(0x88aa44, 0.25);
    g.fillCircle(0, 0, 42 * pulse);
    g.fillStyle(0xaaaa44, 0.15);
    g.fillCircle(0, 0, 48 * pulse);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 40, 14);

    g.fillStyle(0x883322, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -10 + bounce);
    g.lineTo(-28 * faceDirection, 24 + bounce + swordSwing * 0.3);
    g.lineTo(-20 * faceDirection, 26 + bounce);
    g.lineTo(-4 * faceDirection, 8 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0xccaa44, 1);
    g.strokePath();

    g.fillStyle(0x556655, 1);
    g.fillRect(-12, 10 + bounce, 7, 16);
    g.fillRect(5, 10 + bounce, 7, 16);

    g.fillStyle(0xbb9944, 1);
    g.fillCircle(-8, 12 + bounce, 4);
    g.fillCircle(8, 12 + bounce, 4);

    g.fillStyle(0x444444, 1);
    g.fillEllipse(-8, 26, 10, 6);
    g.fillEllipse(8, 26, 10, 6);

    g.fillStyle(0x667766, 1);
    g.fillEllipse(0, 0 + bounce, 32, 24);

    g.fillStyle(0x778877, 1);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillEllipse(-9 + col * 6, -6 + row * 6 + bounce, 5, 4);
      }
    }

    g.lineStyle(2, 0xccaa44, 1);
    g.strokeEllipse(0, -2 + bounce, 20, 12);

    g.fillStyle(0x665544, 1);
    g.beginPath();
    g.moveTo(-22 * faceDirection, -18 + bounce);
    g.lineTo(-32 * faceDirection, -8 + bounce);
    g.lineTo(-32 * faceDirection, 10 + bounce);
    g.lineTo(-22 * faceDirection, 20 + bounce);
    g.lineTo(-14 * faceDirection, 10 + bounce);
    g.lineTo(-14 * faceDirection, -8 + bounce);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, 0xccaa44, 1);
    g.strokePath();

    g.fillStyle(0xaa6622, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 8);
    g.fillStyle(0xcc8833, 1);
    g.beginPath();
    g.moveTo(-23 * faceDirection, -6 + bounce);
    g.lineTo(-18 * faceDirection, 4 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff4400, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 3);

    g.fillStyle(0x667766, 1);
    g.fillEllipse(20 * faceDirection, -2 + bounce, 10, 8);
    g.fillStyle(0xbb9944, 1);
    g.fillCircle(18 * faceDirection, -6 + bounce, 5);

    g.save();
    g.translateCanvas(24 * faceDirection, -12 + bounce);
    g.rotateCanvas(swordSwing * 0.02 * faceDirection);

    g.fillStyle(0x999999, 1);
    g.fillRect(-3, -28, 6, 32);
    g.fillStyle(0xbbbbbb, 1);
    g.fillRect(-1, -28, 2, 32);

    g.fillStyle(0xdddddd, 1);
    g.fillRect(2, -26, 1, 28);

    g.fillStyle(0xcccccc, 1);
    g.beginPath();
    g.moveTo(-3, -28);
    g.lineTo(0, -38);
    g.lineTo(3, -28);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xccaa44, 1);
    g.fillRect(-10, 2, 20, 4);
    g.beginPath();
    g.moveTo(-10, 4);
    g.lineTo(-14, 0);
    g.lineTo(-10, 2);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(10, 4);
    g.lineTo(14, 0);
    g.lineTo(10, 2);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x553322, 1);
    g.fillRect(-2, 6, 4, 10);
    g.fillStyle(0xccaa44, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-2, 7 + i * 2, 4, 1);
    }

    g.fillStyle(0xccaa44, 1);
    g.fillCircle(0, 18, 3);
    g.restore();

    g.fillStyle(0x667766, 1);
    g.fillEllipse(8 * faceDirection, -16 + bounce, 16, 14);

    g.fillStyle(0x556655, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 12);

    g.fillStyle(0x000000, 1);
    g.fillRect(12 * faceDirection, -16 + bounce, 8, 3);
    g.fillStyle(0xffdd44, 0.9);
    g.fillCircle(14 * faceDirection, -15 + bounce, 2);
    g.fillCircle(18 * faceDirection, -15 + bounce, 2);

    g.fillStyle(0xccaa44, 1);
    g.beginPath();
    g.moveTo(4 * faceDirection, -22 + bounce);
    g.lineTo(8 * faceDirection, -36 + bounce);
    g.lineTo(12 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x888866, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -18 + bounce);
    g.lineTo(-8 * faceDirection, -26 + bounce);
    g.lineTo(0 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }

  static drawBossGuard3(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    const swordSwing = Math.sin(bounceTime * 3) * 8;
    const flameFlicker = Math.sin(bounceTime * 12) * 0.3 + 0.7;
    const flameWave = Math.sin(bounceTime * 8);

    g.fillStyle(0xff4400, 0.2 * flameFlicker);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0xff6600, 0.15 * flameFlicker);
    g.fillCircle(0, 0, 56 * pulse);
    g.fillStyle(0xffaa00, 0.1 * flameFlicker);
    g.fillCircle(0, 0, 62 * pulse);

    for (let i = 0; i < 6; i++) {
      const angle = bounceTime * 2 + i * (Math.PI / 3);
      const dist = 35 + Math.sin(bounceTime * 4 + i) * 8;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist * 0.6;
      g.fillStyle(0xff6600, 0.6 + Math.sin(bounceTime * 8 + i) * 0.3);
      g.fillCircle(ex, ey, 2 + Math.sin(bounceTime * 6 + i) * 1);
    }

    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 30, 44, 16);

    g.fillStyle(0x441111, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -12 + bounce);
    g.lineTo(-32 * faceDirection, 28 + bounce + swordSwing * 0.4);
    g.lineTo(-24 * faceDirection, 30 + bounce);
    g.lineTo(-4 * faceDirection, 10 + bounce);
    g.closePath();
    g.fillPath();

    for (let i = 0; i < 5; i++) {
      const fx = -32 * faceDirection + i * 2 * faceDirection;
      const fy = 28 + bounce + Math.sin(bounceTime * 10 + i) * 3;
      g.fillStyle(0xff4400, 0.7);
      g.fillCircle(fx, fy, 3);
      g.fillStyle(0xffaa00, 0.5);
      g.fillCircle(fx, fy - 4, 2);
    }

    g.fillStyle(0x333333, 1);
    g.fillRect(-14, 10 + bounce, 8, 18);
    g.fillRect(6, 10 + bounce, 8, 18);

    g.fillStyle(0xff4400, 0.6);
    g.fillRect(-12, 14 + bounce, 4, 2);
    g.fillRect(-12, 20 + bounce, 4, 2);
    g.fillRect(8, 14 + bounce, 4, 2);
    g.fillRect(8, 20 + bounce, 4, 2);

    g.fillStyle(0x222222, 1);
    g.fillEllipse(-10, 28, 12, 7);
    g.fillEllipse(10, 28, 12, 7);
    g.fillStyle(0xff6600, 0.7 * flameFlicker);
    g.fillCircle(-14, 26, 3);
    g.fillCircle(14, 26, 3);

    g.fillStyle(0x222222, 1);
    g.fillEllipse(0, 0 + bounce, 36, 28);

    g.fillStyle(0x333333, 1);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        g.fillEllipse(-12 + col * 6, -8 + row * 6 + bounce, 5, 4);
      }
    }

    g.fillStyle(0xff4400, 0.6 * flameFlicker);
    g.fillRect(-10, -2 + bounce, 20, 2);
    g.fillRect(-8, 4 + bounce, 16, 2);

    g.fillStyle(0xff6600, 0.8 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 6);
    g.fillStyle(0xffaa00, 0.6 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 4);

    g.save();
    g.translateCanvas(-20 * faceDirection, -8 + bounce);
    g.rotateCanvas((-swordSwing * 0.03 - 0.3) * faceDirection);

    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -32, 4, 36);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -32, 2, 36);

    for (let i = 0; i < 8; i++) {
      const flameY = -30 + i * 4;
      const flameSize = 4 + Math.sin(bounceTime * 12 + i) * 2;
      const flameOffset = Math.sin(bounceTime * 10 + i * 0.5) * 3;
      g.fillStyle(0xff4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xffaa00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xffff00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }

    g.fillStyle(0xff6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -32);
    g.lineTo(0, -42 - flameWave * 3);
    g.lineTo(2, -32);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);

    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();

    g.save();
    g.translateCanvas(26 * faceDirection, -10 + bounce);
    g.rotateCanvas((swordSwing * 0.03 + 0.3) * faceDirection);

    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -34, 4, 38);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -34, 2, 38);

    for (let i = 0; i < 9; i++) {
      const flameY = -32 + i * 4;
      const flameSize = 5 + Math.sin(bounceTime * 11 + i * 1.1) * 2;
      const flameOffset = Math.sin(bounceTime * 9 + i * 0.7) * 3;
      g.fillStyle(0xff4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xffaa00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xffff00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }

    g.fillStyle(0xff6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -34);
    g.lineTo(0, -46 - flameWave * 4);
    g.lineTo(2, -34);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);

    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();

    g.fillStyle(0x333333, 1);
    g.fillEllipse(-16 * faceDirection, -6 + bounce, 10, 8);
    g.fillEllipse(20 * faceDirection, -6 + bounce, 10, 8);

    g.fillStyle(0xff4400, 0.7 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -10 + bounce, 5);
    g.fillStyle(0xffaa00, 0.5 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -13 + bounce, 3);
    g.fillCircle(20 * faceDirection, -13 + bounce, 3);

    g.fillStyle(0x222222, 1);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 18, 16);

    g.fillStyle(0x333333, 1);
    g.beginPath();
    g.moveTo(12 * faceDirection, -26 + bounce);
    g.lineTo(22 * faceDirection, -18 + bounce);
    g.lineTo(20 * faceDirection, -8 + bounce);
    g.lineTo(8 * faceDirection, -6 + bounce);
    g.lineTo(4 * faceDirection, -18 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 4);
    g.fillStyle(0xff4400, 0.9 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 3);
    g.fillCircle(18 * faceDirection, -18 + bounce, 3);
    g.fillStyle(0xffff00, 0.7 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 1.5);
    g.fillCircle(18 * faceDirection, -18 + bounce, 1.5);

    g.fillStyle(0x222222, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -24 + bounce);
    g.lineTo(-4 * faceDirection, -38 + bounce);
    g.lineTo(4 * faceDirection, -26 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(14 * faceDirection, -26 + bounce);
    g.lineTo(18 * faceDirection, -40 + bounce);
    g.lineTo(18 * faceDirection, -26 + bounce);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff4400, 0.8 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -40 + bounce + flameWave * 2, 4);
    g.fillCircle(18 * faceDirection, -42 + bounce + flameWave * 2, 4);
    g.fillStyle(0xffaa00, 0.6 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -44 + bounce + flameWave * 3, 3);
    g.fillCircle(18 * faceDirection, -46 + bounce + flameWave * 3, 3);
    g.fillStyle(0xffff00, 0.4 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -47 + bounce + flameWave * 4, 2);
    g.fillCircle(18 * faceDirection, -49 + bounce + flameWave * 4, 2);
  }
}
