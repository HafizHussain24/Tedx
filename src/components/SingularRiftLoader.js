// =====================================================================
//  TEDxCUSAT 2026 - Starting Animation: The Void & Space Rift Tear
//  Theme: ANOMALY
//
//  Cinematic Choreography:
//    Phase 1: Accretion (~2.4s)
//             - Deep obsidian canvas with contrast against the pitch-black void
//             - Beaded orbital comets (Image 1 style: head dot + decaying bead tail)
//             - Tight backlight rim glow hugging the void (hero section style)
//
//    Phase 2: Swirling Spiral Suction (~2.0s)
//             - Comets accelerate exponentially into an inward accretion spiral
//             - Beaded tails curve naturally along the vortex until swallowed
//
//    Phase 3: Critical 3-Second Compression & Red Shift (~3.0s)
//             - The black hole begins vibrating, shrinking continuously from ~68px to 8px
//             - Jitter and screen shake escalate from subtle micro-tremor to violent instability
//             - Turns from pitch black into intense, boiling, superheated TED Red
//
//    Phase 4: Supernova Detonation & Diagonal Spacetime Slash (~1.9s)
//             - Detonates with an intense blast!
//             - Spews multiple expanding shockwaves, 280+ stardust embers & nebula puffs
//             - AT THE EXACT EPICENTER, ruptures into a DIAGONAL cosmic claw rift
//               slashing across spacetime in TEDx colours
//             - Volumetric god rays & dynamic fractal branching lightning
//             - Transparent cutout hole (destination-out) reveals live hero section
//
//    Phase 5: Dimensional Portal Dive (~1.1s)
//             - Camera accelerates directly through the diagonal tear into the website
// =====================================================================

export class SingularRiftLoader {
  constructor(options = {}) {
    this.minPhase1Duration = options.minDuration || 2400; // ms
    this.onRevealed = options.onRevealed || (() => {});

    // DOM Elements
    this.loader = document.getElementById('singularity-loader');
    this.canvas = document.getElementById('singularity-canvas');
    this.appContainer = document.querySelector('.app-container');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;

    // Viewport Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // State Machine
    // 1: Accretion, 2: Spiral Suction, 3: 3s Compression & Red Shift,
    // 4: Detonation & Diagonal Tear, 5: Portal Dive, 6: Done
    this.phase = 1;
    this.phaseStartTime = performance.now();
    this.startTime = performance.now();
    this.isAssetReady = false;
    this.isFinished = false;
    this.animId = null;

    // Void Properties
    this.baseVoidRadius = 46;
    this.expandedVoidRadius = 68;
    this.voidRadius = 46;
    this.voidGlowIntensity = 0.55;

    // Phase 3 Critical Collapse State (3 seconds exact)
    this.phase3Duration = 3000;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.voidCoreColor = '#000000';

    // Phase 4 Detonation State
    this.shockwaves = [];
    this.stardustParticles = [];
    this.nebulaPuffs = [];
    this.radiantLightRays = [];
    this.lightningTrees = [];
    this.plasmaSparks = [];

    // Diagonal Tear Properties (slashing diagonally ~-33 degrees)
    this.tearAngle = -Math.PI * 0.18; // ~-32.4 degrees
    this.tearScale = 0.0;
    this.tearOpenProgress = 0.0;
    this.zoomScale = 1.0;
    this.clawTopPoints = [];
    this.clawBottomPoints = [];
    this.tearWidth = 0;
    this.tearHeight = 0;

    this.lastLightningJitterTime = 0;

    this.init();
  }

  init() {
    if (!this.loader || !this.canvas || !this.ctx) return;

    this.loader.classList.remove('is-hidden');
    this.loader.style.display = 'block';

    if (this.appContainer) {
      this.appContainer.classList.add('is-preparing');
      this.appContainer.classList.remove('is-revealed');
    }

    this.resizeCanvas();
    this.initBeadedComets();
    this.buildClawTearGeometry();
    this.initRadiantLightRays();
    this.initFractalLightning();
    this.initPlasmaSparks();
    this.initListeners();

    // Start 60fps render loop
    this.startLoop();
  }

  initListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.buildClawTearGeometry();
      this.initRadiantLightRays();
      this.initFractalLightning();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.code === 'Space') && !this.isFinished) {
        this.triggerInstantReveal();
      }
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  // ───────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────
  // Phase 1: Orbiting Comets with Translucent Tail (~3 Dots Long)
  // ───────────────────────────────────────────────────────────────────
  initBeadedComets() {
    this.orbitDots = [];
    const count = 68; // 68 clean, elegant comets
    const minRadius = 56;
    const maxRadius = Math.max(this.width, this.height) * 0.45;

    for (let i = 0; i < count; i++) {
      const distRatio = Math.pow(Math.random(), 1.55);
      const r = minRadius + distRatio * (maxRadius - minRadius);
      const angle = Math.random() * Math.PI * 2;

      // Keplerian speed: inner comets orbit faster
      const orbitalSpeed = (0.012 + (44 / (r + 40))) * (Math.random() < 0.16 ? -1 : 1);

      // Bolder, nicely proportioned dots (2.8px to 4.6px)
      const headSize = Math.random() < 0.35 ? 3.8 + Math.random() * 0.8 : 2.8 + Math.random() * 0.6;

      // Translucent tail about 3 dots long
      const tailSteps = 3;

      // TEDx Colours: 50% TED Red, 50% Starlight White
      const isRed = Math.random() < 0.48;
      const colorRgb = isRed ? '235, 0, 40' : '255, 255, 255';
      const alpha = 0.85 + Math.random() * 0.15;

      this.orbitDots.push({
        r,
        baseR: r,
        angle,
        speed: orbitalSpeed,
        baseSpeed: orbitalSpeed,
        radialSpeed: 0,
        headSize,
        tailSteps,
        isRed,
        colorRgb,
        alpha,
        absorbed: false,
        history: [], // Stores recent positions for curling spiral during suction
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Phase 4: Supernova Detonation & Space Effects (Spewed Outward)
  // ───────────────────────────────────────────────────────────────────
  initDetonationEffects() {
    const maxR = Math.hypot(this.width, this.height) * 0.85;

    // 1. Multiple expanding shockwave wavefronts
    this.shockwaves = [
      { r: 12, maxR: maxR * 1.25, speed: 1850, width: 4.5, color: '255, 255, 255', alpha: 1.0 },
      { r: 5, maxR: maxR * 1.15, speed: 1450, width: 14.0, color: '255, 26, 54', alpha: 0.9 },
      { r: 2, maxR: maxR * 0.95, speed: 980, width: 22.0, color: '235, 0, 40', alpha: 0.7 },
    ];

    // 2. 280+ high-velocity stardust embers & glowing debris spewed outward
    this.stardustParticles = [];
    const particleCount = 280;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 250 + Math.random() * 1350;
      const size = 1.0 + Math.random() * 2.8;
      const isRed = Math.random() < 0.6;
      const colorRgb = isRed
        ? (Math.random() < 0.55 ? '255, 26, 54' : '235, 0, 40')
        : '255, 255, 255';

      this.stardustParticles.push({
        x: this.centerX,
        y: this.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        colorRgb,
        isRed,
        life: 1.0,
        decay: 0.45 + Math.random() * 0.85, // Persists gracefully
      });
    }

    // 3. Billowing nebula plasma puffs
    this.nebulaPuffs = [];
    for (let k = 0; k < 18; k++) {
      const angle = (k / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 120 + Math.random() * 280;
      this.nebulaPuffs.push({
        x: this.centerX,
        y: this.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 35 + Math.random() * 65,
        maxRadius: 180 + Math.random() * 220,
        alpha: 0.45 + Math.random() * 0.35,
        isRed: Math.random() < 0.75,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Diagonal Cosmic Claw Tear Geometry (Slashing across spacetime)
  // ───────────────────────────────────────────────────────────────────
  buildClawTearGeometry() {
    this.tearWidth = Math.min(Math.max(this.width, this.height) * 0.76, 780);
    this.tearHeight = Math.min(this.height * 0.38, 250);

    const halfW = this.tearWidth / 2;
    const segments = 48;

    const topPoints = [];
    const bottomPoints = [];

    const leftTip = { x: -halfW, y: 0 };
    const rightTip = { x: halfW, y: 0 };

    topPoints.push(leftTip);
    bottomPoints.push(leftTip);

    // Multi-octave jagged claw rift generation
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = -halfW + t * this.tearWidth;

      const envelope = Math.sin(t * Math.PI);

      // Deep claw gouges (jagged lightning spikes like Ref 2)
      const clawGougeTop =
        (i % 7 === 0 ? 1.75 : (i % 4 === 0 ? 1.4 : (i % 2 === 0 ? 0.9 : 1.15)));
      const clawGougeBottom =
        (i % 6 === 0 ? 1.7 : (i % 3 === 0 ? 1.35 : (i % 2 === 0 ? 0.85 : 1.2)));

      const jitterTop =
        Math.sin(i * 4.3) * 12 + Math.cos(i * 8.7) * 7.5 + Math.sin(i * 15.1) * 3.5;
      const jitterBottom =
        Math.cos(i * 4.1) * 12 - Math.sin(i * 8.3) * 7.5 - Math.cos(i * 14.7) * 3.5;

      const yTop = -envelope * (this.tearHeight * 0.5) * clawGougeTop + jitterTop;
      const yBottom = envelope * (this.tearHeight * 0.5) * clawGougeBottom + jitterBottom;

      topPoints.push({ x, y: yTop, origY: yTop });
      bottomPoints.push({ x, y: yBottom, origY: yBottom });
    }

    topPoints.push(rightTip);
    bottomPoints.push(rightTip);

    this.clawTopPoints = topPoints;
    this.clawBottomPoints = bottomPoints;
  }

  // ───────────────────────────────────────────────────────────────────
  // Radiant Volumetric Light Rays (God Rays from Reference Image 1)
  // ───────────────────────────────────────────────────────────────────
  initRadiantLightRays() {
    this.radiantLightRays = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      const dirX = Math.abs(Math.cos(angle));
      const lengthBase = 220 + dirX * 420 + Math.random() * 240;
      const beamWidth = 2.5 + Math.random() * 5.5;

      const colorType = Math.random();
      let colorRgb = '235, 0, 40'; // TED Red
      if (colorType < 0.35) {
        colorRgb = '255, 255, 255'; // Intense White
      } else if (colorType < 0.72) {
        colorRgb = '255, 26, 54'; // Neon Crimson
      }

      this.radiantLightRays.push({
        angle,
        length: lengthBase,
        baseLength: lengthBase,
        width: beamWidth,
        colorRgb,
        alpha: 0.25 + Math.random() * 0.55,
        pulseSpeed: 0.0022 + Math.random() * 0.0045,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Fractal Branching Lightning (Lichtenberg Arcs from Ref 2)
  // ───────────────────────────────────────────────────────────────────
  initFractalLightning() {
    this.lightningTrees = [];
    const allPts = [
      ...this.clawTopPoints.map((p) => ({ ...p, isTop: true })),
      ...this.clawBottomPoints.map((p) => ({ ...p, isTop: false })),
    ];

    const peakOrigins = allPts.filter((_, idx) => idx % 4 === 1);

    peakOrigins.forEach((origin) => {
      const tree = this.buildSingleLightningTree(origin);
      this.lightningTrees.push(tree);
    });
  }

  buildSingleLightningTree(origin) {
    const outAngle = Math.atan2(origin.origY, origin.x) + (Math.random() - 0.5) * 0.45;
    const trunkLength = 65 + Math.random() * 135;
    const trunkSteps = 6;

    const trunk = [{ x: origin.x, y: origin.origY }];
    let curX = origin.x;
    let curY = origin.origY;

    for (let s = 1; s <= trunkSteps; s++) {
      const segLen = trunkLength / trunkSteps;
      curX += Math.cos(outAngle) * segLen + (Math.random() - 0.5) * 18;
      curY += Math.sin(outAngle) * segLen + (Math.random() - 0.5) * 18;
      trunk.push({ x: curX, y: curY });
    }

    const branches = [];
    if (trunk.length > 3) {
      const forkIdx1 = 2 + Math.floor(Math.random() * 2);
      branches.push(this.createChildBranch(trunk[forkIdx1], outAngle + 0.55, trunkLength * 0.5));

      if (trunk.length > 5 && Math.random() < 0.75) {
        const forkIdx2 = 4;
        branches.push(this.createChildBranch(trunk[forkIdx2], outAngle - 0.6, trunkLength * 0.4));
      }
    }

    const isWhite = Math.random() < 0.32;
    const isNeon = Math.random() < 0.5;
    const color = isWhite
      ? 'rgba(255, 255, 255, 0.95)'
      : isNeon
      ? 'rgba(255, 26, 54, 0.9)'
      : 'rgba(235, 0, 40, 0.85)';

    return {
      origin,
      trunk,
      branches,
      color,
      isWhite,
      alpha: 0.45 + Math.random() * 0.55,
    };
  }

  createChildBranch(startPt, baseAngle, length) {
    const steps = 4;
    const path = [{ x: startPt.x, y: startPt.y }];
    let cx = startPt.x;
    let cy = startPt.y;

    for (let i = 1; i <= steps; i++) {
      const segLen = length / steps;
      cx += Math.cos(baseAngle) * segLen + (Math.random() - 0.5) * 14;
      cy += Math.sin(baseAngle) * segLen + (Math.random() - 0.5) * 14;
      path.push({ x: cx, y: cy });
    }
    return path;
  }

  jitterLightning() {
    this.lightningTrees.forEach((tree) => {
      for (let i = 1; i < tree.trunk.length; i++) {
        tree.trunk[i].x += (Math.random() - 0.5) * 3.5;
        tree.trunk[i].y += (Math.random() - 0.5) * 3.5;
      }
      tree.branches.forEach((branch) => {
        for (let j = 1; j < branch.length; j++) {
          branch[j].x += (Math.random() - 0.5) * 3.0;
          branch[j].y += (Math.random() - 0.5) * 3.0;
        }
      });
    });
  }

  // ───────────────────────────────────────────────────────────────────
  // Floating Plasma Sparks Around the Rift
  // ───────────────────────────────────────────────────────────────────
  initPlasmaSparks() {
    this.plasmaSparks = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      this.plasmaSparks.push({
        x: (Math.random() - 0.5) * this.tearWidth * 1.15,
        y: (Math.random() - 0.5) * this.tearHeight * 1.5,
        vx: (Math.random() - 0.5) * 32,
        vy: (Math.random() - 0.5) * 32,
        size: 1.0 + Math.random() * 2.4,
        isWhite: Math.random() < 0.35,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
  }

  setAssetsReady() {
    this.isAssetReady = true;
  }

  // ───────────────────────────────────────────────────────────────────
  // Simulation Loop
  // ───────────────────────────────────────────────────────────────────
  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      if (this.isFinished) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this.update(now, dt);
      this.render(now);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  update(now, dt) {
    const elapsedSincePhase = now - this.phaseStartTime;
    // Standardized time scale: 1.0 at 60fps, mathematically continuous at any refresh rate
    const timeScale = dt * 60.0;

    // ─────────────────────────────────────────────────────────────────
    // Phase 1: Beaded Orbital Comets Accretion (~2.4s)
    // ─────────────────────────────────────────────────────────────────
    if (this.phase === 1) {
      this.voidRadius = this.baseVoidRadius;
      this.voidGlowIntensity = 0.55;

      this.orbitDots.forEach((p) => {
        p.angle += p.speed * timeScale;
      });

      if (elapsedSincePhase >= this.minPhase1Duration && this.isAssetReady) {
        this.transitionToPhase(2);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 2: Swirling Spiral Vortex Suction (~2.0s)
    // ─────────────────────────────────────────────────────────────────
    else if (this.phase === 2) {
      this.voidRadius += (this.expandedVoidRadius - this.voidRadius) * (1.0 - Math.exp(-4.0 * dt));
      this.voidGlowIntensity = Math.min(this.voidGlowIntensity + dt * 1.4, 1.4);

      const suctionProgress = Math.min(elapsedSincePhase / 1800, 1.0);
      let allAbsorbed = true;

      this.orbitDots.forEach((p) => {
        if (!p.absorbed) {
          allAbsorbed = false;

          // Accelerate orbital speed smoothly along the vortex spiral
          const vortexAccel = 1.0 + suctionProgress * 3.6 + (75 / (p.r + 25));
          p.angle += p.baseSpeed * vortexAccel * timeScale;

          // Radial inward suction along the spiral
          p.radialSpeed += (260 + suctionProgress * 920) * dt;
          p.r -= p.radialSpeed * dt;

          if (p.r <= this.voidRadius * 0.45) {
            p.absorbed = true;
          }
        }
      });

      if (allAbsorbed || elapsedSincePhase >= 2100) {
        this.transitionToPhase(3);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 3: Critical 3-Second Compression & Red Shift (~3.0s exact)
    // ─────────────────────────────────────────────────────────────────
    else if (this.phase === 3) {
      const progress = Math.min(elapsedSincePhase / this.phase3Duration, 1.0);

      // 1. Black hole shrinks continuously from ~68px to 8px
      const collapseEase = Math.pow(progress, 1.6);
      this.voidRadius = Math.max(
        this.expandedVoidRadius - collapseEase * (this.expandedVoidRadius - 8),
        8
      );

      // 2. Vibrations & movement escalate from subtle micro-tremor to violent shaking
      const shakeAmp = Math.pow(progress, 2.5) * 24;
      this.shakeOffsetX = (Math.random() - 0.5) * shakeAmp;
      this.shakeOffsetY = (Math.random() - 0.5) * shakeAmp;

      // 3. Turns red in the process: from pitch black to boiling molten crimson
      const redRatio = Math.min(Math.pow(progress, 1.35), 1.0);
      const rVal = Math.floor(redRatio * 255);
      const gVal = Math.floor(redRatio * 26 * (1 - redRatio * 0.6));
      const bVal = Math.floor(redRatio * 40 * (1 - redRatio * 0.7));
      this.voidCoreColor = `rgb(${rVal}, ${gVal}, ${bVal})`;

      this.voidGlowIntensity = 0.5 + progress * 1.5;

      if (elapsedSincePhase >= this.phase3Duration) {
        this.transitionToPhase(4);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 4: Supernova Blast & Diagonal Spacetime Claw Rip (~1.9s)
    // ─────────────────────────────────────────────────────────────────
    else if (this.phase === 4) {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;

      // Update multiple shockwaves
      this.shockwaves.forEach((sw) => {
        if (sw.r < sw.maxR) {
          sw.r += sw.speed * dt;
          sw.alpha = Math.max(1.0 - sw.r / sw.maxR, 0);
        }
      });

      // Update stardust embers
      this.stardustParticles.forEach((sp) => {
        if (sp.life > 0) {
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vx *= 0.95;
          sp.vy *= 0.95;
          sp.life -= sp.decay * dt;
        }
      });

      // Update nebula plasma puffs
      this.nebulaPuffs.forEach((puff) => {
        if (puff.alpha > 0) {
          puff.x += puff.vx * dt;
          puff.y += puff.vy * dt;
          puff.radius += (puff.maxRadius - puff.radius) * 0.08;
          puff.alpha = Math.max(puff.alpha - dt * 0.45, 0);
        }
      });

      // Open diagonal tear smoothly (frame-rate independent)
      const smoothFactor = 1.0 - Math.exp(-8.5 * dt);
      this.tearOpenProgress += (1.0 - this.tearOpenProgress) * smoothFactor;
      this.tearScale += (1.0 - this.tearScale) * smoothFactor;

      // Crackle dynamic lightning every 50ms
      if (now - this.lastLightningJitterTime > 50) {
        this.jitterLightning();
        this.lastLightningJitterTime = now;
      }

      // Update floating plasma sparks
      this.plasmaSparks.forEach((spk) => {
        spk.x += spk.vx * dt;
        spk.y += spk.vy * dt;
      });

      if (elapsedSincePhase >= 1900 && this.tearOpenProgress >= 0.92) {
        this.transitionToPhase(5);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Phase 5: Dimensional Portal Dive (~1.1s)
    // ─────────────────────────────────────────────────────────────────
    else if (this.phase === 5) {
      const t = Math.min(elapsedSincePhase / 850, 1.0);
      const easeZoom = t === 0 ? 0 : Math.pow(2.8, 10 * (t - 1));
      this.zoomScale = 1.0 + easeZoom * 44.0;

      if (now - this.lastLightningJitterTime > 50) {
        this.jitterLightning();
        this.lastLightningJitterTime = now;
      }

      if (t >= 0.96) {
        this.completeAndReveal();
      }
    }
  }

  transitionToPhase(nextPhase) {
    this.phase = nextPhase;
    this.phaseStartTime = performance.now();

    if (nextPhase === 2) {
      // Suction vortex starts
    } else if (nextPhase === 3) {
      this.orbitDots = [];
    } else if (nextPhase === 4) {
      this.tearScale = 0.08;
      this.tearOpenProgress = 0.05;
      this.initDetonationEffects();
    } else if (nextPhase === 5) {
      this.revealMainUI();
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Canvas Rendering
  // ───────────────────────────────────────────────────────────────────
  render(now = performance.now()) {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;

    ctx.save();

    // In Phase 3, apply violent escalating camera shudder
    if (this.phase === 3 && (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0)) {
      ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
    }

    // 1. Deep Obsidian-Charcoal Canvas (Slight contrast so black hole pops)
    ctx.globalCompositeOperation = 'source-over';
    const bgGrad = ctx.createRadialGradient(
      cx,
      cy,
      20,
      cx,
      cy,
      Math.max(this.width, this.height) * 0.72
    );
    bgGrad.addColorStop(0, '#0c0d14');
    bgGrad.addColorStop(0.45, '#07080c');
    bgGrad.addColorStop(1, '#040407');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Phases 1 & 2: Beaded Comets & Tight Backlight Rim Glow
    if (this.phase === 1 || this.phase === 2) {
      // ── A. Tight Backlight Glow (Hero section style - sharp, hugging rim) ──
      const glowRadius = this.voidRadius + 22;
      const rimGrad = ctx.createRadialGradient(cx, cy, this.voidRadius * 0.92, cx, cy, glowRadius);
      rimGrad.addColorStop(0, `rgba(255, 26, 54, ${this.voidGlowIntensity})`);
      rimGrad.addColorStop(0.35, `rgba(235, 0, 40, ${this.voidGlowIntensity * 0.65})`);
      rimGrad.addColorStop(0.7, `rgba(235, 0, 40, ${this.voidGlowIntensity * 0.18})`);
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // ── B. Clean Comets with Translucent Tail (~3 Dots Long) ──
      this.orbitDots.forEach((p) => {
        if (p.absorbed) return;

        // Analytical sub-pixel continuous positions: zero stepping, zero frame lag
        const stepAngle = (0.022 + 1.1 / p.r) * Math.sign(p.speed);
        const p0x = cx + Math.cos(p.angle) * p.r;
        const p0y = cy + Math.sin(p.angle) * p.r;

        const a1 = p.angle - stepAngle;
        const r1 = this.phase === 2 ? p.r + p.radialSpeed * 0.015 : p.r;
        const p1x = cx + Math.cos(a1) * r1;
        const p1y = cy + Math.sin(a1) * r1;

        const a2 = p.angle - stepAngle * 2.0;
        const r2 = this.phase === 2 ? p.r + p.radialSpeed * 0.030 : p.r;
        const p2x = cx + Math.cos(a2) * r2;
        const p2y = cy + Math.sin(a2) * r2;

        const a3 = p.angle - stepAngle * 3.0;
        const r3 = this.phase === 2 ? p.r + p.radialSpeed * 0.045 : p.r;
        const p3x = cx + Math.cos(a3) * r3;
        const p3y = cy + Math.sin(a3) * r3;

        // 1. Soft Translucent Tapered Tail Connector Line (~3 dots long)
        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineWidth = Math.max(p.headSize * 0.65, 0.8);
        ctx.strokeStyle = `rgba(${p.colorRgb}, ${p.alpha * 0.22})`;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. Trailing Translucent Dots (3 dots smoothly decaying behind head)
        ctx.beginPath();
        ctx.arc(p1x, p1y, Math.max(p.headSize * 0.72, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${p.alpha * 0.48})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p2x, p2y, Math.max(p.headSize * 0.50, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${p.alpha * 0.28})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p3x, p3y, Math.max(p.headSize * 0.34, 0.7), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${p.alpha * 0.14})`;
        ctx.fill();

        // 3. Head Dot (crisp, bold, luminous with zero-lag radial halo)
        // Outer halo
        ctx.beginPath();
        ctx.arc(p0x, p0y, p.headSize * 1.65, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed ? 'rgba(235, 0, 40, 0.22)' : 'rgba(255, 255, 255, 0.22)';
        ctx.fill();

        // Solid head nucleus
        ctx.beginPath();
        ctx.arc(p0x, p0y, p.headSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${p.alpha})`;
        ctx.fill();

        // Crisp center point
        ctx.beginPath();
        ctx.arc(p0x, p0y, p.headSize * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });

      // ── C. The Absolute Pitch-Black Void Center ──
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Sharp backlight spill border
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2.0;
      ctx.strokeStyle =
        this.phase === 2
          ? `rgba(255, 26, 54, ${Math.min(this.voidGlowIntensity, 1.0)})`
          : 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = this.phase === 2 ? 18 : 10;
      ctx.shadowColor = '#FF1A36';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Phase 3: Critical 3-Second Compression & Red Shift
    else if (this.phase === 3) {
      // Tight, focused backlight aura intensifying
      const glowR = this.voidRadius + 24;
      const orbGrad = ctx.createRadialGradient(cx, cy, this.voidRadius * 0.7, cx, cy, glowR);
      orbGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      orbGrad.addColorStop(0.3, 'rgba(255, 26, 54, 0.85)');
      orbGrad.addColorStop(0.7, 'rgba(235, 0, 40, 0.4)');
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Supercritical core turning red
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.voidCoreColor;
      ctx.fill();

      // White-hot vibrating edge
      ctx.beginPath();
      ctx.arc(cx, cy, this.voidRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#FF1A36';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. Phases 4 & 5: Detonation & DIAGONAL Spacetime Claw Rip
    else if (this.phase === 4 || this.phase === 5) {
      // ── Step A: Expanding Supernova Shockwaves ──
      this.shockwaves.forEach((sw) => {
        if (sw.alpha > 0.02) {
          ctx.beginPath();
          ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
          ctx.lineWidth = sw.width;
          ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha * 0.85})`;
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#EB0028';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // ── Step B: Billowing Nebula Plasma Puffs ──
      this.nebulaPuffs.forEach((puff) => {
        if (puff.alpha > 0.02) {
          const pGrad = ctx.createRadialGradient(
            puff.x,
            puff.y,
            puff.radius * 0.2,
            puff.x,
            puff.y,
            puff.radius
          );
          pGrad.addColorStop(
            0,
            puff.isRed ? `rgba(255, 26, 54, ${puff.alpha * 0.5})` : `rgba(235, 0, 40, ${puff.alpha * 0.4})`
          );
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── Step C: Spewed Stardust Embers & Shards ──
      this.stardustParticles.forEach((sp) => {
        if (sp.life <= 0) return;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sp.colorRgb}, ${sp.life})`;
        ctx.shadowBlur = sp.isRed ? 8 : 4;
        ctx.shadowColor = sp.isRed ? '#FF1A36' : '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Step D: Center DIAGONAL Space Rift & Radiant Rays ──
      ctx.save();
      ctx.translate(cx, cy);
      // ROTATE DIAGONALLY: Slashing across spacetime
      ctx.rotate(this.tearAngle);

      const curScale = this.phase === 5 ? this.zoomScale : this.tearScale;
      ctx.scale(curScale, curScale);

      const openY = this.tearOpenProgress;

      // Volumetric Radiant Light Rays / God Rays (Reference Image 1)
      this.radiantLightRays.forEach((ray) => {
        const pulse = Math.sin(now * ray.pulseSpeed + ray.pulsePhase) * 0.25 + 0.75;
        const rayLen = ray.length * openY * pulse;
        const cosA = Math.cos(ray.angle);
        const sinA = Math.sin(ray.angle);

        const rayGrad = ctx.createLinearGradient(0, 0, cosA * rayLen, sinA * rayLen);
        rayGrad.addColorStop(0, `rgba(${ray.colorRgb}, ${ray.alpha * 0.85})`);
        rayGrad.addColorStop(0.35, `rgba(${ray.colorRgb}, ${ray.alpha * 0.45})`);
        rayGrad.addColorStop(1, `rgba(${ray.colorRgb}, 0)`);

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

      // Deep TED Red Nebula Plasma Flare
      const nebulaGrad = ctx.createRadialGradient(
        0,
        0,
        this.tearHeight * 0.2,
        0,
        0,
        this.tearWidth * 0.55
      );
      nebulaGrad.addColorStop(0, 'rgba(235, 0, 40, 0.45)');
      nebulaGrad.addColorStop(0.4, 'rgba(255, 26, 54, 0.22)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.tearWidth * 0.55, this.tearHeight * 0.9 * openY, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Step E: THE DIAGONAL CUTOUT HOLE (destination-out) ──
      // Reveals the live hero WebGL canvas inside the diagonal tear!
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();

      if (this.clawTopPoints.length > 0) {
        ctx.moveTo(this.clawTopPoints[0].x, this.clawTopPoints[0].y * openY);
        for (let i = 1; i < this.clawTopPoints.length; i++) {
          ctx.lineTo(this.clawTopPoints[i].x, this.clawTopPoints[i].y * openY);
        }
        for (let i = this.clawBottomPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(this.clawBottomPoints[i].x, this.clawBottomPoints[i].y * openY);
        }
      }
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();

      // ── Step F: TEAR RIM ENERGY BORDERS (TEDx Red & White Hot Core) ──
      ctx.globalCompositeOperation = 'source-over';

      // 1. Broad TED Red Fiery Plasma Corona
      ctx.beginPath();
      this.traceTearBorder(ctx, openY);
      ctx.lineWidth = 16;
      ctx.strokeStyle = 'rgba(235, 0, 40, 0.5)';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#EB0028';
      ctx.stroke();

      // 2. Searing Neon Crimson Electric Border
      ctx.beginPath();
      this.traceTearBorder(ctx, openY);
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = 'rgba(255, 26, 54, 0.95)';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FF1A36';
      ctx.stroke();

      // 3. Razor-Sharp Electric White Lightning Inner Lip (Matching Ref 2)
      ctx.beginPath();
      this.traceTearBorder(ctx, openY);
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFFFFF';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Step G: Fractal Branching Lightning Tendrils (Matching Ref 2) ──
      this.lightningTrees.forEach((tree) => {
        const yOffset = tree.origin.origY * (openY - 1);

        ctx.beginPath();
        ctx.moveTo(tree.trunk[0].x, tree.trunk[0].y + yOffset);
        for (let k = 1; k < tree.trunk.length; k++) {
          ctx.lineTo(tree.trunk[k].x, tree.trunk[k].y + yOffset);
        }
        ctx.lineWidth = tree.isWhite ? 2.2 : 1.5;
        ctx.strokeStyle = tree.color;
        ctx.shadowBlur = tree.isWhite ? 8 : 12;
        ctx.shadowColor = tree.isWhite ? '#FFFFFF' : '#FF1A36';
        ctx.stroke();

        tree.branches.forEach((branch) => {
          ctx.beginPath();
          ctx.moveTo(branch[0].x, branch[0].y + yOffset);
          for (let m = 1; m < branch.length; m++) {
            ctx.lineTo(branch[m].x, branch[m].y + yOffset);
          }
          ctx.lineWidth = 1.1;
          ctx.strokeStyle = tree.isWhite
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(255, 26, 54, 0.85)';
          ctx.stroke();
        });

        ctx.shadowBlur = 0;
      });

      // ── Step H: Floating Energetic Plasma Sparks ──
      this.plasmaSparks.forEach((spk) => {
        ctx.beginPath();
        ctx.arc(spk.x, spk.y * openY, spk.size, 0, Math.PI * 2);
        ctx.fillStyle = spk.isWhite
          ? `rgba(255, 255, 255, ${spk.alpha})`
          : `rgba(255, 26, 54, ${spk.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = spk.isWhite ? '#FFFFFF' : '#EB0028';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();
    }

    ctx.restore();
  }

  traceTearBorder(ctx, openY) {
    if (this.clawTopPoints.length === 0) return;
    ctx.moveTo(this.clawTopPoints[0].x, this.clawTopPoints[0].y * openY);
    for (let i = 1; i < this.clawTopPoints.length; i++) {
      ctx.lineTo(this.clawTopPoints[i].x, this.clawTopPoints[i].y * openY);
    }
    for (let i = this.clawBottomPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(this.clawBottomPoints[i].x, this.clawBottomPoints[i].y * openY);
    }
    ctx.closePath();
  }

  revealMainUI() {
    if (!this.appContainer) return;
    this.appContainer.classList.remove('is-preparing');
    this.appContainer.classList.add('is-revealed');

    if (typeof this.onRevealed === 'function') {
      this.onRevealed();
    }
  }

  triggerInstantReveal() {
    if (this.isFinished) return;
    this.revealMainUI();
    this.destroy();
  }

  completeAndReveal() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.revealMainUI();

    setTimeout(() => {
      this.destroy();
    }, 150);
  }

  destroy() {
    this.isFinished = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.loader) {
      this.loader.classList.remove('is-shaking');
      this.loader.classList.add('is-hidden');
      this.loader.style.display = 'none';
    }
  }

  resetAndPlay() {
    this.isFinished = false;
    this.phase = 1;
    this.phaseStartTime = performance.now();
    this.startTime = performance.now();
    this.tearScale = 0.0;
    this.tearOpenProgress = 0.0;
    this.zoomScale = 1.0;
    this.voidRadius = this.baseVoidRadius;
    this.voidGlowIntensity = 0.55;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.voidCoreColor = '#000000';
    this.shockwaves = [];
    this.stardustParticles = [];
    this.nebulaPuffs = [];

    if (this.loader) {
      this.loader.classList.remove('is-hidden');
      this.loader.classList.remove('is-shaking');
      this.loader.style.display = 'block';
    }

    if (this.appContainer) {
      this.appContainer.classList.remove('is-revealed');
      this.appContainer.classList.add('is-preparing');
    }

    this.initBeadedComets();
    this.buildClawTearGeometry();
    this.initRadiantLightRays();
    this.initFractalLightning();
    this.initPlasmaSparks();

    if (!this.animId) {
      this.startLoop();
    }
  }

  jumpToPhase(phaseNum) {
    this.phase = phaseNum;
    this.phaseStartTime = performance.now();
    if (phaseNum === 4) {
      this.tearScale = 1.0;
      this.tearOpenProgress = 1.0;
    }
  }

  replay() {
    this.resetAndPlay();
  }
}
