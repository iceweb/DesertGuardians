import Phaser from 'phaser';
import type { TowerBranch } from '../objects/Tower';
import {
  drawRangeCircle,
  drawLevelIndicator,
  drawArcherTower,
  drawRapidFireTower,
  drawRockCannonTower,
  drawSniperTower,
  drawIceTower,
  drawPoisonTower,
} from './towers';

/**
 * TowerGraphics facade - delegates to specialized tower graphics modules.
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
        drawArcherTower(g, level);
        break;
      case 'rapidfire':
        drawRapidFireTower(g, level);
        break;
      case 'sniper':
        drawSniperTower(g, level);
        break;
      case 'rockcannon':
        drawRockCannonTower(g, level);
        break;
      case 'icetower':
        drawIceTower(g, level);
        break;
      case 'poison':
        drawPoisonTower(g, level);
        break;
      default:
        drawArcherTower(g, level);
    }
    
    // Draw level indicator
    if (level >= 2) {
      drawLevelIndicator(g, level);
    }
  }

  /**
   * Draw range indicator circle
   */
  static drawRangeCircle(
    g: Phaser.GameObjects.Graphics,
    range: number
  ): void {
    drawRangeCircle(g, range);
  }
}

