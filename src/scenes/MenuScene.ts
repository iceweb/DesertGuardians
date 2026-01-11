import Phaser from 'phaser';
import type { Highscore } from './ResultsScene';
import { AudioManager } from '../managers';

const HIGHSCORES_KEY = 'tower_defense_highscores';

export class MenuScene extends Phaser.Scene {
  private highscoreContainer: Phaser.GameObjects.Container | null = null;
  private settingsContainer: Phaser.GameObjects.Container | null = null;
  private audioManager!: AudioManager;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize audio manager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();

    // Background
    this.cameras.main.setBackgroundColor('#1a0a00'); // Dark desert night

    // Title
    const title = this.add.text(width / 2, height / 3, 'Desert Guardians', {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      color: '#d4a574',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 70, 'Tower Defense', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#c9a86c'
    });
    subtitle.setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, '▶  Start Game', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 30, y: 15 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#6b4d30' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#4a3520' });
    });

    startButton.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.startGame();
    });

    // Highscores button
    const highscoresButton = this.add.text(width / 2, height / 2 + 130, '🏆  Highscores', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3a2a18',
      padding: { x: 20, y: 10 }
    });
    highscoresButton.setOrigin(0.5);
    highscoresButton.setInteractive({ useHandCursor: true });

    highscoresButton.on('pointerover', () => {
      highscoresButton.setStyle({ backgroundColor: '#5a4228' });
    });

    highscoresButton.on('pointerout', () => {
      highscoresButton.setStyle({ backgroundColor: '#3a2a18' });
    });

    highscoresButton.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.showHighscores();
    });

    // Settings button
    const settingsButton = this.add.text(width / 2, height / 2 + 185, '⚙  Settings', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3a2a18',
      padding: { x: 20, y: 10 }
    });
    settingsButton.setOrigin(0.5);
    settingsButton.setInteractive({ useHandCursor: true });

    settingsButton.on('pointerover', () => {
      settingsButton.setStyle({ backgroundColor: '#5a4228' });
    });

    settingsButton.on('pointerout', () => {
      settingsButton.setStyle({ backgroundColor: '#3a2a18' });
    });

    settingsButton.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.showSettings();
    });

    // Version text
    const version = this.add.text(width - 10, height - 10, 'v1.0.0 - Step 10', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#666666'
    });
    version.setOrigin(1, 1);

    console.log('MenuScene: Menu created');
  }

  private startGame(): void {
    console.log('MenuScene: Starting game...');
    this.scene.start('GameScene');
  }

  private showHighscores(): void {
    // If already showing, close it
    if (this.highscoreContainer) {
      this.closeHighscores();
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.highscoreContainer = this.add.container(width / 2, height / 2);
    this.highscoreContainer.setDepth(100);
    
    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-360, -250, 720, 500, 16);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-360, -250, 720, 500, 16);
    bg.lineStyle(1, 0x8b6914, 1);
    bg.strokeRoundedRect(-355, -245, 710, 490, 14);
    this.highscoreContainer.add(bg);
    
    // Title
    const title = this.add.text(0, -220, '🏆 HIGHSCORES 🏆', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.highscoreContainer.add(title);
    
    // Load highscores
    const highscores = this.loadHighscores();
    
    if (highscores.length === 0) {
      const noScores = this.add.text(0, 0, 'No highscores yet!\nPlay a game to set the first record.', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#888888',
        align: 'center'
      }).setOrigin(0.5);
      this.highscoreContainer.add(noScores);
    } else {
      // Header row
      const headerY = -170;
      const headers = [
        { text: '#', x: -320 },
        { text: 'Name', x: -260 },
        { text: 'Score', x: -80 },
        { text: 'Wave', x: 30 },
        { text: 'HP', x: 110 },
        { text: 'Time', x: 170 },
        { text: 'Date', x: 250 }
      ];
      
      headers.forEach(h => {
        const headerText = this.add.text(h.x, headerY, h.text, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#c9a86c'
        }).setOrigin(h.text === '#' ? 0.5 : 0, 0.5);
        this.highscoreContainer!.add(headerText);
      });
      
      // Separator line
      const sepLine = this.add.graphics();
      sepLine.lineStyle(1, 0x4a3520, 1);
      sepLine.lineBetween(-330, headerY + 20, 330, headerY + 20);
      this.highscoreContainer.add(sepLine);
      
      // Score rows
      const rowHeight = 35;
      const startY = headerY + 45;
      
      highscores.slice(0, 10).forEach((score, index) => {
        const y = startY + index * rowHeight;
        const isTop3 = index < 3;
        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
        const rankColor = isTop3 ? rankColors[index] : '#888888';
        
        // Rank
        const rank = this.add.text(-320, y, `${index + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '18px',
          color: rankColor
        }).setOrigin(0.5, 0.5);
        this.highscoreContainer!.add(rank);
        
        // Name
        const name = this.add.text(-260, y, this.truncateName(score.playerName, 10), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(name);
        
        // Score
        const scoreText = this.add.text(-80, y, score.score.toLocaleString(), {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: isTop3 ? '#ffd700' : '#ffcc44'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(scoreText);
        
        // Wave - use totalWaves from score if available, fallback to 35
        const totalWaves = score.totalWaves || 35;
        const isVictory = score.waveReached >= totalWaves;
        const wave = this.add.text(30, y, `${score.waveReached}/${totalWaves}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: isVictory ? '#00ff00' : '#aaaaaa'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(wave);
        
        // HP left
        const hpLeft = score.runStats?.hpLeft ?? 0;
        const hpText = this.add.text(110, y, `${hpLeft}❤️`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: hpLeft > 0 ? '#ff6666' : '#666666'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(hpText);
        
        // Time
        const timeSeconds = score.runStats?.timeSeconds ?? 0;
        const timeStr = this.formatTime(timeSeconds);
        const timeText = this.add.text(170, y, timeStr, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#88ccff'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(timeText);
        
        // Date
        const dateStr = this.formatDate(score.date);
        const dateText = this.add.text(250, y, dateStr, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#666666'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(dateText);
      });
    }
    
    // Close button
    const closeBtn = this.add.text(0, 210, '✕ Close', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 25, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setStyle({ backgroundColor: '#6b4d30' }));
    closeBtn.on('pointerout', () => closeBtn.setStyle({ backgroundColor: '#4a3520' }));
    closeBtn.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.closeHighscores();
    });
    
    this.highscoreContainer.add(closeBtn);
    
    // Fade in animation
    this.highscoreContainer.setAlpha(0);
    this.tweens.add({
      targets: this.highscoreContainer,
      alpha: 1,
      duration: 200
    });
  }

  private closeHighscores(): void {
    if (this.highscoreContainer) {
      this.tweens.add({
        targets: this.highscoreContainer,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.highscoreContainer?.destroy();
          this.highscoreContainer = null;
        }
      });
    }
  }

  private loadHighscores(): Highscore[] {
    try {
      const data = localStorage.getItem(HIGHSCORES_KEY);
      if (data) {
        return JSON.parse(data) as Highscore[];
      }
    } catch (e) {
      console.warn('Failed to load highscores:', e);
    }
    return [];
  }

  private truncateName(name: string, maxLength: number): string {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 1) + '…';
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Show settings modal with volume controls
   */
  private showSettings(): void {
    // If already showing, close it
    if (this.settingsContainer) {
      this.closeSettings();
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.settingsContainer = this.add.container(width / 2, height / 2);
    this.settingsContainer.setDepth(100);
    
    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-200, -150, 400, 300, 16);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-200, -150, 400, 300, 16);
    this.settingsContainer.add(bg);
    
    // Title
    const title = this.add.text(0, -120, '⚙ SETTINGS', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.settingsContainer.add(title);
    
    // BGM Volume
    this.createVolumeSlider('Music', -50, this.audioManager.getBGMVolume(), (value) => {
      this.audioManager.setBGMVolume(value);
    });
    
    // SFX Volume  
    this.createVolumeSlider('Effects', 20, this.audioManager.getSFXVolume(), (value) => {
      this.audioManager.setSFXVolume(value);
    });
    
    // Close button
    const closeBtn = this.add.text(0, 110, '✕ Close', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 25, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setStyle({ backgroundColor: '#6b4d30' }));
    closeBtn.on('pointerout', () => closeBtn.setStyle({ backgroundColor: '#4a3520' }));
    closeBtn.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.closeSettings();
    });
    
    this.settingsContainer.add(closeBtn);
    
    // Fade in animation
    this.settingsContainer.setAlpha(0);
    this.tweens.add({
      targets: this.settingsContainer,
      alpha: 1,
      duration: 200
    });
  }

  /**
   * Create a volume slider control
   */
  private createVolumeSlider(label: string, y: number, initialValue: number, onChange: (value: number) => void): void {
    if (!this.settingsContainer) return;
    
    // Label
    const labelText = this.add.text(-150, y, label + ':', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#c9a86c'
    }).setOrigin(0, 0.5);
    this.settingsContainer.add(labelText);
    
    // Slider track
    const trackWidth = 200;
    const trackHeight = 8;
    const trackX = -50;
    
    const track = this.add.graphics();
    track.fillStyle(0x2a1a08, 1);
    track.fillRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    track.lineStyle(1, 0x4a3520, 1);
    track.strokeRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    this.settingsContainer.add(track);
    
    // Filled portion
    const fill = this.add.graphics();
    this.settingsContainer.add(fill);
    
    // Slider handle
    const handle = this.add.graphics();
    handle.fillStyle(0xd4a574, 1);
    handle.fillCircle(0, 0, 12);
    handle.lineStyle(2, 0xffd700, 1);
    handle.strokeCircle(0, 0, 12);
    handle.setPosition(trackX + initialValue * trackWidth, y);
    handle.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    handle.input!.cursor = 'pointer';
    this.settingsContainer.add(handle);
    
    // Value text
    const valueText = this.add.text(trackX + trackWidth + 20, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.settingsContainer.add(valueText);
    
    // Update fill
    const updateFill = (value: number) => {
      fill.clear();
      fill.fillStyle(0xd4a574, 1);
      fill.fillRoundedRect(trackX, y - trackHeight / 2, value * trackWidth, trackHeight, 4);
    };
    updateFill(initialValue);
    
    // Drag handling
    let isDragging = false;
    
    handle.on('pointerdown', () => {
      isDragging = true;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!isDragging || !this.settingsContainer) return;
      
      // Convert to container-local coordinates
      const localX = pointer.x - this.settingsContainer.x;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
    });
    
    // Click on track to jump
    const trackHitArea = this.add.rectangle(trackX + trackWidth / 2, y, trackWidth, 30, 0x000000, 0);
    trackHitArea.setInteractive({ useHandCursor: true });
    this.settingsContainer.add(trackHitArea);
    
    trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.settingsContainer) return;
      const localX = pointer.x - this.settingsContainer.x;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
      this.audioManager.playSFX('ui_click');
    });
  }

  /**
   * Close settings modal
   */
  private closeSettings(): void {
    if (this.settingsContainer) {
      this.tweens.add({
        targets: this.settingsContainer,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.settingsContainer?.destroy();
          this.settingsContainer = null;
        }
      });
    }
  }
}
