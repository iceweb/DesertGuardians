import Phaser from 'phaser';
import { GoldMine } from '../objects/GoldMine';
import { GoldMineManager } from './GoldMineManager';
import { MINE_CONFIGS } from '../data/GameData';
import { UIHelper } from './UIHelper';

/**
 * GoldMineUIManager handles build/upgrade menus for gold mines.
 * Follows patterns from TowerUIManager.
 */
export class GoldMineUIManager {
  private scene: Phaser.Scene;
  private goldMineManager: GoldMineManager;
  private uiHelper: UIHelper;
  
  // Menus
  private buildMenuContainer: Phaser.GameObjects.Container | null = null;
  private upgradeMenuContainer: Phaser.GameObjects.Container | null = null;
  
  // Track state for refresh
  private currentMine: GoldMine | null = null;
  private lastKnownGold: number = 0;
  
  // Track if menu was closed this frame
  private menuClosedThisFrame: boolean = false;
  
  // Review mode - only show stats, no upgrade buttons
  private reviewMode: boolean = false;
  
  // Callbacks
  public getPlayerGold?: () => number;

  constructor(scene: Phaser.Scene, goldMineManager: GoldMineManager) {
    this.scene = scene;
    this.goldMineManager = goldMineManager;
    this.uiHelper = new UIHelper(scene);
    
    // Listen for mine click events
    this.scene.events.on('mine-clicked', this.handleMineClicked, this);
  }

  /**
   * Set review mode - when true, only show stats, no upgrade buttons
   */
  setReviewMode(enabled: boolean): void {
    this.reviewMode = enabled;
  }

  /**
   * Handle mine click event
   */
  private handleMineClicked(mine: GoldMine): void {
    if (this.menuClosedThisFrame) return;
    
    if (mine.isBuilt()) {
      this.showUpgradeMenu(mine);
    } else if (!this.reviewMode) {
      // Don't show build menu in review mode
      this.showBuildMenu(mine);
    }
  }

  /**
   * Show build menu for empty mine slot
   */
  showBuildMenu(mine: GoldMine): void {
    this.currentMine = mine;
    this.lastKnownGold = this.getPlayerGold?.() || 0;
    this.closeMenus(true);
    
    const playerGold = this.getPlayerGold?.() || 0;
    const buildCost = MINE_CONFIGS[1].buildCost;
    const income = MINE_CONFIGS[1].incomePerWave;
    const canAfford = playerGold >= buildCost;
    
    const x = mine.x;
    const y = mine.y - 100;
    
    this.buildMenuContainer = this.scene.add.container(x, y);
    this.buildMenuContainer.setDepth(200);
    
    // Full-screen invisible blocker to catch clicks and prevent them from reaching the scene
    const blocker = this.scene.add.rectangle(
      -x + this.scene.cameras.main.width / 2,
      -y + this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0
    );
    blocker.setInteractive();
    blocker.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      // Close menu when clicking outside
      this.closeMenus();
    });
    this.buildMenuContainer.add(blocker);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-130, -70, 260, 140, 12);
    bg.lineStyle(3, 0xffd700, 0.8);
    bg.strokeRoundedRect(-130, -70, 260, 140, 12);
    this.buildMenuContainer.add(bg);
    
    // Menu hit area to block clicks on the menu from closing it
    const menuHitArea = this.scene.add.rectangle(0, 0, 260, 140, 0xffffff, 0);
    menuHitArea.setInteractive();
    menuHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      /* block clicks on menu background */
    });
    this.buildMenuContainer.add(menuHitArea);
    
    // Title
    const title = this.scene.add.text(0, -52, 'Build Gold Mine', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(title);
    
    // Button background
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x3a3a2a : 0x2a2a2a, 1);
    btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
    btnBg.lineStyle(2, canAfford ? 0xffd700 : 0x555555, 1);
    btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
    this.buildMenuContainer.add(btnBg);
    
    // Gold icon
    const icon = this.scene.add.graphics();
    icon.fillStyle(canAfford ? 0xffd700 : 0x666600, 1);
    icon.fillCircle(-70, 12, 20);
    icon.lineStyle(2, canAfford ? 0xdaa520 : 0x444400, 1);
    icon.strokeCircle(-70, 12, 20);
    // Inner ring
    icon.fillStyle(canAfford ? 0xffec8b : 0x888844, 1);
    icon.fillCircle(-70, 12, 10);
    this.buildMenuContainer.add(icon);
    
    // Name
    const nameText = this.scene.add.text(20, -12, 'Gold Mine', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: canAfford ? '#ffffff' : '#666666'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(nameText);
    
    // Description
    const descText = this.scene.add.text(20, 12, `Produces ${income}g per wave`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: canAfford ? '#aaffaa' : '#556655'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(descText);
    
    // Cost
    const costText = this.scene.add.text(20, 32, `Cost: ${buildCost}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ffd700' : '#ff4444'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(costText);
    
    // Hit area for build button
    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 12, 220, 80, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        const slotId = mine.getSlotId();
        this.goldMineManager.buildMine(slotId);
        this.closeMenus();  // Close after building
      });
      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x5a5a3a, 1);
        btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
        btnBg.lineStyle(2, 0xffd700, 1);
        btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
      });
      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3a2a, 1);
        btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
        btnBg.lineStyle(2, 0xffd700, 1);
        btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
      });
      this.buildMenuContainer.add(hitArea);
    }
    
    // Close button with larger hit area
    const closeBtnBg = this.scene.add.rectangle(115, -58, 36, 36, 0x000000, 0.01);
    closeBtnBg.setInteractive({ useHandCursor: true });
    closeBtnBg.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });
    closeBtnBg.on('pointerup', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.closeMenus();
    });
    this.buildMenuContainer.add(closeBtnBg);
    
    const closeBtn = this.scene.add.text(115, -58, '✕', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ff6666'
    }).setOrigin(0.5);
    closeBtnBg.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtnBg.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.buildMenuContainer.add(closeBtn);
    
    // Clamp popup to screen bounds (menu is 260x140)
    this.uiHelper.clampToScreen(this.buildMenuContainer, 260, 140, 0.5, 0.5);
  }

  /**
   * Show upgrade menu for built mine
   */
  showUpgradeMenu(mine: GoldMine): void {
    this.currentMine = mine;
    this.lastKnownGold = this.getPlayerGold?.() || 0;
    this.closeMenus(true);
    
    const config = mine.getConfig();
    const playerGold = this.getPlayerGold?.() || 0;
    const canUpgrade = mine.canUpgrade() && !this.reviewMode;
    const upgradeCost = mine.getUpgradeCost();
    const canAffordUpgrade = canUpgrade && playerGold >= upgradeCost;
    
    const menuWidth = 280;
    const menuHeight = canUpgrade ? 180 : 160;
    const x = mine.x;
    const y = mine.y - menuHeight / 2 - 40;
    
    this.upgradeMenuContainer = this.scene.add.container(x, y);
    this.upgradeMenuContainer.setDepth(200);
    
    // Full-screen invisible blocker to catch clicks and prevent them from reaching the scene
    const blocker = this.scene.add.rectangle(
      -x + this.scene.cameras.main.width / 2,
      -y + this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0
    );
    blocker.setInteractive();
    blocker.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      // Close menu when clicking outside
      this.closeMenus();
    });
    this.upgradeMenuContainer.add(blocker);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    bg.lineStyle(3, 0xffd700, 0.8);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    this.upgradeMenuContainer.add(bg);
    
    // Menu hit area to block clicks on the menu from closing it
    const menuHitArea = this.scene.add.rectangle(0, 0, menuWidth, menuHeight, 0xffffff, 0);
    menuHitArea.setInteractive();
    menuHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      /* block clicks on menu background */
    });
    this.upgradeMenuContainer.add(menuHitArea);
    
    // Title with level
    const levelStars = '★'.repeat(mine.getLevel());
    const title = this.scene.add.text(0, -menuHeight / 2 + 22, `${config.name} ${levelStars}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(title);
    
    // Current income
    const incomeText = this.scene.add.text(0, -menuHeight / 2 + 48, `Income: +${config.incomePerWave}g per wave`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#aaffaa'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(incomeText);
    
    // Total invested
    const investedText = this.scene.add.text(0, -menuHeight / 2 + 70, `Total Invested: ${mine.getTotalInvested()}g`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(investedText);
    
    if (canUpgrade) {
      const nextLevel = (mine.getLevel() + 1) as 2 | 3;
      const nextConfig = MINE_CONFIGS[nextLevel];
      const incomeGain = nextConfig.incomePerWave - config.incomePerWave;
      
      // Upgrade button
      const btnY = 15;
      const btnW = 200;
      const btnH = 50;
      
      const upgradeBtnBg = this.scene.add.graphics();
      upgradeBtnBg.fillStyle(canAffordUpgrade ? 0x2a4a2a : 0x2a2a2a, 1);
      upgradeBtnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
      upgradeBtnBg.lineStyle(2, canAffordUpgrade ? 0x00ff00 : 0x555555, 1);
      upgradeBtnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
      this.upgradeMenuContainer.add(upgradeBtnBg);
      
      const upgradeText = this.scene.add.text(0, btnY - 8, `⬆ Upgrade to Level ${nextLevel}`, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: canAffordUpgrade ? '#00ff00' : '#666666'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(upgradeText);
      
      const upgradeDetails = this.scene.add.text(0, btnY + 12, `${upgradeCost}g • +${incomeGain}g/wave`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: canAffordUpgrade ? '#aaffaa' : '#555555'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(upgradeDetails);
      
      if (canAffordUpgrade) {
        const upgradeHitArea = this.scene.add.rectangle(0, btnY, btnW, btnH, 0xffffff, 0);
        upgradeHitArea.setInteractive({ useHandCursor: true });
        upgradeHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          this.goldMineManager.upgradeMine(mine);
          this.closeMenus();
        });
        upgradeHitArea.on('pointerover', () => {
          upgradeBtnBg.clear();
          upgradeBtnBg.fillStyle(0x3a6a3a, 1);
          upgradeBtnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
          upgradeBtnBg.lineStyle(2, 0x00ff00, 1);
          upgradeBtnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        });
        upgradeHitArea.on('pointerout', () => {
          upgradeBtnBg.clear();
          upgradeBtnBg.fillStyle(0x2a4a2a, 1);
          upgradeBtnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
          upgradeBtnBg.lineStyle(2, 0x00ff00, 1);
          upgradeBtnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        });
        this.upgradeMenuContainer.add(upgradeHitArea);
      }
    } else {
      // Max level indicator
      const maxText = this.scene.add.text(0, 35, '★ MAX LEVEL ★', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffd700',
        backgroundColor: '#3a3a2a',
        padding: { x: 12, y: 10 }
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(maxText);
    }
    
    // No sell button (mines cannot be sold)
    
    // Close button with larger hit area
    const closeBtnBg = this.scene.add.rectangle(menuWidth / 2 - 20, -menuHeight / 2 + 18, 36, 36, 0x000000, 0.01);
    closeBtnBg.setInteractive({ useHandCursor: true });
    closeBtnBg.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });
    closeBtnBg.on('pointerup', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.closeMenus();
    });
    this.upgradeMenuContainer.add(closeBtnBg);
    
    const closeBtn = this.scene.add.text(menuWidth / 2 - 20, -menuHeight / 2 + 18, '✕', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ff6666'
    }).setOrigin(0.5);
    closeBtnBg.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtnBg.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.upgradeMenuContainer.add(closeBtnBg);
    this.upgradeMenuContainer.add(closeBtn);
    
    // Clamp popup to screen bounds
    this.uiHelper.clampToScreen(this.upgradeMenuContainer, menuWidth, menuHeight, 0.5, 0.5);
  }

  /**
   * Update method to refresh menus if gold changes
   */
  update(): void {
    const currentGold = this.getPlayerGold?.() || 0;
    
    if (this.currentMine && currentGold !== this.lastKnownGold) {
      this.lastKnownGold = currentGold;
      
      if (this.buildMenuContainer && !this.currentMine.isBuilt()) {
        this.showBuildMenu(this.currentMine);
      } else if (this.upgradeMenuContainer && this.currentMine.isBuilt()) {
        this.showUpgradeMenu(this.currentMine);
      }
    }
  }

  /**
   * Close all menus
   */
  closeMenus(preserveState: boolean = false): void {
    if (this.buildMenuContainer) {
      this.buildMenuContainer.destroy();
      this.buildMenuContainer = null;
    }
    if (this.upgradeMenuContainer) {
      this.upgradeMenuContainer.destroy();
      this.upgradeMenuContainer = null;
    }
    
    if (!preserveState) {
      this.currentMine = null;
      this.goldMineManager.clearSelection();
    }
    
    // Only set closed flag if we actually closed a menu (not for preserveState calls)
    if (!preserveState) {
      this.menuClosedThisFrame = true;
      this.scene.time.delayedCall(50, () => {
        this.menuClosedThisFrame = false;
      });
    }
  }

  /**
   * Check if any menu is open
   */
  isMenuOpen(): boolean {
    return this.buildMenuContainer !== null || this.upgradeMenuContainer !== null;
  }

  /**
   * Check if menu was just closed
   */
  wasMenuJustClosed(): boolean {
    return this.menuClosedThisFrame;
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.closeMenus();
    this.scene.events.off('mine-clicked', this.handleMineClicked, this);
  }
}
