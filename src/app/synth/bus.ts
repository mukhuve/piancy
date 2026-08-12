import { SynthParams } from './presets';

/** Cadena de salida comun a todas las voces: saturacion, eco, reverb y volumen. */
export interface Bus {
  readonly analyser: AnalyserNode;
  readonly master: GainNode;
  /** Donde enchufa una voz: seco y los dos envios de efectos. */
  readonly sends: AudioNode[];
  /** Entrada para lo que no es una nota: pasa por el limite, pero no por el analisis. */
  readonly clicks: AudioNode;
  tune(params: SynthParams): void;
}

const REVERB_SECONDS = 2.4;
const REVERB_DECAY = 2.6;

/**
 * Techo de la mezcla, antes de la saturacion. Cada voz sale a un tercio del fondo de
 * escala, asi que tres notas ya suman lo que cabe entero y cinco lo pasan de largo.
 * La curva de saturacion aplasta todo lo que le llega por encima de uno, de modo que
 * un acorde entraba en ella como una onda cuadrada: eso, y no el volumen, es lo que
 * se oia como distorsion. Acotando antes, la saturacion recibe siempre lo mismo
 * suene una nota o suenen doce, y hace lo que dice su mando y nada mas.
 */
const CEILING = { threshold: -8, knee: 6, ratio: 12, attack: 0.004, release: 0.2 };

/**
 * Cuanto endurece la curva el mando de drive. A sesenta, el propio preset de piano
 * —drive 0.08— multiplicaba por 2.2 lo que le entraba y una sola nota ya salia a
 * tres cuartos del fondo de escala: el mando no dosificaba nada, saturaba desde el
 * primer paso.
 */
const DRIVE_RANGE = 12;

export function createBus(context: AudioContext): Bus {
  const dry = context.createGain();
  const delaySend = context.createGain();
  const reverbSend = context.createGain();

  const delay = context.createDelay(1.5);
  const feedback = context.createGain();
  delaySend.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);

  const reverb = context.createConvolver();
  reverb.buffer = impulse(context, REVERB_SECONDS, REVERB_DECAY);
  reverbSend.connect(reverb);

  const ceiling = context.createDynamicsCompressor();
  Object.entries(CEILING).forEach(([key, value]) => {
    ceiling[key as keyof typeof CEILING].value = value;
  });
  [dry, delay, reverb].forEach((node) => node.connect(ceiling));

  const shaper = context.createWaveShaper();
  shaper.oversample = '2x';
  ceiling.connect(shaper);

  const master = context.createGain();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;

  /* El analisis se toma antes del volumen y antes de los clics: mide lo que toca el
     instrumento, no lo alto que esta puesto ni el tic del metronomo. */
  shaper.connect(analyser);
  analyser.connect(master);
  master.connect(context.destination);

  return {
    analyser,
    master,
    sends: [dry, delaySend, reverbSend],
    /* El clic entra por el final: ni se analiza —saldria dibujado como una nota— ni
       se satura, que a un pitido de metronomo no le hace ninguna falta. */
    clicks: master,
    tune(params) {
      delay.delayTime.value = params.delayTime;
      feedback.gain.value = params.delayFb;
      delaySend.gain.value = params.delayMix;
      reverbSend.gain.value = params.reverbMix;
      shaper.curve = driveCurve(params.drive);
    },
  };
}

/** Reverb sin samples: ruido que se apaga, que es lo que mide un impulso real. */
function impulse(context: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }

  return buffer;
}

/** Curva de saturacion suave: cuanto mas `amount`, mas se aplastan los picos. */
function driveCurve(amount: number) {
  const steps = 1024;
  const curve = new Float32Array(steps);
  const k = amount * DRIVE_RANGE;

  for (let i = 0; i < steps; i++) {
    const x = (i * 2) / steps - 1;
    curve[i] = k < 0.01 ? x : ((1 + k) * x) / (1 + k * Math.abs(x));
  }

  return curve;
}
