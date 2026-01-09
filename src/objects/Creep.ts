import Phaser from 'phaser';
import { PathSystem } from '../managers';
import { CreepGraphics } from '../graphics';
import type { CreepConfig } from '../data';
import { CREEP_TYPES } from '../data';
import { StatusEffectHandler } from './StatusEffectHandler';
import { CreepAbilities } from './CreepAbilities';
import { CreepEffects } from './CreepEffects';

// Re-export types for backwards compatibility
export type { CreepConfig } from '../data';
export { CREEP_TYPES } from '../data';

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
      onBurrow: () => {
        this.effects.showBurrowEffect(this.x, this.y);
        this.setAlpha(0.3);
      },
      onSurface: () => {
        this.effects.showSurfaceEffect(this.x, this.y);
        this.setAlpha(1);
      },
      onGhostPhaseStart: () => {
        this.effects.showGhostPhaseStart(this.x, this.y);
      },
      onGhostPhaseEnd: () => {
        this.setAlpha(1);
      }
    });
  }

  /**
   * Initialize/reset the creep for spawning
   */
  spawn(pathSystem: PathSystem, creepType: string, waveNumber: number = 1): void {
    this.pathSystem = pathSystem;
    const baseConfig = CREEP_TYPES[creepType] || CREEP_TYPES.furball;
    
    // Apply wave-based HP scaling: 8% per wave, capped at 2.5x
    const hpMultiplier = Math.min(2.5, 1 + (waveNumber - 1) * 0.08);
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
    
    // Set initial position
    const startPos = pathSystem.getStartPoint();
    this.setPosition(startPos.x, startPos.y);
    
    this.setActive(true);
    this.setVisible(true);
    
    this.drawCreep();
    this.updateHealthBar();
    this.updateShieldVisual();
  }

  /**
   * Draw the creep
   */
  private drawCreep(): void {
    const state = this.abilities.getState();
    CreepGraphics.drawCreep(
      this.bodyGraphics,
      this.config.type,
      this.bounceTime,
      this.faceDirection,
      state.jumpWarningTime > 0,
      state.isJumping
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
    
    if (this.currentHealth >= this.config.maxHealth) return;
    
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
    
    // Update handlers
    this.statusEffects.update(delta);
    this.abilities.updateJump(delta, this.config, this.pathSystem, this.distanceTraveled);
    this.abilities.updateDigger(delta, this.config);
    this.abilities.updateGhostPhase(delta, this.config, this.currentHealth, this.config.maxHealth);
    
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
    
    // Redraw
    this.drawCreep();
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
   * Take damage
   */
  takeDamage(amount: number, isMagic: boolean = false): number {
    if (!this.isActive) return 0;
    
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
    
    // Apply armor
    const actualDamage = isMagic ? amount : Math.max(1, amount - this.config.armor);
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
    
    const goldReward = this.config.goldReward;
    this.emit('died', this, goldReward);
    
    // Spawn babies if broodmother
    if (this.config.spawnOnDeath) {
      this.emit('spawnOnDeath', this, this.config.spawnOnDeath.type, this.config.spawnOnDeath.count, this.distanceTraveled);
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
  canBeTargeted(): boolean { return this.isActive && this.abilities.canBeTargeted(); }
}
