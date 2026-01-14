import Phaser from 'phaser';

export class RapidFireAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;

  private baseGraphics: Phaser.GameObjects.Graphics;

  private turretContainer: Phaser.GameObjects.Container;
  private turretGraphics: Phaser.GameObjects.Graphics;
  private barrelGraphics: Phaser.GameObjects.Graphics;
  private gunnerGraphics: Phaser.GameObjects.Graphics;
  private muzzleFlashGraphics: Phaser.GameObjects.Graphics;

  private turretAngle: number = 0;
  private targetAngle: number = 0;
  private barrelRotation: number = 0;
  private barrelSpinSpeed: number = 0;
  private isFiring: boolean = false;
  private fireCooldown: number = 0;

  private isCheeringActive: boolean = false;
  private cheerTimer: number = 0;
  private cheerArmAngle: number = 0;

  private muzzleFlashTimer: number = 0;

  private readonly TURRET_Y = [-29, -35, -41, -41];

  private readonly BARREL_LENGTH = [25, 30, 45, 45];

  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;

    this.baseGraphics = scene.add.graphics();

    this.turretContainer = scene.add.container(0, this.TURRET_Y[level - 1]);
    this.turretContainer.setScale(1.3);

    this.turretGraphics = scene.add.graphics();
    this.barrelGraphics = scene.add.graphics();
    this.gunnerGraphics = scene.add.graphics();
    this.muzzleFlashGraphics = scene.add.graphics();

    this.turretContainer.add([
      this.turretGraphics,
      this.barrelGraphics,
      this.gunnerGraphics,
      this.muzzleFlashGraphics
    ]);

    this.container.add([this.baseGraphics, this.turretContainer]);

    this.drawBase();
    this.drawTurret();
    this.drawBarrels();
    this.drawGunner();
  }

  setLevel(level: number): void {
    this.level = level;

    this.turretContainer.setY(this.TURRET_Y[level - 1]);
    this.drawBase();
    this.drawTurret();
    this.drawBarrels();
    this.drawGunner();
  }

  update(delta: number): void {
    const dt = delta / 1000;

    const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.turretAngle);
    const rotationSpeed = 5.0;

    if (Math.abs(angleDiff) > 0.01) {
      this.turretAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed * dt);
      this.turretAngle = Phaser.Math.Angle.Wrap(this.turretAngle);
    }

    if (this.isFiring || this.barrelSpinSpeed > 0.1) {

      if (this.isFiring) {
        const maxSpeed = 20 + this.level * 10;
        this.barrelSpinSpeed = Math.min(this.barrelSpinSpeed + 50 * dt, maxSpeed);
      } else {
        this.barrelSpinSpeed = Math.max(0, this.barrelSpinSpeed - 10 * dt);
      }

      this.barrelRotation += this.barrelSpinSpeed * dt;
      this.drawBarrels();
    }

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0) {
        this.isFiring = false;
      }
    }

    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer -= dt;
      this.drawMuzzleFlash();
    }

    if (this.isCheeringActive) {
      this.cheerTimer -= dt;

      if (this.cheerTimer <= 0) {
        this.isCheeringActive = false;
        this.cheerArmAngle = 0;
      } else {

        this.cheerArmAngle = Math.sin(this.cheerTimer * 20) * 0.5;
      }
      this.drawGunner();
    }

    this.turretContainer.setRotation(this.turretAngle);
  }

  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {

    const turretWorldY = towerY + this.TURRET_Y[this.level - 1];
    this.targetAngle = Phaser.Math.Angle.Between(towerX, turretWorldY, targetX, targetY) + Math.PI / 2;
  }

  clearTarget(): void {

  }

  onFire(): { x: number; y: number } {
    this.isFiring = true;
    this.fireCooldown = 0.12;
    this.muzzleFlashTimer = 0.06;
    this.drawMuzzleFlash();

    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const turretY = this.TURRET_Y[this.level - 1];

    const tipLocalX = Math.sin(this.turretAngle) * barrelLength;
    const tipLocalY = -Math.cos(this.turretAngle) * barrelLength + turretY;

    return { x: tipLocalX, y: tipLocalY };
  }

  getProjectileSpawnOffset(): { x: number; y: number } {
    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const turretY = this.TURRET_Y[this.level - 1];

    const tipLocalX = Math.sin(this.turretAngle) * barrelLength;
    const tipLocalY = -Math.cos(this.turretAngle) * barrelLength + turretY;

    return { x: tipLocalX, y: tipLocalY };
  }

  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = 0.8;
  }

  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();

    const baseWidth = 30;

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 25, 52, 18);

    if (this.level === 1) {

      g.fillStyle(0x8b7355, 1);
      g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
      g.lineStyle(1, 0x6b5344, 0.4);
      for (let y = 8; y < 22; y += 6) {
        g.lineBetween(-baseWidth + 2, y, baseWidth - 2, y);
      }

      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-18, -52, 36, 57);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-14, -47, 28, 49);
    } else if (this.level === 2) {

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth + 3, 6, (baseWidth - 3) * 2, 18);
      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-baseWidth - 5, 5, 8, 20);
      g.fillRect(baseWidth - 3, 5, 8, 20);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-22, 14, 3);
      g.fillCircle(22, 14, 3);

      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-24, -64, 48, 69);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-20, -59, 40, 61);

      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(20, -45, 10, 30);
      g.fillStyle(0xffcc00, 0.6);
      g.fillCircle(25, -30, 4);
    } else {

      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-baseWidth + 4, 4, (baseWidth - 4) * 2, 20);
      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-baseWidth - 8, 2, 12, 24);
      g.fillRect(baseWidth - 4, 2, 12, 24);
      g.fillStyle(0x2a2a2a, 1);
      for (let x = -28; x <= 28; x += 14) {
        g.fillCircle(x, 12, 3);
      }

      g.fillStyle(0xffcc00, 1);
      g.fillRect(-baseWidth - 6, -2, 10, 6);
      g.fillRect(baseWidth - 4, -2, 10, 6);
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(-baseWidth - 3, -2, 3, 6);
      g.fillRect(baseWidth, -2, 3, 6);

      g.fillStyle(0x6a6a6a, 1);
      g.fillRect(-30, -76, 60, 78);
      g.fillStyle(0x7a7a7a, 1);
      g.fillRect(-26, -71, 52, 69);

      g.fillStyle(0x5a5a5a, 0.9);
      g.fillRect(-36, -61, 10, 45);
      g.fillRect(26, -61, 10, 45);

      g.fillStyle(0x4a4a4a, 1);
      g.fillRect(-32, -55, 8, 35);
      g.fillRect(24, -55, 8, 35);
      g.fillStyle(0xffcc00, 0.8);
      for (let y = -50; y < -20; y += 6) {
        g.fillRect(-30, y, 4, 4);
        g.fillRect(26, y, 4, 4);
      }
    }

    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(-8, -40, 4, 12);
    g.fillRect(4, -40, 4, 12);
  }

  private drawTurret(): void {
    const g = this.turretGraphics;
    g.clear();

    if (this.level === 1) {

      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 14);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 10);
      g.lineStyle(2, 0x3a3a3a, 1);
      g.strokeCircle(0, 0, 12);
    } else if (this.level === 2) {

      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 18);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 14);

      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.arc(0, -8, 14, -0.9, 0.9, false);
      g.lineTo(10, 0);
      g.lineTo(-10, 0);
      g.closePath();
      g.fillPath();
    } else {

      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, 0, 22);
      g.fillStyle(0x5a5a5a, 1);
      g.fillCircle(0, 0, 18);

      g.fillStyle(0x3a3a3a, 1);
      g.beginPath();
      g.arc(0, -10, 18, -1.0, 1.0, false);
      g.lineTo(14, 0);
      g.lineTo(-14, 0);
      g.closePath();
      g.fillPath();

      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-3, -35, 6, 10);
      g.fillStyle(0xff0000, 0.8);
      g.fillCircle(0, -28, 3);
      g.lineStyle(1, 0xff0000, 0.4);
      g.strokeCircle(0, -28, 6);
    }
  }

  private drawBarrels(): void {
    const g = this.barrelGraphics;
    g.clear();

    if (this.level === 1) {

      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-3, -25, 6, 20);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(0, -25, 3);
    } else if (this.level === 2) {

      g.fillStyle(0x3a3a3a, 1);
      g.fillRect(-7, -30, 5, 24);
      g.fillRect(2, -30, 5, 24);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(-4.5, -30, 3);
      g.fillCircle(4.5, -30, 3);
    } else {

      const barrelCount = 6;
      const barrelSpread = 7;

      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(0, -12, 10);
      g.fillStyle(0x4a4a4a, 1);
      g.fillCircle(0, -12, 7);

      for (let i = 0; i < barrelCount; i++) {
        const angle = (i / barrelCount) * Math.PI * 2 + this.barrelRotation;
        const bx = Math.cos(angle) * barrelSpread;
        const by = Math.sin(angle) * barrelSpread - 12;

        const depthFactor = (Math.sin(angle) + 1) / 2;
        const barrelThickness = 2.5 + depthFactor * 1.5;

        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(bx, by, barrelThickness);

        if (by < -8) {
          g.fillStyle(0x2a2a2a, 1);
          g.fillRect(bx - 2, -45, 4, 33 + by + 12);
          g.fillStyle(0x1a1a1a, 1);
          g.fillCircle(bx, -45, 2);
        }
      }

      if (this.isFiring) {
        g.fillStyle(0xff4400, 0.6);
        g.fillCircle(0, -12, 4);
      } else {
        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(0, -12, 4);
      }
    }
  }

  private drawGunner(): void {
    const g = this.gunnerGraphics;
    g.clear();

    const bodyY = 20;

    const uniformColor = 0x556b2f;
    const uniformDark = 0x3d4d23;
    const helmetColor = 0x4a5d23;
    const helmetDark = 0x3a4a1a;
    const helmetLight = 0x5a6d33;
    const metalColor = 0x4a4a4a;
    const metalDark = 0x2a2a2a;
    const gloveColor = 0x3a3a2a;
    const skinColor = 0xdeb887;

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(-10, bodyY + 12, 20, 8);
    g.fillStyle(metalDark, 1);
    g.fillRect(-12, bodyY + 10, 4, 12);
    g.fillRect(8, bodyY + 10, 4, 12);

    if (this.level === 1) {

      if (this.isCheeringActive) {

        const armSpread = this.cheerArmAngle * 8;
        g.fillStyle(uniformColor, 1);

        g.fillRect(-18 - armSpread, bodyY - 10, 8, 18);
        g.fillRect(10 + armSpread, bodyY - 10, 8, 18);

        g.fillStyle(skinColor, 1);
        g.fillCircle(-14 - armSpread, bodyY - 12, 5);
        g.fillCircle(14 + armSpread, bodyY - 12, 5);
      } else {

        g.fillStyle(uniformColor, 1);
        g.fillRect(-14, bodyY - 8, 7, 16);
        g.fillRect(7, bodyY - 8, 7, 16);

        g.fillStyle(uniformDark, 1);
        g.fillRect(-14, bodyY - 8, 2, 16);
        g.fillRect(12, bodyY - 8, 2, 16);

        g.fillStyle(skinColor, 1);
        g.fillCircle(-10, bodyY - 10, 4);
        g.fillCircle(10, bodyY - 10, 4);
      }

      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 4, 24, 12);

      g.fillStyle(uniformDark, 1);
      g.fillEllipse(-9, bodyY + 4, 6, 10);
      g.fillEllipse(9, bodyY + 4, 6, 10);

      g.fillStyle(0x657b3f, 1);
      g.fillEllipse(0, bodyY + 6, 8, 6);

      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 4, 12);

      g.fillStyle(helmetLight, 1);
      g.fillCircle(-2, bodyY - 6, 5);

      g.fillStyle(helmetDark, 1);
      g.beginPath();
      g.arc(0, bodyY - 4, 12, 0.3, Math.PI - 0.3, false);
      g.strokePath();

      g.fillStyle(helmetDark, 1);
      g.fillEllipse(0, bodyY - 14, 10, 4);

    } else if (this.level === 2) {

      if (this.isCheeringActive) {
        const armSpread = this.cheerArmAngle * 10;
        g.fillStyle(uniformColor, 1);
        g.fillRect(-20 - armSpread, bodyY - 12, 9, 20);
        g.fillRect(11 + armSpread, bodyY - 12, 9, 20);

        g.fillStyle(gloveColor, 1);
        g.fillCircle(-15 - armSpread, bodyY - 14, 5);
        g.fillCircle(15 + armSpread, bodyY - 14, 5);
      } else {

        g.fillStyle(uniformColor, 1);
        g.fillRect(-16, bodyY - 10, 8, 18);
        g.fillRect(8, bodyY - 10, 8, 18);
        g.fillStyle(uniformDark, 1);
        g.fillRect(-16, bodyY - 10, 2, 18);
        g.fillRect(14, bodyY - 10, 2, 18);

        g.fillStyle(gloveColor, 1);
        g.fillCircle(-12, bodyY - 12, 5);
        g.fillCircle(12, bodyY - 12, 5);
      }

      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 4, 28, 14);

      g.fillStyle(0x4a4a4a, 1);
      g.fillEllipse(0, bodyY + 6, 22, 10);

      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(-12, bodyY + 2, 6);
      g.fillCircle(12, bodyY + 2, 6);

      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 6, 14);

      g.fillStyle(helmetDark, 1);
      g.fillCircle(-5, bodyY - 8, 4);
      g.fillCircle(4, bodyY - 4, 5);
      g.fillCircle(-3, bodyY - 2, 3);

      g.fillStyle(helmetLight, 1);
      g.fillCircle(-3, bodyY - 9, 4);

      g.fillStyle(metalDark, 1);
      g.fillRect(-14, bodyY - 7, 28, 3);

      g.fillStyle(0x2a2a2a, 1);
      g.fillEllipse(0, bodyY - 16, 12, 5);
      g.fillStyle(0x444444, 1);
      g.fillEllipse(-4, bodyY - 16, 4, 3);
      g.fillEllipse(4, bodyY - 16, 4, 3);

    } else {

      if (this.isCheeringActive) {
        const armSpread = this.cheerArmAngle * 12;
        g.fillStyle(uniformColor, 1);
        g.fillRect(-22 - armSpread, bodyY - 14, 10, 22);
        g.fillRect(12 + armSpread, bodyY - 14, 10, 22);

        g.fillStyle(metalDark, 1);
        g.fillCircle(-17 - armSpread, bodyY, 5);
        g.fillCircle(17 + armSpread, bodyY, 5);

        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(-17 - armSpread, bodyY - 16, 6);
        g.fillCircle(17 + armSpread, bodyY - 16, 6);
      } else {

        g.fillStyle(uniformColor, 1);
        g.fillRect(-18, bodyY - 12, 9, 20);
        g.fillRect(9, bodyY - 12, 9, 20);
        g.fillStyle(uniformDark, 1);
        g.fillRect(-18, bodyY - 12, 2, 20);
        g.fillRect(16, bodyY - 12, 2, 20);

        g.fillStyle(metalDark, 1);
        g.fillCircle(-13, bodyY + 4, 5);
        g.fillCircle(13, bodyY + 4, 5);

        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(-13, bodyY - 14, 6);
        g.fillCircle(13, bodyY - 14, 6);

        g.fillStyle(0x2a2a2a, 1);
        g.fillCircle(-13, bodyY - 14, 3);
        g.fillCircle(13, bodyY - 14, 3);
      }

      g.fillStyle(uniformColor, 1);
      g.fillEllipse(0, bodyY + 5, 32, 16);

      g.fillStyle(0x4a4a4a, 1);
      g.fillEllipse(0, bodyY + 7, 26, 12);

      g.fillStyle(0x5a5a5a, 1);
      g.fillRect(-8, bodyY + 2, 16, 10);

      g.fillStyle(0x3a3a3a, 1);
      for (let i = 0; i < 4; i++) {
        g.fillRect(-7, bodyY + 3 + i * 2.5, 14, 1);
      }

      g.fillStyle(metalColor, 1);
      g.fillEllipse(-14, bodyY + 2, 8, 10);
      g.fillEllipse(14, bodyY + 2, 8, 10);
      g.fillStyle(0x5a5a5a, 1);
      g.fillEllipse(-14, bodyY + 1, 5, 7);
      g.fillEllipse(14, bodyY + 1, 5, 7);

      g.lineStyle(2, 0x3a4a3a, 1);
      g.lineBetween(5, bodyY + 6, 8, bodyY - 8);

      g.fillStyle(0x2a2a2a, 1);
      g.fillRect(-12, bodyY + 8, 6, 8);

      g.lineStyle(2, 0x1a1a1a, 1);
      g.lineBetween(-9, bodyY + 8, -9, bodyY - 2);

      g.fillStyle(helmetColor, 1);
      g.fillCircle(0, bodyY - 8, 16);

      g.fillStyle(helmetDark, 1);
      g.fillCircle(-6, bodyY - 10, 5);
      g.fillCircle(5, bodyY - 6, 6);
      g.fillCircle(-2, bodyY - 4, 4);
      g.fillCircle(7, bodyY - 12, 4);

      g.fillStyle(helmetLight, 1);
      g.fillCircle(-4, bodyY - 12, 5);

      g.fillStyle(metalDark, 1);
      g.fillRect(-18, bodyY - 10, 4, 8);
      g.fillRect(14, bodyY - 10, 4, 8);

      g.fillStyle(metalDark, 1);
      g.fillRect(-5, bodyY - 22, 10, 6);
      g.fillStyle(metalColor, 1);
      g.fillRect(-4, bodyY - 21, 8, 4);

      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(-3, bodyY - 24, 3);
      g.fillCircle(3, bodyY - 24, 3);

      g.fillStyle(metalDark, 1);
      g.fillCircle(-15, bodyY - 6, 5);
      g.fillCircle(15, bodyY - 6, 5);
      g.fillStyle(0x3a3a3a, 1);
      g.fillCircle(-15, bodyY - 6, 3);
      g.fillCircle(15, bodyY - 6, 3);

      g.fillStyle(0x4a5a3a, 1);
      g.beginPath();
      g.arc(0, bodyY - 8, 14, Math.PI * 0.2, Math.PI * 0.8, false);
      g.strokePath();
    }
  }

  private drawMuzzleFlash(): void {
    const g = this.muzzleFlashGraphics;
    g.clear();

    if (this.muzzleFlashTimer <= 0) return;

    const barrelLength = this.BARREL_LENGTH[this.level - 1];
    const flashY = -barrelLength - 5;

    const alpha = this.muzzleFlashTimer / 0.06;
    const size = 5 + this.level * 2;

    g.fillStyle(0xffff00, alpha * 0.8);
    g.fillCircle(0, flashY, size);
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, flashY, size * 0.5);

    g.fillStyle(0xffaa00, alpha * 0.6);
    for (let i = 0; i < 2 + this.level; i++) {
      const sparkX = (Math.random() - 0.5) * size * 1.5;
      const sparkY = flashY + (Math.random() - 0.5) * size;
      g.fillCircle(sparkX, sparkY, 1 + Math.random());
    }
  }

  destroy(): void {
    this.baseGraphics.destroy();
    this.turretGraphics.destroy();
    this.barrelGraphics.destroy();
    this.gunnerGraphics.destroy();
    this.muzzleFlashGraphics.destroy();
    this.turretContainer.destroy();
  }
}
