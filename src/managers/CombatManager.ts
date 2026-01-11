import Phaser from 'phaser';
import { Creep } from '../objects/Creep';
import { TowerManager } from './TowerManager';
import { CreepManager } from './CreepManager';
import { ProjectileManager } from './ProjectileManager';
import type { ProjectileConfig } from '../objects';

/**
 * CombatManager handles all tower targeting and firing logic.
 * Extracted from GameScene to reduce file size and improve separation of concerns.
 */
export class CombatManager {
  private towerManager: TowerManager;
  private creepManager: CreepManager;
  private projectileManager: ProjectileManager;
  
  // Callback for playing tower shoot sounds
  public onTowerFire?: (branch: string) => void;
  
  constructor(
    _scene: Phaser.Scene,
    towerManager: TowerManager,
    creepManager: CreepManager,
    projectileManager: ProjectileManager
  ) {
    this.towerManager = towerManager;
    this.creepManager = creepManager;
    this.projectileManager = projectileManager;
  }

  /**
   * Update all tower animations and set targets for turret tracking
   */
  updateTowers(delta: number): void {
    const towers = this.towerManager.getTowers();
    const creeps = this.creepManager.getActiveCreeps();
    
    for (const tower of towers) {
      // Aura towers don't target creeps - skip combat logic but still update animations
      if (tower.isAuraTower()) {
        tower.update(delta);
        continue;
      }
      
      // Find potential target for turret tracking (even if can't fire yet)
      const target = this.findTarget(tower, creeps);
      
      if (target) {
        tower.setCurrentTarget({ x: target.x, y: target.y });
      } else {
        tower.setCurrentTarget(null);
      }
      
      // Update tower animations
      tower.update(delta);
    }
  }

  /**
   * Update tower combat - targeting and firing
   */
  updateCombat(currentTime: number): void {
    const towers = this.towerManager.getTowers();
    const creeps = this.creepManager.getActiveCreeps();
    
    for (const tower of towers) {
      // Skip aura towers - they don't attack
      if (tower.isAuraTower()) continue;
      
      // Check if tower can fire
      if (!tower.canFire(currentTime)) continue;
      
      // Find target based on tower priority
      const target = this.findTarget(tower, creeps);
      
      if (target) {
        // Trigger tower's fire animation FIRST (for animated towers like rapidfire)
        // This also calculates barrel tip position for projectile spawn
        tower.onFire();
        
        // Get projectile spawn position (barrel tip for rapidfire, default offset for others)
        const spawnOffset = tower.getProjectileSpawnOffset();
        const spawnX = tower.x + spawnOffset.x;
        const spawnY = tower.y + spawnOffset.y;
        
        // Fire projectile
        const config: ProjectileConfig = {
          speed: 400,
          damage: tower.getDamage(),
          isMagic: tower.isMagic(),
          branch: tower.getBranch(),
          stats: tower.getConfig().stats,
          level: tower.getLevel()
        };
        
        const projectile = this.projectileManager.fire(spawnX, spawnY, target, config, tower);
        if (!projectile) continue;
        
        tower.recordFire(currentTime);
        
        // Play tower-specific shooting sound via callback
        this.onTowerFire?.(tower.getBranch());
      }
    }
  }

  /**
   * Find the best target for a tower based on priority and constraints
   */
  private findTarget(
    tower: { x: number; y: number; isInRange: (x: number, y: number) => boolean; getTargetPriority: () => string; getBranch?: () => string; getConfig?: () => { stats: { maxSlowTargets?: number } } },
    creeps: Creep[]
  ): Creep | null {
    const priority = tower.getTargetPriority();
    const branch = tower.getBranch?.() || '';
    
    // Ground-only towers cannot target flying creeps
    const isGroundOnly = branch === 'rockcannon' || branch === 'poison';
    
    // Ice tower special handling: prefer unslowed targets
    const isIceTower = branch === 'icetower';
    
    let bestTarget: Creep | null = null;
    let bestValue = -Infinity;
    let bestIsSlowed = true; // Assume slowed, prefer unslowed
    
    for (const creep of creeps) {
      if (!creep.getIsActive()) continue;
      if (!tower.isInRange(creep.x, creep.y)) continue;
      
      // Check if creep can be targeted (not burrowed, not in ghost phase)
      if (!creep.canBeTargeted()) continue;
      
      // Ground-only towers cannot target flying creeps
      if (isGroundOnly && creep.isFlying()) continue;
      
      // Check elemental immunity - only matching tower can damage these creeps
      const creepConfig = creep.getConfig();
      if (creepConfig.onlyDamagedBy) {
        const requiredBranch = creepConfig.onlyDamagedBy === 'ice' ? 'icetower' : 'poison';
        // Non-matching towers should not even target these creeps
        if (branch !== requiredBranch) continue;
      }
      
      // Ice tower: check slow status
      const creepIsSlowed = isIceTower ? creep.isSlowed() : false;
      
      let value: number;
      
      switch (priority) {
        case 'highestHP':
          value = creep.getCurrentHealth();
          break;
        case 'furthestAlongPath':
          value = creep.getDistanceTraveled();
          break;
        case 'closest':
        default:
          // For closest, we want minimum distance, so negate
          value = -Phaser.Math.Distance.Between(tower.x, tower.y, creep.x, creep.y);
          break;
      }
      
      // Ice tower targeting priority: unslowed > slowed
      // Only pick a slowed creep if no unslowed creep is better
      if (isIceTower) {
        // If current best is unslowed and this one is slowed, skip
        if (!bestIsSlowed && creepIsSlowed) continue;
        
        // If current best is slowed and this one is unslowed, take it
        if (bestIsSlowed && !creepIsSlowed) {
          bestValue = value;
          bestTarget = creep;
          bestIsSlowed = creepIsSlowed;
          continue;
        }
      }
      
      if (value > bestValue) {
        bestValue = value;
        bestTarget = creep;
        bestIsSlowed = creepIsSlowed;
      }
    }
    
    return bestTarget;
  }
}
