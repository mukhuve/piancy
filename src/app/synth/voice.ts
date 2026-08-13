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

/** Do central. La nota desde la que se mide si una es grave o aguda. */
const MIDDLE_C = 261.63;
/** Cuanto se estira y se encoge el decaimiento de una punta del piano a la otra. */
const TRACKING = { least: 0.45, most: 2.2 };
/** Lo que dura el golpe del martillo. Mas alla de esto ya no es un golpe. */
const STRIKE_SECONDS = 0.055;
/** Sobre que armonico se centra el ruido del golpe. */
const STRIKE_HARMONIC = 4;

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
  const decay = Math.max(0.01, params.decay) * tracking(frequency);
  const peak = Math.max(0.05, velocity) * 0.55;
  /* Cuanto mas fuerte se pulsa, mas brillante suena: en una cuerda el golpe fuerte no
     solo suena mas, saca armonicos que el suave no llega a mover. Con el filtro fijo,
     tocar flojo y tocar fuerte daban la misma nota con el volumen cambiado. */
  const open = Math.min(MAX_CUTOFF, params.cutoff + params.filtEnv * velocity);

  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(peak, now + attack);
  /* El decaimiento es exponencial, no lineal: una cuerda pierde energia en proporcion
     a la que le queda, asi que cae de golpe al principio y se va apagando despues. En
     rampa lineal la nota se sostiene entera y se corta al final, que es lo que hacia
     que hasta el piano sonara a organo. */
  amp.gain.exponentialRampToValueAtTime(
    Math.max(SILENCE, peak * params.sustain),
    now + attack + decay
  );

  filter.frequency.setValueAtTime(params.cutoff, now);
  filter.frequency.linearRampToValueAtTime(open, now + attack);
  filter.frequency.exponentialRampToValueAtTime(params.cutoff, now + attack + decay);

  if (params.hammer > 0) strike(context, sends, params, frequency, velocity);

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
 * Cuanto dura la nota segun donde caiga en el piano. En un instrumento de cuerda la
 * grave se apaga mucho mas despacio que la aguda —mas masa moviendose, menos aire
 * perdido por ciclo—, y esa diferencia es medio realismo: con el mismo decaimiento
 * para todas, el bajo suena recortado y el agudo se queda zumbando.
 */
function tracking(frequency: number) {
  const ratio = Math.sqrt(MIDDLE_C / frequency);

  return Math.min(TRACKING.most, Math.max(TRACKING.least, ratio));
}

/**
 * El golpe del martillo contra la cuerda: un chasquido de ruido de milisegundos,
 * filtrado alrededor de la nota para que suene a esa y no a un `psst`. Es lo que mas
 * separa un piano de una onda que se enciende: el oido reconoce el instrumento por el
 * ataque, y sin transitorio ninguna envolvente deja de sonar a sintetizador.
 *
 * Va derecho al bus y no por la voz: tiene que sonar entero antes de que la
 * envolvente termine de abrir, y no es la nota, asi que tampoco debe salir dibujado
 * en su onda.
 */
function strike(
  context: AudioContext,
  sends: AudioNode[],
  params: SynthParams,
  frequency: number,
  velocity: number
) {
  const now = context.currentTime;
  const noise = context.createBufferSource();
  const tone = context.createBiquadFilter();
  const amp = context.createGain();

  noise.buffer = noiseOf(context);
  tone.type = 'bandpass';
  tone.frequency.value = Math.min(MAX_CUTOFF, frequency * STRIKE_HARMONIC);
  tone.Q.value = 0.7;

  amp.gain.setValueAtTime(params.hammer * velocity * 0.5, now);
  amp.gain.exponentialRampToValueAtTime(SILENCE, now + STRIKE_SECONDS);

  noise.connect(tone);
  tone.connect(amp);
  sends.forEach((send) => amp.connect(send));

  noise.start(now);
  noise.stop(now + STRIKE_SECONDS);
  noise.onended = () => amp.disconnect();
}

/** Un segundo de ruido, uno por contexto: rellenarlo en cada nota cuesta y suena igual. */
const noises = new WeakMap<AudioContext, AudioBuffer>();

function noiseOf(context: AudioContext) {
  let noise = noises.get(context);

  if (!noise) {
    noise = context.createBuffer(1, context.sampleRate, context.sampleRate);

    const samples = noise.getChannelData(0);

    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

    noises.set(context, noise);
  }

  return noise;
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
