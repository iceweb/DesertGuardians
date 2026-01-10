import Phaser from 'phaser';

/**
 * CreepGraphics handles all creep rendering/drawing logic.
 * Extracted from Creep to keep files under 500 LOC.
 */
export class CreepGraphics {
  /**
   * Draw a creep based on type
   */
  static drawCreep(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean = false,
    isJumping: boolean = false,
    isBurrowed: boolean = false
  ): void {
    g.clear();
    
    // If burrowed, draw tunnel shadow instead of normal creep
    if (isBurrowed) {
      CreepGraphics.drawBurrowedTunnel(g, bounceTime, faceDirection);
      return;
    }
    
    switch (type) {
      case 'furball':
        CreepGraphics.drawFurball(g, bounceTime, faceDirection);
        break;
      case 'runner':
        CreepGraphics.drawRunner(g, bounceTime, faceDirection);
        break;
      case 'tank':
        CreepGraphics.drawTank(g, bounceTime, faceDirection);
        break;
      case 'boss':
        CreepGraphics.drawBoss(g, bounceTime, faceDirection);
        break;
      case 'boss_1':
        CreepGraphics.drawBoss1(g, bounceTime, faceDirection);
        break;
      case 'boss_2':
        CreepGraphics.drawBoss2(g, bounceTime, faceDirection);
        break;
      case 'boss_3':
        CreepGraphics.drawBoss3(g, bounceTime, faceDirection);
        break;
      case 'boss_4':
        CreepGraphics.drawBoss4(g, bounceTime, faceDirection);
        break;
      case 'boss_5':
        CreepGraphics.drawBoss5(g, bounceTime, faceDirection);
        break;
      case 'jumper':
        CreepGraphics.drawJumper(g, bounceTime, faceDirection, isFlashing, isJumping);
        break;
      case 'shielded':
        CreepGraphics.drawShielded(g, bounceTime, faceDirection);
        break;
      case 'flying':
        CreepGraphics.drawFlying(g, bounceTime, faceDirection);
        break;
      case 'digger':
        CreepGraphics.drawDigger(g, bounceTime, faceDirection);
        break;
      case 'ghost':
        CreepGraphics.drawGhost(g, bounceTime, faceDirection);
        break;
      case 'broodmother':
        CreepGraphics.drawBroodmother(g, bounceTime, faceDirection);
        break;
      case 'baby':
        CreepGraphics.drawBaby(g, bounceTime, faceDirection);
        break;
      case 'flame':
        CreepGraphics.drawFlame(g, bounceTime, faceDirection);
        break;
      case 'plaguebearer':
        CreepGraphics.drawPlaguebearer(g, bounceTime, faceDirection);
        break;
      default:
        CreepGraphics.drawFurball(g, bounceTime, faceDirection);
    }
  }

  static drawFurball(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 8) * 3;
    const squish = 1 + Math.sin(bounceTime * 8) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body (fluffy ball)
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(0 * faceDirection, -5 + bounce, 24 * squish, 22 / squish);
    
    // Fur texture
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(-6 * faceDirection, -8 + bounce, 8, 10);
    g.fillEllipse(6 * faceDirection, -2 + bounce, 10, 8);
    
    // Face
    g.fillStyle(0xDEB887, 1);
    g.fillEllipse(8 * faceDirection, -6 + bounce, 12, 10);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(10 * faceDirection, -9 + bounce, 3);
    g.fillCircle(14 * faceDirection, -7 + bounce, 2);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(9 * faceDirection, -10 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(16 * faceDirection, -4 + bounce, 3);
    
    // Ears
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(-4 * faceDirection, -20 + bounce, 6, 10);
    g.fillEllipse(4 * faceDirection, -22 + bounce, 6, 10);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(-4 * faceDirection, -19 + bounce, 3, 6);
    g.fillEllipse(4 * faceDirection, -21 + bounce, 3, 6);
    
    // Feet
    g.fillStyle(0x654321, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  static drawRunner(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 12) * 4;
    const legPhase = Math.sin(bounceTime * 12);
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 16, 24, 8);
    
    // Legs (animated)
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(-6, 12 + legPhase * 4, 5, 8);
    g.fillEllipse(6, 12 - legPhase * 4, 5, 8);
    
    // Body
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(0 * faceDirection, -2 + bounce, 18, 16);
    
    // Stripe
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(0, -2 + bounce, 14, 8);
    
    // Head
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(10 * faceDirection, -6 + bounce, 12, 10);
    
    // Ears
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(2 * faceDirection, -22 + bounce, 5, 14);
    g.fillEllipse(8 * faceDirection, -20 + bounce, 5, 12);
    g.fillStyle(0xFFB6C1, 0.6);
    g.fillEllipse(2 * faceDirection, -20 + bounce, 2, 8);
    g.fillEllipse(8 * faceDirection, -18 + bounce, 2, 7);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -8 + bounce, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -9 + bounce, 1);
    
    // Nose
    g.fillStyle(0xFF1493, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 2);
  }

  static drawTank(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 22, 40, 14);
    
    // Body
    g.fillStyle(0x696969, 1);
    g.fillEllipse(0, 0 + bounce, 32, 28);
    
    // Armor plates
    g.fillStyle(0x808080, 1);
    g.fillEllipse(0, -8 + bounce, 26, 14);
    g.fillStyle(0x505050, 1);
    g.beginPath();
    g.arc(0, -5 + bounce, 18, -2.5, -0.6, false);
    g.lineTo(0, -5 + bounce);
    g.closePath();
    g.fillPath();
    
    // Head
    g.fillStyle(0x808080, 1);
    g.fillEllipse(14 * faceDirection, -2 + bounce, 14, 12);
    
    // Helmet
    g.fillStyle(0x505050, 1);
    g.fillRect(8 * faceDirection, -12 + bounce, 14, 6);
    
    // Eyes
    g.fillStyle(0xFF0000, 0.8);
    g.fillCircle(18 * faceDirection, -4 + bounce, 3);
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(18 * faceDirection, -4 + bounce, 1.5);
    
    // Tusks
    g.fillStyle(0xFFFFF0, 1);
    g.beginPath();
    g.moveTo(20 * faceDirection, 2 + bounce);
    g.lineTo(28 * faceDirection, -2 + bounce);
    g.lineTo(26 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
    
    // Feet
    g.fillStyle(0x404040, 1);
    g.fillEllipse(-12, 18, 10, 6);
    g.fillEllipse(12, 18, 10, 6);
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
   * Boss 1: "Mini Boss" - Small but fierce, red goblin-like creature
   */
  static drawBoss1(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 5) * 2;
    const rage = 1 + Math.sin(bounceTime * 10) * 0.05;
    
    // Rage aura
    g.fillStyle(0xFF4444, 0.15);
    g.fillCircle(0, 0, 35 * rage);
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 32, 12);
    
    // Body - compact and muscular
    g.fillStyle(0xCC2222, 1);
    g.fillEllipse(0, 0 + bounce, 28, 24);
    
    // Muscle definition
    g.fillStyle(0xDD4444, 1);
    g.fillEllipse(-8, -4 + bounce, 10, 12);
    g.fillEllipse(8, -4 + bounce, 10, 12);
    
    // Head
    g.fillStyle(0xDD3333, 1);
    g.fillEllipse(12 * faceDirection, -10 + bounce, 16, 14);
    
    // Angry eyebrows
    g.fillStyle(0x660000, 1);
    g.fillRect(6 * faceDirection, -18 + bounce, 12, 3);
    
    // Eyes - fierce yellow
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(10 * faceDirection, -12 + bounce, 4);
    g.fillCircle(18 * faceDirection, -10 + bounce, 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(11 * faceDirection, -12 + bounce, 2);
    g.fillCircle(19 * faceDirection, -10 + bounce, 1.5);
    
    // Horns (small)
    g.fillStyle(0x333333, 1);
    g.beginPath();
    g.moveTo(4 * faceDirection, -22 + bounce);
    g.lineTo(0, -30 + bounce);
    g.lineTo(-2 * faceDirection, -22 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(16 * faceDirection, -18 + bounce);
    g.lineTo(20 * faceDirection, -26 + bounce);
    g.lineTo(12 * faceDirection, -20 + bounce);
    g.closePath();
    g.fillPath();
    
    // Mouth with fangs
    g.fillStyle(0x1a0000, 1);
    g.fillEllipse(16 * faceDirection, 0 + bounce, 8, 5);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(12 * faceDirection, -2 + bounce, 2, 4);
    g.fillRect(18 * faceDirection, -1 + bounce, 2, 3);
    
    // Arms
    g.fillStyle(0xCC2222, 1);
    g.fillEllipse(-18, 6 + bounce, 8, 6);
    g.fillEllipse(18, 6 + bounce, 8, 6);
    
    // Feet
    g.fillStyle(0x991111, 1);
    g.fillEllipse(-10, 20, 8, 5);
    g.fillEllipse(10, 20, 8, 5);
  }

  /**
   * Boss 2: "Warlord" - Armored knight-like boss with shield
   */
  static drawBoss2(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 4) * 2;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.03;
    
    // Menacing aura
    g.fillStyle(0x4444AA, 0.15);
    g.fillCircle(0, 0, 45 * pulse);
    
    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, 28, 40, 14);
    
    // Body - heavily armored
    g.fillStyle(0x555577, 1);
    g.fillEllipse(0, 2 + bounce, 34, 28);
    
    // Armor plates
    g.fillStyle(0x6666AA, 1);
    g.fillRect(-14, -10 + bounce, 28, 20);
    g.fillStyle(0x7777CC, 1);
    g.fillRect(-10, -6 + bounce, 20, 4);
    g.fillRect(-10, 2 + bounce, 20, 4);
    
    // Shoulder plates
    g.fillStyle(0x5555AA, 1);
    g.fillEllipse(-22, -2 + bounce, 12, 10);
    g.fillEllipse(22, -2 + bounce, 12, 10);
    g.fillStyle(0x7777DD, 1);
    g.fillCircle(-22, -4 + bounce, 4);
    g.fillCircle(22, -4 + bounce, 4);
    
    // Helmet
    g.fillStyle(0x666699, 1);
    g.fillEllipse(10 * faceDirection, -14 + bounce, 16, 18);
    
    // Helmet visor
    g.fillStyle(0x222244, 1);
    g.fillRect(4 * faceDirection, -16 + bounce, 14, 8);
    
    // Eyes glowing through visor
    g.fillStyle(0xFF4444, 0.9);
    g.fillCircle(8 * faceDirection, -12 + bounce, 2);
    g.fillCircle(14 * faceDirection, -12 + bounce, 2);
    
    // Helmet crest
    g.fillStyle(0xCC3333, 1);
    g.beginPath();
    g.moveTo(6 * faceDirection, -30 + bounce);
    g.lineTo(10 * faceDirection, -35 + bounce);
    g.lineTo(14 * faceDirection, -30 + bounce);
    g.closePath();
    g.fillPath();
    
    // Shield
    g.fillStyle(0x444488, 1);
    g.fillRect(-28 * faceDirection, -8 + bounce, 8, 24);
    g.fillStyle(0x6666CC, 1);
    g.fillRect(-26 * faceDirection, -4 + bounce, 4, 16);
    
    // Sword
    g.fillStyle(0xAAAAAA, 1);
    g.fillRect(28 * faceDirection, -20 + bounce, 3, 30);
    g.fillStyle(0xDDDDDD, 1);
    g.fillRect(26 * faceDirection, -22 + bounce, 7, 4);
    
    // Feet
    g.fillStyle(0x444466, 1);
    g.fillEllipse(-12, 24, 10, 6);
    g.fillEllipse(12, 24, 10, 6);
  }

  /**
   * Boss 3: "Necromancer" - Dark magical boss with floating runes
   */
  static drawBoss3(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const float = Math.sin(bounceTime * 3) * 4;
    const runeRotation = bounceTime * 2;
    
    // Dark magic aura
    g.fillStyle(0x220044, 0.2);
    g.fillCircle(0, -5 + float, 55);
    g.fillStyle(0x440088, 0.15);
    g.fillCircle(0, -5 + float, 45);
    
    // Floating runes around boss
    for (let i = 0; i < 4; i++) {
      const angle = runeRotation + (i * Math.PI / 2);
      const runeX = Math.cos(angle) * 35;
      const runeY = Math.sin(angle) * 20 - 5 + float;
      const alpha = 0.6 + Math.sin(bounceTime * 4 + i) * 0.3;
      
      g.fillStyle(0x9900FF, alpha);
      g.fillCircle(runeX, runeY, 5);
      g.fillStyle(0xCC66FF, alpha * 0.8);
      g.fillCircle(runeX, runeY, 3);
    }
    
    // Shadow (faint, floating)
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 30, 35, 10);
    
    // Robed body
    g.fillStyle(0x220033, 1);
    g.beginPath();
    g.moveTo(-20, 5 + float);
    g.lineTo(-25, 25 + float);
    g.lineTo(25, 25 + float);
    g.lineTo(20, 5 + float);
    g.closePath();
    g.fillPath();
    
    // Upper robe
    g.fillStyle(0x330044, 1);
    g.fillEllipse(0, -5 + float, 28, 22);
    
    // Robe details
    g.fillStyle(0x550088, 0.6);
    g.fillRect(-2, -10 + float, 4, 30);
    
    // Hood
    g.fillStyle(0x220033, 1);
    g.fillEllipse(8 * faceDirection, -20 + float, 18, 20);
    
    // Hood shadow (face hidden)
    g.fillStyle(0x110022, 1);
    g.fillEllipse(10 * faceDirection, -18 + float, 12, 14);
    
    // Glowing eyes from hood
    g.fillStyle(0xFF00FF, 0.9);
    g.fillCircle(6 * faceDirection, -20 + float, 3);
    g.fillCircle(14 * faceDirection, -20 + float, 3);
    g.fillStyle(0xFFAAFF, 1);
    g.fillCircle(5 * faceDirection, -21 + float, 1);
    g.fillCircle(13 * faceDirection, -21 + float, 1);
    
    // Staff
    g.fillStyle(0x553311, 1);
    g.fillRect(-25 * faceDirection, -35 + float, 4, 55);
    
    // Staff orb
    g.fillStyle(0x9900FF, 0.8);
    g.fillCircle(-23 * faceDirection, -40 + float, 8);
    g.fillStyle(0xCC66FF, 1);
    g.fillCircle(-25 * faceDirection, -42 + float, 3);
    
    // Skeletal hands
    g.fillStyle(0xDDCCBB, 1);
    g.fillCircle(-20 * faceDirection, 0 + float, 5);
    g.fillCircle(24 * faceDirection, -5 + float, 4);
  }

  /**
   * Boss 4: "Behemoth" - Massive beast with multiple limbs
   */
  static drawBoss4(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 3) * 3;
    const breathe = 1 + Math.sin(bounceTime * 4) * 0.04;
    
    // Ground shake effect
    g.fillStyle(0x443322, 0.2);
    g.fillCircle(0, 25, 55);
    
    // Large shadow
    g.fillStyle(0x000000, 0.45);
    g.fillEllipse(0, 32, 55, 18);
    
    // Back legs
    g.fillStyle(0x554422, 1);
    g.fillRect(-28, 10 + bounce, 10, 22);
    g.fillRect(18, 10 + bounce, 10, 22);
    
    // Massive body
    g.fillStyle(0x664433, 1);
    g.fillEllipse(0, 0 + bounce, 48 * breathe, 36 * breathe);
    
    // Body texture
    g.fillStyle(0x775544, 1);
    g.fillEllipse(-12, -8 + bounce, 14, 16);
    g.fillEllipse(10, 4 + bounce, 16, 14);
    g.fillStyle(0x886655, 0.7);
    g.fillCircle(-5, 10 + bounce, 8);
    
    // Spines on back
    g.fillStyle(0x332211, 1);
    for (let i = 0; i < 5; i++) {
      const spineX = -16 + i * 8;
      const spineHeight = 10 + Math.sin(bounceTime * 5 + i) * 2;
      g.beginPath();
      g.moveTo(spineX - 4, -20 + bounce);
      g.lineTo(spineX, -20 - spineHeight + bounce);
      g.lineTo(spineX + 4, -20 + bounce);
      g.closePath();
      g.fillPath();
    }
    
    // Front legs (4 of them)
    g.fillStyle(0x554422, 1);
    g.fillRect(-35, -5 + bounce, 8, 32);
    g.fillRect(-24, 0 + bounce, 6, 28);
    g.fillRect(18, 0 + bounce, 6, 28);
    g.fillRect(27, -5 + bounce, 8, 32);
    
    // Clawed feet
    g.fillStyle(0x221100, 1);
    g.fillEllipse(-31, 26, 8, 5);
    g.fillEllipse(-21, 26, 6, 4);
    g.fillEllipse(21, 26, 6, 4);
    g.fillEllipse(31, 26, 8, 5);
    
    // Head
    g.fillStyle(0x775544, 1);
    g.fillEllipse(20 * faceDirection, -8 + bounce, 20, 18);
    
    // Massive jaw
    g.fillStyle(0x664433, 1);
    g.fillEllipse(28 * faceDirection, 2 + bounce, 14, 10);
    
    // Eyes - 4 small menacing eyes
    g.fillStyle(0xFF6600, 1);
    g.fillCircle(14 * faceDirection, -14 + bounce, 3);
    g.fillCircle(20 * faceDirection, -16 + bounce, 2.5);
    g.fillCircle(26 * faceDirection, -14 + bounce, 3);
    g.fillCircle(20 * faceDirection, -10 + bounce, 2);
    g.fillStyle(0x000000, 1);
    g.fillCircle(15 * faceDirection, -14 + bounce, 1.5);
    g.fillCircle(20 * faceDirection, -16 + bounce, 1);
    g.fillCircle(27 * faceDirection, -14 + bounce, 1.5);
    
    // Tusks
    g.fillStyle(0xFFFFEE, 1);
    g.beginPath();
    g.moveTo(22 * faceDirection, 4 + bounce);
    g.lineTo(28 * faceDirection, 14 + bounce);
    g.lineTo(24 * faceDirection, 6 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(32 * faceDirection, 4 + bounce);
    g.lineTo(38 * faceDirection, 12 + bounce);
    g.lineTo(34 * faceDirection, 6 + bounce);
    g.closePath();
    g.fillPath();
  }

  /**
   * Boss 5: "Overlord" - Ultimate boss with wings and crown, demonic appearance
   */
  static drawBoss5(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const hover = Math.sin(bounceTime * 2.5) * 4;
    const wingFlap = Math.sin(bounceTime * 4) * 0.3;
    const pulse = 1 + Math.sin(bounceTime * 6) * 0.05;
    
    // Massive dark aura
    g.fillStyle(0x440000, 0.15);
    g.fillCircle(0, -5 + hover, 70 * pulse);
    g.fillStyle(0x880000, 0.1);
    g.fillCircle(0, -5 + hover, 60 * pulse);
    g.fillStyle(0xFF0000, 0.05);
    g.fillCircle(0, -5 + hover, 50 * pulse);
    
    // Shadow (large, menacing)
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(0, 35, 60, 20);
    
    // Wings (massive, bat-like)
    g.fillStyle(0x330011, 0.9);
    // Left wing
    g.beginPath();
    g.moveTo(-18, -10 + hover);
    g.lineTo(-50, -30 + hover + wingFlap * 30);
    g.lineTo(-60, -15 + hover + wingFlap * 25);
    g.lineTo(-55, 0 + hover + wingFlap * 20);
    g.lineTo(-45, 10 + hover + wingFlap * 15);
    g.lineTo(-25, 5 + hover);
    g.closePath();
    g.fillPath();
    // Right wing
    g.beginPath();
    g.moveTo(18, -10 + hover);
    g.lineTo(50, -30 + hover + wingFlap * 30);
    g.lineTo(60, -15 + hover + wingFlap * 25);
    g.lineTo(55, 0 + hover + wingFlap * 20);
    g.lineTo(45, 10 + hover + wingFlap * 15);
    g.lineTo(25, 5 + hover);
    g.closePath();
    g.fillPath();
    
    // Wing membrane details
    g.lineStyle(2, 0x550022, 0.8);
    g.beginPath();
    g.moveTo(-18, -10 + hover);
    g.lineTo(-45, -20 + hover + wingFlap * 25);
    g.strokePath();
    g.beginPath();
    g.moveTo(-20, -5 + hover);
    g.lineTo(-50, 0 + hover + wingFlap * 20);
    g.strokePath();
    g.beginPath();
    g.moveTo(18, -10 + hover);
    g.lineTo(45, -20 + hover + wingFlap * 25);
    g.strokePath();
    g.beginPath();
    g.moveTo(20, -5 + hover);
    g.lineTo(50, 0 + hover + wingFlap * 20);
    g.strokePath();
    
    // Main body
    g.fillStyle(0x551111, 1);
    g.fillEllipse(0, 0 + hover, 38 * pulse, 32 * pulse);
    
    // Armor/scales
    g.fillStyle(0x771122, 1);
    g.fillEllipse(0, -8 + hover, 30, 18);
    g.fillStyle(0x882233, 0.8);
    g.fillEllipse(-10, 4 + hover, 12, 14);
    g.fillEllipse(10, 4 + hover, 12, 14);
    
    // Demonic head
    g.fillStyle(0x661111, 1);
    g.fillEllipse(14 * faceDirection, -12 + hover, 18, 16);
    
    // Face details
    g.fillStyle(0x882222, 1);
    g.fillEllipse(18 * faceDirection, -10 + hover, 12, 10);
    
    // Grand crown with gems
    g.fillStyle(0xFFD700, 1);
    g.beginPath();
    g.moveTo(-6 * faceDirection, -28 + hover);
    g.lineTo(-4 * faceDirection, -40 + hover);
    g.lineTo(0, -32 + hover);
    g.lineTo(6 * faceDirection, -45 + hover);
    g.lineTo(10 * faceDirection, -32 + hover);
    g.lineTo(16 * faceDirection, -42 + hover);
    g.lineTo(18 * faceDirection, -28 + hover);
    g.closePath();
    g.fillPath();
    
    // Crown gems
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(6 * faceDirection, -38 + hover, 4);
    g.fillStyle(0x00FF00, 1);
    g.fillCircle(-2 * faceDirection, -34 + hover, 3);
    g.fillCircle(14 * faceDirection, -36 + hover, 3);
    
    // Massive horns
    g.fillStyle(0x222222, 1);
    g.beginPath();
    g.moveTo(-2 * faceDirection, -26 + hover);
    g.lineTo(-12 * faceDirection, -50 + hover);
    g.lineTo(-8 * faceDirection, -48 + hover);
    g.lineTo(-6 * faceDirection, -26 + hover);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(22 * faceDirection, -24 + hover);
    g.lineTo(36 * faceDirection, -45 + hover);
    g.lineTo(32 * faceDirection, -44 + hover);
    g.lineTo(26 * faceDirection, -24 + hover);
    g.closePath();
    g.fillPath();
    
    // Glowing demonic eyes
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(12 * faceDirection, -16 + hover, 5);
    g.fillCircle(22 * faceDirection, -14 + hover, 4);
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(10 * faceDirection, -18 + hover, 2);
    g.fillCircle(20 * faceDirection, -16 + hover, 1.5);
    
    // Third eye (center)
    g.fillStyle(0xFF00FF, 0.9);
    g.fillCircle(16 * faceDirection, -6 + hover, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(15 * faceDirection, -7 + hover, 1);
    
    // Fanged mouth
    g.fillStyle(0x220000, 1);
    g.fillEllipse(20 * faceDirection, 2 + hover, 10, 7);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(14 * faceDirection, -1 + hover, 3, 5);
    g.fillRect(20 * faceDirection, 0 + hover, 2, 4);
    g.fillRect(24 * faceDirection, -1 + hover, 3, 5);
    
    // Clawed arms
    g.fillStyle(0x551111, 1);
    g.fillEllipse(-28, 8 + hover, 10, 8);
    g.fillEllipse(28, 8 + hover, 10, 8);
    
    // Claws
    g.fillStyle(0x222222, 1);
    g.fillCircle(-32, 12 + hover, 4);
    g.fillCircle(-36, 10 + hover, 3);
    g.fillCircle(32, 12 + hover, 4);
    g.fillCircle(36, 10 + hover, 3);
    
    // Feet with claws
    g.fillStyle(0x441111, 1);
    g.fillEllipse(-14, 28, 12, 8);
    g.fillEllipse(14, 28, 12, 8);
    g.fillStyle(0x222222, 1);
    g.fillCircle(-18, 30, 3);
    g.fillCircle(-10, 31, 2);
    g.fillCircle(18, 30, 3);
    g.fillCircle(10, 31, 2);
  }

  static drawJumper(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean,
    isJumping: boolean
  ): void {
    const bounce = isJumping ? -15 : Math.sin(bounceTime * 10) * 5;
    const legSquat = isJumping ? 0.5 : 1;
    
    const bodyColor = isFlashing ? 0xFFFFFF : 0x32CD32;
    const darkColor = isFlashing ? 0xDDDDDD : 0x228B22;
    
    // Shadow
    const shadowAlpha = isJumping ? 0.15 : 0.3;
    g.fillStyle(0x000000, shadowAlpha);
    g.fillEllipse(0, 20, 26, 10);
    
    // Legs
    g.fillStyle(darkColor, 1);
    g.fillEllipse(-8, 14 * legSquat, 6, 10 * legSquat);
    g.fillEllipse(8, 14 * legSquat, 6, 10 * legSquat);
    
    // Body
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -4 + bounce, 20, 18);
    
    // Spots
    g.fillStyle(darkColor, 1);
    g.fillCircle(-6, -8 + bounce, 4);
    g.fillCircle(4, -2 + bounce, 5);
    g.fillCircle(-3, 4 + bounce, 3);
    
    // Head
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(10 * faceDirection, -8 + bounce, 12, 10);
    
    // Ears
    g.fillStyle(bodyColor, 1);
    g.fillEllipse(0, -26 + bounce, 6, 16);
    g.fillEllipse(8 * faceDirection, -24 + bounce, 5, 14);
    g.fillStyle(0xFFB6C1, 0.7);
    g.fillEllipse(0, -24 + bounce, 3, 10);
    g.fillEllipse(8 * faceDirection, -22 + bounce, 2.5, 9);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -10 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12 * faceDirection, -12 + bounce, 2);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(18 * faceDirection, -6 + bounce, 3);
    
    // Jump dust
    if (isJumping) {
      g.fillStyle(0xDEB887, 0.5);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 15 + Math.random() * 10;
        g.fillCircle(Math.cos(angle) * dist, 20 + Math.random() * 5, 4 + Math.random() * 3);
      }
    }
  }

  static drawShielded(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 7) * 3;
    const shimmer = Math.sin(bounceTime * 15) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 18, 28, 10);
    
    // Body
    g.fillStyle(0x9400D3, 1);
    g.fillEllipse(0, -3 + bounce, 22, 20);
    
    // Markings
    g.fillStyle(0xE6E6FA, 0.6 + shimmer);
    g.fillCircle(-5, -8 + bounce, 3);
    g.fillCircle(5, 0 + bounce, 4);
    g.fillCircle(-2, 6 + bounce, 2);
    g.lineStyle(2, 0xE6E6FA, 0.5);
    g.beginPath();
    g.moveTo(-8, -2 + bounce);
    g.lineTo(0, -10 + bounce);
    g.lineTo(8, -2 + bounce);
    g.strokePath();
    
    // Head
    g.fillStyle(0xBA55D3, 1);
    g.fillEllipse(10 * faceDirection, -5 + bounce, 12, 10);
    
    // Gem
    g.fillStyle(0x00FFFF, 0.8 + shimmer);
    g.fillCircle(8 * faceDirection, -14 + bounce, 4);
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(6 * faceDirection, -15 + bounce, 1.5);
    
    // Eyes
    g.fillStyle(0x00FFFF, 0.9);
    g.fillCircle(14 * faceDirection, -7 + bounce, 4);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -8 + bounce, 2);
    
    // Ears
    g.fillStyle(0x9400D3, 1);
    g.fillEllipse(0, -22 + bounce, 5, 12);
    g.fillEllipse(6 * faceDirection, -20 + bounce, 4, 10);
    g.fillStyle(0x00FFFF, 0.7);
    g.fillCircle(0, -30 + bounce, 3);
    g.fillCircle(6 * faceDirection, -27 + bounce, 2.5);
    
    // Feet
    g.fillStyle(0x7B68EE, 1);
    g.fillEllipse(-8, 15, 6, 4);
    g.fillEllipse(8, 15, 6, 4);
  }

  /**
   * Draw flying creep - winged creature that hovers
   */
  static drawFlying(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const hover = Math.sin(bounceTime * 6) * 6;
    const wingFlap = Math.sin(bounceTime * 20) * 0.4;
    
    // Shadow (further below to show height)
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 25, 20, 8);
    
    // Wings
    g.fillStyle(0x87CEEB, 0.7);
    // Left wing
    g.beginPath();
    g.moveTo(-8, -5 + hover);
    g.lineTo(-28, -15 + hover + wingFlap * 20);
    g.lineTo(-25, -5 + hover + wingFlap * 15);
    g.lineTo(-18, 0 + hover + wingFlap * 10);
    g.closePath();
    g.fillPath();
    // Right wing
    g.beginPath();
    g.moveTo(8, -5 + hover);
    g.lineTo(28, -15 + hover + wingFlap * 20);
    g.lineTo(25, -5 + hover + wingFlap * 15);
    g.lineTo(18, 0 + hover + wingFlap * 10);
    g.closePath();
    g.fillPath();
    
    // Wing shine
    g.fillStyle(0xADD8E6, 0.5);
    g.fillEllipse(-20, -10 + hover + wingFlap * 15, 6, 4);
    g.fillEllipse(20, -10 + hover + wingFlap * 15, 6, 4);
    
    // Body
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(0, -2 + hover, 16, 14);
    
    // Belly
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(0, 2 + hover, 10, 8);
    
    // Head
    g.fillStyle(0x4169E1, 1);
    g.fillCircle(10 * faceDirection, -6 + hover, 8);
    
    // Eyes
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(13 * faceDirection, -8 + hover, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -8 + hover, 2);
    
    // Beak
    g.fillStyle(0xFFA500, 1);
    g.beginPath();
    g.moveTo(16 * faceDirection, -6 + hover);
    g.lineTo(24 * faceDirection, -4 + hover);
    g.lineTo(16 * faceDirection, -2 + hover);
    g.closePath();
    g.fillPath();
    
    // Tail feathers
    g.fillStyle(0x4169E1, 1);
    g.fillEllipse(-12 * faceDirection, 4 + hover, 8, 4);
    g.fillStyle(0x6495ED, 1);
    g.fillEllipse(-14 * faceDirection, 6 + hover, 6, 3);
  }

  /**
   * Draw digger creep - mole-like with claws
   */
  static drawDigger(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 8) * 2;
    const digMotion = Math.sin(bounceTime * 12) * 3;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 16, 28, 10);
    
    // Body
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(0, 0 + bounce, 22, 18);
    
    // Fur
    g.fillStyle(0x654321, 1);
    g.fillEllipse(0, -6 + bounce, 18, 10);
    
    // Head
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(12 * faceDirection, -2 + bounce, 14, 12);
    
    // Snout
    g.fillStyle(0xDEB887, 1);
    g.fillEllipse(20 * faceDirection, 0 + bounce, 8, 6);
    
    // Nose
    g.fillStyle(0xFF69B4, 1);
    g.fillCircle(26 * faceDirection, 0 + bounce, 4);
    
    // Eyes (small, beady)
    g.fillStyle(0x000000, 1);
    g.fillCircle(14 * faceDirection, -6 + bounce, 2);
    
    // Claws (front)
    g.fillStyle(0x2F2F2F, 1);
    // Left claw
    g.beginPath();
    g.moveTo(-10, 8 + bounce);
    g.lineTo(-18, 12 + digMotion);
    g.lineTo(-14, 8 + digMotion);
    g.lineTo(-20, 14 + digMotion);
    g.lineTo(-12, 10 + digMotion);
    g.lineTo(-16, 16 + digMotion);
    g.lineTo(-8, 12 + bounce);
    g.closePath();
    g.fillPath();
    // Right claw
    g.beginPath();
    g.moveTo(10, 8 + bounce);
    g.lineTo(18, 12 - digMotion);
    g.lineTo(14, 8 - digMotion);
    g.lineTo(20, 14 - digMotion);
    g.lineTo(12, 10 - digMotion);
    g.lineTo(16, 16 - digMotion);
    g.lineTo(8, 12 + bounce);
    g.closePath();
    g.fillPath();
    
    // Ears
    g.fillStyle(0x8B4513, 1);
    g.fillCircle(4 * faceDirection, -14 + bounce, 5);
    g.fillCircle(-4 * faceDirection, -12 + bounce, 4);
  }

  /**
   * Draw burrowed tunnel shadow - moving dirt mound showing underground movement
   */
  static drawBurrowedTunnel(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const rumble = Math.sin(bounceTime * 15) * 1.5;
    const pulse = 1 + Math.sin(bounceTime * 8) * 0.08;
    
    // Ground disturbance / tunnel shadow
    g.fillStyle(0x3d2817, 0.7);
    g.fillEllipse(0 + rumble, 12, 35 * pulse, 12 * pulse);
    
    // Darker center of tunnel
    g.fillStyle(0x2a1a0f, 0.6);
    g.fillEllipse(0 + rumble, 12, 22, 7);
    
    // Moving dirt mound on top
    g.fillStyle(0x8B4513, 0.8);
    g.fillEllipse(faceDirection * 6 + rumble, 8, 18 * pulse, 10 * pulse);
    
    // Lighter dirt highlights
    g.fillStyle(0xA0522D, 0.6);
    g.fillEllipse(faceDirection * 8 + rumble * 0.5, 5, 10, 6);
    
    // Small dirt particles erupting
    for (let i = 0; i < 3; i++) {
      const particleAngle = bounceTime * 6 + i * 2.1;
      const particleX = Math.sin(particleAngle) * 8;
      const particleY = 4 + Math.cos(particleAngle * 1.5) * 3;
      const particleSize = 2 + Math.sin(particleAngle * 0.7) * 1;
      const alpha = 0.4 + Math.sin(particleAngle) * 0.2;
      
      g.fillStyle(0x8B4513, alpha);
      g.fillCircle(particleX + rumble, particleY, particleSize);
    }
    
    // Direction indicator (claw tips emerging briefly)
    if (Math.sin(bounceTime * 5) > 0.7) {
      g.fillStyle(0x2F2F2F, 0.5);
      g.fillCircle(faceDirection * 15 + rumble, 10, 3);
      g.fillCircle(faceDirection * 12 + rumble, 8, 2);
    }
  }
  /**
   * Draw ghost creep - ethereal and translucent
   */
  static drawGhost(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const float = Math.sin(bounceTime * 4) * 5;
    const waver = Math.sin(bounceTime * 8) * 2;
    
    // No shadow (floating)
    
    // Ethereal glow
    g.fillStyle(0x9370DB, 0.15);
    g.fillCircle(0, -5 + float, 35);
    
    // Main body
    g.fillStyle(0xE6E6FA, 0.7);
    g.fillEllipse(0, -8 + float, 22, 20);
    
    // Wavy bottom
    g.fillStyle(0xE6E6FA, 0.6);
    g.beginPath();
    g.moveTo(-14, 5 + float);
    g.lineTo(-10, 15 + float + waver);
    g.lineTo(-4, 10 + float - waver);
    g.lineTo(0, 18 + float + waver);
    g.lineTo(4, 10 + float - waver);
    g.lineTo(10, 15 + float + waver);
    g.lineTo(14, 5 + float);
    g.closePath();
    g.fillPath();
    
    // Inner glow
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillEllipse(0, -10 + float, 14, 12);
    
    // Face
    g.fillStyle(0x9370DB, 0.8);
    g.fillCircle(6 * faceDirection, -10 + float, 10);
    
    // Eyes (hollow)
    g.fillStyle(0x000000, 0.8);
    g.fillEllipse(4 * faceDirection, -12 + float, 4, 5);
    g.fillEllipse(10 * faceDirection, -11 + float, 3, 4);
    
    // Eye glow
    g.fillStyle(0x00FFFF, 0.6);
    g.fillCircle(4 * faceDirection, -11 + float, 1.5);
    g.fillCircle(10 * faceDirection, -10 + float, 1);
    
    // Mouth
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(8 * faceDirection, -4 + float, 5, 3);
    
    // Wispy trails
    g.fillStyle(0xE6E6FA, 0.3);
    const trailY = 20 + float;
    g.fillEllipse(-8, trailY, 4, 8 + waver);
    g.fillEllipse(0, trailY + 3, 3, 10 - waver);
    g.fillEllipse(8, trailY + 1, 4, 9 + waver);
  }

  /**
   * Draw broodmother creep - large, bloated with babies inside
   */
  static drawBroodmother(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 3) * 2;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.03;
    const babyMove = Math.sin(bounceTime * 8);
    
    // Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(0, 22, 38, 14);
    
    // Legs (8 spider-like)
    g.fillStyle(0x228B22, 1);
    for (let i = 0; i < 4; i++) {
      const legAngle = (i - 1.5) * 0.4;
      const legX = Math.cos(legAngle) * 20;
      const legY = 10 + Math.sin(bounceTime * 6 + i) * 2;
      // Left legs
      g.lineStyle(3, 0x228B22, 1);
      g.beginPath();
      g.moveTo(-10, 0 + bounce);
      g.lineTo(-legX - 5, legY);
      g.lineTo(-legX - 10, legY + 8);
      g.strokePath();
      // Right legs
      g.beginPath();
      g.moveTo(10, 0 + bounce);
      g.lineTo(legX + 5, legY);
      g.lineTo(legX + 10, legY + 8);
      g.strokePath();
    }
    
    // Main body (bloated abdomen)
    g.fillStyle(0x228B22, 1);
    g.fillEllipse(0, 2 + bounce, 32 * pulse, 26 * pulse);
    
    // Abdomen pattern
    g.fillStyle(0x32CD32, 0.6);
    g.fillEllipse(0, 5 + bounce, 24 * pulse, 18 * pulse);
    
    // Babies visible inside (bumps)
    g.fillStyle(0x90EE90, 0.5);
    g.fillCircle(-8 + babyMove * 2, -2 + bounce, 6);
    g.fillCircle(6 - babyMove * 2, 4 + bounce, 7);
    g.fillCircle(-4 + babyMove, 10 + bounce, 5);
    g.fillCircle(8 + babyMove, 8 + bounce, 6);
    
    // Thorax
    g.fillStyle(0x228B22, 1);
    g.fillEllipse(16 * faceDirection, -8 + bounce, 14, 12);
    
    // Head
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(24 * faceDirection, -10 + bounce, 8);
    
    // Eyes (multiple)
    g.fillStyle(0x000000, 1);
    g.fillCircle(22 * faceDirection, -14 + bounce, 3);
    g.fillCircle(28 * faceDirection, -12 + bounce, 2.5);
    g.fillCircle(24 * faceDirection, -8 + bounce, 2);
    g.fillCircle(28 * faceDirection, -6 + bounce, 2);
    g.fillStyle(0xFF0000, 0.6);
    g.fillCircle(22 * faceDirection, -14 + bounce, 1.5);
    g.fillCircle(28 * faceDirection, -12 + bounce, 1);
    
    // Mandibles
    g.fillStyle(0x006400, 1);
    g.beginPath();
    g.moveTo(28 * faceDirection, -4 + bounce);
    g.lineTo(34 * faceDirection, 0 + bounce);
    g.lineTo(30 * faceDirection, 2 + bounce);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(26 * faceDirection, -2 + bounce);
    g.lineTo(32 * faceDirection, 4 + bounce);
    g.lineTo(28 * faceDirection, 4 + bounce);
    g.closePath();
    g.fillPath();
  }

  /**
   * Draw baby creep - tiny version that spawns from broodmother
   */
  static drawBaby(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 15) * 2;
    const scurry = Math.sin(bounceTime * 20) * 1;
    
    // Tiny shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, 8, 12, 4);
    
    // Tiny legs
    g.lineStyle(1, 0x228B22, 1);
    for (let i = 0; i < 3; i++) {
      const legOffset = (i - 1) * 4;
      g.beginPath();
      g.moveTo(-4, bounce);
      g.lineTo(-8 + scurry, 6 + legOffset);
      g.strokePath();
      g.beginPath();
      g.moveTo(4, bounce);
      g.lineTo(8 - scurry, 6 + legOffset);
      g.strokePath();
    }
    
    // Body
    g.fillStyle(0x90EE90, 1);
    g.fillEllipse(0, bounce, 10, 8);
    
    // Head
    g.fillStyle(0x32CD32, 1);
    g.fillCircle(6 * faceDirection, -2 + bounce, 5);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillCircle(8 * faceDirection, -3 + bounce, 1.5);
    g.fillCircle(6 * faceDirection, -1 + bounce, 1);
  }

  /**
   * Draw flame creep - burning elemental creature
   */
  static drawFlame(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const flicker = Math.sin(bounceTime * 15) * 2;
    const pulse = 1 + Math.sin(bounceTime * 10) * 0.15;
    
    // Shadow (flickering)
    g.fillStyle(0x000000, 0.2 + Math.sin(bounceTime * 20) * 0.1);
    g.fillEllipse(0, 18, 22, 8);
    
    // Outer flame aura
    g.fillStyle(0xFF4500, 0.4);
    g.fillCircle(0, -5 + flicker, 22 * pulse);
    
    // Main body (fiery core)
    g.fillStyle(0xFF6600, 1);
    g.fillEllipse(0, -3 + flicker, 18 * pulse, 16 * pulse);
    
    // Inner hot core
    g.fillStyle(0xFFAA00, 1);
    g.fillEllipse(0, -5 + flicker, 12, 10);
    
    // Hot center
    g.fillStyle(0xFFDD00, 1);
    g.fillCircle(0, -6 + flicker, 6);
    
    // White hot center
    g.fillStyle(0xFFFFAA, 0.9);
    g.fillCircle(0, -7 + flicker, 3);
    
    // Animated flames (top)
    const flameColors = [0xFF4500, 0xFF6600, 0xFFAA00];
    for (let i = 0; i < 5; i++) {
      const angle = (bounceTime * 8 + i * 1.2) % (Math.PI * 2);
      const flameHeight = 8 + Math.sin(angle) * 6;
      const x = (i - 2) * 4;
      const color = flameColors[i % 3];
      
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(x - 3, -12 + flicker);
      g.lineTo(x, -12 - flameHeight + flicker);
      g.lineTo(x + 3, -12 + flicker);
      g.closePath();
      g.fill();
    }
    
    // Eyes (glowing embers)
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(-4 * faceDirection, -6 + flicker, 3);
    g.fillCircle(4 * faceDirection, -6 + flicker, 3);
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(-4 * faceDirection, -6 + flicker, 2);
    g.fillCircle(4 * faceDirection, -6 + flicker, 2);
  }

  /**
   * Draw plaguebearer - humanoid creature vulnerable to poison
   */
  static drawPlaguebearer(g: Phaser.GameObjects.Graphics, bounceTime: number, faceDirection: number): void {
    const bounce = Math.sin(bounceTime * 6) * 2;
    const sway = Math.sin(bounceTime * 4) * 0.1;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 20, 20, 6);
    
    // Legs (humanoid, shambling)
    const legPhase = Math.sin(bounceTime * 6);
    g.fillStyle(0x556B2F, 1);
    g.fillRect(-6 + legPhase * 2, 5, 4, 15);
    g.fillRect(2 - legPhase * 2, 5, 4, 15);
    
    // Feet
    g.fillStyle(0x3d4f2f, 1);
    g.fillEllipse(-4 + legPhase * 2, 18, 5, 3);
    g.fillEllipse(4 - legPhase * 2, 18, 5, 3);
    
    // Body (tattered robe)
    g.fillStyle(0x4a5d23, 1);
    g.beginPath();
    g.moveTo(-10, 8);
    g.lineTo(-12, -8 + bounce);
    g.lineTo(0, -12 + bounce);
    g.lineTo(12, -8 + bounce);
    g.lineTo(10, 8);
    g.closePath();
    g.fill();
    
    // Robe detail
    g.fillStyle(0x3d4f2f, 1);
    g.fillRect(-2, -5 + bounce, 4, 12);
    
    // Arms (skeletal)
    g.fillStyle(0xc8b896, 1);
    g.fillRect(-14, -4 + bounce + sway * 10, 5, 3);
    g.fillRect(9, -4 + bounce - sway * 10, 5, 3);
    
    // Hands
    g.fillStyle(0xb8a886, 1);
    g.fillCircle(-16, -3 + bounce + sway * 10, 3);
    g.fillCircle(16, -3 + bounce - sway * 10, 3);
    
    // Head (hooded skull)
    g.fillStyle(0x3d4f2f, 1);
    g.fillCircle(0, -18 + bounce, 10);
    
    // Hood opening
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(2 * faceDirection, -17 + bounce, 7, 8);
    
    // Skull face inside hood
    g.fillStyle(0xc8b896, 1);
    g.fillCircle(2 * faceDirection, -17 + bounce, 5);
    
    // Eye sockets (glowing sickly green)
    g.fillStyle(0x00FF88, 1);
    g.fillCircle(-1 * faceDirection + 2 * faceDirection, -19 + bounce, 2);
    g.fillCircle(3 * faceDirection + 2 * faceDirection, -19 + bounce, 2);
    
    // Sickly aura particles
    for (let i = 0; i < 3; i++) {
      const angle = (bounceTime * 3 + i * 2) % (Math.PI * 2);
      const dist = 12 + Math.sin(angle) * 4;
      const px = Math.cos(angle + bounceTime) * dist;
      const py = Math.sin(angle + bounceTime) * dist * 0.5 - 5 + bounce;
      const alpha = 0.3 + Math.sin(angle) * 0.2;
      
      g.fillStyle(0x00FF88, alpha);
      g.fillCircle(px, py, 2);
    }
  }

  /**
   * Draw shield visual effect
   */
  static drawShield(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    shieldHitsRemaining: number
  ): void {
    g.clear();
    
    if (shieldHitsRemaining <= 0) return;
    
    const shimmer = Math.sin(bounceTime * 10) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.05;
    
    // Outer glow
    g.fillStyle(0x00BFFF, 0.15 + shimmer);
    g.fillCircle(0, -5, 38 * pulse);
    
    // Main bubble
    g.lineStyle(3, 0x00BFFF, 0.6 + shimmer);
    g.strokeCircle(0, -5, 32 * pulse);
    
    // Inner shield
    g.lineStyle(2, 0x87CEEB, 0.4);
    g.strokeCircle(0, -5, 28 * pulse);
    
    // Hit indicators
    const indicatorY = -42;
    for (let i = 0; i < shieldHitsRemaining; i++) {
      const indicatorX = (i - 1) * 10;
      g.fillStyle(0x00FFFF, 0.9);
      g.fillCircle(indicatorX, indicatorY, 4);
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillCircle(indicatorX - 1, indicatorY - 1, 1.5);
    }
  }

  /**
   * Draw status effects (slow, poison)
   */
  static drawStatusEffects(
    g: Phaser.GameObjects.Graphics,
    currentTime: number,
    slowAmount: number,
    slowEndTime: number,
    poisonStacks: { damage: number; endTime: number }[]
  ): void {
    g.clear();
    
    // Slow effect (ice crystals)
    if (slowAmount > 0 && currentTime < slowEndTime) {
      const intensity = slowAmount;
      const pulse = Math.sin(currentTime * 0.005) * 0.2;
      
      g.fillStyle(0x87CEEB, 0.3 + pulse);
      g.fillCircle(0, -5, 30);
      
      // Ice crystals
      const numCrystals = Math.floor(intensity * 6) + 2;
      for (let i = 0; i < numCrystals; i++) {
        const angle = (i / numCrystals) * Math.PI * 2 + currentTime * 0.002;
        const dist = 18 + Math.sin(currentTime * 0.003 + i) * 4;
        const crystalX = Math.cos(angle) * dist;
        const crystalY = -5 + Math.sin(angle) * dist * 0.6;
        
        g.fillStyle(0xADD8E6, 0.8);
        g.beginPath();
        g.moveTo(crystalX, crystalY - 6);
        g.lineTo(crystalX + 3, crystalY);
        g.lineTo(crystalX, crystalY + 4);
        g.lineTo(crystalX - 3, crystalY);
        g.closePath();
        g.fillPath();
        
        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(crystalX - 1, crystalY - 2, 1.5);
      }
    }
    
    // Poison effect (bubbles)
    const activePoisonStacks = poisonStacks.filter(s => currentTime < s.endTime);
    if (activePoisonStacks.length > 0) {
      const intensity = Math.min(activePoisonStacks.length / 3, 1);
      
      // Poison aura
      g.fillStyle(0x00FF00, 0.1 + intensity * 0.1);
      g.fillCircle(0, -5, 25);
      
      // Bubbles
      const numBubbles = activePoisonStacks.length * 2 + 2;
      for (let i = 0; i < numBubbles; i++) {
        const bubbleTime = currentTime * 0.003 + i * 1.5;
        const bubbleY = -5 - ((bubbleTime * 10) % 35);
        const bubbleX = Math.sin(bubbleTime * 2 + i) * 12;
        const bubbleSize = 2 + (i % 3);
        const bubbleAlpha = 0.7 - ((bubbleTime * 10) % 35) / 50;
        
        if (bubbleAlpha > 0) {
          g.fillStyle(0x32CD32, bubbleAlpha);
          g.fillCircle(bubbleX, bubbleY, bubbleSize);
          g.fillStyle(0x90EE90, bubbleAlpha * 0.7);
          g.fillCircle(bubbleX - 1, bubbleY - 1, bubbleSize * 0.4);
        }
      }
      
      // Drips
      g.fillStyle(0x228B22, 0.5);
      for (let i = 0; i < activePoisonStacks.length; i++) {
        const dripX = -10 + i * 10;
        const dripPhase = (currentTime * 0.004 + i) % 1;
        const dripY = 10 + dripPhase * 15;
        g.fillEllipse(dripX, dripY, 3, 4 + dripPhase * 2);
      }
    }
  }

  /**
   * Draw death animation
   */
  static drawDeathAnimation(
    g: Phaser.GameObjects.Graphics,
    deathProgress: number,
    creepType: string
  ): void {
    g.clear();
    
    // Get base color for creep type
    let baseColor = 0x8B4513;
    switch (creepType) {
      case 'runner': baseColor = 0x6495ED; break;
      case 'tank': baseColor = 0x696969; break;
      case 'boss':
      case 'boss_1':
      case 'boss_2':
      case 'boss_3':
      case 'boss_4':
      case 'boss_5':
        baseColor = 0x4B0082; break;
      case 'jumper': baseColor = 0x32CD32; break;
      case 'shielded': baseColor = 0x9400D3; break;
      case 'flying': baseColor = 0x4169E1; break;
      case 'digger': baseColor = 0x8B4513; break;
      case 'ghost': baseColor = 0x9370DB; break;
      case 'broodmother': baseColor = 0x228B22; break;
      case 'baby': baseColor = 0x90EE90; break;
      case 'flame': baseColor = 0xFF4500; break;
      case 'plaguebearer': baseColor = 0x00FF88; break;
    }
    
    // Explosion particles
    const numParticles = 12;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const dist = deathProgress * 40;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist * 0.7;
      const size = (1 - deathProgress) * 8;
      const alpha = 1 - deathProgress;
      
      if (size > 0) {
        g.fillStyle(baseColor, alpha);
        g.fillCircle(x, y, size);
        
        // Sparkle
        g.fillStyle(0xFFFFFF, alpha * 0.7);
        g.fillCircle(x, y, size * 0.4);
      }
    }
    
    // Center flash
    const flashSize = (1 - deathProgress) * 20;
    if (flashSize > 0) {
      g.fillStyle(0xFFFFFF, (1 - deathProgress) * 0.8);
      g.fillCircle(0, -5, flashSize);
    }
  }

  /**
   * Draw health bar
   */
  static drawHealthBar(
    bgGraphics: Phaser.GameObjects.Graphics,
    fgGraphics: Phaser.GameObjects.Graphics,
    healthPercent: number,
    maxHealth: number
  ): void {
    bgGraphics.clear();
    fgGraphics.clear();
    
    const barWidth = Math.min(40, 20 + maxHealth / 50);
    const barHeight = 4;
    const barY = -35;
    
    // Background
    bgGraphics.fillStyle(0x000000, 0.7);
    bgGraphics.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    
    // Health
    const healthWidth = barWidth * healthPercent;
    let healthColor = 0x00ff00;
    if (healthPercent < 0.3) {
      healthColor = 0xff0000;
    } else if (healthPercent < 0.6) {
      healthColor = 0xffff00;
    }
    
    fgGraphics.fillStyle(healthColor, 1);
    fgGraphics.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
  }
}
