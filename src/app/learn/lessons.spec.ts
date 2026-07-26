import { TestBed } from '@angular/core/testing';
import { LESSONS } from '../music/lessons';
import { FakeAudioContext } from '../synth/audio-context.fake';
import { Synth } from '../synth/synth';
import { Lessons } from './lessons';

const SCALE = LESSONS.findIndex(({ id }) => id === 'scale');
const TRIADS = LESSONS.findIndex(({ id }) => id === 'triads');
const EAR = LESSONS.findIndex(({ id }) => id === 'ear');

describe('Lessons', () => {
  let lessons: Lessons;
  let synth: Synth;

  /** Pulsar y soltar, que es como se toca de verdad. */
  const play = (...midis: number[]) => {
    midis.forEach((midi) => synth.noteOn(midi));
    TestBed.tick();
    midis.forEach((midi) => synth.noteOff(midi));
    TestBed.tick();
  };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    synth = TestBed.inject(Synth);
    lessons = TestBed.inject(Lessons);
  });

  it('avanza paso a paso con las notas correctas', () => {
    lessons.choose(SCALE);
    expect(lessons.targets()).toEqual([60]);

    play(60);
    expect(lessons.step()).toBe(1);
    expect(lessons.targets()).toEqual([62]);
    expect(lessons.ok()).toBe(true);
  });

  it('avisa de la tecla equivocada y dice cual se esperaba, sin avanzar', () => {
    lessons.choose(SCALE);

    play(61);

    expect(lessons.step()).toBe(0);
    expect(lessons.wrong()).toBe(61);
    expect(lessons.status()).toBe('Expected C4');
  });

  it('los acordes se dan por buenos aunque las notas no caigan a la vez', () => {
    lessons.choose(TRIADS);
    expect(lessons.targets()).toEqual([60, 64, 67]);

    synth.noteOn(60);
    TestBed.tick();
    expect(lessons.step()).toBe(0);

    synth.noteOn(64);
    synth.noteOn(67);
    TestBed.tick();
    expect(lessons.step()).toBe(1);
  });

  it('guarda la leccion superada y la recuerda entre sesiones', () => {
    lessons.choose(SCALE);
    LESSONS[SCALE].steps.forEach(([midi]) => play(midi));

    expect(lessons.cleared()).toBe(true);
    expect(lessons.status()).toBe('Lesson complete');
    expect(lessons.done().has('scale')).toBe(true);
    expect(JSON.parse(localStorage.getItem('piancy.progress')!)).toEqual(['scale']);

    lessons.resetProgress();
    expect(lessons.done().size).toBe(0);
  });

  it('la de oido no enseña la nota y solo la da por buena si se acierta', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0); // siempre el do central
    lessons.choose(EAR);
    vi.advanceTimersByTime(2000); // suena la referencia y termina de sonar

    expect(lessons.targets()).toEqual([]);

    play(62);
    expect(lessons.step()).toBe(0);
    expect(lessons.status()).toBe('Not that one — listen again');

    play(60);
    expect(lessons.step()).toBe(1);

    vi.useRealTimers();
  });

  it('reiniciar deja la leccion como al empezar', () => {
    lessons.choose(SCALE);
    play(60);
    expect(lessons.step()).toBe(1);

    lessons.restart();
    expect(lessons.step()).toBe(0);
    expect(lessons.status()).toBe('Ready');
  });
});
