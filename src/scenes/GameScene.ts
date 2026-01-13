import Phaser from 'phaser';
import { MapManager, PathSystem, CreepManager, WaveManager, TowerManager, ProjectileManager, CombatManager, HUDManager, AudioManager, GoldMineManager, GoldMineUIManager, UIHitDetector, GameController } from '../managers';
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
  
  // Centralized game state controller
  private gameController!: GameController;
  
  // Results and review mode UI helper
  private resultsUI!: GameSceneResultsUI;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(_data?: Record<string, unknown>): void {
    // Reset review mode flags on fresh start
    // (These are set internally now, not from scene data)
  }

  create(): void {
    // Initialize game controller (single source of truth for game state)
    this.gameController = new GameController();
    this.gameController.reset();
    
    // Initialize results/review UI helper
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
      }
    });
    this.resultsUI.reset();

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
    this.goldMineUIManager.getPlayerGold = () => this.gameController.gold;
    
    // Connect gold mine UI manager to tower manager (to prevent tower menu when mine menu is open)
    this.towerManager.setGoldMineUIManager(this.goldMineUIManager);

    // Initialize HUD manager
    this.hudManager = new HUDManager(this);
    this.hudManager.create(this.waveManager.getTotalWaves());
    this.hudManager.setCastlePosition(this.environment.getCastlePosition());
    this.setupHUDCallbacks();

    // Initialize UI hit detector for centralized UI bounds checking
    this.uiHitDetector = new UIHitDetector(this);
    this.setupUIHitDetector();

    // Initialize audio manager and start BGM
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();
    this.audioManager.playBGM();

    // Launch UIScene as overlay
    this.scene.launch('UIScene');

    // Setup creep click handler
    this.setupCreepClickHandler();

    // Show initial next wave preview (wave 1)
    this.updateNextWavePreview();

    console.log('GameScene: Desert Guardians initialized - Click anywhere to place towers!');
  }

  /**
   * Setup gold mine manager callbacks
   */
  private setupGoldMineCallbacks(): void {
    // Provide gold getter
    this.goldMineManager.getPlayerGold = () => this.gameController.gold;

    // Handle mine built
    this.goldMineManager.onMineBuild = (_mine, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('build_thud');
      console.log(`Gold mine built! Cost: ${cost}g, Remaining gold: ${this.gameController.gold}`);
    };

    // Handle mine upgraded
    this.goldMineManager.onMineUpgraded = (_mine, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('upgrade_tower');
      console.log(`Gold mine upgraded! Cost: ${cost}g, Remaining gold: ${this.gameController.gold}`);
    };
  }

  /**
   * Setup tower manager callbacks
   */
  private setupTowerCallbacks(): void {
    // Provide gold getter
    this.towerManager.getPlayerGold = () => this.gameController.gold;

    // Handle tower built
    this.towerManager.onTowerBuilt = (_tower, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('build_thud');
      console.log(`Tower built! Cost: ${cost}g, Remaining gold: ${this.gameController.gold}`);
    };

    // Handle tower sold
    this.towerManager.onTowerSold = (_tower, refund) => {
      this.gameController.addGold(refund);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('sell_tower');
      console.log(`Tower sold! Refund: ${refund}g, Total gold: ${this.gameController.gold}`);
    };

    // Handle tower upgraded
    this.towerManager.onTowerUpgraded = (_tower, cost) => {
      this.gameController.spendGold(cost);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('upgrade_tower');
      console.log(`Tower upgraded! Cost: ${cost}g, Remaining gold: ${this.gameController.gold}`);
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
      this.gameController.setWave(waveNumber);
      this.hudManager.updateWave(waveNumber);
      this.hudManager.hideStartWaveButton();
      // Update preview to show the NEXT wave (waveNumber + 1)
      this.updateNextWavePreview();
      this.audioManager.playSFX('wave_start');
      
      // Track game start time when wave 1 begins
      if (waveNumber === 1) {
        this.gameController.markGameStarted();
      }
      
      // Emit event to UIScene
      this.registry.events.emit('wave-started', waveNumber);
    });

    // Final wave dramatic effects
    this.waveManager.on('finalWaveStarted', () => {
      console.log('GameScene: Final wave started - notifying UIScene');
      this.registry.events.emit('final-wave-started');
    });

    this.waveManager.on('finalBossSpawning', () => {
      console.log('GameScene: Final boss spawning - notifying UIScene');
      this.registry.events.emit('final-boss-spawning');
    });

    this.waveManager.on('waveComplete', async (waveNumber: number) => {
      console.log(`GameScene.onWaveComplete: Wave ${waveNumber} complete!`);
      this.audioManager.playSFX('wave_complete');
      
      // Calculate wave bonus using centralized config
      // Waves 1-5: 10g, Waves 6-10: 15g, etc.
      const waveBonus = GAME_CONFIG.WAVE_GOLD_BONUS_BASE + 
        Math.floor((waveNumber - 1) / GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL) * GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT;
      
      // Silently add wave bonus gold (no animation - keep UI clean)
      this.gameController.addGold(waveBonus);
      this.hudManager.updateGold(this.gameController.gold);
      
      // Show next wave preview (if there is a next wave)
      this.updateNextWavePreview();
      
      // Small delay before showing mine income animation
      await new Promise<void>(resolve => this.time.delayedCall(300, () => resolve()));
      
      // Collect mine income with animation (this is the main visual feedback)
      const mineIncome = await this.goldMineManager.collectIncomeWithAnimation();
      if (mineIncome > 0) {
        this.gameController.addGold(mineIncome);
        this.hudManager.updateGold(this.gameController.gold);
        console.log(`GameScene: Collected ${mineIncome}g from gold mines`);
      }
      
      // Automatically start next wave after a countdown (unless all waves done)
      if (waveNumber < this.waveManager.getTotalWaves()) {
        console.log(`GameScene.onWaveComplete: Showing countdown for wave ${waveNumber + 1}`);
        this.hudManager.showCountdown(waveNumber + 1, () => {
          if (!this.gameController.gameOver) {
            this.waveManager.startWave();
          }
        });
      }
    });

    this.waveManager.on('allWavesComplete', () => {
      console.log('All waves complete! Victory!');
      this.gameController.markGameOver();
      this.audioManager.playSFX('victory');
      this.goToResults(true);
    });

    this.waveManager.on('creepKilled', (goldReward: number, deathX: number, deathY: number) => {
      this.gameController.addGold(goldReward);
      this.hudManager.showFloatingText(`+${goldReward}`, deathX, deathY, 0xffd700);
      this.hudManager.updateGold(this.gameController.gold);
      this.audioManager.playSFX('gold_earn');
      
      // Emit event to UIScene
      this.registry.events.emit('creep-killed', goldReward);
    });

    this.waveManager.on('creepLeaked', (creep: Creep) => {
      // Bosses deal 2 damage, normal creeps and guards deal 1
      const damage = creep.isBoss() ? 2 : 1;
      const destroyed = this.gameController.takeDamage(damage);
      this.hudManager.updateCastleHP(this.gameController.castleHP);
      this.audioManager.playSFX('creep_leak');
      
      // Update castle damage visuals
      this.environment.updateCastleDamage(this.gameController.castleHP);
      
      // Camera shake for damage feedback
      this.cameras.main.shake(200, 0.01);
      
      // Emit event to UIScene for damage flash
      this.registry.events.emit('castle-damaged', this.gameController.castleHP);
      
      if (destroyed && !this.gameController.gameOver) {
        this.gameController.setGameOver(true);
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
    const stateSnapshot = this.gameController.getStateSnapshot();
    
    // Game is no longer in progress (for menu resume functionality)
    MenuScene.setGameInProgress(false);
    
    // Build result data
    const resultData = {
      isVictory,
      waveReached: this.waveManager.getCurrentWave(),
      totalWaves: this.waveManager.getTotalWaves(),
      castleHP: stateSnapshot.castleHP,
      maxCastleHP: stateSnapshot.maxCastleHP,
      goldRemaining: stateSnapshot.gold,
      totalGoldEarned: stats.goldEarned,
      creepsKilled: stats.killed,
      runTimeSeconds: stateSnapshot.runTimeSeconds
    };
    
    // Notify UIScene to stop any effects (like final wave effects)
    this.registry.events.emit('game-over');
    
    // Stop BGM
    this.audioManager.stopBGM();
    
    // Hide UIScene HUD elements
    this.scene.stop('UIScene');
    
    // Use results UI helper to show popup
    this.resultsUI.goToResults(isVictory, resultData);
  }

  /**
   * Setup HUD manager callbacks
   */
  private setupHUDCallbacks(): void {
    this.hudManager.onStartWaveClicked = () => {
      if (!this.gameController.gameOver) {
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
   * Setup UI hit detector with callbacks for dynamic elements
   */
  private setupUIHitDetector(): void {
    // Connect to tower manager (for tower and menu detection)
    this.towerManager.setUIHitDetector(this.uiHitDetector);
    
    // Set mine callback for mine detection
    this.uiHitDetector.setMineCallback((x, y) => this.goldMineManager.getMineAtPosition(x, y));
    
    // Override menu callback to check BOTH tower and mine menus
    this.uiHitDetector.setMenuCallback(() => 
      this.towerManager.isMenuOpen() || this.goldMineUIManager.isMenuOpen()
    );
    
    // Register static UI bounds for NextWavePanel area (bottom-left)
    // The panel dynamically shows/hides but always occupies this general area
    this.uiHitDetector.registerBounds('nextWavePanel', 10, this.cameras.main.height - 200, 180, 120);
    
    // Register menu button area (bottom-left corner)
    this.uiHitDetector.registerBounds('menuButton', 15, this.cameras.main.height - 50, 100, 40);
    
    // Register start wave button area (bottom-center)
    const width = this.cameras.main.width;
    this.uiHitDetector.registerBounds('startWaveButton', width / 2 - 100, this.cameras.main.height - 100, 200, 70);
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

  /**
   * Update the next wave preview panel with upcoming wave info
   */
  private updateNextWavePreview(): void {
    const nextWaveInfo = this.waveManager.getNextWaveInfo();
    if (nextWaveInfo) {
      this.hudManager.showNextWavePreview(
        nextWaveInfo.waveNumber,
        nextWaveInfo.types,
        nextWaveInfo.waveType
      );
    } else {
      this.hudManager.hideNextWavePreview();
    }
  }

  update(_time: number, delta: number): void {
    if (this.gameController.gameOver) return;
    if (this.hudManager.isPausedState()) return;
    
    // Cap delta time to prevent spiral of death when tab is backgrounded
    // Max 50ms per frame (min 20fps)
    const cappedDelta = Math.min(delta, 50);

    // Get game speed multiplier from HUD
    const gameSpeed = this.hudManager.getGameSpeed();
    const scaledDelta = cappedDelta * gameSpeed;
    
    // Update virtual game time (for tower firing)
    this.gameController.addVirtualTime(scaledDelta);
    
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
    this.combatManager.updateCombat(this.gameController.virtualGameTime);
    
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
}
