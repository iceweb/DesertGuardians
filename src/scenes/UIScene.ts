import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameConfig';
import { FinalWaveEffects } from '../managers/FinalWaveEffects';
import { AudioManager } from '../managers/AudioManager';
import { Creep } from '../objects/Creep';

/**
 * UIScene - Overlay scene that runs parallel to GameScene
 * Displays persistent UI elements and receives game events via Registry
 */
export class UIScene extends Phaser.Scene {
  private damageFlash!: Phaser.GameObjects.Rectangle;
  private finalWaveEffects!: FinalWaveEffects;
  
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

    // Create final wave effects manager
    this.finalWaveEffects = new FinalWaveEffects(this);
    
    // Wire up creeps getter for boss spotlight tracking
    this.finalWaveEffects.getCreeps = () => this.getCreepsFromGameScene();

    // Listen for game events via registry
    this.registry.events.on('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.on('wave-started', this.onWaveStarted, this);
    this.registry.events.on('creep-killed', this.onCreepKilled, this);
    this.registry.events.on('final-wave-started', this.onFinalWaveStarted, this);
    this.registry.events.on('final-boss-spawning', this.onFinalBossSpawning, this);
    this.registry.events.on('game-over', this.onGameOver, this);
    
    console.log('UIScene: UI overlay ready');
  }
  
  /**
   * Get creeps from the GameScene for boss tracking
   */
  private getCreepsFromGameScene(): Creep[] {
    const gameScene = this.scene.get('GameScene') as { getCreepManager?: () => { getActiveCreeps(): Creep[] } };
    if (gameScene && gameScene.getCreepManager) {
      return gameScene.getCreepManager().getActiveCreeps();
    }
    return [];
  }

  /**
   * Flash screen red when castle takes damage
   */
  private onCastleDamaged(hpRemaining: number): void {
    // Red flash intensity based on remaining HP
    const intensity = Math.min(0.5, 0.1 + (1 - hpRemaining / GAME_CONFIG.MAX_CASTLE_HP) * 0.4);
    
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

  /**
   * Start dramatic visual effects for the final wave
   * Note: Visual effects now start when boss spawns, not when wave starts
   */
  private onFinalWaveStarted(): void {
    console.log('UIScene: Final wave started - waiting for boss spawn');
    // Visual effects now start when boss spawns via onFinalBossSpawning
  }

  /**
   * Intensify effects when the final boss spawns
   */
  private onFinalBossSpawning(): void {
    console.log('UIScene: Final boss spawning - intensifying effects');
    // Play boss entry sound and start visual effects
    AudioManager.getInstance().playSFX('boss_level_entry');
    this.finalWaveEffects.startFinalWaveEffects();
    this.finalWaveEffects.playBossSpawnEffect();
  }

  /**
   * Stop effects when game ends
   */
  private onGameOver(): void {
    console.log('UIScene: Game over - stopping final wave effects');
    this.finalWaveEffects.stopEffects();
  }

  update(_time: number, _delta: number): void {
    // Update final wave effects (for boss spotlight tracking)
    this.finalWaveEffects.update();
  }

  shutdown(): void {
    // Clean up final wave effects
    this.finalWaveEffects.destroy();
    
    // Clean up event listeners
    this.registry.events.off('castle-damaged', this.onCastleDamaged, this);
    this.registry.events.off('wave-started', this.onWaveStarted, this);
    this.registry.events.off('creep-killed', this.onCreepKilled, this);
    this.registry.events.off('final-wave-started', this.onFinalWaveStarted, this);
    this.registry.events.off('final-boss-spawning', this.onFinalBossSpawning, this);
    this.registry.events.off('game-over', this.onGameOver, this);
  }
}
