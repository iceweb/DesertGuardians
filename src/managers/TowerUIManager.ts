import Phaser from 'phaser';
import { Tower } from '../objects/Tower';
import { TOWER_CONFIGS } from '../data';
import type { TowerBranch } from '../objects/Tower';
import type { AbilityDefinition } from '../objects/TowerAbilities';
import { UIHelper } from './UIHelper';

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
  
  // Callbacks
  public onBuildRequested?: (x: number, y: number, towerKey: string) => void;
  public onUpgradeRequested?: (tower: Tower, newKey: string) => void;
  public onAbilitySelected?: (tower: Tower, abilityId: string) => void;
  public onSellRequested?: (tower: Tower) => void;
  public getPlayerGold?: () => number;
  public canPlaceAt?: (x: number, y: number) => boolean;
  public isOverMine?: (x: number, y: number) => boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.uiHelper = new UIHelper(scene);
    
    this.placementGraphics = scene.add.graphics();
    this.placementGraphics.setDepth(50);
  }

  /**
   * Set review mode - when true, only show stats, no upgrade/sell buttons
   */
  setReviewMode(enabled: boolean): void {
    this.reviewMode = enabled;
  }

  /**
   * Update placement preview ghost
   */
  updatePlacementPreview(x: number, y: number, towerAt: Tower | null): void {
    this.placementGraphics.clear();
    
    if (this.buildMenuContainer || this.upgradeMenuContainer) return;
    if (towerAt) return;
    if (y < 80) return;
    if (y > this.scene.cameras.main.height - 100) return;
    
    // Don't show placement preview over mine slots
    if (this.isOverMine?.(x, y)) return;
    
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
    bg.fillRoundedRect(-160, -90, 320, 180, 14);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-160, -90, 320, 180, 14);
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-155, -85, 310, 170, 12);
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
    titleLine.lineBetween(-100, -50, 100, -50);
    this.buildMenuContainer.add(titleLine);
    
    // Tower button background
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x2a2015 : 0x1a1510, 1);
    btnBg.fillRoundedRect(-145, -40, 290, 100, 10);
    btnBg.lineStyle(2, canAfford ? 0xc49564 : 0x555555, 1);
    btnBg.strokeRoundedRect(-145, -40, 290, 100, 10);
    this.buildMenuContainer.add(btnBg);
    
    // Draw actual tower icon
    const towerIcon = this.scene.add.graphics();
    towerIcon.setPosition(-95, 20);
    this.drawArcherTowerIcon(towerIcon, canAfford);
    this.buildMenuContainer.add(towerIcon);
    
    // Tower name with larger font
    const nameText = this.scene.add.text(45, -25, 'Archer Tower', {
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
    const dmgLabel = this.scene.add.text(-30, 5, 'DMG:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgLabel);
    
    const dmgValue = this.scene.add.text(10, 5, `${stats.damage}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ff6666' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dmgValue);
    
    // Rate stat
    const rateLabel = this.scene.add.text(45, 5, 'Rate:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateLabel);
    
    const rateValue = this.scene.add.text(90, 5, `${fireRateSec}s`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#66ccff' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rateValue);
    
    // DPS stat
    const dpsLabel = this.scene.add.text(-30, 28, 'DPS:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsLabel);
    
    const dpsValue = this.scene.add.text(10, 28, `${dps}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ffcc44' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(dpsValue);
    
    // Range stat
    const rangeLabel = this.scene.add.text(45, 28, 'Range:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: canAfford ? '#aaaaaa' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeLabel);
    
    const rangeValue = this.scene.add.text(105, 28, `${stats.range}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#66ff66' : '#555555'
    }).setOrigin(0, 0.5);
    this.buildMenuContainer.add(rangeValue);
    
    // Target type
    const targetText = this.scene.add.text(45, 50, 'Single target', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: canAfford ? '#888888' : '#444444',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(targetText);
    
    // Cost with larger font
    const costText = this.scene.add.text(0, 75, `Cost: ${archerConfig.buildCost}g`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: canAfford ? '#ffd700' : '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(costText);
    
    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 10, 290, 100, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onBuildRequested?.(x, y, 'archer_1');
        this.closeMenus();
      });
      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3025, 1);
        btnBg.fillRoundedRect(-145, -40, 290, 100, 10);
        btnBg.lineStyle(2, 0xffd700, 1);
        btnBg.strokeRoundedRect(-145, -40, 290, 100, 10);
      });
      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2015, 1);
        btnBg.fillRoundedRect(-145, -40, 290, 100, 10);
        btnBg.lineStyle(2, 0xc49564, 1);
        btnBg.strokeRoundedRect(-145, -40, 290, 100, 10);
      });
      this.buildMenuContainer.add(hitArea);
    }
    
    const closeBtn = this.scene.add.text(145, -75, '✕', {
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
    
    // Clamp popup to screen bounds (menu is 320x180)
    this.uiHelper.clampToScreen(this.buildMenuContainer, 320, 180, 0.5, 0.5);
  }

  /**
   * Draw archer tower icon for build menu
   */
  private drawArcherTowerIcon(g: Phaser.GameObjects.Graphics, canAfford: boolean): void {
    const alpha = canAfford ? 1 : 0.5;
    
    // Shadow
    g.fillStyle(0x000000, 0.3 * alpha);
    g.fillEllipse(0, 18, 35, 12);
    
    // Base
    g.fillStyle(canAfford ? 0x8b5a2b : 0x555555, alpha);
    g.fillRect(-20, 5, 40, 14);
    g.fillStyle(canAfford ? 0x9a6a3b : 0x666666, alpha);
    g.fillRect(-17, 7, 34, 10);
    
    // Tower body
    g.fillStyle(canAfford ? 0xb88a5c : 0x666666, alpha);
    g.beginPath();
    g.moveTo(-16, 7);
    g.lineTo(-12, -28);
    g.lineTo(12, -28);
    g.lineTo(16, 7);
    g.closePath();
    g.fillPath();
    
    // Roof
    g.fillStyle(canAfford ? 0x8b4513 : 0x444444, alpha);
    g.beginPath();
    g.moveTo(-18, -28);
    g.lineTo(0, -45);
    g.lineTo(18, -28);
    g.closePath();
    g.fillPath();
    
    // Roof highlight
    g.fillStyle(canAfford ? 0xa0522d : 0x555555, 0.7 * alpha);
    g.beginPath();
    g.moveTo(-12, -28);
    g.lineTo(0, -40);
    g.lineTo(0, -45);
    g.closePath();
    g.fillPath();
    
    // Window
    g.fillStyle(canAfford ? 0xfff4cc : 0x888888, 0.9 * alpha);
    g.fillRect(-5, -20, 10, 14);
    g.lineStyle(1, canAfford ? 0x5a4a38 : 0x444444, alpha);
    g.strokeRect(-5, -20, 10, 14);
    g.lineBetween(0, -20, 0, -6);
    g.lineBetween(-5, -13, 5, -13);
    
    // Bow on top
    g.lineStyle(2, canAfford ? 0x6b4020 : 0x444444, alpha);
    g.beginPath();
    g.arc(0, -35, 8, Math.PI * 0.3, Math.PI * 0.7, true);
    g.strokePath();
    g.lineBetween(0, -43, 0, -27);
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
    const isBuffed = tower.getDamageMultiplier() > 1.0;
    const veteranRank = tower.getVeteranRank();
    const veteranName = tower.getVeteranRankName();
    const killCount = tower.getKillCount();
    
    // Calculate menu dimensions based on content
    const menuWidth = hasBranches && !this.reviewMode ? Math.max(680, branchCount * 105 + 60) : 420;
    let menuHeight = 140; // Base height for title, stats, and veteran info
    if (isBuffed) menuHeight += 16;
    if (this.reviewMode) {
      // Review mode: just stats, no action buttons
      menuHeight += 20;
    } else if (hasBranches) menuHeight += 170; // Space for branch cards
    else if (hasLevelUp) menuHeight += 130; // Space for upgrade preview with larger stats
    else menuHeight += 40; // Max level indicator
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
    
    // === CURRENT STATS with colors ===
    const fireRateSec = config.stats.fireRate > 0 ? (config.stats.fireRate / 1000).toFixed(1) : '0.0';
    const baseDamage = config.stats.damage;
    const buffedDamage = tower.getDamage();
    const damageMultiplier = tower.getDamageMultiplier();
    const hasBonus = damageMultiplier > 1.0;
    
    const baseDps = config.stats.fireRate > 0 ? (baseDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';
    const buffedDps = config.stats.fireRate > 0 ? (buffedDamage / (config.stats.fireRate / 1000)).toFixed(1) : '0';
    
    // Stats row with colored values
    const statsStartX = -menuWidth / 2 + 40;
    
    // DMG
    const dmgLabel = this.scene.add.text(statsStartX, yOffset, 'DMG:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgLabel);
    
    const dmgValue = this.scene.add.text(statsStartX + 45, yOffset, `${baseDamage}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ff6666'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dmgValue);
    
    let dmgEndX = statsStartX + 45 + dmgValue.width;
    if (hasBonus) {
      const bonusDmg = buffedDamage - baseDamage;
      const dmgBonus = this.scene.add.text(dmgEndX + 3, yOffset, `(+${bonusDmg})`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dmgBonus);
      dmgEndX += dmgBonus.width + 8;
    }
    
    // Rate
    const rateLabel = this.scene.add.text(statsStartX + 100, yOffset, 'Rate:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateLabel);
    
    const rateValue = this.scene.add.text(statsStartX + 145, yOffset, `${fireRateSec}s`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#66ccff'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rateValue);
    
    // DPS
    const dpsLabel = this.scene.add.text(statsStartX + 200, yOffset, 'DPS:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsLabel);
    
    const dpsValue = this.scene.add.text(statsStartX + 245, yOffset, `${baseDps}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffcc44'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(dpsValue);
    
    if (hasBonus) {
      const bonusDps = (parseFloat(buffedDps) - parseFloat(baseDps)).toFixed(1);
      const dpsBonus = this.scene.add.text(statsStartX + 245 + dpsValue.width + 3, yOffset, `(+${bonusDps})`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(dpsBonus);
    }
    
    // Range
    const rangeLabel = this.scene.add.text(statsStartX + 275, yOffset, 'Range:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeLabel);
    
    const rangeValue = this.scene.add.text(statsStartX + 335, yOffset, `${config.stats.range}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#66ff66'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rangeValue);
    
    yOffset += 22;
    
    // === VETERAN RANK & KILLS - Always visible ===
    const rankColors: Record<number, string> = {
      0: '#888888', // Recruit - gray
      1: '#d4a574', // Corporal - bronze
      2: '#c0c0c0', // Sergeant - silver
      3: '#ffd700'  // Captain - gold
    };
    const rankColor = rankColors[veteranRank] || '#888888';
    
    // Kills on left
    const killsLabel = this.scene.add.text(statsStartX, yOffset, '☠ Kills:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsLabel);
    
    const killsValue = this.scene.add.text(statsStartX + 60, yOffset, `${killCount}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: killCount > 0 ? '#ff9966' : '#666666'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(killsValue);
    
    // Veteran rank on right
    const rankLabel = this.scene.add.text(statsStartX + 130, yOffset, '🎖 Rank:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankLabel);
    
    const rankValue = this.scene.add.text(statsStartX + 195, yOffset, veteranName, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: rankColor
    }).setOrigin(0, 0.5);
    this.upgradeMenuContainer.add(rankValue);
    
    // Veteran bonus if any
    if (veteranRank > 0) {
      const veteranBonus = tower.getVeteranDamageBonus();
      const bonusText = this.scene.add.text(statsStartX + 195 + rankValue.width + 8, yOffset, `+${veteranBonus}% DMG`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#88ff88'
      }).setOrigin(0, 0.5);
      this.upgradeMenuContainer.add(bonusText);
    }
    
    yOffset += 20;
    
    // Buff indicator if buffed
    if (isBuffed) {
      const buffPercent = Math.round((damageMultiplier - 1) * 100);
      const buffText = this.scene.add.text(0, yOffset, `🔴 Aura Buff Active: +${buffPercent}% damage`, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#ff6666'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(buffText);
      yOffset += 16;
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
      
      const branchColors: Record<TowerBranch, number> = {
        archer: 0xcc3333,
        rapidfire: 0xffd700,
        sniper: 0x4169e1,
        rockcannon: 0xff6600,
        icetower: 0x87ceeb,
        poison: 0x00ff00,
        aura: 0xff4444
      };
      
      const branchNames: Record<TowerBranch, string> = {
        archer: 'Archer II',
        rapidfire: 'Rapid Fire',
        sniper: 'Sniper',
        rockcannon: 'Cannon',
        icetower: 'Ice',
        poison: 'Poison',
        aura: 'Aura'
      };
      
      const branchDescriptions: Record<TowerBranch, string> = {
        archer: 'Balanced fighter',
        rapidfire: 'Fast attacks',
        sniper: 'High damage',
        rockcannon: 'AOE splash',
        icetower: 'Slows enemies',
        poison: 'DOT damage',
        aura: 'Buffs towers'
      };
      
      const branches = upgradeOptions.branches!;
      const btnWidth = 100;
      const btnHeight = 130;
      const startX = -((branches.length - 1) * (btnWidth + 5)) / 2;
      
      branches.forEach((branch, index) => {
        const branchKey = branch === 'archer' ? 'archer_2' : `${branch}_1`;
        const branchConfig = TOWER_CONFIGS[branchKey];
        if (!branchConfig) return;
        
        const bx = startX + index * (btnWidth + 5);
        const by = yOffset;
        const cost = branchConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const color = branchColors[branch];
        
        // Card background
        const btn = this.scene.add.graphics();
        btn.fillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a, 1);
        btn.fillRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
        btn.lineStyle(2, canAfford ? color : 0x444444, 1);
        btn.strokeRoundedRect(bx - btnWidth/2, by, btnWidth, btnHeight, 8);
        this.upgradeMenuContainer!.add(btn);
        
        // Tower icon
        const towerIcon = this.scene.add.graphics();
        this.drawMiniTowerIcon(towerIcon, bx, by + 35, branch, canAfford);
        this.upgradeMenuContainer!.add(towerIcon);
        
        // Branch name
        const nameText = this.scene.add.text(bx, by + 62, branchNames[branch], {
          fontFamily: 'Arial Black',
          fontSize: '12px',
          color: canAfford ? '#ffffff' : '#666666'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(nameText);
        
        // Branch description
        const descText = this.scene.add.text(bx, by + 78, branchDescriptions[branch], {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: canAfford ? '#aaaaaa' : '#555555'
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
        const previewText = this.scene.add.text(bx, by + 94, statsPreview, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: canAfford ? '#88ff88' : '#555555'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(previewText);
        
        // Cost
        const costText = this.scene.add.text(bx, by + 112, `${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
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
        const statSpacing = 18;
        
        if (dmgDiff > 0) {
          const dmgLabel = this.scene.add.text(-80, statY, 'DMG:', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgLabel);
          
          const dmgValue = this.scene.add.text(-40, statY, `${oldStats.damage}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgValue);
          
          const dmgArrow = this.scene.add.text(-5, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#88ff88'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgArrow);
          
          const dmgNew = this.scene.add.text(20, statY, `${newStats.damage}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#88ff88'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgNew);
          
          const dmgBonus = this.scene.add.text(55, statY, `(+${dmgDiff})`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#44ff44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dmgBonus);
          
          statY += statSpacing;
        }
        
        if (parseFloat(dpsDiff) > 0) {
          const dpsLabel = this.scene.add.text(-80, statY, 'DPS:', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsLabel);
          
          const dpsValue = this.scene.add.text(-40, statY, `${oldDps}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsValue);
          
          const dpsArrow = this.scene.add.text(-5, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffaa44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsArrow);
          
          const dpsNew = this.scene.add.text(20, statY, `${newDps}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#ffaa44'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsNew);
          
          const dpsBonus = this.scene.add.text(65, statY, `(+${dpsDiff})`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffcc66'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(dpsBonus);
          
          statY += statSpacing;
        }
        
        if (rangeDiff > 0) {
          const rangeLabel = this.scene.add.text(-80, statY, 'Range:', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#aaaaaa'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeLabel);
          
          const rangeValue = this.scene.add.text(-20, statY, `${oldStats.range}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeValue);
          
          const rangeArrow = this.scene.add.text(15, statY, '→', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#44aaff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeArrow);
          
          const rangeNew = this.scene.add.text(40, statY, `${newStats.range}`, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#44aaff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeNew);
          
          const rangeBonus = this.scene.add.text(80, statY, `(+${rangeDiff})`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#66ccff'
          }).setOrigin(0, 0.5);
          this.upgradeMenuContainer.add(rangeBonus);
          
          statY += statSpacing;
        }
        
        // Cost - position below the stats
        const costText = this.scene.add.text(0, yOffset + 100, `Cost: ${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '12px',
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
      } else {
        const maxText = this.scene.add.text(0, yOffset + 10, '★ MAX LEVEL ★', {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: '#ffd700'
        }).setOrigin(0.5);
        this.upgradeMenuContainer.add(maxText);
      }
      yOffset += 35;
    }
    
    // === SELL BUTTON (always bottom right) - hide in review mode ===
    if (!this.reviewMode) {
      const sellValue = tower.getSellValue();
      const sellButton = this.uiHelper.createButton({
        text: `Sell: ${sellValue}g`,
        x: menuWidth / 2 - 55,
        y: menuHeight / 2 - 22,
        fontSize: 12,
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
   * Draw mini tower icon for upgrade menu
   */
  private drawMiniTowerIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, branch: TowerBranch, canAfford: boolean): void {
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
        // Pedestal base
        graphics.fillStyle(0x4a3a3a, alpha);
        graphics.fillRect(x - 14 * scale, y + 5 * scale, 28 * scale, 15 * scale);
        // Pillar
        graphics.fillStyle(0x3a2a2a, alpha);
        graphics.fillRect(x - 8 * scale, y - 30 * scale, 16 * scale, 40 * scale);
        // Red glowing orb
        graphics.fillStyle(0xff4444, alpha * 0.4);
        graphics.fillCircle(x, y - 38 * scale, 14 * scale);
        graphics.fillStyle(0xff6666, alpha * 0.6);
        graphics.fillCircle(x, y - 38 * scale, 10 * scale);
        graphics.fillStyle(0xffaaaa, alpha * 0.8);
        graphics.fillCircle(x, y - 38 * scale, 6 * scale);
        graphics.fillStyle(0xffffff, alpha);
        graphics.fillCircle(x - 2 * scale, y - 40 * scale, 2 * scale);
        break;
        
      default: // archer
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
    
    const menuWidth = 500;
    const menuHeight = 220;
    
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
    const title = this.scene.add.text(0, -menuHeight / 2 + 22, '⭐ Choose Special Ability ⭐', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.abilityMenuContainer.add(title);
    
    // Ability buttons
    const btnWidth = 150;
    const btnHeight = 130;
    const startX = -((abilities.length - 1) * (btnWidth + 10)) / 2;
    const btnY = 10;
    
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
      icon.setPosition(bx, btnY - 30);
      this.drawAbilityIcon(icon, ability);
      this.abilityMenuContainer!.add(icon);
      
      // Name
      const nameText = this.scene.add.text(bx, btnY + 5, ability.name, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.abilityMenuContainer!.add(nameText);
      
      // Trigger chance
      const chanceText = this.scene.add.text(bx, btnY + 22, `${Math.round(ability.triggerChance * 100)}% chance`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.abilityMenuContainer!.add(chanceText);
      
      // Description (wrapped)
      const descText = this.scene.add.text(bx, btnY + 42, ability.description, {
        fontFamily: 'Arial',
        fontSize: '9px',
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
   * Draw ability icon programmatically
   */
  private drawAbilityIcon(g: Phaser.GameObjects.Graphics, ability: AbilityDefinition): void {
    const primary = ability.icon.primaryColor;
    const secondary = ability.icon.secondaryColor;
    const size = 20;
    
    // Outer glow
    g.fillStyle(primary, 0.3);
    g.fillCircle(0, 0, size + 5);
    
    // Main icon circle
    g.fillStyle(primary, 0.9);
    g.fillCircle(0, 0, size);
    
    // Inner highlight
    g.fillStyle(secondary, 0.7);
    g.fillCircle(-size * 0.25, -size * 0.25, size * 0.4);
    
    // White shine
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-size * 0.35, -size * 0.35, size * 0.2);
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
