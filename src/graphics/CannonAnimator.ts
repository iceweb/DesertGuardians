import Phaser from 'phaser';

export class CannonAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;

  private baseGraphics: Phaser.GameObjects.Graphics;

  private cannonContainer: Phaser.GameObjects.Container;
  private operatorGraphics: Phaser.GameObjects.Graphics;
  private cannonGraphics: Phaser.GameObjects.Graphics;
  private effectGraphics: Phaser.GameObjects.Graphics;

  private cannonAngle: number = 0;
  private targetAngle: number = 0;
  private hasTarget: boolean = false;

  private recoilProgress: number = 0;
  private isRecoiling: boolean = false;

  private blastTimer: number = 0;

  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;

  private readonly OPERATOR_Y = [-30, -38, -45, -45];

  private readonly BARREL_LENGTH = [25, 32, 42, 42];

  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;

    this.baseGraphics = scene.add.graphics();

    this.cannonContainer = scene.add.container(0, this.OPERATOR_Y[level - 1]);
    this.cannonContainer.setScale(1.3);

    this.operatorGraphics = scene.add.graphics();
    this.cannonGraphics = scene.add.graphics();
    this.effectGraphics = scene.add.graphics();

    this.cannonContainer.add([this.cannonGraphics, this.operatorGraphics, this.effectGraphics]);

    this.container.add([this.baseGraphics, this.cannonContainer]);

    this.drawBase();
    this.drawOperator();
    this.drawCannon();
  }

  setLevel(level: number): void {
    this.level = level;
    this.cannonContainer.setY(this.OPERATOR_Y[level - 1]);
    this.drawBase();
    this.drawOperator();
    this.drawCannon();
  }

  update(delta: number): void {
    const dt = delta / 1000;

    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.cannonAngle);
      const rotationSpeed = 4.0;

      if (Math.abs(angleDiff) > 0.01) {
        this.cannonAngle +=
          Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
        this.cannonAngle = Phaser.Math.Angle.Wrap(this.cannonAngle);
      }
    }

    if (this.isRecoiling) {
      this.recoilProgress = Math.max(0, this.recoilProgress - 3.0 * dt);
      if (this.recoilProgress <= 0) {
        this.isRecoiling = false;
      }
      this.drawCannon();
    }

    if (this.blastTimer > 0) {
      this.blastTimer -= dt;
      this.drawBlast();
    }

    if (this.isCheeringActive) {
      this.cheerTimer -= dt;
      this.cheerArmAngle = Math.sin(this.cheerTimer * 15) * 0.5 + 0.5;

      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      }
      this.drawOperator();
    }

    this.cannonContainer.setRotation(this.cannonAngle);
  }

  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;

    const operatorWorldY = towerY + this.OPERATOR_Y[this.level - 1];
    this.targetAngle =
      Phaser.Math.Angle.Between(towerX, operatorWorldY, targetX, targetY) + Math.PI / 2;
  }

  clearTarget(): void {
    this.hasTarget = false;
  }

  onFire(): { x: number; y: number } {
    this.isRecoiling = true;
    this.recoilProgress = 1.0;

    this.blastTimer = 0.2;

    this.drawCannon();
    this.drawBlast();

    return this.getProjectileSpawnOffset();
  }

  getProjectileSpawnOffset(): { x: number; y: number } {
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const localX = 0;
    const localY = -barrelLength;

    const cos = Math.cos(this.cannonAngle);
    const sin = Math.sin(this.cannonAngle);

    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;

    return {
      x: rotatedX,
      y: rotatedY + this.OPERATOR_Y[this.level - 1],
    };
  }

  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
  }

  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();

    const level = this.level;

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 55, 20);

    const baseWidth = 36;
    const towerHeight = 38;

    if (level === 1) {
      g.fillStyle(0x6b5344, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
      g.fillStyle(0x7b6354, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 16);

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 3);
      g.fillRect(-baseWidth, 25, baseWidth * 2, 3);
    } else if (level === 2) {
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 24);
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 20);

      g.fillStyle(0x3a3a3a, 1);
      for (let i = -baseWidth + 6; i < baseWidth - 4; i += 10) {
        g.fillCircle(i, 14, 2);
        g.fillCircle(i, 26, 2);
      }
    } else {
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 28);
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 24);

      g.fillStyle(0xb8860b, 1);
      g.fillRect(-baseWidth, 8, baseWidth * 2, 3);
      g.fillRect(-baseWidth, 33, baseWidth * 2, 3);

      g.fillStyle(0x8b6914, 1);
      for (let i = -baseWidth + 6; i < baseWidth - 4; i += 8) {
        g.fillCircle(i, 14, 3);
        g.fillCircle(i, 28, 3);
      }
    }

    if (level === 1) {
      g.fillStyle(0x7b6354, 1);
      g.beginPath();
      g.moveTo(-26, 10);
      g.lineTo(-22, -towerHeight);
      g.lineTo(22, -towerHeight);
      g.lineTo(26, 10);
      g.closePath();
      g.fillPath();

      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(-6, -25, 12, 8);
    } else if (level === 2) {
      g.fillStyle(0x5a5a5a, 1);
      g.beginPath();
      g.moveTo(-30, 10);
      g.lineTo(-26, -towerHeight);
      g.lineTo(26, -towerHeight);
      g.lineTo(30, 10);
      g.closePath();
      g.fillPath();

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-32, -towerHeight, 8, towerHeight + 10);
      g.fillRect(24, -towerHeight, 8, towerHeight + 10);

      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-8, -30, 16, 10);
      g.fillRect(-8, -55, 16, 8);
    } else {
      g.fillStyle(0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(-36, 10);
      g.lineTo(-32, -towerHeight);
      g.lineTo(32, -towerHeight);
      g.lineTo(36, 10);
      g.closePath();
      g.fillPath();

      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-38, -towerHeight, 10, towerHeight + 10);
      g.fillRect(28, -towerHeight, 10, towerHeight + 10);

      g.fillStyle(0xb8860b, 1);
      g.fillRect(-36, -towerHeight, 72, 4);
      g.fillRect(-36, -towerHeight + 30, 72, 2);

      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, -35, 20, 12);
      g.fillRect(-10, -65, 20, 10);
    }

    if (level >= 2) {
      g.fillStyle(0x8b6914, 1);
      g.fillCircle(-18, -10, 6);
      g.fillCircle(-8, -10, 6);
      g.fillStyle(0xa07a1a, 1);
      g.fillCircle(-18, -12, 3);
      g.fillCircle(-8, -12, 3);
    }
    if (level === 3) {
      g.fillCircle(8, -10, 6);
      g.fillCircle(18, -10, 6);
      g.fillStyle(0xa07a1a, 1);
      g.fillCircle(8, -12, 3);
      g.fillCircle(18, -12, 3);
    }

    const platY = this.OPERATOR_Y[level - 1] + 12;
    g.fillStyle(0x4a4a4a, 1);
    g.fillEllipse(0, platY, 34, 14);
    g.fillStyle(0x5a5a5a, 1);
    g.fillEllipse(0, platY - 2, 30, 12);

    g.lineStyle(2, 0x3a3a3a, 1);
    g.strokeEllipse(0, platY - 2, 28, 10);
  }

  private drawOperator(): void {
    const g = this.operatorGraphics;
    g.clear();

    const bodyY = 10;

    const uniformColor = this.level === 1 ? 0x5c4033 : this.level === 2 ? 0x4a5a3a : 0x3a3a3a;
    const uniformDark = this.level === 1 ? 0x3a2820 : this.level === 2 ? 0x3a4a2a : 0x2a2a2a;
    const skinColor = 0xdeb887;
    const helmetColor = this.level === 1 ? 0xc9a06c : this.level === 2 ? 0x4a5a3a : 0x2a2a2a;

    if (this.isCheeringActive) {
      this.drawCheeringOperator(g, bodyY, uniformColor, uniformDark, skinColor, helmetColor);
      return;
    }

    g.fillStyle(uniformColor, 1);
    g.fillRect(-10, bodyY - 12, 8, 14);
    g.fillRect(2, bodyY - 12, 8, 14);

    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(-6, bodyY - 14, 4);
    g.fillCircle(6, bodyY - 14, 4);

    g.fillStyle(uniformColor, 1);
    g.fillEllipse(0, bodyY + 4, 30, 18);
    g.fillStyle(uniformDark, 1);
    g.fillEllipse(-10, bodyY + 4, 6, 12);
    g.fillEllipse(10, bodyY + 4, 6, 12);

    if (this.level >= 2) {
      g.fillStyle(0xcc4400, 1);
      g.fillCircle(-12, bodyY - 4, 5);
      g.fillCircle(12, bodyY - 4, 5);
    }

    if (this.level === 1) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
      g.fillStyle(0xd9b07c, 1);
      g.fillCircle(-2, bodyY - 6, 4);
    } else if (this.level === 2) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.fillStyle(0x3a4a2a, 1);
      g.fillCircle(-3, bodyY - 8, 5);

      g.lineStyle(2, 0x2a3a1a, 1);
      g.strokeCircle(0, bodyY - 5, 10);
    } else {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);

      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, bodyY - 14, 20, 8);
      g.fillStyle(0x3a5a6a, 0.5);
      g.fillRect(-8, bodyY - 13, 6, 6);

      g.lineStyle(2, 0xb8860b, 1);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }

  private drawCheeringOperator(
    g: Phaser.GameObjects.Graphics,
    bodyY: number,
    uniformColor: number,
    uniformDark: number,
    skinColor: number,
    helmetColor: number
  ): void {
    const pumpOffset = this.cheerArmAngle * 8;

    g.fillStyle(uniformColor, 1);
    g.fillEllipse(0, bodyY + 4, 30, 18);
    g.fillStyle(uniformDark, 1);
    g.fillEllipse(-10, bodyY + 4, 6, 12);
    g.fillEllipse(10, bodyY + 4, 6, 12);

    g.fillStyle(uniformColor, 1);
    g.fillRect(-4, bodyY - 18 - pumpOffset, 8, 18);

    g.fillStyle(0x2a2a2a, 1);
    g.fillCircle(0, bodyY - 20 - pumpOffset, 5);

    g.fillStyle(uniformColor, 1);
    g.fillRect(8, bodyY - 4, 8, 10);
    g.fillStyle(skinColor, 1);
    g.fillCircle(12, bodyY + 4, 4);

    if (this.level === 1) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 10);
    } else if (this.level === 2) {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 5, 12);
      g.lineStyle(2, 0x2a3a1a, 1);
      g.strokeCircle(0, bodyY - 5, 10);

      g.fillStyle(0xcc4400, 1);
      g.fillCircle(-12, bodyY - 4, 5);
      g.fillCircle(12, bodyY - 4, 5);
    } else {
      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-10, bodyY - 14, 20, 8);
      g.lineStyle(2, 0xb8860b, 1);
      g.strokeCircle(0, bodyY - 6, 14);
    }
  }

  private drawCannon(): void {
    const g = this.cannonGraphics;
    g.clear();

    const bodyY = 10;
    const recoilOffset = this.recoilProgress * 8;

    const barrelColor = this.level === 1 ? 0x4a4a4a : this.level === 2 ? 0x3a3a3a : 0x2a2a2a;
    const barrelHighlight = this.level === 1 ? 0x5a5a5a : this.level === 2 ? 0x4a4a4a : 0x3a3a3a;
    const brassColor = 0xb8860b;

    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const barrelWidth = 8 + this.level * 2;

    g.fillStyle(barrelColor, 1);
    g.fillCircle(0, bodyY - 6, 10 + this.level * 2);
    g.fillStyle(barrelHighlight, 1);
    g.fillCircle(-2, bodyY - 8, 4 + this.level);

    g.fillStyle(barrelColor, 1);
    g.fillRect(
      -barrelWidth / 2,
      bodyY - barrelLength + recoilOffset,
      barrelWidth,
      barrelLength - 4
    );

    g.fillStyle(barrelHighlight, 1);
    g.fillRect(-barrelWidth / 2 + 2, bodyY - barrelLength + 4 + recoilOffset, 3, barrelLength - 10);

    g.fillStyle(barrelColor, 1);
    g.fillRect(-barrelWidth / 2 - 2, bodyY - barrelLength - 4 + recoilOffset, barrelWidth + 4, 6);

    g.lineStyle(2, barrelHighlight, 1);
    g.strokeRect(-barrelWidth / 2 - 1, bodyY - barrelLength / 2 + recoilOffset, barrelWidth + 2, 4);

    if (this.level >= 2) {
      g.fillStyle(brassColor, 1);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - barrelLength - 2 + recoilOffset, barrelWidth + 2, 3);
      g.fillRect(-barrelWidth / 2 - 1, bodyY - 8, barrelWidth + 2, 3);
    }

    if (this.level >= 3) {
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-2, bodyY - barrelLength / 2 - 4 + recoilOffset, 4, 8);

      g.fillStyle(brassColor, 1);
      g.fillRect(
        -barrelWidth / 2 - 1,
        bodyY - barrelLength / 2 - 2 + recoilOffset,
        barrelWidth + 2,
        2
      );
    }

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-14, bodyY - 10, 4, 8);
    g.fillRect(10, bodyY - 10, 4, 8);
  }

  private drawBlast(): void {
    const g = this.effectGraphics;
    g.clear();

    if (this.blastTimer <= 0) return;

    const alpha = this.blastTimer / 0.2;
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const blastY = 10 - barrelLength - 5;

    g.fillStyle(0x666666, alpha * 0.6);
    g.fillCircle(-8, blastY - 5, 8 * (1 + (1 - alpha) * 0.5));
    g.fillCircle(8, blastY - 5, 8 * (1 + (1 - alpha) * 0.5));
    g.fillCircle(0, blastY - 10, 10 * (1 + (1 - alpha) * 0.5));

    g.fillStyle(0xffaa00, alpha * 0.8);
    g.fillCircle(0, blastY, 6);
    g.fillStyle(0xffff00, alpha);
    g.fillCircle(0, blastY, 3);

    g.lineStyle(2, 0xffaa00, alpha * 0.6);
    g.lineBetween(0, blastY, -10, blastY - 12);
    g.lineBetween(0, blastY, 10, blastY - 12);
    g.lineBetween(0, blastY, 0, blastY - 15);
  }

  destroy(): void {
    this.baseGraphics.destroy();
    this.operatorGraphics.destroy();
    this.cannonGraphics.destroy();
    this.effectGraphics.destroy();
    this.cannonContainer.destroy();
  }
}
