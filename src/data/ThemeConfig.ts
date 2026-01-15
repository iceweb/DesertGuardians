export const THEME = {
  colors: {
    gold: 0xffd700,
    goldLight: 0xfffacd,
    goldDark: 0x8b6914,
    goldMuted: 0xc9a86c,

    bronze: 0xd4a574,
    bronzeDark: 0xc49564,
    bronzeLight: 0xebd4a4,

    bgDark: 0x1a0a00,
    bgDarker: 0x0a0400,
    bgPanel: 0x2a2015,
    bgPanelHover: 0x3a3025,
    bgButton: 0x2a2a2a,
    bgButtonHover: 0x4a4a4a,

    sandLight: 0xf3ddb1,
    sandMid: 0xd6b377,
    sandDark: 0xb78545,
    warmShadow: 0x5a3a1e,
    warmHighlight: 0xffefc9,

    borderDark: 0x4a3520,
    borderLight: 0x8b6914,

    success: 0x00ff00,
    successMuted: 0x88ff88,
    error: 0xff4444,
    errorMuted: 0xff6666,
    warning: 0xffcc44,
    info: 0x66ccff,

    statDamage: 0xff6666,
    statDps: 0xffcc44,
    statRange: 0x66ff66,
    statRate: 0x66ccff,
    statAir: 0x66ccff,

    textPrimary: 0xffffff,
    textSecondary: 0xaaaaaa,
    textMuted: 0x888888,
    textDisabled: 0x666666,

    towerArcher: 0xcc3333,
    towerRapidfire: 0xffd700,
    towerSniper: 0x4169e1,
    towerCannon: 0xff6600,
    towerIce: 0x87ceeb,
    towerPoison: 0x00ff00,
    towerAura: 0xff4444,
  },

  fonts: {
    title: 'Georgia, serif',
    titleFancy: 'Papyrus, Copperplate, Georgia, serif',
    body: 'Arial',
    bodyBold: 'Arial Black',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '22px',
    xxl: '26px',
    title: '30px',
    titleLarge: '34px',
    hero: '80px',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 30,
  },

  dimensions: {
    hudHeight: 60,
    panelPadding: 15,
    borderRadius: 12,
    borderRadiusLg: 16,
    buttonHeight: 45,
    buttonHeightLg: 65,
  },

  alpha: {
    solid: 1,
    high: 0.95,
    medium: 0.8,
    low: 0.6,
    faint: 0.4,
    subtle: 0.2,
    ghost: 0.1,
  },
} as const;

export function hexToColor(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

export const TOWER_BRANCH_COLORS: Record<string, number> = {
  archer: THEME.colors.towerArcher,
  rapidfire: THEME.colors.towerRapidfire,
  sniper: THEME.colors.towerSniper,
  rockcannon: THEME.colors.towerCannon,
  icetower: THEME.colors.towerIce,
  poison: THEME.colors.towerPoison,
  aura: THEME.colors.towerAura,
};

export const VETERAN_RANK_COLORS: Record<number, string> = {
  0: '#888888',
  1: '#d4a574',
  2: '#c0c0c0',
  3: '#ffd700',
};
