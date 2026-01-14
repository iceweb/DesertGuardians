import Phaser from 'phaser';
import { CreepGraphics } from './CreepGraphics';
import { CREEP_TYPES } from '../data/GameData';

export class CreepIconGenerator {
  private scene: Phaser.Scene;
  private iconCache: Map<string, Phaser.Textures.Texture> = new Map();
  private readonly ICON_SIZE = 32;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getIconTexture(creepType: string): string {
    const textureKey = `creep_icon_${creepType}`;

    if (this.scene.textures.exists(textureKey)) {
      return textureKey;
    }

    const renderTexture = this.scene.add.renderTexture(0, 0, this.ICON_SIZE, this.ICON_SIZE);
    renderTexture.setVisible(false);

    const graphics = this.scene.add.graphics();
    graphics.setVisible(false);

    const config = CREEP_TYPES[creepType];
    const sizeScale = config?.sizeScale || 1.0;

    const baseScale = 0.5 / Math.max(sizeScale, 1);

    CreepGraphics.drawCreep(graphics, creepType, 0, 1, false, false, false);

    graphics.setPosition(this.ICON_SIZE / 2, this.ICON_SIZE / 2 + 4);
    graphics.setScale(baseScale);

    renderTexture.draw(graphics);

    renderTexture.saveTexture(textureKey);

    graphics.destroy();
    renderTexture.destroy();

    this.iconCache.set(creepType, this.scene.textures.get(textureKey));

    return textureKey;
  }

  createIcon(creepType: string, x: number, y: number): Phaser.GameObjects.Image {
    const textureKey = this.getIconTexture(creepType);
    const icon = this.scene.add.image(x, y, textureKey);
    icon.setOrigin(0.5);
    return icon;
  }

  preloadAllIcons(): void {
    const creepTypes = Object.keys(CREEP_TYPES);
    for (const type of creepTypes) {
      this.getIconTexture(type);
    }
  }

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
