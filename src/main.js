// =====================================================================
//  TEDx Hero Page - Main Application Orchestrator
// =====================================================================

import { HeroShader } from './shader/HeroShader.js';
import { SPEAKERS, DEFAULT_SPEAKER_ID } from './config/speakers.js';
import { AmbientAudio } from './components/audio.js';
import { AnomalyIntro } from './components/AnomalyIntro.js';

class TedxApp {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    this.shader = null;
    this.audio = new AmbientAudio();
    this.currentSpeakerId = DEFAULT_SPEAKER_ID;

    // Master Startup / Intro Animation (Theme: ANOMALY)
    this.intro = new AnomalyIntro({
      onComplete: () => {
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn && !this.audio.isPlaying) {
          soundBtn.classList.add('pulse-invite');
          setTimeout(() => soundBtn.classList.remove('pulse-invite'), 4500);
        }
      },
    });

    // Alias for compatibility
    this.loader = this.intro;

    window.app = this;

    this.init();
  }

  async init() {
    try {
      // 1. Initialize WebGL2 shader engine
      this.shader = new HeroShader(this.canvas);

      // 2. Build character switcher buttons
      this.buildSpeakerSelector();

      // 3. Load default speaker
      const defaultSpeaker = SPEAKERS.find((s) => s.id === DEFAULT_SPEAKER_ID) || SPEAKERS[0];
      await this.activateSpeaker(defaultSpeaker);

      // 4. Setup UI listeners
      this.setupSoundToggle();
      this.setupTweakDrawer();
      this.setupUploadModal();

      console.log('TEDx Hero Shader Engine initialized successfully.');
    } catch (err) {
      console.error('Initialization error in TedxApp:', err);
    }
  }

  buildSpeakerSelector() {
    const container = document.getElementById('speaker-btn-container');
    if (!container) return;
    container.innerHTML = '';

    SPEAKERS.forEach((spk, idx) => {
      const btn = document.createElement('button');
      btn.className = `character-btn ${spk.id === this.currentSpeakerId ? 'is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', spk.id === this.currentSpeakerId ? 'true' : 'false');
      btn.innerHTML = `<span style="color:var(--color-ted-red); font-size:0.65rem;">0${idx + 1}</span> <span>${spk.name}</span>`;

      btn.addEventListener('click', () => {
        this.activateSpeaker(spk);
      });

      container.appendChild(btn);
    });
  }

  async activateSpeaker(spk) {
    this.currentSpeakerId = spk.id;

    // Update switcher buttons active state
    const btns = document.querySelectorAll('.character-btn');
    btns.forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });

    const activeBtn = Array.from(btns).find((b) => b.textContent.includes(spk.name));
    if (activeBtn) {
      activeBtn.classList.add('is-active');
      activeBtn.setAttribute('aria-selected', 'true');
    }

    // Update HUD information card
    const hudName = document.getElementById('hud-name');
    const hudTalk = document.getElementById('hud-talk');
    const hudSession = document.getElementById('hud-session');
    const hudTime = document.getElementById('hud-time');
    const hudRole = document.getElementById('hud-role');

    if (hudName) hudName.textContent = spk.name;
    if (hudTalk) hudTalk.textContent = `"${spk.talkTitle}"`;
    if (hudSession) hudSession.textContent = spk.session || 'Featured Talk';
    if (hudTime) hudTime.textContent = spk.time || 'Keynote';
    if (hudRole) hudRole.textContent = spk.role || '';

    // Update Tweak Sliders to match speaker's tuned parameters
    this.updateTweakUI(spk);

    // Call HeroShader to load new portrait & depth textures
    await this.shader.setCharacter({
      portraitUrl: spk.portraitUrl,
      depthUrl: spk.depthUrl,
      scale: spk.scale || 1.05,
      offsetY: typeof spk.offsetY === 'number' ? spk.offsetY : 0.0,
      fbmIntensity: typeof spk.fbmIntensity === 'number' ? spk.fbmIntensity : 1.0,
      hoverShift: spk.hoverShift ?? 0.12,
      tiltAmount: spk.tiltAmount ?? 0.20,
      parallaxStrength: spk.parallaxStrength ?? 0.16,
      fbmMouseFollow: spk.fbmMouseFollow ?? 0.22,
      backglowIntensity: spk.backglowIntensity ?? 1.15,
      backglowRadius: spk.backglowRadius ?? 1.0,
      glowCenterX: spk.glowCenterX ?? 0.50,
      glowCenterY: spk.glowCenterY ?? 0.65,
    });
  }

  updateTweakUI(config) {
    const sIntensity = document.getElementById('slider-intensity');
    const sScale = document.getElementById('slider-scale');
    const sOffsetY = document.getElementById('slider-offsetY');
    const sDither = document.getElementById('slider-dither');
    const sHoverShift = document.getElementById('slider-hover-shift');
    const sTilt = document.getElementById('slider-tilt');
    const sFlameFollow = document.getElementById('slider-flame-follow');
    const sBackglow = document.getElementById('slider-backglow');

    if (sIntensity) {
      sIntensity.value = config.fbmIntensity ?? 1.0;
      document.getElementById('val-intensity').textContent = parseFloat(sIntensity.value).toFixed(2);
    }
    if (sScale) {
      sScale.value = config.scale ?? 1.05;
      document.getElementById('val-scale').textContent = parseFloat(sScale.value).toFixed(2);
    }
    if (sOffsetY) {
      sOffsetY.value = config.offsetY ?? 0.0;
      document.getElementById('val-offsetY').textContent = parseFloat(sOffsetY.value).toFixed(2);
    }
    if (sDither) {
      sDither.value = config.ditherAmount ?? 0.85;
      document.getElementById('val-dither').textContent = parseFloat(sDither.value).toFixed(2);
    }
    if (sHoverShift) {
      sHoverShift.value = config.hoverShift ?? 0.12;
      document.getElementById('val-hover-shift').textContent = parseFloat(sHoverShift.value).toFixed(2);
    }
    if (sTilt) {
      sTilt.value = config.tiltAmount ?? 0.20;
      document.getElementById('val-tilt').textContent = parseFloat(sTilt.value).toFixed(2);
    }
    if (sFlameFollow) {
      sFlameFollow.value = config.fbmMouseFollow ?? 0.22;
      document.getElementById('val-flame-follow').textContent = parseFloat(sFlameFollow.value).toFixed(2);
    }
    if (sBackglow) {
      sBackglow.value = config.backglowIntensity ?? 1.15;
      document.getElementById('val-backglow').textContent = parseFloat(sBackglow.value).toFixed(2);
    }
  }

  setupSoundToggle() {
    const btn = document.getElementById('btn-sound-toggle');
    const label = document.getElementById('sound-label');
    if (!btn || !label) return;

    btn.addEventListener('click', () => {
      const isPlaying = this.audio.toggle();
      if (isPlaying) {
        btn.classList.add('is-playing');
        label.textContent = 'Audio [ON]';
      } else {
        btn.classList.remove('is-playing');
        label.textContent = 'Audio [OFF]';
      }
    });
  }

  setupTweakDrawer() {
    const btnTweak = document.getElementById('btn-tweak');
    const drawer = document.getElementById('tweak-drawer');
    const btnReset = document.getElementById('btn-reset-tweaks');

    if (!btnTweak || !drawer) return;

    btnTweak.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      btnTweak.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !btnTweak.contains(e.target)) {
        drawer.classList.remove('is-open');
        btnTweak.setAttribute('aria-expanded', 'false');
      }
    });

    // Slider bindings
    const bindSlider = (id, valId, updateFn) => {
      const slider = document.getElementById(id);
      const valDisplay = document.getElementById(valId);
      if (!slider || !valDisplay) return;

      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        valDisplay.textContent = val.toFixed(2);
        updateFn(val);
      });
    };

    bindSlider('slider-hover-shift', 'val-hover-shift', (v) => {
      this.shader.config.hoverShift = v;
    });

    bindSlider('slider-tilt', 'val-tilt', (v) => {
      this.shader.config.tiltAmount = v;
    });

    bindSlider('slider-flame-follow', 'val-flame-follow', (v) => {
      this.shader.config.fbmMouseFollow = v;
    });

    bindSlider('slider-intensity', 'val-intensity', (v) => {
      this.shader.config.fbmIntensity = v;
    });

    bindSlider('slider-scale', 'val-scale', (v) => {
      this.shader.config.scale = v;
    });

    bindSlider('slider-offsetY', 'val-offsetY', (v) => {
      this.shader.config.offsetY = v;
    });

    bindSlider('slider-dither', 'val-dither', (v) => {
      this.shader.config.ditherAmount = v;
    });

    bindSlider('slider-backglow', 'val-backglow', (v) => {
      this.shader.config.backglowIntensity = v;
    });

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const spk = SPEAKERS.find((s) => s.id === this.currentSpeakerId) || SPEAKERS[0];
        this.updateTweakUI(spk);
        this.shader.config.fbmIntensity = spk.fbmIntensity || 1.0;
        this.shader.config.scale = spk.scale || 1.05;
        this.shader.config.offsetY = spk.offsetY || 0.0;
        this.shader.config.ditherAmount = 0.85;
        this.shader.config.hoverShift = spk.hoverShift ?? 0.12;
        this.shader.config.tiltAmount = spk.tiltAmount ?? 0.20;
        this.shader.config.fbmMouseFollow = spk.fbmMouseFollow ?? 0.22;
        this.shader.config.parallaxStrength = spk.parallaxStrength ?? 0.16;
        this.shader.config.backglowIntensity = spk.backglowIntensity ?? 1.15;
        this.shader.config.backglowRadius = spk.backglowRadius ?? 1.0;
      });
    }

    const btnReplay = document.getElementById('btn-replay-intro');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        this.loader.replay();
      });
    }
  }

  setupUploadModal() {
    const btnOpen = document.getElementById('btn-open-upload');
    const modal = document.getElementById('upload-modal');
    const btnClose = document.getElementById('btn-close-modal');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const btnBrowse = document.getElementById('btn-browse-file');

    if (!btnOpen || !modal || !btnClose || !dropZone || !fileInput) return;

    btnOpen.addEventListener('click', () => {
      modal.classList.add('is-active');
    });

    btnClose.addEventListener('click', () => {
      modal.classList.remove('is-active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('is-active');
    });

    if (btnBrowse) {
      btnBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFileUpload(e.dataTransfer.files[0], modal);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFileUpload(e.target.files[0], modal);
      }
    });
  }

  handleFileUpload(file, modal) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Activate custom uploaded character!
        const customSpeaker = {
          id: 'custom-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          role: 'Custom Speaker / Character',
          talkTitle: 'Live Upload Demonstration',
          session: 'Session // Special Guest',
          time: 'Live',
          scale: 1.25,
          offsetY: 0.0,
          fbmIntensity: 1.0,
        };

        this.currentSpeakerId = customSpeaker.id;

        // Deselect standard tabs
        document.querySelectorAll('.character-btn').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });

        // Update HUD
        const hudName = document.getElementById('hud-name');
        const hudTalk = document.getElementById('hud-talk');
        const hudSession = document.getElementById('hud-session');
        const hudTime = document.getElementById('hud-time');
        const hudRole = document.getElementById('hud-role');

        if (hudName) hudName.textContent = customSpeaker.name;
        if (hudTalk) hudTalk.textContent = `"${customSpeaker.talkTitle}"`;
        if (hudSession) hudSession.textContent = customSpeaker.session;
        if (hudTime) hudTime.textContent = customSpeaker.time;
        if (hudRole) hudRole.textContent = customSpeaker.role;

        // Set character using uploaded image element (HeroShader will auto-generate depth map!)
        await this.shader.setCharacter({
          imageElement: img,
          scale: 1.25,
          offsetY: 0.0,
          fbmIntensity: 1.0,
        });

        modal.classList.remove('is-active');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new TedxApp();
});
