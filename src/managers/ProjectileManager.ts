import Phaser from 'phaser';
import { Projectile } from '../objects/Projectile';
import type { ProjectileConfig } from '../objects/Projectile';
import { Creep } from '../objects/Creep';
import { CreepManager } from './CreepManager';
import type { Tower } from '../objects/Tower';
import type { AbilityContext } from '../objects/TowerAbilities';

export class ProjectileManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private creepManager: CreepManager;
  private pool: Projectile[] = [];
  private activeProjectiles: Projectile[] = [];
  private effectPool: Phaser.GameObjects.Graphics[] = [];
  private readonly POOL_SIZE = 100;

  constructor(scene: Phaser.Scene, creepManager: CreepManager) {
    super();
    this.scene = scene;
    this.creepManager = creepManager;

    this.initializePool();
  }

  private getEffectGraphic(x: number, y: number, depth: number): Phaser.GameObjects.Graphics {
    let g: Phaser.GameObjects.Graphics;

    if (this.effectPool.length > 0) {
      g = this.effectPool.pop()!;
      g.setVisible(true);
      g.setAlpha(1);
      g.setScale(1);
      g.rotation = 0;
      g.clear();

      this.scene.tweens.killTweensOf(g);
    } else {
      g = this.scene.add.graphics();
    }

    g.setPosition(x, y);
    g.setDepth(depth);
    return g;
  }

  private releaseEffectGraphic(g: Phaser.GameObjects.Graphics): void {
    g.setVisible(false);
    this.effectPool.push(g);
  }

  private initializePool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const projectile = new Projectile(this.scene);

      projectile.on('splash', this.handleSplash, this);

      projectile.on('hit', this.handleHit, this);

      projectile.on('kill', this.handleKill, this);

      projectile.on('getCreeps', this.handleGetCreeps, this);

      this.pool.push(projectile);
    }
  }

  private getFromPool(): Projectile | null {
    const projectile = this.pool.find((p) => !p.getIsActive());
    return projectile || null;
  }

  fire(
    x: number,
    y: number,
    target: Creep,
    config: ProjectileConfig,
    sourceTower?: Tower
  ): Projectile | null {
    const projectile = this.getFromPool();

    if (!projectile) {
      console.warn('ProjectileManager: Pool exhausted');
      return null;
    }

    projectile.fire(x, y, target, config, sourceTower);
    this.activeProjectiles.push(projectile);

    return projectile;
  }

  private handleHit(hitType: 'shield' | 'armor' | 'flesh'): void {
    this.emit('hit', hitType);
  }

  private handleKill(tower: Tower): void {
    tower.onKill();
  }

  private handleGetCreeps(context: AbilityContext): void {
    context.allCreeps = this.creepManager.getActiveCreeps();
  }

  private handleSplash(
    x: number,
    y: number,
    radius: number,
    damage: number,
    isMagic: boolean,
    towerBranch?: string
  ): void {
    const creeps = this.creepManager.getActiveCreeps();

    for (const creep of creeps) {
      const distance = Phaser.Math.Distance.Between(x, y, creep.x, creep.y);
      if (distance <= radius) {
        creep.takeDamage(damage, isMagic, towerBranch);
      }
    }

    this.showSplashEffect(x, y, radius);
  }

  private showSplashEffect(x: number, y: number, radius: number): void {
    const explosionFlash = this.getEffectGraphic(x, y, 26);
    explosionFlash.fillStyle(0xffaa00, 0.9);
    explosionFlash.fillCircle(0, 0, radius * 0.3);

    this.scene.tweens.add({
      targets: explosionFlash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 150,
      onComplete: () => this.releaseEffectGraphic(explosionFlash),
    });

    const explosionRing = this.getEffectGraphic(x, y, 25);
    explosionRing.lineStyle(4, 0xff6600, 1);
    explosionRing.strokeCircle(0, 0, radius * 0.2);

    this.scene.tweens.add({
      targets: explosionRing,
      alpha: 0,
      scaleX: 4,
      scaleY: 4,
      duration: 300,
      onComplete: () => this.releaseEffectGraphic(explosionRing),
    });

    const numDebris = 8;
    for (let i = 0; i < numDebris; i++) {
      const angle = (i / numDebris) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      const debris = this.getEffectGraphic(x, y, 24);

      const colors = [0x8b4513, 0x696969, 0xa0522d, 0x808080];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;

      debris.fillStyle(color, 1);
      debris.fillCircle(0, 0, size);

      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: debris,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => this.releaseEffectGraphic(debris),
      });
    }

    const dustCloud = this.getEffectGraphic(x, y, 23);
    dustCloud.fillStyle(0xdeb887, 0.5);
    dustCloud.fillCircle(0, 0, radius * 0.5);

    this.scene.tweens.add({
      targets: dustCloud,
      alpha: 0,
      scaleX: 2,
      scaleY: 1.5,
      y: y - 20,
      duration: 500,
      onComplete: () => this.releaseEffectGraphic(dustCloud),
    });

    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 0.6;
      const offsetY = (Math.random() - 0.5) * radius * 0.6;

      this.scene.time.delayedCall(50 + i * 40, () => {
        const spark = this.getEffectGraphic(x + offsetX, y + offsetY, 25);
        spark.fillStyle(0xffcc00, 0.8);
        spark.fillCircle(0, 0, 8);

        this.scene.tweens.add({
          targets: spark,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 200,
          onComplete: () => this.releaseEffectGraphic(spark),
        });
      });
    }
  }

  update(delta: number): void {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      const stillActive = projectile.update(delta);

      if (!stillActive) {
        this.activeProjectiles.splice(i, 1);
      }
    }
  }

  getActiveCount(): number {
    return this.activeProjectiles.length;
  }

  clearAll(): void {
    for (const projectile of [...this.activeProjectiles]) {
      projectile.deactivate();
    }
    this.activeProjectiles = [];
  }

  destroy(): void {
    this.clearAll();
    for (const projectile of this.pool) {
      projectile.destroy();
    }
    this.pool = [];
  }
}
