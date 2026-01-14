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
  | 'gold_earn'
  | 'boss_level_entry'
  | 'dragon_roar'
  | 'leaked'
  | 'tower_place'
  | 'wavestart'
  | 'coins';

/**
 * Audio settings stored in localStorage
 */
interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const AUDIO_SETTINGS_KEY = 'tower_defense_audio_settings';

// Maximum volume scale - 100% on slider = 50% actual system volume
const MAX_VOLUME_SCALE = 0.5;

/**
 * AudioManager handles all game audio using Howler.js
 * Singleton pattern for global access
 */
export class AudioManager {
  private static instance: AudioManager | null = null;
  
  // Background music tracks (alternating)
  private bgmTracks: Howl[] = [];
  private currentBgmIndex: number = 0;
  private bgmPlaying: boolean = false;
  private bgmWantToPlay: boolean = false;  // Flag for when playBGM is called before tracks load
  private bgmTracksLoaded: number = 0;
  
  private sfxSounds: Map<SFXKey, Howl> = new Map();
  
  // Volume values are 0-1 representing slider position (will be scaled by MAX_VOLUME_SCALE)
  private bgmVolume: number = 0.5;   // 50% slider = 25% actual
  private sfxVolume: number = 0.25;  // 25% slider = 12.5% actual
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
    

    
    // Initialize BGM tracks (two alternating tracks)
    const bgmFiles = [
      { src: ['assets/audio/BGS1.mp3'], name: 'BGS1' },
      { src: ['assets/audio/BGS2.mp3'], name: 'BGS2' }
    ];
    
    this.bgmTracksLoaded = 0;
    
    bgmFiles.forEach((bgmDef, _index) => {
      const track = new Howl({
        src: bgmDef.src,
        loop: false, // Don't loop - we'll switch tracks on end
        volume: this.bgmVolume * MAX_VOLUME_SCALE,
        preload: true,
        html5: true, // Use HTML5 Audio for better mobile/browser compatibility
        onload: () => {

          this.bgmTracksLoaded++;
          // If playBGM was called before tracks loaded, start playing now
          if (this.bgmWantToPlay && !this.bgmPlaying && this.bgmTracksLoaded > 0) {
            this.startBGMPlayback();
          }
        },
        onplay: () => {

        },
        onend: () => {
          // When track ends, play the other track

          if (this.bgmPlaying) {
            this.playNextBgmTrack();
          }
        },
        onloaderror: (_id, error) => {
          console.error(`AudioManager: BGM ${bgmDef.name} failed to load:`, error);
        },
        onplayerror: (_id, error) => {
          console.warn(`AudioManager: BGM ${bgmDef.name} play blocked (autoplay policy):`, error);
          // Browser blocked autoplay - will retry on next user interaction
          this.bgmPlaying = false;
        }
      });
      this.bgmTracks.push(track);
    });
    
    // Randomize which track plays first
    this.currentBgmIndex = Math.random() < 0.5 ? 0 : 1;

    
    // Define SFX with procedural generation as fallback
    // Using short synthesized sounds when files don't exist
    this.initializeSFX();
    
    this.isInitialized = true;

  }

  /**
   * Initialize all SFX sounds
   */
  private initializeSFX(): void {
    // Only include SFX files that actually exist in public/assets/audio
    const sfxDefinitions: { key: SFXKey; file: string }[] = [
      // UI sounds
      { key: 'ui_click', file: 'click.mp3' },
      { key: 'coins', file: 'coins.mp3' },
      
      // Game event sounds
      { key: 'victory', file: 'victory.mp3' },
      { key: 'defeat', file: 'defeat.mp3' },
      { key: 'leaked', file: 'leaked.mp3' },
      { key: 'wavestart', file: 'wavestart.mp3' },
      
      // Tower sounds
      { key: 'tower_place', file: 'tower_place.mp3' },
      
      // Boss sounds
      { key: 'boss_level_entry', file: 'boss_level_entry.mp3' },
      { key: 'dragon_roar', file: 'dragon.mp3' }
    ];
    
    for (const def of sfxDefinitions) {
      const sound = new Howl({
        src: [`assets/audio/${def.file}`],
        volume: this.sfxVolume * MAX_VOLUME_SCALE,
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
   * Play background music (starts with random track, then alternates)
   */
  playBGM(): void {
    if (this.bgmTracks.length === 0) return;
    
    // Set flag that we want BGM to play
    this.bgmWantToPlay = true;
    
    // If muted, don't actually play but remember we want to
    if (this.isMuted) return;
    
    // Check if any track is already playing
    const anyPlaying = this.bgmTracks.some(track => track.playing());
    if (anyPlaying) return;
    
    // Try to start playback
    this.startBGMPlayback();
  }

  /**
   * Actually start BGM playback (called when tracks are ready)
   */
  private startBGMPlayback(): void {
    if (this.isMuted || this.bgmPlaying) return;
    
    const currentTrack = this.bgmTracks[this.currentBgmIndex];
    if (currentTrack && currentTrack.state() === 'loaded') {
      this.bgmPlaying = true;
      currentTrack.play();

    } else {
      // Current track not loaded yet, try the other one
      const otherIndex = this.currentBgmIndex === 0 ? 1 : 0;
      const otherTrack = this.bgmTracks[otherIndex];
      if (otherTrack && otherTrack.state() === 'loaded') {
        this.currentBgmIndex = otherIndex;
        this.bgmPlaying = true;
        otherTrack.play();
      }
    }
  }

  /**
   * Play the next BGM track (alternates between tracks)
   */
  private playNextBgmTrack(): void {
    // Switch to the other track
    this.currentBgmIndex = this.currentBgmIndex === 0 ? 1 : 0;
    
    const nextTrack = this.bgmTracks[this.currentBgmIndex];
    if (nextTrack && nextTrack.state() === 'loaded') {
      nextTrack.play();

    }
  }

  /**
   * Stop background music
   */
  stopBGM(): void {
    this.bgmPlaying = false;
    for (const track of this.bgmTracks) {
      track.stop();
    }
  }

  /**
   * Pause background music
   */
  pauseBGM(): void {
    for (const track of this.bgmTracks) {
      if (track.playing()) {
        track.pause();
      }
    }
  }

  /**
   * Resume background music
   */
  resumeBGM(): void {
    if (this.isMuted || !this.bgmPlaying) return;
    
    // Resume the current track if it was paused
    const currentTrack = this.bgmTracks[this.currentBgmIndex];
    if (currentTrack && !currentTrack.playing()) {
      currentTrack.play();
    }
  }

  /**
   * Play a sound effect
   */
  playSFX(key: SFXKey): void {
    if (this.isMuted) return;
    
    const sound = this.sfxSounds.get(key);
    if (sound && sound.state() === 'loaded') {
      // Ensure volume is set to current sfxVolume before playing
      sound.volume(this.sfxVolume);
      sound.play();
    }
    
    // User interaction detected - try to start BGM if it was blocked by autoplay policy
    if (this.bgmWantToPlay && !this.bgmPlaying && !this.isMuted) {
      // Small delay to ensure audio context is unlocked
      setTimeout(() => {
        if (!this.bgmPlaying) {

          this.startBGMPlayback();
        }
      }, 100);
    }
  }

  /**
   * Called on any user interaction to unlock audio (for autoplay policy)
   */
  unlockAudio(): void {
    // Try to start BGM if it was blocked by autoplay policy
    if (this.bgmWantToPlay && !this.bgmPlaying) {

      this.startBGMPlayback();
    }
  }

  /**
   * Set BGM volume (0-1 slider value, scaled to actual volume)
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    const actualVolume = this.bgmVolume * MAX_VOLUME_SCALE;
    for (const track of this.bgmTracks) {
      track.volume(actualVolume);
    }
    this.saveSettings();
  }

  /**
   * Set SFX volume (0-1 slider value, scaled to actual volume)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    const actualVolume = this.sfxVolume * MAX_VOLUME_SCALE;
    for (const sound of this.sfxSounds.values()) {
      sound.volume(actualVolume);
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
    
    // If unmuted and we wanted to play BGM, start it
    if (!this.isMuted && this.bgmWantToPlay && !this.bgmPlaying) {
      this.startBGMPlayback();
    }
    
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(this.isMuted);
    this.saveSettings();
    
    // If unmuted and we wanted to play BGM, start it
    if (!this.isMuted && this.bgmWantToPlay && !this.bgmPlaying) {
      this.startBGMPlayback();
    }
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
        this.bgmVolume = settings.bgmVolume ?? 0.5;   // Default 50% slider
        this.sfxVolume = settings.sfxVolume ?? 0.25;  // Default 25% slider
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
    for (const track of this.bgmTracks) {
      track.unload();
    }
    this.bgmTracks = [];
    for (const sound of this.sfxSounds.values()) {
      sound.unload();
    }
    this.sfxSounds.clear();
    this.isInitialized = false;
  }
}
