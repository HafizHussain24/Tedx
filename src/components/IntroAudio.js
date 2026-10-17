// =====================================================================
//  TEDxCUSAT 2026 - Master Intro Cinematic Audio Engine
//  Theme: "ANOMALY"
//
//  Cinematic, visceral sub-bass sound design (Hans Zimmer / Interstellar style):
//    - Smooth exponential ease-in at startup (no abrupt jump).
//    - Psychoacoustically saturated harmonics so fundamental bass is felt
//      on subwoofers/headphones AND punchy, clear, and loud on laptop/mobile speakers.
//    - Phase 1: Deep cosmic harmonic drone (65Hz / 98Hz / 130Hz / 196Hz / 261Hz)
//               swelling smoothly over 2.2s with analog waveshaping and organic breath.
//    - Phase 2: Organic gravitational vortex roar (sweeping resonant cosmic wind)
//               + heavy cometary accretion mass thuds (punchy 160Hz -> 58Hz drop with stereo pan).
//    - Phase 3: Accelerating seismic tremolo (3.5Hz -> 28Hz) in exact sync with screen shake
//               + intense dark contrabass tension drone (95Hz -> 320Hz, filter opening to 720Hz)
//               + complete 140ms vacuum silence drop right before blast.
//    - Phase 4: Gargantuan, earth-shaking cinematic explosion detonation:
//               * Phase 1 drone completely stops at detonation.
//               * Concussive air displacement crack transient (380Hz -> 50Hz + 2.2kHz snap)
//               * High-energy fireball blast roar (wide 1600Hz -> 75Hz explosive combustion)
//               * Dual-layer heavy sub-bass earth-shaker (145Hz punch + 85Hz -> 26Hz sub)
//               * Spacetime tear violent rip shear
//               * 3.6-second rolling thunder shockwave rumble with 14Hz flutter.
//    - Phase 5: Dimensional low-end atmospheric draft into the hero section.
// =====================================================================

export class IntroAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.isUnlocked = false;
    this.hasExploded = false;

    // Master Audio Graph Nodes
    this.masterGain = null;
    this.saturator = null;
    this.compressor = null;
    this.makeupGain = null;

    // Phase 1: Cosmic Drone Nodes
    this.droneGain = null;
    this.droneOscs = [];
    this.droneFilter = null;
    this.droneLFO = null;
    this.isDroneActive = false;

    // Phase 2: Gravitational Vortex Roar
    this.vortexGain = null;
    this.vortexNoise = null;
    this.vortexFilter = null;
    this.vortexSubOsc = null;

    // Phase 3: Seismic Infrasonic Vibration
    this.seismicOsc = null;
    this.seismicAudibleOsc = null;
    this.seismicGain = null;
    this.seismicLFO = null;
    this.tensionDroneOsc = null;
    this.tensionDroneGain = null;
    this.tensionFilter = null;

    // State Throttling
    this.lastThudTime = 0;
  }

  reset() {
    this.hasExploded = false;
    this.isDroneActive = false;
  }

  // ───────────────────────────────────────────────────────────────────
  // Audio Graph Initialization & Saturation Waveshaper
  // ───────────────────────────────────────────────────────────────────
  init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      // 1. Master Input Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);

      // 2. Analog Tape / Tanh Soft-Clipping Saturation Waveshaper
      // Generates warm upper harmonics from low bass frequencies,
      // enabling laptop and mobile speakers to reproduce deep bass impact
      this.saturator = this.ctx.createWaveShaper();
      this.saturator.curve = this.createSaturationCurve();
      this.saturator.oversample = '2x';

      // 3. Cinematic Mastering Limiter / Dynamics Compressor
      // Prevents clipping while boosting density, RMS loudness, and punch
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.20, this.ctx.currentTime);

      // 4. Master Makeup Gain (Ensures bold, unmistakable presence)
      this.makeupGain = this.ctx.createGain();
      this.makeupGain.gain.setValueAtTime(1.4, this.ctx.currentTime);

      // Audio Routing
      this.masterGain.connect(this.saturator);
      this.saturator.connect(this.compressor);
      this.compressor.connect(this.makeupGain);
      this.makeupGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this.isUnlocked = this.ctx.state === 'running';

      // Setup initial cosmic drone (smooth ease-in)
      this.setupDeepCosmicDrone();
    } catch (e) {
      console.warn('Web Audio initialization error in IntroAudio:', e);
    }
  }

  createSaturationCurve() {
    const samples = 1024;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Hyperbolic tangent soft-clipping for analog warmth
      curve[i] = Math.tanh(x * 1.5) / Math.tanh(1.5);
    }
    return curve;
  }

  // ───────────────────────────────────────────────────────────────────
  // Autoplay Resume & Gesture Unlock
  // ───────────────────────────────────────────────────────────────────
  async resumeAudio() {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('Audio resume error:', e);
      }
    }

    this.isUnlocked = this.ctx.state === 'running';

    // If drone was not started or was scheduled while suspended, start it smoothly
    // but ONLY if the explosion hasn't happened yet!
    if (this.isUnlocked && !this.hasExploded && (!this.isDroneActive || this.droneOscs.length === 0)) {
      this.setupDeepCosmicDrone();
    }

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }

    return this.isUnlocked;
  }

  ensureAudioContext() {
    return this.resumeAudio();
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 1: Deep Cosmic Harmonic Drone (Smooth Ease-in at start)
  // ───────────────────────────────────────────────────────────────────
  setupDeepCosmicDrone() {
    if (!this.ctx || this.hasExploded) return;
    const now = this.ctx.currentTime;

    // Clean up any old drone oscillators
    this.droneOscs.forEach(o => {
      try { o.stop(); o.disconnect(); } catch {}
    });
    this.droneOscs = [];

    this.droneGain = this.ctx.createGain();
    // Smooth exponential ease-in starting from near silence over 2.2 seconds
    this.droneGain.gain.setValueAtTime(0.0001, now);
    this.droneGain.gain.exponentialRampToValueAtTime(0.80, now + 2.2);

    // Warm resonant low-pass filter open to 480Hz so harmonic overtones
    // are crystal-clear on laptop and phone speakers
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(480, now);
    this.droneFilter.Q.setValueAtTime(1.8, now);

    this.droneGain.connect(this.droneFilter);
    this.droneFilter.connect(this.masterGain);

    // Rich harmonic stack:
    // C2 (65.4Hz - Sub), G2 (98.0Hz - 5th), C3 (130.8Hz - Mid Octave),
    // G3 (196.0Hz - Upper 5th), C4 (261.6Hz - Warm Air)
    const pitches = [
      { freq: 65.41, type: 'sine', gain: 0.38, detune: -4 },
      { freq: 98.00, type: 'triangle', gain: 0.32, detune: 5 },
      { freq: 130.81, type: 'triangle', gain: 0.28, detune: -6 },
      { freq: 196.00, type: 'sine', gain: 0.22, detune: 7 },
      { freq: 261.63, type: 'sine', gain: 0.16, detune: -3 },
    ];

    pitches.forEach((p) => {
      const osc = this.ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, now);
      osc.detune.setValueAtTime(p.detune, now);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(p.gain, now);

      osc.connect(oscGain);
      oscGain.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // Slow 0.18Hz organic LFO for subtle celestial breathing
    try {
      this.droneLFO = this.ctx.createOscillator();
      this.droneLFO.frequency.setValueAtTime(0.18, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, now);
      this.droneLFO.connect(lfoGain);
      lfoGain.connect(this.droneGain.gain);
      this.droneLFO.start(now);
    } catch {}

    this.isDroneActive = true;
  }

  // Stop the Phase 1 cosmic drone cleanly and disconnect
  stopCosmicDrone(fadeDuration = 0.05) {
    if (!this.ctx || !this.isDroneActive) return;
    const now = this.ctx.currentTime;
    if (this.droneGain) {
      try {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.linearRampToValueAtTime(0.00001, now + fadeDuration);
      } catch {}
    }
    setTimeout(() => {
      this.droneOscs.forEach(o => {
        try { o.stop(); o.disconnect(); } catch {}
      });
      this.droneOscs = [];
      if (this.droneLFO) {
        try { this.droneLFO.stop(); this.droneLFO.disconnect(); } catch {}
        this.droneLFO = null;
      }
      this.isDroneActive = false;
    }, Math.floor(fadeDuration * 1000) + 30);
  }

  // ───────────────────────────────────────────────────────────────────
  // Cometary Mass Absorption: Solid Low-End Acoustic Thud
  // ───────────────────────────────────────────────────────────────────
  playAccretionThud(pan = 0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Throttle so impacts don't overlap into a muddy blur
    if (now - this.lastThudTime < 0.08) return;
    this.lastThudTime = now;

    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    const thudFilter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    thudOsc.type = 'triangle';
    // Punchy pitch drop: 160Hz -> 58Hz (audible transient punch + heavy mass weight)
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(58, now + 0.22);

    thudFilter.type = 'lowpass';
    thudFilter.frequency.setValueAtTime(380, now);
    thudFilter.frequency.exponentialRampToValueAtTime(110, now + 0.22);
    thudFilter.Q.setValueAtTime(2.2, now);

    thudGain.gain.setValueAtTime(0.65, now);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    thudOsc.connect(thudFilter);
    thudFilter.connect(thudGain);

    if (panner) {
      panner.pan.setValueAtTime(Math.max(Math.min(pan * 0.7, 0.75), -0.75), now);
      thudGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      thudGain.connect(this.masterGain);
    }

    thudOsc.start(now);
    thudOsc.stop(now + 0.26);
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 2: Organic Gravitational Vortex Roar (2.6s - 4.8s)
  // ───────────────────────────────────────────────────────────────────
  startVortexSuction() {
    if (!this.ctx || this.vortexNoise) return;
    const now = this.ctx.currentTime;

    // 1. Procedural Low-Frequency Brownian Wind Noise (Audible rush)
    const bufferSize = Math.floor(this.ctx.sampleRate * 2.5);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.08 * white) / 1.05;
      lastOut = output[i];
    }

    this.vortexNoise = this.ctx.createBufferSource();
    this.vortexNoise.buffer = noiseBuffer;
    this.vortexNoise.loop = true;

    // Resonant bandpass sweep (140Hz -> 580Hz) creating an audible gravitational rush
    this.vortexFilter = this.ctx.createBiquadFilter();
    this.vortexFilter.type = 'bandpass';
    this.vortexFilter.frequency.setValueAtTime(140, now);
    this.vortexFilter.frequency.exponentialRampToValueAtTime(580, now + 2.2);
    this.vortexFilter.Q.setValueAtTime(2.0, now);

    this.vortexGain = this.ctx.createGain();
    this.vortexGain.gain.setValueAtTime(0.01, now);
    this.vortexGain.gain.linearRampToValueAtTime(0.70, now + 1.1);
    this.vortexGain.gain.linearRampToValueAtTime(0.95, now + 2.2);

    // Deep harmonic vortex core (75Hz -> 155Hz)
    this.vortexSubOsc = this.ctx.createOscillator();
    this.vortexSubOsc.type = 'triangle';
    this.vortexSubOsc.frequency.setValueAtTime(75, now);
    this.vortexSubOsc.frequency.linearRampToValueAtTime(155, now + 2.2);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.45, now);

    this.vortexNoise.connect(this.vortexFilter);
    this.vortexFilter.connect(this.vortexGain);

    this.vortexSubOsc.connect(subGain);
    subGain.connect(this.vortexGain);

    this.vortexGain.connect(this.masterGain);

    this.vortexNoise.start(now);
    this.vortexSubOsc.start(now);
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 3: Seismic Tremor & Tension Build (4.8s - 9.0s, 4.2s)
  // ───────────────────────────────────────────────────────────────────
  startCompressionVibration(duration = 4.2) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fade out previous vortex
    if (this.vortexGain) {
      this.vortexGain.gain.linearRampToValueAtTime(0.001, now + 0.35);
    }

    // 1. Heavy Pulsing Sub-Bass Tremor (80Hz fundamental)
    this.seismicOsc = this.ctx.createOscillator();
    this.seismicOsc.type = 'triangle';
    this.seismicOsc.frequency.setValueAtTime(80, now);
    this.seismicOsc.frequency.linearRampToValueAtTime(135, now + duration - 0.15);

    // 2. Audible Mid Harmonic Tremor (160Hz -> 270Hz) for laptop speakers
    this.seismicAudibleOsc = this.ctx.createOscillator();
    this.seismicAudibleOsc.type = 'sawtooth';
    this.seismicAudibleOsc.frequency.setValueAtTime(160, now);
    this.seismicAudibleOsc.frequency.linearRampToValueAtTime(270, now + duration - 0.15);

    const seismicFilter = this.ctx.createBiquadFilter();
    seismicFilter.type = 'lowpass';
    seismicFilter.frequency.setValueAtTime(420, now);
    seismicFilter.Q.setValueAtTime(1.8, now);

    this.seismicGain = this.ctx.createGain();
    this.seismicGain.gain.setValueAtTime(0.05, now);
    this.seismicGain.gain.linearRampToValueAtTime(0.85, now + duration * 0.75);

    // Tremolo LFO accelerating from 3.5Hz up to 28Hz in exact sync with screen shake
    this.seismicLFO = this.ctx.createOscillator();
    this.seismicLFO.frequency.setValueAtTime(3.5, now);
    this.seismicLFO.frequency.exponentialRampToValueAtTime(28.0, now + duration - 0.15);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, now);
    this.seismicLFO.connect(lfoGain);
    lfoGain.connect(this.seismicGain.gain);

    this.seismicOsc.connect(seismicFilter);
    const audibleGain = this.ctx.createGain();
    audibleGain.gain.setValueAtTime(0.35, now);
    this.seismicAudibleOsc.connect(audibleGain);
    audibleGain.connect(seismicFilter);

    seismicFilter.connect(this.seismicGain);
    this.seismicGain.connect(this.masterGain);

    this.seismicOsc.start(now);
    this.seismicAudibleOsc.start(now);
    this.seismicLFO.start(now);

    // 3. Dark Atmospheric Compression Tone (Contrabass tension drone 95Hz -> 320Hz)
    this.tensionDroneOsc = this.ctx.createOscillator();
    this.tensionDroneOsc.type = 'sawtooth';
    this.tensionDroneOsc.frequency.setValueAtTime(95, now);
    this.tensionDroneOsc.frequency.linearRampToValueAtTime(320, now + duration - 0.15);

    this.tensionFilter = this.ctx.createBiquadFilter();
    this.tensionFilter.type = 'lowpass';
    this.tensionFilter.frequency.setValueAtTime(300, now);
    this.tensionFilter.frequency.linearRampToValueAtTime(720, now + duration - 0.15);
    this.tensionFilter.Q.setValueAtTime(3.2, now);

    this.tensionDroneGain = this.ctx.createGain();
    this.tensionDroneGain.gain.setValueAtTime(0.01, now);
    this.tensionDroneGain.gain.linearRampToValueAtTime(0.65, now + duration - 0.15);

    // 4. Psychoacoustic Absolute Vacuum Silence Drop (140ms before detonation)
    // Instantly cuts ALL tension & cosmic drone to total silence for maximum explosive shock
    const silenceStart = now + duration - 0.14;

    this.tensionDroneGain.gain.setValueAtTime(0.65, silenceStart);
    this.tensionDroneGain.gain.linearRampToValueAtTime(0.00001, silenceStart + 0.03);

    this.seismicGain.gain.setValueAtTime(0.85, silenceStart);
    this.seismicGain.gain.linearRampToValueAtTime(0.00001, silenceStart + 0.03);

    // Fade out Phase 1 drone completely into the vacuum drop
    if (this.droneGain) {
      try {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, silenceStart);
        this.droneGain.gain.linearRampToValueAtTime(0.00001, silenceStart + 0.03);
      } catch {}
    }

    this.tensionDroneOsc.connect(this.tensionFilter);
    this.tensionFilter.connect(this.tensionDroneGain);
    this.tensionDroneGain.connect(this.masterGain);

    this.tensionDroneOsc.start(now);
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 4: Gargantuan, Heavy & Realistic Cinematic Explosion
  // ───────────────────────────────────────────────────────────────────
  triggerSupernova() {
    if (!this.ctx) return;
    this.hasExploded = true;

    // STOP Phase 1 drone immediately and permanently when explosion occurs
    this.stopCosmicDrone(0.02);

    const now = this.ctx.currentTime;

    // ─────────────────────────────────────────────────────────────────
    // 1. Initial Shockwave Concussive Crack (Air Displacement Transient)
    // ─────────────────────────────────────────────────────────────────
    // Concussive Pitch-Drop Slam (380Hz -> 50Hz in 50ms)
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(380, now);
    crackOsc.frequency.exponentialRampToValueAtTime(50, now + 0.055);

    crackGain.gain.setValueAtTime(1.0, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    crackOsc.connect(crackGain);
    crackGain.connect(this.masterGain);
    crackOsc.start(now);
    crackOsc.stop(now + 0.10);

    // High-Frequency Air Shock Snap (2.2kHz shaped impulse)
    const snapSize = Math.floor(this.ctx.sampleRate * 0.08);
    const snapBuffer = this.ctx.createBuffer(1, snapSize, this.ctx.sampleRate);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapSize; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const snapSource = this.ctx.createBufferSource();
    snapSource.buffer = snapBuffer;

    const snapFilter = this.ctx.createBiquadFilter();
    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(2200, now);
    snapFilter.frequency.exponentialRampToValueAtTime(300, now + 0.07);
    snapFilter.Q.setValueAtTime(1.8, now);

    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.9, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapSource.start(now);

    // ─────────────────────────────────────────────────────────────────
    // 2. Fireball Blast Roar / Detonation Body (TNT Combustion Roar)
    // ─────────────────────────────────────────────────────────────────
    // Dynamic filter opens up wide to 1600Hz for the fiery explosive blast,
    // then rapidly sweeps down into a crushing low-mid roar
    const blastSize = Math.floor(this.ctx.sampleRate * 2.2);
    const blastBuffer = this.ctx.createBuffer(1, blastSize, this.ctx.sampleRate);
    const blastData = blastBuffer.getChannelData(0);
    let lastB = 0;
    for (let i = 0; i < blastSize; i++) {
      const white = Math.random() * 2 - 1;
      lastB = (lastB + 0.15 * white) / 1.12;
      blastData[i] = Math.max(-1.0, Math.min(1.0, lastB * 2.8 * Math.exp(-i / (this.ctx.sampleRate * 0.65))));
    }
    const blastSource = this.ctx.createBufferSource();
    blastSource.buffer = blastBuffer;

    const blastFilter = this.ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(1600, now);
    blastFilter.frequency.exponentialRampToValueAtTime(220, now + 0.65);
    blastFilter.frequency.exponentialRampToValueAtTime(75, now + 1.8);
    blastFilter.Q.setValueAtTime(2.2, now);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(1.0, now);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

    blastSource.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.masterGain);
    blastSource.start(now);

    // ─────────────────────────────────────────────────────────────────
    // 3. Dual-Layer Sub-Bass Heavy Earth-Shaker (Chest Punch + Infrasonic)
    // ─────────────────────────────────────────────────────────────────
    // Layer A: Low-Mid Punch (145Hz -> 45Hz) - Gives massive weight on laptops & phones
    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(145, now);
    punchOsc.frequency.exponentialRampToValueAtTime(45, now + 0.55);

    punchGain.gain.setValueAtTime(1.0, now);
    punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    punchOsc.connect(punchGain);
    punchGain.connect(this.masterGain);
    punchOsc.start(now);
    punchOsc.stop(now + 1.0);

    // Layer B: Deep Subwoofer Blast (85Hz -> 26Hz) - Shakes headphones and subwoofers
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(85, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 2.5);

    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.7);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 2.75);

    // ─────────────────────────────────────────────────────────────────
    // 4. Spacetime Tear Shear / Violent Spacetime Rip (340Hz -> 90Hz)
    // ─────────────────────────────────────────────────────────────────
    const ripOsc = this.ctx.createOscillator();
    const ripFilter = this.ctx.createBiquadFilter();
    const ripGain = this.ctx.createGain();
    ripOsc.type = 'sawtooth';
    ripOsc.frequency.setValueAtTime(340, now);
    ripOsc.frequency.exponentialRampToValueAtTime(90, now + 0.85);

    ripFilter.type = 'bandpass';
    ripFilter.frequency.setValueAtTime(520, now);
    ripFilter.frequency.exponentialRampToValueAtTime(110, now + 0.85);
    ripFilter.Q.setValueAtTime(3.8, now);

    ripGain.gain.setValueAtTime(0.75, now);
    ripGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.90);

    ripOsc.connect(ripFilter);
    ripFilter.connect(ripGain);
    ripGain.connect(this.masterGain);
    ripOsc.start(now);
    ripOsc.stop(now + 0.92);

    // ─────────────────────────────────────────────────────────────────
    // 5. Long Rolling Thunder / Shockwave Rumble Tail (IMAX Aftermath)
    // ─────────────────────────────────────────────────────────────────
    const rumbleSize = Math.floor(this.ctx.sampleRate * 3.6);
    const rumbleBuffer = this.ctx.createBuffer(1, rumbleSize, this.ctx.sampleRate);
    const rumbleData = rumbleBuffer.getChannelData(0);
    let r0 = 0, r1 = 0;
    for (let i = 0; i < rumbleSize; i++) {
      const white = Math.random() * 2 - 1;
      r0 = 0.96 * r0 + white * 0.12;
      r1 = 0.92 * r1 + r0 * 0.18;
      // Modulate with slow undulating rumble (14Hz) for genuine rolling thunder dynamics
      const flutter = 1.0 + 0.28 * Math.sin((i / this.ctx.sampleRate) * Math.PI * 2 * 14.0);
      rumbleData[i] = Math.max(-1.0, Math.min(1.0, r1 * flutter * Math.exp(-i / (this.ctx.sampleRate * 1.1))));
    }

    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(260, now);
    rumbleFilter.frequency.exponentialRampToValueAtTime(45, now + 3.2);
    rumbleFilter.Q.setValueAtTime(1.8, now);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.95, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumbleSource.start(now);
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 5: Dimensional Portal Transition (10.6s - 12.6s)
  // ───────────────────────────────────────────────────────────────────
  triggerPortalDive() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const diveOsc = this.ctx.createOscillator();
    const diveGain = this.ctx.createGain();
    const diveFilter = this.ctx.createBiquadFilter();

    diveOsc.type = 'triangle';
    diveOsc.frequency.setValueAtTime(140, now);
    diveOsc.frequency.exponentialRampToValueAtTime(50, now + 1.8);

    diveFilter.type = 'lowpass';
    diveFilter.frequency.setValueAtTime(360, now);
    diveFilter.frequency.exponentialRampToValueAtTime(90, now + 1.8);

    diveGain.gain.setValueAtTime(0.45, now);
    diveGain.gain.linearRampToValueAtTime(0.0001, now + 1.8);

    diveOsc.connect(diveFilter);
    diveFilter.connect(diveGain);
    diveGain.connect(this.masterGain);
    diveOsc.start(now);
    diveOsc.stop(now + 1.85);

    // Smoothly fade out intro audio as the website takes over
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0, now + 1.95);
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Controls & Cleanup
  // ───────────────────────────────────────────────────────────────────
  toggleMute() {
    this.resumeAudio();

    // If context was suspended or muted, the first user click always turns sound ON
    if (this.isMuted || !this.isUnlocked) {
      this.isMuted = false;
      this.isUnlocked = true;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      }
      return true;
    }

    // Normal toggle if already running
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
    }
  }

  destroy() {
    try {
      this.stopCosmicDrone(0.02);
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      setTimeout(() => {
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close().catch(() => {});
        }
      }, 200);
    } catch {}
  }
}
