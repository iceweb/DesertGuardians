import Phaser from 'phaser';
import { drawStar } from './towers/TowerGraphicsBase';

/**
 * Static drawing functions for gold mine graphics.
 * Renders mines at 4 different states: empty slot, level 1, 2, and 3.
 */
export class GoldMineGraphics {
  /**
   * Draw a mine at the specified level
   */
  static drawMine(
    graphics: Phaser.GameObjects.Graphics,
    level: 0 | 1 | 2 | 3,
    width: number = 60,
    height: number = 60
  ): void {
    graphics.clear();
    
    switch (level) {
      case 0:
        this.drawEmptySlot(graphics, width, height);
        break;
      case 1:
        this.drawLevel1(graphics, width, height);
        break;
      case 2:
        this.drawLevel2(graphics, width, height);
        break;
      case 3:
        this.drawLevel3(graphics, width, height);
        break;
    }
  }

  /**
   * Draw empty mine slot - pencil sketch style mine entrance
   * Looks like a blueprint/plan for a mine to be built
   */
  private static drawEmptySlot(g: Phaser.GameObjects.Graphics, _width: number, _height: number): void {
    const cx = 0;
    const cy = 0;
    
    // Pencil sketch color - light brown/sepia like pencil on parchment
    const sketchColor = 0x8b6914;
    const sketchAlpha = 0.7;
    
    // Draw sketchy mountain/rock pile behind the entrance
    g.lineStyle(2, sketchColor, sketchAlpha * 0.6);
    // Left slope with sketchy strokes
    g.lineBetween(cx - 35, cy + 20, cx - 20, cy - 15);
    g.lineBetween(cx - 33, cy + 18, cx - 18, cy - 12);
    // Right slope
    g.lineBetween(cx + 35, cy + 20, cx + 20, cy - 15);
    g.lineBetween(cx + 33, cy + 18, cx + 18, cy - 12);
    // Peak connection
    g.lineBetween(cx - 20, cy - 15, cx, cy - 25);
    g.lineBetween(cx + 20, cy - 15, cx, cy - 25);
    // Extra sketch lines for texture
    g.lineBetween(cx - 28, cy + 5, cx - 15, cy - 8);
    g.lineBetween(cx + 28, cy + 5, cx + 15, cy - 8);
    
    // Mine entrance frame - wooden beams sketched
    g.lineStyle(2.5, sketchColor, sketchAlpha);
    
    // Left post (sketchy double lines)
    g.lineBetween(cx - 18, cy + 22, cx - 18, cy - 5);
    g.lineBetween(cx - 14, cy + 22, cx - 14, cy - 5);
    g.lineBetween(cx - 18, cy + 22, cx - 14, cy + 22);
    g.lineBetween(cx - 18, cy - 5, cx - 14, cy - 5);
    
    // Right post
    g.lineBetween(cx + 18, cy + 22, cx + 18, cy - 5);
    g.lineBetween(cx + 14, cy + 22, cx + 14, cy - 5);
    g.lineBetween(cx + 18, cy + 22, cx + 14, cy + 22);
    g.lineBetween(cx + 18, cy - 5, cx + 14, cy - 5);
    
    // Top beam
    g.lineBetween(cx - 22, cy - 8, cx + 22, cy - 8);
    g.lineBetween(cx - 22, cy - 12, cx + 22, cy - 12);
    g.lineBetween(cx - 22, cy - 8, cx - 22, cy - 12);
    g.lineBetween(cx + 22, cy - 8, cx + 22, cy - 12);
    
    // Dark entrance (hatched/shaded)
    g.lineStyle(1.5, sketchColor, sketchAlpha * 0.5);
    for (let i = -10; i <= 10; i += 3) {
      g.lineBetween(cx + i, cy - 3, cx + i, cy + 18);
    }
    // Cross hatching for darkness
    for (let i = 0; i <= 20; i += 4) {
      g.lineBetween(cx - 10, cy - 3 + i, cx + 10, cy - 3 + i);
    }
    
    // Rails sketch coming out of entrance
    g.lineStyle(1.5, sketchColor, sketchAlpha * 0.8);
    g.lineBetween(cx - 8, cy + 22, cx - 10, cy + 35);
    g.lineBetween(cx + 8, cy + 22, cx + 10, cy + 35);
    // Cross ties
    g.lineBetween(cx - 12, cy + 26, cx + 12, cy + 26);
    g.lineBetween(cx - 13, cy + 32, cx + 13, cy + 32);
    
    // Pickaxe sketch leaning against entrance
    g.lineStyle(2, sketchColor, sketchAlpha);
    // Handle
    g.lineBetween(cx + 22, cy + 25, cx + 32, cy - 5);
    // Pick head
    g.lineBetween(cx + 28, cy - 2, cx + 38, cy + 5);
    g.lineBetween(cx + 28, cy - 2, cx + 26, cy - 10);
    
    // Gold nugget sketches (dashed circles)
    g.lineStyle(1.5, 0xdaa520, sketchAlpha);
    this.drawSketchyCircle(g, cx - 25, cy + 28, 5);
    this.drawSketchyCircle(g, cx - 20, cy + 32, 4);
    
    // "BUILD" indicator with coin icon
    g.lineStyle(2, 0xdaa520, 0.8);
    // Coin circle
    this.drawSketchyCircle(g, cx, cy + 42, 8);
    // Dollar/gold sign inside
    g.lineBetween(cx, cy + 38, cx, cy + 46);
    g.lineBetween(cx - 3, cy + 40, cx + 3, cy + 40);
    g.lineBetween(cx - 3, cy + 44, cx + 3, cy + 44);
  }
  
  /**
   * Draw a sketchy/hand-drawn style circle
   */
  private static drawSketchyCircle(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number): void {
    const segments = 12;
    const wobble = radius * 0.15;
    
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      const r1 = radius + (Math.random() - 0.5) * wobble;
      const r2 = radius + (Math.random() - 0.5) * wobble;
      
      const x1 = x + Math.cos(angle1) * r1;
      const y1 = y + Math.sin(angle1) * r1;
      const x2 = x + Math.cos(angle2) * r2;
      const y2 = y + Math.sin(angle2) * r2;
      
      g.lineBetween(x1, y1, x2, y2);
    }
  }

  /**
   * Draw level 1 mine - simple wooden entrance
   */
  private static drawLevel1(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;
    
    // Rocky base
    g.fillStyle(0x4a4035, 1);
    g.fillRoundedRect(cx - hw, cy - hh, width, height, 8);
    
    // Mine entrance (dark cave opening)
    g.fillStyle(0x1a1510, 1);
    g.fillRoundedRect(cx - 18, cy - 10, 36, 30, 4);
    
    // Wooden frame
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(cx - 22, cy - 14, 6, 38);  // Left post
    g.fillRect(cx + 16, cy - 14, 6, 38);  // Right post
    g.fillRect(cx - 24, cy - 18, 48, 8);  // Top beam
    
    // Wood grain detail
    g.lineStyle(1, 0x654321, 0.5);
    g.lineBetween(cx - 19, cy - 5, cx - 19, cy + 15);
    g.lineBetween(cx + 19, cy - 5, cx + 19, cy + 15);
    
    // Small gold nuggets near entrance
    g.fillStyle(0xffd700, 0.8);
    g.fillCircle(cx - 8, cy + 18, 3);
    g.fillCircle(cx + 6, cy + 16, 2);
  }

  /**
   * Draw level 2 mine - add minecart and rails
   */
  private static drawLevel2(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;
    
    // Rocky base with more refined look
    g.fillStyle(0x5a5045, 1);
    g.fillRoundedRect(cx - hw, cy - hh, width, height, 8);
    
    // Mine entrance (larger)
    g.fillStyle(0x1a1510, 1);
    g.fillRoundedRect(cx - 20, cy - 12, 40, 32, 4);
    
    // Reinforced wooden frame
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(cx - 24, cy - 16, 8, 42);  // Left post
    g.fillRect(cx + 16, cy - 16, 8, 42);  // Right post
    g.fillRect(cx - 26, cy - 20, 52, 10); // Top beam
    
    // Metal reinforcements
    g.fillStyle(0x6a6a6a, 1);
    g.fillRect(cx - 25, cy - 10, 4, 8);
    g.fillRect(cx + 21, cy - 10, 4, 8);
    g.fillRect(cx - 25, cy + 10, 4, 8);
    g.fillRect(cx + 21, cy + 10, 4, 8);
    
    // Rails coming out
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(cx - 12, cy + 20, 4, 12);
    g.fillRect(cx + 8, cy + 20, 4, 12);
    
    // Minecart
    g.fillStyle(0x5a4a3a, 1);
    g.fillRect(cx - 10, cy + 8, 20, 12);
    g.fillStyle(0x6a5a4a, 1);
    g.fillRect(cx - 8, cy + 6, 16, 4);
    
    // Gold in cart
    g.fillStyle(0xffd700, 0.9);
    g.fillCircle(cx - 3, cy + 8, 4);
    g.fillCircle(cx + 4, cy + 9, 3);
    
    // Wheels
    g.fillStyle(0x3a3a3a, 1);
    g.fillCircle(cx - 8, cy + 22, 3);
    g.fillCircle(cx + 8, cy + 22, 3);
    
    // Level indicator - 2 silver stars
    this.drawLevelIndicator(g, 2);
  }

  /**
   * Draw level 3 mine - gold-trimmed vault with glow
   */
  private static drawLevel3(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cx = 0;
    const cy = 0;
    const hw = width / 2;
    const hh = height / 2;
    
    // Glow effect underneath
    g.fillStyle(0xffd700, 0.2);
    g.fillCircle(cx, cy, hw + 5);
    
    // Polished stone base
    g.fillStyle(0x6a6055, 1);
    g.fillRoundedRect(cx - hw, cy - hh, width, height, 10);
    
    // Inner glow
    g.fillStyle(0xffd700, 0.15);
    g.fillRoundedRect(cx - hw + 4, cy - hh + 4, width - 8, height - 8, 8);
    
    // Vault entrance
    g.fillStyle(0x1a1510, 1);
    g.fillRoundedRect(cx - 18, cy - 10, 36, 30, 6);
    
    // Golden vault frame
    g.fillStyle(0xdaa520, 1);
    g.fillRect(cx - 22, cy - 14, 8, 40);  // Left post
    g.fillRect(cx + 14, cy - 14, 8, 40);  // Right post
    g.fillRect(cx - 24, cy - 18, 48, 10); // Top beam
    
    // Gold trim details
    g.fillStyle(0xffd700, 1);
    g.fillRect(cx - 24, cy - 20, 48, 3);  // Top edge
    g.fillRect(cx - 24, cy + 23, 48, 3);  // Bottom edge
    
    // Decorative gold rivets
    g.fillStyle(0xffec8b, 1);
    g.fillCircle(cx - 18, cy - 8, 2);
    g.fillCircle(cx + 18, cy - 8, 2);
    g.fillCircle(cx - 18, cy + 8, 2);
    g.fillCircle(cx + 18, cy + 8, 2);
    
    // Gold pile at entrance
    g.fillStyle(0xffd700, 1);
    g.fillCircle(cx - 6, cy + 16, 5);
    g.fillCircle(cx + 5, cy + 14, 4);
    g.fillCircle(cx, cy + 12, 4);
    g.fillCircle(cx - 2, cy + 18, 3);
    g.fillCircle(cx + 7, cy + 18, 3);
    
    // Sparkle effects
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - 4, cy + 10, 2);
    g.fillCircle(cx + 6, cy + 15, 1.5);
    
    // Level indicator - 3 gold stars
    this.drawLevelIndicator(g, 3);
  }

  /**
   * Draw level indicator stars above the mine
   */
  static drawLevelIndicator(g: Phaser.GameObjects.Graphics, level: number): void {
    if (level === 1) {
      // Single bronze star
      g.fillStyle(0xcd7f32, 1);
      drawStar(g, 0, -38, 4);
    } else if (level === 2) {
      // Two silver stars
      g.fillStyle(0xc0c0c0, 1);
      drawStar(g, -8, -38, 4);
      drawStar(g, 8, -38, 4);
    } else if (level === 3) {
      // Three gold stars with glow
      g.fillStyle(0xffd700, 0.3);
      g.fillCircle(0, -40, 12);
      g.fillStyle(0xffd700, 1);
      drawStar(g, -12, -38, 4);
      drawStar(g, 0, -42, 5);
      drawStar(g, 12, -38, 4);
    }
  }

  /**
   * Create a shimmer/sparkle effect for empty slots
   * Returns tween config for the scene to use
   */
  static createShimmerTween(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: graphics,
      alpha: { from: 0.7, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create idle animation for active mines (subtle pulsing glow)
   */
  static createIdleTween(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: graphics,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
