import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

/**
 * GameControlsManager handles game speed and pause controls.
 * Extracted from HUDManager to reduce file size.
 */
export class GameControlsManager {
  private scene: Phaser.Scene;
  
  // Speed control
  private gameSpeed: number = 1;
  private speedButton!: Phaser.GameObjects.Text;
  private speedButtonBg!: Phaser.GameObjects.Graphics;
  private speedHitArea!: Phaser.GameObjects.Rectangle;
  
  // Pause control
  private isPaused: boolean = false;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseButtonBg!: Phaser.GameObjects.Graphics;
  private pauseHitArea!: Phaser.GameObjects.Rectangle;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create game control buttons
   */
  create(width: number, height: number): void {
    this.createSpeedButton(width, height);
    this.createPauseButton(width, height);
  }

  /**
   * Create game speed toggle button - Desert themed
   */
  private createSpeedButton(width: number, height: number): void {
    const btnX = width - 170;
    const btnY = height - 30;
    
    this.speedButtonBg = this.scene.add.graphics();
    this.speedButtonBg.setDepth(100);
    
    const drawSpeedButton = (hover: boolean) => {
      this.speedButtonBg.clear();
      
      // Shadow
      this.speedButtonBg.fillStyle(0x1a0a00, 0.6);
      this.speedButtonBg.fillRoundedRect(btnX - 40 + 2, btnY - 16 + 2, 80, 32, 6);
      
      // Stone tablet base
      this.speedButtonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      this.speedButtonBg.fillRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);
      
      // Inner fill with speed-based color
      const innerColor = this.gameSpeed === 3 ? 0xcc5500 : this.gameSpeed === 2 ? 0xc49564 : 0xa07840;
      this.speedButtonBg.fillStyle(hover ? innerColor : innerColor, 1);
      this.speedButtonBg.fillRoundedRect(btnX - 38, btnY - 14, 76, 28, 5);
      
      // Border with speed-based glow
      const borderColor = this.gameSpeed === 3 ? 0xff6600 : this.gameSpeed === 2 ? 0xffd700 : 0xd4a574;
      this.speedButtonBg.lineStyle(2, borderColor, 1);
      this.speedButtonBg.strokeRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);
      
      // Speed indicator pips
      this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 1 ? 1 : 0.3);
      this.speedButtonBg.fillCircle(btnX - 25, btnY, 4);
      this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 2 ? 1 : 0.3);
      this.speedButtonBg.fillCircle(btnX - 12, btnY, 4);
      this.speedButtonBg.fillStyle(0xff6600, this.gameSpeed >= 3 ? 1 : 0.3);
      this.speedButtonBg.fillCircle(btnX + 1, btnY, 4);
    };
    
    drawSpeedButton(false);
    
    this.speedButton = this.scene.add.text(btnX + 25, btnY, '1×', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '16px',
      color: '#fff8dc',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    
    // Create hit area
    this.speedHitArea = this.scene.add.rectangle(btnX, btnY, 80, 32, 0xffffff, 0);
    this.speedHitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    this.speedHitArea.on('pointerover', () => drawSpeedButton(true));
    this.speedHitArea.on('pointerout', () => drawSpeedButton(false));
    this.speedHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      AudioManager.getInstance().playSFX('ui_click');
      this.toggleGameSpeed();
      drawSpeedButton(true);
    });
  }

  /**
   * Toggle game speed between 1x, 2x, and 3x
   */
  private toggleGameSpeed(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 170;
    const btnY = height - 30;
    
    // Cycle through 1 → 2 → 3 → 1
    if (this.gameSpeed === 1) {
      this.gameSpeed = 2;
      this.speedButton.setText('2×');
      this.speedButton.setColor('#ffd700');
    } else if (this.gameSpeed === 2) {
      this.gameSpeed = 3;
      this.speedButton.setText('3×');
      this.speedButton.setColor('#ff6600');
    } else {
      this.gameSpeed = 1;
      this.speedButton.setText('1×');
      this.speedButton.setColor('#fff8dc');
    }
    
    // Redraw button with new styling
    this.speedButtonBg.clear();
    
    // Shadow
    this.speedButtonBg.fillStyle(0x1a0a00, 0.6);
    this.speedButtonBg.fillRoundedRect(btnX - 40 + 2, btnY - 16 + 2, 80, 32, 6);
    
    // Stone tablet base
    this.speedButtonBg.fillStyle(0x6b4914, 1);
    this.speedButtonBg.fillRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);
    
    // Inner fill with speed-based color
    const innerColor = this.gameSpeed === 3 ? 0xcc5500 : this.gameSpeed === 2 ? 0xc49564 : 0xa07840;
    this.speedButtonBg.fillStyle(innerColor, 1);
    this.speedButtonBg.fillRoundedRect(btnX - 38, btnY - 14, 76, 28, 5);
    
    // Border with speed-based glow
    const borderColor = this.gameSpeed === 3 ? 0xff6600 : this.gameSpeed === 2 ? 0xffd700 : 0xd4a574;
    this.speedButtonBg.lineStyle(2, borderColor, 1);
    this.speedButtonBg.strokeRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);
    
    // Speed indicator pips
    this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 1 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX - 25, btnY, 4);
    this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 2 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX - 12, btnY, 4);
    this.speedButtonBg.fillStyle(0xff6600, this.gameSpeed >= 3 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX + 1, btnY, 4);
  }

  /**
   * Create pause button - Desert themed
   */
  private createPauseButton(width: number, height: number): void {
    const btnX = width - 70;
    const btnY = height - 30;
    
    this.pauseButtonBg = this.scene.add.graphics();
    this.pauseButtonBg.setDepth(100);
    
    const drawPauseButton = (hover: boolean) => {
      this.pauseButtonBg.clear();
      
      // Shadow
      this.pauseButtonBg.fillStyle(0x1a0a00, 0.6);
      this.pauseButtonBg.fillRoundedRect(btnX - 28 + 2, btnY - 16 + 2, 56, 32, 6);
      
      // Stone tablet base
      this.pauseButtonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      this.pauseButtonBg.fillRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);
      
      // Inner fill - green tint when paused
      const innerColor = this.isPaused ? 0x2a6a2a : (hover ? 0xc49564 : 0xa07840);
      this.pauseButtonBg.fillStyle(innerColor, 1);
      this.pauseButtonBg.fillRoundedRect(btnX - 26, btnY - 14, 52, 28, 5);
      
      // Border with state-based color
      const borderColor = this.isPaused ? 0x44ff44 : 0xd4a574;
      this.pauseButtonBg.lineStyle(2, borderColor, 1);
      this.pauseButtonBg.strokeRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);
      
      // Pause/Play icon drawn as graphics
      if (this.isPaused) {
        // Play triangle
        this.pauseButtonBg.fillStyle(0x44ff44, 1);
        this.pauseButtonBg.beginPath();
        this.pauseButtonBg.moveTo(btnX - 8, btnY - 8);
        this.pauseButtonBg.lineTo(btnX + 10, btnY);
        this.pauseButtonBg.lineTo(btnX - 8, btnY + 8);
        this.pauseButtonBg.closePath();
        this.pauseButtonBg.fillPath();
      } else {
        // Pause bars
        this.pauseButtonBg.fillStyle(0xffd700, 1);
        this.pauseButtonBg.fillRect(btnX - 8, btnY - 8, 6, 16);
        this.pauseButtonBg.fillRect(btnX + 2, btnY - 8, 6, 16);
      }
    };
    
    drawPauseButton(false);
    
    // Create invisible text just for reference
    this.pauseButton = this.scene.add.text(btnX, btnY, '', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '16px',
      color: '#fff8dc'
    }).setOrigin(0.5).setDepth(101);
    
    // Create hit area
    this.pauseHitArea = this.scene.add.rectangle(btnX, btnY, 56, 32, 0xffffff, 0);
    this.pauseHitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    this.pauseHitArea.on('pointerover', () => drawPauseButton(true));
    this.pauseHitArea.on('pointerout', () => drawPauseButton(false));
    this.pauseHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      AudioManager.getInstance().playSFX('ui_click');
      this.togglePause();
      drawPauseButton(true);
    });
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.showPauseOverlay();
    } else {
      this.hidePauseOverlay();
    }
    
    // Redraw button with new styling
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 70;
    const btnY = height - 30;
    
    this.pauseButtonBg.clear();
    
    // Shadow
    this.pauseButtonBg.fillStyle(0x1a0a00, 0.6);
    this.pauseButtonBg.fillRoundedRect(btnX - 28 + 2, btnY - 16 + 2, 56, 32, 6);
    
    // Stone tablet base
    this.pauseButtonBg.fillStyle(0x6b4914, 1);
    this.pauseButtonBg.fillRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);
    
    // Inner fill - green tint when paused
    const innerColor = this.isPaused ? 0x2a6a2a : 0xa07840;
    this.pauseButtonBg.fillStyle(innerColor, 1);
    this.pauseButtonBg.fillRoundedRect(btnX - 26, btnY - 14, 52, 28, 5);
    
    // Border with state-based color
    const borderColor = this.isPaused ? 0x44ff44 : 0xd4a574;
    this.pauseButtonBg.lineStyle(2, borderColor, 1);
    this.pauseButtonBg.strokeRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);
    
    // Pause/Play icon drawn as graphics
    if (this.isPaused) {
      // Play triangle
      this.pauseButtonBg.fillStyle(0x44ff44, 1);
      this.pauseButtonBg.beginPath();
      this.pauseButtonBg.moveTo(btnX - 8, btnY - 8);
      this.pauseButtonBg.lineTo(btnX + 10, btnY);
      this.pauseButtonBg.lineTo(btnX - 8, btnY + 8);
      this.pauseButtonBg.closePath();
      this.pauseButtonBg.fillPath();
    } else {
      // Pause bars
      this.pauseButtonBg.fillStyle(0xffd700, 1);
      this.pauseButtonBg.fillRect(btnX - 8, btnY - 8, 6, 16);
      this.pauseButtonBg.fillRect(btnX + 2, btnY - 8, 6, 16);
    }
  }

  /**
   * Show pause overlay
   */
  private showPauseOverlay(): void {
    if (this.pauseOverlay) return;
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    this.pauseOverlay = this.scene.add.container(width / 2, height / 2);
    this.pauseOverlay.setDepth(150);
    
    // Semi-transparent background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(-width / 2, -height / 2, width, height);
    this.pauseOverlay.add(bg);
    
    // Pause text
    const pauseText = this.scene.add.text(0, 0, '⏸ PAUSED', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.pauseOverlay.add(pauseText);
    
    const hint = this.scene.add.text(0, 50, 'Click ▶ to resume', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.pauseOverlay.add(hint);
  }

  /**
   * Hide pause overlay
   */
  private hidePauseOverlay(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
  }

  /**
   * Check if game is paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Get current game speed
   */
  getGameSpeed(): number {
    return this.gameSpeed;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.hidePauseOverlay();
    this.speedButtonBg?.destroy();
    this.speedButton?.destroy();
    this.speedHitArea?.destroy();
    this.pauseButtonBg?.destroy();
    this.pauseButton?.destroy();
    this.pauseHitArea?.destroy();
  }
}
