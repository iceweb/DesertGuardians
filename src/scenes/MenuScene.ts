import Phaser from 'phaser';
import type { Highscore } from './ResultsScene';

const HIGHSCORES_KEY = 'tower_defense_highscores';

export class MenuScene extends Phaser.Scene {
  private highscoreContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

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
      this.showHighscores();
    });

    // Version text
    const version = this.add.text(width - 10, height - 10, 'v0.9.0 - Step 9', {
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
    bg.fillRoundedRect(-280, -250, 560, 500, 16);
    bg.lineStyle(3, 0xd4a574, 1);
    bg.strokeRoundedRect(-280, -250, 560, 500, 16);
    bg.lineStyle(1, 0x8b6914, 1);
    bg.strokeRoundedRect(-275, -245, 550, 490, 14);
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
        { text: '#', x: -240 },
        { text: 'Name', x: -180 },
        { text: 'Score', x: 0 },
        { text: 'Wave', x: 100 },
        { text: 'Date', x: 200 }
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
      sepLine.lineBetween(-250, headerY + 20, 250, headerY + 20);
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
        const rank = this.add.text(-240, y, `${index + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '18px',
          color: rankColor
        }).setOrigin(0.5, 0.5);
        this.highscoreContainer!.add(rank);
        
        // Name
        const name = this.add.text(-180, y, this.truncateName(score.playerName, 12), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(name);
        
        // Score
        const scoreText = this.add.text(0, y, score.score.toLocaleString(), {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: isTop3 ? '#ffd700' : '#ffcc44'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(scoreText);
        
        // Wave
        const wave = this.add.text(100, y, `${score.waveReached}/25`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: score.waveReached === 25 ? '#00ff00' : '#aaaaaa'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(wave);
        
        // Date
        const dateStr = this.formatDate(score.date);
        const dateText = this.add.text(200, y, dateStr, {
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
    closeBtn.on('pointerdown', () => this.closeHighscores());
    
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
}
