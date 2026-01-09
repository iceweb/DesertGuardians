import Phaser from 'phaser';

/**
 * AnimatorBase is an abstract base class for all tower animators.
 * It provides shared logic for:
 * - Container and graphics setup
 * - Target tracking and rotation smoothing
 * - Cheering animation on kills
 * - Common lifecycle methods
 * 
 * Subclasses must implement:
 * - drawBase(): Draw the static tower base
 * - drawRotatingElements(): Draw all elements in the rotating container
 * - getProjectileOffset(): Return the projectile spawn offset
 * - updateAnimation(): Handle tower-specific animation updates
 */
export abstract class AnimatorBase {
  protected container: Phaser.GameObjects.Container;
  protected level: number;
  protected scene: Phaser.Scene;
  
  // Graphics layers
  protected baseGraphics: Phaser.GameObjects.Graphics;
  protected rotatingContainer: Phaser.GameObjects.Container;
  
  // Rotation state
  protected currentAngle: number = 0;
  protected targetAngle: number = 0;
  protected hasTarget: boolean = false;
  protected rotationSpeed: number = 5.0; // radians per second
  
  // Cheering state
  protected isCheeringActive: boolean = false;
  protected cheerTimer: number = 0;
  protected cheerArmAngle: number = 0;
  protected cheerDuration: number = 0.8;
  protected cheerFrequency: number = 15; // oscillation speed
  
  /**
   * Get the Y position of the rotating element for this level (1-indexed)
   */
  protected abstract getRotatingElementY(level: number): number;
  
  /**
   * Get the angle offset to add when calculating target angle.
   * This depends on which direction the tower graphics point in local space:
   * - If pointing UP (negative Y): return Math.PI / 2
   * - If pointing LEFT (negative X): return Math.PI
   * - If pointing RIGHT (positive X): return 0
   */
  protected abstract getAngleOffset(): number;
  
  /**
   * Draw the static base of the tower (called on baseGraphics)
   */
  protected abstract drawBase(): void;
  
  /**
   * Draw all rotating elements (operator, weapon, effects, etc.)
   * Called whenever level changes or animations update
   */
  protected abstract drawRotatingElements(): void;
  
  /**
   * Get the projectile spawn offset relative to tower center
   */
  abstract getProjectileOffset(): { x: number; y: number };
  
  /**
   * Handle tower-specific animation updates.
   * Called every frame with delta time in seconds.
   * Return true if rotating elements need to be redrawn.
   */
  protected abstract updateAnimation(dt: number): boolean;
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.scene = scene;
    this.container = container;
    this.level = level;
    
    // Create base graphics (static, doesn't rotate)
    this.baseGraphics = scene.add.graphics();
    
    // Create rotating container - subclass will set Y position
    this.rotatingContainer = scene.add.container(0, this.getRotatingElementY(level));
    
    // Add to main container
    this.container.add([this.baseGraphics, this.rotatingContainer]);
  }
  
  /**
   * Initialize graphics after subclass has set up its specific graphics objects.
   * Call this at the end of subclass constructor.
   */
  protected initializeGraphics(): void {
    this.drawBase();
    this.drawRotatingElements();
  }
  
  /**
   * Set the level and redraw all graphics
   */
  setLevel(level: number): void {
    this.level = level;
    this.rotatingContainer.setY(this.getRotatingElementY(level));
    this.drawBase();
    this.drawRotatingElements();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Smooth rotation towards target
    if (this.hasTarget) {
      const angleDiff = Phaser.Math.Angle.Wrap(this.targetAngle - this.currentAngle);
      
      if (Math.abs(angleDiff) > 0.01) {
        this.currentAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.rotationSpeed * dt);
        this.currentAngle = Phaser.Math.Angle.Wrap(this.currentAngle);
      }
    }
    
    // Cheering animation
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
    
    // Let subclass handle specific animations
    const subclassNeedsRedraw = this.updateAnimation(dt);
    
    // Redraw rotating elements if needed
    if (needsRedraw || subclassNeedsRedraw) {
      this.drawRotatingElements();
    }
    
    // Apply rotation to container
    this.rotatingContainer.setRotation(this.currentAngle);
  }
  
  /**
   * Set target position for tracking
   */
  setTarget(targetX: number, targetY: number, towerX: number, towerY: number): void {
    this.hasTarget = true;
    const rotatingElementWorldY = towerY + this.getRotatingElementY(this.level);
    this.targetAngle = Phaser.Math.Angle.Between(towerX, rotatingElementWorldY, targetX, targetY) + this.getAngleOffset();
  }
  
  /**
   * Clear target - stop tracking
   */
  clearTarget(): void {
    this.hasTarget = false;
  }
  
  /**
   * Called when tower fires - subclasses should override if needed
   */
  onFire(): { x: number; y: number } {
    return this.getProjectileOffset();
  }
  
  /**
   * Called when this tower kills a creep - triggers cheering
   */
  onKill(): void {
    this.isCheeringActive = true;
    this.cheerTimer = this.cheerDuration;
  }
  
  /**
   * Calculate rotated offset for projectile spawn
   */
  protected calculateRotatedOffset(localX: number, localY: number): { x: number; y: number } {
    const cos = Math.cos(this.currentAngle);
    const sin = Math.sin(this.currentAngle);
    
    const rotatedX = localX * cos - localY * sin;
    const rotatedY = localX * sin + localY * cos;
    
    return {
      x: rotatedX,
      y: rotatedY + this.getRotatingElementY(this.level)
    };
  }
  
  /**
   * Destroy all graphics - subclasses should override and call super.destroy()
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.rotatingContainer.destroy();
  }
}
