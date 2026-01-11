import Phaser from 'phaser';
import { GoldMine } from '../objects/GoldMine';
import { MINE_CONFIGS } from '../data/MineData';

export interface MinePadData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  occupied: boolean;
}

/**
 * GoldMineManager handles gold mine placement, upgrades, and income collection.
 * Creates GoldMine objects at each minepad location from the map.
 */
export class GoldMineManager {
  private scene: Phaser.Scene;
  private mines: GoldMine[] = [];
  private selectedMine: GoldMine | null = null;
  
  // Callbacks
  public onMineBuild?: (mine: GoldMine, cost: number) => void;
  public onMineUpgraded?: (mine: GoldMine, cost: number) => void;
  public getPlayerGold?: () => number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize mines from minepad data
   */
  initializeFromPads(minePads: MinePadData[]): void {
    for (const pad of minePads) {
      const mine = new GoldMine(
        this.scene,
        pad.x + pad.width / 2,  // Center the mine in the pad
        pad.y + pad.height / 2,
        pad.id,
        pad.width,
        pad.height
      );
      
      // Setup click handler
      mine.on('pointerdown', () => {
        this.handleMineClick(mine);
      });
      
      this.mines.push(mine);
    }
    
    console.log(`GoldMineManager: Initialized ${this.mines.length} mine slots`);
  }

  /**
   * Handle click on a mine
   */
  private handleMineClick(mine: GoldMine): void {
    this.selectedMine = mine;
    // Emit event for UI manager to show menu
    this.scene.events.emit('mine-clicked', mine);
  }

  /**
   * Build a mine at the specified slot
   */
  buildMine(slotId: number): boolean {
    const mine = this.getMineBySlotId(slotId);
    if (!mine || mine.isBuilt()) {
      return false;
    }
    
    const cost = MINE_CONFIGS[1].buildCost;
    const playerGold = this.getPlayerGold?.() || 0;
    
    if (playerGold < cost) {
      console.log('GoldMineManager: Not enough gold to build mine');
      return false;
    }
    
    if (mine.build()) {
      this.onMineBuild?.(mine, cost);
      console.log(`GoldMineManager: Built mine at slot ${slotId}, cost: ${cost}g`);
      return true;
    }
    
    return false;
  }

  /**
   * Upgrade an existing mine
   */
  upgradeMine(mine: GoldMine): boolean {
    if (!mine.canUpgrade()) {
      return false;
    }
    
    const cost = mine.getUpgradeCost();
    const playerGold = this.getPlayerGold?.() || 0;
    
    if (playerGold < cost) {
      console.log('GoldMineManager: Not enough gold to upgrade mine');
      return false;
    }
    
    const previousLevel = mine.getLevel();
    if (mine.upgrade()) {
      this.onMineUpgraded?.(mine, cost);
      console.log(`GoldMineManager: Upgraded mine from level ${previousLevel} to ${mine.getLevel()}, cost: ${cost}g`);
      return true;
    }
    
    return false;
  }

  /**
   * Get total income from all active mines
   */
  getTotalIncome(): number {
    return this.mines.reduce((total, mine) => total + mine.getIncomePerWave(), 0);
  }

  /**
   * Collect income with animation from all mines
   * Returns a promise that resolves with total income when all animations complete
   */
  async collectIncomeWithAnimation(): Promise<number> {
    const activeMinse = this.mines.filter(m => m.isBuilt());
    
    if (activeMinse.length === 0) {
      return 0;
    }
    
    let totalIncome = 0;
    
    // Stagger animations for each mine
    for (let i = 0; i < activeMinse.length; i++) {
      const mine = activeMinse[i];
      totalIncome += mine.getIncomePerWave();
      
      // Delay each mine's animation slightly
      await new Promise<void>(resolve => {
        this.scene.time.delayedCall(i * 200, () => {
          mine.playIncomeAnimation().then(resolve);
        });
      });
    }
    
    return totalIncome;
  }

  /**
   * Get mine at a specific position (for click detection)
   */
  getMineAtPosition(x: number, y: number): GoldMine | null {
    for (const mine of this.mines) {
      // Use simple distance check from mine center
      const dx = Math.abs(x - mine.x);
      const dy = Math.abs(y - mine.y);
      // Check if within mine's width/height (using half-size for center-based check)
      if (dx < 40 && dy < 40) {
        return mine;
      }
    }
    return null;
  }

  /**
   * Get empty slot at position (for build menu)
   */
  getEmptySlotAtPosition(x: number, y: number): GoldMine | null {
    const mine = this.getMineAtPosition(x, y);
    if (mine && !mine.isBuilt()) {
      return mine;
    }
    return null;
  }

  /**
   * Get mine by slot ID
   */
  getMineBySlotId(slotId: number): GoldMine | null {
    return this.mines.find(m => m.getSlotId() === slotId) || null;
  }

  /**
   * Get all mines
   */
  getAllMines(): GoldMine[] {
    return this.mines;
  }

  /**
   * Get all built mines
   */
  getActiveMines(): GoldMine[] {
    return this.mines.filter(m => m.isBuilt());
  }

  /**
   * Get currently selected mine
   */
  getSelectedMine(): GoldMine | null {
    return this.selectedMine;
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedMine = null;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    for (const mine of this.mines) {
      mine.destroy();
    }
    this.mines = [];
  }
}
