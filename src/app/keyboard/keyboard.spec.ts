import { TestBed } from '@angular/core/testing';
import { WHITE_KEYS } from '../music/keyboard';
import { FakeAudioContext } from '../synth/audio-context.fake';
import { Synth } from '../synth/synth';
import { Keyboard } from './keyboard';

/** Con tres octavas la ventana son 22 blancas y arranca en el do de la mano izquierda. */
const TYPING_BASE = 48;

describe('Keyboard', () => {
  let keyboard: Keyboard;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    keyboard = TestBed.inject(Keyboard);
  });

  it('muestra una ventana de blancas con sus negras encima', () => {
    expect(keyboard.whites()).toHaveLength(keyboard.size());
    expect(keyboard.keys().filter(({ black }) => black).length).toBeGreaterThan(0);
    expect(keyboard.keys().every(({ x, width }) => x >= 0 && x + width <= 1)).toBe(true);
  });

  it('no deja que la ventana se salga del piano', () => {
    keyboard.move(-WHITE_KEYS.length);
    expect(keyboard.whites().at(0)).toBe(WHITE_KEYS.at(0));

    keyboard.move(WHITE_KEYS.length * 2);
    expect(keyboard.whites().at(-1)).toBe(WHITE_KEYS.at(-1));
  });

  it('centra la ventana en una nota', () => {
    keyboard.centerOn(60);

    expect(keyboard.whites().at(0)).toBeLessThan(60);
    expect(keyboard.whites().at(-1)).toBeGreaterThan(60);
  });

  it('reparte las teclas del ordenador desde el primer do visible', () => {
    expect(keyboard.midiFor('a')).toBe(TYPING_BASE);
    expect(keyboard.midiFor('w')).toBe(TYPING_BASE + 1);
    expect(keyboard.midiFor('ñ')).toBeUndefined();

    keyboard.move(7);
    expect(keyboard.midiFor('a')).toBe(TYPING_BASE + 12);
  });

  it('suelta lo que suene al desplazarse, que si no quedaria colgado', () => {
    const synth = TestBed.inject(Synth);

    synth.noteOn(24);
    expect(synth.playing()).toHaveLength(1);

    keyboard.move(7);
    expect(synth.playing()).toEqual([]);
  });
});
