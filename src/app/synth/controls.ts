import { SynthParams } from './presets';

export interface Option {
  readonly value: string;
  readonly label: string;
}

/** Un parametro del sintetizador tal y como se maneja en el panel. */
export interface SynthControl {
  readonly key: keyof SynthParams;
  readonly label: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly options?: readonly Option[];
  /** Como se escribe el valor al lado del mando. */
  readonly format?: (value: number) => string;
}

export interface SynthGroup {
  readonly title: string;
  readonly code: string;
  readonly controls: readonly SynthControl[];
}

const hz = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`);
const ms = (value: number) => `${Math.round(value * 1000)}m`;
const pct = (value: number) => `${Math.round(value * 100)}%`;
const cents = (value: number) => `${Math.round(value)}c`;
const one = (value: number) => value.toFixed(1);

const options = (...values: string[]): Option[] =>
  values.map((value) => ({ value, label: value.toUpperCase() }));

const WAVES = options('sine', 'triangle', 'sawtooth', 'square');

export const SYNTH_GROUPS: readonly SynthGroup[] = [
  {
    title: 'Oscillators',
    code: 'OSC A/B',
    controls: [
      { key: 'oscAType', label: 'Wave A', options: WAVES },
      { key: 'oscBType', label: 'Wave B', options: WAVES },
      { key: 'detune', label: 'Detune', min: 0, max: 40, step: 1, format: cents },
      { key: 'mix', label: 'A / B', min: 0, max: 1, step: 0.01, format: pct },
    ],
  },
  {
    title: 'Envelope',
    code: 'ADSR',
    controls: [
      { key: 'attack', label: 'Attack', min: 0.001, max: 1.5, step: 0.001, format: ms },
      { key: 'decay', label: 'Decay', min: 0.01, max: 2, step: 0.01, format: ms },
      { key: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01, format: pct },
      { key: 'release', label: 'Release', min: 0.05, max: 3, step: 0.01, format: ms },
    ],
  },
  {
    title: 'Filter',
    code: 'BIQUAD',
    controls: [
      { key: 'filtType', label: 'Type', options: options('lowpass', 'highpass', 'bandpass') },
      { key: 'cutoff', label: 'Cutoff', min: 80, max: 12000, step: 10, format: hz },
      { key: 'resonance', label: 'Reso', min: 0.1, max: 20, step: 0.1, format: one },
      { key: 'filtEnv', label: 'Env amt', min: 0, max: 6000, step: 10, format: hz },
    ],
  },
  {
    title: 'Modulation',
    code: 'LFO',
    controls: [
      { key: 'lfoTarget', label: 'Target', options: options('filter', 'pitch') },
      { key: 'lfoRate', label: 'Rate', min: 0.1, max: 14, step: 0.1, format: (v) => `${one(v)}h` },
      { key: 'lfoDepth', label: 'Depth', min: 0, max: 900, step: 1, format: (v) => `${Math.round(v)}` },
    ],
  },
  {
    title: 'Space',
    code: 'FX BUS',
    controls: [
      { key: 'drive', label: 'Drive', min: 0, max: 1, step: 0.01, format: pct },
      { key: 'delayTime', label: 'Dly time', min: 0.02, max: 0.9, step: 0.01, format: ms },
      { key: 'delayFb', label: 'Feedback', min: 0, max: 0.85, step: 0.01, format: pct },
      { key: 'delayMix', label: 'Dly send', min: 0, max: 0.6, step: 0.01, format: pct },
      { key: 'reverbMix', label: 'Reverb', min: 0, max: 0.8, step: 0.01, format: pct },
    ],
  },
];
