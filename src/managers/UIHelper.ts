import Phaser from 'phaser';
import { THEME } from '../data/ThemeConfig';

export interface ButtonConfig {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  disabledTextColor?: string;
  bgColor?: number;
  hoverBgColor?: number;
  disabledBgColor?: number;
  borderColor?: number;
  disabledBorderColor?: number;
  paddingX?: number;
  paddingY?: number;
  minWidth?: number;
  enabled?: boolean;
  onClick?: () => void;
}

export interface ButtonResult {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Rectangle;
  width: number;
  height: number;
}

export interface PopupConfig {
  x: number;
  y: number;
  padding?: number;
  bgColor?: number;
  bgAlpha?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
}

export interface PopupResult {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  contentContainer: Phaser.GameObjects.Container;

  finalize: () => { width: number; height: number };
}

export class UIHelper {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /* eslint-disable complexity */
  createButton(config: ButtonConfig): ButtonResult {
    const {
      text,
      x,
      y,
      fontSize = 14,
      fontFamily = 'Arial Black',
      textColor = '#ffffff',
      disabledTextColor = '#666666',
      bgColor = 0x3a3a3a,
      hoverBgColor = 0x5a5a5a,
      disabledBgColor = 0x2a2a2a,
      borderColor = 0xffd700,
      disabledBorderColor = 0x555555,
      paddingX = 16,
      paddingY = 10,
      minWidth = 0,
      enabled = true,
      onClick,
    } = config;

    const textObj = this.scene.add
      .text(0, 0, text, {
        fontFamily,
        fontSize: `${fontSize}px`,
        color: enabled ? textColor : disabledTextColor,
      })
      .setOrigin(0.5);

    const textWidth = textObj.width;
    const textHeight = textObj.height;
    const btnWidth = Math.max(minWidth, textWidth + paddingX * 2);
    const btnHeight = textHeight + paddingY * 2;

    const container = this.scene.add.container(x, y);

    const background = this.scene.add.graphics();
    const currentBgColor = enabled ? bgColor : disabledBgColor;
    const currentBorderColor = enabled ? borderColor : disabledBorderColor;
    background.fillStyle(THEME.colors.warmShadow, 0.3);
    background.fillRoundedRect(-btnWidth / 2 + 2, -btnHeight / 2 + 3, btnWidth, btnHeight, 6);
    background.fillStyle(currentBgColor, 1);
    background.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    background.fillStyle(THEME.colors.warmHighlight, 0.12);
    background.fillRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, 8, 5);
    background.lineStyle(2, currentBorderColor, 1);
    background.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

    container.add(background);
    container.add(textObj);

    const hitArea = this.scene.add.rectangle(0, 0, btnWidth, btnHeight, 0xffffff, 0);

    if (enabled) {
      hitArea.setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        background.clear();
        background.fillStyle(THEME.colors.warmShadow, 0.3);
        background.fillRoundedRect(-btnWidth / 2 + 2, -btnHeight / 2 + 3, btnWidth, btnHeight, 6);
        background.fillStyle(hoverBgColor, 1);
        background.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
        background.fillStyle(THEME.colors.warmHighlight, 0.12);
        background.fillRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, 8, 5);
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      });

      hitArea.on('pointerout', () => {
        background.clear();
        background.fillStyle(THEME.colors.warmShadow, 0.3);
        background.fillRoundedRect(-btnWidth / 2 + 2, -btnHeight / 2 + 3, btnWidth, btnHeight, 6);
        background.fillStyle(bgColor, 1);
        background.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
        background.fillStyle(THEME.colors.warmHighlight, 0.12);
        background.fillRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, 8, 5);
        background.lineStyle(2, borderColor, 1);
        background.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      });

      if (onClick) {
        hitArea.on(
          'pointerdown',
          (
            _pointer: Phaser.Input.Pointer,
            _localX: number,
            _localY: number,
            event: Phaser.Types.Input.EventData
          ) => {
            event.stopPropagation();
            onClick();
          }
        );
      }
    }

    container.add(hitArea);

    return {
      container,
      background,
      text: textObj,
      hitArea,
      width: btnWidth,
      height: btnHeight,
    };
  }

  createPopup(config: PopupConfig): PopupResult {
    const {
      x,
      y,
      padding = 20,
      bgColor = 0x1a0a00,
      bgAlpha = 0.95,
      borderColor = 0xd4a574,
      borderWidth = 3,
      cornerRadius = 12,
    } = config;

    const container = this.scene.add.container(x, y);
    container.setDepth(200);

    const background = this.scene.add.graphics();
    container.add(background);

    const contentContainer = this.scene.add.container(0, 0);
    container.add(contentContainer);

    const finalize = (): { width: number; height: number } => {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      contentContainer.each((child: Phaser.GameObjects.GameObject) => {
        if ('getBounds' in child && typeof child.getBounds === 'function') {
          const bounds = (child as unknown as Phaser.GameObjects.Components.GetBounds).getBounds();

          const localX = bounds.x - container.x;
          const localY = bounds.y - container.y;
          minX = Math.min(minX, localX);
          minY = Math.min(minY, localY);
          maxX = Math.max(maxX, localX + bounds.width);
          maxY = Math.max(maxY, localY + bounds.height);
        }
      });

      if (minX === Infinity) {
        minX = -100;
        minY = -50;
        maxX = 100;
        maxY = 50;
      }

      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      const bgX = minX - padding;
      const bgY = minY - padding;

      background.clear();
      background.fillStyle(THEME.colors.warmShadow, 0.3);
      background.fillRoundedRect(bgX + 3, bgY + 5, contentWidth, contentHeight, cornerRadius + 1);
      background.fillStyle(bgColor, bgAlpha);
      background.fillRoundedRect(bgX, bgY, contentWidth, contentHeight, cornerRadius);
      background.fillStyle(THEME.colors.warmHighlight, 0.08);
      background.fillRoundedRect(
        bgX + 4,
        bgY + 4,
        contentWidth - 8,
        Math.max(16, contentHeight * 0.18),
        Math.max(2, cornerRadius - 2)
      );
      background.lineStyle(borderWidth, borderColor, 1);
      background.strokeRoundedRect(bgX, bgY, contentWidth, contentHeight, cornerRadius);

      const camera = this.scene.cameras.main;
      const screenWidth = camera.width;
      const screenHeight = camera.height;
      const margin = 10;

      const popupLeft = container.x + bgX;
      const popupRight = container.x + bgX + contentWidth;
      const popupTop = container.y + bgY;
      const popupBottom = container.y + bgY + contentHeight;

      let offsetX = 0;
      let offsetY = 0;

      if (popupLeft < margin) {
        offsetX = margin - popupLeft;
      } else if (popupRight > screenWidth - margin) {
        offsetX = screenWidth - margin - popupRight;
      }

      if (popupTop < margin) {
        offsetY = margin - popupTop;
      } else if (popupBottom > screenHeight - margin) {
        offsetY = screenHeight - margin - popupBottom;
      }

      container.x += offsetX;
      container.y += offsetY;

      return { width: contentWidth, height: contentHeight };
    };

    return {
      container,
      background,
      contentContainer,
      finalize,
    };
  }

  measureText(
    text: string,
    fontSize: number = 14,
    fontFamily: string = 'Arial Black'
  ): { width: number; height: number } {
    const tempText = this.scene.add.text(0, 0, text, {
      fontFamily,
      fontSize: `${fontSize}px`,
    });
    const width = tempText.width;
    const height = tempText.height;
    tempText.destroy();
    return { width, height };
  }

  clampToScreen(
    container: Phaser.GameObjects.Container,
    width: number,
    height: number,
    originX: number = 0.5,
    originY: number = 0.5
  ): void {
    const camera = this.scene.cameras.main;
    const margin = 10;

    const left = container.x - width * originX;
    const right = container.x + width * (1 - originX);
    const top = container.y - height * originY;
    const bottom = container.y + height * (1 - originY);

    if (left < margin) {
      container.x = margin + width * originX;
    } else if (right > camera.width - margin) {
      container.x = camera.width - margin - width * (1 - originX);
    }

    if (top < margin) {
      container.y = margin + height * originY;
    } else if (bottom > camera.height - margin) {
      container.y = camera.height - margin - height * (1 - originY);
    }
  }
}
