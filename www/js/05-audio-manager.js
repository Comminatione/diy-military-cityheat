/* ============================================================================
   BOSS-WAVE TENSION AUDIO  (all environments)

   A procedural layer that sits on top of the normal level music and builds as
   the next boss wave gets closer. Nothing here is a sample: it is all WebAudio.

     wave 1 of a 5-wave block ..... silent
     wave 2 ................... faint low drone
     wave 3 ................... drone + occasional environment stings
     wave 4 ................... heartbeat, beating shimmer, stings; keeps climbing as the wave is cleared
     between wave 4 and boss ... "calm before the storm": heartbeat + drone hold high while you pick an upgrade
     boss wave starts ......... riser, then a hard cut + sub boom as the boss music takes over

   Driven by AudioManager.updateTension(), called every 15 ticks from updateGame().
   Respects the Music toggle and the Music volume slider. Tutorial, Boss Rush and
   one-wave final-boss levels are left alone.
   ============================================================================ */
(function () {
  'use strict';
  if (typeof AudioManager === 'undefined') return;
  const P = AudioManager.prototype;

  /* per-environment flavour: root note (Hz), waveform, dissonant interval (semitones),
     filter ceiling for the drone, and which stings it uses */
  const ENV = {
    jungle:    { root: 43.65, type: 'sawtooth', dis: 1, lp: 420, stings: ['whisper', 'groan', 'rumble'] },
    desert:    { root: 41.20, type: 'sawtooth', dis: 6, lp: 520, stings: ['wind', 'groan', 'rumble'] },
    urban:     { root: 49.00, type: 'square',   dis: 6, lp: 380, stings: ['metal', 'groan', 'rumble'] },
    warzone:   { root: 36.71, type: 'sawtooth', dis: 1, lp: 460, stings: ['rumble', 'metal', 'groan'] },
    arctic:    { root: 55.00, type: 'triangle', dis: 6, lp: 640, stings: ['ping', 'wind', 'groan'] },
    night:     { root: 38.89, type: 'sawtooth', dis: 6, lp: 360, stings: ['whisper', 'ping', 'groan'] },
    spaceship: { root: 46.25, type: 'sawtooth', dis: 1, lp: 540, stings: ['ping', 'metal', 'groan'] },
    mars:      { root: 41.20, type: 'triangle', dis: 6, lp: 560, stings: ['wind', 'rumble', 'ping'] },
    def:       { root: 43.65, type: 'sawtooth', dis: 6, lp: 450, stings: ['groan', 'rumble'] }
  };

  /* tension target for the wave you are playing / heading into (position 1..5 inside a 5-wave block) */
  const BASE = [0, 0.10, 0.28, 0.52, 0.85];

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function lowTier() {
    return (typeof isUltraLow !== 'undefined' && isUltraLow) ||
           (typeof isLowEndDesktop !== 'undefined' && isLowEndDesktop);
  }

  /* ---------- graph ---------- */
  P._tensionEnsure = function () {
    const ctx = this.audioContext;
    if (!ctx || !this.musicEnabled) return null;
    let s = this._tens;
    if (s && s.alive) return s;

    const env = ENV[this._musicEnv] || ENV.def;
    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    bus.connect(ctx.destination);

    const mk = (type, freq, det) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq; o.detune.value = det || 0;
      return o;
    };

    /* drone: root + a dissonant partner + octave, through a lowpass that opens with tension */
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 110; lp.Q.value = 2;
    const dg = ctx.createGain();
    dg.gain.value = 0.0001;
    lp.connect(dg); dg.connect(bus);
    const o1 = mk(env.type, env.root);
    const o2 = mk(env.type, env.root * Math.pow(2, env.dis / 12), -4);
    const o3 = mk('sine', env.root * 2);
    o1.connect(lp); o2.connect(lp); o3.connect(lp);

    /* shimmer: two high sines whose detune grows, so the beating speeds up as tension rises */
    const sg = ctx.createGain();
    sg.gain.value = 0.0001;
    sg.connect(bus);
    const h1 = mk('sine', env.root * 16);
    const h2 = mk('sine', env.root * 16, 3);
    h1.connect(sg); h2.connect(sg);

    const oscs = [o1, o2, o3, h1, h2];
    oscs.forEach((o) => o.start());

    s = this._tens = {
      alive: true, bus, lp, dg, sg, o1, o2, h2, oscs, env,
      T: 0, target: 0, nextSting: 0, zeroSince: 0,
      token: (this._tensTok = (this._tensTok || 0) + 1)
    };
    this._tensionHeartbeat(s);
    return s;
  };

  P._tensionDispose = function (fast) {
    const s = this._tens, ctx = this.audioContext;
    if (!s) return;
    s.alive = false;
    this._tens = null;
    clearTimeout(s.hbTO);
    const tail = fast ? 0.15 : 1.2;
    try {
      const t = ctx.currentTime;
      s.bus.gain.cancelScheduledValues(t);
      s.bus.gain.setValueAtTime(Math.max(0.0001, s.bus.gain.value), t);
      s.bus.gain.linearRampToValueAtTime(0.0001, t + tail);
    } catch (e) {}
    setTimeout(() => {
      s.oscs.forEach((o) => { try { o.stop(); } catch (e) {} try { o.disconnect(); } catch (e) {} });
      try { s.bus.disconnect(); } catch (e) {}
    }, tail * 1000 + 80);
  };

  /* ---------- heartbeat: lub-dub, 56 -> 118 BPM ---------- */
  P._tensionThump = function (ctx, s, when, amp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(82, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.14);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(amp, when + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    o.connect(g); g.connect(s.bus);
    o.start(when); o.stop(when + 0.25);
    /* upper harmonic so phone speakers (which cannot reproduce 42 Hz) still carry the beat */
    const c = ctx.createOscillator(), cg = ctx.createGain();
    c.type = 'triangle';
    c.frequency.setValueAtTime(165, when);
    c.frequency.exponentialRampToValueAtTime(95, when + 0.08);
    cg.gain.setValueAtTime(0.0001, when);
    cg.gain.linearRampToValueAtTime(amp * 0.45, when + 0.004);
    cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
    c.connect(cg); cg.connect(s.bus);
    c.start(when); c.stop(when + 0.12);
  };

  P._tensionHeartbeat = function (s) {
    const ctx = this.audioContext;
    if (!ctx) return;
    const tok = s.token;
    const ahead = lowTier() ? 0.45 : 0.15;
    const every = lowTier() ? 100 : 40;
    let next = ctx.currentTime + 0.3;
    const loop = () => {
      if (!this._tens || this._tens.token !== tok || !s.alive) return;
      try {
        const B = window.__engine && window.__engine.buildings;
        if (B && B.state !== 'playing') { this._tensionDispose(false); return; }
      } catch (e) {}
      const T = s.T;
      if (T > 0.2 && this.musicEnabled) {
        const period = 60 / (56 + T * 62);
        if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
        while (next < ctx.currentTime + ahead) {
          const amp = clamp01((T - 0.2) / 0.5) * 0.55 * this.musicVolume;
          this._tensionThump(ctx, s, next, amp);
          this._tensionThump(ctx, s, next + 0.17, amp * 0.62);
          next += period;
        }
      } else {
        next = ctx.currentTime + 0.1;
      }
      s.hbTO = setTimeout(loop, every);
    };
    loop();
  };

  /* ---------- one-shot stings ---------- */
  P._tensionSting = function (s, T) {
    const ctx = this.audioContext;
    if (!ctx || !s.alive) return;
    const kind = s.env.stings[Math.floor(Math.random() * s.env.stings.length)];
    const t0 = ctx.currentTime + 0.02;
    const U = this.musicVolume;
    const amp = (0.05 + T * 0.07) * U * 2;
    const env = (g, dur, peakAt) => {
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(amp, t0 + dur * peakAt);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    };
    const noise = (dur, type, f0, f1, q) => {
      const src = ctx.createBufferSource();
      src.buffer = this._getNoiseBuffer(ctx, Math.max(2, Math.ceil(dur)));
      const f = ctx.createBiquadFilter();
      f.type = type; f.Q.value = q || 1;
      f.frequency.setValueAtTime(f0, t0);
      if (f1) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      const g = ctx.createGain();
      env(g, dur, 0.45);
      src.connect(f); f.connect(g); g.connect(s.bus);
      src.start(t0); src.stop(t0 + dur + 0.1);
    };
    try {
      if (kind === 'groan') {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(74, t0);
        o.frequency.exponentialRampToValueAtTime(36, t0 + 2.0);
        f.type = 'lowpass'; f.frequency.value = 220;
        env(g, 2.0, 0.4);
        o.connect(f); f.connect(g); g.connect(s.bus);
        o.start(t0); o.stop(t0 + 2.1);
      } else if (kind === 'metal') {
        noise(0.95, 'bandpass', 900, 2600, 14);
      } else if (kind === 'wind') {
        noise(3.0, 'bandpass', 380, 900, 2.5);
      } else if (kind === 'rumble') {
        noise(2.2, 'lowpass', 90, 0, 0.7);
      } else if (kind === 'whisper') {
        noise(1.6, 'bandpass', 3600, 2800, 3);
      } else if (kind === 'ping') {
        [0, 0.38].forEach((delay, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = i ? 1318.5 : 1318.5 * 1.0;
          const a = amp * (i ? 0.4 : 0.8), t = t0 + delay;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(a, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
          o.connect(g); g.connect(s.bus);
          o.start(t); o.stop(t + 2.5);
        });
      }
    } catch (e) {}
  };

  /* ---------- apply a tension value to the live graph ---------- */
  P._tensionApply = function (s) {
    const ctx = this.audioContext;
    if (!ctx || !s.alive) return;
    const t = ctx.currentTime, T = s.T, U = this.musicVolume;
    const tc = 1.2;
    s.bus.gain.setTargetAtTime(1, t, 0.3);
    s.dg.gain.setTargetAtTime(Math.pow(T, 1.25) * 0.10 * U, t, tc);
    s.lp.frequency.setTargetAtTime(110 + T * T * s.env.lp, t, tc);
    s.sg.gain.setTargetAtTime(Math.max(0, T - 0.45) * 0.05 * U, t, tc);
    s.h2.detune.setTargetAtTime(3 + T * 24, t, tc);
    s.o1.frequency.setTargetAtTime(s.env.root * Math.pow(2, T / 12), t, tc);   /* creeps up ~1 semitone */
  };

  /* ---------- public: set target 0..1 (called by updateTension / events) ---------- */
  P._tensionSet = function (target) {
    target = clamp01(target);
    let s = this._tens;
    if (!s) {
      if (target < 0.02) return;
      s = this._tensionEnsure();
      if (!s) return;
      s.nextSting = performance.now() + 4000;
    }
    s.target = target;
    s.T += (target - s.T) * 0.35;          /* called every 250 ms, so this is a ~1 s ease */
    if (Math.abs(target - s.T) < 0.004) s.T = target;
    this._tensionApply(s);
    const now = performance.now();
    if (target < 0.02 && s.T < 0.03) {
      if (!s.zeroSince) s.zeroSince = now;
      if (now - s.zeroSince > 3500) this._tensionDispose(false);
      return;
    }
    s.zeroSince = 0;
    if (s.T > 0.3 && now >= s.nextSting) {
      this._tensionSting(s, s.T);
      s.nextSting = now + (16000 - 11000 * s.T) * (0.7 + Math.random() * 0.6);
    }
  };

  /* ---------- public: read the game state and pick the target ---------- */
  P.updateTension = function () {
    try {
      const E = window.__engine;
      if (!E || !E.buildings || !E.replay) return;
      const B = E.buildings, R = E.replay, lvl = R.currentLevel;
      const off = (R.waveOffset || 0);
      const inactive =
        !this.musicEnabled || !this.audioContext ||
        !this._musicEnv || this._musicEnv === 'menu' ||
        !lvl || lvl.isTutorialLevel || lvl.isBossRush || (lvl.maxWaves && lvl.maxWaves <= 1) ||
        B.state !== 'playing' || B.bossAlive || !B.wave ||
        this._tensHold || (performance.now() < (this._tensSwellUntil || 0));
      if (inactive) { if (this._tens) this._tensionSet(0); return; }

      const w = Math.max(1, B.wave - off);
      const pos = ((w - 1) % 5) + 1;                      /* 1..5 inside this block */
      const inWave = !!B.waveInProgress && !B.wavePending;
      let T;
      if (inWave) {
        const frac = B.waveTotal > 0 ? clamp01((B.waveKills || 0) / B.waveTotal) : 0;
        const here = BASE[pos - 1];
        const ahead = pos < 5 ? BASE[pos] : here;
        T = here + (ahead - here) * 0.6 * frac;           /* builds as you clear the wave */
      } else {
        T = BASE[pos < 5 ? pos : 0];                      /* between waves: the NEXT wave's level */
      }
      if (this._orb) T *= 0.6;                            /* Orbital Defense has its own pressure score */
      this._tensionSet(T);
    } catch (e) {}
  };

  /* ---------- wrappers: boss events ---------- */
  const _bossWarning = P.bossWarning;
  P.bossWarning = function () {
    const r = _bossWarning.apply(this, arguments);
    try {
      /* boss wave just started: swell to max and add a rising noise sweep; boss music cuts it in ~0.8 s */
      this._tensSwellUntil = performance.now() + 1500;
      const s = this._tens || (this.musicEnabled && this._tensionEnsure());
      const ctx = this.audioContext;
      if (s && ctx) {
        s.T = Math.max(s.T, 0.9);
        this._tensionApply(s);
        const t0 = ctx.currentTime, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = this._getNoiseBuffer(ctx, 2);
        f.type = 'bandpass'; f.Q.value = 3;
        f.frequency.setValueAtTime(300, t0);
        f.frequency.exponentialRampToValueAtTime(3600, t0 + 0.85);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.16 * this.musicVolume * 2, t0 + 0.8);
        g.gain.linearRampToValueAtTime(0.0001, t0 + 0.9);
        src.connect(f); f.connect(g); g.connect(s.bus);
        src.start(t0); src.stop(t0 + 1);
      }
    } catch (e) {}
    return r;
  };

  const _playBossMusic = P.playBossMusic;
  P.playBossMusic = function () {
    try {
      const s = this._tens, ctx = this.audioContext;
      if (s && ctx) {
        this._tensHold = true;                           /* stay silent until the boss is dead */
        /* hard cut + sub boom: the "drop" */
        const t = ctx.currentTime;
        s.bus.gain.cancelScheduledValues(t);
        s.bus.gain.setValueAtTime(0.0001, t);
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(70, t);
        o.frequency.exponentialRampToValueAtTime(28, t + 0.9);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.4 * this.musicVolume, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 1.1);
        const live = this._tens;
        setTimeout(() => { if (this._tens === live) this._tensionDispose(true); }, 60);
      }
    } catch (e) {}
    return _playBossMusic.apply(this, arguments);
  };

  const _stopBossMusic = P.stopBossMusic;
  P.stopBossMusic = function () {
    this._tensHold = false;
    return _stopBossMusic.apply(this, arguments);
  };

  const _stopMusic = P.stopMusic;
  P.stopMusic = function () {
    this._tensHold = false;
    this._tensionDispose(true);
    return _stopMusic.apply(this, arguments);
  };

  /* live music-volume slider: updateTension re-applies within 250 ms, nothing else needed */
})();