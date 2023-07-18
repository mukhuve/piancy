import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChildren,
} from '@angular/core';
import { chromaticMinor } from 'src/app/helpers/scales';
import { Tile } from '../tile/tile';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-piano',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss'],
})
export class PianoComponent implements OnInit {
  @Input() octaves = 2;
  @Input() base = 3;

  notes: number[] = [];

  @Output()
  output = new EventEmitter<{ notes: number[]; piano: PianoComponent }>();

  @ViewChildren(TileComponent)
  tileList: TileComponent[] = [];

  title = 'piancy';
  tiles!: Tile[];

  song = `
  G3:0.6, G3+D4:0.15, A#4:0.15, G3+G4:0.15, C4:0.6, G3:0.15, G3+D4:0.15, D4:0.6, G2:0.25,
  C4:0.3, G3:0.3, A#4:0.3, G3+G4:0.3, C4:0.6, G3:0.15, A#4:0.15, G3:0.6, G2:0.25,
  D4:0.6, C4+G4:0.15, G3+D4:0.15, A#4:0.6, G3+G4:0.15, A#4:0.15, G3+D4:0.3, G3:0.3, G2:0.25,
  G3:0.6, G3+D4:0.15, A#4:0.15, G3+G4:0.15, C4:0.6, G3:0.15, G3+D4:0.15, D4:0.6, G2:0.25,
  C4:0.3, G3:0.3, A#4:0.3, G3+G4:0.3, C4:0.6, G3:0.15, A#4:0.15, G3:0.6, G2:0.25,
  D4:0.6, C4+G4:0.15, G3+D4:0.15, A#4:0.6, G3+G4:0.15, A#4:0.15, G3+D4:0.3, G3:0.3, G2:0.25  
  `;

  get frequencyRange() {
    const A0 = 27.5;
    const start = A0 * 2 ** this.base;
    const end = A0 * 2 ** (this.base + this.octaves);

    return [start, end];
  }

  ngOnInit() {
    this.tiles = chromaticMinor();
  }

  actived(tile: Tile, active: boolean) {
    const frequency = tile.frequency;
    if (active) {
      this.notes.push(frequency);
    } else {
      this.notes = this.notes.filter((note) => note !== frequency);
    }
    this.output.emit({ notes: this.notes, piano: this });
  }

  async push(note: string, duration: number) {
    const chord = note.split('+');
    const chordTile = this.tileList.filter(({ tile }) =>
      chord.includes(tile.note)
    );

    chordTile.forEach((tile) => tile.push(true));
    return new Promise((resolve) => {
      setTimeout(() => {
        chordTile.forEach((tile) => tile.push(false));
        resolve(true);
      }, duration);
    });
  }

  async play() {
    const track = this.song
      .replace(/\s/g, '')
      .split(',')
      .map((group) => {
        const [note, seconds] = group.replace(' ', '').split(':');
        const miliseconds = +seconds * 1000;
        return { note, duration: +miliseconds };
      });

    for (const { note, duration } of track) {
      if (!note) {
        await new Promise((resolve) => setTimeout(resolve, duration));
        continue;
      }
      await this.push(note, duration);
    }
  }

  // @HostListener('window:keyup', ['$event'])
  changeBase(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.base++;
    } else if (event.key === 'ArrowDown') {
      this.base--;
    }
    this.tiles = chromaticMinor();
  }
}
