import Phaser from 'phaser';
import { THEME, hexToColor } from '../data/ThemeConfig';

/**
 * UIComponents - Reusable UI building blocks for consistent styling.
 * Reduces duplication across MenuScene, TowerUIManager, HUDManager, etc.
 */

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  alpha?: number;
  withCorners?: boolean;
  withShadow?: boolean;
}

export interface ButtonConfig {
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
  isPrimary?: boolean;
  enabled?: boolean;
  fontSize?: string;
  onClick?: () => void;
}

export interface TooltipConfig {
  x: number;
  y: number;
  title: string;
  lines: string[];
  width?: number;
}

export class UIComponents {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create a styled panel with 3D border effect
   */
  createPanel(config: PanelConfig): Phaser.GameObjects.Container {
    const { x, y, width, height, depth = 50, alpha = 0.98, withCorners = true, withShadow = true } = config;
    
    const container = this.scene.add.container(x, y);
    container.setDepth(depth);
    
    const bg = this.scene.add.graphics();
    
    // Outer shadow
    if (withShadow) {
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(-width/2 + 5, -height/2 + 5, width, height, THEME.dimensions.borderRadiusLg);
    }
    
    // Main panel body
    bg.fillStyle(THEME.colors.bgDark, alpha);
    bg.fillRoundedRect(-width/2, -height/2, width, height, THEME.dimensions.borderRadiusLg);
    
    // 3D edge effect
    bg.lineStyle(4, THEME.colors.bgDarker, 1);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, THEME.dimensions.borderRadiusLg);
    
    // Inner glow edge
    bg.lineStyle(2, THEME.colors.bronze, 1);
    bg.strokeRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 14);
    
    // Inner border
    bg.lineStyle(1, THEME.colors.goldDark, 0.6);
    bg.strokeRoundedRect(-width/2 + 10, -height/2 + 10, width - 20, height - 20, 12);
    
    container.add(bg);
    
    // Corner decorations
    if (withCorners) {
      const corners = [
        { cx: -width/2 + 20, cy: -height/2 + 20 },
        { cx: width/2 - 20, cy: -height/2 + 20 },
        { cx: -width/2 + 20, cy: height/2 - 20 },
        { cx: width/2 - 20, cy: height/2 - 20 },
      ];
      
      corners.forEach(c => {
        this.drawCornerDecoration(bg, c.cx, c.cy);
      });
    }
    
    return container;
  }

  /**
   * Draw corner decoration (jewel circle)
   */
  drawCornerDecoration(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(THEME.colors.bronze, 1);
    g.fillCircle(x, y, 8);
    g.fillStyle(THEME.colors.goldDark, 1);
    g.fillCircle(x, y, 5);
    g.fillStyle(THEME.colors.gold, 1);
    g.fillCircle(x, y, 2);
  }

  /**
   * Create a styled 3D button
   */
  createButton(config: ButtonConfig): { container: Phaser.GameObjects.Container; hitArea: Phaser.GameObjects.Rectangle } {
    const { 
      x, y, text, width, height, 
      isPrimary = false, 
      enabled = true,
      fontSize = isPrimary ? THEME.fontSize.xxl : THEME.fontSize.lg,
      onClick 
    } = config;
    
    const container = this.scene.add.container(0, 0);
    const btnGraphics = this.scene.add.graphics();
    
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      btnGraphics.clear();
      
      if (!enabled) {
        // Disabled state
        btnGraphics.fillStyle(0x2a2a2a, 1);
        btnGraphics.fillRoundedRect(x - width/2, y - height/2, width, height, 10);
        btnGraphics.lineStyle(2, 0x444444, 1);
        btnGraphics.strokeRoundedRect(x - width/2, y - height/2, width, height, 10);
        return;
      }
      
      const offsetY = pressed ? 2 : 0;
      
      // 3D shadow
      if (!pressed) {
        btnGraphics.fillStyle(0x000000, 0.5);
        btnGraphics.fillRoundedRect(x - width/2 + 4, y - height/2 + 4, width, height, 12);
      }
      
      // Bottom edge (3D depth)
      btnGraphics.fillStyle(isPrimary ? 0x6b4914 : 0x4a3520, 1);
      btnGraphics.fillRoundedRect(x - width/2, y - height/2 + 4 + offsetY, width, height, 12);
      
      // Main button body
      const baseColor = isPrimary 
        ? (hover ? THEME.colors.bronze : THEME.colors.bronzeDark)
        : (hover ? THEME.colors.goldDark : 0x6b4914);
      btnGraphics.fillStyle(baseColor, 1);
      btnGraphics.fillRoundedRect(x - width/2, y - height/2 + offsetY, width, height - 4, 12);
      
      // Top highlight
      const highlightColor = isPrimary 
        ? (hover ? THEME.colors.bronzeLight : 0xd4b584)
        : (hover ? 0xa08050 : THEME.colors.goldDark);
      btnGraphics.fillStyle(highlightColor, 0.6);
      btnGraphics.fillRoundedRect(x - width/2 + 4, y - height/2 + 4 + offsetY, width - 8, height/3, 8);
      
      // Border
      const borderColor = isPrimary ? THEME.colors.gold : THEME.colors.bronze;
      btnGraphics.lineStyle(2, borderColor, 1);
      btnGraphics.strokeRoundedRect(x - width/2, y - height/2 + offsetY, width, height - 4, 12);
      
      // Inner border
      btnGraphics.lineStyle(1, hover ? THEME.colors.gold : THEME.colors.goldDark, 0.5);
      btnGraphics.strokeRoundedRect(x - width/2 + 3, y - height/2 + 3 + offsetY, width - 6, height - 10, 10);
      
      // Corner gems for primary button
      if (isPrimary) {
        const gemY = y - height/2 + 12;
        btnGraphics.fillStyle(THEME.colors.gold, 1);
        btnGraphics.fillCircle(x - width/2 + 16, gemY + offsetY, 4);
        btnGraphics.fillCircle(x + width/2 - 16, gemY + offsetY, 4);
        btnGraphics.fillStyle(THEME.colors.goldLight, 0.8);
        btnGraphics.fillCircle(x - width/2 + 15, gemY - 1 + offsetY, 2);
        btnGraphics.fillCircle(x + width/2 - 17, gemY - 1 + offsetY, 2);
      }
    };
    
    drawButton(false);
    container.add(btnGraphics);
    
    // Button text
    const btnText = this.scene.add.text(x, y - 2, text, {
      fontFamily: THEME.fonts.title,
      fontSize: fontSize,
      color: enabled ? hexToColor(THEME.colors.textPrimary) : hexToColor(THEME.colors.textDisabled),
      fontStyle: 'bold',
      stroke: hexToColor(THEME.colors.borderDark),
      strokeThickness: isPrimary ? 3 : 2
    }).setOrigin(0.5);
    container.add(btnText);
    
    // Hit area
    const hitArea = this.scene.add.rectangle(x, y, width, height, 0x000000, 0);
    if (enabled) {
      hitArea.setInteractive({ useHandCursor: true });
      
      hitArea.on('pointerover', () => {
        drawButton(true);
        btnText.setScale(1.02);
      });
      
      hitArea.on('pointerout', () => {
        drawButton(false);
        btnText.setScale(1);
      });
      
      hitArea.on('pointerdown', () => {
        drawButton(true, true);
        btnText.setY(y);
      });
      
      hitArea.on('pointerup', () => {
        drawButton(true);
        btnText.setY(y - 2);
        onClick?.();
      });
    }
    container.add(hitArea);
    
    return { container, hitArea };
  }

  /**
   * Create a close button (X)
   */
  createCloseButton(x: number, y: number, onClick: () => void): Phaser.GameObjects.Text {
    const closeBtn = this.scene.add.text(x, y, '✕', {
      fontFamily: THEME.fonts.body,
      fontSize: THEME.fontSize.xl,
      color: hexToColor(THEME.colors.errorMuted)
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', onClick);
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor(hexToColor(THEME.colors.errorMuted)));
    
    return closeBtn;
  }

  /**
   * Create a title with decorative line underneath
   */
  createTitle(x: number, y: number, text: string, container?: Phaser.GameObjects.Container): { title: Phaser.GameObjects.Text; line: Phaser.GameObjects.Graphics } {
    const titleShadow = this.scene.add.text(x + 2, y + 2, text, {
      fontFamily: THEME.fonts.title,
      fontSize: THEME.fontSize.title,
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.5);
    
    const title = this.scene.add.text(x, y, text, {
      fontFamily: THEME.fonts.title,
      fontSize: THEME.fontSize.title,
      color: hexToColor(THEME.colors.gold),
      stroke: hexToColor(THEME.colors.borderDark),
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const line = this.scene.add.graphics();
    line.lineStyle(2, THEME.colors.bronze, 0.8);
    line.lineBetween(x - 120, y + 25, x + 120, y + 25);
    line.fillStyle(THEME.colors.gold, 1);
    line.fillCircle(x - 130, y + 25, 4);
    line.fillCircle(x + 130, y + 25, 4);
    
    if (container) {
      container.add(titleShadow);
      container.add(title);
      container.add(line);
    }
    
    return { title, line };
  }

  /**
   * Create a stat display line (label + value with color)
   */
  createStatLine(
    x: number, 
    y: number, 
    label: string, 
    value: string, 
    valueColor: number = THEME.colors.textPrimary,
    container?: Phaser.GameObjects.Container
  ): { label: Phaser.GameObjects.Text; value: Phaser.GameObjects.Text } {
    const labelText = this.scene.add.text(x, y, label, {
      fontFamily: THEME.fonts.body,
      fontSize: THEME.fontSize.md,
      color: hexToColor(THEME.colors.textSecondary)
    }).setOrigin(0, 0.5);
    
    const valueText = this.scene.add.text(x + 50, y, value, {
      fontFamily: THEME.fonts.bodyBold,
      fontSize: THEME.fontSize.md,
      color: hexToColor(valueColor)
    }).setOrigin(0, 0.5);
    
    if (container) {
      container.add(labelText);
      container.add(valueText);
    }
    
    return { label: labelText, value: valueText };
  }

  /**
   * Create a volume slider (for settings)
   */
  createVolumeSlider(
    label: string,
    x: number,
    y: number,
    initialValue: number,
    onChange: (value: number) => void,
    container?: Phaser.GameObjects.Container
  ): void {
    // Label
    const labelText = this.scene.add.text(x - 100, y, label + ':', {
      fontFamily: THEME.fonts.body,
      fontSize: THEME.fontSize.lg,
      color: hexToColor(THEME.colors.goldMuted)
    }).setOrigin(0, 0.5);
    container?.add(labelText);
    
    // Slider track
    const trackWidth = 200;
    const trackHeight = 8;
    const trackX = x;
    
    const track = this.scene.add.graphics();
    track.fillStyle(0x2a1a08, 1);
    track.fillRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    track.lineStyle(1, THEME.colors.borderDark, 1);
    track.strokeRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    container?.add(track);
    
    // Filled portion
    const fill = this.scene.add.graphics();
    container?.add(fill);
    
    // Slider handle
    const handle = this.scene.add.graphics();
    handle.fillStyle(THEME.colors.bronze, 1);
    handle.fillCircle(0, 0, 12);
    handle.lineStyle(2, THEME.colors.gold, 1);
    handle.strokeCircle(0, 0, 12);
    handle.setPosition(trackX + initialValue * trackWidth, y);
    handle.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    handle.input!.cursor = 'pointer';
    container?.add(handle);
    
    // Value text
    const valueText = this.scene.add.text(trackX + trackWidth + 20, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: THEME.fonts.body,
      fontSize: THEME.fontSize.sm,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    container?.add(valueText);
    
    // Update fill
    const updateFill = (value: number) => {
      fill.clear();
      fill.fillStyle(THEME.colors.bronze, 1);
      fill.fillRoundedRect(trackX, y - trackHeight / 2, value * trackWidth, trackHeight, 4);
    };
    updateFill(initialValue);
    
    // Drag handling
    let isDragging = false;
    
    handle.on('pointerdown', () => {
      isDragging = true;
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      
      const containerX = container?.x ?? 0;
      const localX = pointer.x - containerX;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
    });
    
    this.scene.input.on('pointerup', () => {
      isDragging = false;
    });
    
    // Click on track to jump
    const trackHitArea = this.scene.add.rectangle(trackX + trackWidth / 2, y, trackWidth, 30, 0x000000, 0);
    trackHitArea.setInteractive({ useHandCursor: true });
    container?.add(trackHitArea);
    
    trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const containerX = container?.x ?? 0;
      const localX = pointer.x - containerX;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
    });
  }

  /**
   * Draw a decorative ornament (for frames)
   */
  drawOrnament(g: Phaser.GameObjects.Graphics, x: number, y: number, horizontal: boolean): void {
    const size = 40;
    
    g.fillStyle(THEME.colors.bronze, 1);
    if (horizontal) {
      g.beginPath();
      g.moveTo(x - size, y);
      g.lineTo(x, y - 8);
      g.lineTo(x + size, y);
      g.lineTo(x, y + 8);
      g.closePath();
      g.fillPath();
    } else {
      g.beginPath();
      g.moveTo(x, y - size);
      g.lineTo(x + 8, y);
      g.lineTo(x, y + size);
      g.lineTo(x - 8, y);
      g.closePath();
      g.fillPath();
    }
    
    g.fillStyle(THEME.colors.gold, 0.8);
    g.fillCircle(x, y, 6);
    g.fillStyle(THEME.colors.goldLight, 0.6);
    g.fillCircle(x - 1, y - 1, 3);
  }
}
