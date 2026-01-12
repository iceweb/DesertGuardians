import Phaser from 'phaser';
import type { Tower } from '../objects/Tower';
import type { GoldMine } from '../objects/GoldMine';

/**
 * Rectangular bounds for UI hit detection
 */
export interface UIBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * UIHitDetector provides centralized hit detection for all UI elements.
 * Other managers register their UI bounds here, and the placement preview
 * system queries isOverUI() to determine if the green circle should be hidden.
 */
export class UIHitDetector {
  private scene: Phaser.Scene;
  
  // Registered UI bounds
  private uiBounds: Map<string, UIBounds> = new Map();
  
  // Callbacks for dynamic checks (towers, mines, etc.)
  private getTowerAt?: (x: number, y: number) => Tower | null;
  private getMineAt?: (x: number, y: number) => GoldMine | null;
  private isMenuOpen?: () => boolean;
  
  // Fixed screen regions that always block
  private readonly HUD_HEIGHT = 60;
  private readonly BOTTOM_MARGIN = 100;
  private readonly SIDE_MARGIN = 30;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set callback for tower hit detection
   */
  setTowerCallback(callback: (x: number, y: number) => Tower | null): void {
    this.getTowerAt = callback;
  }

  /**
   * Set callback for mine hit detection
   */
  setMineCallback(callback: (x: number, y: number) => GoldMine | null): void {
    this.getMineAt = callback;
  }

  /**
   * Set callback for menu open check
   */
  setMenuCallback(callback: () => boolean): void {
    this.isMenuOpen = callback;
  }

  /**
   * Register a UI element's bounds
   */
  registerBounds(id: string, x: number, y: number, width: number, height: number): void {
    this.uiBounds.set(id, { id, x, y, width, height });
  }

  /**
   * Unregister a UI element's bounds
   */
  unregisterBounds(id: string): void {
    this.uiBounds.delete(id);
  }

  /**
   * Update bounds for an existing UI element
   */
  updateBounds(id: string, x: number, y: number, width: number, height: number): void {
    if (this.uiBounds.has(id)) {
      this.uiBounds.set(id, { id, x, y, width, height });
    }
  }

  /**
   * Check if a position is over any UI element
   * Returns true if the green building circle should be hidden
   */
  isOverUI(x: number, y: number): boolean {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Check fixed screen regions (HUD, bottom, sides)
    if (y < this.HUD_HEIGHT + 20) return true;
    if (y > screenHeight - this.BOTTOM_MARGIN) return true;
    if (x < this.SIDE_MARGIN) return true;
    if (x > screenWidth - this.SIDE_MARGIN) return true;
    
    // Check if any menu is open
    if (this.isMenuOpen?.()) return true;
    
    // Check registered UI bounds
    for (const bounds of this.uiBounds.values()) {
      if (this.isPointInBounds(x, y, bounds)) {
        return true;
      }
    }
    
    // Check if over an existing tower
    if (this.getTowerAt?.(x, y)) return true;
    
    // Check if over a mine (empty or built)
    if (this.getMineAt?.(x, y)) return true;
    
    return false;
  }

  /**
   * Check if point is within rectangular bounds
   */
  private isPointInBounds(x: number, y: number, bounds: UIBounds): boolean {
    return x >= bounds.x && 
           x <= bounds.x + bounds.width && 
           y >= bounds.y && 
           y <= bounds.y + bounds.height;
  }

  /**
   * Clear all registered bounds
   */
  clearAllBounds(): void {
    this.uiBounds.clear();
  }

  /**
   * Get all registered bounds (for debugging)
   */
  getAllBounds(): UIBounds[] {
    return Array.from(this.uiBounds.values());
  }

  /**
   * Draw debug visualization of all registered UI bounds
   */
  drawDebug(graphics: Phaser.GameObjects.Graphics): void {
    graphics.lineStyle(2, 0xff00ff, 0.5);
    
    // Draw fixed regions
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Top HUD
    graphics.strokeRect(0, 0, screenWidth, this.HUD_HEIGHT + 20);
    // Bottom margin
    graphics.strokeRect(0, screenHeight - this.BOTTOM_MARGIN, screenWidth, this.BOTTOM_MARGIN);
    // Side margins
    graphics.strokeRect(0, 0, this.SIDE_MARGIN, screenHeight);
    graphics.strokeRect(screenWidth - this.SIDE_MARGIN, 0, this.SIDE_MARGIN, screenHeight);
    
    // Draw registered bounds
    graphics.lineStyle(2, 0x00ffff, 0.7);
    for (const bounds of this.uiBounds.values()) {
      graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }
}
