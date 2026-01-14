import Phaser from 'phaser';
import type { TowerBranch } from '../data';
import { RapidFireAnimator } from './RapidFireAnimator';
import { ArcherAnimator } from './ArcherAnimator';
import { CannonAnimator } from './CannonAnimator';
import { SniperAnimator } from './SniperAnimator';
import { IceAnimator } from './IceAnimator';
import { PoisonAnimator } from './PoisonAnimator';
import { AuraAnimator } from './AuraAnimator';

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

type AnimatorConstructor = new (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  level: number
) => TowerAnimator;

const ANIMATOR_MAP: Record<string, AnimatorConstructor> = {
  'rapidfire': RapidFireAnimator,
  'archer': ArcherAnimator,
  'rockcannon': CannonAnimator,
  'sniper': SniperAnimator,
  'icetower': IceAnimator,
  'poison': PoisonAnimator,
  'aura': AuraAnimator,
};

export class TowerAnimatorFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(branch: TowerBranch, container: Phaser.GameObjects.Container, level: number): TowerAnimator | null {
    const AnimatorClass = ANIMATOR_MAP[branch];

    if (!AnimatorClass) {
      return null;
    }

    return new AnimatorClass(this.scene, container, level);
  }

  hasAnimator(branch: TowerBranch): boolean {
    return branch in ANIMATOR_MAP;
  }
}
