import Phaser from 'phaser';

export class ArcherAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;

  private baseGraphics: Phaser.GameObjects.Graphics;

  private archerContainer: Phaser.GameObjects.Container;
  private archerGraphics: Phaser.GameObjects.Graphics;
  private bowGraphics: Phaser.GameObjects.Graphics;
  private arrowGraphics: Phaser.GameObjects.Graphics;

  private archerAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;

  private bowDrawProgress: number = 0;
  private isDrawing: boolean = false;
  private drawSpeed: number = 4.0;

  private arrowReleaseTimer: number = 0;

  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;

  private readonly ARCHER_Y = [-35, -42, -50, -58];

  private readonly BOW_LOCAL_X = -20;
  private readonly BOW_LOCAL_Y = 10;

  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;

    this.baseGraphics = scene.add.graphics();

    this.archerContainer = scene.add.container(0, this.ARCHER_Y[level - 1]);
    this.archerContainer.setScale(1.3);

    this.archerGraphics = scene.add.graphics();
    this.bowGraphics = scene.add.graphics();
    this.arrowGraphics = scene.add.graphics();

    this.archerContainer.add([
      this.archerGraphics,
      this.bowGraphics,
      this.arrowGraphics
    ]);

    this.container.add([this.baseGraphics, this.archerContainer]);

    this.drawBase();
    this.drawArcher();
    this.drawBow();
  }

  setLevel(level: number): void {
    this.level = level;
    this.archerContainer.setY(this.ARCHER_Y[level - 1]);
    this.drawBase();
    this.drawArcher();
    this.drawBow();
  }

  update(delta: number): void {
    const dt = delta / 1000;

    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.archerAngle);
      const rotationSpeed = 6.0;

      if (Math.abs(angleDiff) > 0.01) {
        this.archerAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.archerAngle = Phaser.Math.Angle.Wrap(this.archerAngle);
      }
    }

    if (this.isDrawing) {
      this.bowDrawProgress = Math.min(1, this.bowDrawProgress + this.drawSpeed * dt);
    } else {

      this.bowDrawProgress = Math.max(0, this.bowDrawProgress - 2.0 * dt);
    }

    if (this.arrowReleaseTimer > 0) {
      this.arrowReleaseTimer -= dt;
    }

    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 15) * 0.5 + 0.5;

      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawArcher();
      this.drawBow();
    }

    this.archerContainer.setRotation(this.archerAngle);

    if (this.bowDrawProgress > 0 || this.arrowReleaseTimer > 0) {
      this.drawBow();
      this.drawArrowRelease();
    }
  }

  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;

    const archerWorldY = towerY + this.ARCHER_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, archerWorldY, targetX, targetY) + Math.PI;
    this.isDrawing = true;
  }

  clearTarget(): void {
    this.hasTarget = false;
    this.isDrawing = false;
  }

  onFire(): { x: number; y: number } {

    this.arrowReleaseTimer = 0.15;
    this.bowDrawProgress = 0;

    if (this.hasTarget) {
      this.isDrawing = true;
    }

    this.drawBow();
    this.drawArrowRelease();

    return this.getProjectileSpawnOffset();
  }

  getProjectileSpawnOffset(): { x: number; y: number } {

    const bowLocalX = this.BOW_LOCAL_X;
    const bowLocalY = this.BOW_LOCAL_Y;

    const cos = Math.cos(this.archerAngle);
    const sin = Math.sin(this.archerAngle);

    const rotatedX = bowLocalX * cos - bowLocalY * sin;
    const rotatedY = bowLocalX * sin + bowLocalY * cos;

    const archerY = this.ARCHER_Y[this.level - 1];

    return {
      x: rotatedX,
      y: rotatedY + archerY
    };
  }

  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
    this.isDrawing = false;
  }

  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();

    const level = this.level;

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 50, 18);

    const baseWidth = 32;
    const towerHeight = 42;

    if (level === 1) {

      g.fillStyle(0x8b5a2b, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 18);
      g.fillStyle(0x9a6a3b, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 14);
      g.lineStyle(1, 0x6b4020, 0.4);
      for (let i = -baseWidth + 6; i < baseWidth - 6; i += 8) {
        g.lineBetween(i, 10, i, 24);
      }
    } else if (level === 2) {

      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 22);
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 18);
      g.lineStyle(1, 0x6b5344, 0.5);
      g.lineBetween(-baseWidth + 4, 17, baseWidth - 4, 17);
      g.lineBetween(-10, 10, -10, 28);
      g.lineBetween(10, 10, 10, 28);
    } else {

      g.fillStyle(0xa89375, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 26);
      g.fillStyle(0xc8b395, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 22);
      g.lineStyle(2, 0xffd700, 0.8);
      g.lineBetween(-baseWidth, 8, baseWidth, 8);
      g.lineBetween(-baseWidth, 34, baseWidth, 34);
      g.fillStyle(0xffd700, 0.6);
      g.fillRect(-baseWidth - 3, 5, 6, 32);
      g.fillRect(baseWidth - 3, 5, 6, 32);
    }

    if (level === 1) {
      g.fillStyle(0xb88a5c, 1);
      g.beginPath();
      g.moveTo(-22, 10);
      g.lineTo(-18, -towerHeight);
      g.lineTo(18, -towerHeight);
      g.lineTo(22, 10);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0x8b6a3c, 0.5);
      g.lineBetween(-20, -15, 20, -15);
      g.lineBetween(-19, -35, 19, -35);
    } else if (level === 2) {
      g.fillStyle(0xd4a574, 1);
      g.beginPath();
      g.moveTo(-26, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(26, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x9a8265, 1);
      g.fillRect(-28, -towerHeight, 8, towerHeight + 10);
      g.fillRect(20, -towerHeight, 8, towerHeight + 10);
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -35, 16, 22);
      g.fillStyle(0xe8c896, 1);
      g.fillRect(-10, -38, 20, 4);
    } else {
      g.fillStyle(0xe4b584, 1);
      g.beginPath();
      g.moveTo(-32, 10);
      g.lineTo(-28, -towerHeight);
      g.lineTo(28, -towerHeight);
      g.lineTo(32, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xf8d8a6, 1);
      g.beginPath();
      g.moveTo(-24, 5);
      g.lineTo(-20, -towerHeight + 5);
      g.lineTo(20, -towerHeight + 5);
      g.lineTo(24, 5);
      g.closePath();
      g.fillPath();

      g.fillStyle(0xc9a06c, 1);
      g.beginPath();
      g.moveTo(-40, 25);
      g.lineTo(-32, -30);
      g.lineTo(-28, -30);
      g.lineTo(-32, 25);
      g.closePath();
      g.fillPath();
      g.beginPath();
      g.moveTo(40, 25);
      g.lineTo(32, -30);
      g.lineTo(28, -30);
      g.lineTo(32, 25);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, 0xffd700, 0.9);
      g.strokeRect(-10, -38, 20, 28);
      g.strokeRect(-10, -75, 20, 28);
    }

    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(-8, -30, 16, 22);
    g.fillStyle(0x1a0a00, 1);
    g.fillRect(-5, -28, 10, 18);

    if (level >= 2) {
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-8, -60, 16, 18);
      g.fillStyle(0x1a0a00, 1);
      g.fillRect(-5, -58, 10, 14);
    }

    const battY = -towerHeight - 10;
    if (level === 1) {
      g.fillStyle(0xa98a5c, 1);
      g.fillRect(-20, battY, 10, 10);
      g.fillRect(-5, battY, 10, 10);
      g.fillRect(10, battY, 10, 10);
    } else if (level === 2) {
      g.fillStyle(0xbaa27c, 1);
      g.fillRect(-24, battY, 8, 12);
      g.fillRect(-8, battY, 8, 12);
      g.fillRect(8, battY, 8, 12);
      g.fillRect(16, battY, 8, 12);
    } else {
      g.fillStyle(0xcab28c, 1);
      for (let i = -28; i <= 22; i += 10) {
        g.fillRect(i, battY - 5, 8, 16);
      }
      g.lineStyle(1, 0xffd700, 0.7);
      for (let i = -28; i <= 22; i += 10) {
        g.strokeRect(i, battY - 5, 8, 16);
      }
    }

    const platY = this.ARCHER_Y[level - 1] + 10;
    g.fillStyle(0x8b7355, 1);
    g.fillEllipse(0, platY, 30, 12);
    g.fillStyle(0x9a8265, 1);
    g.fillEllipse(0, platY - 2, 26, 10);
  }

  private drawArcher(): void {
    const g = this.archerGraphics;
    g.clear();

    const bodyY = 10;

    const cloakColor = this.level === 1 ? 0x2d5016 :
                       this.level === 2 ? 0x1a4d1a : 0x0d3d0d;
    const cloakDark = this.level === 1 ? 0x1d4010 :
                      this.level === 2 ? 0x0d3d0d : 0x062d06;
    const cloakLight = this.level === 1 ? 0x3d6026 :
                       this.level === 2 ? 0x2a5d2a : 0x1d4d1d;
    const skinColor = 0xdeb887;
    const leatherColor = 0x5c4033;
    const leatherDark = 0x3a2820;
    const metalColor = 0x6a6a6a;

    if (this.isCheeringActive) {

      this.drawCheeringArcher(g, bodyY, cloakColor, cloakDark, cloakLight, skinColor);
      return;
    }

    if (this.level === 1) {

      g.fillStyle(cloakColor, 1);
      g.fillRect(-18, bodyY - 6, 12, 8);
      g.fillStyle(skinColor, 1);
      g.fillCircle(-20, bodyY - 2, 4);

      const drawPull = this.bowDrawProgress * 8;
      g.fillStyle(cloakColor, 1);
      g.fillRect(6, bodyY - 4 + drawPull, 10, 8);
      g.fillStyle(skinColor, 1);
      g.fillCircle(10, bodyY + 2 + drawPull, 4);

      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 6, 22, 14);
      g.fillStyle(cloakDark, 1);
      g.fillEllipse(-8, bodyY + 6, 6, 12);
      g.fillEllipse(8, bodyY + 6, 6, 12);
      g.fillStyle(cloakLight, 1);
      g.fillEllipse(0, bodyY + 8, 8, 6);

      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 4, 10);

      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-6, bodyY - 10);
      g.lineTo(0, bodyY - 16);
      g.lineTo(6, bodyY - 10);
      g.closePath();
      g.fillPath();

      g.fillStyle(cloakLight, 1);
      g.fillCircle(-2, bodyY - 6, 4);

    } else if (this.level === 2) {

      g.fillStyle(leatherColor, 1);
      g.fillRect(-20, bodyY - 7, 14, 9);
      g.fillStyle(leatherDark, 1);
      g.fillRect(-20, bodyY - 7, 3, 9);
      g.fillStyle(skinColor, 1);
      g.fillCircle(-22, bodyY - 2, 5);

      const drawPull = this.bowDrawProgress * 10;
      g.fillStyle(leatherColor, 1);
      g.fillRect(6, bodyY - 5 + drawPull, 12, 9);
      g.fillStyle(skinColor, 1);
      g.fillCircle(12, bodyY + 2 + drawPull, 5);

      g.fillStyle(leatherDark, 1);
      g.fillRect(8, bodyY - 2 + drawPull, 6, 5);

      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 6, 26, 16);
      g.fillStyle(leatherColor, 1);
      g.fillCircle(-10, bodyY + 4, 7);
      g.fillCircle(10, bodyY + 4, 7);
      g.fillStyle(leatherDark, 1);
      g.fillCircle(-10, bodyY + 4, 4);
      g.fillCircle(10, bodyY + 4, 4);

      g.fillStyle(leatherColor, 1);
      g.fillRect(4, bodyY + 2, 8, 16);
      g.fillStyle(0x8b7355, 1);
      for (let i = 0; i < 3; i++) {
        g.fillRect(5 + i * 2, bodyY + 3, 2, 4);
      }

      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-8, bodyY - 12);
      g.lineTo(0, bodyY - 20);
      g.lineTo(8, bodyY - 12);
      g.closePath();
      g.fillPath();
      g.fillStyle(cloakLight, 1);
      g.fillCircle(-3, bodyY - 8, 5);

    } else {

      g.fillStyle(cloakColor, 1);
      g.fillRect(-22, bodyY - 8, 16, 10);
      g.fillStyle(metalColor, 1);
      g.fillRect(-20, bodyY - 6, 6, 6);
      g.fillStyle(skinColor, 1);
      g.fillCircle(-24, bodyY - 3, 5);

      const drawPull = this.bowDrawProgress * 12;
      g.fillStyle(cloakColor, 1);
      g.fillRect(6, bodyY - 6 + drawPull, 14, 10);
      g.fillStyle(metalColor, 1);
      g.fillRect(10, bodyY - 4 + drawPull, 6, 6);
      g.fillStyle(skinColor, 1);
      g.fillCircle(14, bodyY + 2 + drawPull, 5);

      g.fillStyle(cloakColor, 1);
      g.fillEllipse(0, bodyY + 7, 30, 18);
      g.fillStyle(metalColor, 1);
      g.fillEllipse(-12, bodyY + 4, 10, 12);
      g.fillEllipse(12, bodyY + 4, 10, 12);
      g.fillStyle(0x8a8a8a, 1);
      g.fillEllipse(-12, bodyY + 3, 6, 8);
      g.fillEllipse(12, bodyY + 3, 6, 8);

      g.fillStyle(leatherColor, 1);
      g.fillRect(5, bodyY + 2, 10, 18);
      g.fillStyle(0xffd700, 0.5);
      g.fillRect(5, bodyY + 2, 10, 2);
      g.fillStyle(0x8b7355, 1);
      for (let i = 0; i < 4; i++) {
        g.fillRect(6 + i * 2, bodyY + 4, 2, 4);
      }

      g.fillStyle(metalColor, 1);
      g.fillCircle(0, bodyY - 6, 14);

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-3, bodyY - 18, 6, 10);

      g.fillStyle(0x8a8a8a, 1);
      g.fillCircle(-4, bodyY - 10, 6);

      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-8, bodyY - 16, 16, 6);

      g.lineStyle(2, 0xffd700, 0.8);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }

  private drawCheeringArcher(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    cloakColor: number,
    cloakDark: number,
    _cloakLight: number,
    skinColor: number
  ): void {

    const pumpOffset = this.cheerArmAngle * 8;

    const bowWood = this.level === 1 ? 0x8b4513 :
                    this.level === 2 ? 0x654321 : 0x4a3728;

    g.fillStyle(cloakColor, 1);
    g.fillEllipse(0, bodyY + 6, 28, 18);
    g.fillStyle(cloakDark, 1);
    g.fillEllipse(-8, bodyY + 6, 6, 12);
    g.fillEllipse(8, bodyY + 6, 6, 12);

    if (this.level >= 2) {
      g.fillStyle(0x5c4033, 1);
      g.fillRect(4, bodyY + 2, 8, 14);
      g.fillStyle(0x8b7355, 1);
      for (let i = 0; i < 3; i++) {
        g.fillRect(5 + i * 2, bodyY + 3, 2, 4);
      }
    }

    g.fillStyle(cloakColor, 1);

    g.fillRect(-12, bodyY - 18 - pumpOffset, 8, 16);

    g.fillRect(4, bodyY - 18 - pumpOffset, 8, 16);

    g.fillStyle(skinColor, 1);
    g.fillCircle(-8, bodyY - 20 - pumpOffset, 4);
    g.fillCircle(8, bodyY - 20 - pumpOffset, 4);

    const bowY = bodyY - 24 - pumpOffset;
    const bowLength = 16 + this.level * 3;

    g.lineStyle(3 + this.level, bowWood, 1);
    g.lineBetween(-bowLength, bowY, bowLength, bowY);

    g.fillStyle(bowWood, 1);
    g.fillEllipse(0, bowY - 3, bowLength * 1.8, 6);
    g.fillStyle(cloakColor, 1);
    g.fillRect(-bowLength - 2, bowY, bowLength * 2 + 4, 6);

    if (this.level >= 3) {
      g.fillStyle(0xffd700, 1);
      g.fillCircle(-bowLength, bowY, 3);
      g.fillCircle(bowLength, bowY, 3);
    }

    if (this.level < 3) {
      g.fillStyle(cloakColor, 1);
      g.fillCircle(0, bodyY - 4, 10 + this.level);
      g.fillStyle(cloakDark, 1);
      g.beginPath();
      g.moveTo(-6, bodyY - 10);
      g.lineTo(0, bodyY - 16);
      g.lineTo(6, bodyY - 10);
      g.closePath();
      g.fillPath();
    } else {
      g.fillStyle(0x6a6a6a, 1);
      g.fillCircle(0, bodyY - 6, 14);
      g.fillStyle(0x8a8a8a, 1);
      g.fillCircle(-4, bodyY - 10, 6);

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-3, bodyY - 18, 6, 8);
    }
  }

  private drawBowCurve(
    g: Phaser.GameObjects.Graphics,
    x: number,
    yStart: number,
    yEnd: number,
    curveDepth: number
  ): void {

    const segments = 8;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = yStart + (yEnd - yStart) * t;

      const curveOffset = curveDepth * 4 * t * (1 - t);
      points.push({ x: x - curveOffset, y: y });
    }

    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.strokePath();
  }

  private drawBow(): void {
    const g = this.bowGraphics;
    g.clear();

    if (this.isCheeringActive) {

      return;
    }

    const bodyY = 10;
    const bowX = -20;

    const bowWood = this.level === 1 ? 0x8b4513 :
                    this.level === 2 ? 0x654321 : 0x4a3728;
    const bowLight = this.level === 1 ? 0xa05a23 :
                     this.level === 2 ? 0x755331 : 0x5a4738;
    const stringColor = this.level >= 3 ? 0xffd700 : 0xcccccc;

    const bowLength = 18 + this.level * 4;
    const bowCurve = 6 + this.level * 2;

    g.lineStyle(3 + this.level, bowWood, 1);
    this.drawBowCurve(g, bowX, bodyY - bowLength, bodyY + bowLength, bowCurve);

    g.lineStyle(1, bowLight, 0.6);
    this.drawBowCurve(g, bowX + 1, bodyY - bowLength + 2, bodyY + bowLength - 2, bowCurve - 1);

    const drawPull = this.bowDrawProgress * (8 + this.level * 2);
    g.lineStyle(1, stringColor, 0.9);
    g.beginPath();
    g.moveTo(bowX, bodyY - bowLength);
    g.lineTo(bowX + drawPull, bodyY);
    g.lineTo(bowX, bodyY + bowLength);
    g.strokePath();

    if (this.bowDrawProgress > 0.2) {
      const arrowTip = bowX - 10 + drawPull;
      const arrowBack = bowX + drawPull + 5;

      g.lineStyle(2, 0x8b7355, 1);
      g.lineBetween(arrowTip, bodyY, arrowBack, bodyY);

      g.fillStyle(0x6a6a6a, 1);
      g.beginPath();
      g.moveTo(arrowTip - 6, bodyY);
      g.lineTo(arrowTip, bodyY - 3);
      g.lineTo(arrowTip, bodyY + 3);
      g.closePath();
      g.fillPath();

      g.fillStyle(0xcc0000, 0.8);
      g.beginPath();
      g.moveTo(arrowBack, bodyY);
      g.lineTo(arrowBack + 4, bodyY - 3);
      g.lineTo(arrowBack + 4, bodyY + 3);
      g.closePath();
      g.fillPath();
    }

    if (this.level >= 3) {
      g.fillStyle(0xffd700, 1);
      g.fillCircle(bowX, bodyY - bowLength, 3);
      g.fillCircle(bowX, bodyY + bowLength, 3);
      g.fillCircle(bowX - bowCurve / 2, bodyY, 2);
    }
  }

  private drawArrowRelease(): void {
    const g = this.arrowGraphics;
    g.clear();

    if (this.arrowReleaseTimer <= 0) return;

    const alpha = this.arrowReleaseTimer / 0.15;
    const bodyY = 10;

    g.fillStyle(0xffcc00, alpha * 0.5);
    g.fillRect(-30, bodyY - 2, 20, 4);

    g.fillStyle(0xffffff, alpha * 0.8);
    g.fillCircle(-22, bodyY, 4);
  }

  destroy(): void {
    this.baseGraphics.destroy();
    this.archerGraphics.destroy();
    this.bowGraphics.destroy();
    this.arrowGraphics.destroy();
    this.archerContainer.destroy();
  }
}
