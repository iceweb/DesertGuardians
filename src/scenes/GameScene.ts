import Phaser from 'phaser';
import { MapManager, PathSystem, CreepManager, WaveManager, TowerManager, ProjectileManager } from '../managers';
import type { ProjectileConfig } from '../objects';
import { Creep } from '../objects';

export class GameScene extends Phaser.Scene {
  private mapManager!: MapManager;
  private pathSystem!: PathSystem;
  private creepManager!: CreepManager;
  private waveManager!: WaveManager;
  private towerManager!: TowerManager;
  private projectileManager!: ProjectileManager;

  // Game state
  private gold: number = 150;
  private castleHP: number = 10;
  private gameOver: boolean = false;

  // HUD elements
  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private countdownText!: Phaser.GameObjects.Text;
  private startWaveButton!: Phaser.GameObjects.Text;
  private startWaveButtonBg!: Phaser.GameObjects.Graphics;
  private startWaveHitArea!: Phaser.GameObjects.Rectangle;

  // Path collision settings
  private readonly PATH_WIDTH = 60;
  private readonly TOWER_RADIUS = 32;
  
  // Castle position for HP bar
  private castlePosition!: Phaser.Math.Vector2;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Reset game state
    this.gold = 150;
    this.castleHP = 10;
    this.gameOver = false;

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

    // Draw sky gradient background
    this.drawSkyBackground();
    
    // Draw the desert terrain with dunes
    this.drawDesertTerrain();
    
    // Draw decorations (palm trees, rocks, ruins)
    this.drawDecorations();
    
    // Draw the canyon path
    this.drawCanyonPath();
    
    // Draw spawn portal and castle
    this.drawSpawnAndGoal(mapData.spawn, mapData.goal);

    // Create HUD
    this.createHUD(width, height);

    // Launch UIScene as overlay
    this.scene.launch('UIScene');

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
      this.updateHUD();
      console.log(`Tower built! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };

    // Handle tower sold
    this.towerManager.onTowerSold = (_tower, refund) => {
      this.gold += refund;
      this.updateHUD();
      console.log(`Tower sold! Refund: ${refund}g, Total gold: ${this.gold}`);
    };

    // Handle tower upgraded
    this.towerManager.onTowerUpgraded = (_tower, cost) => {
      this.gold -= cost;
      this.updateHUD();
      console.log(`Tower upgraded! Cost: ${cost}g, Remaining gold: ${this.gold}`);
    };
  }

  /**
   * Setup wave manager event callbacks
   */
  private setupWaveCallbacks(): void {
    this.waveManager.onWaveStart = (waveNumber: number) => {
      console.log(`Wave ${waveNumber} started!`);
      this.updateHUD();
      this.startWaveButton.setVisible(false);
      this.startWaveButtonBg.setVisible(false);
      this.startWaveHitArea.setVisible(false);
      this.startWaveHitArea.disableInteractive();
      
      // Emit event to UIScene
      this.registry.events.emit('wave-started', waveNumber);
    };

    this.waveManager.onWaveComplete = (waveNumber: number) => {
      console.log(`GameScene.onWaveComplete: Wave ${waveNumber} complete!`);
      // Automatically start next wave after a countdown (unless all waves done)
      if (waveNumber < this.waveManager.getTotalWaves()) {
        console.log(`GameScene.onWaveComplete: Showing countdown for wave ${waveNumber + 1}`);
        this.showWaveCountdown(waveNumber + 1);
      }
      this.updateHUD();
    };

    this.waveManager.onAllWavesComplete = () => {
      console.log('All waves complete! Victory!');
      this.showVictory();
    };

    this.waveManager.onCreepKilled = (goldReward: number) => {
      this.gold += goldReward;
      this.showFloatingText(`+${goldReward}`, this.input.activePointer.x, this.input.activePointer.y, 0xffd700);
      this.updateHUD();
      
      // Emit event to UIScene
      this.registry.events.emit('creep-killed', goldReward);
    };

    this.waveManager.onCreepLeaked = () => {
      this.castleHP--;
      this.updateHUD();
      
      // Camera shake for damage feedback
      this.cameras.main.shake(200, 0.01);
      
      // Emit event to UIScene for damage flash
      this.registry.events.emit('castle-damaged', this.castleHP);
      
      if (this.castleHP <= 0 && !this.gameOver) {
        this.showDefeat();
      }
    };
  }

  /**
   * Show floating text (gold gain, damage, etc.)
   */
  private showFloatingText(text: string, x: number, y: number, color: number): void {
    const floatText = this.add.text(x, y, text, {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: floatText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatText.destroy()
    });
  }

  /**
   * Show victory screen
   */
  private showVictory(): void {
    this.gameOver = true;
    
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000, 0.7
    ).setDepth(300);

    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '🏆 VICTORY! 🏆', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(301);

    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 30, `Castle HP: ${this.castleHP}/10 | Gold: ${this.gold}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    const menuBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  /**
   * Show defeat screen
   */
  private showDefeat(): void {
    this.gameOver = true;
    
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000, 0.7
    ).setDepth(300);

    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, '💀 DEFEAT 💀', {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(301);

    const stats = this.waveManager.getTotalStats();
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 30, 
      `Wave: ${this.waveManager.getCurrentWave()}/${this.waveManager.getTotalWaves()} | Creeps Killed: ${stats.killed}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(301);

    const menuBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, '← Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(301).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  /**
   * Update HUD displays
   */
  private updateHUD(): void {
    this.goldText.setText(`💰 ${this.gold}`);
    this.waveText.setText(`⚔️ WAVE ${this.waveManager.getCurrentWave()} / ${this.waveManager.getTotalWaves()}`);
    this.hpText.setText(`❤️ ${this.castleHP}`);
    
    // Update HP bar
    this.updateHPBar();
    
    // Flash HP red when low
    if (this.castleHP <= 3) {
      this.hpText.setColor('#ff0000');
    }
  }

  /**
   * Update visual HP bar (below castle)
   */
  private updateHPBar(): void {
    this.hpBar.clear();
    
    if (!this.castlePosition) return;
    
    const barWidth = 100;
    const barHeight = 10;
    const x = this.castlePosition.x - barWidth / 2;
    const y = this.castlePosition.y + 55;
    
    // Background
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);
    
    // HP fill
    const hpPercent = Math.max(0, this.castleHP / 10);
    const fillColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1);
    this.hpBar.fillRoundedRect(x, y, barWidth * hpPercent, barHeight, 3);
    
    // Border
    this.hpBar.lineStyle(2, 0xffffff, 0.6);
    this.hpBar.strokeRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 4);
  }

  /**
   * Show countdown before next wave
   */
  private showWaveCountdown(nextWave: number): void {
    let countdown = 3;
    
    console.log(`GameScene.showWaveCountdown: Starting countdown for wave ${nextWave}`);
    
    this.countdownText.setText(`Wave ${nextWave} in ${countdown}...`);
    this.countdownText.setVisible(true);
    
    const countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: 2,  // Fire 3 times total (for 2, 1, 0)
      callback: () => {
        countdown--;
        console.log(`GameScene.showWaveCountdown: countdown = ${countdown}`);
        if (countdown > 0) {
          this.countdownText.setText(`Wave ${nextWave} in ${countdown}...`);
        } else {
          this.countdownText.setVisible(false);
          countdownTimer.destroy();  // Clean up timer
          if (!this.gameOver) {
            console.log(`GameScene.showWaveCountdown: Starting wave ${nextWave}`);
            this.waveManager.startWave();
          }
        }
      }
    });
  }

  private drawSkyBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const sky = this.add.graphics();
    sky.setDepth(-100);
    
    // Gradient sky from light blue to warm orange/pink at horizon
    const colors = [
      { y: 0, color: 0x87ceeb },      // Sky blue
      { y: 0.3, color: 0xb0d4e8 },    // Lighter blue
      { y: 0.6, color: 0xffd4a3 },    // Warm peach
      { y: 0.85, color: 0xffb366 },   // Orange glow
      { y: 1, color: 0xe8c896 }       // Sand color blend
    ];
    
    for (let i = 0; i < colors.length - 1; i++) {
      const startY = colors[i].y * height;
      const endY = colors[i + 1].y * height;
      const steps = Math.ceil(endY - startY);
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const r1 = (colors[i].color >> 16) & 0xff;
        const g1 = (colors[i].color >> 8) & 0xff;
        const b1 = colors[i].color & 0xff;
        const r2 = (colors[i + 1].color >> 16) & 0xff;
        const g2 = (colors[i + 1].color >> 8) & 0xff;
        const b2 = colors[i + 1].color & 0xff;
        
        const r = Math.floor(r1 + (r2 - r1) * t);
        const g = Math.floor(g1 + (g2 - g1) * t);
        const b = Math.floor(b1 + (b2 - b1) * t);
        
        sky.fillStyle((r << 16) | (g << 8) | b, 1);
        sky.fillRect(0, startY + j, width, 2);
      }
    }
    
    // Add sun
    sky.fillStyle(0xfffacd, 0.9);
    sky.fillCircle(1600, 120, 60);
    sky.fillStyle(0xffff99, 0.5);
    sky.fillCircle(1600, 120, 80);
    sky.fillStyle(0xffff66, 0.2);
    sky.fillCircle(1600, 120, 110);
  }

  private drawDesertTerrain(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const terrain = this.add.graphics();
    terrain.setDepth(-50);
    
    // Base sand
    terrain.fillStyle(0xe8d4a8, 1);
    terrain.fillRect(0, 0, width, height);
    
    // Large background dunes (silhouettes)
    terrain.fillStyle(0xd4c094, 0.8);
    this.drawDune(terrain, -100, height * 0.7, 600, 200);
    this.drawDune(terrain, 400, height * 0.65, 800, 250);
    this.drawDune(terrain, 1000, height * 0.7, 700, 220);
    this.drawDune(terrain, 1500, height * 0.68, 600, 230);
    
    // Mid-ground dunes
    terrain.fillStyle(0xdec8a0, 0.9);
    this.drawDune(terrain, 100, height * 0.8, 500, 150);
    this.drawDune(terrain, 700, height * 0.78, 600, 180);
    this.drawDune(terrain, 1300, height * 0.82, 550, 160);
    
    // Foreground sand texture
    terrain.fillStyle(0xf0e0c0, 0.4);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = 100 + Math.random() * (height - 150);
      terrain.fillEllipse(x, y, 80 + Math.random() * 120, 15 + Math.random() * 25);
    }
    
    // Sand ripples
    terrain.lineStyle(1, 0xcbb896, 0.3);
    for (let y = 150; y < height; y += 40) {
      terrain.beginPath();
      terrain.moveTo(0, y);
      for (let x = 0; x < width; x += 20) {
        terrain.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 5);
      }
      terrain.strokePath();
    }
  }

  private drawDune(graphics: Phaser.GameObjects.Graphics, x: number, baseY: number, w: number, h: number): void {
    graphics.beginPath();
    graphics.moveTo(x, baseY + h);
    
    // Draw smooth dune curve using sine-based interpolation
    for (let t = 0; t <= 1; t += 0.02) {
      const px = x + w * t;
      const py = baseY + h - h * Math.sin(t * Math.PI) * (0.8 + Math.sin(t * 2) * 0.2);
      graphics.lineTo(px, py);
    }
    
    graphics.lineTo(x + w, baseY + h);
    graphics.closePath();
    graphics.fillPath();
  }

  private drawDecorations(): void {
    const DECO_PATH_MARGIN = 80; // Minimum distance from path center for decorations
    const HUD_MARGIN = 140; // Keep decorations below this Y value
    const width = this.cameras.main.width;
    
    // Helper to check if position is valid for decoration
    const isValidDecoPosition = (x: number, y: number): boolean => {
      if (y < HUD_MARGIN) return false;
      if (x < 30 || x > width - 30) return false;
      return !this.isNearPath(x, y, DECO_PATH_MARGIN);
    };
    
    // Palm tree positions - distributed across entire screen
    const palmPositions = [
      // Top area
      { x: 480, y: 180 }, { x: 680, y: 160 }, { x: 880, y: 200 },
      { x: 1380, y: 170 }, { x: 1580, y: 190 },
      // Middle area
      { x: 150, y: 350 }, { x: 380, y: 400 }, { x: 580, y: 480 },
      { x: 920, y: 380 }, { x: 1100, y: 450 }, { x: 1300, y: 380 },
      { x: 1700, y: 420 }, { x: 1850, y: 350 },
      // Lower area
      { x: 100, y: 650 }, { x: 320, y: 720 }, { x: 600, y: 680 },
      { x: 850, y: 750 }, { x: 1150, y: 700 }, { x: 1400, y: 750 },
      { x: 1650, y: 680 }, { x: 1850, y: 720 }
    ];
    
    for (const pos of palmPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawPalmTree(pos.x, pos.y, 0.7 + Math.random() * 0.4);
      }
    }
    
    // Rock formations - spread across screen
    const rockPositions = [
      // Top
      { x: 550, y: 200 }, { x: 780, y: 180 }, { x: 1200, y: 190 }, { x: 1500, y: 170 },
      // Middle
      { x: 200, y: 400 }, { x: 450, y: 350 }, { x: 700, y: 420 },
      { x: 1000, y: 380 }, { x: 1250, y: 420 }, { x: 1550, y: 380 }, { x: 1800, y: 450 },
      // Lower
      { x: 150, y: 680 }, { x: 400, y: 750 }, { x: 650, y: 700 },
      { x: 950, y: 780 }, { x: 1200, y: 720 }, { x: 1500, y: 780 }, { x: 1750, y: 700 }
    ];
    
    for (const pos of rockPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawRocks(pos.x, pos.y);
      }
    }
    
    // Ancient ruins - strategic placement
    const ruinPositions = [
      { x: 620, y: 200 }, { x: 1450, y: 180 },
      { x: 300, y: 450 }, { x: 1650, y: 400 },
      { x: 500, y: 750 }, { x: 1100, y: 720 }, { x: 1750, y: 780 }
    ];
    for (const pos of ruinPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawRuins(pos.x, pos.y);
      }
    }
    
    // Cacti - distributed evenly
    const cactiPositions = [
      // Top
      { x: 420, y: 170 }, { x: 750, y: 190 }, { x: 1050, y: 160 }, { x: 1320, y: 200 },
      // Middle
      { x: 180, y: 420 }, { x: 500, y: 380 }, { x: 780, y: 450 },
      { x: 1150, y: 400 }, { x: 1400, y: 450 }, { x: 1720, y: 380 },
      // Lower
      { x: 250, y: 700 }, { x: 550, y: 750 }, { x: 800, y: 700 },
      { x: 1050, y: 780 }, { x: 1350, y: 720 }, { x: 1600, y: 750 }, { x: 1850, y: 680 }
    ];
    for (const pos of cactiPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawCactus(pos.x, pos.y, 0.6 + Math.random() * 0.5);
      }
    }
    
    // Golden scarab beetles - mystical desert treasure
    const scarabPositions = [
      { x: 520, y: 170 }, { x: 1280, y: 180 },
      { x: 280, y: 380 }, { x: 650, y: 420 }, { x: 1000, y: 350 }, { x: 1500, y: 420 },
      { x: 180, y: 720 }, { x: 480, y: 680 }, { x: 900, y: 750 }, { x: 1250, y: 700 }, { x: 1650, y: 750 }
    ];
    for (const pos of scarabPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawScarab(pos.x, pos.y);
      }
    }
    
    // Desert flowers / tumbleweeds - many small details
    const flowerPositions = [
      // Top
      { x: 450, y: 200 }, { x: 700, y: 170 }, { x: 950, y: 190 }, { x: 1180, y: 170 }, { x: 1420, y: 200 },
      // Middle
      { x: 220, y: 380 }, { x: 420, y: 420 }, { x: 620, y: 350 }, { x: 850, y: 400 },
      { x: 1080, y: 380 }, { x: 1300, y: 450 }, { x: 1520, y: 380 }, { x: 1780, y: 420 },
      // Lower
      { x: 130, y: 700 }, { x: 350, y: 750 }, { x: 580, y: 720 }, { x: 780, y: 780 },
      { x: 1000, y: 700 }, { x: 1220, y: 750 }, { x: 1450, y: 700 }, { x: 1700, y: 780 }, { x: 1880, y: 720 }
    ];
    for (const pos of flowerPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        if (Math.random() > 0.5) {
          this.drawDesertFlower(pos.x, pos.y);
        } else {
          this.drawTumbleweed(pos.x, pos.y);
        }
      }
    }
    
    // Ancient pottery / jars
    const potteryPositions = [
      { x: 580, y: 180 }, { x: 1350, y: 190 },
      { x: 350, y: 400 }, { x: 900, y: 380 }, { x: 1600, y: 450 },
      { x: 200, y: 750 }, { x: 700, y: 700 }, { x: 1150, y: 780 }, { x: 1550, y: 720 }
    ];
    for (const pos of potteryPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawPottery(pos.x, pos.y);
      }
    }
    
    // Scorpions - small details scattered
    const scorpionPositions = [
      { x: 480, y: 190 }, { x: 1100, y: 170 },
      { x: 250, y: 420 }, { x: 550, y: 380 }, { x: 950, y: 450 }, { x: 1450, y: 400 }, { x: 1750, y: 380 },
      { x: 300, y: 720 }, { x: 650, y: 750 }, { x: 1000, y: 720 }, { x: 1350, y: 780 }, { x: 1680, y: 700 }
    ];
    for (const pos of scorpionPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        this.drawScorpion(pos.x, pos.y);
      }
    }
    
    // Oasis - one in upper area, one in lower
    if (isValidDecoPosition(1150, 200)) {
      this.drawOasis(1150, 200);
    }
    if (isValidDecoPosition(450, 720)) {
      this.drawOasis(450, 720);
    }
  }

  private drawPalmTree(x: number, y: number, scale: number = 1): void {
    const palm = this.add.graphics();
    palm.setDepth(10);
    
    // Shadow
    palm.fillStyle(0x000000, 0.2);
    palm.fillEllipse(x + 30, y + 10, 60 * scale, 20 * scale);
    
    // Trunk
    palm.fillStyle(0x8b6914, 1);
    palm.beginPath();
    palm.moveTo(x - 8 * scale, y);
    palm.lineTo(x - 5 * scale, y - 80 * scale);
    palm.lineTo(x + 5 * scale, y - 85 * scale);
    palm.lineTo(x + 8 * scale, y);
    palm.closePath();
    palm.fillPath();
    
    // Trunk texture
    palm.lineStyle(2, 0x6b4f10, 0.6);
    for (let i = 0; i < 6; i++) {
      const ty = y - 10 - i * 12 * scale;
      palm.lineBetween(x - 6 * scale, ty, x + 6 * scale, ty);
    }
    
    // Palm fronds
    const frondColors = [0x228b22, 0x2e8b2e, 0x3cb371];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const length = 50 + Math.random() * 20;
      palm.fillStyle(frondColors[i % 3], 1);
      this.drawFrond(palm, x, y - 85 * scale, angle, length * scale);
    }
    
    // Coconuts
    palm.fillStyle(0x8b4513, 1);
    palm.fillCircle(x - 5 * scale, y - 78 * scale, 5 * scale);
    palm.fillCircle(x + 6 * scale, y - 80 * scale, 4 * scale);
  }

  private drawFrond(graphics: Phaser.GameObjects.Graphics, x: number, y: number, angle: number, length: number): void {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length * 0.6 - 20;
    const midX = x + Math.cos(angle) * length * 0.5;
    const midY = y + Math.sin(angle) * length * 0.3 - 25;
    
    graphics.beginPath();
    graphics.moveTo(x, y);
    
    // Draw leaf shape
    graphics.lineTo(midX - 10, midY);
    graphics.lineTo(endX, endY);
    graphics.lineTo(midX + 10, midY);
    graphics.closePath();
    graphics.fillPath();
    
    // Leaf details
    graphics.lineStyle(1, 0x1a6b1a, 0.5);
    graphics.lineBetween(x, y, endX, endY);
  }

  private drawRocks(x: number, y: number): void {
    const rocks = this.add.graphics();
    rocks.setDepth(5);
    
    // Shadow
    rocks.fillStyle(0x000000, 0.2);
    rocks.fillEllipse(x + 10, y + 20, 60, 15);
    
    // Large rock
    rocks.fillStyle(0x7a6855, 1);
    rocks.beginPath();
    rocks.moveTo(x - 25, y + 15);
    rocks.lineTo(x - 20, y - 15);
    rocks.lineTo(x + 5, y - 25);
    rocks.lineTo(x + 25, y - 10);
    rocks.lineTo(x + 30, y + 15);
    rocks.closePath();
    rocks.fillPath();
    
    // Rock highlight
    rocks.fillStyle(0x9a8875, 1);
    rocks.beginPath();
    rocks.moveTo(x - 15, y - 5);
    rocks.lineTo(x - 10, y - 18);
    rocks.lineTo(x + 10, y - 20);
    rocks.lineTo(x + 5, y - 5);
    rocks.closePath();
    rocks.fillPath();
    
    // Small rocks
    rocks.fillStyle(0x6a5845, 1);
    rocks.fillCircle(x + 35, y + 5, 10);
    rocks.fillCircle(x - 35, y + 10, 8);
    rocks.fillStyle(0x8a7865, 1);
    rocks.fillCircle(x + 38, y, 6);
  }

  private drawRuins(x: number, y: number): void {
    const ruins = this.add.graphics();
    ruins.setDepth(4);
    
    // Shadow
    ruins.fillStyle(0x000000, 0.15);
    ruins.fillEllipse(x, y + 40, 100, 25);
    
    // Broken column 1
    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x - 40, y - 30, 18, 60);
    ruins.fillStyle(0xd9c8a6, 1);
    ruins.fillRect(x - 38, y - 28, 14, 55);
    
    // Column top (broken)
    ruins.fillStyle(0xb9a886, 1);
    ruins.beginPath();
    ruins.moveTo(x - 42, y - 30);
    ruins.lineTo(x - 35, y - 45);
    ruins.lineTo(x - 25, y - 35);
    ruins.lineTo(x - 22, y - 30);
    ruins.closePath();
    ruins.fillPath();
    
    // Broken column 2
    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x + 15, y - 10, 20, 40);
    ruins.fillStyle(0xd9c8a6, 1);
    ruins.fillRect(x + 17, y - 8, 16, 36);
    
    // Fallen stone block
    ruins.fillStyle(0xb9a886, 1);
    ruins.fillRect(x - 10, y + 15, 35, 18);
    ruins.fillStyle(0xc9b896, 1);
    ruins.fillRect(x - 8, y + 17, 31, 12);
    
    // Decorative carvings (lines)
    ruins.lineStyle(1, 0xa99876, 0.6);
    ruins.lineBetween(x - 36, y, x - 26, y);
    ruins.lineBetween(x - 36, y + 10, x - 26, y + 10);
    ruins.lineBetween(x + 19, y + 5, x + 31, y + 5);
  }

  private drawOasis(x: number, y: number): void {
    const oasis = this.add.graphics();
    oasis.setDepth(3);
    
    // Water shadow/depth
    oasis.fillStyle(0x1a4a6b, 0.8);
    oasis.fillEllipse(x, y, 100, 40);
    
    // Water surface
    oasis.fillStyle(0x4a90a8, 0.9);
    oasis.fillEllipse(x, y - 3, 95, 35);
    
    // Water highlight
    oasis.fillStyle(0x6ab0c8, 0.6);
    oasis.fillEllipse(x - 20, y - 8, 40, 15);
    
    // Grass around
    oasis.fillStyle(0x228b22, 0.8);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const grassX = x + Math.cos(angle) * 55;
      const grassY = y + Math.sin(angle) * 22;
      oasis.fillTriangle(grassX, grassY, grassX - 4, grassY + 12, grassX + 4, grassY + 12);
    }
  }

  private drawCactus(x: number, y: number, scale: number = 1): void {
    const cactus = this.add.graphics();
    cactus.setDepth(8);
    
    // Shadow
    cactus.fillStyle(0x000000, 0.2);
    cactus.fillEllipse(x + 10, y + 5, 40 * scale, 12 * scale);
    
    // Main body
    cactus.fillStyle(0x2d5a27, 1);
    cactus.fillRoundedRect(x - 12 * scale, y - 70 * scale, 24 * scale, 75 * scale, 10 * scale);
    
    // Lighter stripe
    cactus.fillStyle(0x3d7a37, 1);
    cactus.fillRoundedRect(x - 6 * scale, y - 65 * scale, 12 * scale, 65 * scale, 5 * scale);
    
    // Left arm
    cactus.fillStyle(0x2d5a27, 1);
    cactus.fillRoundedRect(x - 35 * scale, y - 45 * scale, 25 * scale, 15 * scale, 6 * scale);
    cactus.fillRoundedRect(x - 35 * scale, y - 55 * scale, 15 * scale, 25 * scale, 6 * scale);
    
    // Right arm
    cactus.fillRoundedRect(x + 10 * scale, y - 35 * scale, 25 * scale, 15 * scale, 6 * scale);
    cactus.fillRoundedRect(x + 22 * scale, y - 50 * scale, 15 * scale, 30 * scale, 6 * scale);
    
    // Spines (dots)
    cactus.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 8; i++) {
      cactus.fillCircle(x + (Math.random() - 0.5) * 18 * scale, y - 20 - i * 7 * scale, 1.5);
    }
    
    // Flower on top (optional, random)
    if (Math.random() > 0.5) {
      cactus.fillStyle(0xff69b4, 1);
      cactus.fillCircle(x, y - 72 * scale, 6 * scale);
      cactus.fillStyle(0xffb6c1, 1);
      cactus.fillCircle(x - 2, y - 74 * scale, 3 * scale);
    }
  }

  private drawScarab(x: number, y: number): void {
    const scarab = this.add.graphics();
    scarab.setDepth(6);
    
    const scale = 0.8 + Math.random() * 0.4;
    
    // Glow effect
    scarab.fillStyle(0xffd700, 0.2);
    scarab.fillCircle(x, y, 18 * scale);
    scarab.fillStyle(0xffd700, 0.1);
    scarab.fillCircle(x, y, 25 * scale);
    
    // Shadow
    scarab.fillStyle(0x000000, 0.2);
    scarab.fillEllipse(x + 3, y + 8 * scale, 16 * scale, 6 * scale);
    
    // Main body (shell)
    scarab.fillStyle(0xdaa520, 1);
    scarab.fillEllipse(x, y, 14 * scale, 10 * scale);
    
    // Shell segments
    scarab.fillStyle(0xffd700, 1);
    scarab.fillEllipse(x, y - 2 * scale, 12 * scale, 7 * scale);
    
    // Wing split line
    scarab.lineStyle(1, 0xb8860b, 0.8);
    scarab.lineBetween(x, y - 8 * scale, x, y + 8 * scale);
    
    // Shell pattern - horizontal lines
    scarab.lineStyle(1, 0xcd853f, 0.5);
    scarab.lineBetween(x - 5 * scale, y - 3 * scale, x + 5 * scale, y - 3 * scale);
    scarab.lineBetween(x - 6 * scale, y, x + 6 * scale, y);
    scarab.lineBetween(x - 5 * scale, y + 3 * scale, x + 5 * scale, y + 3 * scale);
    
    // Head
    scarab.fillStyle(0xb8860b, 1);
    scarab.fillCircle(x, y - 10 * scale, 5 * scale);
    
    // Eyes (gems)
    scarab.fillStyle(0x00ffff, 0.9);
    scarab.fillCircle(x - 2 * scale, y - 11 * scale, 1.5 * scale);
    scarab.fillCircle(x + 2 * scale, y - 11 * scale, 1.5 * scale);
    
    // Mandibles
    scarab.lineStyle(1.5, 0x8b6914, 1);
    scarab.lineBetween(x - 2 * scale, y - 14 * scale, x - 5 * scale, y - 17 * scale);
    scarab.lineBetween(x + 2 * scale, y - 14 * scale, x + 5 * scale, y - 17 * scale);
    
    // Legs
    scarab.lineStyle(1, 0x8b6914, 0.9);
    // Left legs
    scarab.lineBetween(x - 6 * scale, y - 4 * scale, x - 12 * scale, y - 8 * scale);
    scarab.lineBetween(x - 7 * scale, y, x - 13 * scale, y - 2 * scale);
    scarab.lineBetween(x - 6 * scale, y + 4 * scale, x - 12 * scale, y + 6 * scale);
    // Right legs
    scarab.lineBetween(x + 6 * scale, y - 4 * scale, x + 12 * scale, y - 8 * scale);
    scarab.lineBetween(x + 7 * scale, y, x + 13 * scale, y - 2 * scale);
    scarab.lineBetween(x + 6 * scale, y + 4 * scale, x + 12 * scale, y + 6 * scale);
    
    // Golden shimmer highlight
    scarab.fillStyle(0xfffacd, 0.6);
    scarab.fillEllipse(x - 3 * scale, y - 3 * scale, 4 * scale, 3 * scale);
  }

  private drawDesertFlower(x: number, y: number): void {
    const flower = this.add.graphics();
    flower.setDepth(5);
    
    // Stem
    flower.lineStyle(2, 0x3d7a37, 1);
    flower.lineBetween(x, y, x, y - 20);
    flower.lineBetween(x, y - 10, x - 8, y - 5);
    flower.lineBetween(x, y - 10, x + 8, y - 5);
    
    // Leaves
    flower.fillStyle(0x4a8a44, 1);
    flower.fillEllipse(x - 10, y - 3, 8, 4);
    flower.fillEllipse(x + 10, y - 3, 8, 4);
    
    // Flower petals
    const petalColors = [0xff6b6b, 0xffa500, 0xffff00, 0xff69b4, 0x9370db];
    const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    flower.fillStyle(petalColor, 1);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * 6;
      const py = y - 20 + Math.sin(angle) * 6;
      flower.fillCircle(px, py, 4);
    }
    
    // Center
    flower.fillStyle(0xffd700, 1);
    flower.fillCircle(x, y - 20, 3);
  }

  private drawTumbleweed(x: number, y: number): void {
    const tumbleweed = this.add.graphics();
    tumbleweed.setDepth(5);
    
    // Shadow
    tumbleweed.fillStyle(0x000000, 0.15);
    tumbleweed.fillEllipse(x + 3, y + 12, 25, 8);
    
    // Main ball shape
    const size = 12 + Math.random() * 8;
    tumbleweed.fillStyle(0x8b7355, 0.9);
    tumbleweed.fillCircle(x, y, size);
    
    // Tangled branches texture
    tumbleweed.lineStyle(1, 0x6b5344, 0.8);
    for (let i = 0; i < 12; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + (Math.random() - 0.5) * 2;
      const r1 = size * 0.3;
      const r2 = size * 0.9;
      tumbleweed.lineBetween(
        x + Math.cos(angle1) * r1,
        y + Math.sin(angle1) * r1,
        x + Math.cos(angle2) * r2,
        y + Math.sin(angle2) * r2
      );
    }
    
    // Highlights
    tumbleweed.fillStyle(0xa08060, 0.5);
    tumbleweed.fillCircle(x - 3, y - 3, size * 0.4);
  }

  private drawPottery(x: number, y: number): void {
    const pottery = this.add.graphics();
    pottery.setDepth(6);
    
    // Shadow
    pottery.fillStyle(0x000000, 0.2);
    pottery.fillEllipse(x + 5, y + 20, 30, 10);
    
    // Jar body
    pottery.fillStyle(0xb8860b, 1);
    pottery.beginPath();
    pottery.moveTo(x - 12, y + 18);
    pottery.lineTo(x - 18, y);
    pottery.lineTo(x - 15, y - 15);
    pottery.lineTo(x - 8, y - 22);
    pottery.lineTo(x + 8, y - 22);
    pottery.lineTo(x + 15, y - 15);
    pottery.lineTo(x + 18, y);
    pottery.lineTo(x + 12, y + 18);
    pottery.closePath();
    pottery.fillPath();
    
    // Jar neck
    pottery.fillStyle(0xa07608, 1);
    pottery.fillRect(x - 6, y - 28, 12, 8);
    
    // Rim
    pottery.fillStyle(0x8b6914, 1);
    pottery.fillRect(x - 8, y - 30, 16, 4);
    
    // Decoration bands
    pottery.lineStyle(2, 0x654321, 0.7);
    pottery.lineBetween(x - 16, y - 5, x + 16, y - 5);
    pottery.lineBetween(x - 14, y + 8, x + 14, y + 8);
    
    // Pattern (zigzag or dots)
    pottery.fillStyle(0x4a3520, 0.6);
    for (let i = -12; i <= 12; i += 6) {
      pottery.fillCircle(x + i, y - 10, 2);
    }
    
    // Highlight
    pottery.fillStyle(0xd4a856, 0.4);
    pottery.fillEllipse(x - 8, y - 5, 6, 12);
    
    // Some broken pots
    if (Math.random() > 0.6) {
      // Broken shard nearby
      pottery.fillStyle(0xb8860b, 0.8);
      pottery.beginPath();
      pottery.moveTo(x + 25, y + 15);
      pottery.lineTo(x + 35, y + 10);
      pottery.lineTo(x + 38, y + 18);
      pottery.lineTo(x + 30, y + 20);
      pottery.closePath();
      pottery.fillPath();
    }
  }

  private drawScorpion(x: number, y: number): void {
    const scorpion = this.add.graphics();
    scorpion.setDepth(7);
    
    const facing = Math.random() > 0.5 ? 1 : -1;
    
    // Body
    scorpion.fillStyle(0x2a1a0a, 1);
    scorpion.fillEllipse(x, y, 12, 8);
    
    // Head
    scorpion.fillCircle(x + 8 * facing, y, 5);
    
    // Tail segments
    scorpion.fillStyle(0x3a2a1a, 1);
    for (let i = 1; i <= 4; i++) {
      scorpion.fillCircle(x - (6 + i * 4) * facing, y - i * 2, 3);
    }
    
    // Stinger
    scorpion.fillStyle(0x1a0a00, 1);
    scorpion.fillTriangle(
      x - 24 * facing, y - 10,
      x - 22 * facing, y - 6,
      x - 28 * facing, y - 8
    );
    
    // Pincers
    scorpion.lineStyle(2, 0x2a1a0a, 1);
    scorpion.lineBetween(x + 10 * facing, y - 2, x + 18 * facing, y - 6);
    scorpion.lineBetween(x + 10 * facing, y + 2, x + 18 * facing, y + 6);
    scorpion.fillStyle(0x3a2a1a, 1);
    scorpion.fillCircle(x + 20 * facing, y - 6, 3);
    scorpion.fillCircle(x + 20 * facing, y + 6, 3);
    
    // Legs
    scorpion.lineStyle(1, 0x2a1a0a, 0.8);
    for (let i = -1; i <= 1; i += 2) {
      scorpion.lineBetween(x - 3, y, x - 3 + i * 8, y + 6);
      scorpion.lineBetween(x + 3, y, x + 3 + i * 8, y + 6);
    }
  }

  private drawCanyonPath(): void {
    const segments = this.pathSystem.getSegments();
    const points = this.pathSystem.getPoints();
    const pathWidth = this.PATH_WIDTH;
    
    // Layer 0: Outer glow/ambient shadow
    const outerGlow = this.add.graphics();
    outerGlow.setDepth(-5);
    this.drawPathLayer(outerGlow, segments, points, pathWidth + 40, 0x2a1a0a, 0.4);
    
    // Layer 1: Deep shadow (canyon depth)
    const deepShadow = this.add.graphics();
    deepShadow.setDepth(-4);
    this.drawPathLayer(deepShadow, segments, points, pathWidth + 30, 0x1a0a00, 1);
    
    // Layer 2: Canyon outer walls (darkest rock)
    const outerWalls = this.add.graphics();
    outerWalls.setDepth(-3);
    this.drawPathLayer(outerWalls, segments, points, pathWidth + 20, 0x4a3020, 1);
    
    // Layer 3: Canyon mid walls
    const midWalls = this.add.graphics();
    midWalls.setDepth(-2);
    this.drawPathLayer(midWalls, segments, points, pathWidth + 10, 0x6b4a30, 1);
    
    // Layer 4: Canyon inner walls (lighter rock)
    const innerWalls = this.add.graphics();
    innerWalls.setDepth(-1);
    this.drawPathLayer(innerWalls, segments, points, pathWidth, 0x8b6a4a, 1);
    
    // Layer 5: Canyon floor shadow
    const floorShadow = this.add.graphics();
    floorShadow.setDepth(0);
    this.drawPathLayer(floorShadow, segments, points, pathWidth - 15, 0x9a7a5a, 1);
    
    // Layer 6: Walking path (sand floor)
    const walkPath = this.add.graphics();
    walkPath.setDepth(1);
    this.drawPathLayer(walkPath, segments, points, pathWidth - 25, 0xc4a070, 1);
    
    // Layer 7: Center highlight
    const centerPath = this.add.graphics();
    centerPath.setDepth(2);
    this.drawPathLayer(centerPath, segments, points, pathWidth - 40, 0xd4b080, 1);
    
    // Add canyon edge details (rocks, cracks)
    this.addCanyonEdgeDetails(segments, pathWidth);
    
    // Add path details (footprints, pebbles)
    this.addPathDetails(segments, pathWidth);
  }

  private drawPathLayer(
    graphics: Phaser.GameObjects.Graphics,
    segments: { start: Phaser.Math.Vector2; end: Phaser.Math.Vector2; direction: Phaser.Math.Vector2 }[],
    points: Phaser.Math.Vector2[],
    width: number,
    color: number,
    alpha: number
  ): void {
    graphics.fillStyle(color, alpha);
    const halfWidth = width / 2;
    
    for (const segment of segments) {
      const perpX = -segment.direction.y * halfWidth;
      const perpY = segment.direction.x * halfWidth;
      
      graphics.beginPath();
      graphics.moveTo(segment.start.x + perpX, segment.start.y + perpY);
      graphics.lineTo(segment.end.x + perpX, segment.end.y + perpY);
      graphics.lineTo(segment.end.x - perpX, segment.end.y - perpY);
      graphics.lineTo(segment.start.x - perpX, segment.start.y - perpY);
      graphics.closePath();
      graphics.fillPath();
    }
    
    for (const point of points) {
      graphics.fillCircle(point.x, point.y, halfWidth);
    }
  }

  private addCanyonEdgeDetails(
    segments: { start: Phaser.Math.Vector2; end: Phaser.Math.Vector2; direction: Phaser.Math.Vector2; length: number }[],
    pathWidth: number
  ): void {
    const edgeDetails = this.add.graphics();
    edgeDetails.setDepth(-0.5);
    
    for (const segment of segments) {
      const numRocks = Math.floor(segment.length / 30);
      
      for (let i = 0; i < numRocks; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);
        
        // Perpendicular offset
        const perpX = -segment.direction.y;
        const perpY = segment.direction.x;
        
        // Rocks on left edge
        if (Math.random() > 0.5) {
          const offset = (pathWidth / 2) + 5 + Math.random() * 8;
          const rockX = x + perpX * offset;
          const rockY = y + perpY * offset;
          const rockSize = 3 + Math.random() * 6;
          
          edgeDetails.fillStyle(0x5a4030, 0.9);
          edgeDetails.fillCircle(rockX, rockY, rockSize);
          edgeDetails.fillStyle(0x7a6050, 0.7);
          edgeDetails.fillCircle(rockX - 1, rockY - 1, rockSize * 0.6);
        }
        
        // Rocks on right edge
        if (Math.random() > 0.5) {
          const offset = (pathWidth / 2) + 5 + Math.random() * 8;
          const rockX = x - perpX * offset;
          const rockY = y - perpY * offset;
          const rockSize = 3 + Math.random() * 6;
          
          edgeDetails.fillStyle(0x4a3020, 0.9);
          edgeDetails.fillCircle(rockX, rockY, rockSize);
          edgeDetails.fillStyle(0x6a5040, 0.7);
          edgeDetails.fillCircle(rockX - 1, rockY - 1, rockSize * 0.6);
        }
      }
    }
    
    // Add crack lines on canyon walls
    const cracks = this.add.graphics();
    cracks.setDepth(-1.5);
    cracks.lineStyle(1, 0x3a2010, 0.5);
    
    for (const segment of segments) {
      const numCracks = Math.floor(segment.length / 80);
      
      for (let i = 0; i < numCracks; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);
        
        const perpX = -segment.direction.y;
        const perpY = segment.direction.x;
        const side = Math.random() > 0.5 ? 1 : -1;
        const offset = (pathWidth / 2) + 10;
        
        const crackX = x + perpX * offset * side;
        const crackY = y + perpY * offset * side;
        
        // Draw jagged crack
        cracks.beginPath();
        cracks.moveTo(crackX, crackY);
        const crackLen = 10 + Math.random() * 15;
        for (let j = 0; j < 3; j++) {
          cracks.lineTo(
            crackX + (Math.random() - 0.5) * 8 + perpX * side * crackLen * (j / 3),
            crackY + (Math.random() - 0.5) * 8 + perpY * side * crackLen * (j / 3)
          );
        }
        cracks.strokePath();
      }
    }
  }

  private addPathDetails(
    segments: { start: Phaser.Math.Vector2; end: Phaser.Math.Vector2; direction: Phaser.Math.Vector2; length: number }[],
    _pathWidth: number
  ): void {
    const details = this.add.graphics();
    details.setDepth(1.5);
    
    // Add small rocks and footprints along path
    for (const segment of segments) {
      const numDetails = Math.floor(segment.length / 50);
      
      for (let i = 0; i < numDetails; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);
        
        // Small pebbles
        if (Math.random() > 0.6) {
          details.fillStyle(0x9a7a5a, 0.5);
          details.fillCircle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, 2 + Math.random() * 3);
        }
      }
    }
  }

  private _isOnPath(x: number, y: number): boolean {
    const segments = this.pathSystem.getSegments();
    const checkRadius = this.PATH_WIDTH / 2 + this.TOWER_RADIUS + 10;
    
    for (const segment of segments) {
      const dist = this.pointToSegmentDistance(
        x, y,
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y
      );
      
      if (dist < checkRadius) {
        return true;
      }
    }
    
    return false;
  }

  private isNearPath(x: number, y: number, margin: number): boolean {
    const segments = this.pathSystem.getSegments();
    
    for (const segment of segments) {
      const dist = this.pointToSegmentDistance(
        x, y,
        segment.start.x, segment.start.y,
        segment.end.x, segment.end.y
      );
      
      if (dist < margin) {
        return true;
      }
    }
    
    return false;
  }

  private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    
    return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
  }

  private drawSpawnAndGoal(spawn: Phaser.Math.Vector2, goal: Phaser.Math.Vector2): void {
    // Store castle position for HP bar
    this.castlePosition = goal.clone();
    
    // ===== SPAWN PORTAL =====
    const spawnGraphics = this.add.graphics();
    spawnGraphics.setDepth(15);
    
    // Portal outer ring glow
    spawnGraphics.fillStyle(0x00ff00, 0.15);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 65);
    spawnGraphics.fillStyle(0x00ff00, 0.25);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 50);
    
    // Portal ring
    spawnGraphics.lineStyle(6, 0x006600, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 42);
    spawnGraphics.lineStyle(4, 0x00aa00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 38);
    spawnGraphics.lineStyle(2, 0x00ff00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 34);
    
    // Inner portal energy
    spawnGraphics.fillStyle(0x00ff44, 0.4);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 30);
    spawnGraphics.fillStyle(0x44ff88, 0.6);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 20);
    spawnGraphics.fillStyle(0x88ffaa, 0.8);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 10);
    
    // Runes around portal
    spawnGraphics.lineStyle(2, 0x00cc00, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = spawn.x + Math.cos(angle) * 55;
      const ry = spawn.y + Math.sin(angle) * 55;
      spawnGraphics.strokeCircle(rx, ry, 5);
    }
    
    // ===== CASTLE =====
    const castle = this.add.graphics();
    castle.setDepth(15);
    
    // Castle shadow
    castle.fillStyle(0x000000, 0.3);
    castle.fillRect(goal.x - 65, goal.y - 70, 140, 110);
    
    // Main castle body
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x - 55, goal.y - 75, 110, 95);
    
    // Stone texture
    castle.fillStyle(0xb99a5c, 1);
    castle.fillRect(goal.x - 50, goal.y - 70, 100, 85);
    
    // Left tower
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x - 65, goal.y - 110, 35, 130);
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x - 60, goal.y - 105, 25, 120);
    // Left tower roof
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x - 65, goal.y - 110, goal.x - 47, goal.y - 145, goal.x - 30, goal.y - 110);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x - 60, goal.y - 110, goal.x - 47, goal.y - 135, goal.x - 35, goal.y - 110);
    
    // Right tower
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x + 30, goal.y - 110, 35, 130);
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x + 35, goal.y - 105, 25, 120);
    // Right tower roof
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x + 30, goal.y - 110, goal.x + 47, goal.y - 145, goal.x + 65, goal.y - 110);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x + 35, goal.y - 110, goal.x + 47, goal.y - 135, goal.x + 60, goal.y - 110);
    
    // Center tower
    castle.fillStyle(0xe9c88c, 1);
    castle.fillRect(goal.x - 20, goal.y - 120, 40, 80);
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x - 15, goal.y - 115, 30, 70);
    // Center tower roof
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x - 25, goal.y - 120, goal.x, goal.y - 160, goal.x + 25, goal.y - 120);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x - 18, goal.y - 120, goal.x, goal.y - 150, goal.x + 18, goal.y - 120);
    
    // Flag
    castle.fillStyle(0x4a4a4a, 1);
    castle.fillRect(goal.x - 2, goal.y - 180, 4, 35);
    castle.fillStyle(0xff0000, 1);
    castle.fillTriangle(goal.x + 2, goal.y - 180, goal.x + 2, goal.y - 160, goal.x + 30, goal.y - 170);
    
    // Battlements
    castle.fillStyle(0xd9b87c, 1);
    for (let i = -45; i <= 40; i += 18) {
      castle.fillRect(goal.x + i, goal.y - 85, 12, 18);
    }
    
    // Castle gate
    castle.fillStyle(0x3a2a1a, 1);
    castle.fillRect(goal.x - 20, goal.y - 50, 40, 70);
    castle.fillStyle(0x2a1a0a, 1);
    castle.fillRect(goal.x - 15, goal.y - 45, 30, 60);
    // Gate arch
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillCircle(goal.x, goal.y - 50, 20);
    castle.fillStyle(0x2a1a0a, 1);
    castle.fillCircle(goal.x, goal.y - 50, 15);
    // Gate bars
    castle.lineStyle(2, 0x5a4a3a, 1);
    for (let i = -12; i <= 12; i += 6) {
      castle.lineBetween(goal.x + i, goal.y - 45, goal.x + i, goal.y + 15);
    }
    
    // Windows
    castle.fillStyle(0xffeeaa, 0.9);
    castle.fillRect(goal.x - 50, goal.y - 60, 12, 18);
    castle.fillRect(goal.x + 38, goal.y - 60, 12, 18);
    castle.fillRect(goal.x - 8, goal.y - 100, 16, 22);
    // Window frames
    castle.lineStyle(2, 0x3a2a1a, 1);
    castle.strokeRect(goal.x - 50, goal.y - 60, 12, 18);
    castle.strokeRect(goal.x + 38, goal.y - 60, 12, 18);
    castle.strokeRect(goal.x - 8, goal.y - 100, 16, 22);
    
    // Tower windows
    castle.fillStyle(0xffeeaa, 0.7);
    castle.fillRect(goal.x - 55, goal.y - 80, 10, 14);
    castle.fillRect(goal.x + 45, goal.y - 80, 10, 14);
  }

  private createHUD(width: number, height: number): void {
    // HUD background with gradient effect
    const hudBg = this.add.graphics();
    hudBg.setDepth(100);
    
    // Dark background
    hudBg.fillStyle(0x1a0a00, 0.85);
    hudBg.fillRect(0, 0, width, 60);
    
    // Decorative bottom border
    hudBg.lineStyle(3, 0xd4a574, 1);
    hudBg.lineBetween(0, 60, width, 60);
    hudBg.lineStyle(1, 0x8b6914, 1);
    hudBg.lineBetween(0, 58, width, 58);
    
    // Corner decorations
    hudBg.fillStyle(0xd4a574, 1);
    hudBg.fillTriangle(0, 60, 30, 60, 0, 30);
    hudBg.fillTriangle(width, 60, width - 30, 60, width, 30);

    // Wave counter (center)
    this.waveText = this.add.text(width / 2, 32, `⚔️ WAVE 0 / ${this.waveManager.getTotalWaves()}`, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101);

    // Gold (left)
    this.goldText = this.add.text(30, 32, `💰 ${this.gold}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(101);

    // Castle HP (right)
    this.hpText = this.add.text(width - 30, 32, `❤️ ${this.castleHP}`, {
      fontFamily: 'Arial Black',
      fontSize: '26px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0.5).setDepth(101);

    // HP Bar (below castle)
    this.hpBar = this.add.graphics();
    this.hpBar.setDepth(20);  // Above castle (depth 15) but below towers
    this.updateHPBar();

    // Wave countdown text (center of screen, large and bold)
    this.countdownText = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(150).setVisible(false);

    // Start Wave button (center bottom area) - Desert themed
    this.startWaveButtonBg = this.add.graphics();
    this.startWaveButtonBg.setDepth(100);
    const buttonBg = this.startWaveButtonBg;
    
    // Draw desert-styled button background
    const btnX = width / 2;
    const btnY = height - 70;
    const btnWidth = 220;
    const btnHeight = 55;
    
    const drawButton = (hover: boolean) => {
      buttonBg.clear();
      
      // Outer stone border
      buttonBg.fillStyle(hover ? 0x8b6914 : 0x6b4914, 1);
      buttonBg.fillRoundedRect(btnX - btnWidth/2 - 4, btnY - btnHeight/2 - 4, btnWidth + 8, btnHeight + 8, 8);
      
      // Inner gradient-like fill
      buttonBg.fillStyle(hover ? 0xd4a574 : 0xc9956c, 1);
      buttonBg.fillRoundedRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 6);
      
      // Top highlight
      buttonBg.fillStyle(hover ? 0xebc99a : 0xdbb88a, 1);
      buttonBg.fillRoundedRect(btnX - btnWidth/2 + 4, btnY - btnHeight/2 + 4, btnWidth - 8, btnHeight/2 - 4, 4);
      
      // Decorative corner accents
      buttonBg.fillStyle(0x4a3520, 1);
      buttonBg.fillTriangle(btnX - btnWidth/2, btnY - btnHeight/2, btnX - btnWidth/2 + 15, btnY - btnHeight/2, btnX - btnWidth/2, btnY - btnHeight/2 + 15);
      buttonBg.fillTriangle(btnX + btnWidth/2, btnY - btnHeight/2, btnX + btnWidth/2 - 15, btnY - btnHeight/2, btnX + btnWidth/2, btnY - btnHeight/2 + 15);
      buttonBg.fillTriangle(btnX - btnWidth/2, btnY + btnHeight/2, btnX - btnWidth/2 + 15, btnY + btnHeight/2, btnX - btnWidth/2, btnY + btnHeight/2 - 15);
      buttonBg.fillTriangle(btnX + btnWidth/2, btnY + btnHeight/2, btnX + btnWidth/2 - 15, btnY + btnHeight/2, btnX + btnWidth/2, btnY + btnHeight/2 - 15);
    };
    
    drawButton(false);
    
    this.startWaveButton = this.add.text(btnX, btnY, '⚔ Start Wave 1', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#2a1a0a',
      stroke: '#ffd700',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    // Hit area for the whole button
    this.startWaveHitArea = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0xffffff, 0);
    this.startWaveHitArea.setDepth(102).setInteractive({ useHandCursor: true });
    const hitArea = this.startWaveHitArea;

    hitArea.on('pointerover', () => drawButton(true));
    hitArea.on('pointerout', () => drawButton(false));
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (!this.gameOver) {
        this.waveManager.startWave();
      }
    });

    // Back to menu button
    const backButton = this.add.text(25, height - 25, '← Menu', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#4a3520',
      padding: { x: 14, y: 8 }
    }).setOrigin(0, 0.5).setDepth(101).setInteractive({ useHandCursor: true });

    backButton.on('pointerover', () => backButton.setStyle({ backgroundColor: '#6b4d30' }));
    backButton.on('pointerout', () => backButton.setStyle({ backgroundColor: '#4a3520' }));
    backButton.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return;
    
    // Update all creeps
    this.creepManager.update(delta);
    
    // Update all projectiles
    this.projectileManager.update(delta);
    
    // Tower combat - find targets and fire
    this.updateTowerCombat();
  }

  /**
   * Update tower combat - targeting and firing
   */
  private updateTowerCombat(): void {
    const currentTime = this.time.now;
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
          stats: tower.getConfig().stats
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
