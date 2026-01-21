import Phaser from 'phaser';

export interface MenuButtonConfig {
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
  isPrimary?: boolean;
  onClick: () => void;
}

/**
 * Creates styled menu buttons with hover and press effects
 */
export class MenuButton {
  private graphics: Phaser.GameObjects.Graphics;
  private textObj: Phaser.GameObjects.Text;
  private hitArea: Phaser.GameObjects.Rectangle;
  private config: MenuButtonConfig;

  constructor(scene: Phaser.Scene, config: MenuButtonConfig) {
    this.config = { isPrimary: false, ...config };

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(25);

    const fontSize = this.config.isPrimary ? '26px' : '18px';
    this.textObj = scene.add
      .text(config.x, config.y - 2, config.text, {
        fontFamily: 'Georgia, serif',
        fontSize: fontSize,
        color: '#fff8dc',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: this.config.isPrimary ? 3 : 2,
      })
      .setOrigin(0.5)
      .setDepth(26);

    this.hitArea = scene.add.rectangle(
      config.x,
      config.y,
      config.width,
      config.height,
      0x000000,
      0
    );
    this.hitArea.setDepth(27).setInteractive({ useHandCursor: true });

    this.setupInteraction();
    this.draw(false, false);
  }

  private setupInteraction(): void {
    const { y, onClick } = this.config;

    this.hitArea.on('pointerover', () => {
      this.draw(true);
      this.textObj.setScale(1.02);
    });

    this.hitArea.on('pointerout', () => {
      this.draw(false);
      this.textObj.setScale(1);
    });

    this.hitArea.on('pointerdown', () => {
      this.draw(true, true);
      this.textObj.setY(y);
    });

    this.hitArea.on('pointerup', () => {
      this.draw(true);
      this.textObj.setY(y - 2);
      onClick();
    });
  }

  private draw(hover: boolean, pressed: boolean = false): void {
    const { x, y, width: btnWidth, height: btnHeight, isPrimary } = this.config;
    const g = this.graphics;

    g.clear();

    const offsetY = pressed ? 2 : 0;

    // Shadow
    if (!pressed) {
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(x - btnWidth / 2 + 4, y - btnHeight / 2 + 4, btnWidth, btnHeight, 12);
    }

    // Button base (3D effect)
    g.fillStyle(isPrimary ? 0x6b4914 : 0x4a3520, 1);
    g.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2 + 4 + offsetY, btnWidth, btnHeight, 12);

    // Button face
    const baseColor = isPrimary ? (hover ? 0xd4a574 : 0xc49564) : hover ? 0x8b6914 : 0x6b4914;
    g.fillStyle(baseColor, 1);
    g.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2 + offsetY, btnWidth, btnHeight - 4, 12);

    // Highlight
    const highlightColor = isPrimary ? (hover ? 0xebd4a4 : 0xd4b584) : hover ? 0xa08050 : 0x8b6914;
    g.fillStyle(highlightColor, 0.6);
    g.fillRoundedRect(
      x - btnWidth / 2 + 4,
      y - btnHeight / 2 + 4 + offsetY,
      btnWidth - 8,
      btnHeight / 3,
      8
    );

    // Border
    const borderColor = isPrimary ? 0xffd700 : 0xd4a574;
    g.lineStyle(2, borderColor, 1);
    g.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2 + offsetY, btnWidth, btnHeight - 4, 12);

    // Inner border
    g.lineStyle(1, hover ? 0xffd700 : 0x8b6914, 0.5);
    g.strokeRoundedRect(
      x - btnWidth / 2 + 3,
      y - btnHeight / 2 + 3 + offsetY,
      btnWidth - 6,
      btnHeight - 10,
      10
    );

    // Corner gems for primary buttons
    if (isPrimary) {
      const gemY = y - btnHeight / 2 + 12;
      g.fillStyle(0xffd700, 1);
      g.fillCircle(x - btnWidth / 2 + 16, gemY + offsetY, 4);
      g.fillCircle(x + btnWidth / 2 - 16, gemY + offsetY, 4);
      g.fillStyle(0xfffacd, 0.8);
      g.fillCircle(x - btnWidth / 2 + 15, gemY - 1 + offsetY, 2);
      g.fillCircle(x + btnWidth / 2 - 17, gemY - 1 + offsetY, 2);
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.textObj.destroy();
    this.hitArea.destroy();
  }
}

/**
 * Creates a modal-style button (for use in popups)
 */
export class ModalButton {
  readonly container: Phaser.GameObjects.Container;
  readonly hitArea: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number,
    height: number
  ) {
    this.container = scene.add.container(0, 0);

    const btnGraphics = scene.add.graphics();
    this.container.add(btnGraphics);

    const btnText = scene.add
      .text(x, y - 2, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#fff8dc',
        fontStyle: 'bold',
        stroke: '#4a3520',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.container.add(btnText);

    this.hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0);
    this.hitArea.setInteractive({ useHandCursor: true });
    this.container.add(this.hitArea);

    const draw = (hover: boolean, pressed: boolean = false) => {
      btnGraphics.clear();
      const offsetY = pressed ? 2 : 0;

      if (!pressed) {
        btnGraphics.fillStyle(0x000000, 0.4);
        btnGraphics.fillRoundedRect(x - width / 2 + 3, y - height / 2 + 3, width, height, 10);
      }

      btnGraphics.fillStyle(0x4a3520, 1);
      btnGraphics.fillRoundedRect(x - width / 2, y - height / 2 + 3 + offsetY, width, height, 10);

      const baseColor = hover ? 0x8b6914 : 0x6b4914;
      btnGraphics.fillStyle(baseColor, 1);
      btnGraphics.fillRoundedRect(x - width / 2, y - height / 2 + offsetY, width, height - 3, 10);

      btnGraphics.fillStyle(hover ? 0xa08050 : 0x8b6914, 0.5);
      btnGraphics.fillRoundedRect(
        x - width / 2 + 3,
        y - height / 2 + 3 + offsetY,
        width - 6,
        height / 3,
        8
      );

      btnGraphics.lineStyle(2, 0xd4a574, 1);
      btnGraphics.strokeRoundedRect(x - width / 2, y - height / 2 + offsetY, width, height - 3, 10);
    };

    draw(false);

    this.hitArea.on('pointerover', () => {
      draw(true);
      btnText.setScale(1.02);
    });

    this.hitArea.on('pointerout', () => {
      draw(false);
      btnText.setScale(1);
    });

    this.hitArea.on('pointerdown', () => {
      draw(true, true);
      btnText.setY(y);
    });

    this.hitArea.on('pointerup', () => {
      draw(true);
      btnText.setY(y - 2);
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
