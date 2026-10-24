/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeNodes: { [key: string]: AudioNode[] } = {};
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public setMasterVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  // --- 1. Pure Tone / Instrument Tone with Harmonics ---
  public playTuningFork(freq1: number, freq2?: number, duration: number = 2.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + duration);

    if (freq2 !== undefined && freq2 > 0) {
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq2, now);
      osc2.connect(gainNode);
      osc2.start(now);
      osc2.stop(now + duration);
    }

    gainNode.connect(this.masterGain);
  }

  // String instrument simulation (pluck with rich overtones)
  public playStringInstrument(fundamentalFreq: number, harmonicsWeights: number[] = [1, 0.5, 0.25, 0.12, 0.06], duration: number = 2.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const masterStringGain = this.ctx.createGain();
    masterStringGain.gain.setValueAtTime(0.4, now);
    masterStringGain.connect(this.masterGain);

    harmonicsWeights.forEach((weight, index) => {
      if (weight <= 0) return;
      const harmonicNumber = index + 1;
      const freq = fundamentalFreq * harmonicNumber;
      if (freq > 18000) return;

      const osc = this.ctx!.createOscillator();
      const hGain = this.ctx!.createGain();

      // String harmonics have slightly different decay: higher harmonics decay faster
      const decayTime = Math.max(0.3, duration / (1 + index * 0.45));

      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      hGain.gain.setValueAtTime(0, now);
      hGain.gain.linearRampToValueAtTime(weight * 0.35, now + 0.015);
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

      osc.connect(hGain);
      hGain.connect(masterStringGain);

      osc.start(now);
      osc.stop(now + decayTime);
    });
  }

  // Wind instrument (organ pipe / flute) with open/closed pipe characteristics
  public playWindPipe(fundamentalFreq: number, isOpenPipe: boolean = true, duration: number = 2.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const pipeGain = this.ctx.createGain();
    pipeGain.gain.setValueAtTime(0, now);
    pipeGain.gain.linearRampToValueAtTime(0.4, now + 0.1); // softer attack
    pipeGain.gain.setValueAtTime(0.4, now + duration - 0.2);
    pipeGain.gain.linearRampToValueAtTime(0.0001, now + duration);
    pipeGain.connect(this.masterGain);

    // Open pipe has all integer harmonics (1, 2, 3, 4, 5...)
    // Closed pipe at one end has only odd harmonics (1, 3, 5, 7...)
    const harmonics = isOpenPipe ? [1, 2, 3, 4, 5] : [1, 3, 5, 7];

    harmonics.forEach((h, idx) => {
      const freq = fundamentalFreq * h;
      if (freq > 18000) return;

      const osc = this.ctx!.createOscillator();
      const hGain = this.ctx!.createGain();
      const weight = 1 / Math.pow(h, 1.2);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      hGain.gain.setValueAtTime(weight * 0.25, now);
      osc.connect(hGain);
      hGain.connect(pipeGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Continuous sound generator with real-time parameter tweaking (for Lab sliders)
  public startHarmonicLab(fundamentalFreq: number, weights: number[], waveType: OscillatorType = 'sine') {
    this.stopHarmonicLab();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const labGain = this.ctx.createGain();
    labGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    labGain.connect(this.masterGain);

    const nodes: AudioNode[] = [labGain];

    weights.forEach((w, idx) => {
      const hNumber = idx + 1;
      const freq = fundamentalFreq * hNumber;
      if (freq > 19000 || w <= 0.01) return;

      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      g.gain.setValueAtTime(w * 0.2, this.ctx!.currentTime);

      osc.connect(g);
      g.connect(labGain);
      osc.start();

      nodes.push(osc, g);
    });

    this.activeNodes['harmonic_lab'] = nodes;
  }

  public stopHarmonicLab() {
    if (this.activeNodes['harmonic_lab']) {
      this.activeNodes['harmonic_lab'].forEach(node => {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          try {
            (node as AudioScheduledSourceNode).stop();
          } catch {
            // ignore if already stopped
          }
        }
        node.disconnect();
      });
      delete this.activeNodes['harmonic_lab'];
    }
  }

  // --- 2. Ambient Sound Environment Synthesis (for Psychoacoustics & Attention Experiment) ---
  public stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }

  public playAmbient(type: 'silence' | 'pink_noise' | 'speech' | 'ambient', volumeMultiplier: number = 1.0) {
    this.stopAmbient();
    if (type === 'silence') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const sampleRate = this.ctx.sampleRate;
    const duration = 5.0; // 5 second loop buffer
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    if (type === 'pink_noise') {
      // Pink Noise synthesis (1/f spectrum) using Paul Kellet's algorithm
      let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.05;
        b6L = whiteL * 0.115926;

        const whiteR = Math.random() * 2 - 1;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.05;
        b6R = whiteR * 0.115926;
      }
    } else if (type === 'speech') {
      // Simulating classroom babble / irrelevant speech multi-talker effect
      // Complex multi-layered voice formant modulations (vocal tract resonance peaks at ~300Hz, 800Hz, 2400Hz with syllable rhythms 3-5 Hz)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        // Syllabic modulation envelopes
        const mod1 = Math.sin(2 * Math.PI * 3.5 * t) * 0.5 + 0.5;
        const mod2 = Math.sin(2 * Math.PI * 4.2 * t + 1.2) * 0.5 + 0.5;
        const mod3 = Math.cos(2 * Math.PI * 2.8 * t + 2.5) * 0.5 + 0.5;

        // Formant carrier frequencies
        const carrier1 = Math.sin(2 * Math.PI * 220 * t) * 0.25 + Math.sin(2 * Math.PI * 440 * t) * 0.2 + Math.sin(2 * Math.PI * 880 * t) * 0.15;
        const carrier2 = Math.sin(2 * Math.PI * 180 * t) * 0.25 + Math.sin(2 * Math.PI * 360 * t) * 0.2 + Math.sin(2 * Math.PI * 720 * t) * 0.15;
        const whisper = (Math.random() * 2 - 1) * 0.08;

        const valL = (carrier1 * mod1 + carrier2 * mod2 + whisper) * 0.3;
        const valR = (carrier1 * mod2 + carrier2 * mod3 + whisper) * 0.3;

        left[i] = Math.max(-0.9, Math.min(0.9, valL));
        right[i] = Math.max(-0.9, Math.min(0.9, valR));
      }
    } else if (type === 'ambient') {
      // Soft lo-fi instrumental chords (Fmaj7 - Dm9 - Am7 - C) synthesized mathematically
      const chordNotes = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [146.83, 220.00, 261.63, 329.63], // Dm9
        [110.00, 220.00, 261.63, 329.63], // Am7
        [130.81, 196.00, 261.63, 329.63], // C
      ];

      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor((t / duration) * 4) % 4;
        const notes = chordNotes[chordIdx];
        let sample = 0;
        notes.forEach((freq, nIdx) => {
          sample += Math.sin(2 * Math.PI * freq * t) * (0.12 / (nIdx + 1));
        });
        // Soft tape saturation curve
        const softSample = Math.tanh(sample * 1.5) * 0.25;
        left[i] = softSample;
        right[i] = softSample;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35 * volumeMultiplier, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.ambientSource = source;
    this.ambientGain = gain;
  }
}

export const soundEngine = new SoundEngine();
