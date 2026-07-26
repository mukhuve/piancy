import { Component, computed, inject, input } from '@angular/core';
import { PIANO_KEYS } from '../../input/computer-keys';
import { pitchesBetween } from '../../music/pitch';
import { Synth } from '../../synth/synth';
import { Tile } from '../tile/tile';

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
  /** Rango que se muestra, en MIDI: por defecto de A3 a G#7. */
  readonly from = input(57);
  readonly to = input(104);

  private readonly synth = inject(Synth);

  readonly keys = computed(() =>
    pitchesBetween(this.from(), this.to()).map((pitch, i) => ({
      pitch,
      shortcut: PIANO_KEYS[i] ?? '',
    }))
  );

  async play() {
    for (const group of SONG.replace(/\s/g, '').split(',')) {
      const [chord, seconds] = group.split(':');

      await this.push(chord, +seconds * 1000 - REST);
      await wait(REST);
    }
  }

  /** Pulsa las teclas de una nota o acorde durante `duration` ms. */
  private async push(chord: string, duration: number) {
    const names = chord.split('+');
    const midis = this.keys()
      .filter(({ pitch }) => names.includes(pitch.name))
      .map(({ pitch }) => pitch.midi);

    midis.forEach((midi) => this.synth.noteOn(midi));
    await wait(duration);
    midis.forEach((midi) => this.synth.noteOff(midi));
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
