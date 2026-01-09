import Phaser from 'phaser';

/**
 * HUDManager handles all HUD rendering and state display.
 * Extracted from GameScene to centralize UI logic.
 */
export class HUDManager {
  private scene: Phaser.Scene;
  
  // HUD elements
  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private countdownText!: Phaser.GameObjects.Text;
  private startWaveButton!: Phaser.GameObjects.Text;
  private startWaveButtonBg!: Phaser.GameObjects.Graphics;
  private startWaveHitArea!: Phaser.GameObjects.Rectangle;
  
  // Cached state
  private gold: number = 200;
  private castleHP: number = 10;
  private maxCastleHP: number = 10;
  private currentWave: number = 0;
  private totalWaves: number = 0;
  private castlePosition: Phaser.Math.Vector2 | null = null;
  
  // Game speed and pause
  private gameSpeed: number = 1;
  private speedButton!: Phaser.GameObjects.Text;
  private speedButtonBg!: Phaser.GameObjects.Graphics;
  private isPaused: boolean = false;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseButtonBg!: Phaser.GameObjects.Graphics;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;
  
  // Callbacks
  public onStartWaveClicked?: () => void;
  public onMenuClicked?: () => void;
  
  // Creep info popup
  private creepInfoContainer: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize HUD elements
   */
  create(totalWaves: number): void {
    this.totalWaves = totalWaves;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    this.createHUDBar(width);
    this.createWaveControls(width, height);
    this.createBackButton(height);
    this.createSpeedButton(width, height);
    this.createPauseButton(width, height);
    this.createHPBar();
    this.createCountdownText(width, height);
  }

  /**
   * Create the top HUD bar
   */
  private createHUDBar(width: number): void {
    const hudBg = this.scene.add.graphics();
    hudBg.setDepth(100);
    
    // Dark background
    hudBg.fillStyle(0x1a0a00, 0.85);
    hudBg.fillRect(0, 0, width, 60);
    
    // Decorative bottom border
    hudBg.lineStyle(3, 0xd4a574, 1);
    hudBg.lineBetween(0, 60, width, 60);
    hudBg.lineStyle(1, 0x8b6914, 1);
    hudBg.lineBetween(0, 58, width, 58);
    
    // Corner decorations
    hudBg.fillStyle(0xd4a574, 1);
    hudBg.fillTriangle(0, 60, 30, 60, 0, 30);
    hudBg.fillTriangle(width, 60, width - 30, 60, width, 30);

    // Wave counter (center)
    this.waveText = this.scene.add.text(width / 2, 32, `⚔️ WAVE 0 / ${this.totalWaves}`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101);

    // Gold (left)
    this.goldText = this.scene.add.text(30, 32, `💰 ${this.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(101);

    // Castle HP (right)
    this.hpText = this.scene.add.text(width - 30, 32, `❤️ ${this.castleHP}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0.5).setDepth(101);
  }

  /**
   * Create wave start button
   */
  private createWaveControls(width: number, height: number): void {
    this.startWaveButtonBg = this.scene.add.graphics();
    this.startWaveButtonBg.setDepth(100);
    
    const btnX = width / 2;
    const btnY = height - 70;
    const btnWidth = 220;
    const btnHeight = 55;
    
    const drawButton = (hover: boolean) => {
      this.startWaveButtonBg.clear();
      
      // Outer stone border
      this.startWaveButtonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2 - 4, btnY - btnHeight/2 - 4, btnWidth + 8, btnHeight + 8, 8);
      
      // Inner gradient-like fill
      this.startWaveButtonBg.fillStyle(hover ? 0xd4a574 : 0xc9956c, 1);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 6);
      
      // Top highlight
      this.startWaveButtonBg.fillStyle(hover ? 0xebc99a : 0xdbb88a, 1);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2 + 4, btnY - btnHeight/2 + 4, btnWidth - 8, btnHeight/2 - 4, 4);
      
      // Decorative corner accents
      this.startWaveButtonBg.fillStyle(0x4a3520, 1);
      this.startWaveButtonBg.fillTriangle(btnX - btnWidth/2, btnY - btnHeight/2, btnX - btnWidth/2 + 15, btnY - btnHeight/2, btnX - btnWidth/2, btnY - btnHeight/2 + 15);
      this.startWaveButtonBg.fillTriangle(btnX + btnWidth/2, btnY - btnHeight/2, btnX + btnWidth/2 - 15, btnY - btnHeight/2, btnX + btnWidth/2, btnY - btnHeight/2 + 15);
      this.startWaveButtonBg.fillTriangle(btnX - btnWidth/2, btnY + btnHeight/2, btnX - btnWidth/2 + 15, btnY + btnHeight/2, btnX - btnWidth/2, btnY + btnHeight/2 - 15);
      this.startWaveButtonBg.fillTriangle(btnX + btnWidth/2, btnY + btnHeight/2, btnX + btnWidth/2 - 15, btnY + btnHeight/2, btnX + btnWidth/2, btnY + btnHeight/2 - 15);
    };
    
    drawButton(false);
    
    this.startWaveButton = this.scene.add.text(btnX, btnY, '⚔ Start Wave 1', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#2a1a0a',
      stroke: '#ffd700',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(101);

    // Hit area for the whole button
    this.startWaveHitArea = this.scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0xffffff, 0);
    this.startWaveHitArea.setDepth(102).setInteractive({ useHandCursor: true });

    this.startWaveHitArea.on('pointerover', () => drawButton(true));
    this.startWaveHitArea.on('pointerout', () => drawButton(false));
    this.startWaveHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.onStartWaveClicked?.();
    });
  }

  /**
   * Create back to menu button
   */
  private createBackButton(height: number): void {
    const backButton = this.scene.add.text(25, height - 25, '← Menu', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 14, y: 8 }
    }).setOrigin(0, 0.5).setDepth(101).setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => backButton.setStyle({ backgroundColor: '#6b4d30' }));
    backButton.on('pointerout', () => backButton.setStyle({ backgroundColor: '#4a3520' }));
    backButton.on('pointerdown', () => {
      this.onMenuClicked?.();
    });
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
    const hitArea = this.scene.add.rectangle(btnX, btnY, 90, 36, 0xffffff, 0);
    hitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => drawSpeedButton(true));
    hitArea.on('pointerout', () => drawSpeedButton(false));
    hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.toggleGameSpeed();
      drawSpeedButton(true);
    });
  }

  /**
   * Toggle game speed between 1x and 2x
   */
  private toggleGameSpeed(): void {
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
    this.speedButtonBg.fillRoundedRect(this.scene.cameras.main.width - 160 - 45, this.scene.cameras.main.height - 25 - 18, 90, 36, 6);
    this.speedButtonBg.lineStyle(2, this.gameSpeed === 2 ? 0xffd700 : 0x8b6914, 1);
    this.speedButtonBg.strokeRoundedRect(this.scene.cameras.main.width - 160 - 45, this.scene.cameras.main.height - 25 - 18, 90, 36, 6);
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
    const hitArea = this.scene.add.rectangle(btnX, btnY, 70, 36, 0xffffff, 0);
    hitArea.setDepth(102).setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => drawPauseButton(true));
    hitArea.on('pointerout', () => drawPauseButton(false));
    hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.togglePause();
      drawPauseButton(true);
    });
  }

  /**
   * Toggle pause state
   */
  private togglePause(): void {
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
   * Create HP bar (below castle)
   */
  private createHPBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(20);
  }

  /**
   * Create countdown text
   */
  private createCountdownText(width: number, height: number): void {
    this.countdownText = this.scene.add.text(width / 2, height / 2, '', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(150).setVisible(false);
  }

  /**
   * Set castle position for HP bar
   */
  setCastlePosition(position: Phaser.Math.Vector2 | null): void {
    this.castlePosition = position;
    this.updateHPBar();
  }

  /**
   * Update gold display
   */
  updateGold(gold: number): void {
    this.gold = gold;
    this.goldText.setText(`💰 ${this.gold}`);
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
            // Flash gold text
            this.goldText.setScale(1.2);
            this.scene.tweens.add({
              targets: this.goldText,
              scale: 1,
              duration: 150,
              ease: 'Power2'
            });
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
   * Update castle HP display
   */
  updateCastleHP(hp: number): void {
    this.castleHP = hp;
    this.hpText.setText(`❤️ ${this.castleHP}`);
    this.updateHPBar();
    
    // Flash HP red when low
    if (this.castleHP <= 3) {
      this.hpText.setColor('#ff0000');
    }
  }

  /**
   * Update wave display
   */
  updateWave(currentWave: number): void {
    this.currentWave = currentWave;
    this.waveText.setText(`⚔️ WAVE ${this.currentWave} / ${this.totalWaves}`);
  }

  /**
   * Update HP bar visual
   */
  private updateHPBar(): void {
    this.hpBar.clear();
    
    if (!this.castlePosition) return;
    
    const barWidth = 100;
    const barHeight = 10;
    const x = this.castlePosition.x - barWidth / 2;
    const y = this.castlePosition.y + 55;
    
    // Background
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);
    
    // HP fill
    const hpPercent = Math.max(0, this.castleHP / this.maxCastleHP);
    const fillColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRoundedRect(x, y, barWidth * hpPercent, barHeight, 3);
    
    // Border
    this.hpBar.lineStyle(2, 0xffffff, 0.6);
    this.hpBar.strokeRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);
  }

  /**
   * Show start wave button
   */
  showStartWaveButton(waveNumber: number): void {
    this.startWaveButton.setText(`⚔ Start Wave ${waveNumber}`);
    this.startWaveButton.setVisible(true);
    this.startWaveButtonBg.setVisible(true);
    this.startWaveHitArea.setVisible(true);
    this.startWaveHitArea.setInteractive({ useHandCursor: true });
  }

  /**
   * Hide start wave button
   */
  hideStartWaveButton(): void {
    this.startWaveButton.setVisible(false);
    this.startWaveButtonBg.setVisible(false);
    this.startWaveHitArea.setVisible(false);
    this.startWaveHitArea.disableInteractive();
  }

  /**
   * Show countdown before next wave
   */
  showCountdown(nextWave: number, onComplete: () => void): void {
    let countdown = 3;
    
    this.countdownText.setText(`Wave ${nextWave} in ${countdown}...`);
    this.countdownText.setVisible(true);
    
    const countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          this.countdownText.setText(`Wave ${nextWave} in ${countdown}...`);
        } else {
          this.countdownText.setVisible(false);
          countdownTimer.destroy();
          onComplete();
        }
      }
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

    scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY + 30, `Castle HP: ${castleHP}/10 | Gold: ${gold}`, {
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
   * Show creep stats popup
   */
  showCreepStats(creepType: string, currentHP: number, maxHP: number, speed: number, armor: number, goldReward: number, x: number, y: number, hasShield?: boolean, shieldHitsRemaining?: number, canJump?: boolean): void {
    // Close existing popup
    this.hideCreepStats();
    
    // Position popup above the creep
    const popupX = x;
    const popupY = Math.max(100, y - 80);
    
    this.creepInfoContainer = this.scene.add.container(popupX, popupY);
    this.creepInfoContainer.setDepth(250);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-110, -50, 220, 100, 8);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-110, -50, 220, 100, 8);
    this.creepInfoContainer.add(bg);
    
    // Creep type name with color coding
    const typeColors: Record<string, string> = {
      furball: '#88cc88',
      runner: '#ffcc44',
      tank: '#888888',
      boss: '#ff4444',
      jumper: '#aa88ff',
      shielded: '#44ccff'
    };
    const typeColor = typeColors[creepType] || '#ffffff';
    const typeName = creepType.charAt(0).toUpperCase() + creepType.slice(1);
    
    const title = this.scene.add.text(0, -38, typeName, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: typeColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.creepInfoContainer.add(title);
    
    // HP bar
    const hpPercent = currentHP / maxHP;
    const hpBarWidth = 180;
    const hpBarHeight = 12;
    
    const hpBarBg = this.scene.add.graphics();
    hpBarBg.fillStyle(0x333333, 1);
    hpBarBg.fillRoundedRect(-hpBarWidth/2, -20, hpBarWidth, hpBarHeight, 3);
    this.creepInfoContainer.add(hpBarBg);
    
    const hpBarFill = this.scene.add.graphics();
    const hpColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    hpBarFill.fillStyle(hpColor, 1);
    hpBarFill.fillRoundedRect(-hpBarWidth/2 + 2, -18, (hpBarWidth - 4) * hpPercent, hpBarHeight - 4, 2);
    this.creepInfoContainer.add(hpBarFill);
    
    const hpText = this.scene.add.text(0, -14, `${Math.ceil(currentHP)} / ${maxHP}`, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.creepInfoContainer.add(hpText);
    
    // Stats row
    const statsY = 5;
    const statSpacing = 55;
    
    // Speed
    const speedText = this.scene.add.text(-statSpacing, statsY, `⚡ ${speed}`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffcc44'
    }).setOrigin(0.5);
    this.creepInfoContainer.add(speedText);
    
    // Armor
    const armorText = this.scene.add.text(0, statsY, `🛡️ ${armor}`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.creepInfoContainer.add(armorText);
    
    // Gold reward
    const goldText = this.scene.add.text(statSpacing, statsY, `💰 ${goldReward}`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.creepInfoContainer.add(goldText);
    
    // Special abilities
    let specialText = '';
    if (hasShield && shieldHitsRemaining && shieldHitsRemaining > 0) {
      specialText += `🔵 Shield: ${shieldHitsRemaining} hits  `;
    }
    if (canJump) {
      specialText += '🦘 Can Jump';
    }
    
    if (specialText) {
      const special = this.scene.add.text(0, 28, specialText, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#44ccff'
      }).setOrigin(0.5);
      this.creepInfoContainer.add(special);
    }
    
    // Auto-hide after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      this.hideCreepStats();
    });
  }

  /**
   * Hide creep stats popup
   */
  hideCreepStats(): void {
    if (this.creepInfoContainer) {
      this.creepInfoContainer.destroy();
      this.creepInfoContainer = null;
    }
  }
}
