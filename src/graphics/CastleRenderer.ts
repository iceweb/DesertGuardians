import Phaser from 'phaser';
import { GAME_CONFIG } from '../data';
import { THEME } from '../data/ThemeConfig';

/**
 * Handles rendering and animation of the castle (goal) in the game
 */
export class CastleRenderer {
  private scene: Phaser.Scene;
  private castlePosition: Phaser.Math.Vector2 | null = null;

  private castleContainer: Phaser.GameObjects.Container | null = null;
  private castleDamageGraphics: Phaser.GameObjects.Graphics | null = null;
  private flagGraphics: Phaser.GameObjects.Graphics | null = null;
  private flagPhase: number = 0;
  private currentDamageState: number = 0;
  private destroyedCastleGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getCastlePosition(): Phaser.Math.Vector2 | null {
    return this.castlePosition;
  }

  update(delta: number): void {
    if (this.flagGraphics && this.castlePosition) {
      this.flagPhase += (delta / 1000) * 1.5;
      if (this.flagPhase > Math.PI * 2) this.flagPhase -= Math.PI * 2;
      this.drawFlag(this.castlePosition.x, this.castlePosition.y);
    }
  }

  updateCastleDamage(currentHP: number): void {
    const maxHP = GAME_CONFIG.MAX_CASTLE_HP;
    const hpPercent = currentHP / maxHP;

    let newState = 0;
    if (hpPercent <= 0.25) {
      newState = 2;
    } else if (hpPercent <= 0.5) {
      newState = 1;
    }

    if (newState !== this.currentDamageState && this.castlePosition) {
      this.currentDamageState = newState;
      this.drawCastleDamage(this.castlePosition.x, this.castlePosition.y);
    }
  }

  playCastleDestructionAnimation(onComplete?: () => void): void {
    if (!this.castlePosition || !this.castleContainer) {
      onComplete?.();
      return;
    }

    const cx = this.castlePosition.x - 20;
    const cy = this.castlePosition.y - 80;

    if (this.flagGraphics) {
      this.flagGraphics.setVisible(false);
    }

    // Create explosion particles
    const particles: Phaser.GameObjects.Graphics[] = [];
    const numParticles = 30;

    for (let i = 0; i < numParticles; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(20);

      const colors = [0x9a8a7a, 0xa0522d, 0x8b6914, 0x4a3a2a, 0x3a3020];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.fillStyle(color, 1);
      const size = 5 + Math.random() * 15;
      particle.fillRect(-size / 2, -size / 2, size, size);

      particle.setPosition(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 80);
      particles.push(particle);

      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const targetX = particle.x + Math.cos(angle) * distance;
      const targetY = particle.y + Math.sin(angle) * distance + 100;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        rotation: Math.random() * 10 - 5,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Shake effect
    this.scene.tweens.add({
      targets: this.castleContainer,
      x: { from: -5, to: 5 },
      duration: 50,
      repeat: 10,
      yoyo: true,
    });

    // Fade and show destroyed version
    this.scene.time.delayedCall(500, () => {
      this.scene.tweens.add({
        targets: this.castleContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.drawDestroyedCastle();
          this.scene.cameras.main.shake(500, 0.02);

          this.scene.time.delayedCall(800, () => {
            onComplete?.();
          });
        },
      });
    });
  }

  showDestroyedCastle(): void {
    if (!this.castlePosition || !this.castleContainer) return;

    this.castleContainer.setAlpha(0);
    if (this.flagGraphics) {
      this.flagGraphics.setVisible(false);
    }

    this.drawDestroyedCastle();
  }

  drawCastle(x: number, y: number): void {
    this.castlePosition = new Phaser.Math.Vector2(x, y);
    this.castleContainer = this.scene.add.container(0, 0);
    this.castleContainer.setDepth(15);

    const castle = this.scene.add.graphics();
    this.castleContainer.add(castle);

    const cx = x - 20;
    const cy = y - 80;

    // Shadow
    castle.fillStyle(THEME.colors.warmShadow, 0.35);
    castle.fillEllipse(cx, cy + 95, 160, 40);

    this.drawStairs(castle, cx, cy);
    this.drawMainBuilding(castle, cx, cy);
    this.drawLeftTower(castle, cx, cy);
    this.drawRightTower(castle, cx, cy);
    this.drawDoorway(castle, cx, cy);
    this.drawDecorations(castle, cx, cy);

    // Flag pole
    castle.fillStyle(0x3a3a3a, 1);
    castle.fillRect(cx - 57, cy - 175, 4, 50);

    // Flag graphics
    this.flagGraphics = this.scene.add.graphics();
    this.flagGraphics.setDepth(16);
    this.castleContainer.add(this.flagGraphics);
    this.drawFlag(cx, cy);

    // Damage overlay
    this.castleDamageGraphics = this.scene.add.graphics();
    this.castleDamageGraphics.setDepth(17);
    this.castleContainer.add(this.castleDamageGraphics);
  }

  private drawStairs(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    const stairBaseY = cy + 160;
    const stairTopY = cy + 60;
    const stairHeight = stairBaseY - stairTopY;
    const numSteps = 10;
    const stepHeight = stairHeight / numSteps;

    const baseWidthHalf = 100;
    const topWidthHalf = 40;

    for (let i = 0; i < numSteps; i++) {
      const stepY = stairBaseY - i * stepHeight;
      const nextY = stepY - stepHeight;

      const progress = i / numSteps;
      const widthHalf = baseWidthHalf - (baseWidthHalf - topWidthHalf) * progress;
      const nextWidthHalf = baseWidthHalf - (baseWidthHalf - topWidthHalf) * ((i + 1) / numSteps);

      // Step top
      const topColor = 0xd8ccb8 + i * 0x010101;
      castle.fillStyle(Math.min(topColor, 0xe8dcd0), 1);
      castle.beginPath();
      castle.moveTo(cx - widthHalf, stepY - stepHeight + 2);
      castle.lineTo(cx + widthHalf, stepY - stepHeight + 2);
      castle.lineTo(cx + nextWidthHalf, nextY + 2);
      castle.lineTo(cx - nextWidthHalf, nextY + 2);
      castle.closePath();
      castle.fillPath();

      // Step front
      castle.fillStyle(0xc4b8a4, 1);
      castle.fillRect(cx - widthHalf, stepY - stepHeight + 2, widthHalf * 2, stepHeight - 2);

      // Step edge
      castle.lineStyle(1, 0xa89888, 1);
      castle.lineBetween(
        cx - widthHalf,
        stepY - stepHeight + 2,
        cx + widthHalf,
        stepY - stepHeight + 2
      );

      castle.lineStyle(1, 0xe8dcd0, 0.6);
      castle.lineBetween(
        cx - widthHalf + 2,
        stepY - stepHeight + 3,
        cx + widthHalf - 2,
        stepY - stepHeight + 3
      );
    }

    // Side rails
    castle.fillStyle(0xa89878, 1);
    castle.beginPath();
    castle.moveTo(cx - baseWidthHalf, stairBaseY);
    castle.lineTo(cx - baseWidthHalf - 8, stairBaseY);
    castle.lineTo(cx - topWidthHalf - 8, stairTopY);
    castle.lineTo(cx - topWidthHalf, stairTopY);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(0x988868, 1);
    castle.beginPath();
    castle.moveTo(cx + baseWidthHalf, stairBaseY);
    castle.lineTo(cx + baseWidthHalf + 8, stairBaseY);
    castle.lineTo(cx + topWidthHalf + 8, stairTopY);
    castle.lineTo(cx + topWidthHalf, stairTopY);
    castle.closePath();
    castle.fillPath();
  }

  private drawMainBuilding(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    // Platform base
    castle.fillStyle(0x9a8a70, 1);
    castle.beginPath();
    castle.moveTo(cx - 75, cy + 85);
    castle.lineTo(cx + 75, cy + 85);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx - 65, cy + 70);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(0xb8a890, 1);
    castle.beginPath();
    castle.moveTo(cx - 65, cy + 70);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx + 75, cy + 60);
    castle.lineTo(cx - 75, cy + 60);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(0x7a6a50, 1);
    castle.beginPath();
    castle.moveTo(cx + 75, cy + 85);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx + 85, cy + 60);
    castle.lineTo(cx + 75, cy + 75);
    castle.closePath();
    castle.fillPath();

    // Main wall
    castle.fillStyle(0xe8dcc8, 1);
    castle.beginPath();
    castle.moveTo(cx - 60, cy + 60);
    castle.lineTo(cx - 60, cy - 35);
    castle.lineTo(cx + 60, cy - 35);
    castle.lineTo(cx + 60, cy + 60);
    castle.closePath();
    castle.fillPath();

    // Shading
    castle.fillStyle(THEME.colors.warmHighlight, 0.18);
    castle.fillRect(cx - 58, cy - 32, 116, 14);
    castle.fillStyle(THEME.colors.warmShadow, 0.18);
    castle.fillRect(cx - 60, cy + 40, 120, 18);

    // Right wall (3D)
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx + 60, cy + 60);
    castle.lineTo(cx + 60, cy - 35);
    castle.lineTo(cx + 75, cy - 25);
    castle.lineTo(cx + 75, cy + 70);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(THEME.colors.warmHighlight, 0.15);
    castle.fillRect(cx + 60, cy - 30, 12, 18);
    castle.fillStyle(THEME.colors.warmShadow, 0.2);
    castle.fillRect(cx + 62, cy + 35, 12, 18);

    // Brick pattern
    castle.lineStyle(1, 0xc8bca8, 0.5);
    for (let row = 0; row < 5; row++) {
      const rowY = cy + 50 - row * 18;
      castle.lineBetween(cx - 58, rowY, cx + 58, rowY);

      const offset = (row % 2) * 20;
      for (let col = 0; col < 6; col++) {
        const colX = cx - 50 + offset + col * 22;
        if (colX < cx + 55) {
          castle.lineBetween(colX, rowY, colX, rowY - 18);
        }
      }
    }

    // Banner above door
    castle.fillStyle(0x8b6914, 1);
    castle.beginPath();
    castle.moveTo(cx - 35, cy - 35);
    castle.lineTo(cx - 30, cy - 45);
    castle.lineTo(cx + 30, cy - 45);
    castle.lineTo(cx + 35, cy - 35);
    castle.closePath();
    castle.fillPath();
  }

  private drawLeftTower(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    // Tower body
    castle.fillStyle(0xe8dcc8, 1);
    castle.fillRect(cx - 75, cy - 70, 40, 130);

    castle.fillStyle(THEME.colors.warmHighlight, 0.18);
    castle.fillRect(cx - 73, cy - 66, 34, 14);
    castle.fillStyle(THEME.colors.warmShadow, 0.18);
    castle.fillRect(cx - 73, cy + 40, 34, 18);

    // 3D side
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx - 35, cy - 70);
    castle.lineTo(cx - 25, cy - 62);
    castle.lineTo(cx - 25, cy + 60);
    castle.lineTo(cx - 35, cy + 60);
    castle.closePath();
    castle.fillPath();

    // Roof
    castle.fillStyle(0xa0522d, 1);
    castle.beginPath();
    castle.moveTo(cx - 80, cy - 70);
    castle.lineTo(cx - 55, cy - 130);
    castle.lineTo(cx - 30, cy - 70);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(THEME.colors.warmHighlight, 0.2);
    castle.beginPath();
    castle.moveTo(cx - 78, cy - 70);
    castle.lineTo(cx - 55, cy - 120);
    castle.lineTo(cx - 52, cy - 70);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(0xb86b3d, 0.7);
    castle.beginPath();
    castle.moveTo(cx - 75, cy - 70);
    castle.lineTo(cx - 55, cy - 120);
    castle.lineTo(cx - 55, cy - 130);
    castle.closePath();
    castle.fillPath();

    castle.lineStyle(2, 0x703010, 1);
    castle.lineBetween(cx - 55, cy - 130, cx - 30, cy - 70);

    // Window
    castle.fillStyle(0x3a3020, 1);
    castle.fillRect(cx - 62, cy - 40, 14, 22);
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.strokeRect(cx - 62, cy - 40, 14, 22);

    castle.lineStyle(2, 0x5a4a38, 1);
    castle.lineBetween(cx - 55, cy - 40, cx - 55, cy - 18);
    castle.lineBetween(cx - 62, cy - 29, cx - 48, cy - 29);
  }

  private drawRightTower(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    // Tower body
    castle.fillStyle(0xe8dcc8, 1);
    castle.fillRect(cx + 35, cy - 55, 40, 115);

    castle.fillStyle(THEME.colors.warmHighlight, 0.18);
    castle.fillRect(cx + 37, cy - 52, 34, 12);
    castle.fillStyle(THEME.colors.warmShadow, 0.18);
    castle.fillRect(cx + 37, cy + 35, 34, 16);

    // 3D side
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx + 75, cy - 55);
    castle.lineTo(cx + 88, cy - 45);
    castle.lineTo(cx + 88, cy + 60);
    castle.lineTo(cx + 75, cy + 60);
    castle.closePath();
    castle.fillPath();

    // Roof
    castle.fillStyle(0xa0522d, 1);
    castle.beginPath();
    castle.moveTo(cx + 30, cy - 55);
    castle.lineTo(cx + 55, cy - 115);
    castle.lineTo(cx + 80, cy - 55);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(THEME.colors.warmHighlight, 0.2);
    castle.beginPath();
    castle.moveTo(cx + 32, cy - 55);
    castle.lineTo(cx + 55, cy - 105);
    castle.lineTo(cx + 58, cy - 55);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(0xb86b3d, 0.7);
    castle.beginPath();
    castle.moveTo(cx + 35, cy - 55);
    castle.lineTo(cx + 55, cy - 105);
    castle.lineTo(cx + 55, cy - 115);
    castle.closePath();
    castle.fillPath();

    castle.lineStyle(2, 0x703010, 1);
    castle.lineBetween(cx + 55, cy - 115, cx + 80, cy - 55);

    // Window
    castle.fillStyle(0x3a3020, 1);
    castle.fillRect(cx + 48, cy - 28, 14, 22);
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.strokeRect(cx + 48, cy - 28, 14, 22);

    castle.lineStyle(2, 0x5a4a38, 1);
    castle.lineBetween(cx + 55, cy - 28, cx + 55, cy - 6);
    castle.lineBetween(cx + 48, cy - 17, cx + 62, cy - 17);
  }

  private drawDoorway(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    // Door background
    castle.fillStyle(0x1a0a00, 1);
    castle.beginPath();
    castle.moveTo(cx - 25, cy + 60);
    castle.lineTo(cx - 25, cy + 10);
    castle.arc(cx, cy + 10, 25, Math.PI, 0, false);
    castle.lineTo(cx + 25, cy + 60);
    castle.closePath();
    castle.fillPath();

    castle.fillStyle(THEME.colors.warmHighlight, 0.15);
    castle.beginPath();
    castle.moveTo(cx - 22, cy + 58);
    castle.lineTo(cx - 22, cy + 18);
    castle.arc(cx, cy + 10, 22, Math.PI, 0, false);
    castle.lineTo(cx + 22, cy + 58);
    castle.closePath();
    castle.fillPath();

    // Arch decoration
    castle.fillStyle(0xd4a574, 1);
    castle.beginPath();
    castle.arc(cx, cy + 10, 20, Math.PI, 0, false);
    castle.closePath();
    castle.fillPath();

    // Arch lines
    castle.lineStyle(2, 0xb08050, 1);
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI + (i * Math.PI) / 8;
      const innerR = 8;
      const outerR = 18;
      castle.lineBetween(
        cx + Math.cos(angle) * innerR,
        cy + 10 + Math.sin(angle) * innerR,
        cx + Math.cos(angle) * outerR,
        cy + 10 + Math.sin(angle) * outerR
      );
    }

    // Door interior
    castle.fillStyle(0x0a0500, 1);
    castle.beginPath();
    castle.moveTo(cx - 18, cy + 60);
    castle.lineTo(cx - 18, cy + 15);
    castle.arc(cx, cy + 15, 18, Math.PI, 0, false);
    castle.lineTo(cx + 18, cy + 60);
    castle.closePath();
    castle.fillPath();

    // Door frame
    castle.lineStyle(4, 0x8a7a68, 1);
    castle.beginPath();
    castle.moveTo(cx - 28, cy + 62);
    castle.lineTo(cx - 28, cy + 10);
    castle.arc(cx, cy + 10, 28, Math.PI, 0, false);
    castle.lineTo(cx + 28, cy + 62);
    castle.strokePath();

    castle.lineStyle(2, 0xc8b8a8, 1);
    castle.beginPath();
    castle.moveTo(cx - 25, cy + 60);
    castle.lineTo(cx - 25, cy + 10);
    castle.arc(cx, cy + 10, 25, Math.PI, 0, false);
    castle.lineTo(cx + 25, cy + 60);
    castle.strokePath();
  }

  private drawDecorations(castle: Phaser.GameObjects.Graphics, cx: number, cy: number): void {
    // Left torch
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillRect(cx - 42, cy + 25, 6, 3);
    castle.fillRect(cx - 40, cy + 28, 4, 12);

    castle.fillStyle(0xff8800, 0.4);
    castle.fillCircle(cx - 38, cy + 38, 12);

    castle.fillStyle(0xd4a030, 1);
    castle.fillRoundedRect(cx - 44, cy + 35, 12, 14, 3);
    castle.fillStyle(0xffcc44, 0.9);
    castle.fillRoundedRect(cx - 42, cy + 37, 8, 10, 2);

    // Right torch
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillRect(cx + 36, cy + 25, 6, 3);
    castle.fillRect(cx + 36, cy + 28, 4, 12);

    castle.fillStyle(0xff8800, 0.4);
    castle.fillCircle(cx + 38, cy + 38, 12);

    castle.fillStyle(0xd4a030, 1);
    castle.fillRoundedRect(cx + 32, cy + 35, 12, 14, 3);
    castle.fillStyle(0xffcc44, 0.9);
    castle.fillRoundedRect(cx + 34, cy + 37, 8, 10, 2);
  }

  private drawFlag(x: number, y: number): void {
    if (!this.flagGraphics) return;

    this.flagGraphics.clear();

    const flagX = x - 73;
    const flagY = y - 253;
    const flagWidth = 30;
    const flagHeight = 18;

    const wave1 = Math.sin(this.flagPhase) * 2;
    const wave2 = Math.sin(this.flagPhase + 1) * 3;
    const wave3 = Math.sin(this.flagPhase + 2) * 2;

    // Flag body
    this.flagGraphics.fillStyle(0xcc0000, 1);
    this.flagGraphics.beginPath();
    this.flagGraphics.moveTo(flagX, flagY);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.33, flagY + wave1);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.66, flagY + wave2);
    this.flagGraphics.lineTo(flagX + flagWidth, flagY + wave3);
    this.flagGraphics.lineTo(flagX + flagWidth, flagY + flagHeight + wave3);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.66, flagY + flagHeight + wave2);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.33, flagY + flagHeight + wave1);
    this.flagGraphics.lineTo(flagX, flagY + flagHeight);
    this.flagGraphics.closePath();
    this.flagGraphics.fillPath();

    // Flag highlight
    this.flagGraphics.fillStyle(0xff2222, 0.6);
    this.flagGraphics.beginPath();
    this.flagGraphics.moveTo(flagX, flagY + 2);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.4, flagY + 2 + wave1 * 0.8);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.4, flagY + 7 + wave1 * 0.8);
    this.flagGraphics.lineTo(flagX, flagY + 7);
    this.flagGraphics.closePath();
    this.flagGraphics.fillPath();

    // Emblem
    this.flagGraphics.fillStyle(0xffd700, 0.9);
    const emblX = flagX + flagWidth * 0.5;
    const emblY = flagY + flagHeight * 0.5 + wave2 * 0.5;
    this.flagGraphics.fillCircle(emblX, emblY, 4);
  }

  private drawCastleDamage(x: number, y: number): void {
    if (!this.castleDamageGraphics) return;

    this.castleDamageGraphics.clear();

    if (this.currentDamageState === 0) return;

    const cx = x - 20;
    const cy = y - 80;

    const crackColor = 0x2a1a0a;

    if (this.currentDamageState >= 1) {
      this.castleDamageGraphics.lineStyle(3, crackColor, 0.8);

      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx - 40, cy + 20);
      this.castleDamageGraphics.lineTo(cx - 35, cy + 35);
      this.castleDamageGraphics.lineTo(cx - 45, cy + 50);
      this.castleDamageGraphics.strokePath();

      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx - 55, cy - 30);
      this.castleDamageGraphics.lineTo(cx - 50, cy - 15);
      this.castleDamageGraphics.lineTo(cx - 60, cy);
      this.castleDamageGraphics.strokePath();

      this.castleDamageGraphics.fillStyle(0x3a3a3a, 0.4);
      this.castleDamageGraphics.fillCircle(cx + 20, cy + 30, 10);
      this.castleDamageGraphics.fillCircle(cx - 30, cy - 10, 8);
    }

    if (this.currentDamageState >= 2) {
      this.castleDamageGraphics.lineStyle(4, crackColor, 0.9);

      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx + 50, cy - 40);
      this.castleDamageGraphics.lineTo(cx + 55, cy - 20);
      this.castleDamageGraphics.lineTo(cx + 45, cy);
      this.castleDamageGraphics.lineTo(cx + 52, cy + 20);
      this.castleDamageGraphics.strokePath();

      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx + 10, cy - 20);
      this.castleDamageGraphics.lineTo(cx + 5, cy);
      this.castleDamageGraphics.lineTo(cx + 15, cy + 20);
      this.castleDamageGraphics.strokePath();

      // Rubble
      this.castleDamageGraphics.fillStyle(0x9a8a7a, 0.9);
      this.castleDamageGraphics.fillCircle(cx - 70, cy + 75, 8);
      this.castleDamageGraphics.fillCircle(cx - 55, cy + 80, 6);
      this.castleDamageGraphics.fillCircle(cx + 75, cy + 75, 7);
      this.castleDamageGraphics.fillCircle(cx + 65, cy + 82, 5);

      // Smoke
      this.castleDamageGraphics.fillStyle(0x2a2a2a, 0.5);
      this.castleDamageGraphics.fillCircle(cx - 45, cy - 50, 12);
      this.castleDamageGraphics.fillCircle(cx + 45, cy - 25, 10);
      this.castleDamageGraphics.fillCircle(cx, cy + 10, 14);

      this.castleDamageGraphics.fillStyle(0x4a4a4a, 0.3);
      this.castleDamageGraphics.fillCircle(cx - 55, cy - 140, 8);
      this.castleDamageGraphics.fillCircle(cx - 50, cy - 150, 6);
      this.castleDamageGraphics.fillCircle(cx + 55, cy - 120, 7);
    }
  }

  private drawDestroyedCastle(): void {
    if (!this.castlePosition) return;

    if (this.destroyedCastleGraphics) {
      this.destroyedCastleGraphics.destroy();
    }

    this.destroyedCastleGraphics = this.scene.add.graphics();
    this.destroyedCastleGraphics.setDepth(15);

    const x = this.castlePosition.x;
    const y = this.castlePosition.y;
    const cx = x - 20;
    const cy = y - 80;

    const g = this.destroyedCastleGraphics;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(cx, cy + 95, 180, 50);

    // Rubble base
    g.fillStyle(0x7a6a50, 1);
    g.beginPath();
    g.moveTo(cx - 80, cy + 85);
    g.lineTo(cx + 80, cy + 85);
    g.lineTo(cx + 70, cy + 70);
    g.lineTo(cx - 60, cy + 70);
    g.closePath();
    g.fillPath();

    const rubbleColors = [0x9a8a7a, 0x8b7a6a, 0x7a6a5a, 0xa89878];

    // Rubble pile
    g.fillStyle(rubbleColors[0], 1);
    g.beginPath();
    g.moveTo(cx - 60, cy + 70);
    g.lineTo(cx - 40, cy + 20);
    g.lineTo(cx - 20, cy + 35);
    g.lineTo(cx + 10, cy + 15);
    g.lineTo(cx + 40, cy + 30);
    g.lineTo(cx + 60, cy + 70);
    g.closePath();
    g.fillPath();

    g.fillStyle(rubbleColors[1], 1);
    g.beginPath();
    g.moveTo(cx - 50, cy + 70);
    g.lineTo(cx - 35, cy + 40);
    g.lineTo(cx - 10, cy + 50);
    g.lineTo(cx + 20, cy + 35);
    g.lineTo(cx + 45, cy + 70);
    g.closePath();
    g.fillPath();

    // Standing wall fragments
    g.fillStyle(0xe8dcc8, 0.9);
    g.fillRect(cx - 75, cy + 20, 35, 50);
    g.fillStyle(rubbleColors[2], 1);
    g.beginPath();
    g.moveTo(cx - 75, cy + 20);
    g.lineTo(cx - 65, cy - 5);
    g.lineTo(cx - 55, cy + 10);
    g.lineTo(cx - 40, cy + 20);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xe8dcc8, 0.9);
    g.fillRect(cx + 35, cy + 30, 35, 40);
    g.fillStyle(rubbleColors[3], 1);
    g.beginPath();
    g.moveTo(cx + 35, cy + 30);
    g.lineTo(cx + 50, cy + 5);
    g.lineTo(cx + 60, cy + 25);
    g.lineTo(cx + 70, cy + 30);
    g.closePath();
    g.fillPath();

    // Roof fragments
    g.fillStyle(0xa0522d, 0.8);
    g.beginPath();
    g.moveTo(cx - 30, cy + 60);
    g.lineTo(cx - 15, cy + 40);
    g.lineTo(cx + 10, cy + 55);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x8b4513, 0.8);
    g.beginPath();
    g.moveTo(cx + 50, cy + 65);
    g.lineTo(cx + 65, cy + 45);
    g.lineTo(cx + 80, cy + 60);
    g.closePath();
    g.fillPath();

    // Scattered stones
    g.fillStyle(0x6a5a4a, 0.9);
    g.fillCircle(cx - 80, cy + 80, 8);
    g.fillCircle(cx - 70, cy + 85, 6);
    g.fillCircle(cx + 75, cy + 78, 7);
    g.fillCircle(cx + 85, cy + 82, 5);
    g.fillCircle(cx - 45, cy + 75, 5);
    g.fillCircle(cx + 55, cy + 72, 6);

    // Smoke clouds
    g.fillStyle(0x4a4a4a, 0.3);
    g.fillCircle(cx - 20, cy, 20);
    g.fillCircle(cx + 15, cy - 10, 18);
    g.fillCircle(cx - 5, cy - 20, 15);
    g.fillStyle(0x5a5a5a, 0.2);
    g.fillCircle(cx + 30, cy + 5, 22);
    g.fillCircle(cx - 40, cy - 5, 16);

    // Fallen flag pole
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(cx - 90, cy + 70, 40, 4);

    // Torn flag
    g.fillStyle(0x880000, 0.7);
    g.beginPath();
    g.moveTo(cx - 50, cy + 72);
    g.lineTo(cx - 35, cy + 65);
    g.lineTo(cx - 20, cy + 75);
    g.lineTo(cx - 35, cy + 80);
    g.closePath();
    g.fillPath();

    // Cracks
    g.lineStyle(2, 0x3a2a1a, 0.8);
    g.beginPath();
    g.moveTo(cx - 40, cy + 85);
    g.lineTo(cx - 30, cy + 75);
    g.lineTo(cx - 35, cy + 70);
    g.strokePath();

    g.beginPath();
    g.moveTo(cx + 30, cy + 85);
    g.lineTo(cx + 25, cy + 78);
    g.lineTo(cx + 35, cy + 72);
    g.strokePath();
  }
}
