import { DecimalPipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { Tile } from './tile';

@Component({
  selector: 'app-tile',
  imports: [DecimalPipe],
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  host: {
    '[class.active]': 'active()',
    '[attr.sharp]': 'tile().sharp',
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
export class TileComponent {
  readonly tile = input.required<Tile>();
  readonly actived = output<boolean>();

  readonly active = signal(false);

  private ctx?: AudioContext;
  private oscillator?: OscillatorNode;
  private pressed = false;

  /** El raton arrastrado sobre el teclado toca; hay que saber si el boton sigue abajo. */
  press(event: Event) {
    this.pressed = event.type === 'mousedown';
  }

  touch(event: KeyboardEvent | MouseEvent | TouchEvent) {
    if (event instanceof KeyboardEvent && (event.key !== this.tile().key || event.ctrlKey)) {
      return;
    }

    const start = /start|down/.test(event.type);
    const entering = /enter/.test(event.type) && this.pressed;

    this.push(start || entering);
  }

  push(active = true) {
    if (active === this.active()) return;

    if (active) {
      this.connect();
    } else {
      this.oscillator?.disconnect();
    }

    this.active.set(active);
    this.actived.emit(active);
  }

  /**
   * Un OscillatorNode no se puede reiniciar tras `stop()`, asi que se crea una sola
   * vez y suena o calla conectandose y desconectandose del destino.
   */
  private connect() {
    this.ctx ??= new AudioContext();

    if (!this.oscillator) {
      this.oscillator = this.ctx.createOscillator();
      this.oscillator.frequency.value = this.tile().frequency;
      this.oscillator.type = 'triangle';
      this.oscillator.start();
    }

    this.oscillator.connect(this.ctx.destination);
  }
}
