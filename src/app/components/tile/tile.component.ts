import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Tile } from './tile';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
  @Input()
  tile!: Tile;
  ctx!: AudioContext;
  oscillator!: OscillatorNode;

  name = '';
  pressed = false;

  @HostBinding('class.active')
  active = false;

  @Output()
  actived = new EventEmitter<boolean>();

  @HostBinding('attr.sharp')
  get sharp() {
    return this.tile.sharp;
  }

  @HostListener('window:touchstart', ['$event'])
  @HostListener('window:mousedown', ['$event'])
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  press(event: MouseEvent) {
    this.pressed = event.type === 'mousedown';
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseout', ['$event'])
  @HostListener('mouseenter', ['$event'])
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])
  touch(event: KeyboardEvent | (MouseEvent & TouchEvent)) {
    const active =
      !!event.type.match(/start|down/) ||
      (!!event.type.match(/enter/) && this.pressed);

    if (
      event instanceof KeyboardEvent &&
      (event.key !== this.tile.key || event.ctrlKey)
    ) {
      return;
    }

    this.push(active);
  }

  sound(active: boolean) {
    if (active === this.active) return;
    if (active) {
      if (!this.ctx) {
        this.ctx = new AudioContext();
      }
      if (!this.oscillator) {
        this.oscillator = this.ctx.createOscillator();
        this.oscillator.frequency.value = this.tile.frequency;
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
    } else if (this.oscillator) {
      this.oscillator.disconnect(this.ctx.destination);
    }

    this.active = active;
    this.actived.emit(this.active);
  }

  push(active = true) {
    this.sound(active);
  }
}
