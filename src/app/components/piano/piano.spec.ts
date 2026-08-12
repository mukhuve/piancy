import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Keyboard } from '../../keyboard/keyboard';
import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Synth } from '../../synth/synth';
import { Piano } from './piano';

/** Con tres octavas la ventana son 22 blancas y el primer do visible es C1. */
const TYPING_BASE = 24;

describe('Piano', () => {
  let component: Piano;
  let fixture: ComponentFixture<Piano>;
  let synth: Synth;
  let keyboard: Keyboard;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [Piano] });
    fixture = TestBed.createComponent(Piano);
    component = fixture.componentInstance;
    synth = TestBed.inject(Synth);
    keyboard = TestBed.inject(Keyboard);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    expect(keyboard.first()).toBe(7);
    expect(synth.playing()).toEqual([]);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
    expect(keyboard.first()).toBe(0);
  });

  it('ignora el teclado mientras se escribe en un campo', () => {
    const input = document.createElement('input');
    document.body.append(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(synth.playing()).toEqual([]);
    input.remove();
  });

  it('mantiene un punto de entrada al teclado aunque la ventana se desplace', () => {
    const visible = () => keyboard.keys().map(({ pitch }) => pitch.midi);

    expect(visible()).toContain(component.tabStop());

    keyboard.move(20);
    fixture.detectChanges();
    expect(visible()).toContain(component.tabStop());

    component.moveFocus(1);
    expect(visible()).toContain(component.tabStop());
  });
});
