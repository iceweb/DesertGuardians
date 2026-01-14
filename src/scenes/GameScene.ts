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
  GameController,
  HighscoreAPI,
} from '../managers';
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

  private gameController!: GameController;

  private resultsUI!: GameSceneResultsUI;

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

    this.hudManager = new HUDManager(this);
    this.hudManager.create(this.waveManager.getTotalWaves());
    this.hudManager.setCastlePosition(this.environment.getCastlePosition());
    this.setupHUDCallbacks();

    this.uiHitDetector = new UIHitDetector(this);
    this.setupUIHitDetector();

    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();
    this.audioManager.playBGM();

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

    this.waveManager.on('allWavesComplete', () => {
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
      waveReached: this.waveManager.getCurrentWave(),
      totalWaves: this.waveManager.getTotalWaves(),
      castleHP: stateSnapshot.castleHP,
      maxCastleHP: stateSnapshot.maxCastleHP,
      goldRemaining: stateSnapshot.gold,
      totalGoldEarned: stats.goldEarned,
      creepsKilled: stats.killed,
      runTimeSeconds: stateSnapshot.runTimeSeconds,
    };

    this.registry.events.emit('game-over');

    this.audioManager.stopBGM();

    this.scene.stop('UIScene');

    this.resultsUI.goToResults(isVictory, resultData);
  }

  private setupHUDCallbacks(): void {
    this.hudManager.onStartWaveClicked = () => {
      if (!this.gameController.gameOver) {
        this.waveManager.startWave();
      }
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
      () => this.towerManager.isMenuOpen() || this.goldMineUIManager.isMenuOpen()
    );

    this.uiHitDetector.registerBounds(
      'nextWavePanel',
      10,
      this.cameras.main.height - 200,
      180,
      120
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

    const cappedDelta = Math.min(delta, 50);

    const gameSpeed = this.hudManager.getGameSpeed();
    const scaledDelta = cappedDelta * gameSpeed;

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
