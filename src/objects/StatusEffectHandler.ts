import Phaser from 'phaser';

/**
 * Interface for poison stack data
 */
export interface PoisonStack {
  damage: number;
  endTime: number;
}

/**
 * Interface for burn effect data
 */
export interface BurnEffect {
  damage: number;
  endTime: number;
}

/**
 * StatusEffectHandler manages slow, freeze, poison, burn, and armor effects on creeps.
 * Extracted from Creep to reduce file size and improve maintainability.
 */
export class StatusEffectHandler {
  private scene: Phaser.Scene;
  private statusGraphics: Phaser.GameObjects.Graphics;
  
  // Slow effect
  private slowAmount: number = 0;
  private slowEndTime: number = 0;
  
  // Freeze effect (100% slow)
  private freezeEndTime: number = 0;
  
  // Poison effect
  private poisonStacks: PoisonStack[] = [];
  private poisonTickTimer: number = 0;
  
  // Burn effect (from incendiary rounds)
  private burnEffect: BurnEffect | null = null;
  private burnTickTimer: number = 0;
  
  // Armor reduction
  private armorReduction: number = 0;
  
  // Immunity (after boss dispel)
  private immunityEndTime: number = 0;
  
  // Callbacks
  private onPoisonDamage?: (damage: number) => void;
  private onBurnDamage?: (damage: number) => void;

  constructor(scene: Phaser.Scene, statusGraphics: Phaser.GameObjects.Graphics) {
    this.scene = scene;
    this.statusGraphics = statusGraphics;
  }

  /**
   * Set callback for poison damage
   */
  setOnPoisonDamage(callback: (damage: number) => void): void {
    this.onPoisonDamage = callback;
  }

  /**
   * Set callback for burn damage
   */
  setOnBurnDamage(callback: (damage: number) => void): void {
    this.onBurnDamage = callback;
  }

  /**
   * Apply slow effect (doesn't stack, refreshes duration)
   */
  applySlow(percent: number, durationMs: number): void {
    // Check immunity
    if (this.isImmune()) return;
    
    const currentTime = this.scene.time.now;
    this.slowAmount = percent;
    this.slowEndTime = currentTime + durationMs;
  }

  /**
   * Apply freeze effect (100% slow for duration)
   */
  applyFreeze(durationMs: number): void {
    // Check immunity
    if (this.isImmune()) return;
    
    const currentTime = this.scene.time.now;
    this.freezeEndTime = currentTime + durationMs;
  }

  /**
   * Clear slow effect (used by Shatter ability)
   */
  clearSlow(): void {
    this.slowAmount = 0;
    this.slowEndTime = 0;
  }

  /**
   * Apply poison effect (stacks up to 3 times)
   */
  applyPoison(damagePerSecond: number, durationMs: number): void {
    // Check immunity
    if (this.isImmune()) return;
    
    const currentTime = this.scene.time.now;
    
    // Max 3 stacks
    if (this.poisonStacks.length >= 3) {
      // Refresh oldest stack
      this.poisonStacks[0] = {
        damage: damagePerSecond,
        endTime: currentTime + durationMs
      };
    } else {
      this.poisonStacks.push({
        damage: damagePerSecond,
        endTime: currentTime + durationMs
      });
    }
  }

  /**
   * Apply burn effect (doesn't stack, replaces)
   */
  applyBurn(damagePerSecond: number, durationMs: number): void {
    // Check immunity
    if (this.isImmune()) return;
    
    const currentTime = this.scene.time.now;
    this.burnEffect = {
      damage: damagePerSecond,
      endTime: currentTime + durationMs
    };
  }

  /**
   * Apply armor reduction (stacks)
   */
  applyArmorReduction(amount: number): void {
    // Check immunity
    if (this.isImmune()) return;
    
    // Max -6 armor reduction
    this.armorReduction = Math.min(6, this.armorReduction + amount);
  }

  /**
   * Get current armor reduction
   */
  getArmorReduction(): number {
    return this.armorReduction;
  }

  /**
   * Update status effects (poison ticks, burn ticks, slow expiry, freeze expiry)
   * @returns poison damage dealt this frame (0 if none)
   */
  update(delta: number): number {
    const currentTime = this.scene.time.now;
    let poisonDamage = 0;
    
    // Process poison stacks
    if (this.poisonStacks.length > 0) {
      this.poisonTickTimer += delta;
      
      // Tick every 1000ms (1 second)
      if (this.poisonTickTimer >= 1000) {
        this.poisonTickTimer = 0;
        
        // Calculate total poison damage from active stacks (max 3)
        this.poisonStacks = this.poisonStacks.filter(stack => {
          if (currentTime < stack.endTime) {
            poisonDamage += stack.damage;
            return true;
          }
          return false;
        });
        
        // Notify of poison damage via callback
        if (poisonDamage > 0 && this.onPoisonDamage) {
          this.onPoisonDamage(poisonDamage);
        }
      }
    }
    
    // Process burn effect
    if (this.burnEffect && currentTime < this.burnEffect.endTime) {
      this.burnTickTimer += delta;
      
      // Tick every 1000ms (1 second)
      if (this.burnTickTimer >= 1000) {
        this.burnTickTimer = 0;
        
        if (this.onBurnDamage) {
          this.onBurnDamage(this.burnEffect.damage);
        }
      }
    } else if (this.burnEffect) {
      this.burnEffect = null;
    }
    
    // Clear slow if expired
    if (this.slowEndTime > 0 && currentTime >= this.slowEndTime) {
      this.slowAmount = 0;
      this.slowEndTime = 0;
    }
    
    // Clear freeze if expired
    if (this.freezeEndTime > 0 && currentTime >= this.freezeEndTime) {
      this.freezeEndTime = 0;
    }
    
    return poisonDamage;
  }

  /**
   * Draw status effect indicators
   */
  draw(currentTime: number): void {
    this.statusGraphics.clear();
    
    const isSlowed = this.slowEndTime > currentTime;
    const isFrozen = this.freezeEndTime > currentTime;
    const isPoisoned = this.poisonStacks.length > 0;
    const isBurning = this.burnEffect !== null && this.burnEffect.endTime > currentTime;
    
    // Draw freeze effect (higher priority than slow)
    if (isFrozen) {
      // Draw ice block around creep
      this.statusGraphics.fillStyle(0x87ceeb, 0.4);
      this.statusGraphics.fillRect(-15, -20, 30, 30);
      this.statusGraphics.lineStyle(2, 0xadd8e6, 0.8);
      this.statusGraphics.strokeRect(-15, -20, 30, 30);
      
      // Draw ice crystals
      this.statusGraphics.fillStyle(0xffffff, 0.8);
      this.statusGraphics.fillCircle(-10, -15, 3);
      this.statusGraphics.fillCircle(10, -10, 2);
      this.statusGraphics.fillCircle(-5, 5, 2);
      this.statusGraphics.fillCircle(8, 0, 3);
    } else if (isSlowed) {
      // Draw ice particles around creep
      this.statusGraphics.fillStyle(0x87ceeb, 0.6);
      for (let i = 0; i < 4; i++) {
        const angle = (currentTime / 500 + i * Math.PI / 2) % (Math.PI * 2);
        const x = Math.cos(angle) * 18;
        const y = Math.sin(angle) * 10 - 5;
        this.statusGraphics.fillCircle(x, y, 3);
      }
    }
    
    if (isPoisoned) {
      // Draw poison bubbles
      this.statusGraphics.fillStyle(0x00ff00, 0.5);
      const stackCount = Math.min(this.poisonStacks.length, 3);
      for (let i = 0; i < stackCount; i++) {
        const angle = (currentTime / 400 + i * Math.PI * 2 / 3) % (Math.PI * 2);
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 8 + 5;
        this.statusGraphics.fillCircle(x, y, 2 + i);
      }
    }
    
    if (isBurning) {
      // Draw fire particles
      this.statusGraphics.fillStyle(0xff6600, 0.7);
      for (let i = 0; i < 3; i++) {
        const offset = (currentTime / 100 + i * 100) % 300;
        const x = -8 + i * 8;
        const y = -10 - (offset % 15);
        const size = 3 + Math.sin(currentTime / 100 + i) * 2;
        this.statusGraphics.fillCircle(x, y, size);
      }
      // Draw orange glow
      this.statusGraphics.fillStyle(0xffaa00, 0.3);
      for (let i = 0; i < 2; i++) {
        const offset = (currentTime / 150 + i * 150) % 300;
        const x = -4 + i * 8;
        const y = -8 - (offset % 12);
        this.statusGraphics.fillCircle(x, y, 2);
      }
    }
  }

  /**
   * Get current slow multiplier (1 = no slow, 0 = fully slowed/frozen)
   */
  getSpeedMultiplier(): number {
    const currentTime = this.scene.time.now;
    
    // Frozen = completely stopped
    if (this.freezeEndTime > currentTime) {
      return 0;
    }
    
    return this.slowEndTime > currentTime ? (1 - this.slowAmount) : 1;
  }

  /**
   * Check if currently slowed
   */
  isSlowed(): boolean {
    return this.slowEndTime > this.scene.time.now;
  }

  /**
   * Check if currently frozen
   */
  isFrozen(): boolean {
    return this.freezeEndTime > this.scene.time.now;
  }

  /**
   * Check if currently burning
   */
  isBurning(): boolean {
    return this.burnEffect !== null && this.burnEffect.endTime > this.scene.time.now;
  }

  /**
   * Check if currently poisoned
   */
  isPoisoned(): boolean {
    return this.poisonStacks.length > 0;
  }

  /**
   * Get number of active poison stacks
   */
  getPoisonStackCount(): number {
    return this.poisonStacks.length;
  }

  /**
   * Reset all status effects
   */
  reset(): void {
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.freezeEndTime = 0;
    this.poisonStacks = [];
    this.poisonTickTimer = 0;
    this.burnEffect = null;
    this.burnTickTimer = 0;
    this.armorReduction = 0;
    this.immunityEndTime = 0;
  }

  /**
   * Dispel all status effects (used by bosses)
   * Returns true if any effects were dispelled
   * @param immunityDurationMs - duration of immunity after dispelling (0 = no immunity)
   */
  dispelAll(immunityDurationMs: number = 0): boolean {
    const hadEffects = this.isSlowed() || this.isPoisoned() || this.isFrozen() || this.isBurning();
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.freezeEndTime = 0;
    this.poisonStacks = [];
    this.burnEffect = null;
    this.armorReduction = 0;
    
    // Grant immunity after dispel
    if (immunityDurationMs > 0) {
      this.immunityEndTime = this.scene.time.now + immunityDurationMs;
    }
    
    return hadEffects;
  }

  /**
   * Check if currently immune to status effects
   */
  isImmune(): boolean {
    return this.immunityEndTime > this.scene.time.now;
  }

  /**
   * Clear graphics
   */
  clear(): void {
    this.statusGraphics.clear();
  }
}
