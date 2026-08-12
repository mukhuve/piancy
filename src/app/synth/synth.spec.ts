import { TestBed } from '@angular/core/testing';
import { frequencyOf } from '../music/pitch';
import { FakeAudioContext } from './audio-context.fake';
import { PRESETS } from './presets';
import { Synth } from './synth';

describe('Synth', () => {
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    synth = TestBed.inject(Synth);
  });

  it('lleva la cuenta de lo que suena', () => {
    synth.noteOn(60);
    synth.noteOn(64);
    expect(synth.playing()).toEqual([60, 64]);

    synth.noteOff(60);
    expect(synth.playing()).toEqual([64]);
  });

  it('el pedal sostiene las notas soltadas hasta que se levanta', () => {
    synth.sustain.set(true);
    TestBed.tick();

    synth.noteOn(60);
    synth.noteOff(60);
    expect(synth.playing()).toEqual([60]);

    synth.sustain.set(false);
    TestBed.tick();
    expect(synth.playing()).toEqual([]);
  });

  it('roba la voz mas antigua al pasar de doce', () => {
    for (let midi = 60; midi < 73; midi++) synth.noteOn(midi);

    expect(synth.playing()).toHaveLength(12);
    expect(synth.playing()).not.toContain(60);
    expect(synth.playing()).toContain(72);
  });

  it('panic suelta todo lo que quede sonando', () => {
    synth.noteOn(60);
    synth.noteOn(64);
    synth.panic();

    expect(synth.playing()).toEqual([]);
  });

  it('todas las ondas se miran por la misma ventana, la que marca la nota mas grave', () => {
    const window = (midi: number) => Math.round((44100 / frequencyOf(midi)) * 4);

    synth.noteOn(69); // la de 440
    expect(synth.waves()[0].wave.length).toBe(window(69));

    // al añadir la octava de abajo manda ella: en la ventana en la que da cuatro
    // ciclos, la de arriba da ocho justos, y eso es lo que se ve en el grafico
    synth.noteOn(57); // la de 220
    const [grave, aguda] = synth.waves();

    expect(grave.midi).toBe(57);
    expect(aguda.wave.length).toBe(grave.wave.length);
    expect(grave.wave.length).toBe(window(57));
    expect(grave.wave.length / window(69)).toBeCloseTo(2, 1);
  });

  it('sin nada sonando no hay onda que mirar', () => {
    expect(synth.waves()).toEqual([]);
  });

  it('cambiar de preset reemplaza los parametros', () => {
    synth.usePreset('Pluck');

    expect(synth.preset()).toBe('Pluck');
    expect(synth.params()).toEqual(PRESETS.Pluck);

    synth.setParam('attack', 0.5);
    expect(synth.params().attack).toBe(0.5);
    expect(PRESETS.Pluck.attack).not.toBe(0.5);
  });
});
