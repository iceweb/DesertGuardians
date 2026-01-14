import Phaser from 'phaser';
import { CreepIconGenerator } from '../graphics/CreepIconGenerator';
import type { WaveType } from '../data/GameData';

export class NextWavePanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private iconGenerator: CreepIconGenerator;
  private tooltip: Phaser.GameObjects.Container | null = null;
  private icons: Phaser.GameObjects.Container[] = [];
  private bossGlow: Phaser.GameObjects.Graphics | null = null;
  private glowTween: Phaser.Tweens.Tween | null = null;

  private readonly PANEL_X = 20;
  private readonly PANEL_Y_OFFSET = 130;
  private readonly ICON_SIZE = 42;
  private readonly ICON_SPACING = 56;
  private readonly MAX_ICONS_PER_ROW = 5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.iconGenerator = new CreepIconGenerator(scene);
    this.container = scene.add.container(0, 0);
    this.container.setDepth(150);
    this.container.setVisible(false);
  }

  show(waveNumber: number, creepTypes: Array<{ type: string; description: string }>, waveType?: WaveType): void {
    this.clearIcons();
    this.container.removeAll(true);

    const height = this.scene.cameras.main.height;
    const isBossWave = waveType === 'boss';

    const iconCount = Math.min(creepTypes.length, this.MAX_ICONS_PER_ROW);
    const rows = Math.ceil(creepTypes.length / this.MAX_ICONS_PER_ROW);
    const panelWidth = Math.max(160, iconCount * this.ICON_SPACING + 50);
    const panelHeight = 95 + rows * this.ICON_SPACING;

    this.container.setPosition(this.PANEL_X, height - this.PANEL_Y_OFFSET - panelHeight / 2);

    if (isBossWave) {
      this.bossGlow = this.scene.add.graphics();
      this.drawBossGlow(panelWidth, panelHeight, 0.3);
      this.container.add(this.bossGlow);

      this.glowTween = this.scene.tweens.add({
        targets: { alpha: 0.3 },
        alpha: 0.8,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const alpha = tween.getValue() ?? 0.3;
          if (this.bossGlow) {
            this.drawBossGlow(panelWidth, panelHeight, alpha);
          }
        }
      });
    }

    const bg = this.scene.add.graphics();
    this.drawPanelBackground(bg, panelWidth, panelHeight, isBossWave);
    this.container.add(bg);

    const hitBlocker = this.scene.add.rectangle(panelWidth / 2, panelHeight / 2, panelWidth, panelHeight, 0x000000, 0);
    hitBlocker.setInteractive();
    hitBlocker.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });
    this.container.add(hitBlocker);

    const headerText = isBossWave ? '⚔️ BOSS WAVE' : 'Next Wave';
    const headerColor = isBossWave ? '#ff4444' : '#d4a574';
    const header = this.scene.add.text(panelWidth / 2, 14, headerText, {
      fontFamily: 'Arial',
      fontSize: isBossWave ? '16px' : '15px',
      fontStyle: isBossWave ? 'bold' : 'normal',
      color: headerColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);
    this.container.add(header);

    const subtitle = this.scene.add.text(panelWidth / 2, 34, `Wave ${waveNumber}`, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#888888'
    }).setOrigin(0.5, 0);
    this.container.add(subtitle);

    const headerHeight = 55;
    const iconAreaHeight = panelHeight - headerHeight - 10;
    const totalIconHeight = rows * this.ICON_SPACING;
    const startX = 25 + this.ICON_SIZE / 2;
    const startY = headerHeight + (iconAreaHeight - totalIconHeight) / 2 + this.ICON_SIZE / 2;

    creepTypes.forEach((creepInfo, index) => {
      const row = Math.floor(index / this.MAX_ICONS_PER_ROW);
      const col = index % this.MAX_ICONS_PER_ROW;
      const x = startX + col * this.ICON_SPACING;
      const y = startY + row * this.ICON_SPACING;

      const iconContainer = this.createIconWithHover(x, y, creepInfo.type, creepInfo.description);
      this.container.add(iconContainer);
      this.icons.push(iconContainer);
    });

    this.container.setVisible(true);
  }

  private createIconWithHover(x: number, y: number, creepType: string, description: string): Phaser.GameObjects.Container {
    const iconContainer = this.scene.add.container(x, y);

    const iconBg = this.scene.add.graphics();
    iconBg.fillStyle(0x2a1a10, 0.9);
    iconBg.fillCircle(0, 0, this.ICON_SIZE / 2 + 2);
    iconBg.lineStyle(1, 0x8b6914, 0.8);
    iconBg.strokeCircle(0, 0, this.ICON_SIZE / 2 + 2);
    iconContainer.add(iconBg);

    const icon = this.iconGenerator.createIcon(creepType, 0, 0);
    icon.setDisplaySize(this.ICON_SIZE - 4, this.ICON_SIZE - 4);
    iconContainer.add(icon);

    const hitArea = this.scene.add.rectangle(0, 0, this.ICON_SIZE + 4, this.ICON_SIZE + 4, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    iconContainer.add(hitArea);

    hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });

    const displayName = this.formatCreepName(creepType);

    hitArea.on('pointerover', () => {
      iconBg.clear();
      iconBg.fillStyle(0x4a3a20, 1);
      iconBg.fillCircle(0, 0, this.ICON_SIZE / 2 + 2);
      iconBg.lineStyle(2, 0xffd700, 1);
      iconBg.strokeCircle(0, 0, this.ICON_SIZE / 2 + 2);

      this.showTooltip(displayName, description, iconContainer.x + this.container.x, iconContainer.y + this.container.y);
    });

    hitArea.on('pointerout', () => {
      iconBg.clear();
      iconBg.fillStyle(0x2a1a10, 0.9);
      iconBg.fillCircle(0, 0, this.ICON_SIZE / 2 + 2);
      iconBg.lineStyle(1, 0x8b6914, 0.8);
      iconBg.strokeCircle(0, 0, this.ICON_SIZE / 2 + 2);

      this.hideTooltip();
    });

    return iconContainer;
  }

  private formatCreepName(type: string): string {

    if (type.startsWith('boss_')) {
      const bossNum = type.split('_')[1];
      const names: Record<string, string> = {
        '1': 'Giant Gecko',
        '2': 'Komodo Warlord',
        '3': 'Drake Champion',
        '4': 'Young Dragon',
        '5': 'Elder Dragon Lord'
      };
      return names[bossNum] || 'Boss';
    }
    if (type === 'boss_guard_1') return 'Drake Knight';
    if (type === 'boss_guard_2') return 'Dragon Knight';
    if (type === 'boss_guard_3') return 'Flame Knight';
    if (type === 'boss') return 'Boss';

    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private showTooltip(name: string, description: string, iconX: number, iconY: number): void {
    this.hideTooltip();

    this.tooltip = this.scene.add.container(iconX, iconY - 45);
    this.tooltip.setDepth(200);

    const tempText = this.scene.add.text(0, 0, description, {
      fontFamily: 'Arial',
      fontSize: '13px',
      wordWrap: { width: 200 }
    });
    const textWidth = Math.min(tempText.width, 200);
    const textHeight = tempText.height;
    tempText.destroy();

    const tooltipWidth = Math.max(textWidth + 24, 120);
    const tooltipHeight = textHeight + 42;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-tooltipWidth / 2, -tooltipHeight, tooltipWidth, tooltipHeight, 6);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-tooltipWidth / 2, -tooltipHeight, tooltipWidth, tooltipHeight, 6);

    bg.fillStyle(0x1a0a00, 0.95);
    bg.beginPath();
    bg.moveTo(-8, 0);
    bg.lineTo(8, 0);
    bg.lineTo(0, 8);
    bg.closePath();
    bg.fillPath();
    bg.lineStyle(2, 0xd4a574, 1);
    bg.lineBetween(-8, 0, 0, 8);
    bg.lineBetween(0, 8, 8, 0);

    this.tooltip.add(bg);

    const nameText = this.scene.add.text(0, -tooltipHeight + 10, name, {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0);
    this.tooltip.add(nameText);

    const descText = this.scene.add.text(0, -tooltipHeight + 30, description, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffffff',
      wordWrap: { width: tooltipWidth - 20 },
      align: 'center'
    }).setOrigin(0.5, 0);
    this.tooltip.add(descText);

    const minX = tooltipWidth / 2 + 10;
    const maxX = this.scene.cameras.main.width - tooltipWidth / 2 - 10;
    this.tooltip.x = Phaser.Math.Clamp(this.tooltip.x, minX, maxX);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  private drawBossGlow(width: number, height: number, alpha: number): void {
    if (!this.bossGlow) return;
    this.bossGlow.clear();

    this.bossGlow.fillStyle(0xff4400, alpha * 0.3);
    this.bossGlow.fillRoundedRect(-8, -8, width + 16, height + 16, 12);

    this.bossGlow.fillStyle(0xffd700, alpha * 0.4);
    this.bossGlow.fillRoundedRect(-4, -4, width + 8, height + 8, 10);
  }

  private drawPanelBackground(g: Phaser.GameObjects.Graphics, width: number, height: number, isBossWave: boolean): void {

    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(4, 4, width, height, 8);

    g.fillStyle(0x1a0a00, 0.92);
    g.fillRoundedRect(0, 0, width, height, 8);

    const borderColor = isBossWave ? 0xff6644 : 0xd4a574;
    g.lineStyle(2, borderColor, 1);
    g.strokeRoundedRect(0, 0, width, height, 8);

    g.lineStyle(1, 0x8b6914, 0.5);
    g.strokeRoundedRect(4, 4, width - 8, height - 8, 6);

    const dotColor = isBossWave ? 0xff4444 : 0xd4a574;
    g.fillStyle(dotColor, 0.8);
    g.fillCircle(10, 10, 3);
    g.fillCircle(width - 10, 10, 3);
  }

  hide(): void {
    this.container.setVisible(false);
    this.hideTooltip();
    this.clearIcons();

    if (this.glowTween) {
      this.glowTween.destroy();
      this.glowTween = null;
    }
  }

  private clearIcons(): void {
    this.icons.forEach(icon => icon.destroy());
    this.icons = [];
    this.bossGlow = null;
  }

  updatePosition(): void {
    if (!this.container.visible) return;
    const height = this.scene.cameras.main.height;
    this.container.y = height - this.PANEL_Y_OFFSET - this.container.height / 2;
  }

  destroy(): void {
    this.hide();
    this.container.destroy();
    this.iconGenerator.clearCache();
  }
}
