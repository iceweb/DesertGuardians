import Phaser from 'phaser';
import type { GameResultData, Highscore } from './ResultsScene';
import { GAME_CONFIG } from '../data/GameConfig';

const HIGHSCORES_KEY = 'tower_defense_highscores';
const MAX_HIGHSCORES = 10;

/**
 * Interface for GameScene methods that ResultsUI needs access to
 */
export interface GameSceneResultsUIHost {
  cameras: { main: Phaser.Cameras.Scene2D.Camera };
  add: Phaser.GameObjects.GameObjectFactory;
  tweens: Phaser.Tweens.TweenManager;
  time: Phaser.Time.Clock;
  input: Phaser.Input.InputPlugin;
  scene: Phaser.Scenes.ScenePlugin;
  
  // Audio
  playSFX(key: string): void;
  
  // Tower & goldmine review mode
  setReviewMode(enabled: boolean): void;
}

/**
 * Handles results popup and review mode UI for GameScene
 * Extracted to reduce GameScene file size
 */
export class GameSceneResultsUI {
  private host: GameSceneResultsUIHost;
  
  // Results popup state
  private resultsPopup: Phaser.GameObjects.Container | null = null;
  private resultData: GameResultData | null = null;
  private finalScore: number = 0;
  private scoreBreakdown: { waveScore: number; goldScore: number; hpBonus: number; timeMultiplier: number } | null = null;
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
  private calculateScore(result: GameResultData, _isVictory: boolean): void {
    // Wave Score: points per wave completed
    const waveScore = result.waveReached * GAME_CONFIG.WAVE_BONUS_POINTS;
    
    // Gold Score: Total gold earned × multiplier
    const goldScore = Math.floor(result.totalGoldEarned * GAME_CONFIG.GOLD_BONUS_MULTIPLIER);
    
    // HP Bonus: points per HP remaining
    const hpBonus = result.castleHP * GAME_CONFIG.HP_BONUS_POINTS;
    
    // Time Multiplier:
    // Target = 900 seconds (15 min)
    // <= 900s: 1.5x
    // > 900s: max(1.0, 1.5 - (runTime - 900) / 1800)
    let timeMultiplier: number;
    if (result.runTimeSeconds <= 900) {
      timeMultiplier = 1.5;
    } else {
      timeMultiplier = Math.max(1.0, 1.5 - (result.runTimeSeconds - 900) / 1800);
    }
    
    this.scoreBreakdown = { waveScore, goldScore, hpBonus, timeMultiplier };
    this.finalScore = Math.floor((waveScore + goldScore + hpBonus) * timeMultiplier);
  }

  /**
   * Show the results popup overlay
   */
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
    
    // Popup panel - also interactive to block clicks
    const panelWidth = 500;
    const panelHeight = 720;
    
    // Panel hit area to block clicks on the popup itself
    const panelHitArea = this.host.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0);
    panelHitArea.setInteractive();
    panelHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });
    this.resultsPopup.add(panelHitArea);
    
    const panel = this.host.add.graphics();
    // Shadow
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(-panelWidth / 2 + 8, -panelHeight / 2 + 8, panelWidth, panelHeight, 16);
    // Main background
    panel.fillStyle(0x1a0a00, 0.98);
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    // Border
    panel.lineStyle(3, 0xd4a574, 1);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    panel.lineStyle(1, 0x8b6914, 1);
    panel.strokeRoundedRect(-panelWidth / 2 + 6, -panelHeight / 2 + 6, panelWidth - 12, panelHeight - 12, 12);
    
    // Corner decorations
    const corners = [
      { x: -panelWidth / 2 + 20, y: -panelHeight / 2 + 20 },
      { x: panelWidth / 2 - 20, y: -panelHeight / 2 + 20 },
      { x: -panelWidth / 2 + 20, y: panelHeight / 2 - 20 },
      { x: panelWidth / 2 - 20, y: panelHeight / 2 - 20 }
    ];
    corners.forEach(c => {
      panel.fillStyle(0xd4a574, 1);
      panel.fillCircle(c.x, c.y, 4);
    });
    this.resultsPopup.add(panel);
    
    // Title based on victory/defeat
    const titleText = this.isDefeatReview ? '💀 DEFEAT' : '🏆 VICTORY!';
    const titleColor = this.isDefeatReview ? '#ff6666' : '#ffd700';
    const title = this.host.add.text(0, -panelHeight / 2 + 45, titleText, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.resultsPopup.add(title);
    
    // Result data
    if (this.resultData) {
      const result = this.resultData;
      
      // Wave info
      const waveText = this.host.add.text(0, -panelHeight / 2 + 95, 
        `Wave ${result.waveReached}/${result.totalWaves}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#c9a86c'
      }).setOrigin(0.5);
      this.resultsPopup.add(waveText);
      
      // Stats section
      const statsY = -panelHeight / 2 + 140;
      const statsGap = 28;
      
      const stats = [
        { label: 'Castle HP', value: `${result.castleHP}/${result.maxCastleHP}`, color: result.castleHP > 0 ? '#66ff66' : '#ff6666' },
        { label: 'Gold Earned', value: `${result.totalGoldEarned}`, color: '#ffd700' },
        { label: 'Time', value: this.formatTime(result.runTimeSeconds), color: '#88ccff' }
      ];
      
      stats.forEach((stat, i) => {
        const labelText = this.host.add.text(-100, statsY + i * statsGap, stat.label + ':', {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#888888'
        }).setOrigin(0, 0.5);
        this.resultsPopup?.add(labelText);
        
        const valueText = this.host.add.text(100, statsY + i * statsGap, stat.value, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: stat.color
        }).setOrigin(1, 0.5);
        this.resultsPopup?.add(valueText);
      });
      
      // Score breakdown
      const scoreY = statsY + stats.length * statsGap + 30;
      
      const scoreTitle = this.host.add.text(0, scoreY, '── Score Breakdown ──', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#8b6914'
      }).setOrigin(0.5);
      this.resultsPopup.add(scoreTitle);
      
      if (this.scoreBreakdown) {
        const breakdown = [
          { label: 'Wave Progress', value: `+${this.scoreBreakdown.waveScore}` },
          { label: 'Gold Efficiency', value: `+${this.scoreBreakdown.goldScore}` },
          { label: 'HP Bonus', value: `+${this.scoreBreakdown.hpBonus}` },
          { label: 'Time Multiplier', value: `×${this.scoreBreakdown.timeMultiplier.toFixed(2)}` }
        ];
        
        breakdown.forEach((item, i) => {
          const y = scoreY + 25 + i * 22;
          const labelText = this.host.add.text(-80, y, item.label, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#666666'
          }).setOrigin(0, 0.5);
          this.resultsPopup?.add(labelText);
          
          const valueText = this.host.add.text(80, y, item.value, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#aaaaaa'
          }).setOrigin(1, 0.5);
          this.resultsPopup?.add(valueText);
        });
      }
      
      // Final score
      const finalScoreY = scoreY + 120;
      const finalScoreLabel = this.host.add.text(0, finalScoreY, 'FINAL SCORE', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#d4a574'
      }).setOrigin(0.5);
      this.resultsPopup.add(finalScoreLabel);
      
      const finalScoreValue = this.host.add.text(0, finalScoreY + 35, `${this.finalScore}`, {
        fontFamily: 'Arial Black',
        fontSize: '40px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.resultsPopup.add(finalScoreValue);
    }
    
    // Highscores section
    const highscoresY = 50;
    const hsTitle = this.host.add.text(0, highscoresY, '🏅 High Scores', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#d4a574'
    }).setOrigin(0.5);
    this.resultsPopup.add(hsTitle);
    
    // Load and display highscores
    const highscores = this.loadHighscores();
    const hsListY = highscoresY + 30;
    const hsGap = 22;
    
    if (highscores.length === 0) {
      const noScores = this.host.add.text(0, hsListY + 20, 'No scores yet!', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#666666',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      this.resultsPopup.add(noScores);
    } else {
      const displayScores = highscores.slice(0, 5);
      displayScores.forEach((score, i) => {
        const y = hsListY + i * hsGap;
        const rankColor = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#888888';
        
        const rankText = this.host.add.text(-180, y, `${i + 1}.`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: rankColor
        }).setOrigin(0, 0.5);
        this.resultsPopup?.add(rankText);
        
        const nameText = this.host.add.text(-150, y, score.playerName, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#cccccc'
        }).setOrigin(0, 0.5);
        this.resultsPopup?.add(nameText);
        
        const scoreText = this.host.add.text(180, y, `${score.score}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffd700'
        }).setOrigin(1, 0.5);
        this.resultsPopup?.add(scoreText);
      });
    }
    
    // Name entry section
    const nameY = panelHeight / 2 - 160;
    
    // Save section container
    this.saveSection = this.host.add.container(0, nameY);
    
    const nameLabel = this.host.add.text(0, 0, 'Enter your name:', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    this.saveSection.add(nameLabel);
    
    // Input background
    const inputBg = this.host.add.graphics();
    inputBg.fillStyle(0x2a1a00, 1);
    inputBg.fillRoundedRect(-100, 15, 200, 30, 6);
    inputBg.lineStyle(1, 0x8b6914, 1);
    inputBg.strokeRoundedRect(-100, 15, 200, 30, 6);
    this.saveSection.add(inputBg);
    
    this.nameInputText = this.host.add.text(0, 30, '|', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.saveSection.add(this.nameInputText);
    
    // Setup cursor blinking
    this.cursorVisible = true;
    this.cursorTimer = this.host.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });
    
    // Save button
    const saveBtn = this.createThemedButton(0, 70, '💾 Save Score', 120, () => {
      this.saveScore();
    });
    this.saveSection.add(saveBtn);
    
    this.resultsPopup.add(this.saveSection);
    
    // Saved confirmation (hidden initially)
    this.savedConfirmation = this.host.add.container(0, nameY + 30);
    this.savedConfirmation.setVisible(false);
    const savedText = this.host.add.text(0, 0, '✓ Score Saved!', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#66ff66'
    }).setOrigin(0.5);
    this.savedConfirmation.add(savedText);
    
    // If already submitted, hide save section and show confirmation
    if (this.hasSubmitted) {
      this.saveSection.setVisible(false);
      this.savedConfirmation.setVisible(true);
    } else {
      this.saveSection.setVisible(true);
      this.savedConfirmation.setVisible(false);
    }
    
    // Buttons row
    const buttonY = panelHeight / 2 - 55;
    
    // Review Game button (themed)
    const reviewBtn = this.createThemedButton(-80, buttonY, '🔍 Review Game', 130, () => {
      this.hideResultsPopup();
      this.createReviewModeUI();
    });
    this.resultsPopup.add(reviewBtn);
    
    // Play Again button (themed)
    const playAgainBtn = this.createThemedButton(80, buttonY, '🔄 Play Again', 120, () => {
      this.host.scene.start('GameScene');
    });
    this.resultsPopup.add(playAgainBtn);
    
    // Menu button
    const menuBtn = this.host.add.text(0, buttonY + 40, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerover', () => menuBtn.setColor('#d4a574'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.host.playSFX('ui_click');
      this.host.scene.start('MenuScene');
    });
    this.resultsPopup.add(menuBtn);
    
    // Fade in
    this.resultsPopup.setAlpha(0);
    this.host.tweens.add({
      targets: this.resultsPopup,
      alpha: 1,
      duration: 300
    });
    
    // Setup keyboard input
    this.setupNameInput();
  }

  /**
   * Create a themed button matching the game style
   */
  private createThemedButton(x: number, y: number, text: string, width: number, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.host.add.container(x, y);
    const height = 36;
    
    const bg = this.host.add.graphics();
    const drawButton = (hover: boolean) => {
      bg.clear();
      // Button background
      bg.fillStyle(hover ? 0x5a4530 : 0x4a3520, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
      // Border
      bg.lineStyle(2, hover ? 0xffd700 : 0xd4a574, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
      // Inner highlight
      bg.lineStyle(1, 0x8b6914, 0.5);
      bg.strokeRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 6);
    };
    drawButton(false);
    container.add(bg);
    
    const label = this.host.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
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
      label.setColor('#ffffff');
    });
    
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.host.playSFX('ui_click');
      onClick();
    });
    
    return container;
  }

  /**
   * Hide the results popup (for review mode)
   */
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

  /**
   * Setup keyboard input for name entry
   */
  private setupNameInput(): void {
    // Remove any existing listener first
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

  /**
   * Update the name display with cursor
   */
  private updateNameDisplay(): void {
    if (!this.nameInputText) return;
    const cursor = this.cursorVisible && !this.hasSubmitted ? '|' : '';
    const displayName = this.playerName || (this.hasSubmitted ? 'Anonymous' : '');
    this.nameInputText.setText(displayName + cursor);
  }

  /**
   * Save score to localStorage
   */
  private saveScore(): void {
    if (this.hasSubmitted || !this.resultData) return;
    this.hasSubmitted = true;
    
    const name = this.playerName.trim() || 'Anonymous';
    
    const newScore: Highscore = {
      playerName: name,
      score: this.finalScore,
      waveReached: this.resultData.waveReached,
      totalWaves: this.resultData.totalWaves,
      date: Date.now(),
      runStats: {
        hpLeft: this.resultData.castleHP,
        goldEarned: this.resultData.totalGoldEarned,
        timeSeconds: this.resultData.runTimeSeconds
      }
    };
    
    // Load existing scores
    const highscores = this.loadHighscores();
    highscores.push(newScore);
    
    // Sort by score (desc), then HP (desc), then time (asc)
    highscores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.runStats.hpLeft !== a.runStats.hpLeft) return b.runStats.hpLeft - a.runStats.hpLeft;
      return a.runStats.timeSeconds - b.runStats.timeSeconds;
    });
    
    // Keep only top scores
    const trimmedScores = highscores.slice(0, MAX_HIGHSCORES);
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(trimmedScores));
    
    // Stop cursor blinking
    if (this.cursorTimer) {
      this.cursorTimer.destroy();
      this.cursorTimer = null;
    }
    
    // Hide save section, show confirmation
    if (this.saveSection) {
      this.saveSection.setVisible(false);
    }
    if (this.savedConfirmation) {
      this.savedConfirmation.setVisible(true);
      // Animate the confirmation
      this.savedConfirmation.setScale(0.5);
      this.savedConfirmation.setAlpha(0);
      this.host.tweens.add({
        targets: this.savedConfirmation,
        scale: 1,
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
    
    console.log('GameScene: Score saved', newScore);
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
   * Create UI elements for review mode (after closing results popup)
   */
  private createReviewModeUI(): void {
    const width = this.host.cameras.main.width;
    const height = this.host.cameras.main.height;
    
    this.reviewModeUI = this.host.add.container(0, 0);
    this.reviewModeUI.setDepth(200);
    
    // Semi-transparent overlay message at bottom
    const bgHeight = 70;
    const bg = this.host.add.graphics();
    bg.fillStyle(0x1a0a00, 0.9);
    bg.fillRect(0, height - bgHeight, width, bgHeight);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.lineBetween(0, height - bgHeight, width, height - bgHeight);
    this.reviewModeUI.add(bg);
    
    // Review mode label
    const modeText = this.isDefeatReview ? '💀 DEFEAT REVIEW' : '🏆 VICTORY REVIEW';
    const modeLabel = this.host.add.text(width / 2, height - bgHeight / 2 - 10, modeText, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: this.isDefeatReview ? '#ff6666' : '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.reviewModeUI.add(modeLabel);
    
    const hintText = this.host.add.text(width / 2, height - bgHeight / 2 + 15, 'Click on towers to review stats and strategy', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#c9a86c'
    }).setOrigin(0.5);
    this.reviewModeUI.add(hintText);
    
    // My Score button (left) - shows the results popup again
    const scoresBtn = this.createReviewButton(width / 2 - 200, height - bgHeight / 2, '🏆 My Score', () => {
      this.cleanupReviewMode();
      this.showResultsPopup();
    });
    this.reviewModeUI.add(scoresBtn);
    
    // Play Again button (right)
    const playAgainBtn = this.createReviewButton(width / 2 + 200, height - bgHeight / 2, '🔄 Play Again', () => {
      this.cleanupReviewMode();
      this.host.scene.start('GameScene');
    });
    this.reviewModeUI.add(playAgainBtn);
    
    // Menu button (far right)
    const menuBtn = this.createReviewButton(width - 80, height - bgHeight / 2, '☰ Menu', () => {
      this.cleanupReviewMode();
      this.host.scene.start('MenuScene');
    });
    this.reviewModeUI.add(menuBtn);
  }

  /**
   * Clean up review mode UI
   */
  private cleanupReviewMode(): void {
    if (this.reviewModeUI) {
      this.reviewModeUI.destroy();
      this.reviewModeUI = null;
    }
  }

  /**
   * Create a styled button for review mode
   */
  private createReviewButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.host.add.container(x, y);
    
    const btnWidth = 100;
    const btnHeight = 32;
    
    const bg = this.host.add.graphics();
    bg.fillStyle(0x4a3520, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1, 0xd4a574, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    container.add(bg);
    
    const label = this.host.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
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

  /**
   * Format seconds as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
