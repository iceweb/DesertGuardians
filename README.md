<p align="center">
  <img src="screenshot.png" alt="Desert Guardians - Tower Defense Game" width="900"/>
</p>

<h1 align="center">🏰 Desert Guardians</h1>

<p align="center">
  <strong>A tower defense game built entirely through AI collaboration — zero manual coding.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Phaser-3.x-purple?style=for-the-badge&logo=phaser&logoColor=white" alt="Phaser"/>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Built%20with-Claude%20Opus-orange?style=for-the-badge" alt="Claude Opus"/>
</p>

<p align="center">
  <a href="#-play-now">Play Now</a> •
  <a href="#-about">About</a> •
  <a href="#-the-experiment">The Experiment</a> •
  <a href="#-features">Features</a> •
  <a href="#-towers">Towers</a> •
  <a href="#-installation">Installation</a>
</p>

---

## 🎮 Play Now

**[🏰 Play Desert Guardians](https://iceweb.ch/dg/)** — No download required!

Defend your castle against 35 waves of enemies. Can you reach the global leaderboard?

---

## 📖 About

**Desert Guardians** is an Egyptian/desert-themed tower defense game where you defend your castle against waves of increasingly dangerous creeps. Build towers, upgrade your defenses, manage gold mines, and survive all 35 waves to claim victory.

But here's the twist: **not a single line of code was written manually**.

This project continues an experiment to stress test how far today's Gen AI models can really go in software development.

> *"Zero manual coding. 100% vibe coding."*

---

## 🧪 The Experiment

### The Goal
Build a complete, polished browser game — including a global leaderboard backend — **without writing any code manually**. Just pure AI collaboration.

### The Evolution

| Project | Type | Model | Result |
|:--------|:-----|:------|:-------|
| **Swiss Adventure** | Platformer (Python/Pygame) | Claude Opus | ✅ Full game with global scores |
| **Desert Guardians** | Tower Defense (TypeScript/Phaser) | Claude Opus | ✅ Complex strategy game with 6 tower types, 35 waves, global leaderboard |

### Why Tower Defense?

Tower defense games are significantly more complex than platformers:
- **Strategic depth** — Multiple tower types with upgrade paths
- **Enemy variety** — Different creep abilities (armor, shields, jumping, bosses)
- **Resource management** — Gold economy, tower selling, gold mines
- **Balancing** — 35 waves of carefully tuned difficulty progression
- **State management** — Tracking dozens of entities simultaneously

> *"If AI can build a tower defense game, it can build most business applications."*

---

## ✨ Features

### 🏰 Core Gameplay
- **35 Waves** of increasingly difficult enemies
- **6 Tower Types** with unique abilities and upgrade paths
- **Gold Mine System** — Build and upgrade mines for passive income
- **Castle Defense** — Protect your 25 HP from leaking creeps
- **Victory & Defeat** — All runs can submit to the global leaderboard

### 🎯 Strategic Elements
- **Tower Placement** — Strategic positioning matters
- **Upgrade Decisions** — Level up towers for increased power
- **Gold Management** — Balance between towers and gold mines
- **Wave Previews** — See what's coming next to prepare your defense

### 🏆 Scoring System
- **Wave Bonus** — 100 points per wave reached
- **Gold Bonus** — 0.2× total gold earned
- **HP Bonus** — 100 points per HP remaining
- **Time Multiplier** — Up to 1.5× for fast completion

### 🌐 Global Competition
- **Global Leaderboard** — Top 20 scores worldwide
- **Local Scores** — Offline fallback with localStorage
- **Anti-Cheat** — Server-side score validation

### 🎨 Polish
- Egyptian/desert themed graphics
- Animated tower attacks and creep movements
- Particle effects and visual feedback
- Background music and sound effects
- Castle destruction animation on defeat

---

## 🗼 Towers

| Tower | Specialty | Upgrades To |
|:------|:----------|:------------|
| 🏹 **Archer** | Balanced damage, good range | Rapid Fire, Sniper |
| ⚡ **Rapid Fire** | Fast attacks, lower damage | — |
| 🎯 **Sniper** | High damage, long range, slow | — |
| 💣 **Cannon** | Splash damage, slow | — |
| ❄️ **Ice Tower** | Slows enemies | — |
| ☠️ **Poison Tower** | Damage over time | — |
| ✨ **Aura Tower** | Buffs nearby towers | — |

---

## 👾 Enemies

| Type | Ability |
|:-----|:--------|
| **Standard** | Basic creep |
| **Fast** | Moves quickly |
| **Tank** | High HP, slow |
| **Armored** | Reduces damage taken |
| **Shielded** | Blocks first few hits |
| **Jumper** | Can leap past towers |
| **Guards** | Escort boss creeps |
| **Bosses** | Powerful, deal 2 damage if leaked |

---

## 💻 Installation

### Option 1: Play Online (Recommended)
Visit **[https://iceweb.ch/dg/](https://iceweb.ch/dg/)** — works in any modern browser!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/desert-guardians.git
cd desert-guardians

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Requirements
- Node.js 18+
- npm or pnpm

---

## 📁 Project Structure

```
Desert Guardians/
├── src/
│   ├── main.ts              # Entry point
│   ├── data/                # Game configuration & tower data
│   ├── graphics/            # Tower and creep animations
│   ├── managers/            # Core game systems
│   │   ├── WaveManager.ts   # Wave spawning logic
│   │   ├── TowerManager.ts  # Tower placement & upgrades
│   │   ├── CreepManager.ts  # Enemy management
│   │   ├── CombatManager.ts # Targeting & damage
│   │   └── HighscoreAPI.ts  # Global leaderboard client
│   ├── objects/             # Game entities (towers, creeps, projectiles)
│   └── scenes/              # Phaser scenes (Menu, Game, Results)
├── public/
│   └── assets/              # Images, audio, maps
├── server/                  # Backend API (PHP)
│   ├── api.php              # Highscore endpoints
│   ├── config.template.php  # Configuration template
│   └── init_db.php          # Database setup
└── docs/                    # Design documents
```

---

## 🔧 Server Setup (For Self-Hosting)

1. Copy `server/config.template.php` to `server/config.php`
2. Update database credentials and secret key
3. Upload `server/` folder to your PHP host
4. Run `init_db.php` once to create tables
5. Delete `init_db.php` from server
6. Update `API_URL` in `src/managers/HighscoreAPI.ts`

---

## 💡 Food for Thought

This project demonstrates that **complex, strategic games** can be built through AI collaboration:

- A tower defense game involves more moving parts than many business applications
- The codebase is clean, maintainable, and follows best practices
- Bug fixing was fast — most issues resolved in 1-2 prompts
- The development experience was **genuinely fun**

> *"If your team isn't experimenting with AI-assisted development, you're leaving productivity on the table."*

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Mike Blöchlinger**

- This game was created as an experiment in AI-assisted development
- © 2026 Mike Blöchlinger

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️%20and%20AI-red?style=for-the-badge" alt="Made with love and AI"/>
</p>

<p align="center">
  <strong>🏜️ Built in the desert... by AI 🤖</strong>
</p>
