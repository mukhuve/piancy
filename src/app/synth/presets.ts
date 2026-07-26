/** Ajustes de una voz y del bus de efectos. Tiempos en segundos, tono en cents. */
export interface SynthParams {
  oscAType: OscillatorType;
  oscBType: OscillatorType;
  detune: number;
  /** Peso del segundo oscilador, de 0 (solo A) a 1 (solo B). */
  mix: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filtType: BiquadFilterType;
  cutoff: number;
  resonance: number;
  /** Cuanto abre el filtro la envolvente, en Hz sobre el corte. */
  filtEnv: number;
  lfoTarget: 'filter' | 'pitch';
  lfoRate: number;
  lfoDepth: number;
  drive: number;
  delayTime: number;
  delayFb: number;
  delayMix: number;
  reverbMix: number;
}

export const PRESETS = {
  'Glass Piano': { oscAType: 'triangle', oscBType: 'sine', detune: 6, mix: 0.4, attack: 0.004, decay: 0.5, sustain: 0.25, release: 0.7, cutoff: 4200, resonance: 2, filtEnv: 2600, filtType: 'lowpass', lfoRate: 4.5, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.26, delayFb: 0.24, delayMix: 0.16, reverbMix: 0.3, drive: 0.08 },
  'Steel Pad': { oscAType: 'sawtooth', oscBType: 'sawtooth', detune: 11, mix: 0.5, attack: 0.35, decay: 0.6, sustain: 0.75, release: 1.4, cutoff: 1500, resonance: 5, filtEnv: 1400, filtType: 'lowpass', lfoRate: 0.6, lfoDepth: 420, lfoTarget: 'filter', delayTime: 0.4, delayFb: 0.35, delayMix: 0.24, reverbMix: 0.45, drive: 0.05 },
  Pluck: { oscAType: 'square', oscBType: 'sawtooth', detune: 4, mix: 0.3, attack: 0.002, decay: 0.18, sustain: 0.05, release: 0.22, cutoff: 1800, resonance: 9, filtEnv: 3800, filtType: 'lowpass', lfoRate: 6, lfoDepth: 0, lfoTarget: 'pitch', delayTime: 0.22, delayFb: 0.3, delayMix: 0.22, reverbMix: 0.18, drive: 0.2 },
  'Sub Bass': { oscAType: 'sine', oscBType: 'square', detune: 2, mix: 0.25, attack: 0.008, decay: 0.3, sustain: 0.7, release: 0.28, cutoff: 700, resonance: 4, filtEnv: 900, filtType: 'lowpass', lfoRate: 3, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.18, delayFb: 0.12, delayMix: 0.05, reverbMix: 0.08, drive: 0.3 },
  'Bell Choir': { oscAType: 'sine', oscBType: 'triangle', detune: 19, mix: 0.45, attack: 0.006, decay: 1.1, sustain: 0.1, release: 1.6, cutoff: 6000, resonance: 1, filtEnv: 1200, filtType: 'bandpass', lfoRate: 5.5, lfoDepth: 180, lfoTarget: 'pitch', delayTime: 0.33, delayFb: 0.4, delayMix: 0.3, reverbMix: 0.5, drive: 0 },
} as const satisfies Record<string, SynthParams>;

export type PresetName = keyof typeof PRESETS;

export const DEFAULT_PRESET: PresetName = 'Glass Piano';

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];
