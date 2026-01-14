import Phaser from 'phaser';

export abstract class AnimatorBase {
  protected container: Phaser.GameObjects.Container;
  protected level: number;
  protected scene: Phaser.Scene;

  protected baseGraphics: Phaser.GameObjects.Graphics;
  protected rotatingContainer: Phaser.GameObjects.Container;

  protected currentAngle: number = 0;
  protected targetAngle: number = 0;
  protected hasTarget: boolean = false;
  protected rotationSpeed: number = 5.0;

  protected isCheeringActive: boolean = false;
  protected cheerTimer: number = 0;
  protected cheerArmAngle: number = 0;
  protected cheerDuration: number = 0.8;
  protected cheerFrequency: number = 15;

  protected abstract getRotatingElementY(level: number): number;

  protected abstract getAngleOffset(): number;

  protected abstract drawBase(): void;

  protected abstract drawRotatingElements(): void;

  abstract getProjectileOffset(): { x: number; y: number };

  protected abstract updateAnimation(dt: number): boolean;

  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.scene = scene;
    this.container = container;
    this.level = level;

    this.baseGraphics = scene.add.graphics();

    this.rotatingContainer = scene.add.container(0, this.getRotatingElementY(level));

    this.container.add([this.baseGraphics, this.rotatingContainer]);
  }

  protected initializeGraphics(): void {
    this.drawBase();
    this.drawRotatingElements();
  }

  setLevel(level: number): void {
    this.level = level;
    this.rotatingContainer.setY(this.getRotatingElementY(level));
    this.drawBase();
    this.drawRotatingElements();
  }

  update(delta: number): void {
    const dt = delta / 1000;

    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.currentAngle);

      if (Math.abs(angleDiff) > 0.01) {
        this.currentAngle +=
          Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.rotationSpeed * dt);
        this.currentAngle = Phaser.Math.Angle.Wrap(this.currentAngle);
      }
    }

    let needsRedraw = false;
    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * this.cheerFrequency) * 0.5 + 0.5;

      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      needsRedraw = true;
    }

    const subclassNeedsRedraw = this.updateAnimation(dt);

    if (needsRedraw || subclassNeedsRedraw) {
      this.drawRotatingElements();
    }

    this.rotatingContainer.setRotation(this.currentAngle);
  }

  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    const rotatingElementWorldY = towerY + this.getRotatingElementY(this.level);
    this.targetAngle =
      Phaser.Math.Angle.Between(towerX, rotatingElementWorldY, targetX, targetY) +
      this.getAngleOffset();
  }

  clearTarget(): void {
    this.hasTarget = false;
  }

  onFire(): { x: number; y: number } {
    return this.getProjectileOffset();
  }

  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = this.cheerDuration;
  }

  protected calculateRotatedOffset(localX: number, localY: number): { x: number; y: number } {
    const cos = Math.cos(this.currentAngle);
    const sin = Math.sin(this.currentAngle);

    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;

    return {
      x: rotatedX,
      y: rotatedY + this.getRotatingElementY(this.level),
    };
  }

  destroy(): void {
    this.baseGraphics.destroy();
    this.rotatingContainer.destroy();
  }
}
