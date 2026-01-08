import Phaser from 'phaser';
import { Tower, TOWER_CONFIGS } from '../objects/Tower';
import type { TowerBranch } from '../objects/Tower';
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
    
    // Don't show preview if hovering over a tower
    if (this.getTowerAt(x, y)) return;
    
    // Don't show preview in HUD areas (top and bottom)
    if (y < this.HUD_HEIGHT + 20) return;
    if (y > this.scene.cameras.main.height - 100) return;
    
    const canPlace = this.canPlaceAt(x, y);
    // Always use archer_1 stats for placement preview (only buildable tower)
    const config = TOWER_CONFIGS['archer_1'];
    
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
   * Show the build menu at position (only Archer Tower can be built)
   */
  private showBuildMenu(x: number, y: number): void {
    this.closeMenus();
    
    const playerGold = this.getPlayerGold?.() || 0;
    const archerConfig = TOWER_CONFIGS['archer_1'];
    const canAfford = playerGold >= (archerConfig.buildCost || 70);
    
    // Create menu container
    this.buildMenuContainer = this.scene.add.container(x, y - 100);
    this.buildMenuContainer.setDepth(200);
    
    // Menu background - larger for better readability
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-130, -70, 260, 140, 12);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-130, -70, 260, 140, 12);
    this.buildMenuContainer!.add(bg);
    
    // Title
    const title = this.scene.add.text(0, -52, 'Build Tower', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.buildMenuContainer!.add(title);
    
    // Archer Tower button (only option)
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(canAfford ? 0x3a3a3a : 0x2a2a2a, 1);
    btnBg.fillRoundedRect(-110, -28, 220, 80, 8);
    btnBg.lineStyle(2, canAfford ? 0xcc3333 : 0x555555, 1);
    btnBg.strokeRoundedRect(-110, -28, 220, 80, 8);
    this.buildMenuContainer!.add(btnBg);
    
    // Tower icon
    const icon = this.scene.add.graphics();
    icon.fillStyle(canAfford ? 0xcc3333 : 0x555555, 1);
    icon.fillCircle(-70, 12, 28);
    // Add archer symbol on icon
    icon.lineStyle(3, canAfford ? 0xffffff : 0x888888, 0.8);
    icon.lineBetween(-70, -5, -70, 25);
    icon.lineBetween(-82, 5, -58, 5);
    this.buildMenuContainer!.add(icon);
    
    // Name
    const nameText = this.scene.add.text(20, -12, 'Archer Tower', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: canAfford ? '#ffffff' : '#666666'
    }).setOrigin(0.5);
    this.buildMenuContainer!.add(nameText);
    
    // Stats description
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
    this.buildMenuContainer!.add(descText);
    
    // Cost
    const costText = this.scene.add.text(0, 58, `Cost: ${archerConfig.buildCost}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: canAfford ? '#ffd700' : '#ff4444'
    }).setOrigin(0.5);
    this.buildMenuContainer!.add(costText);
    
    // Make interactive
    if (canAfford) {
      const hitArea = this.scene.add.rectangle(0, 12, 220, 80, 0xffffff, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.buildTower(x, y, 'archer_1');
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
      this.buildMenuContainer!.add(hitArea);
    }
    
    // Close button
    const closeBtn = this.scene.add.text(115, -58, '✕', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.closeMenus();
    });
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
    this.onTowerBuilt?.(tower, config.buildCost || 0);
    
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
   * Draw a mini tower icon for the upgrade menu
   */
  private drawMiniTowerIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, branch: TowerBranch, canAfford: boolean): void {
    const alpha = canAfford ? 1 : 0.4;
    const scale = 0.5;
    
    switch (branch) {
      case 'rapidfire':
        // Metal tower with multiple slits
        graphics.fillStyle(0x4a4a4a, alpha);
        graphics.fillRect(x - 12 * scale, y + 10 * scale, 24 * scale, 15 * scale);
        graphics.fillStyle(0x6a6a6a, alpha);
        graphics.fillRect(x - 10 * scale, y - 30 * scale, 20 * scale, 40 * scale);
        graphics.fillStyle(0xffd700, alpha);
        graphics.fillRect(x - 4 * scale, y - 20 * scale, 3 * scale, 10 * scale);
        graphics.fillRect(x + 1 * scale, y - 22 * scale, 3 * scale, 12 * scale);
        break;
        
      case 'sniper':
        // Tall thin tower with scope
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
        // Heavy stone tower with cannon
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
        // Ice crystal spire
        graphics.fillStyle(0x87ceeb, alpha);
        graphics.fillRect(x - 12 * scale, y + 8 * scale, 24 * scale, 12 * scale);
        graphics.fillStyle(0xb0e0e6, alpha * 0.9);
        graphics.fillTriangle(x - 10 * scale, y + 8 * scale, x, y - 40 * scale, x + 10 * scale, y + 8 * scale);
        graphics.fillStyle(0xe0ffff, alpha * 0.7);
        graphics.fillTriangle(x - 6 * scale, y + 5 * scale, x, y - 35 * scale, x + 6 * scale, y + 5 * scale);
        // Sparkles
        graphics.fillStyle(0xffffff, alpha * 0.8);
        graphics.fillCircle(x - 4 * scale, y - 15 * scale, 2 * scale);
        graphics.fillCircle(x + 3 * scale, y - 25 * scale, 2 * scale);
        break;
        
      case 'poison':
        // Gnarled wood with cauldron
        graphics.fillStyle(0x4a3a2a, alpha);
        graphics.fillRect(x - 12 * scale, y + 8 * scale, 24 * scale, 12 * scale);
        graphics.fillStyle(0x3a2a1a, alpha);
        graphics.fillRect(x - 8 * scale, y - 25 * scale, 16 * scale, 35 * scale);
        graphics.fillStyle(0x2a2a2a, alpha);
        graphics.fillCircle(x, y - 30 * scale, 10 * scale);
        graphics.fillStyle(0x00ff00, alpha * 0.8);
        graphics.fillCircle(x, y - 32 * scale, 7 * scale);
        // Bubbles
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
   * Show upgrade/sell menu for tower
   */
  private showUpgradeMenu(tower: Tower): void {
    this.closeMenus();
    
    const config = tower.getConfig();
    const playerGold = this.getPlayerGold?.() || 0;
    const upgradeOptions = tower.getUpgradeOptions();
    
    // Calculate menu dimensions - much larger now
    const hasBranches = upgradeOptions.branches && upgradeOptions.branches.length > 0;
    const hasLevelUp = !!upgradeOptions.levelUp;
    const menuWidth = hasBranches ? 520 : 320;
    const menuHeight = hasBranches ? (hasLevelUp ? 320 : 280) : 160;
    
    // Create menu container
    this.upgradeMenuContainer = this.scene.add.container(tower.x, tower.y - (menuHeight / 2) - 40);
    this.upgradeMenuContainer.setDepth(200);
    
    // Menu background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-menuWidth / 2, -menuHeight / 2, menuWidth, menuHeight, 12);
    this.upgradeMenuContainer.add(bg);
    
    // Tower name and level
    const levelText = tower.getLevel() === 2 ? ' II' : '';
    const title = this.scene.add.text(0, -menuHeight / 2 + 22, `${config.name}${levelText}`, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(title);
    
    // Stats with better formatting
    const fireRateSec = (config.stats.fireRate / 1000).toFixed(1);
    const stats = this.scene.add.text(0, -menuHeight / 2 + 48, `DMG: ${config.stats.damage}  |  Range: ${config.stats.range}m  |  Rate: ${fireRateSec}s`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.upgradeMenuContainer.add(stats);
    
    let yOffset = -menuHeight / 2 + 95;
    
    // Branch upgrade options (only for Archer towers)
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
      const btnWidth = 90;
      const btnHeight = 100;
      const startX = -((branches.length - 1) * btnWidth) / 2;
      
      branches.forEach((branch, index) => {
        const branchConfig = TOWER_CONFIGS[`${branch}_1`];
        if (!branchConfig) return;
        
        const bx = startX + index * btnWidth;
        const cost = branchConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        const color = branchColors[branch];
        
        // Button background
        const btn = this.scene.add.graphics();
        btn.fillStyle(canAfford ? 0x2a2a2a : 0x1a1a1a, 1);
        btn.fillRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
        btn.lineStyle(2, canAfford ? color : 0x444444, 1);
        btn.strokeRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
        this.upgradeMenuContainer!.add(btn);
        
        // Tower icon - draw actual mini tower
        const towerIcon = this.scene.add.graphics();
        this.drawMiniTowerIcon(towerIcon, bx, yOffset + 45, branch, canAfford);
        this.upgradeMenuContainer!.add(towerIcon);
        
        // Name
        const nameText = this.scene.add.text(bx, yOffset + 72, branchNames[branch], {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: canAfford ? '#ffffff' : '#666666'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(nameText);
        
        // Cost
        const costText = this.scene.add.text(bx, yOffset + 88, `${cost}g`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: canAfford ? '#ffd700' : '#ff4444'
        }).setOrigin(0.5);
        this.upgradeMenuContainer!.add(costText);
        
        // Make interactive
        if (canAfford) {
          const hitArea = this.scene.add.rectangle(bx, yOffset + btnHeight / 2, 80, btnHeight, 0xffffff, 0);
          hitArea.setInteractive({ useHandCursor: true });
          hitArea.on('pointerdown', () => {
            this.upgradeTower(tower, `${branch}_1`);
          });
          hitArea.on('pointerover', () => {
            btn.clear();
            btn.fillStyle(0x4a4a4a, 1);
            btn.fillRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
            btn.lineStyle(3, color, 1);
            btn.strokeRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
          });
          hitArea.on('pointerout', () => {
            btn.clear();
            btn.fillStyle(0x2a2a2a, 1);
            btn.fillRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
            btn.lineStyle(2, color, 1);
            btn.strokeRoundedRect(bx - 40, yOffset, 80, btnHeight, 8);
          });
          this.upgradeMenuContainer!.add(hitArea);
        }
      });
      
      yOffset += btnHeight + 15;
    }
    
    // Level up option (for archer L1 -> L2 or specialized L1 -> L2)
    if (hasLevelUp) {
      const levelUpConfig = TOWER_CONFIGS[upgradeOptions.levelUp!];
      if (levelUpConfig) {
        const cost = levelUpConfig.upgradeCost;
        const canAfford = playerGold >= cost;
        
        const lvlBtn = this.scene.add.text(-100, yOffset + 15, `⬆ Upgrade to Level 2 - ${cost}g`, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: canAfford ? '#00ff00' : '#666666',
          backgroundColor: canAfford ? '#2a4a2a' : '#2a2a2a',
          padding: { x: 16, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });
        
        if (canAfford) {
          lvlBtn.on('pointerdown', () => {
            this.upgradeTower(tower, upgradeOptions.levelUp!);
          });
          lvlBtn.on('pointerover', () => lvlBtn.setStyle({ backgroundColor: '#3a6a3a' }));
          lvlBtn.on('pointerout', () => lvlBtn.setStyle({ backgroundColor: '#2a4a2a' }));
        }
        
        this.upgradeMenuContainer.add(lvlBtn);
      }
    } else if (!hasBranches) {
      // Tower is maxed out
      const maxText = this.scene.add.text(-100, yOffset + 15, '★ MAX LEVEL ★', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#ffd700',
        backgroundColor: '#3a3a2a',
        padding: { x: 16, y: 10 }
      }).setOrigin(0.5);
      this.upgradeMenuContainer.add(maxText);
    }
    
    // Sell button
    const sellValue = tower.getSellValue();
    const sellBtn = this.scene.add.text(100, yOffset + 15, `Sell: ${sellValue}g`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ff6666',
      backgroundColor: '#4a2a2a',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    sellBtn.on('pointerdown', () => this.sellTower(tower));
    sellBtn.on('pointerover', () => sellBtn.setStyle({ backgroundColor: '#6a3a3a' }));
    sellBtn.on('pointerout', () => sellBtn.setStyle({ backgroundColor: '#4a2a2a' }));
    this.upgradeMenuContainer.add(sellBtn);
    
    // Close button
    const closeBtn = this.scene.add.text(menuWidth / 2 - 20, -menuHeight / 2 + 18, '✕', {
      fontFamily: 'Arial',
      fontSize: '24px',
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
