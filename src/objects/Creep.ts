import Phaser from 'phaser';
import { PathSystem } from '../managers';
import { CreepGraphics } from '../graphics';
import type { CreepConfig } from '../data';
import { CREEP_TYPES } from '../data';
import { StatusEffectHandler } from './StatusEffectHandler';

// Re-export types for backwards compatibility
export type { CreepConfig } from '../data';
export { CREEP_TYPES } from '../data';

/**
 * Creep game object that follows a path from spawn to castle.
 * Rendered using graphics (no sprites needed).
 */
export class Creep extends Phaser.GameObjects.Container {
  private config!: CreepConfig;
  private pathSystem!: PathSystem;
  private distanceTraveled: number = 0;
  private currentHealth: number = 0;
  private isActive: boolean = false;
  private isDying: boolean = false;  // True during death animation
  
  // Graphics components
  private bodyGraphics!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFg!: Phaser.GameObjects.Graphics;
  
  // Animation
  private bounceTime: number = 0;
  private faceDirection: number = 1; // 1 = right, -1 = left
  
  // Status effects (delegated to handler)
  private statusGraphics!: Phaser.GameObjects.Graphics;
  private statusEffects!: StatusEffectHandler;
  
  // Special abilities
  private shieldHitsRemaining: number = 0;   // Shield blocks remaining
  private shieldGraphics!: Phaser.GameObjects.Graphics;
  private jumpCooldown: number = 0;          // Time until next jump
  private isJumping: boolean = false;        // Currently in jump animation
  private jumpWarningTime: number = 0;       // Flash warning before jump
  private readonly JUMP_COOLDOWN = 4000;     // 4 seconds between jumps
  private readonly JUMP_DISTANCE = 150;      // Jump 150px forward
  private readonly JUMP_WARNING_DURATION = 500; // Flash white 0.5s before jump

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create graphics for the creep body
    this.bodyGraphics = scene.add.graphics();
    this.healthBarBg = scene.add.graphics();
    this.healthBarFg = scene.add.graphics();
    this.statusGraphics = scene.add.graphics();
    this.shieldGraphics = scene.add.graphics();
    
    this.add([this.bodyGraphics, this.healthBarBg, this.healthBarFg, this.statusGraphics, this.shieldGraphics]);
    
    // Create status effect handler
    this.statusEffects = new StatusEffectHandler(scene, this.statusGraphics);
    
    scene.add.existing(this);
    this.setDepth(30);
    this.setActive(false);
    this.setVisible(false);
    
    // Make creeps interactive for clicking
    this.setSize(40, 40);
    this.setInteractive({ useHandCursor: true });
  }

  /**
   * Initialize/reset the creep for spawning with wave-based HP scaling
   * HP scaling: +8% per wave, capped at 2.5x base HP at wave 19+
   */
  spawn(pathSystem: PathSystem, creepType: string, waveNumber: number = 1): void {
    this.pathSystem = pathSystem;
    const baseConfig = CREEP_TYPES[creepType] || CREEP_TYPES.furball;
    
    // Apply wave-based HP scaling: 8% per wave, capped at 2.5x
    const hpMultiplier = Math.min(2.5, 1 + (waveNumber - 1) * 0.08);
    const scaledMaxHealth = Math.floor(baseConfig.maxHealth * hpMultiplier);
    
    // Create a scaled config for this creep instance
    this.config = {
      ...baseConfig,
      maxHealth: scaledMaxHealth
    };
    
    this.distanceTraveled = 0;
    this.currentHealth = this.config.maxHealth;
    this.isActive = true;
    this.bounceTime = Math.random() * Math.PI * 2; // Random start phase
    
    // Initialize special abilities
    this.shieldHitsRemaining = this.config.hasShield ? 3 : 0;
    this.jumpCooldown = this.config.canJump ? this.JUMP_COOLDOWN : 0;
    this.isJumping = false;
    this.jumpWarningTime = 0;
    
    // Reset status effects and wire up poison damage callback
    this.statusEffects.reset();
    this.statusEffects.setOnPoisonDamage((damage: number) => {
      if (this.isActive) {
        this.currentHealth -= damage;
        this.updateHealthBar();
        this.showPoisonDamage(damage);
        if (this.currentHealth <= 0) {
          this.die();
        }
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
   * Draw the creep based on its type
   */
  private drawCreep(): void {
    const isFlashing = this.jumpWarningTime > 0;
    CreepGraphics.drawCreep(
      this.bodyGraphics,
      this.config.type,
      this.bounceTime,
      this.faceDirection,
      isFlashing,
      this.isJumping
    );
  }

  /**
   * Update the shield visual effect
   */
  private updateShieldVisual(): void {
    CreepGraphics.drawShield(this.shieldGraphics, this.bounceTime, this.shieldHitsRemaining);
  }

  /**
   * Update health bar display
   */
  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFg.clear();
    
    const barWidth = 30;
    const barHeight = 4;
    const yOffset = -35;
    
    // Don't show health bar if full health
    if (this.currentHealth >= this.config.maxHealth) {
      return;
    }
    
    // Background
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRect(-barWidth / 2 - 1, yOffset - 1, barWidth + 2, barHeight + 2);
    
    // Health fill
    const healthPercent = this.currentHealth / this.config.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBarFg.fillStyle(fillColor, 1);
    this.healthBarFg.fillRect(-barWidth / 2, yOffset, barWidth * healthPercent, barHeight);
  }

  /**
   * Update creep movement and animation
   */
  update(delta: number): void {
    if (!this.isActive) return;
    
    const currentTime = this.scene.time.now;
    
    // Update status effects
    this.statusEffects.update(delta);
    
    // Update jump ability
    this.updateJumpAbility(delta);
    
    // Update animation time
    this.bounceTime += delta / 1000;
    
    // Calculate effective speed (with slow)
    const speedMultiplier = this.statusEffects.getSpeedMultiplier();
    const effectiveSpeed = this.config.speed * speedMultiplier;
    
    // Move along path (unless jumping)
    if (!this.isJumping) {
      const moveDistance = (effectiveSpeed * delta) / 1000;
      this.distanceTraveled += moveDistance;
    }
    
    // Get new position from path
    const pathData = this.pathSystem.getPositionAt(this.distanceTraveled);
    
    // Update facing direction based on movement
    if (pathData.direction.x !== 0) {
      this.faceDirection = pathData.direction.x > 0 ? 1 : -1;
    }
    
    // Set position (unless mid-jump, which is handled by tween)
    if (!this.isJumping) {
      this.setPosition(pathData.position.x, pathData.position.y);
    }
    
    // Redraw with animation
    this.drawCreep();
    
    // Update shield visual
    if (this.shieldHitsRemaining > 0) {
      this.updateShieldVisual();
    }
    
    // Draw status indicators
    this.statusEffects.draw(currentTime);
    
    // Check if reached end
    if (this.pathSystem.hasReachedEnd(this.distanceTraveled)) {
      this.reachEnd();
    }
  }

  /**
   * Update jump ability (cooldown, warning, execution)
   */
  private updateJumpAbility(delta: number): void {
    if (!this.config.canJump || this.isJumping) return;
    
    // Update jump warning timer
    if (this.jumpWarningTime > 0) {
      this.jumpWarningTime -= delta;
      
      // Time to jump!
      if (this.jumpWarningTime <= 0) {
        this.executeJump();
      }
      return;
    }
    
    // Update jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= delta;
      
      // Start warning phase
      if (this.jumpCooldown <= 0) {
        this.jumpWarningTime = this.JUMP_WARNING_DURATION;
      }
    }
  }

  /**
   * Execute the jump - leap forward along the path
   */
  private executeJump(): void {
    this.isJumping = true;
    
    // Calculate new distance after jump
    const newDistance = this.distanceTraveled + this.JUMP_DISTANCE;
    const targetData = this.pathSystem.getPositionAt(newDistance);
    
    // Create dust cloud at start position
    this.showJumpDustCloud();
    
    // Animate the jump
    this.scene.tweens.add({
      targets: this,
      x: targetData.position.x,
      y: targetData.position.y,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.distanceTraveled = newDistance;
        this.isJumping = false;
        this.jumpCooldown = this.JUMP_COOLDOWN;
        
        // Dust cloud at landing
        this.showJumpDustCloud();
      }
    });
    
    // Arc the creep up during jump
    this.scene.tweens.add({
      targets: this,
      y: '-=40',
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  /**
   * Show dust cloud effect for jump
   */
  private showJumpDustCloud(): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dust = this.scene.add.graphics();
      dust.fillStyle(0xDEB887, 0.7);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);
      dust.setPosition(this.x, this.y + 15);
      dust.setDepth(25);
      
      this.scene.tweens.add({
        targets: dust,
        x: this.x + Math.cos(angle) * 30,
        y: this.y + 15 + Math.sin(angle) * 15,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => dust.destroy()
      });
    }
  }

  /**
   * Show poison damage number
   */
  private showPoisonDamage(damage: number): void {
    const text = this.scene.add.text(this.x, this.y - 40, `-${damage}`, {
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Apply slow effect - delegates to StatusEffectHandler
   */
  applySlow(percent: number, durationMs: number): void {
    this.statusEffects.applySlow(percent, durationMs);
  }

  /**
   * Apply poison effect - delegates to StatusEffectHandler
   */
  applyPoison(damagePerSecond: number, durationMs: number): void {
    this.statusEffects.applyPoison(damagePerSecond, durationMs);
  }

  /**
   * Take damage from a tower
   */
  takeDamage(amount: number, isMagic: boolean = false): number {
    // Don't take damage if already dead
    if (!this.isActive) {
      return 0;
    }
    
    // Check if shield blocks the hit
    if (this.shieldHitsRemaining > 0) {
      this.shieldHitsRemaining--;
      this.showShieldBlockEffect();
      this.updateShieldVisual();
      
      // Shield breaks completely - show break effect
      if (this.shieldHitsRemaining === 0) {
        this.showShieldBreakEffect();
      }
      
      return 0; // No damage taken
    }
    
    // Apply armor (magic ignores armor)
    const actualDamage = isMagic ? amount : Math.max(1, amount - this.config.armor);
    this.currentHealth -= actualDamage;
    
    this.updateHealthBar();
    
    // Flash effect - briefly make the creep white
    this.bodyGraphics.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      this.bodyGraphics.setAlpha(1);
    });
    
    if (this.currentHealth <= 0) {
      this.die();
    }
    
    return actualDamage;
  }

  /**
   * Show shield block effect
   */
  private showShieldBlockEffect(): void {
    // Flash the shield
    this.scene.tweens.add({
      targets: this.shieldGraphics,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
    
    // Show "BLOCKED" text
    const text = this.scene.add.text(this.x, this.y - 50, 'BLOCKED', {
      fontSize: '14px',
      color: '#00BFFF',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 25,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show shield break effect
   */
  private showShieldBreakEffect(): void {
    // Create shield fragments
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fragment = this.scene.add.graphics();
      fragment.fillStyle(0x00BFFF, 0.8);
      fragment.fillCircle(0, 0, 5);
      fragment.setPosition(this.x, this.y - 5);
      fragment.setDepth(100);
      
      this.scene.tweens.add({
        targets: fragment,
        x: this.x + Math.cos(angle) * 50,
        y: this.y - 5 + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        onComplete: () => fragment.destroy()
      });
    }
    
    // Show "SHIELD BROKEN" text
    const text = this.scene.add.text(this.x, this.y - 60, 'SHIELD BROKEN!', {
      fontSize: '16px',
      color: '#FF6347',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Called when creep reaches the castle
   */
  private reachEnd(): void {
    // Prevent multiple calls
    if (!this.isActive) {
      console.log('Creep.reachEnd: Already inactive, skipping');
      return;
    }
    
    console.log(`Creep.reachEnd: Creep reached end at (${this.x}, ${this.y})`);
    this.isActive = false;
    this.emit('reachedEnd', this);
    this.deactivate();
  }

  /**
   * Called when creep dies
   */
  private die(): void {
    // Prevent multiple death calls
    if (!this.isActive || this.isDying) {
      console.log('Creep.die: Already dead/dying, skipping');
      return;
    }
    
    this.isActive = false;
    this.isDying = true;
    
    // Store gold reward before any state changes
    const goldReward = this.config.goldReward;
    
    console.log(`Creep.die: Creep dying, goldReward=${goldReward}`);
    
    // Emit the died event IMMEDIATELY so the creep is removed from active list
    // This prevents the creep from being reused while the death animation plays
    this.emit('died', this, goldReward);
    
    // Death effect animation (purely visual, doesn't affect game state)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete: () => {
        console.log('Creep.die: Death tween complete, deactivating');
        this.deactivate();
      }
    });
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
    this.statusEffects.clear();
    this.statusEffects.reset();
    
    // Reset abilities
    this.shieldHitsRemaining = 0;
    this.jumpCooldown = 0;
    this.isJumping = false;
    this.jumpWarningTime = 0;
  }

  /**
   * Get the creep's current config
   */
  getConfig(): CreepConfig {
    return this.config;
  }

  /**
   * Get distance traveled along path
   */
  getDistanceTraveled(): number {
    return this.distanceTraveled;
  }

  /**
   * Get remaining distance to end
   */
  getDistanceRemaining(): number {
    return this.pathSystem.getDistanceRemaining(this.distanceTraveled);
  }

  /**
   * Check if creep is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if creep can be reused (not active AND not dying)
   */
  canBeReused(): boolean {
    return !this.isActive && !this.isDying;
  }

  /**
   * Get current health
   */
  getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * Get shield hits remaining
   */
  getShieldHitsRemaining(): number {
    return this.shieldHitsRemaining;
  }
}
