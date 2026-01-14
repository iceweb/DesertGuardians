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

export class GoldMineManager {
  private scene: Phaser.Scene;
  private mines: GoldMine[] = [];
  private selectedMine: GoldMine | null = null;

  private tutorialArrow: Phaser.GameObjects.Container | null = null;
  private tutorialArrowTween: Phaser.Tweens.Tween | null = null;

  public onMineBuild?: (mine: GoldMine, cost: number) => void;
  public onMineUpgraded?: (mine: GoldMine, cost: number) => void;
  public getPlayerGold?: () => number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initializeFromPads(minePads: MinePadData[]): void {

    const sortedPads = [...minePads].sort((a, b) => a.x - b.x);

    for (let i = 0; i < sortedPads.length; i++) {
      const pad = sortedPads[i];
      const mine = new GoldMine(
        this.scene,
        pad.x + pad.width / 2,
        pad.y + pad.height / 2,
        i + 1,
        pad.width,
        pad.height
      );

      mine.on('pointerdown', () => {
        this.handleMineClick(mine);
      });

      this.mines.push(mine);
    }

    console.log(`GoldMineManager: Initialized ${this.mines.length} mine slots`);

    this.createTutorialArrow();
  }

  private createTutorialArrow(): void {
    if (this.mines.length === 0) return;

    const firstMine = this.mines[0];
    const arrowX = firstMine.x;
    const arrowY = firstMine.y - 60;

    this.tutorialArrow = this.scene.add.container(arrowX, arrowY);
    this.tutorialArrow.setDepth(100);

    const arrow = this.scene.add.graphics();

    arrow.fillStyle(0x000000, 0.3);
    arrow.fillTriangle(-12, -22, 12, -22, 0, 2);

    arrow.fillStyle(0xD4A84B, 1);
    arrow.fillTriangle(-10, -25, 10, -25, 0, 0);

    arrow.fillStyle(0xF5D980, 1);
    arrow.fillTriangle(-6, -23, 4, -23, 0, -8);

    arrow.lineStyle(2, 0x8B6914, 1);
    arrow.strokeTriangle(-10, -25, 10, -25, 0, 0);

    this.tutorialArrow.add(arrow);

    const text = this.scene.add.text(0, -45, '💰 Gold Mine', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tutorialArrow.add(text);

    this.tutorialArrowTween = this.scene.tweens.add({
      targets: this.tutorialArrow,
      y: arrowY - 15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private hideTutorialArrow(): void {
    if (this.tutorialArrow) {
      if (this.tutorialArrowTween) {
        this.tutorialArrowTween.stop();
        this.tutorialArrowTween = null;
      }

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

  private handleMineClick(mine: GoldMine): void {
    this.selectedMine = mine;

    this.scene.events.emit('mine-clicked', mine);
  }

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

      this.hideTutorialArrow();

      return true;
    }

    return false;
  }

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

  getTotalIncome(): number {
    return this.mines.reduce((total, mine) => total + mine.getIncomePerWave(), 0);
  }

  async collectIncomeWithAnimation(onMineCollected?: (income: number) => void): Promise<number> {
    const activeMines = this.mines.filter(m => m.isBuilt());

    if (activeMines.length === 0) {
      return 0;
    }

    let totalIncome = 0;

    for (const mine of activeMines) {
      totalIncome += mine.getIncomePerWave();
    }

    for (let i = 0; i < activeMines.length; i++) {
      const mine = activeMines[i];
      const mineIncome = mine.getIncomePerWave();

      await new Promise<void>(resolve => {
        let resolved = false;
        const safeResolve = () => {
          if (!resolved) {
            resolved = true;

            onMineCollected?.(mineIncome);
            resolve();
          }
        };

        this.scene.time.delayedCall(i * 200, () => {
          mine.playIncomeAnimation().then(safeResolve).catch(safeResolve);
        });

        this.scene.time.delayedCall(i * 200 + 1500, safeResolve);
      });
    }

    return totalIncome;
  }

  getMineAtPosition(x: number, y: number): GoldMine | null {
    for (const mine of this.mines) {

      const dx = Math.abs(x - mine.x);
      const dy = Math.abs(y - mine.y);

      if (dx < 40 && dy < 40) {
        return mine;
      }
    }
    return null;
  }

  getEmptySlotAtPosition(x: number, y: number): GoldMine | null {
    const mine = this.getMineAtPosition(x, y);
    if (mine && !mine.isBuilt()) {
      return mine;
    }
    return null;
  }

  getMineBySlotId(slotId: number): GoldMine | null {
    return this.mines.find(m => m.getSlotId() === slotId) || null;
  }

  getAllMines(): GoldMine[] {
    return this.mines;
  }

  getActiveMines(): GoldMine[] {
    return this.mines.filter(m => m.isBuilt());
  }

  getSelectedMine(): GoldMine | null {
    return this.selectedMine;
  }

  clearSelection(): void {
    this.selectedMine = null;
  }

  destroy(): void {

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
