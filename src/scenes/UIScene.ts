import Phaser from 'phaser';

/**
 * UIScene - Overlay scene that runs parallel to GameScene
 * Displays persistent UI elements and receives game events via Registry
 */
export class UIScene extends Phaser.Scene {
  private damageFlash!: Phaser.GameObjects.Rectangle;
  
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Create damage flash overlay (covers screen when castle takes damage)
    this.damageFlash = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0xff0000,
      0
    ).setDepth(500);

    // Listen for game events via registry
    this.registry.events.on('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.on('wave-started', this.onWaveStarted, this);
    this.registry.events.on('creep-killed', this.onCreepKilled, this);
    
    console.log('UIScene: UI overlay ready');
  }

  /**
   * Flash screen red when castle takes damage
   */
  private onCastleDamaged(hpRemaining: number): void {
    // Red flash intensity based on remaining HP
    const intensity = Math.min(0.5, 0.1 + (1 - hpRemaining / 10) * 0.4);
    
    this.damageFlash.setAlpha(intensity);
    this.tweens.add({
      targets: this.damageFlash,
      alpha: 0,
      duration: 300,
      ease: 'Power2'
    });
  }

  /**
   * Visual feedback when wave starts
   */
  private onWaveStarted(waveNumber: number): void {
    // Could add wave start animation here
    console.log(`UIScene: Wave ${waveNumber} started`);
  }

  /**
   * Visual feedback when creep is killed
   */
  private onCreepKilled(_goldReward: number): void {
    // Could add kill counter or combo system here
  }

  update(_time: number, _delta: number): void {
    // Update UI elements if needed
  }

  shutdown(): void {
    // Clean up event listeners
    this.registry.events.off('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.off('wave-started', this.onWaveStarted, this);
    this.registry.events.off('creep-killed', this.onCreepKilled, this);
  }
}
