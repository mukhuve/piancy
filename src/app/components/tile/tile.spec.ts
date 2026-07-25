import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Note } from '../../helpers/note';
import { Tile } from './tile';

/** jsdom no trae Web Audio API: lo minimo para que la tecla pueda sonar. */
class FakeOscillator {
  frequency = { value: 0 };
  type = '';
  start = vi.fn();
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeAudioContext {
  destination = {};
  createOscillator() {
    return new FakeOscillator();
  }
}

describe('Tile', () => {
  let component: Tile;
  let fixture: ComponentFixture<Tile>;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({
      imports: [Tile],
    });
    fixture = TestBed.createComponent(Tile);
    fixture.componentRef.setInput('note', new Note('A4', 440, 'q'));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marca la tecla como activa y avisa al pulsarla', () => {
    const avisos: boolean[] = [];
    component.actived.subscribe((active) => avisos.push(active));

    component.push(true);
    fixture.detectChanges();
    expect(component.active()).toBe(true);
    expect(fixture.nativeElement.classList).toContain('active');

    component.push(false);
    fixture.detectChanges();
    expect(component.active()).toBe(false);
    expect(avisos).toEqual([true, false]);
  });

  it('ignora las teclas del teclado que no son la suya', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(component.active()).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    expect(component.active()).toBe(true);
  });
});
