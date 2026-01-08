import Phaser from 'phaser';
import { Tower, TOWER_CONFIGS } from '../objects/Tower';
import { PathSystem } from './PathSystem';

/**
 * TowerManager handles tower placement, selection, and management.
 */
export class TowerManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private towers: Tower[] = [];
  private selectedTower: Tower | null = null;
  
  // Placement state
  private placementGraphics: Phaser.GameObjects.Graphics;
  private placementTowerKey: string = 'archer';
  
  // Build menu
  private buildMenuContainer: Phaser.GameObjects.Container | null = null;
  private upgradeMenuContainer: Phaser.GameObjects.Container | null = null;
  
  // Settings
  private readonly PATH_BUFFER = 40;
  private readonly TOWER_RADIUS = 30;
  private readonly HUD_HEIGHT = 60;
  
  // Callbacks
  public onTowerBuilt?: (tower: Tower, cost: number) => void;
  public onTowerSold?: (tower: Tower, refund: number) => void;
  public onTowerUpgraded?: (tower: Tower, cost: number) => void;
  public getPlayerGold?: () => number;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    
    // Create placement graphics
    this.placementGraphics = scene.add.graphics();
    this.placementGraphics.setDepth(50);
    
    // Setup input handlers
    this.setupInput();
    
    console.log('TowerManager: Initialized');
  }

  /**
   * Setup input event handlers
   */
  private setupInput(): void {
    // Track mouse movement for placement preview
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updatePlacementPreview(pointer.x, pointer.y);
    });
    
    // Handle clicks
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer.x, pointer.y);
    });
  }

  /**
   * Update the placement preview ghost
   */
  private updatePlacementPreview(x: number, y: number): void {
    this.placementGraphics.clear();
    
    // Don't show preview if menus are open
    if (this.buildMenuContainer || this.upgradeMenuContainer) return;
    
    const canPlace = this.canPlaceAt(x, y);
    const config = TOWER_CONFIGS[this.placementTowerKey];
    
    if (canPlace) {
      // Green valid indicator
      this.placementGraphics.lineStyle(3, 0x00ff00, 0.8);
      this.placementGraphics.strokeCircle(x, y, this.TOWER_RADIUS);
      this.placementGraphics.fillStyle(0x00ff00, 0.2);
      this.placementGraphics.fillCircle(x, y, this.TOWER_RADIUS);
      
      // Range indicator
      this.placementGraphics.lineStyle(1, 0x00ff00, 0.3);
      this.placementGraphics.strokeCircle(x, y, config.stats.range);
    } else {
      // Red invalid indicator
      this.placementGraphics.lineStyle(3, 0xff0000, 0.8);
      this.placementGraphics.strokeCircle(x, y, this.TOWER_RADIUS);
      this.placementGraphics.fillStyle(0xff0000, 0.2);
      this.placementGraphics.fillCircle(x, y, this.TOWER_RADIUS);
    }
  }

  /**
   * Handle click events
   */
  private handleClick(x: number, y: number): void {
    // Check if clicking on existing tower first
    const clickedTower = this.getTowerAt(x, y);
    
    if (clickedTower) {
      // Select tower and show upgrade menu
      this.selectTower(clickedTower);
      return;
    }
    
    // Close menus if clicking elsewhere
    if (this.buildMenuContainer || this.upgradeMenuContainer) {
      this.closeMenus();
      return;
    }
    
    // Try to open build menu at valid location
    if (this.canPlaceAt(x, y)) {
      this.showBuildMenu(x, y);
    }
  }

  /**
   * Check if a position is valid for tower placement
   */
  canPlaceAt(x: number, y: number): boolean {
    // Check HUD area
    if (y < this.HUD_HEIGHT + 20) return false;
    
    // Check screen bounds
    if (x < 30 || x > this.scene.cameras.main.width - 30) return false;
    if (y > this.scene.cameras.main.height - 60) return false;
    
    // Check path exclusion zone
    if (this.isNearPath(x, y)) return false;
    
    // Check other towers
    if (this.isOverlappingTower(x, y)) return false;
    
    return true;
  }

  /**
   * Check if position is too close to path
   */
  private isNearPath(x: number, y: number): boolean {
    const segments = this.pathSystem.getSegments();
    const minDist = this.PATH_BUFFER + this.TOWER_RADIUS;
    
    for (const segment of segments) {
      const dist = this.pointToSegmentDistance(
        x, y,
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y
      );
      
      if (dist < minDist) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if position overlaps with existing tower
   */
  private isOverlappingTower(x: number, y: number, excludeTower?: Tower): boolean {
    const minDist = this.TOWER_RADIUS * 2 + 10;
    
    for (const tower of this.towers) {
      if (tower === excludeTower) continue;
      
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist < minDist) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get tower at position
   */
  private getTowerAt(x: number, y: number): Tower | null {
    for (const tower of this.towers) {
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist < this.TOWER_RADIUS + 10) {
        return tower;
      }
    }
    return null;
  }

  /**
   * Calculate distance from point to line segment
   */
  private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    
    return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
  }

  /**
   * Show the build menu at position
   */
  private showBuildMenu(x: number, y: number): void {
    this.closeMenus();
    
    const playerGold = this.getPlayerGold?.() || 0;
    
    // Create menu container
    this.buildMenuContainer = this.scene.add.container(x, y - 80);
    this.buildMenuContainer.setDepth(200);
    
    // Menu background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-140, -60, 280, 120, 10);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-140, -60, 280, 120, 10);
    this.buildMenuContainer!.add(bg);
    
    // Title
    const title = this.scene.add.text(0, -45, 'Build Tower', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.buildMenuContainer!.add(title);
    
    // Tower buttons
    const towerOptions = [
      { key: 'archer', name: 'Archer', cost: 70, color: 0xcc3333 },
      { key: 'rockcannon', name: 'Cannon', cost: 90, color: 0x8b4513 },
      { key: 'icetower', name: 'Ice', cost: 80, color: 0x87ceeb },
      { key: 'poison', name: 'Poison', cost: 80, color: 0x00ff00 }
    ];
    
    const buttonWidth = 60;
    const startX = -((towerOptions.length - 1) * buttonWidth) / 2;
    
    towerOptions.forEach((opt, index) => {
      const bx = startX + index * buttonWidth;
      const canAfford = playerGold >= opt.cost;
      
      // Button background
      const btn = this.scene.add.graphics();
      btn.fillStyle(canAfford ? 0x3a3a3a : 0x2a2a2a, 1);
      btn.fillRoundedRect(bx - 25, -25, 50, 65, 5);
      btn.lineStyle(2, canAfford ? opt.color : 0x555555, 1);
      btn.strokeRoundedRect(bx - 25, -25, 50, 65, 5);
      this.buildMenuContainer!.add(btn);
      
      // Tower icon (colored circle)
      const icon = this.scene.add.graphics();
      icon.fillStyle(canAfford ? opt.color : 0x555555, 1);
      icon.fillCircle(bx, -5, 15);
      this.buildMenuContainer!.add(icon);
      
      // Name
      const nameText = this.scene.add.text(bx, 18, opt.name, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: canAfford ? '#ffffff' : '#666666'
      }).setOrigin(0.5);
      this.buildMenuContainer!.add(nameText);
      
      // Cost
      const costText = this.scene.add.text(bx, 32, `${opt.cost}g`, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: canAfford ? '#ffd700' : '#ff4444'
      }).setOrigin(0.5);
      this.buildMenuContainer!.add(costText);
      
      // Make interactive
      if (canAfford) {
        const hitArea = this.scene.add.rectangle(bx, 7, 50, 65, 0xffffff, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => {
          this.buildTower(x, y, opt.key);
        });
        hitArea.on('pointerover', () => {
          btn.clear();
          btn.fillStyle(0x5a5a5a, 1);
          btn.fillRoundedRect(bx - 25, -25, 50, 65, 5);
          btn.lineStyle(2, opt.color, 1);
          btn.strokeRoundedRect(bx - 25, -25, 50, 65, 5);
        });
        hitArea.on('pointerout', () => {
          btn.clear();
          btn.fillStyle(0x3a3a3a, 1);
          btn.fillRoundedRect(bx - 25, -25, 50, 65, 5);
          btn.lineStyle(2, opt.color, 1);
          btn.strokeRoundedRect(bx - 25, -25, 50, 65, 5);
        });
        this.buildMenuContainer!.add(hitArea);
      }
    });
    
    // Close button
    const closeBtn = this.scene.add.text(125, -50, '✕', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMenus());
    this.buildMenuContainer!.add(closeBtn);
  }

  /**
   * Build a tower at position
   */
  private buildTower(x: number, y: number, towerKey: string): void {
    const config = TOWER_CONFIGS[towerKey];
    if (!config) return;
    
    // Create tower
    const tower = new Tower(this.scene, x, y, towerKey);
    this.towers.push(tower);
    
    // Setup tower click handler
    tower.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.selectTower(tower);
    });
    
    // Notify callback
    this.onTowerBuilt?.(tower, config.buildCost);
    
    // Close menu
    this.closeMenus();
    
    console.log(`TowerManager: Built ${config.name} at (${x}, ${y})`);
  }

  /**
   * Select a tower and show upgrade menu
   */
  private selectTower(tower: Tower): void {
    // Deselect previous
    if (this.selectedTower) {
      this.selectedTower.setSelected(false);
    }
    
    this.selectedTower = tower;
    tower.setSelected(true);
    
    this.showUpgradeMenu(tower);
  }

  /**
   * Show upgrade/sell menu for tower
   */
  private showUpgradeMenu(tower: Tower): void {
    this.closeMenus();
    
    const config = tower.getConfig();
    const playerGold = this.getPlayerGold?.() || 0;
    
    // Create menu container
    this.upgradeMenuContainer = this.scene.add.container(tower.x, tower.y - 100);
    this.upgradeMenuContainer.setDepth(200);
    
    // Menu background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-120, -50, 240, 100, 10);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-120, -50, 240, 100, 10);
    this.upgradeMenuContainer.add(bg);
    
    // Tower name
    const title = this.scene.add.text(0, -38, config.name, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(title);
    
    // Stats
    const stats = this.scene.add.text(0, -20, `DMG: ${config.stats.damage} | Range: ${config.stats.range} | Rate: ${config.stats.fireRate}ms`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(stats);
    
    // Upgrade buttons (if available)
    if (config.upgradesTo && config.upgradesTo.length > 0) {
      const startX = config.upgradesTo.length === 2 ? -50 : 0;
      
      config.upgradesTo.forEach((upgradeKey, index) => {
        const upgradeConfig = TOWER_CONFIGS[upgradeKey];
        if (!upgradeConfig || !upgradeConfig.upgradeCost) return;
        
        const bx = startX + index * 100;
        const canAfford = playerGold >= upgradeConfig.upgradeCost;
        
        const btn = this.scene.add.text(bx, 10, `↑ ${upgradeConfig.name}\n${upgradeConfig.upgradeCost}g`, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: canAfford ? '#00ff00' : '#666666',
          backgroundColor: canAfford ? '#2a4a2a' : '#2a2a2a',
          padding: { x: 8, y: 4 },
          align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });
        
        if (canAfford) {
          btn.on('pointerdown', () => {
            this.upgradeTower(tower, upgradeKey);
          });
          btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#3a6a3a' }));
          btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#2a4a2a' }));
        }
        
        this.upgradeMenuContainer!.add(btn);
      });
    }
    
    // Sell button
    const sellValue = tower.getSellValue();
    const sellBtn = this.scene.add.text(80, 32, `Sell: ${sellValue}g`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ff6666',
      backgroundColor: '#4a2a2a',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    sellBtn.on('pointerdown', () => this.sellTower(tower));
    sellBtn.on('pointerover', () => sellBtn.setStyle({ backgroundColor: '#6a3a3a' }));
    sellBtn.on('pointerout', () => sellBtn.setStyle({ backgroundColor: '#4a2a2a' }));
    this.upgradeMenuContainer.add(sellBtn);
    
    // Close button
    const closeBtn = this.scene.add.text(105, -40, '✕', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMenus());
    this.upgradeMenuContainer.add(closeBtn);
  }

  /**
   * Upgrade a tower
   */
  private upgradeTower(tower: Tower, newKey: string): void {
    const newConfig = TOWER_CONFIGS[newKey];
    if (!newConfig || !newConfig.upgradeCost) return;
    
    tower.upgrade(newKey);
    this.onTowerUpgraded?.(tower, newConfig.upgradeCost);
    
    this.closeMenus();
    this.selectTower(tower); // Reselect to show new stats
    
    console.log(`TowerManager: Upgraded to ${newConfig.name}`);
  }

  /**
   * Sell a tower
   */
  private sellTower(tower: Tower): void {
    const refund = tower.getSellValue();
    
    // Remove from array
    const index = this.towers.indexOf(tower);
    if (index !== -1) {
      this.towers.splice(index, 1);
    }
    
    // Notify callback
    this.onTowerSold?.(tower, refund);
    
    // Destroy tower
    tower.destroy();
    
    this.closeMenus();
    this.selectedTower = null;
    
    console.log(`TowerManager: Sold tower for ${refund}g`);
  }

  /**
   * Close all menus
   */
  private closeMenus(): void {
    if (this.buildMenuContainer) {
      this.buildMenuContainer.destroy();
      this.buildMenuContainer = null;
    }
    if (this.upgradeMenuContainer) {
      this.upgradeMenuContainer.destroy();
      this.upgradeMenuContainer = null;
    }
    if (this.selectedTower) {
      this.selectedTower.setSelected(false);
      this.selectedTower = null;
    }
  }

  /**
   * Get all towers
   */
  getTowers(): Tower[] {
    return this.towers;
  }

  /**
   * Get tower count
   */
  getTowerCount(): number {
    return this.towers.length;
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
    for (const tower of this.towers) {
      tower.destroy();
    }
    this.towers = [];
    this.placementGraphics.destroy();
  }
}
