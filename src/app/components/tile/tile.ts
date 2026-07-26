import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Pitch } from '../../music/pitch';
import { Synth } from '../../synth/synth';

@Component({
  selector: 'app-tile',
  imports: [DecimalPipe],
  templateUrl: './tile.html',
  styleUrls: ['./tile.scss'],
  host: {
    '[class.active]': 'active()',
    '[attr.sharp]': 'pitch().sharp',
    '(window:touchstart)': 'press($event)',
    '(window:touchend)': 'press($event)',
    '(window:mousedown)': 'press($event)',
    '(window:mouseup)': 'press($event)',
    '(mousedown)': 'touch($event)',
    '(mouseup)': 'touch($event)',
    '(mouseout)': 'touch($event)',
    '(mouseenter)': 'touch($event)',
    '(window:keydown)': 'touch($event)',
    '(window:keyup)': 'touch($event)',
  },
})
export class Tile {
  readonly pitch = input.required<Pitch>();
  readonly shortcut = input('');

  private readonly synth = inject(Synth);

  readonly active = computed(() => this.synth.playing().includes(this.pitch().midi));

  private pressed = false;

  /** El raton arrastrado sobre el teclado toca; hay que saber si el boton sigue abajo. */
  press(event: Event) {
    this.pressed = event.type === 'mousedown';
  }

  touch(event: KeyboardEvent | MouseEvent | TouchEvent) {
    if (event instanceof KeyboardEvent && (event.key !== this.shortcut() || event.ctrlKey)) {
      return;
    }

    const start = /start|down/.test(event.type);
    const entering = /enter/.test(event.type) && this.pressed;

    this.push(start || entering);
  }

  push(active = true) {
    if (active === this.active()) return;

    const { midi } = this.pitch();

    if (active) {
      this.synth.noteOn(midi);
    } else {
      this.synth.noteOff(midi);
    }
  }
}
