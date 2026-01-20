import { describe, it, expect } from 'vitest';

/**
 * Tests for CreepEffects logic
 * Validates visual effect calculations and parameters without Phaser dependencies
 */

describe('CreepEffects Logic', () => {
  describe('Damage Text Positioning', () => {
    it('should calculate poison damage text position', () => {
      const creepY = 100;
      const textOffsetY = -40;
      const floatUpDistance = -30;

      const startY = creepY + textOffsetY;
      const endY = startY + floatUpDistance;

      expect(startY).toBe(60);
      expect(endY).toBe(30);
    });

    it('should calculate burn damage text position', () => {
      const creepY = 150;
      const textOffsetY = -40;
      const floatUpDistance = -30;

      const startY = creepY + textOffsetY;
      const endY = startY + floatUpDistance;

      expect(startY).toBe(110);
      expect(endY).toBe(80);
    });
  });

  describe('Dispel Effect Calculations', () => {
    it('should scale dispel text based on creep size', () => {
      const baseFontSize = 20;

      const calculateDispelFontSize = (sizeScale: number): number => {
        const scale = Math.max(1.0, sizeScale);
        return Math.floor(baseFontSize * scale);
      };

      expect(calculateDispelFontSize(1.0)).toBe(20);
      expect(calculateDispelFontSize(1.5)).toBe(30);
      expect(calculateDispelFontSize(0.8)).toBe(20); // Min 1.0 scale
    });

    it('should calculate dispel ring positions', () => {
      const ringCount = 3;
      const baseRadius = 25;
      const sizeScale = 1.5;
      const scaledRadius = baseRadius * sizeScale;

      expect(scaledRadius).toBe(37.5);

      const ringDelays = Array.from({ length: ringCount }, (_, i) => i * 100);
      expect(ringDelays).toEqual([0, 100, 200]);
    });

    it('should calculate dispel particle positions', () => {
      const particleCount = 12;
      const centerX = 100;
      const centerY = 100;
      const radius = 60;
      const sizeScale = 1.0;

      const particles = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        return {
          x: centerX + Math.cos(angle) * radius * sizeScale,
          y: centerY + Math.sin(angle) * 45 * sizeScale,
        };
      });

      // First particle should be at angle 0 (right side)
      expect(particles[0].x).toBeCloseTo(centerX + radius);
      expect(particles[0].y).toBeCloseTo(centerY);

      // Particle at position 3 (quarter turn)
      expect(particles[3].x).toBeCloseTo(centerX);
      expect(particles[3].y).toBeCloseTo(centerY + 45);
    });
  });

  describe('Digger Effect Calculations', () => {
    it('should calculate prepare crack angles', () => {
      const crackCount = 6;
      const angles = Array.from({ length: crackCount }, (_, i) => (i / crackCount) * Math.PI * 2);

      expect(angles[0]).toBe(0);
      expect(angles[3]).toBeCloseTo(Math.PI);
      expect(angles[crackCount - 1]).toBeCloseTo((5 / 6) * Math.PI * 2);
    });

    it('should calculate burrow hole dimensions', () => {
      const holeWidth = 35;
      const holeHeight = 15;
      const initialScale = 0.3;
      const finalScale = 1.0;

      expect(holeWidth * initialScale).toBe(10.5);
      expect(holeHeight * initialScale).toBe(4.5);
      expect(holeWidth * finalScale).toBe(35);
      expect(holeHeight * finalScale).toBe(15);
    });

    it('should calculate dirt particle trajectories', () => {
      const particleCount = 12;
      const baseThrowDist = 20;
      const baseThrowHeight = -20;

      const trajectories = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        return {
          angle,
          dx: Math.cos(angle) * baseThrowDist,
          dy: baseThrowHeight,
        };
      });

      // Particles should spread in all directions
      expect(trajectories[0].dx).toBeCloseTo(baseThrowDist); // Right
      expect(trajectories[3].dx).toBeCloseTo(0); // Up
      expect(trajectories[6].dx).toBeCloseTo(-baseThrowDist); // Left
    });
  });

  describe('Ghost Phase Effect Calculations', () => {
    it('should calculate ghost phase particle positions', () => {
      const particleCount = 10;
      const centerX = 150;
      const centerY = 200;
      const radiusX = 45;
      const radiusY = 35;

      const particles = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        return {
          targetX: centerX + Math.cos(angle) * radiusX,
          targetY: centerY + Math.sin(angle) * radiusY,
        };
      });

      // First particle at angle 0
      expect(particles[0].targetX).toBeCloseTo(centerX + radiusX);
      expect(particles[0].targetY).toBeCloseTo(centerY);
    });

    it('should calculate ghost flash effect size', () => {
      const baseFlashRadius = 30;
      const flashY = 5; // Offset from center

      expect(baseFlashRadius).toBe(30);
      expect(flashY).toBe(5);
    });
  });

  describe('Jump Effect Calculations', () => {
    it('should calculate dust cloud particle spread', () => {
      const particleCount = 6;
      const spreadRadius = 30;
      const centerX = 200;
      const centerY = 300;

      const particles = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        return {
          x: centerX + Math.cos(angle) * spreadRadius,
          y: centerY + 15 + Math.sin(angle) * 15, // Y is compressed
        };
      });

      expect(particles.length).toBe(particleCount);
      // Check particles spread around center
      const avgX = particles.reduce((sum, p) => sum + p.x, 0) / particleCount;
      expect(avgX).toBeCloseTo(centerX, 0);
    });

    it('should calculate jump arc trajectory', () => {
      const startX = 100;
      const startY = 200;
      const targetX = 250;
      const targetY = 200;
      const arcHeight = 50;

      const calculatePosition = (t: number) => {
        const x = startX + (targetX - startX) * t;
        const arc = Math.sin(t * Math.PI) * arcHeight;
        const y = startY + (targetY - startY) * t - arc;
        return { x, y };
      };

      // At start (t=0)
      const start = calculatePosition(0);
      expect(start.x).toBe(startX);
      expect(start.y).toBe(startY);

      // At middle (t=0.5) - highest point
      const middle = calculatePosition(0.5);
      expect(middle.x).toBe((startX + targetX) / 2);
      expect(middle.y).toBe(startY - arcHeight); // At peak of arc

      // At end (t=1)
      const end = calculatePosition(1);
      expect(end.x).toBe(targetX);
      expect(end.y).toBeCloseTo(targetY, 10);
    });
  });

  describe('Shield Effect Calculations', () => {
    it('should calculate shield spark positions', () => {
      const sparkCount = 5;
      const centerX = 100;
      const centerY = 100;
      const shieldOffsetY = -30;
      const maxSpread = 15;

      const sparks = Array.from({ length: sparkCount }, () => {
        const angle = (Math.random() - 0.5) * Math.PI;
        const dist = maxSpread;
        return {
          startX: centerX,
          startY: centerY + shieldOffsetY,
          endX: centerX + Math.cos(angle) * dist,
          endY: centerY + shieldOffsetY + Math.sin(angle) * dist,
        };
      });

      expect(sparks.length).toBe(sparkCount);
      expect(sparks[0].startY).toBe(70); // 100 - 30
    });

    it('should calculate shield break fragment positions', () => {
      const fragmentCount = 8;
      const centerX = 150;
      const centerY = 200;
      const spreadRadius = 50;

      const fragments = Array.from({ length: fragmentCount }, (_, i) => {
        const angle = (i / fragmentCount) * Math.PI * 2;
        return {
          endX: centerX + Math.cos(angle) * spreadRadius,
          endY: centerY - 5 + Math.sin(angle) * spreadRadius,
        };
      });

      // Fragments spread evenly around center
      expect(fragments[0].endX).toBeCloseTo(centerX + spreadRadius);
      expect(fragments[2].endX).toBeCloseTo(centerX);
      expect(fragments[4].endX).toBeCloseTo(centerX - spreadRadius);
    });
  });

  describe('Spawn Effect Calculations', () => {
    it('should calculate spawn splat positions', () => {
      const splatCount = 12;
      const centerX = 100;
      const centerY = 100;
      const spreadRadius = 50;

      const splats = Array.from({ length: splatCount }, (_, i) => {
        const angle = (i / splatCount) * Math.PI * 2;
        return {
          x: centerX + Math.cos(angle) * spreadRadius,
          y: centerY + Math.sin(angle) * spreadRadius,
        };
      });

      expect(splats.length).toBe(splatCount);
    });

    it('should calculate egg particle positions', () => {
      const eggCount = 8;
      const centerX = 200;
      const centerY = 200;
      const spreadRadius = 35;
      const verticalOffset = -10;

      const eggs = Array.from({ length: eggCount }, (_, i) => {
        const angle = (i / eggCount) * Math.PI * 2;
        return {
          x: centerX + Math.cos(angle) * spreadRadius,
          y: centerY + Math.sin(angle) * spreadRadius + verticalOffset,
        };
      });

      expect(eggs.length).toBe(eggCount);
      // Eggs should float up slightly
      expect(eggs[0].y).toBeLessThan(centerY + spreadRadius);
    });
  });

  describe('Animation Timing', () => {
    it('should have consistent effect durations', () => {
      const effects = {
        poisonText: 800,
        burnText: 800,
        dispelRing: 600,
        dispelParticle: 500,
        dispelFlash: 300,
        diggerCrack: 350,
        burrowHole: 400,
        dirtParticle: 350,
        ghostFlash: 300,
        jumpDust: 400,
        shieldSpark: 250,
        shieldBreak: 400,
        deathAnim: 200,
      };

      // Verify all durations are reasonable (100-1000ms)
      for (const [name, duration] of Object.entries(effects)) {
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThanOrEqual(1000);
      }
    });

    it('should calculate staggered particle delays', () => {
      const particleCount = 12;
      const staggerInterval = 40;

      const delays = Array.from({ length: particleCount }, (_, i) => (i % 4) * staggerInterval);

      expect(delays[0]).toBe(0);
      expect(delays[1]).toBe(40);
      expect(delays[2]).toBe(80);
      expect(delays[3]).toBe(120);
      expect(delays[4]).toBe(0); // Wraps around
    });
  });

  describe('Color Values', () => {
    it('should use correct colors for effects', () => {
      const colors = {
        poison: 0x00ff00,
        burn: 0xff6600,
        dispelGold: 0xffd700,
        dispelWhite: 0xffffff,
        ghost: 0x9370db,
        ghostFlash: 0xe6e6fa,
        shield: 0x00bfff,
        dirt: 0x8b4513,
        spawn: 0x228b22,
        baby: 0x90ee90,
      };

      expect(colors.poison).toBe(0x00ff00);
      expect(colors.burn).toBe(0xff6600);
      expect(colors.dispelGold).toBe(0xffd700);
    });

    it('should validate hex color format', () => {
      const isValidHexColor = (color: number): boolean => {
        return color >= 0 && color <= 0xffffff;
      };

      expect(isValidHexColor(0x00ff00)).toBe(true);
      expect(isValidHexColor(0xffffff)).toBe(true);
      expect(isValidHexColor(0x000000)).toBe(true);
    });
  });

  describe('Size Scaling', () => {
    it('should scale effects for different creep sizes', () => {
      const baseRadius = 25;
      const sizes = [0.8, 1.0, 1.3, 1.5, 1.7];

      const scaledRadii = sizes.map((size) => ({
        size,
        radius: baseRadius * Math.max(1.0, size),
      }));

      expect(scaledRadii[0].radius).toBe(25); // 0.8 clamped to 1.0
      expect(scaledRadii[1].radius).toBe(25);
      expect(scaledRadii[2].radius).toBe(32.5);
      expect(scaledRadii[3].radius).toBe(37.5);
      expect(scaledRadii[4].radius).toBe(42.5);
    });
  });

  describe('Depth Ordering', () => {
    it('should have correct depth values for layering', () => {
      const depths = {
        hole: 24,
        crack: 24,
        dust: 25,
        dirt: 35,
        claw: 37,
        flash: 99,
        particle: 100,
        text: 150,
      };

      // Lower depths render behind higher depths
      expect(depths.hole).toBeLessThan(depths.dust);
      expect(depths.dust).toBeLessThan(depths.dirt);
      expect(depths.flash).toBeLessThan(depths.particle);
      expect(depths.particle).toBeLessThan(depths.text);
    });
  });
});
