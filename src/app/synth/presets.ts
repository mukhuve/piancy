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
  /** Golpe del martillo, de 0 (la cuerda sola) a 1. Es el ataque de un instrumento. */
  hammer: number;
  lfoTarget: 'filter' | 'pitch';
  lfoRate: number;
  lfoDepth: number;
  drive: number;
  delayTime: number;
  delayFb: number;
  delayMix: number;
  reverbMix: number;
}

/* Un piano de cola sintetizado no se parece a uno grabado, y no es lo que se busca:
   lo que hace que suene a instrumento y no a onda es el ataque —el martillo— y el
   decaimiento, que en una cuerda cae de golpe y luego se apaga durante segundos. De
   ahi que los pianos vayan con `sustain` en casi cero: la nota se muere sola, como
   pasa de verdad. El organo es justo lo contrario, `sustain` a uno, porque su aire no
   deja de soplar mientras la tecla este abajo. */
export const PRESETS = {
  'Grand Piano': { oscAType: 'triangle', oscBType: 'sawtooth', detune: 3, mix: 0.22, attack: 0.002, decay: 1.6, sustain: 0, release: 0.35, cutoff: 1300, resonance: 0.7, filtEnv: 4600, filtType: 'lowpass', lfoRate: 1, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.2, delayFb: 0, delayMix: 0, reverbMix: 0.2, drive: 0.06, hammer: 0.45 },
  Rhodes: { oscAType: 'sine', oscBType: 'triangle', detune: 5, mix: 0.32, attack: 0.004, decay: 1.4, sustain: 0.06, release: 0.5, cutoff: 2400, resonance: 1.2, filtEnv: 2600, filtType: 'lowpass', lfoRate: 4.2, lfoDepth: 260, lfoTarget: 'filter', delayTime: 0.24, delayFb: 0.18, delayMix: 0.12, reverbMix: 0.28, drive: 0.14, hammer: 0.2 },
  'Glass Piano': { oscAType: 'triangle', oscBType: 'sine', detune: 6, mix: 0.4, attack: 0.004, decay: 0.5, sustain: 0.25, release: 0.7, cutoff: 4200, resonance: 2, filtEnv: 2600, filtType: 'lowpass', lfoRate: 4.5, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.26, delayFb: 0.24, delayMix: 0.16, reverbMix: 0.3, drive: 0.08, hammer: 0.12 },
  Organ: { oscAType: 'sine', oscBType: 'square', detune: 0, mix: 0.28, attack: 0.01, decay: 0.06, sustain: 1, release: 0.1, cutoff: 4200, resonance: 0.6, filtEnv: 0, filtType: 'lowpass', lfoRate: 5.6, lfoDepth: 0, lfoTarget: 'pitch', delayTime: 0.15, delayFb: 0.1, delayMix: 0.06, reverbMix: 0.32, drive: 0.18, hammer: 0.06 },
  'Steel Pad': { oscAType: 'sawtooth', oscBType: 'sawtooth', detune: 11, mix: 0.5, attack: 0.35, decay: 0.6, sustain: 0.75, release: 1.4, cutoff: 1500, resonance: 5, filtEnv: 1400, filtType: 'lowpass', lfoRate: 0.6, lfoDepth: 420, lfoTarget: 'filter', delayTime: 0.4, delayFb: 0.35, delayMix: 0.24, reverbMix: 0.45, drive: 0.05, hammer: 0 },
  'Super Saw': { oscAType: 'sawtooth', oscBType: 'sawtooth', detune: 24, mix: 0.5, attack: 0.02, decay: 0.8, sustain: 0.55, release: 0.45, cutoff: 2200, resonance: 3, filtEnv: 3200, filtType: 'lowpass', lfoRate: 0.3, lfoDepth: 420, lfoTarget: 'filter', delayTime: 0.3, delayFb: 0.32, delayMix: 0.2, reverbMix: 0.34, drive: 0.16, hammer: 0 },
  Pluck: { oscAType: 'square', oscBType: 'sawtooth', detune: 4, mix: 0.3, attack: 0.002, decay: 0.18, sustain: 0.05, release: 0.22, cutoff: 1800, resonance: 9, filtEnv: 3800, filtType: 'lowpass', lfoRate: 6, lfoDepth: 0, lfoTarget: 'pitch', delayTime: 0.22, delayFb: 0.3, delayMix: 0.22, reverbMix: 0.18, drive: 0.2, hammer: 0.25 },
  'Sub Bass': { oscAType: 'sine', oscBType: 'square', detune: 2, mix: 0.25, attack: 0.008, decay: 0.3, sustain: 0.7, release: 0.28, cutoff: 700, resonance: 4, filtEnv: 900, filtType: 'lowpass', lfoRate: 3, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.18, delayFb: 0.12, delayMix: 0.05, reverbMix: 0.08, drive: 0.3, hammer: 0.08 },
  'Bell Choir': { oscAType: 'sine', oscBType: 'triangle', detune: 19, mix: 0.45, attack: 0.006, decay: 1.1, sustain: 0.1, release: 1.6, cutoff: 6000, resonance: 1, filtEnv: 1200, filtType: 'bandpass', lfoRate: 5.5, lfoDepth: 180, lfoTarget: 'pitch', delayTime: 0.33, delayFb: 0.4, delayMix: 0.3, reverbMix: 0.5, drive: 0, hammer: 0 },
  /* La nota desnuda: un solo oscilador senoidal, sin desafinar contra nada, sin
     filtro que la recorte, sin saturarla y sin nada detras. Es el patron con el que
     se mira todo lo demas —la frecuencia se ve entera en el grafico y solo esta ella
     dentro— y con el que se oye lo que hace cada mando cuando se toca. */
  'Pure Tone': { oscAType: 'sine', oscBType: 'sine', detune: 0, mix: 0, attack: 0.01, decay: 0.01, sustain: 1, release: 0.12, cutoff: 12000, resonance: 0.1, filtEnv: 0, filtType: 'lowpass', lfoRate: 1, lfoDepth: 0, lfoTarget: 'filter', delayTime: 0.02, delayFb: 0, delayMix: 0, reverbMix: 0, drive: 0, hammer: 0 },
} as const satisfies Record<string, SynthParams>;

export type PresetName = keyof typeof PRESETS;

export const DEFAULT_PRESET: PresetName = 'Grand Piano';

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];
