import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // UI Scene runs parallel to GameScene for HUD overlay
    // Will be fully implemented in Step 6
    console.log('UIScene: UI overlay ready');
  }

  update(_time: number, _delta: number): void {
    // Update UI elements
  }
}
