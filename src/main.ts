import Phaser from 'phaser';
import {
  BootScene,
  PreloadScene,
  MenuScene,
  GameScene,
  UIScene,
  ResultsScene
} from './scenes';
import './style.css';

// Game configuration - 1920x1080 for crisp visuals on modern displays
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // AUTO will use WebGL if available, Canvas otherwise
  width: 1920,
  height: 1080,
  parent: 'game-container',
  backgroundColor: '#1a0a00', // Dark desert color
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      // Debug mode - disable in production
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    UIScene,
    ResultsScene
  ],
  render: {
    pixelArt: false,
    antialias: true,
  }
};

// Create the game instance
const game = new Phaser.Game(config);

// Export for potential access from other modules
export default game;

console.log('Desert Guardians - Tower Defense Game initialized');
