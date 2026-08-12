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
    '(keydown.enter)': 'start()',
    '(keyup.enter)': 'release()',
    '(keydown.arrowright)': 'moved.emit(1)',
    '(keydown.arrowleft)': 'moved.emit(-1)',
    '(blur)': 'release()',
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

  press() {
    this.synth.noteOn(this.key().pitch.midi);
  }

  release() {
    this.synth.noteOff(this.key().pitch.midi);
  }
}
