import Phaser from 'phaser';
import { AudioManager } from '../../managers';
import { ModalButton } from './MenuButton';

interface InfoSection {
  title: string;
  content: string[];
}

/**
 * Info modal popup displaying game mechanics and rules
 */
export class InfoModal {
  private scene: Phaser.Scene;
  private audioManager: AudioManager;
  private container: Phaser.GameObjects.Container | null = null;
  private onClose: () => void;
  private currentPage: number = 0;
  private pages: InfoSection[][] = [];
  private contentContainer: Phaser.GameObjects.Container | null = null;
  private pageText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, audioManager: AudioManager, onClose: () => void) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.onClose = onClose;
    this.initializePages();
  }

  /* eslint-disable max-lines-per-function */
  private initializePages(): void {
    // Book-style manual: logical flow from basics to mastery
    this.pages = [
      // PAGE 1: GETTING STARTED - Goal, Controls, Economy
      [
        // LEFT COLUMN
        {
          title: '🏰 YOUR MISSION',
          content: [
            'Defend your castle through 35 waves!',
            'Castle HP: 25 — lose it all and game over.',
            'Regular enemies deal 1 damage if leaked.',
            'Bosses deal 2 damage — stop them at all costs!',
          ],
        },
        {
          title: '🎮 HOW TO PLAY',
          content: [
            'Click empty tile → Build menu appears',
            'Click tower → Upgrade/Sell/Ability options',
            'Towers auto-target enemies in range',
            'Press SPACE or click ▶ to start waves',
          ],
        },
        // RIGHT COLUMN
        {
          title: '💰 ECONOMY',
          content: [
            'Start with 200 gold on Normal difficulty',
            'Earn gold by killing enemies',
            'Build Gold Mines for passive income',
            'Sell towers for 60% refund',
          ],
        },
        {
          title: '🏆 SCORING',
          content: [
            '+100 points per wave completed',
            '+0.2 points per gold earned',
            '+100 points per HP remaining',
            'Time bonus ×1.0-1.35 (victory only)',
            'Difficulty: Easy ×0.75 | Hard ×1.25',
          ],
        },
      ],
      // PAGE 2: YOUR ARSENAL - All tower types explained
      [
        // LEFT COLUMN
        {
          title: '🗼 PHYSICAL TOWERS',
          content: [
            '🏹 Archer — Fast, cheap, +200% vs flying',
            '⚡ Rapid Fire — Extremely fast attacks',
            '🎯 Sniper — Longest range, highest damage',
            '💣 Cannon — Splash damage, ground only',
          ],
        },
        {
          title: '🔮 MAGIC TOWERS',
          content: [
            '❄️ Ice — Slows enemies, ignores armor',
            '☠️ Poison — DoT, ignores armor, ground only',
            'Magic damage bypasses ALL armor!',
            'Essential against high-armor Tanks.',
          ],
        },
        // RIGHT COLUMN
        {
          title: '✨ SUPPORT TOWER',
          content: [
            '✨ Aura — Buffs all towers in range',
            'Does not attack directly',
            'Choose: +Damage, +Crit, or +Multicast',
            'One Aura can buff multiple towers!',
          ],
        },
        {
          title: '⚔️ DAMAGE FORMULA',
          content: [
            'Physical: damage × 100/(100+armor)',
            '50 armor = 33% reduction',
            '100 armor = 50% reduction',
            '200 armor = 67% reduction',
            'Magic: Full damage always!',
          ],
        },
      ],
      // PAGE 3: KNOW YOUR ENEMY - All enemy types
      [
        // LEFT COLUMN
        {
          title: '👾 COMMON ENEMIES',
          content: [
            '🟤 Furball — Standard, no tricks',
            '🟡 Runner — Fast but low HP',
            '🔵 Tank — Slow, high armor & HP',
            '🟢 Shielded — Absorbs first 3 hits',
            '🟣 Jumper — Leaps forward in bursts',
          ],
        },
        {
          title: '👻 SPECIAL ENEMIES',
          content: [
            '🪽 Flying — Immune to Cannon & Poison',
            '🕳️ Digger — Burrows, briefly untargetable',
            '👻 Ghost — Phases out when damaged',
            '🕷️ Broodmother — Spawns babies on death',
          ],
        },
        // RIGHT COLUMN
        {
          title: '⚠️ COUNTER-PICKS',
          content: [
            '🔥 Flame — ONLY Ice towers work!',
            '☣️ Plaguebearer — ONLY Poison works!',
            'Build the right towers or they pass!',
            'Check wave preview before building.',
          ],
        },
        {
          title: '🐉 BOSS WAVES',
          content: [
            'Waves 11, 18, 25, 30, 35 have bosses',
            'Bosses deal 2 damage if leaked',
            'They dispel debuffs periodically',
            'Later bosses bring elite guards',
            'Focus fire and slow them down!',
          ],
        },
      ],
      // PAGE 4: MASTERY - Abilities and Synergies
      [
        // LEFT COLUMN
        {
          title: '⚡ TOWER ABILITIES',
          content: [
            'At level 4, each tower unlocks 3 abilities',
            'Choose ONE ability per tower',
            'Some trigger on hit, others are passive',
            'Abilities define your late-game strategy!',
          ],
        },
        {
          title: '💥 DAMAGE ABILITIES',
          content: [
            'Cannon: Aftershock/Tremor/Shrapnel',
            'Sniper: Critical/Pierce/Headshot',
            'Rapid: BulletStorm/Ricochet/Incendiary',
            'Archer: MultiShot/Piercing/HeavyArrows',
          ],
        },
        // RIGHT COLUMN
        {
          title: '🧊 DEBUFF ABILITIES',
          content: [
            'Ice: Trap/FrostNova/DeepFreeze',
            'Poison: Plague/Explosion/Corrosive',
            'Aura: +25%Dmg/+15%Crit/+10%Echo',
            'Debuffs stack with physical damage!',
          ],
        },
        {
          title: '🔥 POWER COMBOS',
          content: [
            'Deep Freeze → Snipers = +30% damage',
            'Corrosive Acid → Cannons = Tank killer',
            'Incendiary × 5 stacks = Massive DoT',
            'Echo Aura + Snipers = Double crits',
          ],
        },
      ],
    ];
  }

  isOpen(): boolean {
    return this.container !== null;
  }

  show(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(100);

    // Click blocker - wider for book layout
    const clickBlocker = this.scene.add.rectangle(0, 0, 920, 560, 0x000000, 0);
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

    // Content container for pages
    this.contentContainer = this.scene.add.container(0, 0);
    this.container.add(this.contentContainer);

    // Render first page
    this.renderPage();

    // Navigation buttons
    this.createNavigation();

    // Close button
    const closeBtn = new ModalButton(this.scene, 0, 230, '✕  CLOSE', 140, 45);
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
    // Shadow - wider book layout
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-445, -255, 900, 520, 18);

    // Main background
    bg.fillStyle(0x1a0a00, 0.98);
    bg.fillRoundedRect(-450, -260, 900, 520, 16);

    // Borders
    bg.lineStyle(4, 0x0a0400, 1);
    bg.strokeRoundedRect(-450, -260, 900, 520, 16);

    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-450, -260, 900, 520, 16);

    // Inner decorative border
    bg.lineStyle(1, 0x8b6914, 0.5);
    bg.strokeRoundedRect(-440, -250, 880, 500, 12);

    // Header separator
    bg.lineStyle(2, 0x8b6914, 0.8);
    bg.lineBetween(-390, -175, 390, -175);

    // Center spine (book binding effect)
    bg.lineStyle(2, 0x8b6914, 0.4);
    bg.lineBetween(0, -170, 0, 170);
  }

  private addTitle(): void {
    if (!this.container) return;

    const title = this.scene.add
      .text(0, -200, '📜 GAME INFO', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.container.add(title);
  }

  private renderPage(): void {
    if (!this.contentContainer) return;

    // Clear previous content
    this.contentContainer.removeAll(true);

    const page = this.pages[this.currentPage];
    const columnWidth = 380;
    const leftColumnX = -210;
    const rightColumnX = 210;

    // Split sections into left and right columns
    // First half goes left, second half goes right
    const halfPoint = Math.ceil(page.length / 2);
    const leftSections = page.slice(0, halfPoint);
    const rightSections = page.slice(halfPoint);

    // Render left column
    let yOffset = -150;
    for (const section of leftSections) {
      const titleText = this.scene.add
        .text(leftColumnX, yOffset, section.title, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
      this.contentContainer.add(titleText);

      yOffset += 26;

      for (const line of section.content) {
        const lineText = this.scene.add
          .text(leftColumnX, yOffset, line, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#e8d4b0',
            wordWrap: { width: columnWidth },
          })
          .setOrigin(0.5);
        this.contentContainer.add(lineText);
        yOffset += 20;
      }

      yOffset += 12;
    }

    // Render right column
    yOffset = -150;
    for (const section of rightSections) {
      const titleText = this.scene.add
        .text(rightColumnX, yOffset, section.title, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
      this.contentContainer.add(titleText);

      yOffset += 26;

      for (const line of section.content) {
        const lineText = this.scene.add
          .text(rightColumnX, yOffset, line, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#e8d4b0',
            wordWrap: { width: columnWidth },
          })
          .setOrigin(0.5);
        this.contentContainer.add(lineText);
        yOffset += 20;
      }

      yOffset += 12;
    }

    // Update page indicator
    if (this.pageText) {
      this.pageText.setText(`${this.currentPage + 1} / ${this.pages.length}`);
    }
  }

  private createNavigation(): void {
    if (!this.container) return;

    const navY = 185;

    // Previous button - wider spacing for book layout
    const prevBtn = this.scene.add
      .text(-200, navY, '◀  PREV', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#c9a86c',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    prevBtn.on('pointerover', () => prevBtn.setColor('#ffd700'));
    prevBtn.on('pointerout', () => prevBtn.setColor('#c9a86c'));
    prevBtn.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.prevPage();
    });
    this.container.add(prevBtn);

    // Page indicator
    this.pageText = this.scene.add
      .text(0, navY, `${this.currentPage + 1} / ${this.pages.length}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);
    this.container.add(this.pageText);

    // Next button - wider spacing for book layout
    const nextBtn = this.scene.add
      .text(200, navY, 'NEXT  ▶', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#c9a86c',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    nextBtn.on('pointerover', () => nextBtn.setColor('#ffd700'));
    nextBtn.on('pointerout', () => nextBtn.setColor('#c9a86c'));
    nextBtn.on('pointerdown', () => {
      this.audioManager.playSFX('ui_click');
      this.nextPage();
    });
    this.container.add(nextBtn);
  }

  private prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.renderPage();
    }
  }

  private nextPage(): void {
    if (this.currentPage < this.pages.length - 1) {
      this.currentPage++;
      this.renderPage();
    }
  }

  close(): void {
    if (!this.container) return;

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.container?.destroy();
        this.container = null;
        this.contentContainer = null;
        this.pageText = null;
        this.onClose();
      },
    });
  }
}
