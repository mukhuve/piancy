import { Injectable, computed, signal } from '@angular/core';
import { NOTE_NAMES, pitchClassOf } from './pitch';

/** Semitonos de cada grado sobre la tonica. */
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
} satisfies Record<string, number[]>;

export type ScaleMode = keyof typeof SCALES;

export const SCALE_MODES = Object.keys(SCALES) as ScaleMode[];

export const DEGREE_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Grado de la nota dentro de la escala, o null si se sale de ella. */
export function degreeOf(midi: number, root: number, mode: ScaleMode) {
  const degree = SCALES[mode].indexOf(pitchClassOf(midi - root));

  return degree < 0 ? null : degree;
}

/** La tonalidad en la que se esta tocando, que decide los grados de cada nota. */
@Injectable({ providedIn: 'root' })
export class Tonality {
  readonly root = signal(0);
  readonly mode = signal<ScaleMode>('major');

  readonly name = computed(() => `${NOTE_NAMES[this.root()]} ${this.mode()}`);

  degree(midi: number) {
    return degreeOf(midi, this.root(), this.mode());
  }

  label(midi: number) {
    const degree = this.degree(midi);

    return degree === null ? '' : DEGREE_LABELS[degree];
  }
}
