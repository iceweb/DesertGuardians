import Phaser from 'phaser';
import { Tower } from '../objects/Tower';
import { TOWER_CONFIGS } from '../data';
import { TOWER_BRANCH_COLORS, VETERAN_RANK_COLORS } from '../data/ThemeConfig';
import { UIHelper } from './UIHelper';
import type { UIHitDetector } from './UIHitDetector';
import { TowerIconRenderer, TOWER_HINTS, BRANCH_NAMES, BRANCH_DESCRIPTIONS } from './TowerIconRenderer';

/**
 * TowerUIManager handles tower build/upgrade menus and placement preview.
 * Extracted from TowerManager to keep files under 500 LOC.
 */
export class TowerUIManager {
  private scene: Phaser.Scene;
  private uiHelper: UIHelper;
  
  // Placement state
  private placementGraphics: Phaser.GameObjects.Graphics;
  
  // Menus
  private buildMenuContainer: Phaser.GameObjects.Container | null = null;
  private upgradeMenuContainer: Phaser.GameObjects.Container | null = null;
  private abilityMenuContainer: Phaser.GameObjects.Container | null = null;
  
  // Track currently selected tower for upgrade menu refresh
  private selectedTower: Tower | null = null;
  private lastKnownGold: number = 0;
  
  // Track build menu position for refresh
  private buildMenuPosition: { x: number; y: number } | null = null;
  
  // Track if menu was closed this frame (to prevent immediate reopen)
  private menuClosedThisFrame: boolean = false;
  
  // Review mode - only show stats, no action buttons
  private reviewMode: boolean = false;
  
  // UI Hit Detector for centralized UI bounds checking
  private uiHitDetector: UIHitDetector | null = null;
  
  // Callbacks
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

  /**
   * Set the UI hit detector for centralized UI bounds checking
   */
  setUIHitDetector(detector: UIHitDetector): void {
    this.uiHitDetector = detector;
  }

  /**
   * Set review mode - when true, only show stats, no upgrade/sell buttons
   */
  setReviewMode(enabled: boolean): void {
    this.reviewMode = enabled;
  }

  /**
   * Update placement preview ghost
   * Only shows the green building circle when:
   * 1. Not over any UI element (menus, buttons, panels)
   * 2. Within the buildable zone (near the path or inside path loops)
   * 3. Position is valid for tower placement (not on path, not overlapping towers)
   */
  updatePlacementPreview(x: number, y: number, towerAt: Tower | null): void {
    this.placementGraphics.clear();
    
    // Don't show if any menu is open
    if (this.buildMenuContainer || this.upgradeMenuContainer || this.abilityMenuContainer) return;
    
    // Don't show if hovering over an existing tower
    if (towerAt) return;
    
    // Use UIHitDetector for centralized UI bounds checking
    if (this.uiHitDetector?.isOverUI(x, y)) return;
    
    // Don't show if not in the buildable zone (near path or in path loop)
    if (this.isInBuildableZone && !this.isInBuildableZone(x, y)) return;
    
    // Check if this is a valid placement position
    const canPlace = this.canPlaceAt?.(x, y) ?? false;
    const config = TOWER_CONFIGS['archer_1'];
    const TOWER_RADIUS = 25;
    
    // Only show placement preview when position is valid
    // Invalid positions just show default arrow cursor
    if (canPlace) {
      this.placementGraphics.lineStyle(3, 0x00ff00, 0.8);
      this.placementGraphics.strokeCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.fillStyle(0x00ff00, 0.2);
      this.placementGraphics.fillCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.lineStyle(4, 0x00ff00, 0.5);
      this.placementGraphics.strokeCircle(x, y, config.stats.range);
    }
    // No red circle for invalid positions - just clear and show nothing
  }

  /**
   * Show build menu at position
   */
  showBuildMenu(x: number, y: number): void {
    // Store position for refresh before closing
    this.buildMenuPosition = { x, y };
    this.lastKnownGold = this.getPlayerGold?.() || 0;
    
    this.closeMenus(true); // Preserve position for refresh
    
    const playerGold = this.getPlayerGold?.() || 0;
    const archerConfig = TOWER_CONFIGS['archer_1'];
    const canAfford = playerGold >= (archerConfig.buildCost || 70);
    
    this.buildMenuContainer = this.scene.add.container(x, y - 120);
    this.buildMenuContainer.setDepth(200);
    
    // Larger background panel
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.97);
    bg.fillRoundedRect(-175, -90, 350, 195, 14);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-175, -90, 350, 195, 14);
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-170, -85, 340, 185, 12);
    this.buildMenuContainer.add(bg);
    
    // Title with larger font
    const title = this.scene.add.text(0, -68, 'Build Tower', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.buildMenuContainer.add(title);
    
    // Decorative line under title
    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-120, -50, 120, -50);
    this.buildMenuContainer.add(titleLine);
    
    // Tower button background
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x2a2015 : 0x1a1510, 1);
    btnBg.fillRoundedRect(-160, -40, 320, 100, 10);
    btnBg.lineStyle(2, canAfford ? 0xc49564 : 0x555555, 1);
    btnBg.strokeRoundedRect(-160, -40, 320, 100, 10);
    this.buildMenuContainer.add(btnBg);
    
    // Draw actual tower icon
    const towerIcon = this.scene.add.graphics();
    towerIcon.setPosition(-110, 20);
    TowerIconRenderer.drawArcherTowerIcon(towerIcon, canAfford);
    this.buildMenuContainer.add(towerIcon);
    
    // Tower name with larger font
    const nameText = this.scene.add.text(30, -25, 'Archer Tower', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: canAfford ? '#ffffff' : '#666666',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(nameText);
    
    // Stats with colored values
    const stats = archerConfig.stats;
    const fireRateSec = (stats.fireRate / 1000).toFixed(1);
    const dps = (stats.damage / (stats.fireRate / 1000)).toFixed(1);
    
    // Damage stat
    const dmgLabel = this.scene.add.text(-45, 5, 'DMG:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgLabel);
    
    const dmgValue = this.scene.add.text(-5, 5, `${stats.damage}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ff6666' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgValue);
    
    // Rate stat
    const rateLabel = this.scene.add.text(30, 5, 'Rate:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateLabel);
    
    const rateValue = this.scene.add.text(75, 5, `${fireRateSec}s`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#66ccff' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateValue);
    
    // DPS stat
    const dpsLabel = this.scene.add.text(-45, 28, 'DPS:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsLabel);
    
    const dpsValue = this.scene.add.text(-5, 28, `${dps}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ffcc44' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsValue);
    
    // Range stat
    const rangeLabel = this.scene.add.text(30, 28, 'Range:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeLabel);
    
    const rangeValue = this.scene.add.text(90, 28, `${stats.range}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#66ff66' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeValue);
    
    // Air damage bonus
    if (stats.airDamageBonus) {
      const airLabel = this.scene.add.text(-45, 50, 'vs Air:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: canAfford ? '#aaaaaa' : '#555555'
      }).setOrigin(0, 0.5);
      this.buildMenuContainer.add(airLabel);
      
      const airValue = this.scene.add.text(10, 50, `+${Math.round(stats.airDamageBonus * 100)}%`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAfford ? '#66ccff' : '#555555'
      }).setOrigin(0, 0.5);
      this.buildMenuContainer.add(airValue);
      
      // Target type (next to air bonus)
      const targetText = this.scene.add.text(85, 50, 'Single target', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: canAfford ? '#888888' : '#444444',
        fontStyle: 'italic'
      }).setOrigin(0, 0.5);
      this.buildMenuContainer.add(targetText);
    }
    
    // Cost with larger font
    const costText = this.scene.add.text(0, 85, `Cost: ${archerConfig.buildCost}g`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: canAfford ? '#ffd700' : '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(costText);
    
    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 10, 320, 100, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onBuildRequested?.(x, y, 'archer_1');
        this.closeMenus();
      });
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
    
    const closeBtn = this.scene.add.text(160, -75, '✕', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.closeMenus();
    });
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.buildMenuContainer.add(closeBtn);
    
    // Clamp popup to screen bounds (menu is 350x195)
    this.uiHelper.clampToScreen(this.buildMenuContainer, 350, 195, 0.5, 0.5);
  }

  /**
   * Update method to check if upgrade menu needs refresh
   */
  update(): void {
    const currentGold = this.getPlayerGold?.() || 0;
    
    // Check if upgrade menu is open and gold has changed
    if (this.upgradeMenuContainer && this.selectedTower) {
      if (currentGold !== this.lastKnownGold) {
        this.lastKnownGold = currentGold;
        // Refresh the upgrade menu
        const tower = this.selectedTower;
        this.showUpgradeMenu(tower);
      }
    }
    
    // Check if build menu is open and gold has changed
    if (this.buildMenuContainer && this.buildMenuPosition) {
      if (currentGold !== this.lastKnownGold) {
        this.lastKnownGold = currentGold;
        // Refresh the build menu
        const pos = this.buildMenuPosition;
        this.showBuildMenu(pos.x, pos.y);
      }
    }
  }

  /**
   * Show upgrade/sell menu for tower
   */
  showUpgradeMenu(tower: Tower): void {
    // Store reference to selected tower before closing menus
    this.selectedTower = tower;
    this.lastKnownGold = this.getPlayerGold?.() || 0;
    
    this.closeMenus(true); // Pass true to preserve selectedTower
    
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
    
    // Calculate menu dimensions based on content
    const menuWidth = hasBranches && !this.reviewMode ? Math.max(780, branchCount * 115 + 60) : 420;
    let menuHeight = 190; // Base height for title, stats (now multi-line), hint, and veteran info
    if (hasDamageBuff) menuHeight += 18;
    if (hasCritBuff) menuHeight += 18;
    if (this.reviewMode) {
      // Review mode: just stats, no action buttons
      menuHeight += 20;
    } else if (hasBranches) menuHeight += 190; // Space for branch cards (increased for larger fonts)
    else if (hasLevelUp) menuHeight += 130; // Space for upgrade preview with larger stats
    else {
      // Max level - check if there's ability info to show
      menuHeight += 40; // Base max level indicator
      if (tower.getSelectedAbility()) {
        menuHeight += 54; // Additional space for ability name, trigger chance, description
      }
    }
    if (!this.reviewMode) menuHeight += 45; // Space for sell button at bottom
    
    this.upgradeMenuContainer = this.scene.add.container(tower.x, tower.y - (menuHeight / 2) - 40);
    this.upgradeMenuContainer.setDepth(200);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.97);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 14);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 14);
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-menuWidth / 2 + 5, -menuHeight / 2 + 5, menuWidth - 10, menuHeight - 10, 12);
    this.upgradeMenuContainer.add(bg);
    
    // Tower name title
    const title = this.scene.add.text(0, -menuHeight / 2 + 20, config.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(title);
    
    // Decorative line under title
    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-menuWidth / 2 + 30, -menuHeight / 2 + 38, menuWidth / 2 - 30, -menuHeight / 2 + 38);
    this.upgradeMenuContainer.add(titleLine);
    
    let yOffset = -menuHeight / 2 + 52;
    
    // === CURRENT STATS with colors - Multi-line layout for readability ===
    const fireRateSec = config.stats.fireRate > 0 ? (config.stats.fireRate / 1000).toFixed(1) : '0.0';
    const baseDamage = config.stats.damage;
    const buffedDamage = tower.getDamage();
    const damageMultiplier = tower.getDamageMultiplier();
    const hasBonus = damageMultiplier > 1.0;
    
    const baseDps = config.stats.fireRate > 0 ? (baseDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';
    const buffedDps = config.stats.fireRate > 0 ? (buffedDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';
    
    // Stats in two rows for better readability - centered
    const statsStartX = -menuWidth / 2 + 50;
    const statLineHeight = 24;
    
    // Row 1: DMG and Rate
    // DMG
    const dmgLabel = this.scene.add.text(statsStartX, yOffset, 'DMG:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgLabel);
    
    const dmgValue = this.scene.add.text(statsStartX + 50, yOffset, `${baseDamage}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ff6666'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgValue);
    
    if (hasBonus) {
      const bonusDmg = buffedDamage - baseDamage;
      const dmgBonus = this.scene.add.text(statsStartX + 50 + dmgValue.width + 3, yOffset, `(+${bonusDmg})`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dmgBonus);
    }
    
    // Rate (right side of row 1)
    const rateLabel = this.scene.add.text(statsStartX + 160, yOffset, 'Rate:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateLabel);
    
    const rateValue = this.scene.add.text(statsStartX + 210, yOffset, `${fireRateSec}s`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#66ccff'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateValue);
    
    yOffset += statLineHeight;
    
    // Row 2: DPS and Range
    // DPS
    const dpsLabel = this.scene.add.text(statsStartX, yOffset, 'DPS:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsLabel);
    
    const dpsValue = this.scene.add.text(statsStartX + 50, yOffset, `${baseDps}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffcc44'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsValue);
    
    if (hasBonus) {
      const bonusDps = (parseFloat(buffedDps) - parseFloat(baseDps)).toFixed(1);
      const dpsBonus = this.scene.add.text(statsStartX + 50 + dpsValue.width + 3, yOffset, `(+${bonusDps})`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dpsBonus);
    }
    
    // Range (right side of row 2)
    const rangeLabel = this.scene.add.text(statsStartX + 160, yOffset, 'Range:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeLabel);
    
    const rangeValue = this.scene.add.text(statsStartX + 220, yOffset, `${config.stats.range}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#66ff66'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeValue);
    
    // Air damage bonus (right side, after range)
    if (config.stats.airDamageBonus) {
      const airLabel = this.scene.add.text(statsStartX + 280, yOffset, 'vs Air:', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(airLabel);
      
      const airValue = this.scene.add.text(statsStartX + 340, yOffset, `+${Math.round(config.stats.airDamageBonus * 100)}%`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#66ccff'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(airValue);
    }
    
    yOffset += statLineHeight + 2;
    
    // === VETERAN RANK & KILLS - Always visible ===
    const rankColor = VETERAN_RANK_COLORS[veteranRank] || '#888888';
    
    // Kills on left
    const killsLabel = this.scene.add.text(statsStartX, yOffset, '☠ Kills:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsLabel);
    
    const killsValue = this.scene.add.text(statsStartX + 70, yOffset, `${killCount}`, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: killCount > 0 ? '#ff9966' : '#666666'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsValue);
    
    // Veteran rank on right
    const rankLabel = this.scene.add.text(statsStartX + 140, yOffset, '🎖 Rank:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankLabel);
    
    const rankValue = this.scene.add.text(statsStartX + 215, yOffset, veteranName, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: rankColor
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankValue);
    
    // Veteran bonus if any
    if (veteranRank > 0) {
      const veteranBonus = tower.getVeteranDamageBonus();
      const bonusText = this.scene.add.text(statsStartX + 215 + rankValue.width + 8, yOffset, `+${veteranBonus}% DMG`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(bonusText);
    }
    
    yOffset += 22;
    
    // === TOWER HINT - Explain strengths and usage ===
    const hintText = this.scene.add.text(0, yOffset, TOWER_HINTS[config.branch], {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#88ccff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: menuWidth - 60 }
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(hintText);
    
    yOffset += 24;
    
    // Buff indicators - show each active buff
    if (hasDamageBuff) {
      const buffPercent = Math.round((damageMultiplier - 1) * 100);
      const buffText = this.scene.add.text(0, yOffset, `🔴 Aura Buff: +${buffPercent}% damage`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#ff6666'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(buffText);
      yOffset += 18;
    }
    
    if (hasCritBuff) {
      const critPercent = Math.round(tower.getAuraCritBonus() * 100);
      const critText = this.scene.add.text(0, yOffset, `⚡ Critical Aura: +${critPercent}% crit chance`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#ffa500'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(critText);
      yOffset += 18;
    }
    
    yOffset += 8; // Spacing before upgrade section
    
    if (hasBranches && !this.reviewMode) {
      // === SPECIALIZATION SELECTION ===
      const branchLabel = this.scene.add.text(0, yOffset, 'Choose Specialization:', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
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
        
        // Card background
        const btn = this.scene.add.graphics();
        btn.fillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a, 1);
        btn.fillRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
        btn.lineStyle(2, canAfford ? color : 0x444444, 1);
        btn.strokeRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
        this.upgradeMenuContainer!.add(btn);
        
        // Tower icon
        const towerIcon = this.scene.add.graphics();
        TowerIconRenderer.drawMiniTowerIcon(towerIcon, bx, by + 38, branch, canAfford);
        this.upgradeMenuContainer!.add(towerIcon);
        
        // Branch name
        const nameText = this.scene.add.text(bx, by + 68, BRANCH_NAMES[branch], {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: canAfford ? '#ffffff' : '#666666'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(nameText);
        
        // Branch description (with word wrap)
        const descText = this.scene.add.text(bx, by + 92, BRANCH_DESCRIPTIONS[branch], {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: canAfford ? '#aaaaaa' : '#555555',
          align: 'center',
          wordWrap: { width: btnWidth - 8 }
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(descText);
        
        // Stats preview
        const stats = branchConfig.stats;
        const previewDps = stats.fireRate > 0 ? (stats.damage / (stats.fireRate / 1000)).toFixed(0) : '0';
        let statsPreview = '';
        if (branch === 'aura') {
          statsPreview = `+${Math.round((stats.auraDamageMultiplier || 0) * 100)}% buff`;
        } else {
          statsPreview = `${stats.damage} dmg | ${previewDps} DPS`;
        }
        const previewText = this.scene.add.text(bx, by + 120, statsPreview, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: canAfford ? '#88ff88' : '#555555'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(previewText);
        
        // Cost
        const costText = this.scene.add.text(bx, by + 142, `${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: canAfford ? '#ffd700' : '#ff4444'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(costText);
        
        // Hit area
        if (canAfford) {
          const hitArea = this.scene.add.rectangle(bx, by + btnHeight / 2, btnWidth, btnHeight, 0xffffff, 0);
          hitArea.setInteractive({ useHandCursor: true });
          hitArea.on('pointerdown', () => {
            this.onUpgradeRequested?.(tower, branchKey);
          });
          hitArea.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(0x4a4a4a, 1);
            btn.fillRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
            btn.lineStyle(3, color, 1);
            btn.strokeRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
          });
          hitArea.on('pointerout', () => {
            btn.clear();
            btn.fillStyle(0x2a2a2a, 1);
            btn.fillRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
            btn.lineStyle(2, color, 1);
            btn.strokeRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
          });
          this.upgradeMenuContainer!.add(hitArea);
        }
      });
      
      yOffset += btnHeight + 10;
      
    } else if (hasLevelUp && !this.reviewMode) {
      // === LEVEL UPGRADE ===
      const levelUpConfig = TOWER_CONFIGS[upgradeOptions.levelUp!];
      if (levelUpConfig) {
        const cost = levelUpConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const nextLevel = levelUpConfig.level;
        const isLevel4 = nextLevel === 4;
        
        // Upgrade button
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
          onClick: canAfford ? () => {
            if (isLevel4) {
              this.showAbilitySelection(tower, upgradeOptions.levelUp!);
            } else {
              this.onUpgradeRequested?.(tower, upgradeOptions.levelUp!);
            }
          } : undefined
        });
        this.upgradeMenuContainer.add(upgradeBtn.container);
        
        // Stats preview below button - using colored text for clarity
        const newStats = levelUpConfig.stats;
        const oldStats = config.stats;
        const dmgDiff = newStats.damage - oldStats.damage;
        const newDps = newStats.fireRate > 0 ? (newStats.damage / (newStats.fireRate / 1000)).toFixed(1) : '0';
        const oldDps = oldStats.fireRate > 0 ? (oldStats.damage / (oldStats.fireRate / 1000)).toFixed(1) : '0';
        const dpsDiff = (parseFloat(newDps) - parseFloat(oldDps)).toFixed(1);
        const rangeDiff = newStats.range - oldStats.range;
        
        // Create individual stat improvement lines with colors
        let statY = yOffset + 42;
        const statSpacing = 22;
        
        if (dmgDiff > 0) {
          const dmgLabel = this.scene.add.text(-80, statY, 'DMG:', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgLabel);
          
          const dmgValue = this.scene.add.text(-35, statY, `${oldStats.damage}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgValue);
          
          const dmgArrow = this.scene.add.text(5, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#88ff88'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgArrow);
          
          const dmgNew = this.scene.add.text(30, statY, `${newStats.damage}`, {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#88ff88'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgNew);
          
          const dmgBonus = this.scene.add.text(70, statY, `(+${dmgDiff})`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#44ff44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgBonus);
          
          statY += statSpacing;
        }
        
        if (parseFloat(dpsDiff) > 0) {
          const dpsLabel = this.scene.add.text(-80, statY, 'DPS:', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsLabel);
          
          const dpsValue = this.scene.add.text(-35, statY, `${oldDps}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsValue);
          
          const dpsArrow = this.scene.add.text(5, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffaa44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsArrow);
          
          const dpsNew = this.scene.add.text(30, statY, `${newDps}`, {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#ffaa44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsNew);
          
          const dpsBonus = this.scene.add.text(80, statY, `(+${dpsDiff})`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffcc66'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsBonus);
          
          statY += statSpacing;
        }
        
        if (rangeDiff > 0) {
          const rangeLabel = this.scene.add.text(-80, statY, 'Range:', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeLabel);
          
          const rangeValue = this.scene.add.text(-15, statY, `${oldStats.range}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeValue);
          
          const rangeArrow = this.scene.add.text(25, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#44aaff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeArrow);
          
          const rangeNew = this.scene.add.text(50, statY, `${newStats.range}`, {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#44aaff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeNew);
          
          const rangeBonus = this.scene.add.text(95, statY, `(+${rangeDiff})`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#66ccff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeBonus);
          
          statY += statSpacing;
        }
        
        // Cost - position below the stats
        const costText = this.scene.add.text(0, yOffset + 110, `Cost: ${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: canAfford ? '#ffd700' : '#ff4444'
        }).setOrigin(0.5);
        this.upgradeMenuContainer.add(costText);
        
        yOffset += 75;
      }
    } else if (!this.reviewMode) {
      // === MAX LEVEL ===
      // Check if tower is level 4 without ability selected
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
          onClick: () => this.showAbilitySelectionForExisting(tower)
        });
        this.upgradeMenuContainer.add(selectBtn.container);
        yOffset += 35;
      } else {
        const maxText = this.scene.add.text(0, yOffset + 10, '★ MAX LEVEL ★', {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: '#ffd700'
        }).setOrigin(0.5);
        this.upgradeMenuContainer.add(maxText);
        yOffset += 25;
        
        // Show selected ability info if tower has one
        const selectedAbility = tower.getSelectedAbility();
        if (selectedAbility) {
          const abilityColor = `#${selectedAbility.icon.primaryColor.toString(16).padStart(6, '0')}`;
          
          // Ability name with icon indicator
          const abilityName = this.scene.add.text(0, yOffset + 10, `⚡ ${selectedAbility.name}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: abilityColor
          }).setOrigin(0.5);
          this.upgradeMenuContainer.add(abilityName);
          yOffset += 18;
          
          // Trigger chance
          const triggerText = this.scene.add.text(0, yOffset + 10, `${Math.round(selectedAbility.triggerChance * 100)}% trigger chance`, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#aaaaaa'
          }).setOrigin(0.5);
          this.upgradeMenuContainer.add(triggerText);
          yOffset += 16;
          
          // Description
          const descText = this.scene.add.text(0, yOffset + 10, selectedAbility.description, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#888888'
          }).setOrigin(0.5);
          this.upgradeMenuContainer.add(descText);
          yOffset += 20;
        }
      }
    }
    
    // === SELL BUTTON (always bottom right) - hide in review mode ===
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
        onClick: () => this.onSellRequested?.(tower)
      });
      this.upgradeMenuContainer.add(sellButton.container);
    }
    
    // Close button
    const closeBtn = this.scene.add.text(menuWidth / 2 - 18, -menuHeight / 2 + 16, '✕', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMenus());
    this.upgradeMenuContainer.add(closeBtn);
    
    // Clamp popup to screen bounds
    this.uiHelper.clampToScreen(this.upgradeMenuContainer, menuWidth, menuHeight, 0.5, 0.5);
  }

  /**
   * Show ability selection panel for level 4 upgrade
   */
  private showAbilitySelection(tower: Tower, upgradeKey: string): void {
    // First perform the upgrade
    this.onUpgradeRequested?.(tower, upgradeKey);
    
    // Then show ability selection
    this.scene.time.delayedCall(50, () => {
      this.showAbilitySelectionForExisting(tower);
    });
  }

  /**
   * Show ability selection for an existing level 4 tower
   */
  private showAbilitySelectionForExisting(tower: Tower): void {
    this.closeMenus();
    
    const abilities = tower.getAvailableAbilities();
    if (abilities.length === 0) return;
    
    const menuWidth = 540;
    const menuHeight = 250;
    
    this.abilityMenuContainer = this.scene.add.container(tower.x, tower.y - menuHeight / 2 - 50);
    this.abilityMenuContainer.setDepth(250);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    bg.lineStyle(3, 0xffd700, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    this.abilityMenuContainer.add(bg);
    
    // Title
    const title = this.scene.add.text(0, -menuHeight / 2 + 24, '⭐ Choose Special Ability ⭐', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.abilityMenuContainer.add(title);
    
    // Ability buttons
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
      
      // Icon
      const icon = this.scene.add.graphics();
      icon.setPosition(bx, btnY - 35);
      TowerIconRenderer.drawAbilityIcon(icon, ability);
      this.abilityMenuContainer!.add(icon);
      
      // Name
      const nameText = this.scene.add.text(bx, btnY + 5, ability.name, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.abilityMenuContainer!.add(nameText);
      
      // Trigger chance
      const chanceText = this.scene.add.text(bx, btnY + 25, `${Math.round(ability.triggerChance * 100)}% chance`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.abilityMenuContainer!.add(chanceText);
      
      // Description (wrapped)
      const descText = this.scene.add.text(bx, btnY + 50, ability.description, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#888888',
        align: 'center',
        wordWrap: { width: btnWidth - 10 }
      }).setOrigin(0.5);
      this.abilityMenuContainer!.add(descText);
      
      // Hit area
      const hitArea = this.scene.add.rectangle(bx, btnY, btnWidth, btnHeight, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        tower.selectAbility(ability.id);
        this.onAbilitySelected?.(tower, ability.id);
        this.closeMenus();
      });
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
    
    // Close button
    const closeBtn = this.scene.add.text(menuWidth / 2 - 20, -menuHeight / 2 + 18, '✕', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMenus());
    this.abilityMenuContainer.add(closeBtn);
    
    // Clamp to screen
    this.uiHelper.clampToScreen(this.abilityMenuContainer, menuWidth, menuHeight, 0.5, 0.5);
  }

  /**
   * Close all menus
   * @param preserveSelection - If true, don't clear selectedTower/buildMenuPosition (used for menu refresh)
   */
  closeMenus(preserveSelection: boolean = false): void {
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
    
    // Clear selected tower/build position unless preserving for refresh
    if (!preserveSelection) {
      this.selectedTower = null;
      this.buildMenuPosition = null;
    }
    
    // Set flag to prevent immediate reopen on same click
    this.menuClosedThisFrame = true;
    // Reset flag after a frame delay
    this.scene.time.delayedCall(50, () => {
      this.menuClosedThisFrame = false;
    });
  }

  /**
   * Check if any menu is open
   */
  isMenuOpen(): boolean {
    return this.buildMenuContainer !== null || this.upgradeMenuContainer !== null || this.abilityMenuContainer !== null;
  }
  
  /**
   * Check if menu was just closed (to prevent immediate reopen)
   */
  wasMenuJustClosed(): boolean {
    return this.menuClosedThisFrame;
  }

  /**
   * Clear placement graphics
   */
  clearPlacementGraphics(): void {
    this.placementGraphics.clear();
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.closeMenus();
    this.placementGraphics.destroy();
  }
}
