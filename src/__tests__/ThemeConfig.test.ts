import { describe, it, expect } from 'vitest';
import { THEME, hexToColor, TOWER_BRANCH_COLORS, VETERAN_RANK_COLORS } from '../data/ThemeConfig';
import { BRANCH_OPTIONS } from '../data/TowerData';

describe('ThemeConfig', () => {
  describe('Color Palette', () => {
    it('should have gold color variants', () => {
      expect(THEME.colors.gold).toBeDefined();
      expect(THEME.colors.goldLight).toBeDefined();
      expect(THEME.colors.goldDark).toBeDefined();
      expect(THEME.colors.goldMuted).toBeDefined();
    });

    it('should have bronze color variants', () => {
      expect(THEME.colors.bronze).toBeDefined();
      expect(THEME.colors.bronzeDark).toBeDefined();
      expect(THEME.colors.bronzeLight).toBeDefined();
    });

    it('should have background colors', () => {
      expect(THEME.colors.bgDark).toBeDefined();
      expect(THEME.colors.bgDarker).toBeDefined();
      expect(THEME.colors.bgPanel).toBeDefined();
      expect(THEME.colors.bgPanelHover).toBeDefined();
      expect(THEME.colors.bgButton).toBeDefined();
      expect(THEME.colors.bgButtonHover).toBeDefined();
    });

    it('should have sand/environment colors', () => {
      expect(THEME.colors.sandLight).toBeDefined();
      expect(THEME.colors.sandMid).toBeDefined();
      expect(THEME.colors.sandDark).toBeDefined();
      expect(THEME.colors.warmShadow).toBeDefined();
      expect(THEME.colors.warmHighlight).toBeDefined();
    });

    it('should have border colors', () => {
      expect(THEME.colors.borderDark).toBeDefined();
      expect(THEME.colors.borderLight).toBeDefined();
    });

    it('should have status colors', () => {
      expect(THEME.colors.success).toBeDefined();
      expect(THEME.colors.successMuted).toBeDefined();
      expect(THEME.colors.error).toBeDefined();
      expect(THEME.colors.errorMuted).toBeDefined();
      expect(THEME.colors.warning).toBeDefined();
      expect(THEME.colors.info).toBeDefined();
    });

    it('should have stat colors', () => {
      expect(THEME.colors.statDamage).toBeDefined();
      expect(THEME.colors.statDps).toBeDefined();
      expect(THEME.colors.statRange).toBeDefined();
      expect(THEME.colors.statRate).toBeDefined();
      expect(THEME.colors.statAir).toBeDefined();
    });

    it('should have text colors', () => {
      expect(THEME.colors.textPrimary).toBeDefined();
      expect(THEME.colors.textSecondary).toBeDefined();
      expect(THEME.colors.textMuted).toBeDefined();
      expect(THEME.colors.textDisabled).toBeDefined();
    });

    it('should have tower branch colors', () => {
      expect(THEME.colors.towerArcher).toBeDefined();
      expect(THEME.colors.towerRapidfire).toBeDefined();
      expect(THEME.colors.towerSniper).toBeDefined();
      expect(THEME.colors.towerCannon).toBeDefined();
      expect(THEME.colors.towerIce).toBeDefined();
      expect(THEME.colors.towerPoison).toBeDefined();
      expect(THEME.colors.towerAura).toBeDefined();
    });

    it('should have all colors as numbers', () => {
      for (const [key, value] of Object.entries(THEME.colors)) {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(0xffffff);
      }
    });
  });

  describe('Font Configuration', () => {
    it('should have title fonts', () => {
      expect(THEME.fonts.title).toBeDefined();
      expect(THEME.fonts.titleFancy).toBeDefined();
    });

    it('should have body fonts', () => {
      expect(THEME.fonts.body).toBeDefined();
      expect(THEME.fonts.bodyBold).toBeDefined();
    });

    it('should have all fonts as strings', () => {
      for (const value of Object.values(THEME.fonts)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Font Size Configuration', () => {
    it('should have size hierarchy', () => {
      expect(THEME.fontSize.xs).toBeDefined();
      expect(THEME.fontSize.sm).toBeDefined();
      expect(THEME.fontSize.md).toBeDefined();
      expect(THEME.fontSize.lg).toBeDefined();
      expect(THEME.fontSize.xl).toBeDefined();
      expect(THEME.fontSize.xxl).toBeDefined();
    });

    it('should have title sizes', () => {
      expect(THEME.fontSize.title).toBeDefined();
      expect(THEME.fontSize.titleLarge).toBeDefined();
      expect(THEME.fontSize.hero).toBeDefined();
    });

    it('should have all font sizes as strings with px', () => {
      for (const value of Object.values(THEME.fontSize)) {
        expect(typeof value).toBe('string');
        expect(value).toMatch(/^\d+px$/);
      }
    });
  });

  describe('Spacing Configuration', () => {
    it('should have spacing hierarchy', () => {
      expect(THEME.spacing.xs).toBeDefined();
      expect(THEME.spacing.sm).toBeDefined();
      expect(THEME.spacing.md).toBeDefined();
      expect(THEME.spacing.lg).toBeDefined();
      expect(THEME.spacing.xl).toBeDefined();
      expect(THEME.spacing.xxl).toBeDefined();
    });

    it('should have increasing spacing values', () => {
      expect(THEME.spacing.xs).toBeLessThan(THEME.spacing.sm);
      expect(THEME.spacing.sm).toBeLessThan(THEME.spacing.md);
      expect(THEME.spacing.md).toBeLessThan(THEME.spacing.lg);
      expect(THEME.spacing.lg).toBeLessThan(THEME.spacing.xl);
      expect(THEME.spacing.xl).toBeLessThan(THEME.spacing.xxl);
    });

    it('should have all spacing as numbers', () => {
      for (const value of Object.values(THEME.spacing)) {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      }
    });
  });

  describe('Dimension Configuration', () => {
    it('should have HUD dimensions', () => {
      expect(THEME.dimensions.hudHeight).toBeGreaterThan(0);
    });

    it('should have panel dimensions', () => {
      expect(THEME.dimensions.panelPadding).toBeGreaterThan(0);
      expect(THEME.dimensions.borderRadius).toBeGreaterThan(0);
      expect(THEME.dimensions.borderRadiusLg).toBeGreaterThan(THEME.dimensions.borderRadius);
    });

    it('should have button dimensions', () => {
      expect(THEME.dimensions.buttonHeight).toBeGreaterThan(0);
      expect(THEME.dimensions.buttonHeightLg).toBeGreaterThan(THEME.dimensions.buttonHeight);
    });
  });

  describe('Alpha Values', () => {
    it('should have alpha hierarchy', () => {
      expect(THEME.alpha.solid).toBe(1);
      expect(THEME.alpha.high).toBeLessThan(THEME.alpha.solid);
      expect(THEME.alpha.medium).toBeLessThan(THEME.alpha.high);
      expect(THEME.alpha.low).toBeLessThan(THEME.alpha.medium);
      expect(THEME.alpha.faint).toBeLessThan(THEME.alpha.low);
      expect(THEME.alpha.subtle).toBeLessThan(THEME.alpha.faint);
      expect(THEME.alpha.ghost).toBeLessThan(THEME.alpha.subtle);
    });

    it('should have all alpha values between 0 and 1', () => {
      for (const value of Object.values(THEME.alpha)) {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('hexToColor', () => {
    it('should convert hex number to color string', () => {
      expect(hexToColor(0xffffff)).toBe('#ffffff');
      expect(hexToColor(0x000000)).toBe('#000000');
      expect(hexToColor(0xff0000)).toBe('#ff0000');
      expect(hexToColor(0x00ff00)).toBe('#00ff00');
      expect(hexToColor(0x0000ff)).toBe('#0000ff');
    });

    it('should pad short hex values', () => {
      expect(hexToColor(0x000001)).toBe('#000001');
      expect(hexToColor(0x000010)).toBe('#000010');
      expect(hexToColor(0x000100)).toBe('#000100');
    });

    it('should work with theme colors', () => {
      const goldHex = hexToColor(THEME.colors.gold);
      expect(goldHex).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('TOWER_BRANCH_COLORS', () => {
    it('should have colors for all tower branches', () => {
      for (const branch of BRANCH_OPTIONS) {
        expect(TOWER_BRANCH_COLORS[branch]).toBeDefined();
        expect(typeof TOWER_BRANCH_COLORS[branch]).toBe('number');
      }
    });

    it('should map to correct theme colors', () => {
      expect(TOWER_BRANCH_COLORS['archer']).toBe(THEME.colors.towerArcher);
      expect(TOWER_BRANCH_COLORS['rapidfire']).toBe(THEME.colors.towerRapidfire);
      expect(TOWER_BRANCH_COLORS['sniper']).toBe(THEME.colors.towerSniper);
      expect(TOWER_BRANCH_COLORS['rockcannon']).toBe(THEME.colors.towerCannon);
      expect(TOWER_BRANCH_COLORS['icetower']).toBe(THEME.colors.towerIce);
      expect(TOWER_BRANCH_COLORS['poison']).toBe(THEME.colors.towerPoison);
      expect(TOWER_BRANCH_COLORS['aura']).toBe(THEME.colors.towerAura);
    });
  });

  describe('VETERAN_RANK_COLORS', () => {
    it('should have colors for ranks 0-3', () => {
      expect(VETERAN_RANK_COLORS[0]).toBeDefined();
      expect(VETERAN_RANK_COLORS[1]).toBeDefined();
      expect(VETERAN_RANK_COLORS[2]).toBeDefined();
      expect(VETERAN_RANK_COLORS[3]).toBeDefined();
    });

    it('should have all colors as valid hex strings', () => {
      for (const color of Object.values(VETERAN_RANK_COLORS)) {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });
});
