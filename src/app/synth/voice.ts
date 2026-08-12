import { SynthParams } from './presets';

/** Una nota sonando. Vive hasta que se suelta y termina el release. */
export interface Voice {
  /** Apaga la nota en `release` segundos y desmonta sus nodos al terminar. */
  stop(release: number): void;
  /**
   * Su onda a solas, en la ventana de tiempo que se le pida. La ventana viene de
   * fuera y es la misma para todas las voces a proposito: es lo unico que hace que
   * un la de 440 se vea con el doble de ciclos que el la de 220 que tiene debajo.
   */
  waveform(samples: number): Uint8Array;
}

/** Un gain nunca llega a cero: `exponentialRamp` no admite el silencio absoluto. */
const SILENCE = 0.0006;
const MAX_CUTOFF = 17000;

/**
 * Cuanto cabe en el osciloscopio de cada voz. A 44.1 kHz son 186 ms, que dan de
 * sobra para los cuatro ciclos de la nota mas grave del piano y aun dejan margen
 * para buscarle el punto de disparo.
 */
const SCOPE_SIZE = 8192;

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

  /* Se mira la voz seca, antes del bus: la onda que interesa es la de la nota, no la
     de la mezcla con el eco, la reverb y las demas notas. */
  const scope = context.createAnalyser();
  scope.fftSize = SCOPE_SIZE;
  amp.connect(scope);

  const times = new Uint8Array(scope.fftSize);

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
    waveform(samples) {
      scope.getByteTimeDomainData(times);

      const span = Math.max(2, Math.min(times.length, Math.round(samples)));
      const from = triggerAt(times, times.length - span);

      return times.subarray(from, from + span);
    },

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

/**
 * Punto de disparo del osciloscopio: la primera vez que la onda cruza el cero hacia
 * arriba. Sin el, cada fotograma empieza en una fase distinta y la onda corre por el
 * lienzo; empezando siempre por el mismo sitio del ciclo, se queda quieta y se puede
 * mirar. Es lo que hace la perilla de trigger de un osciloscopio de verdad.
 */
function triggerAt(data: Uint8Array, limit: number) {
  for (let i = 1; i < limit; i++) {
    if (data[i - 1] < 128 && data[i] >= 128) return i;
  }

  return 0;
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
