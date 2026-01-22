import Phaser from 'phaser';

export interface PoisonStack {
  damage: number;
  endTime: number;
}

export interface BurnEffect {
  damage: number;
  endTime: number;
}

export class StatusEffectHandler {
  private scene: Phaser.Scene;
  private statusGraphics: Phaser.GameObjects.Graphics;

  private slowAmount: number = 0;
  private slowEndTime: number = 0;

  private freezeEndTime: number = 0;

  private poisonStacks: PoisonStack[] = [];
  private poisonTickTimer: number = 0;

  private burnStacks: BurnEffect[] = [];
  private burnTickTimer: number = 0;
  private static readonly MAX_BURN_STACKS = 3;

  private armorReduction: number = 0;
  private static readonly MAX_ARMOR_REDUCTION = 25;

  private brittleEndTime: number = 0;

  private immunityEndTime: number = 0;

  private onPoisonDamage?: (damage: number) => void;
  private onBurnDamage?: (damage: number) => void;

  constructor(scene: Phaser.Scene, statusGraphics: Phaser.GameObjects.Graphics) {
    this.scene = scene;
    this.statusGraphics = statusGraphics;
  }

  setOnPoisonDamage(callback: (damage: number) => void): void {
    this.onPoisonDamage = callback;
  }

  setOnBurnDamage(callback: (damage: number) => void): void {
    this.onBurnDamage = callback;
  }

  applySlow(percent: number, durationMs: number): void {
    if (this.isImmune()) return;

    const currentTime = this.scene.time.now;
    this.slowAmount = percent;
    this.slowEndTime = currentTime + durationMs;
  }

  applyFreeze(durationMs: number): void {
    if (this.isImmune()) return;

    const currentTime = this.scene.time.now;
    this.freezeEndTime = currentTime + durationMs;
  }

  clearSlow(): void {
    this.slowAmount = 0;
    this.slowEndTime = 0;
  }

  applyPoison(damagePerSecond: number, durationMs: number): void {
    if (this.isImmune()) return;

    const currentTime = this.scene.time.now;

    if (this.poisonStacks.length >= 3) {
      this.poisonStacks[0] = {
        damage: damagePerSecond,
        endTime: currentTime + durationMs,
      };
    } else {
      this.poisonStacks.push({
        damage: damagePerSecond,
        endTime: currentTime + durationMs,
      });
    }
  }

  applyBurn(damagePerSecond: number, durationMs: number): void {
    if (this.isImmune()) return;

    const currentTime = this.scene.time.now;
    const newBurn: BurnEffect = {
      damage: damagePerSecond,
      endTime: currentTime + durationMs,
    };

    if (this.burnStacks.length >= StatusEffectHandler.MAX_BURN_STACKS) {
      // Replace oldest (first) stack
      this.burnStacks.shift();
    }
    this.burnStacks.push(newBurn);
  }

  applyArmorReduction(amount: number): void {
    if (this.isImmune()) return;

    this.armorReduction = Math.min(
      StatusEffectHandler.MAX_ARMOR_REDUCTION,
      this.armorReduction + amount
    );
  }

  applyBrittle(durationMs: number): void {
    if (this.isImmune()) return;

    const currentTime = this.scene.time.now;
    this.brittleEndTime = currentTime + durationMs;
  }

  isBrittle(): boolean {
    return this.brittleEndTime > this.scene.time.now;
  }

  getBurnStackCount(): number {
    return this.burnStacks.length;
  }

  getArmorReduction(): number {
    return this.armorReduction;
  }

  update(delta: number): number {
    const currentTime = this.scene.time.now;
    let poisonDamage = 0;

    if (this.poisonStacks.length > 0) {
      this.poisonTickTimer += delta;

      if (this.poisonTickTimer >= 1000) {
        this.poisonTickTimer = 0;

        this.poisonStacks = this.poisonStacks.filter((stack) => {
          if (currentTime < stack.endTime) {
            poisonDamage += stack.damage;
            return true;
          }
          return false;
        });

        if (poisonDamage > 0 && this.onPoisonDamage) {
          this.onPoisonDamage(poisonDamage);
        }
      }
    }

    // Filter expired burn stacks
    this.burnStacks = this.burnStacks.filter((stack) => currentTime < stack.endTime);

    if (this.burnStacks.length > 0) {
      this.burnTickTimer += delta;

      if (this.burnTickTimer >= 1000) {
        this.burnTickTimer = 0;

        // Sum damage from all active burn stacks
        let totalBurnDamage = 0;
        for (const stack of this.burnStacks) {
          totalBurnDamage += stack.damage;
        }

        if (totalBurnDamage > 0 && this.onBurnDamage) {
          this.onBurnDamage(totalBurnDamage);
        }
      }
    }

    if (this.slowEndTime > 0 && currentTime >= this.slowEndTime) {
      this.slowAmount = 0;
      this.slowEndTime = 0;
    }

    if (this.freezeEndTime > 0 && currentTime >= this.freezeEndTime) {
      this.freezeEndTime = 0;
    }

    return poisonDamage;
  }

  draw(currentTime: number): void {
    this.statusGraphics.clear();

    const isSlowed = this.slowEndTime > currentTime;
    const isFrozen = this.freezeEndTime > currentTime;
    const isPoisoned = this.poisonStacks.length > 0;
    const isBurning = this.burnStacks.length > 0;
    const isBrittle = this.brittleEndTime > currentTime;

    if (isFrozen) {
      this.statusGraphics.fillStyle(0x87ceeb, 0.4);
      this.statusGraphics.fillRect(-15, -20, 30, 30);
      this.statusGraphics.lineStyle(2, 0xadd8e6, 0.8);
      this.statusGraphics.strokeRect(-15, -20, 30, 30);

      this.statusGraphics.fillStyle(0xffffff, 0.8);
      this.statusGraphics.fillCircle(-10, -15, 3);
      this.statusGraphics.fillCircle(10, -10, 2);
      this.statusGraphics.fillCircle(-5, 5, 2);
      this.statusGraphics.fillCircle(8, 0, 3);
    } else if (isSlowed) {
      this.statusGraphics.fillStyle(0x87ceeb, 0.6);
      for (let i = 0; i < 4; i++) {
        const angle = (currentTime / 500 + (i * Math.PI) / 2) % (Math.PI * 2);
        const x = Math.cos(angle) * 18;
        const y = Math.sin(angle) * 10 - 5;
        this.statusGraphics.fillCircle(x, y, 3);
      }
    }

    if (isPoisoned) {
      this.statusGraphics.fillStyle(0x00ff00, 0.5);
      const stackCount = Math.min(this.poisonStacks.length, 3);
      for (let i = 0; i < stackCount; i++) {
        const angle = (currentTime / 400 + (i * Math.PI * 2) / 3) % (Math.PI * 2);
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 8 + 5;
        this.statusGraphics.fillCircle(x, y, 2 + i);
      }
    }

    if (isBurning) {
      // Scale visual intensity based on stack count
      const burnIntensity = Math.min(this.burnStacks.length, 5);
      const particleCount = 2 + burnIntensity;

      this.statusGraphics.fillStyle(0xff6600, 0.7);
      for (let i = 0; i < particleCount; i++) {
        const offset = (currentTime / 100 + i * 100) % 300;
        const x = -10 + i * (20 / particleCount);
        const y = -10 - (offset % 15);
        const size = 2 + Math.sin(currentTime / 100 + i) * 2 + burnIntensity * 0.5;
        this.statusGraphics.fillCircle(x, y, size);
      }

      this.statusGraphics.fillStyle(0xffaa00, 0.3 + burnIntensity * 0.1);
      for (let i = 0; i < burnIntensity; i++) {
        const offset = (currentTime / 150 + i * 150) % 300;
        const x = -6 + i * 4;
        const y = -8 - (offset % 12);
        this.statusGraphics.fillCircle(x, y, 2);
      }
    }

    if (isBrittle) {
      // Draw blue cracked overlay for brittle status
      this.statusGraphics.lineStyle(2, 0x4488ff, 0.8);
      this.statusGraphics.lineBetween(-12, -18, -5, -8);
      this.statusGraphics.lineBetween(-5, -8, -10, 2);
      this.statusGraphics.lineBetween(-5, -8, 5, -5);
      this.statusGraphics.lineBetween(5, -5, 12, -15);
      this.statusGraphics.lineBetween(5, -5, 8, 5);

      // Shimmer effect
      const shimmer = ((currentTime / 200) % 1) * 0.5 + 0.3;
      this.statusGraphics.fillStyle(0x88ccff, shimmer);
      this.statusGraphics.fillCircle(-8, -12, 2);
      this.statusGraphics.fillCircle(8, -10, 2);
    }
  }

  getSpeedMultiplier(): number {
    const currentTime = this.scene.time.now;

    if (this.freezeEndTime > currentTime) {
      return 0;
    }

    return this.slowEndTime > currentTime ? 1 - this.slowAmount : 1;
  }

  isSlowed(): boolean {
    return this.slowEndTime > this.scene.time.now;
  }

  isFrozen(): boolean {
    return this.freezeEndTime > this.scene.time.now;
  }

  isBurning(): boolean {
    return this.burnStacks.length > 0;
  }

  isPoisoned(): boolean {
    return this.poisonStacks.length > 0;
  }

  getPoisonStackCount(): number {
    return this.poisonStacks.length;
  }

  reset(): void {
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.freezeEndTime = 0;
    this.poisonStacks = [];
    this.poisonTickTimer = 0;
    this.burnStacks = [];
    this.burnTickTimer = 0;
    this.armorReduction = 0;
    this.brittleEndTime = 0;
    this.immunityEndTime = 0;
  }

  dispelAll(immunityDurationMs: number = 0): boolean {
    const hadEffects = this.isSlowed() || this.isPoisoned() || this.isFrozen() || this.isBurning();
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.freezeEndTime = 0;
    this.poisonStacks = [];
    this.burnStacks = [];
    this.armorReduction = 0;
    this.brittleEndTime = 0;

    if (immunityDurationMs > 0) {
      this.immunityEndTime = this.scene.time.now + immunityDurationMs;
    }

    return hadEffects;
  }

  isImmune(): boolean {
    return this.immunityEndTime > this.scene.time.now;
  }

  clear(): void {
    this.statusGraphics.clear();
  }
}
