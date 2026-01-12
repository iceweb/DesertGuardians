import Phaser from 'phaser';
import { PathSystem } from '../managers/MapPathSystem';
import { EnvironmentDecorations } from './EnvironmentDecorations';
import { PathRenderer } from './PathRenderer';
import { GAME_CONFIG } from '../data';

/**
 * GameEnvironment handles all environmental/decorative rendering.
 * Extracted from GameScene to keep files under 500 LOC.
 */
export class GameEnvironment {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pathRenderer: PathRenderer;
  private castlePosition: Phaser.Math.Vector2 | null = null;
  
  // Castle graphics for damage states
  private castleContainer: Phaser.GameObjects.Container | null = null;
  private castleDamageGraphics: Phaser.GameObjects.Graphics | null = null;
  private flagGraphics: Phaser.GameObjects.Graphics | null = null;
  private flagPhase: number = 0;
  private currentDamageState: number = 0; // 0 = healthy, 1 = 50%, 2 = 25%
  private isDestroyed: boolean = false;
  private destroyedCastleGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    this.pathRenderer = new PathRenderer(scene, pathSystem);
  }

  /**
   * Draw all environment layers
   */
  drawAll(spawn: Phaser.Math.Vector2, goal: Phaser.Math.Vector2): void {
    this.drawSkyBackground();
    this.drawDesertTerrain();
    this.drawDecorations();
    this.drawCanyonPath();
    this.drawSpawnAndGoal(spawn, goal);
  }

  getCastlePosition(): Phaser.Math.Vector2 | null {
    return this.castlePosition;
  }
  
  /**
   * Update castle flag animation
   */
  update(delta: number): void {
    if (this.flagGraphics && this.castlePosition) {
      this.flagPhase += delta / 1000 * 1.5; // Slow steady animation
      if (this.flagPhase > Math.PI * 2) this.flagPhase -= Math.PI * 2;
      this.drawFlag(this.castlePosition.x, this.castlePosition.y);
    }
  }
  
  /**
   * Update castle damage state based on HP
   */
  updateCastleDamage(currentHP: number): void {
    const maxHP = GAME_CONFIG.MAX_CASTLE_HP;
    const hpPercent = currentHP / maxHP;
    
    let newState = 0;
    if (hpPercent <= 0.25) {
      newState = 2; // Heavy damage
    } else if (hpPercent <= 0.5) {
      newState = 1; // Medium damage
    }
    
    if (newState !== this.currentDamageState && this.castlePosition) {
      this.currentDamageState = newState;
      this.drawCastleDamage(this.castlePosition.x, this.castlePosition.y);
    }
  }

  /**
   * Play castle destruction animation and show destroyed state
   */
  playCastleDestructionAnimation(onComplete?: () => void): void {
    if (!this.castlePosition || !this.castleContainer) {
      onComplete?.();
      return;
    }

    const cx = this.castlePosition.x - 20;
    const cy = this.castlePosition.y - 80;

    // Hide the flag
    if (this.flagGraphics) {
      this.flagGraphics.setVisible(false);
    }

    // Create explosion particles
    const particles: Phaser.GameObjects.Graphics[] = [];
    const numParticles = 30;

    for (let i = 0; i < numParticles; i++) {
      const particle = this.scene.add.graphics();
      particle.setDepth(20);
      
      // Random debris color
      const colors = [0x9a8a7a, 0xa0522d, 0x8b6914, 0x4a3a2a, 0x3a3020];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.fillStyle(color, 1);
      const size = 5 + Math.random() * 15;
      particle.fillRect(-size / 2, -size / 2, size, size);
      
      particle.setPosition(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 80);
      particles.push(particle);

      // Animate particle flying outward
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 150;
      const targetX = particle.x + Math.cos(angle) * distance;
      const targetY = particle.y + Math.sin(angle) * distance + 100; // Fall down

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        rotation: Math.random() * 10 - 5,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // Shake the castle
    this.scene.tweens.add({
      targets: this.castleContainer,
      x: { from: -5, to: 5 },
      duration: 50,
      repeat: 10,
      yoyo: true
    });

    // After shake, collapse the castle
    this.scene.time.delayedCall(500, () => {
      // Fade out the normal castle
      this.scene.tweens.add({
        targets: this.castleContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          // Draw the destroyed castle
          this.isDestroyed = true;
          this.drawDestroyedCastle();
          
          // Camera shake
          this.scene.cameras.main.shake(500, 0.02);
          
          // Delay before callback
          this.scene.time.delayedCall(800, () => {
            onComplete?.();
          });
        }
      });
    });
  }

  /**
   * Show the castle as already destroyed (for review mode)
   */
  showDestroyedCastle(): void {
    if (!this.castlePosition || !this.castleContainer) return;
    
    this.isDestroyed = true;
    
    // Hide the normal castle elements
    this.castleContainer.setAlpha(0);
    if (this.flagGraphics) {
      this.flagGraphics.setVisible(false);
    }
    
    // Draw the destroyed version
    this.drawDestroyedCastle();
  }

  /**
   * Draw the destroyed castle rubble
   */
  private drawDestroyedCastle(): void {
    if (!this.castlePosition) return;
    
    if (this.destroyedCastleGraphics) {
      this.destroyedCastleGraphics.destroy();
    }
    
    this.destroyedCastleGraphics = this.scene.add.graphics();
    this.destroyedCastleGraphics.setDepth(15);
    
    const x = this.castlePosition.x;
    const y = this.castlePosition.y;
    const cx = x - 20;
    const cy = y - 80;
    
    const g = this.destroyedCastleGraphics;
    
    // Shadow of rubble
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(cx, cy + 95, 180, 50);
    
    // Remaining foundation/platform (damaged)
    g.fillStyle(0x7a6a50, 1);
    g.beginPath();
    g.moveTo(cx - 80, cy + 85);
    g.lineTo(cx + 80, cy + 85);
    g.lineTo(cx + 70, cy + 70);
    g.lineTo(cx - 60, cy + 70);
    g.closePath();
    g.fillPath();
    
    // Rubble piles
    const rubbleColors = [0x9a8a7a, 0x8b7a6a, 0x7a6a5a, 0xa89878];
    
    // Large central rubble pile
    g.fillStyle(rubbleColors[0], 1);
    g.beginPath();
    g.moveTo(cx - 60, cy + 70);
    g.lineTo(cx - 40, cy + 20);
    g.lineTo(cx - 20, cy + 35);
    g.lineTo(cx + 10, cy + 15);
    g.lineTo(cx + 40, cy + 30);
    g.lineTo(cx + 60, cy + 70);
    g.closePath();
    g.fillPath();
    
    // Secondary rubble
    g.fillStyle(rubbleColors[1], 1);
    g.beginPath();
    g.moveTo(cx - 50, cy + 70);
    g.lineTo(cx - 35, cy + 40);
    g.lineTo(cx - 10, cy + 50);
    g.lineTo(cx + 20, cy + 35);
    g.lineTo(cx + 45, cy + 70);
    g.closePath();
    g.fillPath();
    
    // Broken tower stump (left)
    g.fillStyle(0xe8dcc8, 0.9);
    g.fillRect(cx - 75, cy + 20, 35, 50);
    g.fillStyle(rubbleColors[2], 1);
    g.beginPath();
    g.moveTo(cx - 75, cy + 20);
    g.lineTo(cx - 65, cy - 5);
    g.lineTo(cx - 55, cy + 10);
    g.lineTo(cx - 40, cy + 20);
    g.closePath();
    g.fillPath();
    
    // Broken tower stump (right)
    g.fillStyle(0xe8dcc8, 0.9);
    g.fillRect(cx + 35, cy + 30, 35, 40);
    g.fillStyle(rubbleColors[3], 1);
    g.beginPath();
    g.moveTo(cx + 35, cy + 30);
    g.lineTo(cx + 50, cy + 5);
    g.lineTo(cx + 60, cy + 25);
    g.lineTo(cx + 70, cy + 30);
    g.closePath();
    g.fillPath();
    
    // Fallen roof piece
    g.fillStyle(0xa0522d, 0.8);
    g.beginPath();
    g.moveTo(cx - 30, cy + 60);
    g.lineTo(cx - 15, cy + 40);
    g.lineTo(cx + 10, cy + 55);
    g.closePath();
    g.fillPath();
    
    // Another fallen roof piece
    g.fillStyle(0x8b4513, 0.8);
    g.beginPath();
    g.moveTo(cx + 50, cy + 65);
    g.lineTo(cx + 65, cy + 45);
    g.lineTo(cx + 80, cy + 60);
    g.closePath();
    g.fillPath();
    
    // Scattered debris stones
    g.fillStyle(0x6a5a4a, 0.9);
    g.fillCircle(cx - 80, cy + 80, 8);
    g.fillCircle(cx - 70, cy + 85, 6);
    g.fillCircle(cx + 75, cy + 78, 7);
    g.fillCircle(cx + 85, cy + 82, 5);
    g.fillCircle(cx - 45, cy + 75, 5);
    g.fillCircle(cx + 55, cy + 72, 6);
    
    // Smoke/dust clouds
    g.fillStyle(0x4a4a4a, 0.3);
    g.fillCircle(cx - 20, cy, 20);
    g.fillCircle(cx + 15, cy - 10, 18);
    g.fillCircle(cx - 5, cy - 20, 15);
    g.fillStyle(0x5a5a5a, 0.2);
    g.fillCircle(cx + 30, cy + 5, 22);
    g.fillCircle(cx - 40, cy - 5, 16);
    
    // Broken flagpole on ground
    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(cx - 90, cy + 70, 40, 4);
    
    // Torn flag on ground
    g.fillStyle(0x880000, 0.7);
    g.beginPath();
    g.moveTo(cx - 50, cy + 72);
    g.lineTo(cx - 35, cy + 65);
    g.lineTo(cx - 20, cy + 75);
    g.lineTo(cx - 35, cy + 80);
    g.closePath();
    g.fillPath();
    
    // Cracks in foundation
    g.lineStyle(2, 0x3a2a1a, 0.8);
    g.beginPath();
    g.moveTo(cx - 40, cy + 85);
    g.lineTo(cx - 30, cy + 75);
    g.lineTo(cx - 35, cy + 70);
    g.strokePath();
    
    g.beginPath();
    g.moveTo(cx + 30, cy + 85);
    g.lineTo(cx + 25, cy + 78);
    g.lineTo(cx + 35, cy + 72);
    g.strokePath();
  }

  // ─────────────────────────────────────────────────────────────
  // SKY & TERRAIN
  // ─────────────────────────────────────────────────────────────

  private drawSkyBackground(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    const sky = this.scene.add.graphics();
    sky.setDepth(-100);
    
    const colors = [
      { y: 0, color: 0x87ceeb },
      { y: 0.3, color: 0xb0d4e8 },
      { y: 0.6, color: 0xffd4a3 },
      { y: 0.85, color: 0xffb366 },
      { y: 1, color: 0xe8c896 }
    ];
    
    for (let i = 0; i < colors.length - 1; i++) {
      const startY = colors[i].y * height;
      const endY = colors[i + 1].y * height;
      const steps = Math.ceil(endY - startY);
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const r1 = (colors[i].color >> 16) & 0xff;
        const g1 = (colors[i].color >> 8) & 0xff;
        const b1 = colors[i].color & 0xff;
        const r2 = (colors[i + 1].color >> 16) & 0xff;
        const g2 = (colors[i + 1].color >> 8) & 0xff;
        const b2 = colors[i + 1].color & 0xff;
        
        const r = Math.floor(r1 + (r2 - r1) * t);
        const g = Math.floor(g1 + (g2 - g1) * t);
        const b = Math.floor(b1 + (b2 - b1) * t);
        
        sky.fillStyle((r << 16) | (g << 8) | b, 1);
        sky.fillRect(0, startY + j, width, 2);
      }
    }
    
    // Sun
    sky.fillStyle(0xfffacd, 0.9);
    sky.fillCircle(1600, 120, 60);
    sky.fillStyle(0xffff99, 0.5);
    sky.fillCircle(1600, 120, 80);
    sky.fillStyle(0xffff66, 0.2);
    sky.fillCircle(1600, 120, 110);
  }

  private drawDesertTerrain(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    const terrain = this.scene.add.graphics();
    terrain.setDepth(-50);
    
    terrain.fillStyle(0xe8d4a8, 1);
    terrain.fillRect(0, 0, width, height);
    
    terrain.fillStyle(0xd4c094, 0.8);
    this.drawDune(terrain, -100, height * 0.7, 600, 200);
    this.drawDune(terrain, 400, height * 0.65, 800, 250);
    this.drawDune(terrain, 1000, height * 0.7, 700, 220);
    this.drawDune(terrain, 1500, height * 0.68, 600, 230);
    
    terrain.fillStyle(0xdec8a0, 0.9);
    this.drawDune(terrain, 100, height * 0.8, 500, 150);
    this.drawDune(terrain, 700, height * 0.78, 600, 180);
    this.drawDune(terrain, 1300, height * 0.82, 550, 160);
    
    terrain.fillStyle(0xf0e0c0, 0.4);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = 100 + Math.random() * (height - 150);
      terrain.fillEllipse(x, y, 80 + Math.random() * 120, 15 + Math.random() * 25);
    }
    
    terrain.lineStyle(1, 0xcbb896, 0.3);
    for (let y = 150; y < height; y += 40) {
      terrain.beginPath();
      terrain.moveTo(0, y);
      for (let x = 0; x < width; x += 20) {
        terrain.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 5);
      }
      terrain.strokePath();
    }
  }

  private drawDune(graphics: Phaser.GameObjects.Graphics, x: number, baseY: number, w: number, h: number): void {
    graphics.beginPath();
    graphics.moveTo(x, baseY + h);
    
    for (let t = 0; t <= 1; t += 0.02) {
      const px = x + w * t;
      const py = baseY + h - h * Math.sin(t * Math.PI) * (0.8 + Math.sin(t * 2) * 0.2);
      graphics.lineTo(px, py);
    }
    
    graphics.lineTo(x + w, baseY + h);
    graphics.closePath();
    graphics.fillPath();
  }

  // ─────────────────────────────────────────────────────────────
  // DECORATIONS
  // ─────────────────────────────────────────────────────────────

  private drawDecorations(): void {
    const DECO_PATH_MARGIN = 80;
    const HUD_MARGIN = 140;
    const width = this.scene.cameras.main.width;
    
    const isValidDecoPosition = (x: number, y: number): boolean => {
      if (y < HUD_MARGIN) return false;
      if (x < 30 || x > width - 30) return false;
      if (this.isNearPath(x, y, DECO_PATH_MARGIN)) return false;
      if (this.isInsidePathLoop(x, y)) return false;
      return true;
    };
    
    // Palm trees
    const palmPositions = [
      { x: 480, y: 180 }, { x: 680, y: 160 }, { x: 880, y: 200 },
      { x: 1380, y: 170 }, { x: 1580, y: 190 },
      { x: 150, y: 350 }, { x: 380, y: 400 }, { x: 580, y: 480 },
      { x: 920, y: 380 }, { x: 1100, y: 450 }, { x: 1300, y: 380 },
      { x: 1700, y: 420 }, { x: 1850, y: 350 },
      { x: 100, y: 650 }, { x: 320, y: 720 }, { x: 600, y: 680 },
      { x: 850, y: 750 }, { x: 1150, y: 700 }, { x: 1400, y: 750 },
      { x: 1650, y: 680 }, { x: 1850, y: 720 }
    ];
    for (const pos of palmPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawPalmTree(this.scene, pos.x, pos.y, 0.7 + Math.random() * 0.4);
      }
    }
    
    // Rocks
    const rockPositions = [
      { x: 550, y: 200 }, { x: 780, y: 180 }, { x: 1200, y: 190 }, { x: 1500, y: 170 },
      { x: 200, y: 400 }, { x: 450, y: 350 }, { x: 700, y: 420 },
      { x: 1000, y: 380 }, { x: 1250, y: 420 }, { x: 1550, y: 380 }, { x: 1800, y: 450 },
      { x: 150, y: 680 }, { x: 400, y: 750 }, { x: 650, y: 700 },
      { x: 950, y: 780 }, { x: 1200, y: 720 }, { x: 1500, y: 780 }, { x: 1750, y: 700 }
    ];
    for (const pos of rockPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawRocks(this.scene, pos.x, pos.y);
      }
    }
    
    // Ruins
    const ruinPositions = [
      { x: 620, y: 200 }, { x: 1450, y: 180 },
      { x: 300, y: 450 }, { x: 1650, y: 400 },
      { x: 500, y: 750 }, { x: 1100, y: 720 }, { x: 1750, y: 780 }
    ];
    for (const pos of ruinPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawRuins(this.scene, pos.x, pos.y);
      }
    }
    
    // Cacti
    const cactiPositions = [
      { x: 420, y: 170 }, { x: 750, y: 190 }, { x: 1050, y: 160 }, { x: 1320, y: 200 },
      { x: 180, y: 420 }, { x: 500, y: 380 }, { x: 780, y: 450 },
      { x: 1150, y: 400 }, { x: 1400, y: 450 }, { x: 1720, y: 380 },
      { x: 250, y: 700 }, { x: 550, y: 750 }, { x: 800, y: 700 },
      { x: 1050, y: 780 }, { x: 1350, y: 720 }, { x: 1600, y: 750 }, { x: 1850, y: 680 }
    ];
    for (const pos of cactiPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawCactus(this.scene, pos.x, pos.y, 0.6 + Math.random() * 0.5);
      }
    }
    
    // Scarabs
    const scarabPositions = [
      { x: 520, y: 170 }, { x: 1280, y: 180 },
      { x: 280, y: 380 }, { x: 650, y: 420 }, { x: 1000, y: 350 }, { x: 1500, y: 420 },
      { x: 180, y: 720 }, { x: 480, y: 680 }, { x: 900, y: 750 }, { x: 1250, y: 700 }, { x: 1650, y: 750 }
    ];
    for (const pos of scarabPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawScarab(this.scene, pos.x, pos.y);
      }
    }
    
    // Flowers/tumbleweeds
    const flowerPositions = [
      { x: 450, y: 200 }, { x: 700, y: 170 }, { x: 950, y: 190 }, { x: 1180, y: 170 }, { x: 1420, y: 200 },
      { x: 220, y: 380 }, { x: 420, y: 420 }, { x: 620, y: 350 }, { x: 850, y: 400 },
      { x: 1080, y: 380 }, { x: 1300, y: 450 }, { x: 1520, y: 380 }, { x: 1780, y: 420 },
      { x: 130, y: 700 }, { x: 350, y: 750 }, { x: 580, y: 720 }, { x: 780, y: 780 },
      { x: 1000, y: 700 }, { x: 1220, y: 750 }, { x: 1450, y: 700 }, { x: 1700, y: 780 }, { x: 1880, y: 720 }
    ];
    for (const pos of flowerPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        if (Math.random() > 0.5) {
          EnvironmentDecorations.drawDesertFlower(this.scene, pos.x, pos.y);
        } else {
          EnvironmentDecorations.drawTumbleweed(this.scene, pos.x, pos.y);
        }
      }
    }
    
    // Pottery
    const potteryPositions = [
      { x: 580, y: 180 }, { x: 1350, y: 190 },
      { x: 350, y: 400 }, { x: 900, y: 380 }, { x: 1600, y: 450 },
      { x: 200, y: 750 }, { x: 700, y: 700 }, { x: 1150, y: 780 }, { x: 1550, y: 720 }
    ];
    for (const pos of potteryPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawPottery(this.scene, pos.x, pos.y);
      }
    }
    
    // Scorpions
    const scorpionPositions = [
      { x: 480, y: 190 }, { x: 1100, y: 170 },
      { x: 250, y: 420 }, { x: 550, y: 380 }, { x: 950, y: 450 }, { x: 1450, y: 400 }, { x: 1750, y: 380 },
      { x: 300, y: 720 }, { x: 650, y: 750 }, { x: 1000, y: 720 }, { x: 1350, y: 780 }, { x: 1680, y: 700 }
    ];
    for (const pos of scorpionPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawScorpion(this.scene, pos.x, pos.y);
      }
    }
    
    // Oases
    if (isValidDecoPosition(1150, 200)) {
      EnvironmentDecorations.drawOasis(this.scene, 1150, 200);
    }
    if (isValidDecoPosition(450, 720)) {
      EnvironmentDecorations.drawOasis(this.scene, 450, 720);
    }
  }

  private isNearPath(x: number, y: number, margin: number): boolean {
    const segments = this.pathSystem.getSegments();
    for (const segment of segments) {
      const dist = this.pointToSegmentDistance(x, y, segment.start.x, segment.start.y, segment.end.x, segment.end.y);
      if (dist < margin) return true;
    }
    return false;
  }

  /**
   * Check if a point is inside any of the path's enclosed loop regions.
   * These are the hollow areas formed when the path curves back on itself.
   */
  private isInsidePathLoop(x: number, y: number): boolean {
    // Define the loop regions based on the level1 path layout
    // These are polygons representing the hollow interior of each loop
    
    // Loop 1: Top-right area (the first figure-8 loop interior)
    // Path goes: (770,320) -> (770,220) -> (840,160) -> (1080,160) -> (1180,230) -> (1180,420) -> (1080,490) -> (880,490) -> back
    const loop1 = [
      { x: 820, y: 210 },
      { x: 1100, y: 210 },
      { x: 1130, y: 260 },
      { x: 1130, y: 400 },
      { x: 1050, y: 450 },
      { x: 900, y: 450 },
      { x: 820, y: 380 },
      { x: 820, y: 260 }
    ];
    
    // Loop 2: Middle area (second interior)
    // Path goes around: (810,560) -> (810,720) -> (880,790) -> (1080,790) -> (1150,720) -> (1150,580) -> back
    const loop2 = [
      { x: 860, y: 590 },
      { x: 860, y: 700 },
      { x: 910, y: 750 },
      { x: 1050, y: 750 },
      { x: 1100, y: 700 },
      { x: 1100, y: 600 },
      { x: 1050, y: 550 },
      { x: 910, y: 550 }
    ];
    
    // Loop 3: Right area near castle
    // Path goes: (1220,510) -> (1420,510) -> (1490,580) -> (1490,740) -> (1560,810) -> ... 
    const loop3 = [
      { x: 1270, y: 550 },
      { x: 1400, y: 550 },
      { x: 1440, y: 600 },
      { x: 1440, y: 720 },
      { x: 1380, y: 770 },
      { x: 1270, y: 770 },
      { x: 1220, y: 720 },
      { x: 1220, y: 600 }
    ];
    
    return this.isPointInPolygon(x, y, loop1) || 
           this.isPointInPolygon(x, y, loop2) || 
           this.isPointInPolygon(x, y, loop3);
  }

  /**
   * Check if a point is inside a polygon using ray casting algorithm
   */
  private isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    const n = polygon.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
  }

  // ─────────────────────────────────────────────────────────────
  // CANYON PATH
  // ─────────────────────────────────────────────────────────────

  private drawCanyonPath(): void {
    this.pathRenderer.draw();
  }

  // ─────────────────────────────────────────────────────────────
  // SPAWN & GOAL
  // ─────────────────────────────────────────────────────────────

  private drawSpawnAndGoal(spawn: Phaser.Math.Vector2, goal: Phaser.Math.Vector2): void {
    this.castlePosition = goal.clone();
    
    // ===== SPAWN PORTAL =====
    const spawnGraphics = this.scene.add.graphics();
    spawnGraphics.setDepth(15);
    
    spawnGraphics.fillStyle(0x00ff00, 0.15);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 65);
    spawnGraphics.fillStyle(0x00ff00, 0.25);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 50);
    
    spawnGraphics.lineStyle(6, 0x006600, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 42);
    spawnGraphics.lineStyle(4, 0x00aa00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 38);
    spawnGraphics.lineStyle(2, 0x00ff00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 34);
    
    spawnGraphics.fillStyle(0x00ff44, 0.4);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 30);
    spawnGraphics.fillStyle(0x44ff88, 0.6);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 20);
    spawnGraphics.fillStyle(0x88ffaa, 0.8);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 10);
    
    spawnGraphics.lineStyle(2, 0x00cc00, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = spawn.x + Math.cos(angle) * 55;
      const ry = spawn.y + Math.sin(angle) * 55;
      spawnGraphics.strokeCircle(rx, ry, 5);
    }
    
    // ===== IMPRESSIVE 3D CASTLE =====
    this.drawCastle(goal.x, goal.y);
  }
  
  /**
   * Draw the main castle structure - gate faces top-left toward incoming path
   */
  private drawCastle(x: number, y: number): void {
    // Create container for castle elements
    this.castleContainer = this.scene.add.container(0, 0);
    this.castleContainer.setDepth(15);
    
    const castle = this.scene.add.graphics();
    this.castleContainer.add(castle);
    
    // Castle center - positioned so entrance faces the path coming from the left
    const cx = x - 20;
    const cy = y - 80;
    
    // ===== SHADOW =====
    castle.fillStyle(0x000000, 0.3);
    castle.fillEllipse(cx, cy + 95, 160, 40);
    
    // ===== TRAPEZOID STAIRCASE TO GATE (10 steps) =====
    const stairBaseY = cy + 160;  // Bottom of stairs
    const stairTopY = cy + 60;    // Top of stairs (at gate)
    const stairHeight = stairBaseY - stairTopY;
    const numSteps = 10;
    const stepHeight = stairHeight / numSteps;
    
    // Base width at bottom, narrows toward top (trapezoid)
    const baseWidthHalf = 100;  // Half-width at bottom
    const topWidthHalf = 40;    // Half-width at top
    
    // Draw each step from bottom to top
    for (let i = 0; i < numSteps; i++) {
      const stepY = stairBaseY - i * stepHeight;
      const nextY = stepY - stepHeight;
      
      // Calculate width at this step (linear interpolation)
      const progress = i / numSteps;
      const widthHalf = baseWidthHalf - (baseWidthHalf - topWidthHalf) * progress;
      const nextWidthHalf = baseWidthHalf - (baseWidthHalf - topWidthHalf) * ((i + 1) / numSteps);
      
      // Step top surface (lighter)
      const topColor = 0xd8ccb8 + (i * 0x010101);  // Slightly lighter toward top
      castle.fillStyle(Math.min(topColor, 0xe8dcd0), 1);
      castle.beginPath();
      castle.moveTo(cx - widthHalf, stepY - stepHeight + 2);
      castle.lineTo(cx + widthHalf, stepY - stepHeight + 2);
      castle.lineTo(cx + nextWidthHalf, nextY + 2);
      castle.lineTo(cx - nextWidthHalf, nextY + 2);
      castle.closePath();
      castle.fillPath();
      
      // Step front face (vertical part)
      castle.fillStyle(0xc4b8a4, 1);
      castle.fillRect(cx - widthHalf, stepY - stepHeight + 2, widthHalf * 2, stepHeight - 2);
      
      // Step edge shadow line
      castle.lineStyle(1, 0xa89888, 1);
      castle.lineBetween(cx - widthHalf, stepY - stepHeight + 2, cx + widthHalf, stepY - stepHeight + 2);
      
      // Step highlight on top edge
      castle.lineStyle(1, 0xe8dcd0, 0.6);
      castle.lineBetween(cx - widthHalf + 2, stepY - stepHeight + 3, cx + widthHalf - 2, stepY - stepHeight + 3);
    }
    
    // Left side wall (trapezoid shape)
    castle.fillStyle(0xa89878, 1);
    castle.beginPath();
    castle.moveTo(cx - baseWidthHalf, stairBaseY);
    castle.lineTo(cx - baseWidthHalf - 8, stairBaseY);
    castle.lineTo(cx - topWidthHalf - 8, stairTopY);
    castle.lineTo(cx - topWidthHalf, stairTopY);
    castle.closePath();
    castle.fillPath();
    
    // Right side wall (trapezoid shape)
    castle.fillStyle(0x988868, 1);
    castle.beginPath();
    castle.moveTo(cx + baseWidthHalf, stairBaseY);
    castle.lineTo(cx + baseWidthHalf + 8, stairBaseY);
    castle.lineTo(cx + topWidthHalf + 8, stairTopY);
    castle.lineTo(cx + topWidthHalf, stairTopY);
    castle.closePath();
    castle.fillPath();
    
    // ===== 3D FOUNDATION/PLATFORM =====
    // Front face of platform
    castle.fillStyle(0x9a8a70, 1);
    castle.beginPath();
    castle.moveTo(cx - 75, cy + 85);
    castle.lineTo(cx + 75, cy + 85);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx - 65, cy + 70);
    castle.closePath();
    castle.fillPath();
    
    // Top of platform
    castle.fillStyle(0xb8a890, 1);
    castle.beginPath();
    castle.moveTo(cx - 65, cy + 70);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx + 75, cy + 60);
    castle.lineTo(cx - 75, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Right side of platform (3D depth)
    castle.fillStyle(0x7a6a50, 1);
    castle.beginPath();
    castle.moveTo(cx + 75, cy + 85);
    castle.lineTo(cx + 85, cy + 70);
    castle.lineTo(cx + 85, cy + 60);
    castle.lineTo(cx + 75, cy + 75);
    castle.closePath();
    castle.fillPath();
    
    // ===== MAIN CASTLE BODY =====
    // Front wall (light beige)
    castle.fillStyle(0xe8dcc8, 1);
    castle.beginPath();
    castle.moveTo(cx - 60, cy + 60);
    castle.lineTo(cx - 60, cy - 35);
    castle.lineTo(cx + 60, cy - 35);
    castle.lineTo(cx + 60, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Right wall (slightly darker for 3D)
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx + 60, cy + 60);
    castle.lineTo(cx + 60, cy - 35);
    castle.lineTo(cx + 75, cy - 25);
    castle.lineTo(cx + 75, cy + 70);
    castle.closePath();
    castle.fillPath();
    
    // Stone texture lines on front wall
    castle.lineStyle(1, 0xc8bca8, 0.5);
    for (let row = 0; row < 5; row++) {
      const rowY = cy + 50 - row * 18;
      castle.lineBetween(cx - 58, rowY, cx + 58, rowY);
      // Vertical lines (offset each row)
      const offset = (row % 2) * 20;
      for (let col = 0; col < 6; col++) {
        const colX = cx - 50 + offset + col * 22;
        if (colX < cx + 55) {
          castle.lineBetween(colX, rowY, colX, rowY - 18);
        }
      }
    }
    
    // ===== LEFT TOWER =====
    // Tower body
    castle.fillStyle(0xe8dcc8, 1);
    castle.fillRect(cx - 75, cy - 70, 40, 130);
    
    // Tower right side (3D)
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx - 35, cy - 70);
    castle.lineTo(cx - 25, cy - 62);
    castle.lineTo(cx - 25, cy + 60);
    castle.lineTo(cx - 35, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Tower roof (conical, terracotta)
    castle.fillStyle(0xa0522d, 1);
    castle.beginPath();
    castle.moveTo(cx - 80, cy - 70);
    castle.lineTo(cx - 55, cy - 130);
    castle.lineTo(cx - 30, cy - 70);
    castle.closePath();
    castle.fillPath();
    
    // Roof highlight
    castle.fillStyle(0xb86b3d, 0.7);
    castle.beginPath();
    castle.moveTo(cx - 75, cy - 70);
    castle.lineTo(cx - 55, cy - 120);
    castle.lineTo(cx - 55, cy - 130);
    castle.closePath();
    castle.fillPath();
    
    // Roof edge shadow
    castle.lineStyle(2, 0x703010, 1);
    castle.lineBetween(cx - 55, cy - 130, cx - 30, cy - 70);
    
    // Tower window
    castle.fillStyle(0x3a3020, 1);
    castle.fillRect(cx - 62, cy - 40, 14, 22);
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.strokeRect(cx - 62, cy - 40, 14, 22);
    // Window cross
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.lineBetween(cx - 55, cy - 40, cx - 55, cy - 18);
    castle.lineBetween(cx - 62, cy - 29, cx - 48, cy - 29);
    
    // ===== RIGHT TOWER =====
    // Tower body
    castle.fillStyle(0xe8dcc8, 1);
    castle.fillRect(cx + 35, cy - 55, 40, 115);
    
    // Tower right side (3D)
    castle.fillStyle(0xd4c8b4, 1);
    castle.beginPath();
    castle.moveTo(cx + 75, cy - 55);
    castle.lineTo(cx + 88, cy - 45);
    castle.lineTo(cx + 88, cy + 60);
    castle.lineTo(cx + 75, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Tower roof (conical, terracotta)
    castle.fillStyle(0xa0522d, 1);
    castle.beginPath();
    castle.moveTo(cx + 30, cy - 55);
    castle.lineTo(cx + 55, cy - 115);
    castle.lineTo(cx + 80, cy - 55);
    castle.closePath();
    castle.fillPath();
    
    // Roof highlight
    castle.fillStyle(0xb86b3d, 0.7);
    castle.beginPath();
    castle.moveTo(cx + 35, cy - 55);
    castle.lineTo(cx + 55, cy - 105);
    castle.lineTo(cx + 55, cy - 115);
    castle.closePath();
    castle.fillPath();
    
    // Roof edge shadow
    castle.lineStyle(2, 0x703010, 1);
    castle.lineBetween(cx + 55, cy - 115, cx + 80, cy - 55);
    
    // Tower window
    castle.fillStyle(0x3a3020, 1);
    castle.fillRect(cx + 48, cy - 28, 14, 22);
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.strokeRect(cx + 48, cy - 28, 14, 22);
    // Window cross
    castle.lineStyle(2, 0x5a4a38, 1);
    castle.lineBetween(cx + 55, cy - 28, cx + 55, cy - 6);
    castle.lineBetween(cx + 48, cy - 17, cx + 62, cy - 17);
    
    // ===== MAIN ENTRANCE GATE =====
    // Gate arch - dark interior
    castle.fillStyle(0x1a0a00, 1);
    castle.beginPath();
    castle.moveTo(cx - 25, cy + 60);
    castle.lineTo(cx - 25, cy + 10);
    castle.arc(cx, cy + 10, 25, Math.PI, 0, false);
    castle.lineTo(cx + 25, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Decorative sun/fan pattern above gate
    castle.fillStyle(0xd4a574, 1);
    castle.beginPath();
    castle.arc(cx, cy + 10, 20, Math.PI, 0, false);
    castle.closePath();
    castle.fillPath();
    
    // Sun rays
    castle.lineStyle(2, 0xb08050, 1);
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI + (i * Math.PI / 8);
      const innerR = 8;
      const outerR = 18;
      castle.lineBetween(
        cx + Math.cos(angle) * innerR,
        cy + 10 + Math.sin(angle) * innerR,
        cx + Math.cos(angle) * outerR,
        cy + 10 + Math.sin(angle) * outerR
      );
    }
    
    // Inner dark arch
    castle.fillStyle(0x0a0500, 1);
    castle.beginPath();
    castle.moveTo(cx - 18, cy + 60);
    castle.lineTo(cx - 18, cy + 15);
    castle.arc(cx, cy + 15, 18, Math.PI, 0, false);
    castle.lineTo(cx + 18, cy + 60);
    castle.closePath();
    castle.fillPath();
    
    // Gate frame - 3D stone arch
    castle.lineStyle(4, 0x8a7a68, 1);
    castle.beginPath();
    castle.moveTo(cx - 28, cy + 62);
    castle.lineTo(cx - 28, cy + 10);
    castle.arc(cx, cy + 10, 28, Math.PI, 0, false);
    castle.lineTo(cx + 28, cy + 62);
    castle.strokePath();
    
    // Inner arch highlight
    castle.lineStyle(2, 0xc8b8a8, 1);
    castle.beginPath();
    castle.moveTo(cx - 25, cy + 60);
    castle.lineTo(cx - 25, cy + 10);
    castle.arc(cx, cy + 10, 25, Math.PI, 0, false);
    castle.lineTo(cx + 25, cy + 60);
    castle.strokePath();
    
    // ===== LANTERNS =====
    // Left lantern bracket
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillRect(cx - 42, cy + 25, 6, 3);
    castle.fillRect(cx - 40, cy + 28, 4, 12);
    // Lantern glow
    castle.fillStyle(0xff8800, 0.4);
    castle.fillCircle(cx - 38, cy + 38, 12);
    // Lantern body
    castle.fillStyle(0xd4a030, 1);
    castle.fillRoundedRect(cx - 44, cy + 35, 12, 14, 3);
    castle.fillStyle(0xffcc44, 0.9);
    castle.fillRoundedRect(cx - 42, cy + 37, 8, 10, 2);
    
    // Right lantern bracket
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillRect(cx + 36, cy + 25, 6, 3);
    castle.fillRect(cx + 36, cy + 28, 4, 12);
    // Lantern glow
    castle.fillStyle(0xff8800, 0.4);
    castle.fillCircle(cx + 38, cy + 38, 12);
    // Lantern body
    castle.fillStyle(0xd4a030, 1);
    castle.fillRoundedRect(cx + 32, cy + 35, 12, 14, 3);
    castle.fillStyle(0xffcc44, 0.9);
    castle.fillRoundedRect(cx + 34, cy + 37, 8, 10, 2);
    
    // ===== ROOF DETAIL BETWEEN TOWERS =====
    castle.fillStyle(0x8b6914, 1);
    castle.beginPath();
    castle.moveTo(cx - 35, cy - 35);
    castle.lineTo(cx - 30, cy - 45);
    castle.lineTo(cx + 30, cy - 45);
    castle.lineTo(cx + 35, cy - 35);
    castle.closePath();
    castle.fillPath();
    
    // ===== FLAG POLE (on top of left tower roof) =====
    // Left tower roof peak is at cx - 55, cy - 130
    castle.fillStyle(0x3a3a3a, 1);
    castle.fillRect(cx - 57, cy - 175, 4, 50);
    
    // Create separate graphics for animated flag
    this.flagGraphics = this.scene.add.graphics();
    this.flagGraphics.setDepth(16);
    this.castleContainer.add(this.flagGraphics);
    this.drawFlag(cx, cy);
    
    // Create damage overlay graphics
    this.castleDamageGraphics = this.scene.add.graphics();
    this.castleDamageGraphics.setDepth(17);
    this.castleContainer.add(this.castleDamageGraphics);
  }
  
  /**
   * Draw animated flag
   */
  private drawFlag(x: number, y: number): void {
    if (!this.flagGraphics) return;
    
    this.flagGraphics.clear();
    
    // Flag position (on top of left tower flagpole)
    const flagX = x - 73;
    const flagY = y - 253;
    const flagWidth = 30;
    const flagHeight = 18;
    
    // Calculate wave offsets for animation
    const wave1 = Math.sin(this.flagPhase) * 2;
    const wave2 = Math.sin(this.flagPhase + 1) * 3;
    const wave3 = Math.sin(this.flagPhase + 2) * 2;
    
    // Draw flag with wave
    this.flagGraphics.fillStyle(0xcc0000, 1);
    this.flagGraphics.beginPath();
    this.flagGraphics.moveTo(flagX, flagY);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.33, flagY + wave1);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.66, flagY + wave2);
    this.flagGraphics.lineTo(flagX + flagWidth, flagY + wave3);
    this.flagGraphics.lineTo(flagX + flagWidth, flagY + flagHeight + wave3);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.66, flagY + flagHeight + wave2);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.33, flagY + flagHeight + wave1);
    this.flagGraphics.lineTo(flagX, flagY + flagHeight);
    this.flagGraphics.closePath();
    this.flagGraphics.fillPath();
    
    // Flag highlight
    this.flagGraphics.fillStyle(0xff2222, 0.6);
    this.flagGraphics.beginPath();
    this.flagGraphics.moveTo(flagX, flagY + 2);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.4, flagY + 2 + wave1 * 0.8);
    this.flagGraphics.lineTo(flagX + flagWidth * 0.4, flagY + 7 + wave1 * 0.8);
    this.flagGraphics.lineTo(flagX, flagY + 7);
    this.flagGraphics.closePath();
    this.flagGraphics.fillPath();
    
    // Flag emblem (simple dot)
    this.flagGraphics.fillStyle(0xffd700, 0.9);
    const emblX = flagX + flagWidth * 0.5;
    const emblY = flagY + flagHeight * 0.5 + wave2 * 0.5;
    this.flagGraphics.fillCircle(emblX, emblY, 4);
  }
  
  /**
   * Draw castle damage overlay
   */
  private drawCastleDamage(x: number, y: number): void {
    if (!this.castleDamageGraphics) return;
    
    this.castleDamageGraphics.clear();
    
    if (this.currentDamageState === 0) return; // No damage
    
    // Adjust for new castle position
    const cx = x - 20;
    const cy = y - 80;
    
    // Crack color
    const crackColor = 0x2a1a0a;
    
    if (this.currentDamageState >= 1) {
      // Medium damage - some cracks and missing stones
      this.castleDamageGraphics.lineStyle(3, crackColor, 0.8);
      
      // Crack on front wall
      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx - 40, cy + 20);
      this.castleDamageGraphics.lineTo(cx - 35, cy + 35);
      this.castleDamageGraphics.lineTo(cx - 45, cy + 50);
      this.castleDamageGraphics.strokePath();
      
      // Crack on left tower
      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx - 55, cy - 30);
      this.castleDamageGraphics.lineTo(cx - 50, cy - 15);
      this.castleDamageGraphics.lineTo(cx - 60, cy);
      this.castleDamageGraphics.strokePath();
      
      // Scorch marks
      this.castleDamageGraphics.fillStyle(0x3a3a3a, 0.4);
      this.castleDamageGraphics.fillCircle(cx + 20, cy + 30, 10);
      this.castleDamageGraphics.fillCircle(cx - 30, cy - 10, 8);
    }
    
    if (this.currentDamageState >= 2) {
      // Heavy damage - more cracks, rubble, smoke
      this.castleDamageGraphics.lineStyle(4, crackColor, 0.9);
      
      // Large crack on right tower
      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx + 50, cy - 40);
      this.castleDamageGraphics.lineTo(cx + 55, cy - 20);
      this.castleDamageGraphics.lineTo(cx + 45, cy);
      this.castleDamageGraphics.lineTo(cx + 52, cy + 20);
      this.castleDamageGraphics.strokePath();
      
      // Crack on main body
      this.castleDamageGraphics.beginPath();
      this.castleDamageGraphics.moveTo(cx + 10, cy - 20);
      this.castleDamageGraphics.lineTo(cx + 5, cy);
      this.castleDamageGraphics.lineTo(cx + 15, cy + 20);
      this.castleDamageGraphics.strokePath();
      
      // Rubble at base
      this.castleDamageGraphics.fillStyle(0x9a8a7a, 0.9);
      this.castleDamageGraphics.fillCircle(cx - 70, cy + 75, 8);
      this.castleDamageGraphics.fillCircle(cx - 55, cy + 80, 6);
      this.castleDamageGraphics.fillCircle(cx + 75, cy + 75, 7);
      this.castleDamageGraphics.fillCircle(cx + 65, cy + 82, 5);
      
      // More scorch marks
      this.castleDamageGraphics.fillStyle(0x2a2a2a, 0.5);
      this.castleDamageGraphics.fillCircle(cx - 45, cy - 50, 12);
      this.castleDamageGraphics.fillCircle(cx + 45, cy - 25, 10);
      this.castleDamageGraphics.fillCircle(cx, cy + 10, 14);
      
      // Smoke wisps
      this.castleDamageGraphics.fillStyle(0x4a4a4a, 0.3);
      this.castleDamageGraphics.fillCircle(cx - 55, cy - 140, 8);
      this.castleDamageGraphics.fillCircle(cx - 50, cy - 150, 6);
      this.castleDamageGraphics.fillCircle(cx + 55, cy - 120, 7);
    }
  }
}
