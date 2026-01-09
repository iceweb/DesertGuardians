import Phaser from 'phaser';
import { Tower, TOWER_CONFIGS } from '../objects/Tower';
import type { TowerBranch } from '../objects/Tower';

/**
 * TowerUIManager handles tower build/upgrade menus and placement preview.
 * Extracted from TowerManager to keep files under 500 LOC.
 */
export class TowerUIManager {
  private scene: Phaser.Scene;
  
  // Placement state
  private placementGraphics: Phaser.GameObjects.Graphics;
  
  // Menus
  private buildMenuContainer: Phaser.GameObjects.Container | null = null;
  private upgradeMenuContainer: Phaser.GameObjects.Container | null = null;
  
  // Track currently selected tower for upgrade menu refresh
  private selectedTower: Tower | null = null;
  private lastKnownGold: number = 0;
  
  // Track build menu position for refresh
  private buildMenuPosition: { x: number; y: number } | null = null;
  
  // Track if menu was closed this frame (to prevent immediate reopen)
  private menuClosedThisFrame: boolean = false;
  
  // Callbacks
  public onBuildRequested?: (x: number, y: number, towerKey: string) => void;
  public onUpgradeRequested?: (tower: Tower, newKey: string) => void;
  public onSellRequested?: (tower: Tower) => void;
  public getPlayerGold?: () => number;
  public canPlaceAt?: (x: number, y: number) => boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.placementGraphics = scene.add.graphics();
    this.placementGraphics.setDepth(50);
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
    
    const canPlace = this.canPlaceAt?.(x, y) ?? false;
    const config = TOWER_CONFIGS['archer_1'];
    const TOWER_RADIUS = 30;
    
    if (canPlace) {
      this.placementGraphics.lineStyle(3, 0x00ff00, 0.8);
      this.placementGraphics.strokeCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.fillStyle(0x00ff00, 0.2);
      this.placementGraphics.fillCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.lineStyle(1, 0x00ff00, 0.3);
      this.placementGraphics.strokeCircle(x, y, config.stats.range);
    } else {
      this.placementGraphics.lineStyle(3, 0xff0000, 0.8);
      this.placementGraphics.strokeCircle(x, y, TOWER_RADIUS);
      this.placementGraphics.fillStyle(0xff0000, 0.2);
      this.placementGraphics.fillCircle(x, y, TOWER_RADIUS);
    }
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
    
    this.buildMenuContainer = this.scene.add.container(x, y - 100);
    this.buildMenuContainer.setDepth(200);
    
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-130, -70, 260, 140, 12);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-130, -70, 260, 140, 12);
    this.buildMenuContainer.add(bg);
    
    const title = this.scene.add.text(0, -52, 'Build Tower', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(title);
    
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x3a3a3a : 0x2a2a2a, 1);
    btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
    btnBg.lineStyle(2, canAfford ? 0xcc3333 : 0x555555, 1);
    btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
    this.buildMenuContainer.add(btnBg);
    
    const icon = this.scene.add.graphics();
    icon.fillStyle(canAfford ? 0xcc3333 : 0x555555, 1);
    icon.fillCircle(-70, 12, 28);
    icon.lineStyle(3, canAfford ? 0xffffff : 0x888888, 0.8);
    icon.lineBetween(-70, -5, -70, 25);
    icon.lineBetween(-82, 5, -58, 5);
    this.buildMenuContainer.add(icon);
    
    const nameText = this.scene.add.text(20, -12, 'Archer Tower', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: canAfford ? '#ffffff' : '#666666'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(nameText);
    
    const stats = archerConfig.stats;
    const fireRateSec = (stats.fireRate / 1000).toFixed(1);
    const descText = this.scene.add.text(20, 18, 
      `DMG: ${stats.damage}  |  Range: ${stats.range}m\nRate: ${fireRateSec}s  |  Single target`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: canAfford ? '#cccccc' : '#555555',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);
    this.buildMenuContainer.add(descText);
    
    const costText = this.scene.add.text(0, 58, `Cost: ${archerConfig.buildCost}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ffd700' : '#ff4444'
    }).setOrigin(0.5);
    this.buildMenuContainer.add(costText);
    
    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 12, 220, 80, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onBuildRequested?.(x, y, 'archer_1');
        this.closeMenus();
      });
      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x5a5a5a, 1);
        btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
        btnBg.lineStyle(2, 0xcc3333, 1);
        btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
      });
      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3a3a, 1);
        btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
        btnBg.lineStyle(2, 0xcc3333, 1);
        btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
      });
      this.buildMenuContainer.add(hitArea);
    }
    
    const closeBtn = this.scene.add.text(115, -58, '✕', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.closeMenus();
    });
    this.buildMenuContainer.add(closeBtn);
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
    const menuWidth = hasBranches ? 520 : 420;
    const menuHeight = hasBranches ? (hasLevelUp ? 320 : 280) : 200;
    
    this.upgradeMenuContainer = this.scene.add.container(tower.x, tower.y - (menuHeight / 2) - 40);
    this.upgradeMenuContainer.setDepth(200);
    
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    this.upgradeMenuContainer.add(bg);
    
    const title = this.scene.add.text(0, -menuHeight / 2 + 22, config.name, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(title);
    
    const fireRateSec = (config.stats.fireRate / 1000).toFixed(1);
    const stats = this.scene.add.text(0, -menuHeight / 2 + 48, `DMG: ${config.stats.damage}  |  Range: ${config.stats.range}m  |  Rate: ${fireRateSec}s`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(stats);
    
    let yOffset = -menuHeight / 2 + 95;
    
    if (hasBranches) {
      const branchLabel = this.scene.add.text(0, yOffset, 'Specialize Into:', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(branchLabel);
      yOffset += 25;
      
      const branchColors: Record<TowerBranch, number> = {
        archer: 0xcc3333,
        rapidfire: 0xffd700,
        sniper: 0x4169e1,
        rockcannon: 0xff6600,
        icetower: 0x87ceeb,
        poison: 0x00ff00
      };
      
      const branchNames: Record<TowerBranch, string> = {
        archer: 'Archer',
        rapidfire: 'Rapid Fire',
        sniper: 'Sniper',
        rockcannon: 'Cannon',
        icetower: 'Ice',
        poison: 'Poison'
      };
      
      const branches = upgradeOptions.branches!;
      const btnWidth = 95;
      const btnHeight = 115;
      const startX = -((branches.length - 1) * btnWidth) / 2;
      
      branches.forEach((branch, index) => {
        const branchConfig = TOWER_CONFIGS[`${branch}_1`];
        if (!branchConfig) return;
        
        const bx = startX + index * btnWidth;
        const by = yOffset; // Capture current yOffset for this button
        const cost = branchConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const color = branchColors[branch];
        
        const btn = this.scene.add.graphics();
        btn.fillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a, 1);
        btn.fillRoundedRect(bx - 43, by, 86, btnHeight, 8);
        btn.lineStyle(2, canAfford ? color : 0x444444, 1);
        btn.strokeRoundedRect(bx - 43, by, 86, btnHeight, 8);
        this.upgradeMenuContainer!.add(btn);
        
        const towerIcon = this.scene.add.graphics();
        this.drawMiniTowerIcon(towerIcon, bx, by + 50, branch, canAfford);
        this.upgradeMenuContainer!.add(towerIcon);
        
        const nameText = this.scene.add.text(bx, by + 82, branchNames[branch], {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: canAfford ? '#ffffff' : '#666666'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(nameText);
        
        const costText = this.scene.add.text(bx, by + 100, `${cost}g`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: canAfford ? '#ffd700' : '#ff4444'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(costText);
        
        if (canAfford) {
          const hitArea = this.scene.add.rectangle(bx, by + btnHeight / 2, 86, btnHeight, 0xffffff, 0);
          hitArea.setInteractive({ useHandCursor: true });
          hitArea.on('pointerdown', () => {
            this.onUpgradeRequested?.(tower, `${branch}_1`);
          });
          hitArea.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(0x4a4a4a, 1);
            btn.fillRoundedRect(bx - 43, by, 86, btnHeight, 8);
            btn.lineStyle(3, color, 1);
            btn.strokeRoundedRect(bx - 43, by, 86, btnHeight, 8);
          });
          hitArea.on('pointerout', () => {
            btn.clear();
            btn.fillStyle(0x2a2a2a, 1);
            btn.fillRoundedRect(bx - 43, by, 86, btnHeight, 8);
            btn.lineStyle(2, color, 1);
            btn.strokeRoundedRect(bx - 43, by, 86, btnHeight, 8);
          });
          this.upgradeMenuContainer!.add(hitArea);
        }
      });
      
      yOffset += btnHeight + 15;
    }
    
    if (hasLevelUp) {
      const levelUpConfig = TOWER_CONFIGS[upgradeOptions.levelUp!];
      if (levelUpConfig) {
        const cost = levelUpConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const nextLevel = levelUpConfig.level;
        const levelLabel = nextLevel === 2 ? 'Level 2' : 'Level 3';
        
        const lvlBtn = this.scene.add.text(-70, yOffset + 15, `⬆ Upgrade to ${levelLabel} - ${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: canAfford ? '#00ff00' : '#666666',
          backgroundColor: canAfford ? '#2a4a2a' : '#2a2a2a',
          padding: { x: 16, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });
        
        if (canAfford) {
          lvlBtn.on('pointerdown', () => {
            this.onUpgradeRequested?.(tower, upgradeOptions.levelUp!);
          });
          lvlBtn.on('pointerover', () => lvlBtn.setStyle({ backgroundColor: '#3a6a3a' }));
          lvlBtn.on('pointerout', () => lvlBtn.setStyle({ backgroundColor: '#2a4a2a' }));
        }
        
        this.upgradeMenuContainer.add(lvlBtn);
      }
    } else if (!hasBranches) {
      const maxText = this.scene.add.text(-70, yOffset + 15, '★ MAX LEVEL ★', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffd700',
        backgroundColor: '#3a3a2a',
        padding: { x: 16, y: 10 }
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(maxText);
    }
    
    const sellValue = tower.getSellValue();
    const sellBtn = this.scene.add.text(120, yOffset + 15, `Sell: ${sellValue}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ff6666',
      backgroundColor: '#4a2a2a',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    sellBtn.on('pointerdown', () => this.onSellRequested?.(tower));
    sellBtn.on('pointerover', () => sellBtn.setStyle({ backgroundColor: '#6a3a3a' }));
    sellBtn.on('pointerout', () => sellBtn.setStyle({ backgroundColor: '#4a2a2a' }));
    this.upgradeMenuContainer.add(sellBtn);
    
    const closeBtn = this.scene.add.text(menuWidth / 2 - 20, -menuHeight / 2 + 18, '✕', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMenus());
    this.upgradeMenuContainer.add(closeBtn);
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
    return this.buildMenuContainer !== null || this.upgradeMenuContainer !== null;
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
