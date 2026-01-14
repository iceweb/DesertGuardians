import Phaser from 'phaser';
import { Tower } from '../objects/Tower';
import { TOWER_CONFIGS, GAME_CONFIG } from '../data';
import { TowerAnimatorFactory } from '../graphics/TowerAnimatorFactory';
import { PathSystem } from './MapPathSystem';
import { TowerUIManager } from './TowerUIManager';
import { GoldMineManager } from './GoldMineManager';
import type { GoldMineUIManager } from './GoldMineUIManager';
import type { UIHitDetector } from './UIHitDetector';

export class TowerManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private towers: Tower[] = [];
  private selectedTower: Tower | null = null;

  private uiManager: TowerUIManager;

  private animatorFactory: TowerAnimatorFactory;

  private readonly PATH_BUFFER = GAME_CONFIG.TOWER_PATH_BUFFER;
  private readonly TOWER_RADIUS = GAME_CONFIG.TOWER_RADIUS;
  private readonly TOWER_SPACING = GAME_CONFIG.TOWER_SPACING;
  private readonly HUD_HEIGHT = 60;

  public onTowerBuilt?: (tower: Tower, cost: number) => void;
  public onTowerSold?: (tower: Tower, refund: number) => void;
  public onTowerUpgraded?: (tower: Tower, cost: number) => void;
  public onAuraBuffsChanged?: () => void;
  public getPlayerGold?: () => number;

  private goldMineManager: GoldMineManager | null = null;

  private goldMineUIManager: GoldMineUIManager | null = null;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;

    this.animatorFactory = new TowerAnimatorFactory(scene);

    this.uiManager = new TowerUIManager(scene);
    this.setupUICallbacks();

    this.setupInput();
  }

  private setupUICallbacks(): void {
    this.uiManager.getPlayerGold = () => this.getPlayerGold?.() || 0;

    this.uiManager.canPlaceAt = (x: number, y: number) => this.canPlaceAt(x, y);

    this.uiManager.isOverMine = (x: number, y: number) => {
      return this.goldMineManager?.getMineAtPosition(x, y) !== null;
    };

    this.uiManager.isInBuildableZone = (x: number, y: number) => {
      return this.pathSystem.isInBuildableZone(x, y);
    };

    this.uiManager.onBuildRequested = (x: number, y: number, towerKey: string) => {
      this.buildTower(x, y, towerKey);
    };

    this.uiManager.onUpgradeRequested = (tower: Tower, newKey: string) => {
      this.upgradeTower(tower, newKey);
    };

    this.uiManager.onSellRequested = (tower: Tower) => {
      this.sellTower(tower);
    };
  }

  private setupInput(): void {
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const towerAt = this.getTowerAt(pointer.x, pointer.y);
      this.uiManager.updatePlacementPreview(pointer.x, pointer.y, towerAt);
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer.x, pointer.y);
    });
  }

  private handleClick(x: number, y: number): void {
    if (this.uiManager.wasMenuJustClosed()) {
      return;
    }

    if (this.goldMineUIManager?.isMenuOpen() || this.goldMineUIManager?.wasMenuJustClosed()) {
      return;
    }

    const clickedTower = this.getTowerAt(x, y);

    if (clickedTower) {
      this.selectTower(clickedTower);
      return;
    }

    if (this.goldMineManager?.getMineAtPosition(x, y)) {
      return;
    }

    if (this.uiManager.isMenuOpen()) {
      this.uiManager.closeMenus();
      this.deselectTower();
      return;
    }

    if (this.canPlaceAt(x, y)) {
      this.uiManager.showBuildMenu(x, y);
    }
  }

  canPlaceAt(x: number, y: number): boolean {
    if (y < this.HUD_HEIGHT + 20) return false;

    if (x < 30 || x > this.scene.cameras.main.width - 30) return false;
    if (y > this.scene.cameras.main.height - 100) return false;

    if (this.isNearPath(x, y)) return false;

    if (this.isOverlappingTower(x, y)) return false;

    return true;
  }

  private isNearPath(x: number, y: number): boolean {
    const segments = this.pathSystem.getSegments();
    const minDist = this.PATH_BUFFER + this.TOWER_RADIUS;

    for (const segment of segments) {
      const dist = this.pointToSegmentDistance(
        x,
        y,
        segment.start.x,
        segment.start.y,
        segment.end.x,
        segment.end.y
      );

      if (dist < minDist) {
        return true;
      }
    }

    return false;
  }

  private isOverlappingTower(x: number, y: number, excludeTower?: Tower): boolean {
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

  private getTowerAt(x: number, y: number): Tower | null {
    for (const tower of this.towers) {
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (dist < this.TOWER_RADIUS + 10) {
        return tower;
      }
    }
    return null;
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
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

  private buildTower(x: number, y: number, towerKey: string): void {
    const config = TOWER_CONFIGS[towerKey];
    if (!config) return;

    const tower = new Tower(this.scene, x, y, towerKey, this.animatorFactory);
    this.towers.push(tower);

    tower.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        this.selectTower(tower);
      }
    );

    this.onTowerBuilt?.(tower, config.buildCost || 0);

    this.updateAuraBuffs();

    this.uiManager.closeMenus();
  }

  private selectTower(tower: Tower): void {
    this.deselectTower();

    this.selectedTower = tower;
    tower.setSelected(true);

    this.uiManager.showUpgradeMenu(tower);
  }

  private deselectTower(): void {
    if (this.selectedTower) {
      this.selectedTower.setSelected(false);
      this.selectedTower = null;
    }
  }

  private upgradeTower(tower: Tower, newKey: string): void {
    const newConfig = TOWER_CONFIGS[newKey];
    if (!newConfig) return;

    const cost = newConfig.upgradeCost || 0;

    tower.upgrade(newKey);

    this.onTowerUpgraded?.(tower, cost);

    this.updateAuraBuffs();

    this.uiManager.closeMenus();
    this.deselectTower();
  }

  private sellTower(tower: Tower): void {
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
    }

    const refund = tower.getSellValue();

    this.onTowerSold?.(tower, refund);

    tower.destroy();

    this.updateAuraBuffs();

    this.uiManager.closeMenus();
    this.deselectTower();
  }

  update(): void {
    this.uiManager.update();
  }

  getTowers(): Tower[] {
    return this.towers;
  }

  getTowerCount(): number {
    return this.towers.length;
  }

  setGoldMineManager(manager: GoldMineManager): void {
    this.goldMineManager = manager;
  }

  setGoldMineUIManager(manager: GoldMineUIManager): void {
    this.goldMineUIManager = manager;
  }

  setUIHitDetector(detector: UIHitDetector): void {
    this.uiManager.setUIHitDetector(detector);

    detector.setTowerCallback((x, y) => this.getTowerAt(x, y));
    detector.setMenuCallback(() => this.uiManager.isMenuOpen());
  }

  setReviewMode(enabled: boolean): void {
    this.uiManager.setReviewMode(enabled);
  }

  isMenuOpen(): boolean {
    return this.uiManager.isMenuOpen();
  }

  updateAuraBuffs(): void {
    for (const tower of this.towers) {
      tower.setDamageMultiplier(1.0);
      tower.setAuraCritBonus(0);
    }

    const auraTowers = this.towers.filter((t) => t.isAuraTower());

    for (const tower of this.towers) {
      if (tower.isAuraTower()) continue;

      let bestMultiplier = 0;
      let hasCritAura = false;

      for (const auraTower of auraTowers) {
        const distance = Phaser.Math.Distance.Between(tower.x, tower.y, auraTower.x, auraTower.y);

        const auraRange = auraTower.getRange();

        if (distance <= auraRange) {
          const auraMultiplier = auraTower.getAuraMultiplier();
          if (auraMultiplier > bestMultiplier) {
            bestMultiplier = auraMultiplier;
          }

          const selectedAbilityId = auraTower.getSelectedAbilityId();
          if (selectedAbilityId === 'aura_critaura') {
            hasCritAura = true;
          }
        }
      }

      if (bestMultiplier > 0) {
        tower.setDamageMultiplier(1.0 + bestMultiplier);
      }

      if (hasCritAura) {
        tower.setAuraCritBonus(0.15);
      }
    }

    this.onAuraBuffsChanged?.();
  }

  getTowersInRange(x: number, y: number, range: number, excludeAura: boolean = true): Tower[] {
    return this.towers.filter((tower) => {
      if (excludeAura && tower.isAuraTower()) return false;
      const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      return distance <= range;
    });
  }

  clearPlacementGraphics(): void {
    this.uiManager.clearPlacementGraphics();
  }

  destroy(): void {
    this.uiManager.closeMenus();
    this.uiManager.destroy();
    for (const tower of this.towers) {
      tower.destroy();
    }
    this.towers = [];
  }
}
