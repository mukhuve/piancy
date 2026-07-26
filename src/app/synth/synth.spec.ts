import { TestBed } from '@angular/core/testing';
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

  it('cambiar de preset reemplaza los parametros', () => {
    synth.usePreset('Pluck');

    expect(synth.preset()).toBe('Pluck');
    expect(synth.params()).toEqual(PRESETS.Pluck);

    synth.setParam('attack', 0.5);
    expect(synth.params().attack).toBe(0.5);
    expect(PRESETS.Pluck.attack).not.toBe(0.5);
  });
});
