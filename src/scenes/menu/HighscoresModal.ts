import Phaser from 'phaser';
import { AudioManager, HighscoreAPI } from '../../managers';
import type { GlobalScore } from '../../managers';
import { ModalButton } from './MenuButton';

/**
 * Highscores modal popup displaying global leaderboard
 */
export class HighscoresModal {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container: Phaser.GameObjects.Container | null = null;
  private onClose: () => void;

  private globalScoresCache: GlobalScore[] = [];
  private scoresLoading: boolean = false;

  private readonly panelWidth = 950;
  private readonly panelHeight = 800;

  constructor(scene: Phaser.Scene, audioManager: AudioManager, onClose: () => void) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.onClose = onClose;
  }

  show(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(100);

    // Background
    const bg = this.scene.add.graphics();
    this.drawBackground(bg);
    this.container.add(bg);

    // Title
    this.addTitle();

    // Load and display scores
    this.refreshHighscoreDisplay();

    // Close button
    const closeBtn = new ModalButton(this.scene, 0, this.panelHeight / 2 - 45, '✕  CLOSE', 140, 45);
    closeBtn.hitArea.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.close();
    });
    this.container.add(closeBtn.container);

    // Fade in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
    });
  }

  private drawBackground(bg: Phaser.GameObjects.Graphics): void {
    const { panelWidth, panelHeight } = this;

    // Shadow
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-panelWidth / 2 + 5, -panelHeight / 2 + 5, panelWidth, panelHeight, 18);

    // Main background
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);

    // Borders
    bg.lineStyle(4, 0x0a0400, 1);
    bg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);

    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(
      -panelWidth / 2 + 5,
      -panelHeight / 2 + 5,
      panelWidth - 10,
      panelHeight - 10,
      14
    );

    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(
      -panelWidth / 2 + 10,
      -panelHeight / 2 + 10,
      panelWidth - 20,
      panelHeight - 20,
      12
    );

    // Corner decorations
    this.drawCorner(bg, -panelWidth / 2 + 20, -panelHeight / 2 + 20);
    this.drawCorner(bg, panelWidth / 2 - 20, -panelHeight / 2 + 20);
    this.drawCorner(bg, -panelWidth / 2 + 20, panelHeight / 2 - 20);
    this.drawCorner(bg, panelWidth / 2 - 20, panelHeight / 2 - 20);
  }

  private drawCorner(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xd4a574, 1);
    g.fillCircle(x, y, 8);
    g.fillStyle(0x8b6914, 1);
    g.fillCircle(x, y, 5);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(x, y, 2);
  }

  private addTitle(): void {
    if (!this.container) return;

    const titleShadow = this.scene.add
      .text(2, -this.panelHeight / 2 + 38, '🏆  LEADERBOARD  🏆', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
    this.container.add(titleShadow);

    const title = this.scene.add
      .text(0, -this.panelHeight / 2 + 36, '🏆  LEADERBOARD  🏆', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: '#ffd700',
        stroke: '#4a3520',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(
      -this.panelWidth / 2 + 40,
      -this.panelHeight / 2 + 70,
      this.panelWidth / 2 - 40,
      -this.panelHeight / 2 + 70
    );
    this.container.add(titleLine);
  }

  private async refreshHighscoreDisplay(): Promise<void> {
    if (!this.container) return;

    const headerY = -this.panelHeight / 2 + 90;
    const startY = headerY + 35;
    const rowHeight = 24;

    if (!this.scoresLoading) {
      this.scoresLoading = true;

      const loadingText = this.scene.add
        .text(0, 0, 'Loading global scores...', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#888888',
        })
        .setOrigin(0.5);
      loadingText.setData('scoreRow', true);
      this.container.add(loadingText);

      try {
        this.globalScoresCache = await HighscoreAPI.fetchScores();
      } catch (e) {
        console.warn('Failed to fetch global scores:', e);
        this.globalScoresCache = [];
      }

      this.scoresLoading = false;
      loadingText.destroy();

      this.renderScoreRows(headerY, startY, rowHeight);
    } else {
      this.renderScoreRows(headerY, startY, rowHeight);
    }
  }

  private renderScoreRows(headerY: number, startY: number, rowHeight: number): void {
    if (!this.container) return;

    // Remove existing score rows
    const toRemove = this.container.list.filter(
      (obj: Phaser.GameObjects.GameObject) => obj.getData('scoreRow') === true
    );
    toRemove.forEach((obj: Phaser.GameObjects.GameObject) => obj.destroy());

    // Headers
    const headers = [
      { text: '#', x: -440, align: 0.5 },
      { text: 'Name', x: -400, align: 0 },
      { text: 'Diff', x: -270, align: 0.5 },
      { text: 'Score', x: -220, align: 0 },
      { text: 'Wave', x: -110, align: 0 },
      { text: 'HP', x: -30, align: 0 },
      { text: 'Gold', x: 50, align: 0 },
      { text: 'Kills', x: 140, align: 0 },
      { text: 'Time', x: 210, align: 0 },
      { text: 'Win', x: 290, align: 0 },
      { text: 'Date', x: 350, align: 0 },
    ];

    headers.forEach((h) => {
      const headerText = this.scene.add
        .text(h.x, headerY, h.text, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#c9a86c',
        })
        .setOrigin(h.align, 0.5);
      headerText.setData('scoreRow', true);
      this.container!.add(headerText);
    });

    // Separator line
    const sepLine = this.scene.add.graphics();
    sepLine.lineStyle(1, 0x4a3520, 1);
    sepLine.lineBetween(-450, headerY + 15, 450, headerY + 15);
    sepLine.setData('scoreRow', true);
    this.container.add(sepLine);

    this.renderGlobalScores(startY, rowHeight);
  }

  // eslint-disable-next-line max-lines-per-function
  private renderGlobalScores(startY: number, rowHeight: number): void {
    if (!this.container) return;

    if (this.globalScoresCache.length === 0) {
      const noScores = this.scene.add
        .text(0, startY + 100, 'No global scores yet!\nBe the first to submit a score.', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#888888',
          align: 'center',
        })
        .setOrigin(0.5);
      noScores.setData('scoreRow', true);
      this.container.add(noScores);
      return;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    this.globalScoresCache.slice(0, 25).forEach((score, index) => {
      const y = startY + index * rowHeight;
      const isTop3 = index < 3;
      const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
      const rankColor = isTop3 ? rankColors[index] : '#888888';

      // Rank
      const rank = this.scene.add
        .text(-440, y, `${index + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: rankColor,
        })
        .setOrigin(0.5, 0.5);
      rank.setData('scoreRow', true);
      this.container!.add(rank);

      // Name
      const name = this.scene.add
        .text(-400, y, this.truncateName(score.player_name, 12), {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff',
        })
        .setOrigin(0, 0.5);
      name.setData('scoreRow', true);
      this.container!.add(name);

      // Difficulty badge
      const diffBadge = score.difficulty === 'Easy' ? 'E' : score.difficulty === 'Hard' ? 'H' : 'N';
      const diffColor =
        score.difficulty === 'Easy'
          ? '#44aa44'
          : score.difficulty === 'Hard'
            ? '#cc4444'
            : '#4488cc';
      const difficulty = this.scene.add
        .text(-270, y, diffBadge, {
          fontFamily: 'Arial Black',
          fontSize: '11px',
          color: diffColor,
        })
        .setOrigin(0.5, 0.5);
      difficulty.setData('scoreRow', true);
      this.container!.add(difficulty);

      // Score
      const scoreText = this.scene.add
        .text(-220, y, score.score.toLocaleString(), {
          fontFamily: 'Arial Black',
          fontSize: '14px',
          color: isTop3 ? '#ffd700' : '#ffcc44',
        })
        .setOrigin(0, 0.5);
      scoreText.setData('scoreRow', true);
      this.container!.add(scoreText);

      // Wave
      const wave = this.scene.add
        .text(-110, y, `${score.wave_reached}/${score.total_waves}`, {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: score.is_victory ? '#00ff00' : '#aaaaaa',
        })
        .setOrigin(0, 0.5);
      wave.setData('scoreRow', true);
      this.container!.add(wave);

      // HP
      const hp = this.scene.add
        .text(-30, y, `${score.hp_remaining ?? 0}`, {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: (score.hp_remaining ?? 0) > 0 ? '#44ff44' : '#666666',
        })
        .setOrigin(0, 0.5);
      hp.setData('scoreRow', true);
      this.container!.add(hp);

      // Gold
      const gold = this.scene.add
        .text(50, y, this.formatNumber(score.gold_earned ?? 0), {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#ffd700',
        })
        .setOrigin(0, 0.5);
      gold.setData('scoreRow', true);
      this.container!.add(gold);

      // Kills
      const kills = this.scene.add
        .text(140, y, this.formatNumber(score.creeps_killed ?? 0), {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#ff8844',
        })
        .setOrigin(0, 0.5);
      kills.setData('scoreRow', true);
      this.container!.add(kills);

      // Time
      const time = this.scene.add
        .text(210, y, this.formatTime(score.time_seconds ?? 0), {
          fontFamily: 'Arial',
          fontSize: '13px',
          color: '#88ccff',
        })
        .setOrigin(0, 0.5);
      time.setData('scoreRow', true);
      this.container!.add(time);

      // Victory
      const victoryText = this.scene.add
        .text(290, y, score.is_victory ? '✓' : '✗', {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: score.is_victory ? '#00ff00' : '#ff6666',
        })
        .setOrigin(0, 0.5);
      victoryText.setData('scoreRow', true);
      this.container!.add(victoryText);

      // Date
      const dateText = this.scene.add
        .text(350, y, score.date, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#666666',
        })
        .setOrigin(0, 0.5);
      dateText.setData('scoreRow', true);
      this.container!.add(dateText);
    });
  }

  private truncateName(name: string, maxLength: number): string {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 1) + '…';
  }

  private formatNumber(num: number): string {
    if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  close(): void {
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.container?.destroy();
          this.container = null;
          this.onClose();
        },
      });
    }
  }

  isOpen(): boolean {
    return this.container !== null;
  }
}
