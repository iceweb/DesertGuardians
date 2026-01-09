import Phaser from 'phaser';
import { AudioManager } from '../managers';

/**
 * Data passed from GameScene to ResultsScene
 */
export interface GameResultData {
  isVictory: boolean;
  waveReached: number;
  totalWaves: number;
  castleHP: number;
  maxCastleHP: number;
  goldRemaining: number;
  totalGoldEarned: number;
  creepsKilled: number;
  runTimeSeconds: number;
}

/**
 * Highscore entry stored in localStorage
 */
export interface Highscore {
  playerName: string;
  score: number;
  waveReached: number;
  date: number;
  runStats: {
    hpLeft: number;
    goldEarned: number;
    timeSeconds: number;
  };
}

const HIGHSCORES_KEY = 'tower_defense_highscores';
const MAX_HIGHSCORES = 10;

export class ResultsScene extends Phaser.Scene {
  private resultData!: GameResultData;
  private finalScore: number = 0;
  private scoreBreakdown!: {
    waveScore: number;
    goldScore: number;
    hpBonus: number;
    timeMultiplier: number;
  };
  
  // Name input
  private playerName: string = '';
  private nameInputText!: Phaser.GameObjects.Text;
  private cursorVisible: boolean = true;
  private cursorTimer!: Phaser.Time.TimerEvent;
  private hasSubmitted: boolean = false;

  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data: GameResultData): void {
    this.resultData = data;
    this.playerName = '';
    this.hasSubmitted = false;
    this.calculateScore();
  }

  /**
   * Calculate the final score using the formula from spec
   */
  private calculateScore(): void {
    const data = this.resultData;
    
    // Wave Score: 1000 points per wave completed
    const waveScore = data.waveReached * 1000;
    
    // Gold Score: Total gold earned × 10
    const goldScore = data.totalGoldEarned * 10;
    
    // HP Bonus: 500 points per HP remaining (max 5000 for 10 HP)
    const hpBonus = data.castleHP * 500;
    
    // Time Multiplier:
    // Target = 900 seconds (15 min)
    // <= 900s: 1.5x
    // > 900s: max(1.0, 1.5 - (runTime - 900) / 1800)
    let timeMultiplier: number;
    if (data.runTimeSeconds <= 900) {
      timeMultiplier = 1.5;
    } else {
      timeMultiplier = Math.max(1.0, 1.5 - (data.runTimeSeconds - 900) / 1800);
    }
    
    // Final score: (base scores + HP bonus) × time multiplier
    this.finalScore = Math.floor((waveScore + goldScore + hpBonus) * timeMultiplier);
    
    this.scoreBreakdown = {
      waveScore,
      goldScore,
      hpBonus,
      timeMultiplier
    };
    
    console.log('ResultsScene: Score calculated', this.scoreBreakdown, 'Final:', this.finalScore);
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Stop game BGM
    const audioManager = AudioManager.getInstance();
    audioManager.stopBGM();

    this.cameras.main.setBackgroundColor('#1a0a00');
    
    // Create decorative background
    this.createBackground(width, height);
    
    // Title
    const titleText = this.resultData.isVictory ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀';
    const titleColor = this.resultData.isVictory ? '#ffd700' : '#ff4444';
    
    this.add.text(width / 2, 60, titleText, {
      fontFamily: 'Arial Black',
      fontSize: '56px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Stats display
    this.createStatsDisplay(width);
    
    // Score breakdown
    this.createScoreBreakdown(width);
    
    // Name input
    this.createNameInput(width, height);
    
    // Buttons
    this.createButtons(width, height);
    
    // Setup keyboard input for name
    this.setupKeyboardInput();
    
    console.log('ResultsScene: Results screen ready');
  }

  /**
   * Create decorative background
   */
  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    
    // Gradient-like effect with layered rectangles
    bg.fillStyle(0x2a1a10, 1);
    bg.fillRect(0, 0, width, height);
    
    // Decorative border
    bg.lineStyle(4, 0xd4a574, 1);
    bg.strokeRect(20, 20, width - 40, height - 40);
    bg.lineStyle(2, 0x8b6914, 1);
    bg.strokeRect(25, 25, width - 50, height - 50);
    
    // Corner decorations
    const cornerSize = 30;
    bg.fillStyle(0xd4a574, 1);
    bg.fillTriangle(20, 20, 20 + cornerSize, 20, 20, 20 + cornerSize);
    bg.fillTriangle(width - 20, 20, width - 20 - cornerSize, 20, width - 20, 20 + cornerSize);
    bg.fillTriangle(20, height - 20, 20 + cornerSize, height - 20, 20, height - 20 - cornerSize);
    bg.fillTriangle(width - 20, height - 20, width - 20 - cornerSize, height - 20, width - 20, height - 20 - cornerSize);
  }

  /**
   * Create stats display
   */
  private createStatsDisplay(width: number): void {
    const centerX = width / 2;
    const startY = 130;
    const lineHeight = 32;
    const labelOffset = 120;  // Distance from center to label (left)
    const valueOffset = 120;  // Distance from center to value (right)
    
    const stats = [
      { label: 'Wave Reached', value: `${this.resultData.waveReached} / ${this.resultData.totalWaves}`, color: '#ffffff' },
      { label: 'Castle HP', value: `${this.resultData.castleHP} / ${this.resultData.maxCastleHP}`, color: this.resultData.castleHP > 0 ? '#00ff00' : '#ff0000' },
      { label: 'Creeps Killed', value: `${this.resultData.creepsKilled}`, color: '#ff8844' },
      { label: 'Gold Earned', value: `${this.resultData.totalGoldEarned}`, color: '#ffd700' },
      { label: 'Time', value: this.formatTime(this.resultData.runTimeSeconds), color: '#88ccff' }
    ];
    
    stats.forEach((stat, index) => {
      const y = startY + index * lineHeight;
      
      this.add.text(centerX - labelOffset, y, stat.label + ':', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#c9a86c'
      }).setOrigin(1, 0.5);
      
      this.add.text(centerX + valueOffset, y, stat.value, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: stat.color
      }).setOrigin(1, 0.5);
    });
  }

  /**
   * Create score breakdown display
   */
  private createScoreBreakdown(width: number): void {
    const centerX = width / 2;
    const startY = 310;
    const lineHeight = 28;
    const labelOffset = 100;  // Distance from center to label (left)
    const valueOffset = 130;  // Distance from center to value (right)
    
    // Section title
    this.add.text(centerX, startY - 10, '─── Score Breakdown ───', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);
    
    const breakdown = [
      { label: 'Wave Bonus', value: `${this.resultData.waveReached} × 1000 = ${this.scoreBreakdown.waveScore}` },
      { label: 'Gold Bonus', value: `${this.resultData.totalGoldEarned} × 10 = ${this.scoreBreakdown.goldScore}` },
      { label: 'HP Bonus', value: `${this.resultData.castleHP} × 500 = ${this.scoreBreakdown.hpBonus}` },
      { label: 'Time Multiplier', value: `× ${this.scoreBreakdown.timeMultiplier.toFixed(2)}` }
    ];
    
    breakdown.forEach((item, index) => {
      const y = startY + 20 + index * lineHeight;
      
      this.add.text(centerX - labelOffset, y, item.label + ':', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#999999'
      }).setOrigin(1, 0.5);
      
      this.add.text(centerX + valueOffset, y, item.value, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc'
      }).setOrigin(1, 0.5);
    });
    
    // Final score (large)
    const finalY = startY + 20 + breakdown.length * lineHeight + 30;
    
    this.add.text(centerX, finalY, 'FINAL SCORE', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#d4a574'
    }).setOrigin(0.5);
    
    this.add.text(centerX, finalY + 45, this.finalScore.toLocaleString(), {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  /**
   * Create name input field
   */
  private createNameInput(width: number, height: number): void {
    const inputY = height - 180;
    
    this.add.text(width / 2, inputY - 30, 'Enter Your Name:', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#c9a86c'
    }).setOrigin(0.5);
    
    // Input background
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x3a2a18, 1);
    inputBg.fillRoundedRect(width / 2 - 150, inputY - 15, 300, 40, 8);
    inputBg.lineStyle(2, 0xd4a574, 1);
    inputBg.strokeRoundedRect(width / 2 - 150, inputY - 15, 300, 40, 8);
    
    // Name text (with cursor)
    this.nameInputText = this.add.text(width / 2, inputY + 5, '|', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Blinking cursor
    this.cursorTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });
  }

  /**
   * Create action buttons
   */
  private createButtons(width: number, height: number): void {
    const buttonY = height - 70;
    const audioManager = AudioManager.getInstance();
    
    // Submit/Save button
    const submitBtn = this.add.text(width / 2 - 120, buttonY, '💾 Save Score', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#4a7530',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    submitBtn.on('pointerover', () => submitBtn.setStyle({ backgroundColor: '#5a8540' }));
    submitBtn.on('pointerout', () => submitBtn.setStyle({ backgroundColor: '#4a7530' }));
    submitBtn.on('pointerdown', () => {
      audioManager.playSFX('ui_click');
      this.saveScore();
    });
    
    // Play Again button
    const playAgainBtn = this.add.text(width / 2 + 120, buttonY, '🔄 Play Again', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    playAgainBtn.on('pointerover', () => playAgainBtn.setStyle({ backgroundColor: '#6b4d30' }));
    playAgainBtn.on('pointerout', () => playAgainBtn.setStyle({ backgroundColor: '#4a3520' }));
    playAgainBtn.on('pointerdown', () => {
      audioManager.playSFX('ui_click');
      this.scene.start('GameScene');
    });
    
    // Menu button
    const menuBtn = this.add.text(width / 2, buttonY + 50, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => {
      audioManager.playSFX('ui_click');
      this.scene.start('MenuScene');
    });
  }

  /**
   * Setup keyboard input for name entry
   */
  private setupKeyboardInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.hasSubmitted) return;
      
      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key === 'Enter') {
        this.saveScore();
      } else if (event.key.length === 1 && this.playerName.length < 10) {
        // Only allow alphanumeric and some special chars
        if (/^[a-zA-Z0-9 _-]$/.test(event.key)) {
          this.playerName += event.key;
        }
      }
      
      this.updateNameDisplay();
    });
  }

  /**
   * Update the name display with cursor
   */
  private updateNameDisplay(): void {
    const cursor = this.cursorVisible && !this.hasSubmitted ? '|' : '';
    const displayName = this.playerName || (this.hasSubmitted ? 'Anonymous' : '');
    this.nameInputText.setText(displayName + cursor);
  }

  /**
   * Save score to localStorage
   */
  private saveScore(): void {
    if (this.hasSubmitted) return;
    this.hasSubmitted = true;
    
    const name = this.playerName.trim() || 'Anonymous';
    
    const newScore: Highscore = {
      playerName: name,
      score: this.finalScore,
      waveReached: this.resultData.waveReached,
      date: Date.now(),
      runStats: {
        hpLeft: this.resultData.castleHP,
        goldEarned: this.resultData.totalGoldEarned,
        timeSeconds: this.resultData.runTimeSeconds
      }
    };
    
    // Load existing scores
    const highscores = this.loadHighscores();
    
    // Add new score
    highscores.push(newScore);
    
    // Sort by score (desc), then HP (desc), then time (asc)
    highscores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.runStats.hpLeft !== a.runStats.hpLeft) return b.runStats.hpLeft - a.runStats.hpLeft;
      return a.runStats.timeSeconds - b.runStats.timeSeconds;
    });
    
    // Keep only top scores
    const trimmedScores = highscores.slice(0, MAX_HIGHSCORES);
    
    // Save
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(trimmedScores));
    
    // Update display
    this.cursorTimer.destroy();
    this.updateNameDisplay();
    
    // Show confirmation
    const width = this.cameras.main.width;
    const confirmText = this.add.text(width / 2, this.cameras.main.height - 130, '✓ Score Saved!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: confirmText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });
    
    console.log('ResultsScene: Score saved', newScore);
  }

  /**
   * Load highscores from localStorage
   */
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

  /**
   * Format time as mm:ss
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
