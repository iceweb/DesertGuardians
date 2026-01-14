import Phaser from 'phaser';
import { GameControlsManager } from './GameControlsManager';
import { GameOverlayManager } from './GameOverlayManager';
import { CreepInfoPanel } from './CreepInfoPanel';
import { NextWavePanel } from './NextWavePanel';
import { AudioManager } from './AudioManager';
import { GAME_CONFIG } from '../data/GameConfig';
import type { WaveType } from '../data/GameData';

export class HUDManager {
  private scene: Phaser.Scene;

  private gameControls: GameControlsManager;
  private overlayManager: GameOverlayManager;
  private creepInfoPanel: CreepInfoPanel;
  private nextWavePanel: NextWavePanel;

  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private countdownText!: Phaser.GameObjects.Text;
  private startWaveButton!: Phaser.GameObjects.Text;
  private startWaveButtonBg!: Phaser.GameObjects.Graphics;
  private startWaveHitArea!: Phaser.GameObjects.Rectangle;

  private soundButtonBg!: Phaser.GameObjects.Graphics;
  private audioManager!: AudioManager;

  private gold: number = 200;
  private castleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private maxCastleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private currentWave: number = 0;
  private totalWaves: number = 0;
  private castlePosition: Phaser.Math.Vector2 | null = null;

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
    this.nextWavePanel = new NextWavePanel(scene);
  }

  create(totalWaves: number): void {
    this.totalWaves = totalWaves;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.audioManager = AudioManager.getInstance();

    this.createHUDBar(width);
    this.createWaveControls(width, height);
    this.createBackButton(height);
    this.createSoundButton(height);
    this.gameControls.create(width, height);
    this.createHPBar();
    this.createCountdownText(width, height);

    this.overlayManager.setGoldTextRef(this.goldText);
  }

  private createHUDBar(width: number): void {
    const hudBg = this.scene.add.graphics();
    hudBg.setDepth(100);

    hudBg.fillStyle(0x1a0a00, 0.85);
    hudBg.fillRect(0, 0, width, 60);

    hudBg.lineStyle(3, 0xd4a574, 1);
    hudBg.lineBetween(0, 60, width, 60);
    hudBg.lineStyle(1, 0x8b6914, 1);
    hudBg.lineBetween(0, 58, width, 58);

    hudBg.fillStyle(0xd4a574, 1);
    hudBg.fillTriangle(0, 60, 30, 60, 0, 30);
    hudBg.fillTriangle(width, 60, width - 30, 60, width, 30);

    this.waveText = this.scene.add.text(width / 2, 32, `⚔️ WAVE 0 / ${this.totalWaves}`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101);

    this.goldText = this.scene.add.text(30, 32, `💰 ${this.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(101);

    this.hpText = this.scene.add.text(width - 30, 32, `❤️ ${this.castleHP}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0.5).setDepth(101);
  }

  private createWaveControls(width: number, height: number): void {
    this.startWaveButtonBg = this.scene.add.graphics();
    this.startWaveButtonBg.setDepth(100);

    const btnX = width / 2;
    const btnY = height - 70;
    const btnWidth = 180;
    const btnHeight = 60;

    const drawButton = (hover: boolean, pressed: boolean = false) => {
      this.startWaveButtonBg.clear();

      if (hover) {
        this.startWaveButtonBg.fillStyle(0xffd700, 0.3);
        this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2 - 8, btnY - btnHeight/2 - 8, btnWidth + 16, btnHeight + 16, 14);
      }

      this.startWaveButtonBg.fillStyle(0x1a0a00, 0.8);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2 + 4, btnY - btnHeight/2 + 4, btnWidth, btnHeight, 8);

      const baseColor = pressed ? 0xa07840 : (hover ? 0xd4a574 : 0xc49564);
      this.startWaveButtonBg.fillStyle(baseColor, 1);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 8);

      this.startWaveButtonBg.lineStyle(3, 0x8b6914, 1);
      this.startWaveButtonBg.strokeRoundedRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 8);
      this.startWaveButtonBg.lineStyle(2, 0x5a4010, 0.5);
      this.startWaveButtonBg.strokeRoundedRect(btnX - btnWidth/2 + 4, btnY - btnHeight/2 + 4, btnWidth - 8, btnHeight - 8, 6);

      this.startWaveButtonBg.lineStyle(1, 0xb08050, 0.3);
      for (let i = 0; i < 4; i++) {
        const ly = btnY - btnHeight/2 + 12 + i * 12;
        this.startWaveButtonBg.lineBetween(btnX - btnWidth/2 + 10, ly, btnX + btnWidth/2 - 10, ly);
      }

      this.startWaveButtonBg.fillStyle(0xffd700, hover ? 1 : 0.8);

      this.startWaveButtonBg.fillCircle(btnX - btnWidth/2 + 12, btnY - btnHeight/2 + 12, 5);
      this.startWaveButtonBg.fillCircle(btnX + btnWidth/2 - 12, btnY - btnHeight/2 + 12, 5);

      this.startWaveButtonBg.fillCircle(btnX - btnWidth/2 + 12, btnY + btnHeight/2 - 12, 5);
      this.startWaveButtonBg.fillCircle(btnX + btnWidth/2 - 12, btnY + btnHeight/2 - 12, 5);

      this.startWaveButtonBg.fillStyle(hover ? 0xd4b070 : 0xc4a060, 0.4);
      this.startWaveButtonBg.fillRoundedRect(btnX - btnWidth/2 + 6, btnY - btnHeight/2 + 4, btnWidth - 12, 12, 4);
    };

    drawButton(false);

    this.startWaveButton = this.scene.add.text(btnX, btnY, 'START', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '22px',
      color: '#2a1a0a',
      fontStyle: 'bold',
      stroke: '#c49564',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(101);

    this.startWaveHitArea = this.scene.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0xffffff, 0);
    this.startWaveHitArea.setDepth(102).setInteractive({ useHandCursor: true });

    this.startWaveHitArea.on('pointerover', () => drawButton(true));
    this.startWaveHitArea.on('pointerout', () => drawButton(false));
    this.startWaveHitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      drawButton(true, true);
      this.onStartWaveClicked?.();
    });
  }

  private createBackButton(height: number): void {
    const btnX = 60;
    const btnY = height - 30;

    const menuBg = this.scene.add.graphics();
    menuBg.setDepth(100);

    const drawMenuButton = (hover: boolean) => {
      menuBg.clear();

      menuBg.fillStyle(0x1a0a00, 0.6);
      menuBg.fillRoundedRect(btnX - 45 + 2, btnY - 16 + 2, 90, 32, 6);

      menuBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      menuBg.fillRoundedRect(btnX - 45, btnY - 16, 90, 32, 6);

      menuBg.fillStyle(hover ? 0xc49564 : 0xa07840, 1);
      menuBg.fillRoundedRect(btnX - 43, btnY - 14, 86, 28, 5);

      menuBg.lineStyle(2, 0xd4a574, 0.8);
      menuBg.strokeRoundedRect(btnX - 45, btnY - 16, 90, 32, 6);

      menuBg.fillStyle(0xffd700, 0.7);
      menuBg.fillCircle(btnX - 38, btnY, 3);
      menuBg.fillCircle(btnX + 38, btnY, 3);
    };

    drawMenuButton(false);

    const backButton = this.scene.add.text(btnX, btnY, '◂ MENU', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '14px',
      color: '#fff8dc',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => drawMenuButton(true));
    backButton.on('pointerout', () => drawMenuButton(false));
    backButton.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.audioManager.playSFX('ui_click');
      this.onMenuClicked?.();
    });
  }

  private createSoundButton(height: number): void {
    const btnX = 160;
    const btnY = height - 30;
    const btnSize = 36;

    this.soundButtonBg = this.scene.add.graphics();
    this.soundButtonBg.setDepth(100);

    const drawSoundButton = (hover: boolean, muted: boolean) => {
      this.soundButtonBg.clear();

      this.soundButtonBg.fillStyle(0x1a0a00, 0.6);
      this.soundButtonBg.fillRoundedRect(btnX - btnSize/2 + 2, btnY - btnSize/2 + 2, btnSize, btnSize, 6);

      const bgColor = muted ? 0x4a2a10 : (hover ? 0x8b6914 : 0x6b4914);
      this.soundButtonBg.fillStyle(bgColor, 1);
      this.soundButtonBg.fillRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 6);

      const innerColor = muted ? 0x5a3a20 : (hover ? 0xc49564 : 0xa07840);
      this.soundButtonBg.fillStyle(innerColor, 1);
      this.soundButtonBg.fillRoundedRect(btnX - btnSize/2 + 2, btnY - btnSize/2 + 2, btnSize - 4, btnSize - 4, 5);

      this.soundButtonBg.lineStyle(2, muted ? 0x8b5a34 : 0xd4a574, 0.8);
      this.soundButtonBg.strokeRoundedRect(btnX - btnSize/2, btnY - btnSize/2, btnSize, btnSize, 6);

      const iconX = btnX - 4;
      const iconY = btnY;
      const iconColor = muted ? 0x666666 : 0xffd700;

      this.soundButtonBg.fillStyle(iconColor, 1);

      this.soundButtonBg.fillRect(iconX - 8, iconY - 3, 5, 6);

      this.soundButtonBg.beginPath();
      this.soundButtonBg.moveTo(iconX - 3, iconY - 3);
      this.soundButtonBg.lineTo(iconX + 5, iconY - 8);
      this.soundButtonBg.lineTo(iconX + 5, iconY + 8);
      this.soundButtonBg.lineTo(iconX - 3, iconY + 3);
      this.soundButtonBg.closePath();
      this.soundButtonBg.fillPath();

      if (!muted) {

        this.soundButtonBg.lineStyle(2, iconColor, 0.8);
        this.soundButtonBg.beginPath();
        this.soundButtonBg.arc(iconX + 6, iconY, 5, -0.6, 0.6);
        this.soundButtonBg.strokePath();
        this.soundButtonBg.beginPath();
        this.soundButtonBg.arc(iconX + 6, iconY, 9, -0.5, 0.5);
        this.soundButtonBg.strokePath();
      } else {

        this.soundButtonBg.lineStyle(3, 0xff4444, 1);
        this.soundButtonBg.lineBetween(iconX - 10, iconY - 8, iconX + 14, iconY + 8);
      }
    };

    const isMuted = this.audioManager.getMuted();
    drawSoundButton(false, isMuted);

    const hitArea = this.scene.add.rectangle(btnX, btnY, btnSize, btnSize, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(102);

    hitArea.on('pointerover', () => {
      drawSoundButton(true, this.audioManager.getMuted());
    });
    hitArea.on('pointerout', () => {
      drawSoundButton(false, this.audioManager.getMuted());
    });
    hitArea.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.audioManager.playSFX('ui_click');
      const newMuted = this.audioManager.toggleMute();
      drawSoundButton(true, newMuted);

    });
  }

  isPausedState(): boolean {
    return this.gameControls.isPausedState();
  }

  getGameSpeed(): number {
    return this.gameControls.getGameSpeed();
  }

  private createHPBar(): void {
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setDepth(20);
  }

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

  setCastlePosition(position: Phaser.Math.Vector2 | null): void {
    this.castlePosition = position;
    this.updateHPBar();
  }

  updateGold(gold: number): void {
    this.gold = gold;
    this.goldText.setText(`💰 ${this.gold}`);
  }

  showWaveBonus(waveNumber: number, bonusGold: number, onComplete: () => void): void {
    this.overlayManager.showWaveBonus(waveNumber, bonusGold, onComplete);
  }

  updateCastleHP(hp: number): void {
    this.castleHP = hp;
    this.hpText.setText(`❤️ ${this.castleHP}`);
    this.updateHPBar();

    if (this.castleHP <= 3) {
      this.hpText.setColor('#ff0000');
    }
  }

  updateWave(currentWave: number): void {
    this.currentWave = currentWave;
    this.waveText.setText(`⚔️ WAVE ${this.currentWave} / ${this.totalWaves}`);
  }

  private updateHPBar(): void {
    this.hpBar.clear();

    if (!this.castlePosition) return;

    const barWidth = 100;
    const barHeight = 10;
    const x = this.castlePosition.x - barWidth / 2;
    const y = this.castlePosition.y + 55;

    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);

    const hpPercent = Math.max(0, this.castleHP / this.maxCastleHP);
    const fillColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRoundedRect(x, y, barWidth * hpPercent, barHeight, 3);

    this.hpBar.lineStyle(2, 0xffffff, 0.6);
    this.hpBar.strokeRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);
  }

  showStartWaveButton(_waveNumber: number): void {
    this.startWaveButton.setText('START');
    this.startWaveButton.setVisible(true);
    this.startWaveButtonBg.setVisible(true);
    this.startWaveHitArea.setVisible(true);
    this.startWaveHitArea.setInteractive({ useHandCursor: true });
  }

  hideStartWaveButton(): void {
    this.startWaveButton.setVisible(false);
    this.startWaveButtonBg.setVisible(false);
    this.startWaveHitArea.setVisible(false);
    this.startWaveHitArea.disableInteractive();
  }

  showCountdown(nextWave: number, onComplete: () => void): void {
    let countdown = 3;
    let completed = false;

    const safeComplete = () => {
      if (!completed) {
        completed = true;
        this.countdownText.setVisible(false);
        onComplete();
      }
    };

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
          countdownTimer.destroy();
          safeComplete();
        }
      }
    });

    this.scene.time.delayedCall(4000, () => {
      if (!completed) {
        console.warn('HUDManager: Countdown timer fallback triggered');
        safeComplete();
      }
    });
  }

  showFloatingText(text: string, x: number, y: number, color: number): void {
    this.overlayManager.showFloatingText(text, x, y, color);
  }

  showVictory(gold: number, castleHP: number): void {
    this.overlayManager.showVictory(gold, castleHP);
  }

  showDefeat(currentWave: number, totalWaves: number, creepsKilled: number): void {
    this.overlayManager.showDefeat(currentWave, totalWaves, creepsKilled);
  }

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

  hideCreepStats(): void {
    this.creepInfoPanel.hide();
  }

  showNextWavePreview(waveNumber: number, creepTypes: Array<{ type: string; description: string }>, waveType?: WaveType): void {
    this.nextWavePanel.show(waveNumber, creepTypes, waveType);
  }

  hideNextWavePreview(): void {
    this.nextWavePanel.hide();
  }
}
