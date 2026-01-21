import Phaser from 'phaser';

/**
 * Base interface for all boss renderers.
 * Each boss type implements this to provide its unique drawing logic.
 */
export interface BossRenderer {
  /**
   * Draw the boss creep graphics
   * @param g - The Phaser Graphics object to draw on
   * @param bounceTime - Animation time for bounce/pulse effects
   * @param faceDirection - Direction the boss is facing (1 or -1)
   * @param isPained - Whether the boss is currently taking damage
   */
  draw(
    g: Phaser.GameObjects.Graphics,
    bounceTime: number,
    faceDirection: number,
    isPained: boolean
  ): void;
}

/**
 * Utility function to draw the pain overlay effect used by all bosses
 */
export function drawPainOverlay(g: Phaser.GameObjects.Graphics, bounceTime: number): void {
  const painPulse = 0.3 + Math.sin(bounceTime * 8) * 0.15;

  g.fillStyle(0xff0000, painPulse * 0.4);
  g.fillCircle(0, 0, 55);

  g.fillStyle(0xff3300, painPulse * 0.3);
  g.fillCircle(0, 0, 40);

  const numDrips = 3;
  for (let i = 0; i < numDrips; i++) {
    const dripY = ((bounceTime * 40 + i * 30) % 60) - 10;
    const dripX = Math.sin(i * 2.5) * 20;
    const dripAlpha = Math.max(0, 1 - dripY / 50);
    g.fillStyle(0x8b0000, dripAlpha * 0.7);
    g.fillCircle(dripX, dripY, 3 - dripY / 30);
  }
}
