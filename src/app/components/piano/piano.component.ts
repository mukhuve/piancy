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
  @Input() octaves = 3;
  @Input() base = 3;

  notes: number[] = [];

  @Output()
  output = new EventEmitter<{ notes: number[]; piano: PianoComponent }>();

  @ViewChildren(TileComponent)
  tileList: TileComponent[] = [];

  title = 'piancy';
  tiles!: Tile[];

  /* 
  G3:0.6, G3+D4:0.15, A#4:0.15, G3+G4:0.15, C4:0.6, G3:0.15, G3+D4:0.15, D4:0.6, G2:0.25,
  C4:0.3, G3:0.3, A#4:0.3, G3+G4:0.3, C4:0.6, G3:0.15, A#4:0.15, G3:0.6, G2:0.25,
  D4:0.6, C4+G4:0.15, G3+D4:0.15, A#4:0.6, G3+G4:0.15, A#4:0.15, G3+D4:0.3, G3:0.3, G2:0.25,
  G3:0.6, G3+D4:0.15, A#4:0.15, G3+G4:0.15, C4:0.6, G3:0.15, G3+D4:0.15, D4:0.6, G2:0.25,
  C4:0.3, G3:0.3, A#4:0.3, G3+G4:0.3, C4:0.6, G3:0.15, A#4:0.15, G3:0.6, G2:0.25,
  D4:0.6, C4+G4:0.15, G3+D4:0.15, A#4:0.6, G3+G4:0.15, A#4:0.15, G3+D4:0.3, G3:0.3, G2:0.25  
   */

  // song = `C3:0.5,C3:0.5,D3:1,C3:0.5,F3:0.5,E3:1,C3:0.5,C3:0.5,D3:1,C3:0.5,G3:0.5,F3:1,C3:0.5,C3:0.5,C4:1,A3:0.5,F3:0.5,E3:1,D3:0.5,A3:0.5,A3:0.5,G3:1,F3:0.5,G3:0.5,F3:2`;
  // crazy train intro - ozzy osbourne
  song = `
    F#3:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4:0.25,F#3:0.25,C#4:0.25,F#3:0.25,B3:0.25,A3:0.25,G#3:0.25,A3:0.25,B3:0.25,A3:0.25,G#3:0.25,E3:0.25,
    F#3:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4+D3+A3:1,E4+E3+B3:3  
  `;

  get sequence() {
    return this.song
      .replace(/\s|\d|:|\./g, '')
      .replace(/,,/g, ',')
      .replace(/,/g, '•');
  }

  get frequencyRange() {
    const startTile = this.tiles.at(0);
    const endTile = this.tiles.at(-1);

    return [startTile?.frequency, endTile?.frequency];
  }

  ngOnInit() {
    this.tiles = chromaticMinor(this.base, this.octaves);
  }

  get active() {
    return this.notes.length > 0;
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
      const rest = 10;
      await this.push(note, duration - rest);
      await new Promise((resolve) => setTimeout(resolve, rest));
    }
  }

  // @HostListener('window:keyup', ['$event'])
  changeBase(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.base++;
    } else if (event.key === 'ArrowDown') {
      this.base--;
    }
    this.tiles = chromaticMinor(this.base, this.octaves);
  }
}
