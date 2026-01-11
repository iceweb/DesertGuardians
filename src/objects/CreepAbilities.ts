import Phaser from 'phaser';
import { PathSystem } from '../managers';
import type { CreepConfig } from '../data';
import { GAME_CONFIG } from '../data';

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
  
  // Digger - multi-phase: walking -> stopping -> burrowed -> resurfacing
  diggerPhase: 'walking' | 'stopping' | 'burrowed' | 'resurfacing';
  diggerTimer: number;
  isBurrowed: boolean;  // Legacy compatibility
  burrowTimer: number;  // Legacy compatibility
  
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
  onDiggerStop: () => void;
  onBurrow: () => void;
  onResurfaceStart: () => void;
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
  // Constants from centralized config
  private readonly JUMP_COOLDOWN = GAME_CONFIG.JUMP_COOLDOWN;
  private readonly JUMP_DISTANCE = GAME_CONFIG.JUMP_DISTANCE;
  private readonly JUMP_WARNING_DURATION = GAME_CONFIG.JUMP_WARNING_DURATION;
  private readonly DIGGER_WALK_DURATION = GAME_CONFIG.DIGGER_WALK_DURATION;
  private readonly DIGGER_STOP_DURATION = GAME_CONFIG.DIGGER_STOP_DURATION;
  private readonly BURROW_DURATION = GAME_CONFIG.BURROW_DURATION;
  private readonly DIGGER_RESURFACE_DURATION = GAME_CONFIG.DIGGER_RESURFACE_DURATION;
  private readonly SURFACE_DURATION = GAME_CONFIG.SURFACE_DURATION;
  private readonly GHOST_PHASE_DURATION = GAME_CONFIG.GHOST_PHASE_DURATION;
  private readonly GHOST_PHASE_THRESHOLD = GAME_CONFIG.GHOST_PHASE_THRESHOLD;
  private readonly DISPEL_COOLDOWN = GAME_CONFIG.DISPEL_COOLDOWN;

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
      diggerPhase: 'walking',
      diggerTimer: 0,
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
    
    // Digger - starts walking, timer set
    if (config.canDig) {
      this.state.diggerPhase = 'walking';
      this.state.diggerTimer = this.DIGGER_WALK_DURATION;
      this.state.burrowTimer = this.SURFACE_DURATION; // Legacy compatibility
    }
    
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
   * Update digger ability - multi-phase: walking -> stopping -> burrowed -> resurfacing -> walking
   */
  updateDigger(delta: number, config: CreepConfig): void {
    if (!config.canDig) return;
    
    this.state.diggerTimer -= delta;
    
    if (this.state.diggerTimer <= 0) {
      switch (this.state.diggerPhase) {
        case 'walking':
          // Stop briefly before burrowing
          this.state.diggerPhase = 'stopping';
          this.state.diggerTimer = this.DIGGER_STOP_DURATION;
          this.callbacks.onDiggerStop?.();
          break;
          
        case 'stopping':
          // Start burrowing
          this.state.diggerPhase = 'burrowed';
          this.state.diggerTimer = this.BURROW_DURATION;
          this.state.isBurrowed = true;
          this.callbacks.onBurrow?.();
          break;
          
        case 'burrowed':
          // Start resurfacing animation
          this.state.diggerPhase = 'resurfacing';
          this.state.diggerTimer = this.DIGGER_RESURFACE_DURATION;
          this.callbacks.onResurfaceStart?.();
          break;
          
        case 'resurfacing':
          // Fully surfaced, back to walking
          this.state.diggerPhase = 'walking';
          this.state.diggerTimer = this.DIGGER_WALK_DURATION;
          this.state.isBurrowed = false;
          this.callbacks.onSurface?.();
          break;
      }
    }
    
    // Update legacy burrowTimer for compatibility
    this.state.burrowTimer = this.state.diggerTimer;
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
