// Audio Engine for Punjabi Truck Simulator
// Plays user-provided Tamil Nadu Bus / Truck Horn MP3 (/truck-horn.mp3) and handles Dhaba tape filter.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.dhabaMode = false;
    this.tapeFilter = null;
    this.hornAudio = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupTapeFilter();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.hornAudio) {
      this.hornAudio = new Audio('/truck-horn.mp3');
      this.hornAudio.preload = 'auto';
      this.hornAudio.volume = 1.0;
    }
  }

  setupTapeFilter() {
    if (!this.ctx) return;
    this.tapeFilter = this.ctx.createBiquadFilter();
    this.tapeFilter.type = 'lowpass';
    this.tapeFilter.frequency.value = 20000;
    this.tapeFilter.Q.value = 1.0;
  }

  toggleDhabaMode() {
    this.init();
    this.dhabaMode = !this.dhabaMode;
    if (this.tapeFilter && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.dhabaMode) {
        this.tapeFilter.frequency.setTargetAtTime(3000, now, 0.2);
      } else {
        this.tapeFilter.frequency.setTargetAtTime(20000, now, 0.2);
      }
    }
    return this.dhabaMode;
  }

  playPressureHorn() {
    this.init();
    if (this.hornAudio) {
      try {
        this.hornAudio.currentTime = 0;
        const playPromise = this.hornAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn('Horn audio playback error:', e));
        }
      } catch (e) {
        console.warn('Error playing horn audio:', e);
      }
    }
  }

  playRadioStatic() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.18;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  playClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const audioEngine = new AudioEngine();
