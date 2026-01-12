import Phaser from 'phaser';
import { Tower } from '../objects/Tower';
import { TOWER_CONFIGS, GAME_CONFIG } from '../data';
import { PathSystem } from './MapPathSystem';
import { TowerUIManager } from './TowerUIManager';
import { GoldMineManager } from './GoldMineManager';
import type { UIHitDetector } from './UIHitDetector';

/**
 * TowerManager handles tower placement, selection, and management.
 * Delegates UI (menus, previews) to TowerUIManager.
 */
export class TowerManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private towers: Tower[] = [];
  private selectedTower: Tower | null = null;
  
  // UI Manager
  private uiManager: TowerUIManager;
  
  // Settings (from centralized config)
  private readonly PATH_BUFFER = GAME_CONFIG.TOWER_PATH_BUFFER;
  private readonly TOWER_RADIUS = GAME_CONFIG.TOWER_RADIUS;
  private readonly TOWER_SPACING = GAME_CONFIG.TOWER_SPACING;
  private readonly HUD_HEIGHT = 60; // UI-specific, keep local
  
  // Callbacks
  public onTowerBuilt?: (tower: Tower, cost: number) => void;
  public onTowerSold?: (tower: Tower, refund: number) => void;
  public onTowerUpgraded?: (tower: Tower, cost: number) => void;
  public onAuraBuffsChanged?: () => void;  // Called when aura buffs are recalculated
  public getPlayerGold?: () => number;
  
  // Reference to gold mine manager to check for mine clicks
  private goldMineManager: GoldMineManager | null = null;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    
    // Create UI manager
    this.uiManager = new TowerUIManager(scene);
    this.setupUICallbacks();
    
    // Setup input handlers
    this.setupInput();
    
    console.log('TowerManager: Initialized');
  }

  /**
   * Setup UI manager callbacks
   */
  private setupUICallbacks(): void {
    // Provide gold getter
    this.uiManager.getPlayerGold = () => this.getPlayerGold?.() || 0;
    
    // Provide placement check
    this.uiManager.canPlaceAt = (x: number, y: number) => this.canPlaceAt(x, y);
    
    // Provide mine check (to hide placement preview over mines)
    this.uiManager.isOverMine = (x: number, y: number) => {
      return this.goldMineManager?.getMineAtPosition(x, y) !== null;
    };
    
    // Provide buildable zone check (from PathSystem)
    this.uiManager.isInBuildableZone = (x: number, y: number) => {
      return this.pathSystem.isInBuildableZone(x, y);
    };
    
    // Handle build request
    this.uiManager.onBuildRequested = (x: number, y: number, towerKey: string) => {
      this.buildTower(x, y, towerKey);
    };
    
    // Handle upgrade request
    this.uiManager.onUpgradeRequested = (tower: Tower, newKey: string) => {
      this.upgradeTower(tower, newKey);
    };
    
    // Handle sell request
    this.uiManager.onSellRequested = (tower: Tower) => {
      this.sellTower(tower);
    };
  }

  /**
   * Setup input event handlers
   */
  private setupInput(): void {
    // Track mouse movement for placement preview
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const towerAt = this.getTowerAt(pointer.x, pointer.y);
      this.uiManager.updatePlacementPreview(pointer.x, pointer.y, towerAt);
    });
    
    // Handle clicks
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer.x, pointer.y);
    });
  }

  /**
   * Handle click events
   */
  private handleClick(x: number, y: number): void {
    // Check if a menu was just closed (e.g., by clicking X button)
    if (this.uiManager.wasMenuJustClosed()) {
      return;
    }
    
    // Check if clicking on existing tower first
    const clickedTower = this.getTowerAt(x, y);
    
    if (clickedTower) {
      this.selectTower(clickedTower);
      return;
    }
    
    // Check if clicking on a gold mine - don't open tower menu
    if (this.goldMineManager?.getMineAtPosition(x, y)) {
      return;
    }
    
    // Close menus if clicking elsewhere
    if (this.uiManager.isMenuOpen()) {
      this.uiManager.closeMenus();
      this.deselectTower();
      return;
    }
    
    // Try to open build menu at valid location
    if (this.canPlaceAt(x, y)) {
      this.uiManager.showBuildMenu(x, y);
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
    // Towers need 2x radius plus spacing gap between them
    const minDist = this.TOWER_RADIUS * 2 + this.TOWER_SPACING;
    
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
    
    // Recalculate aura buffs
    this.updateAuraBuffs();
    
    // Close menu
    this.uiManager.closeMenus();
    
    console.log(`TowerManager: Built ${config.name} at (${x}, ${y})`);
  }

  /**
   * Select a tower and show upgrade menu
   */
  private selectTower(tower: Tower): void {
    // Deselect previous
    this.deselectTower();
    
    this.selectedTower = tower;
    tower.setSelected(true);
    
    this.uiManager.showUpgradeMenu(tower);
  }

  /**
   * Deselect current tower
   */
  private deselectTower(): void {
    if (this.selectedTower) {
      this.selectedTower.setSelected(false);
      this.selectedTower = null;
    }
  }

  /**
   * Upgrade a tower
   */
  private upgradeTower(tower: Tower, newKey: string): void {
    const newConfig = TOWER_CONFIGS[newKey];
    if (!newConfig) return;
    
    const cost = newConfig.upgradeCost || 0;
    
    // Upgrade the tower
    tower.upgrade(newKey);
    
    // Notify callback
    this.onTowerUpgraded?.(tower, cost);
    
    // Recalculate aura buffs (aura tower might have upgraded, or tower moved into/out of range)
    this.updateAuraBuffs();
    
    // Close menu and deselect
    this.uiManager.closeMenus();
    this.deselectTower();
    
    console.log(`TowerManager: Upgraded to ${newConfig.name}`);
  }

  /**
   * Sell a tower
   */
  private sellTower(tower: Tower): void {
    // Remove from array
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
    }
    
    // Calculate refund
    const refund = tower.getSellValue();
    
    // Notify callback
    this.onTowerSold?.(tower, refund);
    
    // Destroy tower
    tower.destroy();
    
    // Recalculate aura buffs (in case an aura tower was sold)
    this.updateAuraBuffs();
    
    // Close menu and deselect
    this.uiManager.closeMenus();
    this.deselectTower();
    
    console.log(`TowerManager: Sold tower for ${refund}g`);
  }

  /**
   * Update method - called each frame
   */
  update(): void {
    // Update UI manager (for menu refresh on gold change)
    this.uiManager.update();
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
   * Set reference to gold mine manager for click detection
   */
  setGoldMineManager(manager: GoldMineManager): void {
    this.goldMineManager = manager;
  }

  /**
   * Set the UI hit detector for centralized UI bounds checking
   */
  setUIHitDetector(detector: UIHitDetector): void {
    this.uiManager.setUIHitDetector(detector);
    
    // Register callbacks with the detector
    detector.setTowerCallback((x, y) => this.getTowerAt(x, y));
    detector.setMenuCallback(() => this.uiManager.isMenuOpen());
  }

  /**
   * Set review mode - when true, tower menus only show stats (no upgrade/sell)
   */
  setReviewMode(enabled: boolean): void {
    this.uiManager.setReviewMode(enabled);
  }

  /**
   * Recalculate all aura buffs for towers
   * Called when towers are built, upgraded, or sold
   */
  updateAuraBuffs(): void {
    // First, reset all tower damage multipliers and crit bonuses
    for (const tower of this.towers) {
      tower.setDamageMultiplier(1.0);
      tower.setAuraCritBonus(0);
    }
    
    // Find all aura towers
    const auraTowers = this.towers.filter(t => t.isAuraTower());
    
    // For each non-aura tower, find the best aura buff from nearby aura towers
    for (const tower of this.towers) {
      if (tower.isAuraTower()) continue;  // Aura towers don't buff themselves
      
      let bestMultiplier = 0;
      let hasCritAura = false;
      
      for (const auraTower of auraTowers) {
        const distance = Phaser.Math.Distance.Between(
          tower.x, tower.y,
          auraTower.x, auraTower.y
        );
        
        const auraRange = auraTower.getRange();  // Aura range is stored in the 'range' stat
        
        if (distance <= auraRange) {
          const auraMultiplier = auraTower.getAuraMultiplier();
          if (auraMultiplier > bestMultiplier) {
            bestMultiplier = auraMultiplier;
          }
          
          // Check if this aura tower has Critical Aura ability selected
          const selectedAbilityId = auraTower.getSelectedAbilityId();
          if (selectedAbilityId === 'aura_critaura') {
            hasCritAura = true;
          }
        }
      }
      
      // Apply the best aura buff (only highest applies, no stacking)
      if (bestMultiplier > 0) {
        tower.setDamageMultiplier(1.0 + bestMultiplier);
      }
      
      // Apply crit aura buff (+15% crit chance)
      if (hasCritAura) {
        tower.setAuraCritBonus(0.15);
      }
    }
    
    // Notify callback
    this.onAuraBuffsChanged?.();
  }

  /**
   * Get all towers within a specific range of a position
   */
  getTowersInRange(x: number, y: number, range: number, excludeAura: boolean = true): Tower[] {
    return this.towers.filter(tower => {
      if (excludeAura && tower.isAuraTower()) return false;
      const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      return distance <= range;
    });
  }

  /**
   * Clear placement graphics
   */
  clearPlacementGraphics(): void {
    this.uiManager.clearPlacementGraphics();
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.uiManager.closeMenus();
    this.uiManager.destroy();
    for (const tower of this.towers) {
      tower.destroy();
    }
    this.towers = [];
  }
}
