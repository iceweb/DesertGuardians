import { Howl, Howler } from 'howler';

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

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

const AUDIO_SETTINGS_KEY = 'tower_defense_audio_settings';

const MAX_VOLUME_SCALE = 0.5;

export class AudioManager {
  private static instance: AudioManager | null = null;

  private bgmTracks: Howl[] = [];
  private currentBgmIndex: number = 0;
  private bgmPlaying: boolean = false;
  private bgmWantToPlay: boolean = false;
  private bgmTracksLoaded: number = 0;

  private sfxSounds: Map<SFXKey, Howl> = new Map();

  private bgmVolume: number = 0.5;
  private sfxVolume: number = 0.25;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;

    const bgmFiles = [
      { src: ['assets/audio/BGS1.mp3'], name: 'BGS1' },
      { src: ['assets/audio/BGS2.mp3'], name: 'BGS2' }
    ];

    this.bgmTracksLoaded = 0;

    bgmFiles.forEach((bgmDef, _index) => {
      const track = new Howl({
        src: bgmDef.src,
        loop: false,
        volume: this.bgmVolume * MAX_VOLUME_SCALE,
        preload: true,
        html5: true,
        onload: () => {

          this.bgmTracksLoaded++;

          if (this.bgmWantToPlay && !this.bgmPlaying && this.bgmTracksLoaded > 0) {
            this.startBGMPlayback();
          }
        },
        onplay: () => {

        },
        onend: () => {

          if (this.bgmPlaying) {
            this.playNextBgmTrack();
          }
        },
        onloaderror: (_id, error) => {
          console.error(`AudioManager: BGM ${bgmDef.name} failed to load:`, error);
        },
        onplayerror: (_id, error) => {
          console.warn(`AudioManager: BGM ${bgmDef.name} play blocked (autoplay policy):`, error);

          this.bgmPlaying = false;
        }
      });
      this.bgmTracks.push(track);
    });

    this.currentBgmIndex = Math.random() < 0.5 ? 0 : 1;

    this.initializeSFX();

    this.isInitialized = true;

  }

  private initializeSFX(): void {

    const sfxDefinitions: { key: SFXKey; file: string }[] = [

      { key: 'ui_click', file: 'click.mp3' },
      { key: 'coins', file: 'coins.mp3' },

      { key: 'victory', file: 'victory.mp3' },
      { key: 'defeat', file: 'defeat.mp3' },
      { key: 'leaked', file: 'leaked.mp3' },
      { key: 'wavestart', file: 'wavestart.mp3' },

      { key: 'tower_place', file: 'tower_place.mp3' },

      { key: 'boss_level_entry', file: 'boss_level_entry.mp3' },
      { key: 'dragon_roar', file: 'dragon.mp3' }
    ];

    for (const def of sfxDefinitions) {
      const sound = new Howl({
        src: [`assets/audio/${def.file}`],
        volume: this.sfxVolume * MAX_VOLUME_SCALE,
        preload: true,
        onloaderror: () => {

          console.debug(`AudioManager: SFX ${def.key} not found, skipping`);
        }
      });
      this.sfxSounds.set(def.key, sound);
    }
  }

  playBGM(): void {
    if (this.bgmTracks.length === 0) return;

    this.bgmWantToPlay = true;

    if (this.isMuted) return;

    const anyPlaying = this.bgmTracks.some(track => track.playing());
    if (anyPlaying) return;

    this.startBGMPlayback();
  }

  private startBGMPlayback(): void {
    if (this.isMuted || this.bgmPlaying) return;

    const currentTrack = this.bgmTracks[this.currentBgmIndex];
    if (currentTrack && currentTrack.state() === 'loaded') {
      this.bgmPlaying = true;
      currentTrack.play();

    } else {

      const otherIndex = this.currentBgmIndex === 0 ? 1 : 0;
      const otherTrack = this.bgmTracks[otherIndex];
      if (otherTrack && otherTrack.state() === 'loaded') {
        this.currentBgmIndex = otherIndex;
        this.bgmPlaying = true;
        otherTrack.play();
      }
    }
  }

  private playNextBgmTrack(): void {

    this.currentBgmIndex = this.currentBgmIndex === 0 ? 1 : 0;

    const nextTrack = this.bgmTracks[this.currentBgmIndex];
    if (nextTrack && nextTrack.state() === 'loaded') {
      nextTrack.play();

    }
  }

  stopBGM(): void {
    this.bgmPlaying = false;
    for (const track of this.bgmTracks) {
      track.stop();
    }
  }

  pauseBGM(): void {
    for (const track of this.bgmTracks) {
      if (track.playing()) {
        track.pause();
      }
    }
  }

  resumeBGM(): void {
    if (this.isMuted || !this.bgmPlaying) return;

    const currentTrack = this.bgmTracks[this.currentBgmIndex];
    if (currentTrack && !currentTrack.playing()) {
      currentTrack.play();
    }
  }

  playSFX(key: SFXKey): void {
    if (this.isMuted) return;

    const sound = this.sfxSounds.get(key);
    if (sound && sound.state() === 'loaded') {

      sound.volume(this.sfxVolume);
      sound.play();
    }

    if (this.bgmWantToPlay && !this.bgmPlaying && !this.isMuted) {

      setTimeout(() => {
        if (!this.bgmPlaying) {

          this.startBGMPlayback();
        }
      }, 100);
    }
  }

  unlockAudio(): void {

    if (this.bgmWantToPlay && !this.bgmPlaying) {

      this.startBGMPlayback();
    }
  }

  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    const actualVolume = this.bgmVolume * MAX_VOLUME_SCALE;
    for (const track of this.bgmTracks) {
      track.volume(actualVolume);
    }
    this.saveSettings();
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    const actualVolume = this.sfxVolume * MAX_VOLUME_SCALE;
    for (const sound of this.sfxSounds.values()) {
      sound.volume(actualVolume);
    }
    this.saveSettings();
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    this.saveSettings();

    if (!this.isMuted && this.bgmWantToPlay && !this.bgmPlaying) {
      this.startBGMPlayback();
    }

    return this.isMuted;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(this.isMuted);
    this.saveSettings();

    if (!this.isMuted && this.bgmWantToPlay && !this.bgmPlaying) {
      this.startBGMPlayback();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  private loadSettings(): void {
    try {
      const data = localStorage.getItem(AUDIO_SETTINGS_KEY);

      if (data) {
        const settings: AudioSettings = JSON.parse(data);
        this.bgmVolume = settings.bgmVolume ?? 0.5;
        this.sfxVolume = settings.sfxVolume ?? 0.25;
        this.isMuted = settings.muted ?? false;

        Howler.mute(this.isMuted);
      }
    } catch (e) {
      console.warn('AudioManager: Failed to load settings', e);
    }
  }

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
