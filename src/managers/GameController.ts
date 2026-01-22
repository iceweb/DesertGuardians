import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameConfig';

export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export class GameController extends Phaser.Events.EventEmitter {
  private _gold: number;
  private _castleHP: number;
  private _maxCastleHP: number;

  private _virtualGameTime: number = 0;
  private _gameStartTime: number = 0;
  private _hasGameStarted: boolean = false;
  private _totalPausedTime: number = 0;
  private _pauseStartTime: number = 0;

  private _currentWave: number = 0;
  private _totalWaves: number = 0;

  private _isPaused: boolean = false;
  private _gameSpeed: number = 1;
  private _gameOver: boolean = false;

  private _difficulty: Difficulty = 'Normal';

  constructor() {
    super();

    this._gold = GAME_CONFIG.STARTING_GOLD;
    this._castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._maxCastleHP = GAME_CONFIG.MAX_CASTLE_HP;
  }

  get difficulty(): Difficulty {
    return this._difficulty;
  }

  setDifficulty(difficulty: Difficulty): void {
    this._difficulty = difficulty;
    this.emit('difficultyChanged', difficulty);
  }

  getCreepHealthMultiplier(): number {
    switch (this._difficulty) {
      case 'Easy':
        return 0.75;
      case 'Hard':
        return 1.25;
      default:
        return 1.0;
    }
  }

  getScoreMultiplier(): number {
    switch (this._difficulty) {
      case 'Easy':
        return 0.75;
      case 'Hard':
        return 1.25;
      default:
        return 1.0;
    }
  }

  get gold(): number {
    return this._gold;
  }

  addGold(amount: number): void {
    this._gold += amount;
    this.emit('goldChanged', this._gold, amount);
  }

  spendGold(amount: number): boolean {
    if (this._gold < amount) return false;
    this._gold -= amount;
    this.emit('goldChanged', this._gold, -amount);
    return true;
  }

  canAfford(amount: number): boolean {
    return this._gold >= amount;
  }

  get castleHP(): number {
    return this._castleHP;
  }

  get maxCastleHP(): number {
    return this._maxCastleHP;
  }

  takeDamage(amount: number = 1): boolean {
    this._castleHP = Math.max(0, this._castleHP - amount);
    this.emit('healthChanged', this._castleHP, this._maxCastleHP);

    if (this._castleHP <= 0) {
      this.emit('castleDestroyed');
      return true;
    }
    return false;
  }

  heal(amount: number): void {
    this._castleHP = Math.min(this._maxCastleHP, this._castleHP + amount);
    this.emit('healthChanged', this._castleHP, this._maxCastleHP);
  }

  get currentWave(): number {
    return this._currentWave;
  }

  get totalWaves(): number {
    return this._totalWaves;
  }

  setTotalWaves(total: number): void {
    this._totalWaves = total;
  }

  setWave(wave: number): void {
    this._currentWave = wave;
    this.emit('waveChanged', wave, this._totalWaves);
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  get gameSpeed(): number {
    return this._gameSpeed;
  }

  get gameOver(): boolean {
    return this._gameOver;
  }

  togglePause(): boolean {
    if (!this._isPaused) {
      // Starting pause - record when pause began
      this._pauseStartTime = Date.now();
    } else {
      // Ending pause - accumulate paused time
      if (this._pauseStartTime > 0) {
        this._totalPausedTime += Date.now() - this._pauseStartTime;
        this._pauseStartTime = 0;
      }
    }
    this._isPaused = !this._isPaused;
    this.emit('pauseChanged', this._isPaused);
    return this._isPaused;
  }

  setPaused(paused: boolean): void {
    if (this._isPaused !== paused) {
      if (paused) {
        // Starting pause - record when pause began
        this._pauseStartTime = Date.now();
      } else {
        // Ending pause - accumulate paused time
        if (this._pauseStartTime > 0) {
          this._totalPausedTime += Date.now() - this._pauseStartTime;
          this._pauseStartTime = 0;
        }
      }
      this._isPaused = paused;
      this.emit('pauseChanged', this._isPaused);
    }
  }

  setGameSpeed(speed: number): void {
    this._gameSpeed = speed;
    this.emit('speedChanged', speed);
  }

  markGameOver(): void {
    this.setGameOver(true);
  }

  setGameOver(isOver: boolean): void {
    this._gameOver = isOver;
    if (isOver) {
      this.emit('gameOver');
    }
  }

  get virtualGameTime(): number {
    return this._virtualGameTime;
  }

  get gameStartTime(): number {
    return this._gameStartTime;
  }

  get hasGameStarted(): boolean {
    return this._hasGameStarted;
  }

  addVirtualTime(delta: number): void {
    this._virtualGameTime += delta;
  }

  markGameStarted(): void {
    if (!this._hasGameStarted) {
      this._gameStartTime = Date.now();
      this._hasGameStarted = true;
    }
  }

  getElapsedRealTime(): number {
    if (!this._hasGameStarted) return 0;
    const totalElapsed = Date.now() - this._gameStartTime;
    // Subtract accumulated pause time
    let pausedTime = this._totalPausedTime;
    // If currently paused, also subtract current pause duration
    if (this._isPaused && this._pauseStartTime > 0) {
      pausedTime += Date.now() - this._pauseStartTime;
    }
    return Math.floor((totalElapsed - pausedTime) / 1000);
  }

  reset(): void {
    this._gold = GAME_CONFIG.STARTING_GOLD;
    this._castleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._maxCastleHP = GAME_CONFIG.MAX_CASTLE_HP;
    this._virtualGameTime = 0;
    this._gameStartTime = 0;
    this._hasGameStarted = false;
    this._totalPausedTime = 0;
    this._pauseStartTime = 0;
    this._currentWave = 0;
    this._isPaused = false;
    this._gameSpeed = 1;
    this._gameOver = false;
    this._difficulty = 'Normal';
  }

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
      runTimeSeconds: this.getElapsedRealTime(),
    };
  }
}
