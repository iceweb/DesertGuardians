import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load any initial configuration or minimal assets needed for the preloader
    // This is typically where you'd load your loading bar assets
    console.log('BootScene: Loading initial config...');
  }

  create(): void {
    console.log('BootScene: Complete, transitioning to PreloadScene');
    this.scene.start('PreloadScene');
  }
}
