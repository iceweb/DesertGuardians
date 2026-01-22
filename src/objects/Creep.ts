import Phaser from 'phaser';
import { PathSystem } from '../managers';
import { CreepGraphics } from '../graphics';
import type { CreepConfig } from '../data';
import { CREEP_TYPES, GAME_CONFIG } from '../data';
import { StatusEffectHandler } from './StatusEffectHandler';
import { CreepAbilities } from './CreepAbilities';
import { CreepEffects } from './CreepEffects';

export class Creep extends Phaser.GameObjects.Container {
  private config!: CreepConfig;
  private pathSystem!: PathSystem;
  private distanceTraveled: number = 0;
  private currentHealth: number = 0;
  private isActive: boolean = false;
  private isDying: boolean = false;

  private bodyGraphics!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFg!: Phaser.GameObjects.Graphics;
  private shieldGraphics!: Phaser.GameObjects.Graphics;
  private statusGraphics!: Phaser.GameObjects.Graphics;

  private bounceTime: number = 0;
  private faceDirection: number = 1;

  private bossFirstHit: boolean = false;
  private bossPainThresholdTriggered: boolean = false;
  private bossIsPained: boolean = false;
  private bossRageAnimationActive: boolean = false;
  private bossRageAnimationEndTime: number = 0;

  private statusEffects!: StatusEffectHandler;
  private abilities!: CreepAbilities;
  private effects!: CreepEffects;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.bodyGraphics = scene.add.graphics();
    this.healthBarBg = scene.add.graphics();
    this.healthBarFg = scene.add.graphics();
    this.statusGraphics = scene.add.graphics();
    this.shieldGraphics = scene.add.graphics();

    this.add([
      this.bodyGraphics,
      this.healthBarBg,
      this.healthBarFg,
      this.statusGraphics,
      this.shieldGraphics,
    ]);

    this.statusEffects = new StatusEffectHandler(scene, this.statusGraphics);
    this.abilities = new CreepAbilities(scene);
    this.effects = new CreepEffects(scene);

    this.setupAbilityCallbacks();

    scene.add.existing(this);
    this.setDepth(30);
    this.setActive(false);
    this.setVisible(false);
    this.setSize(40, 40);
    this.setInteractive({ useHandCursor: true });
  }

  private setupAbilityCallbacks(): void {
    this.abilities.setCallbacks({
      onJumpStart: (targetX, targetY, duration) => {
        this.effects.showJumpDustCloud(this.x, this.y);
        this.effects.playJumpAnimation(this, targetX, targetY, duration, () => {
          this.effects.showJumpDustCloud(this.x, this.y);
        });
      },
      onJumpComplete: (newDistance) => {
        this.distanceTraveled = newDistance;
      },
      onDiggerStop: () => {
        this.effects.showDiggerPrepare(this.x, this.y);
      },
      onBurrow: () => {
        this.effects.showBurrowEffect(this.x, this.y);

        this.bodyGraphics.setAlpha(0);
        this.healthBarBg.setAlpha(0);
        this.healthBarFg.setAlpha(0);
      },
      onResurfaceStart: () => {
        this.effects.showResurfaceStart(this.x, this.y);
      },
      onSurface: () => {
        this.effects.showSurfaceEffect(this.x, this.y);

        this.bodyGraphics.setAlpha(1);
        this.healthBarBg.setAlpha(1);
        this.healthBarFg.setAlpha(1);
      },
      onGhostPhaseStart: () => {
        this.effects.showGhostPhaseStart(this.x, this.y);
      },
      onGhostPhaseEnd: () => {
        this.setAlpha(1);
      },
      onDispel: () => {
        const immunityDuration = this.config.dispelImmunity ?? GAME_CONFIG.DISPEL_IMMUNITY_DURATION;
        if (this.statusEffects.dispelAll(immunityDuration)) {
          this.effects.showDispelEffect(this.x, this.y, this.config.sizeScale || 1.0);
        }
      },
    });
  }

  spawn(
    pathSystem: PathSystem,
    creepType: string,
    waveNumber: number = 1,
    difficultyMultiplier: number = 1.0
  ): void {
    this.pathSystem = pathSystem;
    const baseConfig = CREEP_TYPES[creepType] || CREEP_TYPES.furball;

    const hpMultiplier = Math.min(
      GAME_CONFIG.MAX_HP_MULTIPLIER,
      1 + (waveNumber - 1) * GAME_CONFIG.WAVE_HP_SCALING
    );
    const scaledMaxHealth = Math.floor(baseConfig.maxHealth * hpMultiplier * difficultyMultiplier);

    // Armor scaling: only applies to creeps with base armor > 0
    const armorMultiplier =
      baseConfig.armor > 0
        ? Math.min(
            GAME_CONFIG.MAX_ARMOR_MULTIPLIER,
            1 + (waveNumber - 1) * GAME_CONFIG.WAVE_ARMOR_SCALING
          )
        : 1;
    const scaledArmor = Math.floor(baseConfig.armor * armorMultiplier);

    this.config = { ...baseConfig, maxHealth: scaledMaxHealth, armor: scaledArmor };
    this.distanceTraveled = 0;
    this.currentHealth = this.config.maxHealth;
    this.isActive = true;
    this.isDying = false;
    this.bounceTime = Math.random() * Math.PI * 2;

    this.bossFirstHit = false;
    this.bossPainThresholdTriggered = false;
    this.bossIsPained = false;
    this.bossRageAnimationActive = false;
    this.bossRageAnimationEndTime = 0;

    this.abilities.initialize(this.config);

    this.setScale(this.config.sizeScale || 1.0);

    this.statusEffects.reset();
    this.statusEffects.setOnPoisonDamage((damage: number) => {
      if (this.isActive) {
        if (this.abilities.isImmune()) {
          return;
        }
        this.currentHealth -= damage;
        this.updateHealthBar();
        this.effects.showPoisonDamage(this.x, this.y, damage);
        if (this.currentHealth <= 0) this.die();
      }
    });
    this.statusEffects.setOnBurnDamage((damage: number) => {
      if (this.isActive) {
        if (this.abilities.isImmune()) {
          return;
        }
        this.currentHealth -= damage;
        this.updateHealthBar();
        this.effects.showBurnDamage(this.x, this.y, damage);
        if (this.currentHealth <= 0) this.die();
      }
    });

    const startPos = pathSystem.getStartPoint();
    this.setPosition(startPos.x, startPos.y);

    this.setActive(true);
    this.setVisible(true);

    this.redraw();
    this.updateHealthBar();
    this.updateShieldVisual();
  }

  private redraw(): void {
    const state = this.abilities.getState();

    CreepGraphics.drawCreep(
      this.bodyGraphics,
      this.config.type,
      0,
      1,
      state.jumpWarningTime > 0,
      state.isJumping,
      state.isBurrowed,
      this.bossIsPained
    );
  }

  private updateShieldVisual(): void {
    const state = this.abilities.getState();
    CreepGraphics.drawShield(this.shieldGraphics, this.bounceTime, state.shieldHitsRemaining);
  }

  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFg.clear();

    if (this.currentHealth >= this.config.maxHealth) {
      return;
    }

    const barWidth = 30,
      barHeight = 4,
      yOffset = -35;

    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, yOffset - 1, barWidth + 2, barHeight + 2);

    const healthPercent = this.currentHealth / this.config.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBarFg.fillStyle(fillColor, 1);
    this.healthBarFg.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);
  }

  update(delta: number): void {
    if (!this.isActive) return;

    const state = this.abilities.getState();
    const wasBurrowed = state.isBurrowed;

    this.statusEffects.update(delta);
    this.abilities.updateJump(delta, this.config, this.pathSystem, this.distanceTraveled);
    this.abilities.updateDigger(delta, this.config);
    this.abilities.updateGhostPhase(delta, this.config, this.currentHealth, this.config.maxHealth);
    this.abilities.updateDispel(delta);

    if (state.isBurrowed !== wasBurrowed) {
      this.redraw();
    }

    if (state.isGhostPhase) {
      this.setAlpha(this.abilities.getGhostFlickerAlpha());
    }

    this.bounceTime += delta / 1000;

    if (this.bossRageAnimationActive && this.scene.time.now >= this.bossRageAnimationEndTime) {
      this.bossRageAnimationActive = false;
    }

    if (!state.isJumping && !this.bossRageAnimationActive) {
      const speedMultiplier = this.statusEffects.getSpeedMultiplier();
      const moveDistance = (this.config.speed * speedMultiplier * delta) / 1000;
      this.distanceTraveled += moveDistance;

      const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
      if (pathData.direction.x !== 0) {
        this.faceDirection = pathData.direction.x > 0 ? 1 : -1;
      }
      this.setPosition(pathData.position.x, pathData.position.y);
    }

    const isBoss = this.config.type.startsWith('boss');
    const animSpeed = isBoss ? 4 : 8;
    const bounceAmp = isBoss ? 3 : 4;

    const bounceSine = Math.sin(this.bounceTime * animSpeed);
    const bounceAmount = Math.abs(bounceSine) * bounceAmp;

    this.bodyGraphics.y = -bounceAmount;

    const squash = 1 + bounceSine * 0.05;
    this.bodyGraphics.scaleY = squash;

    this.bodyGraphics.scaleX = this.faceDirection * (1 / squash);

    if (state.shieldHitsRemaining > 0) this.updateShieldVisual();
    this.statusEffects.draw(this.scene.time.now);

    if (this.pathSystem.hasReachedEnd(this.distanceTraveled)) {
      this.reachEnd();
    }
  }

  applySlow(percent: number, durationMs: number): void {
    this.statusEffects.applySlow(percent, durationMs);
  }

  applyPoison(damagePerSecond: number, durationMs: number): void {
    this.statusEffects.applyPoison(damagePerSecond, durationMs);
  }

  applyFreeze(durationMs: number): void {
    this.statusEffects.applyFreeze(durationMs);
  }

  applyBurn(damagePerSecond: number, durationMs: number): void {
    this.statusEffects.applyBurn(damagePerSecond, durationMs);
  }

  applyBrittle(durationMs: number): void {
    this.statusEffects.applyBrittle(durationMs);
  }

  isBrittle(): boolean {
    return this.statusEffects.isBrittle();
  }

  applyArmorReduction(amount: number): void {
    this.statusEffects.applyArmorReduction(amount);
  }

  applyKnockback(distance: number): void {
    // Bosses are highly resistant to knockback
    if (this.isBoss()) {
      distance = distance * 0.1;
    }

    // Cannot knock back below start
    this.distanceTraveled = Math.max(0, this.distanceTraveled - distance);

    // Update position immediately
    const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
    this.setPosition(pathData.position.x, pathData.position.y);
  }

  clearSlow(): void {
    this.statusEffects.clearSlow();
  }

  getPoisonStackCount(): number {
    return this.statusEffects.getPoisonStackCount();
  }

  isFrozen(): boolean {
    return this.statusEffects.isFrozen();
  }

  isSlowed(): boolean {
    return this.statusEffects.isSlowed();
  }

  /* eslint-disable complexity */
  takeDamage(amount: number, isMagic: boolean = false, towerBranch?: string): number {
    if (!this.isActive) return 0;

    if (this.config.onlyDamagedBy) {
      const requiredBranch = this.config.onlyDamagedBy === 'ice' ? 'icetower' : 'poison';
      if (towerBranch !== requiredBranch) {
        this.effects.showImmuneText(this.x, this.y);
        return 0;
      }
    }

    if (this.abilities.isImmune()) {
      if (this.abilities.getState().isGhostPhase) {
        this.effects.showImmuneText(this.x, this.y);
      }
      return 0;
    }

    if (this.abilities.tryBlockWithShield()) {
      this.effects.showShieldBlockEffect(this.x, this.y, this.shieldGraphics);
      this.updateShieldVisual();

      if (this.abilities.getState().shieldHitsRemaining === 0) {
        this.effects.showShieldBreakEffect(this.x, this.y);
      }
      return 0;
    }

    const effectiveArmor = Math.max(0, this.config.armor - this.statusEffects.getArmorReduction());
    // Percentage-based armor: damage * (100 / (100 + armor))
    const armorMultiplier = 100 / (100 + effectiveArmor);

    // Brittle status: +30% physical damage
    const brittleMultiplier = !isMagic && this.statusEffects.isBrittle() ? 1.3 : 1.0;

    const actualDamage = isMagic
      ? amount
      : Math.max(1, Math.round(amount * armorMultiplier * brittleMultiplier));
    const previousHealth = this.currentHealth;
    this.currentHealth -= actualDamage;

    if (this.isBoss() && actualDamage > 0) {
      if (!this.bossFirstHit) {
        this.bossFirstHit = true;
        this.emit('bossFirstHit', this);
      }

      const healthPercent = this.currentHealth / this.config.maxHealth;
      const previousHealthPercent = previousHealth / this.config.maxHealth;
      if (
        !this.bossPainThresholdTriggered &&
        previousHealthPercent > 0.25 &&
        healthPercent <= 0.25
      ) {
        this.bossPainThresholdTriggered = true;
        this.bossIsPained = true;

        if (this.config.type === 'boss_5') {
          this.bossRageAnimationActive = true;
          this.bossRageAnimationEndTime = this.scene.time.now + 1500;
        }

        this.emit('bossPainThreshold', this);

        this.redraw();
      }
    }

    this.updateHealthBar();
    this.effects.flashGraphics(this.bodyGraphics);

    if (this.currentHealth <= 0) this.die();

    return actualDamage;
  }

  private reachEnd(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.emit('reachedEnd', this);
    this.deactivate();
  }

  private die(): void {
    if (!this.isActive || this.isDying) return;

    this.isActive = false;
    this.isDying = true;

    this.healthBarBg.clear();
    this.healthBarFg.clear();

    const goldReward = this.config.goldReward;
    this.emit('died', this, goldReward);

    if (this.config.spawnOnDeath) {
      this.emit(
        'spawnOnDeath',
        this,
        this.config.spawnOnDeath.type,
        this.config.spawnOnDeath.count,
        this.x,
        this.y,
        this.distanceTraveled
      );
      this.effects.showSpawnEffect(this.x, this.y, this.config.spawnOnDeath.count);
    }

    this.effects.playDeathAnimation(this, () => this.deactivate());
  }

  deactivate(): void {
    this.isActive = false;
    this.isDying = false;
    this.setActive(false);
    this.setVisible(false);
    this.setAlpha(1);
    this.setScale(1);

    this.bodyGraphics.clear();
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    this.statusGraphics.clear();
    this.shieldGraphics.clear();

    this.statusEffects.clear();
    this.statusEffects.reset();
    this.abilities.reset();
  }

  getConfig(): CreepConfig {
    return this.config;
  }
  getDistanceTraveled(): number {
    return this.distanceTraveled;
  }
  setDistanceTraveled(distance: number): void {
    this.distanceTraveled = distance;
  }
  getDistanceRemaining(): number {
    return this.pathSystem.getDistanceRemaining(this.distanceTraveled);
  }
  getIsActive(): boolean {
    return this.isActive;
  }
  canBeReused(): boolean {
    return !this.isActive && !this.isDying;
  }
  getCurrentHealth(): number {
    return this.currentHealth;
  }
  getShieldHitsRemaining(): number {
    return this.abilities.getState().shieldHitsRemaining;
  }
  isFlying(): boolean {
    return this.config.isFlying === true;
  }
  getIsBurrowed(): boolean {
    return this.abilities.getState().isBurrowed;
  }
  getIsGhostPhase(): boolean {
    return this.abilities.getState().isGhostPhase;
  }
  getDiggerPhase(): 'walking' | 'stopping' | 'burrowed' | 'resurfacing' {
    return this.abilities.getState().diggerPhase;
  }
  canBeTargeted(): boolean {
    return this.isActive && this.abilities.canBeTargeted();
  }

  isBoss(): boolean {
    return this.config.type.startsWith('boss');
  }

  isPained(): boolean {
    return this.bossIsPained;
  }
}
