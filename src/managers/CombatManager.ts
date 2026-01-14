import Phaser from 'phaser';
import { Creep } from '../objects/Creep';
import { TowerManager } from './TowerManager';
import { CreepManager } from './CreepManager';
import { ProjectileManager } from './ProjectileManager';
import type { ProjectileConfig } from '../objects';

export class CombatManager {
  private towerManager: TowerManager;
  private creepManager: CreepManager;
  private projectileManager: ProjectileManager;

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

  updateTowers(delta: number): void {
    const towers = this.towerManager.getTowers();
    const creeps = this.creepManager.getActiveCreeps();

    for (const tower of towers) {

      if (tower.isAuraTower()) {
        tower.update(delta);
        continue;
      }

      const target = this.findTarget(tower, creeps);

      if (target) {
        tower.setCurrentTarget({ x: target.x, y: target.y });
      } else {
        tower.setCurrentTarget(null);
      }

      tower.update(delta);
    }
  }

  updateCombat(currentTime: number): void {
    const towers = this.towerManager.getTowers();
    const creeps = this.creepManager.getActiveCreeps();

    for (const tower of towers) {

      if (tower.isAuraTower()) continue;

      if (!tower.canFire(currentTime)) continue;

      const target = this.findTarget(tower, creeps);

      if (target) {

        tower.onFire();

        const spawnOffset = tower.getProjectileSpawnOffset();
        const spawnX = tower.x + spawnOffset.x;
        const spawnY = tower.y + spawnOffset.y;

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

        this.onTowerFire?.(tower.getBranch());
      }
    }
  }

  private findTarget(
    tower: { x: number; y: number; isInRange: (x: number, y: number) => boolean; getTargetPriority: () => string; getBranch?: () => string; getConfig?: () => { stats: { maxSlowTargets?: number } } },
    creeps: Creep[]
  ): Creep | null {
    const priority = tower.getTargetPriority();
    const branch = tower.getBranch?.() || '';

    // Ground-only towers cannot target flying creeps
    const isGroundOnly = branch === 'rockcannon' || branch === 'poison';

    const isIceTower = branch === 'icetower';
    const isPoisonTower = branch === 'poison';

    let bestTarget: Creep | null = null;
    let bestValue = -Infinity;
    let bestIsSaturated = true;

    let fallbackTarget: Creep | null = null;
    let fallbackValue = -Infinity;

    for (const creep of creeps) {
      if (!creep.getIsActive()) continue;
      if (!tower.isInRange(creep.x, creep.y)) continue;

      if (!creep.canBeTargeted()) continue;

      if (isGroundOnly && creep.isFlying()) continue;

      const creepConfig = creep.getConfig();
      if (creepConfig.onlyDamagedBy) {
        const requiredBranch = creepConfig.onlyDamagedBy === 'ice' ? 'icetower' : 'poison';

        if (branch !== requiredBranch) continue;
      }

      let isSaturated = false;
      if (isIceTower) {

        isSaturated = creep.isSlowed();
      } else if (isPoisonTower) {

        isSaturated = creep.getPoisonStackCount() >= 3;
      }

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

          value = -Phaser.Math.Distance.Between(tower.x, tower.y, creep.x, creep.y);
          break;
      }

      if (isIceTower || isPoisonTower) {

        if (isSaturated && value > fallbackValue) {
          fallbackValue = value;
          fallbackTarget = creep;
        }

        if (!bestIsSaturated && isSaturated) continue;

        if (bestIsSaturated && !isSaturated) {
          bestValue = value;
          bestTarget = creep;
          bestIsSaturated = isSaturated;
          continue;
        }
      }

      if (value > bestValue) {
        bestValue = value;
        bestTarget = creep;
        bestIsSaturated = isSaturated;
      }
    }

    if (!bestTarget && fallbackTarget) {
      return fallbackTarget;
    }

    return bestTarget;
  }
}
