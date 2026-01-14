import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameConfig';
import { FinalWaveEffects } from '../managers/FinalWaveEffects';
import { AudioManager } from '../managers/AudioManager';
import { Creep } from '../objects/Creep';

export class UIScene extends Phaser.Scene {
  private damageFlash!: Phaser.GameObjects.Rectangle;
  private finalWaveEffects!: FinalWaveEffects;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {

    this.damageFlash = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0xff0000,
      0
    ).setDepth(500);

    this.finalWaveEffects = new FinalWaveEffects(this);

    this.finalWaveEffects.getCreeps = () => this.getCreepsFromGameScene();

    this.registry.events.on('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.on('wave-started', this.onWaveStarted, this);
    this.registry.events.on('creep-killed', this.onCreepKilled, this);
    this.registry.events.on('final-wave-started', this.onFinalWaveStarted, this);
    this.registry.events.on('final-boss-spawning', this.onFinalBossSpawning, this);
    this.registry.events.on('game-over', this.onGameOver, this);

    console.log('UIScene: UI overlay ready');
  }

  private getCreepsFromGameScene(): Creep[] {
    const gameScene = this.scene.get('GameScene') as { getCreepManager?: () => { getActiveCreeps(): Creep[] } };
    if (gameScene && gameScene.getCreepManager) {
      return gameScene.getCreepManager().getActiveCreeps();
    }
    return [];
  }

  private onCastleDamaged(hpRemaining: number): void {

    const intensity = Math.min(0.5, 0.1 + (1 - hpRemaining / GAME_CONFIG.MAX_CASTLE_HP) * 0.4);

    this.damageFlash.setAlpha(intensity);
    this.tweens.add({
      targets: this.damageFlash,
      alpha: 0,
      duration: 300,
      ease: 'Power2'
    });
  }

  private onWaveStarted(waveNumber: number): void {

    console.log(`UIScene: Wave ${waveNumber} started`);
  }

  private onCreepKilled(_goldReward: number): void {

  }

  private onFinalWaveStarted(): void {
    console.log('UIScene: Final wave started - waiting for boss spawn');

  }

  private onFinalBossSpawning(): void {
    console.log('UIScene: Final boss spawning - intensifying effects');

    AudioManager.getInstance().playSFX('boss_level_entry');
    this.finalWaveEffects.startFinalWaveEffects();
    this.finalWaveEffects.playBossSpawnEffect();
  }

  private onGameOver(): void {
    console.log('UIScene: Game over - stopping final wave effects');
    this.finalWaveEffects.stopEffects();
  }

  update(_time: number, _delta: number): void {

    this.finalWaveEffects.update();
  }

  shutdown(): void {

    this.finalWaveEffects.destroy();

    this.registry.events.off('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.off('wave-started', this.onWaveStarted, this);
    this.registry.events.off('creep-killed', this.onCreepKilled, this);
    this.registry.events.off('final-wave-started', this.onFinalWaveStarted, this);
    this.registry.events.off('final-boss-spawning', this.onFinalBossSpawning, this);
    this.registry.events.off('game-over', this.onGameOver, this);
  }
}
