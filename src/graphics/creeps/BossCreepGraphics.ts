import Phaser from 'phaser';

/**
 * BossCreepGraphics handles drawing for boss creep types.
 */
export class BossCreepGraphics {
  /**
   * Draw a boss creep based on type
   */
  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number
  ): void {
    switch (type) {
      case 'boss':
        BossCreepGraphics.drawBoss(g, bounceTime, faceDirection);
        break;
      case 'boss_1':
        BossCreepGraphics.drawBoss1(g, bounceTime, faceDirection);
        break;
      case 'boss_2':
        BossCreepGraphics.drawBoss2(g, bounceTime, faceDirection);
        break;
      case 'boss_3':
        BossCreepGraphics.drawBoss3(g, bounceTime, faceDirection);
        break;
      case 'boss_4':
        BossCreepGraphics.drawBoss4(g, bounceTime, faceDirection);
        break;
      case 'boss_5':
        BossCreepGraphics.drawBoss5(g, bounceTime, faceDirection);
        break;
      // Note: boss_guard_1, boss_guard_2, boss_guard_3 are now handled by DragonKnightGraphics
    }
  }

  static drawBoss(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 3;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    
    // Glow
    g.fillStyle(0x800080, 0.2);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0x800080, 0.1);
    g.fillCircle(0, 0, 60 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 50, 18);
    
    // Body
    g.fillStyle(0x4B0082, 1);
    g.fillEllipse(0, 0 + bounce, 44 * pulse, 38 * pulse);
    
    // Fur pattern
    g.fillStyle(0x6A0DAD, 1);
    g.fillEllipse(-10, -10 + bounce, 16, 20);
    g.fillEllipse(10, 5 + bounce, 18, 16);
    g.fillStyle(0x8B008B, 1);
    g.fillEllipse(0, -5 + bounce, 12, 14);
    
    // Face
    g.fillStyle(0x9370DB, 1);
    g.fillEllipse(18 * faceDirection, -5 + bounce, 18, 16);
    
    // Crown
    g.fillStyle(0xFFD700, 1);
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
    
    // Eyes (3)
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(14 * faceDirection, -12 + bounce, 5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 4);
    g.fillCircle(20 * faceDirection, 2 + bounce, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * faceDirection, -14 + bounce, 2);
    g.fillCircle(22 * faceDirection, -10 + bounce, 1.5);
    
    // Mouth
    g.fillStyle(0x2F0040, 1);
    g.fillEllipse(26 * faceDirection, 4 + bounce, 8, 6);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(22 * faceDirection, 1 + bounce, 3, 4);
    g.fillRect(27 * faceDirection, 2 + bounce, 3, 3);
    
    // Arms
    g.fillStyle(0x4B0082, 1);
    g.fillEllipse(-25, 10 + bounce, 10, 8);
    g.fillEllipse(25, 10 + bounce, 10, 8);
    
    // Feet
    g.fillStyle(0x3A0066, 1);
    g.fillEllipse(-15, 28, 12, 8);
    g.fillEllipse(15, 28, 12, 8);
  }

  /**
   * Boss 1: "Giant Gecko" - Small agile lizard with fiery markings
   */
  static drawBoss1(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.04;
    
    // Fiery aura
    g.fillStyle(0xFF6600, 0.12);
    g.fillCircle(0, 0, 35 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 32, 12);
    
    // Tail - long and curled
    g.fillStyle(0x55AA44, 1);
    g.beginPath();
    g.moveTo(-12 * faceDirection, 8 + bounce);
    g.lineTo(-24 * faceDirection, 14 + bounce);
    g.lineTo(-30 * faceDirection, 8 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.lineTo(-18 * faceDirection, 6 + bounce);
    g.closePath();
    g.fillPath();
    
    // Body - sleek gecko shape
    g.fillStyle(0x44CC33, 1);
    g.fillEllipse(0, 0 + bounce, 26, 20);
    
    // Scale pattern - orange spots
    g.fillStyle(0xFF8833, 0.7);
    g.fillCircle(-6, -4 + bounce, 4);
    g.fillCircle(4, 2 + bounce, 5);
    g.fillCircle(-2, 8 + bounce, 3);
    
    // Lighter underbelly
    g.fillStyle(0x88DD77, 1);
    g.fillEllipse(0, 6 + bounce, 16, 10);
    
    // Head - gecko-like with large eyes
    g.fillStyle(0x55BB44, 1);
    g.fillEllipse(14 * faceDirection, -6 + bounce, 14, 12);
    
    // Snout
    g.fillStyle(0x66CC55, 1);
    g.fillEllipse(22 * faceDirection, -4 + bounce, 8, 6);
    
    // Large gecko eyes
    g.fillStyle(0xFFDD00, 1);
    g.fillCircle(12 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -8 + bounce, 4);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(13 * faceDirection, -10 + bounce, 1.5, 4);
    g.fillEllipse(21 * faceDirection, -8 + bounce, 1, 3);
    
    // Forked tongue
    g.fillStyle(0xFF4444, 1);
    g.fillRect(26 * faceDirection, -3 + bounce, 6, 1);
    g.fillRect(30 * faceDirection, -4 + bounce, 3, 1);
    g.fillRect(30 * faceDirection, -2 + bounce, 3, 1);
    
    // Small spines starting to form
    g.fillStyle(0xFF6600, 1);
    for (let i = 0; i < 3; i++) {
      const spineX = -8 + i * 6;
      g.beginPath();
      g.moveTo(spineX - 2, -10 + bounce);
      g.lineTo(spineX, -14 + bounce);
      g.lineTo(spineX + 2, -10 + bounce);
      g.closePath();
      g.fillPath();
    }
    
    // Sticky feet
    g.fillStyle(0x339922, 1);
    g.fillCircle(-12, 18, 5);
    g.fillCircle(12, 18, 5);
    g.fillCircle(-16, 8 + bounce, 4);
    g.fillCircle(16, 8 + bounce, 4);
  }

  /**
   * Boss 2: "Komodo Warlord" - Armored komodo dragon with thick scales and claws
   */
  static drawBoss2(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;
    
    // Menacing aura
    g.fillStyle(0x668844, 0.15);
    g.fillCircle(0, 0, 45 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 45, 14);
    
    // Tail - thick and powerful
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
    // Tail spikes
    g.fillStyle(0x445533, 1);
    g.beginPath();
    g.moveTo(-26 * faceDirection, 2 + bounce);
    g.lineTo(-28 * faceDirection, -4 + bounce);
    g.lineTo(-30 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();
    
    // Hind legs
    g.fillStyle(0x556644, 1);
    g.fillEllipse(-14, 14 + bounce, 10, 14);
    g.fillEllipse(10, 16 + bounce, 8, 12);
    
    // Body - massive armored komodo
    g.fillStyle(0x667755, 1);
    g.fillEllipse(0, 2 + bounce, 36, 26);
    
    // Armored scale plates
    g.fillStyle(0x778866, 1);
    g.fillEllipse(-8, -4 + bounce, 12, 10);
    g.fillEllipse(6, -2 + bounce, 14, 12);
    g.fillStyle(0x889977, 0.8);
    g.fillEllipse(-2, 8 + bounce, 18, 10);
    
    // Ridged back spines
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
    
    // Front legs with claws
    g.fillStyle(0x556644, 1);
    g.fillEllipse(-20, 6 + bounce, 10, 8);
    g.fillEllipse(22, 4 + bounce, 10, 8);
    // Claws
    g.fillStyle(0x222211, 1);
    g.fillCircle(-24, 10 + bounce, 3);
    g.fillCircle(-28, 8 + bounce, 2);
    g.fillCircle(26, 8 + bounce, 3);
    g.fillCircle(30, 6 + bounce, 2);
    
    // Head - elongated komodo head
    g.fillStyle(0x778866, 1);
    g.fillEllipse(16 * faceDirection, -6 + bounce, 18, 14);
    
    // Snout - long and powerful
    g.fillStyle(0x889977, 1);
    g.fillEllipse(28 * faceDirection, -4 + bounce, 12, 8);
    
    // Nostrils
    g.fillStyle(0x333322, 1);
    g.fillCircle(34 * faceDirection, -6 + bounce, 2);
    g.fillCircle(32 * faceDirection, -2 + bounce, 2);
    
    // Eyes - cold reptilian
    g.fillStyle(0xDDAA00, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 1.5, 4);
    
    // Forked tongue
    g.fillStyle(0xFF6688, 1);
    g.fillRect(36 * faceDirection, -3 + bounce, 8, 1);
    g.fillRect(42 * faceDirection, -4 + bounce, 4, 1);
    g.fillRect(42 * faceDirection, -2 + bounce, 4, 1);
    
    // Jaw with teeth visible
    g.fillStyle(0x556644, 1);
    g.fillEllipse(26 * faceDirection, 2 + bounce, 10, 6);
    g.fillStyle(0xFFFFEE, 1);
    g.fillRect(22 * faceDirection, 0 + bounce, 2, 3);
    g.fillRect(26 * faceDirection, 1 + bounce, 2, 2);
    g.fillRect(30 * faceDirection, 0 + bounce, 2, 3);
    
    // Feet
    g.fillStyle(0x445533, 1);
    g.fillEllipse(-14, 26, 10, 6);
    g.fillEllipse(10, 26, 8, 5);
  }

  /**
   * Boss 3: "Drake Champion" - Transitional form with wing stubs and prominent spines
   */
  static drawBoss3(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 3.5) * 3;
    const wingFlutter = Math.sin(bounceTime * 6) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.04;
    
    // Fire aura emerging
    g.fillStyle(0xFF6622, 0.12);
    g.fillCircle(0, -5 + bounce, 50 * pulse);
    g.fillStyle(0xFFAA44, 0.08);
    g.fillCircle(0, -5 + bounce, 42 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 30, 48, 16);
    
    // Tail - longer with barbed tip
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
    // Tail barb
    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-46 * faceDirection, 9 + bounce);
    g.lineTo(-54 * faceDirection, 6 + bounce);
    g.lineTo(-50 * faceDirection, 12 + bounce);
    g.closePath();
    g.fillPath();
    
    // Wing stubs (not yet functional)
    g.fillStyle(0x775533, 0.85);
    // Left wing stub
    g.beginPath();
    g.moveTo(-14, -8 + bounce);
    g.lineTo(-28, -18 + bounce + wingFlutter * 20);
    g.lineTo(-32, -10 + bounce + wingFlutter * 15);
    g.lineTo(-26, -2 + bounce + wingFlutter * 10);
    g.lineTo(-16, 0 + bounce);
    g.closePath();
    g.fillPath();
    // Right wing stub
    g.beginPath();
    g.moveTo(14, -8 + bounce);
    g.lineTo(28, -18 + bounce + wingFlutter * 20);
    g.lineTo(32, -10 + bounce + wingFlutter * 15);
    g.lineTo(26, -2 + bounce + wingFlutter * 10);
    g.lineTo(16, 0 + bounce);
    g.closePath();
    g.fillPath();
    
    // Wing membrane hints
    g.lineStyle(1, 0x664422, 0.6);
    g.beginPath();
    g.moveTo(-16, -6 + bounce);
    g.lineTo(-26, -12 + bounce + wingFlutter * 15);
    g.strokePath();
    g.beginPath();
    g.moveTo(16, -6 + bounce);
    g.lineTo(26, -12 + bounce + wingFlutter * 15);
    g.strokePath();
    
    // Body - muscular drake
    g.fillStyle(0x997755, 1);
    g.fillEllipse(0, 2 + bounce, 34, 28);
    
    // Armored belly plates
    g.fillStyle(0xBBAA88, 1);
    g.fillEllipse(0, 8 + bounce, 22, 14);
    g.fillStyle(0xCCBB99, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-10, 2 + i * 4 + bounce, 20, 2);
    }
    
    // Prominent back spines
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
    
    // Legs
    g.fillStyle(0x886655, 1);
    g.fillEllipse(-18, 16 + bounce, 10, 14);
    g.fillEllipse(18, 16 + bounce, 10, 14);
    g.fillEllipse(-22, 6 + bounce, 8, 10);
    g.fillEllipse(22, 6 + bounce, 8, 10);
    
    // Clawed feet
    g.fillStyle(0x443322, 1);
    g.fillEllipse(-18, 28, 10, 6);
    g.fillEllipse(18, 28, 10, 6);
    g.fillCircle(-22, 29, 3);
    g.fillCircle(-14, 30, 3);
    g.fillCircle(14, 30, 3);
    g.fillCircle(22, 29, 3);
    
    // Neck
    g.fillStyle(0x997755, 1);
    g.fillEllipse(14 * faceDirection, -10 + bounce, 12, 14);
    
    // Head - longer snout, more dragon-like
    g.fillStyle(0xAA8866, 1);
    g.fillEllipse(22 * faceDirection, -12 + bounce, 16, 14);
    
    // Snout
    g.fillStyle(0xBB9977, 1);
    g.fillEllipse(34 * faceDirection, -10 + bounce, 10, 8);
    
    // Head ridges
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
    
    // Eyes - fiercer, starting to glow
    g.fillStyle(0xFF8800, 1);
    g.fillEllipse(24 * faceDirection, -16 + bounce, 4, 5);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(25 * faceDirection, -16 + bounce, 1.5, 4);
    
    // Nostrils with smoke hint
    g.fillStyle(0x333322, 1);
    g.fillCircle(40 * faceDirection, -12 + bounce, 2);
    g.fillStyle(0x888888, 0.4);
    g.fillCircle(44 * faceDirection, -14 + bounce, 3);
    
    // Open jaw with fire breath potential
    g.fillStyle(0x886655, 1);
    g.fillEllipse(34 * faceDirection, -4 + bounce, 10, 6);
    g.fillStyle(0xFF4400, 0.5);
    g.fillEllipse(38 * faceDirection, -4 + bounce, 6, 4);
    g.fillStyle(0xFFFFEE, 1);
    g.fillRect(30 * faceDirection, -6 + bounce, 2, 4);
    g.fillRect(34 * faceDirection, -7 + bounce, 2, 5);
    g.fillRect(38 * faceDirection, -6 + bounce, 2, 4);
  }

  /**
   * Boss 4: "Young Dragon" - Functional wings, longer neck, fire-breathing capability
   */
  static drawBoss4(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const hover = Math.sin(bounceTime * 3) * 3;
    const wingFlap = Math.sin(bounceTime * 4) * 0.25;
    const breathe = 1 + Math.sin(bounceTime * 4) * 0.04;
    
    // Fire aura
    g.fillStyle(0xFF4400, 0.12);
    g.fillCircle(0, -5 + hover, 60 * breathe);
    g.fillStyle(0xFFAA00, 0.08);
    g.fillCircle(0, -5 + hover, 50 * breathe);
    
    // Large shadow
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 35, 55, 18);
    
    // Tail - long with barbed segments
    g.fillStyle(0xAA5533, 1);
    g.beginPath();
    g.moveTo(-18 * faceDirection, 10 + hover);
    g.lineTo(-38 * faceDirection, 20 + hover);
    g.lineTo(-52 * faceDirection, 16 + hover);
    g.lineTo(-50 * faceDirection, 10 + hover);
    g.lineTo(-36 * faceDirection, 12 + hover);
    g.lineTo(-20 * faceDirection, 4 + hover);
    g.closePath();
    g.fillPath();
    // Tail spikes
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
    
    // Wings - functional, dragon-like
    g.fillStyle(0x883322, 1);
    // Left wing
    g.beginPath();
    g.moveTo(-16, -6 + hover);
    g.lineTo(-40, -30 + hover + wingFlap * 35);
    g.lineTo(-55, -20 + hover + wingFlap * 30);
    g.lineTo(-50, 0 + hover + wingFlap * 20);
    g.lineTo(-40, 12 + hover + wingFlap * 10);
    g.lineTo(-22, 6 + hover);
    g.closePath();
    g.fillPath();
    // Right wing
    g.beginPath();
    g.moveTo(16, -6 + hover);
    g.lineTo(40, -30 + hover + wingFlap * 35);
    g.lineTo(55, -20 + hover + wingFlap * 30);
    g.lineTo(50, 0 + hover + wingFlap * 20);
    g.lineTo(40, 12 + hover + wingFlap * 10);
    g.lineTo(22, 6 + hover);
    g.closePath();
    g.fillPath();
    
    // Wing membrane
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
    
    // Wing claws
    g.fillStyle(0x332211, 1);
    g.fillCircle(-40, -28 + hover + wingFlap * 32, 3);
    g.fillCircle(40, -28 + hover + wingFlap * 32, 3);
    
    // Body - powerful dragon body
    g.fillStyle(0xBB6644, 1);
    g.fillEllipse(0, 4 + hover, 40 * breathe, 32 * breathe);
    
    // Belly scales
    g.fillStyle(0xDDCC99, 1);
    g.fillEllipse(0, 10 + hover, 24, 18);
    g.fillStyle(0xEEDDAA, 0.8);
    for (let i = 0; i < 5; i++) {
      g.fillRect(-12, 2 + i * 4 + hover, 24, 2);
    }
    
    // Back spines (larger)
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
    
    // Hind legs
    g.fillStyle(0xAA5533, 1);
    g.fillEllipse(-16, 20 + hover, 12, 16);
    g.fillEllipse(16, 20 + hover, 12, 16);
    
    // Front legs
    g.fillEllipse(-24, 8 + hover, 10, 12);
    g.fillEllipse(24, 8 + hover, 10, 12);
    
    // Clawed feet
    g.fillStyle(0x553322, 1);
    g.fillEllipse(-16, 34, 12, 7);
    g.fillEllipse(16, 34, 12, 7);
    g.fillCircle(-22, 35, 3);
    g.fillCircle(-10, 36, 3);
    g.fillCircle(10, 36, 3);
    g.fillCircle(22, 35, 3);
    
    // Long neck
    g.fillStyle(0xBB6644, 1);
    g.fillEllipse(16 * faceDirection, -14 + hover, 14, 18);
    
    // Head - true dragon head
    g.fillStyle(0xCC7755, 1);
    g.fillEllipse(28 * faceDirection, -18 + hover, 18, 16);
    
    // Snout
    g.fillStyle(0xDD8866, 1);
    g.fillEllipse(42 * faceDirection, -16 + hover, 12, 10);
    
    // Horns (curved back)
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
    
    // Head ridges
    g.fillStyle(0x885544, 1);
    g.beginPath();
    g.moveTo(24 * faceDirection, -26 + hover);
    g.lineTo(28 * faceDirection, -32 + hover);
    g.lineTo(32 * faceDirection, -26 + hover);
    g.closePath();
    g.fillPath();
    
    // Fierce eyes
    g.fillStyle(0xFF6600, 1);
    g.fillEllipse(32 * faceDirection, -22 + hover, 5, 6);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(33 * faceDirection, -22 + hover, 2, 5);
    g.fillStyle(0xFFFF00, 0.6);
    g.fillCircle(31 * faceDirection, -24 + hover, 1.5);
    
    // Nostrils with smoke
    g.fillStyle(0x332222, 1);
    g.fillCircle(50 * faceDirection, -18 + hover, 2);
    g.fillCircle(48 * faceDirection, -14 + hover, 2);
    g.fillStyle(0x666666, 0.4);
    g.fillCircle(54 * faceDirection, -20 + hover, 4);
    g.fillCircle(56 * faceDirection, -22 + hover, 3);
    
    // Open jaw with fire
    g.fillStyle(0xAA5533, 1);
    g.fillEllipse(42 * faceDirection, -8 + hover, 12, 8);
    g.fillStyle(0xFF4400, 0.6);
    g.fillEllipse(48 * faceDirection, -8 + hover, 8, 5);
    g.fillStyle(0xFFAA00, 0.4);
    g.fillCircle(54 * faceDirection, -8 + hover, 4);
    
    // Teeth
    g.fillStyle(0xFFFFEE, 1);
    g.fillRect(36 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(40 * faceDirection, -13 + hover, 2, 6);
    g.fillRect(44 * faceDirection, -12 + hover, 2, 5);
    g.fillRect(48 * faceDirection, -11 + hover, 2, 4);
  }

  /**
   * Boss 5: "Elder Dragon Lord" - Massive ancient dragon with crown of horns and fire aura
   */
  static drawBoss5(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const hover = Math.sin(bounceTime * 2.5) * 4;
    const wingFlap = Math.sin(bounceTime * 3.5) * 0.3;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.05;
    const fireFlicker = Math.sin(bounceTime * 10) * 0.3 + 0.7;
    
    // Massive fire aura
    g.fillStyle(0xFF2200, 0.1 * fireFlicker);
    g.fillCircle(0, -5 + hover, 80 * pulse);
    g.fillStyle(0xFF6600, 0.12 * fireFlicker);
    g.fillCircle(0, -5 + hover, 65 * pulse);
    g.fillStyle(0xFFAA00, 0.08 * fireFlicker);
    g.fillCircle(0, -5 + hover, 55 * pulse);
    
    // Large shadow
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(0, 40, 65, 22);
    
    // Massive tail with flame tip
    g.fillStyle(0x882211, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, 12 + hover);
    g.lineTo(-45 * faceDirection, 24 + hover);
    g.lineTo(-62 * faceDirection, 18 + hover);
    g.lineTo(-60 * faceDirection, 10 + hover);
    g.lineTo(-42 * faceDirection, 14 + hover);
    g.lineTo(-22 * faceDirection, 4 + hover);
    g.closePath();
    g.fillPath();
    // Tail flame
    g.fillStyle(0xFF4400, 0.8);
    g.fillCircle(-64 * faceDirection, 14 + hover, 6);
    g.fillStyle(0xFFAA00, 0.6);
    g.fillCircle(-68 * faceDirection, 12 + hover, 4);
    g.fillStyle(0xFFFF66, 0.5);
    g.fillCircle(-66 * faceDirection, 14 + hover, 2);
    
    // Massive wings
    g.fillStyle(0x661111, 1);
    // Left wing
    g.beginPath();
    g.moveTo(-18, -8 + hover);
    g.lineTo(-50, -40 + hover + wingFlap * 40);
    g.lineTo(-70, -30 + hover + wingFlap * 35);
    g.lineTo(-65, -5 + hover + wingFlap * 25);
    g.lineTo(-55, 15 + hover + wingFlap * 15);
    g.lineTo(-30, 10 + hover);
    g.closePath();
    g.fillPath();
    // Right wing
    g.beginPath();
    g.moveTo(18, -8 + hover);
    g.lineTo(50, -40 + hover + wingFlap * 40);
    g.lineTo(70, -30 + hover + wingFlap * 35);
    g.lineTo(65, -5 + hover + wingFlap * 25);
    g.lineTo(55, 15 + hover + wingFlap * 15);
    g.lineTo(30, 10 + hover);
    g.closePath();
    g.fillPath();
    
    // Wing membrane veins
    g.lineStyle(2, 0x440000, 0.9);
    g.beginPath();
    g.moveTo(-20, -6 + hover);
    g.lineTo(-52, -28 + hover + wingFlap * 35);
    g.strokePath();
    g.beginPath();
    g.moveTo(-22, 0 + hover);
    g.lineTo(-58, -12 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(-24, 6 + hover);
    g.lineTo(-54, 8 + hover + wingFlap * 18);
    g.strokePath();
    g.beginPath();
    g.moveTo(20, -6 + hover);
    g.lineTo(52, -28 + hover + wingFlap * 35);
    g.strokePath();
    g.beginPath();
    g.moveTo(22, 0 + hover);
    g.lineTo(58, -12 + hover + wingFlap * 28);
    g.strokePath();
    g.beginPath();
    g.moveTo(24, 6 + hover);
    g.lineTo(54, 8 + hover + wingFlap * 18);
    g.strokePath();
    
    // Wing claws
    g.fillStyle(0x332211, 1);
    g.fillCircle(-50, -38 + hover + wingFlap * 38, 4);
    g.fillCircle(50, -38 + hover + wingFlap * 38, 4);
    
    // Massive body
    g.fillStyle(0xAA3322, 1);
    g.fillEllipse(0, 4 + hover, 46 * pulse, 38 * pulse);
    
    // Armored belly plates
    g.fillStyle(0xDDCC88, 1);
    g.fillEllipse(0, 12 + hover, 28, 22);
    g.fillStyle(0xEEDDAA, 0.9);
    for (let i = 0; i < 6; i++) {
      g.fillRect(-14, 2 + i * 4 + hover, 28, 2);
    }
    
    // Massive back spines
    g.fillStyle(0x551111, 1);
    for (let i = 0; i < 8; i++) {
      const spineX = -18 + i * 5;
      const spineH = 16 + Math.sin(bounceTime * 3 + i * 0.4) * 3;
      g.beginPath();
      g.moveTo(spineX - 5, -18 + hover);
      g.lineTo(spineX, -18 - spineH + hover);
      g.lineTo(spineX + 5, -18 + hover);
      g.closePath();
      g.fillPath();
    }
    
    // Powerful hind legs
    g.fillStyle(0x993322, 1);
    g.fillEllipse(-18, 24 + hover, 14, 18);
    g.fillEllipse(18, 24 + hover, 14, 18);
    
    // Front legs
    g.fillEllipse(-28, 10 + hover, 12, 14);
    g.fillEllipse(28, 10 + hover, 12, 14);
    
    // Massive clawed feet
    g.fillStyle(0x553322, 1);
    g.fillEllipse(-18, 40, 14, 8);
    g.fillEllipse(18, 40, 14, 8);
    g.fillCircle(-26, 41, 4);
    g.fillCircle(-10, 42, 4);
    g.fillCircle(10, 42, 4);
    g.fillCircle(26, 41, 4);
    
    // Long powerful neck
    g.fillStyle(0xAA3322, 1);
    g.fillEllipse(18 * faceDirection, -16 + hover, 16, 22);
    
    // Majestic dragon head
    g.fillStyle(0xBB4433, 1);
    g.fillEllipse(32 * faceDirection, -24 + hover, 22, 20);
    
    // Long snout
    g.fillStyle(0xCC5544, 1);
    g.fillEllipse(50 * faceDirection, -22 + hover, 14, 12);
    
    // Crown of horns
    g.fillStyle(0xFFD700, 1);
    // Main crown piece
    g.beginPath();
    g.moveTo(20 * faceDirection, -42 + hover);
    g.lineTo(24 * faceDirection, -55 + hover);
    g.lineTo(28 * faceDirection, -42 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(30 * faceDirection, -40 + hover);
    g.lineTo(36 * faceDirection, -52 + hover);
    g.lineTo(40 * faceDirection, -40 + hover);
    g.closePath();
    g.fillPath();
    // Crown gems
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(24 * faceDirection, -48 + hover, 4);
    g.fillStyle(0x00FFFF, 1);
    g.fillCircle(36 * faceDirection, -46 + hover, 3);
    
    // Majestic curved horns
    g.fillStyle(0x332222, 1);
    g.beginPath();
    g.moveTo(14 * faceDirection, -38 + hover);
    g.lineTo(6 * faceDirection, -58 + hover);
    g.lineTo(4 * faceDirection, -55 + hover);
    g.lineTo(10 * faceDirection, -38 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(46 * faceDirection, -36 + hover);
    g.lineTo(56 * faceDirection, -52 + hover);
    g.lineTo(54 * faceDirection, -50 + hover);
    g.lineTo(42 * faceDirection, -36 + hover);
    g.closePath();
    g.fillPath();
    
    // Head ridges
    g.fillStyle(0x772222, 1);
    for (let i = 0; i < 3; i++) {
      const rx = (26 + i * 8) * faceDirection;
      g.beginPath();
      g.moveTo(rx - 3 * faceDirection, -36 + hover);
      g.lineTo(rx, -42 + hover);
      g.lineTo(rx + 3 * faceDirection, -36 + hover);
      g.closePath();
      g.fillPath();
    }
    
    // Fierce glowing eyes
    g.fillStyle(0xFF4400, 1);
    g.fillEllipse(38 * faceDirection, -30 + hover, 6, 7);
    g.fillStyle(0x000000, 1);
    g.fillEllipse(39 * faceDirection, -30 + hover, 2, 6);
    g.fillStyle(0xFFFF00, 0.8);
    g.fillCircle(36 * faceDirection, -32 + hover, 2);
    
    // Nostrils with fire
    g.fillStyle(0x332222, 1);
    g.fillCircle(58 * faceDirection, -24 + hover, 3);
    g.fillCircle(56 * faceDirection, -18 + hover, 3);
    g.fillStyle(0xFF4400, 0.6 * fireFlicker);
    g.fillCircle(62 * faceDirection, -26 + hover, 4);
    g.fillStyle(0xFFAA00, 0.5 * fireFlicker);
    g.fillCircle(64 * faceDirection, -28 + hover, 3);
    
    // Open jaw with massive fire breath
    g.fillStyle(0x993322, 1);
    g.fillEllipse(50 * faceDirection, -12 + hover, 14, 10);
    // Fire breath
    g.fillStyle(0xFF2200, 0.7 * fireFlicker);
    g.fillEllipse(60 * faceDirection, -12 + hover, 12, 8);
    g.fillStyle(0xFF6600, 0.6 * fireFlicker);
    g.fillEllipse(68 * faceDirection, -12 + hover, 10, 6);
    g.fillStyle(0xFFAA00, 0.5 * fireFlicker);
    g.fillEllipse(76 * faceDirection, -12 + hover, 8, 5);
    g.fillStyle(0xFFFF66, 0.4 * fireFlicker);
    g.fillCircle(82 * faceDirection, -12 + hover, 4);
    
    // Massive teeth
    g.fillStyle(0xFFFFEE, 1);
    g.fillRect(42 * faceDirection, -18 + hover, 3, 7);
    g.fillRect(48 * faceDirection, -19 + hover, 3, 8);
    g.fillRect(54 * faceDirection, -18 + hover, 3, 7);
    g.fillRect(46 * faceDirection, -6 + hover, 2, 5);
    g.fillRect(52 * faceDirection, -5 + hover, 2, 4);
  }

  /**
   * Boss Guard 1: "Drake Knight" - Armored dragon knight with shield and sword
   */
  static drawBossGuard1(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.03;
    const swordSwing = Math.sin(bounceTime * 3) * 5;
    
    // Green aura
    g.fillStyle(0x447744, 0.2);
    g.fillCircle(0, 0, 36 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 26, 36, 12);
    
    // Cape flowing behind
    g.fillStyle(0x224422, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -8 + bounce);
    g.lineTo(-24 * faceDirection, 20 + bounce + swordSwing * 0.3);
    g.lineTo(-18 * faceDirection, 22 + bounce);
    g.lineTo(-6 * faceDirection, 5 + bounce);
    g.closePath();
    g.fillPath();
    
    // Legs with armored boots
    g.fillStyle(0x445544, 1);
    g.fillRect(-10, 10 + bounce, 6, 14);
    g.fillRect(4, 10 + bounce, 6, 14);
    // Boots
    g.fillStyle(0x333333, 1);
    g.fillEllipse(-7, 24, 8, 5);
    g.fillEllipse(7, 24, 8, 5);
    
    // Body - heavy plate armor
    g.fillStyle(0x556655, 1);
    g.fillEllipse(0, 0 + bounce, 28, 22);
    // Chest plate
    g.fillStyle(0x667766, 1);
    g.fillEllipse(4 * faceDirection, -2 + bounce, 18, 14);
    // Armor segments
    g.fillStyle(0x778877, 0.9);
    g.fillRect(-8, -4 + bounce, 16, 4);
    g.fillRect(-6, 2 + bounce, 12, 3);
    
    // Shield (left side) - large kite shield with dragon emblem
    g.fillStyle(0x554433, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -14 + bounce);
    g.lineTo(-28 * faceDirection, 0 + bounce);
    g.lineTo(-20 * faceDirection, 16 + bounce);
    g.lineTo(-14 * faceDirection, 0 + bounce);
    g.closePath();
    g.fillPath();
    // Shield border
    g.lineStyle(2, 0x776655, 1);
    g.strokePath();
    // Dragon emblem on shield
    g.fillStyle(0x44AA44, 1);
    g.fillCircle(-20 * faceDirection, 0 + bounce, 6);
    g.fillStyle(0x55CC55, 1);
    g.beginPath();
    g.moveTo(-20 * faceDirection, -4 + bounce);
    g.lineTo(-17 * faceDirection, 2 + bounce);
    g.lineTo(-23 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();
    
    // Sword arm
    g.fillStyle(0x556655, 1);
    g.fillEllipse(18 * faceDirection, 0 + bounce, 8, 6);
    
    // Sword
    g.fillStyle(0x888888, 1);
    g.save();
    g.translateCanvas(22 * faceDirection, -10 + bounce);
    g.rotateCanvas((swordSwing * 0.02) * faceDirection);
    // Blade
    g.fillRect(-2, -24, 4, 28);
    g.fillStyle(0xAAAAAA, 1);
    g.fillRect(-1, -24, 2, 28);
    // Tip
    g.fillStyle(0xBBBBBB, 1);
    g.beginPath();
    g.moveTo(-2, -24);
    g.lineTo(0, -32);
    g.lineTo(2, -24);
    g.closePath();
    g.fillPath();
    // Guard
    g.fillStyle(0x664422, 1);
    g.fillRect(-6, 2, 12, 3);
    // Handle
    g.fillStyle(0x442211, 1);
    g.fillRect(-2, 5, 4, 8);
    g.restore();
    
    // Head with dragon helm
    g.fillStyle(0x556655, 1);
    g.fillEllipse(6 * faceDirection, -14 + bounce, 14, 12);
    // Visor
    g.fillStyle(0x445544, 1);
    g.fillRect(8 * faceDirection, -16 + bounce, 8, 8);
    // Eye slit
    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -14 + bounce, 6, 2);
    // Glowing eyes behind visor
    g.fillStyle(0x88FF88, 0.8);
    g.fillCircle(12 * faceDirection, -13 + bounce, 2);
    // Helmet crest
    g.fillStyle(0x667766, 1);
    g.beginPath();
    g.moveTo(2 * faceDirection, -20 + bounce);
    g.lineTo(6 * faceDirection, -28 + bounce);
    g.lineTo(10 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }

  /**
   * Boss Guard 2: "Dragon Knight" - Elite warrior with ornate armor and heavy shield
   */
  static drawBossGuard2(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.04;
    const swordSwing = Math.sin(bounceTime * 3) * 6;
    
    // Golden-green aura
    g.fillStyle(0x88AA44, 0.25);
    g.fillCircle(0, 0, 42 * pulse);
    g.fillStyle(0xAAAA44, 0.15);
    g.fillCircle(0, 0, 48 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 40, 14);
    
    // Cape - larger and more ornate
    g.fillStyle(0x883322, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -10 + bounce);
    g.lineTo(-28 * faceDirection, 24 + bounce + swordSwing * 0.3);
    g.lineTo(-20 * faceDirection, 26 + bounce);
    g.lineTo(-4 * faceDirection, 8 + bounce);
    g.closePath();
    g.fillPath();
    // Cape gold trim
    g.lineStyle(2, 0xCCAA44, 1);
    g.strokePath();
    
    // Legs with ornate greaves
    g.fillStyle(0x556655, 1);
    g.fillRect(-12, 10 + bounce, 7, 16);
    g.fillRect(5, 10 + bounce, 7, 16);
    // Knee guards
    g.fillStyle(0xBB9944, 1);
    g.fillCircle(-8, 12 + bounce, 4);
    g.fillCircle(8, 12 + bounce, 4);
    // Boots
    g.fillStyle(0x444444, 1);
    g.fillEllipse(-8, 26, 10, 6);
    g.fillEllipse(8, 26, 10, 6);
    
    // Body - ornate dragon scale armor
    g.fillStyle(0x667766, 1);
    g.fillEllipse(0, 0 + bounce, 32, 24);
    // Dragon scale pattern
    g.fillStyle(0x778877, 1);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillEllipse(-9 + col * 6, -6 + row * 6 + bounce, 5, 4);
      }
    }
    // Gold trim on chest
    g.lineStyle(2, 0xCCAA44, 1);
    g.strokeEllipse(0, -2 + bounce, 20, 12);
    
    // Large tower shield with dragon motif
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
    // Shield gold border
    g.lineStyle(3, 0xCCAA44, 1);
    g.strokePath();
    // Dragon head emblem
    g.fillStyle(0xAA6622, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 8);
    g.fillStyle(0xCC8833, 1);
    g.beginPath();
    g.moveTo(-23 * faceDirection, -6 + bounce);
    g.lineTo(-18 * faceDirection, 4 + bounce);
    g.lineTo(-28 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
    // Dragon eye on emblem
    g.fillStyle(0xFF4400, 1);
    g.fillCircle(-23 * faceDirection, 0 + bounce, 3);
    
    // Armored sword arm with pauldron
    g.fillStyle(0x667766, 1);
    g.fillEllipse(20 * faceDirection, -2 + bounce, 10, 8);
    g.fillStyle(0xBB9944, 1);
    g.fillCircle(18 * faceDirection, -6 + bounce, 5);
    
    // Larger ornate sword
    g.save();
    g.translateCanvas(24 * faceDirection, -12 + bounce);
    g.rotateCanvas((swordSwing * 0.02) * faceDirection);
    // Blade
    g.fillStyle(0x999999, 1);
    g.fillRect(-3, -28, 6, 32);
    g.fillStyle(0xBBBBBB, 1);
    g.fillRect(-1, -28, 2, 32);
    // Blade edge highlight
    g.fillStyle(0xDDDDDD, 1);
    g.fillRect(2, -26, 1, 28);
    // Tip
    g.fillStyle(0xCCCCCC, 1);
    g.beginPath();
    g.moveTo(-3, -28);
    g.lineTo(0, -38);
    g.lineTo(3, -28);
    g.closePath();
    g.fillPath();
    // Ornate guard with dragon wings
    g.fillStyle(0xCCAA44, 1);
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
    // Handle with gold wire wrap
    g.fillStyle(0x553322, 1);
    g.fillRect(-2, 6, 4, 10);
    g.fillStyle(0xCCAA44, 0.8);
    for (let i = 0; i < 4; i++) {
      g.fillRect(-2, 7 + i * 2, 4, 1);
    }
    // Pommel
    g.fillStyle(0xCCAA44, 1);
    g.fillCircle(0, 18, 3);
    g.restore();
    
    // Head with dragon-crested helm
    g.fillStyle(0x667766, 1);
    g.fillEllipse(8 * faceDirection, -16 + bounce, 16, 14);
    // Face guard
    g.fillStyle(0x556655, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 12);
    // Eye slits with inner glow
    g.fillStyle(0x000000, 1);
    g.fillRect(12 * faceDirection, -16 + bounce, 8, 3);
    g.fillStyle(0xFFDD44, 0.9);
    g.fillCircle(14 * faceDirection, -15 + bounce, 2);
    g.fillCircle(18 * faceDirection, -15 + bounce, 2);
    // Dragon crest on helm
    g.fillStyle(0xCCAA44, 1);
    g.beginPath();
    g.moveTo(4 * faceDirection, -22 + bounce);
    g.lineTo(8 * faceDirection, -36 + bounce);
    g.lineTo(12 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();
    // Side horns
    g.fillStyle(0x888866, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -18 + bounce);
    g.lineTo(-8 * faceDirection, -26 + bounce);
    g.lineTo(0 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
  }

  /**
   * Boss Guard 3: "Flame Knight" - Master warrior with flaming swords
   */
  static drawBossGuard3(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    const swordSwing = Math.sin(bounceTime * 3) * 8;
    const flameFlicker = Math.sin(bounceTime * 12) * 0.3 + 0.7;
    const flameWave = Math.sin(bounceTime * 8);
    
    // Fiery aura
    g.fillStyle(0xFF4400, 0.2 * flameFlicker);
    g.fillCircle(0, 0, 50 * pulse);
    g.fillStyle(0xFF6600, 0.15 * flameFlicker);
    g.fillCircle(0, 0, 56 * pulse);
    g.fillStyle(0xFFAA00, 0.1 * flameFlicker);
    g.fillCircle(0, 0, 62 * pulse);
    
    // Ember particles around
    for (let i = 0; i < 6; i++) {
      const angle = bounceTime * 2 + i * (Math.PI / 3);
      const dist = 35 + Math.sin(bounceTime * 4 + i) * 8;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist * 0.6;
      g.fillStyle(0xFF6600, 0.6 + Math.sin(bounceTime * 8 + i) * 0.3);
      g.fillCircle(ex, ey, 2 + Math.sin(bounceTime * 6 + i) * 1);
    }
    
    // Shadow
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 30, 44, 16);
    
    // Burning cape
    g.fillStyle(0x441111, 1);
    g.beginPath();
    g.moveTo(-8 * faceDirection, -12 + bounce);
    g.lineTo(-32 * faceDirection, 28 + bounce + swordSwing * 0.4);
    g.lineTo(-24 * faceDirection, 30 + bounce);
    g.lineTo(-4 * faceDirection, 10 + bounce);
    g.closePath();
    g.fillPath();
    // Flame edges on cape
    for (let i = 0; i < 5; i++) {
      const fx = -32 * faceDirection + i * 2 * faceDirection;
      const fy = 28 + bounce + Math.sin(bounceTime * 10 + i) * 3;
      g.fillStyle(0xFF4400, 0.7);
      g.fillCircle(fx, fy, 3);
      g.fillStyle(0xFFAA00, 0.5);
      g.fillCircle(fx, fy - 4, 2);
    }
    
    // Legs with flame-etched greaves
    g.fillStyle(0x333333, 1);
    g.fillRect(-14, 10 + bounce, 8, 18);
    g.fillRect(6, 10 + bounce, 8, 18);
    // Flame etchings
    g.fillStyle(0xFF4400, 0.6);
    g.fillRect(-12, 14 + bounce, 4, 2);
    g.fillRect(-12, 20 + bounce, 4, 2);
    g.fillRect(8, 14 + bounce, 4, 2);
    g.fillRect(8, 20 + bounce, 4, 2);
    // Boots with flame tips
    g.fillStyle(0x222222, 1);
    g.fillEllipse(-10, 28, 12, 7);
    g.fillEllipse(10, 28, 12, 7);
    g.fillStyle(0xFF6600, 0.7 * flameFlicker);
    g.fillCircle(-14, 26, 3);
    g.fillCircle(14, 26, 3);
    
    // Body - black dragon scale armor with flame accents
    g.fillStyle(0x222222, 1);
    g.fillEllipse(0, 0 + bounce, 36, 28);
    // Dragon scale pattern
    g.fillStyle(0x333333, 1);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        g.fillEllipse(-12 + col * 6, -8 + row * 6 + bounce, 5, 4);
      }
    }
    // Flame veins in armor
    g.fillStyle(0xFF4400, 0.6 * flameFlicker);
    g.fillRect(-10, -2 + bounce, 20, 2);
    g.fillRect(-8, 4 + bounce, 16, 2);
    // Glowing chest core
    g.fillStyle(0xFF6600, 0.8 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 6);
    g.fillStyle(0xFFAA00, 0.6 * flameFlicker);
    g.fillCircle(0, 0 + bounce, 4);
    
    // Left flaming sword
    g.save();
    g.translateCanvas(-20 * faceDirection, -8 + bounce);
    g.rotateCanvas((-swordSwing * 0.03 - 0.3) * faceDirection);
    // Blade
    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -32, 4, 36);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -32, 2, 36);
    // Flame on blade
    for (let i = 0; i < 8; i++) {
      const flameY = -30 + i * 4;
      const flameSize = 4 + Math.sin(bounceTime * 12 + i) * 2;
      const flameOffset = Math.sin(bounceTime * 10 + i * 0.5) * 3;
      g.fillStyle(0xFF4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xFFAA00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xFFFF00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }
    // Tip with flame burst
    g.fillStyle(0xFF6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -32);
    g.lineTo(0, -42 - flameWave * 3);
    g.lineTo(2, -32);
    g.closePath();
    g.fillPath();
    // Guard
    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);
    // Handle
    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();
    
    // Right flaming sword
    g.save();
    g.translateCanvas(26 * faceDirection, -10 + bounce);
    g.rotateCanvas((swordSwing * 0.03 + 0.3) * faceDirection);
    // Blade
    g.fillStyle(0x444444, 1);
    g.fillRect(-2, -34, 4, 38);
    g.fillStyle(0x666666, 1);
    g.fillRect(-1, -34, 2, 38);
    // Flame on blade
    for (let i = 0; i < 9; i++) {
      const flameY = -32 + i * 4;
      const flameSize = 5 + Math.sin(bounceTime * 11 + i * 1.1) * 2;
      const flameOffset = Math.sin(bounceTime * 9 + i * 0.7) * 3;
      g.fillStyle(0xFF4400, 0.8 * flameFlicker);
      g.fillCircle(flameOffset, flameY, flameSize);
      g.fillStyle(0xFFAA00, 0.6 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 2, flameSize * 0.6);
      g.fillStyle(0xFFFF00, 0.4 * flameFlicker);
      g.fillCircle(flameOffset, flameY - 3, flameSize * 0.3);
    }
    // Tip with flame burst
    g.fillStyle(0xFF6600, 0.9);
    g.beginPath();
    g.moveTo(-2, -34);
    g.lineTo(0, -46 - flameWave * 4);
    g.lineTo(2, -34);
    g.closePath();
    g.fillPath();
    // Guard
    g.fillStyle(0x222222, 1);
    g.fillRect(-6, 2, 12, 4);
    // Handle
    g.fillStyle(0x111111, 1);
    g.fillRect(-2, 6, 4, 10);
    g.restore();
    
    // Armored shoulders with flame pauldrons
    g.fillStyle(0x333333, 1);
    g.fillEllipse(-16 * faceDirection, -6 + bounce, 10, 8);
    g.fillEllipse(20 * faceDirection, -6 + bounce, 10, 8);
    // Flame on pauldrons
    g.fillStyle(0xFF4400, 0.7 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -10 + bounce, 5);
    g.fillCircle(20 * faceDirection, -10 + bounce, 5);
    g.fillStyle(0xFFAA00, 0.5 * flameFlicker);
    g.fillCircle(-16 * faceDirection, -13 + bounce, 3);
    g.fillCircle(20 * faceDirection, -13 + bounce, 3);
    
    // Head with dragon flame helm
    g.fillStyle(0x222222, 1);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 18, 16);
    // Face plate with dragon visage
    g.fillStyle(0x333333, 1);
    g.beginPath();
    g.moveTo(12 * faceDirection, -26 + bounce);
    g.lineTo(22 * faceDirection, -18 + bounce);
    g.lineTo(20 * faceDirection, -8 + bounce);
    g.lineTo(8 * faceDirection, -6 + bounce);
    g.lineTo(4 * faceDirection, -18 + bounce);
    g.closePath();
    g.fillPath();
    // Eye slits with fire glow
    g.fillStyle(0x000000, 1);
    g.fillRect(10 * faceDirection, -20 + bounce, 10, 4);
    g.fillStyle(0xFF4400, 0.9 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 3);
    g.fillCircle(18 * faceDirection, -18 + bounce, 3);
    g.fillStyle(0xFFFF00, 0.7 * flameFlicker);
    g.fillCircle(13 * faceDirection, -18 + bounce, 1.5);
    g.fillCircle(18 * faceDirection, -18 + bounce, 1.5);
    // Dragon horns with flames
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
    // Flames on horn tips
    g.fillStyle(0xFF4400, 0.8 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -40 + bounce + flameWave * 2, 4);
    g.fillCircle(18 * faceDirection, -42 + bounce + flameWave * 2, 4);
    g.fillStyle(0xFFAA00, 0.6 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -44 + bounce + flameWave * 3, 3);
    g.fillCircle(18 * faceDirection, -46 + bounce + flameWave * 3, 3);
    g.fillStyle(0xFFFF00, 0.4 * flameFlicker);
    g.fillCircle(-4 * faceDirection, -47 + bounce + flameWave * 4, 2);
    g.fillCircle(18 * faceDirection, -49 + bounce + flameWave * 4, 2);
  }
}
