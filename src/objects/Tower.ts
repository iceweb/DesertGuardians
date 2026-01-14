import Phaser from 'phaser';
import { TowerGraphics } from '../graphics';
import type { TowerAnimatorFactory, TowerAnimator } from '../graphics/TowerAnimatorFactory';
import type { TowerConfig, TowerBranch } from '../data';
import { TOWER_CONFIGS, BRANCH_OPTIONS, GAME_CONFIG } from '../data';
import { TowerAbilityHandler, TOWER_ABILITIES } from './TowerAbilities';
import type { AbilityDefinition, AbilityContext, AbilityResult } from './TowerAbilities';

export class Tower extends Phaser.GameObjects.Container {
  private config: TowerConfig;
  private graphics: Phaser.GameObjects.Graphics;
  private rangeGraphics: Phaser.GameObjects.Graphics;
  private buffGlowGraphics: Phaser.GameObjects.Graphics;
  private totalInvested: number;
  private currentBranch: TowerBranch;
  private currentLevel: 1 | 2 | 3 | 4;

  private lastFireTime: number = 0;

  private killCount: number = 0;
  private veteranBadgeGraphics: Phaser.GameObjects.Graphics | null = null;
  private currentVeteranRank: number = 0;

  private damageMultiplier: number = 1.0;
  private auraCritBonus: number = 0;
  private buffGlowPhase: number = 0;

  private animator: TowerAnimator | null = null;
  private animatorBranch: TowerBranch | null = null;
  private animatorFactory: TowerAnimatorFactory | null = null;

  private currentTarget: { x: number; y: number } | null = null;

  private abilityHandler: TowerAbilityHandler | null = null;
  private selectedAbilityId: string | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, towerKey: string = 'archer_1', animatorFactory?: TowerAnimatorFactory) {
    super(scene, x, y);

    this.animatorFactory = animatorFactory || null;

    const initialConfig = TOWER_CONFIGS[towerKey];
    if (!initialConfig) {
      throw new Error(`Invalid tower key: ${towerKey}`);
    }

    this.config = { ...initialConfig };
    this.currentBranch = initialConfig.branch;
    this.currentLevel = initialConfig.level;
    this.totalInvested = initialConfig.buildCost || 0;

    this.graphics = scene.add.graphics();
    this.rangeGraphics = scene.add.graphics();
    this.buffGlowGraphics = scene.add.graphics();
    this.rangeGraphics.setVisible(false);

    this.graphics.setScale(0.8);

    this.add([this.buffGlowGraphics, this.rangeGraphics, this.graphics]);

    this.drawTower();

    this.setSize(60, 100);
    this.setInteractive({ useHandCursor: true });

    scene.add.existing(this);

    this.setDepth(20 + Math.floor(y / 10));
  }

  update(delta: number): void {
    if (this.animator) {
      if (this.currentTarget) {
        this.animator.setTarget(this.currentTarget.x, this.currentTarget.y, this.x, this.y);
      }
      this.animator.update(delta);
    }

    if (this.damageMultiplier > 1.0) {
      this.buffGlowPhase += delta / 1000 * 3;
      if (this.buffGlowPhase > Math.PI * 2) {
        this.buffGlowPhase -= Math.PI * 2;
      }
      this.drawBuffGlow();
    }
  }

  setCurrentTarget(target: { x: number; y: number } | null): void {
    this.currentTarget = target;

    if (!target) {
      this.animator?.clearTarget();
    }
  }

  getCurrentTarget(): { x: number; y: number } | null {
    return this.currentTarget;
  }

  onFire(): { x: number; y: number } | null {
    return this.animator?.onFire() ?? null;
  }

  getProjectileSpawnOffset(): { x: number; y: number } {
    return this.animator?.getProjectileSpawnOffset() ?? GAME_CONFIG.DEFAULT_PROJECTILE_OFFSET;
  }

  onKill(): void {
    this.animator?.onKill();

    this.killCount++;
    const newRank = this.getVeteranRank();
    if (newRank !== this.currentVeteranRank) {
      this.currentVeteranRank = newRank;
      this.drawVeteranBadge();
    }
  }

  getKillCount(): number {
    return this.killCount;
  }

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

  getVeteranRankName(): string {
    return GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].name;
  }

  getVeteranDamageMultiplier(): number {
    return 1 + GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].damageBonus;
  }

  getVeteranDamageBonus(): number {
    return Math.round(GAME_CONFIG.VETERAN_RANKS[this.getVeteranRank()].damageBonus * 100);
  }

  private drawVeteranBadge(): void {
    const rank = this.currentVeteranRank;

    if (!this.veteranBadgeGraphics) {
      this.veteranBadgeGraphics = this.scene.add.graphics();
      this.add(this.veteranBadgeGraphics);
    }

    const g = this.veteranBadgeGraphics;
    g.clear();

    if (rank === 0) return;

    const badgeX = 22;
    const badgeY = 8;
    const badgeWidth = 18;
    const badgeHeight = 22;

    g.fillStyle(0x1a1a1a, 0.95);
    g.beginPath();
    g.moveTo(badgeX - badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY + badgeHeight/4);
    g.lineTo(badgeX, badgeY + badgeHeight/2);
    g.lineTo(badgeX - badgeWidth/2, badgeY + badgeHeight/4);
    g.closePath();
    g.fillPath();

    g.lineStyle(1.5, 0xd4a574, 1);
    g.beginPath();
    g.moveTo(badgeX - badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY - badgeHeight/2);
    g.lineTo(badgeX + badgeWidth/2, badgeY + badgeHeight/4);
    g.lineTo(badgeX, badgeY + badgeHeight/2);
    g.lineTo(badgeX - badgeWidth/2, badgeY + badgeHeight/4);
    g.closePath();
    g.strokePath();

    const chevronWidth = 10;
    const chevronHeight = 4;
    const chevronSpacing = 5;
    const chevronsStartY = badgeY - (rank - 1) * chevronSpacing / 2;

    g.fillStyle(0xd4a574, 1);

    for (let i = 0; i < rank; i++) {
      const cy = chevronsStartY + i * chevronSpacing - 2;

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

  private drawTower(): void {

    const hasAnimator = this.animatorFactory?.hasAnimator(this.currentBranch) ?? false;

    if (hasAnimator && this.animatorFactory) {

      if (this.animatorBranch !== this.currentBranch) {

        this.animator?.destroy();
        this.graphics.clear();
        this.animator = this.animatorFactory.create(this.currentBranch, this, this.currentLevel);
        this.animatorBranch = this.currentBranch;
      } else if (this.animator) {

        this.animator.setLevel(this.currentLevel);
      }
    } else {

      if (this.animator) {
        this.animator.destroy();
        this.animator = null;
        this.animatorBranch = null;
      }
    }

    TowerGraphics.drawRangeCircle(this.rangeGraphics, this.config.stats.range);
  }

  setSelected(selected: boolean): void {
    this.rangeGraphics.setVisible(selected);
  }

  getConfig(): TowerConfig {
    return this.config;
  }

  getBranch(): TowerBranch {
    return this.currentBranch;
  }

  getLevel(): 1 | 2 | 3 | 4 {
    return this.currentLevel;
  }

  isAuraTower(): boolean {
    return this.currentBranch === 'aura' || this.config.stats.fireRate === 0;
  }

  getAuraMultiplier(): number {
    return this.config.stats.auraDamageMultiplier || 0;
  }

  setDamageMultiplier(multiplier: number): void {
    const wasBuffed = this.damageMultiplier > 1.0 || this.auraCritBonus > 0;
    this.damageMultiplier = multiplier;

    if (wasBuffed && multiplier <= 1.0 && this.auraCritBonus <= 0) {
      this.buffGlowGraphics.clear();
    }
  }

  getDamageMultiplier(): number {
    return this.damageMultiplier;
  }

  setAuraCritBonus(bonus: number): void {
    this.auraCritBonus = bonus;
  }

  getAuraCritBonus(): number {
    return this.auraCritBonus;
  }

  hasAuraBuff(): boolean {
    return this.damageMultiplier > 1.0 || this.auraCritBonus > 0;
  }

  private drawBuffGlow(): void {
    const g = this.buffGlowGraphics;
    g.clear();

    if (this.damageMultiplier <= 1.0 && this.auraCritBonus <= 0) return;

    const buffStrength = (this.damageMultiplier - 1.0) + this.auraCritBonus;
    const pulseIntensity = (Math.sin(this.buffGlowPhase) + 1) * 0.5;
    const baseAlpha = 0.15 + pulseIntensity * 0.15 + buffStrength * 0.2;

    g.fillStyle(0xff4444, baseAlpha * 0.4);
    g.fillCircle(0, -20, 45);

    g.fillStyle(0xff6666, baseAlpha * 0.6);
    g.fillCircle(0, -20, 30);

    g.fillStyle(0xffaaaa, baseAlpha * 0.3);
    g.fillCircle(0, -20, 18);
  }

  canBranch(): boolean {
    return this.currentBranch === 'archer';
  }

  canUpgradeLevel(): boolean {

    return this.currentLevel < 4;
  }

  getUpgradeOptions(): { branches?: TowerBranch[]; levelUp?: string; needsAbilitySelection?: boolean } {
    const options: { branches?: TowerBranch[]; levelUp?: string; needsAbilitySelection?: boolean } = {};

    if (this.currentBranch === 'archer' && this.currentLevel === 1) {

      options.branches = BRANCH_OPTIONS;
    } else {

      if (this.currentLevel < 4) {
        options.levelUp = `${this.currentBranch}_${this.currentLevel + 1}`;

        if (this.currentLevel === 3) {
          options.needsAbilitySelection = true;
        }
      }
    }

    return options;
  }

  getTotalInvested(): number {
    return this.totalInvested;
  }

  getSellValue(): number {
    return Math.floor(this.totalInvested * 0.7);
  }

  upgrade(newKey: string): boolean {
    const newConfig = TOWER_CONFIGS[newKey];
    if (!newConfig) return false;

    if (this.currentBranch === 'archer' && this.currentLevel === 1) {

      const validUpgrade =
        (newConfig.branch === 'archer' && newConfig.level === 2) ||
        (newConfig.branch !== 'archer' && newConfig.level === 1);

      if (!validUpgrade) return false;
    } else {

      if (newConfig.branch !== this.currentBranch || newConfig.level !== this.currentLevel + 1 || this.currentLevel >= 4) {
        return false;
      }
    }

    this.config = { ...newConfig };
    this.currentBranch = newConfig.branch;
    this.currentLevel = newConfig.level;
    this.totalInvested += newConfig.upgradeCost;
    this.drawTower();

    if (this.currentLevel === 4) {
      this.abilityHandler = new TowerAbilityHandler(this.scene, this.currentBranch);
    }

    return true;
  }

  getAvailableAbilities(): AbilityDefinition[] {
    if (this.currentLevel !== 4) return [];
    return TOWER_ABILITIES[this.currentBranch] || [];
  }

  selectAbility(abilityId: string): boolean {
    if (this.currentLevel !== 4 || !this.abilityHandler) return false;

    const success = this.abilityHandler.selectAbility(abilityId);
    if (success) {
      this.selectedAbilityId = abilityId;
    }
    return success;
  }

  getSelectedAbilityId(): string | null {
    return this.selectedAbilityId;
  }

  getAbilityHandler(): TowerAbilityHandler | null {
    return this.abilityHandler;
  }

  hasAbility(): boolean {
    return this.abilityHandler?.hasAbility() ?? false;
  }

  tryTriggerAbility(context: AbilityContext): AbilityResult {
    if (!this.abilityHandler) {
      return { triggered: false };
    }
    return this.abilityHandler.rollForAbility(context);
  }

  getSelectedAbility(): AbilityDefinition | null {
    return this.abilityHandler?.getSelectedAbility() ?? null;
  }

  isInRange(x: number, y: number): boolean {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    return dist <= this.config.stats.range;
  }

  getRange(): number {
    return this.config.stats.range;
  }

  getFireRate(): number {
    return this.config.stats.fireRate;
  }

  getDamage(): number {
    const veteranMultiplier = this.getVeteranDamageMultiplier();
    return Math.floor(this.config.stats.damage * this.damageMultiplier * veteranMultiplier);
  }

  getBaseDamage(): number {
    return this.config.stats.damage;
  }

  canFire(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= this.config.stats.fireRate;
  }

  recordFire(currentTime: number): void {
    this.lastFireTime = currentTime;
  }

  getTargetPriority(): 'closest' | 'highestHP' | 'furthestAlongPath' {
    return 'furthestAlongPath';
  }

  isMagic(): boolean {
    return this.config.type === 'magic';
  }
}
