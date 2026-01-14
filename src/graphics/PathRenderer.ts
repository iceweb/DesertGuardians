import Phaser from 'phaser';
import { PathSystem } from '../managers/MapPathSystem';

export class PathRenderer {
  private scene: Phaser.Scene;
  private pathSystem: PathSystem;

  constructor(scene: Phaser.Scene, pathSystem: PathSystem) {
    this.scene = scene;
    this.pathSystem = pathSystem;
  }

  draw(): void {
    const segments = this.pathSystem.getSegments();
    const points = this.pathSystem.getPoints();
    const pathWidth = 60;

    const outerGlow = this.scene.add.graphics();
    outerGlow.setDepth(-5);
    this.drawPathLayer(outerGlow, segments, points, pathWidth + 40, 0x2a1a0a, 0.4);

    const deepShadow = this.scene.add.graphics();
    deepShadow.setDepth(-4);
    this.drawPathLayer(deepShadow, segments, points, pathWidth + 30, 0x1a0a00, 1);

    const outerWalls = this.scene.add.graphics();
    outerWalls.setDepth(-3);
    this.drawPathLayer(outerWalls, segments, points, pathWidth + 20, 0x4a3020, 1);

    const midWalls = this.scene.add.graphics();
    midWalls.setDepth(-2);
    this.drawPathLayer(midWalls, segments, points, pathWidth + 10, 0x6b4a30, 1);

    const innerWalls = this.scene.add.graphics();
    innerWalls.setDepth(-1);
    this.drawPathLayer(innerWalls, segments, points, pathWidth, 0x8b6a4a, 1);

    const floorShadow = this.scene.add.graphics();
    floorShadow.setDepth(0);
    this.drawPathLayer(floorShadow, segments, points, pathWidth - 15, 0x9a7a5a, 1);

    const walkPath = this.scene.add.graphics();
    walkPath.setDepth(1);
    this.drawPathLayer(walkPath, segments, points, pathWidth - 25, 0xc4a070, 1);

    const centerPath = this.scene.add.graphics();
    centerPath.setDepth(2);
    this.drawPathLayer(centerPath, segments, points, pathWidth - 40, 0xd4b080, 1);

    this.addCanyonEdgeDetails(segments, pathWidth);
    this.addPathDetails(segments);
  }

  private drawPathLayer(
    graphics: Phaser.GameObjects.Graphics,
    segments: {
      start: Phaser.Math.Vector2;
      end: Phaser.Math.Vector2;
      direction: Phaser.Math.Vector2;
    }[],
    points: Phaser.Math.Vector2[],
    width: number,
    color: number,
    alpha: number
  ): void {
    graphics.fillStyle(color, alpha);
    const halfWidth = width / 2;

    for (const segment of segments) {
      const perpX = -segment.direction.y * halfWidth;
      const perpY = segment.direction.x * halfWidth;

      graphics.beginPath();
      graphics.moveTo(segment.start.x + perpX, segment.start.y + perpY);
      graphics.lineTo(segment.end.x + perpX, segment.end.y + perpY);
      graphics.lineTo(segment.end.x - perpX, segment.end.y - perpY);
      graphics.lineTo(segment.start.x - perpX, segment.start.y - perpY);
      graphics.closePath();
      graphics.fillPath();
    }

    for (const point of points) {
      graphics.fillCircle(point.x, point.y, halfWidth);
    }
  }

  private addCanyonEdgeDetails(
    segments: {
      start: Phaser.Math.Vector2;
      end: Phaser.Math.Vector2;
      direction: Phaser.Math.Vector2;
      length: number;
    }[],
    pathWidth: number
  ): void {
    const edgeDetails = this.scene.add.graphics();
    edgeDetails.setDepth(-0.5);

    for (const segment of segments) {
      const numRocks = Math.floor(segment.length / 30);

      for (let i = 0; i < numRocks; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);

        const perpX = -segment.direction.y;
        const perpY = segment.direction.x;

        if (Math.random() > 0.5) {
          const offset = pathWidth / 2 + 5 + Math.random() * 8;
          const rockX = x + perpX * offset;
          const rockY = y + perpY * offset;
          const rockSize = 3 + Math.random() * 6;

          edgeDetails.fillStyle(0x5a4030, 0.9);
          edgeDetails.fillCircle(rockX, rockY, rockSize);
          edgeDetails.fillStyle(0x7a6050, 0.7);
          edgeDetails.fillCircle(rockX - 1, rockY - 1, rockSize * 0.6);
        }

        if (Math.random() > 0.5) {
          const offset = pathWidth / 2 + 5 + Math.random() * 8;
          const rockX = x - perpX * offset;
          const rockY = y - perpY * offset;
          const rockSize = 3 + Math.random() * 6;

          edgeDetails.fillStyle(0x4a3020, 0.9);
          edgeDetails.fillCircle(rockX, rockY, rockSize);
          edgeDetails.fillStyle(0x6a5040, 0.7);
          edgeDetails.fillCircle(rockX - 1, rockY - 1, rockSize * 0.6);
        }
      }
    }

    const cracks = this.scene.add.graphics();
    cracks.setDepth(-1.5);
    cracks.lineStyle(1, 0x3a2010, 0.5);

    for (const segment of segments) {
      const numCracks = Math.floor(segment.length / 80);

      for (let i = 0; i < numCracks; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);

        const perpX = -segment.direction.y;
        const perpY = segment.direction.x;
        const side = Math.random() > 0.5 ? 1 : -1;
        const offset = pathWidth / 2 + 10;

        const crackX = x + perpX * offset * side;
        const crackY = y + perpY * offset * side;

        cracks.beginPath();
        cracks.moveTo(crackX, crackY);
        const crackLen = 10 + Math.random() * 15;
        for (let j = 0; j < 3; j++) {
          cracks.lineTo(
            crackX + (Math.random() - 0.5) * 8 + perpX * side * crackLen * (j / 3),
            crackY + (Math.random() - 0.5) * 8 + perpY * side * crackLen * (j / 3)
          );
        }
        cracks.strokePath();
      }
    }
  }

  private addPathDetails(
    segments: {
      start: Phaser.Math.Vector2;
      end: Phaser.Math.Vector2;
      direction: Phaser.Math.Vector2;
      length: number;
    }[]
  ): void {
    const details = this.scene.add.graphics();
    details.setDepth(1.5);

    for (const segment of segments) {
      const numDetails = Math.floor(segment.length / 50);

      for (let i = 0; i < numDetails; i++) {
        const t = Math.random();
        const x = Phaser.Math.Linear(segment.start.x, segment.end.x, t);
        const y = Phaser.Math.Linear(segment.start.y, segment.end.y, t);

        if (Math.random() > 0.6) {
          details.fillStyle(0x9a7a5a, 0.5);
          details.fillCircle(
            x + (Math.random() - 0.5) * 30,
            y + (Math.random() - 0.5) * 30,
            2 + Math.random() * 3
          );
        }
      }
    }
  }
}
