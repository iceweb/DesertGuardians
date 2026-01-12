import Phaser from 'phaser';
import { MapManager, PathSystem, CreepManager, WaveManager, TowerManager, ProjectileManager, CombatManager, HUDManager, AudioManager, GoldMineManager, GoldMineUIManager } from '../managers';
import { Creep } from '../objects';
import { GameEnvironment } from '../graphics';
import { GAME_CONFIG } from '../data/GameConfig';
import { MenuScene } from './MenuScene';
import type { GameResultData, Highscore } from './ResultsScene';

const HIGHSCORES_KEY = 'tower_defense_highscores';
const MAX_HIGHSCORES = 10;

export class GameScene extends Phaser.Scene {
  private mapManager!: MapManager;
  private pathSystem!: PathSystem;
  private creepManager!: CreepManager;
  private waveManager!: WaveManager;
  private towerManager!: TowerManager;
  private projectileManager!: ProjectileManager;
  private combatManager!: CombatManager;
  private environment!: GameEnvironment;
  private hudManager!: HUDManager;
  private audioManager!: AudioManager;
  private goldMineManager!: GoldMineManager;
  private goldMineUIManager!: GoldMineUIManager;

  // Game state
  private gold: number = GAME_CONFIG.STARTING_GOLD;
  private castleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private gameOver: boolean = false;
  
  // Virtual game time (advances faster at 2x speed)
  private virtualGameTime: number = 0;
  
  // Run statistics for scoring
  private gameStartTime: number = 0;  // Real time when wave 1 starts
  private hasGameStarted: boolean = false;
  
  // Review mode (after game over, player can review tower placement)
  private isReviewMode: boolean = false;
  private isDefeatReview: boolean = false;
  private reviewModeUI: Phaser.GameObjects.Container | null = null;
  
  // Results popup
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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(_data?: Record<string, unknown>): void {
    // Reset review mode flags on fresh start
    // (These are set internally now, not from scene data)
  }

  create(): void {
    // Reset game state
    this.gold = GAME_CONFIG.STARTING_GOLD;
    this.castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this.gameOver = false;
    this.virtualGameTime = 0;
    this.gameStartTime = 0;
    this.hasGameStarted = false;
    this.reviewModeUI = null;
    this.resultsPopup = null;
    this.resultData = null;
    this.isReviewMode = false;
    this.isDefeatReview = false;
    this.playerName = '';
    this.hasSubmitted = false;

    // Initialize managers
    this.mapManager = new MapManager(this);
    
    // Load and parse the map
    const mapData = this.mapManager.loadMap('level1');
    
    // Initialize path system with the path points from the map
    this.pathSystem = new PathSystem(mapData.pathPoints);

    // Initialize creep manager with object pooling
    this.creepManager = new CreepManager(this, this.pathSystem);

    // Initialize wave manager
    this.waveManager = new WaveManager(this, this.creepManager);
    this.waveManager.setPathSystem(this.pathSystem);
    this.setupWaveCallbacks();

    // Initialize tower manager
    this.towerManager = new TowerManager(this, this.pathSystem);
    this.setupTowerCallbacks();

    // Initialize projectile manager
    this.projectileManager = new ProjectileManager(this, this.creepManager);
    this.setupProjectileCallbacks();

    // Initialize combat manager
    this.combatManager = new CombatManager(this, this.towerManager, this.creepManager, this.projectileManager);
    this.setupCombatCallbacks();

    // Initialize and draw environment
    this.environment = new GameEnvironment(this, this.pathSystem);
    this.environment.drawAll(mapData.spawn, mapData.goal);

    // Initialize gold mine system
    this.goldMineManager = new GoldMineManager(this);
    this.goldMineManager.initializeFromPads(mapData.minePads);
    this.setupGoldMineCallbacks();
    
    // Connect gold mine manager to tower manager (to prevent tower menu on mine clicks)
    this.towerManager.setGoldMineManager(this.goldMineManager);
    
    this.goldMineUIManager = new GoldMineUIManager(this, this.goldMineManager);
    this.goldMineUIManager.getPlayerGold = () => this.gold;

    // Initialize HUD manager
    this.hudManager = new HUDManager(this);
    this.hudManager.create(this.waveManager.getTotalWaves());
    this.hudManager.setCastlePosition(this.environment.getCastlePosition());
    this.setupHUDCallbacks();

    // Initialize audio manager and start BGM
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();
    this.audioManager.playBGM();

    // Launch UIScene as overlay
    this.scene.launch('UIScene');

    // Setup creep click handler
    this.setupCreepClickHandler();

    console.log('GameScene: Desert Guardians initialized - Click anywhere to place towers!');
  }

  /**
   * Setup gold mine manager callbacks
   */
  private setupGoldMineCallbacks(): void {
    // Provide gold getter
    this.goldMineManager.getPlayerGold = () => this.gold;

    // Handle mine built
    this.goldMineManager.onMineBuild = (_mine, cost) => {
      this.gold -= cost;
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('build_thud');
      console.log(`Gold mine built! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };

    // Handle mine upgraded
    this.goldMineManager.onMineUpgraded = (_mine, cost) => {
      this.gold -= cost;
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('upgrade_tower');
      console.log(`Gold mine upgraded! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };
  }

  /**
   * Setup tower manager callbacks
   */
  private setupTowerCallbacks(): void {
    // Provide gold getter
    this.towerManager.getPlayerGold = () => this.gold;

    // Handle tower built
    this.towerManager.onTowerBuilt = (_tower, cost) => {
      this.gold -= cost;
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('build_thud');
      console.log(`Tower built! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };

    // Handle tower sold
    this.towerManager.onTowerSold = (_tower, refund) => {
      this.gold += refund;
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('sell_tower');
      console.log(`Tower sold! Refund: ${refund}g, Total gold: ${this.gold}`);
    };

    // Handle tower upgraded
    this.towerManager.onTowerUpgraded = (_tower, cost) => {
      this.gold -= cost;
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('upgrade_tower');
      console.log(`Tower upgraded! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };
  }

  /**
   * Setup projectile manager event callbacks for hit sounds
   */
  private setupProjectileCallbacks(): void {
    this.projectileManager.on('hit', (hitType: 'shield' | 'armor' | 'flesh') => {
      switch (hitType) {
        case 'shield':
          this.audioManager.playSFX('hit_shield');
          break;
        case 'armor':
          this.audioManager.playSFX('hit_armor');
          break;
        case 'flesh':
          this.audioManager.playSFX('hit_flesh');
          break;
      }
    });
  }

  /**
   * Setup wave manager event callbacks
   */
  private setupWaveCallbacks(): void {
    // Provide game speed getter for spawn timing
    this.waveManager.getGameSpeed = () => this.hudManager.getGameSpeed();
    
    this.waveManager.on('waveStart', (waveNumber: number) => {
      console.log(`Wave ${waveNumber} started!`);
      this.hudManager.updateWave(waveNumber);
      this.hudManager.hideStartWaveButton();
      this.audioManager.playSFX('wave_start');
      
      // Track game start time when wave 1 begins
      if (waveNumber === 1 && !this.hasGameStarted) {
        this.gameStartTime = Date.now();
        this.hasGameStarted = true;
      }
      
      // Emit event to UIScene
      this.registry.events.emit('wave-started', waveNumber);
    });

    this.waveManager.on('waveComplete', async (waveNumber: number) => {
      console.log(`GameScene.onWaveComplete: Wave ${waveNumber} complete!`);
      this.audioManager.playSFX('wave_complete');
      
      // Calculate wave bonus using centralized config
      // Waves 1-5: 10g, Waves 6-10: 15g, etc.
      const waveBonus = GAME_CONFIG.WAVE_GOLD_BONUS_BASE + 
        Math.floor((waveNumber - 1) / GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL) * GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT;
      
      // Silently add wave bonus gold (no animation - keep UI clean)
      this.gold += waveBonus;
      this.hudManager.updateGold(this.gold);
      
      // Small delay before showing mine income animation
      await new Promise<void>(resolve => this.time.delayedCall(300, () => resolve()));
      
      // Collect mine income with animation (this is the main visual feedback)
      const mineIncome = await this.goldMineManager.collectIncomeWithAnimation();
      if (mineIncome > 0) {
        this.gold += mineIncome;
        this.hudManager.updateGold(this.gold);
        console.log(`GameScene: Collected ${mineIncome}g from gold mines`);
      }
      
      // Automatically start next wave after a countdown (unless all waves done)
      if (waveNumber < this.waveManager.getTotalWaves()) {
        console.log(`GameScene.onWaveComplete: Showing countdown for wave ${waveNumber + 1}`);
        this.hudManager.showCountdown(waveNumber + 1, () => {
          if (!this.gameOver) {
            this.waveManager.startWave();
          }
        });
      }
    });

    this.waveManager.on('allWavesComplete', () => {
      console.log('All waves complete! Victory!');
      this.gameOver = true;
      this.audioManager.playSFX('victory');
      this.goToResults(true);
    });

    this.waveManager.on('creepKilled', (goldReward: number, deathX: number, deathY: number) => {
      this.gold += goldReward;
      this.hudManager.showFloatingText(`+${goldReward}`, deathX, deathY, 0xffd700);
      this.hudManager.updateGold(this.gold);
      this.audioManager.playSFX('gold_earn');
      
      // Emit event to UIScene
      this.registry.events.emit('creep-killed', goldReward);
    });

    this.waveManager.on('creepLeaked', () => {
      this.castleHP--;
      this.hudManager.updateCastleHP(this.castleHP);
      this.audioManager.playSFX('creep_leak');
      
      // Update castle damage visuals
      this.environment.updateCastleDamage(this.castleHP);
      
      // Camera shake for damage feedback
      this.cameras.main.shake(200, 0.01);
      
      // Emit event to UIScene for damage flash
      this.registry.events.emit('castle-damaged', this.castleHP);
      
      if (this.castleHP <= 0 && !this.gameOver) {
        this.gameOver = true;
        this.audioManager.playSFX('defeat');
        
        // Play castle destruction animation before showing results
        this.environment.playCastleDestructionAnimation(() => {
          this.goToResults(false);
        });
      }
    });
  }

  /**
   * Show results popup overlay with all run statistics
   */
  private goToResults(isVictory: boolean): void {
    const stats = this.waveManager.getTotalStats();
    const runTimeSeconds = this.hasGameStarted 
      ? Math.floor((Date.now() - this.gameStartTime) / 1000)
      : 0;
    
    // Game is no longer in progress (for menu resume functionality)
    MenuScene.setGameInProgress(false);
    
    // Store result data
    this.resultData = {
      isVictory,
      waveReached: this.waveManager.getCurrentWave(),
      totalWaves: this.waveManager.getTotalWaves(),
      castleHP: this.castleHP,
      maxCastleHP: GAME_CONFIG.MAX_CASTLE_HP,
      goldRemaining: this.gold,
      totalGoldEarned: stats.goldEarned,
      creepsKilled: stats.killed,
      runTimeSeconds
    };
    
    // Calculate score
    this.calculateScore();
    
    // Set review mode flags
    this.isReviewMode = true;
    this.isDefeatReview = !isVictory;
    
    // Enable review mode on tower manager and gold mine UI (hide upgrade/sell buttons)
    this.towerManager.setReviewMode(true);
    this.goldMineUIManager.setReviewMode(true);
    
    // Stop BGM
    this.audioManager.stopBGM();
    
    // Hide UIScene HUD elements
    this.scene.stop('UIScene');
    
    // Show the results popup
    this.showResultsPopup();
  }

  /**
   * Setup HUD manager callbacks
   */
  private setupHUDCallbacks(): void {
    this.hudManager.onStartWaveClicked = () => {
      if (!this.gameOver) {
        this.waveManager.startWave();
      }
    };

    this.hudManager.onMenuClicked = () => {
      // Sleep instead of stop so the game can be resumed
      this.scene.sleep('UIScene');
      this.scene.sleep('GameScene');
      this.scene.launch('MenuScene');
    };
  }

  /**
   * Setup creep click handler for showing stats
   */
  private setupCreepClickHandler(): void {
    this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      // Check if it's a Creep
      if (gameObject instanceof Creep && gameObject.getIsActive()) {
        const creep = gameObject as Creep;
        const config = creep.getConfig();
        
        this.hudManager.showCreepStats(
          config.type,
          creep.getCurrentHealth(),
          config.maxHealth,
          config.speed,
          config.armor,
          config.goldReward,
          creep.x,
          creep.y,
          config.hasShield,
          creep.getShieldHitsRemaining(),
          config.canJump
        );
      }
    });
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return;
    if (this.hudManager.isPausedState()) return;
    
    // Cap delta time to prevent spiral of death when tab is backgrounded
    // Max 50ms per frame (min 20fps)
    const cappedDelta = Math.min(delta, 50);

    // Get game speed multiplier from HUD
    const gameSpeed = this.hudManager.getGameSpeed();
    const scaledDelta = cappedDelta * gameSpeed;
    
    // Update virtual game time (for tower firing)
    this.virtualGameTime += scaledDelta;
    
    // Update all creeps with scaled delta
    this.creepManager.update(scaledDelta);
    
    // Update wave manager (for sequential group spawning)
    this.waveManager.update();
    
    // Update all projectiles with scaled delta
    this.projectileManager.update(scaledDelta);
    
    // Update tower manager (for UI refresh on gold change)
    this.towerManager.update();
    
    // Update gold mine UI manager (for UI refresh on gold change)
    this.goldMineUIManager.update();
    
    // Update combat (tower animations, targeting, and firing)
    this.combatManager.updateTowers(scaledDelta);
    this.combatManager.updateCombat(this.virtualGameTime);
    
    // Update environment animations (flag waving, etc.)
    this.environment.update(scaledDelta);
  }

  /**
   * Setup combat manager callback for tower fire sounds
   */
  private setupCombatCallbacks(): void {
    this.combatManager.onTowerFire = (branch: string) => {
      this.playTowerShootSound(branch);
    };
  }

  /**
   * Play shooting sound based on tower type
   */
  private playTowerShootSound(branch: string): void {
    switch (branch) {
      case 'archer':
        this.audioManager.playSFX('shoot_arrow');
        break;
      case 'rapidfire':
        this.audioManager.playSFX('shoot_rapidfire');
        break;
      case 'sniper':
        this.audioManager.playSFX('shoot_sniper');
        break;
      case 'rockcannon':
        this.audioManager.playSFX('shoot_cannon');
        break;
      case 'icetower':
        this.audioManager.playSFX('shoot_ice');
        break;
      case 'poison':
        this.audioManager.playSFX('shoot_poison');
        break;
    }
  }

  getPathSystem(): PathSystem {
    return this.pathSystem;
  }

  getMapManager(): MapManager {
    return this.mapManager;
  }

  getCreepManager(): CreepManager {
    return this.creepManager;
  }

  getWaveManager(): WaveManager {
    return this.waveManager;
  }

  getTowerManager(): TowerManager {
    return this.towerManager;
  }

  // ─────────────────────────────────────────────────────────────
  // REVIEW MODE & RESULTS POPUP
  // ─────────────────────────────────────────────────────────────

  /**
   * Calculate the final score using the formula from spec
   */
  private calculateScore(): void {
    if (!this.resultData) return;
    
    const data = this.resultData;
    
    // Wave Score: points per wave completed
    const waveScore = data.waveReached * GAME_CONFIG.WAVE_BONUS_POINTS;
    
    // Gold Score: Total gold earned × multiplier
    const goldScore = Math.floor(data.totalGoldEarned * GAME_CONFIG.GOLD_BONUS_MULTIPLIER);
    
    // HP Bonus: points per HP remaining
    const hpBonus = data.castleHP * GAME_CONFIG.HP_BONUS_POINTS;
    
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
  }

  /**
   * Show the results popup overlay
   */
  private showResultsPopup(): void {
    if (this.resultsPopup) {
      this.resultsPopup.destroy();
    }
    
    // Hide review UI if showing
    if (this.reviewModeUI) {
      this.reviewModeUI.setVisible(false);
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.resultsPopup = this.add.container(width / 2, height / 2);
    this.resultsPopup.setDepth(300);
    
    // Dim background - blocks all clicks behind the popup
    const dimBg = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7);
    dimBg.setInteractive(); // Block clicks behind
    dimBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });
    this.resultsPopup.add(dimBg);
    
    // Popup panel - also interactive to block clicks
    const panelWidth = 500;
    const panelHeight = 720;
    
    // Panel hit area to block clicks on the popup itself
    const panelHitArea = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0);
    panelHitArea.setInteractive();
    panelHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
    });
    this.resultsPopup.add(panelHitArea);
    
    const panel = this.add.graphics();
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
      panel.fillCircle(c.x, c.y, 8);
      panel.fillStyle(0x8b6914, 1);
      panel.fillCircle(c.x, c.y, 5);
      panel.fillStyle(0xffd700, 1);
      panel.fillCircle(c.x, c.y, 2);
    });
    
    this.resultsPopup.add(panel);
    
    if (!this.resultData || !this.scoreBreakdown) return;
    
    // Title
    const titleText = this.resultData.isVictory ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀';
    const titleColor = this.resultData.isVictory ? '#ffd700' : '#ff4444';
    
    const title = this.add.text(0, -panelHeight / 2 + 50, titleText, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.resultsPopup.add(title);
    
    // Stats display
    const startY = -panelHeight / 2 + 110;
    const lineHeight = 28;
    const labelOffset = 80;
    const valueOffset = 80;
    
    const stats = [
      { label: 'Wave Reached', value: `${this.resultData.waveReached} / ${this.resultData.totalWaves}`, color: '#ffffff' },
      { label: 'Castle HP', value: `${this.resultData.castleHP} / ${this.resultData.maxCastleHP}`, color: this.resultData.castleHP > 0 ? '#00ff00' : '#ff0000' },
      { label: 'Creeps Killed', value: `${this.resultData.creepsKilled}`, color: '#ff8844' },
      { label: 'Gold Earned', value: `${this.resultData.totalGoldEarned}`, color: '#ffd700' },
      { label: 'Time', value: this.formatTime(this.resultData.runTimeSeconds), color: '#88ccff' }
    ];
    
    stats.forEach((stat, index) => {
      const y = startY + index * lineHeight;
      
      this.add.text(-labelOffset, y, stat.label + ':', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#c9a86c'
      }).setOrigin(1, 0.5).setDepth(301);
      this.resultsPopup!.add(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);
      
      this.add.text(valueOffset, y, stat.value, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: stat.color
      }).setOrigin(1, 0.5).setDepth(301);
      this.resultsPopup!.add(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);
    });
    
    // Score breakdown section
    const breakdownY = startY + stats.length * lineHeight + 20;
    
    const breakdownTitle = this.add.text(0, breakdownY, '─── Score Breakdown ───', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    this.resultsPopup.add(breakdownTitle);
    
    const breakdown = [
      { label: 'Wave Bonus', value: `${this.resultData.waveReached} × ${GAME_CONFIG.WAVE_BONUS_POINTS} = ${this.scoreBreakdown.waveScore}` },
      { label: 'Gold Bonus', value: `${this.resultData.totalGoldEarned} × ${GAME_CONFIG.GOLD_BONUS_MULTIPLIER} = ${this.scoreBreakdown.goldScore}` },
      { label: 'HP Bonus', value: `${this.resultData.castleHP} × ${GAME_CONFIG.HP_BONUS_POINTS} = ${this.scoreBreakdown.hpBonus}` },
      { label: 'Time Multiplier', value: `× ${this.scoreBreakdown.timeMultiplier.toFixed(2)}` }
    ];
    
    breakdown.forEach((item, index) => {
      const y = breakdownY + 25 + index * 22;
      
      this.add.text(-70, y, item.label + ':', {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#999999'
      }).setOrigin(1, 0.5);
      this.resultsPopup!.add(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);
      
      this.add.text(100, y, item.value, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#cccccc'
      }).setOrigin(1, 0.5);
      this.resultsPopup!.add(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);
    });
    
    // Final score
    const finalY = breakdownY + 25 + breakdown.length * 22 + 20;
    
    const finalLabel = this.add.text(0, finalY, 'FINAL SCORE', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#d4a574'
    }).setOrigin(0.5);
    this.resultsPopup.add(finalLabel);
    
    const finalScoreText = this.add.text(0, finalY + 35, this.finalScore.toLocaleString(), {
      fontFamily: 'Arial Black',
      fontSize: '40px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.resultsPopup.add(finalScoreText);
    
    // === SAVE SECTION (name input + save button) ===
    const inputY = finalY + 90;
    this.saveSection = this.add.container(0, 0);
    this.resultsPopup.add(this.saveSection);
    
    const inputLabel = this.add.text(0, inputY, 'Enter Your Name:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#c9a86c'
    }).setOrigin(0.5);
    this.saveSection.add(inputLabel);
    
    // Input background
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x3a2a18, 1);
    inputBg.fillRoundedRect(-120, inputY + 10, 240, 35, 6);
    inputBg.lineStyle(2, 0xd4a574, 1);
    inputBg.strokeRoundedRect(-120, inputY + 10, 240, 35, 6);
    this.saveSection.add(inputBg);
    
    // Name text
    this.nameInputText = this.add.text(0, inputY + 27, '|', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.saveSection.add(this.nameInputText);
    
    // Blinking cursor
    this.cursorTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });
    
    // Setup keyboard input
    this.setupNameInput();
    
    // Save Score button (themed)
    const saveBtnY = inputY + 75;
    const saveBtn = this.createThemedButton(0, saveBtnY, '💾 Save Score', 110, () => {
      this.saveScore();
    });
    this.saveSection.add(saveBtn);
    
    // === SAVED CONFIRMATION (hidden initially unless already submitted) ===
    this.savedConfirmation = this.add.container(0, inputY + 30);
    this.resultsPopup.add(this.savedConfirmation);
    
    const savedText = this.add.text(0, 0, '✓ Score Saved!', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 2
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
      this.scene.start('GameScene');
    });
    this.resultsPopup.add(playAgainBtn);
    
    // Menu button
    const menuBtn = this.add.text(0, buttonY + 40, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerover', () => menuBtn.setColor('#d4a574'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.audioManager.playSFX('ui_click');
      this.scene.start('MenuScene');
    });
    this.resultsPopup.add(menuBtn);
    
    // Fade in
    this.resultsPopup.setAlpha(0);
    this.tweens.add({
      targets: this.resultsPopup,
      alpha: 1,
      duration: 300
    });
  }

  /**
   * Create a themed button matching the game style
   */
  private createThemedButton(x: number, y: number, text: string, width: number, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const height = 36;
    
    const bg = this.add.graphics();
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
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);
    
    const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0);
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
      this.audioManager.playSFX('ui_click');
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
    this.input.keyboard?.off('keydown');
    
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
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
      this.tweens.add({
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
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.reviewModeUI = this.add.container(0, 0);
    this.reviewModeUI.setDepth(200);
    
    // Semi-transparent overlay message at bottom
    const bgHeight = 70;
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a00, 0.9);
    bg.fillRect(0, height - bgHeight, width, bgHeight);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.lineBetween(0, height - bgHeight, width, height - bgHeight);
    this.reviewModeUI.add(bg);
    
    // Review mode label
    const modeText = this.isDefeatReview ? '💀 DEFEAT REVIEW' : '🏆 VICTORY REVIEW';
    const modeLabel = this.add.text(width / 2, height - bgHeight / 2 - 10, modeText, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: this.isDefeatReview ? '#ff6666' : '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.reviewModeUI.add(modeLabel);
    
    const hintText = this.add.text(width / 2, height - bgHeight / 2 + 15, 'Click on towers to review stats and strategy', {
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
      this.scene.start('GameScene');
    });
    this.reviewModeUI.add(playAgainBtn);
    
    // Menu button (far right)
    const menuBtn = this.createReviewButton(width - 80, height - bgHeight / 2, '☰ Menu', () => {
      this.cleanupReviewMode();
      this.scene.start('MenuScene');
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
    const container = this.add.container(x, y);
    
    const btnWidth = 100;
    const btnHeight = 32;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x4a3520, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1, 0xd4a574, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    container.add(bg);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(label);
    
    const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
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
      this.audioManager.playSFX('ui_click');
      onClick();
    });
    
    return container;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
