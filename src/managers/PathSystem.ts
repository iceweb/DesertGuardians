import Phaser from 'phaser';

export interface PathSegment {
  start: Phaser.Math.Vector2;
  end: Phaser.Math.Vector2;
  length: number;
  direction: Phaser.Math.Vector2;
}

/**
 * PathSystem handles creep movement along the path polyline.
 * It provides methods for getting positions along the path and calculating distances.
 */
export class PathSystem {
  private points: Phaser.Math.Vector2[] = [];
  private segments: PathSegment[] = [];
  private totalLength: number = 0;

  constructor(pathPoints: Phaser.Math.Vector2[]) {
    this.setPath(pathPoints);
  }

  /**
   * Set the path from an array of points
   */
  setPath(pathPoints: Phaser.Math.Vector2[]): void {
    this.points = pathPoints;
    this.segments = [];
    this.totalLength = 0;

    // Build segments from consecutive points
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i];
      const end = pathPoints[i + 1];
      const direction = new Phaser.Math.Vector2(end.x - start.x, end.y - start.y);
      const length = direction.length();
      
      // Normalize direction
      if (length > 0) {
        direction.normalize();
      }

      this.segments.push({
        start: start.clone(),
        end: end.clone(),
        length,
        direction
      });

      this.totalLength += length;
    }

    console.log(`PathSystem: Created ${this.segments.length} segments, total length: ${this.totalLength.toFixed(0)}px`);
  }

  /**
   * Get the total path length in pixels
   */
  getTotalLength(): number {
    return this.totalLength;
  }

  /**
   * Get all path points
   */
  getPoints(): Phaser.Math.Vector2[] {
    return this.points;
  }

  /**
   * Get all path segments
   */
  getSegments(): PathSegment[] {
    return this.segments;
  }

  /**
   * Get the starting point of the path
   */
  getStartPoint(): Phaser.Math.Vector2 {
    return this.points.length > 0 ? this.points[0].clone() : new Phaser.Math.Vector2(0, 0);
  }

  /**
   * Get the ending point of the path
   */
  getEndPoint(): Phaser.Math.Vector2 {
    return this.points.length > 0 ? this.points[this.points.length - 1].clone() : new Phaser.Math.Vector2(0, 0);
  }

  /**
   * Get position and direction at a given distance along the path
   * @param distance Distance traveled from start (0 to totalLength)
   * @returns Object with position, direction, and progress (0-1)
   */
  getPositionAt(distance: number): { position: Phaser.Math.Vector2; direction: Phaser.Math.Vector2; progress: number; segmentIndex: number } {
    // Clamp distance
    distance = Phaser.Math.Clamp(distance, 0, this.totalLength);

    // Handle empty path
    if (this.segments.length === 0) {
      return {
        position: new Phaser.Math.Vector2(0, 0),
        direction: new Phaser.Math.Vector2(1, 0),
        progress: 0,
        segmentIndex: 0
      };
    }

    // Find the segment containing this distance
    let accumulatedLength = 0;
    
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      
      if (accumulatedLength + segment.length >= distance || i === this.segments.length - 1) {
        // This is the segment we're on
        const distanceIntoSegment = distance - accumulatedLength;
        const t = segment.length > 0 ? distanceIntoSegment / segment.length : 0;
        
        // Interpolate position
        const position = new Phaser.Math.Vector2(
          Phaser.Math.Linear(segment.start.x, segment.end.x, t),
          Phaser.Math.Linear(segment.start.y, segment.end.y, t)
        );

        return {
          position,
          direction: segment.direction.clone(),
          progress: distance / this.totalLength,
          segmentIndex: i
        };
      }
      
      accumulatedLength += segment.length;
    }

    // Fallback to end position
    const lastSegment = this.segments[this.segments.length - 1];
    return {
      position: lastSegment.end.clone(),
      direction: lastSegment.direction.clone(),
      progress: 1,
      segmentIndex: this.segments.length - 1
    };
  }

  /**
   * Get the distance remaining from a given distance to the end
   */
  getDistanceRemaining(currentDistance: number): number {
    return Math.max(0, this.totalLength - currentDistance);
  }

  /**
   * Check if a given distance has reached the end of the path
   */
  hasReachedEnd(distance: number): boolean {
    return distance >= this.totalLength;
  }

  /**
   * Draw the path for debugging purposes
   */
  drawDebug(graphics: Phaser.GameObjects.Graphics, lineColor: number = 0xffff00, pointColor: number = 0xff0000): void {
    // Draw path line
    graphics.lineStyle(4, lineColor, 0.8);
    
    if (this.points.length > 0) {
      graphics.beginPath();
      graphics.moveTo(this.points[0].x, this.points[0].y);
      
      for (let i = 1; i < this.points.length; i++) {
        graphics.lineTo(this.points[i].x, this.points[i].y);
      }
      
      graphics.strokePath();
    }

    // Draw waypoints
    graphics.fillStyle(pointColor, 1);
    for (const point of this.points) {
      graphics.fillCircle(point.x, point.y, 8);
    }

    // Draw start and end markers
    if (this.points.length > 0) {
      // Start - green
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(this.points[0].x, this.points[0].y, 16);
      
      // End - red
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, 16);
    }
  }
}
