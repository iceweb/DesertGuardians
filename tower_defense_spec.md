# Tower Defense Game Specification: "Desert Guardians"

## 1. Project Overview

*   **Game Genre**: Tower Defense with fixed creep pathing.
*   **Theme**: Arabic/Oriental Desert (Dunes, Ruins, Palm Trees, Castle).
*   **Creeps**: Cuddly, furry creatures from another world.
*   **Platform**: Web (Desktop & Mobile).
*   **Resolution**: 1280x720 logical resolution (responsive scaling).
*   **Engine/Stack**: TypeScript, Vite, Phaser 3, Tiled, Howler.js.

### Tech Stack Constraints
*   **Language**: TypeScript (Strict Mode).
*   **Build**: Vite.
*   **Framework**: Phaser 3 (WebGL).
*   **Level Editor**: Tiled (JSON export).
*   **Audio**: Howler.js.
*   **Animation**: Phaser Animations + Sprite Sheets (Texture Packer/Free tools). / No Spine.
*   **Physics**: Arcade Physics (Lightweight) or Custom Circle/Rect collision logic for performance.

---

## 2. Core Game Loop & Rules

### Progression
*   **Structure**: Single continuous run. 1 Map.
*   **Waves**: 25 Total.
*   **Start**:
    *   Wave 1 is started manually by the player.
    *   Waves 2-25 start automatically immediately after the last creep of the previous wave dies or reaches the castle.
    *   *User Experience*: A short 3-second countdown UI appears before the next wave spawns, with a "Skip" button to start immediately (if logic allows, or strictly auto-start as per "auto-start only after previous ends").
    *   *Clarification*: Requirement says "start automatically only after the previous wave fully ends". We will adhere to this. No overlapping waves.

### Win / Lose Conditions
*   **Castle HP**: 10 Health Points.
*   **Lose Condition**: Castle HP <= 0. Trigger "Defeat" Results Screen.
*   **Win Condition**: Wave 25 completed (all creeps dead) AND Castle HP > 0. Trigger "Victory" Results Screen.
*   **Leak Mechanics**: 1 Creep reaching end of path = 1 Damage to Castle HP.

---

## 3. Highscore System

### Scoring Formula
The score is calculated at the end of the run (Win or Lose).

$$ \text{FinalScore} = (\text{BaseScore} + \text{GoldScore}) \times \text{HP\_Multiplier} \times \text{Time\_Multiplier} $$

*   **Base Score**: 1000 points per wave completed.
*   **Gold Score**: Total Gold Collected throughout run (spent + unspent) $\times 10$.
*   **HP Multiplier**: $1 + (\text{CurrentHP} / 10)$. (Max 2.0x w/ full health).
*   **Time Multiplier**:
    *   Target Time = 15 minutes (900 seconds).
    *   If $\text{RunTime} \leq 900$: Multiplier = $1.5$.
    *   If $\text{RunTime} > 900$: Multiplier = $\max(1.0, 1.5 - \frac{\text{RunTime} - 900}{1800})$. (Decays over next 30 mins).

*Tie-Breaker*: 1. Score (Desc), 2. HP Remaining (Desc), 3. Total Time (Asc).

### Persistence
*   **Storage**: `localStorage`. Key: `tower_defense_highscores`.
*   **Data Structure**:
    ```typescript
    interface Highscore {
      playerName: string;
      score: number;
      waveReached: number;
      date: number; // Timestamp
      runStats: { hpLeft: number, goldEarned: number, timeSeconds: number };
    }
    ```
*   **UI**: Show Top 10 + Player's Personal Best.

---

## 4. Economy

*   **Currency**: Gold coins.
*   **Starting Gold**: 150 (Enough for 2 base towers or 1 upgrade).
*   **Sources**:
    *   Creep Kill: Varies by creep type (e.g., 5 - 50 gold).
    *   Wave Completion Bonus: 10% of current bank interest (capped at 50 gold) to encourage saving.
*   **Sinks**: Building Towers, Upgrading Towers.
*   **Refund**: Selling a tower refunds 70% of total investment.

---

## 5. Towers

### Placement
*   **Constraints**: Towers can be placed freely anywhere on the map **except on the path**. Towers cannot overlap with each other.
*   **Path Exclusion Zone**: A buffer zone around the path polyline (configurable, default ~40px) prevents tower placement too close to the creep route.
*   **Collision Detection**: Before placement, validate that the tower footprint does not intersect with:
    1.  The path exclusion zone (path polyline + buffer).
    2.  Any existing tower's bounding box.
*   **Mechanic**: Click anywhere valid -> Show tower placement ghost/preview. Click to confirm placement and open Build Menu. Click existing tower -> Open Upgrade/Sell Menu.
*   **Visual Feedback**: 
    *   Green ghost = valid placement.
    *   Red ghost = invalid placement (on path or overlapping tower).

### Build/Upgrade Rules
*   **Standard Build**: The only tower that can be placed directly is the **Archer Tower (Standard)**.
*   **Branch Upgrades**: A built Archer Tower can be upgraded into exactly one branch: Rapid Fire, Sniper, Rock Cannon, Ice Tower, or Poison Tower.
*   **Tiering**: Each tower (including the branch choice) supports two upgrade tiers: Level 1 -> Level 2.
*   **Example Path**: Archer (Standard) L1 -> Sniper L1 -> Sniper L2.
*   **Restrictions**: Branch choice is locked after selection; selling always refunds 70% of total spend.

### Tower Types (Stats Table)

All branches share the same build flow: Build Archer (Standard) Level 1, then upgrade to the chosen branch at Level 1, then upgrade that branch to Level 2.

| Tower | Type | Range (px) | Fire Rate (ms) | Dmg | Cost (Build / L1->L2) | Special Effect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Archer (Standard)** | Physical | 200 | 800 | 10 | 70 / 90 | Basic single target. Enables branching. |
| **Rapid Fire** | Physical | 180 | 300 | 6 | 120 / 140 | High DPS, low dmg per hit. Weak vs Armor. |
| **Sniper** | Physical | 450 | 2000 | 60 | 150 / 170 | High dmg per hit. Crit 20% (2x dmg). Priority: High HP. |
| **Rock Cannon** | Physical | 220 | 1500 | 25 | 140 / 160 | Splash Radius: 100px. |
| **Ice Tower** | Magic | 180 | 1000 | 8 | 130 / 150 | Slows target by 40% for 2s. No stacking. |
| **Poison** | Magic | 200 | 1200 | 5 | 130 / 150 | DoT: 5 dmg/sec for 5s. Stacks up to 3 times. |

*Note: Level 2 upgrades generally increase damage by ~50% and modestly improve range/rate. Costs shown are branch-upgrade costs (Archer build is always first).* 

---

## 6. Creeps & Difficulty

### Armor System (Option B: Flat Reduction)
*   **Mechanic**: `DamageTaken = max(1, IncomingDamage - ArmorValue)`.
*   **Counterplay**: Rapid Fire (low dmg) is terrible against Armor. Sniper (high dmg) is effective. Magic towers (Ice/Poison) **ignore** armor.

### Special Abilities (Waves 23-25)
1.  **Jumper**: Every 4 seconds, leaps forward 150px along the path. VFX: Dust cloud. Tell: flashes white for 0.5s before jump.
2.  **Shielded**: Spawns with a mystical shield blocking the first 3 hits completely. VFX: Blue bubble. Multi-hit towers (Rapid Fire) break this fast.

### Creep Types
1.  **Furball** (Basic): low HP, Avg spd.
2.  **Runner** (Fast): Low HP, High spd.
3.  **Tank** (Armored): High HP, Slow, Armor: 4.
4.  **Boss** (Wave 10/20): Huge HP, Slow.
5.  **Elite Jumper**: Med HP, Jump Ability.
6.  **Elite Shield**: Med HP, Shield Ability.

### Wave Balance Table (Sample)
*   **Wave 1**: 10 Furballs (Interval 1500ms).
*   **Wave 5**: 15 Runners (Interval 800ms).
*   **Wave 10**: 1 Boss + 10 Furballs.
*   **Wave 15**: 5 Tanks (Armor check).
*   **Wave 20**: 2 Bosses.
*   **Wave 23-25**: Mixed Elites + Boss Finales.

---

## 7. Map & Tiled Authoring

### Layer Structure
1.  **Background**: Sand texture, dunes.
2.  **Path**: The visible dirt road tiles.
3.  **Decoration**: Palm trees, rocks (non-colliding visual).
4.  **Foreground**: Overlays like clouds or high banners.

### Object Layers
1.  **GameMetadata**:
    *   `Spawn`: Point object.
    *   `Goal`: Point object (Castle).
    *   `Path`: Polyline object defining the exact center-line of movement.

### Path Exclusion System
*   **Purpose**: Define the "no-build zone" around the creep path.
*   **Implementation**: The path polyline is expanded by a configurable buffer distance (default 40px) to create an exclusion polygon.
*   **Runtime Calculation**: Use point-to-line-segment distance checks for efficient collision detection.
*   **Note**: No `BuildPad` objects are needed since placement is free-form.

---

## 8. Architecture & Data

### Phaser Scenes
1.  `BootScene`: Load JSON config.
2.  `PreloadScene`: Load images, atlas, audio.
3.  `MenuScene`: Title, Highscores (LocalStorage), Settings.
4.  `GameScene`: Main loop.
    *   **Systems**: WaveManager, TowerManager, CreepManager, ProjectileManager, EconomyManager.
5.  `UIScene`: Overlay HUD. Pass events via `Registry` or `Events`.
6.  `ResultsScene`: Win/Loss state, calc score.

### Managers (Interfaces)
*   `WaveManager`: Handles JSON wave config, timers, spawning logic.
*   `PathMovement`: Interpolates position along Tiled polyline. Calculates distance remaining (for targeting priority).
*   `TowerManager`: Handles placing, selecting, upgrading, selling towers.
*   `CreepManager`: Manages Object Pool of Creeps. Updates status/health.
*   `ProjectileManager`: Manages Object Pool of Bullets. Handles collision callbacks.

### Data Schemas

**Wave Definition**
```typescript
interface WaveDef {
  waveNumber: number;
  creeps: {
    type: string; // 'furball', 'tank'
    count: number;
    intervalMs: number;
    delayStart?: number;
  }[];
}
```

**Tower Definition**
```typescript
interface TowerConfig {
  key: string;
  name: string;
  levels: {
    1: TowerStats;
    2: TowerStats;
  };
}
```

---

## 9. UI & Assets

### UI Requirements
*   **HUD Top**: Castle HP (Heart Icons/Bar), Wave X/25, Gold.
*   **HUD Bottom/Side**: Sell Button (contextual), Upgrade Button (contextual).
*   **Wave Timer**: Centered text "Next Wave in 3.." + [Skip >] button.
*   **Floating Text**: Gold gain (+15), Damage numbers (crit red, poison green).

### Audio
*   **Music**: `Desert_Theme.mp3`.
*   **SFX Sprite**: `sfx.json` (shoot_arrow, shoot_cannon, hit_flesh, hit_armor, build_thud, ui_click, wave_start).

### Visual Style
*   **Creeps**: 64x64 sprites. Walking animation (4-8 frames). Flip X for direction.
*   **Towers**: 64x128 sprites. Base + Turret head separation if possible (rotates to target).
*   **VFX**:
    *   Dust particles on walk.
    *   Hit flash (tint white).
    *   Projectile trails (Phaser Graphics or Particles).

---

## 10. Implementation Plan (AI Steps)

This plan is designed to be executed sequentially.

### Step 1: Core Setup & Boilerplate
*   **Goal**: Working Phaser instance with empty scenes.
*   **Actions**:
    *   Initialize Vite project with TypeScript.
    *   Install `phaser`, `howler`.
    *   Create Directory Structure (`src/scenes`, `src/objects`, `src/managers`, `public/assets`).
    *   Implement `BootScene` and `PreloadScene` (load placeholder assets).
    *   Implement `MenuScene` (start button) and `GameScene` (black screen).
*   **Deliverable**: Run `npm run dev` and see a game canvason screen.

### Step 2: Map & Pathing System
*   **Goal**: Render Tiled map and visualize the creep path.
*   **Actions**:
    *   Create a simple Tiled map (`level1.json`) with layers and a Polyline path.
    *   Implement `MapManager` to load Tilemap.
    *   Implement `PathSystem`: Parse polyline into points/curves.
    *   Debug: Draw the path line using Phaser Graphics to verify coordinate correctness.
*   **Deliverable**: Map renders, path line is visible.

### Step 3: Creep & Wave Foundation
*   **Goal**: Creeps following the path.
*   **Actions**:
    *   Create `Creep` class (extends `Phaser.Physics.Arcade.Sprite` or `Phaser.GameObjects.Sprite`).
    *   Implement movement logic: `update()` moves creep along polyline vectors at `speed`.
    *   Implement `WaveManager`: Read simple hardcoded wave config (Wave 1).
    *   Implement Object Pooling for creeps.
*   **Deliverable**: Creeps spawn at start, follow line to castle, and disappear.

### Step 4: Tower Architecture & Placement
*   **Goal**: Place towers freely anywhere outside the path.
*   **Actions**:
    *   Implement `PlacementValidator`: Check if position is outside path exclusion zone.
        *   Calculate distance from placement point to each path segment.
        *   Reject if distance < path buffer (40px) + tower radius.
    *   Implement `TowerCollisionCheck`: Ensure no overlap with existing towers.
    *   Create `Tower` class base with bounding box for collision.
    *   Implement `TowerManager`: Handle Input (Pointer Down anywhere on map).
    *   UI: Show placement ghost preview (green=valid, red=invalid).
    *   Implement click-to-place confirmation flow.
*   **Deliverable**: Click anywhere valid -> Tower placement ghost appears -> Click to confirm -> Tower sprite placed.

### Step 5: Combat & Economy Loop
*   **Goal**: Towers shoot creeps, kill them, gain gold.
*   **Actions**:
    *   Implement `targeting` logic in Tower (Find closest creep in range).
    *   Create `Projectile` class + Pooling.
    *   Implement `Damage` system: Projectile hits Creep -> Reduce HP -> Die if < 0.
    *   Economy: Player Gold state. Deduct on build, Add on kill. Update HUD text.
*   **Deliverable**: Playable "endless" loop of killing basic creeps.

### Step 6: Castle Health & Game Flow
*   **Goal**: Win/Lose states and specific Wave logic.
*   **Actions**:
    *   Implement Castle logic: Creep reaches end -> HP -1. Destroy creep.
    *   Implement Game Over check (HP <= 0).
    *   Implement `UIScene`: Health bar, current wave count, next wave timer + Skip button.
    *   Connect WaveManager to UI (events).
*   **Deliverable**: Full loop: Start -> Play -> Lose/Win.

### Step 7: Tower Variations & Upgrades
*   **Goal**: Implement branching upgrades from the single buildable tower (Archer) into 5 tower types with two levels each.
*   **Actions**:
    *   Implement `TowerFactory` supporting build of Archer (Standard) only; branching upgrades unlock Rapid, Sniper, Rock Cannon, Ice, Poison.
    *   Enforce branch lock-in after the first upgrade choice; upgrades allow Level 1 -> Level 2 within that branch.
    *   Implement specific projectile logic (Splash for Rock Cannon, Slow for Ice, DoT for Poison, crit for Sniper, high rate for Rapid).
    *   Create `UpgradeUI`: On clicking a tower, show branch choices if unbranched; show Level 2 upgrade and Sell when branched.
*   **Deliverable**: Archer placement works; branching and Level 2 upgrades function for all five types.

### Step 8: Advanced Enemies & Stats
*   **Goal**: Armor, Shields, Jumps.
*   **Actions**:
    *   Update `Creep` class to support `armor` (flat reduction).
    *   Implement `StatusEffects` manager (Poison DoT, Slow timers).
    *   Implement special abilities (Jump logic, Shield HP).
    *   Data: Populate full stats for definitions.
*   **Deliverable**: Mechanical depth fully functional.

### Step 9: Highscore & Persistence
*   **Goal**: Save/Load scores, Scoring formula.
*   **Actions**:
    *   Implement `ScoreManager`: Track time and gold.
    *   Implement `ResultsScene`: Calculate formula, input name, save to `localStorage`.
    *   Update `MenuScene`: Render highscore table.
*   **Deliverable**: Leaderboard and run tracking.

### Step 10: Final Config, Audio & Polish
*   **Goal**: The "Game" feel.
*   **Actions**:
    *   Populate `WaveConfig` with all 25 waves (balancing).
    *   Integrate `Howler.js`: Play BGM, hook up SFX to events.
    *   Add visual polish: Particle effects, camera shake on castle damage.
    *   Final assets pass (ensure all placeholders replaced).
*   **Deliverable**: Release candidate.

---

## 11. Assumptions & Risks

### Assumptions
*   **Assets**: We assume use of Kenny Assets (Tower Defense) or similar CC0 assets for the MVP to ensure free commercial use.
*   **Audio**: We assume standard Web Audio API support via Howler.
*   **Performance**: Targeting 60FPS on mid-range devices. Object pooling is mandatory.

### Risks
*   **Pathing Precision**: Polyline navigation can look jerky if turn radius isn't handled. *Mitigation*: Use strict vector lerping or Catmull-Rom splines if Phaser paths feel too rigid.
*   **Balance**: 25 Waves is a lot to balance without playtesting. *Mitigation*: Provide a "Debug God Mode" (infinite gold) in code to fast-forward test waves.
