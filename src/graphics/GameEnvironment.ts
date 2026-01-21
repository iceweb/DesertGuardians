import Phaser from 'phaser';
import { PathSystem } from '../managers/MapPathSystem';
import { EnvironmentDecorations } from './EnvironmentDecorations';
import { PathRenderer } from './PathRenderer';
import { TerrainRenderer } from './TerrainRenderer';
import { CastleRenderer } from './CastleRenderer';

/**
 * Main environment controller that coordinates rendering of all environment elements.
 * Refactored to delegate to specialized renderer classes.
 */
export class GameEnvironment {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;
  private pathRenderer: PathRenderer;
  private terrainRenderer: TerrainRenderer;
  private castleRenderer: CastleRenderer;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
    this.pathRenderer = new PathRenderer(scene, pathSystem);
    this.terrainRenderer = new TerrainRenderer(scene);
    this.castleRenderer = new CastleRenderer(scene);
  }

  drawAll(spawn: Phaser.Math.Vector2, goal: Phaser.Math.Vector2): void {
    this.terrainRenderer.drawSkyBackground();
    this.terrainRenderer.drawDesertTerrain();
    this.drawDecorations();
    this.pathRenderer.draw();
    this.drawSpawnAndGoal(spawn, goal);
  }

  getCastlePosition(): Phaser.Math.Vector2 | null {
    return this.castleRenderer.getCastlePosition();
  }

  update(delta: number): void {
    this.castleRenderer.update(delta);
  }

  updateCastleDamage(currentHP: number): void {
    this.castleRenderer.updateCastleDamage(currentHP);
  }

  playCastleDestructionAnimation(onComplete?: () => void): void {
    this.castleRenderer.playCastleDestructionAnimation(onComplete);
  }

  showDestroyedCastle(): void {
    this.castleRenderer.showDestroyedCastle();
  }

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
      { x: 480, y: 180 },
      { x: 680, y: 160 },
      { x: 880, y: 200 },
      { x: 1380, y: 170 },
      { x: 1580, y: 190 },
      { x: 150, y: 350 },
      { x: 380, y: 400 },
      { x: 580, y: 480 },
      { x: 920, y: 380 },
      { x: 1100, y: 450 },
      { x: 1300, y: 380 },
      { x: 1700, y: 420 },
      { x: 1850, y: 350 },
      { x: 100, y: 650 },
      { x: 320, y: 720 },
      { x: 600, y: 680 },
      { x: 850, y: 750 },
      { x: 1150, y: 700 },
      { x: 1400, y: 750 },
      { x: 1650, y: 680 },
      { x: 1850, y: 720 },
    ];
    for (const pos of palmPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawPalmTree(this.scene, pos.x, pos.y, 0.7 + Math.random() * 0.4);
      }
    }

    // Rocks
    const rockPositions = [
      { x: 550, y: 200 },
      { x: 780, y: 180 },
      { x: 1200, y: 190 },
      { x: 1500, y: 170 },
      { x: 200, y: 400 },
      { x: 450, y: 350 },
      { x: 700, y: 420 },
      { x: 1000, y: 380 },
      { x: 1250, y: 420 },
      { x: 1550, y: 380 },
      { x: 1800, y: 450 },
      { x: 150, y: 680 },
      { x: 400, y: 750 },
      { x: 650, y: 700 },
      { x: 950, y: 780 },
      { x: 1200, y: 720 },
      { x: 1500, y: 780 },
      { x: 1750, y: 700 },
    ];
    for (const pos of rockPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawRocks(this.scene, pos.x, pos.y);
      }
    }

    // Ruins
    const ruinPositions = [
      { x: 620, y: 200 },
      { x: 1450, y: 180 },
      { x: 300, y: 450 },
      { x: 1650, y: 400 },
      { x: 500, y: 750 },
      { x: 1100, y: 720 },
      { x: 1750, y: 780 },
    ];
    for (const pos of ruinPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawRuins(this.scene, pos.x, pos.y);
      }
    }

    // Cacti
    const cactiPositions = [
      { x: 420, y: 170 },
      { x: 750, y: 190 },
      { x: 1050, y: 160 },
      { x: 1320, y: 200 },
      { x: 180, y: 420 },
      { x: 500, y: 380 },
      { x: 780, y: 450 },
      { x: 1150, y: 400 },
      { x: 1400, y: 450 },
      { x: 1720, y: 380 },
      { x: 250, y: 700 },
      { x: 550, y: 750 },
      { x: 800, y: 700 },
      { x: 1050, y: 780 },
      { x: 1350, y: 720 },
      { x: 1600, y: 750 },
      { x: 1850, y: 680 },
    ];
    for (const pos of cactiPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawCactus(this.scene, pos.x, pos.y, 0.6 + Math.random() * 0.5);
      }
    }

    // Scarabs
    const scarabPositions = [
      { x: 520, y: 170 },
      { x: 1280, y: 180 },
      { x: 280, y: 380 },
      { x: 650, y: 420 },
      { x: 1000, y: 350 },
      { x: 1500, y: 420 },
      { x: 180, y: 720 },
      { x: 480, y: 680 },
      { x: 900, y: 750 },
      { x: 1250, y: 700 },
      { x: 1650, y: 750 },
    ];
    for (const pos of scarabPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawScarab(this.scene, pos.x, pos.y);
      }
    }

    // Flowers and tumbleweeds
    const flowerPositions = [
      { x: 450, y: 200 },
      { x: 700, y: 170 },
      { x: 950, y: 190 },
      { x: 1180, y: 170 },
      { x: 1420, y: 200 },
      { x: 220, y: 380 },
      { x: 420, y: 420 },
      { x: 620, y: 350 },
      { x: 850, y: 400 },
      { x: 1080, y: 380 },
      { x: 1300, y: 450 },
      { x: 1520, y: 380 },
      { x: 1780, y: 420 },
      { x: 130, y: 700 },
      { x: 350, y: 750 },
      { x: 580, y: 720 },
      { x: 780, y: 780 },
      { x: 1000, y: 700 },
      { x: 1220, y: 750 },
      { x: 1450, y: 700 },
      { x: 1700, y: 780 },
      { x: 1880, y: 720 },
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
      { x: 580, y: 180 },
      { x: 1350, y: 190 },
      { x: 350, y: 400 },
      { x: 900, y: 380 },
      { x: 1600, y: 450 },
      { x: 200, y: 750 },
      { x: 700, y: 700 },
      { x: 1150, y: 780 },
      { x: 1550, y: 720 },
    ];
    for (const pos of potteryPositions) {
      if (isValidDecoPosition(pos.x, pos.y)) {
        EnvironmentDecorations.drawPottery(this.scene, pos.x, pos.y);
      }
    }

    // Scorpions
    const scorpionPositions = [
      { x: 480, y: 190 },
      { x: 1100, y: 170 },
      { x: 250, y: 420 },
      { x: 550, y: 380 },
      { x: 950, y: 450 },
      { x: 1450, y: 400 },
      { x: 1750, y: 380 },
      { x: 300, y: 720 },
      { x: 650, y: 750 },
      { x: 1000, y: 720 },
      { x: 1350, y: 780 },
      { x: 1680, y: 700 },
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
      const dist = this.pointToSegmentDistance(
        x,
        y,
        segment.start.x,
        segment.start.y,
        segment.end.x,
        segment.end.y
      );
      if (dist < margin) return true;
    }
    return false;
  }

  private isInsidePathLoop(x: number, y: number): boolean {
    // Define the path loop polygons
    const loop1 = [
      { x: 820, y: 210 },
      { x: 1100, y: 210 },
      { x: 1130, y: 260 },
      { x: 1130, y: 400 },
      { x: 1050, y: 450 },
      { x: 900, y: 450 },
      { x: 820, y: 380 },
      { x: 820, y: 260 },
    ];

    const loop2 = [
      { x: 860, y: 590 },
      { x: 860, y: 700 },
      { x: 910, y: 750 },
      { x: 1050, y: 750 },
      { x: 1100, y: 700 },
      { x: 1100, y: 600 },
      { x: 1050, y: 550 },
      { x: 910, y: 550 },
    ];

    const loop3 = [
      { x: 1270, y: 550 },
      { x: 1400, y: 550 },
      { x: 1440, y: 600 },
      { x: 1440, y: 720 },
      { x: 1380, y: 770 },
      { x: 1270, y: 770 },
      { x: 1220, y: 720 },
      { x: 1220, y: 600 },
    ];

    return (
      this.isPointInPolygon(x, y, loop1) ||
      this.isPointInPolygon(x, y, loop2) ||
      this.isPointInPolygon(x, y, loop3)
    );
  }

  private isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
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

  private drawSpawnAndGoal(spawn: Phaser.Math.Vector2, goal: Phaser.Math.Vector2): void {
    // Draw spawn portal
    const spawnGraphics = this.scene.add.graphics();
    spawnGraphics.setDepth(15);

    // Outer glow
    spawnGraphics.fillStyle(0x00ff00, 0.15);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 65);
    spawnGraphics.fillStyle(0x00ff00, 0.25);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 50);

    // Rings
    spawnGraphics.lineStyle(6, 0x006600, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 42);
    spawnGraphics.lineStyle(4, 0x00aa00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 38);
    spawnGraphics.lineStyle(2, 0x00ff00, 1);
    spawnGraphics.strokeCircle(spawn.x, spawn.y, 34);

    // Core
    spawnGraphics.fillStyle(0x00ff44, 0.4);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 30);
    spawnGraphics.fillStyle(0x44ff88, 0.6);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 20);
    spawnGraphics.fillStyle(0x88ffaa, 0.8);
    spawnGraphics.fillCircle(spawn.x, spawn.y, 10);

    // Orbital dots
    spawnGraphics.lineStyle(2, 0x00cc00, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = spawn.x + Math.cos(angle) * 55;
      const ry = spawn.y + Math.sin(angle) * 55;
      spawnGraphics.strokeCircle(rx, ry, 5);
    }

    // Draw castle at goal
    this.castleRenderer.drawCastle(goal.x, goal.y);
  }
}
