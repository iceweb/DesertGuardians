import Phaser from 'phaser';
import { PathSystem } from '../managers/PathSystem';
import { EnvironmentDecorations } from './EnvironmentDecorations';
import { PathRenderer } from './PathRenderer';

/**
 * GameEnvironment handles all environmental/decorative rendering.
 * Extracted from GameScene to keep files under 500 LOC.
 */
export class GameEnvironment {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pathRenderer: PathRenderer;
  private castlePosition: Phaser.Math.Vector2 | null = null;

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
      return !this.isNearPath(x, y, DECO_PATH_MARGIN);
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
    
    // ===== CASTLE =====
    const castle = this.scene.add.graphics();
    castle.setDepth(15);
    
    castle.fillStyle(0x000000, 0.3);
    castle.fillRect(goal.x - 65, goal.y - 70, 140, 110);
    
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x - 55, goal.y - 75, 110, 95);
    
    castle.fillStyle(0xb99a5c, 1);
    castle.fillRect(goal.x - 50, goal.y - 70, 100, 85);
    
    // Left tower
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x - 65, goal.y - 110, 35, 130);
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x - 60, goal.y - 105, 25, 120);
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x - 65, goal.y - 110, goal.x - 47, goal.y - 145, goal.x - 30, goal.y - 110);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x - 60, goal.y - 110, goal.x - 47, goal.y - 135, goal.x - 35, goal.y - 110);
    
    // Right tower
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x + 30, goal.y - 110, 35, 130);
    castle.fillStyle(0xc9a86c, 1);
    castle.fillRect(goal.x + 35, goal.y - 105, 25, 120);
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x + 30, goal.y - 110, goal.x + 47, goal.y - 145, goal.x + 65, goal.y - 110);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x + 35, goal.y - 110, goal.x + 47, goal.y - 135, goal.x + 60, goal.y - 110);
    
    // Center tower
    castle.fillStyle(0xe9c88c, 1);
    castle.fillRect(goal.x - 20, goal.y - 120, 40, 80);
    castle.fillStyle(0xd9b87c, 1);
    castle.fillRect(goal.x - 15, goal.y - 115, 30, 70);
    castle.fillStyle(0x8b4513, 1);
    castle.fillTriangle(goal.x - 25, goal.y - 120, goal.x, goal.y - 160, goal.x + 25, goal.y - 120);
    castle.fillStyle(0xa0522d, 1);
    castle.fillTriangle(goal.x - 18, goal.y - 120, goal.x, goal.y - 150, goal.x + 18, goal.y - 120);
    
    // Flag
    castle.fillStyle(0x4a4a4a, 1);
    castle.fillRect(goal.x - 2, goal.y - 180, 4, 35);
    castle.fillStyle(0xff0000, 1);
    castle.fillTriangle(goal.x + 2, goal.y - 180, goal.x + 2, goal.y - 160, goal.x + 30, goal.y - 170);
    
    // Battlements
    castle.fillStyle(0xd9b87c, 1);
    for (let i = -45; i <= 40; i += 18) {
      castle.fillRect(goal.x + i, goal.y - 85, 12, 18);
    }
    
    // Gate
    castle.fillStyle(0x3a2a1a, 1);
    castle.fillRect(goal.x - 20, goal.y - 50, 40, 70);
    castle.fillStyle(0x2a1a0a, 1);
    castle.fillRect(goal.x - 15, goal.y - 45, 30, 60);
    castle.fillStyle(0x4a3a2a, 1);
    castle.fillCircle(goal.x, goal.y - 50, 20);
    castle.fillStyle(0x2a1a0a, 1);
    castle.fillCircle(goal.x, goal.y - 50, 15);
    castle.lineStyle(2, 0x5a4a3a, 1);
    for (let i = -12; i <= 12; i += 6) {
      castle.lineBetween(goal.x + i, goal.y - 45, goal.x + i, goal.y + 15);
    }
    
    // Windows
    castle.fillStyle(0xffeeaa, 0.9);
    castle.fillRect(goal.x - 50, goal.y - 60, 12, 18);
    castle.fillRect(goal.x + 38, goal.y - 60, 12, 18);
    castle.fillRect(goal.x - 8, goal.y - 100, 16, 22);
    castle.lineStyle(2, 0x3a2a1a, 1);
    castle.strokeRect(goal.x - 50, goal.y - 60, 12, 18);
    castle.strokeRect(goal.x + 38, goal.y - 60, 12, 18);
    castle.strokeRect(goal.x - 8, goal.y - 100, 16, 22);
    
    // Tower windows
    castle.fillStyle(0xffeeaa, 0.7);
    castle.fillRect(goal.x - 55, goal.y - 80, 10, 14);
    castle.fillRect(goal.x + 45, goal.y - 80, 10, 14);
  }
}
