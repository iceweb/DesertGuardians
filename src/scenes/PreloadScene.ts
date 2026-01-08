import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRect(width / 2 - 160, height / 2 - 10, 320, 30);

    // Progress bar fill
    const progressBar = this.add.graphics();

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xd4a574, 1); // Desert gold color
      progressBar.fillRect(width / 2 - 155, height / 2 - 5, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBarBg.destroy();
      loadingText.destroy();
    });

    // Load map data
    this.load.json('level1', 'assets/maps/level1.json');

    // Load placeholder assets
    // These will be replaced with actual game assets later
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    // Create placeholder graphics for testing
    // Tower placeholder (64x128)
    const towerGraphics = this.make.graphics({ x: 0, y: 0 });
    towerGraphics.fillStyle(0x8b4513); // Brown base
    towerGraphics.fillRect(0, 64, 64, 64);
    towerGraphics.fillStyle(0x654321); // Darker brown top
    towerGraphics.fillRect(16, 0, 32, 64);
    towerGraphics.generateTexture('tower_placeholder', 64, 128);
    towerGraphics.destroy();

    // Creep placeholder (64x64)
    const creepGraphics = this.make.graphics({ x: 0, y: 0 });
    creepGraphics.fillStyle(0xff69b4); // Pink for cute furry creature
    creepGraphics.fillCircle(32, 32, 28);
    creepGraphics.fillStyle(0x000000); // Eyes
    creepGraphics.fillCircle(22, 26, 5);
    creepGraphics.fillCircle(42, 26, 5);
    creepGraphics.generateTexture('creep_placeholder', 64, 64);
    creepGraphics.destroy();

    // Projectile placeholder (16x16)
    const projectileGraphics = this.make.graphics({ x: 0, y: 0 });
    projectileGraphics.fillStyle(0xffff00); // Yellow
    projectileGraphics.fillCircle(8, 8, 6);
    projectileGraphics.generateTexture('projectile_placeholder', 16, 16);
    projectileGraphics.destroy();

    // Build pad placeholder (64x64)
    const buildPadGraphics = this.make.graphics({ x: 0, y: 0 });
    buildPadGraphics.fillStyle(0x808080, 0.5); // Semi-transparent gray
    buildPadGraphics.fillRect(0, 0, 64, 64);
    buildPadGraphics.lineStyle(2, 0xffffff, 0.8);
    buildPadGraphics.strokeRect(2, 2, 60, 60);
    buildPadGraphics.generateTexture('buildpad_placeholder', 64, 64);
    buildPadGraphics.destroy();

    console.log('PreloadScene: Placeholder assets created');
  }

  create(): void {
    console.log('PreloadScene: All assets loaded, transitioning to MenuScene');
    this.scene.start('MenuScene');
  }
}
