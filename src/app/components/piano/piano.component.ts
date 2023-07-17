import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TileComponent } from '../tile/tile.component';
import { CHROMATIC_SCALE, PIANO_KEYS } from './piano.constants';
import { Tile } from '../tile/tile';

@Component({
  selector: 'app-piano',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss'],
})
export class PianoComponent {
  @Input() octaves = 2;
  @Input() base = 3;

  notes: number[] = [];

  @Output()
  output = new EventEmitter<number[]>();

  title = 'piancy';
  ctx!: AudioContext;
  tiles!: any[];

  constructor() {
    this.ctx = new window.AudioContext();
    this.tiles = this.chromaticScale();
  }

  ngAfterViewInit() {
    this.ctx.resume();
  }

  actived(tile: Tile, active: boolean) {
    const frequency = tile.frequency;
    if (active) {
      this.notes.push(frequency);
    } else {
      this.notes = this.notes.filter((note) => note !== frequency);
    }
    this.output.emit(this.notes);
  }

  // @HostListener('window:keyup', ['$event'])
  changeBase(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.base++;
    } else if (event.key === 'ArrowDown') {
      this.base--;
    }
    this.tiles = this.chromaticScale();
  }

  chromaticScale() {
    const ratio = 2 ** (1 / 12); // Ratio to calculate the frequencies of each semitone
    const frequencies = [];
    const A0 = 27.5;
    const [start, end] = [this.base, this.base + this.octaves];

    for (let octave = start; octave <= end; octave++) {
      const scale = CHROMATIC_SCALE;
      const keyBase = (octave - start) * scale.length;
      for (let [i, name] of CHROMATIC_SCALE.entries()) {
        const base = A0 * 2 ** octave;
        const frequency = base * ratio ** i;
        const key = PIANO_KEYS[keyBase + i] || '';
        const note = `${name}${octave}`;
        const sharp = name.includes('#');
        const oscillator = this.ctx.createOscillator();

        oscillator.frequency.value = frequency;
        oscillator.start();

        frequencies.push({ key, frequency, note, sharp, oscillator });
      }
    }
    console.log(frequencies);
    return frequencies;
  }
}
