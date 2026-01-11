import Phaser from 'phaser';

/**
 * CreepEffectsGraphics handles drawing for creep visual effects.
 */
export class CreepEffectsGraphics {
  /**
   * Draw shield visual effect
   */
  static drawShield(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    shieldHitsRemaining: number
  ): void {
    g.clear();
    
    if (shieldHitsRemaining <= 0) return;
    
    const shimmer = Math.sin(bounceTime * 10) * 0.15;
    const pulse = 1 + Math.sin(bounceTime * 5) * 0.05;
    
    // Outer glow
    g.fillStyle(0x00BFFF, 0.15 + shimmer);
    g.fillCircle(0, -5, 38 * pulse);
    
    // Main bubble
    g.lineStyle(3, 0x00BFFF, 0.6 + shimmer);
    g.strokeCircle(0, -5, 32 * pulse);
    
    // Inner shield
    g.lineStyle(2, 0x87CEEB, 0.4);
    g.strokeCircle(0, -5, 28 * pulse);
    
    // Hit indicators
    const indicatorY = -42;
    for (let i = 0; i < shieldHitsRemaining; i++) {
      const indicatorX = (i - 1) * 10;
      g.fillStyle(0x00FFFF, 0.9);
      g.fillCircle(indicatorX, indicatorY, 4);
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillCircle(indicatorX - 1, indicatorY - 1, 1.5);
    }
  }

  /**
   * Draw status effects (slow, poison)
   */
  static drawStatusEffects(
    g: Phaser.GameObjects.Graphics,
    currentTime: number,
    slowAmount: number,
    slowEndTime: number,
    poisonStacks: { damage: number; endTime: number }[]
  ): void {
    g.clear();
    
    // Slow effect (ice crystals)
    if (slowAmount > 0 && currentTime < slowEndTime) {
      const intensity = slowAmount;
      const pulse = Math.sin(currentTime * 0.005) * 0.2;
      
      g.fillStyle(0x87CEEB, 0.3 + pulse);
      g.fillCircle(0, -5, 30);
      
      // Ice crystals
      const numCrystals = Math.floor(intensity * 6) + 2;
      for (let i = 0; i < numCrystals; i++) {
        const angle = (i / numCrystals) * Math.PI * 2 + currentTime * 0.002;
        const dist = 18 + Math.sin(currentTime * 0.003 + i) * 4;
        const crystalX = Math.cos(angle) * dist;
        const crystalY = -5 + Math.sin(angle) * dist * 0.6;
        
        g.fillStyle(0xADD8E6, 0.8);
        g.beginPath();
        g.moveTo(crystalX, crystalY - 6);
        g.lineTo(crystalX + 3, crystalY);
        g.lineTo(crystalX, crystalY + 4);
        g.lineTo(crystalX - 3, crystalY);
        g.closePath();
        g.fillPath();
        
        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(crystalX - 1, crystalY - 2, 1.5);
      }
    }
    
    // Poison effect (bubbles)
    const activePoisonStacks = poisonStacks.filter(s => currentTime < s.endTime);
    if (activePoisonStacks.length > 0) {
      const intensity = Math.min(activePoisonStacks.length / 3, 1);
      
      // Poison aura
      g.fillStyle(0x00FF00, 0.1 + intensity * 0.1);
      g.fillCircle(0, -5, 25);
      
      // Bubbles
      const numBubbles = activePoisonStacks.length * 2 + 2;
      for (let i = 0; i < numBubbles; i++) {
        const bubbleTime = currentTime * 0.003 + i * 1.5;
        const bubbleY = -5 - ((bubbleTime * 10) % 35);
        const bubbleX = Math.sin(bubbleTime * 2 + i) * 12;
        const bubbleSize = 2 + (i % 3);
        const bubbleAlpha = 0.7 - ((bubbleTime * 10) % 35) / 50;
        
        if (bubbleAlpha > 0) {
          g.fillStyle(0x32CD32, bubbleAlpha);
          g.fillCircle(bubbleX, bubbleY, bubbleSize);
          g.fillStyle(0x90EE90, bubbleAlpha * 0.7);
          g.fillCircle(bubbleX - 1, bubbleY - 1, bubbleSize * 0.4);
        }
      }
      
      // Drips
      g.fillStyle(0x228B22, 0.5);
      for (let i = 0; i < activePoisonStacks.length; i++) {
        const dripX = -10 + i * 10;
        const dripPhase = (currentTime * 0.004 + i) % 1;
        const dripY = 10 + dripPhase * 15;
        g.fillEllipse(dripX, dripY, 3, 4 + dripPhase * 2);
      }
    }
  }

  /**
   * Draw death animation
   */
  static drawDeathAnimation(
    g: Phaser.GameObjects.Graphics,
    deathProgress: number,
    creepType: string
  ): void {
    g.clear();
    
    // Get base color for creep type
    let baseColor = 0x8B4513;
    switch (creepType) {
      case 'runner': baseColor = 0x6495ED; break;
      case 'tank': baseColor = 0x696969; break;
      case 'boss':
      case 'boss_1':
      case 'boss_2':
      case 'boss_3':
      case 'boss_4':
      case 'boss_5':
        baseColor = 0x4B0082; break;
      case 'jumper': baseColor = 0x32CD32; break;
      case 'shielded': baseColor = 0x9400D3; break;
      case 'flying': baseColor = 0x4169E1; break;
      case 'digger': baseColor = 0x8B4513; break;
      case 'ghost': baseColor = 0x9370DB; break;
      case 'broodmother': baseColor = 0x228B22; break;
      case 'baby': baseColor = 0x90EE90; break;
      case 'flame': baseColor = 0xFF4500; break;
      case 'plaguebearer': baseColor = 0x00FF88; break;
    }
    
    // Explosion particles
    const numParticles = 12;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const dist = deathProgress * 40;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist * 0.7;
      const size = (1 - deathProgress) * 8;
      const alpha = 1 - deathProgress;
      
      if (size > 0) {
        g.fillStyle(baseColor, alpha);
        g.fillCircle(x, y, size);
        
        // Sparkle
        g.fillStyle(0xFFFFFF, alpha * 0.7);
        g.fillCircle(x, y, size * 0.4);
      }
    }
    
    // Center flash
    const flashSize = (1 - deathProgress) * 20;
    if (flashSize > 0) {
      g.fillStyle(0xFFFFFF, (1 - deathProgress) * 0.8);
      g.fillCircle(0, -5, flashSize);
    }
  }

  /**
   * Draw health bar
   */
  static drawHealthBar(
    bgGraphics: Phaser.GameObjects.Graphics,
    fgGraphics: Phaser.GameObjects.Graphics,
    healthPercent: number,
    maxHealth: number
  ): void {
    bgGraphics.clear();
    fgGraphics.clear();
    
    const barWidth = Math.min(40, 20 + maxHealth / 50);
    const barHeight = 4;
    const barY = -35;
    
    // Background
    bgGraphics.fillStyle(0x000000, 0.7);
    bgGraphics.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    
    // Health
    const healthWidth = barWidth * healthPercent;
    let healthColor = 0x00ff00;
    if (healthPercent < 0.3) {
      healthColor = 0xff0000;
    } else if (healthPercent < 0.6) {
      healthColor = 0xffff00;
    }
    
    fgGraphics.fillStyle(healthColor, 1);
    fgGraphics.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
  }
}
