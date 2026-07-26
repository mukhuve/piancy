/** jsdom no trae Web Audio API: lo minimo para que el sintetizador funcione en tests. */
class FakeParam {
  value = 0;
  setValueAtTime = () => this;
  linearRampToValueAtTime = () => this;
  exponentialRampToValueAtTime = () => this;
  cancelScheduledValues = () => this;
}

class FakeNode {
  connect = () => undefined;
  disconnect = () => undefined;
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
  destination = new FakeNode();

  resume = () => Promise.resolve();
  createOscillator = () => new FakeOscillator();
  createGain = () => Object.assign(new FakeNode(), { gain: new FakeParam() });
  createDelay = () => Object.assign(new FakeNode(), { delayTime: new FakeParam() });
  createConvolver = () => Object.assign(new FakeNode(), { buffer: null });
  createWaveShaper = () => Object.assign(new FakeNode(), { curve: null, oversample: 'none' });
  createBiquadFilter = () =>
    Object.assign(new FakeNode(), {
      type: 'lowpass',
      frequency: new FakeParam(),
      Q: new FakeParam(),
    });
  createAnalyser = () =>
    Object.assign(new FakeNode(), {
      fftSize: 2048,
      smoothingTimeConstant: 0,
      frequencyBinCount: 1024,
    });
  createBuffer = (channels: number, length: number) => ({
    numberOfChannels: channels,
    getChannelData: () => new Float32Array(length),
  });
}
