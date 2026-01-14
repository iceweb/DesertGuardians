import Phaser from 'phaser';
import type { TowerBranch } from '../data';
import {
  drawRangeCircle,
  drawLevelIndicator,
  drawArcherTower,
  drawRapidFireTower,
  drawRockCannonTower,
  drawSniperTower,
  drawIceTower,
  drawPoisonTower,
  drawAuraTower,
} from './towers';

export class TowerGraphics {
  static drawTower(g: Phaser.GameObjects.Graphics, branch: TowerBranch, level: number): void {
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
      case 'aura':
        drawAuraTower(g, level);
        break;
      default:
        drawArcherTower(g, level);
    }

    if (level >= 2) {
      drawLevelIndicator(g, level);
    }
  }

  static drawRangeCircle(g: Phaser.GameObjects.Graphics, range: number): void {
    drawRangeCircle(g, range);
  }
}
