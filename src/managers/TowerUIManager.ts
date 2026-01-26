import Phaser from 'phaser';
import { Tower } from '../objects/Tower';
import { TOWER_CONFIGS } from '../data';
import { TOWER_BRANCH_COLORS, VETERAN_RANK_COLORS } from '../data/ThemeConfig';
import { UIHelper } from './UIHelper';
import type { UIHitDetector } from './UIHitDetector';
import type { PopupController } from './PopupController';
import {
  TowerIconRenderer,
  TOWER_HINTS,
  BRANCH_NAMES,
  BRANCH_DESCRIPTIONS,
} from './TowerIconRenderer';

export class TowerUIManager {
  private scene: Phaser.Scene;
  private uiHelper: UIHelper;

  private placementGraphics: Phaser.GameObjects.Graphics;

  private buildMenuContainer: Phaser.GameObjects.Container | null = null;
  private upgradeMenuContainer: Phaser.GameObjects.Container | null = null;
  private abilityMenuContainer: Phaser.GameObjects.Container | null = null;

  private selectedTower: Tower | null = null;
  private lastKnownGold: number = 0;

  private buildMenuPosition: { x: number; y: number } | null = null;

  private reviewMode: boolean = false;

  private uiHitDetector: UIHitDetector | null = null;
  private popupController: PopupController | null = null;

  public onBuildRequested?: (x: number, y: number, towerKey: string) => void;
  public onUpgradeRequested?: (tower: Tower, newKey: string) => void;
  public onAbilitySelected?: (tower: Tower, abilityId: string) => void;
  public onSellRequested?: (tower: Tower) => void;
  public getPlayerGold?: () => number;
  public canPlaceAt?: (x: number, y: number) => boolean;
  public isOverMine?: (x: number, y: number) => boolean;
  public isInBuildableZone?: (x: number, y: number) => boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.uiHelper = new UIHelper(scene);

    this.placementGraphics = scene.add.graphics();
    this.placementGraphics.setDepth(50);
  }

  setUIHitDetector(detector: UIHitDetector): void {
    this.uiHitDetector = detector;
  }

  setPopupController(controller: PopupController): void {
    this.popupController = controller;
  }

  setReviewMode(enabled: boolean): void {
    this.reviewMode = enabled;
  }

  updatePlacementPreview(x: number, y: number, towerAt: Tower | null): void {
    this.placementGraphics.clear();

    if (this.buildMenuContainer || this.upgradeMenuContainer || this.abilityMenuContainer) return;

    if (towerAt) return;

    if (this.uiHitDetector?.isOverUI(x, y)) return;

    if (this.isInBuildableZone && !this.isInBuildableZone(x, y)) return;

    const canPlace = this.canPlaceAt?.(x, y) ?? false;
    const config = TOWER_CONFIGS['archer_1'];
    const TOWER_RADIUS = 25;

    if (canPlace) {
      this.placementGraphics.lineStyle(3, 0x00ff00, 0.8);
      this.placementGraphics.strokeCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.fillStyle(0x00ff00, 0.2);
      this.placementGraphics.fillCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.lineStyle(4, 0x00ff00, 0.5);
      this.placementGraphics.strokeCircle(x, y, config.stats.range);
    }
  }

  /* eslint-disable complexity, max-lines-per-function */
  showBuildMenu(x: number, y: number): void {
    this.buildMenuPosition = { x, y };
    this.lastKnownGold = this.getPlayerGold?.() || 0;

    this.closeMenus(true, false);

    const playerGold = this.getPlayerGold?.() || 0;
    const archerConfig = TOWER_CONFIGS['archer_1'];
    const canAfford = playerGold >= (archerConfig.buildCost || 70);

    this.buildMenuContainer = this.scene.add.container(x, y - 120);
    this.buildMenuContainer.setDepth(200);

    this.popupController?.open('tower-build', undefined, () => this.closeMenus(false, true));

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.97);
    bg.fillRoundedRect(-175, -90, 350, 195, 14);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-175, -90, 350, 195, 14);
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-170, -85, 340, 185, 12);
    this.buildMenuContainer.add(bg);

    const title = this.scene.add
      .text(0, -68, 'Build Tower', {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.buildMenuContainer.add(title);

    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-120, -50, 120, -50);
    this.buildMenuContainer.add(titleLine);

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x2a2015 : 0x1a1510, 1);
    btnBg.fillRoundedRect(-160, -40, 320, 100, 10);
    btnBg.lineStyle(2, canAfford ? 0xc49564 : 0x555555, 1);
    btnBg.strokeRoundedRect(-160, -40, 320, 100, 10);
    this.buildMenuContainer.add(btnBg);

    const towerIcon = this.scene.add.graphics();
    towerIcon.setPosition(-110, 20);
    TowerIconRenderer.drawArcherTowerIcon(towerIcon, canAfford);
    this.buildMenuContainer.add(towerIcon);

    const nameText = this.scene.add
      .text(30, -25, 'Archer Tower', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: canAfford ? '#ffffff' : '#666666',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.buildMenuContainer.add(nameText);

    const stats = archerConfig.stats;
    const fireRateSec = (stats.fireRate / 1000).toFixed(1);
    const dps = (stats.damage / (stats.fireRate / 1000)).toFixed(1);

    const dmgLabel = this.scene.add
      .text(-45, 5, 'DMG:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: canAfford ? '#aaaaaa' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgLabel);

    const dmgValue = this.scene.add
      .text(-5, 5, `${stats.damage}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAfford ? '#ff6666' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgValue);

    const rateLabel = this.scene.add
      .text(30, 5, 'Rate:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: canAfford ? '#aaaaaa' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateLabel);

    const rateValue = this.scene.add
      .text(75, 5, `${fireRateSec}s`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAfford ? '#66ccff' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateValue);

    const dpsLabel = this.scene.add
      .text(-45, 28, 'DPS:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: canAfford ? '#aaaaaa' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsLabel);

    const dpsValue = this.scene.add
      .text(-5, 28, `${dps}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAfford ? '#ffcc44' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsValue);

    const rangeLabel = this.scene.add
      .text(30, 28, 'Range:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: canAfford ? '#aaaaaa' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeLabel);

    const rangeValue = this.scene.add
      .text(90, 28, `${stats.range}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAfford ? '#66ff66' : '#555555',
      })
      .setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeValue);

    if (stats.airDamageBonus) {
      const airLabel = this.scene.add
        .text(-45, 50, 'vs Air:', {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: canAfford ? '#aaaaaa' : '#555555',
        })
        .setOrigin(0, 0.5);
      this.buildMenuContainer.add(airLabel);

      const airValue = this.scene.add
        .text(10, 50, `+${Math.round(stats.airDamageBonus * 100)}%`, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: canAfford ? '#66ccff' : '#555555',
        })
        .setOrigin(0, 0.5);
      this.buildMenuContainer.add(airValue);

      const targetText = this.scene.add
        .text(85, 50, 'Single target', {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: canAfford ? '#888888' : '#444444',
          fontStyle: 'italic',
        })
        .setOrigin(0, 0.5);
      this.buildMenuContainer.add(targetText);
    }

    const costText = this.scene.add
      .text(0, 85, `Cost: ${archerConfig.buildCost}g`, {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: canAfford ? '#ffd700' : '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.buildMenuContainer.add(costText);

    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 10, 320, 100, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on(
        'pointerdown',
        (
          _pointer: Phaser.Input.Pointer,
          _localX: number,
          _localY: number,
          event: Phaser.Types.Input.EventData
        ) => {
          event.stopPropagation();
          this.onBuildRequested?.(x, y, 'archer_1');
          this.closeMenus();
        }
      );
      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3025, 1);
        btnBg.fillRoundedRect(-160, -40, 320, 100, 10);
        btnBg.lineStyle(2, 0xffd700, 1);
        btnBg.strokeRoundedRect(-160, -40, 320, 100, 10);
      });
      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2015, 1);
        btnBg.fillRoundedRect(-160, -40, 320, 100, 10);
        btnBg.lineStyle(2, 0xc49564, 1);
        btnBg.strokeRoundedRect(-160, -40, 320, 100, 10);
      });
      this.buildMenuContainer.add(hitArea);
    }

    const closeBtn = this.scene.add
      .text(160, -75, '✕', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ff6666',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.closeMenus();
      }
    );
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.buildMenuContainer.add(closeBtn);

    this.uiHelper.clampToScreen(this.buildMenuContainer, 350, 195, 0.5, 0.5);
  }

  update(): void {
    const currentGold = this.getPlayerGold?.() || 0;

    if (this.upgradeMenuContainer && this.selectedTower) {
      if (currentGold !== this.lastKnownGold) {
        this.lastKnownGold = currentGold;

        const tower = this.selectedTower;
        this.showUpgradeMenu(tower);
      }
    }

    if (this.buildMenuContainer && this.buildMenuPosition) {
      if (currentGold !== this.lastKnownGold) {
        this.lastKnownGold = currentGold;

        const pos = this.buildMenuPosition;
        this.showBuildMenu(pos.x, pos.y);
      }
    }
  }
  /* eslint-enable complexity, max-lines-per-function */

  /* eslint-disable complexity, max-lines-per-function */
  showUpgradeMenu(tower: Tower): void {
    this.selectedTower = tower;
    this.lastKnownGold = this.getPlayerGold?.() || 0;

    this.closeMenus(true, false);

    const config = tower.getConfig();
    const playerGold = this.getPlayerGold?.() || 0;
    const upgradeOptions = tower.getUpgradeOptions();

    const hasBranches = upgradeOptions.branches && upgradeOptions.branches.length > 0;
    const hasLevelUp = !!upgradeOptions.levelUp;
    const branchCount = upgradeOptions.branches?.length || 0;
    const hasDamageBuff = tower.getDamageMultiplier() > 1.0;
    const hasCritBuff = tower.getAuraCritBonus() > 0;
    const veteranRank = tower.getVeteranRank();
    const veteranName = tower.getVeteranRankName();
    const killCount = tower.getKillCount();

    const menuWidth = hasBranches && !this.reviewMode ? Math.max(780, branchCount * 115 + 60) : 420;
    let menuHeight = 210;
    const hasSlow = !!config.stats.slowPercent && !!config.stats.slowDuration;
    const hasDot = !!config.stats.dotDamage && !!config.stats.dotDuration;
    if (hasDamageBuff) menuHeight += 18;
    if (hasCritBuff) menuHeight += 18;
    if (this.reviewMode) {
      menuHeight += 20;
    } else if (hasBranches) menuHeight += 190;
    else if (hasLevelUp) menuHeight += 130;
    else {
      menuHeight += 40;
      if (tower.getSelectedAbility()) {
        menuHeight += 54;
      }
    }
    if (!this.reviewMode) menuHeight += 45;
    if (hasSlow) menuHeight += 22;
    if (hasDot) menuHeight += 22;

    this.upgradeMenuContainer = this.scene.add.container(tower.x, tower.y - menuHeight / 2 - 40);
    this.upgradeMenuContainer.setDepth(200);

    this.popupController?.open('tower-upgrade', undefined, () => this.closeMenus(false, true));

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.97);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 14);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 14);
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(
      -menuWidth / 2 + 5,
      -menuHeight / 2 + 5,
      menuWidth - 10,
      menuHeight - 10,
      12
    );
    this.upgradeMenuContainer.add(bg);

    const title = this.scene.add
      .text(0, -menuHeight / 2 + 20, config.name, {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.upgradeMenuContainer.add(title);

    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(
      -menuWidth / 2 + 30,
      -menuHeight / 2 + 38,
      menuWidth / 2 - 30,
      -menuHeight / 2 + 38
    );
    this.upgradeMenuContainer.add(titleLine);

    let yOffset = -menuHeight / 2 + 52;

    const fireRateSec =
      config.stats.fireRate > 0 ? (config.stats.fireRate / 1000).toFixed(1) : '0.0';
    const baseDamage = config.stats.damage;
    const buffedDamage = tower.getDamage();
    const damageMultiplier = tower.getDamageMultiplier();
    const hasBonus = damageMultiplier > 1.0;

    const baseDps =
      config.stats.fireRate > 0 ? (baseDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';
    const buffedDps =
      config.stats.fireRate > 0 ? (buffedDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';

    const statsStartX = -menuWidth / 2 + 50;
    const statLineHeight = 24;

    const dmgLabel = this.scene.add
      .text(statsStartX, yOffset, 'DMG:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgLabel);

    const dmgValue = this.scene.add
      .text(statsStartX + 50, yOffset, `${baseDamage}`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#ff6666',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgValue);

    if (hasBonus) {
      const bonusDmg = buffedDamage - baseDamage;
      const dmgBonus = this.scene.add
        .text(statsStartX + 50 + dmgValue.width + 3, yOffset, `(+${bonusDmg})`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#88ff88',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dmgBonus);
    }

    const rateLabel = this.scene.add
      .text(statsStartX + 160, yOffset, 'Rate:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateLabel);

    const rateValue = this.scene.add
      .text(statsStartX + 210, yOffset, `${fireRateSec}s`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#66ccff',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateValue);

    yOffset += statLineHeight;

    const dpsLabel = this.scene.add
      .text(statsStartX, yOffset, 'DPS:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsLabel);

    const dpsValue = this.scene.add
      .text(statsStartX + 50, yOffset, `${baseDps}`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#ffcc44',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsValue);

    if (hasBonus) {
      const bonusDps = (parseFloat(buffedDps) - parseFloat(baseDps)).toFixed(1);
      const dpsBonus = this.scene.add
        .text(statsStartX + 50 + dpsValue.width + 3, yOffset, `(+${bonusDps})`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#88ff88',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dpsBonus);
    }

    const rangeLabel = this.scene.add
      .text(statsStartX + 160, yOffset, 'Range:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeLabel);

    const rangeValue = this.scene.add
      .text(statsStartX + 220, yOffset, `${config.stats.range}`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#66ff66',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeValue);

    if (config.stats.airDamageBonus) {
      const airText = `+${Math.round(config.stats.airDamageBonus * 100)}%`;
      const airLabelX = statsStartX + 280;
      const airValueX = statsStartX + 340;

      const airLabel = this.scene.add
        .text(airLabelX, yOffset, 'vs Air:', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#aaaaaa',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(airLabel);

      const airValue = this.scene.add
        .text(airValueX, yOffset, airText, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#66ccff',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(airValue);

      const rightLimit = menuWidth / 2 - 20;
      if (airValueX + airValue.width > rightLimit) {
        airLabel.setPosition(statsStartX, yOffset + statLineHeight);
        airValue.setPosition(statsStartX + 60, yOffset + statLineHeight);
        yOffset += statLineHeight;
      }
    }

    // Display splash radius for cannon towers
    if (config.stats.splashRadius) {
      const splashLabel = this.scene.add
        .text(statsStartX + 280, yOffset, 'Splash:', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#aaaaaa',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(splashLabel);

      const splashValue = this.scene.add
        .text(statsStartX + 355, yOffset, `${config.stats.splashRadius}px`, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#ffaa44',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(splashValue);
    }

    yOffset += statLineHeight + 2;

    if (hasSlow) {
      const slowPercent = Math.round((config.stats.slowPercent || 0) * 100);
      const slowSeconds = (config.stats.slowDuration || 0) / 1000;
      const maxSlowTargets = config.stats.maxSlowTargets
        ? ` · Max ${config.stats.maxSlowTargets}`
        : '';

      const slowText = this.scene.add
        .text(
          statsStartX,
          yOffset,
          `❄ Slow: ${slowPercent}% for ${slowSeconds}s${maxSlowTargets}`,
          {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#aaddff',
          }
        )
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(slowText);
      yOffset += statLineHeight;
    }

    if (hasDot) {
      const dotDamage = config.stats.dotDamage || 0;
      const dotSeconds = (config.stats.dotDuration || 0) / 1000;
      const dotText = this.scene.add
        .text(statsStartX, yOffset, `☠ DoT: ${dotDamage} dmg/s for ${dotSeconds}s · Stacks 3x`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#aaffaa',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dotText);
      yOffset += statLineHeight;
    }

    const rankColor = VETERAN_RANK_COLORS[veteranRank] || '#888888';

    const killsLabel = this.scene.add
      .text(statsStartX, yOffset, '☠ Kills:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsLabel);

    const killsValue = this.scene.add
      .text(statsStartX + 70, yOffset, `${killCount}`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: killCount > 0 ? '#ff9966' : '#666666',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsValue);

    const rankLabel = this.scene.add
      .text(statsStartX + 140, yOffset, '🎖 Rank:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankLabel);

    const rankValue = this.scene.add
      .text(statsStartX + 215, yOffset, veteranName, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: rankColor,
      })
      .setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankValue);

    if (veteranRank > 0) {
      const veteranBonus = tower.getVeteranDamageBonus();
      const bonusText = this.scene.add
        .text(statsStartX + 215 + rankValue.width + 8, yOffset, `+${veteranBonus}% DMG`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#88ff88',
        })
        .setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(bonusText);
    }

    yOffset += 22;

    const hintText = this.scene.add
      .text(0, yOffset, TOWER_HINTS[config.branch], {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#88ccff',
        fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: menuWidth - 60 },
      })
      .setOrigin(0.5);
    this.upgradeMenuContainer.add(hintText);

    yOffset += hintText.height + 8;

    if (hasDamageBuff) {
      const buffPercent = Math.round((damageMultiplier - 1) * 100);
      const buffText = this.scene.add
        .text(0, yOffset, `🔴 Aura Buff: +${buffPercent}% damage`, {
          fontFamily: 'Arial',
          fontSize: '15px',
          color: '#ff6666',
        })
        .setOrigin(0.5);
      this.upgradeMenuContainer.add(buffText);
      yOffset += 18;
    }

    if (hasCritBuff) {
      const critPercent = Math.round(tower.getAuraCritBonus() * 100);
      const critText = this.scene.add
        .text(0, yOffset, `⚡ Critical Aura: +${critPercent}% crit chance`, {
          fontFamily: 'Arial',
          fontSize: '15px',
          color: '#ffa500',
        })
        .setOrigin(0.5);
      this.upgradeMenuContainer.add(critText);
      yOffset += 18;
    }

    yOffset += 8;

    if (hasBranches && !this.reviewMode) {
      const branchLabel = this.scene.add
        .text(0, yOffset, 'Choose Specialization:', {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#aaaaaa',
        })
        .setOrigin(0.5);
      this.upgradeMenuContainer.add(branchLabel);
      yOffset += 22;

      const branches = upgradeOptions.branches!;
      const btnWidth = 110;
      const btnHeight = 160;
      const startX = -((branches.length - 1) * (btnWidth + 5)) / 2;

      branches.forEach((branch, index) => {
        const branchKey = branch === 'archer' ? 'archer_2' : `${branch}_1`;
        const branchConfig = TOWER_CONFIGS[branchKey];
        if (!branchConfig) return;

        const bx = startX + index * (btnWidth + 5);
        const by = yOffset;
        const cost = branchConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const color = TOWER_BRANCH_COLORS[branch];

        const btn = this.scene.add.graphics();
        btn.fillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a, 1);
        btn.fillRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
        btn.lineStyle(2, canAfford ? color : 0x444444, 1);
        btn.strokeRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
        this.upgradeMenuContainer!.add(btn);

        const towerIcon = this.scene.add.graphics();
        TowerIconRenderer.drawMiniTowerIcon(towerIcon, bx, by + 38, branch, canAfford);
        this.upgradeMenuContainer!.add(towerIcon);

        const nameText = this.scene.add
          .text(bx, by + 68, BRANCH_NAMES[branch], {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: canAfford ? '#ffffff' : '#666666',
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer!.add(nameText);

        const descText = this.scene.add
          .text(bx, by + 92, BRANCH_DESCRIPTIONS[branch], {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: canAfford ? '#aaaaaa' : '#555555',
            align: 'center',
            wordWrap: { width: btnWidth - 8 },
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer!.add(descText);

        const stats = branchConfig.stats;
        const previewDps =
          stats.fireRate > 0 ? (stats.damage / (stats.fireRate / 1000)).toFixed(0) : '0';
        let statsPreview = '';
        if (branch === 'aura') {
          statsPreview = `+${Math.round((stats.auraDamageMultiplier || 0) * 100)}% buff`;
        } else {
          statsPreview = `${stats.damage} dmg | ${previewDps} DPS`;
        }
        const previewText = this.scene.add
          .text(bx, by + 120, statsPreview, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: canAfford ? '#88ff88' : '#555555',
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer!.add(previewText);

        const costText = this.scene.add
          .text(bx, by + 142, `${cost}g`, {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: canAfford ? '#ffd700' : '#ff4444',
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer!.add(costText);

        if (canAfford) {
          const hitArea = this.scene.add.rectangle(
            bx,
            by + btnHeight / 2,
            btnWidth,
            btnHeight,
            0xffffff,
            0
          );
          hitArea.setInteractive({ useHandCursor: true });
          // Capture references at creation time
          const capturedTower = tower;
          const capturedBranchKey = branchKey;
          hitArea.on(
            'pointerdown',
            (
              _pointer: Phaser.Input.Pointer,
              _localX: number,
              _localY: number,
              event: Phaser.Types.Input.EventData
            ) => {
              event.stopPropagation();
              // Re-check affordability at click time
              const currentGold = this.getPlayerGold?.() || 0;
              const requiredCost = TOWER_CONFIGS[capturedBranchKey]?.upgradeCost || 0;
              if (currentGold < requiredCost) {
                console.warn('Cannot afford upgrade anymore:', currentGold, '<', requiredCost);
                return;
              }
              this.onUpgradeRequested?.(capturedTower, capturedBranchKey);
            }
          );
          hitArea.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(0x4a4a4a, 1);
            btn.fillRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
            btn.lineStyle(3, color, 1);
            btn.strokeRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
          });
          hitArea.on('pointerout', () => {
            btn.clear();
            btn.fillStyle(0x2a2a2a, 1);
            btn.fillRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
            btn.lineStyle(2, color, 1);
            btn.strokeRoundedRect(bx - btnWidth / 2, by, btnWidth, btnHeight, 8);
          });
          this.upgradeMenuContainer!.add(hitArea);
        }
      });

      yOffset += btnHeight + 10;
    } else if (hasLevelUp && !this.reviewMode) {
      const levelUpConfig = TOWER_CONFIGS[upgradeOptions.levelUp!];
      if (levelUpConfig) {
        const cost = levelUpConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const nextLevel = levelUpConfig.level;
        const isLevel4 = nextLevel === 4;

        const upgradeBtn = this.uiHelper.createButton({
          text: `⬆ Upgrade to Level ${nextLevel}${isLevel4 ? ' ⭐' : ''}`,
          x: 0,
          y: yOffset + 10,
          fontSize: 14,
          textColor: isLevel4 ? '#ffd700' : '#00ff00',
          disabledTextColor: '#666666',
          bgColor: isLevel4 ? 0x4a3a2a : 0x2a4a2a,
          hoverBgColor: isLevel4 ? 0x6a5a3a : 0x3a6a3a,
          disabledBgColor: 0x2a2a2a,
          borderColor: isLevel4 ? 0xffd700 : 0x00ff00,
          disabledBorderColor: 0x444444,
          paddingX: 20,
          paddingY: 10,
          enabled: canAfford,
          onClick: canAfford
            ? () => {
                // Re-check affordability at click time
                const currentGold = this.getPlayerGold?.() || 0;
                const requiredCost = levelUpConfig.upgradeCost || 0;
                if (currentGold < requiredCost) {
                  console.warn('Cannot afford upgrade anymore:', currentGold, '<', requiredCost);
                  return;
                }
                if (isLevel4) {
                  this.showAbilitySelection(tower, upgradeOptions.levelUp!);
                } else {
                  this.onUpgradeRequested?.(tower, upgradeOptions.levelUp!);
                }
              }
            : undefined,
        });
        this.upgradeMenuContainer.add(upgradeBtn.container);

        const newStats = levelUpConfig.stats;
        const oldStats = config.stats;
        const dmgDiff = newStats.damage - oldStats.damage;
        const newDps =
          newStats.fireRate > 0 ? (newStats.damage / (newStats.fireRate / 1000)).toFixed(1) : '0';
        const oldDps =
          oldStats.fireRate > 0 ? (oldStats.damage / (oldStats.fireRate / 1000)).toFixed(1) : '0';
        const dpsDiff = (parseFloat(newDps) - parseFloat(oldDps)).toFixed(1);
        const rangeDiff = newStats.range - oldStats.range;

        let statY = yOffset + 42;
        const statSpacing = 22;

        if (dmgDiff > 0) {
          const dmgLabel = this.scene.add
            .text(-80, statY, 'DMG:', {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#aaaaaa',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgLabel);

          const dmgValue = this.scene.add
            .text(-35, statY, `${oldStats.damage}`, {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ffffff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgValue);

          const dmgArrow = this.scene.add
            .text(5, statY, '→', {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#88ff88',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgArrow);

          const dmgNew = this.scene.add
            .text(30, statY, `${newStats.damage}`, {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#88ff88',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgNew);

          const dmgBonus = this.scene.add
            .text(70, statY, `(+${dmgDiff})`, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: '#44ff44',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgBonus);

          statY += statSpacing;
        }

        if (parseFloat(dpsDiff) > 0) {
          const dpsLabel = this.scene.add
            .text(-80, statY, 'DPS:', {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#aaaaaa',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsLabel);

          const dpsValue = this.scene.add
            .text(-35, statY, `${oldDps}`, {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ffffff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsValue);

          const dpsArrow = this.scene.add
            .text(5, statY, '→', {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ffaa44',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsArrow);

          const dpsNew = this.scene.add
            .text(30, statY, `${newDps}`, {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#ffaa44',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsNew);

          const dpsBonus = this.scene.add
            .text(80, statY, `(+${dpsDiff})`, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: '#ffcc66',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsBonus);

          statY += statSpacing;
        }

        if (rangeDiff > 0) {
          const rangeLabel = this.scene.add
            .text(-80, statY, 'Range:', {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#aaaaaa',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeLabel);

          const rangeValue = this.scene.add
            .text(-15, statY, `${oldStats.range}`, {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ffffff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeValue);

          const rangeArrow = this.scene.add
            .text(25, statY, '→', {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#44aaff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeArrow);

          const rangeNew = this.scene.add
            .text(50, statY, `${newStats.range}`, {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#44aaff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeNew);

          const rangeBonus = this.scene.add
            .text(95, statY, `(+${rangeDiff})`, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: '#66ccff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeBonus);

          statY += statSpacing;
        }

        // Show aura buff increase for aura towers
        const oldAuraBuff = oldStats.auraDamageMultiplier || 0;
        const newAuraBuff = newStats.auraDamageMultiplier || 0;
        if (newAuraBuff > oldAuraBuff) {
          const oldBuffPercent = Math.round(oldAuraBuff * 100);
          const newBuffPercent = Math.round(newAuraBuff * 100);
          const buffDiff = newBuffPercent - oldBuffPercent;

          const buffLabel = this.scene.add
            .text(-80, statY, 'Buff:', {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#aaaaaa',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(buffLabel);

          const buffValue = this.scene.add
            .text(-30, statY, `+${oldBuffPercent}%`, {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ffffff',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(buffValue);

          const buffArrow = this.scene.add
            .text(20, statY, '→', {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#ff6666',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(buffArrow);

          const buffNew = this.scene.add
            .text(45, statY, `+${newBuffPercent}%`, {
              fontFamily: 'Arial Black',
              fontSize: '16px',
              color: '#ff6666',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(buffNew);

          const buffBonus = this.scene.add
            .text(100, statY, `(+${buffDiff}%)`, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: '#ff8888',
            })
            .setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(buffBonus);

          statY += statSpacing;
        }

        const costText = this.scene.add
          .text(0, yOffset + 110, `Cost: ${cost}g`, {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: canAfford ? '#ffd700' : '#ff4444',
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer.add(costText);

        yOffset += 75;
      }
    } else if (!this.reviewMode) {
      if (tower.getLevel() === 4 && !tower.getSelectedAbilityId()) {
        const selectBtn = this.uiHelper.createButton({
          text: '⭐ Select Ability',
          x: 0,
          y: yOffset + 10,
          fontSize: 13,
          textColor: '#ffd700',
          bgColor: 0x4a3a2a,
          hoverBgColor: 0x6a5a3a,
          borderColor: 0xffd700,
          paddingX: 15,
          paddingY: 8,
          enabled: true,
          onClick: () => this.showAbilitySelectionForExisting(tower),
        });
        this.upgradeMenuContainer.add(selectBtn.container);
        yOffset += 35;
      } else {
        const maxText = this.scene.add
          .text(0, yOffset + 10, '★ MAX LEVEL ★', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#ffd700',
          })
          .setOrigin(0.5);
        this.upgradeMenuContainer.add(maxText);
        yOffset += 25;

        const selectedAbility = tower.getSelectedAbility();
        if (selectedAbility) {
          const abilityColor = `#${selectedAbility.icon.primaryColor.toString(16).padStart(6, '0')}`;

          const abilityName = this.scene.add
            .text(0, yOffset + 10, `⚡ ${selectedAbility.name}`, {
              fontFamily: 'Arial Black',
              fontSize: '14px',
              color: abilityColor,
            })
            .setOrigin(0.5);
          this.upgradeMenuContainer.add(abilityName);
          yOffset += 18;

          const triggerText = this.scene.add
            .text(
              0,
              yOffset + 10,
              `${Math.round(selectedAbility.triggerChance * 100)}% trigger chance`,
              {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#aaaaaa',
              }
            )
            .setOrigin(0.5);
          this.upgradeMenuContainer.add(triggerText);
          yOffset += 16;

          const descText = this.scene.add
            .text(0, yOffset + 10, selectedAbility.description, {
              fontFamily: 'Arial',
              fontSize: '13px',
              color: '#888888',
            })
            .setOrigin(0.5);
          this.upgradeMenuContainer.add(descText);
          yOffset += 20;
        }
      }
    }

    if (!this.reviewMode) {
      const sellValue = tower.getSellValue();
      const sellButton = this.uiHelper.createButton({
        text: `Sell: ${sellValue}g`,
        x: menuWidth / 2 - 55,
        y: menuHeight / 2 - 22,
        fontSize: 14,
        textColor: '#ff6666',
        bgColor: 0x4a2a2a,
        hoverBgColor: 0x6a3a3a,
        borderColor: 0xff6666,
        paddingX: 12,
        paddingY: 6,
        enabled: true,
        onClick: () => this.onSellRequested?.(tower),
      });
      this.upgradeMenuContainer.add(sellButton.container);
    }

    const closeBtn = this.scene.add
      .text(menuWidth / 2 - 18, -menuHeight / 2 + 16, '✕', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#ff6666',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.closeMenus();
      }
    );
    this.upgradeMenuContainer.add(closeBtn);

    this.uiHelper.clampToScreen(this.upgradeMenuContainer, menuWidth, menuHeight, 0.5, 0.5);
  }

  private showAbilitySelection(tower: Tower, upgradeKey: string): void {
    this.onUpgradeRequested?.(tower, upgradeKey);

    this.scene.time.delayedCall(50, () => {
      this.showAbilitySelectionForExisting(tower);
    });
  }
  /* eslint-enable complexity, max-lines-per-function */

  // eslint-disable-next-line max-lines-per-function
  private showAbilitySelectionForExisting(tower: Tower): void {
    this.closeMenus(false, false);

    const abilities = tower.getAvailableAbilities();
    if (abilities.length === 0) return;

    const menuWidth = 540;
    const menuHeight = 250;

    this.abilityMenuContainer = this.scene.add.container(tower.x, tower.y - menuHeight / 2 - 50);
    this.abilityMenuContainer.setDepth(250);

    this.popupController?.open('tower-ability', undefined, () => this.closeMenus(false, true));

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    bg.lineStyle(3, 0xffd700, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    this.abilityMenuContainer.add(bg);

    const title = this.scene.add
      .text(0, -menuHeight / 2 + 24, '⭐ Choose Special Ability ⭐', {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#ffd700',
      })
      .setOrigin(0.5);
    this.abilityMenuContainer.add(title);

    const btnWidth = 160;
    const btnHeight = 150;
    const startX = -((abilities.length - 1) * (btnWidth + 10)) / 2;
    const btnY = 15;

    abilities.forEach((ability, index) => {
      const bx = startX + index * (btnWidth + 10);

      const btn = this.scene.add.graphics();
      btn.fillStyle(0x2a2a2a, 1);
      btn.fillRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
      btn.lineStyle(2, ability.icon.primaryColor, 1);
      btn.strokeRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
      this.abilityMenuContainer!.add(btn);

      const icon = this.scene.add.graphics();
      icon.setPosition(bx, btnY - 35);
      TowerIconRenderer.drawAbilityIcon(icon, ability);
      this.abilityMenuContainer!.add(icon);

      const nameText = this.scene.add
        .text(bx, btnY + 5, ability.name, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.abilityMenuContainer!.add(nameText);

      const chanceText = this.scene.add
        .text(bx, btnY + 25, `${Math.round(ability.triggerChance * 100)}% chance`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#aaaaaa',
        })
        .setOrigin(0.5);
      this.abilityMenuContainer!.add(chanceText);

      const descText = this.scene.add
        .text(bx, btnY + 50, ability.description, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: '#888888',
          align: 'center',
          wordWrap: { width: btnWidth - 10 },
        })
        .setOrigin(0.5);
      this.abilityMenuContainer!.add(descText);

      const hitArea = this.scene.add.rectangle(bx, btnY, btnWidth, btnHeight, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on(
        'pointerdown',
        (
          _pointer: Phaser.Input.Pointer,
          _localX: number,
          _localY: number,
          event: Phaser.Types.Input.EventData
        ) => {
          event.stopPropagation();
          tower.selectAbility(ability.id);
          this.onAbilitySelected?.(tower, ability.id);
          this.closeMenus();
        }
      );
      hitArea.on('pointerover', () => {
        btn.clear();
        btn.fillStyle(0x4a4a4a, 1);
        btn.fillRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
        btn.lineStyle(3, ability.icon.primaryColor, 1);
        btn.strokeRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
      });
      hitArea.on('pointerout', () => {
        btn.clear();
        btn.fillStyle(0x2a2a2a, 1);
        btn.fillRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
        btn.lineStyle(2, ability.icon.primaryColor, 1);
        btn.strokeRoundedRect(bx - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 8);
      });
      this.abilityMenuContainer!.add(hitArea);
    });

    const closeBtn = this.scene.add
      .text(menuWidth / 2 - 20, -menuHeight / 2 + 18, '✕', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ff6666',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.closeMenus();
      }
    );
    this.abilityMenuContainer.add(closeBtn);

    this.uiHelper.clampToScreen(this.abilityMenuContainer, menuWidth, menuHeight, 0.5, 0.5);
  }

  closeMenus(preserveSelection: boolean = false, notifyController: boolean = true): void {
    if (this.buildMenuContainer) {
      this.buildMenuContainer.destroy();
      this.buildMenuContainer = null;
    }
    if (this.upgradeMenuContainer) {
      this.upgradeMenuContainer.destroy();
      this.upgradeMenuContainer = null;
    }
    if (this.abilityMenuContainer) {
      this.abilityMenuContainer.destroy();
      this.abilityMenuContainer = null;
    }

    if (!preserveSelection) {
      this.selectedTower = null;
      this.buildMenuPosition = null;
    }

    if (notifyController) {
      this.popupController?.close();
    }
  }

  isMenuOpen(): boolean {
    return (
      this.buildMenuContainer !== null ||
      this.upgradeMenuContainer !== null ||
      this.abilityMenuContainer !== null
    );
  }

  clearPlacementGraphics(): void {
    this.placementGraphics.clear();
  }

  destroy(): void {
    this.closeMenus();
    this.placementGraphics.destroy();
  }
}
