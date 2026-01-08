import Phaser from 'phaser';

export interface BuildPadData {
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
}

/**
 * MapManager handles loading and parsing Tiled JSON maps.
 * It extracts spawn/goal points, path polylines, and build pad locations.
 */
export class MapManager {
  private scene: Phaser.Scene;
  private mapData: MapData | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load and parse the Tiled JSON map
   */
  loadMap(mapKey: string): MapData {
    const jsonData = this.scene.cache.json.get(mapKey);
    
    if (!jsonData) {
      throw new Error(`Map data not found for key: ${mapKey}`);
    }

    const spawn = new Phaser.Math.Vector2(0, 0);
    const goal = new Phaser.Math.Vector2(0, 0);
    const pathPoints: Phaser.Math.Vector2[] = [];
    const buildPads: BuildPadData[] = [];

    // Parse object layers
    for (const layer of jsonData.layers) {
      if (layer.type === 'objectgroup') {
        for (const obj of layer.objects) {
          // Parse spawn point
          if (obj.type === 'spawn') {
            spawn.set(obj.x, obj.y);
          }
          
          // Parse goal point
          if (obj.type === 'goal') {
            goal.set(obj.x, obj.y);
          }
          
          // Parse path polyline
          if (obj.type === 'path' && obj.polyline) {
            for (const point of obj.polyline) {
              // Polyline points are relative to object position
              pathPoints.push(new Phaser.Math.Vector2(
                obj.x + point.x,
                obj.y + point.y
              ));
            }
          }
          
          // Parse build pads
          if (obj.type === 'buildpad') {
            const idProp = obj.properties?.find((p: { name: string }) => p.name === 'id');
            buildPads.push({
              id: idProp?.value ?? buildPads.length + 1,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              occupied: false
            });
          }
        }
      }
    }

    this.mapData = { spawn, goal, pathPoints, buildPads };
    
    console.log('MapManager: Map loaded', {
      spawn: `(${spawn.x}, ${spawn.y})`,
      goal: `(${goal.x}, ${goal.y})`,
      pathPoints: pathPoints.length,
      buildPads: buildPads.length
    });

    return this.mapData;
  }

  /**
   * Get the parsed map data
   */
  getMapData(): MapData | null {
    return this.mapData;
  }

  /**
   * Get a build pad by ID
   */
  getBuildPad(id: number): BuildPadData | undefined {
    return this.mapData?.buildPads.find(pad => pad.id === id);
  }

  /**
   * Check if a build pad is available
   */
  isPadAvailable(id: number): boolean {
    const pad = this.getBuildPad(id);
    return pad ? !pad.occupied : false;
  }

  /**
   * Mark a build pad as occupied or free
   */
  setPadOccupied(id: number, occupied: boolean): void {
    const pad = this.getBuildPad(id);
    if (pad) {
      pad.occupied = occupied;
    }
  }
}
