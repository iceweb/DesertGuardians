import Phaser from 'phaser';
import { GoldMine } from '../objects/GoldMine';
import { MINE_CONFIGS } from '../data/GameData';

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
  
  // Tutorial arrow for first mine
  private tutorialArrow: Phaser.GameObjects.Container | null = null;
  private tutorialArrowTween: Phaser.Tweens.Tween | null = null;
  
  // Callbacks
  public onMineBuild?: (mine: GoldMine, cost: number) => void;
  public onMineUpgraded?: (mine: GoldMine, cost: number) => void;
  public getPlayerGold?: () => number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize mines from minepad data (sorted left to right by x position)
   */
  initializeFromPads(minePads: MinePadData[]): void {
    // Sort pads by x position to ensure left-to-right ordering
    const sortedPads = [...minePads].sort((a, b) => a.x - b.x);
    
    for (let i = 0; i < sortedPads.length; i++) {
      const pad = sortedPads[i];
      const mine = new GoldMine(
        this.scene,
        pad.x + pad.width / 2,  // Center the mine in the pad
        pad.y + pad.height / 2,
        i + 1,  // Assign ID based on sorted order (1, 2, 3 from left to right)
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
    
    // Create tutorial arrow above first mine
    this.createTutorialArrow();
  }

  /**
   * Create a bouncing arrow above the first mine to guide new players
   */
  private createTutorialArrow(): void {
    if (this.mines.length === 0) return;
    
    const firstMine = this.mines[0];
    const arrowX = firstMine.x;
    const arrowY = firstMine.y - 60;
    
    // Create container for arrow
    this.tutorialArrow = this.scene.add.container(arrowX, arrowY);
    this.tutorialArrow.setDepth(100);
    
    // Draw desert-themed arrow (sandy/golden colors)
    const arrow = this.scene.add.graphics();
    
    // Arrow shadow
    arrow.fillStyle(0x000000, 0.3);
    arrow.fillTriangle(-12, -22, 12, -22, 0, 2);
    
    // Arrow body - golden/sand gradient effect
    arrow.fillStyle(0xD4A84B, 1);  // Sandy gold
    arrow.fillTriangle(-10, -25, 10, -25, 0, 0);
    
    // Arrow highlight
    arrow.fillStyle(0xF5D980, 1);  // Light sand
    arrow.fillTriangle(-6, -23, 4, -23, 0, -8);
    
    // Arrow outline
    arrow.lineStyle(2, 0x8B6914, 1);  // Dark sand/brown
    arrow.strokeTriangle(-10, -25, 10, -25, 0, 0);
    
    this.tutorialArrow.add(arrow);
    
    // Add "Click to build!" text
    const text = this.scene.add.text(0, -45, '💰 Gold Mine', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tutorialArrow.add(text);
    
    // Bouncing animation
    this.tutorialArrowTween = this.scene.tweens.add({
      targets: this.tutorialArrow,
      y: arrowY - 15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Hide the tutorial arrow (called when first mine is built)
   */
  private hideTutorialArrow(): void {
    if (this.tutorialArrow) {
      if (this.tutorialArrowTween) {
        this.tutorialArrowTween.stop();
        this.tutorialArrowTween = null;
      }
      
      // Fade out animation
      this.scene.tweens.add({
        targets: this.tutorialArrow,
        alpha: 0,
        y: this.tutorialArrow.y - 30,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.tutorialArrow?.destroy();
          this.tutorialArrow = null;
        }
      });
    }
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
      
      // Hide tutorial arrow when first mine is built
      this.hideTutorialArrow();
      
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
   * @param onMineCollected - Optional callback fired when each mine's animation completes
   */
  async collectIncomeWithAnimation(onMineCollected?: (income: number) => void): Promise<number> {
    const activeMines = this.mines.filter(m => m.isBuilt());
    
    if (activeMines.length === 0) {
      return 0;
    }
    
    let totalIncome = 0;
    
    // Calculate total income first (so we return correct value even if animations fail)
    for (const mine of activeMines) {
      totalIncome += mine.getIncomePerWave();
    }
    
    // Stagger animations for each mine with timeout protection
    for (let i = 0; i < activeMines.length; i++) {
      const mine = activeMines[i];
      const mineIncome = mine.getIncomePerWave();
      
      // Delay each mine's animation slightly, with timeout fallback
      await new Promise<void>(resolve => {
        let resolved = false;
        const safeResolve = () => {
          if (!resolved) {
            resolved = true;
            // Fire callback when this mine's animation completes
            onMineCollected?.(mineIncome);
            resolve();
          }
        };
        
        this.scene.time.delayedCall(i * 200, () => {
          mine.playIncomeAnimation().then(safeResolve).catch(safeResolve);
        });
        
        // Timeout fallback (mobile Safari can stall timers)
        this.scene.time.delayedCall(i * 200 + 1500, safeResolve);
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
    // Clean up tutorial arrow
    if (this.tutorialArrowTween) {
      this.tutorialArrowTween.stop();
      this.tutorialArrowTween = null;
    }
    if (this.tutorialArrow) {
      this.tutorialArrow.destroy();
      this.tutorialArrow = null;
    }
    
    for (const mine of this.mines) {
      mine.destroy();
    }
    this.mines = [];
  }
}
