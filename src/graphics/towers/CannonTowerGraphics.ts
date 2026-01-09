import Phaser from 'phaser';

/**
 * Rock Cannon tower graphics rendering.
 */
export function drawRockCannonTower(g: Phaser.GameObjects.Graphics, level: number): void {
  // Shadow
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 28, 55 + level * 10, 20 + level * 3);
  
  // Level 1: Simple catapult
  // Level 2: Reinforced trebuchet
  // Level 3: Massive siege cannon with glowing core
  
  const baseWidth = 30 + level * 8;
  const towerHeight = 45 + level * 12;
  
  if (level === 1) {
    // Wooden base
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22);
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-baseWidth + 4, 10, (baseWidth - 4) * 2, 14);
    // Wood grain
    g.lineStyle(1, 0x4a3a2a, 0.4);
    g.lineBetween(-baseWidth + 4, 18, baseWidth - 4, 18);
    
    // Simple wooden frame
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-22, -towerHeight, 44, towerHeight + 5);
    g.fillStyle(0x8a7a6a, 1);
    g.fillRect(-18, -towerHeight + 5, 36, towerHeight - 3);
    
    // Simple cannon barrel
    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(0, -towerHeight - 8, 12);
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight - 8, 8);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(0, -towerHeight - 8, 4);
    
    // Few rocks
    g.fillStyle(0x5a4a3a, 1);
    g.fillCircle(-12, -8, 5);
    g.fillCircle(-6, -10, 4);
  } else if (level === 2) {
    // Reinforced stone base
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 26);
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-baseWidth + 4, 10, (baseWidth - 4) * 2, 18);
    // Stone blocks
    g.lineStyle(2, 0x4a3a2a, 0.5);
    g.lineBetween(-baseWidth + 4, 18, baseWidth - 4, 18);
    g.lineBetween(-14, 10, -14, 30);
    g.lineBetween(14, 10, 14, 30);
    
    // Reinforced tower with supports
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-30, -towerHeight, 60, towerHeight + 5);
    g.fillStyle(0x8a7a6a, 1);
    g.fillRect(-26, -towerHeight + 5, 52, towerHeight - 3);
    // Stone supports
    g.fillStyle(0x5a4a3a, 1);
    g.fillRect(-34, -30, 8, 45);
    g.fillRect(26, -30, 8, 45);
    
    // Better cannon
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-10, -towerHeight - 18, 20, 22);
    g.fillStyle(0x5a5a5a, 1);
    g.fillCircle(0, -towerHeight - 12, 16);
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight - 12, 12);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(0, -towerHeight - 12, 6);
    
    // Reinforcement rings
    g.lineStyle(2, 0x3a3a3a, 1);
    g.strokeCircle(0, -towerHeight - 12, 14);
    
    // Rock pile
    g.fillStyle(0x5a4a3a, 1);
    g.fillCircle(-16, -8, 6);
    g.fillCircle(-8, -10, 5);
    g.fillCircle(-12, -15, 4);
    g.fillCircle(14, -8, 5);
    g.fillCircle(9, -11, 4);
  } else {
    // MASSIVE siege fortress base
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-baseWidth, 3, baseWidth * 2, 30);
    g.fillStyle(0x8a7a6a, 1);
    g.fillRect(-baseWidth + 5, 8, (baseWidth - 5) * 2, 22);
    // Heavy stone blocks
    g.lineStyle(2, 0x4a3a2a, 0.6);
    for (let y = 12; y < 30; y += 8) {
      g.lineBetween(-baseWidth + 5, y, baseWidth - 5, y);
    }
    for (let x = -baseWidth + 15; x < baseWidth - 10; x += 20) {
      g.lineBetween(x, 8, x, 30);
    }
    
    // Massive fortress body
    g.fillStyle(0x8a7a6a, 1);
    g.fillRect(-38, -towerHeight, 76, towerHeight + 3);
    g.fillStyle(0x9a8a7a, 1);
    g.fillRect(-34, -towerHeight + 5, 68, towerHeight - 5);
    // Heavy buttresses
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-44, -40, 12, 58);
    g.fillRect(32, -40, 12, 58);
    // Battlements
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-38, -towerHeight - 8, 20, 10);
    g.fillRect(18, -towerHeight - 8, 20, 10);
    
    // MASSIVE SIEGE CANNON with glowing core
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-16, -towerHeight - 25, 32, 30);
    // Outer ring
    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(0, -towerHeight - 15, 24);
    // Middle ring
    g.fillStyle(0x5a5a5a, 1);
    g.fillCircle(0, -towerHeight - 15, 18);
    // Inner chamber
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -towerHeight - 15, 12);
    // GLOWING MOLTEN CORE
    g.fillStyle(0xff6600, 0.4);
    g.fillCircle(0, -towerHeight - 15, 10);
    g.fillStyle(0xff8800, 0.6);
    g.fillCircle(0, -towerHeight - 15, 7);
    g.fillStyle(0xffaa00, 0.8);
    g.fillCircle(0, -towerHeight - 15, 4);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(0, -towerHeight - 15, 2);
    
    // Reinforcement bolts
    g.fillStyle(0x2a2a2a, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const bx = Math.cos(angle) * 20;
      const by = Math.sin(angle) * 20 - towerHeight - 15;
      g.fillCircle(bx, by, 3);
    }
    
    // Steam vents
    g.fillStyle(0xaaaaaa, 0.4);
    g.fillCircle(-28, -towerHeight - 5, 6);
    g.fillCircle(28, -towerHeight - 5, 6);
    g.fillStyle(0xcccccc, 0.2);
    g.fillCircle(-28, -towerHeight - 12, 4);
    g.fillCircle(28, -towerHeight - 12, 4);
    
    // MASSIVE rock pile with variety
    g.fillStyle(0x5a4a3a, 1);
    g.fillCircle(-20, -6, 8);
    g.fillCircle(-10, -10, 7);
    g.fillCircle(-15, -18, 5);
    g.fillCircle(-5, -7, 5);
    g.fillStyle(0x6a5a4a, 1);
    g.fillCircle(18, -6, 7);
    g.fillCircle(10, -12, 6);
    g.fillCircle(15, -18, 4);
    g.fillCircle(5, -8, 5);
    // Some glowing rocks
    g.fillStyle(0x8a4a2a, 1);
    g.fillCircle(-12, -5, 4);
    g.fillStyle(0xff6600, 0.3);
    g.fillCircle(-12, -5, 3);
    g.fillStyle(0x8a4a2a, 1);
    g.fillCircle(8, -5, 3);
    g.fillStyle(0xff6600, 0.3);
    g.fillCircle(8, -5, 2);
    
    // Chains for loading mechanism
    g.lineStyle(2, 0x4a4a4a, 0.8);
    g.lineBetween(-30, -towerHeight, -30, -towerHeight - 30);
    g.lineBetween(30, -towerHeight, 30, -towerHeight - 30);
    // Pulleys
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(-30, -towerHeight - 30, 5);
    g.fillCircle(30, -towerHeight - 30, 5);
  }
}
