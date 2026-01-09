import Phaser from 'phaser';

/**
 * Handles all visual effects for creeps (damage numbers, dust clouds, etc.)
 * Extracted from Creep.ts to reduce file size.
 */
export class CreepEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show poison damage number
   */
  showPoisonDamage(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y - 40, `-${damage}`, {
      fontSize: '14px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show burrow effect - dust cloud going down
   */
  showBurrowEffect(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dust = this.scene.add.graphics();
      dust.fillStyle(0x8B4513, 0.7);
      dust.fillCircle(0, 0, 3 + Math.random() * 3);
      dust.setPosition(x + Math.cos(angle) * 10, y + 10);
      dust.setDepth(25);
      
      this.scene.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * 5,
        y: y + 20,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        onComplete: () => dust.destroy()
      });
    }
  }

  /**
   * Show surface effect - dirt bursting up
   */
  showSurfaceEffect(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dirt = this.scene.add.graphics();
      dirt.fillStyle(0x8B4513, 0.8);
      dirt.fillCircle(0, 0, 4 + Math.random() * 4);
      dirt.setPosition(x, y + 15);
      dirt.setDepth(35);
      
      this.scene.tweens.add({
        targets: dirt,
        x: x + Math.cos(angle) * 40,
        y: y - 10 + Math.sin(angle) * 20,
        alpha: 0,
        scale: 1.5,
        duration: 500,
        onComplete: () => dirt.destroy()
      });
    }
  }

  /**
   * Show ghost phase activation
   */
  showGhostPhaseStart(x: number, y: number): void {
    const text = this.scene.add.text(x, y - 50, '👻 GHOST PHASE!', {
      fontSize: '14px',
      color: '#9370DB',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show immune text (for ghost phase)
   */
  showImmuneText(x: number, y: number): void {
    const text = this.scene.add.text(x, y - 40, 'IMMUNE', {
      fontSize: '12px',
      color: '#9370DB',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 400,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show jump dust cloud
   */
  showJumpDustCloud(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dust = this.scene.add.graphics();
      dust.fillStyle(0xDEB887, 0.7);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);
      dust.setPosition(x, y + 15);
      dust.setDepth(25);
      
      this.scene.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * 30,
        y: y + 15 + Math.sin(angle) * 15,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => dust.destroy()
      });
    }
  }

  /**
   * Show shield block effect
   */
  showShieldBlockEffect(x: number, y: number, shieldGraphics: Phaser.GameObjects.Graphics): void {
    // Flash the shield
    this.scene.tweens.add({
      targets: shieldGraphics,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
    
    // Show "BLOCKED" text
    const text = this.scene.add.text(x, y - 50, 'BLOCKED', {
      fontSize: '14px',
      color: '#00BFFF',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 25,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show shield break effect
   */
  showShieldBreakEffect(x: number, y: number): void {
    // Create shield fragments
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fragment = this.scene.add.graphics();
      fragment.fillStyle(0x00BFFF, 0.8);
      fragment.fillCircle(0, 0, 5);
      fragment.setPosition(x, y - 5);
      fragment.setDepth(100);
      
      this.scene.tweens.add({
        targets: fragment,
        x: x + Math.cos(angle) * 50,
        y: y - 5 + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        onComplete: () => fragment.destroy()
      });
    }
    
    // Show "SHIELD BROKEN" text
    const text = this.scene.add.text(x, y - 60, 'SHIELD BROKEN!', {
      fontSize: '16px',
      color: '#FF6347',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show spawn effect for broodmother death
   */
  showSpawnEffect(x: number, y: number, babyCount: number): void {
    // Green burst effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const splat = this.scene.add.graphics();
      splat.fillStyle(0x228B22, 0.8);
      splat.fillCircle(0, 0, 6 + Math.random() * 6);
      splat.setPosition(x, y);
      splat.setDepth(35);
      
      this.scene.tweens.add({
        targets: splat,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => splat.destroy()
      });
    }
    
    // Show spawn text
    const text = this.scene.add.text(x, y - 50, `🕷️ ${babyCount} BABIES!`, {
      fontSize: '16px',
      color: '#32CD32',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => text.destroy()
    });
  }

  /**
   * Play death animation
   */
  playDeathAnimation(target: Phaser.GameObjects.Container, onComplete: () => void): void {
    this.scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete
    });
  }

  /**
   * Play jump animation (arc up and forward)
   */
  playJumpAnimation(
    target: Phaser.GameObjects.Container,
    targetX: number,
    targetY: number,
    duration: number,
    onComplete: () => void
  ): void {
    // Move to target
    this.scene.tweens.add({
      targets: target,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Quad.easeOut',
      onComplete
    });
    
    // Arc up during jump
    this.scene.tweens.add({
      targets: target,
      y: '-=40',
      duration: duration / 2,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  /**
   * Flash graphics briefly (for damage indication)
   */
  flashGraphics(graphics: Phaser.GameObjects.Graphics): void {
    graphics.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      graphics.setAlpha(1);
    });
  }
}
