/**
 * Pure calculation functions extracted for testability
 * These functions have no dependencies on Phaser or game state
 */

import { GAME_CONFIG } from '../data/GameConfig';

/**
 * Calculate the HP multiplier for a given wave number
 * Wave 1 has 1x HP, increasing by WAVE_HP_SCALING per wave up to MAX_HP_MULTIPLIER
 */
export function calculateHPMultiplier(waveNumber: number): number {
  return Math.min(
    GAME_CONFIG.MAX_HP_MULTIPLIER,
    1 + (waveNumber - 1) * GAME_CONFIG.WAVE_HP_SCALING
  );
}

/**
 * Calculate the armor multiplier for a given wave number
 * Only applies to creeps with base armor > 0
 */
export function calculateArmorMultiplier(waveNumber: number, hasBaseArmor: boolean): number {
  if (!hasBaseArmor) return 1;
  return Math.min(
    GAME_CONFIG.MAX_ARMOR_MULTIPLIER,
    1 + (waveNumber - 1) * GAME_CONFIG.WAVE_ARMOR_SCALING
  );
}

/**
 * Calculate scaled health for a creep based on wave and difficulty
 */
export function calculateScaledHealth(
  baseHealth: number,
  waveNumber: number,
  difficultyMultiplier: number = 1.0
): number {
  const hpMultiplier = calculateHPMultiplier(waveNumber);
  return Math.floor(baseHealth * hpMultiplier * difficultyMultiplier);
}

/**
 * Calculate scaled armor for a creep based on wave
 */
export function calculateScaledArmor(baseArmor: number, waveNumber: number): number {
  const armorMultiplier = calculateArmorMultiplier(waveNumber, baseArmor > 0);
  return Math.floor(baseArmor * armorMultiplier);
}

/**
 * Calculate effective damage after armor reduction
 * Damage reduction formula: damage * (100 / (100 + armor))
 */
export function calculateDamageAfterArmor(damage: number, armor: number): number {
  if (armor <= 0) return damage;
  const reduction = 100 / (100 + armor);
  return Math.max(1, Math.floor(damage * reduction));
}

/**
 * Calculate armor penetration - how much armor is ignored
 */
export function calculateEffectiveArmor(baseArmor: number, armorPenetration: number): number {
  return Math.max(0, baseArmor - armorPenetration);
}

/**
 * Calculate the gold reward for killing a creep
 * Can be modified by difficulty or wave bonuses
 */
export function calculateGoldReward(
  baseReward: number,
  _waveNumber: number,
  difficultyMultiplier: number = 1.0
): number {
  // Base reward is the creep's gold value, potentially scaled
  return Math.floor(baseReward * difficultyMultiplier);
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a target is within range of a tower
 */
export function isInRange(
  towerX: number,
  towerY: number,
  targetX: number,
  targetY: number,
  range: number
): boolean {
  const distance = calculateDistance(towerX, towerY, targetX, targetY);
  return distance <= range;
}

/**
 * Calculate slow effect multiplier (speed reduction)
 * Returns a value between 0 and 1 where 1 = no slow, 0 = completely stopped
 */
export function calculateSlowMultiplier(slowPercent: number): number {
  return Math.max(0, Math.min(1, 1 - slowPercent / 100));
}

/**
 * Calculate stacked slow effect (diminishing returns)
 * Multiple slows don't stack additively
 */
export function calculateStackedSlowMultiplier(slowPercents: number[]): number {
  if (slowPercents.length === 0) return 1;

  // Sort by strongest slow first
  const sorted = [...slowPercents].sort((a, b) => b - a);

  // First slow applies fully, subsequent slows have diminishing returns
  let multiplier = 1;
  sorted.forEach((percent, index) => {
    const effectiveness = Math.pow(0.5, index); // 100%, 50%, 25%, etc.
    multiplier *= 1 - (percent / 100) * effectiveness;
  });

  return Math.max(0, multiplier);
}

/**
 * Calculate poison damage per tick
 */
export function calculatePoisonDamage(
  baseDamage: number,
  stacks: number,
  maxStacks: number
): number {
  const effectiveStacks = Math.min(stacks, maxStacks);
  return baseDamage * effectiveStacks;
}

/**
 * Calculate splash damage falloff based on distance from center
 */
export function calculateSplashDamage(
  baseDamage: number,
  distanceFromCenter: number,
  splashRadius: number,
  minDamagePercent: number = 0.3
): number {
  if (distanceFromCenter >= splashRadius) return 0;

  // Linear falloff from 100% at center to minDamagePercent at edge
  const falloff = 1 - (distanceFromCenter / splashRadius) * (1 - minDamagePercent);
  return Math.floor(baseDamage * falloff);
}

/**
 * Calculate score for end of game
 */
export function calculateScore(
  waveReached: number,
  goldEarned: number,
  hpRemaining: number,
  timeSeconds: number,
  isVictory: boolean
): number {
  // Base score from waves
  let score = waveReached * 100;

  // Gold bonus (10% of gold earned)
  score += Math.floor(goldEarned * 0.1);

  // HP bonus (10 points per HP remaining)
  score += hpRemaining * 10;

  // Time bonus for victory (faster = more points, up to 5 minutes saved)
  if (isVictory) {
    const expectedTime = 20 * 60; // 20 minutes expected
    const timeSaved = Math.max(0, expectedTime - timeSeconds);
    score += Math.floor(timeSaved / 6); // ~1 point per 6 seconds saved
  }

  // Victory multiplier
  if (isVictory) {
    score = Math.floor(score * 1.5);
  }

  return score;
}

/**
 * Calculate tower sell value (percentage of total investment)
 */
export function calculateSellValue(
  buildCost: number,
  upgradeCosts: number[],
  sellPercentage: number = 0.6
): number {
  const totalInvestment = buildCost + upgradeCosts.reduce((sum, cost) => sum + cost, 0);
  return Math.floor(totalInvestment * sellPercentage);
}

/**
 * Calculate tower DPS (damage per second)
 */
export function calculateTowerDPS(damage: number, fireRateMs: number): number {
  const shotsPerSecond = 1000 / fireRateMs;
  return damage * shotsPerSecond;
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate angle between two points in radians
 */
export function calculateAngle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalize an angle to be between 0 and 2*PI
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}
