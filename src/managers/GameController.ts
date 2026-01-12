import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameConfig';

/**
 * GameController centralizes all game state management.
 * Acts as a single source of truth for game state, emitting events on state changes.
 * Managers receive a reference to GameController instead of accessing scene state directly.
 */
export class GameController extends Phaser.Events.EventEmitter {
  // Core game state
  private _gold: number;
  private _castleHP: number;
  private _maxCastleHP: number;
  
  // Time tracking
  private _virtualGameTime: number = 0;
  private _gameStartTime: number = 0;
  private _hasGameStarted: boolean = false;
  
  // Wave state
  private _currentWave: number = 0;
  private _totalWaves: number = 0;
  
  // Game flow state
  private _isPaused: boolean = false;
  private _gameSpeed: number = 1;
  private _gameOver: boolean = false;

  constructor() {
    super();
    
    this._gold = GAME_CONFIG.STARTING_GOLD;
    this._castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._maxCastleHP = GAME_CONFIG.MAX_CASTLE_HP;
  }

  // ─────────────────────────────────────────────────────────────
  // GOLD MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  get gold(): number {
    return this._gold;
  }

  /**
   * Add gold to the player's total
   */
  addGold(amount: number): void {
    this._gold += amount;
    this.emit('goldChanged', this._gold, amount);
  }

  /**
   * Spend gold (returns false if insufficient)
   */
  spendGold(amount: number): boolean {
    if (this._gold < amount) return false;
    this._gold -= amount;
    this.emit('goldChanged', this._gold, -amount);
    return true;
  }

  /**
   * Check if player can afford a cost
   */
  canAfford(amount: number): boolean {
    return this._gold >= amount;
  }

  // ─────────────────────────────────────────────────────────────
  // CASTLE HP MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  get castleHP(): number {
    return this._castleHP;
  }

  get maxCastleHP(): number {
    return this._maxCastleHP;
  }

  /**
   * Take damage to the castle
   * @returns true if castle is destroyed (HP <= 0)
   */
  takeDamage(amount: number = 1): boolean {
    this._castleHP = Math.max(0, this._castleHP - amount);
    this.emit('healthChanged', this._castleHP, this._maxCastleHP);
    
    if (this._castleHP <= 0) {
      this.emit('castleDestroyed');
      return true;
    }
    return false;
  }

  /**
   * Heal the castle
   */
  heal(amount: number): void {
    this._castleHP = Math.min(this._maxCastleHP, this._castleHP + amount);
    this.emit('healthChanged', this._castleHP, this._maxCastleHP);
  }

  // ─────────────────────────────────────────────────────────────
  // WAVE STATE
  // ─────────────────────────────────────────────────────────────

  get currentWave(): number {
    return this._currentWave;
  }

  get totalWaves(): number {
    return this._totalWaves;
  }

  /**
   * Set the total number of waves
   */
  setTotalWaves(total: number): void {
    this._totalWaves = total;
  }

  /**
   * Set the current wave number
   */
  setWave(wave: number): void {
    this._currentWave = wave;
    this.emit('waveChanged', wave, this._totalWaves);
  }

  // ─────────────────────────────────────────────────────────────
  // GAME FLOW STATE
  // ─────────────────────────────────────────────────────────────

  get isPaused(): boolean {
    return this._isPaused;
  }

  get gameSpeed(): number {
    return this._gameSpeed;
  }

  get gameOver(): boolean {
    return this._gameOver;
  }

  /**
   * Toggle pause state
   * @returns new pause state
   */
  togglePause(): boolean {
    this._isPaused = !this._isPaused;
    this.emit('pauseChanged', this._isPaused);
    return this._isPaused;
  }

  /**
   * Set pause state directly
   */
  setPaused(paused: boolean): void {
    if (this._isPaused !== paused) {
      this._isPaused = paused;
      this.emit('pauseChanged', this._isPaused);
    }
  }

  /**
   * Set game speed multiplier
   */
  setGameSpeed(speed: number): void {
    this._gameSpeed = speed;
    this.emit('speedChanged', speed);
  }

  /**
   * Mark game as over (convenience method)
   */
  markGameOver(): void {
    this.setGameOver(true);
  }

  /**
   * Set game over state
   */
  setGameOver(isOver: boolean): void {
    this._gameOver = isOver;
    if (isOver) {
      this.emit('gameOver');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TIME TRACKING
  // ─────────────────────────────────────────────────────────────

  get virtualGameTime(): number {
    return this._virtualGameTime;
  }

  get gameStartTime(): number {
    return this._gameStartTime;
  }

  get hasGameStarted(): boolean {
    return this._hasGameStarted;
  }

  /**
   * Add to virtual game time (scaled by game speed)
   */
  addVirtualTime(delta: number): void {
    this._virtualGameTime += delta;
  }

  /**
   * Mark the game as started (when wave 1 begins)
   */
  markGameStarted(): void {
    if (!this._hasGameStarted) {
      this._gameStartTime = Date.now();
      this._hasGameStarted = true;
    }
  }

  /**
   * Get elapsed real time since game started (in seconds)
   */
  getElapsedRealTime(): number {
    if (!this._hasGameStarted) return 0;
    return Math.floor((Date.now() - this._gameStartTime) / 1000);
  }

  // ─────────────────────────────────────────────────────────────
  // RESET / INITIALIZATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Reset all game state for a new game
   */
  reset(): void {
    this._gold = GAME_CONFIG.STARTING_GOLD;
    this._castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._maxCastleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._virtualGameTime = 0;
    this._gameStartTime = 0;
    this._hasGameStarted = false;
    this._currentWave = 0;
    this._isPaused = false;
    this._gameSpeed = 1;
    this._gameOver = false;
  }

  /**
   * Get a snapshot of the current game state (for results screen)
   */
  getStateSnapshot(): {
    gold: number;
    castleHP: number;
    maxCastleHP: number;
    currentWave: number;
    totalWaves: number;
    runTimeSeconds: number;
  } {
    return {
      gold: this._gold,
      castleHP: this._castleHP,
      maxCastleHP: this._maxCastleHP,
      currentWave: this._currentWave,
      totalWaves: this._totalWaves,
      runTimeSeconds: this.getElapsedRealTime()
    };
  }
}
