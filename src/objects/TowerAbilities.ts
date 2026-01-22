import Phaser from 'phaser';
import type { Creep } from './Creep';
import type { TowerBranch } from '../data';
import { TOWER_ABILITIES, type AbilityDefinition } from './TowerAbilityDefinitions';
import { TowerAbilityVisuals } from './TowerAbilityVisuals';
import {
  TowerAbilityEffects,
  type AbilityContext,
  type AbilityResult,
} from './TowerAbilityEffects';

export { AbilityIconType, type AbilityDefinition } from './TowerAbilityDefinitions';
export { type AbilityContext, type AbilityResult } from './TowerAbilityEffects';
export { TOWER_ABILITIES } from './TowerAbilityDefinitions';

export class TowerAbilityHandler {
  private selectedAbility: AbilityDefinition | null = null;
  private branch: TowerBranch;

  private visuals: TowerAbilityVisuals;
  private effects: TowerAbilityEffects;

  constructor(scene: Phaser.Scene, branch: TowerBranch) {
    this.branch = branch;

    this.visuals = new TowerAbilityVisuals(scene);
    this.effects = new TowerAbilityEffects(scene, this.visuals);
  }

  getAvailableAbilities(): AbilityDefinition[] {
    return TOWER_ABILITIES[this.branch] || [];
  }

  selectAbility(abilityId: string): boolean {
    const abilities = this.getAvailableAbilities();
    const ability = abilities.find((a) => a.id === abilityId);

    if (ability) {
      this.selectedAbility = ability;
      return true;
    }
    return false;
  }

  getSelectedAbility(): AbilityDefinition | null {
    return this.selectedAbility;
  }

  hasAbility(): boolean {
    return this.selectedAbility !== null;
  }

  rollForAbility(context: AbilityContext): AbilityResult {
    if (!this.selectedAbility) {
      return { triggered: false };
    }

    if (this.selectedAbility.isPassive) {
      return { triggered: false };
    }

    if (Math.random() > this.selectedAbility.triggerChance) {
      return { triggered: false };
    }

    return this.executeAbility(context);
  }

  /* eslint-disable complexity */
  private executeAbility(context: AbilityContext): AbilityResult {
    if (!this.selectedAbility) {
      return { triggered: false };
    }

    const abilityId = this.selectedAbility.id;
    const params = this.selectedAbility.effectParams;

    switch (abilityId) {
      case 'cannon_aftershock':
        return this.effects.executeAftershock(context, params);
      case 'cannon_tremor':
        return this.effects.executeTremor(context, params);
      case 'cannon_shrapnel':
        return this.effects.executeShrapnel(context, params);

      case 'sniper_critical':
        return this.effects.executeCriticalStrike(context, params);
      case 'sniper_pierce':
        return this.effects.executeArmorPierce(context, params);
      case 'sniper_headshot':
        return this.effects.executeHeadshot(context, params);

      case 'ice_trap':
        return this.effects.executeIceTrap(context, params);
      case 'ice_frostnova':
        return this.effects.executeFrostNova(context, params);
      case 'ice_deepfreeze':
        return this.effects.executeDeepFreeze(context, params);

      case 'poison_plague':
        return this.effects.executePlagueSpread(context, params);
      case 'poison_explosion':
        return this.effects.executeToxicExplosion(context, params);
      case 'poison_corrosive':
        return this.effects.executeCorrosiveAcid(context, params);

      case 'rapid_bulletstorm':
        return this.effects.executeBulletStorm(context, params);
      case 'rapid_ricochet':
        return this.effects.executeRicochet(context, params);
      case 'rapid_incendiary':
        return this.effects.executeIncendiary(context, params);

      case 'archer_multishot':
        return this.effects.executeMultiShot(context, params);
      case 'archer_piercing':
        return this.effects.executePiercingArrow(context, params);
      case 'archer_heavyarrows':
        return this.effects.executeHeavyArrows(context, params);

      default:
        return { triggered: false };
    }
  }

  consumeBulletStorm(): boolean {
    return this.effects.consumeBulletStorm();
  }

  getBulletStormSpeedMultiplier(): number {
    return this.effects.getBulletStormSpeedMultiplier();
  }

  onCreepDeath(creep: Creep, allCreeps: Creep[]): void {
    this.effects.onCreepDeath(creep, allCreeps);
  }

  destroy(): void {
    this.effects.clearPlagueTargets();
  }
}
