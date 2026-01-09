import Phaser from 'phaser';
import { TowerGraphics } from '../graphics';

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
  level: 1 | 2 | 3;
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
  archer_3: {
    key: 'archer_3',
    name: 'Archer Tower III',
    type: 'physical',
    branch: 'archer',
    level: 3,
    upgradeCost: 130,
    description: 'Master archer. Elite single-target damage.',
    stats: {
      range: 250,
      fireRate: 600,
      damage: 22
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
  rapidfire_3: {
    key: 'rapidfire_3',
    name: 'Rapid Fire III',
    type: 'physical',
    branch: 'rapidfire',
    level: 3,
    upgradeCost: 180,
    description: 'Machine gun fury. Devastating DPS.',
    stats: {
      range: 200,
      fireRate: 180,
      damage: 12
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
  sniper_3: {
    key: 'sniper_3',
    name: 'Sniper Tower III',
    type: 'physical',
    branch: 'sniper',
    level: 3,
    upgradeCost: 220,
    description: 'Assassin elite. 30% crit with 2.5x damage.',
    stats: {
      range: 550,
      fireRate: 1600,
      damage: 130,
      critChance: 0.30,
      critMultiplier: 2.5
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
  rockcannon_3: {
    key: 'rockcannon_3',
    name: 'Rock Cannon III',
    type: 'physical',
    branch: 'rockcannon',
    level: 3,
    upgradeCost: 200,
    description: 'Devastation. 150px splash radius.',
    stats: {
      range: 260,
      fireRate: 1200,
      damage: 55,
      splashRadius: 150
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
  icetower_3: {
    key: 'icetower_3',
    name: 'Ice Tower III',
    type: 'magic',
    branch: 'icetower',
    level: 3,
    upgradeCost: 190,
    description: 'Absolute zero. 60% slow for 3s.',
    stats: {
      range: 220,
      fireRate: 800,
      damage: 18,
      slowPercent: 0.6,
      slowDuration: 3000
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
  },
  poison_3: {
    key: 'poison_3',
    name: 'Poison Tower III',
    type: 'magic',
    branch: 'poison',
    level: 3,
    upgradeCost: 190,
    description: 'Plague bringer. 12 dmg/sec for 6s. Stacks 3x.',
    stats: {
      range: 240,
      fireRate: 1000,
      damage: 12,
      dotDamage: 12,
      dotDuration: 6000
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
  private currentLevel: 1 | 2 | 3;
  
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
    TowerGraphics.drawTower(this.graphics, this.currentBranch, this.currentLevel);
    TowerGraphics.drawRangeCircle(this.rangeGraphics, this.config.stats.range);
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
  getLevel(): 1 | 2 | 3 {
    return this.currentLevel;
  }

  /**
   * Check if tower can branch (only archer can branch to specializations)
   */
  canBranch(): boolean {
    return this.currentBranch === 'archer';
  }

  /**
   * Check if tower can upgrade to next level
   */
  canUpgradeLevel(): boolean {
    return this.currentLevel < 3;
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
      
      // Archer can also upgrade to next level if not at max
      if (this.currentLevel < 3) {
        options.levelUp = `archer_${this.currentLevel + 1}`;
      }
    } else {
      // Specialized towers can only upgrade level
      if (this.currentLevel < 3) {
        options.levelUp = `${this.currentBranch}_${this.currentLevel + 1}`;
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
      // From archer, can go to any branch L1 or next archer level
      const validUpgrade = 
        (newConfig.branch === 'archer' && newConfig.level === this.currentLevel + 1 && this.currentLevel < 3) ||
        (newConfig.branch !== 'archer' && newConfig.level === 1);
      
      if (!validUpgrade) return false;
    } else {
      // From specialized, can only go to same branch next level
      if (newConfig.branch !== this.currentBranch || newConfig.level !== this.currentLevel + 1 || this.currentLevel >= 3) {
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
   * Get targeting priority - prioritize leading creep (furthest along path)
   * Sniper targets highest HP instead
   */
  getTargetPriority(): 'closest' | 'highestHP' | 'furthestAlongPath' {
    return this.currentBranch === 'sniper' ? 'highestHP' : 'furthestAlongPath';
  }

  /**
   * Check if this tower's damage is magic (ignores armor)
   */
  isMagic(): boolean {
    return this.config.type === 'magic';
  }
}
