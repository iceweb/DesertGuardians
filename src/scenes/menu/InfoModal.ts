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
            'Castle HP: 25 — lose it all, game over.',
            'Regular enemies deal 1 damage if leaked.',
            'Bosses deal 2 damage — stop them!',
          ],
        },
        {
          title: '🎮 HOW TO PLAY',
          content: [
            'Click empty tile → Build menu appears',
            'Click tower → Upgrade/Sell/Ability',
            'Towers auto-target enemies in range',
            'Press SPACE or ▶ to start waves',
          ],
        },
        // RIGHT COLUMN
        {
          title: '💰 ECONOMY',
          content: [
            'Start: 200g Normal, 250g Easy, 150g Hard',
            'Earn gold by killing enemies',
            'Build Gold Mines for passive income',
            'Sell towers for 60% refund',
          ],
        },
        {
          title: '🏆 SCORING',
          content: [
            '+100 per wave | +0.2 per gold earned',
            '+100 per HP remaining at end',
            'Time Bonus: +1.5 pts/sec under 80min',
            'Difficulty: Easy×0.75 | Hard×1.25',
          ],
        },
      ],
      // PAGE 2: YOUR ARSENAL - Tower types
      [
        // LEFT COLUMN
        {
          title: '🏹 PHYSICAL TOWERS',
          content: [
            'Archer — Fast, cheap, +200% vs flying',
            'Rapid Fire — Very fast, lower damage',
            'Sniper — Longest range, huge damage',
            'Cannon — Splash 70-110px, ground only',
          ],
        },
        {
          title: '🔮 MAGIC TOWERS',
          content: [
            'Ice — Slows enemies, 80% armor pen',
            'Poison — DoT, 80% armor pen, no air',
            'Magic uses only 20% of armor!',
            'Essential vs high-armor Tanks.',
          ],
        },
        // RIGHT COLUMN
        {
          title: '✨ AURA TOWER',
          content: [
            'Buffs ALL towers in its range',
            'Does not attack directly',
            'Choose: +Dmg, +Crit, or +Echo',
            'Position to buff multiple towers!',
          ],
        },
        {
          title: '⚔️ ARMOR FORMULA',
          content: [
            'Physical: dmg × 100/(100+armor)',
            '50 armor = 33% reduction',
            '100 armor = 50% reduction',
            'Magic: Uses only 20% of armor!',
          ],
        },
      ],
      // PAGE 3: ENEMIES & BOSSES
      [
        // LEFT COLUMN
        {
          title: '👾 COMMON ENEMIES',
          content: [
            'Furball — Standard, no tricks',
            'Runner — Fast but fragile',
            'Tank — Slow, high armor & HP',
            'Shielded — Blocks first 3 hits',
            'Jumper — Leaps forward in bursts',
          ],
        },
        {
          title: '👻 SPECIAL ENEMIES',
          content: [
            'Flying — Immune to Cannon & Poison',
            'Digger — Burrows, briefly untargetable',
            'Ghost — Phases out when hit',
            'Broodmother — Spawns babies on death',
          ],
        },
        // RIGHT COLUMN
        {
          title: '⚠️ HARD COUNTERS',
          content: [
            '🔥 Flame — ONLY Ice damages it!',
            '☣️ Plaguebearer — ONLY Poison works!',
            'Wrong towers = they walk through!',
            'Check wave preview before building.',
          ],
        },
        {
          title: '🐉 BOSS WAVES',
          content: [
            'Waves 11, 18, 25, 30, 35',
            'Deal 2 damage if leaked',
            'Dispel debuffs periodically',
            'Later bosses have elite guards',
          ],
        },
      ],
      // PAGE 4: PHYSICAL TOWER ABILITIES
      [
        // LEFT COLUMN
        {
          title: '💣 CANNON ABILITIES',
          content: [
            'Aftershock — 3 extra explosions',
            '  → 60% dmg each, delayed impact',
            'Tremor — 80 dmg zone + 30% slow',
            '  → Area denial, synergy with slows',
            'Shrapnel — 6 fragments (45% dmg)',
            '  → Best for clustered waves',
          ],
        },
        {
          title: '🎯 SNIPER ABILITIES',
          content: [
            'Critical Strike — 2× damage crits',
            '  → Huge burst, scales with Aura',
            'Armor Pierce — 80% armor pen',
            '  → Uses magic dmg path vs Tanks',
            'Headshot — Instant kill low HP',
            '  → Execute threshold 25% HP',
          ],
        },
        // RIGHT COLUMN
        {
          title: '⚡ RAPID FIRE ABILITIES',
          content: [
            'Bullet Storm — 2× speed, less dmg',
            '  → More procs, faster status apply',
            'Ricochet — Bounces to 1 extra target',
            '  → Spread damage in clusters',
            'Incendiary — Burn stacks (max 3×)',
            '  → 30 DPS at full stacks!',
          ],
        },
        {
          title: '🏹 ARCHER ABILITIES',
          content: [
            'Multi-Shot — Hits 3 targets at once',
            '  → Efficient vs swarms',
            'Piercing Arrow — Passes through +2',
            '  → Perfect for path chokes',
            'Heavy Arrows — Knockback enemies',
            '  → Buys time, 10% on bosses',
          ],
        },
      ],
      // PAGE 5: MAGIC & SUPPORT ABILITIES
      [
        // LEFT COLUMN
        {
          title: '❄️ ICE TOWER ABILITIES',
          content: [
            'Ice Trap — Freeze target 2s',
            '  → Stops enemy completely',
            'Frost Nova — Slows all nearby',
            '  → AoE 80px slow effect',
            'Deep Freeze — Brittle: +20% phys',
            '  → HUGE synergy with Snipers!',
          ],
        },
        {
          title: '☠️ POISON ABILITIES',
          content: [
            'Plague Spread — DoT spreads nearby',
            '  → Chain reaction in clusters',
            'Toxic Explosion — 80 dmg on death',
            '  → Finisher, clears weakened mobs',
            'Corrosive Acid — Stacking -5 armor',
            '  → Up to -25 armor! Tank shredder',
          ],
        },
        // RIGHT COLUMN
        {
          title: '✨ AURA ABILITIES',
          content: [
            'War Cry — +25% attack speed',
            '  → Best general-purpose buff',
            'Critical Aura — +15% crit chance',
            '  → Amazing with Snipers',
            'Echo Amplify — 10% double-shot',
            '  → Chance to fire twice!',
          ],
        },
        {
          title: '⚡ ABILITY UNLOCKS',
          content: [
            'Reach tower level 4 to unlock',
            'Choose ONE ability per tower',
            'Cannot change after selection!',
            'Plan your build carefully.',
          ],
        },
      ],
      // PAGE 6: SYNERGIES & PRO TIPS
      [
        // LEFT COLUMN
        {
          title: '🔥 POWER COMBOS',
          content: [
            'Deep Freeze + Snipers',
            '  → +20% physical damage boost',
            'Corrosive Acid + Cannons',
            '  → Strip armor, then AoE nuke',
            'Incendiary × 3 stacks',
            '  → 30 burn DPS melts everything',
          ],
        },
        {
          title: '💎 ADVANCED COMBOS',
          content: [
            'Echo Aura + Crit Sniper',
            '  → Double-shot crits = massive',
            'Tremor + Ice Trap',
            '  → Perma-slow kill zones',
            'Heavy Arrows + Frost Nova',
            '  → Knockback into freeze',
          ],
        },
        // RIGHT COLUMN
        {
          title: '💡 PRO TIPS',
          content: [
            'Build Gold Mines in wave 1-5',
            'Ice towers are ESSENTIAL for bosses',
            'Mix tower types for all threats',
            'Sell unused towers before bosses',
            'Aura placement affects many towers',
          ],
        },
        {
          title: '🎯 BOSS STRATEGY',
          content: [
            'Stack slows: Ice + Tremor combo',
            'Deep Freeze before Sniper burst',
            'Corrosive early to strip armor',
            'Save gold for emergency towers',
            'Knockback buys extra shot time',
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
