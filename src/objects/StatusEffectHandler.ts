import Phaser from 'phaser';

/**
 * Interface for poison stack data
 */
export interface PoisonStack {
  damage: number;
  endTime: number;
}

/**
 * StatusEffectHandler manages slow and poison effects on creeps.
 * Extracted from Creep to reduce file size and improve maintainability.
 */
export class StatusEffectHandler {
  private scene: Phaser.Scene;
  private statusGraphics: Phaser.GameObjects.Graphics;
  
  // Slow effect
  private slowAmount: number = 0;
  private slowEndTime: number = 0;
  
  // Poison effect
  private poisonStacks: PoisonStack[] = [];
  private poisonTickTimer: number = 0;
  
  // Immunity (after boss dispel)
  private immunityEndTime: number = 0;
  
  // Callback for poison damage
  private onPoisonDamage?: (damage: number) => void;

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
   * Update status effects (poison ticks, slow expiry)
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
    
    // Clear slow if expired
    if (this.slowEndTime > 0 && currentTime >= this.slowEndTime) {
      this.slowAmount = 0;
      this.slowEndTime = 0;
    }
    
    return poisonDamage;
  }

  /**
   * Draw status effect indicators
   */
  draw(currentTime: number): void {
    this.statusGraphics.clear();
    
    const isSlowed = this.slowEndTime > currentTime;
    const isPoisoned = this.poisonStacks.length > 0;
    
    if (isSlowed) {
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
  }

  /**
   * Get current slow multiplier (1 = no slow, 0 = fully slowed)
   */
  getSpeedMultiplier(): number {
    const currentTime = this.scene.time.now;
    return this.slowEndTime > currentTime ? (1 - this.slowAmount) : 1;
  }

  /**
   * Check if currently slowed
   */
  isSlowed(): boolean {
    return this.slowEndTime > this.scene.time.now;
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
    this.poisonStacks = [];
    this.poisonTickTimer = 0;
    this.immunityEndTime = 0;
  }

  /**
   * Dispel all status effects (used by bosses)
   * Returns true if any effects were dispelled
   * @param immunityDurationMs - duration of immunity after dispelling (0 = no immunity)
   */
  dispelAll(immunityDurationMs: number = 0): boolean {
    const hadEffects = this.isSlowed() || this.isPoisoned();
    this.slowAmount = 0;
    this.slowEndTime = 0;
    this.poisonStacks = [];
    
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
