export interface CreepConfig {
  type: string;
  maxHealth: number;
  speed: number;
  armor: number;
  goldReward: number;
  description?: string;

  hasShield?: boolean;
  canJump?: boolean;
  isFlying?: boolean;
  canDig?: boolean;
  hasGhostPhase?: boolean;
  canDispel?: boolean;
  dispelImmunity?: number;
  spawnOnDeath?: {
    type: string;
    count: number;
  };
  sizeScale?: number;
  onlyDamagedBy?: 'ice' | 'poison';
}

export const CREEP_TYPES: Record<string, CreepConfig> = {
  furball: {
    type: 'furball',
    maxHealth: 55,
    speed: 85,
    armor: 0,
    goldReward: 7,
    description: 'A fluffy critter. No special abilities.',
  },
  runner: {
    type: 'runner',
    maxHealth: 22,
    speed: 150,
    armor: 0,
    goldReward: 5,
    description: 'Very fast but fragile. Rushes through defenses.',
  },
  tank: {
    type: 'tank',
    maxHealth: 280,
    speed: 50,
    armor: 35,
    goldReward: 15,
    description: 'Heavily armored. Slow but extremely tough.',
  },
  jumper: {
    type: 'jumper',
    maxHealth: 160,
    speed: 75,
    armor: 10,
    goldReward: 18,
    canJump: true,
    description: 'Leaps forward 150px every 4 seconds, bypassing towers.',
  },
  shielded: {
    type: 'shielded',
    maxHealth: 200,
    speed: 75,
    armor: 20,
    goldReward: 25,
    hasShield: true,
    description: 'Energy shield blocks the first 3 hits completely.',
  },

  flying: {
    type: 'flying',
    maxHealth: 95,
    speed: 115,
    armor: 0,
    goldReward: 10,
    isFlying: true,
    description: 'Flies over ground. Immune to Cannon and Poison towers.',
  },
  digger: {
    type: 'digger',
    maxHealth: 120,
    speed: 90,
    armor: 15,
    goldReward: 15,
    canDig: true,
    description: 'Burrows underground for 2s every 5s, becoming invulnerable.',
  },
  ghost: {
    type: 'ghost',
    maxHealth: 175,
    speed: 75,
    armor: 0,
    goldReward: 14,
    hasGhostPhase: true,
    description: 'Phases out for 3s when HP drops below 15%. Kill fast!',
  },
  broodmother: {
    type: 'broodmother',
    maxHealth: 450,
    speed: 35,
    armor: 30,
    goldReward: 25,
    sizeScale: 1.5,
    spawnOnDeath: {
      type: 'baby',
      count: 8,
    },
    description: 'Spawns 8 baby creeps on death. Large and slow.',
  },
  baby: {
    type: 'baby',
    maxHealth: 28,
    speed: 125,
    armor: 0,
    goldReward: 2,
    sizeScale: 0.8,
    description: 'Tiny offspring of Broodmother. Fast but weak.',
  },

  flame: {
    type: 'flame',
    maxHealth: 16,
    speed: 90,
    armor: 0,
    goldReward: 8,
    onlyDamagedBy: 'ice',
    description: '🔥 Only damaged by Ice Towers! Immune to other damage.',
  },
  plaguebearer: {
    type: 'plaguebearer',
    maxHealth: 55,
    speed: 65,
    armor: 0,
    goldReward: 10,
    onlyDamagedBy: 'poison',
    description: '☠️ Only damaged by Poison Towers! Immune to other damage.',
  },

  boss_1: {
    type: 'boss_1',
    maxHealth: 890,
    speed: 50,
    armor: 21,
    goldReward: 60,
    sizeScale: 1.0,
    canDispel: true,
    dispelImmunity: 800,
    description: '🦎 Giant Gecko. Periodically dispels slow and poison effects.',
  },
  boss_2: {
    type: 'boss_2',
    maxHealth: 1360,
    speed: 48,
    armor: 34,
    goldReward: 100,
    sizeScale: 1.15,
    canDispel: true,
    dispelImmunity: 1200,
    description: '🦎 Komodo Warlord. Dispels debuffs. High HP and armor.',
  },
  boss_3: {
    type: 'boss_3',
    maxHealth: 2635,
    speed: 40,
    armor: 47,
    goldReward: 160,
    sizeScale: 1.3,
    canDispel: true,
    dispelImmunity: 1500,
    description: '🐉 Drake Champion. Massive HP. Dispels all negative effects.',
  },
  boss_4: {
    type: 'boss_4',
    maxHealth: 4000,
    speed: 35,
    armor: 60,
    goldReward: 240,
    sizeScale: 1.5,
    canDispel: true,
    dispelImmunity: 2000,
    description: '🐉 Young Dragon. Extremely tanky. Focus fire required.',
  },
  boss_5: {
    type: 'boss_5',
    maxHealth: 6545,
    speed: 30,
    armor: 77,
    goldReward: 400,
    sizeScale: 1.7,
    canDispel: true,
    dispelImmunity: 2000,
    description: '🐉 Elder Dragon Lord. The final challenge!',
  },

  boss_guard_1: {
    type: 'boss_guard_1',
    maxHealth: 700,
    speed: 38,
    armor: 45,
    goldReward: 40,
    sizeScale: 1.2,
    hasShield: true,
    description: 'Drake Knight. Armored guard with shield escorting Drake Champion.',
  },
  boss_guard_2: {
    type: 'boss_guard_2',
    maxHealth: 1050,
    speed: 36,
    armor: 50,
    goldReward: 60,
    sizeScale: 1.3,
    hasShield: true,
    description: 'Dragon Knight. Elite armored warrior with heavy shield.',
  },
  boss_guard_3: {
    type: 'boss_guard_3',
    maxHealth: 1550,
    speed: 34,
    armor: 60,
    goldReward: 80,
    sizeScale: 1.4,
    hasShield: true,
    description: 'Flame Knight. Master warrior with flaming swords.',
  },

  boss: {
    type: 'boss',
    maxHealth: 1300,
    speed: 45,
    armor: 30,
    goldReward: 60,
    sizeScale: 1.1,
    canDispel: true,
    dispelImmunity: 1500,
    description: 'Legacy Boss. High HP with dispel ability.',
  },
};

export interface WaveCreepGroup {
  type: string;
  count: number;
  intervalMs: number;
  delayStart?: number;
}

export type WaveType =
  | 'normal'
  | 'boss'
  | 'flying'
  | 'digger'
  | 'ghost'
  | 'broodmother'
  | 'chaos'
  | 'flame'
  | 'plaguebearer';

export interface WaveDef {
  waveNumber: number;
  creeps: WaveCreepGroup[];
  waveType?: WaveType;
  announcement?: string;
  parallelSpawn?: boolean;
}

export const WAVE_CONFIGS: WaveDef[] = [
  { waveNumber: 1, creeps: [{ type: 'furball', count: 8, intervalMs: 1400 }] },
  { waveNumber: 2, creeps: [{ type: 'furball', count: 12, intervalMs: 1100 }] },
  {
    waveNumber: 3,
    creeps: [
      { type: 'furball', count: 8, intervalMs: 1200 },
      { type: 'runner', count: 8, intervalMs: 600, delayStart: 9000 },
    ],
  },
  { waveNumber: 4, creeps: [{ type: 'runner', count: 18, intervalMs: 500 }] },
  {
    waveNumber: 5,
    creeps: [
      { type: 'furball', count: 12, intervalMs: 900 },
      { type: 'runner', count: 12, intervalMs: 500, delayStart: 10500 },
    ],
  },

  {
    waveNumber: 6,
    creeps: [
      { type: 'furball', count: 14, intervalMs: 800 },
      { type: 'tank', count: 3, intervalMs: 2500, delayStart: 11000 },
    ],
  },
  {
    waveNumber: 7,
    waveType: 'boss',
    announcement: '🦎 GIANT GECKO APPROACHES!',
    creeps: [
      { type: 'furball', count: 10, intervalMs: 800 },
      { type: 'runner', count: 8, intervalMs: 500, delayStart: 7700 },
      { type: 'boss_1', count: 1, intervalMs: 1000, delayStart: 11700 },
    ],
  },
  {
    waveNumber: 8,
    creeps: [
      { type: 'runner', count: 16, intervalMs: 450 },
      { type: 'jumper', count: 5, intervalMs: 1800, delayStart: 7250 },
    ],
  },
  {
    waveNumber: 9,
    waveType: 'flying',
    announcement: '⚠️ FLYING WAVE!\nArchers & Snipers only!',
    creeps: [
      { type: 'flying', count: 10, intervalMs: 1000 },
      { type: 'furball', count: 8, intervalMs: 900, delayStart: 9500 },
    ],
  },
  {
    waveNumber: 10,
    creeps: [
      { type: 'tank', count: 6, intervalMs: 1600 },
      { type: 'runner', count: 12, intervalMs: 400, delayStart: 8500 },
    ],
  },

  {
    waveNumber: 11,
    waveType: 'ghost',
    announcement: '👻 GHOST WAVE!\nThey phase when low HP!',
    creeps: [
      { type: 'ghost', count: 10, intervalMs: 1200 },
      { type: 'furball', count: 12, intervalMs: 700, delayStart: 13100 },
    ],
  },
  {
    waveNumber: 12,
    creeps: [
      { type: 'furball', count: 16, intervalMs: 650 },
      { type: 'tank', count: 6, intervalMs: 1600, delayStart: 10250 },
      { type: 'jumper', count: 6, intervalMs: 1600, delayStart: 18750 },
    ],
  },
  {
    waveNumber: 13,
    waveType: 'digger',
    announcement: '🕳️ DIGGER WAVE!\nThey burrow underground!',
    creeps: [
      { type: 'digger', count: 12, intervalMs: 1100 },
      { type: 'runner', count: 12, intervalMs: 500, delayStart: 12600 },
    ],
  },
  {
    waveNumber: 14,
    waveType: 'boss',
    announcement: '🦎 KOMODO WARLORD APPROACHES!',
    creeps: [
      { type: 'runner', count: 12, intervalMs: 500 },
      { type: 'tank', count: 5, intervalMs: 1800, delayStart: 6000 },
      { type: 'boss_2', count: 1, intervalMs: 1000, delayStart: 13700 },
    ],
  },
  {
    waveNumber: 15,
    creeps: [
      { type: 'furball', count: 18, intervalMs: 650 },
      { type: 'shielded', count: 6, intervalMs: 1800, delayStart: 9600 },
      { type: 'tank', count: 7, intervalMs: 1400, delayStart: 16700 },
    ],
  },
  {
    waveNumber: 16,
    waveType: 'broodmother',
    announcement: '🕷️ BROODMOTHER WAVE!\nSpawns babies on death!',
    creeps: [
      { type: 'furball', count: 16, intervalMs: 700 },
      { type: 'broodmother', count: 3, intervalMs: 3500, delayStart: 9300 },
    ],
  },
  {
    waveNumber: 17,
    creeps: [
      { type: 'runner', count: 28, intervalMs: 350 },
      { type: 'jumper', count: 10, intervalMs: 1200, delayStart: 8100 },
      { type: 'shielded', count: 6, intervalMs: 1600, delayStart: 19800 },
    ],
  },

  {
    waveNumber: 18,
    waveType: 'flying',
    announcement: "⚠️ FLYING SWARM!\nGround towers can't hit!",
    creeps: [
      { type: 'flying', count: 22, intervalMs: 650 },
      { type: 'runner', count: 18, intervalMs: 350, delayStart: 11750 },
    ],
  },
  {
    waveNumber: 19,
    creeps: [
      { type: 'tank', count: 16, intervalMs: 1200 },
      { type: 'shielded', count: 8, intervalMs: 1500, delayStart: 15900 },
    ],
  },
  {
    waveNumber: 20,
    waveType: 'ghost',
    announcement: '👻 GHOST WAVE!\nDamage fast before they phase!',
    creeps: [
      { type: 'ghost', count: 14, intervalMs: 1000 },
      { type: 'digger', count: 10, intervalMs: 1200, delayStart: 11300 },
    ],
  },
  {
    waveNumber: 21,
    waveType: 'boss',
    announcement: '🐉 DRAKE CHAMPION APPROACHES!\nWith Drake Knight Escorts!',
    creeps: [
      { type: 'tank', count: 12, intervalMs: 1200 },
      { type: 'shielded', count: 8, intervalMs: 1400, delayStart: 10300 },
      { type: 'jumper', count: 12, intervalMs: 1200, delayStart: 18000 },
      { type: 'boss_guard_1', count: 2, intervalMs: 2000, delayStart: 26000 },
      { type: 'boss_3', count: 1, intervalMs: 500, delayStart: 26000 },
    ],
  },
  {
    waveNumber: 22,
    waveType: 'broodmother',
    announcement: '🕷️ BROODMOTHER WAVE!\nKill fast, expect babies!',
    creeps: [
      { type: 'tank', count: 10, intervalMs: 1200 },
      { type: 'broodmother', count: 4, intervalMs: 3000, delayStart: 7500 },
    ],
  },
  {
    waveNumber: 23,
    creeps: [
      { type: 'runner', count: 40, intervalMs: 250 },
      { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 9200 },
    ],
  },
  {
    waveNumber: 24,
    waveType: 'digger',
    announcement: '🕳️ DIGGER ASSAULT!\nStrike when they surface!',
    creeps: [
      { type: 'digger', count: 18, intervalMs: 900 },
      { type: 'shielded', count: 10, intervalMs: 1300, delayStart: 13500 },
    ],
  },

  {
    waveNumber: 25,
    creeps: [
      { type: 'tank', count: 14, intervalMs: 1100 },
      { type: 'shielded', count: 12, intervalMs: 1200, delayStart: 12200 },
      { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 23200 },
    ],
  },
  {
    waveNumber: 26,
    waveType: 'flame',
    announcement: '🔥 FLAME WAVE! USE ICE TOWERS!',
    creeps: [
      { type: 'flame', count: 18, intervalMs: 1000 },
      { type: 'runner', count: 22, intervalMs: 350, delayStart: 14400 },
    ],
  },
  {
    waveNumber: 27,
    waveType: 'broodmother',
    announcement: '🕷️ BROODMOTHER SWARM!\nMany spiders incoming!',
    creeps: [
      { type: 'shielded', count: 10, intervalMs: 1200 },
      { type: 'broodmother', count: 6, intervalMs: 2500, delayStart: 7500 },
    ],
  },
  {
    waveNumber: 28,
    waveType: 'boss',
    announcement: '🐉 YOUNG DRAGON APPROACHES!\nWith Dragon Knight Escorts!',
    creeps: [
      { type: 'shielded', count: 12, intervalMs: 1100 },
      { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 10300 },
      { type: 'tank', count: 12, intervalMs: 1300, delayStart: 21600 },
      { type: 'boss_guard_2', count: 2, intervalMs: 2000, delayStart: 30000 },
      { type: 'boss_4', count: 1, intervalMs: 500, delayStart: 30000 },
    ],
  },
  {
    waveNumber: 29,
    waveType: 'ghost',
    announcement: '👻 ELITE GHOSTS!\n5 sec immunity at 15% HP!',
    creeps: [
      { type: 'ghost', count: 20, intervalMs: 800 },
      { type: 'tank', count: 12, intervalMs: 1200, delayStart: 13500 },
    ],
  },
  {
    waveNumber: 30,
    waveType: 'plaguebearer',
    announcement: '☠️ PLAGUEBEARER WAVE! USE POISON TOWERS!',
    creeps: [
      { type: 'plaguebearer', count: 16, intervalMs: 1100 },
      { type: 'tank', count: 12, intervalMs: 1200, delayStart: 14500 },
    ],
  },

  {
    waveNumber: 31,
    waveType: 'broodmother',
    announcement: '🕷️ NIGHTMARE WAVE!\nGhosts + Broodmothers!',
    parallelSpawn: true,
    creeps: [
      { type: 'ghost', count: 18, intervalMs: 850 },
      { type: 'broodmother', count: 5, intervalMs: 2500 },
      { type: 'jumper', count: 16, intervalMs: 900, delayStart: 19900 },
    ],
  },
  {
    waveNumber: 32,
    parallelSpawn: true,
    creeps: [
      { type: 'furball', count: 30, intervalMs: 400 },
      { type: 'runner', count: 35, intervalMs: 250 },
      { type: 'tank', count: 20, intervalMs: 900, delayStart: 17700 },
      { type: 'shielded', count: 16, intervalMs: 1000, delayStart: 33600 },
      { type: 'jumper', count: 18, intervalMs: 900, delayStart: 47300 },
    ],
  },
  {
    waveNumber: 33,
    waveType: 'digger',
    announcement: '🕳️ DIGGER MASS ASSAULT!\n25 underground burrowers!',
    parallelSpawn: true,
    creeps: [
      { type: 'digger', count: 25, intervalMs: 700 },
      { type: 'tank', count: 16, intervalMs: 950 },
    ],
  },
  {
    waveNumber: 34,
    waveType: 'chaos',
    announcement: '⚠️ CHAOS WAVE!\nAll special creep types!',
    parallelSpawn: true,
    creeps: [
      { type: 'flying', count: 18, intervalMs: 700 },
      { type: 'digger', count: 14, intervalMs: 800 },
      { type: 'ghost', count: 14, intervalMs: 800, delayStart: 19900 },
      { type: 'broodmother', count: 5, intervalMs: 2400, delayStart: 29400 },
      { type: 'tank', count: 16, intervalMs: 900, delayStart: 38300 },
    ],
  },
  {
    waveNumber: 35,
    waveType: 'boss',
    announcement: '🐉 ELDER DRAGON LORD!\nTHE FINAL CHALLENGE!',
    parallelSpawn: true,
    creeps: [
      { type: 'runner', count: 30, intervalMs: 300 },
      { type: 'flying', count: 18, intervalMs: 650 },
      { type: 'ghost', count: 14, intervalMs: 850 },
      { type: 'shielded', count: 16, intervalMs: 900 },
      { type: 'tank', count: 18, intervalMs: 850 },
      { type: 'broodmother', count: 5, intervalMs: 2400 },
      { type: 'boss_guard_3', count: 2, intervalMs: 2000, delayStart: 38000 },
      { type: 'boss_5', count: 1, intervalMs: 500, delayStart: 40000 },
    ],
  },
];

export interface MineConfig {
  level: 0 | 1 | 2 | 3 | 4;
  buildCost: number;
  incomePerWave: number;
  name: string;
  description: string;
}

export const MINE_CONFIGS: Record<number, MineConfig> = {
  0: {
    level: 0,
    buildCost: 0,
    incomePerWave: 0,
    name: 'Empty Mine Slot',
    description: 'Build a gold mine to generate income each wave.',
  },
  1: {
    level: 1,
    buildCost: 75,
    incomePerWave: 14,
    name: 'Gold Mine ★',
    description: 'A basic mine that produces 14g per wave.',
  },
  2: {
    level: 2,
    buildCost: 125,
    incomePerWave: 22,
    name: 'Gold Mine ★★',
    description: 'An improved mine that produces 22g per wave.',
  },
  3: {
    level: 3,
    buildCost: 200,
    incomePerWave: 35,
    name: 'Gold Mine ★★★',
    description: 'A master mine that produces 35g per wave.',
  },
  4: {
    level: 4,
    buildCost: 350,
    incomePerWave: 58,
    name: 'Diamond Mine ★★★★',
    description: 'An elite mining operation that produces 58g per wave.',
  },
};

export function getMineCost(targetLevel: 1 | 2 | 3 | 4): number {
  return MINE_CONFIGS[targetLevel].buildCost;
}

export function getTotalInvestment(level: 0 | 1 | 2 | 3 | 4): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += MINE_CONFIGS[i].buildCost;
  }
  return total;
}
