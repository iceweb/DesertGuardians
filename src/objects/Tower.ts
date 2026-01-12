import Phaser from 'phaser';
import { TowerGraphics, RapidFireAnimator, ArcherAnimator, CannonAnimator, SniperAnimator, IceAnimator, PoisonAnimator, AuraAnimator } from '../graphics';
import type { TowerConfig, TowerBranch } from '../data';
import { TOWER_CONFIGS, BRANCH_OPTIONS, GAME_CONFIG } from '../data';
import { TowerAbilityHandler, TOWER_ABILITIES } from './TowerAbilities';
import type { AbilityDefinition, AbilityContext, AbilityResult } from './TowerAbilities';

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
  'aura': AuraAnimator,
};

/**
 * Tower game object that can target and shoot creeps.
 */
export class Tower extends Phaser.GameObjects.Container {
  private config: TowerConfig;
  private graphics: Phaser.GameObjects.Graphics;
  private rangeGraphics: Phaser.GameObjects.Graphics;
  private buffGlowGraphics: Phaser.GameObjects.Graphics;
  private totalInvested: number;
  private currentBranch: TowerBranch;
  private currentLevel: 1 | 2 | 3 | 4;
  
  // Combat state
  private lastFireTime: number = 0;
  
  // Veteran system - kill tracking
  private killCount: number = 0;
  private veteranBadgeGraphics: Phaser.GameObjects.Graphics | null = null;
  private currentVeteranRank: number = 0;
  
  // Aura buff state
  private damageMultiplier: number = 1.0;
  private auraCritBonus: number = 0;  // Crit chance bonus from aura (0.15 = +15%)
  private buffGlowPhase: number = 0;
  
  // Single animator reference (replaces 6 separate nullable properties)
  private animator: TowerAnimator | null = null;
  private animatorBranch: TowerBranch | null = null;
  
  // Current target tracking (for animated turrets)
  private currentTarget: { x: number; y: number } | null = null;
  
  // Level 4 ability system
  private abilityHandler: TowerAbilityHandler | null = null;
  private selectedAbilityId: string | null = null;

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
    this.buffGlowGraphics = scene.add.graphics();
    this.rangeGraphics.setVisible(false);
    
    // Scale down tower graphics to 80% for tighter spacing
    this.graphics.setScale(0.8);
    
    this.add([this.buffGlowGraphics, this.rangeGraphics, this.graphics]);
    
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
    
    // Update buff glow animation if buffed
    if (this.damageMultiplier > 1.0) {
      this.buffGlowPhase += delta / 1000 * 3;
      if (this.buffGlowPhase > Math.PI * 2) {
        this.buffGlowPhase -= Math.PI * 2;
      }
      this.drawBuffGlow();
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
    
    // Increment kill count and check for rank up
    this.killCount++;
    const newRank = this.getVeteranRank();
    if (newRank !== this.currentVeteranRank) {
      this.currentVeteranRank = newRank;
      this.drawVeteranBadge();
    }
  }
  
  /**
   * Get total kills by this tower
   */
  getKillCount(): number {
    return this.killCount;
  }
  
  /**
   * Get veteran rank (0-3) based on kill count
   */
  getVeteranRank(): number {
    const ranks = GAME_CONFIG.VETERAN_RANKS;
    let rank = 0;
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (this.killCount >= ranks[i].minKills) {
        rank = i;
        break;
      }
    }
    return rank;
  }
  
  /**
   * Get veteran rank name
   */
  getVeteranRankName(): string {
    return GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].name;
  }
  
  /**
   * Get veteran damage multiplier (1.0, 1.05, 1.10, or 1.15)
   */
  getVeteranDamageMultiplier(): number {
    return 1 + GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].damageBonus;
  }
  
  /**
   * Get veteran damage bonus percentage (0, 5, 10, or 15)
   */
  getVeteranDamageBonus(): number {
    return Math.round(GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].damageBonus * 100);
  }
  
  /**
   * Draw veteran badge at bottom-right of tower
   */
  private drawVeteranBadge(): void {
    const rank = this.currentVeteranRank;
    
    // Create graphics if needed
    if (!this.veteranBadgeGraphics) {
      this.veteranBadgeGraphics = this.scene.add.graphics();
      this.add(this.veteranBadgeGraphics);
    }
    
    const g = this.veteranBadgeGraphics;
    g.clear();
    
    if (rank === 0) return; // No badge for Recruit
    
    // Badge position (bottom-right of tower)
    const badgeX = 22;
    const badgeY = 8;
    const badgeWidth = 18;
    const badgeHeight = 22;
    
    // Draw shield background
    g.fillStyle(0x1a1a1a, 0.95);
    g.beginPath();
    g.moveTo(badgeX - badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY + badgeHeight/4);
    g.lineTo(badgeX, badgeY + badgeHeight/2);
    g.lineTo(badgeX - badgeWidth/2, badgeY + badgeHeight/4);
    g.closePath();
    g.fillPath();
    
    // Draw gold border
    g.lineStyle(1.5, 0xd4a574, 1);
    g.beginPath();
    g.moveTo(badgeX - badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY + badgeHeight/4);
    g.lineTo(badgeX, badgeY + badgeHeight/2);
    g.lineTo(badgeX - badgeWidth/2, badgeY + badgeHeight/4);
    g.closePath();
    g.strokePath();
    
    // Draw chevrons based on rank
    const chevronWidth = 10;
    const chevronHeight = 4;
    const chevronSpacing = 5;
    const chevronsStartY = badgeY - (rank - 1) * chevronSpacing / 2;
    
    g.fillStyle(0xd4a574, 1);
    
    for (let i = 0; i < rank; i++) {
      const cy = chevronsStartY + i * chevronSpacing - 2;
      // Draw chevron (V shape pointing down)
      g.beginPath();
      g.moveTo(badgeX - chevronWidth/2, cy);
      g.lineTo(badgeX, cy + chevronHeight);
      g.lineTo(badgeX + chevronWidth/2, cy);
      g.lineTo(badgeX + chevronWidth/2, cy + 2);
      g.lineTo(badgeX, cy + chevronHeight + 2);
      g.lineTo(badgeX - chevronWidth/2, cy + 2);
      g.closePath();
      g.fillPath();
    }
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
  getLevel(): 1 | 2 | 3 | 4 {
    return this.currentLevel;
  }

  /**
   * Check if this is an aura (support) tower that doesn't attack
   */
  isAuraTower(): boolean {
    return this.currentBranch === 'aura' || this.config.stats.fireRate === 0;
  }

  /**
   * Get the aura damage multiplier buff (e.g., 0.20 for +20%)
   */
  getAuraMultiplier(): number {
    return this.config.stats.auraDamageMultiplier || 0;
  }

  /**
   * Set damage multiplier from aura buff
   */
  setDamageMultiplier(multiplier: number): void {
    const wasBuffed = this.damageMultiplier > 1.0 || this.auraCritBonus > 0;
    this.damageMultiplier = multiplier;
    
    // Clear glow if no longer buffed
    if (wasBuffed && multiplier <= 1.0 && this.auraCritBonus <= 0) {
      this.buffGlowGraphics.clear();
    }
  }

  /**
   * Get current damage multiplier
   */
  getDamageMultiplier(): number {
    return this.damageMultiplier;
  }

  /**
   * Set crit bonus from aura buff (e.g., 0.15 for +15% crit chance)
   */
  setAuraCritBonus(bonus: number): void {
    this.auraCritBonus = bonus;
  }

  /**
   * Get crit bonus from aura
   */
  getAuraCritBonus(): number {
    return this.auraCritBonus;
  }

  /**
   * Check if tower has any aura buffs (damage or crit)
   */
  hasAuraBuff(): boolean {
    return this.damageMultiplier > 1.0 || this.auraCritBonus > 0;
  }

  /**
   * Draw the red buff glow effect around this tower
   */
  private drawBuffGlow(): void {
    const g = this.buffGlowGraphics;
    g.clear();
    
    if (this.damageMultiplier <= 1.0 && this.auraCritBonus <= 0) return;
    
    // Pulsing glow intensity based on buff strength
    const buffStrength = (this.damageMultiplier - 1.0) + this.auraCritBonus; // Combined buff strength
    const pulseIntensity = (Math.sin(this.buffGlowPhase) + 1) * 0.5;
    const baseAlpha = 0.15 + pulseIntensity * 0.15 + buffStrength * 0.2;
    
    // Outer glow ring
    g.fillStyle(0xff4444, baseAlpha * 0.4);
    g.fillCircle(0, -20, 45);
    
    // Inner glow
    g.fillStyle(0xff6666, baseAlpha * 0.6);
    g.fillCircle(0, -20, 30);
    
    // Core shimmer
    g.fillStyle(0xffaaaa, baseAlpha * 0.3);
    g.fillCircle(0, -20, 18);
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
    // All tower branches can now go to level 4
    return this.currentLevel < 4;
  }

  /**
   * Get available upgrade options for this tower
   * Returns: { branches?: TowerBranch[], levelUp?: string, needsAbilitySelection?: boolean }
   */
  getUpgradeOptions(): { branches?: TowerBranch[]; levelUp?: string; needsAbilitySelection?: boolean } {
    const options: { branches?: TowerBranch[]; levelUp?: string; needsAbilitySelection?: boolean } = {};
    
    if (this.currentBranch === 'archer' && this.currentLevel === 1) {
      // Archer level 1 can branch to any specialization (including archer L2)
      options.branches = BRANCH_OPTIONS;
    } else {
      // All towers can upgrade to level 4
      if (this.currentLevel < 4) {
        options.levelUp = `${this.currentBranch}_${this.currentLevel + 1}`;
        // Level 4 upgrade requires ability selection
        if (this.currentLevel === 3) {
          options.needsAbilitySelection = true;
        }
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
   * For level 4 upgrades, call selectAbility() after this
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
      if (newConfig.branch !== this.currentBranch || newConfig.level !== this.currentLevel + 1 || this.currentLevel >= 4) {
        return false;
      }
    }
    
    this.config = { ...newConfig };
    this.currentBranch = newConfig.branch;
    this.currentLevel = newConfig.level;
    this.totalInvested += newConfig.upgradeCost;
    this.drawTower();
    
    // Initialize ability handler for level 4
    if (this.currentLevel === 4) {
      this.abilityHandler = new TowerAbilityHandler(this.scene, this.currentBranch);
    }
    
    return true;
  }
  
  /**
   * Get available abilities for level 4 selection
   */
  getAvailableAbilities(): AbilityDefinition[] {
    if (this.currentLevel !== 4) return [];
    return TOWER_ABILITIES[this.currentBranch] || [];
  }
  
  /**
   * Select an ability for this level 4 tower
   */
  selectAbility(abilityId: string): boolean {
    if (this.currentLevel !== 4 || !this.abilityHandler) return false;
    
    const success = this.abilityHandler.selectAbility(abilityId);
    if (success) {
      this.selectedAbilityId = abilityId;
    }
    return success;
  }
  
  /**
   * Get selected ability ID
   */
  getSelectedAbilityId(): string | null {
    return this.selectedAbilityId;
  }
  
  /**
   * Get ability handler
   */
  getAbilityHandler(): TowerAbilityHandler | null {
    return this.abilityHandler;
  }
  
  /**
   * Check if this tower has an ability
   */
  hasAbility(): boolean {
    return this.abilityHandler?.hasAbility() ?? false;
  }
  
  /**
   * Try to trigger ability on hit
   */
  tryTriggerAbility(context: AbilityContext): AbilityResult {
    if (!this.abilityHandler) {
      return { triggered: false };
    }
    return this.abilityHandler.rollForAbility(context);
  }
  
  /**
   * Get the selected ability definition (for UI display)
   */
  getSelectedAbility(): AbilityDefinition | null {
    return this.abilityHandler?.getSelectedAbility() ?? null;
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
   * Get tower's damage (with aura buff and veteran bonus applied)
   */
  getDamage(): number {
    const veteranMultiplier = this.getVeteranDamageMultiplier();
    return Math.floor(this.config.stats.damage * this.damageMultiplier * veteranMultiplier);
  }
  
  /**
   * Get base damage without any multipliers
   */
  getBaseDamage(): number {
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
