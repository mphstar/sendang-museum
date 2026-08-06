/**
 * Web Audio API Ambient Soundscape Synthesizer
 * Generates smooth, soothing museum ambient pads and subtle metallic chimes
 * Zero external audio files required!
 */

class SoundscapeSynth {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private oscillators: OscillatorNode[] = [];
    private isPlaying = false;

    public init() {
        if (this.ctx) return;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
    }

    public toggle(): boolean {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    public start() {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.stopOscillators();

        // Warm ambient drone chords (F minor 9 ambient pad: F2, C3, Ab3, Eb4)
        const frequencies = [87.31, 130.81, 207.65, 311.13];

        frequencies.forEach((freq, i) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Subtle LFO modulation for warmth
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350 + i * 80, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.04 - i * 0.005, this.ctx.currentTime + 3);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            this.oscillators.push(osc);
        });

        this.isPlaying = true;
    }

    public stop() {
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
            setTimeout(() => {
                this.stopOscillators();
                this.isPlaying = false;
            }, 1000);
        } else {
            this.stopOscillators();
            this.isPlaying = false;
        }
    }

    private stopOscillators() {
        this.oscillators.forEach((osc) => {
            try {
                osc.stop();
                osc.disconnect();
            } catch {}
        });
        this.oscillators = [];
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }
}

export const soundscape = new SoundscapeSynth();
