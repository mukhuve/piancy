import {
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
export class TileComponent implements OnInit {
  @Input() tile!: Tile;
  @Input() ctx!: AudioContext;
  name: string = '';

  @HostBinding('class.active')
  active = false;

  pressed = false;

  @Output()
  actived = new EventEmitter<boolean>();

  @HostBinding('attr.sharp')
  get sharp() {
    return this.tile.sharp;
  }

  constructor() {}

  ngOnInit() {
    const { note, sharp } = this.tile;
    this.name = sharp ? '#' : note;
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

    if (active === this.active) return;
    const { key, oscillator } = this.tile;

    if (!oscillator) return;
    if (
      event instanceof KeyboardEvent &&
      (event.key !== key || event.ctrlKey)
    ) {
      return;
    }

    this.active = active;
    if (this.active) {
      oscillator.connect(this.ctx.destination);
    } else {
      oscillator.disconnect(this.ctx.destination);
    }

    this.actived.emit(this.active);
  }
}
