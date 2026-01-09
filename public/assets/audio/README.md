# Audio Assets

This folder should contain the following audio files for the game. All audio is optional - the game will run silently if files are missing.

## Background Music

| File | Description |
|------|-------------|
| `desert_theme.mp3` / `desert_theme.ogg` | Main background music loop |

## Sound Effects

### Tower Sounds
| File | Description |
|------|-------------|
| `shoot_arrow.mp3` | Archer tower shooting |
| `shoot_rapidfire.mp3` | Rapidfire tower shooting |
| `shoot_sniper.mp3` | Sniper tower shooting |
| `shoot_cannon.mp3` | Rock Cannon shooting |
| `shoot_ice.mp3` | Ice Tower shooting |
| `shoot_poison.mp3` | Poison Tower shooting |
| `build_thud.mp3` | Tower placement sound |
| `sell_tower.mp3` | Tower sold sound |
| `upgrade_tower.mp3` | Tower upgraded sound |

### Combat Sounds
| File | Description |
|------|-------------|
| `hit_flesh.mp3` | Projectile hitting unarmored creep |
| `hit_armor.mp3` | Projectile hitting armored creep |
| `hit_shield.mp3` | Projectile hitting shielded creep |

### Game Event Sounds
| File | Description |
|------|-------------|
| `wave_start.mp3` | New wave beginning |
| `wave_complete.mp3` | Wave completed |
| `creep_leak.mp3` | Creep reached the castle |
| `gold_earn.mp3` | Gold earned from killing creep |
| `victory.mp3` | Game won fanfare |
| `defeat.mp3` | Game over sound |

### UI Sounds
| File | Description |
|------|-------------|
| `ui_click.mp3` | Button/UI click sound |

## Audio Specifications

- **Format**: MP3 (recommended) or OGG for broader browser support
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps for SFX, 192+ kbps for BGM
- **Channels**: Mono for SFX, Stereo for BGM
- **Duration**: SFX should be short (0.1-1.0 seconds)

## Volume Settings

Volume is persisted in localStorage under `tower_defense_audio_settings`:
- Default BGM Volume: 40%
- Default SFX Volume: 60%

Players can adjust volumes in the Settings menu.
