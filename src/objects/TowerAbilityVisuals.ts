import Phaser from 'phaser';
import type { AbilityDefinition } from './TowerAbilityDefinitions';

/**
 * TowerAbilityVisuals handles all visual effects for tower abilities.
 * Extracted from TowerAbilityHandler to reduce file size.
 */
export class TowerAbilityVisuals {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show floating text above a position
   */
  showFloatingText(x: number, y: number, text: string, color: number): void {
    const colorStr = '#' + color.toString(16).padStart(6, '0');
    const textObj = this.scene.add.text(x, y, text, {
      fontSize: '16px',
      color: colorStr,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: textObj,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => textObj.destroy()
    });
  }

  /**
   * Show explosion effect
   */
  showExplosionEffect(x: number, y: number, color: number): void {
    const explosion = this.scene.add.graphics();
    explosion.setPosition(x, y);
    explosion.setDepth(25);
    explosion.fillStyle(color, 0.8);
    explosion.fillCircle(0, 0, 20);
    
    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
  }

  /**
   * Show skull effect for headshot
   */
  showSkullEffect(x: number, y: number): void {
    const skull = this.scene.add.text(x, y - 30, '💀', {
      fontSize: '32px'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: skull,
      y: y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 600,
      onComplete: () => skull.destroy()
    });
  }

  /**
   * Show ice block effect for freeze
   */
  showIceBlockEffect(x: number, y: number, duration: number): void {
    const iceBlock = this.scene.add.graphics();
    iceBlock.setPosition(x, y);
    iceBlock.setDepth(35);
    
    // Draw ice block
    iceBlock.fillStyle(0x88ccff, 0.6);
    iceBlock.fillRect(-20, -30, 40, 45);
    iceBlock.lineStyle(2, 0xffffff, 0.8);
    iceBlock.strokeRect(-20, -30, 40, 45);
    
    // Inner highlights
    iceBlock.fillStyle(0xffffff, 0.4);
    iceBlock.fillRect(-15, -25, 10, 15);
    
    // Fade out at end
    this.scene.time.delayedCall(duration - 300, () => {
      this.scene.tweens.add({
        targets: iceBlock,
        alpha: 0,
        duration: 300,
        onComplete: () => iceBlock.destroy()
      });
    });
  }

  /**
   * Show frost nova expanding ring
   */
  showFrostNovaEffect(x: number, y: number, radius: number): void {
    const ring = this.scene.add.graphics();
    ring.setPosition(x, y);
    ring.setDepth(25);
    ring.lineStyle(4, 0xffffff, 0.8);
    ring.strokeCircle(0, 0, 20);
    ring.fillStyle(0x88ccff, 0.3);
    ring.fillCircle(0, 0, 20);
    
    this.scene.tweens.add({
      targets: ring,
      scaleX: radius / 20,
      scaleY: radius / 20,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy()
    });
    
    // Ice crystal particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const crystal = this.scene.add.graphics();
      crystal.setPosition(x, y);
      crystal.setDepth(26);
      crystal.fillStyle(0xffffff, 0.8);
      crystal.fillCircle(0, 0, 4);
      
      this.scene.tweens.add({
        targets: crystal,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        alpha: 0,
        duration: 400,
        onComplete: () => crystal.destroy()
      });
    }
  }

  /**
   * Show shatter effect - ice shards flying outward
   */
  showShatterEffect(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const shard = this.scene.add.graphics();
      shard.setPosition(x, y);
      shard.setDepth(35);
      shard.fillStyle(0x87ceeb, 0.9);
      shard.fillTriangle(-3, -8, 3, -8, 0, 8);
      shard.rotation = angle;
      
      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        rotation: angle + Math.random() * 2,
        duration: 300,
        onComplete: () => shard.destroy()
      });
    }
  }

  /**
   * Show plague mark indicator
   */
  showPlagueMarkEffect(x: number, y: number): void {
    const mark = this.scene.add.graphics();
    mark.setPosition(x, y - 30);
    mark.setDepth(35);
    mark.fillStyle(0x00ff00, 0.6);
    mark.fillCircle(0, 0, 8);
    mark.lineStyle(2, 0x228b22, 1);
    mark.strokeCircle(0, 0, 8);
    
    // Pulse animation
    this.scene.tweens.add({
      targets: mark,
      scale: 1.3,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: 3,
      onComplete: () => mark.destroy()
    });
  }

  /**
   * Show toxic explosion effect
   */
  showToxicExplosionEffect(x: number, y: number, radius: number): void {
    const explosion = this.scene.add.graphics();
    explosion.setPosition(x, y);
    explosion.setDepth(25);
    explosion.fillStyle(0x32cd32, 0.6);
    explosion.fillCircle(0, 0, radius * 0.3);
    
    this.scene.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => explosion.destroy()
    });
    
    // Poison droplets
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const droplet = this.scene.add.graphics();
      droplet.setPosition(x, y);
      droplet.setDepth(26);
      droplet.fillStyle(0x00ff00, 0.8);
      droplet.fillCircle(0, 0, 5);
      
      this.scene.tweens.add({
        targets: droplet,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        alpha: 0,
        duration: 400,
        onComplete: () => droplet.destroy()
      });
    }
  }

  /**
   * Show ricochet effect - spark and trail
   */
  showRicochetEffect(fromX: number, fromY: number, toX: number, toY: number): void {
    // Spark at bounce point
    const spark = this.scene.add.graphics();
    spark.setPosition(fromX, fromY);
    spark.setDepth(25);
    spark.fillStyle(0xffd700, 1);
    spark.fillCircle(0, 0, 6);
    
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 2,
      duration: 150,
      onComplete: () => spark.destroy()
    });
    
    // Trail to second target
    const trail = this.scene.add.graphics();
    trail.setPosition(fromX, fromY);
    trail.setDepth(20);
    trail.lineStyle(2, 0xffcc00, 0.8);
    trail.lineBetween(0, 0, toX - fromX, toY - fromY);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }

  /**
   * Show burn/fire effect
   */
  showBurnEffect(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const flame = this.scene.add.graphics();
      flame.setPosition(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20);
      flame.setDepth(35);
      flame.fillStyle(0xff6600, 0.8);
      flame.fillCircle(0, 0, 4 + Math.random() * 4);
      
      this.scene.tweens.add({
        targets: flame,
        y: flame.y - 20,
        alpha: 0,
        scale: 0.5,
        duration: 300 + Math.random() * 200,
        onComplete: () => flame.destroy()
      });
    }
  }

  /**
   * Show plague cloud expanding effect
   */
  showPlagueCloudEffect(x: number, y: number, radius: number): void {
    const cloud = this.scene.add.graphics();
    cloud.setPosition(x, y);
    cloud.setDepth(25);
    cloud.fillStyle(0x00ff00, 0.4);
    cloud.fillCircle(0, 0, 20);
    
    this.scene.tweens.add({
      targets: cloud,
      scaleX: radius / 20,
      scaleY: radius / 20,
      alpha: 0,
      duration: 600,
      onComplete: () => cloud.destroy()
    });
  }

  /**
   * Show piercing arrow trail
   */
  showPiercingTrailEffect(x: number, y: number, angle: number): void {
    const trail = this.scene.add.graphics();
    trail.setPosition(x, y);
    trail.setDepth(19);
    trail.lineStyle(4, 0x4169e1, 0.8);
    trail.lineBetween(0, 0, Math.cos(angle) * 300, Math.sin(angle) * 300);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }

  /**
   * Show armor pierce trail effect
   */
  showArmorPierceTrail(towerX: number, towerY: number, hitX: number, hitY: number): void {
    const trail = this.scene.add.graphics();
    trail.setPosition(towerX, towerY);
    trail.setDepth(19);
    trail.lineStyle(3, 0x00bfff, 0.8);
    trail.lineBetween(0, 0, hitX - towerX, hitY - towerY);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }

  /**
   * Draw ability icon programmatically
   */
  drawAbilityIcon(g: Phaser.GameObjects.Graphics, ability: AbilityDefinition): void {
    const primary = ability.icon.primaryColor;
    const secondary = ability.icon.secondaryColor;
    const size = 20;
    
    // Outer glow
    g.fillStyle(primary, 0.3);
    g.fillCircle(0, 0, size + 5);
    
    // Main icon circle
    g.fillStyle(primary, 0.9);
    g.fillCircle(0, 0, size);
    
    // Inner highlight
    g.fillStyle(secondary, 0.7);
    g.fillCircle(-size * 0.25, -size * 0.25, size * 0.4);
    
    // White shine
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(-size * 0.35, -size * 0.35, size * 0.2);
  }
}
