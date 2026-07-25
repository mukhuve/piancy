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

  press(event: Event) {
    this.pressed = event.type === 'mousedown';
  }

  touch(event: KeyboardEvent | MouseEvent | TouchEvent) {
    const active =
      !!event.type.match(/start|down/) ||
      (!!event.type.match(/enter/) && this.pressed);

    if (
      event instanceof KeyboardEvent &&
      (event.key !== this.tile().key || event.ctrlKey)
    ) {
      return;
    }

    this.push(active);
  }

  sound(active: boolean) {
    if (active === this.active()) return;
    if (active) {
      this.ctx ??= new AudioContext();
      if (!this.oscillator) {
        this.oscillator = this.ctx.createOscillator();
        this.oscillator.frequency.value = this.tile().frequency;
        // this.oscillator.type = 'sine';
        // this.oscillator.type = 'square';
        this.oscillator.type = 'triangle';
        // this.oscillator.type = 'sawtooth';
        // this.oscillator.setPeriodicWave(
        //   this.ctx.createPeriodicWave(
        //     new Float32Array([0, 0.2, 0.4, 0.6, 0.8, 1]),
        //     new Float32Array([0, 0, 0, 0, 0, 0]),
        //     // { disableNormalization: true }
        //   )
        // );

        this.oscillator.start();
      }

      this.oscillator.connect(this.ctx.destination);
    } else if (this.oscillator && this.ctx) {
      this.oscillator.disconnect(this.ctx.destination);
    }

    this.active.set(active);
    this.actived.emit(active);
  }

  push(active = true) {
    this.sound(active);
  }
}
