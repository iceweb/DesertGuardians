import Phaser from 'phaser';
import { TowerGraphics, RapidFireAnimator, ArcherAnimator, CannonAnimator, SniperAnimator, IceAnimator, PoisonAnimator } from '../graphics';
import type { TowerConfig, TowerBranch } from '../data';
import { TOWER_CONFIGS, BRANCH_OPTIONS, GAME_CONFIG } from '../data';

// Re-export types for backwards compatibility
export type { TowerStats, TowerConfig, TowerBranch } from '../data';
export { TOWER_CONFIGS, BRANCH_OPTIONS } from '../data';

/**
 * Common interface for all tower animators
 */
interface TowerAnimator {
  update(delta: number): void;
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void;
  clearTarget(): void;
  onFire(): { x: number; y: number };
  onKill(): void;
  setLevel(level: number): void;
  getProjectileSpawnOffset(): { x: number; y: number };
  destroy(): void;
}

/**
 * Animator factory map - maps branch names to animator constructors
 */
const ANIMATOR_CONSTRUCTORS: Record<string, new (scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) => TowerAnimator> = {
  'rapidfire': RapidFireAnimator,
  'archer': ArcherAnimator,
  'rockcannon': CannonAnimator,
  'sniper': SniperAnimator,
  'icetower': IceAnimator,
  'poison': PoisonAnimator,
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
  
  // Single animator reference (replaces 6 separate nullable properties)
  private animator: TowerAnimator | null = null;
  private animatorBranch: TowerBranch | null = null;
  
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
    // Depth based on y position for isometric sorting - towers higher on screen (lower y) should be behind
    this.setDepth(20 + Math.floor(y / 10));
  }

  /**
   * Update tower each frame (for animations)
   */
  update(delta: number): void {
    if (this.animator) {
      if (this.currentTarget) {
        this.animator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.animator.update(delta);
    }
  }

  /**
   * Set current target for turret tracking
   */
  setCurrentTarget(target: { x: number; y: number } | null): void {
    this.currentTarget = target;
    
    if (!target) {
      this.animator?.clearTarget();
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
    return this.animator?.onFire() ?? null;
  }

  /**
   * Get the projectile spawn position offset from tower center
   * For animated towers, this is calculated from the current facing direction
   * For other towers, returns a default offset
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    return this.animator?.getProjectileSpawnOffset() ?? GAME_CONFIG.DEFAULT_PROJECTILE_OFFSET;
  }

  /**
   * Called when this tower kills a creep - triggers cheering animation
   */
  onKill(): void {
    this.animator?.onKill();
  }

  /**
   * Draw tower based on its branch type
   */
  private drawTower(): void {
    // Check if we need to create a new animator (branch changed or first time)
    const AnimatorClass = ANIMATOR_CONSTRUCTORS[this.currentBranch];
    
    if (AnimatorClass) {
      // This branch uses an animator
      if (this.animatorBranch !== this.currentBranch) {
        // Branch changed - destroy old animator and create new one
        this.animator?.destroy();
        this.graphics.clear();
        this.animator = new AnimatorClass(this.scene, this, this.currentLevel);
        this.animatorBranch = this.currentBranch;
      } else if (this.animator) {
        // Same branch - just update level
        this.animator.setLevel(this.currentLevel);
      }
    } else {
      // This branch doesn't use an animator - clean up if we had one
      if (this.animator) {
        this.animator.destroy();
        this.animator = null;
        this.animatorBranch = null;
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
   * Get targeting priority - all towers prioritize leading creep (furthest along path)
   */
  getTargetPriority(): 'closest' | 'highestHP' | 'furthestAlongPath' {
    return 'furthestAlongPath';
  }

  /**
   * Check if this tower's damage is magic (ignores armor)
   */
  isMagic(): boolean {
    return this.config.type === 'magic';
  }
}
