import Phaser from 'phaser';

export interface BuildPadData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  occupied: boolean;
}

export interface MinePadData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  occupied: boolean;
}

export interface MapData {
  spawn: Phaser.Math.Vector2;
  goal: Phaser.Math.Vector2;
  pathPoints: Phaser.Math.Vector2[];
  buildPads: BuildPadData[];
  minePads: MinePadData[];
}

export interface PathSegment {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
  length: number;
  direction: Phaser.Math.Vector2;
}

export class PathSystem {
  private points: Phaser.Math.Vector2[] = [];
  private segments: PathSegment[] = [];
  private totalLength: number = 0;

  private readonly BUILD_ZONE_MIN_DISTANCE = 65;
  private readonly BUILD_ZONE_MAX_DISTANCE = 180;

  constructor(pathPoints: Phaser.Math.Vector2[]) {
    this.setPath(pathPoints);
  }

  setPath(pathPoints: Phaser.Math.Vector2[]): void {
    this.points = pathPoints;
    this.segments = [];
    this.totalLength = 0;

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      const direction = new Phaser.Math.Vector2(end.x - start.x, end.y - start.y);
      const length = direction.length();

      if (length > 0) {
        direction.normalize();
      }

      this.segments.push({
        start: start.clone(),
        end: end.clone(),
        length,
        direction,
      });

      this.totalLength += length;
    }
  }

  getTotalLength(): number {
    return this.totalLength;
  }

  getPoints(): Phaser.Math.Vector2[] {
    return this.points;
  }

  getSegments(): PathSegment[] {
    return this.segments;
  }

  getStartPoint(): Phaser.Math.Vector2 {
    return this.points.length > 0 ? this.points[0].clone() : new Phaser.Math.Vector2(0, 0);
  }

  getEndPoint(): Phaser.Math.Vector2 {
    return this.points.length > 0
      ? this.points[this.points.length - 1].clone()
      : new Phaser.Math.Vector2(0, 0);
  }

  getPositionAt(distance: number): {
    position: Phaser.Math.Vector2;
    direction: Phaser.Math.Vector2;
    progress: number;
    segmentIndex: number;
  } {
    distance = Phaser.Math.Clamp(distance, 0, this.totalLength);

    if (this.segments.length === 0) {
      return {
        position: new Phaser.Math.Vector2(0, 0),
        direction: new Phaser.Math.Vector2(1, 0),
        progress: 0,
        segmentIndex: 0,
      };
    }

    let accumulatedLength = 0;

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];

      if (accumulatedLength + segment.length >= distance || i === this.segments.length - 1) {
        const distanceIntoSegment = distance - accumulatedLength;
        const t = segment.length > 0 ? distanceIntoSegment / segment.length : 0;

        const position = new Phaser.Math.Vector2(
          Phaser.Math.Linear(segment.start.x, segment.end.x, t),
          Phaser.Math.Linear(segment.start.y, segment.end.y, t)
        );

        return {
          position,
          direction: segment.direction.clone(),
          progress: distance / this.totalLength,
          segmentIndex: i,
        };
      }

      accumulatedLength += segment.length;
    }

    const lastSegment = this.segments[this.segments.length - 1];
    return {
      position: lastSegment.end.clone(),
      direction: lastSegment.direction.clone(),
      progress: 1,
      segmentIndex: this.segments.length - 1,
    };
  }

  getDistanceRemaining(currentDistance: number): number {
    return Math.max(0, this.totalLength - currentDistance);
  }

  hasReachedEnd(distance: number): boolean {
    return distance >= this.totalLength;
  }

  drawDebug(
    graphics: Phaser.GameObjects.Graphics,
    lineColor: number = 0xffff00,
    pointColor: number = 0xff0000
  ): void {
    graphics.lineStyle(4, lineColor, 0.8);

    if (this.points.length > 0) {
      graphics.beginPath();
      graphics.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        graphics.lineTo(this.points[i].x, this.points[i].y);
      }

      graphics.strokePath();
    }

    graphics.fillStyle(pointColor, 1);
    for (const point of this.points) {
      graphics.fillCircle(point.x, point.y, 8);
    }

    if (this.points.length > 0) {
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(this.points[0].x, this.points[0].y, 16);

      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(
        this.points[this.points.length - 1].x,
        this.points[this.points.length - 1].y,
        16
      );
    }
  }

  isInBuildableZone(x: number, y: number): boolean {
    const distanceToPath = this.getDistanceToPath(x, y);

    if (
      distanceToPath >= this.BUILD_ZONE_MIN_DISTANCE &&
      distanceToPath <= this.BUILD_ZONE_MAX_DISTANCE
    ) {
      return true;
    }

    if (this.isInsidePathLoop(x, y)) {
      return distanceToPath >= this.BUILD_ZONE_MIN_DISTANCE;
    }

    return false;
  }

  getDistanceToPath(x: number, y: number): number {
    if (this.segments.length === 0) return Infinity;

    let minDistance = Infinity;

    for (const segment of this.segments) {
      const dist = this.pointToSegmentDistance(
        x,
        y,
        segment.start.x,
        segment.start.y,
        segment.end.x,
        segment.end.y
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return minDistance;
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

    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;

    return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
  }

  private isInsidePathLoop(x: number, y: number): boolean {
    if (this.points.length < 3) return false;

    const firstPoint = this.points[0];
    const lastPoint = this.points[this.points.length - 1];
    const loopDistance = Math.sqrt(
      (lastPoint.x - firstPoint.x) ** 2 + (lastPoint.y - firstPoint.y) ** 2
    );

    let inside = false;
    const n = this.points.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = this.points[i].x;
      const yi = this.points[i].y;
      const xj = this.points[j].x;
      const yj = this.points[j].y;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    if (loopDistance < 100) {
      return inside;
    }

    return inside;
  }
}

export class MapManager {
  private scene: Phaser.Scene;
  private mapData: MapData | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /* eslint-disable complexity, max-depth */
  loadMap(mapKey: string): MapData {
    const jsonData = this.scene.cache.json.get(mapKey);

    if (!jsonData) {
      throw new Error(`Map data not found for key: ${mapKey}`);
    }

    const spawn = new Phaser.Math.Vector2(0, 0);
    const goal = new Phaser.Math.Vector2(0, 0);
    const pathPoints: Phaser.Math.Vector2[] = [];
    const buildPads: BuildPadData[] = [];
    const minePads: MinePadData[] = [];

    for (const layer of jsonData.layers) {
      if (layer.type === 'objectgroup') {
        for (const obj of layer.objects) {
          if (obj.type === 'spawn') {
            spawn.set(obj.x, obj.y);
          }

          if (obj.type === 'goal') {
            goal.set(obj.x, obj.y);
          }

          if (obj.type === 'path' && obj.polyline) {
            for (const point of obj.polyline) {
              pathPoints.push(new Phaser.Math.Vector2(obj.x + point.x, obj.y + point.y));
            }
          }

          if (obj.type === 'buildpad') {
            const idProp = obj.properties?.find((p: { name: string }) => p.name === 'id');
            buildPads.push({
              id: idProp?.value ?? buildPads.length + 1,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              occupied: false,
            });
          }

          if (obj.type === 'minepad') {
            minePads.push({
              id: minePads.length + 1,
              x: obj.x,
              y: obj.y,
              width: obj.width || 60,
              height: obj.height || 60,
              occupied: false,
            });
          }
        }
      }
    }

    this.mapData = { spawn, goal, pathPoints, buildPads, minePads };

    return this.mapData;
  }

  getMapData(): MapData | null {
    return this.mapData;
  }

  getBuildPad(id: number): BuildPadData | undefined {
    return this.mapData?.buildPads.find((pad) => pad.id === id);
  }

  isPadAvailable(id: number): boolean {
    const pad = this.getBuildPad(id);
    return pad ? !pad.occupied : false;
  }

  setPadOccupied(id: number, occupied: boolean): void {
    const pad = this.getBuildPad(id);
    if (pad) {
      pad.occupied = occupied;
    }
  }

  getMinePadSlots(): MinePadData[] {
    return this.mapData?.minePads ?? [];
  }
}
