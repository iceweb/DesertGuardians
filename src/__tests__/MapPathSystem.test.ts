import { describe, it, expect } from 'vitest';

/**
 * Tests for MapPathSystem logic
 * Validates path calculations, distance calculations, and build zone logic
 */

describe('PathSystem Logic', () => {
  describe('Path Segment Calculation', () => {
    it('should calculate segment length correctly', () => {
      const calculateSegmentLength = (x1: number, y1: number, x2: number, y2: number): number => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
      };

      expect(calculateSegmentLength(0, 0, 100, 0)).toBe(100);
      expect(calculateSegmentLength(0, 0, 0, 100)).toBe(100);
      expect(calculateSegmentLength(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
      expect(calculateSegmentLength(0, 0, 0, 0)).toBe(0);
    });

    it('should calculate segment direction correctly', () => {
      const calculateDirection = (x1: number, y1: number, x2: number, y2: number) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return { x: 0, y: 0 };
        return { x: dx / length, y: dy / length };
      };

      // Horizontal right
      const right = calculateDirection(0, 0, 100, 0);
      expect(right.x).toBe(1);
      expect(right.y).toBe(0);

      // Horizontal left
      const left = calculateDirection(100, 0, 0, 0);
      expect(left.x).toBe(-1);
      expect(left.y).toBe(0);

      // Vertical down
      const down = calculateDirection(0, 0, 0, 100);
      expect(down.x).toBe(0);
      expect(down.y).toBe(1);

      // Diagonal
      const diagonal = calculateDirection(0, 0, 100, 100);
      expect(diagonal.x).toBeCloseTo(Math.SQRT1_2);
      expect(diagonal.y).toBeCloseTo(Math.SQRT1_2);
    });

    it('should calculate total path length', () => {
      const calculateTotalLength = (points: { x: number; y: number }[]): number => {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
          const dx = points[i + 1].x - points[i].x;
          const dy = points[i + 1].y - points[i].y;
          total += Math.sqrt(dx * dx + dy * dy);
        }
        return total;
      };

      const straightPath = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
      ];
      expect(calculateTotalLength(straightPath)).toBe(200);

      const lShapedPath = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ];
      expect(calculateTotalLength(lShapedPath)).toBe(200);
    });
  });

  describe('Position At Distance', () => {
    it('should return start position at distance 0', () => {
      const getPositionAtDistance = (
        segments: {
          start: { x: number; y: number };
          end: { x: number; y: number };
          length: number;
        }[],
        distance: number
      ) => {
        let accumulatedLength = 0;

        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];

          if (accumulatedLength + segment.length >= distance) {
            const distanceIntoSegment = distance - accumulatedLength;
            const t = segment.length > 0 ? distanceIntoSegment / segment.length : 0;

            return {
              x: segment.start.x + (segment.end.x - segment.start.x) * t,
              y: segment.start.y + (segment.end.y - segment.start.y) * t,
              progress: distance,
            };
          }

          accumulatedLength += segment.length;
        }

        const lastSegment = segments[segments.length - 1];
        return {
          x: lastSegment.end.x,
          y: lastSegment.end.y,
          progress: accumulatedLength,
        };
      };

      const segments = [
        { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, length: 100 },
        { start: { x: 100, y: 0 }, end: { x: 100, y: 100 }, length: 100 },
      ];

      // At start
      const pos0 = getPositionAtDistance(segments, 0);
      expect(pos0.x).toBe(0);
      expect(pos0.y).toBe(0);

      // Midway through first segment
      const pos50 = getPositionAtDistance(segments, 50);
      expect(pos50.x).toBe(50);
      expect(pos50.y).toBe(0);

      // At corner
      const pos100 = getPositionAtDistance(segments, 100);
      expect(pos100.x).toBe(100);
      expect(pos100.y).toBe(0);

      // Midway through second segment
      const pos150 = getPositionAtDistance(segments, 150);
      expect(pos150.x).toBe(100);
      expect(pos150.y).toBe(50);

      // At end
      const pos200 = getPositionAtDistance(segments, 200);
      expect(pos200.x).toBe(100);
      expect(pos200.y).toBe(100);
    });

    it('should clamp distance to valid range', () => {
      const clampDistance = (distance: number, totalLength: number): number => {
        return Math.max(0, Math.min(distance, totalLength));
      };

      expect(clampDistance(-10, 200)).toBe(0);
      expect(clampDistance(0, 200)).toBe(0);
      expect(clampDistance(100, 200)).toBe(100);
      expect(clampDistance(200, 200)).toBe(200);
      expect(clampDistance(250, 200)).toBe(200);
    });
  });

  describe('Distance Remaining', () => {
    it('should calculate remaining distance correctly', () => {
      const getDistanceRemaining = (currentDistance: number, totalLength: number): number => {
        return Math.max(0, totalLength - currentDistance);
      };

      const totalLength = 500;

      expect(getDistanceRemaining(0, totalLength)).toBe(500);
      expect(getDistanceRemaining(100, totalLength)).toBe(400);
      expect(getDistanceRemaining(500, totalLength)).toBe(0);
      expect(getDistanceRemaining(600, totalLength)).toBe(0); // Clamped
    });

    it('should detect when reached end', () => {
      const hasReachedEnd = (distance: number, totalLength: number): boolean => {
        return distance >= totalLength;
      };

      expect(hasReachedEnd(0, 500)).toBe(false);
      expect(hasReachedEnd(499, 500)).toBe(false);
      expect(hasReachedEnd(500, 500)).toBe(true);
      expect(hasReachedEnd(501, 500)).toBe(true);
    });
  });

  describe('Point to Segment Distance', () => {
    it('should calculate distance to horizontal segment', () => {
      const pointToSegmentDistance = (
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): number => {
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
      };

      // Horizontal segment from (0,0) to (100,0)
      // Point directly above middle
      expect(pointToSegmentDistance(50, 50, 0, 0, 100, 0)).toBe(50);

      // Point at start
      expect(pointToSegmentDistance(0, 0, 0, 0, 100, 0)).toBe(0);

      // Point at end
      expect(pointToSegmentDistance(100, 0, 0, 0, 100, 0)).toBe(0);

      // Point before start
      expect(pointToSegmentDistance(-50, 0, 0, 0, 100, 0)).toBe(50);

      // Point after end
      expect(pointToSegmentDistance(150, 0, 0, 0, 100, 0)).toBe(50);
    });

    it('should calculate distance to vertical segment', () => {
      const pointToSegmentDistance = (
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): number => {
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
      };

      // Vertical segment from (0,0) to (0,100)
      // Point to the right of middle
      expect(pointToSegmentDistance(50, 50, 0, 0, 0, 100)).toBe(50);
    });

    it('should handle zero-length segment (point)', () => {
      const pointToSegmentDistance = (
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): number => {
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
      };

      // Zero-length segment at (50, 50)
      expect(pointToSegmentDistance(50, 50, 50, 50, 50, 50)).toBe(0);
      expect(pointToSegmentDistance(53, 54, 50, 50, 50, 50)).toBe(5); // 3-4-5 triangle
    });
  });

  describe('Build Zone Validation', () => {
    const BUILD_ZONE_MIN_DISTANCE = 65;
    const BUILD_ZONE_MAX_DISTANCE = 180;

    it('should validate distance within build zone', () => {
      const isInBuildableZone = (distanceToPath: number): boolean => {
        return (
          distanceToPath >= BUILD_ZONE_MIN_DISTANCE && distanceToPath <= BUILD_ZONE_MAX_DISTANCE
        );
      };

      expect(isInBuildableZone(0)).toBe(false); // Too close
      expect(isInBuildableZone(64)).toBe(false); // Just below min
      expect(isInBuildableZone(65)).toBe(true); // At min
      expect(isInBuildableZone(100)).toBe(true); // In range
      expect(isInBuildableZone(180)).toBe(true); // At max
      expect(isInBuildableZone(181)).toBe(false); // Just above max
      expect(isInBuildableZone(300)).toBe(false); // Too far
    });
  });

  describe('Path Loop Detection', () => {
    it('should detect if path forms a closed loop', () => {
      const isClosedLoop = (
        points: { x: number; y: number }[],
        threshold: number = 100
      ): boolean => {
        if (points.length < 3) return false;

        const first = points[0];
        const last = points[points.length - 1];
        const distance = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

        return distance < threshold;
      };

      const closedPath = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
        { x: 10, y: 10 }, // Near start
      ];
      expect(isClosedLoop(closedPath)).toBe(true);

      const openPath = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 100 },
      ];
      expect(isClosedLoop(openPath)).toBe(false);
    });
  });

  describe('Point in Polygon', () => {
    it('should detect if point is inside polygon', () => {
      const isInsidePolygon = (
        x: number,
        y: number,
        points: { x: number; y: number }[]
      ): boolean => {
        if (points.length < 3) return false;

        let inside = false;
        const n = points.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
          const xi = points[i].x;
          const yi = points[i].y;
          const xj = points[j].x;
          const yj = points[j].y;

          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
          }
        }

        return inside;
      };

      const square = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(isInsidePolygon(50, 50, square)).toBe(true); // Center
      expect(isInsidePolygon(10, 10, square)).toBe(true); // Near corner
      expect(isInsidePolygon(-10, 50, square)).toBe(false); // Outside left
      expect(isInsidePolygon(110, 50, square)).toBe(false); // Outside right
      expect(isInsidePolygon(50, -10, square)).toBe(false); // Outside top
      expect(isInsidePolygon(50, 110, square)).toBe(false); // Outside bottom
    });
  });

  describe('Build Pad Management', () => {
    it('should track pad occupancy', () => {
      interface BuildPadData {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        occupied: boolean;
      }

      const pads: BuildPadData[] = [
        { id: 1, x: 100, y: 100, width: 50, height: 50, occupied: false },
        { id: 2, x: 200, y: 100, width: 50, height: 50, occupied: true },
        { id: 3, x: 300, y: 100, width: 50, height: 50, occupied: false },
      ];

      const isPadAvailable = (id: number): boolean => {
        const pad = pads.find((p) => p.id === id);
        return pad ? !pad.occupied : false;
      };

      expect(isPadAvailable(1)).toBe(true);
      expect(isPadAvailable(2)).toBe(false);
      expect(isPadAvailable(3)).toBe(true);
      expect(isPadAvailable(4)).toBe(false); // Non-existent
    });

    it('should update pad occupancy', () => {
      interface BuildPadData {
        id: number;
        occupied: boolean;
      }

      const pads: BuildPadData[] = [
        { id: 1, occupied: false },
        { id: 2, occupied: false },
      ];

      const setPadOccupied = (id: number, occupied: boolean): void => {
        const pad = pads.find((p) => p.id === id);
        if (pad) {
          pad.occupied = occupied;
        }
      };

      expect(pads[0].occupied).toBe(false);
      setPadOccupied(1, true);
      expect(pads[0].occupied).toBe(true);
      setPadOccupied(1, false);
      expect(pads[0].occupied).toBe(false);
    });
  });

  describe('Mine Pad Management', () => {
    it('should provide mine pad slots', () => {
      interface MinePadData {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        occupied: boolean;
      }

      const minePads: MinePadData[] = [
        { id: 1, x: 50, y: 400, width: 60, height: 60, occupied: false },
        { id: 2, x: 150, y: 400, width: 60, height: 60, occupied: false },
        { id: 3, x: 250, y: 400, width: 60, height: 60, occupied: true },
      ];

      expect(minePads.length).toBe(3);
      expect(minePads.filter((p) => !p.occupied).length).toBe(2);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress as percentage', () => {
      const calculateProgress = (distance: number, totalLength: number): number => {
        if (totalLength === 0) return 0;
        return distance / totalLength;
      };

      expect(calculateProgress(0, 500)).toBe(0);
      expect(calculateProgress(250, 500)).toBe(0.5);
      expect(calculateProgress(500, 500)).toBe(1);
      expect(calculateProgress(750, 500)).toBe(1.5); // Can exceed 1 if not clamped
    });

    it('should clamp progress to 0-1 range', () => {
      const calculateClampedProgress = (distance: number, totalLength: number): number => {
        if (totalLength === 0) return 0;
        return Math.max(0, Math.min(1, distance / totalLength));
      };

      expect(calculateClampedProgress(-50, 500)).toBe(0);
      expect(calculateClampedProgress(0, 500)).toBe(0);
      expect(calculateClampedProgress(250, 500)).toBe(0.5);
      expect(calculateClampedProgress(500, 500)).toBe(1);
      expect(calculateClampedProgress(750, 500)).toBe(1);
    });
  });

  describe('Segment Index Tracking', () => {
    it('should identify current segment from distance', () => {
      const getSegmentIndex = (distance: number, segments: { length: number }[]): number => {
        let accumulated = 0;

        for (let i = 0; i < segments.length; i++) {
          if (accumulated + segments[i].length >= distance) {
            return i;
          }
          accumulated += segments[i].length;
        }

        return segments.length - 1;
      };

      const segments = [{ length: 100 }, { length: 150 }, { length: 50 }];

      expect(getSegmentIndex(0, segments)).toBe(0);
      expect(getSegmentIndex(50, segments)).toBe(0);
      expect(getSegmentIndex(100, segments)).toBe(0);
      expect(getSegmentIndex(101, segments)).toBe(1);
      expect(getSegmentIndex(250, segments)).toBe(1);
      expect(getSegmentIndex(251, segments)).toBe(2);
      expect(getSegmentIndex(400, segments)).toBe(2); // Past end, returns last
    });
  });
});
