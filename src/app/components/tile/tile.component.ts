import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  EventEmitter,
  Host,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tile } from './tile';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent implements OnInit, AfterViewInit {
  @Input() tile!: Tile;
  ctx: AudioContext = new AudioContext();
  oscillator!: OscillatorNode;
  name: string = '';
  pressed = false;

  @HostBinding('class.active')
  active = false;

  @Output()
  actived = new EventEmitter<boolean>();

  @HostBinding('attr.sharp')
  get sharp() {
    return this.tile.sharp;
  }

  constructor() {}

  ngAfterViewInit() {}

  ngOnInit() {
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.frequency.value = this.tile.frequency;
    this.ctx.resume();
    this.oscillator.start();
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

  push(active = true) {
    if (active === this.active) return;
    if (!this.oscillator) return;

    this.active = active;
    if (this.active) {
      this.oscillator.connect(this.ctx.destination);
    } else {
      this.oscillator.disconnect(this.ctx.destination);
    }

    this.actived.emit(this.active);
  }
}
