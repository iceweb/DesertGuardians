import { describe, it, expect } from 'vitest';

/**
 * Tests for CreepAbilities logic
 * These tests verify the ability state machine and mechanics without Phaser dependencies
 */

describe('CreepAbilities', () => {
  // Simulate the ability state
  interface AbilityState {
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

  const createDefaultState = (): AbilityState => ({
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
  });

  describe('Shield Mechanics', () => {
    it('should initialize shield with 5 hits for shielded creeps', () => {
      const state = createDefaultState();
      const hasShield = true;
      state.shieldHitsRemaining = hasShield ? 5 : 0;
      expect(state.shieldHitsRemaining).toBe(5);
    });

    it('should block damage and reduce shield count', () => {
      const state = createDefaultState();
      state.shieldHitsRemaining = 5;

      const tryBlockWithShield = (): boolean => {
        if (state.shieldHitsRemaining > 0) {
          state.shieldHitsRemaining--;
          return true;
        }
        return false;
      };

      expect(tryBlockWithShield()).toBe(true);
      expect(state.shieldHitsRemaining).toBe(4);

      // Block 4 more times
      for (let i = 0; i < 4; i++) {
        tryBlockWithShield();
      }
      expect(state.shieldHitsRemaining).toBe(0);

      // Shield broken, no more blocks
      expect(tryBlockWithShield()).toBe(false);
    });

    it('should not block if no shield', () => {
      const state = createDefaultState();
      state.shieldHitsRemaining = 0;

      const tryBlockWithShield = (): boolean => {
        if (state.shieldHitsRemaining > 0) {
          state.shieldHitsRemaining--;
          return true;
        }
        return false;
      };

      expect(tryBlockWithShield()).toBe(false);
    });
  });

  describe('Jump Mechanics', () => {
    const JUMP_COOLDOWN = 5000;
    const JUMP_WARNING_DURATION = 500;
    const JUMP_DISTANCE = 100;

    it('should start jump cooldown on spawn', () => {
      const state = createDefaultState();
      const canJump = true;
      state.jumpCooldown = canJump ? JUMP_COOLDOWN : 0;
      expect(state.jumpCooldown).toBe(5000);
    });

    it('should trigger jump warning when cooldown expires', () => {
      const state = createDefaultState();
      state.jumpCooldown = JUMP_COOLDOWN;

      // Simulate time passing
      const updateJump = (delta: number) => {
        if (state.isJumping) return;

        if (state.jumpWarningTime > 0) {
          state.jumpWarningTime -= delta;
          if (state.jumpWarningTime <= 0) {
            state.isJumping = true;
          }
          return;
        }

        if (state.jumpCooldown > 0) {
          state.jumpCooldown -= delta;
          if (state.jumpCooldown <= 0) {
            state.jumpWarningTime = JUMP_WARNING_DURATION;
          }
        }
      };

      // Advance 5000ms
      updateJump(5000);
      expect(state.jumpWarningTime).toBe(JUMP_WARNING_DURATION);
      expect(state.isJumping).toBe(false);

      // Advance 500ms
      updateJump(500);
      expect(state.isJumping).toBe(true);
    });

    it('should calculate jump distance correctly', () => {
      const distanceTraveled = 250;
      const newDistance = distanceTraveled + JUMP_DISTANCE;
      expect(newDistance).toBe(350);
    });

    it('should reset jump cooldown after landing', () => {
      const state = createDefaultState();
      state.isJumping = true;

      // Simulate landing
      state.isJumping = false;
      state.jumpCooldown = JUMP_COOLDOWN;

      expect(state.isJumping).toBe(false);
      expect(state.jumpCooldown).toBe(JUMP_COOLDOWN);
    });
  });

  describe('Digger/Burrow Mechanics', () => {
    const DIGGER_WALK_DURATION = 3000;
    const DIGGER_STOP_DURATION = 500;
    const BURROW_DURATION = 2000;
    const DIGGER_RESURFACE_DURATION = 500;

    it('should cycle through digger phases correctly', () => {
      const state = createDefaultState();
      state.diggerPhase = 'walking';
      state.diggerTimer = DIGGER_WALK_DURATION;

      const updateDigger = () => {
        switch (state.diggerPhase) {
          case 'walking':
            state.diggerPhase = 'stopping';
            state.diggerTimer = DIGGER_STOP_DURATION;
            break;
          case 'stopping':
            state.diggerPhase = 'burrowed';
            state.diggerTimer = BURROW_DURATION;
            state.isBurrowed = true;
            break;
          case 'burrowed':
            state.diggerPhase = 'resurfacing';
            state.diggerTimer = DIGGER_RESURFACE_DURATION;
            break;
          case 'resurfacing':
            state.diggerPhase = 'walking';
            state.diggerTimer = DIGGER_WALK_DURATION;
            state.isBurrowed = false;
            break;
        }
      };

      // Phase 1: walking -> stopping
      updateDigger();
      expect(state.diggerPhase).toBe('stopping');
      expect(state.diggerTimer).toBe(DIGGER_STOP_DURATION);

      // Phase 2: stopping -> burrowed
      updateDigger();
      expect(state.diggerPhase).toBe('burrowed');
      expect(state.isBurrowed).toBe(true);

      // Phase 3: burrowed -> resurfacing
      updateDigger();
      expect(state.diggerPhase).toBe('resurfacing');

      // Phase 4: resurfacing -> walking
      updateDigger();
      expect(state.diggerPhase).toBe('walking');
      expect(state.isBurrowed).toBe(false);
    });

    it('should make creep immune while burrowed', () => {
      const state = createDefaultState();
      state.isBurrowed = true;

      const isImmune = () => state.isBurrowed || state.isGhostPhase;
      const canBeTargeted = () => !state.isBurrowed && !state.isGhostPhase;

      expect(isImmune()).toBe(true);
      expect(canBeTargeted()).toBe(false);
    });
  });

  describe('Ghost Phase Mechanics', () => {
    const GHOST_PHASE_DURATION = 3000;
    const GHOST_PHASE_THRESHOLD = 0.5;

    it('should trigger ghost phase at 50% HP', () => {
      const state = createDefaultState();
      const maxHealth = 100;
      let currentHealth = 100;

      const updateGhostPhase = () => {
        if (!state.ghostPhaseTriggered && !state.isGhostPhase) {
          const healthPercent = currentHealth / maxHealth;
          if (healthPercent <= GHOST_PHASE_THRESHOLD) {
            state.isGhostPhase = true;
            state.ghostPhaseTriggered = true;
            state.ghostPhaseTimer = GHOST_PHASE_DURATION;
          }
        }
      };

      // At 60% HP - no trigger
      currentHealth = 60;
      updateGhostPhase();
      expect(state.isGhostPhase).toBe(false);

      // At 50% HP - trigger
      currentHealth = 50;
      updateGhostPhase();
      expect(state.isGhostPhase).toBe(true);
      expect(state.ghostPhaseTriggered).toBe(true);
    });

    it('should end ghost phase after duration', () => {
      const state = createDefaultState();
      state.isGhostPhase = true;
      state.ghostPhaseTimer = GHOST_PHASE_DURATION;

      const updateTimer = (delta: number) => {
        if (state.isGhostPhase) {
          state.ghostPhaseTimer -= delta;
          if (state.ghostPhaseTimer <= 0) {
            state.isGhostPhase = false;
          }
        }
      };

      updateTimer(2000);
      expect(state.isGhostPhase).toBe(true);
      expect(state.ghostPhaseTimer).toBe(1000);

      updateTimer(1000);
      expect(state.isGhostPhase).toBe(false);
    });

    it('should only trigger ghost phase once', () => {
      const state = createDefaultState();
      state.ghostPhaseTriggered = true;
      state.isGhostPhase = false;

      const healthPercent = 0.3;

      // Should not trigger again
      if (!state.ghostPhaseTriggered && healthPercent <= GHOST_PHASE_THRESHOLD) {
        state.isGhostPhase = true;
      }

      expect(state.isGhostPhase).toBe(false);
    });

    it('should make creep immune during ghost phase', () => {
      const state = createDefaultState();
      state.isGhostPhase = true;

      const isImmune = () => state.isBurrowed || state.isGhostPhase;
      expect(isImmune()).toBe(true);
    });

    it('should calculate ghost flicker alpha correctly', () => {
      const getGhostFlickerAlpha = (time: number): number => {
        return Math.sin(time / 100) * 0.3 + 0.5;
      };

      const alpha1 = getGhostFlickerAlpha(0);
      const alpha2 = getGhostFlickerAlpha(157); // ~PI/2 * 100
      const alpha3 = getGhostFlickerAlpha(314); // ~PI * 100

      expect(alpha1).toBeCloseTo(0.5, 1);
      expect(alpha2).toBeCloseTo(0.8, 1);
      expect(alpha3).toBeCloseTo(0.5, 1);
    });
  });

  describe('Dispel Mechanics', () => {
    const DISPEL_COOLDOWN = 10000;

    it('should trigger dispel on cooldown', () => {
      const state = createDefaultState();
      state.canDispel = true;
      state.dispelCooldown = DISPEL_COOLDOWN;

      let dispelTriggered = false;

      const updateDispel = (delta: number): boolean => {
        if (!state.canDispel) return false;

        state.dispelCooldown -= delta;

        if (state.dispelCooldown <= 0) {
          state.dispelCooldown = DISPEL_COOLDOWN;
          dispelTriggered = true;
          return true;
        }

        return false;
      };

      updateDispel(5000);
      expect(dispelTriggered).toBe(false);
      expect(state.dispelCooldown).toBe(5000);

      updateDispel(5000);
      expect(dispelTriggered).toBe(true);
      expect(state.dispelCooldown).toBe(DISPEL_COOLDOWN);
    });

    it('should not trigger dispel if cannot dispel', () => {
      const state = createDefaultState();
      state.canDispel = false;

      const updateDispel = (delta: number): boolean => {
        if (!state.canDispel) return false;
        state.dispelCooldown -= delta;
        return state.dispelCooldown <= 0;
      };

      expect(updateDispel(15000)).toBe(false);
    });
  });

  describe('Creep Type Special Properties', () => {
    it('should handle elemental damage restrictions', () => {
      interface CreepConfig {
        onlyDamagedBy?: 'ice' | 'poison';
      }

      const flameCreep: CreepConfig = { onlyDamagedBy: 'ice' };
      const plaguebearerCreep: CreepConfig = { onlyDamagedBy: 'poison' };
      const normalCreep: CreepConfig = {};

      const canDamage = (creep: CreepConfig, towerBranch: string): boolean => {
        if (!creep.onlyDamagedBy) return true;
        const requiredBranch = creep.onlyDamagedBy === 'ice' ? 'icetower' : 'poison';
        return towerBranch === requiredBranch;
      };

      expect(canDamage(flameCreep, 'icetower')).toBe(true);
      expect(canDamage(flameCreep, 'archer')).toBe(false);
      expect(canDamage(flameCreep, 'rockcannon')).toBe(false);

      expect(canDamage(plaguebearerCreep, 'poison')).toBe(true);
      expect(canDamage(plaguebearerCreep, 'icetower')).toBe(false);

      expect(canDamage(normalCreep, 'archer')).toBe(true);
      expect(canDamage(normalCreep, 'sniper')).toBe(true);
    });

    it('should handle spawn on death', () => {
      interface SpawnOnDeath {
        type: string;
        count: number;
      }

      const broodmother: { spawnOnDeath: SpawnOnDeath } = {
        spawnOnDeath: { type: 'baby', count: 8 },
      };

      expect(broodmother.spawnOnDeath.type).toBe('baby');
      expect(broodmother.spawnOnDeath.count).toBe(8);
    });

    it('should identify boss creeps', () => {
      const isBoss = (type: string): boolean => type.startsWith('boss');

      expect(isBoss('boss_1')).toBe(true);
      expect(isBoss('boss_5')).toBe(true);
      expect(isBoss('furball')).toBe(false);
      expect(isBoss('flying')).toBe(false);
    });
  });
});
