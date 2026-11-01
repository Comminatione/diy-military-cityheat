class GameDatabase {
constructor() {
this.dbName = 'DIYMilitaryDB';
this.levelsStorageKey = 'diy_levels_progress';
this.leaderboardStorageKey = 'diy_leaderboard';
this.initDatabase();
}
initDatabase() {
const DB_VERSION = 15;
let storedVersion = 0;
try { storedVersion = parseInt(localStorage.getItem('diy_db_version') || '0'); } catch(e){}
if (storedVersion < DB_VERSION) {
let oldLevels = null;
try {
const s = localStorage.getItem('diy_levels');
if (s) oldLevels = JSON.parse(s);
} catch(e){}
const freshLevels = this.createDefaultLevels();
if (oldLevels) {
freshLevels.forEach(fresh => {
const old = oldLevels.find(l => l.id === fresh.id);
if (old) {
fresh.completed = old.completed || false;
fresh.bestScore = old.bestScore || 0;
fresh.timesPlayed = old.timesPlayed || 0;
fresh.unlocked = fresh.id === 1 ? true : (old.unlocked || false);
}
});
}
const _l3=freshLevels.find(l=>l.id===3), _l9=freshLevels.find(l=>l.id===9);
if(_l3&&_l3.completed&&_l9) _l9.unlocked=true;
this._levelStore = null;
this.levels = freshLevels;
this.saveLevels(freshLevels);
try { localStorage.setItem('diy_db_version', String(DB_VERSION)); } catch(e){}
} else {
let levelData = this.loadLevels();
if (!levelData) {
levelData = this.createDefaultLevels();
this.saveLevels(levelData);
}
const freshForMerge = this.createDefaultLevels();
levelData.forEach(level => {
const fresh = freshForMerge.find(f => f.id === level.id);
if (fresh && fresh.bossSequence) level.bossSequence = fresh.bossSequence;
});
this.levels = levelData;
}
}
createDefaultLevels() {
return [
{
id: 0,
name: ':: BOOT CAMP',
description: 'Your first deployment. 3 waves of slow recruits — the game will guide you through moving, shooting, reloading and picking up drops. Perfect for new soldiers.',
environment: 'jungle',
difficulty: 0,
minWaves: 3, maxWaves: 3,
enemyScaling: 0.3,
bossSequence: [],
isTutorialLevel: true,
completed: false, bestScore: 0, timesPlayed: 0, unlocked: true,
rewards: { xp: 50, currency: 20 }
},
{
id: 1,
name: 'ROOKIE TRAINING',
description: 'Learn the ropes in the jungle. 5 waves — finish the Commander to move on.',
environment: 'jungle',
difficulty: 1,
minWaves: 5, maxWaves: 5,
enemyScaling: 0.8,
bossSequence: ['commander'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: true,
rewards: { xp: 100, currency: 50 }
},
{
id: 2,
name: 'DESERT ASSAULT',
description: 'Desert warfare under a blazing sun. 10 waves — Commander then Armored Cars.',
environment: 'desert',
difficulty: 2,
minWaves: 10, maxWaves: 10,
enemyScaling: 1.0,
bossSequence: ['commander','cars'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 200, currency: 100 }
},
{
id: 3,
name: 'URBAN COMBAT',
description: 'City street warfare. 15 waves — Commander, Armored Cars, then Helicopter.',
environment: 'urban',
difficulty: 3,
minWaves: 15, maxWaves: 15,
enemyScaling: 1.2,
bossSequence: ['commander','cars','helicopter'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 300, currency: 150 }
},
{
id: 9,
name: 'WAR ZONE',
description: 'A burning, bombed-out district. Rubble, wrecks and collapsed towers. 15 waves — Commander, Cars, then Helicopter.',
environment: 'warzone',
difficulty: 3,
minWaves: 15, maxWaves: 15,
enemyScaling: 1.25,
bossSequence: ['commander','cars','helicopter'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 350, currency: 175 }
},
{
id: 4,
name: 'ARCTIC OFFENSIVE',
description: 'Frozen tundra. 20 waves — Commander, Cars, Helicopter, then Tank.',
environment: 'arctic',
difficulty: 3,
minWaves: 20, maxWaves: 20,
enemyScaling: 1.3,
bossSequence: ['commander','cars','helicopter','tank'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 400, currency: 200 }
},
{
id: 5,
name: 'NIGHT RAID',
description: 'Enemies glow in the dark. 25 waves — escalating to the Alien Saucer.',
environment: 'night',
difficulty: 4,
minWaves: 25, maxWaves: 25,
enemyScaling: 1.5,
bossSequence: ['commander','cars','helicopter','tank','alien'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 600, currency: 300 }
},
{
id: 6,
name: 'SPACE INFILTRATION',
description: 'Board the enemy spacecraft. 30 waves — alien forces, ending with the Fighter Jet.',
environment: 'spaceship',
difficulty: 4,
minWaves: 30, maxWaves: 30,
enemyScaling: 1.6,
bossSequence: ['commander','cars','helicopter','tank','alien','jet'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 800, currency: 400 }
},
{
id: 7,
name: 'ORBITAL DEFENSE',
description: 'Defend the orbital station. 35 waves — Saucers and Jets in deep space, with the Spider at wave 25 and a Jet to close it out.',
environment: 'spaceship',
difficulty: 5,
minWaves: 35, maxWaves: 35,
enemyScaling: 1.8,
bossSequence: ['commander','tank','alien','jet','spider','alien','jet'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 1000, currency: 500 }
},
{
id: 8,
name: 'MARS FRONTLINE',
description: 'Fight across the Martian surface. 40 waves in a rust-red storm. Final campaign mission — complete all 8 levels to unlock Endless.',
environment: 'mars',
difficulty: 5,
minWaves: 40, maxWaves: 40,
enemyScaling: 2.0,
bossSequence: ['tank','alien','jet','commander','helicopter','alien','jet','tank'],
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 1200, currency: 600 }
},
{
id: 11,
name: '▸ ROGUE PROTOCOL',
description: 'FINAL CONFRONTATION — HARM & TUG awaits. The rogue AI with spider legs and a human soul. One wave. One chance. Defeat them to earn the PLASMA CUTTER and the IRON GHOST medal.',
environment: 'spaceship',
difficulty: 7,
displayDifficulty: 'FINAL BOSS',
minWaves: 1, maxWaves: 1,
enemyScaling: 3.0,
bossSequence: ['harmtug'],
isFinalBoss: true,
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: 5000, currency: 2000 }
},
{
id: 10,
name: 'JUNGLE INFERNO',
description: 'ENDLESS MODE — Unlocked by completing all 9 levels. Infinite waves. How long can you last?',
environment: 'jungle',
difficulty: 6,
displayDifficulty: 'ENDLESS',
minWaves: 999, maxWaves: 999,
enemyScaling: 2.5,
bossSequence: ['commander','cars','helicopter','tank','alien','jet','spider'],
isEndless: true,
completed: false, bestScore: 0, timesPlayed: 0, unlocked: false,
rewards: { xp: '∞', currency: '∞' }
}
];
}
saveLevels(levelData) {
this._levelStore = JSON.parse(JSON.stringify(levelData));
try { localStorage.setItem('diy_levels', JSON.stringify(levelData)); } catch(e){}
}
loadLevels() {
if (this._levelStore) return JSON.parse(JSON.stringify(this._levelStore));
try {
const s = localStorage.getItem('diy_levels');
if (s) { this._levelStore = JSON.parse(s); return JSON.parse(JSON.stringify(this._levelStore)); }
} catch(e){}
return null;
}
updateLevel(levelId, updates) {
const level = this.levels.find(l => l.id === levelId);
if (level) {
Object.assign(level, updates);
if (level.completed) {
const nextLevel = this.levels.find(l => l.id === levelId + 1 && l.id <= 8);
if (nextLevel && !nextLevel.unlocked) {
nextLevel.unlocked = true;
}
if(levelId===3){ const _wz=this.levels.find(l=>l.id===9); if(_wz&&!_wz.unlocked) _wz.unlocked=true; }
const campaignDone = this.levels.filter(l => l.id >= 1 && l.id <= 8).every(l => l.completed);
if (campaignDone) {
const endless = this.levels.find(l => l.id === 10);
if (endless && !endless.unlocked) endless.unlocked = true;
const rogueProtocol = this.levels.find(l => l.id === 11);
if (rogueProtocol && !rogueProtocol.unlocked) rogueProtocol.unlocked = true;
}
}
this.saveLevels(this.levels);
}
}
getLevel(levelId) {
return this.levels.find(l => l.id === levelId);
}
getAllLevels() {
return this.levels;
}
saveLeaderboard(boardData) {
this._lbStore = JSON.parse(JSON.stringify(boardData));
try { localStorage.setItem('diy_leaderboard', JSON.stringify(boardData)); } catch(e){}
}
loadLeaderboard() {
if (this._lbStore) return JSON.parse(JSON.stringify(this._lbStore));
try {
const s = localStorage.getItem('diy_leaderboard');
if (s) { this._lbStore = JSON.parse(s); return JSON.parse(JSON.stringify(this._lbStore)); }
} catch(e){}
return [];
}
saveEndlessLeaderboard(boardData) {
this._lbEndlessStore = JSON.parse(JSON.stringify(boardData));
try { localStorage.setItem('diy_leaderboard_endless', JSON.stringify(boardData)); } catch(e){}
}
loadEndlessLeaderboard() {
if (this._lbEndlessStore) return JSON.parse(JSON.stringify(this._lbEndlessStore));
try {
const s = localStorage.getItem('diy_leaderboard_endless');
if (s) { this._lbEndlessStore = JSON.parse(s); return JSON.parse(JSON.stringify(this._lbEndlessStore)); }
} catch(e){}
return [];
}
clearAllData() {
this._levelStore = null;
this._lbStore = null;
this._lbEndlessStore = null;
try {
localStorage.removeItem('diy_levels');
localStorage.removeItem('diy_leaderboard');
localStorage.removeItem('diy_leaderboard_endless');
localStorage.removeItem('diy_db_version');
localStorage.removeItem('diy_best_combo');
localStorage.removeItem('diy_boss_kills_total');
} catch(e){}
this.initDatabase();
}
}
const gameDB = window.gameDB = new GameDatabase();