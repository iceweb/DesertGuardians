import Phaser from 'phaser';

export interface PopupOptions {
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  allowInteractionBehind?: boolean;
}

const DEFAULT_OPTIONS: Required<PopupOptions> = {
  closeOnOutsideClick: true,
  closeOnEscape: true,
  allowInteractionBehind: false,
};

export class PopupController {
  private scene: Phaser.Scene;
  private overlay: Phaser.GameObjects.Rectangle;

  private activePopupId: string | null = null;
  private activeOptions: Required<PopupOptions> = { ...DEFAULT_OPTIONS };
  private closeHandler: (() => void) | null = null;

  private lastCloseTime: number = -Infinity;
  private readonly closeGuardMs = 80;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.overlay = scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, 0x000000, 0);
    this.overlay.setOrigin(0, 0);
    this.overlay.setDepth(190);
    this.overlay.setScrollFactor(0);
    this.overlay.setInteractive();
    this.overlay.setVisible(false);
    this.overlay.disableInteractive();

    this.overlay.on(
      'pointerdown',
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();

        if (!this.activePopupId) return;

        if (this.activeOptions.closeOnOutsideClick) {
          this.requestClose();
        }
      }
    );

    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.activePopupId && this.activeOptions.closeOnEscape) {
        this.requestClose();
      }
    });

    this.scene.scale?.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.overlay.setSize(gameSize.width, gameSize.height);
    });
  }

  open(popupId: string, options?: PopupOptions, onClose?: () => void): void {
    if (this.activePopupId && this.activePopupId !== popupId) {
      this.close(this.activePopupId, true);
    }

    this.activePopupId = popupId;
    this.activeOptions = { ...DEFAULT_OPTIONS, ...(options || {}) };
    this.closeHandler = onClose || null;

    if (this.activeOptions.allowInteractionBehind) {
      this.overlay.setVisible(false);
      this.overlay.disableInteractive();
    } else {
      this.overlay.setVisible(true);
      this.overlay.setInteractive();
    }
  }

  close(popupId?: string, suppressGuard: boolean = false): void {
    if (popupId && this.activePopupId !== popupId) return;

    if (this.activePopupId) {
      this.activePopupId = null;
      this.activeOptions = { ...DEFAULT_OPTIONS };
      this.closeHandler = null;
      if (this.overlay && this.overlay.scene) {
        this.overlay.setVisible(false);
        this.overlay.disableInteractive();
      }

      if (!suppressGuard) {
        this.lastCloseTime = this.scene.time.now;
      }
    }
  }

  isAnyOpen(): boolean {
    return this.activePopupId !== null;
  }

  requestClose(): void {
    if (this.closeHandler) {
      this.closeHandler();
      return;
    }

    this.close();
  }

  shouldIgnorePointer(): boolean {
    return this.scene.time.now - this.lastCloseTime < this.closeGuardMs;
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-ESC');
    this.scene.scale?.off('resize');
    if (this.overlay) {
      this.overlay.destroy();
    }
  }
}
