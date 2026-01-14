import Phaser from 'phaser';
import type { Tower } from '../objects/Tower';
import type { GoldMine } from '../objects/GoldMine';

export interface UIBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class UIHitDetector {
  private scene: Phaser.Scene;

  private uiBounds: Map<string, UIBounds> = new Map();

  private getTowerAt?: (x: number, y: number) => Tower | null;
  private getMineAt?: (x: number, y: number) => GoldMine | null;
  private isMenuOpen?: () => boolean;

  private readonly HUD_HEIGHT = 60;
  private readonly BOTTOM_MARGIN = 100;
  private readonly SIDE_MARGIN = 30;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setTowerCallback(callback: (x: number, y: number) => Tower | null): void {
    this.getTowerAt = callback;
  }

  setMineCallback(callback: (x: number, y: number) => GoldMine | null): void {
    this.getMineAt = callback;
  }

  setMenuCallback(callback: () => boolean): void {
    this.isMenuOpen = callback;
  }

  registerBounds(id: string, x: number, y: number, width: number, height: number): void {
    this.uiBounds.set(id, { id, x, y, width, height });
  }

  unregisterBounds(id: string): void {
    this.uiBounds.delete(id);
  }

  updateBounds(id: string, x: number, y: number, width: number, height: number): void {
    if (this.uiBounds.has(id)) {
      this.uiBounds.set(id, { id, x, y, width, height });
    }
  }

  isOverUI(x: number, y: number): boolean {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    if (y < this.HUD_HEIGHT + 20) return true;
    if (y > screenHeight - this.BOTTOM_MARGIN) return true;
    if (x < this.SIDE_MARGIN) return true;
    if (x > screenWidth - this.SIDE_MARGIN) return true;

    if (this.isMenuOpen?.()) return true;

    for (const bounds of this.uiBounds.values()) {
      if (this.isPointInBounds(x, y, bounds)) {
        return true;
      }
    }

    if (this.getTowerAt?.(x, y)) return true;

    if (this.getMineAt?.(x, y)) return true;

    return false;
  }

  private isPointInBounds(x: number, y: number, bounds: UIBounds): boolean {
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  clearAllBounds(): void {
    this.uiBounds.clear();
  }

  getAllBounds(): UIBounds[] {
    return Array.from(this.uiBounds.values());
  }

  drawDebug(graphics: Phaser.GameObjects.Graphics): void {
    graphics.lineStyle(2, 0xff00ff, 0.5);

    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    graphics.strokeRect(0, 0, screenWidth, this.HUD_HEIGHT + 20);

    graphics.strokeRect(0, screenHeight - this.BOTTOM_MARGIN, screenWidth, this.BOTTOM_MARGIN);

    graphics.strokeRect(0, 0, this.SIDE_MARGIN, screenHeight);
    graphics.strokeRect(screenWidth - this.SIDE_MARGIN, 0, this.SIDE_MARGIN, screenHeight);

    graphics.lineStyle(2, 0x00ffff, 0.7);
    for (const bounds of this.uiBounds.values()) {
      graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }
}
