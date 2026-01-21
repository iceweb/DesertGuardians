import Phaser from 'phaser';
import type { BossRenderer } from './BossRenderer';

/**
 * Renderer for Boss 5 (undead dragon - final boss)
 */
export class Boss5Renderer implements BossRenderer {
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean
  ): void {
    const hover = Math.sin(bounceTime * 2) * 3;
    const wingFlap = Math.sin(bounceTime * 3) * 0.4;
    const breathe = 1 + Math.sin(bounceTime * 2) * 0.03;
    const fireFlicker = Math.sin(bounceTime * 12) * 0.3 + 0.7;
    const painShake = isPained ? Math.sin(bounceTime * 25) * 3 : 0;

    // Color palette
    const scalesDark = 0x1a0a0a;
    const scalesMid = 0x2a1515;
    const scalesLight = 0x3a2020;
    const underbelly = 0x4a3030;
    const eyeGlow = 0xff2200;
    const fireCore = 0xff6600;
    const boneColor = 0xccbbaa;
    const scarColor = 0x550000;

    // Death aura
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(painShake, hover, 75 * breathe);
    g.fillStyle(scalesDark, 0.15);
    g.fillCircle(painShake, hover, 60 * breathe);

    if (isPained) {
      g.fillStyle(0xff0000, 0.15 * fireFlicker);
      g.fillCircle(painShake, hover, 70);
    }

    // Shadow
    g.fillStyle(0x000000, 0.6);
    g.fillEllipse(0, 42, 70, 20);

    // Tail
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

    // Tail bone spikes
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

    // Tail tip blade
    g.fillStyle(boneColor, 1);
    g.beginPath();
    g.moveTo(-68 * faceDirection, 8 + hover);
    g.lineTo(-82 * faceDirection, 2 + hover);
    g.lineTo(-80 * faceDirection, 12 + hover);
    g.closePath();
    g.fillPath();

    const wingAngle = wingFlap * 45;

    // Wings (skeletal membrane)
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

    // Wing membrane (torn/decayed)
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

    // Wing bones
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

    // Wing tips (bone joints)
    g.fillStyle(boneColor, 1);
    g.fillCircle(-55, -44 + hover + wingAngle, 4);
    g.fillCircle(55, -44 + hover + wingAngle, 4);

    // Wing tip claws
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

    // Wing holes (decay)
    g.fillStyle(0x000000, 0.8);
    for (let i = 0; i < 3; i++) {
      const holeX = -45 + i * 8;
      const holeY = -15 + hover + wingAngle * 0.4 + i * 5;
      g.fillCircle(holeX, holeY, 3 + Math.random());
    }

    // Body
    g.fillStyle(scalesMid, 1);
    g.fillEllipse(painShake, 5 + hover, 48 * breathe, 40 * breathe);

    // Body scales overlay
    g.fillStyle(scalesDark, 1);
    g.fillEllipse(painShake - 5, -8 + hover, 35, 25);
    g.fillEllipse(painShake + 5, 2 + hover, 38, 28);

    // Battle scars
    g.lineStyle(2, scarColor, 0.8);
    g.beginPath();
    g.moveTo(-15 + painShake, -5 + hover);
    g.lineTo(10 + painShake, 15 + hover);
    g.strokePath();
    g.beginPath();
    g.moveTo(8 + painShake, -10 + hover);
    g.lineTo(-5 + painShake, 8 + hover);
    g.strokePath();

    // Underbelly
    g.fillStyle(underbelly, 1);
    g.fillEllipse(painShake, 18 + hover, 30, 20);

    // Belly segments
    g.lineStyle(1, scalesDark, 0.6);
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(-15 + painShake, 10 + i * 4 + hover);
      g.lineTo(15 + painShake, 10 + i * 4 + hover);
      g.strokePath();
    }

    // Spine (exposed bones)
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

    // Spine base
    g.fillStyle(scalesDark, 1);
    g.fillRect(-18 + painShake, -22 + hover, 36, 5);

    // Legs
    g.fillStyle(scalesMid, 1);
    g.fillEllipse(-20 + painShake, 28 + hover, 16, 20);
    g.fillEllipse(20 + painShake, 28 + hover, 16, 20);
    g.fillEllipse(-30 + painShake, 12 + hover, 14, 16);
    g.fillEllipse(30 + painShake, 12 + hover, 14, 16);

    // Feet
    g.fillStyle(scalesDark, 1);
    g.fillEllipse(-20, 42, 16, 8);
    g.fillEllipse(20, 42, 16, 8);

    // Claws
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

    // Neck
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

    // Neck vertebrae
    g.fillStyle(scalesDark, 1);
    for (let i = 0; i < 4; i++) {
      const nx = (15 + i * 6) * faceDirection;
      const ny = -14 - i * 4 + hover;
      g.fillCircle(nx, ny, 5 - i * 0.5);
    }

    // Head
    g.fillStyle(scalesMid, 1);
    g.fillEllipse(42 * faceDirection, -30 + hover, 24, 22);

    // Snout
    g.fillStyle(scalesLight, 1);
    g.beginPath();
    g.moveTo(48 * faceDirection, -38 + hover);
    g.lineTo(68 * faceDirection, -32 + hover);
    g.lineTo(72 * faceDirection, -28 + hover);
    g.lineTo(68 * faceDirection, -22 + hover);
    g.lineTo(48 * faceDirection, -18 + hover);
    g.closePath();
    g.fillPath();

    // Head crest
    g.fillStyle(scalesDark, 1);
    g.beginPath();
    g.moveTo(30 * faceDirection, -42 + hover);
    g.lineTo(52 * faceDirection, -44 + hover);
    g.lineTo(56 * faceDirection, -38 + hover);
    g.lineTo(50 * faceDirection, -36 + hover);
    g.lineTo(32 * faceDirection, -38 + hover);
    g.closePath();
    g.fillPath();

    // Horns (broken/worn)
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

    // Horn tips (chipped)
    g.fillStyle(0x998877, 1);
    g.fillCircle(8 * faceDirection, -70 + hover, 3);
    g.fillCircle(55 * faceDirection, -60 + hover, 2);

    // Eye socket
    g.fillStyle(0x000000, 1);
    g.fillEllipse(44 * faceDirection, -34 + hover, 9, 10);

    // Eye
    g.fillStyle(eyeGlow, 1);
    g.fillEllipse(44 * faceDirection, -34 + hover, 7, 8);

    // Pupil
    g.fillStyle(0x000000, 1);
    g.fillEllipse(45 * faceDirection, -34 + hover, 2, 7);

    // Eye highlight
    g.fillStyle(0xffaa00, 0.6);
    g.fillCircle(42 * faceDirection, -36 + hover, 2);

    // Second eye (smaller, scarred)
    g.fillStyle(eyeGlow, 0.5);
    g.fillEllipse(36 * faceDirection, -32 + hover, 4, 5);
    g.fillStyle(0x000000, 0.8);
    g.fillEllipse(36 * faceDirection, -32 + hover, 1, 4);

    // Nostrils
    g.fillStyle(0x000000, 1);
    g.fillCircle(66 * faceDirection, -30 + hover, 4);
    g.fillCircle(64 * faceDirection, -24 + hover, 3);

    // Nostril smoke
    g.fillStyle(0x333333, 0.4 * fireFlicker);
    g.fillCircle(70 * faceDirection, -34 + hover, 5);
    g.fillStyle(0x222222, 0.3 * fireFlicker);
    g.fillCircle(73 * faceDirection, -38 + hover, 4);

    // Jaw
    g.fillStyle(scalesLight, 1);
    g.beginPath();
    g.moveTo(50 * faceDirection, -20 + hover);
    g.lineTo(70 * faceDirection, -18 + hover);
    g.lineTo(68 * faceDirection, -10 + hover);
    g.lineTo(48 * faceDirection, -12 + hover);
    g.closePath();
    g.fillPath();

    // Mouth interior
    g.fillStyle(0x110000, 1);
    g.fillEllipse(58 * faceDirection, -14 + hover, 12, 6);
    g.fillStyle(fireCore, 0.5 * fireFlicker);
    g.fillEllipse(58 * faceDirection, -14 + hover, 8, 4);

    // Teeth
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

    // Small teeth
    g.fillRect(68 * faceDirection, -18 + hover, 2, 5);
    g.fillRect(48 * faceDirection, -19 + hover, 2, 4);

    // Lower jaw teeth
    g.beginPath();
    g.moveTo(55 * faceDirection, -10 + hover);
    g.lineTo(57 * faceDirection, -18 + hover);
    g.lineTo(59 * faceDirection, -10 + hover);
    g.closePath();
    g.fillPath();

    // Fire breath when pained
    if (isPained) {
      g.fillStyle(fireCore, 0.9 * fireFlicker);
      g.fillEllipse(75 * faceDirection, -14 + hover, 15, 10);
      g.fillStyle(0xffaa00, 0.7 * fireFlicker);
      g.fillEllipse(88 * faceDirection, -14 + hover, 12, 8);
      g.fillStyle(0xffff66, 0.5 * fireFlicker);
      g.fillCircle(98 * faceDirection, -14 + hover, 6);
    }

    // Floating embers
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
}
