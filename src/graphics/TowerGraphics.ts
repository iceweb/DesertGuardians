import Phaser from 'phaser';
import type { TowerBranch } from '../objects/Tower';

/**
 * TowerGraphics handles all tower rendering/drawing logic.
 * Supports levels 1-3 with progressively more sophisticated designs.
 */
export class TowerGraphics {
  /**
   * Draw a tower based on its branch and level
   */
  static drawTower(
    g: Phaser.GameObjects.Graphics,
    branch: TowerBranch,
    level: number
  ): void {
    g.clear();
    
    switch (branch) {
      case 'archer':
        TowerGraphics.drawArcherTower(g, level);
        break;
      case 'rapidfire':
        TowerGraphics.drawRapidFireTower(g, level);
        break;
      case 'sniper':
        TowerGraphics.drawSniperTower(g, level);
        break;
      case 'rockcannon':
        TowerGraphics.drawRockCannonTower(g, level);
        break;
      case 'icetower':
        TowerGraphics.drawIceTower(g, level);
        break;
      case 'poison':
        TowerGraphics.drawPoisonTower(g, level);
        break;
      default:
        TowerGraphics.drawArcherTower(g, level);
    }
    
    // Draw level indicator
    if (level >= 2) {
      TowerGraphics.drawLevelIndicator(g, level);
    }
  }

  /**
   * Draw range indicator circle
   */
  static drawRangeCircle(
    g: Phaser.GameObjects.Graphics,
    range: number
  ): void {
    g.clear();
    g.lineStyle(2, 0xffffff, 0.3);
    g.strokeCircle(0, 0, range);
    g.fillStyle(0xffffff, 0.1);
    g.fillCircle(0, 0, range);
  }

  /**
   * Draw level indicator (stars based on level)
   */
  static drawLevelIndicator(g: Phaser.GameObjects.Graphics, level: number): void {
    if (level === 2) {
      // Two silver stars
      g.fillStyle(0xc0c0c0, 1);
      TowerGraphics.drawStar(g, -8, -98, 5);
      TowerGraphics.drawStar(g, 8, -98, 5);
    } else if (level === 3) {
      // Three gold stars with glow
      g.fillStyle(0xffd700, 0.3);
      g.fillCircle(0, -100, 15);
      g.fillStyle(0xffd700, 1);
      TowerGraphics.drawStar(g, -12, -98, 5);
      TowerGraphics.drawStar(g, 0, -102, 6);
      TowerGraphics.drawStar(g, 12, -98, 5);
    }
  }

  /**
   * Draw a star shape
   */
  private static drawStar(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
    const points: number[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? size : size * 0.5;
      points.push(x + Math.cos(angle) * r);
      points.push(y + Math.sin(angle) * r);
    }
    g.fillPoints(points, true);
  }

  static drawArcherTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow - larger at higher levels
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50 + level * 5, 18 + level * 2);
    
    // Level 1: Simple wooden watchtower
    // Level 2: Reinforced stone tower with flags
    // Level 3: Grand fortress with gold trim and multiple archers
    
    const baseWidth = 28 + level * 6;
    const towerHeight = 55 + level * 15;
    
    // Stone/wood base - material changes with level
    if (level === 1) {
      // Wooden base
      g.fillStyle(0x8b5a2b, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x9a6a3b, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      // Wood grain
      g.lineStyle(1, 0x6b4020, 0.4);
      for (let i = -baseWidth + 6; i < baseWidth - 6; i += 8) {
        g.lineBetween(i, 10, i, 24);
      }
    } else if (level === 2) {
      // Stone base with mortar
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 22);
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 18);
      // Stone blocks
      g.lineStyle(1, 0x6b5344, 0.5);
      g.lineBetween(-baseWidth + 4, 17, baseWidth - 4, 17);
      g.lineBetween(-10, 10, -10, 28);
      g.lineBetween(10, 10, 10, 28);
    } else {
      // Grand marble base with gold inlay
      g.fillStyle(0xa89375, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 26);
      g.fillStyle(0xc8b395, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 22);
      // Gold trim
      g.lineStyle(2, 0xffd700, 0.8);
      g.lineBetween(-baseWidth, 8, baseWidth, 8);
      g.lineBetween(-baseWidth, 34, baseWidth, 34);
      // Decorative pillars
      g.fillStyle(0xffd700, 0.6);
      g.fillRect(-baseWidth - 3, 5, 6, 32);
      g.fillRect(baseWidth - 3, 5, 6, 32);
    }
    
    // Tower body
    if (level === 1) {
      // Simple wooden tower
      g.fillStyle(0xb88a5c, 1);
      g.beginPath();
      g.moveTo(-22, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(22, 10);
      g.closePath();
      g.fillPath();
      // Wood planks
      g.lineStyle(1, 0x8b6a3c, 0.5);
      g.lineBetween(-20, -15, 20, -15);
      g.lineBetween(-19, -35, 19, -35);
    } else if (level === 2) {
      // Stone tower with reinforced corners
      g.fillStyle(0xd4a574, 1);
      g.beginPath();
      g.moveTo(-26, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(26, 10);
      g.closePath();
      g.fillPath();
      // Corner reinforcements
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-28, -towerHeight, 8, towerHeight + 10);
      g.fillRect(20, -towerHeight, 8, towerHeight + 10);
      // Window arches
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -35, 16, 22);
      g.fillStyle(0xe8c896, 1);
      g.fillRect(-10, -38, 20, 4);
    } else {
      // Grand fortress with flying buttresses
      g.fillStyle(0xe4b584, 1);
      g.beginPath();
      g.moveTo(-32, 10);
      g.lineTo(-28, -towerHeight);
      g.lineTo(28, -towerHeight);
      g.lineTo(32, 10);
      g.closePath();
      g.fillPath();
      // Ornate facade
      g.fillStyle(0xf8d8a6, 1);
      g.beginPath();
      g.moveTo(-24, 5);
      g.lineTo(-20, -towerHeight + 5);
      g.lineTo(20, -towerHeight + 5);
      g.lineTo(24, 5);
      g.closePath();
      g.fillPath();
      // Flying buttresses
      g.fillStyle(0xc9a06c, 1);
      g.beginPath();
      g.moveTo(-40, 25);
      g.lineTo(-32, -30);
      g.lineTo(-28, -30);
      g.lineTo(-32, 25);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(40, 25);
      g.lineTo(32, -30);
      g.lineTo(28, -30);
      g.lineTo(32, 25);
      g.closePath();
      g.fillPath();
      // Gold window frames
      g.lineStyle(2, 0xffd700, 0.9);
      g.strokeRect(-10, -38, 20, 28);
      g.strokeRect(-10, -75, 20, 28);
    }
    
    // Windows
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -30, 16, 22);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -28, 10, 18);
    
    if (level >= 2) {
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -60, 16, 18);
      g.fillStyle(0x1a0a00, 1);
      g.fillRect(-5, -58, 10, 14);
    }
    
    // Battlements
    const battY = -towerHeight - 10;
    if (level === 1) {
      g.fillStyle(0xa98a5c, 1);
      g.fillRect(-20, battY, 10, 10);
      g.fillRect(-5, battY, 10, 10);
      g.fillRect(10, battY, 10, 10);
    } else if (level === 2) {
      g.fillStyle(0xc9a06c, 1);
      g.fillRect(-26, battY, 12, 14);
      g.fillRect(-8, battY, 16, 14);
      g.fillRect(14, battY, 12, 14);
      // Corner turrets
      g.fillStyle(0xb99060, 1);
      g.fillCircle(-26, battY + 7, 10);
      g.fillCircle(26, battY + 7, 10);
    } else {
      // Grand crenellations with gold caps
      g.fillStyle(0xd9b07c, 1);
      g.fillRect(-32, battY, 14, 16);
      g.fillRect(-12, battY, 24, 16);
      g.fillRect(18, battY, 14, 16);
      // Gold caps
      g.fillStyle(0xffd700, 0.8);
      g.fillRect(-32, battY - 3, 14, 4);
      g.fillRect(-12, battY - 3, 24, 4);
      g.fillRect(18, battY - 3, 14, 4);
      // Ornate turrets
      g.fillStyle(0xc9a06c, 1);
      g.fillCircle(-35, battY + 8, 12);
      g.fillCircle(35, battY + 8, 12);
      // Turret spires
      g.fillStyle(0xffd700, 1);
      g.beginPath();
      g.moveTo(-35, battY - 5);
      g.lineTo(-32, battY - 20);
      g.lineTo(-38, battY - 5);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(35, battY - 5);
      g.lineTo(32, battY - 20);
      g.lineTo(38, battY - 5);
      g.closePath();
      g.fillPath();
    }
    
    // Archer(s)
    if (level === 1) {
      // Single simple archer
      g.fillStyle(0x4a3020, 1);
      g.fillCircle(0, battY - 12, 7);
      g.fillStyle(0x8b4513, 1);
      g.fillRect(-4, battY - 8, 8, 10);
      // Simple bow
      g.lineStyle(2, 0x654321, 1);
      g.beginPath();
      g.arc(8, battY - 3, 14, -1.5, 1.5, false);
      g.strokePath();
    } else if (level === 2) {
      // Armored archer
      g.fillStyle(0x5a4030, 1);
      g.fillCircle(0, battY - 14, 9);
      g.fillStyle(0x6a6a6a, 1); // Helmet
      g.fillCircle(0, battY - 16, 7);
      g.fillStyle(0x8b4513, 1);
      g.fillRect(-6, battY - 8, 12, 14);
      // Better bow with reinforcement
      g.lineStyle(3, 0x754321, 1);
      g.beginPath();
      g.arc(12, battY - 5, 18, -1.5, 1.5, false);
      g.strokePath();
      g.lineStyle(1, 0xc0c0c0, 1);
      g.lineBetween(10, battY - 20, 10, battY + 10);
    } else {
      // Elite archer with cape
      g.fillStyle(0x5a4030, 1);
      g.fillCircle(0, battY - 16, 10);
      g.fillStyle(0xffd700, 1); // Golden crown
      g.fillRect(-6, battY - 24, 12, 4);
      g.fillTriangle(-6, battY - 24, -8, battY - 28, -4, battY - 24);
      g.fillTriangle(0, battY - 24, 0, battY - 30, 0, battY - 24);
      g.fillTriangle(6, battY - 24, 8, battY - 28, 4, battY - 24);
      // Cape
      g.fillStyle(0xcc3333, 0.9);
      g.beginPath();
      g.moveTo(-8, battY - 10);
      g.lineTo(-15, battY + 15);
      g.lineTo(0, battY + 12);
      g.closePath();
      g.fillPath();
      // Ornate bow
      g.lineStyle(3, 0xffd700, 1);
      g.beginPath();
      g.arc(14, battY - 7, 22, -1.5, 1.5, false);
      g.strokePath();
      g.lineStyle(1, 0xffffff, 1);
      g.lineBetween(14, battY - 28, 14, battY + 14);
      // Second archer silhouette behind
      g.fillStyle(0x3a2010, 0.6);
      g.fillCircle(-20, battY - 10, 6);
      g.fillCircle(20, battY - 10, 6);
    }
    
    // Banners - more elaborate each level
    if (level === 1) {
      g.fillStyle(0xcc3333, 1);
      g.fillTriangle(-22, -towerHeight + 5, -30, -towerHeight + 12, -22, -towerHeight + 20);
    } else if (level === 2) {
      g.fillStyle(0x3366cc, 1);
      g.fillTriangle(-28, -towerHeight + 5, -40, -towerHeight + 18, -28, -towerHeight + 30);
      g.fillStyle(0xcc3333, 1);
      g.fillTriangle(28, -towerHeight + 5, 40, -towerHeight + 18, 28, -towerHeight + 30);
      // Banner emblems
      g.fillStyle(0xffffff, 1);
      g.fillCircle(-32, -towerHeight + 17, 4);
    } else {
      // Royal banners with coat of arms
      g.fillStyle(0xffd700, 1);
      g.fillRect(-38, -towerHeight - 25, 4, 50);
      g.fillRect(34, -towerHeight - 25, 4, 50);
      g.fillStyle(0x990000, 1);
      g.beginPath();
      g.moveTo(-34, -towerHeight - 20);
      g.lineTo(-50, -towerHeight);
      g.lineTo(-34, -towerHeight + 15);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(38, -towerHeight - 20);
      g.lineTo(54, -towerHeight);
      g.lineTo(38, -towerHeight + 15);
      g.closePath();
      g.fillPath();
      // Coat of arms
      g.fillStyle(0xffd700, 1);
      g.fillCircle(-42, -towerHeight, 6);
      g.fillCircle(46, -towerHeight, 6);
      // Crown atop main tower
      g.fillStyle(0xffd700, 1);
      g.fillRect(-12, battY - 35, 24, 8);
      g.fillTriangle(-12, battY - 35, -8, battY - 45, -4, battY - 35);
      g.fillTriangle(0, battY - 35, 0, battY - 48, 0, battY - 35);
      g.fillTriangle(12, battY - 35, 8, battY - 45, 4, battY - 35);
    }
  }

  static drawRapidFireTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50 + level * 8, 18 + level * 2);
    
    // Level 1: Simple machine gun post
    // Level 2: Reinforced bunker with dual guns
    // Level 3: Advanced gatling fortress with rotating barrels
    
    const baseWidth = 25 + level * 6;
    const towerHeight = 50 + level * 12;
    
    if (level === 1) {
      // Simple sandbag base
      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      // Sandbag texture
      g.lineStyle(1, 0x6b5344, 0.4);
      for (let y = 8; y < 22; y += 6) {
        g.lineBetween(-baseWidth + 2, y, baseWidth - 2, y);
      }
      // Simple metal tower
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-18, -towerHeight, 36, towerHeight + 5);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-14, -towerHeight + 5, 28, towerHeight - 3);
      // Single gun barrel
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-4, -towerHeight - 15, 8, 18);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(0, -towerHeight - 15, 4);
      // Simple operator
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(0, -towerHeight + 8, 6);
    } else if (level === 2) {
      // Reinforced bunker base
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth + 3, 6, (baseWidth - 3) * 2, 18);
      // Armor plates
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth - 5, 5, 8, 20);
      g.fillRect(baseWidth - 3, 5, 8, 20);
      // Rivets
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-22, 14, 3);
      g.fillCircle(22, 14, 3);
      g.fillCircle(-12, 14, 2);
      g.fillCircle(12, 14, 2);
      // Reinforced tower
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-24, -towerHeight, 48, towerHeight + 5);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-20, -towerHeight + 5, 40, towerHeight - 3);
      // Dual gun barrels
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-12, -towerHeight - 18, 8, 22);
      g.fillRect(4, -towerHeight - 18, 8, 22);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-8, -towerHeight - 18, 4);
      g.fillCircle(8, -towerHeight - 18, 4);
      // Ammo feed
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(14, -towerHeight, 8, 30);
      g.fillStyle(0xffcc00, 0.6);
      g.fillCircle(18, -towerHeight + 10, 4);
      // Armored operator
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, -towerHeight + 10, 8);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-6, -towerHeight + 15, 12, 10);
    } else {
      // Massive fortress base
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-baseWidth + 4, 4, (baseWidth - 4) * 2, 20);
      // Reinforced armor
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth - 8, 2, 12, 24);
      g.fillRect(baseWidth - 4, 2, 12, 24);
      // Heavy rivets
      g.fillStyle(0x2a2a2a, 1);
      for (let x = -28; x <= 28; x += 14) {
        g.fillCircle(x, 12, 3);
      }
      // Warning stripes
      g.fillStyle(0xffcc00, 1);
      g.fillRect(-baseWidth - 6, -2, 10, 6);
      g.fillRect(baseWidth - 4, -2, 10, 6);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-baseWidth - 3, -2, 3, 6);
      g.fillRect(baseWidth, -2, 3, 6);
      
      // Heavy armored tower
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-30, -towerHeight, 60, towerHeight + 2);
      g.fillStyle(0x7a7a7a, 1);
      g.fillRect(-26, -towerHeight + 5, 52, towerHeight - 8);
      // Side armor plates
      g.fillStyle(0x5a5a5a, 0.9);
      g.fillRect(-36, -towerHeight + 15, 10, 40);
      g.fillRect(26, -towerHeight + 15, 10, 40);
      
      // GATLING GUN ARRAY - the star of level 3!
      // Rotating barrel assembly
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(0, -towerHeight - 15, 18);
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, -towerHeight - 15, 14);
      // Six barrels
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const bx = Math.cos(angle) * 10;
        const by = Math.sin(angle) * 10 - towerHeight - 15;
        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(bx, by, 4);
        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(bx, by, 2);
      }
      // Central hub
      g.fillStyle(0xff4400, 0.6);
      g.fillCircle(0, -towerHeight - 15, 5);
      
      // Ammo belts on both sides
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-28, -towerHeight - 5, 10, 35);
      g.fillRect(18, -towerHeight - 5, 10, 35);
      // Bullets visible
      g.fillStyle(0xffcc00, 0.8);
      for (let y = -towerHeight; y < -towerHeight + 28; y += 6) {
        g.fillRect(-26, y, 6, 4);
        g.fillRect(20, y, 6, 4);
      }
      
      // Targeting system
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-6, -towerHeight - 35, 12, 18);
      g.fillStyle(0xff0000, 0.8);
      g.fillCircle(0, -towerHeight - 28, 4);
      g.lineStyle(1, 0xff0000, 0.5);
      g.strokeCircle(0, -towerHeight - 28, 8);
      
      // Antenna array
      g.lineStyle(2, 0x4a4a4a, 1);
      g.lineBetween(20, -towerHeight - 10, 20, -towerHeight - 35);
      g.lineBetween(-20, -towerHeight - 10, -20, -towerHeight - 30);
      g.fillStyle(0x00ff00, 1);
      g.fillCircle(20, -towerHeight - 37, 4);
      g.fillStyle(0xff0000, 1);
      g.fillCircle(-20, -towerHeight - 32, 3);
      
      // Operator in armored dome
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, -towerHeight + 12, 12);
      g.fillStyle(0x87ceeb, 0.5);
      g.fillCircle(0, -towerHeight + 10, 8);
    }
    
    // Ammo slits
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -40, 4, 12);
    g.fillRect(4, -40, 4, 12);
    if (level >= 2) {
      g.fillRect(-8, -58, 4, 10);
      g.fillRect(4, -58, 4, 10);
    }
  }

  static drawSniperTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 40 + level * 6, 15 + level * 2);
    
    // Level 1: Simple watchtower with rifle
    // Level 2: Steel observation tower with advanced scope
    // Level 3: High-tech laser targeting tower with stealth camo
    
    const baseWidth = 20 + level * 5;
    const towerHeight = 70 + level * 20;
    
    if (level === 1) {
      // Simple wooden base
      g.fillStyle(0x6a5a4a, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 18);
      g.fillStyle(0x5a4a3a, 1);
      g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 12);
      // Thin wooden tower
      g.fillStyle(0x7a6a5a, 1);
      g.beginPath();
      g.moveTo(-12, 8);
      g.lineTo(-8, -towerHeight);
      g.lineTo(8, -towerHeight);
      g.lineTo(12, 8);
      g.closePath();
      g.fillPath();
      // Simple platform
      g.fillStyle(0x6a5a4a, 1);
      g.fillRect(-14, -towerHeight - 3, 28, 6);
      // Sniper silhouette
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(0, -towerHeight - 8, 5);
      g.fillRect(-3, -towerHeight - 5, 6, 8);
      // Simple rifle
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(5, -towerHeight - 10, 18, 3);
    } else if (level === 2) {
      // Steel base with supports
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 14);
      // Cross-braced steel tower
      g.fillStyle(0x6a6a6a, 1);
      g.beginPath();
      g.moveTo(-14, 8);
      g.lineTo(-10, -towerHeight);
      g.lineTo(10, -towerHeight);
      g.lineTo(14, 8);
      g.closePath();
      g.fillPath();
      // Steel framework visible
      g.lineStyle(2, 0x4a4a4a, 0.6);
      g.lineBetween(-12, 0, 8, -towerHeight + 20);
      g.lineBetween(12, 0, -8, -towerHeight + 20);
      g.lineBetween(-11, -35, 11, -35);
      // Observation platform
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-18, -towerHeight - 5, 36, 8);
      g.lineStyle(1, 0x3a3a3a, 1);
      g.strokeRect(-18, -towerHeight - 5, 36, 8);
      // Advanced scope
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-4, -towerHeight - 22, 8, 18);
      g.fillStyle(0x4a4a8a, 1);
      g.fillCircle(0, -towerHeight - 18, 8);
      g.fillStyle(0x6a6aaa, 1);
      g.fillCircle(0, -towerHeight - 18, 5);
      // Crosshairs
      g.lineStyle(1, 0xff0000, 0.8);
      g.lineBetween(-6, -towerHeight - 18, 6, -towerHeight - 18);
      g.lineBetween(0, -towerHeight - 24, 0, -towerHeight - 12);
      // Sniper with helmet
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(-2, -towerHeight - 2, 6);
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(-2, -towerHeight - 4, 5);
      // Advanced rifle
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(4, -towerHeight - 8, 28, 4);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(32, -towerHeight - 6, 2);
      // Scope on rifle
      g.fillStyle(0x4a4a6a, 1);
      g.fillRect(12, -towerHeight - 12, 10, 4);
    } else {
      // High-tech stealth base with camo pattern
      g.fillStyle(0x4a5a4a, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 22);
      g.fillStyle(0x3a4a3a, 1);
      g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 16);
      // Camo pattern
      g.fillStyle(0x5a6a5a, 0.5);
      g.fillCircle(-12, 14, 8);
      g.fillCircle(8, 16, 6);
      g.fillCircle(-5, 18, 5);
      
      // Sleek angular tower
      g.fillStyle(0x5a6a5a, 1);
      g.beginPath();
      g.moveTo(-16, 8);
      g.lineTo(-12, -towerHeight);
      g.lineTo(12, -towerHeight);
      g.lineTo(16, 8);
      g.closePath();
      g.fillPath();
      // Angular stealth panels
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
      
      // Advanced targeting platform
      g.fillStyle(0x4a5a4a, 1);
      g.fillRect(-22, -towerHeight - 8, 44, 12);
      g.fillStyle(0x3a4a3a, 1);
      g.fillRect(-20, -towerHeight - 6, 40, 8);
      
      // LASER TARGETING SYSTEM - star of level 3
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-8, -towerHeight - 35, 16, 28);
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(0, -towerHeight - 28, 12);
      // Targeting lens
      g.fillStyle(0x8888cc, 1);
      g.fillCircle(0, -towerHeight - 28, 9);
      g.fillStyle(0xaaaaff, 0.8);
      g.fillCircle(0, -towerHeight - 28, 6);
      // Laser crosshairs
      g.lineStyle(2, 0xff0000, 1);
      g.lineBetween(-10, -towerHeight - 28, 10, -towerHeight - 28);
      g.lineBetween(0, -towerHeight - 38, 0, -towerHeight - 18);
      g.lineStyle(1, 0xff0000, 0.6);
      g.strokeCircle(0, -towerHeight - 28, 12);
      g.strokeCircle(0, -towerHeight - 28, 16);
      
      // Active laser beam!
      g.lineStyle(2, 0xff0000, 0.4);
      g.lineBetween(0, -towerHeight - 40, 50, -towerHeight + 20);
      g.lineStyle(1, 0xff0000, 0.2);
      g.lineBetween(1, -towerHeight - 40, 52, -towerHeight + 20);
      g.lineBetween(-1, -towerHeight - 40, 48, -towerHeight + 20);
      
      // Elite sniper in ghillie suit
      g.fillStyle(0x4a5a3a, 1);
      g.fillCircle(-4, -towerHeight - 2, 7);
      // Ghillie wisps
      g.lineStyle(1, 0x5a6a4a, 1);
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI;
        g.lineBetween(-4, -towerHeight - 2, -4 + Math.cos(angle) * 12, -towerHeight - 2 + Math.sin(angle) * 12);
      }
      
      // Anti-materiel rifle
      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(4, -towerHeight - 10, 40, 5);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(4, -towerHeight - 12, 8, 4); // Stock
      g.fillRect(38, -towerHeight - 14, 10, 6); // Suppressor
      // Massive scope
      g.fillStyle(0x4a4a6a, 1);
      g.fillRect(16, -towerHeight - 18, 16, 8);
      g.fillStyle(0x6a6aaa, 1);
      g.fillCircle(24, -towerHeight - 14, 5);
      
      // Sensor dish
      g.fillStyle(0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(22, -towerHeight);
      g.lineTo(32, -towerHeight - 15);
      g.lineTo(26, -towerHeight - 15);
      g.lineTo(22, -towerHeight - 3);
      g.closePath();
      g.fillPath();
      
      // Status lights
      g.fillStyle(0x00ff00, 1);
      g.fillCircle(-18, -towerHeight, 3);
      g.fillStyle(0x00ff00, 0.5);
      g.fillCircle(-18, -towerHeight, 6);
    }
  }

  static drawRockCannonTower(g: Phaser.GameObjects.Graphics, level: number): void {
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

  static drawIceTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Frost aura - dramatically larger at higher levels
    if (level === 1) {
      g.fillStyle(0x87ceeb, 0.1);
      g.fillCircle(0, -30, 45);
    } else if (level === 2) {
      g.fillStyle(0x87ceeb, 0.12);
      g.fillCircle(0, -35, 60);
      g.fillStyle(0xaaddff, 0.08);
      g.fillCircle(0, -35, 75);
    } else {
      g.fillStyle(0x87ceeb, 0.15);
      g.fillCircle(0, -40, 80);
      g.fillStyle(0xaaddff, 0.1);
      g.fillCircle(0, -40, 100);
      g.fillStyle(0xccffff, 0.05);
      g.fillCircle(0, -40, 120);
    }
    
    // Shadow (with blue tint)
    g.fillStyle(0x4a6080, 0.3);
    g.fillEllipse(0, 25, 45 + level * 8, 16 + level * 3);
    
    // Level 1: Simple ice shard
    // Level 2: Crystal cluster with floating shards  
    // Level 3: Massive frozen citadel with aurora effect
    
    const baseWidth = 24 + level * 6;
    const spireHeight = 75 + level * 20;
    
    if (level === 1) {
      // Simple frozen base
      g.fillStyle(0xa0d0e8, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      g.fillStyle(0xb0e0f0, 1);
      g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 14);
      // Simple frost pattern
      g.lineStyle(1, 0xffffff, 0.3);
      g.lineBetween(-18, 12, -10, 18);
      g.lineBetween(18, 12, 10, 18);
      
      // Simple crystal spire
      g.fillStyle(0xb0e0e6, 0.9);
      g.beginPath();
      g.moveTo(-18, 8);
      g.lineTo(0, -spireHeight);
      g.lineTo(18, 8);
      g.closePath();
      g.fillPath();
      // Inner highlight
      g.fillStyle(0xd0f0f5, 0.8);
      g.beginPath();
      g.moveTo(-10, 0);
      g.lineTo(0, -spireHeight + 15);
      g.lineTo(10, 0);
      g.closePath();
      g.fillPath();
      // Few sparkles
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(-5, -35, 2);
      g.fillCircle(3, -50, 2);
      g.fillCircle(-2, -65, 2);
    } else if (level === 2) {
      // Reinforced ice base with pattern
      g.fillStyle(0xa8d8f0, 1);
      g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
      g.fillStyle(0xb8e8ff, 1);
      g.fillRect(-baseWidth + 4, 7, (baseWidth - 4) * 2, 17);
      // Snowflake pattern on base
      g.lineStyle(1, 0xffffff, 0.5);
      for (let i = 0; i < 3; i++) {
        const cx = -18 + i * 18;
        g.lineBetween(cx, 10, cx, 22);
        g.lineBetween(cx - 4, 13, cx + 4, 19);
        g.lineBetween(cx - 4, 19, cx + 4, 13);
      }
      
      // Multi-crystal formation
      g.fillStyle(0xb0e0e6, 0.9);
      g.beginPath();
      g.moveTo(-24, 8);
      g.lineTo(0, -spireHeight);
      g.lineTo(24, 8);
      g.closePath();
      g.fillPath();
      // Side crystals
      g.fillStyle(0xa0d0d8, 0.8);
      g.beginPath();
      g.moveTo(-30, 15);
      g.lineTo(-18, -spireHeight + 30);
      g.lineTo(-12, 10);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(30, 15);
      g.lineTo(18, -spireHeight + 30);
      g.lineTo(12, 10);
      g.closePath();
      g.fillPath();
      // Inner glow
      g.fillStyle(0xd0f0f5, 0.85);
      g.beginPath();
      g.moveTo(-14, 0);
      g.lineTo(0, -spireHeight + 15);
      g.lineTo(14, 0);
      g.closePath();
      g.fillPath();
      // Crystal facets
      g.lineStyle(1, 0xffffff, 0.5);
      g.lineBetween(0, -spireHeight, -10, -30);
      g.lineBetween(0, -spireHeight, 10, -30);
      g.lineBetween(0, -spireHeight, 0, 0);
      // Floating ice shards
      g.fillStyle(0xc0e8ff, 0.7);
      g.beginPath();
      g.moveTo(-35, -25);
      g.lineTo(-30, -50);
      g.lineTo(-25, -22);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(35, -30);
      g.lineTo(28, -55);
      g.lineTo(23, -27);
      g.closePath();
      g.fillPath();
      // More sparkles
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(-6, -40, 3);
      g.fillCircle(4, -55, 2.5);
      g.fillCircle(-3, -70, 2);
      g.fillCircle(5, -25, 2);
      g.fillCircle(-8, -80, 2);
    } else {
      // GRAND ICE CITADEL BASE
      g.fillStyle(0xb0e0f8, 1);
      g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
      g.fillStyle(0xc0f0ff, 1);
      g.fillRect(-baseWidth + 5, 5, (baseWidth - 5) * 2, 20);
      // Ornate ice patterns
      g.lineStyle(2, 0xffffff, 0.6);
      for (let i = 0; i < 5; i++) {
        const cx = -28 + i * 14;
        g.lineBetween(cx, 8, cx, 23);
        g.lineBetween(cx - 5, 11, cx + 5, 20);
        g.lineBetween(cx - 5, 20, cx + 5, 11);
      }
      // Corner pillars
      g.fillStyle(0x90c8e0, 1);
      g.fillRect(-baseWidth - 6, 0, 10, 26);
      g.fillRect(baseWidth - 4, 0, 10, 26);
      
      // MASSIVE CRYSTAL SPIRE with multiple formations
      // Main spire
      g.fillStyle(0xb0e0e6, 0.95);
      g.beginPath();
      g.moveTo(-30, 8);
      g.lineTo(0, -spireHeight);
      g.lineTo(30, 8);
      g.closePath();
      g.fillPath();
      // Secondary spires
      g.fillStyle(0xa0d0d8, 0.85);
      g.beginPath();
      g.moveTo(-38, 20);
      g.lineTo(-22, -spireHeight + 35);
      g.lineTo(-14, 15);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(38, 20);
      g.lineTo(22, -spireHeight + 35);
      g.lineTo(14, 15);
      g.closePath();
      g.fillPath();
      // Tertiary spires
      g.fillStyle(0x90c0d0, 0.75);
      g.beginPath();
      g.moveTo(-48, 25);
      g.lineTo(-35, -spireHeight + 60);
      g.lineTo(-30, 22);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(48, 25);
      g.lineTo(35, -spireHeight + 60);
      g.lineTo(30, 22);
      g.closePath();
      g.fillPath();
      
      // Inner glowing core
      g.fillStyle(0xd0f0f5, 0.9);
      g.beginPath();
      g.moveTo(-18, 0);
      g.lineTo(0, -spireHeight + 15);
      g.lineTo(18, 0);
      g.closePath();
      g.fillPath();
      // Power core
      g.fillStyle(0xe8ffff, 0.9);
      g.fillCircle(0, -spireHeight + 40, 12);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(0, -spireHeight + 40, 8);
      g.fillStyle(0xccffff, 1);
      g.fillCircle(0, -spireHeight + 40, 4);
      
      // Multiple floating ice platforms
      g.fillStyle(0xc0e8ff, 0.6);
      g.beginPath();
      g.moveTo(-50, -30);
      g.lineTo(-42, -65);
      g.lineTo(-35, -28);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(50, -35);
      g.lineTo(40, -70);
      g.lineTo(32, -32);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(-55, -55);
      g.lineTo(-45, -85);
      g.lineTo(-40, -52);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(55, -50);
      g.lineTo(48, -80);
      g.lineTo(42, -47);
      g.closePath();
      g.fillPath();
      
      // Crystal facet lines
      g.lineStyle(1, 0xffffff, 0.6);
      g.lineBetween(0, -spireHeight, -15, -40);
      g.lineBetween(0, -spireHeight, 15, -40);
      g.lineBetween(0, -spireHeight, -8, -60);
      g.lineBetween(0, -spireHeight, 8, -60);
      g.lineBetween(0, -spireHeight, 0, 0);
      
      // MANY sparkles for magical effect
      g.fillStyle(0xffffff, 1);
      const sparklePositions = [
        [-8, -40], [6, -50], [-4, -70], [8, -30], [-10, -85],
        [10, -95], [-15, -55], [12, -65], [0, -105], [-6, -90]
      ];
      sparklePositions.forEach(([sx, sy], i) => {
        const size = 2 + (i % 3);
        g.fillCircle(sx as number, sy as number, size);
      });
      
      // Aurora/magical energy lines
      g.lineStyle(2, 0x88ddff, 0.3);
      g.beginPath();
      g.moveTo(-40, -80);
      g.lineTo(-20, -100);
      g.lineTo(0, -95);
      g.lineTo(20, -105);
      g.lineTo(40, -85);
      g.strokePath();
      g.lineStyle(1, 0xaaeeff, 0.2);
      g.beginPath();
      g.moveTo(-45, -70);
      g.lineTo(-25, -95);
      g.lineTo(0, -88);
      g.lineTo(25, -98);
      g.lineTo(45, -75);
      g.strokePath();
    }
  }

  static drawPoisonTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Toxic aura - dramatically larger and more layered at higher levels
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
    
    // Shadow with green tint
    g.fillStyle(0x2a3a2a, 0.3);
    g.fillEllipse(0, 25, 48 + level * 8, 17 + level * 3);
    
    // Level 1: Simple witch's hut with small cauldron
    // Level 2: Twisted tree tower with bubbling vat
    // Level 3: Massive plague tower with overflowing toxic waste
    
    const baseWidth = 26 + level * 6;
    const towerHeight = 52 + level * 14;
    
    if (level === 1) {
      // Gnarled wooden base
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      g.fillStyle(0x3a2a1a, 1);
      // Root shapes
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
      
      // Simple twisted tower
      g.fillStyle(0x3a2a1a, 1);
      g.beginPath();
      g.moveTo(-18, 8);
      g.lineTo(-14, -towerHeight);
      g.lineTo(14, -towerHeight);
      g.lineTo(18, 8);
      g.closePath();
      g.fillPath();
      
      // Small cauldron
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(0, -towerHeight - 3, 18, 8);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-14, -towerHeight - 6, 28, 6);
      // Poison liquid
      g.fillStyle(0x00ff00, 0.9);
      g.fillEllipse(0, -towerHeight - 5, 12, 4);
      // Few bubbles
      g.fillStyle(0x88ff88, 0.7);
      g.fillCircle(-4, -towerHeight - 8, 2);
      g.fillCircle(3, -towerHeight - 10, 1.5);
    } else if (level === 2) {
      // Twisted root base
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 22);
      g.fillStyle(0x3a2a1a, 1);
      // Multiple thick roots
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
      
      // Twisted tree trunk tower
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
      // Wood texture
      g.lineStyle(1, 0x2a1a0a, 0.5);
      g.beginPath();
      g.moveTo(-16, 0);
      g.lineTo(-12, -towerHeight + 5);
      g.strokePath();
      g.beginPath();
      g.moveTo(16, 0);
      g.lineTo(12, -towerHeight + 5);
      g.strokePath();
      
      // Medium cauldron
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(0, -towerHeight - 4, 24, 10);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-20, -towerHeight - 9, 40, 8);
      // Bubbling poison
      g.fillStyle(0x00ff22, 0.9);
      g.fillEllipse(0, -towerHeight - 7, 18, 6);
      g.fillStyle(0x66ff66, 0.7);
      g.fillCircle(-6, -towerHeight - 10, 3);
      g.fillCircle(5, -towerHeight - 9, 2.5);
      g.fillCircle(-2, -towerHeight - 12, 2);
      // Rising bubbles
      g.fillStyle(0x88ff88, 0.6);
      g.fillCircle(-4, -towerHeight - 18, 3);
      g.fillCircle(4, -towerHeight - 22, 2.5);
      g.fillCircle(-6, -towerHeight - 28, 2);
      
      // Vines on sides
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
      // MASSIVE CORRUPTED BASE
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(-baseWidth, 3, baseWidth * 2, 26);
      g.fillStyle(0x3a2a1a, 1);
      // Huge spreading roots
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
      
      // Ground corruption
      g.fillStyle(0x2a4a1a, 0.5);
      g.fillCircle(-25, 24, 10);
      g.fillCircle(25, 24, 10);
      g.fillCircle(0, 26, 12);
      
      // MASSIVE TWISTED TOWER
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
      // Corrupted bark texture
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
      // Poison seeping from cracks
      g.lineStyle(2, 0x00ff00, 0.4);
      g.lineBetween(-18, -20, -22, -15);
      g.lineBetween(16, -30, 20, -25);
      g.lineBetween(-14, -50, -18, -45);
      
      // MASSIVE OVERFLOWING CAULDRON
      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(0, -towerHeight - 5, 32, 14);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-28, -towerHeight - 12, 56, 10);
      // Cauldron rim
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-30, -towerHeight - 14, 60, 4);
      
      // OVERFLOWING TOXIC WASTE
      g.fillStyle(0x00ff44, 0.95);
      g.fillEllipse(0, -towerHeight - 10, 26, 8);
      // Overflow dripping down sides
      g.fillStyle(0x00ff00, 0.7);
      g.fillEllipse(-20, -towerHeight, 4, 12);
      g.fillEllipse(22, -towerHeight + 2, 5, 14);
      g.fillEllipse(-12, -towerHeight + 5, 3, 10);
      g.fillEllipse(14, -towerHeight + 8, 4, 12);
      // Pools on ground
      g.fillStyle(0x00ff00, 0.3);
      g.fillEllipse(-28, 20, 12, 5);
      g.fillEllipse(26, 18, 10, 4);
      
      // INTENSE bubbling
      g.fillStyle(0x88ff88, 0.8);
      g.fillCircle(-8, -towerHeight - 14, 4);
      g.fillCircle(6, -towerHeight - 13, 3.5);
      g.fillCircle(-3, -towerHeight - 16, 3);
      g.fillCircle(10, -towerHeight - 15, 2.5);
      g.fillCircle(-12, -towerHeight - 12, 2);
      // Rising toxic cloud
      g.fillStyle(0x88ff88, 0.5);
      g.fillCircle(-5, -towerHeight - 25, 5);
      g.fillCircle(6, -towerHeight - 32, 4);
      g.fillCircle(-8, -towerHeight - 40, 4.5);
      g.fillCircle(3, -towerHeight - 48, 4);
      g.fillCircle(-4, -towerHeight - 55, 3.5);
      g.fillCircle(5, -towerHeight - 62, 3);
      
      // Massive corrupted vines
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
      // Secondary vines
      g.lineStyle(2, 0x3a6a3a, 0.8);
      g.beginPath();
      g.moveTo(-26, 20);
      g.lineTo(-45, -10);
      g.strokePath();
      g.beginPath();
      g.moveTo(26, 20);
      g.lineTo(45, -5);
      g.strokePath();
      
      // Skull decoration (because why not for plague tower)
      g.fillStyle(0xccccaa, 1);
      g.fillCircle(0, -25, 8);
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(-3, -27, 2);
      g.fillCircle(3, -27, 2);
      g.fillRect(-2, -23, 4, 3);
    }
  }
}
