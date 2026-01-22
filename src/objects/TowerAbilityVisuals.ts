import Phaser from 'phaser';
import type { AbilityDefinition } from './TowerAbilityDefinitions';

export class TowerAbilityVisuals {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showFloatingText(x: number, y: number, text: string, color: number): void {
    const colorStr = '#' + color.toString(16).padStart(6, '0');
    const textObj = this.scene.add
      .text(x, y, text, {
        fontSize: '16px',
        color: colorStr,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: textObj,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => textObj.destroy(),
    });
  }

  showExplosionEffect(x: number, y: number, color: number): void {
    const flash = this.scene.add.graphics();
    flash.setPosition(x, y);
    flash.setDepth(26);
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(0, 0, 12);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      onComplete: () => flash.destroy(),
    });

    const explosion = this.scene.add.graphics();
    explosion.setPosition(x, y);
    explosion.setDepth(25);
    explosion.fillStyle(color, 0.8);
    explosion.fillCircle(0, 0, 20);

    explosion.lineStyle(4, 0xffffff, 0.5);
    explosion.strokeCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => explosion.destroy(),
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const debris = this.scene.add.graphics();
      debris.setPosition(x, y);
      debris.setDepth(27);
      debris.fillStyle(color, 1);
      debris.fillCircle(0, 0, 2 + Math.random() * 3);

      const distance = 25 + Math.random() * 20;
      this.scene.tweens.add({
        targets: debris,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 10,
        alpha: 0,
        duration: 300 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => debris.destroy(),
      });
    }
  }

  showSkullEffect(x: number, y: number): void {
    const flash = this.scene.add.graphics();
    flash.setPosition(x, y - 20);
    flash.setDepth(99);
    flash.fillStyle(0xff0000, 0.5);
    flash.fillCircle(0, 0, 25);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    const skull = this.scene.add
      .text(x, y - 30, '💀', {
        fontSize: '36px',
      })
      .setOrigin(0.5)
      .setDepth(100);
    skull.setScale(0.5);

    this.scene.tweens.add({
      targets: skull,
      y: y - 70,
      alpha: 0,
      scale: 1.8,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => skull.destroy(),
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.setPosition(x, y - 30);
      particle.setDepth(98);
      particle.fillStyle(0xff0000, 0.8);
      particle.fillCircle(0, 0, 3);

      const distance = 30 + Math.random() * 20;
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y - 30 + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        onComplete: () => particle.destroy(),
      });
    }
  }

  /* eslint-disable max-lines-per-function */
  showIceBlockEffect(x: number, y: number, duration: number): void {
    const container = this.scene.add.container(x, y);
    container.setDepth(35);

    const iceBlock = this.scene.add.graphics();
    container.add(iceBlock);

    const sparkles = this.scene.add.graphics();
    container.add(sparkles);

    const drawIcePrison = (phase: number) => {
      iceBlock.clear();
      sparkles.clear();

      iceBlock.fillStyle(0x4a6a8a, 0.3);
      iceBlock.fillEllipse(0, 15, 40, 12);

      iceBlock.fillStyle(0x87ceeb, 0.5);
      iceBlock.beginPath();
      iceBlock.moveTo(-18, 10);
      iceBlock.lineTo(-22, -5);
      iceBlock.lineTo(-15, -25);
      iceBlock.lineTo(-5, -35);
      iceBlock.lineTo(8, -32);
      iceBlock.lineTo(18, -20);
      iceBlock.lineTo(22, -5);
      iceBlock.lineTo(18, 12);
      iceBlock.closePath();
      iceBlock.fillPath();

      iceBlock.fillStyle(0xb0e0e6, 0.6);
      iceBlock.beginPath();
      iceBlock.moveTo(-14, 8);
      iceBlock.lineTo(-17, -3);
      iceBlock.lineTo(-12, -20);
      iceBlock.lineTo(-3, -28);
      iceBlock.lineTo(6, -26);
      iceBlock.lineTo(14, -16);
      iceBlock.lineTo(17, -2);
      iceBlock.lineTo(14, 10);
      iceBlock.closePath();
      iceBlock.fillPath();

      iceBlock.lineStyle(1, 0xffffff, 0.4);
      iceBlock.lineBetween(-8, -20, 2, -8);
      iceBlock.lineBetween(2, -8, 10, -15);
      iceBlock.lineBetween(-5, -5, 5, 5);
      iceBlock.lineBetween(-12, -10, -5, -5);

      iceBlock.fillStyle(0xadd8e6, 0.7);

      iceBlock.beginPath();
      iceBlock.moveTo(-5, -35);
      iceBlock.lineTo(0, -50);
      iceBlock.lineTo(5, -35);
      iceBlock.closePath();
      iceBlock.fillPath();

      iceBlock.beginPath();
      iceBlock.moveTo(-22, -5);
      iceBlock.lineTo(-32, -12);
      iceBlock.lineTo(-20, -15);
      iceBlock.closePath();
      iceBlock.fillPath();

      iceBlock.beginPath();
      iceBlock.moveTo(22, -5);
      iceBlock.lineTo(30, -10);
      iceBlock.lineTo(20, -15);
      iceBlock.closePath();
      iceBlock.fillPath();

      iceBlock.lineStyle(2, 0xffffff, 0.6);
      iceBlock.beginPath();
      iceBlock.moveTo(-18, 10);
      iceBlock.lineTo(-22, -5);
      iceBlock.lineTo(-15, -25);
      iceBlock.lineTo(-5, -35);
      iceBlock.lineTo(0, -50);
      iceBlock.lineTo(8, -32);
      iceBlock.lineTo(18, -20);
      iceBlock.lineTo(22, -5);
      iceBlock.lineTo(18, 12);
      iceBlock.closePath();
      iceBlock.strokePath();

      const sparkleIntensity = (Math.sin(phase) + 1) * 0.5;
      sparkles.fillStyle(0xffffff, 0.6 + sparkleIntensity * 0.4);
      sparkles.fillCircle(-10, -25, 2 + sparkleIntensity);
      sparkles.fillCircle(8, -18, 1.5 + sparkleIntensity * 0.5);
      sparkles.fillCircle(-5, -10, 1 + sparkleIntensity * 0.5);
      sparkles.fillCircle(12, -8, 1.5 + sparkleIntensity * 0.5);
      sparkles.fillCircle(0, -40, 2 + sparkleIntensity);

      const particle1Angle = phase;
      const particle2Angle = phase + Math.PI * 0.7;
      const particle3Angle = phase + Math.PI * 1.4;
      sparkles.fillStyle(0xe0ffff, 0.5 + sparkleIntensity * 0.3);
      sparkles.fillCircle(Math.cos(particle1Angle) * 25, -15 + Math.sin(particle1Angle) * 10, 2);
      sparkles.fillCircle(Math.cos(particle2Angle) * 20, -20 + Math.sin(particle2Angle) * 8, 1.5);
      sparkles.fillCircle(Math.cos(particle3Angle) * 22, -10 + Math.sin(particle3Angle) * 12, 1);
    };

    drawIcePrison(0);

    let phase = 0;
    const sparkleTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: Math.floor((duration - 300) / 50),
      callback: () => {
        phase += 0.15;
        drawIcePrison(phase);
      },
    });

    this.scene.time.delayedCall(duration - 300, () => {
      sparkleTimer.destroy();

      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const shard = this.scene.add.graphics();
        shard.setPosition(x, y - 15);
        shard.setDepth(36);
        shard.fillStyle(0x87ceeb, 0.8);

        shard.beginPath();
        shard.moveTo(0, -8);
        shard.lineTo(4, 0);
        shard.lineTo(2, 8);
        shard.lineTo(-2, 6);
        shard.lineTo(-4, -2);
        shard.closePath();
        shard.fillPath();
        shard.rotation = angle;

        this.scene.tweens.add({
          targets: shard,
          x: x + Math.cos(angle) * 40,
          y: y - 15 + Math.sin(angle) * 30,
          alpha: 0,
          rotation: angle + Math.random() * 2,
          scale: 0.5,
          duration: 300,
          onComplete: () => shard.destroy(),
        });
      }

      this.scene.tweens.add({
        targets: container,
        alpha: 0,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        onComplete: () => container.destroy(),
      });
    });
  }

  showFrostNovaEffect(x: number, y: number, radius: number): void {
    const flash = this.scene.add.graphics();
    flash.setPosition(x, y);
    flash.setDepth(26);
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    const ring = this.scene.add.graphics();
    ring.setPosition(x, y);
    ring.setDepth(25);
    ring.lineStyle(6, 0xffffff, 0.9);
    ring.strokeCircle(0, 0, 20);
    ring.fillStyle(0x88ccff, 0.3);
    ring.fillCircle(0, 0, 20);

    this.scene.tweens.add({
      targets: ring,
      scaleX: radius / 20,
      scaleY: radius / 20,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });

    const innerRing = this.scene.add.graphics();
    innerRing.setPosition(x, y);
    innerRing.setDepth(25);
    innerRing.lineStyle(3, 0xadd8e6, 0.7);
    innerRing.strokeCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: innerRing,
      scaleX: (radius * 0.7) / 15,
      scaleY: (radius * 0.7) / 15,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => innerRing.destroy(),
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const crystal = this.scene.add.graphics();
      crystal.setPosition(x, y);
      crystal.setDepth(26);

      crystal.fillStyle(0xffffff, 0.9);
      crystal.beginPath();
      crystal.moveTo(0, -6);
      crystal.lineTo(3, 0);
      crystal.lineTo(0, 6);
      crystal.lineTo(-3, 0);
      crystal.closePath();
      crystal.fillPath();
      crystal.rotation = angle;

      this.scene.tweens.add({
        targets: crystal,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        alpha: 0,
        rotation: angle + 1,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => crystal.destroy(),
      });
    }

    const frostGround = this.scene.add.graphics();
    frostGround.setPosition(x, y);
    frostGround.setDepth(14);
    frostGround.fillStyle(0x87ceeb, 0.3);
    frostGround.fillCircle(0, 0, 10);

    this.scene.tweens.add({
      targets: frostGround,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 800,
      onComplete: () => frostGround.destroy(),
    });
  }

  showShatterEffect(x: number, y: number): void {
    const flash = this.scene.add.graphics();
    flash.setPosition(x, y);
    flash.setDepth(36);
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(0, 0, 20);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const shard = this.scene.add.graphics();
      shard.setPosition(x, y);
      shard.setDepth(35);

      const shardSize = 0.8 + Math.random() * 0.6;

      shard.fillStyle(0x87ceeb, 0.9);
      shard.beginPath();
      shard.moveTo(0, -10 * shardSize);
      shard.lineTo(4 * shardSize, -3 * shardSize);
      shard.lineTo(3 * shardSize, 8 * shardSize);
      shard.lineTo(-3 * shardSize, 8 * shardSize);
      shard.lineTo(-4 * shardSize, -3 * shardSize);
      shard.closePath();
      shard.fillPath();

      shard.lineStyle(1, 0xffffff, 0.7);
      shard.lineBetween(-2 * shardSize, -8 * shardSize, 0, -10 * shardSize);

      shard.rotation = angle;

      const distance = 50 + Math.random() * 30;
      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        rotation: angle + (Math.random() - 0.5) * 3,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => shard.destroy(),
      });
    }

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const frost = this.scene.add.graphics();
      frost.setPosition(x, y);
      frost.setDepth(34);
      frost.fillStyle(0xffffff, 0.7);
      frost.fillCircle(0, 0, 1.5 + Math.random() * 2);

      const distance = 30 + Math.random() * 40;
      this.scene.tweens.add({
        targets: frost,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 10,
        alpha: 0,
        duration: 350 + Math.random() * 150,
        ease: 'Quad.easeOut',
        onComplete: () => frost.destroy(),
      });
    }

    const mist = this.scene.add.graphics();
    mist.setPosition(x, y);
    mist.setDepth(33);
    mist.fillStyle(0xadd8e6, 0.4);
    mist.fillCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: mist,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 500,
      onComplete: () => mist.destroy(),
    });
  }

  showPlagueMarkEffect(x: number, y: number): void {
    const container = this.scene.add.container(x, y - 30);
    container.setDepth(35);

    const outerGlow = this.scene.add.graphics();
    outerGlow.fillStyle(0x00ff00, 0.3);
    outerGlow.fillCircle(0, 0, 15);
    container.add(outerGlow);

    const mark = this.scene.add.graphics();
    mark.fillStyle(0x228b22, 0.7);
    mark.fillCircle(0, 0, 10);
    mark.lineStyle(2, 0x00ff00, 0.9);
    mark.strokeCircle(0, 0, 10);
    container.add(mark);

    const inner = this.scene.add.graphics();
    inner.fillStyle(0x00ff00, 0.9);

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      inner.fillCircle(Math.cos(angle) * 4, Math.sin(angle) * 4, 3);
    }
    inner.fillCircle(0, 0, 2);
    container.add(inner);

    for (let i = 0; i < 3; i++) {
      const delay = i * 100;
      this.scene.time.delayedCall(delay, () => {
        const drip = this.scene.add.graphics();
        drip.setPosition(x + (Math.random() - 0.5) * 10, y - 25);
        drip.setDepth(34);
        drip.fillStyle(0x00ff00, 0.7);
        drip.fillCircle(0, 0, 2);

        this.scene.tweens.add({
          targets: drip,
          y: drip.y + 20,
          alpha: 0,
          scale: 0.5,
          duration: 400,
          onComplete: () => drip.destroy(),
        });
      });
    }

    this.scene.tweens.add({
      targets: container,
      scale: 1.3,
      alpha: 0.4,
      duration: 400,
      yoyo: true,
      repeat: 4,
      onComplete: () => container.destroy(),
    });
  }

  showToxicExplosionEffect(x: number, y: number, radius: number): void {
    const burst = this.scene.add.graphics();
    burst.setPosition(x, y);
    burst.setDepth(25);
    burst.fillStyle(0x00ff00, 0.7);
    burst.fillCircle(0, 0, radius * 0.3);
    burst.fillStyle(0x32cd32, 0.5);
    burst.fillCircle(0, 0, radius * 0.5);

    this.scene.tweens.add({
      targets: burst,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy(),
    });

    const ring = this.scene.add.graphics();
    ring.setPosition(x, y);
    ring.setDepth(24);
    ring.lineStyle(4, 0x228b22, 0.8);
    ring.strokeCircle(0, 0, 20);

    this.scene.tweens.add({
      targets: ring,
      scaleX: radius / 20,
      scaleY: radius / 20,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const droplet = this.scene.add.graphics();
      droplet.setPosition(x, y);
      droplet.setDepth(26);

      const size = 4 + Math.random() * 4;
      droplet.fillStyle(0x00ff00, 0.9);
      droplet.fillEllipse(0, size * 0.3, size * 0.8, size * 0.6);
      droplet.fillTriangle(0, -size, -size * 0.5, size * 0.2, size * 0.5, size * 0.2);

      droplet.fillStyle(0x88ff88, 0.6);
      droplet.fillCircle(-size * 0.15, -size * 0.1, size * 0.2);

      droplet.rotation = angle + Math.PI / 2;

      const distance = radius * (0.8 + Math.random() * 0.3);
      this.scene.tweens.add({
        targets: droplet,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        duration: 400 + Math.random() * 100,
        ease: 'Quad.easeOut',
        onComplete: () => droplet.destroy(),
      });
    }

    for (let i = 0; i < 6; i++) {
      const delay = i * 50;
      this.scene.time.delayedCall(delay, () => {
        const fume = this.scene.add.graphics();
        const offsetX = (Math.random() - 0.5) * radius * 0.6;
        const offsetY = (Math.random() - 0.5) * radius * 0.6;
        fume.setPosition(x + offsetX, y + offsetY);
        fume.setDepth(23);
        fume.fillStyle(0x32cd32, 0.4);
        const fumeSize = 8 + Math.random() * 8;
        fume.fillCircle(0, 0, fumeSize);

        this.scene.tweens.add({
          targets: fume,
          y: fume.y - 30 - Math.random() * 20,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 600 + Math.random() * 200,
          onComplete: () => fume.destroy(),
        });
      });
    }
  }

  showRicochetEffect(fromX: number, fromY: number, toX: number, toY: number): void {
    const sparkBurst = this.scene.add.graphics();
    sparkBurst.setPosition(fromX, fromY);
    sparkBurst.setDepth(26);
    sparkBurst.fillStyle(0xffffff, 1);
    sparkBurst.fillCircle(0, 0, 8);
    sparkBurst.fillStyle(0xffd700, 0.8);
    sparkBurst.fillCircle(0, 0, 12);

    this.scene.tweens.add({
      targets: sparkBurst,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 150,
      onComplete: () => sparkBurst.destroy(),
    });

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spark = this.scene.add.graphics();
      spark.setPosition(fromX, fromY);
      spark.setDepth(27);
      spark.fillStyle(0xffcc00, 1);
      spark.fillCircle(0, 0, 2 + Math.random() * 2);

      const distance = 15 + Math.random() * 15;
      this.scene.tweens.add({
        targets: spark,
        x: fromX + Math.cos(angle) * distance,
        y: fromY + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: 200,
        onComplete: () => spark.destroy(),
      });
    }

    const trail = this.scene.add.graphics();
    trail.setPosition(fromX, fromY);
    trail.setDepth(20);

    trail.lineStyle(6, 0xffa500, 0.4);
    trail.lineBetween(0, 0, toX - fromX, toY - fromY);

    trail.lineStyle(2, 0xffcc00, 0.9);
    trail.lineBetween(0, 0, toX - fromX, toY - fromY);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 250,
      onComplete: () => trail.destroy(),
    });

    const impactFlash = this.scene.add.graphics();
    impactFlash.setPosition(toX, toY);
    impactFlash.setDepth(25);
    impactFlash.fillStyle(0xffd700, 0.7);
    impactFlash.fillCircle(0, 0, 10);

    this.scene.tweens.add({
      targets: impactFlash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      delay: 100,
      onComplete: () => impactFlash.destroy(),
    });
  }

  showBurnEffect(x: number, y: number): void {
    const flameColors = [0xff3300, 0xff6600, 0xffaa00, 0xffcc00];

    for (let i = 0; i < 8; i++) {
      const delay = i * 30;
      this.scene.time.delayedCall(delay, () => {
        const flame = this.scene.add.graphics();
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 10;
        flame.setPosition(x + offsetX, y + offsetY);
        flame.setDepth(35);

        const color = flameColors[Math.floor(Math.random() * flameColors.length)];
        const size = 5 + Math.random() * 6;

        flame.fillStyle(color, 0.9);
        flame.fillEllipse(0, size * 0.2, size * 0.7, size * 0.6);
        flame.fillTriangle(0, -size * 1.2, -size * 0.5, 0, size * 0.5, 0);

        flame.fillStyle(0xffff00, 0.7);
        flame.fillCircle(0, size * 0.1, size * 0.3);

        this.scene.tweens.add({
          targets: flame,
          y: flame.y - 25 - Math.random() * 15,
          x: flame.x + (Math.random() - 0.5) * 10,
          alpha: 0,
          scaleX: 0.3,
          scaleY: 0.5,
          duration: 350 + Math.random() * 200,
          onComplete: () => flame.destroy(),
        });
      });
    }

    const smoke = this.scene.add.graphics();
    smoke.setPosition(x, y - 10);
    smoke.setDepth(34);
    smoke.fillStyle(0x444444, 0.4);
    smoke.fillCircle(0, 0, 8);

    this.scene.tweens.add({
      targets: smoke,
      y: smoke.y - 30,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 600,
      onComplete: () => smoke.destroy(),
    });
  }

  showPlagueCloudEffect(x: number, y: number, radius: number): void {
    const burst = this.scene.add.graphics();
    burst.setPosition(x, y);
    burst.setDepth(25);
    burst.fillStyle(0x228b22, 0.6);
    burst.fillCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: burst,
      scaleX: radius / 15,
      scaleY: radius / 15,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy(),
    });

    for (let layer = 0; layer < 3; layer++) {
      const cloud = this.scene.add.graphics();
      cloud.setPosition(x, y);
      cloud.setDepth(24 - layer);
      const layerColor = [0x00ff00, 0x32cd32, 0x228b22][layer];
      cloud.fillStyle(layerColor, 0.3 - layer * 0.05);
      cloud.fillCircle(0, 0, 20 + layer * 5);

      this.scene.tweens.add({
        targets: cloud,
        scaleX: (radius * (1 - layer * 0.1)) / 20,
        scaleY: (radius * (1 - layer * 0.1)) / 20,
        alpha: 0,
        duration: 600 + layer * 100,
        delay: layer * 50,
        ease: 'Quad.easeOut',
        onComplete: () => cloud.destroy(),
      });
    }

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.setPosition(x, y);
      particle.setDepth(26);
      particle.fillStyle(0x00ff00, 0.7);
      particle.fillCircle(0, 0, 3 + Math.random() * 3);

      const distance = radius * (0.5 + Math.random() * 0.5);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance + (Math.random() - 0.5) * 20,
        y: y + Math.sin(angle) * distance + (Math.random() - 0.5) * 20 - 15,
        alpha: 0,
        duration: 500 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    const skullMark = this.scene.add.graphics();
    skullMark.setPosition(x, y);
    skullMark.setDepth(27);
    skullMark.fillStyle(0x88ff88, 0.8);
    skullMark.fillCircle(0, -5, 6);
    skullMark.fillRect(-6, 0, 12, 6);

    this.scene.tweens.add({
      targets: skullMark,
      y: y - 20,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => skullMark.destroy(),
    });
  }

  showPiercingTrailEffect(x: number, y: number, angle: number): void {
    const length = 300;

    const outerTrail = this.scene.add.graphics();
    outerTrail.setPosition(x, y);
    outerTrail.setDepth(18);
    outerTrail.lineStyle(8, 0x4169e1, 0.4);
    outerTrail.lineBetween(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);

    this.scene.tweens.add({
      targets: outerTrail,
      alpha: 0,
      duration: 400,
      onComplete: () => outerTrail.destroy(),
    });

    const trail = this.scene.add.graphics();
    trail.setPosition(x, y);
    trail.setDepth(19);
    trail.lineStyle(4, 0x6495ed, 0.9);
    trail.lineBetween(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 350,
      onComplete: () => trail.destroy(),
    });

    const coreLine = this.scene.add.graphics();
    coreLine.setPosition(x, y);
    coreLine.setDepth(20);
    coreLine.lineStyle(2, 0xffffff, 0.8);
    coreLine.lineBetween(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);

    this.scene.tweens.add({
      targets: coreLine,
      alpha: 0,
      duration: 300,
      onComplete: () => coreLine.destroy(),
    });

    for (let i = 0; i < 6; i++) {
      const progress = (i + 1) / 7;
      const particleX = x + Math.cos(angle) * length * progress;
      const particleY = y + Math.sin(angle) * length * progress;

      const particle = this.scene.add.graphics();
      particle.setPosition(particleX, particleY);
      particle.setDepth(21);
      particle.fillStyle(0x87ceeb, 0.8);
      particle.fillCircle(0, 0, 4);

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.3,
        duration: 250 + i * 30,
        delay: i * 30,
        onComplete: () => particle.destroy(),
      });
    }
  }

  showArmorPierceTrail(towerX: number, towerY: number, hitX: number, hitY: number): void {
    const dx = hitX - towerX;
    const dy = hitY - towerY;

    const outerGlow = this.scene.add.graphics();
    outerGlow.setPosition(towerX, towerY);
    outerGlow.setDepth(18);
    outerGlow.lineStyle(8, 0x00bfff, 0.3);
    outerGlow.lineBetween(0, 0, dx, dy);

    this.scene.tweens.add({
      targets: outerGlow,
      alpha: 0,
      duration: 350,
      onComplete: () => outerGlow.destroy(),
    });

    const trail = this.scene.add.graphics();
    trail.setPosition(towerX, towerY);
    trail.setDepth(19);
    trail.lineStyle(3, 0x00bfff, 0.9);
    trail.lineBetween(0, 0, dx, dy);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy(),
    });

    const core = this.scene.add.graphics();
    core.setPosition(towerX, towerY);
    core.setDepth(20);
    core.lineStyle(1, 0xffffff, 0.8);
    core.lineBetween(0, 0, dx, dy);

    this.scene.tweens.add({
      targets: core,
      alpha: 0,
      duration: 250,
      onComplete: () => core.destroy(),
    });

    const impact = this.scene.add.graphics();
    impact.setPosition(hitX, hitY);
    impact.setDepth(25);
    impact.fillStyle(0x00bfff, 0.8);
    impact.fillCircle(0, 0, 12);
    impact.fillStyle(0xffffff, 0.9);
    impact.fillCircle(0, 0, 6);

    this.scene.tweens.add({
      targets: impact,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 200,
      onComplete: () => impact.destroy(),
    });

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spark = this.scene.add.graphics();
      spark.setPosition(hitX, hitY);
      spark.setDepth(26);
      spark.fillStyle(0x88ccff, 1);
      spark.fillCircle(0, 0, 2 + Math.random() * 2);

      const distance = 15 + Math.random() * 15;
      this.scene.tweens.add({
        targets: spark,
        x: hitX + Math.cos(angle) * distance,
        y: hitY + Math.sin(angle) * distance,
        alpha: 0,
        duration: 200 + Math.random() * 100,
        onComplete: () => spark.destroy(),
      });
    }
  }

  drawAbilityIcon(g: Phaser.GameObjects.Graphics, ability: AbilityDefinition): void {
    const primary = ability.icon.primaryColor;
    const secondary = ability.icon.secondaryColor;
    const size = 20;

    g.fillStyle(primary, 0.3);
    g.fillCircle(0, 0, size + 5);

    g.fillStyle(primary, 0.9);
    g.fillCircle(0, 0, size);

    g.fillStyle(secondary, 0.7);
    g.fillCircle(-size * 0.25, -size * 0.25, size * 0.4);

    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-size * 0.35, -size * 0.35, size * 0.2);
  }

  showDeepFreezeEffect(x: number, y: number, duration: number): void {
    const container = this.scene.add.container(x, y);
    container.setDepth(35);

    // Blue cracked overlay
    const overlay = this.scene.add.graphics();
    container.add(overlay);

    const drawBrittleOverlay = (phase: number) => {
      overlay.clear();

      // Blue tint
      overlay.fillStyle(0x4488ff, 0.25);
      overlay.fillCircle(0, -5, 20);

      // Cracks
      overlay.lineStyle(2, 0x4488ff, 0.8);
      overlay.lineBetween(-12, -18, -5, -8);
      overlay.lineBetween(-5, -8, -10, 2);
      overlay.lineBetween(-5, -8, 5, -5);
      overlay.lineBetween(5, -5, 12, -15);
      overlay.lineBetween(5, -5, 8, 5);

      // Shimmer sparkles
      const shimmer = (Math.sin(phase) + 1) * 0.5;
      overlay.fillStyle(0x88ccff, 0.5 + shimmer * 0.4);
      overlay.fillCircle(-8, -12, 2 + shimmer);
      overlay.fillCircle(8, -10, 2 + shimmer);
      overlay.fillCircle(0, -5, 1.5 + shimmer * 0.5);
    };

    drawBrittleOverlay(0);

    let phase = 0;
    const timer = this.scene.time.addEvent({
      delay: 50,
      repeat: Math.floor((duration - 200) / 50),
      callback: () => {
        phase += 0.15;
        drawBrittleOverlay(phase);
      },
    });

    // Fade out at end
    this.scene.time.delayedCall(duration - 200, () => {
      timer.destroy();
      this.scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 200,
        onComplete: () => container.destroy(),
      });
    });
  }

  showKnockbackEffect(x: number, y: number): void {
    // Dust cloud impact
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dust = this.scene.add.graphics();
      dust.setPosition(x, y);
      dust.setDepth(34);
      dust.fillStyle(0x8b7355, 0.7);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);

      const distance = 15 + Math.random() * 15;
      this.scene.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 5,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 300 + Math.random() * 100,
        onComplete: () => dust.destroy(),
      });
    }

    // Impact ring
    const ring = this.scene.add.graphics();
    ring.setPosition(x, y);
    ring.setDepth(33);
    ring.lineStyle(3, 0x8b4513, 0.6);
    ring.strokeCircle(0, 0, 10);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 250,
      onComplete: () => ring.destroy(),
    });
  }

  showEchoEffect(towerX: number, towerY: number): void {
    // Ghostly purple ring effect
    const ring = this.scene.add.graphics();
    ring.setPosition(towerX, towerY - 20);
    ring.setDepth(50);
    ring.lineStyle(3, 0x9966ff, 0.8);
    ring.strokeCircle(0, 0, 15);
    ring.fillStyle(0xcc99ff, 0.3);
    ring.fillCircle(0, 0, 15);

    this.scene.tweens.add({
      targets: ring,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy(),
    });

    // Floating text
    this.showFloatingText(towerX, towerY - 50, 'ECHO!', 0x9966ff);
  }
}
