import Phaser from 'phaser';
import { CreepManager } from './CreepManager';
import { PathSystem } from './MapPathSystem';
import { Creep } from '../objects';
import { WAVE_CONFIGS, CREEP_TYPES } from '../data/GameData';
import type { WaveCreepGroup, WaveType } from '../data/GameData';

export type WaveManagerEvents = {
  waveStart: [waveNumber: number];
  waveComplete: [waveNumber: number];
  waveProgress: [spawned: number, total: number];
  allWavesComplete: [];
  creepKilled: [goldReward: number, deathX: number, deathY: number];
  creepLeaked: [creep: Creep];
  finalWaveStarted: [];
  finalBossSpawning: [];
};

interface GroupSpawnState {
  group: WaveCreepGroup;
  spawned: number;
  finished: boolean;
  creepType: string;
  lastSpawnedCreep: Creep | null;
}

export class WaveManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  private pathSystem!: PathSystem;

  private currentWave: number = 0;
  private waveInProgress: boolean = false;
  private waveStarted: boolean = false;

  private groupQueue: GroupSpawnState[] = [];
  private currentGroup: GroupSpawnState | null = null;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private groupCreeps: Set<Creep> = new Set();
  private pendingBossGroups: GroupSpawnState[] = [];

  private parallelGroups: GroupSpawnState[] = [];
  private parallelTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  private isParallelMode: boolean = false;

  private creepsToSpawn: number = 0;
  private creepsSpawned: number = 0;
  private creepsKilled: number = 0;
  private creepsLeaked: number = 0;

  private totalCreepsKilled: number = 0;
  private totalGoldEarned: number = 0;

  public getGameSpeed?: () => number;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    super();
    this.scene = scene;
    this.creepManager = creepManager;

    this.creepManager.onCreepDied = this.handleCreepDied.bind(this);
    this.creepManager.onCreepReachedEnd = this.handleCreepReachedEnd.bind(this);
    this.creepManager.onBabySpawned = this.handleBabySpawned.bind(this);
  }

  setPathSystem(pathSystem: PathSystem): void {
    this.pathSystem = pathSystem;
  }

  startWave(): boolean {
    if (this.waveInProgress) {
      console.warn('WaveManager: Wave already in progress');
      return false;
    }

    if (this.currentWave >= WAVE_CONFIGS.length) {
      this.emit('allWavesComplete');
      return false;
    }

    this.currentWave++;
    this.waveInProgress = true;
    this.waveStarted = true;
    this.creepsSpawned = 0;
    this.creepsKilled = 0;
    this.creepsLeaked = 0;

    const waveDef = WAVE_CONFIGS[this.currentWave - 1];

    this.creepsToSpawn = waveDef.creeps.reduce((sum, group) => sum + group.count, 0);

    this.emit('waveStart', this.currentWave);

    if (this.currentWave === WAVE_CONFIGS.length) {
      this.emit('finalWaveStarted');
    }

    if (waveDef.waveType && waveDef.announcement) {
      this.showWaveAnnouncement(waveDef.waveType, waveDef.announcement);
    }

    this.isParallelMode = waveDef.parallelSpawn === true;

    const allGroups = waveDef.creeps.map((group) => ({
      group,
      spawned: 0,
      finished: false,
      creepType: group.type,
      lastSpawnedCreep: null,
    }));

    if (this.isParallelMode) {
      this.parallelGroups = allGroups;
      this.groupQueue = [];
      this.startParallelSpawning();
    } else {
      const isBossOrGuard = (type: string) => type.includes('boss');

      const sequentialGroups = allGroups.filter((g) => !isBossOrGuard(g.creepType));
      const bossGuardGroups = allGroups.filter((g) => isBossOrGuard(g.creepType));

      this.groupQueue = sequentialGroups;
      this.parallelGroups = [];
      this.pendingBossGroups = bossGuardGroups;

      this.startNextGroup();
    }

    return true;
  }

  private startParallelSpawning(): void {
    const immediateGroups = this.parallelGroups.filter(
      (g) => !g.group.delayStart || g.group.delayStart === 0
    );
    const delayedGroups = this.parallelGroups.filter(
      (g) => g.group.delayStart && g.group.delayStart > 0
    );

    if (immediateGroups.length < 2 && delayedGroups.length > 0) {
      const firstDelayed = delayedGroups.shift()!;
      immediateGroups.push(firstDelayed);
    }

    for (const group of immediateGroups) {
      this.startParallelGroup(group);
    }

    for (const group of delayedGroups) {
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledDelay = group.group.delayStart! / gameSpeed;
      this.scene.time.delayedCall(scaledDelay, () => {
        if (group.creepType === 'boss_5') {
          this.emit('finalBossSpawning');
        }

        this.startParallelGroup(group);
      });
    }
  }

  private startParallelGroup(groupState: GroupSpawnState): void {
    const spawnNext = () => {
      if (groupState.spawned >= groupState.group.count) {
        groupState.finished = true;
        return;
      }

      const creep = this.creepManager.spawn(groupState.group.type, this.currentWave);
      groupState.spawned++;
      this.creepsSpawned++;

      if (creep) {
        groupState.lastSpawnedCreep = creep;
      }

      this.emit('waveProgress', this.creepsSpawned, this.creepsToSpawn);

      if (groupState.spawned < groupState.group.count) {
        const gameSpeed = this.getGameSpeed?.() || 1;
        const scaledInterval = groupState.group.intervalMs / gameSpeed;
        const timer = this.scene.time.delayedCall(scaledInterval, spawnNext);
        this.parallelTimers.set(groupState.creepType, timer);
      }
    };

    spawnNext();
  }

  private startNextGroup(): void {
    if (this.groupQueue.length === 0) {
      return;
    }

    this.currentGroup = this.groupQueue.shift()!;
    this.groupCreeps.clear();

    this.spawnNextInGroup();
  }

  private spawnNextInGroup(): void {
    if (!this.currentGroup) return;

    const group = this.currentGroup;
    if (group.spawned >= group.group.count) {
      group.finished = true;

      return;
    }

    const creep = this.creepManager.spawn(group.group.type, this.currentWave);
    group.spawned++;
    this.creepsSpawned++;

    if (creep) {
      group.lastSpawnedCreep = creep;
      this.groupCreeps.add(creep);
    }

    this.emit('waveProgress', this.creepsSpawned, this.creepsToSpawn);

    if (group.spawned < group.group.count) {
      const gameSpeed = this.getGameSpeed?.() || 1;
      const scaledInterval = group.group.intervalMs / gameSpeed;
      this.spawnTimer = this.scene.time.delayedCall(scaledInterval, () => this.spawnNextInGroup());
    } else {
      group.finished = true;
    }
  }

  update(): void {
    if (!this.waveInProgress) return;
    if (this.isParallelMode) return;

    this.checkNextGroupStart();
  }

  private checkNextGroupStart(): void {
    if (!this.waveInProgress) return;
    if (this.isParallelMode) return;
    if (!this.currentGroup) return;
    if (!this.currentGroup.finished) return;

    const hasMoreGroups = this.groupQueue.length > 0 || this.pendingBossGroups.length > 0;
    if (!hasMoreGroups) return;

    if (this.shouldStartNextGroup()) {
      if (this.groupQueue.length > 0) {
        this.startNextGroup();
      } else if (this.pendingBossGroups.length > 0) {
        for (const bossGroup of this.pendingBossGroups) {
          this.startParallelGroup(bossGroup);
        }
        this.pendingBossGroups = [];
        this.currentGroup = null;
      }
    }
  }

  private shouldStartNextGroup(): boolean {
    if (!this.currentGroup) return true;

    const activeCreeps = this.creepManager.getActiveCreeps();
    const groupTypeCreeps = activeCreeps.filter(
      (c) => c.getConfig().type === this.currentGroup!.creepType && this.groupCreeps.has(c)
    );

    if (groupTypeCreeps.length === 0) {
      return true;
    }

    if (this.currentGroup.lastSpawnedCreep && this.pathSystem) {
      const lastCreep = this.currentGroup.lastSpawnedCreep;

      if (lastCreep.getIsActive()) {
        const distanceTraveled = lastCreep.getDistanceTraveled();
        const totalDistance = this.pathSystem.getTotalLength();
        const progress = distanceTraveled / totalDistance;

        if (progress >= 0.5) {
          return true;
        }
      } else {
        if (groupTypeCreeps.length === 0) {
          return true;
        }

        this.currentGroup.lastSpawnedCreep = groupTypeCreeps[groupTypeCreeps.length - 1];
      }
    }

    return false;
  }

  private handleCreepDied(_creep: Creep, goldReward: number, deathX: number, deathY: number): void {
    this.creepsKilled++;
    this.totalCreepsKilled++;
    this.totalGoldEarned += goldReward;

    this.emit('creepKilled', goldReward, deathX, deathY);

    this.checkNextGroupStart();

    this.checkWaveComplete();
  }

  private handleCreepReachedEnd(creep: Creep): void {
    this.creepsLeaked++;

    this.emit('creepLeaked', creep);

    this.checkNextGroupStart();

    this.checkWaveComplete();
  }

  private handleBabySpawned(count: number): void {
    this.creepsToSpawn += count;
  }

  private checkWaveComplete(): void {
    const totalHandled = this.creepsKilled + this.creepsLeaked;
    const activeCount = this.creepManager.getActiveCount();

    if (!this.waveInProgress) {
      return;
    }

    if (totalHandled >= this.creepsToSpawn && activeCount === 0) {
      this.waveInProgress = false;

      this.emit('waveComplete', this.currentWave);

      if (this.currentWave >= WAVE_CONFIGS.length) {
        this.emit('allWavesComplete');
      }
    }
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getTotalWaves(): number {
    return WAVE_CONFIGS.length;
  }

  isWaveInProgress(): boolean {
    return this.waveInProgress;
  }

  hasStarted(): boolean {
    return this.waveStarted;
  }

  getWaveProgress(): { spawned: number; total: number; killed: number; leaked: number } {
    return {
      spawned: this.creepsSpawned,
      total: this.creepsToSpawn,
      killed: this.creepsKilled,
      leaked: this.creepsLeaked,
    };
  }

  getTotalStats(): { killed: number; goldEarned: number } {
    return {
      killed: this.totalCreepsKilled,
      goldEarned: this.totalGoldEarned,
    };
  }

  getNextWaveInfo(): {
    types: Array<{ type: string; description: string }>;
    waveNumber: number;
    waveType?: WaveType;
    isBossWave: boolean;
  } | null {
    const nextWaveIndex = this.currentWave;
    if (nextWaveIndex >= WAVE_CONFIGS.length) return null;

    const waveDef = WAVE_CONFIGS[nextWaveIndex];

    const uniqueTypes = [...new Set(waveDef.creeps.map((g) => g.type))];
    const typesWithDescriptions = uniqueTypes.map((type) => ({
      type,
      description: CREEP_TYPES[type]?.description || 'Unknown creep type.',
    }));

    return {
      types: typesWithDescriptions,
      waveNumber: waveDef.waveNumber,
      waveType: waveDef.waveType,
      isBossWave: waveDef.waveType === 'boss',
    };
  }

  getCurrentWaveInfo(): {
    types: Array<{ type: string; description: string }>;
    waveNumber: number;
    waveType?: WaveType;
    isBossWave: boolean;
    currentCreepType: string | null;
  } | null {
    if (this.currentWave <= 0) return null;

    const waveDef = WAVE_CONFIGS[this.currentWave - 1];
    if (!waveDef) return null;

    const uniqueTypes = [...new Set(waveDef.creeps.map((g) => g.type))];
    const typesWithDescriptions = uniqueTypes.map((type) => ({
      type,
      description: CREEP_TYPES[type]?.description || 'Unknown creep type.',
    }));

    let currentCreepType: string | null = null;

    if (this.isParallelMode) {
      const activeGroup =
        this.parallelGroups.find((g) => g.spawned < g.group.count && !g.finished) ||
        this.pendingBossGroups[0];
      currentCreepType = activeGroup?.creepType || null;
    } else {
      currentCreepType =
        this.currentGroup?.creepType ||
        this.groupQueue[0]?.creepType ||
        this.pendingBossGroups[0]?.creepType ||
        null;
    }

    return {
      types: typesWithDescriptions,
      waveNumber: waveDef.waveNumber,
      waveType: waveDef.waveType,
      isBossWave: waveDef.waveType === 'boss',
      currentCreepType,
    };
  }

  reset(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    for (const timer of this.parallelTimers.values()) {
      timer.destroy();
    }
    this.parallelTimers.clear();
    this.parallelGroups = [];
    this.pendingBossGroups = [];
    this.isParallelMode = false;

    this.groupQueue = [];
    this.currentGroup = null;
    this.groupCreeps.clear();
    this.creepManager.clearAll();
    this.currentWave = 0;
    this.waveInProgress = false;
    this.waveStarted = false;
    this.totalCreepsKilled = 0;
    this.totalGoldEarned = 0;
  }

  private showWaveAnnouncement(waveType: WaveType, text: string): void {
    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2 - 50;

    const colors = this.getAnnouncementColors(waveType);

    const container = this.scene.add.container(centerX, centerY);
    container.setDepth(250);
    container.setScrollFactor(0);

    const announcement = this.scene.add.text(0, 0, text, {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: colors.text,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 500 },
    });
    announcement.setOrigin(0.5);

    const panelWidth = Math.max(420, announcement.width + 40);
    const panelHeight = Math.max(80, announcement.height + 30);
    const panelBg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.85);
    panelBg.setStrokeStyle(4, colors.border);
    container.add(panelBg);
    container.add(announcement);

    container.setAlpha(0);
    container.setScale(0.5);

    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });

    if (waveType === 'boss') {
      this.scene.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 500,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        delay: 400,
      });
    }

    const duration = waveType === 'boss' ? 3000 : waveType === 'chaos' ? 2500 : 2000;

    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: container,
        alpha: 0,
        y: centerY - 40,
        scale: 0.8,
        duration: 400,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          container.destroy();
        },
      });
    });
  }

  private getAnnouncementColors(waveType: WaveType): { text: string; border: number } {
    switch (waveType) {
      case 'boss':
        return { text: '#FF4444', border: 0xff0000 };
      case 'flying':
        return { text: '#FFD700', border: 0xffaa00 };
      case 'digger':
        return { text: '#D2691E', border: 0x8b4513 };
      case 'ghost':
        return { text: '#9370DB', border: 0x8a2be2 };
      case 'broodmother':
        return { text: '#32CD32', border: 0x228b22 };
      case 'chaos':
        return { text: '#FF6347', border: 0xff4500 };
      case 'flame':
        return { text: '#FF6600', border: 0xff4400 };
      case 'plaguebearer':
        return { text: '#00FF88', border: 0x00cc66 };
      default:
        return { text: '#FFFFFF', border: 0xffffff };
    }
  }

  destroy(): void {
    this.reset();
  }
}
