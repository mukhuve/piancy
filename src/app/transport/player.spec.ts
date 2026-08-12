import { TestBed } from '@angular/core/testing';
import { SONGS } from '../music/songs';
import { FakeAudioContext } from '../synth/audio-context.fake';
import { Synth } from '../synth/synth';
import { Player } from './player';

const [ODE] = SONGS;

describe('Player', () => {
  let player: Player;
  let synth: Synth;
  let now: number;

  /** Coloca el reloj como si hubieran pasado `seconds` desde el arranque. */
  const advance = (seconds: number) => {
    now += seconds * 1000;
    vi.advanceTimersByTime(seconds * 1000);
  };

  beforeEach(() => {
    now = 0;
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('AudioContext', FakeAudioContext);

    synth = TestBed.inject(Synth);
    player = TestBed.inject(Player);
    player.choose(ODE);
    player.start();
  });

  afterEach(() => {
    player.stop();
    vi.useRealTimers();
  });

  it('empieza con todas las notas pendientes', () => {
    expect(player.states()).toHaveLength(ODE.notes.length);
    expect(new Set(player.states())).toEqual(new Set(['pending']));
  });

  it('da por buena la nota correcta a tiempo', () => {
    synth.noteOn(ODE.notes[0].midi);
    TestBed.tick();

    expect(player.hits()).toBe(1);
    expect(player.streak()).toBe(1);
    expect(player.states()[0]).toBe('hit');
  });

  it('ignora la nota equivocada y la correcta fuera de tiempo', () => {
    synth.noteOn(ODE.notes[0].midi + 1);
    TestBed.tick();
    expect(player.hits()).toBe(0);

    advance(3);
    synth.noteOn(ODE.notes[0].midi);
    TestBed.tick();
    expect(player.hits()).toBe(0);
  });

  it('cuenta como perdida la nota cuyo momento pasa sin tocarla, y rompe la racha', () => {
    synth.noteOn(ODE.notes[0].midi);
    TestBed.tick();
    expect(player.streak()).toBe(1);

    advance(2);
    expect(player.misses()).toBeGreaterThan(0);
    expect(player.streak()).toBe(0);
    expect(player.states()[1]).toBe('miss');
  });

  it('la velocidad estira la cancion sin cambiar sus pulsos', () => {
    const normal = player.secondsPerBeat();

    player.speed.set(0.5);
    expect(player.secondsPerBeat()).toBeCloseTo(normal * 2, 6);
  });

  it('para sola al terminar la cancion', () => {
    expect(player.running()).toBe(true);

    advance(ODE.notes.length * player.secondsPerBeat() + 5);
    expect(player.running()).toBe(false);
  });

  it('cambiar de cancion la para y borra el marcador', () => {
    synth.noteOn(ODE.notes[0].midi);
    TestBed.tick();

    player.choose(SONGS[1]);

    expect(player.running()).toBe(false);
    expect(player.hits()).toBe(0);
    expect(player.states()).toHaveLength(SONGS[1].notes.length);
  });
});
