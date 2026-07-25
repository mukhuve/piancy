import { Component, computed, input, output, signal, viewChildren } from '@angular/core';
import { chromaticMinor } from '../../helpers/scales';
import { Tile } from '../tile/tile';
import { TileComponent } from '../tile/tile.component';

/** Notas sonando ahora y el rango de frecuencias del teclado que las produce. */
export interface PianoNotes {
  notes: number[];
  range: [number, number];
}

/** Intro de Crazy Train. Formato `NOTA:segundos`, acordes con `+`. */
const SONG = `
  F#3:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4:0.25,F#3:0.25,C#4:0.25,F#3:0.25,B3:0.25,A3:0.25,G#3:0.25,A3:0.25,B3:0.25,A3:0.25,G#3:0.25,E3:0.25,
  F#3:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4:0.25,F#3:0.25,C#4:0.25,F#3:0.25,D4+D3+A3:1,E4+E3+B3:3
`;

const REST = 10; // ms de silencio entre notas, para que se distingan las repetidas

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

  readonly tiles = computed(() => chromaticMinor(this.base(), this.octaves()));
  readonly notes = signal<number[]>([]);
  readonly active = computed(() => this.notes().length > 0);

  private readonly tileList = viewChildren(TileComponent);

  private readonly range = computed<[number, number]>(() => {
    const tiles = this.tiles();

    return [tiles[0].frequency, tiles[tiles.length - 1].frequency];
  });

  actived({ frequency }: Tile, active: boolean) {
    this.notes.update((notes) =>
      active ? [...notes, frequency] : notes.filter((note) => note !== frequency)
    );
    this.played.emit({ notes: this.notes(), range: this.range() });
  }

  async play() {
    for (const group of SONG.replace(/\s/g, '').split(',')) {
      const [note, seconds] = group.split(':');
      const duration = +seconds * 1000;

      await this.push(note, duration - REST);
      await wait(REST);
    }
  }

  /** Pulsa las teclas de una nota o acorde durante `duration` ms. */
  private async push(note: string, duration: number) {
    const chord = note.split('+');
    const tiles = this.tileList().filter((tile) => chord.includes(tile.tile().note));

    tiles.forEach((tile) => tile.push(true));
    await wait(duration);
    tiles.forEach((tile) => tile.push(false));
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
