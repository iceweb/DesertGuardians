import Phaser from 'phaser';

export class CreepInfoPanel {
  private scene: Phaser.Scene;
  private creepInfoContainer: Phaser.GameObjects.Container | null = null;
  private autoHideTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /* eslint-disable max-lines-per-function */
  show(
    creepType: string,
    currentHP: number,
    maxHP: number,
    speed: number,
    armor: number,
    goldReward: number,
    x: number,
    y: number,
    hasShield?: boolean,
    shieldHitsRemaining?: number,
    canJump?: boolean
  ): void {
    this.hide();

    const popupX = x;
    const popupY = Math.max(100, y - 80);

    this.creepInfoContainer = this.scene.add.container(popupX, popupY);
    this.creepInfoContainer.setDepth(250);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a0a00, 0.95);
    bg.fillRoundedRect(-110, -50, 220, 100, 8);
    bg.lineStyle(2, 0xd4a574, 1);
    bg.strokeRoundedRect(-110, -50, 220, 100, 8);
    this.creepInfoContainer.add(bg);

    const typeColors: Record<string, string> = {
      furball: '#88cc88',
      runner: '#ffcc44',
      tank: '#888888',
      boss: '#ff4444',
      jumper: '#aa88ff',
      shielded: '#44ccff',
    };
    const typeColor = typeColors[creepType] || '#ffffff';
    const typeName = creepType.charAt(0).toUpperCase() + creepType.slice(1);

    const title = this.scene.add
      .text(0, -38, typeName, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: typeColor,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.creepInfoContainer.add(title);

    const hpPercent = currentHP / maxHP;
    const hpBarWidth = 180;
    const hpBarHeight = 12;

    const hpBarBg = this.scene.add.graphics();
    hpBarBg.fillStyle(0x333333, 1);
    hpBarBg.fillRoundedRect(-hpBarWidth / 2, -20, hpBarWidth, hpBarHeight, 3);
    this.creepInfoContainer.add(hpBarBg);

    const hpBarFill = this.scene.add.graphics();
    const hpColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    hpBarFill.fillStyle(hpColor, 1);
    hpBarFill.fillRoundedRect(
      -hpBarWidth / 2 + 2,
      -18,
      (hpBarWidth - 4) * hpPercent,
      hpBarHeight - 4,
      2
    );
    this.creepInfoContainer.add(hpBarFill);

    const hpText = this.scene.add
      .text(0, -14, `${Math.ceil(currentHP)} / ${maxHP}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.creepInfoContainer.add(hpText);

    const statsY = 5;
    const statSpacing = 55;

    const speedText = this.scene.add
      .text(-statSpacing, statsY, `⚡ ${speed}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffcc44',
      })
      .setOrigin(0.5);
    this.creepInfoContainer.add(speedText);

    const armorText = this.scene.add
      .text(0, statsY, `🛡️ ${armor}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);
    this.creepInfoContainer.add(armorText);

    const goldText = this.scene.add
      .text(statSpacing, statsY, `💰 ${goldReward}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffd700',
      })
      .setOrigin(0.5);
    this.creepInfoContainer.add(goldText);

    let specialText = '';
    if (hasShield && shieldHitsRemaining && shieldHitsRemaining > 0) {
      specialText += `🔵 Shield: ${shieldHitsRemaining} hits  `;
    }
    if (canJump) {
      specialText += '🦘 Can Jump';
    }

    if (specialText) {
      const special = this.scene.add
        .text(0, 28, specialText, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: '#44ccff',
        })
        .setOrigin(0.5);
      this.creepInfoContainer.add(special);
    }

    this.autoHideTimer = this.scene.time.delayedCall(3000, () => {
      this.hide();
    });
  }

  hide(): void {
    if (this.autoHideTimer) {
      this.autoHideTimer.destroy();
      this.autoHideTimer = null;
    }
    if (this.creepInfoContainer) {
      this.creepInfoContainer.destroy();
      this.creepInfoContainer = null;
    }
  }

  destroy(): void {
    this.hide();
  }
}
