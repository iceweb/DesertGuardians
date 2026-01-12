import Phaser from 'phaser';
import { PathSystem } from '../managers';
import { CreepGraphics } from '../graphics';
import type { CreepConfig } from '../data';
import { CREEP_TYPES, GAME_CONFIG } from '../data';
import { StatusEffectHandler } from './StatusEffectHandler';
import { CreepAbilities } from './CreepAbilities';
import { CreepEffects } from './CreepEffects';

/**
 * Creep game object that follows a path from spawn to castle.
 * Rendered using graphics (no sprites needed).
 * 
 * Abilities and effects are delegated to:
 * - CreepAbilities: Shield, Jump, Digger, Ghost abilities
 * - CreepEffects: Visual effects (dust, damage numbers, etc.)
 * - StatusEffectHandler: Slow, Poison effects
 */
export class Creep extends Phaser.GameObjects.Container {
  private config!: CreepConfig;
  private pathSystem!: PathSystem;
  private distanceTraveled: number = 0;
  private currentHealth: number = 0;
  private isActive: boolean = false;
  private isDying: boolean = false;
  
  // Graphics components
  private bodyGraphics!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFg!: Phaser.GameObjects.Graphics;
  private shieldGraphics!: Phaser.GameObjects.Graphics;
  private statusGraphics!: Phaser.GameObjects.Graphics;
  
  // Animation
  private bounceTime: number = 0;
  private faceDirection: number = 1;
  
  // Delegated handlers
  private statusEffects!: StatusEffectHandler;
  private abilities!: CreepAbilities;
  private effects!: CreepEffects;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create graphics
    this.bodyGraphics = scene.add.graphics();
    this.healthBarBg = scene.add.graphics();
    this.healthBarFg = scene.add.graphics();
    this.statusGraphics = scene.add.graphics();
    this.shieldGraphics = scene.add.graphics();
    
    this.add([this.bodyGraphics, this.healthBarBg, this.healthBarFg, this.statusGraphics, this.shieldGraphics]);
    
    // Create handlers
    this.statusEffects = new StatusEffectHandler(scene, this.statusGraphics);
    this.abilities = new CreepAbilities(scene);
    this.effects = new CreepEffects(scene);
    
    // Setup ability callbacks
    this.setupAbilityCallbacks();
    
    scene.add.existing(this);
    this.setDepth(30);
    this.setActive(false);
    this.setVisible(false);
    this.setSize(40, 40);
    this.setInteractive({ useHandCursor: true });
  }

  /**
   * Setup callbacks from abilities to effects
   */
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
        // Brief pause before digging - visual shake
        this.effects.showDiggerPrepare(this.x, this.y);
      },
      onBurrow: () => {
        this.effects.showBurrowEffect(this.x, this.y);
        // Hide the main body - we'll draw a shadow/mound in drawCreep
        this.bodyGraphics.setAlpha(0);
        this.healthBarBg.setAlpha(0);
        this.healthBarFg.setAlpha(0);
      },
      onResurfaceStart: () => {
        // Start resurfacing animation - show dirt eruption
        this.effects.showResurfaceStart(this.x, this.y);
      },
      onSurface: () => {
        this.effects.showSurfaceEffect(this.x, this.y);
        // Restore the main body
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
        // Dispel all status effects with immunity and show visual
        if (this.statusEffects.dispelAll(GAME_CONFIG.DISPEL_IMMUNITY_DURATION)) {
          this.effects.showDispelEffect(this.x, this.y);
        }
      }
    });
  }

  /**
   * Initialize/reset the creep for spawning
   */
  spawn(pathSystem: PathSystem, creepType: string, waveNumber: number = 1): void {
    this.pathSystem = pathSystem;
    const baseConfig = CREEP_TYPES[creepType] || CREEP_TYPES.furball;
    
    // Apply wave-based HP scaling
    const hpMultiplier = Math.min(
      GAME_CONFIG.MAX_HP_MULTIPLIER,
      1 + (waveNumber - 1) * GAME_CONFIG.WAVE_HP_SCALING
    );
    const scaledMaxHealth = Math.floor(baseConfig.maxHealth * hpMultiplier);
    
    this.config = { ...baseConfig, maxHealth: scaledMaxHealth };
    this.distanceTraveled = 0;
    this.currentHealth = this.config.maxHealth;
    this.isActive = true;
    this.isDying = false;
    this.bounceTime = Math.random() * Math.PI * 2;
    
    // Initialize abilities
    this.abilities.initialize(this.config);
    
    // Apply size scale
    this.setScale(this.config.sizeScale || 1.0);
    
    // Reset status effects
    this.statusEffects.reset();
    this.statusEffects.setOnPoisonDamage((damage: number) => {
      if (this.isActive) {
        // Check immunity - burrowed diggers and ghost phase creeps are immune
        if (this.abilities.isImmune()) {
          return; // No damage while immune
        }
        this.currentHealth -= damage;
        this.updateHealthBar();
        this.effects.showPoisonDamage(this.x, this.y, damage);
        if (this.currentHealth <= 0) this.die();
      }
    });
    this.statusEffects.setOnBurnDamage((damage: number) => {
      if (this.isActive) {
        // Check immunity
        if (this.abilities.isImmune()) {
          return;
        }
        this.currentHealth -= damage;
        this.updateHealthBar();
        this.effects.showBurnDamage(this.x, this.y, damage);
        if (this.currentHealth <= 0) this.die();
      }
    });
    
    // Set initial position
    const startPos = pathSystem.getStartPoint();
    this.setPosition(startPos.x, startPos.y);
    
    this.setActive(true);
    this.setVisible(true);
    
    // Initial static draw (perf optimization: don't redraw every frame)
    this.redraw();
    this.updateHealthBar();
    this.updateShieldVisual();
  }

  /**
   * Draw the creep once (static pose)
   * The update loop will handle transform animations (bounce/squash/scale)
   */
  private redraw(): void {
    const state = this.abilities.getState();
    
    // Draw in neutral pose (bounceTime=0, faceDirection=1)
    // We will handle facing via container/graphics scaleX
    CreepGraphics.drawCreep(
      this.bodyGraphics,
      this.config.type,
      0, // Force 0 bounce time for static draw
      1, // Force facing right
      state.jumpWarningTime > 0,
      state.isJumping,
      state.isBurrowed
    );
  }

  /**
   * Update shield visual
   */
  private updateShieldVisual(): void {
    const state = this.abilities.getState();
    CreepGraphics.drawShield(this.shieldGraphics, this.bounceTime, state.shieldHitsRemaining);
  }

  /**
   * Update health bar
   */
  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    
    if (this.currentHealth >= this.config.maxHealth) {
        // Clear if health is full (and was previously drawn)
        return; 
    }
    
    const barWidth = 30, barHeight = 4, yOffset = -35;
    
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, yOffset - 1, barWidth + 2, barHeight + 2);
    
    const healthPercent = this.currentHealth / this.config.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBarFg.fillStyle(fillColor, 1);
    this.healthBarFg.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);
  }

  /**
   * Update creep each frame
   */
  update(delta: number): void {
    if (!this.isActive) return;
    
    const state = this.abilities.getState();
    const wasBurrowed = state.isBurrowed;

    // Update handlers
    this.statusEffects.update(delta);
    this.abilities.updateJump(delta, this.config, this.pathSystem, this.distanceTraveled);
    this.abilities.updateDigger(delta, this.config);
    this.abilities.updateGhostPhase(delta, this.config, this.currentHealth, this.config.maxHealth);
    this.abilities.updateDispel(delta);  // Boss dispel ability
    
    // If burrow state changed, we must redraw the graphic entirely
    if (state.isBurrowed !== wasBurrowed) {
        this.redraw();
    }

    // Update ghost alpha
    if (state.isGhostPhase) {
      this.setAlpha(this.abilities.getGhostFlickerAlpha());
    }
    
    // Animation time
    this.bounceTime += delta / 1000;
    
    // Movement (unless jumping)
    if (!state.isJumping) {
      const speedMultiplier = this.statusEffects.getSpeedMultiplier();
      const moveDistance = (this.config.speed * speedMultiplier * delta) / 1000;
      this.distanceTraveled += moveDistance;
      
      const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
      if (pathData.direction.x !== 0) {
        this.faceDirection = pathData.direction.x > 0 ? 1 : -1;
      }
      this.setPosition(pathData.position.x, pathData.position.y);
    }
    
    // OPTIMIZATION: Transform-based animation instead of redraw
    // Calculate simple bounce/squash
    // Speed: 8 for small, 4 for big/bosses
    const isBoss = this.config.type.startsWith('boss');
    const animSpeed = isBoss ? 4 : 8;
    const bounceAmp = isBoss ? 3 : 4;
    
    const bounceSine = Math.sin(this.bounceTime * animSpeed);
    const bounceAmount = Math.abs(bounceSine) * bounceAmp; // Always bounce UP from origin
    
    // Apply transform to body graphics
    // Note: We use -bounceAmount because Y is down in Phaser
    this.bodyGraphics.y = -bounceAmount; 
    
    // Simple squash/stretch
    const squash = 1 + (bounceSine * 0.05);
    this.bodyGraphics.scaleY = squash;
    // Scale X handles both facing direction AND squash preservation (inverse of Y)
    // If facing right (1), scaleX = 1/squash. If facing left (-1), scaleX = -1/squash.
    this.bodyGraphics.scaleX = (this.faceDirection) * (1 / squash);

    // Update visual components that still use immediate mode (masks, simple bars)
    if (state.shieldHitsRemaining > 0) this.updateShieldVisual();
    this.statusEffects.draw(this.scene.time.now);
    
    // Check end
    if (this.pathSystem.hasReachedEnd(this.distanceTraveled)) {
      this.reachEnd();
    }
  }

  /**
   * Apply slow effect
   */
  applySlow(percent: number, durationMs: number): void {
    this.statusEffects.applySlow(percent, durationMs);
  }

  /**
   * Apply poison effect
   */
  applyPoison(damagePerSecond: number, durationMs: number): void {
    this.statusEffects.applyPoison(damagePerSecond, durationMs);
  }

  /**
   * Apply freeze effect (100% movement stop)
   */
  applyFreeze(durationMs: number): void {
    this.statusEffects.applyFreeze(durationMs);
  }

  /**
   * Apply burn effect
   */
  applyBurn(damagePerSecond: number, durationMs: number): void {
    this.statusEffects.applyBurn(damagePerSecond, durationMs);
  }

  /**
   * Apply armor reduction
   */
  applyArmorReduction(amount: number): void {
    this.statusEffects.applyArmorReduction(amount);
  }

  /**
   * Clear slow effect (used by Shatter ability)
   */
  clearSlow(): void {
    this.statusEffects.clearSlow();
  }

  /**
   * Get number of active poison stacks
   */
  getPoisonStackCount(): number {
    return this.statusEffects.getPoisonStackCount();
  }

  /**
   * Check if creep is frozen
   */
  isFrozen(): boolean {
    return this.statusEffects.isFrozen();
  }

  /**
   * Check if creep is slowed
   */
  isSlowed(): boolean {
    return this.statusEffects.isSlowed();
  }

  /**
   * Take damage
   */
  takeDamage(amount: number, isMagic: boolean = false, towerBranch?: string): number {
    if (!this.isActive) return 0;
    
    // Check for elemental immunity (flame/plaguebearer creeps)
    if (this.config.onlyDamagedBy) {
      const requiredBranch = this.config.onlyDamagedBy === 'ice' ? 'icetower' : 'poison';
      if (towerBranch !== requiredBranch) {
        this.effects.showImmuneText(this.x, this.y);
        return 0;
      }
    }
    
    // Check immunity
    if (this.abilities.isImmune()) {
      if (this.abilities.getState().isGhostPhase) {
        this.effects.showImmuneText(this.x, this.y);
      }
      return 0;
    }
    
    // Check shield
    if (this.abilities.tryBlockWithShield()) {
      this.effects.showShieldBlockEffect(this.x, this.y, this.shieldGraphics);
      this.updateShieldVisual();
      
      if (this.abilities.getState().shieldHitsRemaining === 0) {
        this.effects.showShieldBreakEffect(this.x, this.y);
      }
      return 0;
    }
    
    // Apply armor (reduced by armor reduction from Corrosive Acid)
    const effectiveArmor = Math.max(0, this.config.armor - this.statusEffects.getArmorReduction());
    const actualDamage = isMagic ? amount : Math.max(1, amount - effectiveArmor);
    this.currentHealth -= actualDamage;
    
    this.updateHealthBar();
    this.effects.flashGraphics(this.bodyGraphics);
    
    if (this.currentHealth <= 0) this.die();
    
    return actualDamage;
  }

  /**
   * Creep reached the castle
   */
  private reachEnd(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.emit('reachedEnd', this);
    this.deactivate();
  }

  /**
   * Creep dies
   */
  private die(): void {
    if (!this.isActive || this.isDying) return;
    
    this.isActive = false;
    this.isDying = true;
    
    // Clear health bar immediately to prevent distorted visuals during death animation
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    
    const goldReward = this.config.goldReward;
    this.emit('died', this, goldReward);
    
    // Spawn babies if broodmother
    if (this.config.spawnOnDeath) {
      // Pass x,y coordinates so babies spawn at exact death location
      this.emit('spawnOnDeath', this, this.config.spawnOnDeath.type, this.config.spawnOnDeath.count, this.x, this.y, this.distanceTraveled);
      this.effects.showSpawnEffect(this.x, this.y, this.config.spawnOnDeath.count);
    }
    
    // Death animation
    this.effects.playDeathAnimation(this, () => this.deactivate());
  }

  /**
   * Deactivate and return to pool
   */
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

  // === Getters ===
  
  getConfig(): CreepConfig { return this.config; }
  getDistanceTraveled(): number { return this.distanceTraveled; }
  getDistanceRemaining(): number { return this.pathSystem.getDistanceRemaining(this.distanceTraveled); }
  getIsActive(): boolean { return this.isActive; }
  canBeReused(): boolean { return !this.isActive && !this.isDying; }
  getCurrentHealth(): number { return this.currentHealth; }
  getShieldHitsRemaining(): number { return this.abilities.getState().shieldHitsRemaining; }
  isFlying(): boolean { return this.config.isFlying === true; }
  getIsBurrowed(): boolean { return this.abilities.getState().isBurrowed; }
  getIsGhostPhase(): boolean { return this.abilities.getState().isGhostPhase; }
  getDiggerPhase(): 'walking' | 'stopping' | 'burrowed' | 'resurfacing' { return this.abilities.getState().diggerPhase; }
  canBeTargeted(): boolean { return this.isActive && this.abilities.canBeTargeted(); }
  
  /**
   * Check if this creep is a boss (immune to instant-kill abilities and strong CC)
   */
  isBoss(): boolean { return this.config.type.startsWith('boss'); }
}
