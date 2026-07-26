import { TestBed } from '@angular/core/testing';
import { FakeAudioContext } from '../synth/audio-context.fake';
import { Synth } from '../synth/synth';
import { Midi } from './midi';

/** Un teclado MIDI de mentira, con un puerto de entrada al que mandarle mensajes. */
function fakeAccess() {
  const port = { onmidimessage: undefined as ((event: { data: Uint8Array }) => void) | undefined };

  return {
    port,
    access: { inputs: new Map([['1', port]]) },
    send: (bytes: number[]) => port.onmidimessage?.({ data: new Uint8Array(bytes) }),
  };
}

describe('Midi', () => {
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    synth = TestBed.inject(Synth);
  });

  it('avisa cuando el navegador no habla MIDI, y no ofrece conectarse', () => {
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined, configurable: true });

    const service = TestBed.inject(Midi);

    expect(service.status()).toBe('MIDI N/A');
    expect(service.available()).toBe(false);
  });

  it('no pide permiso hasta que se le manda conectar', () => {
    const ask = vi.fn(() => Promise.resolve(fakeAccess().access));
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: ask, configurable: true });

    const service = TestBed.inject(Midi);

    expect(ask).not.toHaveBeenCalled();
    expect(service.status()).toBe('MIDI off');
    expect(service.available()).toBe(true);
  });

  it('avisa cuando el navegador niega el permiso', async () => {
    Object.defineProperty(navigator, 'requestMIDIAccess', {
      value: () => Promise.reject(new Error('denied')),
      configurable: true,
    });

    const service = TestBed.inject(Midi);
    await service.connect();

    expect(service.status()).toBe('MIDI denied');
    expect(service.connected()).toBe(false);
  });

  it('toca y suelta lo que llega del teclado, con su fuerza', async () => {
    const midi = fakeAccess();
    Object.defineProperty(navigator, 'requestMIDIAccess', {
      value: () => Promise.resolve(midi.access),
      configurable: true,
    });

    const service = TestBed.inject(Midi);
    await service.connect();

    expect(service.status()).toBe('MIDI 1 IN');
    expect(service.connected()).toBe(true);

    midi.send([0x90, 60, 100]);
    expect(synth.playing()).toEqual([60]);

    midi.send([0x80, 60, 0]);
    expect(synth.playing()).toEqual([]);
  });

  it('un note on sin fuerza apaga la nota, que es como lo mandan muchos teclados', async () => {
    const midi = fakeAccess();
    Object.defineProperty(navigator, 'requestMIDIAccess', {
      value: () => Promise.resolve(midi.access),
      configurable: true,
    });

    await TestBed.inject(Midi).connect();

    midi.send([0x90, 64, 90]);
    expect(synth.playing()).toEqual([64]);

    midi.send([0x90, 64, 0]);
    expect(synth.playing()).toEqual([]);
  });
});
