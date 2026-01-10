import Phaser from 'phaser';
import { GameControlsManager } from './GameControlsManager';
import { GameOverlayManager } from './GameOverlayManager';
import { CreepInfoPanel } from './CreepInfoPanel';
import { GAME_CONFIG } from '../data/GameConfig';

/**
 * HUDManager handles all HUD rendering and state display.
 * Delegates to specialized managers for game controls, overlays, and info panels.
 */
export class HUDManager {
  private scene: Phaser.Scene;
  
  // Delegated managers
  private gameControls: GameControlsManager;
  private overlayManager: GameOverlayManager;
  private creepInfoPanel: CreepInfoPanel;
  
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
  private castleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private maxCastleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private currentWave: number = 0;
  private totalWaves: number = 0;
  private castlePosition: Phaser.Math.Vector2 | null = null;
  
  // Callbacks
  public onStartWaveClicked?: () => void;
  
  public get onMenuClicked(): (() => void) | undefined {
    return this.overlayManager.onMenuClicked;
  }
  
  public set onMenuClicked(callback: (() => void) | undefined) {
    this.overlayManager.onMenuClicked = callback;
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameControls = new GameControlsManager(scene);
    this.overlayManager = new GameOverlayManager(scene);
    this.creepInfoPanel = new CreepInfoPanel(scene);
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
    this.gameControls.create(width, height);
    this.createHPBar();
    this.createCountdownText(width, height);
    
    // Wire up overlay manager with gold text reference
    this.overlayManager.setGoldTextRef(this.goldText);
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
   * Check if game is paused - delegates to GameControlsManager
   */
  isPausedState(): boolean {
    return this.gameControls.isPausedState();
  }

  /**
   * Get current game speed - delegates to GameControlsManager
   */
  getGameSpeed(): number {
    return this.gameControls.getGameSpeed();
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
   * Show wave completion gold bonus - delegates to GameOverlayManager
   */
  showWaveBonus(waveNumber: number, bonusGold: number, onComplete: () => void): void {
    this.overlayManager.showWaveBonus(waveNumber, bonusGold, onComplete);
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
   * Show floating text - delegates to GameOverlayManager
   */
  showFloatingText(text: string, x: number, y: number, color: number): void {
    this.overlayManager.showFloatingText(text, x, y, color);
  }

  /**
   * Show victory screen - delegates to GameOverlayManager
   */
  showVictory(gold: number, castleHP: number): void {
    this.overlayManager.showVictory(gold, castleHP);
  }

  /**
   * Show defeat screen - delegates to GameOverlayManager
   */
  showDefeat(currentWave: number, totalWaves: number, creepsKilled: number): void {
    this.overlayManager.showDefeat(currentWave, totalWaves, creepsKilled);
  }

  /**
   * Show creep stats popup - delegates to CreepInfoPanel
   */
  showCreepStats(
    creepType: string,
    currentHP: number,
    maxHP: number,
    speed: number,
    armor: number,
    goldReward: number,
    x: number,
    y: number,
    hasShield?: boolean,
    shieldHitsRemaining?: number,
    canJump?: boolean
  ): void {
    this.creepInfoPanel.show(
      creepType, currentHP, maxHP, speed, armor, goldReward,
      x, y, hasShield, shieldHitsRemaining, canJump
    );
  }

  /**
   * Hide creep stats popup - delegates to CreepInfoPanel
   */
  hideCreepStats(): void {
    this.creepInfoPanel.hide();
  }
}
