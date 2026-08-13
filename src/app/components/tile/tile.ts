import { Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { PianoKey } from '../../keyboard/keyboard';
import { colorOf, isPale, toCss } from '../../music/color';
import { Tonality } from '../../music/scales';
import { Settings } from '../../settings';
import { Synth } from '../../synth/synth';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.html',
  styleUrls: ['./tile.scss'],
  host: {
    role: 'button',
    '[class.black]': 'key().black',
    '[class.active]': 'active()',
    '[class.pale]': 'pale()',
    '[class.outside]': '!degree()',
    '[class.plain]': '!settings.colour()',
    '[style.left.%]': 'key().x * 100',
    '[style.width.%]': 'key().width * 100',
    '[attr.aria-label]': 'key().pitch.name',
    '[attr.aria-pressed]': 'active()',
    '[attr.tabindex]': 'tabbable() ? 0 : -1',
    '[style.--key-color]': 'color()',
    '(pointerdown)': 'start($event)',
    '(pointerenter)': 'drag($event)',
    '(pointerup)': 'release()',
    '(pointerleave)': 'release()',
    /* el sistema puede quedarse con el dedo a media nota —un gesto suyo, una llamada—
       y entonces no llega ningun `pointerup` que la suelte */
    '(pointercancel)': 'release()',
    '(keydown.enter)': 'type()',
    '(keyup.enter)': 'untype()',
    '(keydown.arrowright)': 'moved.emit(1)',
    '(keydown.arrowleft)': 'moved.emit(-1)',
    '(blur)': 'untype()',
  },
})
export class Tile {
  readonly key = input.required<PianoKey>();
  /** Solo una tecla esta en el orden de tabulacion: las flechas mueven el foco. */
  readonly tabbable = input(false);

  readonly focused = output<number>();
  readonly moved = output<number>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly synth = inject(Synth);
  private readonly tonality = inject(Tonality);

  protected readonly settings = inject(Settings);

  readonly active = computed(() => this.synth.playing().includes(this.key().pitch.midi));
  readonly degree = computed(() => this.tonality.label(this.key().pitch.midi));

  private readonly rgb = computed(() => colorOf(this.key().pitch.midi));

  readonly color = computed(() => toCss(this.rgb()));
  /** Sobre los colores claros el texto en claro no se lee; hay que darle la vuelta. */
  readonly pale = computed(() => isPale(this.rgb()));

  /** La tecla suena porque se aprieta Enter, y no porque haya un dedo encima. */
  private typed = false;

  focus() {
    this.host.nativeElement.focus();
  }

  start(event?: PointerEvent) {
    this.releaseCapture(event);
    this.focus();
    this.focused.emit(this.key().pitch.midi);
    this.press();
  }

  /**
   * Al tocar con el dedo, la tecla se queda con el puntero: todo lo que venga despues
   * le llega a ella y no entra en ninguna otra, asi que arrastrar por el teclado no
   * suena. Soltandolo, el dedo va abriendo y cerrando teclas a su paso, que es el
   * glissando y la unica forma de tocar rapido en una pantalla.
   */
  private releaseCapture(event?: PointerEvent) {
    const host = this.host.nativeElement;

    if (!event || !host.hasPointerCapture?.(event.pointerId)) return;

    host.releasePointerCapture(event.pointerId);
  }

  /** Arrastrar el puntero por el teclado toca, mientras siga pulsado. */
  drag(event: PointerEvent) {
    if (event.buttons > 0) this.press();
  }

  /** Con Enter la tecla suena mientras se mantiene, como si se pulsara. */
  type() {
    this.typed = true;
    this.start();
  }

  /**
   * Si el foco se va a otra parte con Enter apretado no llega ningun `keyup` y la nota
   * se quedaria colgada, asi que el foco perdido tambien la suelta. Pero solo si la
   * puso el teclado: tocar un acorde en una pantalla es enfocar una tecla tras otra, y
   * cada una le quitaba el foco a la anterior y con el la nota, de modo que solo
   * llegaba a sonar la ultima. El dedo y el raton ya tienen su `pointerup` y su
   * `pointerleave`, que llegan siempre.
   */
  untype() {
    if (!this.typed) return;

    this.typed = false;
    this.release();
  }

  press() {
    this.synth.noteOn(this.key().pitch.midi);
  }

  release() {
    this.synth.noteOff(this.key().pitch.midi);
  }
}
