import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load initial config
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
