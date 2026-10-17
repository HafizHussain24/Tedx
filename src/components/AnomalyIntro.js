// =====================================================================
//  TEDxCUSAT 2026 - Master Startup / Intro Animation (Cinematic Edition)
//  Theme: "ANOMALY"
//
//  Cinematic & Immersive Architecture:
//    - Web Audio API Procedural Soundscape:
//        * Cosmic sub-bass drone (43Hz - 87Hz) + solfeggio stardust pings
//        * Resonant gravitational vortex accretion sweep (2.6s - 4.8s)
//        * Accelerating seismic vibration pulse (3Hz -> 28Hz) + rising tension tone (4.8s - 9.0s)
//        * Pre-detonation vacuum gasp silence drop (120ms before blast)
//        * Massive 808 sub-boom impact (130Hz -> 24Hz) + spacetime electrical crackle
//        * Dimensional portal dive Doppler whoosh (10.6s - 12.6s)
//    - Relativistic Space & Black Hole Aesthetics:
//        * Distant twinkling starfield with Einstein gravitational microlensing
//        * Deep space ambient gas nebulae (purple, indigo, crimson dust)
//        * Razor-sharp incandescent photon sphere ring
//        * Asymmetric Doppler relativistic backlight rim
//        * Accretion disruption ripples on cometary consumption
//        * Keplerian comets with fluid plasma tails & starlight glints
//        * Gravitational spacetime distortion ripples during compression
//        * Anamorphic horizontal lens flare streak
//        * Galaxy-textured irregular shockwaves with logarithmic spiral filaments
//        * Diagonal spacetime rift (30° from vertical) with destination-out website cutout
//        * Camera zoom parallax (1.15x -> 1.0x)
//        * Minimalist sci-fi telemetry HUD (CUSAT coordinates, anomaly status)
// =====================================================================

import { IntroAudio } from './IntroAudio.js';

export const INTRO_CONFIG = {
  theme: 'ANOMALY',

  // Master Timeline Segments (in seconds)
  timings: {
    orbitDuration: 2.6,       // 0.0s - 2.6s: Natural celestial orbiting comets
    suctionStart: 2.6,        // 2.6s: Swelling & organic gravitational spiral suction begin
    consumptionEnd: 4.8,      // 4.8s: All dots swallowed, void fully swollen (2.2s suction)
    compressionEnd: 9.0,      // 4.8s - 9.0s: 4.2s extended violent shrinking & white-hot shift
    explosionTime: 9.0,       // 9.0s: Supernova detonation & diagonal space tear rip
    zoomStart: 10.6,          // 10.6s: Camera zoom dive into tear (1.6s space rift opening)
    zoomEnd: 12.6,            // 12.6s: Portal engulfs screen, website fully revealed (2.0s zoom)
    totalDuration: 12.6,      // Master end
    skipFadeInTime: 0.35,     // Sound & skip controls appear promptly
  },

  // Color Palette
  colors: {
    pureBlack: '#000000',
    obsidianCharcoal: '#0c0d14',
    spaceDarkMid: '#07080c',
    spaceDarkVoid: '#040407',
    white: '#ffffff',
    primaryRed: '#e62b1e',
    brightRed: '#ff2b1e',
    softRedOrange: '#ff5722',
    purple: '#9c27b0',
    deepPurple: '#511378',
    cosmicAmber: '#ff7844',
  },

  // Particle Counts (tuned for 120fps/60fps silkiness)
  counts: {
    dotsDesktop: 72,          // Crisp comets with 3-dot tails
    dotsMobile: 42,
    stardustDesktop: 240,     // Explosion stardust embers
    stardustMobile: 100,
    nebulaPuffsDesktop: 24,   // Explosion nebula gas puffs
    nebulaPuffsMobile: 12,
    fragmentsCount: 40,       // Tear rim fragments
    godRays: 44,              // Volumetric radiant rays
  },

  // Spatial Dimensions
  dimensions: {
    baseVoidRadius: 46,
    expandedVoidRadius: 68,
    compressedVoidRadius: 7,
    tearAngleDeg: 30,         // Diagonal tear: 30 degrees from vertical
  },

  // Zoom Parallax Settings
  zoom: {
    websiteScaleStart: 1.15,  // Website starts scaled to 1.15x
    websiteScaleEnd: 1.0,     // Eases smoothly down to 1.0x
    tearScaleEnd: 46.0,       // Tear expands to engulf viewport
  },

  sessionStorageKey: 'tedx_anomaly_intro_played',
};

export class AnomalyIntro {
  constructor(options = {}) {
    this.config = INTRO_CONFIG;
    this.onComplete = options.onComplete || (() => {});

    // DOM Elements
    this.overlay = document.getElementById('intro-overlay');
    this.canvas = document.getElementById('intro-canvas');
    this.controlsContainer = document.getElementById('intro-controls');
    this.skipBtn = document.getElementById('intro-skip-btn');
    this.audioBtn = document.getElementById('intro-audio-btn');
    this.soundText = document.getElementById('intro-sound-text');
    this.soundIcon = this.audioBtn ? this.audioBtn.querySelector('.intro-sound-icon') : null;
    this.websiteRoot = document.getElementById('website-root') || document.querySelector('.app-container');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;

    // Viewport Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.isMobile = this.width < 768;
    this.dpr = 1;

    // Master Timeline State
    this.startTime = null;
    this.pauseStartTime = 0;
    this.totalPauseDuration = 0;
    this.lastTimestamp = 0;
    this.currentTime = 0.0;
    this.animId = null;
    this.isFinished = false;
    this.isPaused = false;
    this.hasExploded = false;

    // Procedural Audio Engine
    this.audio = new IntroAudio();
    this.hasTriggeredVortexAudio = false;
    this.hasTriggeredCompressionAudio = false;
    this.hasTriggeredSupernovaAudio = false;
    this.hasTriggeredPortalAudio = false;

    // Black Hole State
    this.voidRadius = this.config.dimensions.baseVoidRadius;
    this.voidGlowIntensity = 0.55;
    this.shakeX = 0;
    this.shakeY = 0;

    // Cached Canvas Assets
    this.bgGrad = null;

    // Particle Systems & Cosmos
    this.nebulaDustClouds = [];
    this.orbitDots = [];
    this.accretionRipples = [];
    this.gravitationalRipples = [];
    this.shockwaves = [];
    this.stardust = [];
    this.nebulaPuffs = [];
    this.tearFragments = [];
    this.godRays = [];
    this.lightningBranches = [];

    // Diagonal Space Tear Geometry
    this.tearPointsTop = [];
    this.tearPointsBottom = [];
    this.tearDiagonalLength = 0;

    this.init();
  }

  // ───────────────────────────────────────────────────────────────────
  // Initialization & Checks
  // ───────────────────────────────────────────────────────────────────
  init() {
    if (!this.overlay || !this.canvas || !this.ctx) return;

    // 1. Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.instantSkip();
      return;
    }

    // 2. Play once per session
    if (this.hasPlayedInSession()) {
      this.instantSkip();
      return;
    }

    // Setup active overlay state
    this.overlay.classList.remove('is-hidden');
    this.overlay.style.display = 'block';
    this.overlay.style.opacity = '1';

    // Set initial website zoom scale (1.15x) so it sits ready behind the canvas
    if (this.websiteRoot) {
      this.websiteRoot.style.transform = `scale(${this.config.zoom.websiteScaleStart})`;
      this.websiteRoot.style.transformOrigin = '50% 50%';
    }

    this.resizeCanvas();
    this.initNebulaDust();
    this.initComets();
    this.buildTearGeometry();
    this.initGodRays();
    this.setupListeners();

    // Start Master Timeline Loop
    this.startTime = null;
    this.lastTimestamp = performance.now();
    this.animId = requestAnimationFrame((ts) => this.loop(ts));

    // Audio Autoplay: Try warming up context on start
    this.audio.init();
    this.audio.resumeAudio().then((unlocked) => {
      if (unlocked) {
        if (this.soundText) this.soundText.textContent = 'SOUND: ON';
        if (this.soundIcon) this.soundIcon.textContent = '🔊';
        if (this.audioBtn) this.audioBtn.classList.remove('pulse-unmute');
      } else {
        if (this.soundText) this.soundText.textContent = 'ENABLE SOUND';
        if (this.soundIcon) this.soundIcon.textContent = '🔊';
        if (this.audioBtn) this.audioBtn.classList.add('pulse-unmute');
      }
    });
  }

  hasPlayedInSession() {
    try {
      return sessionStorage.getItem(this.config.sessionStorageKey) === 'true';
    } catch {
      return false;
    }
  }

  markPlayedInSession() {
    try {
      sessionStorage.setItem(this.config.sessionStorageKey, 'true');
    } catch {}
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.initNebulaDust();
      this.buildTearGeometry();
    });

    // Global user gesture listeners to unlock audio immediately on first interaction anywhere
    const unlockAudio = async () => {
      const unlocked = await this.audio.resumeAudio();
      if (unlocked) {
        if (this.soundText) this.soundText.textContent = 'SOUND: ON';
        if (this.soundIcon) this.soundIcon.textContent = '🔊';
        if (this.audioBtn) this.audioBtn.classList.remove('pulse-unmute');
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (this.overlay) {
        this.overlay.removeEventListener('click', unlockAudio);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    if (this.overlay) {
      this.overlay.addEventListener('click', unlockAudio);
    }

    // Audio Toggle Button
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isSoundOn = this.audio.toggleMute();
        if (this.soundText) this.soundText.textContent = isSoundOn ? 'SOUND: ON' : 'SOUND: MUTED';
        if (this.soundIcon) this.soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
        if (this.audioBtn) this.audioBtn.classList.remove('pulse-unmute');
      });
    }

    // Skip Button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.instantSkip();
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.code === 'Space') && !this.isFinished) {
        this.instantSkip();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isPaused = true;
        this.pauseStartTime = performance.now();
      } else {
        if (this.isPaused && this.pauseStartTime > 0) {
          const pauseDelta = performance.now() - this.pauseStartTime;
          this.totalPauseDuration += pauseDelta;
          if (this.startTime !== null) {
            this.startTime += pauseDelta;
          }
        }
        this.isPaused = false;
        this.lastTimestamp = performance.now();
      }
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.isMobile = this.width < 768;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    // Cache the background gradient (eliminates allocations per frame)
    const { colors } = this.config;
    const maxDimension = Math.max(this.width, this.height);
    this.bgGrad = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 20,
      this.centerX, this.centerY, maxDimension * 0.75
    );
    this.bgGrad.addColorStop(0, colors.obsidianCharcoal);
    this.bgGrad.addColorStop(0.45, colors.spaceDarkMid);
    this.bgGrad.addColorStop(1, colors.spaceDarkVoid);
  }

  // ───────────────────────────────────────────────────────────────────
  // Cosmos: Ambient Cosmic Nebulae
  // ───────────────────────────────────────────────────────────────────
  initNebulaDust() {
    const maxDim = Math.max(this.width, this.height);
    this.nebulaDustClouds = [
      { x: this.width * 0.26, y: this.height * 0.32, r: maxDim * 0.44, color: '18, 7, 36', alpha: 0.085 },
      { x: this.width * 0.74, y: this.height * 0.68, r: maxDim * 0.40, color: '34, 8, 16', alpha: 0.075 },
      { x: this.width * 0.50, y: this.height * 0.50, r: maxDim * 0.32, color: '9, 13, 34', alpha: 0.095 },
    ];
  }

  // ───────────────────────────────────────────────────────────────────
  // Comets Initialization: Natural Celestial Dynamics & Keplerian Motion
  // ───────────────────────────────────────────────────────────────────
  initComets() {
    this.orbitDots = [];
    const count = this.isMobile
      ? this.config.counts.dotsMobile
      : this.config.counts.dotsDesktop;

    const minR = 56;
    const maxR = Math.max(this.width, this.height) * 0.44;

    for (let i = 0; i < count; i++) {
      const distRatio = Math.pow(Math.random(), 1.45);
      const semiMajor = minR + distRatio * (maxR - minR);
      const initialAngle = Math.random() * Math.PI * 2;

      // Natural Keplerian orbital speed (inner comets orbit faster than outer comets)
      const direction = Math.random() < 0.15 ? -1 : 1;
      const speedMagnitude = 0.85 + 46 / (semiMajor + 35);
      const baseSpeed = speedMagnitude * direction;

      // Subtle celestial eccentricity (0.05 to 0.16) for organic, non-robotic orbital breathing
      const eccentricity = 0.05 + Math.random() * 0.11;
      const periapsisAngle = Math.random() * Math.PI * 2;

      // Initial elliptical radius
      const initialR = semiMajor * (1 - eccentricity * Math.cos(initialAngle - periapsisAngle));

      // Comet head size (2.8px to 4.5px)
      const headSize = Math.random() < 0.35 ? 3.8 + Math.random() * 0.65 : 2.8 + Math.random() * 0.5;

      // 50% Official TED Red, 50% Starlight White
      const isRed = Math.random() < 0.48;
      const rgb = isRed ? '230, 43, 30' : '255, 255, 255';
      const alpha = 0.88 + Math.random() * 0.12;

      // Pre-compile color styles to eliminate garbage collection pauses
      const styles = {
        halo: isRed ? 'rgba(230, 43, 30, 0.22)' : 'rgba(255, 255, 255, 0.22)',
        head: `rgba(${rgb}, ${alpha})`,
        core: '#ffffff',
        trailLine: `rgba(${rgb}, ${alpha * 0.24})`,
        tail1: `rgba(${rgb}, ${alpha * 0.48})`,
        tail2: `rgba(${rgb}, ${alpha * 0.26})`,
        tail3: `rgba(${rgb}, ${alpha * 0.12})`,
      };

      this.orbitDots.push({
        semiMajor,
        eccentricity,
        periapsisAngle,
        baseR: semiMajor,
        r: initialR,
        angle: initialAngle,
        initialAngle,
        speed: baseSpeed,
        baseSpeed,
        radialSpeed: 0,
        direction,
        headSize,
        isRed,
        colorRgb: rgb,
        alpha,
        styles,
        hasSparked: false,
        absorbed: false,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Diagonal Space Tear Geometry (30° from vertical)
  // ───────────────────────────────────────────────────────────────────
  buildTearGeometry() {
    this.tearDiagonalLength = Math.hypot(this.width, this.height) * 1.35;
    const halfLen = this.tearDiagonalLength / 2;
    const maxTearWidth = Math.min(this.width * 0.35, 220);

    const segments = 56;
    const topPoints = [];
    const bottomPoints = [];

    const leftTip = { x: -halfLen, y: 0 };
    const rightTip = { x: halfLen, y: 0 };

    topPoints.push(leftTip);
    bottomPoints.push(leftTip);

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = -halfLen + t * this.tearDiagonalLength;
      const envelope = Math.sin(t * Math.PI);

      const gougeTop = i % 7 === 0 ? 1.75 : (i % 4 === 0 ? 1.4 : (i % 2 === 0 ? 0.9 : 1.15));
      const gougeBottom = i % 6 === 0 ? 1.7 : (i % 3 === 0 ? 1.35 : (i % 2 === 0 ? 0.85 : 1.2));

      const jitterTop = Math.sin(i * 4.3) * 12 + Math.cos(i * 8.7) * 7 + Math.sin(i * 15.1) * 3.5;
      const jitterBottom = Math.cos(i * 4.1) * 12 - Math.sin(i * 8.3) * 7 - Math.cos(i * 14.7) * 3.5;

      const yTop = -envelope * (maxTearWidth * 0.5) * gougeTop + jitterTop;
      const yBottom = envelope * (maxTearWidth * 0.5) * gougeBottom + jitterBottom;

      topPoints.push({ x, y: yTop });
      bottomPoints.push({ x, y: yBottom });
    }

    topPoints.push(rightTip);
    bottomPoints.push(rightTip);

    this.tearPointsTop = topPoints;
    this.tearPointsBottom = bottomPoints;

    this.buildLightningBranches(topPoints, bottomPoints);
    this.buildTearFragments();
  }

  buildLightningBranches(topPoints, bottomPoints) {
    this.lightningBranches = [];
    const all = [...topPoints, ...bottomPoints].filter((_, i) => i % 5 === 2);

    all.forEach((pt) => {
      const outAngle = Math.atan2(pt.y, pt.x) + (Math.random() - 0.5) * 0.5;
      const len = 40 + Math.random() * 90;
      const steps = 5;
      const path = [{ x: pt.x, y: pt.y }];

      let cx = pt.x;
      let cy = pt.y;
      for (let s = 1; s <= steps; s++) {
        cx += Math.cos(outAngle) * (len / steps) + (Math.random() - 0.5) * 14;
        cy += Math.sin(outAngle) * (len / steps) + (Math.random() - 0.5) * 14;
        path.push({ x: cx, y: cy });
      }

      this.lightningBranches.push({
        path,
        isWhite: Math.random() < 0.35,
        alpha: 0.6 + Math.random() * 0.4,
      });
    });
  }

  buildTearFragments() {
    this.tearFragments = [];
    const count = this.config.counts.fragmentsCount;
    for (let i = 0; i < count; i++) {
      const distAlong = (Math.random() - 0.5) * this.tearDiagonalLength * 0.85;
      const side = Math.random() < 0.5 ? 1 : -1;
      this.tearFragments.push({
        x: distAlong,
        y: side * (30 + Math.random() * 70),
        vx: (Math.random() - 0.5) * 24,
        vy: side * (12 + Math.random() * 34),
        size: 1.2 + Math.random() * 2.2,
        isWhite: Math.random() < 0.4,
        alpha: 0.5 + Math.random() * 0.5,
      });
    }
  }

  initGodRays() {
    this.godRays = [];
    const count = this.config.counts.godRays;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const length = 260 + Math.random() * 460;
      const width = 3.0 + Math.random() * 6.0;
      const isRed = Math.random() < 0.65;
      this.godRays.push({
        angle,
        length,
        width,
        colorRgb: isRed ? '230, 43, 30' : '255, 255, 255',
        alpha: 0.22 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Galaxy-Textured Irregular Shockwaves with Ethereal Low Opacity
  // ───────────────────────────────────────────────────────────────────
  triggerExplosion() {
    this.hasExploded = true;
    const maxR = Math.hypot(this.width, this.height) * 1.05;

    // 3 Staggered galactic shockwaves with low opacity, undulating lobes & spiral filaments
    this.shockwaves = [
      {
        r: 10,
        maxR: maxR * 1.35,
        speed: 1550,
        color: '255, 255, 255', // Silver-white outer shockfront
        baseAlpha: 0.20,
        alpha: 0.20,
        segments: 84,
        noiseAmp: 34,
        freq1: 4,
        freq2: 9,
        freq3: 15,
        swirlAngle: 0.38,
        armCount: 16,
      },
      {
        r: 6,
        maxR: maxR * 1.20,
        speed: 1220,
        color: '230, 43, 30',   // Crimson-Red galactic gas shell
        baseAlpha: 0.22,
        alpha: 0.22,
        segments: 84,
        noiseAmp: 44,
        freq1: 3,
        freq2: 7,
        freq3: 13,
        swirlAngle: -0.48,
        armCount: 18,
      },
      {
        r: 2,
        maxR: maxR * 1.05,
        speed: 860,
        color: '156, 39, 176',  // Deep Violet / Cosmic Plasma ring
        baseAlpha: 0.16,
        alpha: 0.16,
        segments: 84,
        noiseAmp: 50,
        freq1: 5,
        freq2: 11,
        freq3: 17,
        swirlAngle: 0.62,
        armCount: 14,
      },
    ];

    // Stardust Sparks & Embers with aerodynamic drag & fade
    this.stardust = [];
    const count = this.isMobile
      ? this.config.counts.stardustMobile
      : this.config.counts.stardustDesktop;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 1150;
      const size = 1.0 + Math.random() * 2.5;
      const type = Math.random();
      let colorRgb = '230, 43, 30';
      if (type < 0.35) {
        colorRgb = '255, 255, 255';
      } else if (type < 0.62) {
        colorRgb = '156, 39, 176';
      }

      this.stardust.push({
        x: this.centerX,
        y: this.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        colorRgb,
        life: 1.0,
        decay: 0.35 + Math.random() * 0.55,
      });
    }

    // Nebula Gas Puffs (Spreading cosmic clouds)
    this.nebulaPuffs = [];
    const puffCount = this.isMobile
      ? this.config.counts.nebulaPuffsMobile
      : this.config.counts.nebulaPuffsDesktop;

    for (let k = 0; k < puffCount; k++) {
      const angle = (k / puffCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 80 + Math.random() * 240;
      const colorType = Math.random();
      let colorRgb = '230, 43, 30';
      if (colorType < 0.38) {
        colorRgb = '156, 39, 176';
      } else if (colorType < 0.58) {
        colorRgb = '255, 255, 255';
      }

      this.nebulaPuffs.push({
        x: this.centerX,
        y: this.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 35 + Math.random() * 55,
        maxRadius: 170 + Math.random() * 220,
        colorRgb,
        alpha: 0.34 + Math.random() * 0.24,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Master Timeline Loop (High-Precision Continuous Clock)
  // ───────────────────────────────────────────────────────────────────
  loop(timestamp) {
    if (this.isFinished) return;

    if (this.startTime === null) {
      this.startTime = timestamp;
      this.lastTimestamp = timestamp;
    }

    // High precision delta time clamped to prevent massive jumps
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000.0, 0.05);
    this.lastTimestamp = timestamp;

    if (!this.isPaused) {
      this.currentTime = (timestamp - this.startTime) / 1000.0;
      this.update(this.currentTime, dt);
      this.render(this.currentTime);
    }

    if (this.currentTime >= this.config.timings.totalDuration) {
      this.completeAndReveal();
      return;
    }

    this.animId = requestAnimationFrame((ts) => this.loop(ts));
  }

  // ───────────────────────────────────────────────────────────────────
  // Master State Updates & Audio Synchronizations
  // ───────────────────────────────────────────────────────────────────
  update(t, dt) {
    const { timings, dimensions } = this.config;

    // Skip Controls Fade In after 1.0s
    if (t >= timings.skipFadeInTime && this.controlsContainer && !this.controlsContainer.classList.contains('is-visible')) {
      this.controlsContainer.classList.add('is-visible');
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 1: Natural Celestial Orbiting (0.0s - 2.6s)
    // ─────────────────────────────────────────────────────────────────
    if (t < timings.suctionStart) {
      this.voidRadius = dimensions.baseVoidRadius;
      this.voidGlowIntensity = 0.55;

      this.orbitDots.forEach((p) => {
        // Natural Keplerian orbital speed variation: speeds up at periapsis, slows down at apoapsis
        const deltaTheta = p.angle - p.periapsisAngle;
        const targetR = p.semiMajor * (1 - p.eccentricity * Math.cos(deltaTheta));
        const keplerSpeedMod = Math.pow(p.semiMajor / targetR, 1.25);

        p.angle += p.baseSpeed * keplerSpeedMod * dt;
        p.r = targetR;
        p.radialSpeed = 0;
        p.absorbed = false;
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 2: Natural Gravitational Swirling Suction (2.6s - 4.8s)
    // ─────────────────────────────────────────────────────────────────
    else if (t >= timings.suctionStart && t < timings.consumptionEnd) {
      // Audio trigger for vortex
      if (!this.hasTriggeredVortexAudio) {
        this.hasTriggeredVortexAudio = true;
        this.audio.startVortexSuction();
      }

      const suctionDuration = timings.consumptionEnd - timings.suctionStart;
      const suctionProgress = (t - timings.suctionStart) / suctionDuration;
      const easeSwelling = Math.sin(suctionProgress * Math.PI * 0.5);

      // Black hole swells gracefully from 46px to 68px with intensifying backlight rim glow
      this.voidRadius = dimensions.baseVoidRadius + (dimensions.expandedVoidRadius - dimensions.baseVoidRadius) * easeSwelling;
      this.voidGlowIntensity = 0.55 + easeSwelling * 0.95;

      this.orbitDots.forEach((p) => {
        if (p.absorbed) return;

        // Gravitational vortex acceleration: conservation of angular momentum spins up comets
        const gravityFactor = 1.0 + suctionProgress * 3.4 + (85 / (p.r + 20));
        p.angle += p.baseSpeed * gravityFactor * dt * 1.15;

        // Inward radial velocity accelerates smoothly
        const inwardAcc = 280 + suctionProgress * 1050 + (6200 / (p.r + 25));
        p.radialSpeed += inwardAcc * dt;
        p.r -= p.radialSpeed * dt;

        // Consumed upon crossing the event horizon
        if (p.r <= this.voidRadius * 0.45) {
          p.absorbed = true;
          // Spawn accretion impact energy ripple
          if (!p.hasSparked) {
            p.hasSparked = true;
            this.accretionRipples.push({
              r: this.voidRadius * 0.95,
              maxR: this.voidRadius + 22,
              alpha: 0.85,
              color: p.isRed ? '255, 43, 30' : '255, 255, 255',
            });
            // Synchronized deep gravitational mass thud (38Hz)
            const pan = Math.cos(p.angle) * 0.7;
            this.audio.playAccretionThud(pan);
          }
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 3: Critical Compression & Escalating Vibration (4.8s - 9.0s, 4.2s)
    // ─────────────────────────────────────────────────────────────────
    else if (t >= timings.consumptionEnd && t < timings.explosionTime) {
      // Audio trigger for compression vibration
      if (!this.hasTriggeredCompressionAudio) {
        this.hasTriggeredCompressionAudio = true;
        this.audio.startCompressionVibration(timings.explosionTime - timings.consumptionEnd);
      }

      const compressionDuration = timings.explosionTime - timings.consumptionEnd;
      const progress = (t - timings.consumptionEnd) / compressionDuration;

      // Black hole shrinks violently from 68px to 7px
      this.voidRadius = Math.max(
        dimensions.expandedVoidRadius - Math.pow(progress, 1.55) * (dimensions.expandedVoidRadius - dimensions.compressedVoidRadius),
        dimensions.compressedVoidRadius
      );

      // Shaking amplitude and frequency escalate exponentially over the 4.2s duration
      const amplitude = Math.pow(progress, 2.5) * 32.0;
      const freq = 32.0 + progress * 140.0;

      this.shakeX = Math.sin(t * freq) * amplitude + (Math.random() - 0.5) * amplitude * 0.38;
      this.shakeY = Math.cos(t * (freq * 1.15)) * amplitude + (Math.random() - 0.5) * amplitude * 0.38;

      // Spacetime gravitational distortion waves
      if (Math.random() < 0.28) {
        this.gravitationalRipples.push({
          r: this.voidRadius,
          maxR: this.voidRadius + 140 + progress * 180,
          speed: 180 + progress * 240,
          alpha: 0.35 + progress * 0.3,
        });
      }
    }

    // Update gravitational spacetime ripples
    this.gravitationalRipples.forEach((rip) => {
      rip.r += rip.speed * dt;
      rip.alpha = Math.max(rip.alpha - dt * 0.5, 0);
    });
    this.gravitationalRipples = this.gravitationalRipples.filter((rip) => rip.alpha > 0.01);

    // Update Accretion impact energy ripples
    this.accretionRipples.forEach((rip) => {
      rip.r += (rip.maxR - rip.r) * 0.24;
      rip.alpha = Math.max(rip.alpha - dt * 2.2, 0);
    });
    this.accretionRipples = this.accretionRipples.filter((rip) => rip.alpha > 0.01);

    // ─────────────────────────────────────────────────────────────────
    // Phase 4 & 5: Explosion & Diagonal Space Tear (9.0s+)
    // ─────────────────────────────────────────────────────────────────
    if (t >= timings.explosionTime) {
      this.shakeX = 0;
      this.shakeY = 0;

      if (!this.hasExploded) {
        this.triggerExplosion();
      }

      // Audio trigger for supernova blast
      if (!this.hasTriggeredSupernovaAudio) {
        this.hasTriggeredSupernovaAudio = true;
        this.audio.triggerSupernova();
      }

      // Update Shockwaves
      this.shockwaves.forEach((sw) => {
        if (sw.r < sw.maxR) {
          sw.r += sw.speed * dt;
          sw.alpha = Math.max(sw.baseAlpha * (1.0 - sw.r / sw.maxR), 0);
        }
      });

      // Update Stardust with aerodynamic drag & fade
      this.stardust.forEach((sp) => {
        if (sp.life > 0) {
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.life -= sp.decay * dt;
        }
      });

      // Update Nebula Gas Puffs
      this.nebulaPuffs.forEach((puff) => {
        if (puff.alpha > 0) {
          puff.x += puff.vx * dt;
          puff.y += puff.vy * dt;
          puff.vx *= 0.95;
          puff.vy *= 0.95;
          puff.radius += (puff.maxRadius - puff.radius) * 0.06;
          puff.alpha = Math.max(puff.alpha - dt * 0.42, 0);
        }
      });

      // Update Tear Fragments
      this.tearFragments.forEach((frag) => {
        frag.x += frag.vx * dt;
        frag.y += frag.vy * dt;
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 6: Camera Zoom Parallax Reveal (10.6s - 12.6s)
    // ─────────────────────────────────────────────────────────────────
    if (t >= timings.zoomStart) {
      if (!this.hasTriggeredPortalAudio) {
        this.hasTriggeredPortalAudio = true;
        this.audio.triggerPortalDive();
      }

      if (this.websiteRoot) {
        const zoomProgress = Math.min((t - timings.zoomStart) / (timings.zoomEnd - timings.zoomStart), 1.0);
        const easeInOut = 0.5 - 0.5 * Math.cos(zoomProgress * Math.PI);
        const websiteScale = this.config.zoom.websiteScaleStart - (this.config.zoom.websiteScaleStart - this.config.zoom.websiteScaleEnd) * easeInOut;
        this.websiteRoot.style.transform = `scale(${websiteScale})`;
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Canvas Rendering (Cinematic Immersion Pipeline)
  // ───────────────────────────────────────────────────────────────────
  render(t) {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const { timings, colors } = this.config;

    ctx.save();

    // 1. Clear with Deep Obsidian-Charcoal Space Canvas
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = this.bgGrad || colors.spaceDarkVoid;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Distant Deep Space Cosmic Nebulae (Multi-Stop Atmospheric Clouds)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    this.nebulaDustClouds.forEach((cloud) => {
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, cloud.r * 0.08, cloud.x, cloud.y, cloud.r);
      grad.addColorStop(0, `rgba(${cloud.color}, ${cloud.alpha})`);
      grad.addColorStop(0.55, `rgba(${cloud.color}, ${cloud.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Minimalist Sci-Fi Telemetry HUD (Editorial Monospace Typography)
    if (t < timings.explosionTime) {
      const hudAlpha = Math.max(0.48 * (1.0 - Math.max((t - 6.5) / 2.0, 0.0)), 0);
      if (hudAlpha > 0.02) {
        ctx.save();
        ctx.font = '500 11px var(--font-mono, "JetBrains Mono", monospace)';
        ctx.fillStyle = `rgba(255, 255, 255, ${hudAlpha})`;
        ctx.letterSpacing = '0.12em';
        ctx.fillText('• ANOMALY // 2026 • TEDxCUSAT • COGNITIVE RIFT', 32, 40);

        ctx.textAlign = 'right';
        ctx.fillText('COORDINATES: 09°58\'31"N 76°17\'45"E', this.width - 32, 40);
        ctx.restore();
      }
    }

    // Apply violent vibration during Phase 3
    if (t >= timings.consumptionEnd && t < timings.explosionTime) {
      ctx.translate(this.shakeX, this.shakeY);

      // Render Spacetime Gravitational Distortion Waves
      this.gravitationalRipples.forEach((rip) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rip.r, 0, Math.PI * 2);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = `rgba(230, 43, 30, ${rip.alpha * 0.4})`;
        ctx.stroke();
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Render Phase 1 & 2: Orbit & Swelling Suction
    // ─────────────────────────────────────────────────────────────────
    if (t < timings.consumptionEnd) {
      // ── A. Relativistic Asymmetric Backlight Rim Glow (Hero Section Style) ──
      const glowRadius = this.voidRadius + 24;
      const rimGrad = ctx.createRadialGradient(cx, cy, this.voidRadius * 0.92, cx, cy, glowRadius);
      rimGrad.addColorStop(0, `rgba(255, 43, 30, ${this.voidGlowIntensity})`);
      rimGrad.addColorStop(0.35, `rgba(230, 43, 30, ${this.voidGlowIntensity * 0.68})`);
      rimGrad.addColorStop(0.72, `rgba(230, 43, 30, ${this.voidGlowIntensity * 0.18})`);
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent Photon Sphere Ring (1.04x Void Radius)
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius * 1.04, 0, Math.PI * 2);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(this.voidGlowIntensity * 0.85, 0.9)})`;
      ctx.stroke();

      // Accretion Impact Energy Ripples
      this.accretionRipples.forEach((rip) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rip.r, 0, Math.PI * 2);
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = `rgba(${rip.color}, ${rip.alpha})`;
        ctx.stroke();
      });

      // ── B. Clean Comets with 3-Dot Translucent Tails ──
      const whiteDots = [];
      const redDots = [];

      this.orbitDots.forEach((p) => {
        if (p.absorbed) return;

        // Dynamic tail step angle based on true orbital speed and distance
        const stepAngle = (0.022 + 1.15 / p.r) * Math.sign(p.baseSpeed);

        const p0x = cx + Math.cos(p.angle) * p.r;
        const p0y = cy + Math.sin(p.angle) * p.r;

        // When being sucked inward (radialSpeed > 0), the tails curve backwards outward
        // creating authentic fluid spiral comet tails!
        const a1 = p.angle - stepAngle;
        const r1 = p.r + p.radialSpeed * 0.016;
        const p1x = cx + Math.cos(a1) * r1;
        const p1y = cy + Math.sin(a1) * r1;

        const a2 = p.angle - stepAngle * 2.0;
        const r2 = p.r + p.radialSpeed * 0.032;
        const p2x = cx + Math.cos(a2) * r2;
        const p2y = cy + Math.sin(a2) * r2;

        const a3 = p.angle - stepAngle * 3.0;
        const r3 = p.r + p.radialSpeed * 0.048;
        const p3x = cx + Math.cos(a3) * r3;
        const p3y = cy + Math.sin(a3) * r3;

        const item = { p, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y };
        if (p.isRed) redDots.push(item);
        else whiteDots.push(item);
      });

      // 1. Draw Translucent Connector Tapered Tail Lines
      this.drawCometTrails(ctx, whiteDots, 'rgba(255, 255, 255, 0.22)');
      this.drawCometTrails(ctx, redDots, 'rgba(230, 43, 30, 0.24)');

      // 2. Draw Trailing Translucent Dots (3 dots long)
      this.drawTrailingDots(ctx, whiteDots, '255, 255, 255');
      this.drawTrailingDots(ctx, redDots, '230, 43, 30');

      // 3. Draw Bold Head Nuclei with Soft Halos & Starlight Glints
      this.drawCometHeads(ctx, whiteDots, 'rgba(255, 255, 255, 0.22)', '#ffffff');
      this.drawCometHeads(ctx, redDots, 'rgba(230, 43, 30, 0.24)', '#e62b1e');

      // ── C. The Pitch-Black Void Center ──
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.pureBlack;
      ctx.fill();

      // Sharp backlight spill border
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = t >= timings.suctionStart
        ? `rgba(255, 43, 30, ${Math.min(this.voidGlowIntensity, 1.0)})`
        : 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();
    }

    // ─────────────────────────────────────────────────────────────────
    // Render Phase 3: Critical Compression & White-Hot Shift (4.8s - 9.0s)
    // ─────────────────────────────────────────────────────────────────
    else if (t >= timings.consumptionEnd && t < timings.explosionTime) {
      const progress = (t - timings.consumptionEnd) / (timings.explosionTime - timings.consumptionEnd);

      // Intense outer plasma aura
      const glowR = this.voidRadius + 18 + progress * 32;
      const orbGrad = ctx.createRadialGradient(cx, cy, this.voidRadius * 0.5, cx, cy, glowR);
      orbGrad.addColorStop(0, `rgba(255, 255, 255, ${0.92 + progress * 0.08})`);
      orbGrad.addColorStop(0.35, `rgba(230, 43, 30, ${0.85 + progress * 0.15})`);
      orbGrad.addColorStop(0.72, 'rgba(255, 87, 34, 0.45)');
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Boiling Core Color Shift: Pitch black -> Ruby red -> Fiery Orange -> Blinding White
      let coreColor = colors.pureBlack;
      if (progress < 0.40) {
        const pr = progress / 0.40;
        const rVal = Math.floor(pr * 230);
        coreColor = `rgb(${rVal}, 12, 12)`;
      } else {
        const pr = (progress - 0.40) / 0.60;
        const gb = Math.floor(pr * 255);
        coreColor = `rgb(255, ${gb}, ${gb})`;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Anamorphic Horizontal Lens Flare Streak Building Intensity
      if (progress > 0.55) {
        const flareAlpha = (progress - 0.55) / 0.45;
        const flareWidth = Math.min(this.width * 0.8, 800) * flareAlpha;
        const flareGrad = ctx.createLinearGradient(cx - flareWidth / 2, cy, cx + flareWidth / 2, cy);
        flareGrad.addColorStop(0, 'rgba(255, 43, 30, 0)');
        flareGrad.addColorStop(0.4, `rgba(255, 43, 30, ${flareAlpha * 0.6})`);
        flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flareAlpha * 0.95})`);
        flareGrad.addColorStop(0.6, `rgba(255, 43, 30, ${flareAlpha * 0.6})`);
        flareGrad.addColorStop(1, 'rgba(255, 43, 30, 0)');

        ctx.fillStyle = flareGrad;
        ctx.fillRect(cx - flareWidth / 2, cy - 2, flareWidth, 4);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Render Phase 4, 5 & 6: Explosion, Diagonal Tear & Zoom Reveal
    // ─────────────────────────────────────────────────────────────────
    if (t >= timings.explosionTime) {
      // ── 1. Galaxy-Textured Irregular Shockwaves with Soft Opacity ──
      this.renderGalaxyShockwaves(ctx, cx, cy, t);

      // ── 2. Nebula Gas Puffs ──
      this.nebulaPuffs.forEach((puff) => {
        if (puff.alpha > 0.02) {
          const pGrad = ctx.createRadialGradient(puff.x, puff.y, puff.radius * 0.15, puff.x, puff.y, puff.radius);
          pGrad.addColorStop(0, `rgba(${puff.colorRgb}, ${puff.alpha * 0.45})`);
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── 3. Stardust Sparks & Embers ──
      this.stardust.forEach((sp) => {
        if (sp.life > 0) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sp.colorRgb}, ${sp.life})`;
          ctx.fill();
        }
      });

      // ── 4. The DIAGONAL Space Tear (30° from vertical) ──
      ctx.save();
      ctx.translate(cx, cy);

      const tearAngleRad = (this.config.dimensions.tearAngleDeg - 90) * (Math.PI / 180);
      ctx.rotate(tearAngleRad);

      const tearOpenTime = Math.min((t - timings.explosionTime) / (timings.zoomStart - timings.explosionTime), 1.0);
      const tearOpenEase = Math.pow(tearOpenTime, 0.7);

      let tearZoom = 1.0;
      if (t >= timings.zoomStart) {
        const zoomT = Math.min((t - timings.zoomStart) / (timings.zoomEnd - timings.zoomStart), 1.0);
        tearZoom = 1.0 + Math.pow(zoomT, 2.8) * this.config.zoom.tearScaleEnd;
      }

      ctx.scale(tearZoom, tearZoom);

      // Volumetric Radiant God Rays
      this.godRays.forEach((ray) => {
        const pulse = Math.sin(t * 8.0 + ray.pulsePhase) * 0.25 + 0.75;
        const rayLen = ray.length * tearOpenEase * pulse;
        const cosA = Math.cos(ray.angle);
        const sinA = Math.sin(ray.angle);

        const rayGrad = ctx.createLinearGradient(0, 0, cosA * rayLen, sinA * rayLen);
        rayGrad.addColorStop(0, `rgba(${ray.colorRgb}, ${ray.alpha * 0.85})`);
        rayGrad.addColorStop(0.4, `rgba(${ray.colorRgb}, ${ray.alpha * 0.4})`);
        rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        const perpX = -sinA * ray.width;
        const perpY = cosA * ray.width;
        ctx.moveTo(-perpX * 0.4, -perpY * 0.4);
        ctx.lineTo(cosA * rayLen, sinA * rayLen);
        ctx.lineTo(perpX * 0.4, perpY * 0.4);
        ctx.closePath();
        ctx.fillStyle = rayGrad;
        ctx.fill();
      });

      // ── CUTOUT HOLE: destination-out reveals the REAL website! ──
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();

      if (this.tearPointsTop.length > 0) {
        ctx.moveTo(this.tearPointsTop[0].x, this.tearPointsTop[0].y * tearOpenEase);
        for (let i = 1; i < this.tearPointsTop.length; i++) {
          ctx.lineTo(this.tearPointsTop[i].x, this.tearPointsTop[i].y * tearOpenEase);
        }
        for (let i = this.tearPointsBottom.length - 1; i >= 0; i--) {
          ctx.lineTo(this.tearPointsBottom[i].x, this.tearPointsBottom[i].y * tearOpenEase);
        }
      }
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();

      // ── Tear Rim Energy Borders ──
      ctx.globalCompositeOperation = 'source-over';

      // Fiery Red Plasma Corona
      ctx.beginPath();
      this.traceTearBorder(ctx, tearOpenEase);
      ctx.lineWidth = 14;
      ctx.strokeStyle = 'rgba(230, 43, 30, 0.55)';
      ctx.stroke();

      // Neon Red Border
      ctx.beginPath();
      this.traceTearBorder(ctx, tearOpenEase);
      ctx.lineWidth = 4.8;
      ctx.strokeStyle = '#ff2b1e';
      ctx.stroke();

      // Razor Electric White Inner Lip
      ctx.beginPath();
      this.traceTearBorder(ctx, tearOpenEase);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Crackling Fractal Lightning Branches
      this.lightningBranches.forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(b.path[0].x, b.path[0].y * tearOpenEase);
        for (let s = 1; s < b.path.length; s++) {
          ctx.lineTo(b.path[s].x, b.path[s].y * tearOpenEase);
        }
        ctx.lineWidth = b.isWhite ? 1.8 : 1.2;
        ctx.strokeStyle = b.isWhite ? 'rgba(255, 255, 255, 0.9)' : 'rgba(230, 43, 30, 0.85)';
        ctx.stroke();
      });

      // Floating Tear Fragments
      this.tearFragments.forEach((frag) => {
        ctx.beginPath();
        ctx.arc(frag.x, frag.y * tearOpenEase, frag.size, 0, Math.PI * 2);
        ctx.fillStyle = frag.isWhite ? `rgba(255, 255, 255, ${frag.alpha})` : `rgba(230, 43, 30, ${frag.alpha})`;
        ctx.fill();
      });

      ctx.restore();

      // Initial Explosive Bright Flash & Horizontal Anamorphic Flare
      const flashElapsed = t - timings.explosionTime;
      if (flashElapsed >= 0 && flashElapsed < 0.36) {
        const flashAlpha = (1.0 - flashElapsed / 0.36);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.75})`;
        ctx.fillRect(0, 0, this.width, this.height);

        // Anamorphic horizontal blast beam
        const beamGrad = ctx.createLinearGradient(0, cy, this.width, cy);
        beamGrad.addColorStop(0, 'rgba(255, 43, 30, 0)');
        beamGrad.addColorStop(0.3, `rgba(255, 43, 30, ${flashAlpha * 0.6})`);
        beamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flashAlpha * 0.9})`);
        beamGrad.addColorStop(0.7, `rgba(255, 43, 30, ${flashAlpha * 0.6})`);
        beamGrad.addColorStop(1, 'rgba(255, 43, 30, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, cy - 4, this.width, 8);
      }
    }

    ctx.restore();
  }

  // ───────────────────────────────────────────────────────────────────
  // Helper: Batched Comet Trail Lines
  // ───────────────────────────────────────────────────────────────────
  drawCometTrails(ctx, dotGroup, strokeStyle) {
    if (dotGroup.length === 0) return;
    ctx.beginPath();
    dotGroup.forEach(({ p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y }) => {
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
    });
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // ───────────────────────────────────────────────────────────────────
  // Helper: Batched Trailing Dots (3 dots long)
  // ───────────────────────────────────────────────────────────────────
  drawTrailingDots(ctx, dotGroup, rgb) {
    if (dotGroup.length === 0) return;

    // Dot 1 (alpha ~0.48)
    ctx.beginPath();
    dotGroup.forEach(({ p, p1x, p1y }) => {
      ctx.moveTo(p1x + p.headSize * 0.72, p1y);
      ctx.arc(p1x, p1y, Math.max(p.headSize * 0.72, 0.8), 0, Math.PI * 2);
    });
    ctx.fillStyle = `rgba(${rgb}, 0.48)`;
    ctx.fill();

    // Dot 2 (alpha ~0.26)
    ctx.beginPath();
    dotGroup.forEach(({ p, p2x, p2y }) => {
      ctx.moveTo(p2x + p.headSize * 0.50, p2y);
      ctx.arc(p2x, p2y, Math.max(p.headSize * 0.50, 0.8), 0, Math.PI * 2);
    });
    ctx.fillStyle = `rgba(${rgb}, 0.26)`;
    ctx.fill();

    // Dot 3 (alpha ~0.12)
    ctx.beginPath();
    dotGroup.forEach(({ p, p3x, p3y }) => {
      ctx.moveTo(p3x + p.headSize * 0.32, p3y);
      ctx.arc(p3x, p3y, Math.max(p.headSize * 0.32, 0.7), 0, Math.PI * 2);
    });
    ctx.fillStyle = `rgba(${rgb}, 0.12)`;
    ctx.fill();
  }

  // ───────────────────────────────────────────────────────────────────
  // Helper: Batched Comet Heads & Halos with Starlight Glints
  // ───────────────────────────────────────────────────────────────────
  drawCometHeads(ctx, dotGroup, haloStyle, headFill) {
    if (dotGroup.length === 0) return;

    // Soft Outer Halos
    ctx.beginPath();
    dotGroup.forEach(({ p, p0x, p0y }) => {
      const haloR = p.headSize * 1.65;
      ctx.moveTo(p0x + haloR, p0y);
      ctx.arc(p0x, p0y, haloR, 0, Math.PI * 2);
    });
    ctx.fillStyle = haloStyle;
    ctx.fill();

    // Main Nuclei
    ctx.beginPath();
    dotGroup.forEach(({ p, p0x, p0y }) => {
      ctx.moveTo(p0x + p.headSize, p0y);
      ctx.arc(p0x, p0y, p.headSize, 0, Math.PI * 2);
    });
    ctx.fillStyle = headFill;
    ctx.fill();

    // Crisp Center Starlight Pinprick
    ctx.beginPath();
    dotGroup.forEach(({ p, p0x, p0y }) => {
      const coreR = p.headSize * 0.45;
      ctx.moveTo(p0x + coreR, p0y);
      ctx.arc(p0x, p0y, coreR, 0, Math.PI * 2);
    });
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Starlight Diffraction Glints on Larger Comets
    dotGroup.forEach(({ p, p0x, p0y }) => {
      if (p.headSize > 3.4) {
        const glintLen = p.headSize * 1.8;
        ctx.beginPath();
        ctx.moveTo(p0x - glintLen, p0y);
        ctx.lineTo(p0x + glintLen, p0y);
        ctx.moveTo(p0x, p0y - glintLen);
        ctx.lineTo(p0x, p0y + glintLen);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.stroke();
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────
  // Helper: Galaxy-Textured Irregular Shockwaves with Low Opacity
  // ───────────────────────────────────────────────────────────────────
  renderGalaxyShockwaves(ctx, cx, cy, t) {
    this.shockwaves.forEach((sw) => {
      if (sw.alpha <= 0.005) return;

      // A. Organic Multi-Octave Undulating Shockfront Waveform
      ctx.beginPath();
      for (let s = 0; s <= sw.segments; s++) {
        const theta = (s / sw.segments) * Math.PI * 2;
        // Organic fractal harmonics create realistic asymmetric cosmic lobes
        const warp = Math.sin(theta * sw.freq1 + t * 4.0) * (sw.noiseAmp * 0.55)
                   + Math.cos(theta * sw.freq2 - t * 3.2) * (sw.noiseAmp * 0.30)
                   + Math.sin(theta * sw.freq3 + t * 5.5) * (sw.noiseAmp * 0.15);
        const radius = Math.max(sw.r + warp, 1);
        const x = cx + Math.cos(theta) * radius;
        const y = cy + Math.sin(theta) * radius;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha * 0.65})`;
      ctx.stroke();

      // B. Diffuse Annular Cosmic Haze Band (Soft galaxy mist)
      ctx.lineWidth = 8.0;
      ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha * 0.15})`;
      ctx.stroke();

      // C. Swirling Galactic Spiral Filaments & Arms
      const armCount = sw.armCount || 16;
      for (let a = 0; a < armCount; a++) {
        const armTheta = (a / armCount) * Math.PI * 2;
        const warp = Math.sin(armTheta * sw.freq1 + t * 4.0) * (sw.noiseAmp * 0.55);
        const startR = Math.max(sw.r + warp, 1);
        const armLen = 32 + Math.sin(a * 3.7 + t * 2.0) * 22;

        const startX = cx + Math.cos(armTheta) * startR;
        const startY = cy + Math.sin(armTheta) * startR;

        // Quadratic curve curving in galactic spiral direction
        const midTheta = armTheta + sw.swirlAngle * 0.22;
        const midR = startR + armLen * 0.55;
        const ctrlX = cx + Math.cos(midTheta) * midR;
        const ctrlY = cy + Math.sin(midTheta) * midR;

        const endTheta = armTheta + sw.swirlAngle * 0.45;
        const endR = startR + armLen;
        const endX = cx + Math.cos(endTheta) * endR;
        const endY = cy + Math.sin(endTheta) * endR;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha * 0.35})`;
        ctx.stroke();

        // Embedded Starburst Knots along the filament tips
        if (a % 2 === 0) {
          ctx.beginPath();
          ctx.arc(endX, endY, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${sw.alpha * 0.55})`;
          ctx.fill();
        }
      }
    });
  }

  traceTearBorder(ctx, tearOpenEase) {
    if (this.tearPointsTop.length === 0) return;
    ctx.moveTo(this.tearPointsTop[0].x, this.tearPointsTop[0].y * tearOpenEase);
    for (let i = 1; i < this.tearPointsTop.length; i++) {
      ctx.lineTo(this.tearPointsTop[i].x, this.tearPointsTop[i].y * tearOpenEase);
    }
    for (let i = this.tearPointsBottom.length - 1; i >= 0; i--) {
      ctx.lineTo(this.tearPointsBottom[i].x, this.tearPointsBottom[i].y * tearOpenEase);
    }
    ctx.closePath();
  }

  // ───────────────────────────────────────────────────────────────────
  // Completion & Cleanup
  // ───────────────────────────────────────────────────────────────────
  completeAndReveal() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.markPlayedInSession();
    this.audio.destroy();

    if (this.websiteRoot) {
      this.websiteRoot.style.transform = '';
      this.websiteRoot.style.transformOrigin = '';
    }

    if (this.overlay) {
      this.overlay.style.transition = 'opacity 0.4s ease';
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.destroy();
      }, 400);
    } else {
      this.destroy();
    }

    this.onComplete();
  }

  instantSkip() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.markPlayedInSession();
    this.audio.destroy();

    if (this.websiteRoot) {
      this.websiteRoot.style.transform = '';
      this.websiteRoot.style.transformOrigin = '';
    }

    this.destroy();
    this.onComplete();
  }

  destroy() {
    this.isFinished = true;
    this.audio.destroy();

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.overlay.classList.add('is-hidden');
    }
    if (this.controlsContainer) {
      this.controlsContainer.classList.remove('is-visible');
    }
  }

  replay() {
    try {
      sessionStorage.removeItem(this.config.sessionStorageKey);
    } catch {}

    this.isFinished = false;
    this.hasExploded = false;
    this.hasTriggeredVortexAudio = false;
    this.hasTriggeredCompressionAudio = false;
    this.hasTriggeredSupernovaAudio = false;
    this.hasTriggeredPortalAudio = false;

    this.currentTime = 0.0;
    this.startTime = null;
    this.totalPauseDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shockwaves = [];
    this.stardust = [];
    this.nebulaPuffs = [];
    this.accretionRipples = [];
    this.gravitationalRipples = [];
    this.voidRadius = this.config.dimensions.baseVoidRadius;
    this.voidGlowIntensity = 0.55;

    // Reset audio and start celestial drone
    this.audio.reset();
    this.audio.init();
    this.audio.resumeAudio();

    if (this.overlay) {
      this.overlay.classList.remove('is-hidden');
      this.overlay.style.display = 'block';
      this.overlay.style.opacity = '1';
    }

    if (this.controlsContainer) {
      this.controlsContainer.classList.remove('is-visible');
    }

    if (this.websiteRoot) {
      this.websiteRoot.style.transform = `scale(${this.config.zoom.websiteScaleStart})`;
      this.websiteRoot.style.transformOrigin = '50% 50%';
    }

    this.initComets();
    this.buildTearGeometry();
    this.initGodRays();

    this.lastTimestamp = performance.now();
    if (!this.animId) {
      this.animId = requestAnimationFrame((ts) => this.loop(ts));
    }
  }
}
