import { Component, computed, input, output, signal, viewChildren } from '@angular/core';
import { chromaticMinor } from '../../helpers/scales';
import { Tile } from '../tile/tile';
import { TileComponent } from '../tile/tile.component';

/** Notas sonando ahora y el rango de frecuencias del teclado que las produce. */
export interface PianoNotes {
  notes: number[];
  range: [number, number];
}

@Component({
  selector: 'app-piano',
  imports: [TileComponent],
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss'],
})
export class PianoComponent {
  readonly octaves = input(3);
  readonly base = input(3);

  readonly played = output<PianoNotes>();

  readonly tileList = viewChildren(TileComponent);

  readonly tiles = computed(() => chromaticMinor(this.base(), this.octaves()));
  readonly notes = signal<number[]>([]);
  readonly active = computed(() => this.notes().length > 0);

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

  readonly frequencyRange = computed<[number, number]>(() => {
    const tiles = this.tiles();
    return [tiles[0].frequency, tiles[tiles.length - 1].frequency];
  });

  actived(tile: Tile, active: boolean) {
    const frequency = tile.frequency;
    this.notes.update((notes) =>
      active ? [...notes, frequency] : notes.filter((note) => note !== frequency)
    );
    this.played.emit({ notes: this.notes(), range: this.frequencyRange() });
  }

  async push(note: string, duration: number) {
    const chord = note.split('+');
    const chordTile = this.tileList().filter((tile) =>
      chord.includes(tile.tile().note)
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
}
