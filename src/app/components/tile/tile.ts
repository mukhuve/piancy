import { Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { colorOf, toCss } from '../../music/color';
import { Synth } from '../../synth/synth';
import { PianoKey } from '../piano/piano';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.html',
  styleUrls: ['./tile.scss'],
  host: {
    role: 'button',
    '[class.black]': 'key().black',
    '[class.active]': 'active()',
    '[style.left.%]': 'key().x * 100',
    '[style.width.%]': 'key().width * 100',
    '[attr.aria-label]': 'key().pitch.name',
    '[attr.aria-pressed]': 'active()',
    '[attr.tabindex]': 'tabbable() ? 0 : -1',
    '[style.--key-color]': 'color()',
    '(pointerdown)': 'start()',
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

  readonly active = computed(() => this.synth.playing().includes(this.key().pitch.midi));
  readonly color = computed(() => toCss(colorOf(this.key().pitch.midi)));

  focus() {
    this.host.nativeElement.focus();
  }

  start() {
    this.focus();
    this.focused.emit(this.key().pitch.midi);
    this.press();
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
