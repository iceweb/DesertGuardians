import Phaser from 'phaser';
import { drawAuraTower, drawAuraRangeCircle } from './towers/AuraTowerGraphics';

export class AuraAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;

  private baseGraphics: Phaser.GameObjects.Graphics;
  private glowGraphics: Phaser.GameObjects.Graphics;
  private particleGraphics: Phaser.GameObjects.Graphics;

  private glowPhase: number = 0;
  private particleAngle: number = 0;
  private pulsePhase: number = 0;

  private orbY: number = 0;
  private orbSize: number = 0;

  private readonly scale: number = 0.5;

  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;

    this.baseGraphics = scene.add.graphics();
    this.glowGraphics = scene.add.graphics();
    this.particleGraphics = scene.add.graphics();

    this.container.add([this.baseGraphics, this.glowGraphics, this.particleGraphics]);

    this.updateOrbPosition();

    this.drawBase();
  }

  private updateOrbPosition(): void {
    const pillarHeight = (35 + this.level * 8) * this.scale;
    const platY = -pillarHeight - 5 * this.scale;
    this.orbY = platY - (12 + this.level * 3) * this.scale;
    this.orbSize = (10 + this.level * 3) * this.scale;
  }

  setLevel(level: number): void {
    this.level = level;
    this.updateOrbPosition();
    this.drawBase();
  }

  update(delta: number): void {
    const dt = delta / 1000;

    this.glowPhase += dt * 2.5;
    if (this.glowPhase > Math.PI * 2) {
      this.glowPhase -= Math.PI * 2;
    }

    this.particleAngle += dt * 1.5;
    if (this.particleAngle > Math.PI * 2) {
      this.particleAngle -= Math.PI * 2;
    }

    this.pulsePhase += dt * 0.8;
    if (this.pulsePhase > 1) {
      this.pulsePhase = 0;
    }

    this.drawGlow();
    this.drawParticles();
  }

  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();
    drawAuraTower(g, this.level);
  }

  private drawGlow(): void {
    const g = this.glowGraphics;
    g.clear();

    const glowIntensity = (Math.sin(this.glowPhase) + 1) * 0.5;
    const baseAlpha = 0.3 + glowIntensity * 0.4;

    const outerSize = this.orbSize + (8 + glowIntensity * 6) * this.scale;
    g.fillStyle(0xff2222, baseAlpha * 0.3);
    g.fillCircle(0, this.orbY, outerSize);

    const middleSize = this.orbSize + (4 + glowIntensity * 3) * this.scale;
    g.fillStyle(0xff4444, baseAlpha * 0.5);
    g.fillCircle(0, this.orbY, middleSize);

    const innerSize = this.orbSize - 2 * this.scale + glowIntensity * 2 * this.scale;
    g.fillStyle(0xff6666, baseAlpha * 0.8);
    g.fillCircle(0, this.orbY, innerSize);

    g.fillStyle(0xffaaaa, baseAlpha);
    g.fillCircle(0, this.orbY, this.orbSize * 0.4);

    g.fillStyle(0xffffff, baseAlpha * 0.6);
    g.fillCircle(-this.orbSize * 0.25, this.orbY - this.orbSize * 0.25, this.orbSize * 0.2);

    if (this.level >= 2) {
      const pulseRadius = this.orbSize + this.pulsePhase * 30 * this.scale;
      const pulseAlpha = (1 - this.pulsePhase) * 0.4;
      g.lineStyle(2, 0xff4444, pulseAlpha);
      g.strokeCircle(0, this.orbY, pulseRadius);
    }
  }

  private drawParticles(): void {
    const g = this.particleGraphics;
    g.clear();

    const particleCount = 3 + this.level;
    const orbitRadius = this.orbSize + (10 + this.level * 2) * this.scale;

    for (let i = 0; i < particleCount; i++) {
      const angle = this.particleAngle + (i * Math.PI * 2) / particleCount;
      const x = Math.cos(angle) * orbitRadius;
      const y = this.orbY + Math.sin(angle) * orbitRadius * 0.5;

      g.fillStyle(0xff6666, 0.3);
      g.fillCircle(x, y, 6 * this.scale);

      g.fillStyle(0xff4444, 0.8);
      g.fillCircle(x, y, 3 * this.scale);

      g.fillStyle(0xffaaaa, 1);
      g.fillCircle(x, y, 1.5 * this.scale);
    }

    if (this.level >= 3) {
      const outerRadius = orbitRadius + 12 * this.scale;
      for (let i = 0; i < 4; i++) {
        const angle = -this.particleAngle * 0.7 + (i * Math.PI * 2) / 4;
        const x = Math.cos(angle) * outerRadius;
        const y = this.orbY + Math.sin(angle) * outerRadius * 0.4;

        g.fillStyle(0xffd700, 0.4);
        g.fillCircle(x, y, 4 * this.scale);
        g.fillStyle(0xffee88, 0.8);
        g.fillCircle(x, y, 2 * this.scale);
      }
    }
  }

  setTarget(_targetX: number, _targetY: number, _towerX: number, _towerY: number): void {

  }

  clearTarget(): void {

  }

  onFire(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }

  getProjectileSpawnOffset(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }

  onKill(): void {

  }

  destroy(): void {
    this.baseGraphics.destroy();
    this.glowGraphics.destroy();
    this.particleGraphics.destroy();
  }
}

export { drawAuraRangeCircle };
