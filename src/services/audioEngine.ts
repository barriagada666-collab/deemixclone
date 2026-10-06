import { Track } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private oscillators: OscillatorNode[] = [];
  private synthInterval: any = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  // 10 frequency bands for standard graphic equalizer
  public static readonly EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  public eqGains: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // in dB (-12 to +12)

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;

      // Build EQ Chain
      let lastNode: AudioNode = this.gainNode;
      this.eqFilters = AudioEngine.EQ_FREQUENCIES.map((freq, idx) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = idx === 0 ? 'lowshelf' : idx === AudioEngine.EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = this.eqGains[idx] || 0;
        lastNode.connect(filter);
        lastNode = filter;
        return filter;
      });

      lastNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public setEqBand(bandIndex: number, gainDb: number) {
    this.eqGains[bandIndex] = gainDb;
    if (this.eqFilters[bandIndex] && this.ctx) {
      this.eqFilters[bandIndex].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public setEqPreset(gains: number[]) {
    this.eqGains = [...gains];
    if (this.eqFilters.length && this.ctx) {
      this.eqFilters.forEach((filter, idx) => {
        filter.gain.setValueAtTime(gains[idx] || 0, this.ctx!.currentTime);
      });
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  public playTrack(track: Track, startFrom: number = 0) {
    this.initContext();
    this.stopSynthesizer();

    this.currentTrack = track;
    this.pauseOffset = startFrom;
    this.startTime = this.ctx!.currentTime - startFrom;
    this.isPlaying = true;

    this.startSynthesizerMelody(track, startFrom);

    if (this.synthInterval) clearInterval(this.synthInterval);
    this.synthInterval = setInterval(() => {
      if (this.isPlaying && this.ctx && this.currentTrack) {
        const currentTime = this.ctx.currentTime - this.startTime;
        if (currentTime >= this.currentTrack.duration) {
          this.stop();
          if (this.onEndedCallback) this.onEndedCallback();
        } else if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(currentTime);
        }
      }
    }, 100);
  }

  private startSynthesizerMelody(track: Track, offsetSec: number) {
    if (!this.ctx || !this.gainNode) return;

    // Rich synth chords & arpeggios crafted for audiophile preview playback
    const notes = track.previewNotes || [330, 392, 440, 523, 659, 784];
    const bpm = track.bpm || 110;
    const beatSec = 60 / bpm;

    const playTone = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;

      const noteIdx = Math.floor(((this.ctx.currentTime - this.startTime) / (beatSec * 0.5)) % notes.length);
      const rootFreq = notes[noteIdx];

      // Polyphonic warm analog pad with sub bass
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      subOsc.type = 'sine';

      osc1.frequency.setValueAtTime(rootFreq, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(rootFreq * 1.004, this.ctx.currentTime); // Slight detune for richness
      subOsc.frequency.setValueAtTime(rootFreq / 2, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + beatSec * 0.8);

      noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + beatSec * 0.7);

      osc1.connect(filter);
      osc2.connect(filter);
      subOsc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc1.start();
      osc2.start();
      subOsc.start();

      osc1.stop(this.ctx.currentTime + beatSec * 0.75);
      osc2.stop(this.ctx.currentTime + beatSec * 0.75);
      subOsc.stop(this.ctx.currentTime + beatSec * 0.75);

      this.oscillators.push(osc1, osc2, subOsc);
      if (this.oscillators.length > 20) {
        this.oscillators.splice(0, 10);
      }
    };

    // Play periodic tone sequence matching track tempo
    const stepInterval = (beatSec * 1000) / 2;
    const synthTimer = setInterval(() => {
      if (this.isPlaying) {
        playTone();
      } else {
        clearInterval(synthTimer);
      }
    }, stepInterval);

    playTone();
  }

  private stopSynthesizer() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignored if already stopped
      }
    });
    this.oscillators = [];
  }

  public pause() {
    if (!this.isPlaying || !this.ctx) return;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    this.isPlaying = false;
    this.stopSynthesizer();
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public resume() {
    if (this.isPlaying || !this.currentTrack) return;
    this.playTrack(this.currentTrack, this.pauseOffset);
  }

  public seek(seconds: number) {
    if (!this.currentTrack) return;
    this.pauseOffset = seconds;
    if (this.isPlaying) {
      this.playTrack(this.currentTrack, seconds);
    } else if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(seconds);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.pauseOffset = 0;
    this.stopSynthesizer();
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
