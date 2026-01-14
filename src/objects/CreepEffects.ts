import Phaser from 'phaser';

export class CreepEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showPoisonDamage(x: number, y: number, damage: number): void {
    const text = this.scene.add
      .text(x, y - 40, `-${damage}`, {
        fontSize: '14px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  showBurnDamage(x: number, y: number, damage: number): void {
    const text = this.scene.add
      .text(x, y - 40, `-${damage}`, {
        fontSize: '14px',
        color: '#ff6600',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  showDispelEffect(x: number, y: number, sizeScale: number = 1.0): void {
    const scale = Math.max(1.0, sizeScale);

    const dispelText = this.scene.add
      .text(x, y - 50 * scale, 'DISPEL!', {
        fontSize: `${Math.floor(20 * scale)}px`,
        fontFamily: 'Arial Black',
        color: '#FFD700',
        stroke: '#8B4513',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(150);

    this.scene.tweens.add({
      targets: dispelText,
      y: dispelText.y - 40,
      alpha: 0,
      scale: 1.3,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => dispelText.destroy(),
    });

    for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
      const ring = this.scene.add.graphics();
      ring.setPosition(x, y);
      ring.lineStyle(5 - ringIndex, 0xffd700, 1);
      ring.strokeCircle(0, -5, 25 * scale);
      ring.setDepth(100);
      ring.setScale(0.3);

      this.scene.tweens.add({
        targets: ring,
        scale: 2.5 * scale,
        alpha: 0,
        duration: 600 + ringIndex * 150,
        delay: ringIndex * 100,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.setPosition(x, y - 5);
      particle.fillStyle(0xffd700, 1);
      particle.fillCircle(0, 0, 6 * scale);

      particle.fillStyle(0xffffff, 0.8);
      particle.fillCircle(0, 0, 3 * scale);
      particle.setDepth(100);

      const targetX = x + Math.cos(angle) * 60 * scale;
      const targetY = y - 5 + Math.sin(angle) * 45 * scale;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    const flash = this.scene.add.graphics();
    flash.setPosition(x, y - 5);
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(0, 0, 35 * scale);
    flash.fillStyle(0xffd700, 0.6);
    flash.fillCircle(0, 0, 45 * scale);
    flash.setDepth(99);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.graphics();
      const offsetX = (Math.random() - 0.5) * 40 * scale;
      sparkle.setPosition(x + offsetX, y);
      sparkle.fillStyle(0xffffaa, 1);
      sparkle.fillCircle(0, 0, 3);
      sparkle.setDepth(101);

      this.scene.tweens.add({
        targets: sparkle,
        y: y - 60 - Math.random() * 40,
        x: x + offsetX + (Math.random() - 0.5) * 30,
        alpha: 0,
        duration: 800 + Math.random() * 400,
        delay: Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  showDiggerPrepare(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const crack = this.scene.add.graphics();
      crack.setPosition(x, y + 10);
      crack.lineStyle(2, 0x5c4033, 0.8);
      crack.beginPath();
      crack.moveTo(0, 0);
      const length = 8 + Math.random() * 8;
      crack.lineTo(Math.cos(angle) * length, Math.sin(angle) * length * 0.6);
      crack.strokePath();
      crack.setDepth(24);
      crack.setScale(0.5);

      this.scene.tweens.add({
        targets: crack,
        scale: 1.2,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => crack.destroy(),
      });
    }

    for (let i = 0; i < 4; i++) {
      const dust = this.scene.add.graphics();
      dust.fillStyle(0xccbbaa, 0.6);
      dust.fillCircle(0, 0, 3 + Math.random() * 3);
      dust.setPosition(x + (Math.random() - 0.5) * 15, y + 10);
      dust.setDepth(25);

      this.scene.tweens.add({
        targets: dust,
        y: dust.y - 10,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => dust.destroy(),
      });
    }
  }

  showResurfaceStart(x: number, y: number): void {
    const bulge = this.scene.add.graphics();
    bulge.fillStyle(0x6b4423, 0.7);
    bulge.fillEllipse(0, 0, 20, 10);
    bulge.setPosition(x, y + 12);
    bulge.setDepth(24);
    bulge.setScale(0.5);

    this.scene.tweens.add({
      targets: bulge,
      scaleX: 1.5,
      scaleY: 1,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => bulge.destroy(),
    });

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.3;
      const crack = this.scene.add.graphics();
      crack.setPosition(x, y + 12);
      crack.lineStyle(2, 0x3d2817, 1);
      crack.beginPath();
      crack.moveTo(0, 0);
      const length = 12 + Math.random() * 10;
      crack.lineTo(Math.cos(angle) * length, Math.sin(angle) * length * 0.5);
      crack.strokePath();
      crack.setDepth(24);
      crack.setAlpha(0);

      this.scene.tweens.add({
        targets: crack,
        alpha: 1,
        duration: 150,
        delay: i * 50,
        onComplete: () => {
          this.scene.tweens.add({
            targets: crack,
            alpha: 0,
            duration: 300,
            delay: 200,
            onComplete: () => crack.destroy(),
          });
        },
      });
    }

    for (let i = 0; i < 6; i++) {
      const delay = Math.random() * 200;
      this.scene.time.delayedCall(delay, () => {
        const dirt = this.scene.add.graphics();
        dirt.fillStyle(0x8b4513, 0.7);
        dirt.fillCircle(0, 0, 2 + Math.random() * 3);
        dirt.setPosition(x + (Math.random() - 0.5) * 20, y + 12);
        dirt.setDepth(35);

        this.scene.tweens.add({
          targets: dirt,
          y: dirt.y - 20 - Math.random() * 15,
          x: dirt.x + (Math.random() - 0.5) * 15,
          alpha: 0,
          duration: 400,
          ease: 'Quad.easeOut',
          onComplete: () => dirt.destroy(),
        });
      });
    }
  }

  showBurrowEffect(x: number, y: number): void {
    const hole = this.scene.add.graphics();
    hole.fillStyle(0x3d2817, 0.9);
    hole.fillEllipse(0, 0, 35, 15);
    hole.setPosition(x, y + 12);
    hole.setDepth(24);
    hole.setScale(0.3);

    this.scene.tweens.add({
      targets: hole,
      scale: 1,
      duration: 200,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(300, () => {
          this.scene.tweens.add({
            targets: hole,
            alpha: 0,
            duration: 400,
            onComplete: () => hole.destroy(),
          });
        });
      },
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const delay = (i % 4) * 40;

      this.scene.time.delayedCall(delay, () => {
        const dirt = this.scene.add.graphics();
        dirt.fillStyle(0x8b4513, 0.9);
        dirt.fillCircle(0, 0, 3 + Math.random() * 4);
        dirt.setPosition(x, y + 10);
        dirt.setDepth(35);

        const throwDist = 20 + Math.random() * 20;
        const throwHeight = -20 - Math.random() * 15;

        this.scene.tweens.add({
          targets: dirt,
          x: x + Math.cos(angle) * throwDist,
          y: y + 10 + throwHeight,
          alpha: 0,
          scale: 0.5,
          duration: 350,
          ease: 'Quad.easeOut',
          onComplete: () => dirt.destroy(),
        });
      });
    }
  }

  showSurfaceEffect(x: number, y: number): void {
    const crack = this.scene.add.graphics();
    crack.lineStyle(3, 0x3d2817, 1);
    crack.beginPath();
    crack.moveTo(-15, 0);
    crack.lineTo(-8, -5);
    crack.lineTo(0, 0);
    crack.lineTo(8, -5);
    crack.lineTo(15, 0);
    crack.strokePath();
    crack.setPosition(x, y + 15);
    crack.setDepth(24);
    crack.setAlpha(0);

    this.scene.tweens.add({
      targets: crack,
      alpha: 1,
      duration: 100,
      onComplete: () => {
        this.scene.tweens.add({
          targets: crack,
          alpha: 0,
          duration: 500,
          delay: 200,
          onComplete: () => crack.destroy(),
        });
      },
    });

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dirt = this.scene.add.graphics();
      dirt.fillStyle(0x8b4513, 0.85);
      dirt.fillCircle(0, 0, 4 + Math.random() * 5);
      dirt.setPosition(x, y + 12);
      dirt.setDepth(36);

      const throwDist = 25 + Math.random() * 25;
      const throwHeight = -35 - Math.random() * 20;

      this.scene.tweens.add({
        targets: dirt,
        x: x + Math.cos(angle) * throwDist,
        y: y + 12 + throwHeight + Math.sin(angle) * 15,
        alpha: 0,
        scale: 1.3,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => dirt.destroy(),
      });
    }

    for (let side = -1; side <= 1; side += 2) {
      const claw = this.scene.add.graphics();
      claw.fillStyle(0x2f2f2f, 1);
      claw.beginPath();
      claw.moveTo(0, 0);
      claw.lineTo(-3, -10);
      claw.lineTo(0, -8);
      claw.lineTo(3, -10);
      claw.closePath();
      claw.fill();
      claw.setPosition(x + side * 10, y + 20);
      claw.setDepth(37);

      this.scene.tweens.add({
        targets: claw,
        y: y + 5,
        duration: 200,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.scene.tweens.add({
            targets: claw,
            alpha: 0,
            duration: 300,
            delay: 100,
            onComplete: () => claw.destroy(),
          });
        },
      });
    }
  }

  showGhostPhaseStart(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.setPosition(x, y);
      particle.fillStyle(0x9370db, 0.8);
      particle.fillCircle(0, 0, 5);
      particle.setDepth(100);

      const targetX = x + Math.cos(angle) * 45;
      const targetY = y + Math.sin(angle) * 35;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }

    const flash = this.scene.add.graphics();
    flash.setPosition(x, y - 5);
    flash.fillStyle(0xe6e6fa, 0.6);
    flash.fillCircle(0, 0, 30);
    flash.setDepth(99);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  showImmuneText(x: number, y: number): void {
    const shimmer = this.scene.add.graphics();
    shimmer.setPosition(x, y - 10);
    shimmer.fillStyle(0x9370db, 0.5);
    shimmer.fillCircle(0, 0, 15);
    shimmer.setDepth(100);

    this.scene.tweens.add({
      targets: shimmer,
      y: y - 25,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => shimmer.destroy(),
    });
  }

  showJumpDustCloud(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dust = this.scene.add.graphics();
      dust.fillStyle(0xdeb887, 0.7);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);
      dust.setPosition(x, y + 15);
      dust.setDepth(25);

      this.scene.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * 30,
        y: y + 15 + Math.sin(angle) * 15,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => dust.destroy(),
      });
    }
  }

  showShieldBlockEffect(x: number, y: number, shieldGraphics: Phaser.GameObjects.Graphics): void {
    this.scene.tweens.add({
      targets: shieldGraphics,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });

    for (let i = 0; i < 5; i++) {
      const spark = this.scene.add.graphics();
      spark.setPosition(x, y - 30);
      spark.fillStyle(0x00bfff, 1);
      spark.fillCircle(0, 0, 3);
      spark.setDepth(100);

      const angle = (Math.random() - 0.5) * Math.PI;
      const dist = 15 + Math.random() * 15;

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y - 30 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.5,
        duration: 250,
        onComplete: () => spark.destroy(),
      });
    }
  }

  showShieldBreakEffect(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fragment = this.scene.add.graphics();
      fragment.fillStyle(0x00bfff, 0.8);
      fragment.fillCircle(0, 0, 5);
      fragment.setPosition(x, y - 5);
      fragment.setDepth(100);

      this.scene.tweens.add({
        targets: fragment,
        x: x + Math.cos(angle) * 50,
        y: y - 5 + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        onComplete: () => fragment.destroy(),
      });
    }
  }

  showSpawnEffect(x: number, y: number, _babyCount: number): void {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const splat = this.scene.add.graphics();
      splat.fillStyle(0x228b22, 0.8);
      splat.fillCircle(0, 0, 6 + Math.random() * 6);
      splat.setPosition(x, y);
      splat.setDepth(35);

      this.scene.tweens.add({
        targets: splat,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => splat.destroy(),
      });
    }

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
      const egg = this.scene.add.graphics();
      egg.fillStyle(0x90ee90, 1);
      egg.fillCircle(0, 0, 4);
      egg.setPosition(x, y);
      egg.setDepth(36);

      this.scene.tweens.add({
        targets: egg,
        x: x + Math.cos(angle) * 35,
        y: y + Math.sin(angle) * 35 - 10,
        alpha: 0,
        scale: 0.5,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => egg.destroy(),
      });
    }
  }

  playDeathAnimation(target: Phaser.GameObjects.Container, onComplete: () => void): void {
    this.scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete,
    });
  }

  playJumpAnimation(
    target: Phaser.GameObjects.Container,
    targetX: number,
    targetY: number,
    duration: number,
    onComplete: () => void
  ): void {
    const startX = target.x;
    const startY = target.y;
    const arcHeight = 50;

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;

        target.x = startX + (targetX - startX) * t;

        const arc = Math.sin(t * Math.PI) * arcHeight;
        target.y = startY + (targetY - startY) * t - arc;
      },
      onComplete: () => {
        target.x = targetX;
        target.y = targetY;
        onComplete();
      },
    });
  }

  flashGraphics(graphics: Phaser.GameObjects.Graphics): void {
    graphics.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      graphics.setAlpha(1);
    });
  }
}
