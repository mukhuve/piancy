import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tile } from './tile';
import { TileComponent } from './tile.component';

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

describe('TileComponent', () => {
  let component: TileComponent;
  let fixture: ComponentFixture<TileComponent>;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({
      imports: [TileComponent],
    });
    fixture = TestBed.createComponent(TileComponent);
    fixture.componentRef.setInput('tile', new Tile('A4', 440, 'q'));
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
