import Phaser from 'phaser';
import type { GameResultData } from './ResultsScene';
import { GAME_CONFIG } from '../data/GameConfig';
import { HighscoreAPI } from '../managers';
import type { GlobalScore } from '../managers';

export interface GameSceneResultsUIHost {
  cameras: { main: Phaser.Cameras.Scene2D.Camera };
  add: Phaser.GameObjects.GameObjectFactory;
  tweens: Phaser.Tweens.TweenManager;
  time: Phaser.Time.Clock;
  input: Phaser.Input.InputPlugin;
  scene: Phaser.Scenes.ScenePlugin;

  playSFX(key: string): void;

  setReviewMode(enabled: boolean): void;
}

export class GameSceneResultsUI {
  private host: GameSceneResultsUIHost;

  private resultsPopup: Phaser.GameObjects.Container | null = null;
  private resultData: GameResultData | null = null;
  private finalScore: number = 0;
  private scoreBreakdown: {
    waveScore: number;
    goldScore: number;
    hpBonus: number;
    timeMultiplier: number;
    difficultyMultiplier: number;
  } | null = null;
  private playerName: string = '';
  private nameInputText: Phaser.GameObjects.Text | null = null;
  private cursorVisible: boolean = true;
  private cursorTimer: Phaser.Time.TimerEvent | null = null;
  private hasSubmitted: boolean = false;
  private saveSection: Phaser.GameObjects.Container | null = null;
  private savedConfirmation: Phaser.GameObjects.Container | null = null;

  // Review mode state
  private isDefeatReview: boolean = false;
  private reviewModeUI: Phaser.GameObjects.Container | null = null;

  // Top 20 qualification
  private qualifiesForTop20: boolean = false;
  private currentScores: GlobalScore[] = [];

  constructor(host: GameSceneResultsUIHost) {
    this.host = host;
  }

  /**
   * Reset all state for a fresh game
   */
  reset(): void {
    this.resultsPopup = null;
    this.resultData = null;
    this.finalScore = 0;
    this.scoreBreakdown = null;
    this.playerName = '';
    this.nameInputText = null;
    this.cursorTimer = null;
    this.hasSubmitted = false;
    this.saveSection = null;
    this.savedConfirmation = null;
    this.isDefeatReview = false;
    this.reviewModeUI = null;
  }

  /**
   * Go to results (transition from gameplay to results view)
   */
  goToResults(isVictory: boolean, resultData: GameResultData): void {
    this.resultData = resultData;
    this.isDefeatReview = !isVictory;

    // Calculate final score
    this.calculateScore(resultData, isVictory);

    // Enable review mode for towers/goldmines
    this.host.setReviewMode(true);

    // Show results popup
    this.showResultsPopup();
  }

  /**
   * Calculate the score for the game result using spec formula
   */
  private calculateScore(result: GameResultData, isVictory: boolean): void {
    // Wave Score: points per wave completed
    const waveScore = result.waveReached * GAME_CONFIG.WAVE_BONUS_POINTS;

    // Gold Score: Total gold earned × multiplier
    const goldScore = Math.floor(result.totalGoldEarned * GAME_CONFIG.GOLD_BONUS_MULTIPLIER);

    // HP Bonus: points per HP remaining
    const hpBonus = result.castleHP * GAME_CONFIG.HP_BONUS_POINTS;

    // Time Multiplier - Only applies on victory (completing all waves)
    // On defeat, time multiplier is neutral (1.0x)
    let timeMultiplier = 1.0;

    if (isVictory) {
      // Linear time bonus: every second counts between 15-35 minutes
      // - Faster than 15 min: capped at 1.35x
      // - Between 15-35 min: linear interpolation
      // - Slower than 35 min: floored at 1.0x (no penalty)
      //
      // Formula: max(1.0, min(1.35, 1.0 + 0.35 * (2100 - time) / 1200))
      //
      // Results:
      //   ≤15 min: 1.35x (cap)   | 25 min: 1.18x
      //   20 min: 1.26x          | 30 min: 1.09x
      //   22 min: 1.23x          | ≥35 min: 1.00x (floor)
      //
      const MIN_TIME = 900; // 15 minutes - max bonus threshold
      const MAX_TIME = 2100; // 35 minutes - no bonus threshold
      const CAP = 1.35; // Maximum multiplier
      const FLOOR = 1.0; // Minimum multiplier (no penalty)
      const BONUS_RANGE = 0.35; // Bonus points from floor to cap

      timeMultiplier = Math.max(
        FLOOR,
        Math.min(
          CAP,
          FLOOR + (BONUS_RANGE * (MAX_TIME - result.runTimeSeconds)) / (MAX_TIME - MIN_TIME)
        )
      );
    }

    // Difficulty Multiplier
    let difficultyMultiplier: number;
    switch (result.difficulty) {
      case 'Easy':
        difficultyMultiplier = 0.75;
        break;
      case 'Hard':
        difficultyMultiplier = 1.25;
        break;
      default:
        difficultyMultiplier = 1.0;
    }

    this.scoreBreakdown = { waveScore, goldScore, hpBonus, timeMultiplier, difficultyMultiplier };
    this.finalScore = Math.floor(
      (waveScore + goldScore + hpBonus) * timeMultiplier * difficultyMultiplier
    );
  }

  /**
   * Show the results popup overlay
   */
  /* eslint-disable max-lines-per-function */
  showResultsPopup(): void {
    if (this.resultsPopup) {
      this.resultsPopup.destroy();
    }

    // Hide review UI if showing
    if (this.reviewModeUI) {
      this.reviewModeUI.setVisible(false);
    }

    const width = this.host.cameras.main.width;
    const height = this.host.cameras.main.height;

    this.resultsPopup = this.host.add.container(width / 2, height / 2);
    this.resultsPopup.setDepth(300);

    // Dim background - blocks all clicks behind the popup
    const dimBg = this.host.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7);
    dimBg.setInteractive(); // Block clicks behind
    dimBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });
    this.resultsPopup.add(dimBg);

    const panelWidth = 500;
    const panelHeight = 720;

    const panelHitArea = this.host.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0);
    panelHitArea.setInteractive();
    panelHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });
    this.resultsPopup.add(panelHitArea);

    const panel = this.host.add.graphics();

    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(-panelWidth / 2 + 8, -panelHeight / 2 + 8, panelWidth, panelHeight, 16);

    panel.fillStyle(0x1a0a00, 0.98);
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);

    panel.lineStyle(3, 0xd4a574, 1);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    panel.lineStyle(1, 0x8b6914, 1);
    panel.strokeRoundedRect(
      -panelWidth / 2 + 6,
      -panelHeight / 2 + 6,
      panelWidth - 12,
      panelHeight - 12,
      12
    );

    const corners = [
      { x: -panelWidth / 2 + 20, y: -panelHeight / 2 + 20 },
      { x: panelWidth / 2 - 20, y: -panelHeight / 2 + 20 },
      { x: -panelWidth / 2 + 20, y: panelHeight / 2 - 20 },
      { x: panelWidth / 2 - 20, y: panelHeight / 2 - 20 },
    ];
    corners.forEach((c) => {
      panel.fillStyle(0xd4a574, 1);
      panel.fillCircle(c.x, c.y, 4);
    });
    this.resultsPopup.add(panel);

    const titleText = this.isDefeatReview ? '💀 DEFEAT' : '🏆 VICTORY!';
    const titleColor = this.isDefeatReview ? '#ff6666' : '#ffd700';
    const title = this.host.add
      .text(0, -panelHeight / 2 + 45, titleText, {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.resultsPopup.add(title);

    if (this.resultData && this.scoreBreakdown) {
      const result = this.resultData;
      const breakdown = this.scoreBreakdown;

      // Unified Score Breakdown Table
      let tableY = -panelHeight / 2 + 90;
      const rowHeight = 32;
      const labelX = -panelWidth / 2 + 40;
      const rawValueX = 60;
      const pointsX = panelWidth / 2 - 40;

      // Table header
      const headerBg = this.host.add.graphics();
      headerBg.fillStyle(0x2a1a00, 0.8);
      headerBg.fillRoundedRect(-panelWidth / 2 + 20, tableY - 8, panelWidth - 40, 28, 6);
      this.resultsPopup.add(headerBg);

      const headerLabel = this.host.add
        .text(labelX, tableY + 6, 'COMPONENT', {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: '#8b6914',
        })
        .setOrigin(0, 0.5);
      this.resultsPopup.add(headerLabel);

      const headerValue = this.host.add
        .text(rawValueX, tableY + 6, 'VALUE', {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: '#8b6914',
        })
        .setOrigin(0.5, 0.5);
      this.resultsPopup.add(headerValue);

      const headerPoints = this.host.add
        .text(pointsX, tableY + 6, 'POINTS', {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: '#8b6914',
        })
        .setOrigin(1, 0.5);
      this.resultsPopup.add(headerPoints);

      tableY += 35;

      // Score rows with raw values and point contributions
      const diffLabel =
        result.difficulty === 'Easy' ? 'Easy' : result.difficulty === 'Hard' ? 'Hard' : 'Normal';
      const diffColor =
        result.difficulty === 'Easy'
          ? '#44aa44'
          : result.difficulty === 'Hard'
            ? '#cc4444'
            : '#4488cc';

      const baseScore = breakdown.waveScore + breakdown.goldScore + breakdown.hpBonus;

      const scoreRows: Array<{
        label: string;
        rawValue: string;
        points: string;
        labelColor: string;
        valueColor: string;
        pointsColor: string;
        isMultiplier?: boolean;
        separator?: boolean;
      }> = [
        {
          label: '⚔ Waves Completed',
          rawValue: `${result.waveReached}/${result.totalWaves}`,
          points: `+${breakdown.waveScore}`,
          labelColor: '#aaaaaa',
          valueColor: '#ffffff',
          pointsColor: '#88ff88',
        },
        {
          label: '💰 Gold Earned',
          rawValue: `${result.totalGoldEarned}`,
          points: `+${breakdown.goldScore}`,
          labelColor: '#aaaaaa',
          valueColor: '#ffd700',
          pointsColor: '#88ff88',
        },
        {
          label: '❤ Castle HP',
          rawValue: `${result.castleHP}/${result.maxCastleHP}`,
          points: `+${breakdown.hpBonus}`,
          labelColor: '#aaaaaa',
          valueColor: result.castleHP > 0 ? '#66ff66' : '#ff6666',
          pointsColor: '#88ff88',
        },
        {
          label: '',
          rawValue: '',
          points: '',
          labelColor: '',
          valueColor: '',
          pointsColor: '',
          separator: true,
        },
        {
          label: '  Base Score',
          rawValue: '',
          points: `= ${baseScore}`,
          labelColor: '#888888',
          valueColor: '',
          pointsColor: '#ffffff',
        },
        {
          label: '',
          rawValue: '',
          points: '',
          labelColor: '',
          valueColor: '',
          pointsColor: '',
          separator: true,
        },
        {
          label: '⏱ Time Bonus',
          rawValue: this.formatTime(result.runTimeSeconds),
          points: `×${breakdown.timeMultiplier.toFixed(2)}`,
          labelColor: '#aaaaaa',
          valueColor: '#88ccff',
          pointsColor: breakdown.timeMultiplier >= 1.0 ? '#88ff88' : '#ffaa66',
          isMultiplier: true,
        },
        {
          label: `🎯 ${diffLabel} Mode`,
          rawValue: '',
          points: `×${breakdown.difficultyMultiplier.toFixed(2)}`,
          labelColor: '#aaaaaa',
          valueColor: diffColor,
          pointsColor: diffColor,
          isMultiplier: true,
        },
      ];

      scoreRows.forEach((row) => {
        if (row.separator) {
          const line = this.host.add.graphics();
          line.lineStyle(1, 0x4a3a20, 0.6);
          line.lineBetween(-panelWidth / 2 + 40, tableY, panelWidth / 2 - 40, tableY);
          this.resultsPopup?.add(line);
          tableY += 12;
          return;
        }

        const label = this.host.add
          .text(labelX, tableY, row.label, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: row.labelColor,
          })
          .setOrigin(0, 0.5);
        this.resultsPopup?.add(label);

        if (row.rawValue) {
          const value = this.host.add
            .text(rawValueX, tableY, row.rawValue, {
              fontFamily: 'Arial',
              fontSize: '14px',
              color: row.valueColor,
            })
            .setOrigin(0.5, 0.5);
          this.resultsPopup?.add(value);
        }

        const points = this.host.add
          .text(pointsX, tableY, row.points, {
            fontFamily: row.isMultiplier ? 'Arial Black' : 'Arial',
            fontSize: '14px',
            color: row.pointsColor,
          })
          .setOrigin(1, 0.5);
        this.resultsPopup?.add(points);

        tableY += rowHeight;
      });

      // Final score section with emphasis
      tableY += 10;
      const finalBg = this.host.add.graphics();
      finalBg.fillStyle(0x3a2a10, 0.9);
      finalBg.fillRoundedRect(-panelWidth / 2 + 20, tableY - 5, panelWidth - 40, 70, 8);
      finalBg.lineStyle(2, 0xffd700, 0.8);
      finalBg.strokeRoundedRect(-panelWidth / 2 + 20, tableY - 5, panelWidth - 40, 70, 8);
      this.resultsPopup.add(finalBg);

      const finalScoreLabel = this.host.add
        .text(0, tableY + 12, 'FINAL SCORE', {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: '#d4a574',
        })
        .setOrigin(0.5);
      this.resultsPopup.add(finalScoreLabel);

      const finalScoreValue = this.host.add
        .text(0, tableY + 45, `${this.finalScore}`, {
          fontFamily: 'Arial Black',
          fontSize: '36px',
          color: '#ffd700',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      this.resultsPopup.add(finalScoreValue);
    }

    const buttonY = panelHeight / 2 - 55;

    const reviewBtn = this.createThemedButton(-90, buttonY, 'Review Game', 140, () => {
      this.hideResultsPopup();
      this.createReviewModeUI();
    });
    this.resultsPopup.add(reviewBtn);

    const playAgainBtn = this.createThemedButton(90, buttonY, 'Play Again', 140, () => {
      this.host.scene.start('GameScene');
    });
    this.resultsPopup.add(playAgainBtn);

    const menuBtn = this.host.add
      .text(0, buttonY + 40, '← Back to Menu', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#d4a574'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.host.playSFX('ui_click');
      this.host.scene.start('MenuScene');
    });
    this.resultsPopup.add(menuBtn);

    this.checkTop20Qualification(panelHeight);

    this.resultsPopup.setAlpha(0);
    this.host.tweens.add({
      targets: this.resultsPopup,
      alpha: 1,
      duration: 300,
    });
  }

  private async checkTop20Qualification(panelHeight: number): Promise<void> {
    if (!this.resultsPopup) return;

    const nameY = panelHeight / 2 - 210;

    const loadingText = this.host.add
      .text(0, nameY, 'Checking leaderboard...', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);
    this.resultsPopup.add(loadingText);

    let playerRank = 0;

    try {
      this.currentScores = await HighscoreAPI.fetchScores();

      // Calculate player's rank (where they would place)
      playerRank = this.currentScores.filter((s) => s.score > this.finalScore).length + 1;

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

    if (this.qualifiesForTop20 && !this.hasSubmitted) {
      this.createNameEntrySection(nameY, playerRank);
    } else if (this.hasSubmitted) {
      this.createSubmittedSection(nameY);
    } else {
      this.createLeaderboardPreview(nameY, playerRank);
    }
  }

  private createNameEntrySection(nameY: number, playerRank: number): void {
    if (!this.resultsPopup) return;

    this.saveSection = this.host.add.container(0, nameY);

    // Show rank achievement only if rank was successfully fetched
    if (playerRank > 0) {
      const rankText = this.getRankText(playerRank);
      const rankLabel = this.host.add
        .text(0, -45, rankText, {
          fontFamily: 'Arial Black',
          fontSize: '18px',
          color: this.getRankColor(playerRank),
        })
        .setOrigin(0.5);
      this.saveSection.add(rankLabel);
    }

    const newHighScore = this.host.add
      .text(0, -20, '🎉 NEW HIGH SCORE! 🎉', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#ffd700',
      })
      .setOrigin(0.5);
    this.saveSection.add(newHighScore);

    const nameLabel = this.host.add
      .text(0, 5, 'Enter your name:', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);
    this.saveSection.add(nameLabel);

    const inputBg = this.host.add.graphics();
    inputBg.fillStyle(0x2a1a00, 1);
    inputBg.fillRoundedRect(-100, 25, 200, 30, 6);
    inputBg.lineStyle(1, 0x8b6914, 1);
    inputBg.strokeRoundedRect(-100, 25, 200, 30, 6);
    this.saveSection.add(inputBg);

    this.nameInputText = this.host.add
      .text(0, 40, '|', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.saveSection.add(this.nameInputText);

    this.cursorVisible = true;
    this.cursorTimer = this.host.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      },
    });

    const saveBtn = this.createThemedButton(0, 85, 'Save Score', 130, () => {
      this.saveScore();
    });
    this.saveSection.add(saveBtn);

    this.resultsPopup.add(this.saveSection);

    this.setupNameInput();
  }

  private createSubmittedSection(nameY: number): void {
    if (!this.resultsPopup) return;

    this.savedConfirmation = this.host.add.container(0, nameY);
    const savedText = this.host.add
      .text(0, 0, '✓ Score Submitted!', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#66ff66',
      })
      .setOrigin(0.5);
    this.savedConfirmation.add(savedText);
    this.resultsPopup.add(this.savedConfirmation);
  }

  private createLeaderboardPreview(nameY: number, playerRank: number): void {
    if (!this.resultsPopup) return;

    const container = this.host.add.container(0, nameY - 20);

    // Show player's rank only if successfully fetched from server
    if (playerRank > 0) {
      const rankText = this.getRankText(playerRank);
      const rankLabel = this.host.add
        .text(0, -45, rankText, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: this.getRankColor(playerRank),
        })
        .setOrigin(0.5);
      container.add(rankLabel);
    }

    const title = this.host.add
      .text(0, -15, '🏆 Top Scores', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#d4a574',
      })
      .setOrigin(0.5);
    container.add(title);

    const startY = 10;
    const rowHeight = 20;

    this.currentScores.slice(0, 5).forEach((score, i) => {
      const y = startY + i * rowHeight;
      const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#888888', '#888888'];

      const rank = this.host.add
        .text(-100, y, `${i + 1}.`, {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: rankColors[i],
        })
        .setOrigin(0, 0.5);
      container.add(rank);

      const name = this.host.add
        .text(-75, y, score.player_name.slice(0, 10), {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#cccccc',
        })
        .setOrigin(0, 0.5);
      container.add(name);

      const scoreText = this.host.add
        .text(100, y, score.score.toLocaleString(), {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#ffd700',
        })
        .setOrigin(1, 0.5);
      container.add(scoreText);
    });

    this.resultsPopup.add(container);
  }

  private createThemedButton(
    x: number,
    y: number,
    text: string,
    width: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.host.add.container(x, y);
    const height = 40;

    const bg = this.host.add.graphics();
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      bg.clear();
      const offsetY = pressed ? 2 : 0;

      if (!pressed) {
        bg.fillStyle(0x000000, 0.4);
        bg.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width, height, 10);
      }

      bg.fillStyle(0x4a3520, 1);
      bg.fillRoundedRect(-width / 2, -height / 2 + 3 + offsetY, width, height, 10);

      const baseColor = hover ? 0x8b6914 : 0x6b4914;
      bg.fillStyle(baseColor, 1);
      bg.fillRoundedRect(-width / 2, -height / 2 + offsetY, width, height - 3, 10);

      bg.fillStyle(hover ? 0xa08050 : 0x8b6914, 0.5);
      bg.fillRoundedRect(-width / 2 + 3, -height / 2 + 3 + offsetY, width - 6, height / 3, 8);

      bg.lineStyle(2, 0xd4a574, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2 + offsetY, width, height - 3, 10);
    };
    drawButton(false);
    container.add(bg);

    const label = this.host.add
      .text(0, -1, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#fff8dc',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    container.add(label);

    const hitArea = this.host.add.rectangle(0, 0, width, height, 0x000000, 0);
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

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      drawButton(true, true);
    });

    hitArea.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      drawButton(true);
      this.host.playSFX('ui_click');
      onClick();
    });

    return container;
  }

  private hideResultsPopup(): void {
    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = null;
    }
    if (this.resultsPopup) {
      this.resultsPopup.destroy();
      this.resultsPopup = null;
    }
  }

  private setupNameInput(): void {
    this.host.input.keyboard?.off('keydown');

    this.host.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.hasSubmitted || !this.resultsPopup) return;

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
    if (!this.nameInputText) return;
    const cursor = this.cursorVisible && !this.hasSubmitted ? '|' : '';
    const displayName = this.playerName || (this.hasSubmitted ? 'Anonymous' : '');
    this.nameInputText.setText(displayName + cursor);
  }

  /**
   * Submit score to global leaderboard
   */
  private async saveScore(): Promise<void> {
    if (this.hasSubmitted || !this.resultData) return;
    this.hasSubmitted = true;

    const name = this.playerName.trim() || 'Anonymous';

    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = null;
    }

    if (this.saveSection) {
      this.saveSection.setVisible(false);
    }

    const width = this.host.cameras.main.width;
    const submitStatus = this.host.add
      .text(width / 2, this.host.cameras.main.height / 2 + 180, '📡 Submitting to leaderboard...', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#88ccff',
      })
      .setOrigin(0.5)
      .setDepth(300);

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
        submitStatus.setText('✓ Score Submitted!');
        submitStatus.setColor('#00ff00');
      } else {
        submitStatus.setText('⚠ ' + (result.error || 'Could not submit'));
        submitStatus.setColor('#ffaa00');
        console.warn('GameScene: Global submission failed:', result.error);
      }
    } catch (error) {
      submitStatus.setText('⚠ Could not connect to server');
      submitStatus.setColor('#ffaa00');
      console.warn('GameScene: Global submission error:', error);
    }

    this.host.tweens.add({
      targets: submitStatus,
      alpha: 0,
      duration: 2000,
      delay: 2000,
    });
  }

  private createReviewModeUI(): void {
    const width = this.host.cameras.main.width;
    const height = this.host.cameras.main.height;

    this.reviewModeUI = this.host.add.container(0, 0);
    this.reviewModeUI.setDepth(200);

    const bgHeight = 70;
    const bg = this.host.add.graphics();
    bg.fillStyle(0x1a0a00, 0.9);
    bg.fillRect(0, height - bgHeight, width, bgHeight);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.lineBetween(0, height - bgHeight, width, height - bgHeight);
    this.reviewModeUI.add(bg);

    const modeText = this.isDefeatReview ? '💀 DEFEAT REVIEW' : '🏆 VICTORY REVIEW';
    const modeLabel = this.host.add
      .text(width / 2, height - bgHeight / 2 - 10, modeText, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: this.isDefeatReview ? '#ff6666' : '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.reviewModeUI.add(modeLabel);

    const hintText = this.host.add
      .text(width / 2, height - bgHeight / 2 + 15, 'Click on towers to review stats and strategy', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#c9a86c',
      })
      .setOrigin(0.5);
    this.reviewModeUI.add(hintText);

    const scoresBtn = this.createReviewButton(
      width / 2 - 200,
      height - bgHeight / 2,
      '🏆 My Score',
      () => {
        this.cleanupReviewMode();
        this.showResultsPopup();
      }
    );
    this.reviewModeUI.add(scoresBtn);

    const playAgainBtn = this.createReviewButton(
      width / 2 + 200,
      height - bgHeight / 2,
      '🔄 Play Again',
      () => {
        this.cleanupReviewMode();
        this.host.scene.start('GameScene');
      }
    );
    this.reviewModeUI.add(playAgainBtn);

    const menuBtn = this.createReviewButton(width - 80, height - bgHeight / 2, '☰ Menu', () => {
      this.cleanupReviewMode();
      this.host.scene.start('MenuScene');
    });
    this.reviewModeUI.add(menuBtn);
  }

  private cleanupReviewMode(): void {
    if (this.reviewModeUI) {
      this.reviewModeUI.destroy();
      this.reviewModeUI = null;
    }
  }

  private createReviewButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.host.add.container(x, y);

    const btnWidth = 100;
    const btnHeight = 32;

    const bg = this.host.add.graphics();
    bg.fillStyle(0x4a3520, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1, 0xd4a574, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    container.add(bg);

    const label = this.host.add
      .text(0, 0, text, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    container.add(label);

    const hitArea = this.host.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6b4d30, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(1, 0xffd700, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a3520, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(1, 0xd4a574, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    });

    hitArea.on('pointerdown', () => {
      this.host.playSFX('ui_click');
      onClick();
    });

    return container;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private getRankText(rank: number): string {
    if (rank === 1) return '🥇 1st Place!';
    if (rank === 2) return '🥈 2nd Place!';
    if (rank === 3) return '🥉 3rd Place!';
    if (rank <= 10) return `🏆 Top 10! (#${rank})`;
    if (rank <= 20) return `⭐ Top 20! (#${rank})`;
    return `Rank #${rank}`;
  }

  private getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return '#90EE90'; // Light green
    if (rank <= 20) return '#87CEEB'; // Sky blue
    return '#FFFFFF'; // White
  }
}
