import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
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
    const version = this.add.text(width - 10, height - 10, 'v0.1.0 - Step 1', {
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
    // TODO: Implement highscores display in Step 9
    console.log('MenuScene: Highscores (not yet implemented)');
    
    // For now, show a simple message
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const message = this.add.text(width / 2, height - 100, 'Highscores coming soon!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#888888'
    });
    message.setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }
}
