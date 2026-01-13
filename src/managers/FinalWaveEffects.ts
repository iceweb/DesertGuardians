import Phaser from 'phaser';

/**
 * FinalWaveEffects - Creates dramatic visual effects for the final wave
 * Includes animated light rays, vignette overlay, and boss spawn effects
 */
export class FinalWaveEffects {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private lightRays: Phaser.GameObjects.Graphics[] = [];
  private vignette!: Phaser.GameObjects.Graphics;
  private ambientParticles: Phaser.GameObjects.Graphics[] = [];
  private isActive: boolean = false;
  private rayRotationTween?: Phaser.Tweens.Tween;
  private rayPulseTween?: Phaser.Tweens.Tween;
  private particleTimers: Phaser.Time.TimerEvent[] = [];

  // Configuration
  private readonly NUM_RAYS = 12;
  private readonly RAY_LENGTH = 800;
  private readonly RAY_BASE_ALPHA = 0.15;
  private readonly RAY_COLOR = 0xFFD700; // Golden
  private readonly VIGNETTE_COLOR = 0x8B0000; // Dark red
  private readonly DEPTH = 450; // Above most things but below UI

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Start the final wave visual effects
   */
  startFinalWaveEffects(): void {
    if (this.isActive) return;
    this.isActive = true;

    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2;

    // Create container for all effects (fixed to camera)
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(this.DEPTH);
    this.container.setScrollFactor(0);

    // Create dramatic vignette overlay
    this.createVignette(camera.width, camera.height);

    // Create animated light rays
    this.createLightRays(centerX, centerY);

    // Start ambient particle effects
    this.startAmbientParticles(camera.width, camera.height);

    // Initial dramatic flash
    this.playDramaticFlash(0xFFD700, 0.4, 800);

    // Screen shake
    this.scene.cameras.main.shake(400, 0.008);

    console.log('FinalWaveEffects: Started final wave visual effects');
  }

  /**
   * Create vignette overlay around edges
   */
  private createVignette(width: number, height: number): void {
    this.vignette = this.scene.add.graphics();
    this.vignette.setScrollFactor(0);

    // Create radial gradient effect using multiple rectangles with decreasing alpha
    const layers = 8;
    for (let i = 0; i < layers; i++) {
      const alpha = 0.03 + (i / layers) * 0.12;
      const inset = i * 25;

      // Draw edge gradients
      // Top
      this.vignette.fillStyle(this.VIGNETTE_COLOR, alpha);
      this.vignette.fillRect(0, 0, width, 80 - inset);
      // Bottom
      this.vignette.fillRect(0, height - 80 + inset, width, 80 - inset);
      // Left
      this.vignette.fillRect(0, 0, 80 - inset, height);
      // Right
      this.vignette.fillRect(width - 80 + inset, 0, 80 - inset, height);
    }

    this.container.add(this.vignette);

    // Pulse the vignette
    this.scene.tweens.add({
      targets: this.vignette,
      alpha: { from: 1, to: 0.6 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create rotating light rays emanating from center
   */
  private createLightRays(centerX: number, centerY: number): void {
    // Create a container for the rays that we can rotate
    const rayContainer = this.scene.add.container(centerX, centerY);
    rayContainer.setScrollFactor(0);
    this.container.add(rayContainer);

    for (let i = 0; i < this.NUM_RAYS; i++) {
      const ray = this.scene.add.graphics();
      const angle = (i / this.NUM_RAYS) * Math.PI * 2;

      // Draw triangular ray with gradient effect
      this.drawLightRay(ray, angle, this.RAY_LENGTH);

      rayContainer.add(ray);
      this.lightRays.push(ray);
    }

    // Slow rotation animation
    this.rayRotationTween = this.scene.tweens.add({
      targets: rayContainer,
      angle: 360,
      duration: 60000, // Very slow rotation (1 minute per full rotation)
      repeat: -1,
      ease: 'Linear'
    });

    // Pulse the ray intensity
    this.rayPulseTween = this.scene.tweens.add({
      targets: this.lightRays,
      alpha: { from: 1, to: 0.5 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Draw a single light ray as a gradient triangle
   */
  private drawLightRay(graphics: Phaser.GameObjects.Graphics, angle: number, length: number): void {
    const spreadAngle = Math.PI / this.NUM_RAYS * 0.6; // Ray width
    const innerRadius = 100; // Start rays away from center

    // Calculate ray vertices
    const x1 = Math.cos(angle - spreadAngle) * innerRadius;
    const y1 = Math.sin(angle - spreadAngle) * innerRadius;
    const x2 = Math.cos(angle + spreadAngle) * innerRadius;
    const y2 = Math.sin(angle + spreadAngle) * innerRadius;

    // Draw with multiple layers for gradient effect
    for (let layer = 0; layer < 4; layer++) {
      const layerAlpha = this.RAY_BASE_ALPHA * (1 - layer * 0.2);
      const layerLength = length * (1 - layer * 0.15);
      const lx3 = Math.cos(angle) * layerLength;
      const ly3 = Math.sin(angle) * layerLength;

      graphics.fillStyle(this.RAY_COLOR, layerAlpha);
      graphics.beginPath();
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      graphics.lineTo(lx3, ly3);
      graphics.closePath();
      graphics.fillPath();
    }
  }

  /**
   * Start ambient floating particles
   */
  private startAmbientParticles(width: number, height: number): void {
    // Create floating ember particles
    const createParticle = () => {
      if (!this.isActive) return;

      const particle = this.scene.add.graphics();
      const startX = Math.random() * width;
      const startY = height + 20;

      // Random ember color (golden to red)
      const colors = [0xFFD700, 0xFFA500, 0xFF6347, 0xFF4500];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 4;

      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, size);
      particle.setPosition(startX, startY);
      particle.setScrollFactor(0);
      particle.setDepth(this.DEPTH + 1);

      this.ambientParticles.push(particle);

      // Animate particle floating up
      this.scene.tweens.add({
        targets: particle,
        x: startX + (Math.random() - 0.5) * 150,
        y: -50,
        alpha: 0,
        scale: 0.3,
        duration: 4000 + Math.random() * 3000,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy();
          const index = this.ambientParticles.indexOf(particle);
          if (index > -1) this.ambientParticles.splice(index, 1);
        }
      });
    };

    // Spawn particles periodically
    const timer = this.scene.time.addEvent({
      delay: 150,
      callback: createParticle,
      loop: true
    });
    this.particleTimers.push(timer);
  }

  /**
   * Play dramatic flash effect
   */
  private playDramaticFlash(color: number, intensity: number, duration: number): void {
    const camera = this.scene.cameras.main;
    const flash = this.scene.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      color,
      intensity
    );
    flash.setScrollFactor(0);
    flash.setDepth(this.DEPTH + 10);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Intensify effects when boss spawns
   */
  playBossSpawnEffect(): void {
    if (!this.isActive) return;

    console.log('FinalWaveEffects: Playing boss spawn effect');

    // Intense screen shake
    this.scene.cameras.main.shake(600, 0.02);

    // Red dramatic flash
    this.playDramaticFlash(0xFF0000, 0.6, 1000);

    // Intensify ray colors temporarily
    this.lightRays.forEach(ray => {
      ray.clear();
    });

    // Redraw rays in intense red
    this.lightRays.forEach((ray, i) => {
      const angle = (i / this.NUM_RAYS) * Math.PI * 2;
      ray.fillStyle(0xFF4444, this.RAY_BASE_ALPHA * 2);
      this.drawLightRayIntense(ray, angle, this.RAY_LENGTH * 1.3);
    });

    // Fade back to golden after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      if (!this.isActive) return;
      this.lightRays.forEach((ray, i) => {
        ray.clear();
        const angle = (i / this.NUM_RAYS) * Math.PI * 2;
        this.drawLightRay(ray, angle, this.RAY_LENGTH);
      });
    });

    // Create burst of particles from center
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    for (let i = 0; i < 30; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        if (!this.isActive) return;
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const particle = this.scene.add.graphics();
        particle.fillStyle(0xFF4444, 1);
        particle.fillCircle(0, 0, 4 + Math.random() * 4);
        particle.setPosition(
          centerX + Math.cos(angle) * distance,
          centerY + Math.sin(angle) * distance
        );
        particle.setScrollFactor(0);
        particle.setDepth(this.DEPTH + 5);

        this.scene.tweens.add({
          targets: particle,
          x: particle.x + Math.cos(angle) * 300,
          y: particle.y + Math.sin(angle) * 300,
          alpha: 0,
          scale: 0.2,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => particle.destroy()
        });
      });
    }

    // Show "THE DRAGON COMES!" text
    this.showBossArrivalText();
  }

  /**
   * Draw an intensified light ray (for boss spawn)
   */
  private drawLightRayIntense(graphics: Phaser.GameObjects.Graphics, angle: number, length: number): void {
    const spreadAngle = Math.PI / this.NUM_RAYS * 0.8;
    const innerRadius = 80;

    for (let layer = 0; layer < 5; layer++) {
      const layerAlpha = 0.25 * (1 - layer * 0.15);
      const layerLength = length * (1 - layer * 0.12);

      const x1 = Math.cos(angle - spreadAngle) * innerRadius;
      const y1 = Math.sin(angle - spreadAngle) * innerRadius;
      const x2 = Math.cos(angle + spreadAngle) * innerRadius;
      const y2 = Math.sin(angle + spreadAngle) * innerRadius;
      const x3 = Math.cos(angle) * layerLength;
      const y3 = Math.sin(angle) * layerLength;

      graphics.fillStyle(0xFF2222, layerAlpha);
      graphics.beginPath();
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      graphics.lineTo(x3, y3);
      graphics.closePath();
      graphics.fillPath();
    }
  }

  /**
   * Show dramatic text when boss arrives
   */
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
        align: 'center'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(this.DEPTH + 20);
    text.setAlpha(0);
    text.setScale(0.5);

    // Dramatic entrance
    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1.2,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Pulse
        this.scene.tweens.add({
          targets: text,
          scale: 1.1,
          duration: 300,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Fade out
            this.scene.tweens.add({
              targets: text,
              alpha: 0,
              y: text.y - 50,
              duration: 800,
              ease: 'Power2',
              onComplete: () => text.destroy()
            });
          }
        });
      }
    });
  }

  /**
   * Stop and clean up all effects
   */
  stopEffects(): void {
    if (!this.isActive) return;
    this.isActive = false;

    console.log('FinalWaveEffects: Stopping effects');

    // Stop tweens
    if (this.rayRotationTween) this.rayRotationTween.stop();
    if (this.rayPulseTween) this.rayPulseTween.stop();

    // Stop particle timers
    this.particleTimers.forEach(timer => timer.destroy());
    this.particleTimers = [];

    // Fade out and destroy container
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          this.container.destroy();
        }
      });
    }

    // Clean up ambient particles
    this.ambientParticles.forEach(p => p.destroy());
    this.ambientParticles = [];
    this.lightRays = [];
  }

  /**
   * Check if effects are currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.stopEffects();
  }
}
