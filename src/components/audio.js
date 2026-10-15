// =====================================================================
//  TEDx Hero - Ambient Sound Synthesizer
//  Generates a subtle, cinematic low-frequency ambient texture
//  with gentle resonant drift using the Web Audio API.
// =====================================================================

export class AmbientAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Warm low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.masterGain.connect(filter);
    filter.connect(this.ctx.destination);

    // Ambient Drone chord (F-C-Eb deep cinematic harmonic)
    const freqs = [55.0, 82.41, 110.0, 155.56];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      // Subtle detune for analog warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 12, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.08 / (i + 1), this.ctx.currentTime);

      // LFO for slow breathing movement
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08 + i * 0.04, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();

      this.oscillators.push(osc);
    });
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.4);
      this.isPlaying = false;
    } else {
      this.masterGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.6);
      this.isPlaying = true;
    }

    return this.isPlaying;
  }
}
