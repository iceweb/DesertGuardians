import Phaser from 'phaser';
import { CreepGraphics } from './CreepGraphics';
import { CREEP_TYPES } from '../data/GameData';

/**
 * CreepIconGenerator creates and caches 32x32 realistic creep icons
 * using the existing CreepGraphics drawing system.
 */
export class CreepIconGenerator {
  private scene: Phaser.Scene;
  private iconCache: Map<string, Phaser.Textures.Texture> = new Map();
  private readonly ICON_SIZE = 32;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Generate an icon texture for a creep type (cached)
   */
  getIconTexture(creepType: string): string {
    const textureKey = `creep_icon_${creepType}`;
    
    // Return cached texture if exists
    if (this.scene.textures.exists(textureKey)) {
      return textureKey;
    }
    
    // Create a RenderTexture to draw the creep
    const renderTexture = this.scene.add.renderTexture(0, 0, this.ICON_SIZE, this.ICON_SIZE);
    renderTexture.setVisible(false);
    
    // Create a temporary graphics object to draw the creep
    const graphics = this.scene.add.graphics();
    graphics.setVisible(false);
    
    // Get size scale for this creep type
    const config = CREEP_TYPES[creepType];
    const sizeScale = config?.sizeScale || 1.0;
    
    // Calculate scale to fit in icon (creeps are roughly 40-60px, we want 28px max)
    const baseScale = 0.5 / Math.max(sizeScale, 1);
    
    // Draw the creep at center of icon
    CreepGraphics.drawCreep(graphics, creepType, 0, 1, false, false, false);
    
    // Position graphics at center and scale down
    graphics.setPosition(this.ICON_SIZE / 2, this.ICON_SIZE / 2 + 4);
    graphics.setScale(baseScale);
    
    // Draw to render texture
    renderTexture.draw(graphics);
    
    // Save as texture
    renderTexture.saveTexture(textureKey);
    
    // Clean up
    graphics.destroy();
    renderTexture.destroy();
    
    this.iconCache.set(creepType, this.scene.textures.get(textureKey));
    
    return textureKey;
  }

  /**
   * Create an icon image for a creep type
   */
  createIcon(creepType: string, x: number, y: number): Phaser.GameObjects.Image {
    const textureKey = this.getIconTexture(creepType);
    const icon = this.scene.add.image(x, y, textureKey);
    icon.setOrigin(0.5);
    return icon;
  }

  /**
   * Pre-generate icons for all creep types
   */
  preloadAllIcons(): void {
    const creepTypes = Object.keys(CREEP_TYPES);
    for (const type of creepTypes) {
      this.getIconTexture(type);
    }
  }

  /**
   * Clear the icon cache
   */
  clearCache(): void {
    for (const [type] of this.iconCache) {
      const textureKey = `creep_icon_${type}`;
      if (this.scene.textures.exists(textureKey)) {
        this.scene.textures.remove(textureKey);
      }
    }
    this.iconCache.clear();
  }
}
