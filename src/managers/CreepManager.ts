import Phaser from 'phaser';
import { Creep } from '../objects';
import { PathSystem } from './MapPathSystem';

export class CreepManager {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pool: Creep[] = [];
  private activeCreeps: Creep[] = [];
  private readonly POOL_SIZE = 120;
  private currentWaveNumber: number = 1;

  public onCreepDied?: (creep: Creep, goldReward: number, deathX: number, deathY: number) => void;
  public onCreepReachedEnd?: (creep: Creep) => void;
  public onBabySpawned?: (count: number) => void;
  public onBossFirstHit?: (creep: Creep) => void;
  public onBossPainThreshold?: (creep: Creep) => void;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;

    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const creep = new Creep(this.scene, -100, -100);
      creep.deactivate();

      creep.on('died', this.handleCreepDied, this);
      creep.on('reachedEnd', this.handleCreepReachedEnd, this);
      creep.on('spawnOnDeath', this.handleSpawnOnDeath, this);
      creep.on('bossFirstHit', this.handleBossFirstHit, this);
      creep.on('bossPainThreshold', this.handleBossPainThreshold, this);

      this.pool.push(creep);
    }
  }

  private getFromPool(): Creep | null {
    const creep = this.pool.find((c) => c.canBeReused());
    return creep || null;
  }

  spawn(creepType: string, waveNumber: number = 1): Creep | null {
    const creep = this.getFromPool();

    if (!creep) {
      console.warn('CreepManager: Pool exhausted, cannot spawn creep');
      return null;
    }

    this.currentWaveNumber = waveNumber;
    creep.spawn(this.pathSystem, creepType, waveNumber);
    this.activeCreeps.push(creep);

    return creep;
  }

  private spawnAtPosition(
    creepType: string,
    deathX: number,
    deathY: number,
    distanceTraveled: number,
    waveNumber: number
  ): Creep | null {
    const creep = this.getFromPool();

    if (!creep) {
      console.warn('CreepManager: Pool exhausted, cannot spawn baby creep');
      return null;
    }

    creep.spawn(this.pathSystem, creepType, waveNumber);

    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 30;
    creep.setPosition(deathX + offsetX, deathY + offsetY);

    // Set distance traveled for proper path position
    creep.setDistanceTraveled(distanceTraveled);

    this.activeCreeps.push(creep);

    return creep;
  }

  private handleCreepDied(creep: Creep, goldReward: number): void {
    const deathX = creep.x;
    const deathY = creep.y;
    this.removeFromActive(creep);
    this.onCreepDied?.(creep, goldReward, deathX, deathY);
  }

  private handleCreepReachedEnd(creep: Creep): void {
    this.removeFromActive(creep);
    this.onCreepReachedEnd?.(creep);
  }

  private handleSpawnOnDeath(
    _parentCreep: Creep,
    babyType: string,
    count: number,
    deathX: number,
    deathY: number,
    distanceTraveled: number
  ): void {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const baby = this.spawnAtPosition(
          babyType,
          deathX,
          deathY,
          distanceTraveled,
          this.currentWaveNumber
        );
        if (baby) {
          this.onBabySpawned?.(1);
        }
      });
    }
  }

  private handleBossFirstHit(creep: Creep): void {
    this.onBossFirstHit?.(creep);
  }

  private handleBossPainThreshold(creep: Creep): void {
    this.onBossPainThreshold?.(creep);
  }

  private removeFromActive(creep: Creep): void {
    const index = this.activeCreeps.indexOf(creep);
    if (index !== -1) {
      this.activeCreeps.splice(index, 1);
    }
  }

  update(delta: number): void {
    for (const creep of this.activeCreeps) {
      creep.update(delta);
    }
  }

  getActiveCreeps(): Creep[] {
    return this.activeCreeps;
  }

  getActiveCount(): number {
    return this.activeCreeps.length;
  }

  /* eslint-disable no-console */
  debugActiveCreeps(): void {
    console.log(`CreepManager DEBUG: ${this.activeCreeps.length} active creeps:`);
    for (let i = 0; i < this.activeCreeps.length; i++) {
      const creep = this.activeCreeps[i];
      console.log(
        `  [${i}] type=${creep.getConfig().type}, pos=(${creep.x.toFixed(0)}, ${creep.y.toFixed(0)}), isActive=${creep.getIsActive()}, visible=${creep.visible}, hp=${creep.getCurrentHealth()}`
      );
    }
  }
  /* eslint-enable no-console */

  clearAll(): void {
    for (const creep of [...this.activeCreeps]) {
      creep.deactivate();
    }
    this.activeCreeps = [];
  }

  destroy(): void {
    this.clearAll();
    for (const creep of this.pool) {
      creep.destroy();
    }
    this.pool = [];
  }
}
