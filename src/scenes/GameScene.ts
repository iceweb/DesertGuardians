import Phaser from 'phaser';
import { MapManager, PathSystem, CreepManager, WaveManager, TowerManager, ProjectileManager, CombatManager, HUDManager, AudioManager } from '../managers';
import { Creep } from '../objects';
import { GameEnvironment } from '../graphics';
import { GAME_CONFIG } from '../data/GameConfig';

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

  // Game state
  private gold: number = GAME_CONFIG.STARTING_GOLD;
  private castleHP: number = GAME_CONFIG.MAX_CASTLE_HP;
  private gameOver: boolean = false;
  
  // Virtual game time (advances faster at 2x speed)
  private virtualGameTime: number = 0;
  
  // Run statistics for scoring
  private gameStartTime: number = 0;  // Real time when wave 1 starts
  private hasGameStarted: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset game state
    this.gold = GAME_CONFIG.STARTING_GOLD;
    this.castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this.gameOver = false;
    this.virtualGameTime = 0;
    this.gameStartTime = 0;
    this.hasGameStarted = false;

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

    this.waveManager.on('waveComplete', (waveNumber: number) => {
      console.log(`GameScene.onWaveComplete: Wave ${waveNumber} complete!`);
      this.audioManager.playSFX('wave_complete');
      
      // Calculate wave bonus using centralized config
      // Waves 1-5: 25g, Waves 6-10: 39g, Waves 11-15: 53g, Waves 16-20: 67g, Waves 21-25: 81g
      const waveBonus = GAME_CONFIG.WAVE_GOLD_BONUS_BASE + 
        Math.floor((waveNumber - 1) / GAME_CONFIG.WAVE_GOLD_BONUS_INTERVAL) * GAME_CONFIG.WAVE_GOLD_BONUS_INCREMENT;
      
      // Show wave bonus animation, then proceed to next wave
      this.hudManager.showWaveBonus(waveNumber, waveBonus, () => {
        this.gold += waveBonus;
        this.hudManager.updateGold(this.gold);
        
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
      
      // Camera shake for damage feedback
      this.cameras.main.shake(200, 0.01);
      
      // Emit event to UIScene for damage flash
      this.registry.events.emit('castle-damaged', this.castleHP);
      
      if (this.castleHP <= 0 && !this.gameOver) {
        this.gameOver = true;
        this.audioManager.playSFX('defeat');
        this.goToResults(false);
      }
    });
  }

  /**
   * Transition to results scene with all run statistics
   */
  private goToResults(isVictory: boolean): void {
    const stats = this.waveManager.getTotalStats();
    const runTimeSeconds = this.hasGameStarted 
      ? Math.floor((Date.now() - this.gameStartTime) / 1000)
      : 0;
    
    // Stop UIScene overlay
    this.scene.stop('UIScene');
    
    // Start ResultsScene with all data
    this.scene.start('ResultsScene', {
      isVictory,
      waveReached: this.waveManager.getCurrentWave(),
      totalWaves: this.waveManager.getTotalWaves(),
      castleHP: this.castleHP,
      maxCastleHP: GAME_CONFIG.MAX_CASTLE_HP,
      goldRemaining: this.gold,
      totalGoldEarned: stats.goldEarned,
      creepsKilled: stats.killed,
      runTimeSeconds
    });
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
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
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
    
    // Update combat (tower animations, targeting, and firing)
    this.combatManager.updateTowers(scaledDelta);
    this.combatManager.updateCombat(this.virtualGameTime);
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
