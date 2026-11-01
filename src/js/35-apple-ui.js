(function appleUIEnhancement() {
const isMobile = /Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || ('ontouchstart' in window);
const style = document.createElement('style');
style.textContent = '';
document.head.appendChild(style);
const $ = id => document.getElementById(id);
const _makeEl = (tag, cls, html) => {
const e = document.createElement(tag);
if (cls) e.className = cls;
if (html) e.innerHTML = html;
return e;
};
const _alienAlreadyUnlocked = (() => { try { return localStorage.getItem('diy_unlocked_alien') === '1'; } catch(e) { return false; } })();
const CHARS = [
{ id: 'soldier', emoji: '', name: 'Soldier', stat: 'Balanced' },
{ id: 'commando', emoji: '◎', name: 'Commando', stat: 'Fast' },
{ id: 'elite', emoji: '▣', name: 'Elite', stat: 'Tankiest' },
{ id: 'sniper', emoji: '', name: 'Sniper', stat: '+Rifle DMG' },
{ id: 'heavy', emoji: '', name: 'Heavy', stat: '+Minigun' },
{ id: 'medic', emoji: '+', name: 'Medic', stat: 'Regen HP' },
{ id: 'alien', emoji: 'A', name: 'Alien', stat: _alienAlreadyUnlocked ? '+Speed +Laser' : 'Wave 10', locked: !_alienAlreadyUnlocked },
];
const LEVELS = (typeof gameDB !== 'undefined' ? gameDB.getAllLevels() : [])
.filter(l => !l.isEndless && l.id !== 0)
.sort((a,b) => a.id - b.id)
.map(l => {
const envEmoji = { jungle:'', desert:'', urban:'', arctic:'', night:'', spaceship:'▲', mars:'●', warzone:'✸' };
const envLabel = { jungle:'Jungle', desert:'Desert', urban:'City', arctic:'Arctic', night:'Night', spaceship:'Orbit', mars:'Mars', warzone:'War Zone' };
return {
id: 'lvl_' + l.id,
numericId: l.id,
name: l.name,
env: (envEmoji[l.environment]||'◆') + ' ' + (envLabel[l.environment]||l.environment),
emoji: envEmoji[l.environment] || '◆',
unlocked: l.unlocked,
isFinalBoss: !!l.isFinalBoss,
};
});
const TIPS = [
{ icon: '^', title: 'Between Waves', text: 'After each wave, pick an upgrade — stack combos like Pierce + Explosive for bonus effects.' },
{ icon: '▪', title: 'Grenades Save Lives', text: 'Throw grenades into groups. Your left thumb can reach the ▪ button easily.' },
{ icon: '⟳', title: 'Reload Smart', text: 'Reload behind cover. Running out of ammo mid-fight is the #1 cause of death.' },
{ icon: '<svg class="ico"><use href="#ico-play"/></svg>', title: 'Switch Weapons', text: 'Swipe the bottom strip to cycle weapons. Shotgun is great at close range.' },
{ icon: '#1', title: 'Prestige XP', text: 'Every run earns XP. Level up to unlock Mutators and Armory slots permanently.' },
];
const menuShell = _makeEl('div', '');
menuShell.id = 'apple-menu-shell';
menuShell.setAttribute('aria-label', 'Game Menu');
menuShell.innerHTML = `
<div class="ams-hero">
<div class="ams-title">D.I.Y. MILITARY</div>
<div class="ams-sub">City Heat Edition · Nova City · 2031</div>
<div id="ams-prestige-badge" style="display:none;align-items:center;gap:6px;margin-top:10px;background:rgba(120,255,0,0.08);border:1px solid rgba(120,255,0,0.18);border-radius:20px;padding:5px 14px;">
<span style="font-size:12px;display:inline-flex;"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
<span style="font-family:var(--sf);font-size:11px;font-weight:600;color:rgba(120,200,40,0.7);letter-spacing:0.5px;" id="ams-prestige-text">Prestige Lv.1</span>
<span style="font-family:var(--sf);font-size:10px;color:rgba(80,140,20,0.4);" id="ams-prestige-xp"></span>
<span class="ams-info-dot" id="ams-prestige-info-dot">i<span class="ams-info-popover">XP earned every run. Leveling up unlocks permanent rewards like bonus HP, grenades, and Armory items.</span></span>
</div>
<div id="ams-streak-badge" style="display:none;align-items:center;gap:6px;margin-top:8px;background:rgba(255,140,0,0.08);border:1px solid rgba(255,140,0,0.22);border-radius:20px;padding:5px 14px;">
<span style="font-size:12px;display:inline-flex;"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="13" height="13"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span>
<span style="font-family:var(--sf);font-size:11px;font-weight:600;color:rgba(255,160,40,0.8);letter-spacing:0.5px;" id="ams-streak-text">0 Day Streak</span>
</div>
<div id="ams-roulette-badge" style="display:none;align-items:center;gap:6px;margin-top:8px;background:rgba(255,170,0,0.1);border:1px solid rgba(255,170,0,0.3);border-radius:20px;padding:5px 14px;cursor:pointer;touch-action:manipulation;">
<span style="font-size:12px;display:inline-flex;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="color:#ffaa00;"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.1" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.1" fill="currentColor" stroke="none"/></svg></span>
<span style="font-family:var(--sf);font-size:11px;font-weight:600;color:rgba(255,180,60,0.9);letter-spacing:0.5px;" id="ams-roulette-text">Daily Roulette Active</span>
<span class="ams-info-dot" id="ams-roulette-info-dot">i<span class="ams-info-popover">A free mutator combo picked for today, active automatically in Endless mode. Everyone gets the same one — it resets tomorrow. Tap this badge to jump to Endless.</span></span>
</div>
<div class="ams-divider"></div>
</div>
<div class="ams-content">

<div id="ams-new-player-tip" style="display:none;width:100%;background:rgba(0,30,10,0.9);border:1px solid rgba(120,255,0,0.22);border-radius:10px;padding:10px 12px;margin-bottom:10px;text-align:left;">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
<span style="font-family:var(--sf);font-size:10px;font-weight:600;letter-spacing:1.5px;color:rgba(120,255,0,0.8);">QUICK REFERENCE</span>
<span id="ams-tip-dismiss" style="cursor:pointer;color:rgba(80,140,20,0.5);font-size:14px;line-height:1;padding:2px 4px;touch-action:manipulation;">×</span>
</div>
<div style="font-family:var(--sf);font-size:10px;color:rgba(120,180,60,0.75);line-height:1.6;">
<strong style="color:rgba(120,255,0,0.85);">Prestige</strong> — XP you earn every run, levels up permanent rewards.<br>
<strong style="color:rgba(120,255,0,0.85);">Armory &amp; Daily Challenges</strong> — unlock once you reach Wave 3.<br>
<strong style="color:rgba(120,255,0,0.85);">Mutators</strong> — optional run modifiers, unlock after your first Endless run.
</div>
</div>

<div class="ams-resume-banner" id="ams-resume-banner">
<div class="ams-resume-info">
<div class="ams-resume-label" style="display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="flex-shrink:0;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Continue Run</div>
<div class="ams-resume-wave" id="ams-resume-wave-text">Wave —</div>
<div style="font-family:var(--sf);font-size:10px;color:rgba(0,180,140,0.45);margin-top:1px;" id="ams-resume-detail"></div>
</div>
<button class="ams-resume-btn" id="ams-resume-btn">Resume</button>
</div>

<button class="ams-deploy-btn" id="ams-deploy-btn">
<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="18" height="18" style="flex-shrink:0;"><path d="M4.5 3.5l16 8.5-16 8.5v-17z"/></svg>
<span>Deploy Now</span>
</button>

<div class="acard" id="acard-char">
<div class="acard-header" data-card="char">
<div class="acard-title-row">
<div class="acard-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
<div>
<div class="acard-title">Operative</div>
<div class="acard-subtitle" id="acard-char-sub">Soldier — Balanced</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner">
<div class="char-grid" id="ams-char-grid"></div>

<div class="skin-selector">
<div class="skin-selector-label">Skin Tone</div>
<div class="skin-swatches" id="ams-skin-swatches"></div>
</div>

<div class="skin-selector" data-legacy-id="ams-outfit-section">
<div class="skin-selector-label">Outfit Color</div>
<div class="skin-swatches" id="ams-color-swatches"></div>
</div>

<div class="skin-selector" style="margin-top:10px;">
<div class="skin-selector-label">Accent Color</div>
<div class="skin-swatches" id="ams-accent-swatches"></div>
</div>

<div id="ams-alien-face-row" style="display:none;margin-top:14px;padding-top:12px;border-top:1px solid rgba(200,128,255,0.18);text-align:center;">
<div style="font-family:var(--sf);font-size:10px;color:rgba(200,128,255,0.8);letter-spacing:2px;margin-bottom:10px;">A PUT YOUR FACE ON THE ALIEN</div>
<div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
<label id="ams-face-upload-btn" style="background:rgba(60,0,80,0.7);border:1px solid rgba(200,128,255,0.6);color:rgba(200,128,255,0.9);font-family:var(--sf);font-size:12px;font-weight:600;padding:10px 20px;border-radius:10px;cursor:pointer;touch-action:manipulation;letter-spacing:0.5px;position:relative;">
Upload Face
<input type="file" id="ams-face-upload-input" accept="image/*" style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:0;pointer-events:auto;">
</label>
<div id="ams-face-preview" style="display:none;width:56px;height:68px;border:2px solid rgba(200,128,255,0.7);border-radius:50% 50% 45% 45% / 55% 55% 45% 45%;overflow:hidden;flex-shrink:0;box-shadow:0 0 12px rgba(200,128,255,0.35);background:#0a0018;">
<img id="ams-face-preview-img" style="width:100%;height:100%;object-fit:cover;object-position:center 10%;">
</div>
<button id="ams-face-clear-btn" style="display:none;background:transparent;border:1px solid rgba(180,0,80,0.5);color:rgba(180,80,120,0.8);font-family:var(--sf);font-size:11px;padding:6px 12px;border-radius:8px;cursor:pointer;touch-action:manipulation;">X Remove</button>
</div>
</div>
</div>
</div>
</div>

<div class="acard" id="acard-level">
<div class="acard-header" data-card="level">
<div class="acard-title-row">
<div class="acard-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg></div>
<div>
<div class="acard-title">Mission</div>
<div class="acard-subtitle" id="acard-level-sub">Endless Mode</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner">
<div class="level-grid" id="ams-level-grid"></div>
</div>
</div>
</div>

<div class="acard" data-legacy-id="acard-tips">
<div class="acard-header" data-card="tips">
<div class="acard-title-row">
<div class="acard-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
<div>
<div class="acard-title">How To Play</div>
<div class="acard-subtitle">Tips & Controls</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner" id="ams-tips-body"></div>
</div>
</div>

<div class="acard" id="acard-settings">
<div class="acard-header" data-card="settings">
<div class="acard-title-row">
<div class="acard-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
<div>
<div class="acard-title">Settings</div>
<div class="acard-subtitle">Sound, Difficulty & More</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner">

<div class="asetting-row">
<div class="asetting-left" style="flex:1;">
<span class="asetting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg></span>
<div>
<div class="asetting-label">Theme</div>
<div class="asetting-sublabel">Day or night display mode</div>
</div>
</div>
<div class="aseg-control" style="width:120px;flex-shrink:0;">
<button class="aseg-btn" id="aset-theme-day">Day</button>
<button class="aseg-btn" id="aset-theme-night">Night</button>
</div>
</div>

<div class="asetting-row">
<div class="asetting-left" style="flex:1;">
<span class="asetting-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
<div>
<div class="asetting-label">Difficulty</div>
<div class="asetting-sublabel">Affects enemy health &amp; damage</div>
</div>
</div>
<div class="aseg-control" id="aset-diff" style="width:150px;flex-shrink:0;">
<button class="aseg-btn" data-diff="easy">EASY</button>
<button class="aseg-btn" data-diff="normal">NORM</button>
<button class="aseg-btn" data-diff="hard">HARD</button>
</div>
</div>

<div class="asetting-row">
<div class="asetting-left" style="flex:1;">
<span class="asetting-icon" id="aset-gp-label" style="color:rgba(80,140,20,0.35);">—</span>
<div>
<div class="asetting-label">Gamepad</div>
<div class="asetting-sublabel" id="aset-gp-status">Not connected</div>
</div>
</div>
</div>

<div class="ams-btn-row" style="margin-top:2px;">
<button class="ams-sec-btn" id="aset-bootcamp-btn">
⟳ Replay
<div class="ams-sec-btn-label">Boot Camp Tutorial</div>
</button>
</div>

<div id="acard-settings-mount" style="margin-top:8px;">

</div>
</div>
</div>
</div>

<div class="acard" id="acard-daily">
<div class="acard-header" data-card="daily">
<div class="acard-title-row">
<div class="acard-icon" style="background:rgba(255,200,0,0.12);color:rgba(255,200,0,0.8);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v3l2 1.5"/></svg></div>
<div>
<div class="acard-title">Daily Challenges</div>
<div class="acard-subtitle" id="acard-daily-sub">Resets in --:--:--</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner" id="ams-daily-body">
<div style="font-family:var(--sf);font-size:12px;color:rgba(80,140,20,0.35);text-align:center;padding:12px 0;">Loading challenges...</div>
</div>
</div>
</div>

<div class="acard" id="acard-mutators">
<div class="acard-header" data-card="mutators">
<div class="acard-title-row">
<div class="acard-icon" style="background:rgba(255,120,0,0.12);color:rgba(255,140,20,0.8);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/></svg></div>
<div>
<div class="acard-title">Mutators<span class="ams-info-dot" id="acard-mut-info-dot">i<span class="ams-info-popover">Optional rule modifiers for Endless runs — invert gravity, no health drops, 2× speed, and more. Combine two for a hidden Synergy bonus.</span></span></div>
<div class="acard-subtitle" id="acard-mut-sub">Endless mode · Score multiplier</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner" id="ams-mutators-body">
<div style="font-family:var(--sf);font-size:11px;color:rgba(80,140,20,0.4);text-align:center;padding:12px 0;">Select Endless Mode to enable mutators</div>
</div>
</div>
</div>

<div class="acard" id="acard-coop">
<div class="acard-header" data-card="coop">
<div class="acard-title-row">
<div class="acard-icon" style="background:rgba(0,170,255,0.12);color:rgba(0,170,255,0.8);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
<div>
<div class="acard-title">Co-Op</div>
<div class="acard-subtitle" id="acard-coop-sub">Local 2 player · Off</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner" id="ams-coop-body">
<div class="asetting-row" id="ams-coop-toggle-row" style="cursor:pointer;touch-action:manipulation;">
<div class="asetting-left" style="flex:1;">
<span class="asetting-icon" style="font-size:14px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
<div>
<div class="asetting-label" id="ams-coop-toggle-label">Local 2 Player</div>
<div class="asetting-sublabel">Share this device with a friend</div>
</div>
</div>
<div class="aios-toggle" id="ams-coop-toggle-knob" style="flex-shrink:0;"><div class="aios-knob"></div></div>
</div>
<div id="ams-coop-p2-wrap" style="display:none;margin-top:10px;">
<div style="font-family:var(--sf);font-size:10px;color:rgba(80,140,20,0.5);letter-spacing:1px;margin-bottom:8px;">PLAYER 2 CHARACTER</div>
<div class="char-grid" id="ams-coop-char-grid" style="grid-template-columns:repeat(3,1fr);"></div>
</div>
</div>
</div>
</div>

<div class="acard" data-legacy-id="acard-lb">
<div class="acard-header" data-card="lb">
<div class="acard-title-row">
<div class="acard-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
<div>
<div class="acard-title">Leaderboard</div>
<div class="acard-subtitle">Top Operatives</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
<div class="acard-body">
<div class="acard-body-inner" id="ams-lb-body">
<div style="font-family:var(--sf);font-size:12px;color:rgba(80,140,20,0.35);text-align:center;padding:12px 0;">No records yet</div>
</div>
</div>
</div>

<div class="acard" data-legacy-id="acard-credits">
<div class="acard-header" id="ams-credits-btn" style="cursor:pointer;">
<div class="acard-title-row">
<div class="acard-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
<div>
<div class="acard-title">Credits</div>
<div class="acard-subtitle">AMPSA GAMES · Jesse Mukanga</div>
</div>
</div>
<div class="acard-chevron">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="6 9 12 15 18 9"/>
</svg>
</div>
</div>
</div>

<div class="ams-btn-row">
<button class="ams-sec-btn orange" id="ams-turbo-btn">
<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="13" height="13" style="vertical-align:-2px;margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Turbo Mode
<div class="ams-sec-btn-label">2× Speed · Instant</div>
</button>
<button class="ams-sec-btn" id="ams-more-btn">
Armory
<div class="ams-sec-btn-label">Spend Tokens</div>
</button>
</div>

<div class="ams-btn-row">
<button class="ams-sec-btn" id="ams-sound-quick">
Sound On
</button>
<button class="ams-sec-btn red" id="ams-reset-btn">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" style="vertical-align:-2px;margin-right:4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Reset Data
<div class="ams-sec-btn-label">Wipes all progress</div>
</button>
</div>
<div style="font-family:var(--sf);font-size:10px;color:rgba(40,80,10,0.3);text-align:center;padding:8px 0 4px;letter-spacing:0.5px;">
© 2025 AMPSA GAMES · ALL RIGHTS RESERVED
</div>
</div>
`;
document.body.appendChild(menuShell);
try{
const _ap = JSON.parse(localStorage.getItem('diy_prestige')||'{\"level\":0,\"xp\":0}');
const _amsMoreBtn = menuShell.querySelector('#ams-more-btn');
if(_ap.level < 1 && _amsMoreBtn){
_amsMoreBtn.style.opacity = '0.3';
_amsMoreBtn.style.pointerEvents = 'none';
_amsMoreBtn.title = 'Reach Prestige Level 1 to unlock the Armory';
}
}catch(_e){}
try{
const _mutCard = menuShell.querySelector('#acard-mutators');
if(_mutCard){
_mutCard.style.opacity = '';
_mutCard.style.pointerEvents = '';
_mutCard.title = '';
}
}catch(_e){}
window._syncApplePrestigeUI = function _syncApplePrestigeUI(){
try{
const tier = parseInt(localStorage.getItem('diy_unlock_tier')||'0');
const badge = document.getElementById('ams-prestige-badge');
if(badge) badge.style.display = tier >= 3 ? 'inline-flex' : 'none';
const tip = document.getElementById('ams-new-player-tip');
if(tip){
const dismissed = localStorage.getItem('diy_ams_tip_dismissed')==='1';
tip.style.display = (tier === 0 && !dismissed) ? 'block' : 'none';
}
}catch(_e){}
};
_syncApplePrestigeUI();
const _amsTipDismiss = menuShell.querySelector('#ams-tip-dismiss');
if(_amsTipDismiss){
_amsTipDismiss.addEventListener('click', () => {
try{ localStorage.setItem('diy_ams_tip_dismissed','1'); }catch(_e){}
_syncApplePrestigeUI();
});
}
menuShell.querySelectorAll('.ams-info-dot').forEach(dot => {
dot.addEventListener('click', (e) => {
e.stopPropagation();
const wasOpen = dot.classList.contains('open');
menuShell.querySelectorAll('.ams-info-dot.open').forEach(d => d.classList.remove('open'));
if(!wasOpen) dot.classList.add('open');
});
});
document.addEventListener('click', (e) => {
if(!e.target.closest('.ams-info-dot')){
menuShell.querySelectorAll('.ams-info-dot.open').forEach(d => d.classList.remove('open'));
}
});
let selectedCharId = 'soldier';
const charGrid = menuShell.querySelector('#ams-char-grid');
CHARS.forEach(c => {
const card = _makeEl('div', `char-card${c.locked ? ' locked' : ''}`);
card.dataset.char = c.id;
const _showNewBadge = c.id === 'alien' && !c.locked && (() => { try { return localStorage.getItem('diy_alien_badge_pending')==='1'; } catch(e) { return false; } })();
card.innerHTML = `
<div class="char-card-check">OK</div>
<div class="char-card-emoji">${c.emoji}</div>
<div class="char-card-name">${c.name}</div>
<div class="char-card-stat">${c.stat}</div>
${_showNewBadge ? '<span class="alien-new-badge">NEW</span>' : ''}
`;
if (!c.locked) {
card.addEventListener('click', () => {
charGrid.querySelectorAll('.char-card').forEach(cc => cc.classList.remove('selected'));
card.classList.add('selected');
selectedCharId = c.id;
menuShell.querySelector('#acard-char-sub').textContent = `${c.name} — ${c.stat}`;
if (typeof window.selectCharacter === 'function') window.selectCharacter(c.id);
setTimeout(_amsUpdateAlienFaceRow, 20);
});
}
if (c.id === 'soldier') card.classList.add('selected');
charGrid.appendChild(card);
});
window._appleUnlockAlienCard = function() {
const alienCard = charGrid.querySelector('.char-card[data-char=\"alien\"]');
if (!alienCard || !alienCard.classList.contains('locked')) return;
alienCard.classList.remove('locked');
const statEl = alienCard.querySelector('.char-card-stat');
if (statEl) statEl.textContent = '+Speed +Laser';
const _alienDef = CHARS.find(ch => ch.id === 'alien');
if (_alienDef) { _alienDef.locked = false; _alienDef.stat = '+Speed +Laser'; }
if (!alienCard.querySelector('.alien-new-badge')) {
const badge = _makeEl('span', 'alien-new-badge', 'NEW');
alienCard.appendChild(badge);
}
alienCard.addEventListener('click', () => {
charGrid.querySelectorAll('.char-card').forEach(cc => cc.classList.remove('selected'));
alienCard.classList.add('selected');
selectedCharId = 'alien';
menuShell.querySelector('#acard-char-sub').textContent = 'Alien — +Speed +Laser';
if (typeof window.selectCharacter === 'function') window.selectCharacter('alien');
setTimeout(_amsUpdateAlienFaceRow, 20);
});
};
if (_alienAlreadyUnlocked) window._appleUnlockAlienCard();
const _amsFaceRow = menuShell.querySelector('#ams-alien-face-row');
const _amsFaceInput = menuShell.querySelector('#ams-face-upload-input');
const _amsFacePreview = menuShell.querySelector('#ams-face-preview');
const _amsFacePreviewImg = menuShell.querySelector('#ams-face-preview-img');
const _amsFaceClearBtn = menuShell.querySelector('#ams-face-clear-btn');
function _amsUpdateAlienFaceRow() {
if (!_amsFaceRow) return;
const activeChar = selectedCharId || (typeof selectedChar !== 'undefined' ? selectedChar : '');
const isAlien = (activeChar === 'alien');
_amsFaceRow.style.display = isAlien ? 'block' : 'none';
if (isAlien && _amsFacePreviewImg && typeof playerCustom !== 'undefined' && playerCustom.faceImage) {
const src = playerCustom.faceImage.src || playerCustom.faceImage.currentSrc || '';
if (src) {
_amsFacePreviewImg.src = src;
if (_amsFacePreview) _amsFacePreview.style.display = 'block';
if (_amsFaceClearBtn) _amsFaceClearBtn.style.display = 'inline-block';
}
}
}
charGrid.addEventListener('click', () => {
setTimeout(_amsUpdateAlienFaceRow, 80);
});
charGrid.addEventListener('touchstart', () => {
setTimeout(_amsUpdateAlienFaceRow, 120);
}, { passive: true });
setTimeout(_amsUpdateAlienFaceRow, 300);
function renderCharCard(){
const activeId = window.selectedChar || selectedCharId || 'soldier';
const c = CHARS.find(ch => ch.id === activeId) || CHARS[0];
selectedCharId = c.id;
charGrid.querySelectorAll('.char-card').forEach(cc => cc.classList.toggle('selected', cc.dataset.char === c.id));
const subEl = menuShell.querySelector('#acard-char-sub');
if(subEl) subEl.textContent = `${c.name} — ${c.stat}`;
const iconEl = menuShell.querySelector('#acard-char .acard-icon');
if(iconEl && !iconEl.querySelector('svg')) iconEl.textContent = c.emoji;
_amsUpdateAlienFaceRow();
}
window.renderCharCard = renderCharCard;
renderCharCard();
if (_amsFaceInput) {
const _amsFaceBtn = menuShell.querySelector('#ams-face-upload-btn');
if (_amsFaceBtn) {
_amsFaceBtn.addEventListener('touchend', e => {
e.preventDefault();
_amsFaceInput.click();
}, { passive: false });
}
_amsFaceInput.addEventListener('change', e => {
const file = e.target.files && e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = evt => {
const img = new Image();
img.crossOrigin = 'Anonymous';
img.onload = () => {
const OUT_W = 256, OUT_H = 320;
const oc = document.createElement('canvas');
oc.width = OUT_W; oc.height = OUT_H;
const octx = oc.getContext('2d');
const srcW = Math.min(img.width, img.height * 0.8);
const srcH = srcW * 1.25;
const sx = (img.width - srcW) / 2;
const sy = Math.max(0, img.height * 0.02);
const safeH = Math.min(srcH, img.height - sy);
octx.imageSmoothingEnabled = true;
octx.imageSmoothingQuality = 'high';
octx.drawImage(img, sx, sy, srcW, safeH, 0, 0, OUT_W, OUT_H);
try {
const id = octx.getImageData(0, 0, OUT_W, OUT_H);
const d = id.data;
const factor = 1.25, bright = 12;
for (let i = 0; i < d.length; i += 4) {
d[i] = Math.min(255, Math.max(0, (d[i] - 128) * factor + 128 + bright));
d[i+1] = Math.min(255, Math.max(0, (d[i+1] - 128) * factor + 128 + bright));
d[i+2] = Math.min(255, Math.max(0, (d[i+2] - 128) * factor + 128 + bright));
}
octx.putImageData(id, 0, 0);
} catch(_) {}
const faceImg = new Image();
faceImg.onload = () => {
const _pc = (typeof playerCustom !== 'undefined' ? playerCustom : window.playerCustom);
if(_pc){ _pc._faceDataUrl = faceImg.src; _pc.faceImage = null; }
if (typeof FaceDB !== 'undefined'){
FaceDB.save(faceImg.src).catch(err => {
console.warn('[FaceDB] save failed, using localStorage fallback:', err);
try { localStorage.setItem('diy_face_src_fallback', faceImg.src); } catch(lsErr) {}
});
}
const origPrevImg = document.getElementById('face-preview-img');
const origPrev = document.getElementById('face-preview');
const origHint = document.getElementById('face-preview-hint');
const origClear = document.getElementById('face-clear-btn');
if (origPrevImg) origPrevImg.src = faceImg.src;
if (origPrev) origPrev.style.display = 'block';
if (origHint) origHint.style.display = 'block';
if (origClear) origClear.style.display = 'inline-block';
if (_amsFacePreviewImg) _amsFacePreviewImg.src = faceImg.src;
if (_amsFacePreview) _amsFacePreview.style.display = 'block';
if (_amsFaceClearBtn) _amsFaceClearBtn.style.display = 'inline-block';
try { _amsFaceInput.value = ''; } catch(_) {}
try { audioManager?.uiClick?.(); } catch(_) {}
try { showPickupMsg('A FACE UPLOADED!', '#cc80ff'); } catch(_) {}
};
faceImg.onerror = () => {
try { showPickupMsg('! Face upload failed – try a different image', '#ff8800'); } catch(_) {}
};
faceImg.src = oc.toDataURL('image/jpeg', 0.92);
oc.width = 0; oc.height = 0;
};
img.src = evt.target.result;
};
reader.readAsDataURL(file);
});
}
if (_amsFaceClearBtn) {
const _amsClearFace = () => {
if (typeof playerCustom !== 'undefined') {
playerCustom._faceDataUrl = null;
playerCustom.faceImage = null;
}
if (typeof FaceDB !== 'undefined') FaceDB.clear();
if (_amsFacePreview) _amsFacePreview.style.display = 'none';
if (_amsFacePreviewImg) _amsFacePreviewImg.src = '';
if (_amsFaceClearBtn) _amsFaceClearBtn.style.display = 'none';
const origPrev = document.getElementById('face-preview');
const origPrevImg = document.getElementById('face-preview-img');
const origHint = document.getElementById('face-preview-hint');
const origClear = document.getElementById('face-clear-btn');
if (origPrev) origPrev.style.display = 'none';
if (origPrevImg) origPrevImg.src = '';
if (origHint) origHint.style.display = 'none';
if (origClear) origClear.style.display = 'none';
try { audioManager?.uiClick?.(); } catch(_) {}
};
_amsFaceClearBtn.addEventListener('click', _amsClearFace);
_amsFaceClearBtn.addEventListener('touchstart', e => { e.preventDefault(); _amsClearFace(); }, { passive: false });
}
const SKIN_TONES = [
{ val: '#f5d0a0', label: 'Light' },
{ val: '#c8a070', label: 'Medium' },
{ val: '#a07040', label: 'Tan' },
{ val: '#6a3a18', label: 'Dark' },
];
const skinSwatchContainer = menuShell.querySelector('#ams-skin-swatches');
let selectedSkin = (() => {
try { const s = JSON.parse(localStorage.getItem('diy_custom')); return s?.skin || '#c8a070'; } catch(e) { return '#c8a070'; }
})();
function _appleExclusiveSwatchEl(ex, extraStyle, container, currentVal){
const unlocked = (typeof _isExclusiveUnlocked === 'function') ? _isExclusiveUnlocked(ex.id) : false;
const sw = _makeEl('div', `skin-swatch${unlocked ? '' : ' locked'}${unlocked && ex.val === currentVal ? ' active' : ''}`);
sw.style.background = ex.val;
if (extraStyle) sw.style.borderRadius = '6px';
sw.setAttribute('title', unlocked ? ex.label + ' (Exclusive)' : `${ex.label} — ${(typeof _exclusiveReqLabel==='function'?_exclusiveReqLabel(ex):'REACH WAVE '+ex.wave).toLowerCase()} to unlock`);
sw.dataset.exclusiveId = ex.id;
sw.setAttribute('data-exclusive-id', ex.id);
sw.innerHTML = `<div class="skin-swatch-check">OK</div>`;
if (unlocked) {
try {
if (localStorage.getItem('diy_exclusive_'+ex.id+'_badge')==='1') {
const badge = document.createElement('span');
badge.className = 'exclusive-new-badge';
badge.innerHTML = '<svg class="ico"><use href="#ico-star"/></svg>';
sw.appendChild(badge);
}
} catch(e) {}
}
sw.addEventListener('click', () => {
if (!unlocked) {
audioManager?.uiClick?.();
if (typeof showPickupMsg === 'function') showPickupMsg('<svg class="ico"><use href="#ico-lock"/></svg> LOCKED', '#ffd700', `${typeof _exclusiveReqLabel==='function'?_exclusiveReqLabel(ex):'REACH WAVE '+ex.wave} TO UNLOCK`);
return;
}
const origSwatch = document.querySelector(`.swatch[data-exclusive-id="${ex.id}"]`);
if (origSwatch) origSwatch.click();
container.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
sw.classList.add('active');
audioManager?.uiClick?.();
});
sw.addEventListener('touchstart', e => { e.preventDefault(); sw.click(); }, { passive:false });
return sw;
}
function _buildSkinSwatches() {
skinSwatchContainer.innerHTML = '';
SKIN_TONES.forEach(tone => {
const sw = _makeEl('div', `skin-swatch${tone.val === selectedSkin ? ' active' : ''}`);
sw.style.background = tone.val;
sw.setAttribute('title', tone.label);
sw.innerHTML = `<div class="skin-swatch-check">OK</div>`;
sw.addEventListener('click', () => {
selectedSkin = tone.val;
const origSwatch = document.querySelector(`.swatch[data-key="skin"][data-val="${tone.val}"]`);
if (origSwatch) {
origSwatch.click();
} else if (typeof handleSwatchPick === 'function') {
const synthetic = { dataset: { key: 'skin', val: tone.val } };
handleSwatchPick(synthetic);
}
skinSwatchContainer.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
sw.classList.add('active');
audioManager?.uiClick?.();
});
skinSwatchContainer.appendChild(sw);
});
EXCLUSIVE_SKINS.filter(ex => ex.key === 'skin').forEach(ex => {
skinSwatchContainer.appendChild(_appleExclusiveSwatchEl(ex, false, skinSwatchContainer, selectedSkin));
});
}
_buildSkinSwatches();
const OUTFIT_COLORS = [
{ val: '#2d4a1e', dark: '#1a2e10', label: 'Jungle' },
{ val: '#2a3a4e', dark: '#1a2840', label: 'Navy' },
{ val: '#1a4a2a', dark: '#0d2810', label: 'Forest' },
{ val: '#2a1a4a', dark: '#1a0d2a', label: 'Violet' },
{ val: '#4a2a1a', dark: '#2a1a0d', label: 'Desert' },
{ val: '#1a3a3a', dark: '#0d2020', label: 'Teal' },
{ val: '#3a3a3a', dark: '#222222', label: 'Steel' },
];
const ACCENT_COLORS = [
{ val: '#7fff00', label: 'Green' },
{ val: '#ff4400', label: 'Red' },
{ val: '#00aaff', label: 'Blue' },
{ val: '#ffaa00', label: 'Gold' },
{ val: '#cc00ff', label: 'Purple' },
];
function _buildColorSwatches(container, colors, dataKey) {
if (!container) return;
container.innerHTML = '';
colors.forEach(c => {
const sw = _makeEl('div', 'skin-swatch');
sw.style.background = c.val;
sw.style.borderRadius = '6px';
sw.setAttribute('title', c.label);
sw.innerHTML = `<div class="skin-swatch-check">OK</div>`;
const _markActive = () => {
container.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
sw.classList.add('active');
};
sw.addEventListener('click', () => {
const origSwatch = document.querySelector(`.swatch[data-key="${dataKey}"][data-val="${c.val}"]`);
if (origSwatch) {
origSwatch.click();
} else if (typeof handleSwatchPick === 'function') {
const synthetic = { dataset: { key: dataKey, val: c.val, dark: c.dark || '' } };
handleSwatchPick(synthetic);
}
_markActive();
audioManager?.uiClick?.();
});
sw.addEventListener('touchstart', e => { e.preventDefault(); sw.click(); }, { passive: false });
container.appendChild(sw);
});
EXCLUSIVE_SKINS.filter(ex => ex.key === dataKey).forEach(ex => {
container.appendChild(_appleExclusiveSwatchEl(ex, true, container, playerCustom?.[dataKey]));
});
requestAnimationFrame(() => {
try {
if (typeof playerCustom !== 'undefined') {
const current = playerCustom[dataKey];
container.querySelectorAll('.skin-swatch').forEach((sw, i) => {
if (sw.dataset.exclusiveId) {
const ex = EXCLUSIVE_SKINS.find(e => e.id === sw.dataset.exclusiveId);
sw.classList.toggle('active', !!ex && ex.val === current);
} else {
sw.classList.toggle('active', colors[i]?.val === current);
}
});
}
} catch(e) {}
});
}
_buildColorSwatches(menuShell.querySelector('#ams-color-swatches'), OUTFIT_COLORS, 'color');
_buildColorSwatches(menuShell.querySelector('#ams-accent-swatches'), ACCENT_COLORS, 'accent');
window._refreshExclusiveSwatchesApple = function(){
_buildSkinSwatches();
_buildColorSwatches(menuShell.querySelector('#ams-color-swatches'), OUTFIT_COLORS, 'color');
_buildColorSwatches(menuShell.querySelector('#ams-accent-swatches'), ACCENT_COLORS, 'accent');
};
let selectedLevelId = null;
const levelGrid = menuShell.querySelector('#ams-level-grid');
const _endlessUnlocked = (() => {
try {
const _el = gameDB.getAllLevels().find(l => l.id === 10);
return _el ? !!_el.unlocked : false;
} catch(e) { return false; }
})();
if (_endlessUnlocked) {
try {
window._appleSelectedLevel = (typeof gameDB !== 'undefined')
? (gameDB.getAllLevels().find(l => l.id === 10) || null)
: null;
} catch(e) { window._appleSelectedLevel = null; }
}
const endlessCard = _makeEl('div', _endlessUnlocked ? 'level-card lc-endless selected' : 'level-card lc-locked');
endlessCard.dataset.lvl = 'endless';
endlessCard.setAttribute('title', _endlessUnlocked ? '∞ Survive as long as you can' : 'Complete all 8 campaign levels to unlock');
const _todaysRoulette = (() => {
try { return getDailyRouletteMutators().map(id => MUTATOR_DEFS.find(m=>m.id===id)).filter(Boolean); }
catch(e) { return []; }
})();
const _rouletteBadgeHtml = _todaysRoulette.length ? `
<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
${_todaysRoulette.map(d=>`<span style="font-size:8px;padding:2px 6px;border:1px solid ${d.col};color:${d.col};border-radius:4px;letter-spacing:0.5px;">◇ ${d.icon} ${d.name}</span>`).join('')}
</div>` : '';
endlessCard.innerHTML = _endlessUnlocked ? `
<div class="level-card-name">∞ Endless Mode</div>
<div class="level-card-env">Survive as long as you can</div>
${_rouletteBadgeHtml}
<div class="level-card-badge"></div>
` : `
<div class="level-card-name" style="color:#3a5a00;">∞ Endless Mode</div>
<div class="level-card-env" style="color:#1e3400;">Complete all 8 levels</div>
<div class="level-card-badge"></div>
`;
endlessCard.addEventListener('click', () => {
if (!_endlessUnlocked) return;
selectedLevelId = null;
window._appleSelectedIsBossRush = false;
levelGrid.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
endlessCard.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = 'Endless Mode';
try {
window._appleSelectedLevel = (typeof gameDB !== 'undefined')
? (gameDB.getAllLevels().find(l => l.id === 10) || null)
: null;
} catch(e) { window._appleSelectedLevel = null; }
try {
const _daily = getDailyRouletteMutators();
window._dailyRouletteMutators = _daily;
_daily.forEach(id => activeMutators.add(id));
} catch(e) {}
if (typeof syncMutators === 'function') try { syncMutators(); } catch(e) {}
});
levelGrid.appendChild(endlessCard);
LEVELS.forEach(lv => {
let locked = !lv.unlocked;
const cardClass = locked ? 'level-card lc-locked' : lv.isFinalBoss ? 'level-card lc-finalboss' : 'level-card';
const card = _makeEl('div', cardClass);
card.dataset.lvl = lv.id;
card.setAttribute('title', locked ? 'Complete previous levels to unlock' : lv.name);
const badgeIcon = locked ? '<svg class="ico"><use href="#ico-lock"/></svg>' : lv.isFinalBoss ? '<svg class="ico"><use href="#ico-bolt"/></svg>' : lv.emoji;
card.innerHTML = `
<div class="level-card-name"${lv.isFinalBoss && !locked ? ' style="color:#ff0066;"' : ''}>${lv.name}</div>
<div class="level-card-env">${lv.env}</div>
<div class="level-card-badge">${badgeIcon}</div>
`;
card.addEventListener('click', () => {
if (locked) return;
selectedLevelId = lv.id;
window._appleSelectedIsBossRush = false;
levelGrid.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
card.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = lv.name;
if (typeof activeMutators !== 'undefined') activeMutators.clear();
if (typeof _mutCfg !== 'undefined') _mutCfg = null;
if (typeof syncMutators === 'function') try { syncMutators(); } catch(e) {}
try {
window._appleSelectedLevel = (typeof gameDB !== 'undefined')
? (gameDB.getAllLevels().find(l => l.id === lv.numericId) || null)
: null;
} catch(e) { window._appleSelectedLevel = null; }
});
levelGrid.appendChild(card);
});
const _bossRushUnlocked = (() => { try { return !!localStorage.getItem('diy_medal_ironGhost'); } catch(e) { return false; } })();
const bossRushCard = _makeEl('div', _bossRushUnlocked ? 'level-card lc-bossrush' : 'level-card lc-locked');
bossRushCard.dataset.lvl = 'bossrush';
bossRushCard.setAttribute('title', _bossRushUnlocked ? '▸ All 7 bosses back-to-back' : 'Beat HARM & TUG to unlock Boss Rush');
bossRushCard.innerHTML = `
<div class="level-card-name" style="${_bossRushUnlocked ? 'color:#ff8c00;' : ''}">▸ Boss Rush</div>
<div class="level-card-env">${_bossRushUnlocked ? '* All 7 Bosses' : 'Beat HARM &amp; TUG'}</div>
<div class="level-card-badge">${_bossRushUnlocked ? '' : ''}</div>
`;
if (_bossRushUnlocked) {
bossRushCard.addEventListener('click', () => {
selectedLevelId = 'bossrush';
window._appleSelectedLevel = null;
window._appleSelectedIsBossRush = true;
levelGrid.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
bossRushCard.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = '▸ Boss Rush — All 7 Bosses';
if (typeof activeMutators !== 'undefined') activeMutators.clear();
if (typeof _mutCfg !== 'undefined') _mutCfg = null;
if (typeof syncMutators === 'function') try { syncMutators(); } catch(e) {}
});
} else {
bossRushCard.style.cursor = 'pointer';
bossRushCard.addEventListener('click', () => {
if (typeof showPickupMsg === 'function') {
showPickupMsg('BOSS RUSH LOCKED', '#ff6600', 'Beat HARM & TUG in any campaign level to unlock');
} else {
const sub = menuShell.querySelector('#acard-level-sub');
if (sub) { sub.textContent = 'Beat HARM & TUG to unlock Boss Rush'; }
}
});
}
levelGrid.appendChild(bossRushCard);
if (!_endlessUnlocked) {
const firstCampaignCard = levelGrid.querySelector('.level-card:not(.lc-locked)');
if (firstCampaignCard) {
endlessCard.classList.remove('selected');
firstCampaignCard.classList.add('selected');
const lvlName = firstCampaignCard.querySelector('.level-card-name')?.textContent || 'Level 1';
menuShell.querySelector('#acard-level-sub').textContent = lvlName;
const _lvId = parseInt(firstCampaignCard.dataset.lvl?.replace('lvl_','')) || 1;
try {
window._appleSelectedLevel = gameDB.getAllLevels().find(l => l.id === _lvId) || null;
} catch(e) { window._appleSelectedLevel = null; }
}
}
const tipsBody = menuShell.querySelector('#ams-tips-body');
TIPS.forEach(tip => {
const row = _makeEl('div', 'atip-row');
row.innerHTML = `
<div class="atip-icon">${tip.icon}</div>
<div class="atip-body">
<div class="atip-title">${tip.title}</div>
<div class="atip-text">${tip.text}</div>
</div>
`;
tipsBody.appendChild(row);
});
const ctrlsDiv = _makeEl('div');
ctrlsDiv.style.cssText = 'margin-top:12px;border-top:1px solid rgba(120,255,0,0.08);padding-top:12px;';
ctrlsDiv.innerHTML = `
<div style="font-family:var(--sf);font-size:11px;font-weight:600;color:rgba(80,140,20,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Controls</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
${[
[' Joystick', 'Move character'],
['Right side', 'Aim & Shoot'],
['⟳ Button', 'Reload'],
['▪ Button', 'Grenade'],
['─ Bottom', 'Switch weapon'],
[__pauseSvg(12,'#aaff00')+' Pause', 'Top right'],
].map(([k,v]) => `
<div style="background:rgba(6,14,4,0.6);border:1px solid rgba(120,255,0,0.08);border-radius:8px;padding:8px 10px;">
<div style="font-family:var(--sf);font-size:11px;font-weight:600;color:rgba(160,230,60,0.7);">${k}</div>
<div style="font-family:var(--sf);font-size:10px;color:rgba(80,140,20,0.4);margin-top:2px;">${v}</div>
</div>
`).join('')}
</div>
`;
tipsBody.appendChild(ctrlsDiv);
menuShell.querySelectorAll('.acard-header').forEach(header => {
header?.addEventListener('click', () => {
const card = header.closest('.acard');
if(card && card.dataset.legacyId === 'acard-credits'){
if(typeof showHarmTugCredits==='function') showHarmTugCredits(true);
return;
}
const isOpen = card.classList.contains('open');
card.classList.toggle('open', !isOpen);
});
});
const charCard = menuShell.querySelector('#acard-char');
if (charCard) charCard.classList.add('open');
const syncToggle = (toggleEl, originalToggleId) => {
if (!toggleEl) return;
const origToggle = $(originalToggleId);
if (!origToggle) return;
const update = () => {
const isOn = origToggle.dataset.on === 'true';
toggleEl.classList.toggle('on', isOn);
};
update();
toggleEl.addEventListener('click', () => {
origToggle.click();
setTimeout(update, 50);
setTimeout(update, 300);
});
new MutationObserver(update).observe(origToggle, { attributes: true, attributeFilter: ['data-on'] });
};
menuShell.querySelectorAll('.aios-toggle').forEach(t => {
if (!t.querySelector('.aios-knob')) {
const knob = document.createElement('div');
knob.className = 'aios-knob';
t.appendChild(knob);
}
});
(function _transplantSettings(attemptsLeft){
attemptsLeft = attemptsLeft===undefined ? 3 : attemptsLeft;
try{
const mount=document.getElementById('acard-settings-mount');
const src=document.getElementById('more-pane-settings');
if(!mount||!src){
if(attemptsLeft>0){
requestAnimationFrame(()=>_transplantSettings(attemptsLeft-1));
return;
}
console.warn('[Apple UI] transplant: element not found (mount='+!!mount+', src='+!!src+')');
return;
}
mount.appendChild(src);
src.style.cssText='display:block;padding:4px 0 0;margin:0;background:none;border:none;';
}catch(e){console.warn('[Apple UI] transplant failed:',e);}
})();
const _syncThemeBtns = () => {
const isNight = !document.body.classList.contains('light-mode');
menuShell.querySelector('#aset-theme-night')?.classList.toggle('active', isNight);
menuShell.querySelector('#aset-theme-day')?.classList.toggle('active', !isNight);
};
_syncThemeBtns();
menuShell.querySelector('#aset-theme-night')?.addEventListener('click', () => { $('theme-night')?.click(); _syncThemeBtns(); });
menuShell.querySelector('#aset-theme-day')?.addEventListener('click', () => { $('theme-light')?.click(); _syncThemeBtns(); });
menuShell.querySelector('#aset-bootcamp-btn')?.addEventListener('click', () => {
$('reset-tutorial-btn')?.click();
const btn = menuShell.querySelector('#aset-bootcamp-btn');
if (btn) { btn.textContent = 'OK Reset'; setTimeout(() => { btn.textContent = '⟳ Replay'; }, 1800); }
});
(function _wireAcardCoopToggle(){
const _origTog = $('coop-toggle');
if (!_origTog) return;
const _row  = document.getElementById('ams-coop-toggle-row');
const _knob = document.getElementById('ams-coop-toggle-knob');
const _sub  = document.getElementById('acard-coop-sub');
const _p2   = document.getElementById('ams-coop-p2-wrap');
const _updateAcardCoop = () => {
  const isOn = _origTog.dataset.on === 'true';
  if (_knob) _knob.classList.toggle('on', isOn);
  if (_sub)  _sub.textContent = isOn ? 'Local 2 player · On' : 'Local 2 player · Off';
  if (_p2)   _p2.style.display = isOn ? 'block' : 'none';
};
_updateAcardCoop();
const _onClick = (e) => {
  e.stopPropagation();
  _origTog.click();
  setTimeout(_updateAcardCoop, 50);
  setTimeout(_updateAcardCoop, 300);
};
if (_row)  _row.addEventListener('click', _onClick);
if (_knob) _knob.addEventListener('click', (e) => { e.stopPropagation(); _onClick(e); });
new MutationObserver(_updateAcardCoop).observe(_origTog, { attributes: true, attributeFilter: ['data-on'] });
})();
if(!isMobile){
const aimRow = menuShell.querySelector('#aim-assist-row');
const vibRow = menuShell.querySelector('#vibration-row');
if(aimRow) aimRow.style.display = 'none';
if(vibRow) vibRow.style.display = 'none';
}
const gpStatus = menuShell.querySelector('#aset-gp-status');
const gpLabel = menuShell.querySelector('#aset-gp-label');
function _updateGpStatus(){
let gps = [];
try { gps = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; } catch(e){ gps = []; }
if(gps.length > 0){
if(gpStatus) gpStatus.textContent = gps[0].id.substring(0, 28) || 'Connected';
if(gpLabel) { gpLabel.textContent = '●'; gpLabel.style.color = 'rgba(80,220,80,0.7)'; }
} else {
if(gpStatus) gpStatus.textContent = 'Not connected';
if(gpLabel) { gpLabel.textContent = '—'; gpLabel.style.color = 'rgba(80,140,20,0.35)'; }
}
}
_updateGpStatus();
window.addEventListener('gamepadconnected', () => setTimeout(_updateGpStatus, 100));
window.addEventListener('gamepaddisconnected', () => setTimeout(_updateGpStatus, 100));
setInterval(_updateGpStatus, 2000);
const diffSeg = menuShell.querySelector('#aset-diff');
function _syncDiffSegment() {
if (!diffSeg) return;
const activeDiff = document.querySelector('.diff-btn.active');
if (!activeDiff) return;
const activeVal = activeDiff.dataset.diff;
diffSeg.querySelectorAll('.aseg-btn').forEach(b => {
b.classList.toggle('active', b.dataset.diff === activeVal);
});
}
_syncDiffSegment();
diffSeg?.querySelectorAll('.aseg-btn').forEach(btn => {
btn.addEventListener('click', () => {
diffSeg?.querySelectorAll('.aseg-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
const origBtn = document.querySelector(`.diff-btn[data-diff="${btn.dataset.diff}"]`);
if (origBtn) origBtn.click();
});
});
const soundQuick = menuShell.querySelector('#ams-sound-quick');
const _soundQuickIconOn = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="flex-shrink:0;vertical-align:-2px;margin-right:5px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
const _soundQuickIconOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="flex-shrink:0;vertical-align:-2px;margin-right:5px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
function _syncSoundQuickBtn() {
if (!soundQuick) return;
const sndToggle = $('snd-toggle');
const isOn = sndToggle?.dataset?.on === 'true';
soundQuick.innerHTML = (isOn ? _soundQuickIconOn : _soundQuickIconOff) + (isOn ? 'Sound On' : 'Sound Off');
soundQuick.style.color = isOn ? 'rgba(120,200,40,0.7)' : 'rgba(255,100,80,0.6)';
}
_syncSoundQuickBtn();
soundQuick?.addEventListener('click', () => {
const sndToggle = $('snd-toggle');
if (sndToggle) {
sndToggle.click();
setTimeout(_syncSoundQuickBtn, 50);
}
});
const sndToggleEl = $('snd-toggle');
if (sndToggleEl) {
new MutationObserver(_syncSoundQuickBtn).observe(sndToggleEl, { attributes: true, attributeFilter: ['data-on'] });
}
const syncLeaderboard = () => {
const lbBody = menuShell.querySelector('#ams-lb-body');
if (!lbBody) return;
const rows = (typeof window.getLeaderboardRows === 'function') ? window.getLeaderboardRows() : [];
if (!rows.length) {
lbBody.innerHTML = '<div style=\"font-family:var(--sf);font-size:12px;color:rgba(80,140,20,0.35);text-align:center;padding:12px 0;\">No records yet</div>';
return;
}
lbBody.innerHTML = '';
rows.forEach((r, i) => {
const newRow = _makeEl('div', `alb-row${i < 3 ? ' top' : ''}`);
const rank = _makeEl('div', 'alb-rank'); rank.textContent = ['#1','#2','#3'][i] || String(r.rank);
const name = _makeEl('div', 'alb-name'); name.textContent = `${r.level} · W${r.wave} · ${r.kills}X ${r.charIcon}`;
const score = _makeEl('div', 'alb-score'); score.textContent = String(r.score);
if (r.ts) newRow.title = new Date(r.ts).toLocaleString();
newRow.append(rank, name, score);
lbBody.appendChild(newRow);
});
};
window.syncLeaderboard = syncLeaderboard;
syncLeaderboard();
let _dcSyncRetries = 0, _dcSyncTimer = null;
const DC_SYNC_MAX_RETRIES = 3;
const syncDailyChallenges = () => {
const origDcBody = $('dc-body');
const origDcTimer = $('dc-timer');
const amsBody = menuShell.querySelector('#ams-daily-body');
const amsSub = menuShell.querySelector('#acard-daily-sub');
if (!amsBody) return;
if (origDcTimer && amsSub) amsSub.textContent = origDcTimer.textContent || 'Resets in --:--:--';
if (!origDcBody || origDcBody.style.display === 'none') {
const dcHeader = $('dc-header');
if (dcHeader && origDcBody && origDcBody.style.display === 'none' && _dcSyncRetries < DC_SYNC_MAX_RETRIES && !_dcSyncTimer) {
_dcSyncRetries++;
dcHeader.click();
_dcSyncTimer = setTimeout(() => { _dcSyncTimer = null; syncDailyChallenges(); }, 300);
return;
}
} else {
_dcSyncRetries = 0;
}
if (origDcBody && origDcBody.children.length > 0) {
amsBody.innerHTML = '';
Array.from(origDcBody.children).forEach(child => {
const clone = child.cloneNode(true);
clone.style.fontSize = '';
amsBody.appendChild(clone);
});
amsBody.querySelectorAll('.dc-play-btn:not(.done)').forEach(btn => {
btn.addEventListener('pointerdown', e => {
e.stopPropagation();
if (!gameReady) return;
audioManager?.uiClick?.();
menuShell.classList.remove('active');
startLevel({ level: null });
});
});
} else {
amsBody.innerHTML = '<div style=\"font-family:var(--sf);font-size:12px;color:rgba(80,140,20,0.35);text-align:center;padding:12px 0;\">No challenges today</div>';
}
};
window.syncDailyChallenges = syncDailyChallenges;
syncDailyChallenges();
const syncMutators = () => {
const mutBody = menuShell.querySelector('#ams-mutators-body');
const mutSub = menuShell.querySelector('#acard-mut-sub');
if (!mutBody) return;
const isEndless = selectedLevelId === null;
if (!isEndless) {
mutBody.innerHTML = '<div style=\"font-family:var(--sf);font-size:11px;color:rgba(80,140,20,0.4);text-align:center;padding:12px 0;\">Select Endless Mode to enable mutators</div>';
if (mutSub) mutSub.textContent = 'Endless mode only';
return;
}
const origArmoryPane = $('more-pane-armory');
try {
if (typeof MUTATOR_DEFS !== 'undefined' && MUTATOR_DEFS.length > 0) {
if (mutSub) {
const activeCount = typeof activeMutators !== 'undefined' ? activeMutators.size : 0;
mutSub.textContent = activeCount > 0 ? `${activeCount} active · Score ×${(1 + activeCount * 0.5).toFixed(1)}` : 'None active · Pick to boost score';
}
mutBody.innerHTML = '';
const _todaysDaily = (() => { try { return getDailyRouletteMutators(); } catch(e) { return []; } })();
MUTATOR_DEFS.forEach(def => {
const isActive = typeof activeMutators !== 'undefined' && activeMutators.has(def.id);
const isLocked = _todaysDaily.includes(def.id);
const row = _makeEl('div', 'asetting-row');
row.style.cssText = isLocked
? 'cursor:not-allowed;touch-action:manipulation;opacity:0.6;'
: 'cursor:pointer;touch-action:manipulation;';
row.innerHTML = `
<div class="asetting-left" style="flex:1;gap:8px;">
<span class="asetting-icon" style="font-size:13px;width:18px;${isLocked?'filter:grayscale(1);':''}">${isLocked ? '<svg class="ico"><use href="#ico-lock"/></svg>' : (def.icon || '▸')}</span>
<div>
<div class="asetting-label" style="color:${isLocked ? 'rgba(150,120,60,0.85)' : isActive ? (def.col||'rgba(120,255,0,0.9)') : 'rgba(180,255,80,0.7)'};">${def.name}${isLocked ? ' — LOCKED TODAY' : ''}</div>
<div class="asetting-sublabel">${isLocked ? "Mandatory daily pick — can't be toggled off" : (def.desc || '')}</div>
</div>
</div>
<div class="aios-toggle${isActive ? ' on' : ''}" style="flex-shrink:0;${isLocked?'pointer-events:none;':''}"><div class="aios-knob"></div></div>
`;
if (!isLocked) {
row.addEventListener('click', (e) => {
e.stopPropagation();
if (typeof activeMutators === 'undefined') return;
if (activeMutators.has(def.id)) activeMutators.delete(def.id);
else activeMutators.add(def.id);
audioManager?.uiClick?.();
syncMutators();
});
}
mutBody.appendChild(row);
});
} else {
mutBody.innerHTML = '<div style=\"font-family:var(--sf);font-size:11px;color:rgba(80,140,20,0.4);text-align:center;padding:12px 0;\">Select Endless Mode to toggle mutators</div>';
}
} catch(e) {
mutBody.innerHTML = '<div style=\"font-family:var(--sf);font-size:11px;color:rgba(80,140,20,0.4);text-align:center;padding:12px 0;\">Select Endless Mode to toggle mutators</div>';
}
};
window.renderMutatorCards = syncMutators;
window.syncMutators = syncMutators;
setTimeout(syncMutators, 0);
levelGrid.addEventListener('click', () => syncMutators());
const syncPrestigeBadge = () => {
const lvlEl = $('ec-prestige-lvl');
const xpRow = $('ec-prestige-xp-row');
const badgeText = $('ams-prestige-text');
const badgeXp = $('ams-prestige-xp');
if (typeof window._syncApplePrestigeUI === 'function') window._syncApplePrestigeUI();
if (!badgeText) return;
if (lvlEl) badgeText.textContent = `Prestige Lv.${lvlEl.textContent.replace(/[^0-9]/g,'')||1}`;
if (xpRow && badgeXp) {
const spans = xpRow.querySelectorAll('span');
if (spans.length >= 2) badgeXp.textContent = spans[1].textContent;
}
};
const syncStreakBadge = () => {
const badge = $('ams-streak-badge');
const text = $('ams-streak-text');
if (!badge || !text) return;
try {
const st = (typeof getStreakState === 'function') ? getStreakState() : null;
if (!st || st.current <= 0) { badge.style.display = 'none'; return; }
const todayKey = _localDayKey();
const isAtRisk = st.lastDay !== null && st.lastDay !== todayKey && (_localDayDiff(todayKey, st.lastDay) >= 1);
badge.style.display = 'inline-flex';
badge.style.borderColor = isAtRisk ? 'rgba(255,60,0,0.35)' : 'rgba(255,140,0,0.22)';
text.textContent = `${st.current} Day Streak${isAtRisk ? ' — play today!':''}`;
} catch(e) { badge.style.display = 'none'; }
};
const syncRouletteBadge = () => {
const badge = $('ams-roulette-badge');
const text = $('ams-roulette-text');
if (!badge || !text) return;
try {
const daily = (typeof window.getDailyRouletteMutators === 'function') ? window.getDailyRouletteMutators() : [];
if (!daily.length) { badge.style.display = 'none'; return; }
const defs = daily.map(id => (window.MUTATOR_DEFS||[]).find(m=>m.id===id)).filter(Boolean);
const names = defs.map(d=>d.name).join(' + ');
badge.style.display = 'inline-flex';
text.textContent = `Daily Roulette: ${names}`;
_maybeShowRouletteToast(defs);
} catch(e) { badge.style.display = 'none'; }
};
function _maybeShowRouletteToast(defs){
try {
const todayKey = new Date().toISOString().slice(0,10);
const seenKey = 'diy_roulette_toast_seen';
if (localStorage.getItem(seenKey) === todayKey) return;
localStorage.setItem(seenKey, todayKey);
const names = defs.map(d=>d.name).join(' + ');
const toast = document.createElement('div');
toast.id = 'roulette-toast';
toast.style.cssText = `position:fixed;left:50%;top:18px;transform:translateX(-50%) translateY(-140%);z-index:9999;max-width:min(92vw,380px);display:flex;align-items:center;gap:10px;background:rgba(20,14,0,0.97);border:1px solid rgba(255,170,0,0.4);border-radius:14px;padding:12px 16px;box-shadow:0 8px 30px rgba(0,0,0,0.5);cursor:pointer;touch-action:manipulation;transition:transform 0.35s cubic-bezier(.2,.9,.3,1.3);`;
toast.innerHTML = `
<span style="font-size:18px;display:inline-flex;flex-shrink:0;color:#ffaa00;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.1" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.1" fill="currentColor" stroke="none"/></svg></span>
<div style="min-width:0;">
<div style="font-family:var(--sf,'Share Tech Mono',monospace);font-size:10px;font-weight:700;letter-spacing:2px;color:#ffaa00;">◇ DAILY ROULETTE LIVE</div>
<div style="font-family:var(--sf,'Share Tech Mono',monospace);font-size:11px;color:rgba(255,210,140,0.85);margin-top:2px;">${names} — active in Endless today</div>
</div>`;
document.body.appendChild(toast);
requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
function dismiss(){
toast.style.transform = 'translateX(-50%) translateY(-140%)';
setTimeout(() => toast.remove(), 350);
}
toast.addEventListener('click', () => {
dismiss();
const endlessCard = document.querySelector('.lc-endless');
if (endlessCard && !endlessCard.classList.contains('lc-locked')) {
endlessCard.click();
endlessCard.scrollIntoView({ behavior:'smooth', block:'center' });
}
});
setTimeout(dismiss, 6000);
} catch(e) {}
}
window.syncPrestigeBadge = syncPrestigeBadge;
window.syncStreakBadge = syncStreakBadge;
window.syncRouletteBadge = syncRouletteBadge;
syncPrestigeBadge();
syncStreakBadge();
syncRouletteBadge();
(function(){
const _rb = $('ams-roulette-badge');
if (_rb && !_rb._boundClick) {
_rb._boundClick = true;
_rb.addEventListener('click', () => {
const endlessCard = document.querySelector('.lc-endless');
if (endlessCard && !endlessCard.classList.contains('lc-locked')) {
endlessCard.click();
endlessCard.scrollIntoView({ behavior:'smooth', block:'center' });
}
});
}
})();
const deployBtn = menuShell.querySelector('#ams-deploy-btn');
deployBtn?.addEventListener('click', () => {
if (!gameReady) return;
const _deployIsEndless = !window._appleSelectedIsBossRush &&
window._appleSelectedLevel && window._appleSelectedLevel.isEndless;
if (typeof activeMutators !== 'undefined' && activeMutators.size > 0 && !_deployIsEndless) {
const _warn = document.createElement('div');
_warn.innerHTML = '<svg class="ico"><use href="#ico-warn"/></svg> Mutators only apply in Endless Mode — switch levels or they won\'t activate.';
_warn.style.cssText = 'position:fixed;left:50%;bottom:100px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,360px);background:rgba(40,0,0,0.95);border:1px solid rgba(255,60,0,0.5);color:#ff8866;font-family:var(--sf,monospace);font-size:11px;letter-spacing:0.5px;padding:10px 16px;border-radius:10px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,0.5);';
document.body.appendChild(_warn);
setTimeout(() => _warn.remove(), 3200);
return;
}
_restoreMorePanel();
menuShell.classList.remove('active');
audioManager?.uiClick?.();
if (window._appleSelectedIsBossRush) {
window._appleSelectedIsBossRush = false;
startLevel({ bossRush: true });
return;
}
startLevel({ level: window._appleSelectedLevel || null, mutators: (typeof activeMutators !== 'undefined' && activeMutators.size > 0) });
});
function _restoreMorePanel() {
const morePanel = $('more-panel');
const store = $('ui-panel-home');
if (morePanel && store && morePanel.parentElement !== store) {
morePanel.style.cssText = '';
morePanel.style.display = 'none';
store.appendChild(morePanel);
const closeBtn = $('ams-morepanel-close');
if (closeBtn) closeBtn.remove();
}
}
menuShell.querySelector('#ams-turbo-btn')?.addEventListener('click', () => {
if (typeof window.startTurbo === 'function') {
_restoreMorePanel();
menuShell.classList.remove('active');
window.startTurbo();
}
});
menuShell.querySelector('#ams-more-btn')?.addEventListener('click', () => {
_openMorePanel('armory');
});
function _openMorePanel(paneId) {
const morePanel = $('more-panel');
if (!morePanel) return;
try { (window._morePanelOpenHooks || []).forEach(h => h()); } catch(_e) {}
try {
if(typeof syncDailyChallenges==='function') syncDailyChallenges();
if(typeof syncPrestigeBadge==='function') syncPrestigeBadge();
if(typeof syncStreakBadge==='function') syncStreakBadge();
if(typeof syncRouletteBadge==='function') syncRouletteBadge();
const _tokEl = document.getElementById('armory-token-count');
if(_tokEl && typeof lifeTokens!=='undefined') _tokEl.textContent = lifeTokens;
if(typeof renderMutatorCards==='function') renderMutatorCards();
if(typeof updateDcTimer==='function') updateDcTimer();
} catch(_e){}
if (morePanel.parentElement && morePanel.parentElement.id === 'ui-panel-home') {
document.body.appendChild(morePanel);
}
morePanel.style.cssText = `
display: block !important;
position: fixed !important;
inset: 0 !important;
z-index: 1100 !important;
width: 100vw !important;
max-width: 100vw !important;
margin: 0 !important;
border-radius: 0 !important;
border: none !important;
background: rgba(3,8,2,0.97) !important;
overflow-y: auto !important;
-webkit-overflow-scrolling: touch !important;
padding: max(20px, env(safe-area-inset-top,20px)) 0 max(20px, env(safe-area-inset-bottom,20px)) !important;
box-shadow: none !important;
`;
if (!$('ams-morepanel-close')) {
const closeBtn = document.createElement('button');
closeBtn.id = 'ams-morepanel-close';
closeBtn.innerHTML = 'X Close';
closeBtn.style.cssText = `
display: block;
margin: 0 auto 14px;
background: transparent;
border: 1px solid rgba(120,255,0,0.25);
border-radius: var(--apple-radius-sm);
color: rgba(120,200,40,0.6);
font-family: var(--sf), sans-serif;
font-size: 13px;
font-weight: 500;
padding: 10px 28px;
cursor: pointer;
touch-action: manipulation;
letter-spacing: 0.5px;
`;
closeBtn.addEventListener('click', _closeMorePanel);
morePanel.insertBefore(closeBtn, morePanel.firstChild);
}
if (paneId) {
const tab = document.querySelector(`.more-tab[data-pane="${paneId}"]`);
if (tab) tab.click();
}
}
function _closeMorePanel() {
const morePanel = $('more-panel');
if (!morePanel) return;
morePanel.style.display = 'none';
}
window._appleOpenMorePanel = _openMorePanel;
window._appleCloseMorePanel = _closeMorePanel;
menuShell.querySelector('#ams-reset-btn')?.addEventListener('click', () => {
if (typeof window.clearAllProgress === 'function') window.clearAllProgress();
});
const updateResumeBanner = () => {
const amsResume = menuShell.querySelector('#ams-resume-banner');
if (!amsResume) return;
const info = (typeof window.getResumeInfo === 'function') ? window.getResumeInfo() : null;
amsResume.classList.toggle('visible', !!info);
if (info) {
const waveText = menuShell.querySelector('#ams-resume-wave-text');
const detailEl = menuShell.querySelector('#ams-resume-detail');
if (waveText) waveText.textContent = `Wave ${info.wave}`;
if (detailEl) detailEl.textContent = info.detail;
}
};
window.updateResumeBanner = updateResumeBanner;
menuShell.querySelector('#ams-resume-btn')?.addEventListener('click', () => {
if (typeof window.resumeFromCheckpoint === 'function') { _restoreMorePanel(); menuShell.classList.remove('active'); window.resumeFromCheckpoint(); }
});
updateResumeBanner();
menuShell.classList.add('active');
const _gc = document.getElementById('game-copyright');
if (_gc) _gc.style.opacity = '0';
setTimeout(() => {
updateResumeBanner();
syncLeaderboard();
syncDailyChallenges();
syncPrestigeBadge();
_syncDiffSegment();
_syncSoundQuickBtn();
}, 0);
const wavePill = _makeEl('div', '');
wavePill.id = 'apple-wave-pill';
wavePill.innerHTML = `
<div class="awp-inner">
<div class="awp-label" id="awp-wave">Wave 1</div>
<div class="awp-divider"></div>
<div class="awp-score" id="awp-score">0 pts</div>
<div class="awp-divider"></div>
<div class="awp-score" id="awp-kills" style="color:rgba(255,120,60,0.8);">0 kills</div>
</div>
`;
document.querySelector('#screen')?.appendChild(wavePill);
let _pillSnoozed = false, _pillSnoozeTimer = null;
wavePill.style.cursor = 'pointer';
wavePill.addEventListener('click', () => {
_pillSnoozed = true;
wavePill.classList.remove('visible');
clearTimeout(_pillSnoozeTimer);
_pillSnoozeTimer = setTimeout(() => { _pillSnoozed = false; }, 8000);
});
const syncPill = () => {
if (_pillSnoozed) return;
const waveEl = $('wave-num');
const scoreEl = $('score-num');
const killsEl = $('kills-num');
const pauseOverlay = $('pause-overlay');
const upgradePanel = $('upgrade-panel');
const endCard = $('end-card');
const missionCard = $('mission-card');
const missionActive = missionCard && missionCard.classList.contains('show');
const playing = window.state === 'playing';
if (waveEl && playing && !missionActive &&
(!pauseOverlay || !pauseOverlay.classList.contains('active')) &&
(!upgradePanel || upgradePanel.style.display === 'none') &&
(!endCard || !endCard.classList.contains('active'))) {
wavePill.classList.add('visible');
$('awp-wave').textContent = `Wave ${waveEl.textContent}`;
if (scoreEl) $('awp-score').textContent = `${parseInt(scoreEl.textContent||0).toLocaleString()} pts`;
if (killsEl) $('awp-kills').textContent = `${killsEl.textContent||0} kills`;
} else {
wavePill.classList.remove('visible');
}
};
const _pillObserverCb = () => syncPill();
const _waveNumEl = $('wave-num');
const _scoreNumEl = $('score-num');
const _killsNumEl = $('kills-num');
if (_waveNumEl) new MutationObserver(_pillObserverCb).observe(_waveNumEl, { childList: true, characterData: true, subtree: true });
if (_scoreNumEl) new MutationObserver(_pillObserverCb).observe(_scoreNumEl, { childList: true, characterData: true, subtree: true });
if (_killsNumEl) new MutationObserver(_pillObserverCb).observe(_killsNumEl, { childList: true, characterData: true, subtree: true });
window._appleShellSyncPill = syncPill;
if (!isMobile) {
const _wvPill = document.getElementById('apple-wave-pill');
setInterval(()=>{
if(document.hidden || state !== 'playing') return;
const _aliveEnemies = (typeof enemies !== 'undefined') ? enemies.filter(e=>e&&e.alive).length : 0;
const _isChaos = _aliveEnemies >= 10;
if(_wvPill) _wvPill.classList.toggle('chaos-hide', _isChaos);
}, 600);
}
const apoPause = _makeEl('div', '');
apoPause.id = 'apple-pause-overlay';
apoPause.innerHTML = `
<div class="apo-card" style="max-width:340px;">
<div style="margin-bottom:6px;">${__pauseSvg(30,'#aaff00')}</div>
<div class="apo-title">Paused</div>
<div class="apo-wave" id="apo-wave-info">Wave 1</div>

<div id="apo-mixtures" style="margin:12px 0 4px;padding:10px 12px;background:rgba(255,120,0,0.07);border:1px solid rgba(255,140,20,0.18);border-radius:10px;display:none;">
<div style="font-family:var(--sf);font-size:9px;font-weight:700;color:rgba(255,160,40,0.55);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">◇ Active Mixtures</div>
<div id="apo-mixtures-list" style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-height:96px;overflow-y:auto;padding:2px;"></div>
</div>
<div id="apo-mixtures-empty" style="margin:10px 0 2px;font-family:var(--sf);font-size:10px;color:rgba(80,140,20,0.28);text-align:center;letter-spacing:0.5px;display:none;">No mixtures active this run</div>

<div class="apo-btns">
<button class="apo-primary" id="apo-resume"><svg class="ico"><use href="#ico-play"/></svg> Resume</button>

<button class="apo-muted" id="apo-save-btn" style="border-color:rgba(0,255,200,0.3);color:rgba(0,220,180,0.7);">Save Checkpoint</button>
<div id="apo-cp-info" style="font-family:var(--sf);font-size:10px;color:rgba(0,180,140,0.45);text-align:center;letter-spacing:0.3px;min-height:14px;margin-top:-4px;"></div>
<button class="apo-danger" id="apo-menu">Exit to Menu</button>
</div>
</div>
`;
document.body.appendChild(apoPause);
const origPauseOverlay = $('pause-overlay');
if (origPauseOverlay) {
const pauseObs = new MutationObserver(() => {
const isVisible = origPauseOverlay.classList.contains('active');
apoPause.classList.toggle('visible', isVisible);
if (isVisible) {
const waveEl = $('wave-num');
const scoreEl = $('score-num');
const waveInfo = $('apo-wave-info');
if (waveInfo) waveInfo.textContent = `Wave ${waveEl?.textContent || 1} · ${parseInt(scoreEl?.textContent || 0).toLocaleString()} pts`;
origPauseOverlay.style.visibility = 'hidden';
origPauseOverlay.style.pointerEvents = 'none';
} else {
origPauseOverlay.style.visibility = '';
origPauseOverlay.style.pointerEvents = '';
}
});
pauseObs.observe(origPauseOverlay, { attributes: true, attributeFilter: ['class'] });
}
$('apo-resume')?.addEventListener('click', () => {
const resumeBtn = $('resume-btn');
if (resumeBtn) resumeBtn.click();
apoPause.classList.remove('visible');
if (origPauseOverlay) {
origPauseOverlay.style.visibility = '';
origPauseOverlay.style.pointerEvents = '';
origPauseOverlay.classList.remove('active');
}
if (typeof isMobile !== 'undefined' && isMobile && typeof showTouchControls === 'function') {
showTouchControls(true);
}
});
$('apo-resume')?.addEventListener('touchstart', e => {
e.preventDefault();
$('apo-resume').click();
}, { passive: false });
$('apo-menu')?.addEventListener('click', () => {
const menuBtn = $('menu-btn');
if (menuBtn) menuBtn.click();
apoPause.classList.remove('visible');
if (origPauseOverlay) { origPauseOverlay.style.visibility = ''; origPauseOverlay.style.pointerEvents = ''; }
_restoreMorePanel();
menuShell.classList.add('active');
});
$('apo-menu')?.addEventListener('touchstart', e => {
e.preventDefault();
$('apo-menu').click();
}, { passive: false });
const _apoSaveBtn = document.getElementById('apo-save-btn');
const _apoCpInfo = document.getElementById('apo-cp-info');
function _apoUpdateCpInfo(){
if(!_apoCpInfo) return;
if(typeof _checkpoint !== 'undefined' && _checkpoint && _checkpoint.wave > 0){
const diff = (typeof wave !== 'undefined' ? wave : 0) - _checkpoint.wave;
_apoCpInfo.textContent = diff > 0
? `Last save: Wave ${_checkpoint.wave} (${diff} wave${diff!==1?'s':''} ago)`
: `Checkpoint: Wave ${_checkpoint.wave} — current`;
} else {
_apoCpInfo.textContent = 'No checkpoint saved yet';
}
}
if(_apoSaveBtn){
_apoSaveBtn.addEventListener('click', () => {
if(typeof state === 'undefined' || state !== 'playing') return;
if(typeof audioManager !== 'undefined') audioManager.uiClick();
if(typeof saveCheckpoint === 'function') saveCheckpoint();
_apoUpdateCpInfo();
_apoSaveBtn.textContent = 'OK Saved — Wave ' + (typeof wave !== 'undefined' ? wave : '?');
setTimeout(() => { _apoSaveBtn.textContent = 'Save Checkpoint'; }, 2000);
const _legacyCpInfo = document.getElementById('pause-checkpoint-info');
if(_legacyCpInfo && typeof _checkpoint !== 'undefined' && _checkpoint){
_legacyCpInfo.textContent = 'LAST SAVE: WAVE ' + _checkpoint.wave;
}
});
_apoSaveBtn.addEventListener('touchstart', e => { e.preventDefault(); _apoSaveBtn.click(); }, { passive: false });
}
const _apoPauseEl = document.getElementById('apple-pause-overlay');
if(_apoPauseEl){
new MutationObserver(() => {
if(_apoPauseEl.classList.contains('visible')){
_apoUpdateCpInfo();
const _mixWrap  = document.getElementById('apo-mixtures');
const _mixList  = document.getElementById('apo-mixtures-list');
const _mixEmpty = document.getElementById('apo-mixtures-empty');
if(_mixWrap && _mixList && _mixEmpty){
try{
const _hasMuts = typeof activeMutators !== 'undefined' && activeMutators.size > 0;
const _hasDefs = typeof MUTATOR_DEFS !== 'undefined';
if(_hasMuts && _hasDefs){
_mixList.innerHTML = '';
activeMutators.forEach(id => {
const def = MUTATOR_DEFS.find(m => m.id === id);
if(!def) return;
const pill = document.createElement('div');
const _pillCol = def.col || '#ff8800';
let _pillBg = 'rgba(255,120,0,0.08)';
const _hex = _pillCol.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
if(_hex) _pillBg = `rgba(${parseInt(_hex[1],16)},${parseInt(_hex[2],16)},${parseInt(_hex[3],16)},0.13)`;
pill.style.cssText = `display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:20px;border:1px solid ${_pillCol};background:${_pillBg};font-family:var(--sf);font-size:10px;font-weight:600;color:${_pillCol};letter-spacing:0.3px;white-space:nowrap;`;
pill.innerHTML = `${def.icon||'▸'} ${def.name}`;
pill.title = def.desc || '';
_mixList.appendChild(pill);
});
_mixWrap.style.display = 'block';
_mixEmpty.style.display = 'none';
let _multLine = _mixWrap.querySelector('#apo-mix-mult');
if(!_multLine){
_multLine = document.createElement('div');
_multLine.id = 'apo-mix-mult';
_multLine.style.cssText = 'font-family:var(--sf);font-size:9px;color:rgba(255,200,80,0.6);text-align:center;margin-top:7px;letter-spacing:0.5px;';
_mixWrap.appendChild(_multLine);
}
_multLine.textContent = `Score ×${(1 + activeMutators.size * 0.5).toFixed(1)} · ${activeMutators.size} mixture${activeMutators.size!==1?'s':''} active`;
} else {
_mixWrap.style.display  = 'none';
_mixEmpty.style.display = 'block';
}
}catch(_e){
_mixWrap.style.display  = 'none';
_mixEmpty.style.display = 'none';
}
}
}
}).observe(_apoPauseEl, { attributes: true, attributeFilter: ['class'] });
}
const nextLvlPrompt = _makeEl('div', '');
nextLvlPrompt.id = 'apple-next-level-prompt';
nextLvlPrompt.innerHTML = `
<div class="anlp-card">
<div class="anlp-wave-badge">
<span>▸</span>
<span class="anlp-wave-label" id="anlp-wave-text">Wave Clear!</span>
</div>
<div class="anlp-title">Pick Your Upgrade</div>
<div class="anlp-sub" id="anlp-sub">Choose a perk below to power up for the next wave.</div>
<div class="anlp-btns">
<button class="anlp-secondary" id="anlp-close">v See Upgrade Choices</button>
</div>
</div>
`;
document.body.appendChild(nextLvlPrompt);
const upgradePanel = $('upgrade-panel');
if (upgradePanel) {
const upObs = new MutationObserver(() => {
const isVisible = upgradePanel.style.display !== 'none' && upgradePanel.style.display !== '';
if (isVisible) {
const waveEl = $('wave-num');
const waveText = $('anlp-wave-text');
if (waveText) waveText.textContent = `Wave ${waveEl?.textContent || '?'} Complete!`;
nextLvlPrompt.classList.add('visible');
} else {
nextLvlPrompt.classList.remove('visible');
}
});
upObs.observe(upgradePanel, { attributes: true, attributeFilter: ['style', 'class'] });
}
$('anlp-close')?.addEventListener('click', () => {
nextLvlPrompt.classList.remove('visible');
});
const _origShowLevelComplete = window.__assertOrig('showLevelComplete');
let _lcBusy = false;   // per-wrapper re-entry guard: a second call inside the window can't double-submit score/rewards
window.showLevelComplete = function() {
if (_lcBusy) return;
_lcBusy = true; setTimeout(function(){ _lcBusy = false; }, 2500);
const _cl = window.currentLevel;
const isTutorial = _cl && _cl.isTutorialLevel;
const _snapLevel = _cl ? { id: _cl.id, name: _cl.name } : null;
const _snapScore = window.score;
const _snapWave = window.wave;
const _snapKills = window.totalKills;
if (_origShowLevelComplete) {
try { _origShowLevelComplete.call(this); } catch(_e) { console.warn('[Apple UI] showLevelComplete original error', _e); }
}
if (isTutorial) {
menuShell.classList.add('active');
try { window.updateResumeButton && window.updateResumeButton(); } catch(_e) {}
try { window.renderLB && window.renderLB(); } catch(_e) {}
try { window.applyMenuOnboarding && window.applyMenuOnboarding(); } catch(_e) {}
if (typeof syncLeaderboard === 'function') try { syncLeaderboard(); } catch(_e) {}
if (typeof updateResumeBanner === 'function') try { updateResumeBanner(); } catch(_e) {}
return;
}
if (!_snapLevel) {
console.warn('[Apple UI] showLevelComplete: no level snapshot, skipping card build');
menuShell.classList.add('active');
try { window.updateResumeButton && window.updateResumeButton(); } catch(_e) {}
return;
}
window.currentLevel = null;
window.levelExplicitlyChosen = false;
const allLevels = (typeof window.gameDB !== 'undefined' && window.gameDB.getAllLevels)
? window.gameDB.getAllLevels()
: [];
const completedId = _snapLevel.id;
const completedName = _snapLevel.name;
const isLastCampaign = completedId === 8;
const campaignAllDone = allLevels.filter(l => l.id >= 1 && l.id <= 8).every(l => l.completed);
const nextLvl = (!isLastCampaign && completedId >= 1 && completedId < 8)
? allLevels.find(l => l.id === completedId + 1) : null;
const _score = _snapScore;
const _wave = _snapWave;
const _kills = _snapKills;
try {
const freshLevels = gameDB.getAllLevels();
menuShell.querySelectorAll('.level-card[data-lvl]').forEach(card => {
const numId = parseInt(card.dataset.lvl.replace('lvl_', ''), 10);
if (isNaN(numId)) return;
const lv = freshLevels.find(l => l.id === numId);
if (!lv) return;
if (lv.unlocked && card.classList.contains('lc-locked')) {
card.classList.remove('lc-locked');
if (lv.isFinalBoss) card.classList.add('lc-finalboss');
card.setAttribute('title', lv.name);
const badgeEl = card.querySelector('.level-card-badge');
if (badgeEl) badgeEl.innerHTML = lv.isFinalBoss ? '<svg class="ico"><use href="#ico-bolt"/></svg>' : lv.emoji;
const nameEl = card.querySelector('.level-card-name');
if (nameEl && lv.isFinalBoss) nameEl.style.color = '#ff0066';
card.addEventListener('click', () => {
window._appleSelectedIsBossRush = false;
menuShell.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
card.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = lv.name;
window._appleSelectedLevel = lv;
});
}
if (lv.completed) card.classList.add('lc-completed');
});
const _endlessCardNow = menuShell.querySelector('.level-card[data-lvl="endless"]');
if (_endlessCardNow && _endlessCardNow.classList.contains('lc-locked')) {
const _stillLocked = !(freshLevels.find(l => l.id === 10) || {}).unlocked;
if (!_stillLocked) {
const fresh = _endlessCardNow.cloneNode(false);
fresh.className = 'level-card lc-endless';
fresh.dataset.lvl = 'endless';
fresh.setAttribute('title', '∞ Survive as long as you can');
fresh.innerHTML = `
<div class="level-card-name">∞ Endless Mode</div>
<div class="level-card-env">Survive as long as you can</div>
<div class="level-card-badge"></div>
`;
fresh.addEventListener('click', () => {
selectedLevelId = null;
window._appleSelectedIsBossRush = false;
levelGrid.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
fresh.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = 'Endless Mode';
try {
window._appleSelectedLevel = (typeof gameDB !== 'undefined')
? (gameDB.getAllLevels().find(l => l.id === 10) || null)
: null;
} catch(e) { window._appleSelectedLevel = null; }
try {
const _daily = getDailyRouletteMutators();
window._dailyRouletteMutators = _daily;
_daily.forEach(id => activeMutators.add(id));
} catch(e) {}
if (typeof syncMutators === 'function') try { syncMutators(); } catch(e) {}
});
_endlessCardNow.replaceWith(fresh);
if (typeof showPickupMsg === 'function') showPickupMsg('∞ ENDLESS MODE UNLOCKED', '#7fff00');
}
}
const _bossRushCardNow = menuShell.querySelector('.level-card[data-lvl="bossrush"]');
if (_bossRushCardNow && _bossRushCardNow.classList.contains('lc-locked')) {
let _stillLocked = true;
try { _stillLocked = !localStorage.getItem('diy_medal_ironGhost'); } catch(e) {}
if (!_stillLocked) {
const fresh = _bossRushCardNow.cloneNode(false);
fresh.className = 'level-card lc-bossrush';
fresh.dataset.lvl = 'bossrush';
fresh.setAttribute('title', '▸ All 7 bosses back-to-back');
fresh.innerHTML = `
<div class="level-card-name" style="color:#ff8c00;">▸ Boss Rush</div>
<div class="level-card-env">* All 7 Bosses</div>
<div class="level-card-badge"></div>
`;
fresh.addEventListener('click', () => {
selectedLevelId = 'bossrush';
window._appleSelectedLevel = null;
window._appleSelectedIsBossRush = true;
levelGrid.querySelectorAll('.level-card').forEach(lc => lc.classList.remove('selected'));
fresh.classList.add('selected');
menuShell.querySelector('#acard-level-sub').textContent = '▸ Boss Rush — All 7 Bosses';
});
_bossRushCardNow.replaceWith(fresh);
if (typeof showPickupMsg === 'function') showPickupMsg('▸ BOSS RUSH UNLOCKED', '#ff8c00');
}
}
} catch(_e) {}
menuShell.querySelector('#ams-level-complete-card')?.remove();
const lcCard = _makeEl('div', 'acard');
lcCard.id = 'ams-level-complete-card';
lcCard.style.cssText = 'border-color:rgba(120,255,0,0.45);background:linear-gradient(135deg,rgba(20,60,0,0.9),rgba(4,14,2,0.95));';
const nextBtnHtml = nextLvl ? `
<button id="ams-lc-next" style="
width:100%;padding:14px;margin-bottom:10px;
background:linear-gradient(135deg,rgba(60,150,0,0.85),rgba(20,80,0,0.9));
border:1px solid rgba(120,255,0,0.45);border-radius:12px;
font-family:var(--sf);font-size:15px;font-weight:700;
color:rgba(140,255,0,0.95);letter-spacing:0.5px;
cursor:pointer;touch-action:manipulation;
box-shadow:0 4px 24px rgba(60,200,0,0.25);">
<svg class="ico"><use href="#ico-play"/></svg> Next: ${nextLvl.name}
</button>` : (campaignAllDone ? `
<div style="font-family:var(--sf);font-size:12px;color:rgba(255,180,0,0.8);text-align:center;padding:8px 0 12px;letter-spacing:0.5px;">
All campaign missions complete!<br>
<span style="font-size:11px;color:rgba(120,200,40,0.5);">Endless mode unlocked</span>
</div>` : '');
const _amsRunRecords = (typeof recordRunStats === 'function') ? recordRunStats() : {bestCombo:0,isNewComboRecord:false,totalBossKills:0,runBossKills:0,runCombo:0};
lcCard.innerHTML = `
<div style="padding:18px 16px 4px;text-align:center;">
<div style="font-size:28px;margin-bottom:6px;">OK</div>
<div style="font-family:var(--sf);font-size:18px;font-weight:800;color:rgba(140,255,0,0.95);letter-spacing:0.5px;margin-bottom:2px;">${completedName} Cleared</div>
<div style="font-family:var(--sf);font-size:11px;color:rgba(80,140,20,0.5);letter-spacing:1px;margin-bottom:14px;">MISSION COMPLETE</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
<div style="background:rgba(0,20,0,0.5);border:1px solid rgba(60,100,0,0.3);border-radius:8px;padding:8px 4px;">
<div style="font-family:var(--sf);font-size:18px;font-weight:700;color:rgba(120,255,0,0.9);">${_score.toLocaleString()}</div>
<div style="font-family:var(--sf);font-size:9px;color:rgba(60,100,20,0.5);letter-spacing:1px;margin-top:2px;">SCORE</div>
</div>
<div style="background:rgba(0,20,0,0.5);border:1px solid rgba(60,100,0,0.3);border-radius:8px;padding:8px 4px;">
<div style="font-family:var(--sf);font-size:18px;font-weight:700;color:rgba(120,255,0,0.9);">${_wave}</div>
<div style="font-family:var(--sf);font-size:9px;color:rgba(60,100,20,0.5);letter-spacing:1px;margin-top:2px;">WAVES</div>
</div>
<div style="background:rgba(0,20,0,0.5);border:1px solid rgba(60,100,0,0.3);border-radius:8px;padding:8px 4px;">
<div style="font-family:var(--sf);font-size:18px;font-weight:700;color:rgba(120,255,0,0.9);">${_kills}</div>
<div style="font-family:var(--sf);font-size:9px;color:rgba(60,100,20,0.5);letter-spacing:1px;margin-top:2px;">KILLS</div>
</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
<div style="background:rgba(0,20,0,0.5);border:1px solid ${_amsRunRecords.isNewComboRecord?'rgba(255,215,0,0.5)':'rgba(60,100,0,0.3)'};border-radius:8px;padding:8px 4px;">
<div style="font-family:var(--sf);font-size:16px;font-weight:700;color:${_amsRunRecords.isNewComboRecord?'rgba(255,215,0,0.95)':'rgba(120,255,0,0.9)'};">×${_amsRunRecords.runCombo}${_amsRunRecords.isNewComboRecord?' *':''}</div>
<div style="font-family:var(--sf);font-size:9px;color:rgba(60,100,20,0.5);letter-spacing:1px;margin-top:2px;">BEST COMBO</div>
</div>
<div style="background:rgba(0,20,0,0.5);border:1px solid rgba(60,100,0,0.3);border-radius:8px;padding:8px 4px;">
<div style="font-family:var(--sf);font-size:16px;font-weight:700;color:rgba(120,255,0,0.9);">${_amsRunRecords.runBossKills}${_amsRunRecords.totalBossKills>_amsRunRecords.runBossKills?' <span style=\"font-size:11px;opacity:0.6;\">(career: '+_amsRunRecords.totalBossKills+')</span>':''}</div>
<div style="font-family:var(--sf);font-size:9px;color:rgba(60,100,20,0.5);letter-spacing:1px;margin-top:2px;">BOSS KILLS</div>
</div>
</div>
${nextBtnHtml}
<button id="ams-lc-dismiss" style="
width:100%;padding:11px;
background:transparent;border:1px solid rgba(60,100,0,0.3);border-radius:12px;
font-family:var(--sf);font-size:13px;font-weight:500;
color:rgba(80,130,20,0.6);cursor:pointer;touch-action:manipulation;">
<- Back to Menu
</button>
</div>
`;
menuShell.classList.add('active');
const amsContent = menuShell.querySelector('.ams-content');
if (amsContent) amsContent.insertBefore(lcCard, amsContent.firstChild);
menuShell.scrollTop = 0;
if (amsContent) amsContent.scrollTop = 0;
lcCard.querySelector('#ams-lc-next')?.addEventListener('click', () => {
const _nextLvl = nextLvl;
lcCard.remove();
menuShell.classList.remove('active');
startLevel({ level: _nextLvl, carryOver: true });
});
lcCard.querySelector('#ams-lc-next')?.addEventListener('touchstart', e => {
e.preventDefault();
lcCard.querySelector('#ams-lc-next').click();
}, { passive: false });
lcCard.querySelector('#ams-lc-dismiss')?.addEventListener('click', () => {
lcCard.remove();
updateResumeBanner();
syncLeaderboard();
renderLB();
});
updateResumeBanner();
syncLeaderboard();
renderLB();
updateResumeButton();
};
const _origGoToMenu = (typeof goToMenu === 'function') ? goToMenu : window.goToMenu;
window.goToMenu = function goToMenu() {
const _ec = document.getElementById('end-card');
if (_ec && _ec.classList.contains('active')) _ec.classList.remove('active');
const _apo = document.getElementById('apple-pause-overlay');
if (_apo) _apo.classList.remove('visible');
try {
if (_origGoToMenu) _origGoToMenu.call(this);
} catch(_e) {
console.warn('[Apple UI] goToMenu original error', _e);
}
setTimeout(() => {
try{ const _tc=document.getElementById('touch-controls'); if(_tc) _tc.style.display='none'; }catch(_e){}
try{ const _h=document.getElementById('hud'); if(_h) _h.style.display='none'; }catch(_e){}
try{ const _wp=document.getElementById('apple-wave-pill'); if(_wp) _wp.classList.remove('visible'); }catch(_e){}
try{ if(typeof clampPanelHeights==='function') clampPanelHeights(); }catch(_e){}
try{ window._appleSelectedIsBossRush = false; }catch(_e){}
try{ window._appleSelectedLevel = null; }catch(_e){}
try{
menuShell.classList.add('active');
menuShell.scrollTop = 0;
menuShell.querySelector('#ams-level-complete-card')?.remove();
requestAnimationFrame(()=>{
try{
if(!menuShell.classList.contains('active') || getComputedStyle(menuShell).display==='none'){
menuShell.classList.add('active');
}
}catch(_e3){}
});
}catch(_e){
console.warn('[Apple UI] menuShell reset error', _e);
try{
const _liveShell = document.getElementById('apple-menu-shell');
if(_liveShell) _liveShell.classList.add('active');
state=window.state='menu';
}catch(_e2){}
}
function _syncAllCards(){
try { if(typeof updateResumeBanner==='function') updateResumeBanner(); } catch(_e){}
try { if(typeof syncDailyChallenges==='function') syncDailyChallenges(); } catch(_e){}
try { if(typeof syncPrestigeBadge==='function') syncPrestigeBadge();
if(typeof syncStreakBadge==='function') syncStreakBadge();
if(typeof syncRouletteBadge==='function') syncRouletteBadge(); } catch(_e){}
try {
const _tokEl = document.getElementById('armory-token-count');
if(_tokEl && typeof lifeTokens !== 'undefined') _tokEl.textContent = lifeTokens;
} catch(_e){}
try { if(typeof renderCharCard==='function') renderCharCard(); } catch(_e){}
try { if(typeof renderMutatorCards==='function') renderMutatorCards(); } catch(_e){}
try { if(typeof syncLeaderboard==='function') syncLeaderboard(); } catch(_e){}
try { if(typeof _syncDiffSegment==='function') _syncDiffSegment(); } catch(_e){}
try { if(typeof _syncSoundQuickBtn==='function') _syncSoundQuickBtn(); } catch(_e){}
try { if(typeof syncPill==='function') syncPill(); } catch(_e){}
try { if(typeof updateDcTimer==='function') updateDcTimer(); } catch(_e){}
}
_syncAllCards();
setTimeout(_syncAllCards, 120);
}, 0);
};
})();