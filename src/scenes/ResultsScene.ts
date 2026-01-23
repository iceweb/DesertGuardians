import Phaser from 'phaser';
import { AudioManager, HighscoreAPI } from '../managers';
import type { GlobalScore, Difficulty } from '../managers';
import { GAME_CONFIG } from '../data/GameConfig';

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
  difficulty: Difficulty;
}

let lastGameResult: GameResultData | null = null;
let lastGameScore: number = 0;

export function getLastGameResult(): GameResultData | null {
  return lastGameResult;
}

export function getLastGameScore(): number {
  return lastGameScore;
}

export interface Highscore {
  playerName: string;
  score: number;
  waveReached: number;
  totalWaves: number;
  date: number;
  runStats: {
    hpLeft: number;
    goldEarned: number;
    timeSeconds: number;
  };
}

export class ResultsScene extends Phaser.Scene {
  private resultData!: GameResultData;
  private finalScore: number = 0;
  private scoreBreakdown!: {
    waveScore: number;
    goldScore: number;
    hpBonus: number;
    timeBonus: number;
  };

  private playerName: string = '';
  private nameInputText!: Phaser.GameObjects.Text;
  private cursorVisible: boolean = true;
  private cursorTimer!: Phaser.Time.TimerEvent;
  private hasSubmitted: boolean = false;

  // Global submission status
  private globalSubmitStatus!: Phaser.GameObjects.Text;

  // Top 20 qualification
  private qualifiesForTop20: boolean = false;
  private currentScores: GlobalScore[] = [];
  private nameInputContainer!: Phaser.GameObjects.Container;
  private leaderboardContainer!: Phaser.GameObjects.Container;

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

    // Wave Score: points per wave completed
    const waveScore = data.waveReached * GAME_CONFIG.WAVE_BONUS_POINTS;

    // Gold Score: Total gold earned × multiplier
    const goldScore = Math.floor(data.totalGoldEarned * GAME_CONFIG.GOLD_BONUS_MULTIPLIER);

    // HP Bonus: points per HP remaining
    const hpBonus = data.castleHP * GAME_CONFIG.HP_BONUS_POINTS;

    // Time Bonus: Additive points for fast completion
    // 80 min baseline, 1.5 pts per second saved, cap at 3000
    const MAX_TIME = 4800;
    const POINTS_PER_SECOND = 1.5;
    const CAP = 3000;
    const secondsSaved = Math.max(0, MAX_TIME - data.runTimeSeconds);
    const timeBonus = Math.min(CAP, Math.floor(secondsSaved * POINTS_PER_SECOND));

    // Final score: base scores + time bonus (no difficulty multiplier in legacy scene)
    this.finalScore = Math.floor(waveScore + goldScore + hpBonus + timeBonus);

    this.scoreBreakdown = {
      waveScore,
      goldScore,
      hpBonus,
      timeBonus,
    };

    // Store for review mode
    lastGameResult = this.resultData;
    lastGameScore = this.finalScore;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const audioManager = AudioManager.getInstance();
    audioManager.stopBGM();

    this.cameras.main.setBackgroundColor('#1a0a00');

    this.createBackground(width, height);

    const titleText = this.resultData.isVictory ? 'VICTORY!' : 'DEFEAT';
    const titleColor = this.resultData.isVictory ? '#ffd700' : '#ff4444';

    this.add
      .text(width / 2, 60, titleText, {
        fontFamily: 'Arial Black',
        fontSize: '56px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.createStatsDisplay(width);

    this.createScoreBreakdown(width);

    this.createButtons(width, height);

    this.setupKeyboardInput();

    this.checkTop20Qualification(width, height);
  }

  private async checkTop20Qualification(width: number, height: number): Promise<void> {
    const loadingText = this.add
      .text(width / 2, height - 180, 'Checking leaderboard...', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    try {
      this.currentScores = await HighscoreAPI.fetchScores();

      if (this.currentScores.length < 20) {
        this.qualifiesForTop20 = true;
      } else {
        const lowestScore = this.currentScores[this.currentScores.length - 1].score;
        this.qualifiesForTop20 = this.finalScore > lowestScore;
      }
    } catch (error) {
      console.warn('Could not fetch leaderboard, allowing submission:', error);

      this.qualifiesForTop20 = true;
    }

    loadingText.destroy();

    if (this.qualifiesForTop20) {
      this.createNameInput(width, height);
    } else {
      this.createLeaderboardDisplay(width, height);
    }
  }

  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();

    bg.fillStyle(0x2a1a10, 1);
    bg.fillRect(0, 0, width, height);

    bg.lineStyle(4, 0xd4a574, 1);
    bg.strokeRect(20, 20, width - 40, height - 40);
    bg.lineStyle(2, 0x8b6914, 1);
    bg.strokeRect(25, 25, width - 50, height - 50);

    const cornerSize = 30;
    bg.fillStyle(0xd4a574, 1);
    bg.fillTriangle(20, 20, 20 + cornerSize, 20, 20, 20 + cornerSize);
    bg.fillTriangle(width - 20, 20, width - 20 - cornerSize, 20, width - 20, 20 + cornerSize);
    bg.fillTriangle(20, height - 20, 20 + cornerSize, height - 20, 20, height - 20 - cornerSize);
    bg.fillTriangle(
      width - 20,
      height - 20,
      width - 20 - cornerSize,
      height - 20,
      width - 20,
      height - 20 - cornerSize
    );
  }

  private createStatsDisplay(width: number): void {
    const centerX = width / 2;
    const startY = 130;
    const lineHeight = 32;
    const labelOffset = 120;
    const valueOffset = 120;

    const stats = [
      {
        label: 'Wave Reached',
        value: `${this.resultData.waveReached} / ${this.resultData.totalWaves}`,
        color: '#ffffff',
      },
      {
        label: 'Castle HP',
        value: `${this.resultData.castleHP} / ${this.resultData.maxCastleHP}`,
        color: this.resultData.castleHP > 0 ? '#00ff00' : '#ff0000',
      },
      { label: 'Creeps Killed', value: `${this.resultData.creepsKilled}`, color: '#ff8844' },
      { label: 'Gold Earned', value: `${this.resultData.totalGoldEarned}`, color: '#ffd700' },
      { label: 'Time', value: this.formatTime(this.resultData.runTimeSeconds), color: '#88ccff' },
    ];

    stats.forEach((stat, index) => {
      const y = startY + index * lineHeight;

      this.add
        .text(centerX - labelOffset, y, stat.label + ':', {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#c9a86c',
        })
        .setOrigin(1, 0.5);

      this.add
        .text(centerX + valueOffset, y, stat.value, {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: stat.color,
        })
        .setOrigin(1, 0.5);
    });
  }

  private createScoreBreakdown(width: number): void {
    const centerX = width / 2;
    const startY = 310;
    const lineHeight = 28;
    const labelOffset = 100;
    const valueOffset = 130;

    this.add
      .text(centerX, startY - 10, '─── Score Breakdown ───', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5);

    const breakdown = [
      {
        label: 'Wave Bonus',
        value: `${this.resultData.waveReached} × ${GAME_CONFIG.WAVE_BONUS_POINTS} = ${this.scoreBreakdown.waveScore}`,
      },
      {
        label: 'Gold Bonus',
        value: `${this.resultData.totalGoldEarned} × ${GAME_CONFIG.GOLD_BONUS_MULTIPLIER} = ${this.scoreBreakdown.goldScore}`,
      },
      {
        label: 'HP Bonus',
        value: `${this.resultData.castleHP} × ${GAME_CONFIG.HP_BONUS_POINTS} = ${this.scoreBreakdown.hpBonus}`,
      },
      {
        label: 'Time Bonus',
        value:
          this.scoreBreakdown.timeBonus > 0
            ? `+${this.scoreBreakdown.timeBonus.toLocaleString()}`
            : '0',
      },
    ];

    breakdown.forEach((item, index) => {
      const y = startY + 20 + index * lineHeight;

      this.add
        .text(centerX - labelOffset, y, item.label + ':', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#999999',
        })
        .setOrigin(1, 0.5);

      this.add
        .text(centerX + valueOffset, y, item.value, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#cccccc',
        })
        .setOrigin(1, 0.5);
    });

    const finalY = startY + 20 + breakdown.length * lineHeight + 30;

    this.add
      .text(centerX, finalY, 'FINAL SCORE', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#d4a574',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, finalY + 45, this.finalScore.toLocaleString(), {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
  }

  private createNameInput(width: number, height: number): void {
    const centerY = height - 180;
    this.nameInputContainer = this.add.container(width / 2, centerY);

    const newHighScore = this.add
      .text(0, -70, '- NEW HIGH SCORE -', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#ffd700',
      })
      .setOrigin(0.5);
    this.nameInputContainer.add(newHighScore);

    const label = this.add
      .text(0, -30, 'Enter Your Name:', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#c9a86c',
      })
      .setOrigin(0.5);
    this.nameInputContainer.add(label);

    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x3a2a18, 1);
    inputBg.fillRoundedRect(-150, -15, 300, 40, 8);
    inputBg.lineStyle(2, 0xd4a574, 1);
    inputBg.strokeRoundedRect(-150, -15, 300, 40, 8);
    this.nameInputContainer.add(inputBg);

    this.nameInputText = this.add
      .text(0, 5, '|', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.nameInputContainer.add(this.nameInputText);

    const saveBtn = this.createThemedButtonForContainer(0, 50, 'Save Score', 150, () => {
      AudioManager.getInstance().playSFX('ui_click');
      this.saveScore();
    });
    this.nameInputContainer.add(saveBtn);

    this.cursorTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      },
    });
  }

  private createLeaderboardDisplay(width: number, height: number): void {
    const centerY = height - 180;
    this.leaderboardContainer = this.add.container(width / 2, centerY);

    const message = this.add
      .text(0, -80, 'Score not in top 20', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5);
    this.leaderboardContainer.add(message);

    const title = this.add
      .text(0, -50, 'Top Scores', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#d4a574',
      })
      .setOrigin(0.5);
    this.leaderboardContainer.add(title);

    const startY = -20;
    const rowHeight = 22;

    this.currentScores.slice(0, 5).forEach((score, i) => {
      const y = startY + i * rowHeight;
      const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#888888', '#888888'];

      const rank = this.add
        .text(-120, y, `${i + 1}.`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: rankColors[i],
        })
        .setOrigin(0, 0.5);
      this.leaderboardContainer.add(rank);

      const name = this.add
        .text(-90, y, score.player_name, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#cccccc',
        })
        .setOrigin(0, 0.5);
      this.leaderboardContainer.add(name);

      const scoreText = this.add
        .text(120, y, score.score.toLocaleString(), {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffd700',
        })
        .setOrigin(1, 0.5);
      this.leaderboardContainer.add(scoreText);
    });
  }

  private createButtons(width: number, height: number): void {
    const buttonY = height - 70;
    const audioManager = AudioManager.getInstance();

    this.createThemedButton(width / 2 - 90, buttonY, 'Review Game', 150, () => {
      audioManager.playSFX('ui_click');
      this.scene.start('GameScene', { reviewMode: true, isDefeat: !this.resultData.isVictory });
    });

    this.createThemedButton(width / 2 + 90, buttonY, 'Play Again', 150, () => {
      audioManager.playSFX('ui_click');
      this.scene.start('GameScene');
    });

    const menuBtn = this.add
      .text(width / 2, buttonY + 50, '← Back to Menu', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#d4a574'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => {
      audioManager.playSFX('ui_click');
      this.scene.start('MenuScene');
    });
  }

  private createThemedButton(
    x: number,
    y: number,
    text: string,
    btnWidth: number,
    onClick: () => void
  ): void {
    const container = this.add.container(x, y);
    const btnHeight = 42;

    const bg = this.add.graphics();
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      bg.clear();
      const offsetY = pressed ? 2 : 0;

      if (!pressed) {
        bg.fillStyle(0x000000, 0.4);
        bg.fillRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth, btnHeight, 10);
      }

      bg.fillStyle(0x4a3520, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2 + 3 + offsetY, btnWidth, btnHeight, 10);

      const baseColor = hover ? 0x8b6914 : 0x6b4914;
      bg.fillStyle(baseColor, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 3, 10);

      bg.fillStyle(hover ? 0xa08050 : 0x8b6914, 0.5);
      bg.fillRoundedRect(
        -btnWidth / 2 + 3,
        -btnHeight / 2 + 3 + offsetY,
        btnWidth - 6,
        btnHeight / 3,
        8
      );

      bg.lineStyle(2, 0xd4a574, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 3, 10);
    };
    drawButton(false);
    container.add(bg);

    const label = this.add
      .text(0, -2, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#fff8dc',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    container.add(label);

    const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      drawButton(true);
      label.setColor('#ffd700');
    });

    hitArea.on('pointerout', () => {
      drawButton(false);
      label.setColor('#fff8dc');
    });

    hitArea.on('pointerdown', () => {
      drawButton(true, true);
    });

    hitArea.on('pointerup', () => {
      drawButton(true);
      AudioManager.getInstance().playSFX('ui_click');
      onClick();
    });
  }

  private createThemedButtonForContainer(
    x: number,
    y: number,
    text: string,
    btnWidth: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnHeight = 42;

    const bg = this.add.graphics();
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      bg.clear();
      const offsetY = pressed ? 2 : 0;

      if (!pressed) {
        bg.fillStyle(0x000000, 0.4);
        bg.fillRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth, btnHeight, 10);
      }

      bg.fillStyle(0x4a3520, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2 + 3 + offsetY, btnWidth, btnHeight, 10);

      const baseColor = hover ? 0x8b6914 : 0x6b4914;
      bg.fillStyle(baseColor, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 3, 10);

      bg.fillStyle(hover ? 0xa08050 : 0x8b6914, 0.5);
      bg.fillRoundedRect(
        -btnWidth / 2 + 3,
        -btnHeight / 2 + 3 + offsetY,
        btnWidth - 6,
        btnHeight / 3,
        8
      );

      bg.lineStyle(2, 0xd4a574, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 3, 10);
    };
    drawButton(false);
    container.add(bg);

    const label = this.add
      .text(0, -2, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#fff8dc',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    container.add(label);

    const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      drawButton(true);
      label.setColor('#ffd700');
    });

    hitArea.on('pointerout', () => {
      drawButton(false);
      label.setColor('#fff8dc');
    });

    hitArea.on('pointerdown', () => {
      drawButton(true, true);
    });

    hitArea.on('pointerup', () => {
      drawButton(true);
      AudioManager.getInstance().playSFX('ui_click');
      onClick();
    });

    return container;
  }

  private setupKeyboardInput(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.hasSubmitted) return;

      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key === 'Enter') {
        this.saveScore();
      } else if (event.key.length === 1 && this.playerName.length < 10) {
        if (/^[a-zA-Z0-9 _-]$/.test(event.key)) {
          this.playerName += event.key;
        }
      }

      this.updateNameDisplay();
    });
  }

  private updateNameDisplay(): void {
    const cursor = this.cursorVisible && !this.hasSubmitted ? '|' : '';
    const displayName = this.playerName || (this.hasSubmitted ? 'Anonymous' : '');
    this.nameInputText.setText(displayName + cursor);
  }

  /**
   * Submit score to global leaderboard
   */
  private async saveScore(): Promise<void> {
    if (this.hasSubmitted) return;
    this.hasSubmitted = true;

    const name = this.playerName.trim() || 'Anonymous';

    this.cursorTimer.destroy();
    this.updateNameDisplay();

    const width = this.cameras.main.width;
    this.globalSubmitStatus = this.add
      .text(width / 2, this.cameras.main.height - 115, '📡 Submitting to global leaderboard...', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#88ccff',
      })
      .setOrigin(0.5);

    try {
      const result = await HighscoreAPI.submitScore({
        name,
        score: this.finalScore,
        waveReached: this.resultData.waveReached,
        totalWaves: this.resultData.totalWaves,
        hpRemaining: this.resultData.castleHP,
        goldEarned: this.resultData.totalGoldEarned,
        creepsKilled: this.resultData.creepsKilled,
        timeSeconds: this.resultData.runTimeSeconds,
        isVictory: this.resultData.isVictory,
        difficulty: this.resultData.difficulty,
      });

      if (result.success) {
        this.globalSubmitStatus.setText('✓ Score Submitted to Leaderboard!');
        this.globalSubmitStatus.setColor('#00ff00');
      } else {
        this.globalSubmitStatus.setText('⚠ ' + (result.error || 'Could not submit score'));
        this.globalSubmitStatus.setColor('#ffaa00');
        console.warn('ResultsScene: Global submission failed:', result.error);
      }
    } catch (error) {
      this.globalSubmitStatus.setText('⚠ Could not connect to server');
      this.globalSubmitStatus.setColor('#ffaa00');
      console.warn('ResultsScene: Global submission error:', error);
    }

    this.tweens.add({
      targets: this.globalSubmitStatus,
      alpha: 0,
      duration: 2000,
      delay: 3000,
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
