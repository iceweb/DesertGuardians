import Phaser from 'phaser';
import type { Creep } from './Creep';
import type { Tower } from './Tower';
import type { AbilityDefinition } from './TowerAbilityDefinitions';
import { TowerAbilityVisuals } from './TowerAbilityVisuals';

export interface AbilityContext {
  scene: Phaser.Scene;
  tower: Tower;
  target: Creep;
  hitPosition: { x: number; y: number };
  damage: number;
  isMagic: boolean;
  allCreeps: Creep[];
  onSplash?: (x: number, y: number, radius: number, damage: number, isMagic: boolean, branch: string) => void;
}

export interface AbilityResult {
  triggered: boolean;
  abilityId?: string;
  extraDamage?: number;
  preventNormalDamage?: boolean;
  message?: string;
}

export class TowerAbilityEffects {
  private scene: Phaser.Scene;
  private visuals: TowerAbilityVisuals;

  private bulletStormCount: number = 0;
  private quickDrawActive: boolean = false;

  private plagueMarkedTargets: Set<Creep> = new Set();

  constructor(scene: Phaser.Scene, visuals: TowerAbilityVisuals) {
    this.scene = scene;
    this.visuals = visuals;
  }

  executeAftershock(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { hitPosition, damage, isMagic, onSplash } = context;
    const count = params.count || 3;
    const radius = params.radius || 50;
    const damageMultiplier = params.damageMultiplier || 0.5;
    const duration = params.duration || 500;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 30 + Math.random() * 30;
      const x = hitPosition.x + Math.cos(angle) * dist;
      const y = hitPosition.y + Math.sin(angle) * dist;

      const delay = (i + 1) * (duration / count);

      this.scene.time.delayedCall(delay, () => {
        onSplash?.(x, y, radius, damage * damageMultiplier, isMagic, 'rockcannon');
        this.visuals.showExplosionEffect(x, y, 0xffaa00);
      });
    }

    return { triggered: true, abilityId: 'cannon_aftershock', message: 'AFTERSHOCK!' };
  }

  executeEarthquake(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { scene, hitPosition, allCreeps, tower } = context;
    const radius = params.radius || 85;
    const duration = params.duration || 3000;
    const damage = params.damage || 8;

    this.visuals.showFloatingText(tower.x, tower.y - 40, 'EARTHQUAKE!', 0x8b4513);

    const zoneContainer = scene.add.container(hitPosition.x, hitPosition.y);
    zoneContainer.setDepth(15);

    const zone = scene.add.graphics();
    zoneContainer.add(zone);

    const cracks = scene.add.graphics();
    zoneContainer.add(cracks);

    const debrisContainer = scene.add.container(0, 0);
    zoneContainer.add(debrisContainer);

    const drawEarthquakeZone = (intensity: number = 1) => {
      zone.clear();
      cracks.clear();

      zone.fillStyle(0x5c4033, 0.4 * intensity);
      zone.fillCircle(0, 0, radius);
      zone.fillStyle(0x8b4513, 0.5 * intensity);
      zone.fillCircle(0, 0, radius * 0.7);
      zone.fillStyle(0x6b3d2e, 0.6 * intensity);
      zone.fillCircle(0, 0, radius * 0.4);

      zone.lineStyle(4, 0x3d2817, 0.8 * intensity);
      zone.strokeCircle(0, 0, radius);
      zone.lineStyle(2, 0x654321, 0.6 * intensity);
      zone.strokeCircle(0, 0, radius * 0.85);

      cracks.lineStyle(3, 0x2a1a0f, 0.9 * intensity);
      for (let i = 0; i < 8; i++) {
        const baseAngle = (i / 8) * Math.PI * 2;
        cracks.beginPath();
        cracks.moveTo(0, 0);

        let x = 0, y = 0;
        const segments = 4;
        for (let s = 1; s <= segments; s++) {
          const progress = s / segments;
          const jitter = (Math.random() - 0.5) * 15;
          const angle = baseAngle + jitter * 0.03;
          x = Math.cos(angle) * radius * 0.9 * progress;
          y = Math.sin(angle) * radius * 0.9 * progress;
          cracks.lineTo(x, y);
        }
        cracks.strokePath();
      }

      cracks.lineStyle(2, 0x3d2817, 0.7 * intensity);
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.15;
        const startDist = radius * (0.3 + Math.random() * 0.2);
        const endDist = radius * (0.6 + Math.random() * 0.25);
        const startX = Math.cos(angle) * startDist;
        const startY = Math.sin(angle) * startDist;
        const jitterAngle = angle + (Math.random() - 0.5) * 0.3;
        const endX = Math.cos(jitterAngle) * endDist;
        const endY = Math.sin(jitterAngle) * endDist;
        cracks.lineBetween(startX, startY, endX, endY);
      }

      cracks.fillStyle(0x4a3020, 0.8 * intensity);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
        const dist = radius * (0.4 + Math.random() * 0.3);
        const rockX = Math.cos(angle) * dist;
        const rockY = Math.sin(angle) * dist;
        const rockSize = 3 + Math.random() * 4;
        cracks.fillCircle(rockX, rockY, rockSize);
      }
    };

    drawEarthquakeZone(1);

    const spawnDebris = () => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.8;
        const debris = scene.add.graphics();
        debris.fillStyle(0x8b4513, 0.9);
        const size = 2 + Math.random() * 4;
        debris.fillCircle(0, 0, size);
        debris.setPosition(Math.cos(angle) * dist, Math.sin(angle) * dist);
        debrisContainer.add(debris);

        scene.tweens.add({
          targets: debris,
          y: debris.y - 15 - Math.random() * 20,
          x: debris.x + (Math.random() - 0.5) * 20,
          alpha: 0,
          duration: 400 + Math.random() * 300,
          onComplete: () => debris.destroy()
        });
      }
    };

    spawnDebris();

    const shakeEarthquake = () => {
      scene.tweens.chain({
        targets: zoneContainer,
        tweens: [
          { x: hitPosition.x - 5, y: hitPosition.y - 3, duration: 40 },
          { x: hitPosition.x + 5, y: hitPosition.y + 3, duration: 40 },
          { x: hitPosition.x - 3, y: hitPosition.y + 4, duration: 40 },
          { x: hitPosition.x + 4, y: hitPosition.y - 4, duration: 40 },
          { x: hitPosition.x, y: hitPosition.y, duration: 40 }
        ]
      });
    };

    shakeEarthquake();

    const tickInterval = 500;
    let tickCount = 0;
    const maxTicks = Math.floor(duration / tickInterval);

    const timer = scene.time.addEvent({
      delay: tickInterval,
      repeat: maxTicks - 1,
      callback: () => {
        tickCount++;

        for (const creep of allCreeps) {
          if (!creep.getIsActive()) continue;
          const dist = Phaser.Math.Distance.Between(hitPosition.x, hitPosition.y, creep.x, creep.y);
          if (dist <= radius) {
            creep.takeDamage(damage, false, 'rockcannon');
          }
        }

        shakeEarthquake();
        spawnDebris();

        const intensity = 1 - (tickCount / maxTicks) * 0.3;
        drawEarthquakeZone(intensity);
      }
    });

    scene.time.delayedCall(duration, () => {
      timer.destroy();

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const debris = scene.add.graphics();
        debris.fillStyle(0x6b4423, 0.8);
        debris.fillCircle(0, 0, 3 + Math.random() * 3);
        debris.setPosition(hitPosition.x, hitPosition.y);
        debris.setDepth(16);

        scene.tweens.add({
          targets: debris,
          x: hitPosition.x + Math.cos(angle) * (radius * 0.5 + Math.random() * 20),
          y: hitPosition.y + Math.sin(angle) * (radius * 0.5 + Math.random() * 20) - 10,
          alpha: 0,
          duration: 400,
          onComplete: () => debris.destroy()
        });
      }

      scene.tweens.add({
        targets: zoneContainer,
        alpha: 0,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 400,
        onComplete: () => zoneContainer.destroy()
      });
    });

    return { triggered: true, abilityId: 'cannon_earthquake', message: 'EARTHQUAKE!' };
  }

  executeShrapnel(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { hitPosition, damage, allCreeps } = context;
    const count = params.count || 6;
    const damageMultiplier = params.damageMultiplier || 0.25;
    const shrapnelDamage = damage * damageMultiplier;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const range = 80;
      const endX = hitPosition.x + Math.cos(angle) * range;
      const endY = hitPosition.y + Math.sin(angle) * range;

      const shard = this.scene.add.graphics();
      shard.setPosition(hitPosition.x, hitPosition.y);
      shard.setDepth(20);
      shard.fillStyle(0x808080, 1);
      shard.fillTriangle(-3, 0, 3, 0, 0, -8);
      shard.rotation = angle + Math.PI / 2;

      this.scene.tweens.add({
        targets: shard,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 200,
        onComplete: () => shard.destroy()
      });

      for (const creep of allCreeps) {
        if (!creep.getIsActive()) continue;
        const dist = Phaser.Math.Distance.Between(endX, endY, creep.x, creep.y);
        if (dist <= 20) {
          creep.takeDamage(shrapnelDamage, false, 'rockcannon');
        }
      }
    }

    return { triggered: true, abilityId: 'cannon_shrapnel', message: 'SHRAPNEL!' };
  }

  executeCriticalStrike(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const damageMultiplier = params.damageMultiplier || 2.0;
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'CRIT HIT!', 0xff0000);

    return {
      triggered: true,
      abilityId: 'sniper_critical',
      extraDamage: context.damage * (damageMultiplier - 1),
      message: 'CRITICAL STRIKE!'
    };
  }

  executeArmorPierce(context: AbilityContext, _params: AbilityDefinition['effectParams']): AbilityResult {
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'PIERCE!', 0x00bfff);
    this.visuals.showArmorPierceTrail(context.tower.x, context.tower.y, context.hitPosition.x, context.hitPosition.y);

    return {
      triggered: true,
      abilityId: 'sniper_pierce',
      message: 'ARMOR PIERCE!'
    };
  }

  executeHeadshot(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, damage } = context;
    const hpThreshold = params.hpThreshold || 0.25;
    const damageMultiplier = params.damageMultiplier || 1.5;

    const healthPercent = target.getCurrentHealth() / target.getConfig().maxHealth;

    if (target.isBoss()) {
      this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'HEADSHOT!', 0xff6666);
      this.visuals.showFloatingText(target.x, target.y - 30, 'IMMUNE', 0xffaa00);

      return {
        triggered: true,
        abilityId: 'sniper_headshot',
        extraDamage: damage * (damageMultiplier - 1),
        message: 'HEADSHOT!'
      };
    }

    if (healthPercent <= hpThreshold) {
      this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, '💀 HEADSHOT!', 0xff0000);
      this.visuals.showSkullEffect(context.hitPosition.x, context.hitPosition.y);

      return {
        triggered: true,
        abilityId: 'sniper_headshot',
        extraDamage: target.getCurrentHealth() * 10,
        message: 'HEADSHOT!'
      };
    } else {
      this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'HEADSHOT!', 0xff6666);

      return {
        triggered: true,
        abilityId: 'sniper_headshot',
        extraDamage: damage * (damageMultiplier - 1),
        message: 'HEADSHOT!'
      };
    }
  }

  executeIceTrap(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target } = context;
    let duration = params.duration || 2000;

    if (target.isBoss()) {
      duration = Math.floor(duration * 0.3);
      this.visuals.showFloatingText(target.x, target.y - 30, 'RESISTED', 0xffaa00);
    }

    target.applyFreeze(duration);
    this.visuals.showIceBlockEffect(target.x, target.y, duration);

    return { triggered: true, abilityId: 'ice_trap', message: 'FROZEN!' };
  }

  executeFrostNova(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, allCreeps, tower } = context;
    const radius = params.radius || 80;

    const slowPercent = tower.getConfig().stats.slowPercent || 0.5;
    const slowDuration = tower.getConfig().stats.slowDuration || 2000;

    for (const creep of allCreeps) {
      if (!creep.getIsActive()) continue;
      const dist = Phaser.Math.Distance.Between(target.x, target.y, creep.x, creep.y);
      if (dist <= radius) {
        creep.applySlow(slowPercent, slowDuration);
      }
    }

    this.visuals.showFrostNovaEffect(target.x, target.y, radius);

    return { triggered: true, abilityId: 'ice_frostnova', message: 'FROST NOVA!' };
  }

  executeShatter(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, damage } = context;
    let damageMultiplier = params.damageMultiplier || 2.0;

    if (!target.isSlowed()) {
      return { triggered: false };
    }

    if (target.isBoss()) {
      damageMultiplier = 1.0 + (damageMultiplier - 1.0) * 0.5;
      this.visuals.showFloatingText(target.x, target.y - 30, 'RESISTED', 0xffaa00);
    }

    target.clearSlow();
    this.visuals.showShatterEffect(target.x, target.y);

    return {
      triggered: true,
      abilityId: 'ice_shatter',
      extraDamage: damage * (damageMultiplier - 1),
      message: 'SHATTER!'
    };
  }

  executePlagueSpread(context: AbilityContext, _params: AbilityDefinition['effectParams']): AbilityResult {
    const { target } = context;

    this.plagueMarkedTargets.add(target);
    this.visuals.showPlagueMarkEffect(target.x, target.y);

    return { triggered: true, abilityId: 'poison_plague', message: 'PLAGUE!' };
  }

  executeToxicExplosion(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, allCreeps } = context;
    const damage = params.damage || 40;
    const radius = params.radius || 60;

    if (target.getPoisonStackCount() < 3) {
      return { triggered: false };
    }

    for (const creep of allCreeps) {
      if (!creep.getIsActive() || creep === target) continue;
      const dist = Phaser.Math.Distance.Between(target.x, target.y, creep.x, creep.y);
      if (dist <= radius) {
        creep.takeDamage(damage, true, 'poison');
      }
    }

    this.visuals.showToxicExplosionEffect(target.x, target.y, radius);

    return { triggered: true, abilityId: 'poison_explosion', message: 'TOXIC EXPLOSION!' };
  }

  executeCorrosiveAcid(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target } = context;
    let armorReduction = params.armorReduction || 2;

    if (target.isBoss()) {
      armorReduction = Math.floor(armorReduction * 0.5);
      this.visuals.showFloatingText(target.x, target.y - 30, 'RESISTED', 0xffaa00);
    }

    target.applyArmorReduction(armorReduction);
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'CORRODE!', 0x9acd32);

    return { triggered: true, abilityId: 'poison_corrosive', message: 'CORRODE!' };
  }

  executeBulletStorm(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const count = params.count || 5;
    this.bulletStormCount = count;
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'BULLET STORM!', 0xffcc00);

    return { triggered: true, abilityId: 'rapid_bulletstorm', message: 'BULLET STORM!' };
  }

  executeRicochet(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, damage, allCreeps } = context;
    const bounceRange = params.bounceRange || 100;
    const bounceDamageMultiplier = params.bounceDamageMultiplier || 0.5;

    let nearestCreep: Creep | null = null;
    let nearestDist = Infinity;

    for (const creep of allCreeps) {
      if (!creep.getIsActive() || creep === target) continue;
      const dist = Phaser.Math.Distance.Between(target.x, target.y, creep.x, creep.y);
      if (dist <= bounceRange && dist < nearestDist) {
        nearestDist = dist;
        nearestCreep = creep;
      }
    }

    if (nearestCreep) {
      nearestCreep.takeDamage(damage * bounceDamageMultiplier, false, 'rapidfire');
      this.visuals.showRicochetEffect(target.x, target.y, nearestCreep.x, nearestCreep.y);
    }

    return { triggered: true, abilityId: 'rapid_ricochet', message: 'RICOCHET!' };
  }

  executeIncendiary(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target } = context;
    const burnDamage = params.burnDamage || 5;
    const burnDuration = params.burnDuration || 3000;

    target.applyBurn(burnDamage, burnDuration);
    this.visuals.showBurnEffect(target.x, target.y);

    return { triggered: true, abilityId: 'rapid_incendiary', message: 'BURN!' };
  }

  executeMultiShot(context: AbilityContext, _params: AbilityDefinition['effectParams']): AbilityResult {
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'MULTI-SHOT!', 0xffd700);
    return { triggered: true, abilityId: 'archer_multishot', message: 'MULTI-SHOT!' };
  }

  executePiercingArrow(context: AbilityContext, params: AbilityDefinition['effectParams']): AbilityResult {
    const { target, damage, allCreeps } = context;
    const count = params.count || 2;
    const damageMultiplier = params.damageMultiplier || 1.0;

    const angle = Math.atan2(target.y - context.tower.y, target.x - context.tower.x);

    let hitCount = 0;
    for (const creep of allCreeps) {
      if (!creep.getIsActive() || creep === target || hitCount >= count) continue;

      const creepAngle = Math.atan2(creep.y - context.tower.y, creep.x - context.tower.x);
      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(creepAngle - angle));

      if (angleDiff < 0.3) {
        const distFromTower = Phaser.Math.Distance.Between(context.tower.x, context.tower.y, creep.x, creep.y);
        const targetDist = Phaser.Math.Distance.Between(context.tower.x, context.tower.y, target.x, target.y);

        if (distFromTower > targetDist) {
          creep.takeDamage(damage * damageMultiplier, false, 'archer');
          hitCount++;
        }
      }
    }

    this.visuals.showPiercingTrailEffect(context.tower.x, context.tower.y, angle);

    return { triggered: true, abilityId: 'archer_piercing', message: 'PIERCE!' };
  }

  executeQuickDraw(context: AbilityContext, _params: AbilityDefinition['effectParams']): AbilityResult {
    this.quickDrawActive = true;
    this.visuals.showFloatingText(context.tower.x, context.tower.y - 40, 'QUICK DRAW!', 0xffd700);

    return { triggered: true, abilityId: 'archer_quickdraw', message: 'QUICK DRAW!' };
  }

  consumeBulletStorm(): boolean {
    if (this.bulletStormCount > 0) {
      this.bulletStormCount--;
      return true;
    }
    return false;
  }

  getBulletStormSpeedMultiplier(): number {
    return this.bulletStormCount > 0 ? 2.0 : 1.0;
  }

  consumeQuickDraw(): boolean {
    if (this.quickDrawActive) {
      this.quickDrawActive = false;
      return true;
    }
    return false;
  }

  onCreepDeath(creep: Creep, allCreeps: Creep[]): void {
    if (!this.plagueMarkedTargets.has(creep)) return;

    this.plagueMarkedTargets.delete(creep);

    const radius = 60;
    const poisonDamage = 8;
    const poisonDuration = 5000;

    for (const nearby of allCreeps) {
      if (!nearby.getIsActive() || nearby === creep) continue;
      const dist = Phaser.Math.Distance.Between(creep.x, creep.y, nearby.x, nearby.y);
      if (dist <= radius) {
        nearby.applyPoison(poisonDamage, poisonDuration);
      }
    }

    this.visuals.showPlagueCloudEffect(creep.x, creep.y, radius);
  }

  clearPlagueTargets(): void {
    this.plagueMarkedTargets.clear();
  }
}
