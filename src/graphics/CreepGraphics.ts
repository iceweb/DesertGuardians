import Phaser from 'phaser';
import { BasicCreepGraphics } from './creeps/BasicCreepGraphics';
import { BossCreepGraphics } from './creeps/BossCreepGraphics';
import { SpecialCreepGraphics } from './creeps/SpecialCreepGraphics';
import { ElementalCreepGraphics } from './creeps/ElementalCreepGraphics';
import { CreepEffectsGraphics } from './creeps/CreepEffectsGraphics';
import { DragonKnightGraphics } from './creeps/DragonKnightGraphics';

export class CreepGraphics {
  private static readonly BASIC_TYPES = new Set(['furball', 'runner', 'tank']);

  private static readonly BOSS_TYPES = new Set([
    'boss',
    'boss_1',
    'boss_2',
    'boss_3',
    'boss_4',
    'boss_5',
  ]);

  private static readonly GUARD_TYPES = new Set(['boss_guard_1', 'boss_guard_2', 'boss_guard_3']);

  private static readonly SPECIAL_TYPES = new Set([
    'flying',
    'ghost',
    'shielded',
    'jumper',
    'digger',
    'broodmother',
    'baby',
  ]);

  private static readonly ELEMENTAL_TYPES = new Set(['flame', 'plaguebearer']);

  static drawCreep(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean = false,
    isJumping: boolean = false,
    isBurrowed: boolean = false,
    isPained: boolean = false
  ): void {
    g.clear();

    if (isBurrowed) {
      SpecialCreepGraphics.drawBurrowedTunnel(g, bounceTime, faceDirection);
      return;
    }

    if (CreepGraphics.BASIC_TYPES.has(type)) {
      BasicCreepGraphics.draw(g, type, bounceTime, faceDirection);
    } else if (CreepGraphics.GUARD_TYPES.has(type)) {
      const tier = parseInt(type.replace('boss_guard_', '')) || 1;
      DragonKnightGraphics.draw(g, tier, bounceTime, faceDirection);
    } else if (CreepGraphics.BOSS_TYPES.has(type)) {
      BossCreepGraphics.draw(g, type, bounceTime, faceDirection, isPained);
    } else if (CreepGraphics.SPECIAL_TYPES.has(type)) {
      SpecialCreepGraphics.draw(
        g,
        type,
        bounceTime,
        faceDirection,
        isFlashing,
        isJumping,
        isBurrowed
      );
    } else if (CreepGraphics.ELEMENTAL_TYPES.has(type)) {
      ElementalCreepGraphics.draw(g, type, bounceTime, faceDirection);
    } else {
      BasicCreepGraphics.drawFurball(g, bounceTime, faceDirection);
    }
  }

  static drawShield = CreepEffectsGraphics.drawShield;

  static drawStatusEffects = CreepEffectsGraphics.drawStatusEffects;

  static drawDeathAnimation = CreepEffectsGraphics.drawDeathAnimation;

  static drawHealthBar = CreepEffectsGraphics.drawHealthBar;
}
