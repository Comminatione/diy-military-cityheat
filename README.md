# D.I.Y. MILITARY — City Heat Edition (Mobile)

An intense pixel-art, top-down rogue-lite shooter featuring procedural maps, supply drops, multi-phase boss battles, dynamic synthesized audio, and touch-optimized twin-stick controls.

## Repository Architecture

```
diy-military/
├── src/
│   ├── css/
│   │   └── style.css            # Extracted UI, tokens, and theme stylesheets
│   ├── js/                      # 43 modularized engine and gameplay scripts
│   │   ├── 04-audio-manager.js  # Procedural Web Audio API sound generator
│   │   ├── 06-game-database.js  # IndexedDB state and statistics persistence
│   │   ├── 07-engine-bootstrap  # Core generator registry
│   │   ├── 12-23-enemies/       # Specific enemy AI logic (Soldier, Berserker, etc.)
│   │   └── ...
│   └── body.html                # HUD, canvas, cutscenes, and modal overlays
├── www/                         # Static deployable web root for Capacitor & PWA
│   ├── index.html               # Assembled HTML linking clean CSS & JS modules
│   ├── css/
│   └── js/
├── capacitor.config.ts          # Native wrapper configuration (com.diymilitary.cityheat)
├── package.json                 # Project scripts and Capacitor dependencies
└── build-modular.js             # Rebuilder tool that regenerates www from src
```

## Quick Start

### 1. Run in Browser / Local Test
```bash
npx serve www
```

### 2. Install Dependencies & Build Android Project
```bash
npm install
npx cap add android
npx cap sync
```

### 3. Open in Android Studio / Build APK
```bash
npx cap open android
```
Or build from command line:
```bash
cd android && ./gradlew assembleDebug
```
