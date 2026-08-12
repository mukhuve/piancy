import { TestBed } from '@angular/core/testing';
import { FakeAudioContext } from '../synth/audio-context.fake';
import { Synth } from '../synth/synth';
import { BPM_RANGE, Transport } from './transport';

describe('Transport', () => {
  let transport: Transport;
  let blips: number[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', FakeAudioContext);

    blips = [];
    vi.spyOn(TestBed.inject(Synth), 'blip').mockImplementation((frequency) =>
      blips.push(frequency)
    );
    transport = TestBed.inject(Transport);
  });

  afterEach(() => vi.useRealTimers());

  it('acota el pulso al rango util y descarta lo que no es un numero', () => {
    transport.setBpm(500);
    expect(transport.bpm()).toBe(BPM_RANGE.max);

    transport.setBpm(1);
    expect(transport.bpm()).toBe(BPM_RANGE.min);

    transport.setBpm(NaN);
    expect(transport.bpm()).toBe(BPM_RANGE.min);
  });

  it('marca el compas con el primer pulso mas agudo', () => {
    transport.setBpm(120); // dos pulsos por segundo
    transport.metronome.set(true);
    TestBed.tick();

    vi.advanceTimersByTime(2000);

    expect(blips).toHaveLength(4);
    expect(blips[0]).toBeGreaterThan(blips[1]);
    expect(new Set(blips.slice(1))).toEqual(new Set([blips[1]]));
  });

  it('para al apagarlo y cambia de tempo sin dejar dos relojes en marcha', () => {
    transport.metronome.set(true);
    transport.setBpm(60);
    TestBed.tick();

    vi.advanceTimersByTime(2000);
    expect(blips).toHaveLength(2);

    transport.setBpm(120);
    TestBed.tick();
    blips.length = 0;
    vi.advanceTimersByTime(1000);
    expect(blips).toHaveLength(2);

    transport.metronome.set(false);
    TestBed.tick();
    blips.length = 0;
    vi.advanceTimersByTime(5000);
    expect(blips).toHaveLength(0);
  });
});
