import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameConfig';

/**
 * GameOverlayManager handles victory/defeat screens and wave bonus animations.
 * Extracted from HUDManager to reduce file size.
 */
export class GameOverlayManager {
  private scene: Phaser.Scene;
  
  // Callback for menu navigation
  public onMenuClicked?: () => void;
  
  // Reference to gold text for coin animation
  private goldTextRef: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set reference to gold text for coin animation
   */
  setGoldTextRef(goldText: Phaser.GameObjects.Text): void {
    this.goldTextRef = goldText;
  }

  /**
   * Show wave completion gold bonus with flying coin animation
   */
  showWaveBonus(waveNumber: number, bonusGold: number, onComplete: () => void): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Create bonus text in center of screen
    const bonusText = this.scene.add.text(width / 2, height / 2 - 50, `Wave ${waveNumber} Complete!`, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(250).setAlpha(0);
    
    const goldText = this.scene.add.text(width / 2, height / 2, `+${bonusGold}g Bonus!`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(250).setAlpha(0);
    
    // Fade in text
    this.scene.tweens.add({
      targets: [bonusText, goldText],
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
    
    // Create flying coins
    const coinCount = Math.min(8, Math.max(3, Math.floor(bonusGold / 10)));
    const coins: Phaser.GameObjects.Text[] = [];
    
    for (let i = 0; i < coinCount; i++) {
      const coin = this.scene.add.text(
        width / 2 + Phaser.Math.Between(-50, 50),
        height / 2 + 30 + Phaser.Math.Between(-20, 20),
        '💰',
        { fontSize: '24px' }
      ).setOrigin(0.5).setDepth(251).setAlpha(0);
      coins.push(coin);
    }
    
    // After short delay, animate coins flying to gold counter
    this.scene.time.delayedCall(600, () => {
      coins.forEach((coin, index) => {
        this.scene.tweens.add({
          targets: coin,
          alpha: 1,
          duration: 100,
          delay: index * 50
        });
        
        this.scene.tweens.add({
          targets: coin,
          x: 60,
          y: 32,
          duration: 600 + index * 80,
          delay: 100 + index * 50,
          ease: 'Power2.easeIn',
          onComplete: () => {
            coin.destroy();
            // Flash gold text if reference exists
            if (this.goldTextRef) {
              this.goldTextRef.setScale(1.2);
              this.scene.tweens.add({
                targets: this.goldTextRef,
                scale: 1,
                duration: 150,
                ease: 'Power2'
              });
            }
          }
        });
      });
      
      // Fade out bonus text
      this.scene.tweens.add({
        targets: [bonusText, goldText],
        alpha: 0,
        y: '-=30',
        duration: 500,
        delay: 800,
        ease: 'Power2',
        onComplete: () => {
          bonusText.destroy();
          goldText.destroy();
          onComplete();
        }
      });
    });
  }

  /**
   * Show victory screen
   */
  showVictory(gold: number, castleHP: number): void {
    const scene = this.scene;
    
    scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000, 0.7
    ).setDepth(300);

    scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY - 50, '🏆 VICTORY! 🏆', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(301);

    scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 30, `Castle HP: ${castleHP}/${GAME_CONFIG.MAX_CASTLE_HP} | Gold: ${gold}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    const menuBtn = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 100, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.onMenuClicked?.();
    });
  }

  /**
   * Show defeat screen
   */
  showDefeat(currentWave: number, totalWaves: number, creepsKilled: number): void {
    const scene = this.scene;
    
    scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000, 0.7
    ).setDepth(300);

    scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY - 50, '💀 DEFEAT 💀', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(301);

    scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 30, 
      `Wave: ${currentWave}/${totalWaves} | Creeps Killed: ${creepsKilled}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    const menuBtn = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 100, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.onMenuClicked?.();
    });
  }

  /**
   * Show floating text (gold gain, damage, etc.)
   */
  showFloatingText(text: string, x: number, y: number, color: number): void {
    const floatText = this.scene.add.text(x, y, text, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(200);

    this.scene.tweens.add({
      targets: floatText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatText.destroy()
    });
  }
}
