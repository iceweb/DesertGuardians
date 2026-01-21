import Phaser from 'phaser';
import type { TowerConfig } from '../data';
import type { Tower } from '../objects/Tower';

/**
 * Utility for formatting and displaying tower statistics in menus
 */
export class TowerStatsDisplay {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Draws a star shape on a graphics object
   */
  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    points: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    graphics.closePath();
    graphics.fillPath();
  }

  /**
   * Calculates DPS from tower stats
   */
  calculateDPS(damage: number, fireRateMs: number): string {
    return (damage / (fireRateMs / 1000)).toFixed(1);
  }

  /**
   * Formats fire rate for display
   */
  formatFireRate(fireRateMs: number): string {
    return (fireRateMs / 1000).toFixed(1) + 's';
  }

  /**
   * Creates a stat label text object
   */
  createStatLabel(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    label: string,
    enabled: boolean = true
  ): Phaser.GameObjects.Text {
    const text = this.scene.add
      .text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: enabled ? '#aaaaaa' : '#555555',
      })
      .setOrigin(0, 0.5);
    container.add(text);
    return text;
  }

  /**
   * Creates a stat value text object with color coding
   */
  createStatValue(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    value: string,
    color: string,
    enabled: boolean = true
  ): Phaser.GameObjects.Text {
    const text = this.scene.add
      .text(x, y, value, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: enabled ? color : '#555555',
      })
      .setOrigin(0, 0.5);
    container.add(text);
    return text;
  }

  /**
   * Creates a stat row with label and value
   */
  createStatRow(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    label: string,
    value: string,
    valueColor: string,
    enabled: boolean = true
  ): { label: Phaser.GameObjects.Text; value: Phaser.GameObjects.Text } {
    const labelText = this.createStatLabel(container, x, y, label, enabled);
    const valueText = this.createStatValue(
      container,
      x + labelText.width + 5,
      y,
      value,
      valueColor,
      enabled
    );
    return { label: labelText, value: valueText };
  }

  /**
   * Creates a basic stats display for a tower config
   */
  createBasicStatsDisplay(
    container: Phaser.GameObjects.Container,
    config: TowerConfig,
    startX: number,
    startY: number,
    enabled: boolean = true,
    compact: boolean = false
  ): number {
    const stats = config.stats;
    const spacing = compact ? 20 : 23;
    let y = startY;

    // Damage
    this.createStatLabel(container, startX, y, 'DMG:', enabled);
    this.createStatValue(container, startX + 40, y, `${stats.damage}`, '#ff6666', enabled);

    // Fire rate
    this.createStatLabel(container, startX + 75, y, 'Rate:', enabled);
    this.createStatValue(
      container,
      startX + 120,
      y,
      this.formatFireRate(stats.fireRate),
      '#66ccff',
      enabled
    );
    y += spacing;

    // DPS
    this.createStatLabel(container, startX, y, 'DPS:', enabled);
    this.createStatValue(
      container,
      startX + 40,
      y,
      this.calculateDPS(stats.damage, stats.fireRate),
      '#ffcc44',
      enabled
    );

    // Range
    this.createStatLabel(container, startX + 75, y, 'Range:', enabled);
    this.createStatValue(container, startX + 135, y, `${stats.range}`, '#66ff66', enabled);
    y += spacing;

    return y;
  }

  /**
   * Creates veteran rank display
   */
  createVeteranDisplay(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    tower: Tower,
    rankColor: number
  ): void {
    const veteranName = tower.getVeteranRankName();
    const killCount = tower.getKillCount();

    const veteranIcon = this.scene.add.graphics();
    veteranIcon.setPosition(x, y);
    veteranIcon.fillStyle(rankColor, 1);
    this.drawStar(veteranIcon, 0, 0, 5, 7, 3);
    container.add(veteranIcon);

    const veteranText = this.scene.add
      .text(x + 15, y, veteranName, {
        fontFamily: 'Arial Black',
        fontSize: '13px',
        color: `#${rankColor.toString(16).padStart(6, '0')}`,
      })
      .setOrigin(0, 0.5);
    container.add(veteranText);

    const killText = this.scene.add
      .text(x + veteranText.width + 25, y, `(${killCount} kills)`, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#888888',
      })
      .setOrigin(0, 0.5);
    container.add(killText);
  }

  /**
   * Creates buff indicator display
   */
  createBuffDisplay(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    damageMultiplier: number,
    critBonus: number
  ): number {
    let currentY = y;

    if (damageMultiplier > 1.0) {
      const buffIcon = this.scene.add.graphics();
      buffIcon.setPosition(x, currentY);
      buffIcon.fillStyle(0xff6600, 1);
      buffIcon.fillCircle(0, 0, 6);
      buffIcon.fillStyle(0xffaa00, 1);
      buffIcon.fillTriangle(-3, 3, 0, -4, 3, 3);
      container.add(buffIcon);

      const buffText = this.scene.add
        .text(x + 15, currentY, `Aura: +${Math.round((damageMultiplier - 1.0) * 100)}% DMG`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ff9944',
        })
        .setOrigin(0, 0.5);
      container.add(buffText);
      currentY += 18;
    }

    if (critBonus > 0) {
      const critIcon = this.scene.add.graphics();
      critIcon.setPosition(x, currentY);
      critIcon.fillStyle(0xffcc00, 1);
      this.drawStar(critIcon, 0, 0, 5, 6, 3);
      container.add(critIcon);

      const critText = this.scene.add
        .text(x + 15, currentY, `Crit Aura: +${Math.round(critBonus * 100)}%`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffcc00',
        })
        .setOrigin(0, 0.5);
      container.add(critText);
      currentY += 18;
    }

    return currentY;
  }

  /**
   * Creates slow effect display
   */
  createSlowDisplay(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    slowPercent: number,
    slowDuration: number
  ): void {
    const slowIcon = this.scene.add.graphics();
    slowIcon.setPosition(x, y);
    slowIcon.fillStyle(0x66ccff, 1);
    slowIcon.fillCircle(0, 0, 5);
    slowIcon.fillStyle(0xaaddff, 0.8);
    slowIcon.fillCircle(-1, -1, 2);
    container.add(slowIcon);

    const slowText = this.scene.add
      .text(
        x + 15,
        y,
        `Slow: ${Math.round(slowPercent)}% for ${(slowDuration / 1000).toFixed(1)}s`,
        {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#66ccff',
        }
      )
      .setOrigin(0, 0.5);
    container.add(slowText);
  }

  /**
   * Creates DoT effect display
   */
  createDoTDisplay(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    dotDamage: number,
    dotDuration: number
  ): void {
    const dotIcon = this.scene.add.graphics();
    dotIcon.setPosition(x, y);
    dotIcon.fillStyle(0x66ff66, 1);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const px = Math.cos(angle) * 4;
      const py = Math.sin(angle) * 4;
      dotIcon.fillCircle(px, py, 2);
    }
    container.add(dotIcon);

    const dotText = this.scene.add
      .text(x + 15, y, `Poison: ${dotDamage}/s for ${(dotDuration / 1000).toFixed(1)}s`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#66ff66',
      })
      .setOrigin(0, 0.5);
    container.add(dotText);
  }
}
