import Phaser from 'phaser';
import { GoldMineGraphics } from '../graphics/GoldMineGraphics';
import { MINE_CONFIGS } from '../data/GameData';
import type { MineConfig } from '../data/GameData';

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

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.drawMine();

    this.setSize(width, height);
    this.setInteractive({ useHandCursor: false });

    scene.add.existing(this);
    this.setDepth(15 + Math.floor(y / 10));

    this.startShimmer();
  }

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

  getIncomePerWave(): number {
    return MINE_CONFIGS[this.mineLevel].incomePerWave;
  }

  getConfig(): MineConfig {
    return MINE_CONFIGS[this.mineLevel];
  }

  isBuilt(): boolean {
    return this.mineLevel > 0;
  }

  canUpgrade(): boolean {
    return this.mineLevel > 0 && this.mineLevel < 3;
  }

  getLevel(): 0 | 1 | 2 | 3 {
    return this.mineLevel;
  }

  getSlotId(): number {
    return this.slotId;
  }

  getTotalInvested(): number {
    return this.totalInvested;
  }

  getUpgradeCost(): number {
    if (this.mineLevel >= 3) return 0;
    const nextLevel = (this.mineLevel + 1) as 1 | 2 | 3;
    return MINE_CONFIGS[nextLevel].buildCost;
  }

  playIncomeAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const income = this.getIncomePerWave();
      if (income === 0) {
        resolve();
        return;
      }

      const wagon = this.scene.add.graphics();
      wagon.setDepth(298);

      GoldMineGraphics.drawWagon(wagon, this.mineLevel);

      wagon.setPosition(this.x, this.y + 5);
      wagon.setScale(0.5);
      wagon.setAlpha(0);

      const rails = this.scene.add.graphics();
      rails.setDepth(297);
      rails.lineStyle(3, 0x5a5a5a, 1);
      rails.lineBetween(this.x - 10, this.y + 25, this.x, this.y + 70);
      rails.lineBetween(this.x + 10, this.y + 25, this.x, this.y + 70);
      rails.lineStyle(2, 0x6b4423, 1);
      rails.lineBetween(this.x - 14, this.y + 35, this.x + 14, this.y + 35);
      rails.lineBetween(this.x - 16, this.y + 50, this.x + 16, this.y + 50);
      rails.lineBetween(this.x - 18, this.y + 65, this.x + 18, this.y + 65);
      rails.setAlpha(0);

      this.scene.tweens.add({
        targets: rails,
        alpha: 0.8,
        duration: 200,
        ease: 'Quad.Out'
      });

      this.scene.tweens.add({
        targets: wagon,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Quad.Out',
        onComplete: () => {

          this.scene.tweens.add({
            targets: wagon,
            y: this.y + 55,
            duration: 600,
            ease: 'Quad.Out',
            onComplete: () => {

              this.createWagonGoldBurst(wagon.x, wagon.y);

              const text = this.scene.add.text(wagon.x, wagon.y - 25, `+${income}g`, {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#ffd700',
                stroke: '#000000',
                strokeThickness: 4
              }).setOrigin(0.5).setDepth(301);

              this.scene.tweens.add({
                targets: text,
                y: wagon.y - 80,
                alpha: 0,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 1200,
                ease: 'Cubic.Out',
                onComplete: () => {
                  text.destroy();
                }
              });

              this.scene.time.delayedCall(400, () => {
                this.scene.tweens.add({
                  targets: wagon,
                  y: this.y + 5,
                  scaleX: 0.5,
                  scaleY: 0.5,
                  alpha: 0,
                  duration: 400,
                  ease: 'Quad.In',
                  onComplete: () => {
                    wagon.destroy();
                  }
                });

                this.scene.tweens.add({
                  targets: rails,
                  alpha: 0,
                  duration: 300,
                  delay: 200,
                  ease: 'Quad.In',
                  onComplete: () => {
                    rails.destroy();
                    resolve();
                  }
                });
              });

              this.scene.tweens.add({
                targets: this.graphics,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                yoyo: true,
                ease: 'Quad.Out'
              });
            }
          });
        }
      });
    });
  }

  private createWagonGoldBurst(x: number, y: number): void {
    const coinCount = 5 + this.mineLevel * 3;

    for (let i = 0; i < coinCount; i++) {
      const coin = this.scene.add.graphics();

      coin.fillStyle(0xffd700, 1);
      coin.fillCircle(0, 0, 5);
      coin.lineStyle(1.5, 0xdaa520, 1);
      coin.strokeCircle(0, 0, 5);
      coin.fillStyle(0xffec8b, 1);
      coin.fillCircle(-1, -1, 2);

      coin.setPosition(x + (Math.random() - 0.5) * 20, y);
      coin.setDepth(300);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const distance = 40 + Math.random() * 40;
      const targetX = x + Math.cos(angle) * distance;
      const peakY = y - 50 - Math.random() * 30;
      const targetY = y - 20 + Math.random() * 10;

      this.scene.tweens.add({
        targets: coin,
        x: targetX,
        duration: 600 + Math.random() * 200,
        ease: 'Quad.Out'
      });

      this.scene.tweens.add({
        targets: coin,
        y: peakY,
        duration: 300 + Math.random() * 100,
        ease: 'Quad.Out',
        onComplete: () => {
          this.scene.tweens.add({
            targets: coin,
            y: targetY + 40,
            alpha: 0,
            duration: 400,
            ease: 'Quad.In',
            onComplete: () => coin.destroy()
          });
        }
      });

      this.scene.tweens.add({
        targets: coin,
        scaleX: { from: 1, to: -1 },
        duration: 150,
        yoyo: true,
        repeat: 3,
        ease: 'Linear'
      });
    }

    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const sparkle = this.scene.add.graphics();
        sparkle.fillStyle(0xffff88, 1);

        sparkle.fillTriangle(-3, 0, 0, -5, 3, 0);
        sparkle.fillTriangle(-3, 0, 0, 5, 3, 0);
        sparkle.fillTriangle(0, -3, -5, 0, 0, 3);
        sparkle.fillTriangle(0, -3, 5, 0, 0, 3);
        sparkle.setPosition(
          x + (Math.random() - 0.5) * 40,
          y - Math.random() * 30
        );
        sparkle.setDepth(299);
        sparkle.setScale(0.5 + Math.random() * 0.5);

        this.scene.tweens.add({
          targets: sparkle,
          y: sparkle.y - 20,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 400,
          ease: 'Quad.Out',
          onComplete: () => sparkle.destroy()
        });
      });
    }
  }

  private playBuildAnimation(): void {

    this.graphics.setScale(0);
    this.scene.tweens.add({
      targets: this.graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.Out'
    });

    this.createDustCloud();
  }

  private playUpgradeAnimation(): void {

    this.scene.tweens.add({
      targets: this.graphics,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Quad.Out'
    });

    this.createSparkles();
  }

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

  private createSparkles(): void {
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(0xffd700, 1);

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

  private drawMine(): void {
    GoldMineGraphics.drawMine(this.graphics, this.mineLevel, this.mineWidth, this.mineHeight);
  }

  private startShimmer(): void {
    if (this.mineLevel === 0 && !this.shimmerTween) {
      this.shimmerTween = GoldMineGraphics.createShimmerTween(this.scene, this.graphics);
    }
  }

  private stopShimmer(): void {
    if (this.shimmerTween) {
      this.shimmerTween.stop();
      this.shimmerTween = null;
      this.graphics.setAlpha(1);
    }
  }

  private startIdleAnimation(): void {
    if (this.mineLevel > 0 && !this.idleTween) {
      this.idleTween = GoldMineGraphics.createIdleTween(this.scene, this.graphics);
    }
  }

  destroy(): void {
    this.stopShimmer();
    if (this.idleTween) {
      this.idleTween.stop();
      this.idleTween = null;
    }
    super.destroy();
  }
}
