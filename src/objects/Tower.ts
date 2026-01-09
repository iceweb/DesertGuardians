import Phaser from 'phaser';
import { TowerGraphics, RapidFireAnimator, ArcherAnimator, CannonAnimator, SniperAnimator, IceAnimator, PoisonAnimator } from '../graphics';
import type { TowerConfig, TowerBranch } from '../data';
import { TOWER_CONFIGS, BRANCH_OPTIONS } from '../data';

// Re-export types for backwards compatibility
export type { TowerStats, TowerConfig, TowerBranch } from '../data';
export { TOWER_CONFIGS, BRANCH_OPTIONS } from '../data';

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
  
  // Animated tower components
  private rapidFireAnimator: RapidFireAnimator | null = null;
  private archerAnimator: ArcherAnimator | null = null;
  private cannonAnimator: CannonAnimator | null = null;
  private sniperAnimator: SniperAnimator | null = null;
  private iceAnimator: IceAnimator | null = null;
  private poisonAnimator: PoisonAnimator | null = null;
  
  // Current target tracking (for animated turrets)
  private currentTarget: { x: number; y: number } | null = null;

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
    
    // Scale down tower graphics to 80% for tighter spacing
    this.graphics.setScale(0.8);
    
    this.add([this.rangeGraphics, this.graphics]);
    
    // Draw the tower (or setup animator for rapidfire)
    this.drawTower();
    
    // Setup interactivity
    this.setSize(60, 100);
    this.setInteractive({ useHandCursor: true });
    
    scene.add.existing(this);
    this.setDepth(20);
  }

  /**
   * Update tower each frame (for animations)
   */
  update(delta: number): void {
    // Update rapidfire animator if present
    if (this.rapidFireAnimator) {
      if (this.currentTarget) {
        this.rapidFireAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.rapidFireAnimator.update(delta);
    }
    
    // Update archer animator if present
    if (this.archerAnimator) {
      if (this.currentTarget) {
        this.archerAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.archerAnimator.update(delta);
    }
    
    // Update cannon animator if present
    if (this.cannonAnimator) {
      if (this.currentTarget) {
        this.cannonAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.cannonAnimator.update(delta);
    }
    
    // Update sniper animator if present
    if (this.sniperAnimator) {
      if (this.currentTarget) {
        this.sniperAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.sniperAnimator.update(delta);
    }
    
    // Update ice animator if present
    if (this.iceAnimator) {
      if (this.currentTarget) {
        this.iceAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.iceAnimator.update(delta);
    }
    
    // Update poison animator if present
    if (this.poisonAnimator) {
      if (this.currentTarget) {
        this.poisonAnimator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.poisonAnimator.update(delta);
    }
  }

  /**
   * Set current target for turret tracking
   */
  setCurrentTarget(target: { x: number; y: number } | null): void {
    this.currentTarget = target;
    
    if (!target) {
      if (this.rapidFireAnimator) {
        this.rapidFireAnimator.clearTarget();
      }
      if (this.archerAnimator) {
        this.archerAnimator.clearTarget();
      }
      if (this.cannonAnimator) {
        this.cannonAnimator.clearTarget();
      }
      if (this.sniperAnimator) {
        this.sniperAnimator.clearTarget();
      }
      if (this.iceAnimator) {
        this.iceAnimator.clearTarget();
      }
      if (this.poisonAnimator) {
        this.poisonAnimator.clearTarget();
      }
    }
  }

  /**
   * Get current target
   */
  getCurrentTarget(): { x: number; y: number } | null {
    return this.currentTarget;
  }

  /**
   * Called when tower fires - triggers animations and returns projectile spawn offset
   */
  onFire(): { x: number; y: number } | null {
    if (this.rapidFireAnimator) {
      return this.rapidFireAnimator.onFire();
    }
    if (this.archerAnimator) {
      return this.archerAnimator.onFire();
    }
    if (this.cannonAnimator) {
      return this.cannonAnimator.onFire();
    }
    if (this.sniperAnimator) {
      return this.sniperAnimator.onFire();
    }
    if (this.iceAnimator) {
      return this.iceAnimator.onFire();
    }
    if (this.poisonAnimator) {
      return this.poisonAnimator.onFire();
    }
    return null;
  }

  /**
   * Get the projectile spawn position offset from tower center
   * For animated towers, this is calculated from the current facing direction
   * For other towers, returns a default offset
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    if (this.rapidFireAnimator) {
      return this.rapidFireAnimator.getBarrelTipOffset();
    }
    if (this.archerAnimator) {
      return this.archerAnimator.getArrowSpawnOffset();
    }
    if (this.cannonAnimator) {
      return this.cannonAnimator.getProjectileSpawnOffset();
    }
    if (this.sniperAnimator) {
      return this.sniperAnimator.getProjectileSpawnOffset();
    }
    if (this.iceAnimator) {
      return this.iceAnimator.getProjectileSpawnOffset();
    }
    if (this.poisonAnimator) {
      return this.poisonAnimator.getProjectileSpawnOffset();
    }
    // Default offset for other tower types (above tower)
    return { x: 0, y: -40 };
  }

  /**
   * Called when this tower kills a creep - triggers cheering animation
   */
  onKill(): void {
    if (this.rapidFireAnimator) {
      this.rapidFireAnimator.onKill();
    }
    if (this.archerAnimator) {
      this.archerAnimator.onKill();
    }
    if (this.cannonAnimator) {
      this.cannonAnimator.onKill();
    }
    if (this.sniperAnimator) {
      this.sniperAnimator.onKill();
    }
    if (this.iceAnimator) {
      this.iceAnimator.onKill();
    }
    if (this.poisonAnimator) {
      this.poisonAnimator.onKill();
    }
  }

  /**
   * Draw tower based on its branch type
   */
  private drawTower(): void {
    // Clean up existing animators if switching branch
    if (this.rapidFireAnimator && this.currentBranch !== 'rapidfire') {
      this.rapidFireAnimator.destroy();
      this.rapidFireAnimator = null;
    }
    if (this.archerAnimator && this.currentBranch !== 'archer') {
      this.archerAnimator.destroy();
      this.archerAnimator = null;
    }
    if (this.cannonAnimator && this.currentBranch !== 'rockcannon') {
      this.cannonAnimator.destroy();
      this.cannonAnimator = null;
    }
    if (this.sniperAnimator && this.currentBranch !== 'sniper') {
      this.sniperAnimator.destroy();
      this.sniperAnimator = null;
    }
    if (this.iceAnimator && this.currentBranch !== 'icetower') {
      this.iceAnimator.destroy();
      this.iceAnimator = null;
    }
    if (this.poisonAnimator && this.currentBranch !== 'poison') {
      this.poisonAnimator.destroy();
      this.poisonAnimator = null;
    }
    
    // For animated tower types, use their respective animator
    if (this.currentBranch === 'rapidfire') {
      this.graphics.clear();
      if (!this.rapidFireAnimator) {
        this.rapidFireAnimator = new RapidFireAnimator(this.scene, this, this.currentLevel);
      } else {
        this.rapidFireAnimator.setLevel(this.currentLevel);
      }
    } else if (this.currentBranch === 'archer') {
      this.graphics.clear();
      if (!this.archerAnimator) {
        this.archerAnimator = new ArcherAnimator(this.scene, this, this.currentLevel);
      } else {
        this.archerAnimator.setLevel(this.currentLevel);
      }
    } else if (this.currentBranch === 'rockcannon') {
      this.graphics.clear();
      if (!this.cannonAnimator) {
        this.cannonAnimator = new CannonAnimator(this.scene, this, this.currentLevel);
      } else {
        this.cannonAnimator.setLevel(this.currentLevel);
      }
    } else if (this.currentBranch === 'sniper') {
      this.graphics.clear();
      if (!this.sniperAnimator) {
        this.sniperAnimator = new SniperAnimator(this.scene, this, this.currentLevel);
      } else {
        this.sniperAnimator.setLevel(this.currentLevel);
      }
    } else if (this.currentBranch === 'icetower') {
      this.graphics.clear();
      if (!this.iceAnimator) {
        this.iceAnimator = new IceAnimator(this.scene, this, this.currentLevel);
      } else {
        this.iceAnimator.setLevel(this.currentLevel);
      }
    } else if (this.currentBranch === 'poison') {
      this.graphics.clear();
      if (!this.poisonAnimator) {
        this.poisonAnimator = new PoisonAnimator(this.scene, this, this.currentLevel);
      } else {
        this.poisonAnimator.setLevel(this.currentLevel);
      }
    }
    
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
    
    if (this.currentBranch === 'archer' && this.currentLevel === 1) {
      // Archer level 1 can branch to any specialization (including archer L2)
      options.branches = BRANCH_OPTIONS;
    } else {
      // All other towers (including archer L2+) can only upgrade level
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
    if (this.currentBranch === 'archer' && this.currentLevel === 1) {
      // From archer L1, can go to any branch L1 (specialization) or archer L2
      const validUpgrade = 
        (newConfig.branch === 'archer' && newConfig.level === 2) ||
        (newConfig.branch !== 'archer' && newConfig.level === 1);
      
      if (!validUpgrade) return false;
    } else {
      // From any other tower, can only go to same branch next level
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
