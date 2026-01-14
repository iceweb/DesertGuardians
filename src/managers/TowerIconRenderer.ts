import Phaser from 'phaser';
import type { TowerBranch } from '../data';
import type { AbilityDefinition } from '../objects/TowerAbilities';

export class TowerIconRenderer {

  static drawArcherTowerIcon(g: Phaser.GameObjects.Graphics, canAfford: boolean): void {
    const alpha = canAfford ? 1 : 0.5;

    g.fillStyle(0x000000, 0.3 * alpha);
    g.fillEllipse(0, 18, 35, 12);

    g.fillStyle(canAfford ? 0x8b5a2b : 0x555555, alpha);
    g.fillRect(-20, 5, 40, 14);
    g.fillStyle(canAfford ? 0x9a6a3b : 0x666666, alpha);
    g.fillRect(-17, 7, 34, 10);

    g.fillStyle(canAfford ? 0xb88a5c : 0x666666, alpha);
    g.beginPath();
    g.moveTo(-16, 7);
    g.lineTo(-12, -28);
    g.lineTo(12, -28);
    g.lineTo(16, 7);
    g.closePath();
    g.fillPath();

    g.fillStyle(canAfford ? 0x8b4513 : 0x444444, alpha);
    g.beginPath();
    g.moveTo(-18, -28);
    g.lineTo(0, -45);
    g.lineTo(18, -28);
    g.closePath();
    g.fillPath();

    g.fillStyle(canAfford ? 0xa0522d : 0x555555, 0.7 * alpha);
    g.beginPath();
    g.moveTo(-12, -28);
    g.lineTo(0, -40);
    g.lineTo(0, -45);
    g.closePath();
    g.fillPath();

    g.fillStyle(canAfford ? 0xfff4cc : 0x888888, 0.9 * alpha);
    g.fillRect(-5, -20, 10, 14);
    g.lineStyle(1, canAfford ? 0x5a4a38 : 0x444444, alpha);
    g.strokeRect(-5, -20, 10, 14);
    g.lineBetween(0, -20, 0, -6);
    g.lineBetween(-5, -13, 5, -13);

    g.lineStyle(2, canAfford ? 0x6b4020 : 0x444444, alpha);
    g.beginPath();
    g.arc(0, -35, 8, Math.PI * 0.3, Math.PI * 0.7, true);
    g.strokePath();
    g.lineBetween(0, -43, 0, -27);
  }

  static drawMiniTowerIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, branch: TowerBranch, canAfford: boolean): void {
    const alpha = canAfford ? 1 : 0.4;
    const scale = 0.7;

    switch (branch) {
      case 'rapidfire':
        graphics.fillStyle(0x4a4a4a, alpha);
        graphics.fillRect(x - 12 * scale, y + 10 * scale, 24 * scale, 15 * scale);
        graphics.fillStyle(0x6a6a6a, alpha);
        graphics.fillRect(x - 10 * scale, y - 30 * scale, 20 * scale, 40 * scale);
        graphics.fillStyle(0xffd700, alpha);
        graphics.fillRect(x - 4 * scale, y - 20 * scale, 3 * scale, 10 * scale);
        graphics.fillRect(x + 1 * scale, y - 22 * scale, 3 * scale, 12 * scale);
        break;

      case 'sniper':
        graphics.fillStyle(0x5a5a5a, alpha);
        graphics.fillRect(x - 10 * scale, y + 10 * scale, 20 * scale, 12 * scale);
        graphics.fillStyle(0x8a8a8a, alpha);
        graphics.fillRect(x - 6 * scale, y - 45 * scale, 12 * scale, 55 * scale);
        graphics.fillStyle(0x4a4a8a, alpha);
        graphics.fillCircle(x, y - 25 * scale, 6 * scale);
        graphics.lineStyle(1, 0xff0000, alpha);
        graphics.lineBetween(x - 4 * scale, y - 25 * scale, x + 4 * scale, y - 25 * scale);
        graphics.lineBetween(x, y - 29 * scale, x, y - 21 * scale);
        break;

      case 'rockcannon':
        graphics.fillStyle(0x6a5a4a, alpha);
        graphics.fillRect(x - 16 * scale, y + 5 * scale, 32 * scale, 18 * scale);
        graphics.fillStyle(0x8a7a6a, alpha);
        graphics.fillRect(x - 14 * scale, y - 25 * scale, 28 * scale, 30 * scale);
        graphics.fillStyle(0x3a3a3a, alpha);
        graphics.fillCircle(x, y - 30 * scale, 8 * scale);
        graphics.fillStyle(0x2a2a2a, alpha);
        graphics.fillCircle(x, y - 30 * scale, 5 * scale);
        break;

      case 'icetower':
        graphics.fillStyle(0x87ceeb, alpha);
        graphics.fillRect(x - 12 * scale, y + 8 * scale, 24 * scale, 12 * scale);
        graphics.fillStyle(0xb0e0e6, alpha * 0.9);
        graphics.fillTriangle(x - 10 * scale, y + 8 * scale, x, y - 40 * scale, x + 10 * scale, y + 8 * scale);
        graphics.fillStyle(0xe0ffff, alpha * 0.7);
        graphics.fillTriangle(x - 6 * scale, y + 5 * scale, x, y - 35 * scale, x + 6 * scale, y + 5 * scale);
        graphics.fillStyle(0xffffff, alpha * 0.8);
        graphics.fillCircle(x - 4 * scale, y - 15 * scale, 2 * scale);
        graphics.fillCircle(x + 3 * scale, y - 25 * scale, 2 * scale);
        break;

      case 'poison':
        graphics.fillStyle(0x4a3a2a, alpha);
        graphics.fillRect(x - 12 * scale, y + 8 * scale, 24 * scale, 12 * scale);
        graphics.fillStyle(0x3a2a1a, alpha);
        graphics.fillRect(x - 8 * scale, y - 25 * scale, 16 * scale, 35 * scale);
        graphics.fillStyle(0x2a2a2a, alpha);
        graphics.fillCircle(x, y - 30 * scale, 10 * scale);
        graphics.fillStyle(0x00ff00, alpha * 0.8);
        graphics.fillCircle(x, y - 32 * scale, 7 * scale);
        graphics.fillStyle(0x88ff88, alpha * 0.7);
        graphics.fillCircle(x - 2 * scale, y - 35 * scale, 2 * scale);
        graphics.fillCircle(x + 3 * scale, y - 30 * scale, 2 * scale);
        break;

      case 'aura':
        graphics.fillStyle(0x4a3a3a, alpha);
        graphics.fillRect(x - 14 * scale, y + 5 * scale, 28 * scale, 15 * scale);
        graphics.fillStyle(0x3a2a2a, alpha);
        graphics.fillRect(x - 8 * scale, y - 30 * scale, 16 * scale, 40 * scale);
        graphics.fillStyle(0xff4444, alpha * 0.4);
        graphics.fillCircle(x, y - 38 * scale, 14 * scale);
        graphics.fillStyle(0xff6666, alpha * 0.6);
        graphics.fillCircle(x, y - 38 * scale, 10 * scale);
        graphics.fillStyle(0xffaaaa, alpha * 0.8);
        graphics.fillCircle(x, y - 38 * scale, 6 * scale);
        graphics.fillStyle(0xffffff, alpha);
        graphics.fillCircle(x - 2 * scale, y - 40 * scale, 2 * scale);
        break;

      default:
        graphics.fillStyle(0x8b7355, alpha);
        graphics.fillRect(x - 14 * scale, y + 8 * scale, 28 * scale, 12 * scale);
        graphics.fillStyle(0xd4a574, alpha);
        graphics.fillRect(x - 11 * scale, y - 35 * scale, 22 * scale, 45 * scale);
        graphics.fillStyle(0x2a1a0a, alpha);
        graphics.fillRect(x - 4 * scale, y - 20 * scale, 8 * scale, 14 * scale);
        graphics.fillStyle(0xc9a06c, alpha);
        graphics.fillRect(x - 10 * scale, y - 40 * scale, 8 * scale, 8 * scale);
        graphics.fillRect(x - 3 * scale, y - 40 * scale, 8 * scale, 8 * scale);
        graphics.fillRect(x + 4 * scale, y - 40 * scale, 8 * scale, 8 * scale);
        break;
    }
  }

  static drawAbilityIcon(g: Phaser.GameObjects.Graphics, ability: AbilityDefinition): void {
    const primary = ability.icon.primaryColor;
    const secondary = ability.icon.secondaryColor;
    const size = 20;

    g.fillStyle(primary, 0.3);
    g.fillCircle(0, 0, size + 5);

    g.fillStyle(primary, 0.9);
    g.fillCircle(0, 0, size);

    g.fillStyle(secondary, 0.7);
    g.fillCircle(-size * 0.25, -size * 0.25, size * 0.4);

    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-size * 0.35, -size * 0.35, size * 0.2);
  }
}

export const TOWER_HINTS: Record<TowerBranch, string> = {
  archer: '🏹 Versatile tower. +200% damage vs flying units. Good all-rounder.',
  rapidfire: '⚡ Very fast attacks shred unarmored targets. Weak vs heavy armor.',
  sniper: '🎯 Extreme range and damage. Best for picking off tough single targets.',
  rockcannon: '💥 Splash damage hits multiple enemies. Great for swarms.',
  icetower: '❄️ Slows enemies so other towers deal more damage. Essential support.',
  poison: '☠️ Damage over time ignores armor. Best counter to armored units!',
  aura: '🔴 Buffs damage of nearby towers. Place next to your best DPS towers.'
};

export const BRANCH_NAMES: Record<TowerBranch, string> = {
  archer: 'Archer II',
  rapidfire: 'Rapid Fire',
  sniper: 'Sniper',
  rockcannon: 'Cannon',
  icetower: 'Ice',
  poison: 'Poison',
  aura: 'Aura'
};

export const BRANCH_DESCRIPTIONS: Record<TowerBranch, string> = {
  archer: 'Best vs flying units',
  rapidfire: 'Fast attacks, weak vs armor',
  sniper: 'High single-target damage',
  rockcannon: 'AOE splash damage',
  icetower: 'Slows enemies for allies',
  poison: 'Best vs armored units',
  aura: 'Buffs nearby towers'
};
