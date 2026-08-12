import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PianoKey } from '../../keyboard/keyboard';
import { layout } from '../../music/keyboard';
import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Synth } from '../../synth/synth';
import { Tile } from './tile';

const [C4] = layout([60, 62]);
const KEY: PianoKey = { ...C4, shortcut: 'a' };

describe('Tile', () => {
  let component: Tile;
  let fixture: ComponentFixture<Tile>;
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [Tile] });
    fixture = TestBed.createComponent(Tile);
    fixture.componentRef.setInput('key', KEY);
    component = fixture.componentInstance;
    synth = TestBed.inject(Synth);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('suena mientras esta pulsada y se pinta con el color de su nota', () => {
    component.press();
    fixture.detectChanges();

    expect(synth.playing()).toEqual([60]);
    expect(fixture.nativeElement.classList).toContain('active');
    expect(fixture.nativeElement.style.getPropertyValue('--key-color')).toBe('rgb(0, 255, 184)');

    component.release();
    fixture.detectChanges();
    expect(synth.playing()).toEqual([]);
  });

  it('se coloca por la geometria que recibe', () => {
    expect(fixture.nativeElement.style.left).toBe('0%');
    expect(fixture.nativeElement.style.width).toBe('50%');
  });

  it('el arrastre solo toca si el puntero sigue pulsado', () => {
    component.drag(new PointerEvent('pointerenter', { buttons: 0 }));
    expect(synth.playing()).toEqual([]);

    component.drag(new PointerEvent('pointerenter', { buttons: 1 }));
    expect(synth.playing()).toEqual([60]);
  });

  it('se anuncia como boton pulsable con el nombre de la nota', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('button');
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('C4');
    expect(fixture.nativeElement.getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('-1');

    fixture.componentRef.setInput('tabbable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
  });
});
