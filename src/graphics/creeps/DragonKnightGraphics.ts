import Phaser from 'phaser';

export class DragonKnightGraphics {

  static draw(
    g: Phaser.GameObjects.Graphics,
    tier: number,
    bounceTime: number,
    faceDirection: number
  ): void {
    switch (tier) {
      case 1:
        DragonKnightGraphics.drawTier1(g, bounceTime, faceDirection);
        break;
      case 2:
        DragonKnightGraphics.drawTier2(g, bounceTime, faceDirection);
        break;
      case 3:
        DragonKnightGraphics.drawTier3(g, bounceTime, faceDirection);
        break;
      default:
        DragonKnightGraphics.drawTier1(g, bounceTime, faceDirection);
    }
  }

  static drawTier1(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {

    const walkCycle = bounceTime * 5;
    const leftLegAngle = Math.sin(walkCycle) * 0.3;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.3;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 2;
    const armSwing = Math.sin(walkCycle) * 0.2;

    const armorPrimary = 0x8B7355;
    const armorSecondary = 0x6B5344;
    const armorHighlight = 0xA89070;
    const accentColor = 0x4A7C59;
    const capeColor = 0x2D4A3E;

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 28, 28, 10);

    g.fillStyle(capeColor, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -6 + bodyBob);
    g.lineTo(-20 * faceDirection, 22 + Math.sin(bounceTime * 3) * 3);
    g.lineTo(-14 * faceDirection, 24 + Math.sin(bounceTime * 3 + 1) * 2);
    g.lineTo(-4 * faceDirection, 8 + bodyBob);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, accentColor, 0.8);
    g.strokePath();

    g.save();
    g.translateCanvas(-6, 12 + bodyBob);
    g.rotateCanvas(leftLegAngle);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, 0, 6, 10);

    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 10, 4);

    g.fillStyle(armorPrimary, 1);
    g.fillRect(-3, 10, 6, 10);

    g.fillStyle(0x3A3A3A, 1);
    g.fillEllipse(2 * faceDirection, 22, 6, 4);
    g.restore();

    g.save();
    g.translateCanvas(6, 12 + bodyBob);
    g.rotateCanvas(rightLegAngle);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, 0, 6, 10);

    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 10, 4);

    g.fillStyle(armorPrimary, 1);
    g.fillRect(-3, 10, 6, 10);

    g.fillStyle(0x3A3A3A, 1);
    g.fillEllipse(2 * faceDirection, 22, 6, 4);
    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 22, 18);

    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(2 * faceDirection, -2 + bodyBob, 14, 10);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-1, -8 + bodyBob, 2, 14);

    g.fillStyle(0x4A3A2A, 1);
    g.fillRect(-12, 8 + bodyBob, 24, 4);
    g.fillStyle(accentColor, 1);
    g.fillCircle(0, 10 + bodyBob, 3);

    const shieldX = -14 * faceDirection;
    g.fillStyle(0x5A4A3A, 1);
    g.beginPath();
    g.moveTo(shieldX, -12 + bodyBob);
    g.lineTo(shieldX - 8 * faceDirection, -2 + bodyBob);
    g.lineTo(shieldX, 14 + bodyBob);
    g.lineTo(shieldX + 6 * faceDirection, -2 + bodyBob);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, armorHighlight, 1);
    g.strokePath();

    g.fillStyle(accentColor, 1);
    g.fillCircle(shieldX - 1 * faceDirection, 0 + bodyBob, 5);
    g.fillStyle(0x6A9C69, 1);
    g.beginPath();
    g.moveTo(shieldX - 1 * faceDirection, -4 + bodyBob);
    g.lineTo(shieldX + 3 * faceDirection, 2 + bodyBob);
    g.lineTo(shieldX - 5 * faceDirection, 2 + bodyBob);
    g.closePath();
    g.fillPath();

    const swordArmX = 16 * faceDirection;
    g.save();
    g.translateCanvas(swordArmX, -2 + bodyBob);
    g.rotateCanvas(armSwing * faceDirection);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, -4, 8, 6);
    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(0, -6, 6, 4);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, -2, 6, 12);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 12, 5, 4);

    g.fillStyle(0x3A2A1A, 1);
    g.fillRect(-2, 14, 4, 8);

    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 23, 3);

    g.fillStyle(armorPrimary, 1);
    g.fillRect(-6, 12, 12, 3);

    g.fillStyle(0x9999AA, 1);
    g.fillRect(-2, -18, 4, 30);
    g.fillStyle(0xBBBBCC, 1);
    g.fillRect(-1, -18, 2, 30);

    g.fillStyle(0xCCCCDD, 1);
    g.beginPath();
    g.moveTo(-2, -18);
    g.lineTo(0, -26);
    g.lineTo(2, -18);
    g.closePath();
    g.fillPath();

    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(-12 * faceDirection, -6 + bodyBob, 7, 5);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(4 * faceDirection, -14 + bodyBob, 12, 11);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(6 * faceDirection, -18 + bodyBob, 8, 10);

    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(8 * faceDirection, -16 + bodyBob, 6, 2);
    g.fillRect(10 * faceDirection, -16 + bodyBob, 2, 6);

    g.fillStyle(0x66AA66, 0.8);
    g.fillCircle(9 * faceDirection, -15 + bodyBob, 1.5);
    g.fillCircle(12 * faceDirection, -15 + bodyBob, 1.5);

    g.fillStyle(accentColor, 1);
    g.beginPath();
    g.moveTo(0, -18 + bodyBob);
    g.lineTo(4 * faceDirection, -28 + bodyBob);
    g.lineTo(8 * faceDirection, -18 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-2, -6 + bodyBob, 4, 4);
  }

  static drawTier2(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {

    const walkCycle = bounceTime * 4.5;
    const leftLegAngle = Math.sin(walkCycle) * 0.28;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.28;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 2.5;
    const armSwing = Math.sin(walkCycle) * 0.18;
    const runeGlow = 0.5 + Math.sin(bounceTime * 4) * 0.3;

    const armorPrimary = 0x8899AA;
    const armorSecondary = 0x667788;
    const armorHighlight = 0xAABBCC;
    const goldAccent = 0xCCAA44;
    const runeColor = 0x44AAFF;
    const capeColor = 0x8B0000;

    g.fillStyle(runeColor, 0.1 * runeGlow);
    g.fillCircle(0, 0, 38);

    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 32, 12);

    g.fillStyle(capeColor, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -8 + bodyBob);
    g.lineTo(-26 * faceDirection, 26 + Math.sin(bounceTime * 2.5) * 4);
    g.lineTo(-18 * faceDirection, 28 + Math.sin(bounceTime * 2.5 + 1) * 3);
    g.lineTo(-5 * faceDirection, 10 + bodyBob);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, goldAccent, 1);
    g.strokePath();

    g.fillStyle(goldAccent, 1);
    g.fillCircle(-4 * faceDirection, -6 + bodyBob, 3);

    g.save();
    g.translateCanvas(-7, 14 + bodyBob);
    g.rotateCanvas(leftLegAngle);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, 0, 8, 11);
    g.fillStyle(goldAccent, 0.8);
    g.fillRect(-2, 2, 1, 7);

    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 11, 5);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 11, 2);

    g.fillStyle(armorPrimary, 1);
    g.fillRect(-4, 11, 8, 12);
    g.fillStyle(runeColor, runeGlow * 0.6);
    g.fillRect(-1, 14, 2, 6);

    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(2 * faceDirection, 24, 7, 5);
    g.restore();

    g.save();
    g.translateCanvas(7, 14 + bodyBob);
    g.rotateCanvas(rightLegAngle);
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, 0, 8, 11);
    g.fillStyle(goldAccent, 0.8);
    g.fillRect(1, 2, 1, 7);
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 11, 5);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 11, 2);
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-4, 11, 8, 12);
    g.fillStyle(runeColor, runeGlow * 0.6);
    g.fillRect(-1, 14, 2, 6);
    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(2 * faceDirection, 24, 7, 5);
    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 26, 20);

    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(3 * faceDirection, -3 + bodyBob, 16, 12);

    g.lineStyle(1, goldAccent, 1);
    g.strokeEllipse(3 * faceDirection, -3 + bodyBob, 16, 12);

    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(0, -10 + bodyBob);
    g.lineTo(-4, 2 + bodyBob);
    g.lineTo(4, 2 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(0, -4 + bodyBob, 3);

    g.fillStyle(0x4A3A2A, 1);
    g.fillRect(-14, 10 + bodyBob, 28, 5);
    g.fillStyle(goldAccent, 1);
    g.fillRect(-14, 10 + bodyBob, 28, 1);
    g.fillRect(-14, 14 + bodyBob, 28, 1);

    g.fillCircle(0, 12 + bodyBob, 4);
    g.fillStyle(runeColor, runeGlow * 0.8);
    g.fillCircle(0, 12 + bodyBob, 2);

    const shieldX = -16 * faceDirection;
    g.fillStyle(armorSecondary, 1);
    g.beginPath();
    g.moveTo(shieldX, -16 + bodyBob);
    g.lineTo(shieldX - 12 * faceDirection, -4 + bodyBob);
    g.lineTo(shieldX - 12 * faceDirection, 8 + bodyBob);
    g.lineTo(shieldX, 18 + bodyBob);
    g.lineTo(shieldX + 8 * faceDirection, 8 + bodyBob);
    g.lineTo(shieldX + 8 * faceDirection, -4 + bodyBob);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, goldAccent, 1);
    g.strokePath();

    g.fillStyle(capeColor, 1);
    g.fillCircle(shieldX - 2 * faceDirection, 0 + bodyBob, 8);
    g.fillStyle(goldAccent, 1);

    g.beginPath();
    g.moveTo(shieldX - 2 * faceDirection, -6 + bodyBob);
    g.lineTo(shieldX + 4 * faceDirection, 4 + bodyBob);
    g.lineTo(shieldX - 8 * faceDirection, 4 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(shieldX - 4 * faceDirection, 0 + bodyBob, 2);
    g.fillCircle(shieldX + 0 * faceDirection, 0 + bodyBob, 2);

    const swordArmX = 18 * faceDirection;
    g.save();
    g.translateCanvas(swordArmX, -4 + bodyBob);
    g.rotateCanvas(armSwing * faceDirection);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, -6, 10, 8);
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(-5, -6);
    g.lineTo(-9, -12);
    g.lineTo(-3, -8);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(5, -6);
    g.lineTo(9, -12);
    g.lineTo(3, -8);
    g.closePath();
    g.fillPath();

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);

    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 6, 4);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);

    g.fillStyle(0x2A1A0A, 1);
    g.fillRect(-2, 16, 4, 10);

    g.fillStyle(goldAccent, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-2, 17 + i * 2, 4, 1);
    }

    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 28, 4);
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(0, 28, 2);

    g.fillStyle(goldAccent, 1);
    g.fillRect(-8, 13, 16, 4);
    g.beginPath();
    g.moveTo(-8, 15);
    g.lineTo(-12, 11);
    g.lineTo(-8, 13);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(8, 15);
    g.lineTo(12, 11);
    g.lineTo(8, 13);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x8899AA, 1);
    g.fillRect(-3, -24, 6, 37);
    g.fillStyle(0xAABBCC, 1);
    g.fillRect(-1, -24, 2, 37);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-1, -20, 2, 28);

    g.fillStyle(runeColor, runeGlow * 0.5);
    g.fillRect(-1, -18, 2, 24);

    g.fillStyle(0xCCDDEE, 1);
    g.beginPath();
    g.moveTo(-3, -24);
    g.lineTo(0, -34);
    g.lineTo(3, -24);
    g.closePath();
    g.fillPath();

    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(-14 * faceDirection, -8 + bodyBob, 9, 7);
    g.fillStyle(goldAccent, 1);
    g.fillEllipse(-14 * faceDirection, -10 + bodyBob, 4, 3);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(5 * faceDirection, -16 + bodyBob, 14, 13);

    g.fillStyle(armorSecondary, 1);
    g.beginPath();
    g.moveTo(8 * faceDirection, -22 + bodyBob);
    g.lineTo(18 * faceDirection, -16 + bodyBob);
    g.lineTo(16 * faceDirection, -8 + bodyBob);
    g.lineTo(6 * faceDirection, -6 + bodyBob);
    g.lineTo(4 * faceDirection, -18 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x1A1A1A, 1);
    g.fillEllipse(10 * faceDirection, -16 + bodyBob, 4, 2);
    g.fillEllipse(14 * faceDirection, -14 + bodyBob, 3, 2);

    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(10 * faceDirection, -16 + bodyBob, 2);
    g.fillCircle(14 * faceDirection, -14 + bodyBob, 1.5);

    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -22 + bodyBob);
    g.lineTo(4 * faceDirection, -38 + bodyBob);
    g.lineTo(10 * faceDirection, -22 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(capeColor, 1);
    g.fillCircle(4 * faceDirection, -30 + bodyBob, 3);
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(4 * faceDirection, -30 + bodyBob, 1.5);

    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(-4 * faceDirection, -18 + bodyBob);
    g.lineTo(-10 * faceDirection, -28 + bodyBob);
    g.lineTo(-2 * faceDirection, -20 + bodyBob);
    g.closePath();
    g.fillPath();
  }

  static drawTier3(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {

    const walkCycle = bounceTime * 4;
    const leftLegAngle = Math.sin(walkCycle) * 0.25;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.25;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 3;
    const leftArmSwing = Math.sin(walkCycle) * 0.15;
    const rightArmSwing = Math.sin(walkCycle + Math.PI * 0.5) * 0.15;

    const flameFlicker = 0.6 + Math.sin(bounceTime * 10) * 0.4;
    const flameWave = Math.sin(bounceTime * 8);

    const armorPrimary = 0x2A2A2A;
    const armorSecondary = 0x1A1A1A;
    const armorHighlight = 0x3A3A3A;
    const goldAccent = 0xFFD700;
    const flameOrange = 0xFF6600;
    const flameYellow = 0xFFAA00;
    const flameCore = 0xFFFF66;

    g.fillStyle(flameOrange, 0.15 * flameFlicker);
    g.fillCircle(0, 0, 48);
    g.fillStyle(flameYellow, 0.1 * flameFlicker);
    g.fillCircle(0, 0, 42);

    for (let i = 0; i < 8; i++) {
      const angle = bounceTime * 1.5 + i * (Math.PI / 4);
      const dist = 32 + Math.sin(bounceTime * 3 + i) * 10;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist * 0.6 - 5;
      const emberSize = 2 + Math.sin(bounceTime * 6 + i * 2) * 1;
      g.fillStyle(flameOrange, 0.7 * flameFlicker);
      g.fillCircle(ex, ey, emberSize);
      g.fillStyle(flameYellow, 0.5 * flameFlicker);
      g.fillCircle(ex, ey - 2, emberSize * 0.6);
    }

    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(0, 32, 36, 14);

    g.fillStyle(0x1A0A0A, 1);
    g.beginPath();
    g.moveTo(-10 * faceDirection, -10 + bodyBob);
    g.lineTo(-32 * faceDirection, 30 + Math.sin(bounceTime * 2) * 5);
    g.lineTo(-22 * faceDirection, 32 + Math.sin(bounceTime * 2 + 0.5) * 4);
    g.lineTo(-6 * faceDirection, 12 + bodyBob);
    g.closePath();
    g.fillPath();

    for (let i = 0; i < 6; i++) {
      const fx = (-32 + i * 2) * faceDirection;
      const fy = 30 + Math.sin(bounceTime * 8 + i) * 4;
      g.fillStyle(flameOrange, 0.8 * flameFlicker);
      g.fillCircle(fx, fy, 4);
      g.fillStyle(flameYellow, 0.6 * flameFlicker);
      g.fillCircle(fx, fy - 3, 3);
      g.fillStyle(flameCore, 0.4 * flameFlicker);
      g.fillCircle(fx, fy - 5, 2);
    }

    g.lineStyle(2, goldAccent, 0.8);
    g.beginPath();
    g.moveTo(-10 * faceDirection, -10 + bodyBob);
    g.lineTo(-6 * faceDirection, 12 + bodyBob);
    g.strokePath();

    g.save();
    g.translateCanvas(-8, 16 + bodyBob);
    g.rotateCanvas(leftLegAngle);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-5, 0, 10, 12);
    g.fillStyle(goldAccent, 0.9);
    g.fillRect(-3, 2, 1, 8);
    g.fillRect(2, 2, 1, 8);

    g.fillStyle(flameOrange, 0.5 * flameFlicker);
    g.fillRect(-1, 4, 2, 6);

    g.fillStyle(armorPrimary, 1);
    g.fillCircle(0, 12, 6);
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(0, 8);
    g.lineTo(-4, 16);
    g.lineTo(4, 16);
    g.closePath();
    g.fillPath();

    g.fillStyle(armorPrimary, 1);
    g.fillRect(-5, 12, 10, 14);

    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, 18, 3);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, 18, 1.5);

    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(3 * faceDirection, 28, 8, 6);

    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(8 * faceDirection, 26);
    g.lineTo(12 * faceDirection, 28);
    g.lineTo(8 * faceDirection, 30);
    g.closePath();
    g.fillPath();
    g.restore();

    g.save();
    g.translateCanvas(8, 16 + bodyBob);
    g.rotateCanvas(rightLegAngle);
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-5, 0, 10, 12);
    g.fillStyle(goldAccent, 0.9);
    g.fillRect(-3, 2, 1, 8);
    g.fillRect(2, 2, 1, 8);
    g.fillStyle(flameOrange, 0.5 * flameFlicker);
    g.fillRect(-1, 4, 2, 6);
    g.fillStyle(armorPrimary, 1);
    g.fillCircle(0, 12, 6);
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(0, 8);
    g.lineTo(-4, 16);
    g.lineTo(4, 16);
    g.closePath();
    g.fillPath();
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-5, 12, 10, 14);
    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, 18, 3);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, 18, 1.5);
    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(3 * faceDirection, 28, 8, 6);
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(8 * faceDirection, 26);
    g.lineTo(12 * faceDirection, 28);
    g.lineTo(8 * faceDirection, 30);
    g.closePath();
    g.fillPath();
    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 30, 24);

    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(4 * faceDirection, -4 + bodyBob, 18, 14);

    g.lineStyle(2, goldAccent, 1);
    g.strokeEllipse(4 * faceDirection, -4 + bodyBob, 18, 14);

    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(0, -12 + bodyBob);
    g.lineTo(-6, 0 + bodyBob);
    g.lineTo(6, 0 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, -4 + bodyBob, 5);
    g.fillStyle(flameYellow, flameFlicker * 0.8);
    g.fillCircle(0, -4 + bodyBob, 3);
    g.fillStyle(flameCore, flameFlicker * 0.6);
    g.fillCircle(0, -4 + bodyBob, 1.5);

    g.fillStyle(0x2A2A1A, 1);
    g.fillRect(-16, 12 + bodyBob, 32, 6);
    g.fillStyle(goldAccent, 1);
    g.fillRect(-16, 12 + bodyBob, 32, 2);
    g.fillRect(-16, 16 + bodyBob, 32, 2);

    g.fillCircle(0, 15 + bodyBob, 5);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 15 + bodyBob, 3);

    g.save();
    g.translateCanvas(-20 * faceDirection, -4 + bodyBob);
    g.rotateCanvas(leftArmSwing * faceDirection - 0.2);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, -8, 12, 10);
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(-6, -8);
    g.lineTo(-12, -18);
    g.lineTo(-4, -10);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(6, -8);
    g.lineTo(10, -16);
    g.lineTo(4, -10);
    g.closePath();
    g.fillPath();

    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, -14, 4);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, -17, 3);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);

    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-2, 16, 4, 10);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 28, 4);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 28, 2);
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-8, 13, 16, 4);

    g.fillStyle(0x3A3A3A, 1);
    g.fillRect(-3, -26, 6, 39);
    g.fillStyle(0x4A4A4A, 1);
    g.fillRect(-1, -26, 2, 39);

    for (let i = 0; i < 8; i++) {
      const fy = -24 + i * 5;
      const fSize = 5 + Math.sin(bounceTime * 10 + i) * 2;
      const fOff = Math.sin(bounceTime * 8 + i * 0.7) * 3;
      g.fillStyle(flameOrange, 0.8 * flameFlicker);
      g.fillCircle(fOff, fy, fSize);
      g.fillStyle(flameYellow, 0.6 * flameFlicker);
      g.fillCircle(fOff, fy - 2, fSize * 0.6);
      g.fillStyle(flameCore, 0.4 * flameFlicker);
      g.fillCircle(fOff, fy - 3, fSize * 0.3);
    }

    g.fillStyle(flameOrange, 0.9);
    g.beginPath();
    g.moveTo(-3, -26);
    g.lineTo(0, -38 - flameWave * 4);
    g.lineTo(3, -26);
    g.closePath();
    g.fillPath();
    g.fillStyle(flameYellow, 0.7);
    g.beginPath();
    g.moveTo(-2, -28);
    g.lineTo(0, -42 - flameWave * 5);
    g.lineTo(2, -28);
    g.closePath();
    g.fillPath();

    g.restore();

    g.save();
    g.translateCanvas(24 * faceDirection, -6 + bodyBob);
    g.rotateCanvas(rightArmSwing * faceDirection + 0.2);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, -8, 12, 10);
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(-6, -8);
    g.lineTo(-10, -16);
    g.lineTo(-4, -10);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(6, -8);
    g.lineTo(12, -18);
    g.lineTo(4, -10);
    g.closePath();
    g.fillPath();
    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, -14, 4);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, -17, 3);

    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);

    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-2, 16, 4, 12);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 30, 5);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 30, 3);
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-10, 13, 20, 4);

    g.beginPath();
    g.moveTo(-10, 15);
    g.lineTo(-14, 10);
    g.lineTo(-10, 13);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(10, 15);
    g.lineTo(14, 10);
    g.lineTo(10, 13);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x3A3A3A, 1);
    g.fillRect(-3, -30, 6, 43);
    g.fillStyle(0x4A4A4A, 1);
    g.fillRect(-1, -30, 2, 43);

    for (let i = 0; i < 9; i++) {
      const fy = -28 + i * 5;
      const fSize = 6 + Math.sin(bounceTime * 9 + i * 1.2) * 2;
      const fOff = Math.sin(bounceTime * 7 + i * 0.8) * 4;
      g.fillStyle(flameOrange, 0.8 * flameFlicker);
      g.fillCircle(fOff, fy, fSize);
      g.fillStyle(flameYellow, 0.6 * flameFlicker);
      g.fillCircle(fOff, fy - 2, fSize * 0.6);
      g.fillStyle(flameCore, 0.4 * flameFlicker);
      g.fillCircle(fOff, fy - 3, fSize * 0.3);
    }

    g.fillStyle(flameOrange, 0.9);
    g.beginPath();
    g.moveTo(-3, -30);
    g.lineTo(0, -44 - flameWave * 5);
    g.lineTo(3, -30);
    g.closePath();
    g.fillPath();
    g.fillStyle(flameYellow, 0.7);
    g.beginPath();
    g.moveTo(-2, -32);
    g.lineTo(0, -48 - flameWave * 6);
    g.lineTo(2, -32);
    g.closePath();
    g.fillPath();
    g.fillStyle(flameCore, 0.5);
    g.fillCircle(0, -50 - flameWave * 6, 3);

    g.restore();

    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(6 * faceDirection, -18 + bodyBob, 16, 15);

    g.fillStyle(armorSecondary, 1);
    g.beginPath();
    g.moveTo(10 * faceDirection, -28 + bodyBob);
    g.lineTo(22 * faceDirection, -18 + bodyBob);
    g.lineTo(20 * faceDirection, -6 + bodyBob);
    g.lineTo(6 * faceDirection, -4 + bodyBob);
    g.lineTo(2 * faceDirection, -20 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xDDDDCC, 1);
    for (let i = 0; i < 4; i++) {
      const tx = (8 + i * 3) * faceDirection;
      g.beginPath();
      g.moveTo(tx, -8 + bodyBob);
      g.lineTo(tx + 1 * faceDirection, -4 + bodyBob);
      g.lineTo(tx + 2 * faceDirection, -8 + bodyBob);
      g.closePath();
      g.fillPath();
    }

    g.fillStyle(0x0A0A0A, 1);
    g.fillEllipse(12 * faceDirection, -18 + bodyBob, 5, 3);
    g.fillEllipse(18 * faceDirection, -16 + bodyBob, 4, 3);

    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(12 * faceDirection, -18 + bodyBob, 3);
    g.fillCircle(18 * faceDirection, -16 + bodyBob, 2.5);
    g.fillStyle(flameYellow, flameFlicker * 0.8);
    g.fillCircle(12 * faceDirection, -18 + bodyBob, 1.5);
    g.fillCircle(18 * faceDirection, -16 + bodyBob, 1.2);

    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -26 + bodyBob);
    g.lineTo(8 * faceDirection, -48 + bodyBob);
    g.lineTo(14 * faceDirection, -26 + bodyBob);
    g.closePath();
    g.fillPath();
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(6 * faceDirection, -30 + bodyBob);
    g.lineTo(8 * faceDirection, -44 + bodyBob);
    g.lineTo(10 * faceDirection, -30 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(-4 * faceDirection, -22 + bodyBob);
    g.lineTo(-12 * faceDirection, -40 + bodyBob);
    g.lineTo(0 * faceDirection, -24 + bodyBob);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(16 * faceDirection, -24 + bodyBob);
    g.lineTo(24 * faceDirection, -38 + bodyBob);
    g.lineTo(18 * faceDirection, -22 + bodyBob);
    g.closePath();
    g.fillPath();

    g.fillStyle(flameOrange, flameFlicker * 0.9);
    g.fillCircle(8 * faceDirection, -50 + bodyBob + flameWave * 3, 5);
    g.fillCircle(-12 * faceDirection, -42 + bodyBob + flameWave * 2, 4);
    g.fillCircle(24 * faceDirection, -40 + bodyBob + flameWave * 2, 4);
    g.fillStyle(flameYellow, flameFlicker * 0.7);
    g.fillCircle(8 * faceDirection, -54 + bodyBob + flameWave * 4, 4);
    g.fillCircle(-12 * faceDirection, -46 + bodyBob + flameWave * 3, 3);
    g.fillCircle(24 * faceDirection, -44 + bodyBob + flameWave * 3, 3);
    g.fillStyle(flameCore, flameFlicker * 0.5);
    g.fillCircle(8 * faceDirection, -58 + bodyBob + flameWave * 5, 3);
  }
}
