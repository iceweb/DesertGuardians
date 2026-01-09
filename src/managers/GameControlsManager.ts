import Phaser from 'phaser';

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
   * Create game speed toggle button
   */
  private createSpeedButton(width: number, height: number): void {
    const btnX = width - 160;
    const btnY = height - 25;
    
    this.speedButtonBg = this.scene.add.graphics();
    this.speedButtonBg.setDepth(100);
    
    const drawSpeedButton = (hover: boolean) => {
      this.speedButtonBg.clear();
      this.speedButtonBg.fillStyle(hover ? 0x6b4d30 : 0x4a3520, 1);
      this.speedButtonBg.fillRoundedRect(btnX - 45, btnY - 18, 90, 36, 6);
      this.speedButtonBg.lineStyle(2, this.gameSpeed === 2 ? 0xffd700 : 0x8b6914, 1);
      this.speedButtonBg.strokeRoundedRect(btnX - 45, btnY - 18, 90, 36, 6);
    };
    
    drawSpeedButton(false);
    
    this.speedButton = this.scene.add.text(btnX, btnY, '⏩ 1x', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    
    // Create hit area
    this.speedHitArea = this.scene.add.rectangle(btnX, btnY, 90, 36, 0xffffff, 0);
    this.speedHitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    this.speedHitArea.on('pointerover', () => drawSpeedButton(true));
    this.speedHitArea.on('pointerout', () => drawSpeedButton(false));
    this.speedHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.toggleGameSpeed();
      drawSpeedButton(true);
    });
  }

  /**
   * Toggle game speed between 1x and 2x
   */
  private toggleGameSpeed(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 160;
    const btnY = height - 25;
    
    if (this.gameSpeed === 1) {
      this.gameSpeed = 2;
      this.speedButton.setText('⏩ 2x');
      this.speedButton.setColor('#ffd700');
    } else {
      this.gameSpeed = 1;
      this.speedButton.setText('⏩ 1x');
      this.speedButton.setColor('#ffffff');
    }
    
    // Redraw button to update border color
    this.speedButtonBg.clear();
    this.speedButtonBg.fillStyle(0x4a3520, 1);
    this.speedButtonBg.fillRoundedRect(btnX - 45, btnY - 18, 90, 36, 6);
    this.speedButtonBg.lineStyle(2, this.gameSpeed === 2 ? 0xffd700 : 0x8b6914, 1);
    this.speedButtonBg.strokeRoundedRect(btnX - 45, btnY - 18, 90, 36, 6);
  }

  /**
   * Create pause button
   */
  private createPauseButton(width: number, height: number): void {
    const btnX = width - 60;
    const btnY = height - 25;
    
    this.pauseButtonBg = this.scene.add.graphics();
    this.pauseButtonBg.setDepth(100);
    
    const drawPauseButton = (hover: boolean) => {
      this.pauseButtonBg.clear();
      this.pauseButtonBg.fillStyle(hover ? 0x6b4d30 : 0x4a3520, 1);
      this.pauseButtonBg.fillRoundedRect(btnX - 35, btnY - 18, 70, 36, 6);
      this.pauseButtonBg.lineStyle(2, this.isPaused ? 0x00ff00 : 0x8b6914, 1);
      this.pauseButtonBg.strokeRoundedRect(btnX - 35, btnY - 18, 70, 36, 6);
    };
    
    drawPauseButton(false);
    
    this.pauseButton = this.scene.add.text(btnX, btnY, '⏸', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    
    // Create hit area
    this.pauseHitArea = this.scene.add.rectangle(btnX, btnY, 70, 36, 0xffffff, 0);
    this.pauseHitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    this.pauseHitArea.on('pointerover', () => drawPauseButton(true));
    this.pauseHitArea.on('pointerout', () => drawPauseButton(false));
    this.pauseHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
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
      this.pauseButton.setText('▶');
      this.pauseButton.setColor('#00ff00');
      this.showPauseOverlay();
    } else {
      this.pauseButton.setText('⏸');
      this.pauseButton.setColor('#ffffff');
      this.hidePauseOverlay();
    }
    
    // Redraw button to update border color
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 60;
    const btnY = height - 25;
    
    this.pauseButtonBg.clear();
    this.pauseButtonBg.fillStyle(0x4a3520, 1);
    this.pauseButtonBg.fillRoundedRect(btnX - 35, btnY - 18, 70, 36, 6);
    this.pauseButtonBg.lineStyle(2, this.isPaused ? 0x00ff00 : 0x8b6914, 1);
    this.pauseButtonBg.strokeRoundedRect(btnX - 35, btnY - 18, 70, 36, 6);
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
