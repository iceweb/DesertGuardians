/**
 * Wave configuration data for all 25 waves.
 * Extracted to keep WaveManager under 500 LOC.
 */

export interface WaveCreepGroup {
  type: string;
  count: number;
  intervalMs: number;
  delayStart?: number;
}

export interface WaveDef {
  waveNumber: number;
  creeps: WaveCreepGroup[];
}

/**
 * Hardcoded wave configurations for all 25 waves.
 * REBALANCED: Tighter economy, HP scales with wave, mid-game density increased
 */
export const WAVE_CONFIGS: WaveDef[] = [
  // Wave 1: Introduction - gentle start
  { waveNumber: 1, creeps: [{ type: 'furball', count: 8, intervalMs: 1400 }] },
  
  // Wave 2: More furballs
  { waveNumber: 2, creeps: [{ type: 'furball', count: 12, intervalMs: 1100 }] },
  
  // Wave 3: First runners - earlier introduction
  { waveNumber: 3, creeps: [
    { type: 'furball', count: 8, intervalMs: 1200 },
    { type: 'runner', count: 10, intervalMs: 600, delayStart: 2000 }
  ]},
  
  // Wave 4: Runner focused
  { waveNumber: 4, creeps: [{ type: 'runner', count: 20, intervalMs: 450 }] },
  
  // Wave 5: Mixed assault - INCREASED DENSITY
  { waveNumber: 5, creeps: [
    { type: 'furball', count: 16, intervalMs: 900 },
    { type: 'runner', count: 16, intervalMs: 450, delayStart: 1500 }
  ]},
  
  // Wave 6: First tanks - earlier with more support
  { waveNumber: 6, creeps: [
    { type: 'furball', count: 18, intervalMs: 700 },
    { type: 'tank', count: 5, intervalMs: 2200, delayStart: 2500 }
  ]},
  
  // Wave 7: Tank focus + first jumper preview - INCREASED DENSITY
  { waveNumber: 7, creeps: [
    { type: 'tank', count: 10, intervalMs: 1800 },
    { type: 'jumper', count: 2, intervalMs: 2500, delayStart: 4000 }
  ]},
  
  // Wave 8: Speed and armor mix - INCREASED DENSITY
  { waveNumber: 8, creeps: [
    { type: 'runner', count: 28, intervalMs: 350 },
    { type: 'tank', count: 6, intervalMs: 1600, delayStart: 2000 }
  ]},
  
  // Wave 9: Pre-boss buildup + shielded preview - INCREASED DENSITY
  { waveNumber: 9, creeps: [
    { type: 'furball', count: 25, intervalMs: 550 },
    { type: 'tank', count: 7, intervalMs: 1600, delayStart: 2500 },
    { type: 'shielded', count: 2, intervalMs: 3000, delayStart: 5000 }
  ]},
  
  // Wave 10: FIRST BOSS - with mixed support
  { waveNumber: 10, creeps: [
    { type: 'furball', count: 18, intervalMs: 700 },
    { type: 'tank', count: 4, intervalMs: 1800, delayStart: 2000 },
    { type: 'jumper', count: 3, intervalMs: 2500, delayStart: 3500 },
    { type: 'boss', count: 1, intervalMs: 1000, delayStart: 5000 }
  ]},
  
  // Wave 11: Post-boss pressure - INCREASED DENSITY
  { waveNumber: 11, creeps: [
    { type: 'furball', count: 25, intervalMs: 600 },
    { type: 'runner', count: 15, intervalMs: 400, delayStart: 2500 },
    { type: 'shielded', count: 3, intervalMs: 2500, delayStart: 4000 }
  ]},
  
  // Wave 12: Runner swarm + jumpers - INCREASED DENSITY
  { waveNumber: 12, creeps: [
    { type: 'runner', count: 40, intervalMs: 280 },
    { type: 'jumper', count: 5, intervalMs: 2000, delayStart: 3000 }
  ]},
  
  // Wave 13: Heavy tanks + shielded - INCREASED DENSITY
  { waveNumber: 13, creeps: [
    { type: 'tank', count: 14, intervalMs: 1400 },
    { type: 'shielded', count: 5, intervalMs: 2200, delayStart: 3000 }
  ]},
  
  // Wave 14: Mixed chaos - INCREASED DENSITY
  { waveNumber: 14, creeps: [
    { type: 'furball', count: 20, intervalMs: 550 },
    { type: 'runner', count: 20, intervalMs: 350, delayStart: 1500 },
    { type: 'tank', count: 8, intervalMs: 1800, delayStart: 3000 },
    { type: 'jumper', count: 4, intervalMs: 2200, delayStart: 5000 }
  ]},
  
  // Wave 15: Tank army with boss - INCREASED DENSITY
  { waveNumber: 15, creeps: [
    { type: 'tank', count: 14, intervalMs: 1300 },
    { type: 'shielded', count: 6, intervalMs: 2000, delayStart: 2000 },
    { type: 'furball', count: 15, intervalMs: 700, delayStart: 3000 },
    { type: 'boss', count: 1, intervalMs: 1000, delayStart: 8000 }
  ]},
  
  // Wave 16: Speed challenge - extreme
  { waveNumber: 16, creeps: [
    { type: 'runner', count: 40, intervalMs: 250 }
  ]},
  
  // Wave 17: Heavy mixed - first jumpers
  { waveNumber: 17, creeps: [
    { type: 'tank', count: 8, intervalMs: 1800 },
    { type: 'runner', count: 20, intervalMs: 350, delayStart: 2000 },
    { type: 'jumper', count: 3, intervalMs: 2000, delayStart: 5000 }
  ]},
  
  // Wave 18: Endurance test - first shielded
  { waveNumber: 18, creeps: [
    { type: 'furball', count: 25, intervalMs: 500 },
    { type: 'tank', count: 8, intervalMs: 2000, delayStart: 1500 },
    { type: 'shielded', count: 3, intervalMs: 2500, delayStart: 4000 }
  ]},
  
  // Wave 19: Pre-boss 2 - intense
  { waveNumber: 19, creeps: [
    { type: 'runner', count: 25, intervalMs: 350 },
    { type: 'tank', count: 10, intervalMs: 1400, delayStart: 3000 },
    { type: 'jumper', count: 4, intervalMs: 2000, delayStart: 5000 }
  ]},
  
  // Wave 20: DOUBLE BOSS - harder
  { waveNumber: 20, creeps: [
    { type: 'tank', count: 8, intervalMs: 1800 },
    { type: 'shielded', count: 4, intervalMs: 2000, delayStart: 2000 },
    { type: 'boss', count: 2, intervalMs: 6000, delayStart: 4000 }
  ]},
  
  // Wave 21: Aftermath - heavy with jumpers
  { waveNumber: 21, creeps: [
    { type: 'furball', count: 20, intervalMs: 500 },
    { type: 'jumper', count: 6, intervalMs: 2000, delayStart: 2000 },
    { type: 'runner', count: 15, intervalMs: 350, delayStart: 4000 },
    { type: 'tank', count: 5, intervalMs: 2000, delayStart: 6000 }
  ]},
  
  // Wave 22: Shielded focus
  { waveNumber: 22, creeps: [
    { type: 'shielded', count: 8, intervalMs: 2500 },
    { type: 'tank', count: 10, intervalMs: 1400, delayStart: 2000 },
    { type: 'runner', count: 15, intervalMs: 500, delayStart: 4000 },
    { type: 'boss', count: 1, intervalMs: 1000, delayStart: 10000 }
  ]},
  
  // Wave 23: Elite mixed assault
  { waveNumber: 23, creeps: [
    { type: 'jumper', count: 8, intervalMs: 1600 },
    { type: 'shielded', count: 8, intervalMs: 1600, delayStart: 2000 },
    { type: 'tank', count: 10, intervalMs: 1200, delayStart: 4000 },
    { type: 'boss', count: 2, intervalMs: 5000, delayStart: 8000 }
  ]},
  
  // Wave 24: Penultimate chaos
  { waveNumber: 24, creeps: [
    { type: 'runner', count: 25, intervalMs: 250 },
    { type: 'jumper', count: 10, intervalMs: 1400, delayStart: 1500 },
    { type: 'shielded', count: 10, intervalMs: 1400, delayStart: 3000 },
    { type: 'tank', count: 15, intervalMs: 1000, delayStart: 5000 },
    { type: 'boss', count: 3, intervalMs: 4000, delayStart: 10000 }
  ]},
  
  // Wave 25: FINAL WAVE - Maximum difficulty!
  { waveNumber: 25, creeps: [
    { type: 'furball', count: 20, intervalMs: 400 },
    { type: 'runner', count: 25, intervalMs: 250, delayStart: 1500 },
    { type: 'jumper', count: 12, intervalMs: 1200, delayStart: 2500 },
    { type: 'shielded', count: 12, intervalMs: 1200, delayStart: 3500 },
    { type: 'tank', count: 15, intervalMs: 900, delayStart: 5000 },
    { type: 'boss', count: 5, intervalMs: 3500, delayStart: 8000 }
  ]}
];
