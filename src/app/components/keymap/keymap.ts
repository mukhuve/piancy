import { Component, computed, inject, input, output } from '@angular/core';
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
