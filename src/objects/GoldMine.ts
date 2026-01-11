import Phaser from 'phaser';
import { GoldMineGraphics } from '../graphics/GoldMineGraphics';
import { MINE_CONFIGS } from '../data/GameData';
import type { MineConfig } from '../data/GameData';

/**
 * Gold Mine game object.
 * Represents a mine slot that can be built and upgraded to generate income per wave.
 * Mines cannot be sold once built.
 */
export class GoldMine extends Phaser.GameObjects.Container {
  private slotId: number;
  private mineLevel: 0 | 1 | 2 | 3 = 0;
  private totalInvested: number = 0;
  private mineWidth: number;
  private mineHeight: number;
  
  private graphics: Phaser.GameObjects.Graphics;
  private shimmerTween: Phaser.Tweens.Tween | null = null;
  private idleTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    slotId: number,
    width: number = 60,
    height: number = 60
  ) {
    super(scene, x, y);
    
    this.slotId = slotId;
    this.mineWidth = width;
    this.mineHeight = height;
    
    // Create graphics
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    
    // Draw initial empty state
    this.drawMine();
    
    // Setup interactivity - use default cursor (not hand)
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: false });
    
    scene.add.existing(this);
    this.setDepth(15 + Math.floor(y / 10));
    
    // Start shimmer animation for empty slot
    this.startShimmer();
  }

  /**
   * Build the mine (set to level 1)
   */
  build(): boolean {
    if (this.mineLevel !== 0) {
      return false;
    }
    
    const cost = MINE_CONFIGS[1].buildCost;
    this.mineLevel = 1;
    this.totalInvested = cost;
    
    this.stopShimmer();
    this.drawMine();
    this.startIdleAnimation();
    this.playBuildAnimation();
    
    return true;
  }

  /**
   * Upgrade the mine to the next level
   */
  upgrade(): boolean {
    if (this.mineLevel === 0 || this.mineLevel >= 3) {
      return false;
    }
    
    const nextLevel = (this.mineLevel + 1) as 1 | 2 | 3;
    const cost = MINE_CONFIGS[nextLevel].buildCost;
    
    this.mineLevel = nextLevel;
    this.totalInvested += cost;
    
    this.drawMine();
    this.playUpgradeAnimation();
    
    return true;
  }

  /**
   * Get income per wave at current level
   */
  getIncomePerWave(): number {
    return MINE_CONFIGS[this.mineLevel].incomePerWave;
  }

  /**
   * Get current mine config
   */
  getConfig(): MineConfig {
    return MINE_CONFIGS[this.mineLevel];
  }

  /**
   * Check if mine is built
   */
  isBuilt(): boolean {
    return this.mineLevel > 0;
  }

  /**
   * Check if mine can be upgraded
   */
  canUpgrade(): boolean {
    return this.mineLevel > 0 && this.mineLevel < 3;
  }

  /**
   * Get current level
   */
  getLevel(): 0 | 1 | 2 | 3 {
    return this.mineLevel;
  }

  /**
   * Get slot ID
   */
  getSlotId(): number {
    return this.slotId;
  }

  /**
   * Get total gold invested
   */
  getTotalInvested(): number {
    return this.totalInvested;
  }

  /**
   * Get upgrade cost (cost to reach next level)
   */
  getUpgradeCost(): number {
    if (this.mineLevel >= 3) return 0;
    const nextLevel = (this.mineLevel + 1) as 1 | 2 | 3;
    return MINE_CONFIGS[nextLevel].buildCost;
  }

  /**
   * Play income collection animation
   * Shows coin burst and floating +Xg text
   */
  playIncomeAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const income = this.getIncomePerWave();
      if (income === 0) {
        resolve();
        return;
      }
      
      // Create floating text
      const text = this.scene.add.text(this.x, this.y - 20, `+${income}g`, {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(300);
      
      // Animate text rising and fading
      this.scene.tweens.add({
        targets: text,
        y: this.y - 60,
        alpha: 0,
        duration: 1200,
        ease: 'Cubic.Out',
        onComplete: () => {
          text.destroy();
          resolve();
        }
      });
      
      // Create coin burst particles
      this.createCoinBurst();
      
      // Scale pop effect on mine
      this.scene.tweens.add({
        targets: this.graphics,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 100,
        yoyo: true,
        ease: 'Quad.Out'
      });
    });
  }

  /**
   * Create coin burst effect
   */
  private createCoinBurst(): void {
    const coinCount = Math.min(3 + this.mineLevel, 5);
    
    for (let i = 0; i < coinCount; i++) {
      const coin = this.scene.add.graphics();
      coin.fillStyle(0xffd700, 1);
      coin.fillCircle(0, 0, 4);
      coin.lineStyle(1, 0xdaa520, 1);
      coin.strokeCircle(0, 0, 4);
      coin.setPosition(this.x, this.y);
      coin.setDepth(295);
      
      // Random burst direction
      const angle = (Math.PI * 2 * i) / coinCount - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 20;
      const targetX = this.x + Math.cos(angle) * distance;
      const targetY = this.y + Math.sin(angle) * distance - 20;
      
      // Animate coin
      this.scene.tweens.add({
        targets: coin,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 600 + Math.random() * 200,
        ease: 'Quad.Out',
        onComplete: () => coin.destroy()
      });
    }
  }

  /**
   * Play build animation
   */
  private playBuildAnimation(): void {
    // Scale up from nothing
    this.graphics.setScale(0);
    this.scene.tweens.add({
      targets: this.graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.Out'
    });
    
    // Dust cloud effect
    this.createDustCloud();
  }

  /**
   * Play upgrade animation
   */
  private playUpgradeAnimation(): void {
    // Flash and scale effect
    this.scene.tweens.add({
      targets: this.graphics,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Quad.Out'
    });
    
    // Golden sparkle burst
    this.createSparkles();
  }

  /**
   * Create dust cloud effect for building
   */
  private createDustCloud(): void {
    for (let i = 0; i < 6; i++) {
      const dust = this.scene.add.graphics();
      dust.fillStyle(0x8b7355, 0.6);
      dust.fillCircle(0, 0, 6 + Math.random() * 4);
      dust.setPosition(
        this.x + (Math.random() - 0.5) * 40,
        this.y + Math.random() * 20
      );
      dust.setDepth(14);
      
      this.scene.tweens.add({
        targets: dust,
        y: dust.y - 30,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500 + Math.random() * 200,
        ease: 'Quad.Out',
        onComplete: () => dust.destroy()
      });
    }
  }

  /**
   * Create sparkle effect for upgrades
   */
  private createSparkles(): void {
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(0xffd700, 1);
      // Draw a simple diamond/star shape
      sparkle.fillTriangle(-3, 0, 0, -4, 3, 0);
      sparkle.fillTriangle(-3, 0, 0, 4, 3, 0);
      sparkle.setPosition(
        this.x + (Math.random() - 0.5) * 50,
        this.y + (Math.random() - 0.5) * 50
      );
      sparkle.setDepth(296);
      
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Quad.Out',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  /**
   * Draw the mine at current level
   */
  private drawMine(): void {
    GoldMineGraphics.drawMine(this.graphics, this.mineLevel, this.mineWidth, this.mineHeight);
  }

  /**
   * Start shimmer animation for empty slots
   */
  private startShimmer(): void {
    if (this.mineLevel === 0 && !this.shimmerTween) {
      this.shimmerTween = GoldMineGraphics.createShimmerTween(this.scene, this.graphics);
    }
  }

  /**
   * Stop shimmer animation
   */
  private stopShimmer(): void {
    if (this.shimmerTween) {
      this.shimmerTween.stop();
      this.shimmerTween = null;
      this.graphics.setAlpha(1);
    }
  }

  /**
   * Start idle animation for active mines
   */
  private startIdleAnimation(): void {
    if (this.mineLevel > 0 && !this.idleTween) {
      this.idleTween = GoldMineGraphics.createIdleTween(this.scene, this.graphics);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopShimmer();
    if (this.idleTween) {
      this.idleTween.stop();
      this.idleTween = null;
    }
    super.destroy();
  }
}
