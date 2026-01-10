/**
 * Wave configuration data for all 35 waves.
 * Extracted to keep WaveManager under 500 LOC.
 */

export interface WaveCreepGroup {
  type: string;
  count: number;
  intervalMs: number;
  // delayStart is legacy and now ignored - groups spawn sequentially based on:
  // 1. All creeps of previous group killed/leaked, OR
  // 2. Last creep of previous group reached 50% of path
  delayStart?: number;
}

export type WaveType = 'normal' | 'boss' | 'flying' | 'digger' | 'ghost' | 'broodmother' | 'chaos' | 'flame' | 'plaguebearer';

export interface WaveDef {
  waveNumber: number;
  creeps: WaveCreepGroup[];
  waveType?: WaveType;         // Special wave type for announcements
  announcement?: string;        // Custom announcement text
  parallelSpawn?: boolean;      // If true, spawn first 2 groups simultaneously (for final wave)
}

/**
 * Hardcoded wave configurations for all 35 waves.
 * Features: 4 new creep types (flying, digger, ghost, broodmother)
 * 5 scaled bosses, special wave announcements
 * First 5 waves are normal introductory waves
 * 
 * SEQUENTIAL SPAWNING: Groups spawn one after another. The next group starts when:
 * 1. All creeps from the current group are dead/leaked, OR
 * 2. The last spawned creep of the current group has traveled 50% of the path
 */
export const WAVE_CONFIGS: WaveDef[] = [
  // === EARLY GAME: Waves 1-5 (All Normal - Introduction) ===
  
  // Wave 1: Introduction - gentle start
  { waveNumber: 1, creeps: [{ type: 'furball', count: 8, intervalMs: 1400 }] },
  
  // Wave 2: More furballs
  { waveNumber: 2, creeps: [{ type: 'furball', count: 12, intervalMs: 1100 }] },
  
  // Wave 3: First runners (furball: 7*1200=8400ms, then 500ms gap)
  { waveNumber: 3, creeps: [
    { type: 'furball', count: 8, intervalMs: 1200 },
    { type: 'runner', count: 8, intervalMs: 600, delayStart: 9000 }
  ]},
  
  // Wave 4: Runner focused
  { waveNumber: 4, creeps: [{ type: 'runner', count: 18, intervalMs: 500 }] },
  
  // Wave 5: Mixed basics (furball: 11*900=9900ms + 500ms gap)
  { waveNumber: 5, creeps: [
    { type: 'furball', count: 12, intervalMs: 900 },
    { type: 'runner', count: 12, intervalMs: 500, delayStart: 10500 }
  ]},
  
  // === EARLY-MID GAME: Waves 6-10 ===
  
  // Wave 6: First tanks (furball: 13*800=10400ms + 500ms gap)
  { waveNumber: 6, creeps: [
    { type: 'furball', count: 14, intervalMs: 800 },
    { type: 'tank', count: 4, intervalMs: 2200, delayStart: 11000 }
  ]},
  
  // Wave 7: BOSS WAVE (furball: 9*800=7200 + 500 = 7700, runner: 7*500=3500 + 500 = 11700)
  { waveNumber: 7, waveType: 'boss', announcement: '💀 BOSS INCOMING!', creeps: [
    { type: 'furball', count: 10, intervalMs: 800 },
    { type: 'runner', count: 8, intervalMs: 500, delayStart: 7700 },
    { type: 'boss_1', count: 1, intervalMs: 1000, delayStart: 11700 }
  ]},
  
  // Wave 8: Post-boss (runner: 15*450=6750 + 500 = 7250)
  { waveNumber: 8, creeps: [
    { type: 'runner', count: 16, intervalMs: 450 },
    { type: 'jumper', count: 5, intervalMs: 1800, delayStart: 7250 }
  ]},
  
  // Wave 9: FLYING WAVE (flying: 9*1000=9000 + 500 = 9500)
  { waveNumber: 9, waveType: 'flying', announcement: '⚠️ FLYING WAVE!\nArchers & Snipers only!', creeps: [
    { type: 'flying', count: 10, intervalMs: 1000 },
    { type: 'furball', count: 8, intervalMs: 900, delayStart: 9500 }
  ]},
  
  // Wave 10: Tank focus (tank: 7*1600=11200 + 500 = 11700)
  { waveNumber: 10, creeps: [
    { type: 'tank', count: 8, intervalMs: 1600 },
    { type: 'runner', count: 12, intervalMs: 400, delayStart: 11700 }
  ]},
  
  // === MID GAME: Waves 11-17 ===
  
  // Wave 11: GHOST WAVE (ghost: 7*1400=9800 + 500 = 10300)
  { waveNumber: 11, waveType: 'ghost', announcement: '👻 GHOST WAVE!\nThey phase when low HP!', creeps: [
    { type: 'ghost', count: 8, intervalMs: 1400 },
    { type: 'furball', count: 10, intervalMs: 700, delayStart: 10300 }
  ]},
  
  // Wave 12: Mixed standard (furball: 15*650=9750+500=10250, tank: 5*1600=8000+500=18750)
  { waveNumber: 12, creeps: [
    { type: 'furball', count: 16, intervalMs: 650 },
    { type: 'tank', count: 6, intervalMs: 1600, delayStart: 10250 },
    { type: 'jumper', count: 6, intervalMs: 1600, delayStart: 18750 }
  ]},
  
  // Wave 13: DIGGER WAVE (digger: 9*1200=10800 + 500 = 11300)
  { waveNumber: 13, waveType: 'digger', announcement: '🕳️ DIGGER WAVE!\nThey burrow underground!', creeps: [
    { type: 'digger', count: 10, intervalMs: 1200 },
    { type: 'runner', count: 10, intervalMs: 500, delayStart: 11300 }
  ]},
  
  // Wave 14: BOSS WAVE (runner: 11*500=5500+500=6000, tank: 4*1800=7200+500=13700)
  { waveNumber: 14, waveType: 'boss', announcement: '💀 STRONGER BOSS APPROACHES!', creeps: [
    { type: 'runner', count: 12, intervalMs: 500 },
    { type: 'tank', count: 5, intervalMs: 1800, delayStart: 6000 },
    { type: 'boss_2', count: 1, intervalMs: 1000, delayStart: 13700 }
  ]},
  
  // Wave 15: Shielded intro (furball: 13*700=9100+500=9600, shielded: 3*2200=6600+500=16700)
  { waveNumber: 15, creeps: [
    { type: 'furball', count: 18, intervalMs: 650 },
    { type: 'shielded', count: 6, intervalMs: 1800, delayStart: 9600 },
    { type: 'tank', count: 7, intervalMs: 1400, delayStart: 16700 }
  ]},
  
  // Wave 16: BROODMOTHER (furball: 11*800=8800 + 500 = 9300)
  { waveNumber: 16, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER WAVE!\nSpawns babies on death!', creeps: [
    { type: 'furball', count: 16, intervalMs: 700 },
    { type: 'broodmother', count: 3, intervalMs: 3500, delayStart: 9300 }
  ]},
  
  // Wave 17: Mixed (runner: 19*400=7600+500=8100, jumper: 7*1600=11200+500=19800)
  { waveNumber: 17, creeps: [
    { type: 'runner', count: 28, intervalMs: 350 },
    { type: 'jumper', count: 10, intervalMs: 1200, delayStart: 8100 },
    { type: 'shielded', count: 6, intervalMs: 1600, delayStart: 19800 }
  ]},
  
  // === MID-LATE GAME: Waves 18-24 ===
  
  // Wave 18: FLYING SWARM (flying: 15*750=11250 + 500 = 11750)
  { waveNumber: 18, waveType: 'flying', announcement: '⚠️ FLYING SWARM!\nGround towers can\'t hit!', creeps: [
    { type: 'flying', count: 22, intervalMs: 650 },
    { type: 'runner', count: 18, intervalMs: 350, delayStart: 11750 }
  ]},
  
  // Wave 19: Heavy tanks (tank: 11*1400=15400 + 500 = 15900)
  { waveNumber: 19, creeps: [
    { type: 'tank', count: 16, intervalMs: 1200 },
    { type: 'shielded', count: 8, intervalMs: 1500, delayStart: 15900 }
  ]},
  
  // Wave 20: GHOST + DIGGER (ghost: 9*1200=10800 + 500 = 11300)
  { waveNumber: 20, waveType: 'ghost', announcement: '👻 GHOST WAVE!\nDamage fast before they phase!', creeps: [
    { type: 'ghost', count: 14, intervalMs: 1000 },
    { type: 'digger', count: 10, intervalMs: 1200, delayStart: 11300 }
  ]},
  
  // Wave 21: BOSS WAVE (tank: 7*1400=9800+500=10300, shielded: 4*1800=7200+500=18000, jumper: 7*1400=9800+500=28300)
  { waveNumber: 21, waveType: 'boss', announcement: '💀 MASSIVE BOSS APPROACHES!', creeps: [
    { type: 'tank', count: 12, intervalMs: 1200 },
    { type: 'shielded', count: 8, intervalMs: 1400, delayStart: 10300 },
    { type: 'jumper', count: 12, intervalMs: 1200, delayStart: 18000 },
    { type: 'boss_3', count: 1, intervalMs: 1000, delayStart: 28300 }
  ]},
  
  // Wave 22: BROODMOTHER (tank: 5*1400=7000 + 500 = 7500)
  { waveNumber: 22, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER WAVE!\nKill fast, expect babies!', creeps: [
    { type: 'tank', count: 10, intervalMs: 1200 },
    { type: 'broodmother', count: 4, intervalMs: 3000, delayStart: 7500 }
  ]},
  
  // Wave 23: Speed assault (runner: 29*300=8700 + 500 = 9200)
  { waveNumber: 23, creeps: [
    { type: 'runner', count: 40, intervalMs: 250 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 9200 }
  ]},
  
  // Wave 24: DIGGER ASSAULT (digger: 13*1000=13000 + 500 = 13500)
  { waveNumber: 24, waveType: 'digger', announcement: '🕳️ DIGGER ASSAULT!\nStrike when they surface!', creeps: [
    { type: 'digger', count: 18, intervalMs: 900 },
    { type: 'shielded', count: 10, intervalMs: 1300, delayStart: 13500 }
  ]},
  
  // === LATE GAME: Waves 25-30 ===
  
  // Wave 25: Mixed elite (tank: 9*1300=11700+500=12200, shielded: 7*1500=10500+500=23200)
  { waveNumber: 25, creeps: [
    { type: 'tank', count: 14, intervalMs: 1100 },
    { type: 'shielded', count: 12, intervalMs: 1200, delayStart: 12200 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 23200 }
  ]},
  
  // Wave 26: FLAME WAVE - Ice towers required!
  { waveNumber: 26, waveType: 'flame', announcement: '🔥 FLAME WAVE! USE ICE TOWERS!', creeps: [
    { type: 'flame', count: 18, intervalMs: 1000 },
    { type: 'runner', count: 22, intervalMs: 350, delayStart: 14400 }
  ]},
  
  // Wave 27: BROODMOTHER SWARM (shielded: 5*1400=7000 + 500 = 7500)
  { waveNumber: 27, waveType: 'broodmother', announcement: '🕷️ BROODMOTHER SWARM!\nMany spiders incoming!', creeps: [
    { type: 'shielded', count: 10, intervalMs: 1200 },
    { type: 'broodmother', count: 6, intervalMs: 2500, delayStart: 7500 }
  ]},
  
  // Wave 28: BOSS WAVE (shielded: 7*1400=9800+500=10300, jumper: 9*1200=10800+500=21600, tank: 7*1600=11200+500=33300)
  { waveNumber: 28, waveType: 'boss', announcement: '💀 GIANT BOSS APPROACHES!', creeps: [
    { type: 'shielded', count: 12, intervalMs: 1100 },
    { type: 'jumper', count: 14, intervalMs: 1000, delayStart: 10300 },
    { type: 'tank', count: 12, intervalMs: 1300, delayStart: 21600 },
    { type: 'boss_4', count: 1, intervalMs: 1000, delayStart: 33300 }
  ]},
  
  // Wave 29: ELITE GHOSTS (ghost: 13*1000=13000 + 500 = 13500)
  { waveNumber: 29, waveType: 'ghost', announcement: '👻 ELITE GHOSTS!\n5 sec immunity at 15% HP!', creeps: [
    { type: 'ghost', count: 20, intervalMs: 800 },
    { type: 'tank', count: 12, intervalMs: 1200, delayStart: 13500 }
  ]},
  
  // Wave 30: PLAGUEBEARER WAVE - Poison towers required!
  { waveNumber: 30, waveType: 'plaguebearer', announcement: '☠️ PLAGUEBEARER WAVE! USE POISON TOWERS!', creeps: [
    { type: 'plaguebearer', count: 16, intervalMs: 1100 },
    { type: 'tank', count: 12, intervalMs: 1200, delayStart: 14500 }
  ]},
  
  // === ENDGAME: Waves 31-35 ===
  
  // Wave 31: NIGHTMARE (ghost: 9*1100=9900+500=10400, brood: 3*3000=9000+500=19900)
  { waveNumber: 31, waveType: 'broodmother', announcement: '🕷️ NIGHTMARE WAVE!\nGhosts + Broodmothers!', creeps: [
    { type: 'ghost', count: 16, intervalMs: 900 },
    { type: 'broodmother', count: 5, intervalMs: 2500, delayStart: 10400 },
    { type: 'jumper', count: 16, intervalMs: 900, delayStart: 19900 }
  ]},
  
  // Wave 32: Everything standard (furball: 19*500=9500+500=10000, runner: 24*300=7200+500=17700, tank: 14*1100=15400+500=33600, shielded: 11*1200=13200+500=47300)
  { waveNumber: 32, creeps: [
    { type: 'furball', count: 30, intervalMs: 400 },
    { type: 'runner', count: 35, intervalMs: 250, delayStart: 10000 },
    { type: 'tank', count: 20, intervalMs: 900, delayStart: 17700 },
    { type: 'shielded', count: 16, intervalMs: 1000, delayStart: 33600 },
    { type: 'jumper', count: 18, intervalMs: 900, delayStart: 47300 }
  ]},
  
  // Wave 33: DIGGER MASS (digger: 19*850=16150 + 500 = 16650)
  { waveNumber: 33, waveType: 'digger', announcement: '🕳️ DIGGER MASS ASSAULT!\n25 underground burrowers!', creeps: [
    { type: 'digger', count: 25, intervalMs: 700 },
    { type: 'tank', count: 14, intervalMs: 1000, delayStart: 16650 }
  ]},
  
  // Wave 34: CHAOS (flying: 11*900=9900+500=10400, digger: 9*1000=9000+500=19900, ghost: 9*1000=9000+500=29400, brood: 3*2800=8400+500=38300)
  { waveNumber: 34, waveType: 'chaos', announcement: '⚠️ CHAOS WAVE!\nAll special creep types!', creeps: [
    { type: 'flying', count: 18, intervalMs: 700 },
    { type: 'digger', count: 14, intervalMs: 800, delayStart: 10400 },
    { type: 'ghost', count: 14, intervalMs: 800, delayStart: 19900 },
    { type: 'broodmother', count: 5, intervalMs: 2400, delayStart: 29400 },
    { type: 'tank', count: 16, intervalMs: 900, delayStart: 38300 }
  ]},
  
  // Wave 35: FINAL BOSS - Multiple groups spawn in parallel for maximum chaos
  { waveNumber: 35, waveType: 'boss', announcement: '💀 FINAL BOSS!\nSURVIVE THE ONSLAUGHT!', parallelSpawn: true, creeps: [
    { type: 'runner', count: 30, intervalMs: 300 },
    { type: 'flying', count: 18, intervalMs: 650 },
    { type: 'ghost', count: 14, intervalMs: 850 },
    { type: 'shielded', count: 16, intervalMs: 900 },
    { type: 'tank', count: 18, intervalMs: 850 },
    { type: 'broodmother', count: 5, intervalMs: 2400 },
    { type: 'boss_5', count: 1, intervalMs: 1000 }
  ]}
];
