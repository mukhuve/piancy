import { Note } from './note';

const A0 = 27.5; // Hz, la nota mas grave de un piano
const SEMITONE = 2 ** (1 / 12); // temperamento igual

const CHROMATIC_SCALE = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

/** Fila de teclas del ordenador, en el orden en que caen sobre la escala. */
export const PIANO_KEYS = [
  'q', '2', 'w', 'e', '4', 'r', '5', 't', 'y', '7', 'u', '8',
  'i', '9', 'o', 'z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h',
  'n', 'j', 'm',
];

/**
 * Notas de `octaves` octavas cromaticas a partir de la octava `base`. Las teclas
 * del ordenador se reparten por posicion, asi que sobran notas si se piden muchas
 * octavas: esas se quedan sin atajo.
 */
export function chromaticMinor(base = 3, octaves = 2) {
  const notes: Note[] = [];

  for (let octave = base; octave < base + octaves; octave++) {
    const keyBase = (octave - base) * CHROMATIC_SCALE.length;

    CHROMATIC_SCALE.forEach((step, i) => {
      const frequency = A0 * 2 ** octave * SEMITONE ** i;
      const noteOctave = step >= 'C' ? octave + 1 : octave; // la octava cambia en el do
      const key = PIANO_KEYS[keyBase + i] ?? '';

      notes.push(new Note(`${step}${noteOctave}`, frequency, key));
    });
  }

  return notes;
}
