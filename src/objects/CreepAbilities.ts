import Phaser from 'phaser';
import { PathSystem } from '../managers';
import type { CreepConfig } from '../data';
import { GAME_CONFIG } from '../data';

export interface AbilityState {
  shieldHitsRemaining: number;

  jumpCooldown: number;
  isJumping: boolean;
  jumpWarningTime: number;

  diggerPhase: 'walking' | 'stopping' | 'burrowed' | 'resurfacing';
  diggerTimer: number;
  isBurrowed: boolean;
  burrowTimer: number;

  isGhostPhase: boolean;
  ghostPhaseTriggered: boolean;
  ghostPhaseTimer: number;

  dispelCooldown: number;
  canDispel: boolean;
}

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

export class CreepAbilities {
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
      canDispel: false,
    };
  }

  setCallbacks(callbacks: Partial<AbilityCallbacks>): void {
    this.callbacks = callbacks;
  }

  initialize(config: CreepConfig): void {
    this.state = this.createDefaultState();

    this.state.shieldHitsRemaining = config.hasShield ? 5 : 0;

    this.state.jumpCooldown = config.canJump ? this.JUMP_COOLDOWN : 0;

    if (config.canDig) {
      this.state.diggerPhase = 'walking';
      this.state.diggerTimer = this.DIGGER_WALK_DURATION;
      this.state.burrowTimer = this.SURFACE_DURATION;
    }

    this.state.canDispel = config.canDispel === true;
    this.state.dispelCooldown = this.state.canDispel ? this.DISPEL_COOLDOWN : 0;
  }

  reset(): void {
    this.state = this.createDefaultState();
  }

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

  getState(): Readonly<AbilityState> {
    return this.state;
  }

  updateJump(
    delta: number,
    config: CreepConfig,
    pathSystem: PathSystem,
    distanceTraveled: number
  ): void {
    if (!config.canJump || this.state.isJumping) return;

    if (this.state.jumpWarningTime > 0) {
      this.state.jumpWarningTime -= delta;

      if (this.state.jumpWarningTime <= 0) {
        this.executeJump(pathSystem, distanceTraveled);
      }
      return;
    }

    if (this.state.jumpCooldown > 0) {
      this.state.jumpCooldown -= delta;

      if (this.state.jumpCooldown <= 0) {
        this.state.jumpWarningTime = this.JUMP_WARNING_DURATION;
      }
    }
  }

  private executeJump(pathSystem: PathSystem, distanceTraveled: number): void {
    this.state.isJumping = true;

    const newDistance = distanceTraveled + this.JUMP_DISTANCE;
    const targetData = pathSystem.getPositionAt(newDistance);

    this.callbacks.onJumpStart?.(targetData.position.x, targetData.position.y, 300);

    this.scene.time.delayedCall(300, () => {
      this.state.isJumping = false;
      this.state.jumpCooldown = this.JUMP_COOLDOWN;
      this.callbacks.onJumpComplete?.(newDistance);
    });
  }

  updateDigger(delta: number, config: CreepConfig): void {
    if (!config.canDig) return;

    this.state.diggerTimer -= delta;

    if (this.state.diggerTimer <= 0) {
      switch (this.state.diggerPhase) {
        case 'walking':
          this.state.diggerPhase = 'stopping';
          this.state.diggerTimer = this.DIGGER_STOP_DURATION;
          this.callbacks.onDiggerStop?.();
          break;

        case 'stopping':
          this.state.diggerPhase = 'burrowed';
          this.state.diggerTimer = this.BURROW_DURATION;
          this.state.isBurrowed = true;
          this.callbacks.onBurrow?.();
          break;

        case 'burrowed':
          this.state.diggerPhase = 'resurfacing';
          this.state.diggerTimer = this.DIGGER_RESURFACE_DURATION;
          this.callbacks.onResurfaceStart?.();
          break;

        case 'resurfacing':
          this.state.diggerPhase = 'walking';
          this.state.diggerTimer = this.DIGGER_WALK_DURATION;
          this.state.isBurrowed = false;
          this.callbacks.onSurface?.();
          break;
      }
    }

    this.state.burrowTimer = this.state.diggerTimer;
  }

  updateGhostPhase(
    delta: number,
    config: CreepConfig,
    currentHealth: number,
    maxHealth: number
  ): void {
    if (!config.hasGhostPhase) return;

    if (!this.state.ghostPhaseTriggered && !this.state.isGhostPhase) {
      const healthPercent = currentHealth / maxHealth;
      if (healthPercent <= this.GHOST_PHASE_THRESHOLD) {
        this.triggerGhostPhase();
      }
    }

    if (this.state.isGhostPhase) {
      this.state.ghostPhaseTimer -= delta;

      if (this.state.ghostPhaseTimer <= 0) {
        this.endGhostPhase();
      }
    }
  }

  private triggerGhostPhase(): void {
    this.state.isGhostPhase = true;
    this.state.ghostPhaseTriggered = true;
    this.state.ghostPhaseTimer = this.GHOST_PHASE_DURATION;
    this.callbacks.onGhostPhaseStart?.();
  }

  private endGhostPhase(): void {
    this.state.isGhostPhase = false;
    this.callbacks.onGhostPhaseEnd?.();
  }

  tryBlockWithShield(): boolean {
    if (this.state.shieldHitsRemaining > 0) {
      this.state.shieldHitsRemaining--;
      return true;
    }
    return false;
  }

  isImmune(): boolean {
    return this.state.isBurrowed || this.state.isGhostPhase;
  }

  canBeTargeted(): boolean {
    return !this.state.isBurrowed && !this.state.isGhostPhase;
  }

  getGhostFlickerAlpha(): number {
    if (!this.state.isGhostPhase) return 1;
    return Math.sin(this.scene.time.now / 100) * 0.3 + 0.5;
  }
}
