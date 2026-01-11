import Phaser from 'phaser';
import { BasicCreepGraphics } from './creeps/BasicCreepGraphics';
import { BossCreepGraphics } from './creeps/BossCreepGraphics';
import { SpecialCreepGraphics } from './creeps/SpecialCreepGraphics';
import { ElementalCreepGraphics } from './creeps/ElementalCreepGraphics';
import { CreepEffectsGraphics } from './creeps/CreepEffectsGraphics';

/**
 * CreepGraphics handles all creep rendering/drawing logic.
 * Acts as a dispatcher to modular graphics classes.
 */
export class CreepGraphics {
  // Basic creep types
  private static readonly BASIC_TYPES = new Set(['furball', 'runner', 'tank']);
  
  // Boss creep types
  private static readonly BOSS_TYPES = new Set(['boss', 'boss_1', 'boss_2', 'boss_3', 'boss_4', 'boss_5']);
  
  // Special ability creep types
  private static readonly SPECIAL_TYPES = new Set(['flying', 'ghost', 'shielded', 'jumper', 'digger', 'broodmother', 'baby']);
  
  // Elemental creep types
  private static readonly ELEMENTAL_TYPES = new Set(['flame', 'plaguebearer']);

  /**
   * Draw a creep based on type
   */
  static drawCreep(
    g: Phaser.GameObjects.Graphics,
    type: string,
    bounceTime: number,
    faceDirection: number,
    isFlashing: boolean = false,
    isJumping: boolean = false,
    isBurrowed: boolean = false
  ): void {
    g.clear();
    
    // If burrowed, draw tunnel shadow instead of normal creep
    if (isBurrowed) {
      SpecialCreepGraphics.drawBurrowedTunnel(g, bounceTime, faceDirection);
      return;
    }
    
    // Dispatch to appropriate graphics class based on creep type
    if (CreepGraphics.BASIC_TYPES.has(type)) {
      BasicCreepGraphics.draw(g, type, bounceTime, faceDirection);
    } else if (CreepGraphics.BOSS_TYPES.has(type)) {
      BossCreepGraphics.draw(g, type, bounceTime, faceDirection);
    } else if (CreepGraphics.SPECIAL_TYPES.has(type)) {
      SpecialCreepGraphics.draw(g, type, bounceTime, faceDirection, isFlashing, isJumping, isBurrowed);
    } else if (CreepGraphics.ELEMENTAL_TYPES.has(type)) {
      ElementalCreepGraphics.draw(g, type, bounceTime, faceDirection);
    } else {
      // Default fallback to furball
      BasicCreepGraphics.drawFurball(g, bounceTime, faceDirection);
    }
  }

  /**
   * Draw shield visual effect
   */
  static drawShield = CreepEffectsGraphics.drawShield;

  /**
   * Draw status effects (slow, poison)
   */
  static drawStatusEffects = CreepEffectsGraphics.drawStatusEffects;

  /**
   * Draw death animation
   */
  static drawDeathAnimation = CreepEffectsGraphics.drawDeathAnimation;

  /**
   * Draw health bar
   */
  static drawHealthBar = CreepEffectsGraphics.drawHealthBar;
}
