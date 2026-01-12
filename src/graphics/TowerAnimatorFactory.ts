import Phaser from 'phaser';
import type { TowerBranch } from '../data';
import { RapidFireAnimator } from './RapidFireAnimator';
import { ArcherAnimator } from './ArcherAnimator';
import { CannonAnimator } from './CannonAnimator';
import { SniperAnimator } from './SniperAnimator';
import { IceAnimator } from './IceAnimator';
import { PoisonAnimator } from './PoisonAnimator';
import { AuraAnimator } from './AuraAnimator';

/**
 * Common interface for all tower animators
 */
export interface TowerAnimator {
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
 * Animator constructor type
 */
type AnimatorConstructor = new (
  scene: Phaser.Scene, 
  container: Phaser.GameObjects.Container, 
  level: number
) => TowerAnimator;

/**
 * Animator factory map - maps branch names to animator constructors
 */
const ANIMATOR_MAP: Record<string, AnimatorConstructor> = {
  'rapidfire': RapidFireAnimator,
  'archer': ArcherAnimator,
  'rockcannon': CannonAnimator,
  'sniper': SniperAnimator,
  'icetower': IceAnimator,
  'poison': PoisonAnimator,
  'aura': AuraAnimator,
};

/**
 * Factory for creating tower animators.
 * Encapsulates animator construction logic to decouple Tower from specific animator implementations.
 */
export class TowerAnimatorFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create an animator for the specified tower branch.
   * @param branch - The tower branch (e.g., 'archer', 'rapidfire')
   * @param container - The tower container to attach the animator to
   * @param level - The tower level (1-4)
   * @returns The created animator, or null if no animator exists for this branch
   */
  create(branch: TowerBranch, container: Phaser.GameObjects.Container, level: number): TowerAnimator | null {
    const AnimatorClass = ANIMATOR_MAP[branch];
    
    if (!AnimatorClass) {
      return null;
    }
    
    return new AnimatorClass(this.scene, container, level);
  }

  /**
   * Check if a branch has an associated animator
   */
  hasAnimator(branch: TowerBranch): boolean {
    return branch in ANIMATOR_MAP;
  }
}
