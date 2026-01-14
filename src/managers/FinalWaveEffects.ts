import Phaser from 'phaser';
import { Creep } from '../objects/Creep';

export class FinalWaveEffects {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isActive: boolean = false;

  private darknessOverlay!: Phaser.GameObjects.Graphics;
  private redTintOverlay!: Phaser.GameObjects.Graphics;
  private cloudLayer!: Phaser.GameObjects.Container;
  private lightRaysContainer!: Phaser.GameObjects.Container;

  private bossSpotlight!: Phaser.GameObjects.Graphics;
  private bossSpotlightGlow!: Phaser.GameObjects.Graphics;
  private trackedBoss: Creep | null = null;

  private ashParticles: Phaser.GameObjects.Graphics[] = [];
  private emberParticles: Phaser.GameObjects.Graphics[] = [];
  private particleTimers: Phaser.Time.TimerEvent[] = [];

  private lightRays: {
    graphics: Phaser.GameObjects.Graphics;
    baseX: number;
    angle: number;
    speed: number;
  }[] = [];

  private activeTweens: Phaser.Tweens.Tween[] = [];

  public getCreeps?: () => Creep[];

  private readonly DEPTH_DARKNESS = 445;
  private readonly DEPTH_CLOUDS = 446;
  private readonly DEPTH_RAYS = 447;
  private readonly DEPTH_SPOTLIGHT = 448;
  private readonly DEPTH_PARTICLES = 449;
  private readonly DEPTH_OVERLAY = 450;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  startFinalWaveEffects(): void {
    if (this.isActive) return;
    this.isActive = true;

    const camera = this.scene.cameras.main;
    const width = camera.width;
    const height = camera.height;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(this.DEPTH_DARKNESS);
    this.container.setScrollFactor(0);

    this.createDarknessOverlay(width, height);

    this.createRedTintOverlay(width, height);

    this.createCloudLayer(width, height);

    this.createLightRays(width, height);

    this.createBossSpotlight();

    this.startAshParticles(width, height);
    this.startEmberParticles(width, height);

    this.playTransitionIn();
  }

  private createDarknessOverlay(width: number, height: number): void {
    this.darknessOverlay = this.scene.add.graphics();
    this.darknessOverlay.setScrollFactor(0);
    this.darknessOverlay.setDepth(this.DEPTH_DARKNESS);

    this.darknessOverlay.fillStyle(0x000000, 0.35);
    this.darknessOverlay.fillRect(0, 0, width, height);

    this.container.add(this.darknessOverlay);
  }

  private createRedTintOverlay(width: number, height: number): void {
    this.redTintOverlay = this.scene.add.graphics();
    this.redTintOverlay.setScrollFactor(0);
    this.redTintOverlay.setDepth(this.DEPTH_OVERLAY);

    for (let i = 0; i < 6; i++) {
      const alpha = 0.08 - i * 0.012;
      this.redTintOverlay.fillStyle(0x8b0000, alpha);
      this.redTintOverlay.fillRect(0, i * 30, width, 30);
    }

    for (let i = 0; i < 4; i++) {
      const alpha = 0.06 - i * 0.012;
      this.redTintOverlay.fillStyle(0x8b0000, alpha);
      this.redTintOverlay.fillRect(0, height - (i + 1) * 30, width, 30);
    }

    for (let i = 0; i < 4; i++) {
      const alpha = 0.05 - i * 0.01;
      this.redTintOverlay.fillStyle(0x8b0000, alpha);
      this.redTintOverlay.fillRect(i * 25, 0, 25, height);
      this.redTintOverlay.fillRect(width - (i + 1) * 25, 0, 25, height);
    }

    this.container.add(this.redTintOverlay);

    const pulseTween = this.scene.tweens.add({
      targets: this.redTintOverlay,
      alpha: { from: 1, to: 0.6 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.activeTweens.push(pulseTween);
  }

  private createCloudLayer(width: number, _height: number): void {
    this.cloudLayer = this.scene.add.container(0, 0);
    this.cloudLayer.setScrollFactor(0);
    this.cloudLayer.setDepth(this.DEPTH_CLOUDS);
    this.container.add(this.cloudLayer);

    const numClouds = 8;
    for (let i = 0; i < numClouds; i++) {
      const cloud = this.createCloud(
        Math.random() * (width + 200) - 100,
        Math.random() * 180 - 50,
        80 + Math.random() * 120
      );
      this.cloudLayer.add(cloud);

      const driftTween = this.scene.tweens.add({
        targets: cloud,
        x: cloud.x + (Math.random() - 0.5) * 200,
        duration: 15000 + Math.random() * 10000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.activeTweens.push(driftTween);

      const alphaTween = this.scene.tweens.add({
        targets: cloud,
        alpha: 0.3 + Math.random() * 0.2,
        duration: 4000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.activeTweens.push(alphaTween);
    }
  }

  private createCloud(x: number, y: number, size: number): Phaser.GameObjects.Graphics {
    const cloud = this.scene.add.graphics();
    cloud.setPosition(x, y);

    const cloudColor = 0x2a1a1a;
    const numPuffs = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numPuffs; i++) {
      const puffX = (Math.random() - 0.5) * size;
      const puffY = (Math.random() - 0.5) * size * 0.4;
      const puffRadius = size * 0.3 + Math.random() * size * 0.3;
      const alpha = 0.4 + Math.random() * 0.3;

      cloud.fillStyle(cloudColor, alpha);
      cloud.fillCircle(puffX, puffY, puffRadius);
    }

    for (let i = 0; i < 2; i++) {
      const hx = (Math.random() - 0.5) * size * 0.5;
      const hy = (Math.random() - 0.3) * size * 0.3;
      cloud.fillStyle(0x4a2020, 0.3);
      cloud.fillCircle(hx, hy, size * 0.15);
    }

    cloud.setAlpha(0.5);
    return cloud;
  }

  private createLightRays(width: number, height: number): void {
    this.lightRaysContainer = this.scene.add.container(0, 0);
    this.lightRaysContainer.setScrollFactor(0);
    this.lightRaysContainer.setDepth(this.DEPTH_RAYS);
    this.container.add(this.lightRaysContainer);

    const numRays = 5;
    for (let i = 0; i < numRays; i++) {
      const rayX = 80 + (width - 160) * (i / (numRays - 1)) + (Math.random() - 0.5) * 60;
      const ray = this.createLightRay(rayX, height);
      this.lightRaysContainer.add(ray.graphics);
      this.lightRays.push(ray);
    }

    this.lightRays.forEach((ray, index) => {
      const swayTween = this.scene.tweens.add({
        targets: ray,
        angle: ray.angle + (Math.random() - 0.5) * 10,
        duration: 8000 + index * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          this.updateLightRay(ray, this.scene.cameras.main.height);
        },
      });
      this.activeTweens.push(swayTween);

      const intensityTween = this.scene.tweens.add({
        targets: ray.graphics,
        alpha: 0.15 + Math.random() * 0.15,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.activeTweens.push(intensityTween);
    });
  }

  private createLightRay(
    x: number,
    height: number
  ): { graphics: Phaser.GameObjects.Graphics; baseX: number; angle: number; speed: number } {
    const graphics = this.scene.add.graphics();
    const angle = -5 + Math.random() * 10;
    const ray = {
      graphics,
      baseX: x,
      angle,
      speed: 0.5 + Math.random() * 0.5,
    };

    this.updateLightRay(ray, height);
    graphics.setAlpha(0.2 + Math.random() * 0.1);

    return ray;
  }

  private updateLightRay(
    ray: { graphics: Phaser.GameObjects.Graphics; baseX: number; angle: number; speed: number },
    height: number
  ): void {
    const g = ray.graphics;
    g.clear();

    const topWidth = 30 + Math.random() * 20;
    const bottomWidth = 80 + Math.random() * 60;
    const angleRad = (ray.angle * Math.PI) / 180;
    const xOffset = Math.tan(angleRad) * height;

    const layers = 4;
    for (let i = layers - 1; i >= 0; i--) {
      const layerAlpha = 0.03 + (i / layers) * 0.08;
      const widthMult = 1 + (layers - i) * 0.3;

      const color = i === 0 ? 0xffaa44 : 0xff8833;
      g.fillStyle(color, layerAlpha);

      g.beginPath();
      g.moveTo(ray.baseX - (topWidth * widthMult) / 2, -20);
      g.lineTo(ray.baseX + (topWidth * widthMult) / 2, -20);
      g.lineTo(ray.baseX + xOffset + (bottomWidth * widthMult) / 2, height + 20);
      g.lineTo(ray.baseX + xOffset - (bottomWidth * widthMult) / 2, height + 20);
      g.closePath();
      g.fillPath();
    }

    const numMotes = 3;
    for (let i = 0; i < numMotes; i++) {
      const moteY = Math.random() * height;
      const moteX = ray.baseX + (xOffset * moteY) / height + (Math.random() - 0.5) * 40;
      g.fillStyle(0xffdd88, 0.4 + Math.random() * 0.3);
      g.fillCircle(moteX, moteY, 1 + Math.random() * 2);
    }
  }

  private createBossSpotlight(): void {
    this.bossSpotlightGlow = this.scene.add.graphics();
    this.bossSpotlightGlow.setScrollFactor(0);
    this.bossSpotlightGlow.setDepth(this.DEPTH_SPOTLIGHT);
    this.bossSpotlightGlow.setVisible(false);
    this.container.add(this.bossSpotlightGlow);

    this.bossSpotlight = this.scene.add.graphics();
    this.bossSpotlight.setScrollFactor(0);
    this.bossSpotlight.setDepth(this.DEPTH_SPOTLIGHT + 1);
    this.bossSpotlight.setVisible(false);
    this.container.add(this.bossSpotlight);
  }

  private drawBossSpotlight(x: number, y: number): void {
    const camera = this.scene.cameras.main;

    const screenX = x - camera.scrollX;
    const screenY = y - camera.scrollY;

    this.bossSpotlightGlow.clear();

    for (let i = 5; i >= 0; i--) {
      const radius = 80 + i * 25;
      const alpha = 0.02 - i * 0.003;
      this.bossSpotlightGlow.fillStyle(0xff4400, alpha);
      this.bossSpotlightGlow.fillCircle(screenX, screenY, radius);
    }

    this.bossSpotlight.clear();

    const coneTopY = -50;
    const coneWidth = 60;
    const spotRadius = 70;

    for (let i = 3; i >= 0; i--) {
      const widthMult = 1 + i * 0.4;
      const alpha = 0.03 + i * 0.02;
      this.bossSpotlight.fillStyle(0xffaa44, alpha);
      this.bossSpotlight.beginPath();
      this.bossSpotlight.moveTo(screenX - (coneWidth * widthMult) / 2, coneTopY);
      this.bossSpotlight.lineTo(screenX + (coneWidth * widthMult) / 2, coneTopY);
      this.bossSpotlight.lineTo(screenX + spotRadius * widthMult, screenY);
      this.bossSpotlight.lineTo(screenX - spotRadius * widthMult, screenY);
      this.bossSpotlight.closePath();
      this.bossSpotlight.fillPath();
    }

    for (let i = 3; i >= 0; i--) {
      const radius = 50 + i * 15;
      const alpha = 0.04 - i * 0.008;
      this.bossSpotlight.fillStyle(0xffcc66, alpha);
      this.bossSpotlight.fillEllipse(screenX, screenY + 10, radius * 2, radius);
    }
  }

  private startAshParticles(width: number, height: number): void {
    const createAsh = () => {
      if (!this.isActive) return;

      const ash = this.scene.add.graphics();
      const startX = Math.random() * (width + 100) - 50;
      const startY = -20;
      const size = 1.5 + Math.random() * 2.5;

      ash.fillStyle(0x555555, 0.4 + Math.random() * 0.3);
      ash.fillCircle(0, 0, size);
      ash.setPosition(startX, startY);
      ash.setScrollFactor(0);
      ash.setDepth(this.DEPTH_PARTICLES);

      this.ashParticles.push(ash);

      const driftX = (Math.random() - 0.5) * 100;
      this.scene.tweens.add({
        targets: ash,
        x: startX + driftX,
        y: height + 30,
        alpha: 0,
        rotation: Math.random() * Math.PI * 2,
        duration: 6000 + Math.random() * 4000,
        ease: 'Linear',
        onComplete: () => {
          ash.destroy();
          const index = this.ashParticles.indexOf(ash);
          if (index > -1) this.ashParticles.splice(index, 1);
        },
      });
    };

    const timer = this.scene.time.addEvent({
      delay: 100,
      callback: createAsh,
      loop: true,
    });
    this.particleTimers.push(timer);
  }

  private startEmberParticles(width: number, height: number): void {
    const createEmber = () => {
      if (!this.isActive) return;

      const ember = this.scene.add.graphics();
      const startX = Math.random() * width;
      const startY = height + 20;

      const colors = [0xff6600, 0xff4400, 0xff2200, 0xffaa00];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 3;

      ember.fillStyle(color, 0.3);
      ember.fillCircle(0, 0, size * 2);
      ember.fillStyle(color, 0.7);
      ember.fillCircle(0, 0, size);
      ember.fillStyle(0xffff88, 0.9);
      ember.fillCircle(0, 0, size * 0.4);

      ember.setPosition(startX, startY);
      ember.setScrollFactor(0);
      ember.setDepth(this.DEPTH_PARTICLES + 1);

      this.emberParticles.push(ember);

      const driftX = (Math.random() - 0.5) * 150;

      this.scene.tweens.add({
        targets: ember,
        x: startX + driftX,
        y: -50,
        duration: 5000 + Math.random() * 4000,
        ease: 'Sine.easeOut',
        onComplete: () => {
          ember.destroy();
          const index = this.emberParticles.indexOf(ember);
          if (index > -1) this.emberParticles.splice(index, 1);
        },
      });

      this.scene.tweens.add({
        targets: ember,
        alpha: { from: 1, to: 0.3 },
        scale: { from: 1, to: 0.5 },
        duration: 200 + Math.random() * 200,
        yoyo: true,
        repeat: 10,
        ease: 'Sine.easeInOut',
      });
    };

    const timer = this.scene.time.addEvent({
      delay: 200,
      callback: createEmber,
      loop: true,
    });
    this.particleTimers.push(timer);
  }

  private playTransitionIn(): void {
    const camera = this.scene.cameras.main;

    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 2000,
      ease: 'Cubic.easeIn',
    });

    const flash = this.scene.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      0xff4400,
      0.3
    );
    flash.setScrollFactor(0);
    flash.setDepth(this.DEPTH_OVERLAY + 10);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    camera.shake(500, 0.01);
  }

  playBossSpawnEffect(): void {
    if (!this.isActive) return;

    const camera = this.scene.cameras.main;

    camera.shake(800, 0.025);

    const flash = this.scene.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      0xff0000,
      0.5
    );
    flash.setScrollFactor(0);
    flash.setDepth(this.DEPTH_OVERLAY + 10);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    this.scene.tweens.add({
      targets: this.darknessOverlay,
      alpha: 1.5,
      duration: 500,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.bossSpotlight.setVisible(true);
    this.bossSpotlightGlow.setVisible(true);
    this.bossSpotlight.setAlpha(0);
    this.bossSpotlightGlow.setAlpha(0);

    this.scene.tweens.add({
      targets: [this.bossSpotlight, this.bossSpotlightGlow],
      alpha: 1,
      duration: 1000,
      ease: 'Cubic.easeOut',
    });

    for (let i = 0; i < 40; i++) {
      this.scene.time.delayedCall(i * 25, () => {
        if (!this.isActive) return;

        const ember = this.scene.add.graphics();
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 50;

        ember.fillStyle(0xff4400, 1);
        ember.fillCircle(0, 0, 3 + Math.random() * 4);
        ember.fillStyle(0xffff88, 0.8);
        ember.fillCircle(0, 0, 2);

        ember.setPosition(
          centerX + Math.cos(angle) * distance,
          centerY + Math.sin(angle) * distance
        );
        ember.setScrollFactor(0);
        ember.setDepth(this.DEPTH_PARTICLES + 5);

        this.scene.tweens.add({
          targets: ember,
          x: ember.x + Math.cos(angle) * 300,
          y: ember.y + Math.sin(angle) * 300,
          alpha: 0,
          scale: 0.2,
          duration: 1200,
          ease: 'Power2',
          onComplete: () => ember.destroy(),
        });
      });
    }

    this.showBossArrivalText();
  }

  private showBossArrivalText(): void {
    const camera = this.scene.cameras.main;

    const text = this.scene.add.text(
      camera.width / 2,
      camera.height / 2 - 100,
      '⚔️ THE ELDER DRAGON AWAKENS ⚔️',
      {
        fontFamily: 'Arial Black',
        fontSize: '42px',
        color: '#FF4444',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(this.DEPTH_OVERLAY + 20);
    text.setAlpha(0);
    text.setScale(0.5);

    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1.2,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: text,
          scale: 1.1,
          duration: 300,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.scene.tweens.add({
              targets: text,
              alpha: 0,
              y: text.y - 50,
              duration: 800,
              ease: 'Power2',
              onComplete: () => text.destroy(),
            });
          },
        });
      },
    });
  }

  update(): void {
    if (!this.isActive) return;

    if (this.getCreeps && this.bossSpotlight.visible) {
      const creeps = this.getCreeps();
      const boss = creeps.find((c) => c.isBoss() && c.active);

      if (boss) {
        this.trackedBoss = boss;
        this.drawBossSpotlight(boss.x, boss.y);
      } else if (this.trackedBoss) {
        this.trackedBoss = null;
        this.scene.tweens.add({
          targets: [this.bossSpotlight, this.bossSpotlightGlow],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.bossSpotlight.setVisible(false);
            this.bossSpotlightGlow.setVisible(false);
          },
        });
      }
    }
  }

  stopEffects(): void {
    if (!this.isActive) return;
    this.isActive = false;

    this.activeTweens.forEach((tween) => {
      if (tween && tween.isPlaying()) {
        tween.stop();
      }
    });
    this.activeTweens = [];

    this.particleTimers.forEach((timer) => timer.destroy());
    this.particleTimers = [];

    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          this.container.destroy();
        },
      });
    }

    this.ashParticles.forEach((p) => p.destroy());
    this.ashParticles = [];
    this.emberParticles.forEach((p) => p.destroy());
    this.emberParticles = [];

    this.lightRays = [];
    this.trackedBoss = null;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.stopEffects();
  }
}
