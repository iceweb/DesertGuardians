import Phaser from 'phaser';
import { MapManager, PathSystem, CreepManager, WaveManager, TowerManager, ProjectileManager, HUDManager } from '../managers';
import type { ProjectileConfig } from '../objects';
import { Creep } from '../objects';
import { GameEnvironment } from '../graphics';

export class GameScene extends Phaser.Scene {
  private mapManager!: MapManager;
  private pathSystem!: PathSystem;
  private creepManager!: CreepManager;
  private waveManager!: WaveManager;
  private towerManager!: TowerManager;
  private projectileManager!: ProjectileManager;
  private environment!: GameEnvironment;
  private hudManager!: HUDManager;

  // Game state
  private gold: number = 200;
  private castleHP: number = 10;
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
    this.gold = 200;
    this.castleHP = 10;
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
    this.setupWaveCallbacks();

    // Initialize tower manager
    this.towerManager = new TowerManager(this, this.pathSystem);
    this.setupTowerCallbacks();

    // Initialize projectile manager
    this.projectileManager = new ProjectileManager(this, this.creepManager);

    // Initialize and draw environment
    this.environment = new GameEnvironment(this, this.pathSystem);
    this.environment.drawAll(mapData.spawn, mapData.goal);

    // Initialize HUD manager
    this.hudManager = new HUDManager(this);
    this.hudManager.create(this.waveManager.getTotalWaves());
    this.hudManager.setCastlePosition(this.environment.getCastlePosition());
    this.setupHUDCallbacks();

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
      console.log(`Tower built! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };

    // Handle tower sold
    this.towerManager.onTowerSold = (_tower, refund) => {
      this.gold += refund;
      this.hudManager.updateGold(this.gold);
      console.log(`Tower sold! Refund: ${refund}g, Total gold: ${this.gold}`);
    };

    // Handle tower upgraded
    this.towerManager.onTowerUpgraded = (_tower, cost) => {
      this.gold -= cost;
      this.hudManager.updateGold(this.gold);
      console.log(`Tower upgraded! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };
  }

  /**
   * Setup wave manager event callbacks
   */
  private setupWaveCallbacks(): void {
    // Provide game speed getter for spawn timing
    this.waveManager.getGameSpeed = () => this.hudManager.getGameSpeed();
    
    this.waveManager.onWaveStart = (waveNumber: number) => {
      console.log(`Wave ${waveNumber} started!`);
      this.hudManager.updateWave(waveNumber);
      this.hudManager.hideStartWaveButton();
      
      // Track game start time when wave 1 begins
      if (waveNumber === 1 && !this.hasGameStarted) {
        this.gameStartTime = Date.now();
        this.hasGameStarted = true;
      }
      
      // Emit event to UIScene
      this.registry.events.emit('wave-started', waveNumber);
    };

    this.waveManager.onWaveComplete = (waveNumber: number) => {
      console.log(`GameScene.onWaveComplete: Wave ${waveNumber} complete!`);
      
      // Calculate wave bonus: base 15 gold + 3 per wave (Wave 1: 18g, Wave 10: 45g, Wave 25: 90g)
      const waveBonus = 15 + (waveNumber * 3);
      
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
    };

    this.waveManager.onAllWavesComplete = () => {
      console.log('All waves complete! Victory!');
      this.gameOver = true;
      this.goToResults(true);
    };

    this.waveManager.onCreepKilled = (goldReward: number, deathX: number, deathY: number) => {
      this.gold += goldReward;
      this.hudManager.showFloatingText(`+${goldReward}`, deathX, deathY, 0xffd700);
      this.hudManager.updateGold(this.gold);
      
      // Emit event to UIScene
      this.registry.events.emit('creep-killed', goldReward);
    };

    this.waveManager.onCreepLeaked = () => {
      this.castleHP--;
      this.hudManager.updateCastleHP(this.castleHP);
      
      // Camera shake for damage feedback
      this.cameras.main.shake(200, 0.01);
      
      // Emit event to UIScene for damage flash
      this.registry.events.emit('castle-damaged', this.castleHP);
      
      if (this.castleHP <= 0 && !this.gameOver) {
        this.gameOver = true;
        this.goToResults(false);
      }
    };
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
      maxCastleHP: 10,
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
    
    // Get game speed multiplier from HUD
    const gameSpeed = this.hudManager.getGameSpeed();
    const scaledDelta = delta * gameSpeed;
    
    // Update virtual game time (for tower firing)
    this.virtualGameTime += scaledDelta;
    
    // Update all creeps with scaled delta
    this.creepManager.update(scaledDelta);
    
    // Update all projectiles with scaled delta
    this.projectileManager.update(scaledDelta);
    
    // Update tower manager (for UI refresh on gold change)
    this.towerManager.update();
    
    // Tower combat - find targets and fire (uses virtual time)
    this.updateTowerCombat();
  }

  /**
   * Update tower combat - targeting and firing
   */
  private updateTowerCombat(): void {
    // Use virtual game time so tower firing rate is affected by game speed
    const currentTime = this.virtualGameTime;
    const towers = this.towerManager.getTowers();
    const creeps = this.creepManager.getActiveCreeps();
    
    for (const tower of towers) {
      // Check if tower can fire
      if (!tower.canFire(currentTime)) continue;
      
      // Find target based on tower priority
      const target = this.findTarget(tower, creeps);
      
      if (target) {
        // Fire projectile
        const config: ProjectileConfig = {
          speed: 400,
          damage: tower.getDamage(),
          isMagic: tower.isMagic(),
          branch: tower.getBranch(),
          stats: tower.getConfig().stats,
          level: tower.getLevel()
        };
        
        this.projectileManager.fire(tower.x, tower.y - 40, target, config);
        tower.recordFire(currentTime);
      }
    }
  }

  /**
   * Find the best target for a tower
   */
  private findTarget(tower: { x: number; y: number; isInRange: (x: number, y: number) => boolean; getTargetPriority: () => string }, creeps: Creep[]): Creep | null {
    const priority = tower.getTargetPriority();
    let bestTarget: Creep | null = null;
    let bestValue = -Infinity;
    
    for (const creep of creeps) {
      if (!creep.getIsActive()) continue;
      if (!tower.isInRange(creep.x, creep.y)) continue;
      
      let value: number;
      
      switch (priority) {
        case 'highestHP':
          value = creep.getCurrentHealth();
          break;
        case 'furthestAlongPath':
          value = creep.getDistanceTraveled();
          break;
        case 'closest':
        default:
          // For closest, we want minimum distance, so negate
          value = -Phaser.Math.Distance.Between(tower.x, tower.y, creep.x, creep.y);
          break;
      }
      
      if (value > bestValue) {
        bestValue = value;
        bestTarget = creep;
      }
    }
    
    return bestTarget;
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
