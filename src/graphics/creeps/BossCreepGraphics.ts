import Phaser from 'phaser';
import type { BossRenderer } from './bosses';
import {
  drawPainOverlay,
  BaseBossRenderer,
  Boss1Renderer,
  Boss2Renderer,
  Boss3Renderer,
  Boss4Renderer,
  Boss5Renderer,
  BossGuard1Renderer,
  BossGuard2Renderer,
  BossGuard3Renderer,
} from './bosses';

// Singleton renderer instances for each boss type
const renderers: Map<string, BossRenderer> = new Map();

function getRenderer(type: string): BossRenderer | null {
  if (!renderers.has(type)) {
    switch (type) {
      case 'boss':
        renderers.set(type, new BaseBossRenderer());
        break;
      case 'boss_1':
        renderers.set(type, new Boss1Renderer());
        break;
      case 'boss_2':
        renderers.set(type, new Boss2Renderer());
        break;
      case 'boss_3':
        renderers.set(type, new Boss3Renderer());
        break;
      case 'boss_4':
        renderers.set(type, new Boss4Renderer());
        break;
      case 'boss_5':
        renderers.set(type, new Boss5Renderer());
        break;
      case 'boss_guard_1':
        renderers.set(type, new BossGuard1Renderer());
        break;
      case 'boss_guard_2':
        renderers.set(type, new BossGuard2Renderer());
        break;
      case 'boss_guard_3':
        renderers.set(type, new BossGuard3Renderer());
        break;
      default:
        return null;
    }
  }
  return renderers.get(type) || null;
}

/**
 * Factory class for rendering boss creeps.
 * Delegates to individual renderer classes for each boss type.
 */
export class BossCreepGraphics {
  static draw(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    // Apply pain shake effect
    if (isPained) {
      const painShake = Math.sin(bounceTime * 30) * 2;
      g.setPosition(painShake, 0);
    } else {
      g.setPosition(0, 0);
    }

    // Get the appropriate renderer and draw
    const renderer = getRenderer(type);
    if (renderer) {
      renderer.draw(g, bounceTime, faceDirection, isPained);
    }

    // Apply pain overlay if needed
    if (isPained) {
      drawPainOverlay(g, bounceTime);
    }
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss1(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss_1');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss2(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss_2');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss3(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss_3');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss4(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss_4');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBoss5(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean = false
  ): void {
    const renderer = getRenderer('boss_5');
    renderer?.draw(g, bounceTime, faceDirection, isPained);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBossGuard1(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const renderer = getRenderer('boss_guard_1');
    renderer?.draw(g, bounceTime, faceDirection, false);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBossGuard2(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const renderer = getRenderer('boss_guard_2');
    renderer?.draw(g, bounceTime, faceDirection, false);
  }

  /**
   * @deprecated Use individual renderer classes instead
   */
  static drawBossGuard3(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number
  ): void {
    const renderer = getRenderer('boss_guard_3');
    renderer?.draw(g, bounceTime, faceDirection, false);
  }
}
