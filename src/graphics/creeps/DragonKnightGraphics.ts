import Phaser from 'phaser';

/**
 * DragonKnightGraphics - Dedicated graphics for boss guard dragon knights
 * Medieval armored knights that escort the dragon bosses
 * Each tier is progressively more impressive with better armor and effects
 */
export class DragonKnightGraphics {
  /**
   * Draw a dragon knight based on tier (1, 2, or 3)
   */
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

  /**
   * Tier 1: Drake Knight - Bronze armor, single sword, modest design
   * Accompanies Boss 3 (Drake Champion)
   */
  static drawTier1(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    // Walking animation - legs alternate
    const walkCycle = bounceTime * 5;
    const leftLegAngle = Math.sin(walkCycle) * 0.3;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.3;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 2;
    const armSwing = Math.sin(walkCycle) * 0.2;
    
    // Armor colors - bronze/green theme
    const armorPrimary = 0x8B7355;   // Bronze
    const armorSecondary = 0x6B5344; // Dark bronze
    const armorHighlight = 0xA89070; // Light bronze
    const accentColor = 0x4A7C59;    // Forest green
    const capeColor = 0x2D4A3E;      // Dark green
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 28, 28, 10);
    
    // Cape flowing behind
    g.fillStyle(capeColor, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -6 + bodyBob);
    g.lineTo(-20 * faceDirection, 22 + Math.sin(bounceTime * 3) * 3);
    g.lineTo(-14 * faceDirection, 24 + Math.sin(bounceTime * 3 + 1) * 2);
    g.lineTo(-4 * faceDirection, 8 + bodyBob);
    g.closePath();
    g.fillPath();
    // Cape trim
    g.lineStyle(1, accentColor, 0.8);
    g.strokePath();
    
    // LEFT LEG with walking animation
    g.save();
    g.translateCanvas(-6, 12 + bodyBob);
    g.rotateCanvas(leftLegAngle);
    // Thigh armor
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, 0, 6, 10);
    // Knee guard
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 10, 4);
    // Shin armor
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-3, 10, 6, 10);
    // Boot
    g.fillStyle(0x3A3A3A, 1);
    g.fillEllipse(2 * faceDirection, 22, 6, 4);
    g.restore();
    
    // RIGHT LEG with walking animation
    g.save();
    g.translateCanvas(6, 12 + bodyBob);
    g.rotateCanvas(rightLegAngle);
    // Thigh armor
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, 0, 6, 10);
    // Knee guard
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 10, 4);
    // Shin armor
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-3, 10, 6, 10);
    // Boot
    g.fillStyle(0x3A3A3A, 1);
    g.fillEllipse(2 * faceDirection, 22, 6, 4);
    g.restore();
    
    // BODY - Plate armor torso
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 22, 18);
    
    // Chest plate with ridge
    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(2 * faceDirection, -2 + bodyBob, 14, 10);
    // Center ridge
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-1, -8 + bodyBob, 2, 14);
    
    // Belt with dragon buckle
    g.fillStyle(0x4A3A2A, 1);
    g.fillRect(-12, 8 + bodyBob, 24, 4);
    g.fillStyle(accentColor, 1);
    g.fillCircle(0, 10 + bodyBob, 3);
    
    // SHIELD on back arm side
    const shieldX = -14 * faceDirection;
    g.fillStyle(0x5A4A3A, 1);
    g.beginPath();
    g.moveTo(shieldX, -12 + bodyBob);
    g.lineTo(shieldX - 8 * faceDirection, -2 + bodyBob);
    g.lineTo(shieldX, 14 + bodyBob);
    g.lineTo(shieldX + 6 * faceDirection, -2 + bodyBob);
    g.closePath();
    g.fillPath();
    // Shield border
    g.lineStyle(2, armorHighlight, 1);
    g.strokePath();
    // Dragon emblem
    g.fillStyle(accentColor, 1);
    g.fillCircle(shieldX - 1 * faceDirection, 0 + bodyBob, 5);
    g.fillStyle(0x6A9C69, 1);
    g.beginPath();
    g.moveTo(shieldX - 1 * faceDirection, -4 + bodyBob);
    g.lineTo(shieldX + 3 * faceDirection, 2 + bodyBob);
    g.lineTo(shieldX - 5 * faceDirection, 2 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // SWORD ARM with swing animation
    const swordArmX = 16 * faceDirection;
    g.save();
    g.translateCanvas(swordArmX, -2 + bodyBob);
    g.rotateCanvas(armSwing * faceDirection);
    
    // Shoulder pauldron
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, -4, 8, 6);
    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(0, -6, 6, 4);
    
    // Arm
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-3, -2, 6, 12);
    
    // Gauntlet
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 12, 5, 4);
    
    // SWORD
    // Handle
    g.fillStyle(0x3A2A1A, 1);
    g.fillRect(-2, 14, 4, 8);
    // Pommel
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 23, 3);
    // Guard
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-6, 12, 12, 3);
    // Blade
    g.fillStyle(0x9999AA, 1);
    g.fillRect(-2, -18, 4, 30);
    g.fillStyle(0xBBBBCC, 1);
    g.fillRect(-1, -18, 2, 30);
    // Blade tip
    g.fillStyle(0xCCCCDD, 1);
    g.beginPath();
    g.moveTo(-2, -18);
    g.lineTo(0, -26);
    g.lineTo(2, -18);
    g.closePath();
    g.fillPath();
    
    g.restore();
    
    // Back shoulder pauldron
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(-12 * faceDirection, -6 + bodyBob, 7, 5);
    
    // HELMET - Medieval great helm style
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(4 * faceDirection, -14 + bodyBob, 12, 11);
    
    // Face plate
    g.fillStyle(armorSecondary, 1);
    g.fillRect(6 * faceDirection, -18 + bodyBob, 8, 10);
    
    // Eye slit (T-shaped visor)
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(8 * faceDirection, -16 + bodyBob, 6, 2);
    g.fillRect(10 * faceDirection, -16 + bodyBob, 2, 6);
    
    // Eyes glowing behind visor
    g.fillStyle(0x66AA66, 0.8);
    g.fillCircle(9 * faceDirection, -15 + bodyBob, 1.5);
    g.fillCircle(12 * faceDirection, -15 + bodyBob, 1.5);
    
    // Helmet crest - small dragon fin
    g.fillStyle(accentColor, 1);
    g.beginPath();
    g.moveTo(0, -18 + bodyBob);
    g.lineTo(4 * faceDirection, -28 + bodyBob);
    g.lineTo(8 * faceDirection, -18 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // Neck guard
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-2, -6 + bodyBob, 4, 4);
  }

  /**
   * Tier 2: Dragon Knight - Silver armor, ornate design, glowing runes
   * Accompanies Boss 4 (Young Dragon)
   */
  static drawTier2(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    // Walking animation
    const walkCycle = bounceTime * 4.5;
    const leftLegAngle = Math.sin(walkCycle) * 0.28;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.28;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 2.5;
    const armSwing = Math.sin(walkCycle) * 0.18;
    const runeGlow = 0.5 + Math.sin(bounceTime * 4) * 0.3;
    
    // Armor colors - silver/gold theme
    const armorPrimary = 0x8899AA;   // Silver
    const armorSecondary = 0x667788; // Dark silver
    const armorHighlight = 0xAABBCC; // Bright silver
    const goldAccent = 0xCCAA44;     // Gold trim
    const runeColor = 0x44AAFF;      // Blue rune glow
    const capeColor = 0x8B0000;      // Dark red
    
    // Aura effect
    g.fillStyle(runeColor, 0.1 * runeGlow);
    g.fillCircle(0, 0, 38);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 32, 12);
    
    // Cape - larger and more ornate
    g.fillStyle(capeColor, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -8 + bodyBob);
    g.lineTo(-26 * faceDirection, 26 + Math.sin(bounceTime * 2.5) * 4);
    g.lineTo(-18 * faceDirection, 28 + Math.sin(bounceTime * 2.5 + 1) * 3);
    g.lineTo(-5 * faceDirection, 10 + bodyBob);
    g.closePath();
    g.fillPath();
    // Gold trim on cape
    g.lineStyle(2, goldAccent, 1);
    g.strokePath();
    // Cape clasp
    g.fillStyle(goldAccent, 1);
    g.fillCircle(-4 * faceDirection, -6 + bodyBob, 3);
    
    // LEFT LEG
    g.save();
    g.translateCanvas(-7, 14 + bodyBob);
    g.rotateCanvas(leftLegAngle);
    // Ornate thigh armor
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, 0, 8, 11);
    g.fillStyle(goldAccent, 0.8);
    g.fillRect(-2, 2, 1, 7); // Gold stripe
    // Knee guard with dragon motif
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 11, 5);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 11, 2);
    // Shin armor with rune
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-4, 11, 8, 12);
    g.fillStyle(runeColor, runeGlow * 0.6);
    g.fillRect(-1, 14, 2, 6); // Glowing rune
    // Armored boot
    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(2 * faceDirection, 24, 7, 5);
    g.restore();
    
    // RIGHT LEG
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
    
    // BODY - Ornate plate armor
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 26, 20);
    
    // Segmented chest plate
    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(3 * faceDirection, -3 + bodyBob, 16, 12);
    // Gold trim lines
    g.lineStyle(1, goldAccent, 1);
    g.strokeEllipse(3 * faceDirection, -3 + bodyBob, 16, 12);
    // Center crest
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(0, -10 + bodyBob);
    g.lineTo(-4, 2 + bodyBob);
    g.lineTo(4, 2 + bodyBob);
    g.closePath();
    g.fillPath();
    // Glowing rune on chest
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(0, -4 + bodyBob, 3);
    
    // Ornate belt
    g.fillStyle(0x4A3A2A, 1);
    g.fillRect(-14, 10 + bodyBob, 28, 5);
    g.fillStyle(goldAccent, 1);
    g.fillRect(-14, 10 + bodyBob, 28, 1);
    g.fillRect(-14, 14 + bodyBob, 28, 1);
    // Dragon buckle
    g.fillCircle(0, 12 + bodyBob, 4);
    g.fillStyle(runeColor, runeGlow * 0.8);
    g.fillCircle(0, 12 + bodyBob, 2);
    
    // TOWER SHIELD - Large and ornate
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
    // Shield border - gold
    g.lineStyle(3, goldAccent, 1);
    g.strokePath();
    // Dragon head emblem
    g.fillStyle(capeColor, 1);
    g.fillCircle(shieldX - 2 * faceDirection, 0 + bodyBob, 8);
    g.fillStyle(goldAccent, 1);
    // Dragon face on shield
    g.beginPath();
    g.moveTo(shieldX - 2 * faceDirection, -6 + bodyBob);
    g.lineTo(shieldX + 4 * faceDirection, 4 + bodyBob);
    g.lineTo(shieldX - 8 * faceDirection, 4 + bodyBob);
    g.closePath();
    g.fillPath();
    // Dragon eyes
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(shieldX - 4 * faceDirection, 0 + bodyBob, 2);
    g.fillCircle(shieldX + 0 * faceDirection, 0 + bodyBob, 2);
    
    // SWORD ARM
    const swordArmX = 18 * faceDirection;
    g.save();
    g.translateCanvas(swordArmX, -4 + bodyBob);
    g.rotateCanvas(armSwing * faceDirection);
    
    // Large pauldron with dragon wings
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
    
    // Arm armor
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);
    // Elbow guard
    g.fillStyle(armorHighlight, 1);
    g.fillCircle(0, 6, 4);
    
    // Gauntlet
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);
    
    // LONGSWORD - larger and more ornate
    // Handle
    g.fillStyle(0x2A1A0A, 1);
    g.fillRect(-2, 16, 4, 10);
    // Wire wrap
    g.fillStyle(goldAccent, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-2, 17 + i * 2, 4, 1);
    }
    // Pommel - dragon head
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 28, 4);
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(0, 28, 2);
    // Guard - dragon wings
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
    // Blade
    g.fillStyle(0x8899AA, 1);
    g.fillRect(-3, -24, 6, 37);
    g.fillStyle(0xAABBCC, 1);
    g.fillRect(-1, -24, 2, 37);
    // Fuller (blood groove)
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-1, -20, 2, 28);
    // Blade rune glow
    g.fillStyle(runeColor, runeGlow * 0.5);
    g.fillRect(-1, -18, 2, 24);
    // Blade tip
    g.fillStyle(0xCCDDEE, 1);
    g.beginPath();
    g.moveTo(-3, -24);
    g.lineTo(0, -34);
    g.lineTo(3, -24);
    g.closePath();
    g.fillPath();
    
    g.restore();
    
    // Back pauldron
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(-14 * faceDirection, -8 + bodyBob, 9, 7);
    g.fillStyle(goldAccent, 1);
    g.fillEllipse(-14 * faceDirection, -10 + bodyBob, 4, 3);
    
    // HELMET - Dragon-crested great helm
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(5 * faceDirection, -16 + bodyBob, 14, 13);
    
    // Face plate with dragon snout
    g.fillStyle(armorSecondary, 1);
    g.beginPath();
    g.moveTo(8 * faceDirection, -22 + bodyBob);
    g.lineTo(18 * faceDirection, -16 + bodyBob);
    g.lineTo(16 * faceDirection, -8 + bodyBob);
    g.lineTo(6 * faceDirection, -6 + bodyBob);
    g.lineTo(4 * faceDirection, -18 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // Visor slits (dragon eyes)
    g.fillStyle(0x1A1A1A, 1);
    g.fillEllipse(10 * faceDirection, -16 + bodyBob, 4, 2);
    g.fillEllipse(14 * faceDirection, -14 + bodyBob, 3, 2);
    // Glowing eyes
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(10 * faceDirection, -16 + bodyBob, 2);
    g.fillCircle(14 * faceDirection, -14 + bodyBob, 1.5);
    
    // Dragon crest - larger and more elaborate
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -22 + bodyBob);
    g.lineTo(4 * faceDirection, -38 + bodyBob);
    g.lineTo(10 * faceDirection, -22 + bodyBob);
    g.closePath();
    g.fillPath();
    // Crest gem
    g.fillStyle(capeColor, 1);
    g.fillCircle(4 * faceDirection, -30 + bodyBob, 3);
    g.fillStyle(runeColor, runeGlow);
    g.fillCircle(4 * faceDirection, -30 + bodyBob, 1.5);
    
    // Side horns
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(-4 * faceDirection, -18 + bodyBob);
    g.lineTo(-10 * faceDirection, -28 + bodyBob);
    g.lineTo(-2 * faceDirection, -20 + bodyBob);
    g.closePath();
    g.fillPath();
  }

  /**
   * Tier 3: Flame Knight - Black/gold armor with flames, dual wielding, imposing
   * Accompanies Boss 5 (Elder Dragon Lord)
   */
  static drawTier3(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    // Walking animation - heavier, more deliberate
    const walkCycle = bounceTime * 4;
    const leftLegAngle = Math.sin(walkCycle) * 0.25;
    const rightLegAngle = Math.sin(walkCycle + Math.PI) * 0.25;
    const bodyBob = Math.abs(Math.sin(walkCycle)) * 3;
    const leftArmSwing = Math.sin(walkCycle) * 0.15;
    const rightArmSwing = Math.sin(walkCycle + Math.PI * 0.5) * 0.15;
    
    // Fire effects
    const flameFlicker = 0.6 + Math.sin(bounceTime * 10) * 0.4;
    const flameWave = Math.sin(bounceTime * 8);
    
    // Armor colors - black/gold with fire accents
    const armorPrimary = 0x2A2A2A;   // Black steel
    const armorSecondary = 0x1A1A1A; // Dark black
    const armorHighlight = 0x3A3A3A; // Lighter black
    const goldAccent = 0xFFD700;     // Bright gold
    const flameOrange = 0xFF6600;
    const flameYellow = 0xFFAA00;
    const flameCore = 0xFFFF66;
    
    // Fire aura
    g.fillStyle(flameOrange, 0.15 * flameFlicker);
    g.fillCircle(0, 0, 48);
    g.fillStyle(flameYellow, 0.1 * flameFlicker);
    g.fillCircle(0, 0, 42);
    
    // Ember particles
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
    
    // Shadow
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(0, 32, 36, 14);
    
    // BURNING CAPE
    g.fillStyle(0x1A0A0A, 1);
    g.beginPath();
    g.moveTo(-10 * faceDirection, -10 + bodyBob);
    g.lineTo(-32 * faceDirection, 30 + Math.sin(bounceTime * 2) * 5);
    g.lineTo(-22 * faceDirection, 32 + Math.sin(bounceTime * 2 + 0.5) * 4);
    g.lineTo(-6 * faceDirection, 12 + bodyBob);
    g.closePath();
    g.fillPath();
    // Flame edges on cape
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
    // Gold trim
    g.lineStyle(2, goldAccent, 0.8);
    g.beginPath();
    g.moveTo(-10 * faceDirection, -10 + bodyBob);
    g.lineTo(-6 * faceDirection, 12 + bodyBob);
    g.strokePath();
    
    // LEFT LEG
    g.save();
    g.translateCanvas(-8, 16 + bodyBob);
    g.rotateCanvas(leftLegAngle);
    // Heavy thigh armor
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-5, 0, 10, 12);
    g.fillStyle(goldAccent, 0.9);
    g.fillRect(-3, 2, 1, 8);
    g.fillRect(2, 2, 1, 8);
    // Flame etching
    g.fillStyle(flameOrange, 0.5 * flameFlicker);
    g.fillRect(-1, 4, 2, 6);
    // Knee guard - spiked
    g.fillStyle(armorPrimary, 1);
    g.fillCircle(0, 12, 6);
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(0, 8);
    g.lineTo(-4, 16);
    g.lineTo(4, 16);
    g.closePath();
    g.fillPath();
    // Shin armor
    g.fillStyle(armorPrimary, 1);
    g.fillRect(-5, 12, 10, 14);
    // Flame rune
    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, 18, 3);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, 18, 1.5);
    // Heavy boot
    g.fillStyle(armorSecondary, 1);
    g.fillEllipse(3 * faceDirection, 28, 8, 6);
    // Boot spike
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(8 * faceDirection, 26);
    g.lineTo(12 * faceDirection, 28);
    g.lineTo(8 * faceDirection, 30);
    g.closePath();
    g.fillPath();
    g.restore();
    
    // RIGHT LEG
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
    
    // BODY - Heavy black plate with gold and flame accents
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 0 + bodyBob, 30, 24);
    
    // Chest plate segments
    g.fillStyle(armorHighlight, 1);
    g.fillEllipse(4 * faceDirection, -4 + bodyBob, 18, 14);
    // Gold dragon pattern
    g.lineStyle(2, goldAccent, 1);
    g.strokeEllipse(4 * faceDirection, -4 + bodyBob, 18, 14);
    // Dragon face on chest
    g.fillStyle(goldAccent, 1);
    g.beginPath();
    g.moveTo(0, -12 + bodyBob);
    g.lineTo(-6, 0 + bodyBob);
    g.lineTo(6, 0 + bodyBob);
    g.closePath();
    g.fillPath();
    // Flaming heart core
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, -4 + bodyBob, 5);
    g.fillStyle(flameYellow, flameFlicker * 0.8);
    g.fillCircle(0, -4 + bodyBob, 3);
    g.fillStyle(flameCore, flameFlicker * 0.6);
    g.fillCircle(0, -4 + bodyBob, 1.5);
    
    // Belt with dragon buckle
    g.fillStyle(0x2A2A1A, 1);
    g.fillRect(-16, 12 + bodyBob, 32, 6);
    g.fillStyle(goldAccent, 1);
    g.fillRect(-16, 12 + bodyBob, 32, 2);
    g.fillRect(-16, 16 + bodyBob, 32, 2);
    // Large dragon buckle
    g.fillCircle(0, 15 + bodyBob, 5);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 15 + bodyBob, 3);
    
    // LEFT FLAMING SWORD ARM
    g.save();
    g.translateCanvas(-20 * faceDirection, -4 + bodyBob);
    g.rotateCanvas(leftArmSwing * faceDirection - 0.2);
    
    // Dragon wing pauldron
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
    // Flame on pauldron
    g.fillStyle(flameOrange, flameFlicker * 0.7);
    g.fillCircle(0, -14, 4);
    g.fillStyle(flameYellow, flameFlicker * 0.5);
    g.fillCircle(0, -17, 3);
    
    // Arm
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);
    
    // Gauntlet
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);
    
    // LEFT FLAMING SWORD
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-2, 16, 4, 10);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 28, 4);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 28, 2);
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-8, 13, 16, 4);
    // Blade
    g.fillStyle(0x3A3A3A, 1);
    g.fillRect(-3, -26, 6, 39);
    g.fillStyle(0x4A4A4A, 1);
    g.fillRect(-1, -26, 2, 39);
    // Flames on blade
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
    // Flaming tip
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
    
    // RIGHT FLAMING SWORD ARM
    g.save();
    g.translateCanvas(24 * faceDirection, -6 + bodyBob);
    g.rotateCanvas(rightArmSwing * faceDirection + 0.2);
    
    // Dragon wing pauldron
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
    
    // Arm
    g.fillStyle(armorSecondary, 1);
    g.fillRect(-4, -2, 8, 14);
    
    // Gauntlet
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(0, 14, 6, 5);
    
    // RIGHT FLAMING SWORD (slightly larger)
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-2, 16, 4, 12);
    g.fillStyle(goldAccent, 1);
    g.fillCircle(0, 30, 5);
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(0, 30, 3);
    g.fillStyle(0x1A1A1A, 1);
    g.fillRect(-10, 13, 20, 4);
    // Dragon wing guard
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
    // Blade
    g.fillStyle(0x3A3A3A, 1);
    g.fillRect(-3, -30, 6, 43);
    g.fillStyle(0x4A4A4A, 1);
    g.fillRect(-1, -30, 2, 43);
    // Flames on blade
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
    // Flaming tip
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
    
    // HELMET - Dragon skull helm with flames
    g.fillStyle(armorPrimary, 1);
    g.fillEllipse(6 * faceDirection, -18 + bodyBob, 16, 15);
    
    // Face plate - dragon skull visage
    g.fillStyle(armorSecondary, 1);
    g.beginPath();
    g.moveTo(10 * faceDirection, -28 + bodyBob);
    g.lineTo(22 * faceDirection, -18 + bodyBob);
    g.lineTo(20 * faceDirection, -6 + bodyBob);
    g.lineTo(6 * faceDirection, -4 + bodyBob);
    g.lineTo(2 * faceDirection, -20 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // Dragon teeth on visor
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
    
    // Eye slits with fire
    g.fillStyle(0x0A0A0A, 1);
    g.fillEllipse(12 * faceDirection, -18 + bodyBob, 5, 3);
    g.fillEllipse(18 * faceDirection, -16 + bodyBob, 4, 3);
    // Fire eyes
    g.fillStyle(flameOrange, flameFlicker);
    g.fillCircle(12 * faceDirection, -18 + bodyBob, 3);
    g.fillCircle(18 * faceDirection, -16 + bodyBob, 2.5);
    g.fillStyle(flameYellow, flameFlicker * 0.8);
    g.fillCircle(12 * faceDirection, -18 + bodyBob, 1.5);
    g.fillCircle(18 * faceDirection, -16 + bodyBob, 1.2);
    
    // Crown of horns with flames
    // Main center horn
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
    
    // Left side horn
    g.fillStyle(armorHighlight, 1);
    g.beginPath();
    g.moveTo(-4 * faceDirection, -22 + bodyBob);
    g.lineTo(-12 * faceDirection, -40 + bodyBob);
    g.lineTo(0 * faceDirection, -24 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // Right side horn
    g.beginPath();
    g.moveTo(16 * faceDirection, -24 + bodyBob);
    g.lineTo(24 * faceDirection, -38 + bodyBob);
    g.lineTo(18 * faceDirection, -22 + bodyBob);
    g.closePath();
    g.fillPath();
    
    // Flames on horn tips
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
