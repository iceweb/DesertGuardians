import Phaser from 'phaser';
import type { Creep } from './Creep';
import type { TowerBranch } from '../data';
import { 
  TOWER_ABILITIES, 
  type AbilityDefinition
} from './TowerAbilityDefinitions';
import { TowerAbilityVisuals } from './TowerAbilityVisuals';
import { 
  TowerAbilityEffects, 
  type AbilityContext, 
  type AbilityResult 
} from './TowerAbilityEffects';

// Re-export types for backwards compatibility
export { AbilityIconType, type AbilityDefinition } from './TowerAbilityDefinitions';
export { type AbilityContext, type AbilityResult } from './TowerAbilityEffects';
export { TOWER_ABILITIES } from './TowerAbilityDefinitions';

/**
 * Handler for tower abilities - manages ability selection and execution.
 * Delegates to TowerAbilityEffects for execution and TowerAbilityVisuals for effects.
 */
export class TowerAbilityHandler {
  private selectedAbility: AbilityDefinition | null = null;
  private branch: TowerBranch;
  
  // Delegates
  private visuals: TowerAbilityVisuals;
  private effects: TowerAbilityEffects;
  
  constructor(scene: Phaser.Scene, branch: TowerBranch) {
    this.branch = branch;
    
    this.visuals = new TowerAbilityVisuals(scene);
    this.effects = new TowerAbilityEffects(scene, this.visuals);
  }
  
  /**
   * Get available abilities for this tower's branch
   */
  getAvailableAbilities(): AbilityDefinition[] {
    return TOWER_ABILITIES[this.branch] || [];
  }
  
  /**
   * Select an ability by ID
   */
  selectAbility(abilityId: string): boolean {
    const abilities = this.getAvailableAbilities();
    const ability = abilities.find(a => a.id === abilityId);
    
    if (ability) {
      this.selectedAbility = ability;
      return true;
    }
    return false;
  }
  
  /**
   * Get currently selected ability
   */
  getSelectedAbility(): AbilityDefinition | null {
    return this.selectedAbility;
  }
  
  /**
   * Check if this tower has an ability selected
   */
  hasAbility(): boolean {
    return this.selectedAbility !== null;
  }
  
  /**
   * Roll for ability trigger on hit
   */
  rollForAbility(context: AbilityContext): AbilityResult {
    if (!this.selectedAbility) {
      return { triggered: false };
    }
    
    // Passive abilities don't trigger on hit
    if (this.selectedAbility.isPassive) {
      return { triggered: false };
    }
    
    // Roll for trigger
    if (Math.random() > this.selectedAbility.triggerChance) {
      return { triggered: false };
    }
    
    return this.executeAbility(context);
  }
  
  /**
   * Execute the selected ability
   */
  private executeAbility(context: AbilityContext): AbilityResult {
    if (!this.selectedAbility) {
      return { triggered: false };
    }
    
    const abilityId = this.selectedAbility.id;
    const params = this.selectedAbility.effectParams;
    
    switch (abilityId) {
      // === CANNON ABILITIES ===
      case 'cannon_aftershock':
        return this.effects.executeAftershock(context, params);
      case 'cannon_earthquake':
        return this.effects.executeEarthquake(context, params);
      case 'cannon_shrapnel':
        return this.effects.executeShrapnel(context, params);
        
      // === SNIPER ABILITIES ===
      case 'sniper_critical':
        return this.effects.executeCriticalStrike(context, params);
      case 'sniper_pierce':
        return this.effects.executeArmorPierce(context, params);
      case 'sniper_headshot':
        return this.effects.executeHeadshot(context, params);
        
      // === ICE ABILITIES ===
      case 'ice_trap':
        return this.effects.executeIceTrap(context, params);
      case 'ice_frostnova':
        return this.effects.executeFrostNova(context, params);
      case 'ice_shatter':
        return this.effects.executeShatter(context, params);
        
      // === POISON ABILITIES ===
      case 'poison_plague':
        return this.effects.executePlagueSpread(context, params);
      case 'poison_explosion':
        return this.effects.executeToxicExplosion(context, params);
      case 'poison_corrosive':
        return this.effects.executeCorrosiveAcid(context, params);
        
      // === RAPID FIRE ABILITIES ===
      case 'rapid_bulletstorm':
        return this.effects.executeBulletStorm(context, params);
      case 'rapid_ricochet':
        return this.effects.executeRicochet(context, params);
      case 'rapid_incendiary':
        return this.effects.executeIncendiary(context, params);
        
      // === ARCHER ABILITIES ===
      case 'archer_multishot':
        return this.effects.executeMultiShot(context, params);
      case 'archer_piercing':
        return this.effects.executePiercingArrow(context, params);
      case 'archer_quickdraw':
        return this.effects.executeQuickDraw(context, params);
        
      default:
        return { triggered: false };
    }
  }
  
  // === BUFF STATE METHODS (delegated) ===
  
  consumeBulletStorm(): boolean {
    return this.effects.consumeBulletStorm();
  }
  
  getBulletStormSpeedMultiplier(): number {
    return this.effects.getBulletStormSpeedMultiplier();
  }
  
  consumeQuickDraw(): boolean {
    return this.effects.consumeQuickDraw();
  }
  
  /**
   * Check if plague marked creep died and spread poison
   */
  onCreepDeath(creep: Creep, allCreeps: Creep[]): void {
    this.effects.onCreepDeath(creep, allCreeps);
  }
  
  /**
   * Destroy handler
   */
  destroy(): void {
    this.effects.clearPlagueTargets();
  }
}
