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

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: 1920,
  height: 1080,
  parent: 'game-container',
  backgroundColor: '#1a0a00',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {

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
    roundPixels: true,
    transparent: false,
  },

  autoFocus: true,
};

const game = new Phaser.Game(config);

export default game;

console.log('Desert Guardians - Tower Defense Game initialized');
