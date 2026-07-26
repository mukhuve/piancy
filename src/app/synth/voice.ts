import { SynthParams } from './presets';

/** Una nota sonando. Vive hasta que se suelta y termina el release. */
export interface Voice {
  /** Apaga la nota en `release` segundos y desmonta sus nodos al terminar. */
  stop(release: number): void;
}

/** Un gain nunca llega a cero: `exponentialRamp` no admite el silencio absoluto. */
const SILENCE = 0.0006;
const MAX_CUTOFF = 17000;

/**
 * Dos osciladores desafinados entre si pasan por un filtro con envolvente propia y
 * salen por la envolvente de amplitud, que es la que abre y cierra la nota.
 */
export function playVoice(
  context: AudioContext,
  sends: AudioNode[],
  params: SynthParams,
  frequency: number,
  velocity: number
): Voice {
  const now = context.currentTime;

  const filter = context.createBiquadFilter();
  filter.type = params.filtType;
  filter.Q.value = params.resonance;

  const amp = context.createGain();
  amp.gain.value = 0;
  filter.connect(amp);
  sends.forEach((send) => amp.connect(send));

  const oscillators = ([params.oscAType, params.oscBType] as const).map((type, i) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = i === 0 ? 0 : params.detune;
    gain.gain.value = (i === 0 ? 1 - params.mix : params.mix) * 0.5;

    oscillator.connect(gain);
    gain.connect(filter);

    return oscillator;
  });

  const attack = Math.max(0.004, params.attack);
  const decay = Math.max(0.01, params.decay);
  const peak = Math.max(0.05, velocity) * 0.55;

  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(peak, now + attack);
  amp.gain.linearRampToValueAtTime(Math.max(SILENCE, peak * params.sustain), now + attack + decay);

  filter.frequency.setValueAtTime(params.cutoff, now);
  filter.frequency.linearRampToValueAtTime(
    Math.min(MAX_CUTOFF, params.cutoff + params.filtEnv),
    now + attack
  );
  filter.frequency.linearRampToValueAtTime(params.cutoff, now + attack + decay);

  const lfo = params.lfoDepth > 0 ? createLfo(context, params, filter, oscillators) : undefined;

  [...oscillators, lfo].forEach((oscillator) => oscillator?.start(now));

  return {
    stop(release) {
      const from = context.currentTime;
      const until = from + Math.max(0.05, release);

      amp.gain.cancelScheduledValues(from);
      amp.gain.setValueAtTime(Math.max(SILENCE, amp.gain.value), from);
      amp.gain.exponentialRampToValueAtTime(SILENCE, until);

      [...oscillators, lfo].forEach((oscillator) => oscillator?.stop(until));
      oscillators[0].onended = () => amp.disconnect();
    },
  };
}

function createLfo(
  context: AudioContext,
  params: SynthParams,
  filter: BiquadFilterNode,
  oscillators: OscillatorNode[]
) {
  const lfo = context.createOscillator();
  const depth = context.createGain();

  lfo.frequency.value = params.lfoRate;
  depth.gain.value = params.lfoDepth;
  lfo.connect(depth);

  if (params.lfoTarget === 'pitch') {
    oscillators.forEach((oscillator) => depth.connect(oscillator.detune));
  } else {
    depth.connect(filter.frequency);
  }

  return lfo;
}
