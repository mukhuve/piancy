import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Keymap } from './keymap';

/** Una ventana de 22 blancas, la de tres octavas. */
const SIZE = 22;
/** Lo que mide una marca en el reparto de mentira de abajo. */
const TICK = 10;

/**
 * jsdom no coloca nada: todas las cajas miden cero. Se le pone al mapa un reparto a
 * mano, y `turned` lo pone de lado —que es como se dibuja en un movil de pie— para
 * comprobar que lo que se mide es el mapa y no la pantalla.
 */
function layOutTicks(fixture: ComponentFixture<Keymap>, turned = false) {
  const ticks = [...fixture.nativeElement.querySelectorAll('.tick')] as HTMLElement[];

  ticks.forEach((tick, i) => {
    const along = i * TICK;

    tick.getBoundingClientRect = () =>
      ({
        left: turned ? 0 : along,
        top: turned ? along : 0,
        width: turned ? TICK : TICK,
        height: TICK,
      }) as DOMRect;
  });

  return ticks.length;
}

/** Un toque en la fraccion pedida del mapa, en coordenadas de pantalla. */
function tapAt(fraction: number, total: number, turned = false) {
  const along = fraction * (total - 1) * TICK + TICK / 2;

  return {
    clientX: turned ? TICK / 2 : along,
    clientY: turned ? along : TICK / 2,
  } as PointerEvent;
}

describe('Keymap', () => {
  let fixture: ComponentFixture<Keymap>;
  let component: Keymap;
  let moves: number[];

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [Keymap] });
    fixture = TestBed.createComponent(Keymap);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('first', 0);
    fixture.componentRef.setInput('size', SIZE);
    fixture.detectChanges();

    moves = [];
    component.moved.subscribe((step) => moves.push(step));
  });

  it('deja centrada la blanca que se toca, sin salirse por los bordes', () => {
    const total = layOutTicks(fixture);

    component.jump(tapAt(0, total));
    component.jump(tapAt(0.5, total));
    component.jump(tapAt(1, total));

    const middle = Math.round((total - 1) / 2);

    // el desplazamiento lo acota luego el teclado; aqui se pide lo que se ha tocado
    expect(moves).toEqual([-SIZE / 2, middle - SIZE / 2, total - 1 - SIZE / 2]);
  });

  it('mide sobre el mapa, no sobre la pantalla: girado dice lo mismo', () => {
    const total = layOutTicks(fixture, true);

    component.jump(tapAt(0.5, total, true));

    expect(moves).toEqual([Math.round((total - 1) / 2) - SIZE / 2]);
  });
});
