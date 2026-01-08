import Phaser from 'phaser';

export interface TowerStats {
  range: number;
  fireRate: number;      // ms between shots
  damage: number;
  splashRadius?: number; // for Rock Cannon
  slowPercent?: number;  // for Ice Tower
  slowDuration?: number; // for Ice Tower
  dotDamage?: number;    // for Poison Tower
  dotDuration?: number;  // for Poison Tower
  critChance?: number;   // for Sniper
  critMultiplier?: number;
}

export type TowerBranch = 'archer' | 'rapidfire' | 'sniper' | 'rockcannon' | 'icetower' | 'poison';

export interface TowerConfig {
  key: string;
  name: string;
  type: 'physical' | 'magic';
  branch: TowerBranch;
  level: 1 | 2;
  buildCost?: number;        // Only for archer (the only buildable tower)
  upgradeCost: number;       // Cost to upgrade TO this config
  description: string;
  stats: TowerStats;
}

// Branch upgrade options from Archer
export const BRANCH_OPTIONS: TowerBranch[] = ['rapidfire', 'sniper', 'rockcannon', 'icetower', 'poison'];

// All tower configurations keyed by "branch_level" (e.g., "archer_1", "sniper_2")
export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  // === ARCHER (Standard - the only buildable tower) ===
  archer_1: {
    key: 'archer_1',
    name: 'Archer Tower',
    type: 'physical',
    branch: 'archer',
    level: 1,
    buildCost: 70,
    upgradeCost: 0,
    description: 'Basic single target tower. Can branch into specialized towers.',
    stats: {
      range: 200,
      fireRate: 800,
      damage: 10
    }
  },
  archer_2: {
    key: 'archer_2',
    name: 'Archer Tower II',
    type: 'physical',
    branch: 'archer',
    level: 2,
    upgradeCost: 90,
    description: 'Improved archer. Can still branch into specialized towers.',
    stats: {
      range: 220,
      fireRate: 700,
      damage: 15
    }
  },

  // === RAPID FIRE ===
  rapidfire_1: {
    key: 'rapidfire_1',
    name: 'Rapid Fire',
    type: 'physical',
    branch: 'rapidfire',
    level: 1,
    upgradeCost: 120,
    description: 'High attack speed, low damage. Weak vs armor.',
    stats: {
      range: 180,
      fireRate: 300,
      damage: 6
    }
  },
  rapidfire_2: {
    key: 'rapidfire_2',
    name: 'Rapid Fire II',
    type: 'physical',
    branch: 'rapidfire',
    level: 2,
    upgradeCost: 140,
    description: 'Even faster attacks. Shreds unarmored targets.',
    stats: {
      range: 190,
      fireRate: 250,
      damage: 9
    }
  },

  // === SNIPER ===
  sniper_1: {
    key: 'sniper_1',
    name: 'Sniper Tower',
    type: 'physical',
    branch: 'sniper',
    level: 1,
    upgradeCost: 150,
    description: 'Long range, high damage. 20% crit chance.',
    stats: {
      range: 450,
      fireRate: 2000,
      damage: 60,
      critChance: 0.2,
      critMultiplier: 2
    }
  },
  sniper_2: {
    key: 'sniper_2',
    name: 'Sniper Tower II',
    type: 'physical',
    branch: 'sniper',
    level: 2,
    upgradeCost: 170,
    description: 'Deadly precision. 25% crit chance.',
    stats: {
      range: 500,
      fireRate: 1800,
      damage: 90,
      critChance: 0.25,
      critMultiplier: 2
    }
  },

  // === ROCK CANNON ===
  rockcannon_1: {
    key: 'rockcannon_1',
    name: 'Rock Cannon',
    type: 'physical',
    branch: 'rockcannon',
    level: 1,
    upgradeCost: 140,
    description: 'Splash damage in 100px radius.',
    stats: {
      range: 220,
      fireRate: 1500,
      damage: 25,
      splashRadius: 100
    }
  },
  rockcannon_2: {
    key: 'rockcannon_2',
    name: 'Rock Cannon II',
    type: 'physical',
    branch: 'rockcannon',
    level: 2,
    upgradeCost: 160,
    description: 'Bigger explosions. 120px splash radius.',
    stats: {
      range: 240,
      fireRate: 1400,
      damage: 38,
      splashRadius: 120
    }
  },

  // === ICE TOWER ===
  icetower_1: {
    key: 'icetower_1',
    name: 'Ice Tower',
    type: 'magic',
    branch: 'icetower',
    level: 1,
    upgradeCost: 130,
    description: 'Slows enemies by 40% for 2s. Ignores armor.',
    stats: {
      range: 180,
      fireRate: 1000,
      damage: 8,
      slowPercent: 0.4,
      slowDuration: 2000
    }
  },
  icetower_2: {
    key: 'icetower_2',
    name: 'Ice Tower II',
    type: 'magic',
    branch: 'icetower',
    level: 2,
    upgradeCost: 150,
    description: 'Freezing cold. 50% slow for 2.5s.',
    stats: {
      range: 200,
      fireRate: 900,
      damage: 12,
      slowPercent: 0.5,
      slowDuration: 2500
    }
  },

  // === POISON ===
  poison_1: {
    key: 'poison_1',
    name: 'Poison Tower',
    type: 'magic',
    branch: 'poison',
    level: 1,
    upgradeCost: 130,
    description: 'DoT: 5 dmg/sec for 5s. Stacks 3x. Ignores armor.',
    stats: {
      range: 200,
      fireRate: 1200,
      damage: 5,
      dotDamage: 5,
      dotDuration: 5000
    }
  },
  poison_2: {
    key: 'poison_2',
    name: 'Poison Tower II',
    type: 'magic',
    branch: 'poison',
    level: 2,
    upgradeCost: 150,
    description: 'Deadly venom. 8 dmg/sec for 5s. Stacks 3x.',
    stats: {
      range: 220,
      fireRate: 1100,
      damage: 8,
      dotDamage: 8,
      dotDuration: 5000
    }
  }
};

/**
 * Tower game object that can target and shoot creeps.
 */
export class Tower extends Phaser.GameObjects.Container {
  private config: TowerConfig;
  private graphics: Phaser.GameObjects.Graphics;
  private rangeGraphics: Phaser.GameObjects.Graphics;
  private totalInvested: number;
  private currentBranch: TowerBranch;
  private currentLevel: 1 | 2;
  
  // Combat state
  private lastFireTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, towerKey: string = 'archer_1') {
    super(scene, x, y);
    
    const initialConfig = TOWER_CONFIGS[towerKey];
    if (!initialConfig) {
      throw new Error(`Invalid tower key: ${towerKey}`);
    }
    
    this.config = { ...initialConfig };
    this.currentBranch = initialConfig.branch;
    this.currentLevel = initialConfig.level;
    this.totalInvested = initialConfig.buildCost || 0;
    
    // Create graphics
    this.graphics = scene.add.graphics();
    this.rangeGraphics = scene.add.graphics();
    this.rangeGraphics.setVisible(false);
    
    this.add([this.rangeGraphics, this.graphics]);
    
    // Draw the tower
    this.drawTower();
    
    // Setup interactivity
    this.setSize(60, 100);
    this.setInteractive({ useHandCursor: true });
    
    scene.add.existing(this);
    this.setDepth(20);
  }

  /**
   * Draw tower based on its branch type
   */
  private drawTower(): void {
    this.graphics.clear();
    
    switch (this.currentBranch) {
      case 'archer':
        this.drawArcherTower();
        break;
      case 'rapidfire':
        this.drawRapidFireTower();
        break;
      case 'sniper':
        this.drawSniperTower();
        break;
      case 'rockcannon':
        this.drawRockCannonTower();
        break;
      case 'icetower':
        this.drawIceTower();
        break;
      case 'poison':
        this.drawPoisonTower();
        break;
      default:
        this.drawArcherTower();
    }
    
    // Draw level indicator for level 2 towers
    if (this.currentLevel === 2) {
      this.drawLevelIndicator();
    }
    
    // Draw range circle
    this.rangeGraphics.clear();
    this.rangeGraphics.lineStyle(2, 0xffffff, 0.3);
    this.rangeGraphics.strokeCircle(0, 0, this.config.stats.range);
    this.rangeGraphics.fillStyle(0xffffff, 0.1);
    this.rangeGraphics.fillCircle(0, 0, this.config.stats.range);
  }

  /**
   * Draw level 2 indicator (stars)
   */
  private drawLevelIndicator(): void {
    const g = this.graphics;
    // Draw two small gold diamonds above the tower to indicate level 2
    g.fillStyle(0xffd700, 1);
    // Left diamond
    g.fillTriangle(-12, -95, -8, -100, -4, -95);
    g.fillTriangle(-12, -95, -8, -90, -4, -95);
    // Right diamond
    g.fillTriangle(4, -95, 8, -100, 12, -95);
    g.fillTriangle(4, -95, 8, -90, 12, -95);
  }

  private drawArcherTower(): void {
    const g = this.graphics;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50, 18);
    
    // Stone base
    g.fillStyle(0x8b7355, 1);
    g.fillRect(-28, 8, 56, 18);
    g.fillStyle(0x9a8265, 1);
    g.fillRect(-25, 10, 50, 14);
    
    // Stone texture
    g.lineStyle(1, 0x6b5344, 0.5);
    g.lineBetween(-24, 17, 24, 17);
    g.lineBetween(-10, 10, -10, 24);
    g.lineBetween(10, 10, 10, 24);
    
    // Tower body
    g.fillStyle(0xd4a574, 1);
    g.beginPath();
    g.moveTo(-22, 10);
    g.lineTo(-18, -55);
    g.lineTo(18, -55);
    g.lineTo(22, 10);
    g.closePath();
    g.fillPath();
    
    // Lighter panel
    g.fillStyle(0xe8c896, 1);
    g.beginPath();
    g.moveTo(-16, 5);
    g.lineTo(-13, -50);
    g.lineTo(13, -50);
    g.lineTo(16, 5);
    g.closePath();
    g.fillPath();
    
    // Brick lines
    g.lineStyle(1, 0xb8956a, 0.6);
    for (let i = 0; i < 5; i++) {
      const yPos = -45 + i * 12;
      const widthAtY = 14 + (i * 0.5);
      g.lineBetween(-widthAtY, yPos, widthAtY, yPos);
    }
    g.lineBetween(0, -50, 0, 5);
    g.lineBetween(-8, -45, -7, 0);
    g.lineBetween(8, -45, 7, 0);
    
    // Archer window
    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-7, -35, 14, 22);
    g.fillCircle(0, -35, 7);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -33, 10, 18);
    g.fillCircle(0, -33, 5);
    g.fillStyle(0xff6600, 0.4);
    g.fillRect(-2, -30, 4, 12);
    
    // Battlements
    g.fillStyle(0xc9a06c, 1);
    g.fillRect(-20, -62, 10, 10);
    g.fillRect(-5, -62, 10, 10);
    g.fillRect(10, -62, 10, 10);
    g.fillRect(-22, -55, 44, 5);
    
    // Banner
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-2, -85, 4, 25);
    g.fillStyle(0xcc3333, 1);
    g.beginPath();
    g.moveTo(2, -85);
    g.lineTo(22, -78);
    g.lineTo(22, -70);
    g.lineTo(2, -65);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xff4444, 1);
    g.beginPath();
    g.moveTo(2, -83);
    g.lineTo(18, -78);
    g.lineTo(18, -74);
    g.lineTo(2, -70);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffd700, 1);
    g.fillRect(8, -80, 6, 2);
    g.fillRect(10, -82, 2, 6);
    
    // Gold trim
    g.lineStyle(2, 0xdaa520, 0.8);
    g.lineBetween(-20, -55, 20, -55);
    
    // Torches
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(-25, -25, 5, 8);
    g.fillRect(20, -25, 5, 8);
    g.fillStyle(0xff6600, 0.8);
    g.fillCircle(-22, -30, 4);
    g.fillCircle(23, -30, 4);
    g.fillStyle(0xffaa00, 0.9);
    g.fillCircle(-22, -32, 2);
    g.fillCircle(23, -32, 2);
    
    // Corner stones
    g.fillStyle(0xa08060, 1);
    g.fillRect(-24, 0, 6, 10);
    g.fillRect(18, 0, 6, 10);
  }

  private drawRapidFireTower(): void {
    const g = this.graphics;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50, 18);
    
    // Base
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-30, 5, 60, 20);
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-27, 8, 54, 14);
    
    // Metal body
    g.fillStyle(0x6a6a6a, 1);
    g.beginPath();
    g.moveTo(-20, 8);
    g.lineTo(-16, -45);
    g.lineTo(16, -45);
    g.lineTo(20, 8);
    g.closePath();
    g.fillPath();
    
    g.fillStyle(0x8a8a8a, 1);
    g.beginPath();
    g.moveTo(-14, 4);
    g.lineTo(-11, -40);
    g.lineTo(11, -40);
    g.lineTo(14, 4);
    g.closePath();
    g.fillPath();
    
    // Multiple arrow slits (rapid fire!)
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -35, 4, 12);
    g.fillRect(-1, -38, 4, 15);
    g.fillRect(6, -35, 4, 12);
    
    // Yellow glow
    g.fillStyle(0xffff00, 0.3);
    g.fillRect(-7, -33, 2, 8);
    g.fillRect(0, -36, 2, 11);
    g.fillRect(7, -33, 2, 8);
    
    // Top platform
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-18, -50, 36, 6);
    
    // Crossbow mechanism
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-12, -58, 24, 8);
    g.fillStyle(0x8b4513, 1);
    g.fillRect(-15, -55, 6, 4);
    g.fillRect(9, -55, 6, 4);
    
    // Yellow banner
    g.fillStyle(0xffd700, 1);
    g.fillRect(-2, -75, 4, 18);
    g.fillStyle(0xffaa00, 1);
    g.beginPath();
    g.moveTo(2, -75);
    g.lineTo(18, -70);
    g.lineTo(18, -62);
    g.lineTo(2, -60);
    g.closePath();
    g.fillPath();
  }

  private drawSniperTower(): void {
    const g = this.graphics;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 30, 45, 16);
    
    // Tall thin base
    g.fillStyle(0x5a5a5a, 1);
    g.fillRect(-20, 10, 40, 18);
    
    // Tall body
    g.fillStyle(0x8a8a8a, 1);
    g.beginPath();
    g.moveTo(-15, 12);
    g.lineTo(-10, -80);
    g.lineTo(10, -80);
    g.lineTo(15, 12);
    g.closePath();
    g.fillPath();
    
    g.fillStyle(0x9a9a9a, 1);
    g.beginPath();
    g.moveTo(-10, 8);
    g.lineTo(-6, -75);
    g.lineTo(6, -75);
    g.lineTo(10, 8);
    g.closePath();
    g.fillPath();
    
    // Scope window
    g.fillStyle(0x2a2a4a, 1);
    g.fillCircle(0, -50, 10);
    g.fillStyle(0x4a4a8a, 0.5);
    g.fillCircle(0, -50, 7);
    g.fillStyle(0x00ffff, 0.3);
    g.fillCircle(-2, -52, 3);
    
    // Crosshair
    g.lineStyle(1, 0xff0000, 0.8);
    g.lineBetween(-6, -50, 6, -50);
    g.lineBetween(0, -56, 0, -44);
    
    // Top platform
    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(-12, -85, 24, 6);
    
    // Sniper crossbow
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-4, -95, 8, 12);
    g.fillStyle(0x8b4513, 1);
    g.fillRect(-20, -90, 40, 4);
    
    // Blue banner (precision)
    g.fillStyle(0x2a2a4a, 1);
    g.fillRect(-2, -110, 4, 18);
    g.fillStyle(0x4169e1, 1);
    g.beginPath();
    g.moveTo(2, -110);
    g.lineTo(18, -105);
    g.lineTo(18, -97);
    g.lineTo(2, -95);
    g.closePath();
    g.fillPath();
  }

  private drawRockCannonTower(): void {
    const g = this.graphics;
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 28, 55, 20);
    
    // Heavy stone base
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(-32, 5, 64, 22);
    g.fillStyle(0x7a6a5a, 1);
    g.fillRect(-28, 8, 56, 16);
    
    // Stone patterns
    g.lineStyle(2, 0x5a4a3a, 0.6);
    g.lineBetween(-28, 15, 28, 15);
    g.lineBetween(-15, 8, -15, 25);
    g.lineBetween(15, 8, 15, 25);
    
    // Thick body
    g.fillStyle(0x8a7a6a, 1);
    g.beginPath();
    g.moveTo(-28, 8);
    g.lineTo(-24, -40);
    g.lineTo(24, -40);
    g.lineTo(28, 8);
    g.closePath();
    g.fillPath();
    
    g.fillStyle(0x9a8a7a, 1);
    g.beginPath();
    g.moveTo(-22, 4);
    g.lineTo(-18, -35);
    g.lineTo(18, -35);
    g.lineTo(22, 4);
    g.closePath();
    g.fillPath();
    
    // Cannon barrel
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-8, -55, 16, 20);
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(-6, -53, 12, 15);
    g.fillCircle(0, -55, 10);
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -55, 6);
    
    // Rocks around
    g.fillStyle(0x5a4a3a, 1);
    g.fillCircle(-20, -20, 6);
    g.fillCircle(22, -18, 5);
    g.fillCircle(-18, -8, 4);
    
    // Orange banner (explosive)
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-2, -75, 4, 22);
    g.fillStyle(0xff6600, 1);
    g.beginPath();
    g.moveTo(2, -75);
    g.lineTo(20, -68);
    g.lineTo(20, -58);
    g.lineTo(2, -55);
    g.closePath();
    g.fillPath();
  }

  private drawIceTower(): void {
    const g = this.graphics;
    
    // Icy glow
    g.fillStyle(0x00ffff, 0.1);
    g.fillCircle(0, -20, 50);
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50, 18);
    
    // Ice crystal base
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(-25, 5, 50, 18);
    g.fillStyle(0xadd8e6, 0.8);
    g.fillRect(-22, 8, 44, 12);
    
    // Main crystal spire
    g.fillStyle(0xb0e0e6, 0.9);
    g.beginPath();
    g.moveTo(-18, 8);
    g.lineTo(-5, -60);
    g.lineTo(5, -60);
    g.lineTo(18, 8);
    g.closePath();
    g.fillPath();
    
    // Crystal highlight
    g.fillStyle(0xe0ffff, 0.7);
    g.beginPath();
    g.moveTo(-10, 5);
    g.lineTo(-2, -55);
    g.lineTo(2, -55);
    g.lineTo(8, 5);
    g.closePath();
    g.fillPath();
    
    // Side crystals
    g.fillStyle(0xadd8e6, 0.8);
    g.beginPath();
    g.moveTo(-25, 10);
    g.lineTo(-15, -30);
    g.lineTo(-10, 10);
    g.closePath();
    g.fillPath();
    
    g.beginPath();
    g.moveTo(25, 10);
    g.lineTo(15, -30);
    g.lineTo(10, 10);
    g.closePath();
    g.fillPath();
    
    // Snowflake top
    g.lineStyle(2, 0xffffff, 0.9);
    g.lineBetween(0, -70, 0, -55);
    g.lineBetween(-8, -65, 8, -58);
    g.lineBetween(-8, -58, 8, -65);
    
    // Sparkles
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(-12, -40, 2);
    g.fillCircle(10, -35, 2);
    g.fillCircle(-5, -20, 2);
    g.fillCircle(8, -25, 2);
  }

  private drawPoisonTower(): void {
    const g = this.graphics;
    
    // Poison glow
    g.fillStyle(0x00ff00, 0.1);
    g.fillCircle(0, -15, 45);
    
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50, 18);
    
    // Gnarled wood base
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(-25, 5, 50, 18);
    g.fillStyle(0x5a4a3a, 1);
    g.fillRect(-22, 8, 44, 12);
    
    // Twisted trunk
    g.fillStyle(0x3a2a1a, 1);
    g.beginPath();
    g.moveTo(-15, 10);
    g.lineTo(-18, -20);
    g.lineTo(-12, -35);
    g.lineTo(-5, -45);
    g.lineTo(5, -45);
    g.lineTo(12, -35);
    g.lineTo(18, -20);
    g.lineTo(15, 10);
    g.closePath();
    g.fillPath();
    
    // Bark texture
    g.lineStyle(1, 0x2a1a0a, 0.6);
    g.lineBetween(-12, -10, -14, -30);
    g.lineBetween(12, -10, 14, -30);
    g.lineBetween(-5, 0, -8, -40);
    g.lineBetween(5, 0, 8, -40);
    
    // Poison cauldron
    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, -50, 15);
    g.fillStyle(0x00ff00, 0.8);
    g.fillCircle(0, -52, 11);
    
    // Bubbles
    g.fillStyle(0x88ff88, 0.7);
    g.fillCircle(-4, -55, 3);
    g.fillCircle(5, -53, 2);
    g.fillCircle(0, -48, 4);
    
    // Dripping poison
    g.fillStyle(0x00ff00, 0.6);
    g.fillEllipse(-10, -40, 3, 8);
    g.fillEllipse(12, -38, 3, 6);
    
    // Skull decoration
    g.fillStyle(0xd0d0d0, 1);
    g.fillCircle(0, -15, 8);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(-3, -17, 2);
    g.fillCircle(3, -17, 2);
    g.fillTriangle(0, -14, -2, -10, 2, -10);
  }

  /**
   * Show/hide range indicator
   */
  setSelected(selected: boolean): void {
    this.rangeGraphics.setVisible(selected);
  }

  /**
   * Get tower config
   */
  getConfig(): TowerConfig {
    return this.config;
  }

  /**
   * Get current branch
   */
  getBranch(): TowerBranch {
    return this.currentBranch;
  }

  /**
   * Get current level
   */
  getLevel(): 1 | 2 {
    return this.currentLevel;
  }

  /**
   * Check if tower can branch (only archer can branch to specializations)
   */
  canBranch(): boolean {
    return this.currentBranch === 'archer';
  }

  /**
   * Check if tower can upgrade to level 2
   */
  canUpgradeLevel(): boolean {
    return this.currentLevel === 1;
  }

  /**
   * Get available upgrade options for this tower
   * Returns: { branches?: TowerBranch[], levelUp?: string }
   */
  getUpgradeOptions(): { branches?: TowerBranch[]; levelUp?: string } {
    const options: { branches?: TowerBranch[]; levelUp?: string } = {};
    
    if (this.currentBranch === 'archer') {
      // Archer can branch to specializations
      options.branches = BRANCH_OPTIONS;
      
      // Archer can also upgrade to level 2 if at level 1
      if (this.currentLevel === 1) {
        options.levelUp = 'archer_2';
      }
    } else {
      // Specialized towers can only upgrade level
      if (this.currentLevel === 1) {
        options.levelUp = `${this.currentBranch}_2`;
      }
    }
    
    return options;
  }

  /**
   * Get total gold invested in this tower
   */
  getTotalInvested(): number {
    return this.totalInvested;
  }

  /**
   * Get sell value (70% of invested)
   */
  getSellValue(): number {
    return Math.floor(this.totalInvested * 0.7);
  }

  /**
   * Upgrade the tower to a new config (branch or level up)
   */
  upgrade(newKey: string): boolean {
    const newConfig = TOWER_CONFIGS[newKey];
    if (!newConfig) return false;
    
    // Validate upgrade path
    if (this.currentBranch === 'archer') {
      // From archer, can go to any branch L1 or archer L2
      const validUpgrade = 
        (newConfig.branch === 'archer' && newConfig.level === 2 && this.currentLevel === 1) ||
        (newConfig.branch !== 'archer' && newConfig.level === 1);
      
      if (!validUpgrade) return false;
    } else {
      // From specialized, can only go to same branch L2
      if (newConfig.branch !== this.currentBranch || newConfig.level !== 2 || this.currentLevel !== 1) {
        return false;
      }
    }
    
    this.config = { ...newConfig };
    this.currentBranch = newConfig.branch;
    this.currentLevel = newConfig.level;
    this.totalInvested += newConfig.upgradeCost;
    this.drawTower();
    
    return true;
  }

  /**
   * Check if position is in range
   */
  isInRange(x: number, y: number): boolean {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    return dist <= this.config.stats.range;
  }

  /**
   * Get tower's range
   */
  getRange(): number {
    return this.config.stats.range;
  }

  /**
   * Get tower's fire rate
   */
  getFireRate(): number {
    return this.config.stats.fireRate;
  }

  /**
   * Get tower's damage
   */
  getDamage(): number {
    return this.config.stats.damage;
  }

  /**
   * Check if tower is ready to fire
   */
  canFire(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= this.config.stats.fireRate;
  }

  /**
   * Mark that the tower has fired
   */
  recordFire(currentTime: number): void {
    this.lastFireTime = currentTime;
  }

  /**
   * Get targeting priority for Sniper (highest HP first)
   */
  getTargetPriority(): 'closest' | 'highestHP' | 'furthestAlongPath' {
    return this.currentBranch === 'sniper' ? 'highestHP' : 'closest';
  }

  /**
   * Check if this tower's damage is magic (ignores armor)
   */
  isMagic(): boolean {
    return this.config.type === 'magic';
  }
}
