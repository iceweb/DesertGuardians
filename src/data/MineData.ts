/**
 * Gold mine configuration data.
 * Defines costs, income values, and properties for each mine level.
 */

export interface MineConfig {
  level: 0 | 1 | 2 | 3;
  buildCost: number;      // Cost to build (level 1) or upgrade to this level
  incomePerWave: number;  // Gold earned per wave at this level
  name: string;
  description: string;
}

/**
 * Mine configurations for each level.
 * Level 0 = empty slot (not built yet)
 * 
 * Economy balance:
 * | Level | Build/Upgrade Cost | Income/Wave | Total Invested | Payback Waves |
 * |-------|-------------------|-------------|----------------|---------------|
 * | 1     | 75g (build)       | 12g         | 75g            | ~6 waves      |
 * | 2     | 150g (upgrade)    | 22g         | 225g           | ~10 waves     |
 * | 3     | 250g (upgrade)    | 40g         | 475g           | ~12 waves     |
 */
export const MINE_CONFIGS: Record<number, MineConfig> = {
  0: {
    level: 0,
    buildCost: 0,
    incomePerWave: 0,
    name: 'Empty Mine Slot',
    description: 'Build a gold mine to generate income each wave.'
  },
  1: {
    level: 1,
    buildCost: 75,
    incomePerWave: 12,
    name: 'Gold Mine',
    description: 'A basic mine that produces 12g per wave.'
  },
  2: {
    level: 2,
    buildCost: 150,
    incomePerWave: 22,
    name: 'Gold Mine II',
    description: 'An improved mine that produces 22g per wave.'
  },
  3: {
    level: 3,
    buildCost: 250,
    incomePerWave: 40,
    name: 'Gold Mine III',
    description: 'A master mine that produces 40g per wave.'
  }
};

/**
 * Get the cost to build or upgrade to a specific level
 */
export function getMineCost(targetLevel: 1 | 2 | 3): number {
  return MINE_CONFIGS[targetLevel].buildCost;
}

/**
 * Get total gold invested to reach a specific level
 */
export function getTotalInvestment(level: 0 | 1 | 2 | 3): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += MINE_CONFIGS[i].buildCost;
  }
  return total;
}
