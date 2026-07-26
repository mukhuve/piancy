import { SynthParams } from './presets';

/** Cadena de salida comun a todas las voces: saturacion, eco, reverb y volumen. */
export interface Bus {
  readonly analyser: AnalyserNode;
  readonly master: GainNode;
  /** Donde enchufa una voz: seco y los dos envios de efectos. */
  readonly sends: AudioNode[];
  tune(params: SynthParams): void;
}

const REVERB_SECONDS = 2.4;
const REVERB_DECAY = 2.6;

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

  const shaper = context.createWaveShaper();
  shaper.oversample = '2x';
  [dry, delay, reverb].forEach((node) => node.connect(shaper));

  const master = context.createGain();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;

  shaper.connect(master);
  master.connect(analyser);
  analyser.connect(context.destination);

  return {
    analyser,
    master,
    sends: [dry, delaySend, reverbSend],
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
  const k = amount * 60;

  for (let i = 0; i < steps; i++) {
    const x = (i * 2) / steps - 1;
    curve[i] = k < 0.01 ? x : ((1 + k) * x) / (1 + k * Math.abs(x));
  }

  return curve;
}
