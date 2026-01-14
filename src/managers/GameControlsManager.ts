import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export class GameControlsManager {
  private scene: Phaser.Scene;

  private gameSpeed: number = 1;
  private speedButton!: Phaser.GameObjects.Text;
  private speedButtonBg!: Phaser.GameObjects.Graphics;
  private speedHitArea!: Phaser.GameObjects.Rectangle;

  private isPaused: boolean = false;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseButtonBg!: Phaser.GameObjects.Graphics;
  private pauseHitArea!: Phaser.GameObjects.Rectangle;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(width: number, height: number): void {
    this.createSpeedButton(width, height);
    this.createPauseButton(width, height);
  }

  private createSpeedButton(width: number, height: number): void {
    const btnX = width - 170;
    const btnY = height - 30;

    this.speedButtonBg = this.scene.add.graphics();
    this.speedButtonBg.setDepth(100);

    const drawSpeedButton = (hover: boolean) => {
      this.speedButtonBg.clear();

      this.speedButtonBg.fillStyle(0x1a0a00, 0.6);
      this.speedButtonBg.fillRoundedRect(btnX - 40 + 2, btnY - 16 + 2, 80, 32, 6);

      this.speedButtonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      this.speedButtonBg.fillRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);

      const innerColor = this.gameSpeed === 3 ? 0xcc5500 : this.gameSpeed === 2 ? 0xc49564 : 0xa07840;
      this.speedButtonBg.fillStyle(hover ? innerColor : innerColor, 1);
      this.speedButtonBg.fillRoundedRect(btnX - 38, btnY - 14, 76, 28, 5);

      const borderColor = this.gameSpeed === 3 ? 0xff6600 : this.gameSpeed === 2 ? 0xffd700 : 0xd4a574;
      this.speedButtonBg.lineStyle(2, borderColor, 1);
      this.speedButtonBg.strokeRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);

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

  private toggleGameSpeed(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 170;
    const btnY = height - 30;

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

    this.speedButtonBg.clear();

    this.speedButtonBg.fillStyle(0x1a0a00, 0.6);
    this.speedButtonBg.fillRoundedRect(btnX - 40 + 2, btnY - 16 + 2, 80, 32, 6);

    this.speedButtonBg.fillStyle(0x6b4914, 1);
    this.speedButtonBg.fillRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);

    const innerColor = this.gameSpeed === 3 ? 0xcc5500 : this.gameSpeed === 2 ? 0xc49564 : 0xa07840;
    this.speedButtonBg.fillStyle(innerColor, 1);
    this.speedButtonBg.fillRoundedRect(btnX - 38, btnY - 14, 76, 28, 5);

    const borderColor = this.gameSpeed === 3 ? 0xff6600 : this.gameSpeed === 2 ? 0xffd700 : 0xd4a574;
    this.speedButtonBg.lineStyle(2, borderColor, 1);
    this.speedButtonBg.strokeRoundedRect(btnX - 40, btnY - 16, 80, 32, 6);

    this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 1 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX - 25, btnY, 4);
    this.speedButtonBg.fillStyle(0xffd700, this.gameSpeed >= 2 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX - 12, btnY, 4);
    this.speedButtonBg.fillStyle(0xff6600, this.gameSpeed >= 3 ? 1 : 0.3);
    this.speedButtonBg.fillCircle(btnX + 1, btnY, 4);
  }

  private createPauseButton(width: number, height: number): void {
    const btnX = width - 70;
    const btnY = height - 30;

    this.pauseButtonBg = this.scene.add.graphics();
    this.pauseButtonBg.setDepth(100);

    const drawPauseButton = (hover: boolean) => {
      this.pauseButtonBg.clear();

      this.pauseButtonBg.fillStyle(0x1a0a00, 0.6);
      this.pauseButtonBg.fillRoundedRect(btnX - 28 + 2, btnY - 16 + 2, 56, 32, 6);

      this.pauseButtonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      this.pauseButtonBg.fillRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);

      const innerColor = this.isPaused ? 0x2a6a2a : (hover ? 0xc49564 : 0xa07840);
      this.pauseButtonBg.fillStyle(innerColor, 1);
      this.pauseButtonBg.fillRoundedRect(btnX - 26, btnY - 14, 52, 28, 5);

      const borderColor = this.isPaused ? 0x44ff44 : 0xd4a574;
      this.pauseButtonBg.lineStyle(2, borderColor, 1);
      this.pauseButtonBg.strokeRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);

      if (this.isPaused) {

        this.pauseButtonBg.fillStyle(0x44ff44, 1);
        this.pauseButtonBg.beginPath();
        this.pauseButtonBg.moveTo(btnX - 8, btnY - 8);
        this.pauseButtonBg.lineTo(btnX + 10, btnY);
        this.pauseButtonBg.lineTo(btnX - 8, btnY + 8);
        this.pauseButtonBg.closePath();
        this.pauseButtonBg.fillPath();
      } else {

        this.pauseButtonBg.fillStyle(0xffd700, 1);
        this.pauseButtonBg.fillRect(btnX - 8, btnY - 8, 6, 16);
        this.pauseButtonBg.fillRect(btnX + 2, btnY - 8, 6, 16);
      }
    };

    drawPauseButton(false);

    this.pauseButton = this.scene.add.text(btnX, btnY, '', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '16px',
      color: '#fff8dc'
    }).setOrigin(0.5).setDepth(101);

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

  togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showPauseOverlay();
    } else {
      this.hidePauseOverlay();
    }

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const btnX = width - 70;
    const btnY = height - 30;

    this.pauseButtonBg.clear();

    this.pauseButtonBg.fillStyle(0x1a0a00, 0.6);
    this.pauseButtonBg.fillRoundedRect(btnX - 28 + 2, btnY - 16 + 2, 56, 32, 6);

    this.pauseButtonBg.fillStyle(0x6b4914, 1);
    this.pauseButtonBg.fillRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);

    const innerColor = this.isPaused ? 0x2a6a2a : 0xa07840;
    this.pauseButtonBg.fillStyle(innerColor, 1);
    this.pauseButtonBg.fillRoundedRect(btnX - 26, btnY - 14, 52, 28, 5);

    const borderColor = this.isPaused ? 0x44ff44 : 0xd4a574;
    this.pauseButtonBg.lineStyle(2, borderColor, 1);
    this.pauseButtonBg.strokeRoundedRect(btnX - 28, btnY - 16, 56, 32, 6);

    if (this.isPaused) {

      this.pauseButtonBg.fillStyle(0x44ff44, 1);
      this.pauseButtonBg.beginPath();
      this.pauseButtonBg.moveTo(btnX - 8, btnY - 8);
      this.pauseButtonBg.lineTo(btnX + 10, btnY);
      this.pauseButtonBg.lineTo(btnX - 8, btnY + 8);
      this.pauseButtonBg.closePath();
      this.pauseButtonBg.fillPath();
    } else {

      this.pauseButtonBg.fillStyle(0xffd700, 1);
      this.pauseButtonBg.fillRect(btnX - 8, btnY - 8, 6, 16);
      this.pauseButtonBg.fillRect(btnX + 2, btnY - 8, 6, 16);
    }
  }

  private showPauseOverlay(): void {
    if (this.pauseOverlay) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.pauseOverlay = this.scene.add.container(width / 2, height / 2);
    this.pauseOverlay.setDepth(150);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(-width / 2, -height / 2, width, height);
    this.pauseOverlay.add(bg);

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

  private hidePauseOverlay(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  getGameSpeed(): number {
    return this.gameSpeed;
  }

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
