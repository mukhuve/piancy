import { Component, computed, input, output, signal, viewChildren } from '@angular/core';
import { Note } from '../../helpers/note';
import { chromaticMinor } from '../../helpers/scales';
import { Tile } from '../tile/tile';

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
  imports: [Tile],
  templateUrl: './piano.html',
  styleUrls: ['./piano.scss'],
})
export class Piano {
  readonly octaves = input(3);
  readonly base = input(3);

  readonly played = output<PianoNotes>();

  readonly notes = computed(() => chromaticMinor(this.base(), this.octaves()));
  readonly playing = signal<number[]>([]);
  readonly active = computed(() => this.playing().length > 0);

  private readonly tiles = viewChildren(Tile);

  private readonly range = computed<[number, number]>(() => {
    const notes = this.notes();

    return [notes[0].frequency, notes[notes.length - 1].frequency];
  });

  actived({ frequency }: Note, active: boolean) {
    this.playing.update((playing) =>
      active ? [...playing, frequency] : playing.filter((note) => note !== frequency)
    );
    this.played.emit({ notes: this.playing(), range: this.range() });
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
    const tiles = this.tiles().filter((tile) => chord.includes(tile.note().name));

    tiles.forEach((tile) => tile.push(true));
    await wait(duration);
    tiles.forEach((tile) => tile.push(false));
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
