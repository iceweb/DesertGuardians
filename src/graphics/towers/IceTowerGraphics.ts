import Phaser from 'phaser';

/**
 * Draws the Ice Tower at the specified level.
 * Level 1: Simple ice shard
 * Level 2: Crystal cluster with floating shards
 * Level 3: Massive frozen citadel with aurora effect
 */
export function drawIceTower(g: Phaser.GameObjects.Graphics, level: number): void {
  // Frost aura - dramatically larger at higher levels
  if (level === 1) {
    g.fillStyle(0x87ceeb, 0.1);
    g.fillCircle(0, -30, 45);
  } else if (level === 2) {
    g.fillStyle(0x87ceeb, 0.12);
    g.fillCircle(0, -35, 60);
    g.fillStyle(0xaaddff, 0.08);
    g.fillCircle(0, -35, 75);
  } else {
    g.fillStyle(0x87ceeb, 0.15);
    g.fillCircle(0, -40, 80);
    g.fillStyle(0xaaddff, 0.1);
    g.fillCircle(0, -40, 100);
    g.fillStyle(0xccffff, 0.05);
    g.fillCircle(0, -40, 120);
  }
  
  // Shadow (with blue tint)
  g.fillStyle(0x4a6080, 0.3);
  g.fillEllipse(0, 25, 45 + level * 8, 16 + level * 3);
  
  // Level 1: Simple ice shard
  // Level 2: Crystal cluster with floating shards  
  // Level 3: Massive frozen citadel with aurora effect
  
  const baseWidth = 24 + level * 6;
  const spireHeight = 75 + level * 20;
  
  if (level === 1) {
    // Simple frozen base
    g.fillStyle(0xa0d0e8, 1);
    g.fillRect(-baseWidth, 5, baseWidth * 2, 20);
    g.fillStyle(0xb0e0f0, 1);
    g.fillRect(-baseWidth + 4, 8, (baseWidth - 4) * 2, 14);
    // Simple frost pattern
    g.lineStyle(1, 0xffffff, 0.3);
    g.lineBetween(-18, 12, -10, 18);
    g.lineBetween(18, 12, 10, 18);
    
    // Simple crystal spire
    g.fillStyle(0xb0e0e6, 0.9);
    g.beginPath();
    g.moveTo(-18, 8);
    g.lineTo(0, -spireHeight);
    g.lineTo(18, 8);
    g.closePath();
    g.fillPath();
    // Inner highlight
    g.fillStyle(0xd0f0f5, 0.8);
    g.beginPath();
    g.moveTo(-10, 0);
    g.lineTo(0, -spireHeight + 15);
    g.lineTo(10, 0);
    g.closePath();
    g.fillPath();
    // Few sparkles
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-5, -35, 2);
    g.fillCircle(3, -50, 2);
    g.fillCircle(-2, -65, 2);
  } else if (level === 2) {
    // Reinforced ice base with pattern
    g.fillStyle(0xa8d8f0, 1);
    g.fillRect(-baseWidth, 3, baseWidth * 2, 24);
    g.fillStyle(0xb8e8ff, 1);
    g.fillRect(-baseWidth + 4, 7, (baseWidth - 4) * 2, 17);
    // Snowflake pattern on base
    g.lineStyle(1, 0xffffff, 0.5);
    for (let i = 0; i < 3; i++) {
      const cx = -18 + i * 18;
      g.lineBetween(cx, 10, cx, 22);
      g.lineBetween(cx - 4, 13, cx + 4, 19);
      g.lineBetween(cx - 4, 19, cx + 4, 13);
    }
    
    // Multi-crystal formation
    g.fillStyle(0xb0e0e6, 0.9);
    g.beginPath();
    g.moveTo(-24, 8);
    g.lineTo(0, -spireHeight);
    g.lineTo(24, 8);
    g.closePath();
    g.fillPath();
    // Side crystals
    g.fillStyle(0xa0d0d8, 0.8);
    g.beginPath();
    g.moveTo(-30, 15);
    g.lineTo(-18, -spireHeight + 30);
    g.lineTo(-12, 10);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(30, 15);
    g.lineTo(18, -spireHeight + 30);
    g.lineTo(12, 10);
    g.closePath();
    g.fillPath();
    // Inner glow
    g.fillStyle(0xd0f0f5, 0.85);
    g.beginPath();
    g.moveTo(-14, 0);
    g.lineTo(0, -spireHeight + 15);
    g.lineTo(14, 0);
    g.closePath();
    g.fillPath();
    // Crystal facets
    g.lineStyle(1, 0xffffff, 0.5);
    g.lineBetween(0, -spireHeight, -10, -30);
    g.lineBetween(0, -spireHeight, 10, -30);
    g.lineBetween(0, -spireHeight, 0, 0);
    // Floating ice shards
    g.fillStyle(0xc0e8ff, 0.7);
    g.beginPath();
    g.moveTo(-35, -25);
    g.lineTo(-30, -50);
    g.lineTo(-25, -22);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(35, -30);
    g.lineTo(28, -55);
    g.lineTo(23, -27);
    g.closePath();
    g.fillPath();
    // More sparkles
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(-6, -40, 3);
    g.fillCircle(4, -55, 2.5);
    g.fillCircle(-3, -70, 2);
    g.fillCircle(5, -25, 2);
    g.fillCircle(-8, -80, 2);
  } else {
    // GRAND ICE CITADEL BASE
    g.fillStyle(0xb0e0f8, 1);
    g.fillRect(-baseWidth, 0, baseWidth * 2, 28);
    g.fillStyle(0xc0f0ff, 1);
    g.fillRect(-baseWidth + 5, 5, (baseWidth - 5) * 2, 20);
    // Ornate ice patterns
    g.lineStyle(2, 0xffffff, 0.6);
    for (let i = 0; i < 5; i++) {
      const cx = -28 + i * 14;
      g.lineBetween(cx, 8, cx, 23);
      g.lineBetween(cx - 5, 11, cx + 5, 20);
      g.lineBetween(cx - 5, 20, cx + 5, 11);
    }
    // Corner pillars
    g.fillStyle(0x90c8e0, 1);
    g.fillRect(-baseWidth - 6, 0, 10, 26);
    g.fillRect(baseWidth - 4, 0, 10, 26);
    
    // MASSIVE CRYSTAL SPIRE with multiple formations
    // Main spire
    g.fillStyle(0xb0e0e6, 0.95);
    g.beginPath();
    g.moveTo(-30, 8);
    g.lineTo(0, -spireHeight);
    g.lineTo(30, 8);
    g.closePath();
    g.fillPath();
    // Secondary spires
    g.fillStyle(0xa0d0d8, 0.85);
    g.beginPath();
    g.moveTo(-38, 20);
    g.lineTo(-22, -spireHeight + 35);
    g.lineTo(-14, 15);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(38, 20);
    g.lineTo(22, -spireHeight + 35);
    g.lineTo(14, 15);
    g.closePath();
    g.fillPath();
    // Tertiary spires
    g.fillStyle(0x90c0d0, 0.75);
    g.beginPath();
    g.moveTo(-48, 25);
    g.lineTo(-35, -spireHeight + 60);
    g.lineTo(-30, 22);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(48, 25);
    g.lineTo(35, -spireHeight + 60);
    g.lineTo(30, 22);
    g.closePath();
    g.fillPath();
    
    // Inner glowing core
    g.fillStyle(0xd0f0f5, 0.9);
    g.beginPath();
    g.moveTo(-18, 0);
    g.lineTo(0, -spireHeight + 15);
    g.lineTo(18, 0);
    g.closePath();
    g.fillPath();
    // Power core
    g.fillStyle(0xe8ffff, 0.9);
    g.fillCircle(0, -spireHeight + 40, 12);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(0, -spireHeight + 40, 8);
    g.fillStyle(0xccffff, 1);
    g.fillCircle(0, -spireHeight + 40, 4);
    
    // Multiple floating ice platforms
    g.fillStyle(0xc0e8ff, 0.6);
    g.beginPath();
    g.moveTo(-50, -30);
    g.lineTo(-42, -65);
    g.lineTo(-35, -28);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(50, -35);
    g.lineTo(40, -70);
    g.lineTo(32, -32);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-55, -55);
    g.lineTo(-45, -85);
    g.lineTo(-40, -52);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(55, -50);
    g.lineTo(48, -80);
    g.lineTo(42, -47);
    g.closePath();
    g.fillPath();
    
    // Crystal facet lines
    g.lineStyle(1, 0xffffff, 0.6);
    g.lineBetween(0, -spireHeight, -15, -40);
    g.lineBetween(0, -spireHeight, 15, -40);
    g.lineBetween(0, -spireHeight, -8, -60);
    g.lineBetween(0, -spireHeight, 8, -60);
    g.lineBetween(0, -spireHeight, 0, 0);
    
    // MANY sparkles for magical effect
    g.fillStyle(0xffffff, 1);
    const sparklePositions = [
      [-8, -40], [6, -50], [-4, -70], [8, -30], [-10, -85],
      [10, -95], [-15, -55], [12, -65], [0, -105], [-6, -90]
    ];
    sparklePositions.forEach(([sx, sy], i) => {
      const size = 2 + (i % 3);
      g.fillCircle(sx as number, sy as number, size);
    });
    
    // Aurora/magical energy lines
    g.lineStyle(2, 0x88ddff, 0.3);
    g.beginPath();
    g.moveTo(-40, -80);
    g.lineTo(-20, -100);
    g.lineTo(0, -95);
    g.lineTo(20, -105);
    g.lineTo(40, -85);
    g.strokePath();
    g.lineStyle(1, 0xaaeeff, 0.2);
    g.beginPath();
    g.moveTo(-45, -70);
    g.lineTo(-25, -95);
    g.lineTo(0, -88);
    g.lineTo(25, -98);
    g.lineTo(45, -75);
    g.strokePath();
  }
}
