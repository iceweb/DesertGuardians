import Phaser from 'phaser';
import {
  MapManager,
  PathSystem,
  CreepManager,
  WaveManager,
  TowerManager,
  ProjectileManager,
  CombatManager,
  HUDManager,
  AudioManager,
  GoldMineManager,
  GoldMineUIManager,
  UIHitDetector,
  PopupController,
  GameController,
  HighscoreAPI,
} from '../managers';
import { InputQueue } from '../managers/InputQueue';
import type { Difficulty } from '../managers';
import { Creep } from '../objects';
import { GameEnvironment } from '../graphics';
import { GAME_CONFIG } from '../data/GameConfig';
import { MenuScene } from './MenuScene';
import { GameSceneResultsUI } from './GameSceneResultsUI';

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
  private uiHitDetector!: UIHitDetector;
  private popupController!: PopupController;

  private gameController!: GameController;

  private resultsUI!: GameSceneResultsUI;
  private difficultyOverlay: Phaser.GameObjects.Container | null = null;
  private gameReady: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(_data?: Record<string, unknown>): void {}

  create(): void {
    this.gameController = new GameController();
    this.gameController.reset();

    this.resultsUI = new GameSceneResultsUI({
      cameras: this.cameras,
      add: this.add,
      tweens: this.tweens,
      time: this.time,
      input: this.input,
      scene: this.scene,
      playSFX: (key: string) => this.audioManager.playSFX(key as import('../managers').SFXKey),
      setReviewMode: (enabled: boolean) => {
        this.towerManager.setReviewMode(enabled);
        this.goldMineUIManager.setReviewMode(enabled);
      },
    });
    this.resultsUI.reset();

    this.mapManager = new MapManager(this);

    const mapData = this.mapManager.loadMap('level1');

    this.pathSystem = new PathSystem(mapData.pathPoints);

    this.creepManager = new CreepManager(this, this.pathSystem);
    this.setupCreepCallbacks();

    this.waveManager = new WaveManager(this, this.creepManager);
    this.waveManager.setPathSystem(this.pathSystem);
    this.setupWaveCallbacks();

    this.towerManager = new TowerManager(this, this.pathSystem);
    this.setupTowerCallbacks();

    this.projectileManager = new ProjectileManager(this, this.creepManager);
    this.setupProjectileCallbacks();

    this.combatManager = new CombatManager(
      this,
      this.towerManager,
      this.creepManager,
      this.projectileManager
    );
    this.setupCombatCallbacks();

    this.environment = new GameEnvironment(this, this.pathSystem);
    this.environment.drawAll(mapData.spawn, mapData.goal);

    this.goldMineManager = new GoldMineManager(this);
    this.goldMineManager.initializeFromPads(mapData.minePads);
    this.setupGoldMineCallbacks();

    this.towerManager.setGoldMineManager(this.goldMineManager);

    this.goldMineUIManager = new GoldMineUIManager(this, this.goldMineManager);
    this.goldMineUIManager.getPlayerGold = () => this.gameController.gold;

    this.towerManager.setGoldMineUIManager(this.goldMineUIManager);

    this.towerManager.setReviewMode(false);
    this.goldMineUIManager.setReviewMode(false);

    this.popupController = new PopupController(this);
    this.towerManager.setPopupController(this.popupController);
    this.goldMineUIManager.setPopupController(this.popupController);

    this.hudManager = new HUDManager(this);
    this.hudManager.create(this.waveManager.getTotalWaves());
    this.hudManager.setCastlePosition(this.environment.getCastlePosition());
    this.hudManager.updateGold(this.gameController.gold);
    this.setupHUDCallbacks();

    this.uiHitDetector = new UIHitDetector(this);
    this.setupUIHitDetector();

    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();
    this.audioManager.playBGM();

    // Initialize priority input queue for reliable click handling at high speeds
    const canvas = this.game.canvas;
    if (canvas) {
      InputQueue.getInstance().init(canvas);
    }

    HighscoreAPI.requestSession().then((token) => {
      if (token) {
        // Session established - scores can be submitted
      } else {
        console.warn('GameScene: Could not get highscore session (offline mode)');
      }
    });

    this.scene.launch('UIScene');

    this.setupCreepClickHandler();

    this.updateNextWavePreview();

    // Register shutdown handler to clean up managers
    this.events.once('shutdown', this.handleShutdown, this);

    // Listen for pause events to track pause time for score calculation
    this.events.on('pauseToggled', (isPaused: boolean) => {
      this.gameController.setPaused(isPaused);
    });

    // Show difficulty selection overlay
    this.gameReady = false;
    this.showDifficultySelection();
  }

  private showDifficultySelection(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.difficultyOverlay = this.add.container(width / 2, height / 2);
    this.difficultyOverlay.setDepth(500);

    // Dim background
    const dimBg = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7);
    dimBg.setInteractive();
    this.difficultyOverlay.add(dimBg);

    // Panel
    const panelWidth = 600;
    const panelHeight = 400;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(-panelWidth / 2 + 8, -panelHeight / 2 + 8, panelWidth, panelHeight, 16);
    panel.fillStyle(0x1a0a00, 0.98);
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    panel.lineStyle(3, 0xd4a574, 1);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    this.difficultyOverlay.add(panel);

    // Title
    const title = this.add
      .text(0, -panelHeight / 2 + 50, 'SELECT DIFFICULTY', {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.difficultyOverlay.add(title);

    // Difficulty buttons
    const buttonY = 20;
    const buttonSpacing = 180;

    this.createDifficultyButton(
      -buttonSpacing,
      buttonY,
      'Easy',
      0x44aa44,
      'Enemies: 75% HP\nScore: ×0.75',
      () => {
        this.selectDifficulty('Easy');
      }
    );

    this.createDifficultyButton(
      0,
      buttonY,
      'Normal',
      0x4488cc,
      'Standard Experience\nScore: ×1.0',
      () => {
        this.selectDifficulty('Normal');
      }
    );

    this.createDifficultyButton(
      buttonSpacing,
      buttonY,
      'Hard',
      0xcc4444,
      'Enemies: 125% HP\nScore: ×1.25',
      () => {
        this.selectDifficulty('Hard');
      }
    );

    // Fade in
    this.difficultyOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.difficultyOverlay,
      alpha: 1,
      duration: 300,
    });
  }

  private createDifficultyButton(
    x: number,
    y: number,
    label: string,
    color: number,
    description: string,
    onClick: () => void
  ): void {
    if (!this.difficultyOverlay) return;

    const btnWidth = 150;
    const btnHeight = 160;

    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      bg.clear();
      const offsetY = pressed ? 2 : 0;

      if (!pressed) {
        bg.fillStyle(0x000000, 0.4);
        bg.fillRoundedRect(-btnWidth / 2 + 4, -btnHeight / 2 + 4, btnWidth, btnHeight, 12);
      }

      bg.fillStyle(color, hover ? 1 : 0.8);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 4, 12);

      bg.lineStyle(2, hover ? 0xffd700 : 0xffffff, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2 + offsetY, btnWidth, btnHeight - 4, 12);
    };
    drawButton(false);
    container.add(bg);

    // Label
    const labelText = this.add
      .text(0, -btnHeight / 2 + 35, label, {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    container.add(labelText);

    // Description
    const descText = this.add
      .text(0, 20, description, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
    container.add(descText);

    // Hit area
    const hitArea = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerover', () => {
      drawButton(true);
      labelText.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      drawButton(false);
      labelText.setScale(1);
    });

    hitArea.on('pointerdown', () => {
      drawButton(true, true);
    });

    hitArea.on('pointerup', () => {
      this.audioManager.playSFX('ui_click');
      onClick();
    });

    this.difficultyOverlay.add(container);
  }

  private selectDifficulty(difficulty: Difficulty): void {
    this.gameController.setDifficulty(difficulty);
    this.creepManager.setDifficultyMultiplier(this.gameController.getCreepHealthMultiplier());
    this.hudManager.setDifficulty(difficulty);

    // Fade out and destroy overlay
    if (this.difficultyOverlay) {
      this.tweens.add({
        targets: this.difficultyOverlay,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.difficultyOverlay?.destroy();
          this.difficultyOverlay = null;
          this.gameReady = true;
        },
      });
    }
  }

  private handleShutdown(): void {
    // Clear input queue handlers on shutdown
    InputQueue.getInstance().clearHandlers();
    InputQueue.getInstance().clearQueue();

    this.towerManager?.destroy();
    this.goldMineUIManager?.destroy();
    this.goldMineManager?.destroy();
    this.popupController?.destroy();
    this.hudManager?.destroy();
  }

  private setupGoldMineCallbacks(): void {
    this.goldMineManager.getPlayerGold = () => this.gameController.gold;

    this.goldMineManager.onMineBuild = (_mine, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('tower_place');
      this.audioManager.playSFX('coins');
    };

    this.goldMineManager.onMineUpgraded = (_mine, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('tower_place');
      this.audioManager.playSFX('coins');
    };
  }

  private setupTowerCallbacks(): void {
    this.towerManager.getPlayerGold = () => this.gameController.gold;
    this.towerManager.isGameReady = () => this.gameReady;

    this.towerManager.onTowerBuilt = (_tower, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('tower_place');
    };

    this.towerManager.onTowerSold = (_tower, refund) => {
      this.gameController.addGold(refund);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('sell_tower');
    };

    this.towerManager.onTowerUpgraded = (_tower, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('tower_place');
    };
  }

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

  private setupWaveCallbacks(): void {
    this.waveManager.getGameSpeed = () => this.hudManager.getGameSpeed();

    this.waveManager.on('waveStart', (waveNumber: number) => {
      this.gameController.setWave(waveNumber);
      this.hudManager.updateWave(waveNumber);
      this.hudManager.hideStartWaveButton();

      this.updateNextWavePreview();
      this.audioManager.playSFX('wavestart');

      if (waveNumber === 1) {
        this.gameController.markGameStarted();
      }

      this.registry.events.emit('wave-started', waveNumber);
    });

    this.waveManager.on('finalWaveStarted', () => {
      this.registry.events.emit('final-wave-started');
    });

    this.waveManager.on('finalBossSpawning', () => {
      this.registry.events.emit('final-boss-spawning');
    });

    this.waveManager.on('waveComplete', async (waveNumber: number) => {
      this.audioManager.playSFX('wave_complete');

      const waveBonus =
        GAME_CONFIG.WAVE_GOLD_BONUS_BASE +
        Math.floor((waveNumber - 1) / GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL) *
          GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT;

      this.gameController.addGold(waveBonus);
      this.hudManager.updateGold(this.gameController.gold);

      this.updateNextWavePreview();

      // Skip mine collection on final wave - handled by allWavesComplete
      if (waveNumber >= this.waveManager.getTotalWaves()) {
        return;
      }

      await new Promise<void>((resolve) => this.time.delayedCall(300, () => resolve()));

      const mineIncome = await this.goldMineManager.collectIncomeWithAnimation(() => {
        this.audioManager.playSFX('coins');
      });
      if (mineIncome > 0) {
        this.gameController.addGold(mineIncome);
        this.hudManager.updateGold(this.gameController.gold);
      }

      if (waveNumber < this.waveManager.getTotalWaves()) {
        this.hudManager.showCountdown(waveNumber + 1, () => {
          if (!this.gameController.gameOver) {
            this.waveManager.startWave();
          }
        });
      }
    });

    this.waveManager.on('waveProgress', () => {
      this.updateNextWavePreview();
    });

    this.waveManager.on('allWavesComplete', async () => {
      // Small delay to let player see the final boss gold reward text
      await new Promise((resolve) => this.time.delayedCall(800, resolve));

      // Collect final mine income before calculating score
      const mineIncome = await this.goldMineManager.collectIncomeWithAnimation(() => {
        this.audioManager.playSFX('coins');
      });
      if (mineIncome > 0) {
        this.gameController.addGold(mineIncome);
        this.hudManager.updateGold(this.gameController.gold);
      }

      this.gameController.markGameOver();
      this.audioManager.playSFX('victory');
      this.goToResults(true);
    });

    this.waveManager.on('creepKilled', (goldReward: number, deathX: number, deathY: number) => {
      this.gameController.addGold(goldReward);
      this.hudManager.showFloatingText(`+${goldReward}`, deathX, deathY, 0xffd700);
      this.hudManager.updateGold(this.gameController.gold);

      this.registry.events.emit('creep-killed', goldReward);
    });

    this.waveManager.on('creepLeaked', (creep: Creep) => {
      const damage = creep.isBoss() ? 2 : 1;
      const destroyed = this.gameController.takeDamage(damage);
      this.hudManager.updateCastleHP(this.gameController.castleHP);
      this.audioManager.playSFX('leaked');

      this.environment.updateCastleDamage(this.gameController.castleHP);

      this.cameras.main.shake(200, 0.01);

      this.registry.events.emit('castle-damaged', this.gameController.castleHP);

      if (destroyed && !this.gameController.gameOver) {
        this.gameController.setGameOver(true);
        this.audioManager.playSFX('defeat');

        this.environment.playCastleDestructionAnimation(() => {
          this.goToResults(false);
        });
      }
    });
  }

  private goToResults(isVictory: boolean): void {
    const stats = this.waveManager.getTotalStats();
    const stateSnapshot = this.gameController.getStateSnapshot();

    MenuScene.setGameInProgress(false);

    const resultData = {
      isVictory,
      waveReached: this.waveManager.getWavesCompleted(),
      totalWaves: this.waveManager.getTotalWaves(),
      castleHP: stateSnapshot.castleHP,
      maxCastleHP: stateSnapshot.maxCastleHP,
      goldRemaining: stateSnapshot.gold,
      totalGoldEarned: stats.goldEarned,
      creepsKilled: stats.killed,
      runTimeSeconds: stateSnapshot.runTimeSeconds,
      difficulty: this.gameController.difficulty,
    };

    this.registry.events.emit('game-over');

    this.audioManager.stopBGM();

    this.scene.stop('UIScene');

    this.resultsUI.goToResults(isVictory, resultData);
  }

  private setupHUDCallbacks(): void {
    this.hudManager.onStartWaveClicked = () => {
      if (!this.gameReady) return;
      if (this.gameController.gameOver) return;
      if (this.hudManager.isCountdownActive()) return;

      const nextWave = this.waveManager.getCurrentWave() + 1;

      if (this.waveManager.getCurrentWave() === 0) {
        // Show countdown before the first wave starts
        this.hudManager.updateWave(nextWave);
        this.hudManager.hideStartWaveButton();
        this.hudManager.showCountdown(nextWave, () => {
          if (!this.gameController.gameOver) {
            this.waveManager.startWave();
          }
        });
        return;
      }

      this.waveManager.startWave();
    };

    this.hudManager.onMenuClicked = () => {
      this.scene.sleep('UIScene');
      this.scene.sleep('GameScene');
      this.scene.launch('MenuScene');
    };
  }

  private setupUIHitDetector(): void {
    this.towerManager.setUIHitDetector(this.uiHitDetector);

    this.uiHitDetector.setMineCallback((x, y) => this.goldMineManager.getMineAtPosition(x, y));

    this.uiHitDetector.setMenuCallback(
      () =>
        this.popupController?.isAnyOpen() ||
        this.towerManager.isMenuOpen() ||
        this.goldMineUIManager.isMenuOpen()
    );

    this.uiHitDetector.registerBounds(
      'nextWavePanel',
      10,
      this.cameras.main.height - 200,
      420,
      140
    );

    this.uiHitDetector.registerBounds('menuButton', 15, this.cameras.main.height - 50, 100, 40);

    const width = this.cameras.main.width;
    this.uiHitDetector.registerBounds(
      'startWaveButton',
      width / 2 - 100,
      this.cameras.main.height - 100,
      200,
      70
    );
  }

  private setupCreepClickHandler(): void {
    this.input.on(
      'gameobjectdown',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
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
      }
    );
  }

  private updateNextWavePreview(): void {
    const currentWaveInfo = this.waveManager.getCurrentWaveInfo();
    const nextWaveInfo = this.waveManager.getNextWaveInfo();

    this.hudManager.showWavePanels(
      currentWaveInfo
        ? {
            waveNumber: currentWaveInfo.waveNumber,
            creepTypes: currentWaveInfo.types,
            currentCreepType: currentWaveInfo.currentCreepType,
            waveType: currentWaveInfo.waveType,
          }
        : null,
      nextWaveInfo
        ? {
            waveNumber: nextWaveInfo.waveNumber,
            creepTypes: nextWaveInfo.types,
            waveType: nextWaveInfo.waveType,
          }
        : null
    );
  }

  update(_time: number, delta: number): void {
    // Process queued clicks FIRST - before any game logic
    // This ensures clicks are never lost during heavy frames
    InputQueue.getInstance().processQueue();

    if (this.gameController.gameOver) return;
    if (!this.gameReady) return;

    // Cap delta to prevent physics issues on slow frames
    // At 3x speed, 50ms cap = 150ms game time max per frame
    const cappedDelta = Math.min(delta, 50);
    const gameSpeed = this.hudManager.getGameSpeed();
    const scaledDelta = cappedDelta * gameSpeed;

    // Update countdown only when not paused (freezes on pause)
    if (!this.hudManager.isPausedState()) {
      this.hudManager.updateCountdown(scaledDelta);
    }

    // Update elapsed time display using in-game time (scales with game speed)
    this.hudManager.updateTime(this.gameController.getElapsedGameTime());

    // Skip game logic updates when paused
    if (this.hudManager.isPausedState()) return;

    this.gameController.addVirtualTime(scaledDelta);

    this.creepManager.update(scaledDelta);

    this.waveManager.update();

    this.projectileManager.update(scaledDelta);

    this.towerManager.update();

    this.goldMineUIManager.update();

    this.combatManager.updateTowers(scaledDelta);
    this.combatManager.updateCombat(this.gameController.virtualGameTime);

    this.environment.update(scaledDelta);
  }

  private setupCombatCallbacks(): void {
    this.combatManager.onTowerFire = (branch: string) => {
      this.playTowerShootSound(branch);
    };
  }

  private setupCreepCallbacks(): void {
    this.creepManager.onBossFirstHit = (creep) => {
      if (creep.getConfig().type === 'boss_5') {
        this.audioManager.playSFX('dragon_roar');
      }
    };

    this.creepManager.onBossPainThreshold = (creep) => {
      if (creep.getConfig().type === 'boss_5') {
        this.audioManager.playSFX('dragon_roar');
      }
    };
  }

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
}
