import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WHITE_KEYS } from '../../music/keyboard';
import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Synth } from '../../synth/synth';
import { Piano } from './piano';

/** Con tres octavas la ventana son 22 blancas y el primer do visible es C1. */
const TYPING_BASE = 24;

describe('Piano', () => {
  let component: Piano;
  let fixture: ComponentFixture<Piano>;
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [Piano] });
    fixture = TestBed.createComponent(Piano);
    component = fixture.componentInstance;
    synth = TestBed.inject(Synth);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra una ventana de blancas con sus negras encima', () => {
    expect(component.whites()).toHaveLength(component.size());
    expect(component.keys().filter(({ black }) => black).length).toBeGreaterThan(0);
    expect(component.keys().every(({ x, width }) => x >= 0 && x + width <= 1)).toBe(true);
  });

  it('no deja que la ventana se salga del piano', () => {
    component.move(-10);
    expect(component.whites().at(0)).toBe(WHITE_KEYS.at(0));

    component.move(WHITE_KEYS.length * 2);
    expect(component.whites().at(-1)).toBe(WHITE_KEYS.at(-1));
  });

  it('toca con las teclas del ordenador y suelta al levantarlas', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(synth.playing()).toEqual([TYPING_BASE]);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    expect(synth.playing()).toEqual([]);
  });

  it('el espacio es el pedal de sostenido', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(synth.sustain()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(synth.sustain()).toBe(false);
  });

  it('desplaza la ventana con z y x, sin dejar notas colgadas', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(synth.playing()).toHaveLength(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(component.first()).toBe(7);
    expect(synth.playing()).toEqual([]);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
    expect(component.first()).toBe(0);
  });

  it('ignora el teclado mientras se escribe en un campo', () => {
    const input = document.createElement('input');
    document.body.append(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(synth.playing()).toEqual([]);
    input.remove();
  });

  it('mantiene un punto de entrada al teclado aunque la ventana se desplace', () => {
    const visible = () => component.keys().map(({ pitch }) => pitch.midi);

    expect(visible()).toContain(component.tabStop());

    component.move(20);
    expect(visible()).toContain(component.tabStop());

    component.moveFocus(1);
    expect(visible()).toContain(component.tabStop());
  });

  it('centra la ventana en una nota', () => {
    component.centerOn(60);

    expect(component.whites().at(0)).toBeLessThan(60);
    expect(component.whites().at(-1)).toBeGreaterThan(60);
  });
});
