import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {

    console.log('BootScene: Loading initial config...');
  }

  create(): void {
    console.log('BootScene: Complete, transitioning to PreloadScene');
    this.scene.start('PreloadScene');
  }
}
