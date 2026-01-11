import Phaser from 'phaser';

/**
 * Aura tower graphics rendering.
 * Features a pedestal-style tower with pulsing red core glow.
 * Does not attack - provides damage buff to nearby towers.
 */
export function drawAuraTower(g: Phaser.GameObjects.Graphics, level: number): void {
  // Shadow
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(0, 25, 50, 18);
  
  const baseWidth = 28;
  
  // Base platform - ornate pedestal style
  if (level === 1) {
    // Simple stone base
    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
    g.fillStyle(0x5a4a4a, 1);
    g.fillRect(-baseWidth + 3, 10, (baseWidth - 3) * 2, 16);
  } else if (level === 2) {
    // Reinforced base with crimson accents
    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth - 4, 6, (baseWidth + 4) * 2, 24);
    g.fillStyle(0x5a4a4a, 1);
    g.fillRect(-baseWidth, 8, baseWidth * 2, 20);
    // Red trim
    g.lineStyle(2, 0xcc3333, 0.8);
    g.lineBetween(-baseWidth - 4, 6, baseWidth + 4, 6);
    g.lineBetween(-baseWidth - 4, 30, baseWidth + 4, 30);
  } else {
    // Grand obsidian base with gold and crimson
    g.fillStyle(0x3a2a2a, 1);
    g.fillRect(-baseWidth - 6, 4, (baseWidth + 6) * 2, 28);
    g.fillStyle(0x4a3a3a, 1);
    g.fillRect(-baseWidth - 2, 6, (baseWidth + 2) * 2, 24);
    // Gold corners
    g.fillStyle(0xffd700, 0.7);
    g.fillRect(-baseWidth - 8, 2, 8, 32);
    g.fillRect(baseWidth, 2, 8, 32);
    // Red glow line
    g.lineStyle(3, 0xff4444, 0.9);
    g.lineBetween(-baseWidth - 2, 4, baseWidth + 2, 4);
  }
  
  // Central pillar/pedestal
  const pillarHeight = 35 + level * 8;
  const pillarWidth = 14 + level * 2;
  
  // Pillar body
  g.fillStyle(0x3a2a2a, 1);
  g.beginPath();
  g.moveTo(-pillarWidth, 10);
  g.lineTo(-pillarWidth + 4, -pillarHeight);
  g.lineTo(pillarWidth - 4, -pillarHeight);
  g.lineTo(pillarWidth, 10);
  g.closePath();
  g.fillPath();
  
  // Pillar highlight
  g.fillStyle(0x4a3a3a, 1);
  g.beginPath();
  g.moveTo(-pillarWidth + 4, 8);
  g.lineTo(-pillarWidth + 6, -pillarHeight + 2);
  g.lineTo(0, -pillarHeight + 2);
  g.lineTo(0, 8);
  g.closePath();
  g.fillPath();
  
  // Rune markings on pillar (level-based)
  g.lineStyle(2, 0xcc3333, 0.6 + level * 0.1);
  for (let i = 0; i < level; i++) {
    const runeY = -10 - i * 18;
    g.lineBetween(-pillarWidth + 6, runeY, pillarWidth - 6, runeY);
    g.lineBetween(-pillarWidth + 8, runeY - 6, pillarWidth - 8, runeY - 6);
  }
  
  // Top platform for the orb
  const platY = -pillarHeight - 5;
  g.fillStyle(0x5a4a4a, 1);
  g.fillEllipse(0, platY, 24 + level * 3, 10);
  g.fillStyle(0x4a3a3a, 1);
  g.fillEllipse(0, platY - 2, 20 + level * 2, 8);
  
  // Decorative spikes/crystals around platform (level 2+)
  if (level >= 2) {
    g.fillStyle(0x3a2a2a, 1);
    // Left spike
    g.beginPath();
    g.moveTo(-18 - level * 2, platY);
    g.lineTo(-14 - level, platY - 15 - level * 3);
    g.lineTo(-10 - level, platY);
    g.closePath();
    g.fillPath();
    // Right spike
    g.beginPath();
    g.moveTo(18 + level * 2, platY);
    g.lineTo(14 + level, platY - 15 - level * 3);
    g.lineTo(10 + level, platY);
    g.closePath();
    g.fillPath();
    
    // Spike glow
    g.fillStyle(0xff4444, 0.4);
    g.fillCircle(-14 - level, platY - 12 - level * 2, 4);
    g.fillCircle(14 + level, platY - 12 - level * 2, 4);
  }
  
  // Central orb/crystal (the aura source) - NOTE: animated glow added by AuraAnimator
  const orbY = platY - 12 - level * 3;
  const orbSize = 10 + level * 3;
  
  // Orb core (dark center that will be illuminated by animator)
  g.fillStyle(0x2a1a1a, 1);
  g.fillCircle(0, orbY, orbSize);
  
  // Inner glow base
  g.fillStyle(0x441111, 0.8);
  g.fillCircle(0, orbY, orbSize - 3);
  
  // Level 3: Additional decorative elements
  if (level === 3) {
    // Floating runes/symbols around orb
    g.lineStyle(2, 0xffd700, 0.6);
    g.strokeCircle(0, orbY, orbSize + 8);
    
    // Crown-like top
    g.fillStyle(0xffd700, 0.8);
    g.beginPath();
    g.moveTo(-8, orbY - orbSize - 2);
    g.lineTo(-4, orbY - orbSize - 12);
    g.lineTo(0, orbY - orbSize - 6);
    g.lineTo(4, orbY - orbSize - 12);
    g.lineTo(8, orbY - orbSize - 2);
    g.closePath();
    g.fillPath();
  }
}

/**
 * Draw the aura range indicator with red styling
 */
export function drawAuraRangeCircle(
  g: Phaser.GameObjects.Graphics,
  range: number
): void {
  g.clear();
  g.lineStyle(4, 0xff4444, 0.5);
  g.strokeCircle(0, 0, range);
  g.fillStyle(0xff4444, 0.1);
  g.fillCircle(0, 0, range);
}
