import Phaser from 'phaser';
import { PathSystem } from '../managers';
import type { CreepConfig } from '../data';

/**
 * Ability state for a creep
 */
export interface AbilityState {
  // Shield
  shieldHitsRemaining: number;
  
  // Jump
  jumpCooldown: number;
  isJumping: boolean;
  jumpWarningTime: number;
  
  // Digger
  isBurrowed: boolean;
  burrowTimer: number;
  
  // Ghost
  isGhostPhase: boolean;
  ghostPhaseTriggered: boolean;
  ghostPhaseTimer: number;
  
  // Dispel (for bosses)
  dispelCooldown: number;
  canDispel: boolean;
}

/**
 * Callbacks for ability events
 */
export interface AbilityCallbacks {
  onJumpStart: (targetX: number, targetY: number, duration: number) => void;
  onJumpComplete: (newDistance: number) => void;
  onBurrow: () => void;
  onSurface: () => void;
  onGhostPhaseStart: () => void;
  onGhostPhaseEnd: () => void;
  onDispel: () => void;
}

/**
 * Handles all special creep abilities (Shield, Jump, Digger, Ghost)
 * Extracted from Creep.ts to reduce file size.
 */
export class CreepAbilities {
  // Constants
  private readonly JUMP_COOLDOWN = 4000;
  private readonly JUMP_DISTANCE = 150;
  private readonly JUMP_WARNING_DURATION = 500;
  private readonly BURROW_DURATION = 2000;
  private readonly SURFACE_DURATION = 5000;
  private readonly GHOST_PHASE_DURATION = 5000;  // Extended from 3s to 5s
  private readonly GHOST_PHASE_THRESHOLD = 0.15;
  private readonly DISPEL_COOLDOWN = 6000;  // Bosses dispel every 6 seconds

  private scene: Phaser.Scene;
  private state: AbilityState;
  private callbacks: Partial<AbilityCallbacks> = {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = this.createDefaultState();
  }

  /**
   * Create default ability state
   */
  private createDefaultState(): AbilityState {
    return {
      shieldHitsRemaining: 0,
      jumpCooldown: 0,
      isJumping: false,
      jumpWarningTime: 0,
      isBurrowed: false,
      burrowTimer: 0,
      isGhostPhase: false,
      ghostPhaseTriggered: false,
      ghostPhaseTimer: 0,
      dispelCooldown: 0,
      canDispel: false
    };
  }

  /**
   * Set callbacks for ability events
   */
  setCallbacks(callbacks: Partial<AbilityCallbacks>): void {
    this.callbacks = callbacks;
  }

  /**
   * Initialize abilities for a creep config
   */
  initialize(config: CreepConfig): void {
    this.state = this.createDefaultState();
    
    // Shield - now blocks 5 hits
    this.state.shieldHitsRemaining = config.hasShield ? 5 : 0;
    
    // Jump
    this.state.jumpCooldown = config.canJump ? this.JUMP_COOLDOWN : 0;
    
    // Digger
    this.state.burrowTimer = config.canDig ? this.SURFACE_DURATION : 0;
    
    // Ghost - starts inactive, triggers at low HP
    
    // Dispel (for bosses)
    this.state.canDispel = config.canDispel === true;
    this.state.dispelCooldown = this.state.canDispel ? this.DISPEL_COOLDOWN : 0;
  }

  /**
   * Reset all abilities
   */
  reset(): void {
    this.state = this.createDefaultState();
  }

  /**
   * Update dispel ability (for bosses)
   * Returns true if dispel should trigger
   */
  updateDispel(delta: number): boolean {
    if (!this.state.canDispel) return false;
    
    this.state.dispelCooldown -= delta;
    
    if (this.state.dispelCooldown <= 0) {
      this.state.dispelCooldown = this.DISPEL_COOLDOWN;
      this.callbacks.onDispel?.();
      return true;
    }
    
    return false;
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<AbilityState> {
    return this.state;
  }

  /**
   * Update jump ability
   */
  updateJump(delta: number, config: CreepConfig, pathSystem: PathSystem, distanceTraveled: number): void {
    if (!config.canJump || this.state.isJumping) return;
    
    // Update jump warning timer
    if (this.state.jumpWarningTime > 0) {
      this.state.jumpWarningTime -= delta;
      
      // Time to jump!
      if (this.state.jumpWarningTime <= 0) {
        this.executeJump(pathSystem, distanceTraveled);
      }
      return;
    }
    
    // Update jump cooldown
    if (this.state.jumpCooldown > 0) {
      this.state.jumpCooldown -= delta;
      
      // Start warning phase
      if (this.state.jumpCooldown <= 0) {
        this.state.jumpWarningTime = this.JUMP_WARNING_DURATION;
      }
    }
  }

  /**
   * Execute the jump
   */
  private executeJump(pathSystem: PathSystem, distanceTraveled: number): void {
    this.state.isJumping = true;
    
    const newDistance = distanceTraveled + this.JUMP_DISTANCE;
    const targetData = pathSystem.getPositionAt(newDistance);
    
    this.callbacks.onJumpStart?.(targetData.position.x, targetData.position.y, 300);
    
    // Schedule jump completion
    this.scene.time.delayedCall(300, () => {
      this.state.isJumping = false;
      this.state.jumpCooldown = this.JUMP_COOLDOWN;
      this.callbacks.onJumpComplete?.(newDistance);
    });
  }

  /**
   * Update digger ability
   */
  updateDigger(delta: number, config: CreepConfig): void {
    if (!config.canDig) return;
    
    this.state.burrowTimer -= delta;
    
    if (this.state.burrowTimer <= 0) {
      if (this.state.isBurrowed) {
        // Surface
        this.state.isBurrowed = false;
        this.state.burrowTimer = this.SURFACE_DURATION;
        this.callbacks.onSurface?.();
      } else {
        // Burrow
        this.state.isBurrowed = true;
        this.state.burrowTimer = this.BURROW_DURATION;
        this.callbacks.onBurrow?.();
      }
    }
  }

  /**
   * Update ghost phase ability
   */
  updateGhostPhase(delta: number, config: CreepConfig, currentHealth: number, maxHealth: number): void {
    if (!config.hasGhostPhase) return;
    
    // Check if should trigger ghost phase
    if (!this.state.ghostPhaseTriggered && !this.state.isGhostPhase) {
      const healthPercent = currentHealth / maxHealth;
      if (healthPercent <= this.GHOST_PHASE_THRESHOLD) {
        this.triggerGhostPhase();
      }
    }
    
    // Update ghost phase timer
    if (this.state.isGhostPhase) {
      this.state.ghostPhaseTimer -= delta;
      
      if (this.state.ghostPhaseTimer <= 0) {
        this.endGhostPhase();
      }
    }
  }

  /**
   * Trigger ghost phase
   */
  private triggerGhostPhase(): void {
    this.state.isGhostPhase = true;
    this.state.ghostPhaseTriggered = true;
    this.state.ghostPhaseTimer = this.GHOST_PHASE_DURATION;
    this.callbacks.onGhostPhaseStart?.();
  }

  /**
   * End ghost phase
   */
  private endGhostPhase(): void {
    this.state.isGhostPhase = false;
    this.callbacks.onGhostPhaseEnd?.();
  }

  /**
   * Try to block damage with shield
   * Returns true if blocked, false if no shield
   */
  tryBlockWithShield(): boolean {
    if (this.state.shieldHitsRemaining > 0) {
      this.state.shieldHitsRemaining--;
      return true;
    }
    return false;
  }

  /**
   * Check if creep is immune to damage
   */
  isImmune(): boolean {
    return this.state.isBurrowed || this.state.isGhostPhase;
  }

  /**
   * Check if creep can be targeted
   */
  canBeTargeted(): boolean {
    return !this.state.isBurrowed && !this.state.isGhostPhase;
  }

  /**
   * Get ghost phase flicker alpha
   */
  getGhostFlickerAlpha(): number {
    if (!this.state.isGhostPhase) return 1;
    return Math.sin(this.scene.time.now / 100) * 0.3 + 0.5;
  }
}
