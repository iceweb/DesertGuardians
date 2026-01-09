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
    g.fillEllipse(0, 25, 50 + level * 3, 18 + level);
    
    // Stone base - larger at higher levels
    const baseWidth = 28 + level * 4;
    g.fillStyle(level >= 3 ? 0x9a8365 : 0x8b7355, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 18 + level * 2);
    g.fillStyle(level >= 3 ? 0xaa9375 : 0x9a8265, 1);
    g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14 + level * 2);
    
    // Stone texture
    g.lineStyle(1, 0x6b5344, 0.5);
    g.lineBetween(-baseWidth + 4, 17, baseWidth - 4, 17);
    g.lineBetween(-10, 10, -10, 24 + level * 2);
    g.lineBetween(10, 10, 10, 24 + level * 2);
    
    // Tower body - taller at higher levels
    const towerHeight = 55 + level * 12;
    g.fillStyle(level >= 3 ? 0xe4b584 : 0xd4a574, 1);
    g.beginPath();
    g.moveTo(-22 - level * 2, 10);
    g.lineTo(-18 - level, -towerHeight);
    g.lineTo(18 + level, -towerHeight);
    g.lineTo(22 + level * 2, 10);
    g.closePath();
    g.fillPath();
    
    // Lighter panel
    g.fillStyle(level >= 3 ? 0xf8d8a6 : 0xe8c896, 1);
    g.beginPath();
    g.moveTo(-16 - level, 5);
    g.lineTo(-13 - level, -towerHeight + 5);
    g.lineTo(13 + level, -towerHeight + 5);
    g.lineTo(16 + level, 5);
    g.closePath();
    g.fillPath();
    
    // Window/archway - multiple at higher levels
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -30, 16, 22);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -28, 10, 18);
    
    if (level >= 2) {
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -55, 16, 18);
      g.fillStyle(0x1a0a00, 1);
      g.fillRect(-5, -53, 10, 14);
    }
    
    // Battlements - more elaborate at higher levels
    const battY = -towerHeight - 10;
    g.fillStyle(level >= 3 ? 0xd9b07c : 0xc9a06c, 1);
    g.fillRect(-20 - level * 2, battY, 12 + level * 2, 12);
    g.fillRect(-4 - level, battY, 8 + level * 2, 12);
    g.fillRect(8, battY, 12 + level * 2, 12);
    
    if (level >= 2) {
      // Additional corner towers
      g.fillStyle(0xc9a06c, 1);
      g.fillCircle(-22 - level * 2, battY + 6, 8);
      g.fillCircle(22 + level * 2, battY + 6, 8);
    }
    
    // Archer
    g.fillStyle(level >= 3 ? 0x5a4030 : 0x4a3020, 1);
    g.fillCircle(0, battY - 15, 8 + level);
    g.fillStyle(level >= 3 ? 0x9b5523 : 0x8b4513, 1);
    g.fillRect(-5 - level, battY - 10, 10 + level * 2, 12 + level * 2);
    
    // Bow - more elaborate at higher levels
    g.lineStyle(2 + level * 0.5, level >= 3 ? 0x754321 : 0x654321, 1);
    g.beginPath();
    g.arc(8 + level * 2, battY - 5, 15 + level * 3, -1.5, 1.5, false);
    g.strokePath();
    g.lineStyle(1, level >= 3 ? 0xffe8c3 : 0xf5deb3, 1);
    g.lineBetween(8 + level * 2, battY - 20 - level * 3, 8 + level * 2, battY + 10 + level * 3);
    
    // Banner - different colors per level
    const bannerColors = [0xcc3333, 0x3366cc, 0xffd700];
    g.fillStyle(bannerColors[level - 1], 1);
    g.fillTriangle(-25 - level * 2, -towerHeight + 5, -35 - level * 3, -towerHeight + 15, -25 - level * 2, -towerHeight + 25);
    
    // Banner emblem
    g.fillStyle(level >= 3 ? 0xffffff : 0xffcc00, 1);
    g.fillCircle(-30 - level * 2, -towerHeight + 15, 3 + level);
  }

  static drawRapidFireTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50 + level * 4, 18 + level);
    
    // Metal base - more reinforced at higher levels
    const baseWidth = 25 + level * 4;
    g.fillStyle(level >= 3 ? 0x5a5a5a : 0x4a4a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22 + level * 2);
    g.fillStyle(level >= 3 ? 0x6a6a6a : 0x5a5a5a, 1);
    g.fillRect(-baseWidth + 3, 8, (baseWidth - 3) * 2, 16 + level * 2);
    
    // Rivets - more at higher levels
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(-18 - level * 2, 16, 3);
    g.fillCircle(18 + level * 2, 16, 3);
    if (level >= 2) {
      g.fillCircle(-10, 14, 2);
      g.fillCircle(10, 14, 2);
    }
    
    // Tower body
    const towerHeight = 50 + level * 10;
    g.fillStyle(level >= 3 ? 0x6a6a6a : 0x5a5a5a, 1);
    g.fillRect(-18 - level * 3, -towerHeight, 36 + level * 6, towerHeight + 5);
    g.fillStyle(level >= 3 ? 0x7a7a7a : 0x6a6a6a, 1);
    g.fillRect(-14 - level * 2, -towerHeight + 5, 28 + level * 4, towerHeight - 3);
    
    // Ammo slits - more at higher levels
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -40, 4, 12);
    g.fillRect(4, -40, 4, 12);
    if (level >= 2) {
      g.fillRect(-8, -58, 4, 10);
      g.fillRect(4, -58, 4, 10);
    }
    
    // Gun barrels - more at higher levels
    const barrelCount = level + 1;
    for (let i = 0; i < barrelCount; i++) {
      const bx = -6 + i * (12 / barrelCount);
      const by = -towerHeight - 10 - i * 3;
      g.fillStyle(level >= 3 ? 0x4a4a4a : 0x3a3a3a, 1);
      g.fillRect(bx, by, 5, 15 + level * 3);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(bx + 2.5, by, 2.5);
      
      // Muzzle flash indicator for level 3
      if (level >= 3) {
        g.fillStyle(0xff6600, 0.3);
        g.fillCircle(bx + 2.5, by - 3, 4);
      }
    }
    
    // Operator silhouette
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(0, -towerHeight + 8, 6 + level);
    
    // Warning stripes
    g.fillStyle(0xffcc00, 1);
    g.fillRect(-18 - level * 2, 0, 8 + level, 5);
    g.fillRect(10 + level, 0, 8 + level, 5);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(-16 - level * 2, 0, 3, 5);
    g.fillRect(15 + level, 0, 3, 5);
    
    // Antenna - taller at higher levels
    g.lineStyle(2, 0x4a4a4a, 1);
    g.lineBetween(12 + level * 2, -towerHeight, 12 + level * 2, -towerHeight - 20 - level * 5);
    g.fillStyle(level >= 3 ? 0x00ff00 : 0xff0000, 1);
    g.fillCircle(12 + level * 2, -towerHeight - 22 - level * 5, 3 + level * 0.5);
    
    // Level 3: Extra armor plates
    if (level >= 3) {
      g.fillStyle(0x4a4a4a, 0.8);
      g.fillRect(-22, -30, 6, 25);
      g.fillRect(16, -30, 6, 25);
    }
  }

  static drawSniperTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 40 + level * 3, 15 + level);
    
    // Reinforced base
    const baseWidth = 20 + level * 3;
    g.fillStyle(level >= 3 ? 0x6a6a6a : 0x5a5a5a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 20 + level * 2);
    g.fillStyle(level >= 3 ? 0x5a5a5a : 0x4a4a4a, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 14 + level * 2);
    
    // Tall thin tower - taller at higher levels
    const towerHeight = 70 + level * 15;
    g.fillStyle(level >= 3 ? 0x7a7a7a : 0x6a6a6a, 1);
    g.beginPath();
    g.moveTo(-12 - level, 8);
    g.lineTo(-8 - level * 0.5, -towerHeight);
    g.lineTo(8 + level * 0.5, -towerHeight);
    g.lineTo(12 + level, 8);
    g.closePath();
    g.fillPath();
    
    // Window slits
    g.fillStyle(level >= 3 ? 0x9a9a9a : 0x8a8a8a, 1);
    g.fillRect(-5, -towerHeight + 5, 10, towerHeight - 13);
    
    // Scope platform - larger at higher levels
    g.fillStyle(level >= 3 ? 0x6a6a6a : 0x5a5a5a, 1);
    g.fillRect(-15 - level * 3, -towerHeight - 5, 30 + level * 6, 8 + level);
    
    // Sniper scope - more elaborate at higher levels
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-3 - level, -towerHeight - 20 - level * 5, 6 + level * 2, 18 + level * 5);
    g.fillStyle(level >= 3 ? 0x5a5aaa : 0x4a4a8a, 1);
    g.fillCircle(0, -towerHeight - 15 - level * 3, 8 + level * 2);
    g.fillStyle(level >= 3 ? 0x7a7aca : 0x6a6aaa, 1);
    g.fillCircle(0, -towerHeight - 15 - level * 3, 5 + level);
    
    // Crosshairs - more elaborate at higher levels
    g.lineStyle(1 + level * 0.3, 0xff0000, 0.8);
    const crossSize = 4 + level * 2;
    g.lineBetween(-crossSize, -towerHeight - 15 - level * 3, crossSize, -towerHeight - 15 - level * 3);
    g.lineBetween(0, -towerHeight - 15 - level * 3 - crossSize, 0, -towerHeight - 15 - level * 3 + crossSize);
    
    if (level >= 3) {
      g.lineStyle(1, 0xff0000, 0.5);
      g.strokeCircle(0, -towerHeight - 15 - level * 3, crossSize + 2);
    }
    
    // Sniper silhouette
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -towerHeight + 3, 5 + level);
    g.fillRect(-3 - level, -towerHeight + 5, 6 + level * 2, 8 + level);
    
    // Rifle barrel - longer at higher levels
    g.fillStyle(level >= 3 ? 0x4a4a4a : 0x3a3a3a, 1);
    g.fillRect(6, -towerHeight - 10, 20 + level * 8, 4);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(25 + level * 8, -towerHeight - 8, 2);
    
    // Level 3: Laser sight
    if (level >= 3) {
      g.lineStyle(1, 0xff0000, 0.6);
      g.lineBetween(33, -towerHeight - 8, 60, -towerHeight + 10);
    }
  }

  static drawRockCannonTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 28, 55 + level * 5, 20 + level * 2);
    
    // Massive stone base - larger at higher levels
    const baseWidth = 30 + level * 5;
    g.fillStyle(level >= 3 ? 0x7a6a5a : 0x6a5a4a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 25 + level * 3);
    g.fillStyle(level >= 3 ? 0x8a7a6a : 0x7a6a5a, 1);
    g.fillRect(-baseWidth + 4, 10, (baseWidth - 4) * 2, 18 + level * 3);
    
    // Stone texture
    g.lineStyle(2, 0x4a3a2a, 0.6);
    g.lineBetween(-baseWidth + 4, 18, baseWidth - 4, 18);
    g.lineBetween(-12, 10, -12, 28 + level * 3);
    g.lineBetween(12, 10, 12, 28 + level * 3);
    
    // Chunky tower body - larger at higher levels
    const towerHeight = 45 + level * 10;
    g.fillStyle(level >= 3 ? 0x8a7a6a : 0x7a6a5a, 1);
    g.fillRect(-25 - level * 4, -towerHeight, 50 + level * 8, towerHeight + 5);
    g.fillStyle(level >= 3 ? 0x9a8a7a : 0x8a7a6a, 1);
    g.fillRect(-20 - level * 3, -towerHeight + 5, 40 + level * 6, towerHeight - 3);
    
    // Stone blocks pattern
    g.lineStyle(2, 0x5a4a3a, 0.5);
    g.strokeRect(-20 - level * 2, -towerHeight + 5, 20 + level * 2, 20);
    g.strokeRect(level * 2, -towerHeight + 5, 20 + level * 2, 20);
    
    // Cannon barrel - larger at higher levels
    const cannonSize = 14 + level * 4;
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-8 - level * 2, -towerHeight - 15 - level * 3, 16 + level * 4, 18 + level * 3);
    g.fillStyle(level >= 3 ? 0x5a5a5a : 0x4a4a4a, 1);
    g.fillCircle(0, -towerHeight - 10 - level * 2, cannonSize);
    g.fillStyle(level >= 3 ? 0x3a3a3a : 0x2a2a2a, 1);
    g.fillCircle(0, -towerHeight - 10 - level * 2, cannonSize - 4);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(0, -towerHeight - 10 - level * 2, cannonSize - 8);
    
    // Rock ammo pile - more rocks at higher levels
    g.fillStyle(0x5a4a3a, 1);
    g.fillCircle(-15, -8, 6);
    g.fillCircle(-8, -10, 5);
    g.fillCircle(-12, -15, 4);
    if (level >= 2) {
      g.fillCircle(15, -8, 5);
      g.fillCircle(10, -12, 4);
    }
    if (level >= 3) {
      g.fillCircle(-5, -6, 4);
      g.fillCircle(5, -8, 3);
    }
    
    // Cracks for age
    g.lineStyle(1, 0x3a2a1a, 0.4);
    g.lineBetween(15 + level * 2, -towerHeight + 10, 20 + level * 3, -towerHeight + 20);
    
    // Level 3: Reinforced supports
    if (level >= 3) {
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-32, -35, 8, 30);
      g.fillRect(24, -35, 8, 30);
    }
  }

  static drawIceTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Frost aura - larger at higher levels
    g.fillStyle(0x87ceeb, 0.1 + level * 0.05);
    g.fillCircle(0, -30, 50 + level * 10);
    
    // Shadow (with blue tint)
    g.fillStyle(0x4a6080, 0.3);
    g.fillEllipse(0, 25, 45 + level * 5, 16 + level * 2);
    
    // Ice base - more crystalline at higher levels
    const baseWidth = 24 + level * 4;
    g.fillStyle(level >= 3 ? 0xb0e0f8 : 0xa0d0e8, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22 + level * 2);
    g.fillStyle(level >= 3 ? 0xc0f0ff : 0xb0e0f0, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 16 + level * 2);
    
    // Frost patterns on base
    g.lineStyle(1, 0xffffff, 0.4 + level * 0.1);
    g.lineBetween(-18 - level * 2, 12, -10 - level, 18 + level);
    g.lineBetween(18 + level * 2, 12, 10 + level, 18 + level);
    
    // Crystal spire - taller and more complex at higher levels
    const spireHeight = 75 + level * 15;
    g.fillStyle(0xb0e0e6, 0.9);
    g.beginPath();
    g.moveTo(-18 - level * 3, 8);
    g.lineTo(0, -spireHeight);
    g.lineTo(18 + level * 3, 8);
    g.closePath();
    g.fillPath();
    
    // Inner crystal
    g.fillStyle(0xd0f0f5, 0.8);
    g.beginPath();
    g.moveTo(-10 - level * 2, 0);
    g.lineTo(0, -spireHeight + 15);
    g.lineTo(10 + level * 2, 0);
    g.closePath();
    g.fillPath();
    
    // Crystal facets
    g.lineStyle(1, 0xffffff, 0.5);
    g.lineBetween(0, -spireHeight, -8 - level * 2, -20);
    g.lineBetween(0, -spireHeight, 8 + level * 2, -20);
    g.lineBetween(0, -spireHeight, 0, 0);
    
    // Sparkles - more at higher levels
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-6, -40, 3);
    g.fillCircle(4, -25, 2);
    g.fillCircle(-3, -55, 2);
    g.fillCircle(6, -50, 2.5);
    if (level >= 2) {
      g.fillCircle(-8, -70, 2);
      g.fillCircle(5, -65, 2.5);
      g.fillCircle(0, -80, 2);
    }
    if (level >= 3) {
      g.fillCircle(-10, -85, 3);
      g.fillCircle(8, -90, 2);
    }
    
    // Floating ice shards - more at higher levels
    g.fillStyle(0xd0f0ff, 0.7);
    g.beginPath();
    g.moveTo(-25 - level * 3, -20);
    g.lineTo(-22 - level * 2, -35 - level * 5);
    g.lineTo(-18 - level, -18);
    g.closePath();
    g.fillPath();
    
    g.beginPath();
    g.moveTo(25 + level * 3, -25);
    g.lineTo(20 + level * 2, -40 - level * 5);
    g.lineTo(18 + level, -22);
    g.closePath();
    g.fillPath();
    
    if (level >= 3) {
      g.fillStyle(0xe0ffff, 0.6);
      g.beginPath();
      g.moveTo(-30, -50);
      g.lineTo(-25, -70);
      g.lineTo(-22, -48);
      g.closePath();
      g.fillPath();
      
      g.beginPath();
      g.moveTo(30, -45);
      g.lineTo(26, -65);
      g.lineTo(23, -42);
      g.closePath();
      g.fillPath();
    }
  }

  static drawPoisonTower(g: Phaser.GameObjects.Graphics, level: number): void {
    // Toxic aura - larger at higher levels
    g.fillStyle(0x00ff00, 0.05 + level * 0.03);
    g.fillCircle(0, -25, 45 + level * 10);
    
    // Shadow
    g.fillStyle(0x2a3a2a, 0.3);
    g.fillEllipse(0, 25, 48 + level * 5, 17 + level * 2);
    
    // Gnarled wood base
    const baseWidth = 26 + level * 4;
    g.fillStyle(level >= 3 ? 0x5a4a3a : 0x4a3a2a, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 22 + level * 2);
    g.fillStyle(level >= 3 ? 0x4a3a2a : 0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-22 - level * 2, 25 + level * 2);
    g.lineTo(-18 - level, 8);
    g.lineTo(-12, 10);
    g.lineTo(-15 - level, 25 + level * 2);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(22 + level * 2, 25 + level * 2);
    g.lineTo(18 + level, 8);
    g.lineTo(12, 10);
    g.lineTo(15 + level, 25 + level * 2);
    g.closePath();
    g.fillPath();
    
    // Twisted tower - taller at higher levels
    const towerHeight = 52 + level * 10;
    g.fillStyle(level >= 3 ? 0x4a3a2a : 0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-18 - level * 2, 8);
    g.lineTo(-14 - level, -towerHeight);
    g.lineTo(-8, -towerHeight - 2);
    g.lineTo(8, -towerHeight - 2);
    g.lineTo(14 + level, -towerHeight);
    g.lineTo(18 + level * 2, 8);
    g.closePath();
    g.fillPath();
    
    // Wood grain
    g.lineStyle(1, 0x2a1a0a, 0.5);
    g.beginPath();
    g.moveTo(-14 - level, 0);
    g.lineTo(-10, -towerHeight + 5);
    g.strokePath();
    g.beginPath();
    g.moveTo(14 + level, 0);
    g.lineTo(10, -towerHeight + 5);
    g.strokePath();
    
    // Cauldron - larger at higher levels
    const cauldronSize = 22 + level * 4;
    g.fillStyle(0x2a2a2a, 1);
    g.fillEllipse(0, -towerHeight - 5, cauldronSize, 10 + level);
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-18 - level * 2, -towerHeight - 10, 36 + level * 4, 8 + level);
    
    // Bubbling poison - more intense at higher levels
    g.fillStyle(level >= 3 ? 0x00ff44 : 0x00ff00, 0.9);
    g.fillEllipse(0, -towerHeight - 8, 16 + level * 3, 6 + level);
    g.fillStyle(level >= 3 ? 0x88ff88 : 0x66ff66, 0.7);
    g.fillCircle(-5 - level, -towerHeight - 10, 3 + level * 0.5);
    g.fillCircle(4 + level, -towerHeight - 9, 2.5 + level * 0.5);
    g.fillCircle(-2, -towerHeight - 12, 2 + level * 0.5);
    
    // Rising bubbles - more at higher levels
    g.fillStyle(0x88ff88, 0.6);
    g.fillCircle(-3, -towerHeight - 18, 3);
    g.fillCircle(5, -towerHeight - 22, 2);
    g.fillCircle(-6, -towerHeight - 25, 2.5);
    if (level >= 2) {
      g.fillCircle(3, -towerHeight - 30, 2);
      g.fillCircle(-4, -towerHeight - 35, 2.5);
    }
    if (level >= 3) {
      g.fillCircle(0, -towerHeight - 40, 3);
      g.fillCircle(6, -towerHeight - 38, 2);
    }
    
    // Vines/roots - more at higher levels
    g.lineStyle(3, 0x2a4a2a, 1);
    g.beginPath();
    g.moveTo(-20 - level * 2, 15);
    g.lineTo(-25 - level * 3, -10 - level * 5);
    g.lineTo(-22 - level * 2, -20 - level * 6);
    g.strokePath();
    g.beginPath();
    g.moveTo(20 + level * 2, 15);
    g.lineTo(25 + level * 3, -5 - level * 5);
    g.lineTo(22 + level * 2, -15 - level * 6);
    g.strokePath();
    
    if (level >= 3) {
      g.lineStyle(2, 0x3a5a3a, 1);
      g.beginPath();
      g.moveTo(-15, 20);
      g.lineTo(-30, -25);
      g.strokePath();
      g.beginPath();
      g.moveTo(15, 20);
      g.lineTo(30, -20);
      g.strokePath();
    }
    
    // Poison drips - more at higher levels
    g.fillStyle(0x00ff00, 0.5);
    g.fillEllipse(-8 - level, -towerHeight + 2, 3, 5 + level);
    g.fillEllipse(10 + level, -towerHeight + 4, 2, 4 + level);
    if (level >= 2) {
      g.fillEllipse(-12, -towerHeight + 8, 2, 4);
      g.fillEllipse(14, -towerHeight + 6, 2, 5);
    }
  }
}
