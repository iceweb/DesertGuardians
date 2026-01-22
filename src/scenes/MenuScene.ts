import Phaser from 'phaser';
import { AudioManager } from '../managers';
import {
  MenuBackground,
  MenuDecorations,
  MenuButton,
  SettingsModal,
  HighscoresModal,
  InfoModal,
} from './menu';

/**
 * Main menu scene with desert theme
 * Refactored to use component classes for reduced file size
 */
export class MenuScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private menuBackground: MenuBackground | null = null;
  private menuDecorations: MenuDecorations | null = null;
  private settingsModal: SettingsModal | null = null;
  private highscoresModal: HighscoresModal | null = null;
  private infoModal: InfoModal | null = null;

  private static gameInProgress: boolean = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  public static setGameInProgress(inProgress: boolean): void {
    MenuScene.gameInProgress = inProgress;
  }

  public static isGameInProgress(): boolean {
    return MenuScene.gameInProgress;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize audio
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();
    this.audioManager.playBGM();

    this.input.once('pointerdown', () => {
      this.audioManager.unlockAudio();
    });

    // Draw background and frame using component
    this.menuBackground = new MenuBackground(this);
    this.menuBackground.drawBackground(width, height);
    this.menuBackground.drawDecorativeFrame(width, height);

    // Draw desert decorations using component
    this.menuDecorations = new MenuDecorations(this);
    this.menuDecorations.draw(width, height);

    // Create title
    this.createTitle(width);

    // Create menu buttons
    this.createMenuButtons(width, height);

    // Footer
    this.createFooter(width, height);
  }

  private createTitle(width: number): void {
    // Shadow
    this.add
      .text(width / 2 + 4, 165, 'Desert Guardians', {
        fontFamily: 'Papyrus, Copperplate, Georgia, serif',
        fontSize: '80px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setDepth(19)
      .setAlpha(0.5);

    // Main title
    const title = this.add
      .text(width / 2, 160, 'Desert Guardians', {
        fontFamily: 'Papyrus, Copperplate, Georgia, serif',
        fontSize: '80px',
        color: '#ffd700',
        stroke: '#8b4513',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Pulsing animation
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.85 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Title decorations
    const titleDeco = this.add.graphics();
    titleDeco.setDepth(19);

    titleDeco.lineStyle(3, 0xd4a574, 1);
    titleDeco.lineBetween(width / 2 - 180, 215, width / 2 + 180, 215);

    titleDeco.fillStyle(0xffd700, 1);
    titleDeco.fillCircle(width / 2 - 190, 215, 6);
    titleDeco.fillCircle(width / 2 + 190, 215, 6);
    titleDeco.fillStyle(0xd4a574, 1);
    titleDeco.fillCircle(width / 2 - 190, 215, 3);
    titleDeco.fillCircle(width / 2 + 190, 215, 3);

    titleDeco.lineStyle(1, 0x8b6914, 0.8);
    titleDeco.lineBetween(width / 2 - 150, 225, width / 2 + 150, 225);

    // Subtitle
    this.add
      .text(width / 2, 255, '~ Tower Defense ~', {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: '#c9a86c',
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  private createMenuButtons(width: number, height: number): void {
    const buttonY = height / 2 + 40;
    const hasGameInProgress = MenuScene.isGameInProgress();

    // Resume button (only if game in progress)
    if (hasGameInProgress) {
      new MenuButton(this, {
        x: width / 2,
        y: buttonY - 80,
        text: '▶  RESUME',
        width: 220,
        height: 65,
        isPrimary: true,
        onClick: () => {
          this.audioManager.playSFX('ui_click');
          this.resumeGame();
        },
      });
    }

    // Start/Restart button
    new MenuButton(this, {
      x: width / 2,
      y: buttonY,
      text: hasGameInProgress ? 'RESTART' : 'START',
      width: 220,
      height: 65,
      isPrimary: !hasGameInProgress,
      onClick: () => {
        this.audioManager.playSFX('ui_click');
        this.startGame();
      },
    });

    // Bottom buttons - row 1
    const bottomY = buttonY + 100;
    const spacing = 160;

    // Scores button
    new MenuButton(this, {
      x: width / 2 - spacing,
      y: bottomY,
      text: '🏆  SCORES',
      width: 180,
      height: 50,
      onClick: () => {
        this.audioManager.playSFX('ui_click');
        this.showHighscores();
      },
    });

    // Settings button
    new MenuButton(this, {
      x: width / 2 + spacing,
      y: bottomY,
      text: '⚙  SETTINGS',
      width: 180,
      height: 50,
      onClick: () => {
        this.audioManager.playSFX('ui_click');
        this.showSettings();
      },
    });

    // Info button (centered below)
    new MenuButton(this, {
      x: width / 2,
      y: bottomY + 65,
      text: '📜  INFO',
      width: 180,
      height: 50,
      onClick: () => {
        this.audioManager.playSFX('ui_click');
        this.showInfo();
      },
    });
  }

  private createFooter(width: number, height: number): void {
    // Version
    this.add
      .text(width - 15, height - 15, 'v1.0.0', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#8b6914',
      })
      .setOrigin(1, 1)
      .setDepth(50);

    // Credits
    this.add
      .text(width / 2, height - 15, '© 2026 Created by Mike Blöchlinger', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#c9a86c',
      })
      .setOrigin(0.5, 1)
      .setDepth(50);
  }

  private startGame(): void {
    this.audioManager.unlockAudio();

    if (this.scene.isActive('GameScene')) {
      this.scene.stop('GameScene');
    }
    if (this.scene.isActive('UIScene')) {
      this.scene.stop('UIScene');
    }
    MenuScene.setGameInProgress(true);
    this.scene.start('GameScene');
  }

  private resumeGame(): void {
    this.scene.stop('MenuScene');
    this.scene.wake('GameScene');
    this.scene.wake('UIScene');
  }

  private showHighscores(): void {
    if (this.highscoresModal?.isOpen()) {
      this.highscoresModal.close();
      return;
    }

    this.highscoresModal = new HighscoresModal(this, this.audioManager, () => {
      this.highscoresModal = null;
    });
    this.highscoresModal.show();
  }

  private showSettings(): void {
    if (this.settingsModal?.isOpen()) {
      this.settingsModal.close();
      return;
    }

    this.settingsModal = new SettingsModal(this, this.audioManager, () => {
      this.settingsModal = null;
    });
    this.settingsModal.show();
  }

  private showInfo(): void {
    if (this.infoModal?.isOpen()) {
      this.infoModal.close();
      return;
    }

    this.infoModal = new InfoModal(this, this.audioManager, () => {
      this.infoModal = null;
    });
    this.infoModal.show();
  }
}
