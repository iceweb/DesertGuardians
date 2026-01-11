import Phaser from 'phaser';
import type { Highscore } from './ResultsScene';
import { AudioManager } from '../managers';

const HIGHSCORES_KEY = 'tower_defense_highscores';

export class MenuScene extends Phaser.Scene {
  private highscoreContainer: Phaser.GameObjects.Container | null = null;
  private settingsContainer: Phaser.GameObjects.Container | null = null;
  private audioManager!: AudioManager;
  private decorations: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Initialize audio manager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize();

    // Draw elaborate background
    this.drawBackground(width, height);
    
    // Draw decorative frame
    this.drawDecorativeFrame(width, height);
    
    // Draw desert decorations
    this.drawDesertDecorations(width, height);

    // Title with oriental styling
    this.createTitle(width, height);

    // Create menu buttons
    this.createMenuButtons(width, height);

    // Version text
    const version = this.add.text(width - 15, height - 15, 'v1.0.0', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b6914'
    });
    version.setOrigin(1, 1).setDepth(50);

    // Credits text
    const credits = this.add.text(width / 2, height - 15, '© 2026 Created by Mike Blöchlinger', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a86c'
    });
    credits.setOrigin(0.5, 1).setDepth(50);

    console.log('MenuScene: Menu created');
  }

  /**
   * Draw the elaborate desert background
   */
  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.setDepth(0);
    
    // Gradient-like background using multiple layers
    // Dark base
    bg.fillStyle(0x0a0400, 1);
    bg.fillRect(0, 0, width, height);
    
    // Warm gradient overlay from center
    bg.fillStyle(0x1a0a00, 0.9);
    bg.fillRect(0, 0, width, height);
    
    // Radial glow from center
    const centerX = width / 2;
    const centerY = height / 2;
    for (let i = 10; i > 0; i--) {
      const alpha = 0.02 * i;
      const radius = 100 + i * 80;
      bg.fillStyle(0x3a2010, alpha);
      bg.fillCircle(centerX, centerY - 50, radius);
    }
    
    // Subtle sand texture pattern
    bg.lineStyle(1, 0x2a1808, 0.15);
    for (let y = 0; y < height; y += 8) {
      const offset = (y % 16 === 0) ? 4 : 0;
      for (let x = offset; x < width; x += 20) {
        bg.lineBetween(x, y, x + 10, y);
      }
    }
    
    // Top dark vignette
    bg.fillStyle(0x000000, 0.4);
    bg.fillRect(0, 0, width, 80);
    bg.fillStyle(0x000000, 0.2);
    bg.fillRect(0, 80, width, 60);
    
    // Bottom dark vignette
    bg.fillStyle(0x000000, 0.4);
    bg.fillRect(0, height - 60, width, 60);
    bg.fillStyle(0x000000, 0.2);
    bg.fillRect(0, height - 100, width, 40);
  }

  /**
   * Draw decorative 3D border frame around content
   */
  private drawDecorativeFrame(width: number, height: number): void {
    const frame = this.add.graphics();
    frame.setDepth(5);
    
    const padding = 60;
    const frameWidth = width - padding * 2;
    const frameHeight = height - padding * 2;
    const x = padding;
    const y = padding;
    
    // Outer shadow
    frame.fillStyle(0x000000, 0.5);
    frame.fillRoundedRect(x + 8, y + 8, frameWidth, frameHeight, 20);
    
    // Dark outer edge (3D depth)
    frame.fillStyle(0x1a0a00, 1);
    frame.fillRoundedRect(x, y, frameWidth, frameHeight, 20);
    
    // Main frame border
    frame.lineStyle(6, 0x8b6914, 1);
    frame.strokeRoundedRect(x + 4, y + 4, frameWidth - 8, frameHeight - 8, 18);
    
    // Inner gold line
    frame.lineStyle(2, 0xd4a574, 1);
    frame.strokeRoundedRect(x + 12, y + 12, frameWidth - 24, frameHeight - 24, 14);
    
    // Inner shadow line
    frame.lineStyle(1, 0x4a3520, 0.5);
    frame.strokeRoundedRect(x + 18, y + 18, frameWidth - 36, frameHeight - 36, 12);
    
    // Corner ornaments
    const corners = [
      { cx: x + 25, cy: y + 25 },
      { cx: x + frameWidth - 25, cy: y + 25 },
      { cx: x + 25, cy: y + frameHeight - 25 },
      { cx: x + frameWidth - 25, cy: y + frameHeight - 25 }
    ];
    
    corners.forEach(c => {
      // Outer gold circle
      frame.fillStyle(0xd4a574, 1);
      frame.fillCircle(c.cx, c.cy, 15);
      // Inner dark circle
      frame.fillStyle(0x6b4914, 1);
      frame.fillCircle(c.cx, c.cy, 10);
      // Center jewel
      frame.fillStyle(0xffd700, 1);
      frame.fillCircle(c.cx, c.cy, 5);
      // Jewel highlight
      frame.fillStyle(0xfffacd, 0.7);
      frame.fillCircle(c.cx - 1, c.cy - 1, 2);
    });
    
    // Side decorative elements
    // Top center ornament
    this.drawOrnament(frame, width / 2, y + 15, true);
    // Bottom center ornament
    this.drawOrnament(frame, width / 2, y + frameHeight - 15, true);
    // Left center ornament
    this.drawOrnament(frame, x + 15, height / 2, false);
    // Right center ornament
    this.drawOrnament(frame, x + frameWidth - 15, height / 2, false);
  }

  /**
   * Draw a decorative ornament
   */
  private drawOrnament(graphics: Phaser.GameObjects.Graphics, x: number, y: number, horizontal: boolean): void {
    const size = 40;
    
    // Main diamond shape
    graphics.fillStyle(0xd4a574, 1);
    if (horizontal) {
      graphics.beginPath();
      graphics.moveTo(x - size, y);
      graphics.lineTo(x, y - 8);
      graphics.lineTo(x + size, y);
      graphics.lineTo(x, y + 8);
      graphics.closePath();
      graphics.fillPath();
    } else {
      graphics.beginPath();
      graphics.moveTo(x, y - size);
      graphics.lineTo(x + 8, y);
      graphics.lineTo(x, y + size);
      graphics.lineTo(x - 8, y);
      graphics.closePath();
      graphics.fillPath();
    }
    
    // Inner accent
    graphics.fillStyle(0xffd700, 0.8);
    graphics.fillCircle(x, y, 6);
    graphics.fillStyle(0xfffacd, 0.6);
    graphics.fillCircle(x - 1, y - 1, 3);
  }

  /**
   * Draw desert-themed decorations
   */
  private drawDesertDecorations(width: number, height: number): void {
    this.decorations = this.add.graphics();
    this.decorations.setDepth(10);
    
    // Draw pyramids silhouette at bottom
    this.drawPyramidSilhouette(this.decorations, 150, height - 100, 80);
    this.drawPyramidSilhouette(this.decorations, 250, height - 100, 50);
    this.drawPyramidSilhouette(this.decorations, width - 180, height - 100, 90);
    this.drawPyramidSilhouette(this.decorations, width - 280, height - 100, 55);
    
    // Draw palm tree silhouettes
    this.drawPalmSilhouette(this.decorations, 100, height - 95);
    this.drawPalmSilhouette(this.decorations, width - 100, height - 95);
    this.drawPalmSilhouette(this.decorations, 320, height - 95);
    this.drawPalmSilhouette(this.decorations, width - 320, height - 95);
    
    // Draw stars in top area
    this.drawStars(this.decorations, width, 150);
    
    // Draw moon
    this.drawMoon(this.decorations, width - 180, 130);
    
    // Draw flying birds/scarabs
    this.drawScarabDecoration(this.decorations, width / 2 - 200, 180);
    this.drawScarabDecoration(this.decorations, width / 2 + 200, 180);
    
    // Draw cacti on sides
    this.drawCactus(this.decorations, 130, height / 2 - 60);
    this.drawCactus(this.decorations, width - 130, height / 2 - 60);
    
    // Draw rocks and stones
    this.drawRocks(this.decorations, 120, height / 2 + 60);
    this.drawRocks(this.decorations, width - 120, height / 2 + 60);
    this.drawRocks(this.decorations, 140, height / 2 + 120);
    this.drawRocks(this.decorations, width - 140, height / 2 + 120);
  }

  /**
   * Draw pyramid silhouette
   */
  private drawPyramidSilhouette(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
    g.fillStyle(0x2a1a08, 0.8);
    g.beginPath();
    g.moveTo(x - size, y);
    g.lineTo(x, y - size * 0.8);
    g.lineTo(x + size, y);
    g.closePath();
    g.fillPath();
    
    // Highlight edge
    g.lineStyle(1, 0x4a3520, 0.5);
    g.lineBetween(x, y - size * 0.8, x + size, y);
  }

  /**
   * Draw palm tree silhouette
   */
  private drawPalmSilhouette(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0x1a0a00, 0.9);
    
    // Trunk
    g.fillRect(x - 3, y - 40, 6, 45);
    
    // Fronds
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i - 2) * 0.4;
      const length = 25;
      g.lineStyle(3, 0x1a0a00, 0.9);
      g.beginPath();
      g.moveTo(x, y - 40);
      g.lineTo(x + Math.cos(angle) * length, y - 40 + Math.sin(angle) * length);
      g.strokePath();
    }
  }

  /**
   * Draw stars
   */
  private drawStars(g: Phaser.GameObjects.Graphics, width: number, maxY: number): void {
    const starPositions = [
      { x: 100, y: 100 }, { x: 200, y: 80 }, { x: 350, y: 110 },
      { x: 500, y: 90 }, { x: 650, y: 105 }, { x: 800, y: 85 },
      { x: width - 100, y: 100 }, { x: width - 200, y: 85 },
      { x: width - 350, y: 95 }, { x: width - 500, y: 110 }
    ];
    
    starPositions.forEach(pos => {
      const size = 1 + Math.random() * 2;
      const alpha = 0.4 + Math.random() * 0.4;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(pos.x, pos.y, size);
      
      // Star glow
      g.fillStyle(0xffd700, alpha * 0.3);
      g.fillCircle(pos.x, pos.y, size + 2);
    });
  }

  /**
   * Draw crescent moon
   */
  private drawMoon(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Moon glow
    g.fillStyle(0xffd700, 0.1);
    g.fillCircle(x, y, 40);
    g.fillStyle(0xffd700, 0.15);
    g.fillCircle(x, y, 30);
    
    // Main moon
    g.fillStyle(0xffeedd, 0.9);
    g.fillCircle(x, y, 20);
    
    // Crescent shadow
    g.fillStyle(0x1a0a00, 1);
    g.fillCircle(x + 8, y - 2, 16);
  }

  /**
   * Draw scarab decoration
   */
  private drawScarabDecoration(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xffd700, 0.6);
    g.fillEllipse(x, y, 20, 14);
    g.fillStyle(0xc9a86c, 0.8);
    g.fillEllipse(x, y - 2, 16, 10);
    g.fillStyle(0xffd700, 0.4);
    g.fillCircle(x, y - 2, 4);
  }

  /**
   * Draw cactus
   */
  private drawCactus(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Main stem
    g.fillStyle(0x2d5a1e, 0.85);
    g.fillRoundedRect(x - 8, y - 40, 16, 60, 6);
    
    // Left arm
    g.fillRoundedRect(x - 28, y - 20, 20, 12, 5);
    g.fillRoundedRect(x - 28, y - 35, 12, 20, 5);
    
    // Right arm
    g.fillRoundedRect(x + 8, y - 10, 20, 12, 5);
    g.fillRoundedRect(x + 16, y - 30, 12, 25, 5);
    
    // Highlights
    g.fillStyle(0x4a8a3a, 0.5);
    g.fillRoundedRect(x - 5, y - 38, 4, 55, 3);
    g.fillRoundedRect(x - 25, y - 33, 4, 15, 2);
    g.fillRoundedRect(x + 19, y - 28, 4, 20, 2);
    
    // Spines (small dots)
    g.fillStyle(0xc9a86c, 0.6);
    for (let i = 0; i < 5; i++) {
      g.fillCircle(x - 8, y - 35 + i * 12, 1);
      g.fillCircle(x + 8, y - 35 + i * 12, 1);
    }
  }

  /**
   * Draw rocks and stones
   */
  private drawRocks(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Large rock
    g.fillStyle(0x4a3a2a, 0.9);
    g.beginPath();
    g.moveTo(x - 20, y + 10);
    g.lineTo(x - 15, y - 8);
    g.lineTo(x - 5, y - 15);
    g.lineTo(x + 8, y - 12);
    g.lineTo(x + 18, y - 5);
    g.lineTo(x + 20, y + 10);
    g.closePath();
    g.fillPath();
    
    // Rock highlight
    g.fillStyle(0x6a5a4a, 0.7);
    g.beginPath();
    g.moveTo(x - 12, y - 5);
    g.lineTo(x - 5, y - 12);
    g.lineTo(x + 5, y - 10);
    g.lineTo(x, y - 2);
    g.closePath();
    g.fillPath();
    
    // Medium rock
    g.fillStyle(0x3a2a1a, 0.85);
    g.beginPath();
    g.moveTo(x + 15, y + 10);
    g.lineTo(x + 20, y);
    g.lineTo(x + 30, y - 3);
    g.lineTo(x + 35, y + 5);
    g.lineTo(x + 32, y + 10);
    g.closePath();
    g.fillPath();
    
    // Small pebbles
    g.fillStyle(0x5a4a3a, 0.8);
    g.fillCircle(x - 25, y + 8, 4);
    g.fillCircle(x + 40, y + 7, 3);
    g.fillStyle(0x4a3a2a, 0.7);
    g.fillCircle(x - 28, y + 5, 2);
  }

  /**
   * Create the title with oriental/Egyptian styling
   */
  private createTitle(width: number, height: number): void {
    // Title shadow
    const titleShadow = this.add.text(width / 2 + 4, 165, 'Desert Guardians', {
      fontFamily: 'Papyrus, Copperplate, Georgia, serif',
      fontSize: '80px',
      color: '#000000'
    }).setOrigin(0.5).setDepth(19).setAlpha(0.5);

    // Main title
    const title = this.add.text(width / 2, 160, 'Desert Guardians', {
      fontFamily: 'Papyrus, Copperplate, Georgia, serif',
      fontSize: '80px',
      color: '#ffd700',
      stroke: '#8b4513',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(20);
    
    // Add shimmer effect
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.85 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Decorative lines under title
    const titleDeco = this.add.graphics();
    titleDeco.setDepth(19);
    
    // Center line
    titleDeco.lineStyle(3, 0xd4a574, 1);
    titleDeco.lineBetween(width / 2 - 180, 215, width / 2 + 180, 215);
    
    // Side ornaments
    titleDeco.fillStyle(0xffd700, 1);
    titleDeco.fillCircle(width / 2 - 190, 215, 6);
    titleDeco.fillCircle(width / 2 + 190, 215, 6);
    titleDeco.fillStyle(0xd4a574, 1);
    titleDeco.fillCircle(width / 2 - 190, 215, 3);
    titleDeco.fillCircle(width / 2 + 190, 215, 3);
    
    // Smaller accent lines
    titleDeco.lineStyle(1, 0x8b6914, 0.8);
    titleDeco.lineBetween(width / 2 - 150, 225, width / 2 + 150, 225);

    // Subtitle
    const subtitle = this.add.text(width / 2, 255, '~ Tower Defense ~', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#c9a86c',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(20);
  }

  /**
   * Create styled menu buttons
   */
  private createMenuButtons(width: number, height: number): void {
    const buttonY = height / 2 + 40;
    
    // Start Game button (larger, centered)
    this.createStyledButton(
      width / 2, buttonY,
      'START', 
      220, 65,
      true,
      () => {
        this.audioManager.playSFX('ui_click');
        this.startGame();
      }
    );

    // Highscores and Settings buttons (smaller, side by side)
    const bottomY = buttonY + 100;
    const spacing = 160;
    
    this.createStyledButton(
      width / 2 - spacing, bottomY,
      '🏆  SCORES',
      180, 50,
      false,
      () => {
        this.audioManager.playSFX('ui_click');
        this.showHighscores();
      }
    );

    this.createStyledButton(
      width / 2 + spacing, bottomY,
      '⚙  SETTINGS',
      180, 50,
      false,
      () => {
        this.audioManager.playSFX('ui_click');
        this.showSettings();
      }
    );
  }

  /**
   * Create a styled button with 3D effect
   */
  private createStyledButton(
    x: number, y: number, 
    text: string, 
    btnWidth: number, btnHeight: number,
    isPrimary: boolean,
    onClick: () => void
  ): void {
    const btnGraphics = this.add.graphics();
    btnGraphics.setDepth(25);
    
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      btnGraphics.clear();
      
      const offsetY = pressed ? 2 : 0;
      
      // 3D shadow
      if (!pressed) {
        btnGraphics.fillStyle(0x000000, 0.5);
        btnGraphics.fillRoundedRect(x - btnWidth/2 + 4, y - btnHeight/2 + 4, btnWidth, btnHeight, 12);
      }
      
      // Bottom edge (3D depth)
      btnGraphics.fillStyle(isPrimary ? 0x6b4914 : 0x4a3520, 1);
      btnGraphics.fillRoundedRect(x - btnWidth/2, y - btnHeight/2 + 4 + offsetY, btnWidth, btnHeight, 12);
      
      // Main button body
      const baseColor = isPrimary 
        ? (hover ? 0xd4a574 : 0xc49564)
        : (hover ? 0x8b6914 : 0x6b4914);
      btnGraphics.fillStyle(baseColor, 1);
      btnGraphics.fillRoundedRect(x - btnWidth/2, y - btnHeight/2 + offsetY, btnWidth, btnHeight - 4, 12);
      
      // Top highlight
      const highlightColor = isPrimary 
        ? (hover ? 0xebd4a4 : 0xd4b584)
        : (hover ? 0xa08050 : 0x8b6914);
      btnGraphics.fillStyle(highlightColor, 0.6);
      btnGraphics.fillRoundedRect(x - btnWidth/2 + 4, y - btnHeight/2 + 4 + offsetY, btnWidth - 8, btnHeight/3, 8);
      
      // Border
      const borderColor = isPrimary ? 0xffd700 : 0xd4a574;
      btnGraphics.lineStyle(2, borderColor, 1);
      btnGraphics.strokeRoundedRect(x - btnWidth/2, y - btnHeight/2 + offsetY, btnWidth, btnHeight - 4, 12);
      
      // Inner border
      btnGraphics.lineStyle(1, hover ? 0xffd700 : 0x8b6914, 0.5);
      btnGraphics.strokeRoundedRect(x - btnWidth/2 + 3, y - btnHeight/2 + 3 + offsetY, btnWidth - 6, btnHeight - 10, 10);
      
      // Corner gems for primary button
      if (isPrimary) {
        const gemY = y - btnHeight/2 + 12;
        btnGraphics.fillStyle(0xffd700, 1);
        btnGraphics.fillCircle(x - btnWidth/2 + 16, gemY + offsetY, 4);
        btnGraphics.fillCircle(x + btnWidth/2 - 16, gemY + offsetY, 4);
        btnGraphics.fillStyle(0xfffacd, 0.8);
        btnGraphics.fillCircle(x - btnWidth/2 + 15, gemY - 1 + offsetY, 2);
        btnGraphics.fillCircle(x + btnWidth/2 - 17, gemY - 1 + offsetY, 2);
      }
    };
    
    drawButton(false);
    
    // Button text
    const fontSize = isPrimary ? '26px' : '18px';
    const btnText = this.add.text(x, y - 2, text, {
      fontFamily: 'Georgia, serif',
      fontSize: fontSize,
      color: '#fff8dc',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: isPrimary ? 3 : 2
    }).setOrigin(0.5).setDepth(26);
    
    // Hit area
    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setDepth(27).setInteractive({ useHandCursor: true });
    
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
      onClick();
    });
  }

  private startGame(): void {
    console.log('MenuScene: Starting game...');
    this.scene.start('GameScene');
  }

  private showHighscores(): void {
    // If already showing, close it
    if (this.highscoreContainer) {
      this.closeHighscores();
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.highscoreContainer = this.add.container(width / 2, height / 2);
    this.highscoreContainer.setDepth(100);
    
    // Background panel with 3D effect
    const bg = this.add.graphics();
    
    // Outer shadow
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-355, -245, 720, 500, 18);
    
    // Main panel body
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-360, -250, 720, 500, 16);
    
    // 3D edge effect (bottom/right darker)
    bg.lineStyle(4, 0x0a0400, 1);
    bg.strokeRoundedRect(-360, -250, 720, 500, 16);
    
    // Inner glow edge
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-355, -245, 710, 490, 14);
    
    // Inner border
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-350, -240, 700, 480, 12);
    
    // Corner decorations
    this.drawModalCorner(bg, -350, -240);
    this.drawModalCorner(bg, 350, -240);
    this.drawModalCorner(bg, -350, 240);
    this.drawModalCorner(bg, 350, 240);
    
    this.highscoreContainer.add(bg);
    
    // Title with decorative styling
    const titleShadow = this.add.text(2, -218, '🏆  HIGHSCORES  🏆', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.5);
    this.highscoreContainer.add(titleShadow);
    
    const title = this.add.text(0, -220, '🏆  HIGHSCORES  🏆', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#ffd700',
      stroke: '#4a3520',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.highscoreContainer.add(title);
    
    // Decorative line under title
    const titleLine = this.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-180, -190, 180, -190);
    titleLine.fillStyle(0xffd700, 1);
    titleLine.fillCircle(-190, -190, 4);
    titleLine.fillCircle(190, -190, 4);
    this.highscoreContainer.add(titleLine);
    
    // Load highscores
    const highscores = this.loadHighscores();
    
    if (highscores.length === 0) {
      const noScores = this.add.text(0, 0, 'No highscores yet!\nPlay a game to set the first record.', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#888888',
        align: 'center'
      }).setOrigin(0.5);
      this.highscoreContainer.add(noScores);
    } else {
      // Header row
      const headerY = -170;
      const headers = [
        { text: '#', x: -320 },
        { text: 'Name', x: -260 },
        { text: 'Score', x: -80 },
        { text: 'Wave', x: 30 },
        { text: 'HP', x: 110 },
        { text: 'Time', x: 170 },
        { text: 'Date', x: 250 }
      ];
      
      headers.forEach(h => {
        const headerText = this.add.text(h.x, headerY, h.text, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#c9a86c'
        }).setOrigin(h.text === '#' ? 0.5 : 0, 0.5);
        this.highscoreContainer!.add(headerText);
      });
      
      // Separator line
      const sepLine = this.add.graphics();
      sepLine.lineStyle(1, 0x4a3520, 1);
      sepLine.lineBetween(-330, headerY + 20, 330, headerY + 20);
      this.highscoreContainer.add(sepLine);
      
      // Score rows
      const rowHeight = 35;
      const startY = headerY + 45;
      
      highscores.slice(0, 10).forEach((score, index) => {
        const y = startY + index * rowHeight;
        const isTop3 = index < 3;
        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
        const rankColor = isTop3 ? rankColors[index] : '#888888';
        
        // Rank
        const rank = this.add.text(-320, y, `${index + 1}`, {
          fontFamily: 'Arial Black',
          fontSize: '18px',
          color: rankColor
        }).setOrigin(0.5, 0.5);
        this.highscoreContainer!.add(rank);
        
        // Name
        const name = this.add.text(-260, y, this.truncateName(score.playerName, 10), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(name);
        
        // Score
        const scoreText = this.add.text(-80, y, score.score.toLocaleString(), {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: isTop3 ? '#ffd700' : '#ffcc44'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(scoreText);
        
        // Wave - use totalWaves from score if available, fallback to 35
        const totalWaves = score.totalWaves || 35;
        const isVictory = score.waveReached >= totalWaves;
        const wave = this.add.text(30, y, `${score.waveReached}/${totalWaves}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: isVictory ? '#00ff00' : '#aaaaaa'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(wave);
        
        // HP left
        const hpLeft = score.runStats?.hpLeft ?? 0;
        const hpText = this.add.text(110, y, `${hpLeft}❤️`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: hpLeft > 0 ? '#ff6666' : '#666666'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(hpText);
        
        // Time
        const timeSeconds = score.runStats?.timeSeconds ?? 0;
        const timeStr = this.formatTime(timeSeconds);
        const timeText = this.add.text(170, y, timeStr, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#88ccff'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(timeText);
        
        // Date
        const dateStr = this.formatDate(score.date);
        const dateText = this.add.text(250, y, dateStr, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#666666'
        }).setOrigin(0, 0.5);
        this.highscoreContainer!.add(dateText);
      });
    }
    
    // Close button with styled design
    const closeBtn = this.createModalButton(0, 210, '✕  CLOSE', 140, 45);
    closeBtn.hitArea.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.closeHighscores();
    });
    
    this.highscoreContainer.add(closeBtn.container);
    
    // Fade in animation
    this.highscoreContainer.setAlpha(0);
    this.tweens.add({
      targets: this.highscoreContainer,
      alpha: 1,
      duration: 200
    });
  }

  private closeHighscores(): void {
    if (this.highscoreContainer) {
      this.tweens.add({
        targets: this.highscoreContainer,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.highscoreContainer?.destroy();
          this.highscoreContainer = null;
        }
      });
    }
  }

  private loadHighscores(): Highscore[] {
    try {
      const data = localStorage.getItem(HIGHSCORES_KEY);
      if (data) {
        return JSON.parse(data) as Highscore[];
      }
    } catch (e) {
      console.warn('Failed to load highscores:', e);
    }
    return [];
  }

  private truncateName(name: string, maxLength: number): string {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 1) + '…';
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Show settings modal with volume controls
   */
  private showSettings(): void {
    // If already showing, close it
    if (this.settingsContainer) {
      this.closeSettings();
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.settingsContainer = this.add.container(width / 2, height / 2);
    this.settingsContainer.setDepth(100);
    
    // Background panel with 3D effect
    const bg = this.add.graphics();
    
    // Outer shadow
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-195, -145, 400, 300, 18);
    
    // Main panel body
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-200, -150, 400, 300, 16);
    
    // 3D edge effect
    bg.lineStyle(4, 0x0a0400, 1);
    bg.strokeRoundedRect(-200, -150, 400, 300, 16);
    
    // Inner glow edge
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-195, -145, 390, 290, 14);
    
    // Inner border
    bg.lineStyle(1, 0x8b6914, 0.6);
    bg.strokeRoundedRect(-190, -140, 380, 280, 12);
    
    // Corner decorations
    this.drawModalCorner(bg, -190, -140);
    this.drawModalCorner(bg, 190, -140);
    this.drawModalCorner(bg, -190, 140);
    this.drawModalCorner(bg, 190, 140);
    
    this.settingsContainer.add(bg);
    
    // Title with decorative styling
    const titleShadow = this.add.text(2, -118, '⚙  SETTINGS', {
      fontFamily: 'Georgia, serif',
      fontSize: '30px',
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.5);
    this.settingsContainer.add(titleShadow);
    
    const title = this.add.text(0, -120, '⚙  SETTINGS', {
      fontFamily: 'Georgia, serif',
      fontSize: '30px',
      color: '#ffd700',
      stroke: '#4a3520',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.settingsContainer.add(title);
    
    // Decorative line under title
    const titleLine = this.add.graphics();
    titleLine.lineStyle(2, 0xd4a574, 0.8);
    titleLine.lineBetween(-120, -90, 120, -90);
    titleLine.fillStyle(0xffd700, 1);
    titleLine.fillCircle(-130, -90, 4);
    titleLine.fillCircle(130, -90, 4);
    this.settingsContainer.add(titleLine);
    
    // BGM Volume
    this.createVolumeSlider('Music', -40, this.audioManager.getBGMVolume(), (value) => {
      this.audioManager.setBGMVolume(value);
    });
    
    // SFX Volume  
    this.createVolumeSlider('Effects', 30, this.audioManager.getSFXVolume(), (value) => {
      this.audioManager.setSFXVolume(value);
    });
    
    // Close button with styled design
    const closeBtn = this.createModalButton(0, 110, '✕  CLOSE', 140, 45);
    closeBtn.hitArea.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.closeSettings();
    });
    
    this.settingsContainer.add(closeBtn.container);
    
    // Fade in animation
    this.settingsContainer.setAlpha(0);
    this.tweens.add({
      targets: this.settingsContainer,
      alpha: 1,
      duration: 200
    });
  }

  /**
   * Draw corner decoration for modals
   */
  private drawModalCorner(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xd4a574, 1);
    g.fillCircle(x, y, 8);
    g.fillStyle(0x8b6914, 1);
    g.fillCircle(x, y, 5);
    g.fillStyle(0xffd700, 1);
    g.fillCircle(x, y, 2);
  }

  /**
   * Create a styled button for modals
   */
  private createModalButton(x: number, y: number, text: string, btnWidth: number, btnHeight: number): { container: Phaser.GameObjects.Container, hitArea: Phaser.GameObjects.Rectangle } {
    const container = this.add.container(0, 0);
    const btnGraphics = this.add.graphics();
    
    const drawButton = (hover: boolean, pressed: boolean = false) => {
      btnGraphics.clear();
      const offsetY = pressed ? 2 : 0;
      
      // Shadow
      if (!pressed) {
        btnGraphics.fillStyle(0x000000, 0.4);
        btnGraphics.fillRoundedRect(x - btnWidth/2 + 3, y - btnHeight/2 + 3, btnWidth, btnHeight, 10);
      }
      
      // Bottom edge
      btnGraphics.fillStyle(0x4a3520, 1);
      btnGraphics.fillRoundedRect(x - btnWidth/2, y - btnHeight/2 + 3 + offsetY, btnWidth, btnHeight, 10);
      
      // Main body
      const baseColor = hover ? 0x8b6914 : 0x6b4914;
      btnGraphics.fillStyle(baseColor, 1);
      btnGraphics.fillRoundedRect(x - btnWidth/2, y - btnHeight/2 + offsetY, btnWidth, btnHeight - 3, 10);
      
      // Top highlight
      btnGraphics.fillStyle(hover ? 0xa08050 : 0x8b6914, 0.5);
      btnGraphics.fillRoundedRect(x - btnWidth/2 + 3, y - btnHeight/2 + 3 + offsetY, btnWidth - 6, btnHeight/3, 8);
      
      // Border
      btnGraphics.lineStyle(2, 0xd4a574, 1);
      btnGraphics.strokeRoundedRect(x - btnWidth/2, y - btnHeight/2 + offsetY, btnWidth, btnHeight - 3, 10);
    };
    
    drawButton(false);
    container.add(btnGraphics);
    
    const btnText = this.add.text(x, y - 2, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#fff8dc',
      fontStyle: 'bold',
      stroke: '#4a3520',
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(btnText);
    
    const hitArea = this.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
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
    });
    
    return { container, hitArea };
  }

  /**
   * Create a volume slider control
   */
  private createVolumeSlider(label: string, y: number, initialValue: number, onChange: (value: number) => void): void {
    if (!this.settingsContainer) return;
    
    // Label
    const labelText = this.add.text(-150, y, label + ':', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#c9a86c'
    }).setOrigin(0, 0.5);
    this.settingsContainer.add(labelText);
    
    // Slider track
    const trackWidth = 200;
    const trackHeight = 8;
    const trackX = -50;
    
    const track = this.add.graphics();
    track.fillStyle(0x2a1a08, 1);
    track.fillRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    track.lineStyle(1, 0x4a3520, 1);
    track.strokeRoundedRect(trackX, y - trackHeight / 2, trackWidth, trackHeight, 4);
    this.settingsContainer.add(track);
    
    // Filled portion
    const fill = this.add.graphics();
    this.settingsContainer.add(fill);
    
    // Slider handle
    const handle = this.add.graphics();
    handle.fillStyle(0xd4a574, 1);
    handle.fillCircle(0, 0, 12);
    handle.lineStyle(2, 0xffd700, 1);
    handle.strokeCircle(0, 0, 12);
    handle.setPosition(trackX + initialValue * trackWidth, y);
    handle.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    handle.input!.cursor = 'pointer';
    this.settingsContainer.add(handle);
    
    // Value text
    const valueText = this.add.text(trackX + trackWidth + 20, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.settingsContainer.add(valueText);
    
    // Update fill
    const updateFill = (value: number) => {
      fill.clear();
      fill.fillStyle(0xd4a574, 1);
      fill.fillRoundedRect(trackX, y - trackHeight / 2, value * trackWidth, trackHeight, 4);
    };
    updateFill(initialValue);
    
    // Drag handling
    let isDragging = false;
    
    handle.on('pointerdown', () => {
      isDragging = true;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!isDragging || !this.settingsContainer) return;
      
      // Convert to container-local coordinates
      const localX = pointer.x - this.settingsContainer.x;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
    });
    
    // Click on track to jump
    const trackHitArea = this.add.rectangle(trackX + trackWidth / 2, y, trackWidth, 30, 0x000000, 0);
    trackHitArea.setInteractive({ useHandCursor: true });
    this.settingsContainer.add(trackHitArea);
    
    trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.settingsContainer) return;
      const localX = pointer.x - this.settingsContainer.x;
      const clampedX = Phaser.Math.Clamp(localX, trackX, trackX + trackWidth);
      const value = (clampedX - trackX) / trackWidth;
      
      handle.setX(clampedX);
      valueText.setText(`${Math.round(value * 100)}%`);
      updateFill(value);
      onChange(value);
      this.audioManager.playSFX('ui_click');
    });
  }

  /**
   * Close settings modal
   */
  private closeSettings(): void {
    if (this.settingsContainer) {
      this.tweens.add({
        targets: this.settingsContainer,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.settingsContainer?.destroy();
          this.settingsContainer = null;
        }
      });
    }
  }
}
