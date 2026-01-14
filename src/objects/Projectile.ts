import Phaser from 'phaser';
import { Creep } from './Creep';
import type { TowerBranch, TowerStats } from '../data';
import type { Tower } from './Tower';
import type { AbilityContext, AbilityResult } from './TowerAbilities';

export interface ProjectileConfig {
  speed: number;
  damage: number;
  isMagic: boolean;
  branch: TowerBranch;
  stats: TowerStats;
  level: number;
}

export class Projectile extends Phaser.GameObjects.Container {
  private graphics: Phaser.GameObjects.Graphics;
  private target: Creep | null = null;
  private config: ProjectileConfig | null = null;
  private isActive: boolean = false;
  private speed: number = 400;
  private sourceTower: Tower | null = null;

  private trail: Phaser.GameObjects.Graphics;
  private trailPositions: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, -100, -100);

    this.graphics = scene.add.graphics();
    this.trail = scene.add.graphics();
    this.trail.setDepth(14);

    this.add(this.graphics);

    scene.add.existing(this);
    this.setDepth(15);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x: number, y: number, target: Creep, config: ProjectileConfig, sourceTower?: Tower): void {
    this.setPosition(x, y);
    this.target = target;
    this.config = config;
    this.speed = config.speed;
    this.isActive = true;
    this.trailPositions = [];
    this.sourceTower = sourceTower || null;

    this.setActive(true);
    this.setVisible(true);

    this.drawProjectile();
  }

  private drawProjectile(): void {
    this.graphics.clear();

    if (!this.config) return;

    const level = this.config.level || 1;
    const scale = 1 + (level - 1) * 0.2;

    switch (this.config.branch) {
      case 'archer':
        this.drawArcherProjectile(level, scale);
        break;

      case 'rapidfire':
        this.drawRapidFireProjectile(level, scale);
        break;

      case 'sniper':
        this.drawSniperProjectile(level, scale);
        break;

      case 'rockcannon':
        this.drawRockCannonProjectile(level, scale);
        break;

      case 'icetower':
        this.drawIceProjectile(level, scale);
        break;

      case 'poison':
        this.drawPoisonProjectile(level, scale);
        break;

      default:
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillCircle(0, 0, 5 * scale);
    }
  }

  private drawArcherProjectile(level: number, scale: number): void {
    const arrowLength = 16 * scale;
    const arrowWidth = 4 * scale;

    this.graphics.fillStyle(level >= 3 ? 0x654321 : 0x8b4513, 1);
    this.graphics.fillRect(-arrowLength / 2, -arrowWidth / 2, arrowLength, arrowWidth);

    const headSize = 4 + level * 2;
    this.graphics.fillStyle(level >= 3 ? 0xcccccc : 0xaaaaaa, 1);
    this.graphics.fillTriangle(
      arrowLength / 2,
      0,
      arrowLength / 2 + headSize,
      -headSize,
      arrowLength / 2 + headSize,
      headSize
    );

    this.graphics.fillStyle(level >= 3 ? 0xff6633 : 0xcc6633, 1);
    this.graphics.fillTriangle(
      -arrowLength / 2,
      0,
      -arrowLength / 2 - 4 * scale,
      -3 * scale,
      -arrowLength / 2 - 4 * scale,
      3 * scale
    );

    if (level >= 2) {
      this.graphics.fillStyle(level >= 3 ? 0xffd700 : 0xaa5522, 1);
      this.graphics.fillTriangle(
        -arrowLength / 2 + 3,
        0,
        -arrowLength / 2 - 2 * scale,
        -2 * scale,
        -arrowLength / 2 - 2 * scale,
        2 * scale
      );
    }

    if (level >= 3) {
      this.graphics.fillStyle(0xffd700, 0.3);
      this.graphics.fillCircle(arrowLength / 2 + headSize / 2, 0, headSize);
    }
  }

  private drawRapidFireProjectile(level: number, scale: number): void {
    const bulletSize = 4 * scale;

    this.graphics.fillStyle(level >= 3 ? 0xffaa00 : 0xffd700, 1);
    this.graphics.fillCircle(0, 0, bulletSize);
    this.graphics.fillStyle(level >= 3 ? 0xffff44 : 0xffff00, 0.8);
    this.graphics.fillCircle(0, 0, bulletSize * 0.5);

    if (level >= 2) {
      this.graphics.fillStyle(0xffffff, 0.6);
      this.graphics.fillCircle(-bulletSize, 0, bulletSize * 0.4);
    }

    if (level >= 3) {
      this.graphics.fillStyle(0xff6600, 0.5);
      this.graphics.fillCircle(0, 0, bulletSize * 1.5);
      this.graphics.fillStyle(0xff0000, 0.3);
      this.graphics.fillCircle(-bulletSize * 0.5, 0, bulletSize * 0.8);
    }
  }

  private drawSniperProjectile(level: number, scale: number): void {
    const bulletLength = 20 * scale;
    const bulletWidth = 4 * scale;

    this.graphics.fillStyle(level >= 3 ? 0x6495ed : 0x4169e1, 1);
    this.graphics.fillRect(-bulletLength / 2, -bulletWidth / 2, bulletLength, bulletWidth);
    this.graphics.fillStyle(level >= 3 ? 0x87ceeb : 0x6495ed, 1);
    this.graphics.fillRect(
      -bulletLength / 2 + 2,
      -bulletWidth / 4,
      bulletLength - 4,
      bulletWidth / 2
    );

    if (level >= 2) {
      this.graphics.fillStyle(0x4169e1, 0.5);
      this.graphics.fillRect(-bulletLength, -bulletWidth / 4, bulletLength / 2, bulletWidth / 2);
    }

    if (level >= 3) {
      this.graphics.fillStyle(0xffd700, 1);
      this.graphics.fillTriangle(
        bulletLength / 2,
        0,
        bulletLength / 2 + 6,
        -2,
        bulletLength / 2 + 6,
        2
      );

      this.graphics.fillStyle(0x00ffff, 0.3);
      this.graphics.fillCircle(bulletLength / 2, 0, bulletWidth * 2);
    }
  }

  private drawRockCannonProjectile(level: number, scale: number): void {
    const rockSize = 10 * scale;

    this.graphics.fillStyle(level >= 3 ? 0x7a7a7a : 0x696969, 1);
    this.graphics.fillCircle(0, 0, rockSize);
    this.graphics.fillStyle(level >= 3 ? 0x9a9a9a : 0x808080, 1);
    this.graphics.fillCircle(-2 * scale, -2 * scale, rockSize * 0.8);
    this.graphics.fillStyle(level >= 3 ? 0x5a5a5a : 0x5a5a5a, 1);
    this.graphics.fillCircle(3 * scale, 3 * scale, rockSize * 0.4);

    if (level >= 2) {
      this.graphics.lineStyle(1, 0x4a4a4a, 0.5);
      this.graphics.lineBetween(-rockSize * 0.5, -rockSize * 0.3, rockSize * 0.3, rockSize * 0.2);
    }

    if (level >= 3) {
      this.graphics.fillStyle(0xff6600, 0.4);
      this.graphics.fillCircle(0, 0, rockSize * 1.3);
      this.graphics.fillStyle(0xff0000, 0.3);
      this.graphics.fillCircle(-rockSize * 0.3, -rockSize * 0.3, rockSize * 0.6);
    }
  }

  private drawIceProjectile(level: number, scale: number): void {
    const shardSize = 8 * scale;

    this.graphics.fillStyle(level >= 3 ? 0xa0e0ff : 0x87ceeb, 0.9);
    this.graphics.fillTriangle(-shardSize, 0, 0, -shardSize * 0.6, shardSize, 0);
    this.graphics.fillTriangle(-shardSize, 0, 0, shardSize * 0.6, shardSize, 0);

    this.graphics.fillStyle(level >= 3 ? 0xffffff : 0xe0ffff, 0.7);
    this.graphics.fillTriangle(-shardSize * 0.5, 0, 0, -shardSize * 0.4, shardSize * 0.5, 0);

    if (level >= 2) {
      this.graphics.fillStyle(0xc0e0ff, 0.6);
      this.graphics.fillTriangle(
        0,
        -shardSize * 0.4,
        shardSize * 0.3,
        -shardSize * 0.8,
        shardSize * 0.5,
        -shardSize * 0.3
      );
      this.graphics.fillTriangle(
        0,
        shardSize * 0.4,
        shardSize * 0.3,
        shardSize * 0.8,
        shardSize * 0.5,
        shardSize * 0.3
      );
    }

    if (level >= 3) {
      this.graphics.fillStyle(0xffffff, 0.3);
      this.graphics.fillCircle(0, 0, shardSize * 1.2);

      this.graphics.fillStyle(0xffffff, 0.9);
      this.graphics.fillCircle(shardSize * 0.3, -shardSize * 0.2, 2);
    }
  }

  private drawPoisonProjectile(level: number, scale: number): void {
    const globSize = 6 * scale;

    this.graphics.fillStyle(level >= 3 ? 0x00cc00 : 0x00aa00, 0.9);
    this.graphics.fillCircle(0, 0, globSize);
    this.graphics.fillStyle(level >= 3 ? 0x44ff44 : 0x00ff00, 0.7);
    this.graphics.fillCircle(-1 * scale, -1 * scale, globSize * 0.7);
    this.graphics.fillStyle(level >= 3 ? 0xaaffaa : 0x88ff88, 0.5);
    this.graphics.fillCircle(-2 * scale, -2 * scale, globSize * 0.35);

    if (level >= 2) {
      this.graphics.fillStyle(0x00ff00, 0.6);
      this.graphics.fillCircle(globSize * 0.5, globSize * 0.3, globSize * 0.3);
      this.graphics.fillCircle(-globSize * 0.4, globSize * 0.4, globSize * 0.25);
    }

    if (level >= 3) {
      this.graphics.fillStyle(0x00ff00, 0.2);
      this.graphics.fillCircle(0, 0, globSize * 1.5);

      this.graphics.fillStyle(0x88ff88, 0.7);
      this.graphics.fillCircle(-globSize * 0.6, -globSize * 0.6, 2);
      this.graphics.fillCircle(globSize * 0.5, -globSize * 0.4, 1.5);
    }
  }

  update(delta: number): boolean {
    if (!this.isActive || !this.target || !this.config) {
      return false;
    }

    if (!this.target.getIsActive()) {
      this.deactivate();
      return false;
    }

    this.trailPositions.push({ x: this.x, y: this.y });
    if (this.trailPositions.length > 5) {
      this.trailPositions.shift();
    }

    this.drawTrail();

    const targetX = this.target.x;
    const targetY = this.target.y;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    this.rotation = angle;

    const moveDistance = (this.speed * delta) / 1000;
    const dx = Math.cos(angle) * moveDistance;
    const dy = Math.sin(angle) * moveDistance;

    this.x += dx;
    this.y += dy;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    if (distance < 20) {
      this.hitTarget();
      return false;
    }

    return true;
  }

  private drawTrail(): void {
    this.trail.clear();

    if (this.trailPositions.length < 2 || !this.config) return;

    const color = this.getTrailColor();

    for (let i = 0; i < this.trailPositions.length; i++) {
      const alpha = ((i + 1) / this.trailPositions.length) * 0.5;
      const size = ((i + 1) / this.trailPositions.length) * 3;

      this.trail.fillStyle(color, alpha);
      this.trail.fillCircle(this.trailPositions[i].x, this.trailPositions[i].y, size);
    }
  }

  private getTrailColor(): number {
    if (!this.config) return 0xffffff;

    switch (this.config.branch) {
      case 'archer':
        return 0x8b4513;
      case 'rapidfire':
        return 0xffd700;
      case 'sniper':
        return 0x4169e1;
      case 'rockcannon':
        return 0x696969;
      case 'icetower':
        return 0x87ceeb;
      case 'poison':
        return 0x00ff00;
      default:
        return 0xffffff;
    }
  }

  /* eslint-disable complexity */
  private hitTarget(): void {
    if (!this.target || !this.config) {
      this.deactivate();
      return;
    }

    const stats = this.config.stats;
    let damage = this.config.damage;
    let isMagic = this.config.isMagic;

    if (stats.airDamageBonus && this.target.isFlying()) {
      damage = Math.floor(damage * (1 + stats.airDamageBonus));
      this.showAirBonusEffect();
    }

    let abilityResult: AbilityResult = { triggered: false };
    if (this.sourceTower?.getAbilityHandler()) {
      const context: AbilityContext = {
        scene: this.scene,
        tower: this.sourceTower,
        target: this.target,
        hitPosition: { x: this.x, y: this.y },
        damage: damage,
        isMagic: isMagic,
        allCreeps: [],
        onSplash: (
          x: number,
          y: number,
          radius: number,
          splashDamage: number,
          splashMagic: boolean,
          branch: string
        ) => {
          this.emit('splash', x, y, radius, splashDamage, splashMagic, branch);
        },
      };

      this.emit('getCreeps', context);

      abilityResult = this.sourceTower.tryTriggerAbility(context);

      if (abilityResult.triggered) {
        if (abilityResult.extraDamage) {
          damage += abilityResult.extraDamage;
        }

        if (abilityResult.abilityId === 'sniper_pierce') {
          isMagic = true;
        }
      }
    }

    if (this.sourceTower) {
      const auraCritBonus = this.sourceTower.getAuraCritBonus();
      if (auraCritBonus > 0 && Math.random() < auraCritBonus) {
        damage *= 2;

        this.showCritEffect(true);
      }
    }

    const hitType =
      this.target.getShieldHitsRemaining() > 0
        ? 'shield'
        : this.target.getConfig().armor > 0
          ? 'armor'
          : 'flesh';
    this.emit('hit', hitType);

    const wasAlive = this.target.getIsActive();

    this.target.takeDamage(damage, isMagic, this.config.branch);

    if (wasAlive && !this.target.getIsActive() && this.sourceTower) {
      this.emit('kill', this.sourceTower);

      this.sourceTower.getAbilityHandler()?.onCreepDeath(this.target, []);
    }

    this.applySpecialEffects();

    if (this.config.branch === 'rockcannon' && stats.splashRadius) {
      this.emit(
        'splash',
        this.target.x,
        this.target.y,
        stats.splashRadius,
        damage * 0.5,
        this.config.isMagic,
        this.config.branch
      );
    }

    this.deactivate();
  }

  private applySpecialEffects(): void {
    if (!this.target || !this.config) return;

    const stats = this.config.stats;

    if (this.config.branch === 'icetower' && stats.slowPercent && stats.slowDuration) {
      this.target.applySlow(stats.slowPercent, stats.slowDuration);
    }

    if (this.config.branch === 'poison' && stats.dotDamage && stats.dotDuration) {
      this.target.applyPoison(stats.dotDamage, stats.dotDuration);
    }
  }

  private showCritEffect(isAuraCrit: boolean): void {
    const x = this.x;
    const y = this.y;

    const primaryColor = isAuraCrit ? 0xffa500 : 0xff0000;
    const secondaryColor = isAuraCrit ? 0xffd700 : 0xff4444;
    const textColor = isAuraCrit ? '#ffa500' : '#ff0000';

    const flash = this.scene.add.graphics();
    flash.fillStyle(primaryColor, 0.8);
    flash.fillCircle(x, y, 15);
    flash.setDepth(30);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    const critText = this.scene.add
      .text(x, y - 20, isAuraCrit ? '⚡CRIT!' : 'CRIT!', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: textColor,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: critText,
      y: y - 50,
      alpha: 0,
      scale: 1.3,
      duration: 600,
      onComplete: () => critText.destroy(),
    });

    if (isAuraCrit) {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spark = this.scene.add.graphics();
        spark.setPosition(x, y);
        spark.setDepth(31);
        spark.fillStyle(secondaryColor, 1);
        spark.fillCircle(0, 0, 4);

        this.scene.tweens.add({
          targets: spark,
          x: x + Math.cos(angle) * 30,
          y: y + Math.sin(angle) * 30,
          alpha: 0,
          scale: 0.5,
          duration: 250,
          onComplete: () => spark.destroy(),
        });
      }
    }
  }

  private showAirBonusEffect(): void {
    const x = this.x;
    const y = this.y;

    const flash = this.scene.add.graphics();
    flash.fillStyle(0x66ccff, 0.6);
    flash.fillCircle(x, y, 12);
    flash.setDepth(30);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 150,
      onComplete: () => flash.destroy(),
    });
  }

  deactivate(): void {
    this.isActive = false;
    this.target = null;
    this.config = null;
    this.trailPositions = [];
    this.trail.clear();

    this.setActive(false);
    this.setVisible(false);
    this.setPosition(-100, -100);
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  destroy(fromScene?: boolean): void {
    this.trail.destroy();
    super.destroy(fromScene);
  }
}
