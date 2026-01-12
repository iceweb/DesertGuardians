import Phaser from 'phaser';
import { drawAuraTower, drawAuraRangeCircle } from './towers/AuraTowerGraphics';

/**
 * AuraAnimator provides dynamic animated graphics for the Aura tower.
 * Features:
 * - Pulsing red orb glow
 * - Rotating energy particles
 * - Aura pulse effect radiating outward
 */
export class AuraAnimator {
  private container: Phaser.GameObjects.Container;
  private level: number;
  
  // Graphics layers
  private baseGraphics: Phaser.GameObjects.Graphics;
  private glowGraphics: Phaser.GameObjects.Graphics;
  private particleGraphics: Phaser.GameObjects.Graphics;
  
  // Animation state
  private glowPhase: number = 0;
  private particleAngle: number = 0;
  private pulsePhase: number = 0;
  
  // Orb position (calculated based on level)
  private orbY: number = 0;
  private orbSize: number = 0;
  
  // Scale factor - matches AuraTowerGraphics
  private readonly scale: number = 0.5;
  
  constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container, level: number) {
    this.container = container;
    this.level = level;
    
    // Create graphics layers
    this.baseGraphics = scene.add.graphics();
    this.glowGraphics = scene.add.graphics();
    this.particleGraphics = scene.add.graphics();
    
    // Add to container (order matters for z-index)
    this.container.add([this.baseGraphics, this.glowGraphics, this.particleGraphics]);
    
    // Calculate orb position
    this.updateOrbPosition();
    
    // Initial draw
    this.drawBase();
  }
  
  /**
   * Calculate orb position based on level (scaled)
   */
  private updateOrbPosition(): void {
    const pillarHeight = (35 + this.level * 8) * this.scale;
    const platY = -pillarHeight - 5 * this.scale;
    this.orbY = platY - (12 + this.level * 3) * this.scale;
    this.orbSize = (10 + this.level * 3) * this.scale;
  }
  
  /**
   * Set the level and redraw
   */
  setLevel(level: number): void {
    this.level = level;
    this.updateOrbPosition();
    this.drawBase();
  }
  
  /**
   * Update animation state - call each frame
   */
  update(delta: number): void {
    const dt = delta / 1000;
    
    // Animate glow pulsing
    this.glowPhase += dt * 2.5;
    if (this.glowPhase > Math.PI * 2) {
      this.glowPhase -= Math.PI * 2;
    }
    
    // Animate particles rotating
    this.particleAngle += dt * 1.5;
    if (this.particleAngle > Math.PI * 2) {
      this.particleAngle -= Math.PI * 2;
    }
    
    // Animate pulse expansion
    this.pulsePhase += dt * 0.8;
    if (this.pulsePhase > 1) {
      this.pulsePhase = 0;
    }
    
    // Redraw animated elements
    this.drawGlow();
    this.drawParticles();
  }
  
  /**
   * Draw the static tower base
   */
  private drawBase(): void {
    const g = this.baseGraphics;
    g.clear();
    drawAuraTower(g, this.level);
  }
  
  /**
   * Draw the pulsing glow effect on the orb
   */
  private drawGlow(): void {
    const g = this.glowGraphics;
    g.clear();
    
    // Pulsing glow intensity
    const glowIntensity = (Math.sin(this.glowPhase) + 1) * 0.5;
    const baseAlpha = 0.3 + glowIntensity * 0.4;
    
    // Outer glow
    const outerSize = this.orbSize + (8 + glowIntensity * 6) * this.scale;
    g.fillStyle(0xff2222, baseAlpha * 0.3);
    g.fillCircle(0, this.orbY, outerSize);
    
    // Middle glow
    const middleSize = this.orbSize + (4 + glowIntensity * 3) * this.scale;
    g.fillStyle(0xff4444, baseAlpha * 0.5);
    g.fillCircle(0, this.orbY, middleSize);
    
    // Inner bright core
    const innerSize = this.orbSize - 2 * this.scale + glowIntensity * 2 * this.scale;
    g.fillStyle(0xff6666, baseAlpha * 0.8);
    g.fillCircle(0, this.orbY, innerSize);
    
    // Hot center
    g.fillStyle(0xffaaaa, baseAlpha);
    g.fillCircle(0, this.orbY, this.orbSize * 0.4);
    
    // Highlight
    g.fillStyle(0xffffff, baseAlpha * 0.6);
    g.fillCircle(-this.orbSize * 0.25, this.orbY - this.orbSize * 0.25, this.orbSize * 0.2);
    
    // Expanding pulse ring
    if (this.level >= 2) {
      const pulseRadius = this.orbSize + this.pulsePhase * 30 * this.scale;
      const pulseAlpha = (1 - this.pulsePhase) * 0.4;
      g.lineStyle(2, 0xff4444, pulseAlpha);
      g.strokeCircle(0, this.orbY, pulseRadius);
    }
  }
  
  /**
   * Draw rotating energy particles around the orb
   */
  private drawParticles(): void {
    const g = this.particleGraphics;
    g.clear();
    
    const particleCount = 3 + this.level;
    const orbitRadius = this.orbSize + (10 + this.level * 2) * this.scale;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = this.particleAngle + (i * Math.PI * 2) / particleCount;
      const x = Math.cos(angle) * orbitRadius;
      const y = this.orbY + Math.sin(angle) * orbitRadius * 0.5; // Elliptical orbit
      
      // Particle glow
      g.fillStyle(0xff6666, 0.3);
      g.fillCircle(x, y, 6 * this.scale);
      
      // Particle core
      g.fillStyle(0xff4444, 0.8);
      g.fillCircle(x, y, 3 * this.scale);
      
      // Particle center
      g.fillStyle(0xffaaaa, 1);
      g.fillCircle(x, y, 1.5 * this.scale);
    }
    
    // Level 3+: Additional outer particle ring
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
  
  /**
   * Aura tower doesn't track targets
   */
  setTarget(_targetX: number, _targetY: number, _towerX: number, _towerY: number): void {
    // No-op: Aura towers don't aim at targets
  }
  
  /**
   * Clear target - no-op for aura tower
   */
  clearTarget(): void {
    // No-op
  }
  
  /**
   * Aura tower doesn't fire
   */
  onFire(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }
  
  /**
   * Get projectile spawn offset - not used for aura tower
   */
  getProjectileSpawnOffset(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }
  
  /**
   * Aura tower doesn't kill directly
   */
  onKill(): void {
    // No-op
  }
  
  /**
   * Destroy all graphics
   */
  destroy(): void {
    this.baseGraphics.destroy();
    this.glowGraphics.destroy();
    this.particleGraphics.destroy();
  }
}

/**
 * Draw aura range indicator with red styling (for use by Tower class)
 */
export { drawAuraRangeCircle };
