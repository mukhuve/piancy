/** jsdom no trae Web Audio API: lo minimo para que el sintetizador funcione en tests. */
class FakeParam {
  value = 0;
  /**
   * Lo que se le ha programado, en orden. La forma de una envolvente —lo que tarda
   * en apagarse una nota y si cae recta o curva— no se puede comprobar de otra
   * manera sin oirla.
   */
  readonly ramps: { curve: 'step' | 'linear' | 'exponential'; value: number; at: number }[] = [];

  setValueAtTime = (value: number, at: number) => this.schedule('step', value, at);
  linearRampToValueAtTime = (value: number, at: number) => this.schedule('linear', value, at);
  exponentialRampToValueAtTime = (value: number, at: number) =>
    this.schedule('exponential', value, at);
  cancelScheduledValues = () => this;

  private schedule(curve: 'step' | 'linear' | 'exponential', value: number, at: number) {
    this.ramps.push({ curve, value, at });

    return this;
  }
}

/**
 * Apunta a donde enchufa cada nodo. Por donde pasa la señal y por donde no es media
 * cadena de audio —lo que se analiza, lo que se limita, lo que no debe dibujarse— y
 * es lo unico de ella que se puede comprobar sin oirla.
 */
class FakeNode {
  readonly outputs: FakeNode[] = [];

  constructor(readonly kind = 'node') {}

  connect = (node: FakeNode) => {
    this.outputs.push(node);

    return node;
  };
  disconnect = () => undefined;
}

/**
 * Por que nodos pasa la señal desde `from`, en orden. Detras del primer punto de
 * mezcla la cadena es una fila, y es su orden lo que decide que se analiza, que se
 * satura y que se limita: cambiarlo cambia el sonido sin que ningun test lo note.
 */
export function chainFrom(from: unknown) {
  const seen = new Set<FakeNode>();
  const kinds: string[] = [];
  let node = from as FakeNode | undefined;

  while (node && !seen.has(node)) {
    seen.add(node);
    kinds.push(node.kind);
    node = node.outputs[0];
  }

  return kinds;
}

/** Si la señal de `from` llega hasta `to` siguiendo las conexiones. */
export function reaches(from: unknown, to: unknown) {
  const seen = new Set<unknown>();
  const pending = [from];

  while (pending.length) {
    const node = pending.pop();

    if (node === to) return true;
    if (!node || seen.has(node)) continue;

    seen.add(node);
    pending.push(...((node as FakeNode).outputs ?? []));
  }

  return false;
}

class FakeOscillator extends FakeNode {
  type = 'sine';
  frequency = new FakeParam();
  detune = new FakeParam();
  onended: (() => void) | null = null;
  start = () => undefined;
  stop = () => undefined;
}

export class FakeAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = new FakeNode('destination');

  resume = () => Promise.resolve();
  createOscillator = () => new FakeOscillator();
  createGain = () => Object.assign(new FakeNode('gain'), { gain: new FakeParam() });
  createDelay = () => Object.assign(new FakeNode('delay'), { delayTime: new FakeParam() });
  createConvolver = () => Object.assign(new FakeNode('reverb'), { buffer: null });
  createWaveShaper = () =>
    Object.assign(new FakeNode('shaper'), { curve: null, oversample: 'none' });
  createBiquadFilter = () =>
    Object.assign(new FakeNode('filter'), {
      type: 'lowpass',
      frequency: new FakeParam(),
      Q: new FakeParam(),
    });
  createAnalyser = () =>
    Object.assign(new FakeNode('analyser'), {
      fftSize: 2048,
      smoothingTimeConstant: 0,
      frequencyBinCount: 1024,
      getByteTimeDomainData: (data: Uint8Array) => data.fill(128),
      getByteFrequencyData: (data: Uint8Array) => data.fill(0),
    });
  createDynamicsCompressor = () =>
    Object.assign(new FakeNode('ceiling'), {
      threshold: new FakeParam(),
      knee: new FakeParam(),
      ratio: new FakeParam(),
      attack: new FakeParam(),
      release: new FakeParam(),
    });
  createBufferSource = () =>
    Object.assign(new FakeNode('noise'), {
      buffer: null,
      onended: null as (() => void) | null,
      start: () => undefined,
      stop: () => undefined,
    });
  createBuffer = (channels: number, length: number) => ({
    numberOfChannels: channels,
    getChannelData: () => new Float32Array(length),
  });
}
