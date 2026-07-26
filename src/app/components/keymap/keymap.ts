import { Component, computed, inject, input, output } from '@angular/core';
import { WHITE_KEYS } from '../../music/keyboard';
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
    'aria-label': 'Zona del teclado visible',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': 'total - size()',
    '[attr.aria-valuenow]': 'first()',
    '(pointerdown)': 'jump($event)',
    '(pointermove)': 'drag($event)',
  },
})
export class Keymap {
  readonly first = input.required<number>();
  readonly size = input.required<number>();

  readonly moved = output<number>();

  readonly total = WHITE_KEYS.length;

  private readonly synth = inject(Synth);

  /** Una blanca esta encendida si suena ella o la negra que lleva al lado. */
  readonly lit = computed(() => {
    const playing = this.synth.playing();

    return WHITE_KEYS.map((midi) => playing.includes(midi) || playing.includes(midi + 1));
  });

  jump(event: PointerEvent) {
    const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - left) / width));
    const target = Math.round(fraction * this.total) - Math.floor(this.size() / 2);

    this.moved.emit(target - this.first());
  }

  drag(event: PointerEvent) {
    if (event.buttons > 0) this.jump(event);
  }
}
