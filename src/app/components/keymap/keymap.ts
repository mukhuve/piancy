import { Component, ElementRef, computed, inject, input, output, viewChildren } from '@angular/core';
import { I18n } from '../../i18n/i18n';
import { WHITE_KEYS } from '../../music/keyboard';
import { pitchOf } from '../../music/pitch';
import { Synth } from '../../synth/synth';

/**
 * El piano entero en miniatura, con la ventana visible marcada encima. Sirve para
 * saber donde esta uno y para saltar a otra zona pinchando o arrastrando.
 */
@Component({
  selector: 'app-keymap',
  templateUrl: './keymap.html',
  styleUrls: ['./keymap.scss'],
  host: {
    role: 'slider',
    tabindex: '0',
    '[attr.aria-label]': 't("piano.range")',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'total - size()',
    '[attr.aria-valuenow]': 'first()',
    '(pointerdown)': 'jump($event)',
    '(pointermove)': 'drag($event)',
    '(keydown.arrowleft)': 'moved.emit(-1)',
    '(keydown.arrowright)': 'moved.emit(1)',
    '(keydown.home)': 'moved.emit(-total)',
    '(keydown.end)': 'moved.emit(total)',
  },
})
export class Keymap {
  readonly first = input.required<number>();
  readonly size = input.required<number>();

  readonly moved = output<number>();

  readonly total = WHITE_KEYS.length;

  protected readonly t = inject(I18n).t;

  private readonly synth = inject(Synth);
  private readonly ticks = viewChildren<ElementRef<HTMLElement>>('tick');

  /**
   * Una blanca se enciende si suena ella o la negra que cuelga a su derecha. Hay que
   * mirar que la siguiente nota sea negra: entre mi y fa, y entre si y do, la de al
   * lado es otra blanca y encenderia las dos.
   */
  readonly lit = computed(() => {
    const playing = this.synth.playing();

    return WHITE_KEYS.map(
      (midi) =>
        playing.includes(midi) || (pitchOf(midi + 1).sharp && playing.includes(midi + 1))
    );
  });

  /** Salta a la blanca que se ha tocado, dejandola lo mas centrada que se pueda. */
  jump(event: PointerEvent) {
    const white = this.whiteAt(event);

    if (white === undefined) return;

    this.moved.emit(white - Math.floor(this.size() / 2) - this.first());
  }

  drag(event: PointerEvent) {
    if (event.buttons > 0) this.jump(event);
  }

  /**
   * Sobre que marca cae el puntero. Se proyecta el toque en la recta que va del centro
   * de la primera al de la ultima, en vez de restarle a su `x` el borde de la caja:
   * en un movil de pie la app se dibuja girada un cuarto de vuelta, y entonces la caja
   * en pantalla ya viene girada con ella y el piano se repartia por el eje equivocado.
   * `offsetX`, que si va en coordenadas del elemento, tampoco vale: Chrome lo devuelve
   * a mitad de escala en cuanto hay una rotacion de por medio. Las marcas, en cambio,
   * estan puestas a lo largo del mapa: la recta que las une dice por donde corre,
   * gire lo que gire.
   */
  private whiteAt({ clientX, clientY }: PointerEvent) {
    const ticks = this.ticks();

    if (ticks.length < 2) return undefined;

    const from = centreOf(ticks[0]);
    const to = centreOf(ticks[ticks.length - 1]);
    const run = { x: to.x - from.x, y: to.y - from.y };
    const span = run.x * run.x + run.y * run.y;

    if (!span) return undefined;

    const along = ((clientX - from.x) * run.x + (clientY - from.y) * run.y) / span;

    return Math.round(Math.max(0, Math.min(1, along)) * (this.total - 1));
  }
}

/** El centro de una marca en pantalla, gire como gire lo que la contiene. */
function centreOf({ nativeElement }: ElementRef<HTMLElement>) {
  const { left, top, width, height } = nativeElement.getBoundingClientRect();

  return { x: left + width / 2, y: top + height / 2 };
}
