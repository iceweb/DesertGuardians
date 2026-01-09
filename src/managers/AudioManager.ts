import { Howl, Howler } from 'howler';

/**
 * SFX keys available in the game
 */
export type SFXKey = 
  | 'shoot_arrow'
  | 'shoot_rapidfire'
  | 'shoot_sniper'
  | 'shoot_cannon'
  | 'shoot_ice'
  | 'shoot_poison'
  | 'hit_flesh'
  | 'hit_armor'
  | 'hit_shield'
  | 'build_thud'
  | 'sell_tower'
  | 'upgrade_tower'
  | 'ui_click'
  | 'wave_start'
  | 'wave_complete'
  | 'victory'
  | 'defeat'
  | 'creep_leak'
  | 'gold_earn';

/**
 * Audio settings stored in localStorage
 */
interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const AUDIO_SETTINGS_KEY = 'tower_defense_audio_settings';

/**
 * AudioManager handles all game audio using Howler.js
 * Singleton pattern for global access
 */
export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private bgm: Howl | null = null;
  private sfxSounds: Map<SFXKey, Howl> = new Map();
  
  private bgmVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  
  private constructor() {
    this.loadSettings();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize all audio assets
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    console.log('AudioManager: Initializing...');
    
    // Initialize BGM
    this.bgm = new Howl({
      src: ['/assets/audio/desert_theme.mp3', '/assets/audio/desert_theme.ogg'],
      loop: true,
      volume: this.bgmVolume,
      preload: true,
      onloaderror: (_id, error) => {
        console.warn('AudioManager: BGM failed to load, audio disabled', error);
      }
    });
    
    // Define SFX with procedural generation as fallback
    // Using short synthesized sounds when files don't exist
    this.initializeSFX();
    
    this.isInitialized = true;
    console.log('AudioManager: Initialized');
  }

  /**
   * Initialize all SFX sounds
   */
  private initializeSFX(): void {
    const sfxDefinitions: { key: SFXKey; file: string }[] = [
      { key: 'shoot_arrow', file: 'shoot_arrow.mp3' },
      { key: 'shoot_rapidfire', file: 'shoot_rapidfire.mp3' },
      { key: 'shoot_sniper', file: 'shoot_sniper.mp3' },
      { key: 'shoot_cannon', file: 'shoot_cannon.mp3' },
      { key: 'shoot_ice', file: 'shoot_ice.mp3' },
      { key: 'shoot_poison', file: 'shoot_poison.mp3' },
      { key: 'hit_flesh', file: 'hit_flesh.mp3' },
      { key: 'hit_armor', file: 'hit_armor.mp3' },
      { key: 'hit_shield', file: 'hit_shield.mp3' },
      { key: 'build_thud', file: 'build_thud.mp3' },
      { key: 'sell_tower', file: 'sell_tower.mp3' },
      { key: 'upgrade_tower', file: 'upgrade_tower.mp3' },
      { key: 'ui_click', file: 'ui_click.mp3' },
      { key: 'wave_start', file: 'wave_start.mp3' },
      { key: 'wave_complete', file: 'wave_complete.mp3' },
      { key: 'victory', file: 'victory.mp3' },
      { key: 'defeat', file: 'defeat.mp3' },
      { key: 'creep_leak', file: 'creep_leak.mp3' },
      { key: 'gold_earn', file: 'gold_earn.mp3' }
    ];
    
    for (const def of sfxDefinitions) {
      const sound = new Howl({
        src: [`/assets/audio/${def.file}`],
        volume: this.sfxVolume,
        preload: true,
        onloaderror: () => {
          // Silently fail - audio is optional
          console.debug(`AudioManager: SFX ${def.key} not found, skipping`);
        }
      });
      this.sfxSounds.set(def.key, sound);
    }
  }

  /**
   * Play background music
   */
  playBGM(): void {
    if (!this.bgm || this.isMuted) return;
    
    if (!this.bgm.playing()) {
      this.bgm.play();
      console.log('AudioManager: BGM started');
    }
  }

  /**
   * Stop background music
   */
  stopBGM(): void {
    if (!this.bgm) return;
    this.bgm.stop();
  }

  /**
   * Pause background music
   */
  pauseBGM(): void {
    if (!this.bgm) return;
    this.bgm.pause();
  }

  /**
   * Resume background music
   */
  resumeBGM(): void {
    if (!this.bgm || this.isMuted) return;
    this.bgm.play();
  }

  /**
   * Play a sound effect
   */
  playSFX(key: SFXKey): void {
    if (this.isMuted) return;
    
    const sound = this.sfxSounds.get(key);
    if (sound && sound.state() === 'loaded') {
      sound.play();
    }
  }

  /**
   * Set BGM volume (0-1)
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume(this.bgmVolume);
    }
    this.saveSettings();
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    for (const sound of this.sfxSounds.values()) {
      sound.volume(this.sfxVolume);
    }
    this.saveSettings();
  }

  /**
   * Get current BGM volume
   */
  getBGMVolume(): number {
    return this.bgmVolume;
  }

  /**
   * Get current SFX volume
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    this.saveSettings();
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(this.isMuted);
    this.saveSettings();
  }

  /**
   * Check if muted
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const data = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (data) {
        const settings: AudioSettings = JSON.parse(data);
        this.bgmVolume = settings.bgmVolume ?? 0.4;
        this.sfxVolume = settings.sfxVolume ?? 0.6;
        this.isMuted = settings.muted ?? false;
        Howler.mute(this.isMuted);
      }
    } catch (e) {
      console.warn('AudioManager: Failed to load settings', e);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      const settings: AudioSettings = {
        bgmVolume: this.bgmVolume,
        sfxVolume: this.sfxVolume,
        muted: this.isMuted
      };
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('AudioManager: Failed to save settings', e);
    }
  }

  /**
   * Cleanup all audio
   */
  destroy(): void {
    this.stopBGM();
    if (this.bgm) {
      this.bgm.unload();
      this.bgm = null;
    }
    for (const sound of this.sfxSounds.values()) {
      sound.unload();
    }
    this.sfxSounds.clear();
    this.isInitialized = false;
  }
}
