import Phaser from 'phaser';
import { AudioManager } from '../../managers';
import { ModalButton } from './MenuButton';

/**
 * Settings modal popup for audio controls
 */
export class SettingsModal {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container: Phaser.GameObjects.Container | null = null;
  private onClose: () => void;

  constructor(scene: Phaser.Scene, audioManager: AudioManager, onClose: () => void) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.onClose = onClose;
  }

  show(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(100);

    // Click blocker
    const clickBlocker = this.scene.add.rectangle(0, 0, 420, 320, 0x000000, 0);
    clickBlocker.setInteractive();
    clickBlocker.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
      }
    );
    clickBlocker.on(
      'pointerup',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
      }
    );
    this.container.add(clickBlocker);

    // Background
    const bg = this.scene.add.graphics();
    this.drawBackground(bg);
    this.container.add(bg);

    // Title
    this.addTitle();

    // Sliders
    this.createVolumeSlider('Music', -40, this.audioManager.getBGMVolume(), (value) => {
      this.audioManager.setBGMVolume(value);
    });

    this.createVolumeSlider('Effects', 30, this.audioManager.getSFXVolume(), (value) => {
      this.audioManager.setSFXVolume(value);
    });

    // Close button
    const closeBtn = new ModalButton(this.scene, 0, 110, '✕  CLOSE', 140, 45);
    closeBtn.hitArea.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.close();
    });
    this.container.add(closeBtn.container);

    // Fade in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
    });
  }

  private drawBackground(bg: Phaser.GameObjects.Graphics): void {
    // Shadow
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-195, -145, 400, 300, 18);

    // Main background
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-200, -150, 400, 300, 16);

    // Borders
    bg.lineStyle(4, 0x0a0400, 1);
    bg.strokeRoundedRect(-200, -150, 400, 300, 16);

    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-195, -145, 390, 290, 14);

    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-190, -140, 380, 280, 12);

    // Corner decorations
    this.drawCorner(bg, -190, -140);
    this.drawCorner(bg, 190, -140);
    this.drawCorner(bg, -190, 140);
    this.drawCorner(bg, 190, 140);
  }

  private drawCorner(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xd4a574, 1);
    g.fillCircle(x, y, 8);
    g.fillStyle(0x8b6914, 1);
    g.fillCircle(x, y, 5);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(x, y, 2);
  }

  private addTitle(): void {
    if (!this.container) return;

    const titleShadow = this.scene.add
      .text(2, -118, '⚙  SETTINGS', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
    this.container.add(titleShadow);

    const title = this.scene.add
      .text(0, -120, '⚙  SETTINGS', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: '#ffd700',
        stroke: '#4a3520',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const titleLine = this.scene.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-120, -90, 120, -90);
    titleLine.fillStyle(0xffd700, 1);
    titleLine.fillCircle(-130, -90, 4);
    titleLine.fillCircle(130, -90, 4);
    this.container.add(titleLine);
  }

  // eslint-disable-next-line max-lines-per-function
  private createVolumeSlider(
    label: string,
    y: number,
    initialValue: number,
    onChange: (value: number) => void
  ): void {
    if (!this.container) return;

    const labelText = this.scene.add
      .text(-150, y, label + ':', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#c9a86c',
      })
      .setOrigin(0, 0.5);
    this.container.add(labelText);

    const trackWidth = 200;
    const trackHeight = 8;
    const trackX = -50;

    // Track
    const track = this.scene.add.graphics();
    track.fillStyle(0x2a1a08, 1);
    track.fillRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    track.lineStyle(1, 0x4a3520, 1);
    track.strokeRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    this.container.add(track);

    // Fill
    const fill = this.scene.add.graphics();
    this.container.add(fill);

    // Handle
    const handle = this.scene.add.graphics();
    handle.fillStyle(0xd4a574, 1);
    handle.fillCircle(0, 0, 12);
    handle.lineStyle(2, 0xffd700, 1);
    handle.strokeCircle(0, 0, 12);
    handle.setPosition(trackX + initialValue * trackWidth, y);
    handle.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    handle.input!.cursor = 'pointer';
    this.container.add(handle);

    // Value text
    const valueText = this.scene.add
      .text(trackX + trackWidth + 20, y, `${Math.round(initialValue * 100)}%`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);
    this.container.add(valueText);

    const updateFill = (value: number) => {
      fill.clear();
      fill.fillStyle(0xd4a574, 1);
      fill.fillRoundedRect(trackX, y - trackHeight / 2, value * trackWidth, trackHeight, 4);
    };
    updateFill(initialValue);

    let isDragging = false;

    const updateSliderFromPointer = (pointer: Phaser.Input.Pointer) => {
      if (!this.container) return;
      const localX = pointer.x - this.container.x;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;

      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
    };

    handle.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        isDragging = true;
        updateSliderFromPointer(pointer);
      }
    );

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      updateSliderFromPointer(pointer);
    });

    this.scene.input.on('pointerup', () => {
      isDragging = false;
    });

    this.scene.input.on('pointerupoutside', () => {
      isDragging = false;
    });

    // Track hit area
    const trackHitArea = this.scene.add.rectangle(
      trackX + trackWidth / 2,
      y,
      trackWidth,
      30,
      0x000000,
      0
    );
    trackHitArea.setInteractive({ useHandCursor: true });
    this.container.add(trackHitArea);

    trackHitArea.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        isDragging = true;
        updateSliderFromPointer(pointer);
      }
    );
  }

  close(): void {
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.container?.destroy();
          this.container = null;
          this.onClose();
        },
      });
    }
  }

  isOpen(): boolean {
    return this.container !== null;
  }
}
