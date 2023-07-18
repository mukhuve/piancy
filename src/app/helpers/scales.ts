import {
  CHROMATIC_SCALE,
  PIANO_KEYS,
} from '../components/piano/piano.constants';
import { Tile } from '../components/tile/tile';

export function chromaticMinor(base = 3, octaves = 2) {
  const A0 = 27.5;
  const ratio = 2 ** (1 / 12);
  const frequencies: Tile[] = [];
  const [start, end] = [base, base + octaves - 1];
  const scale = CHROMATIC_SCALE;

  for (let octave = start; octave <= end; octave++) {
    const keyBase = (octave - start) * scale.length;
    for (const [i, name] of CHROMATIC_SCALE.entries()) {
      const base = A0 * 2 ** octave;
      const frequency = base * ratio ** i;
      const key = PIANO_KEYS[keyBase + i] || '';
      const noteOctave = name >= 'C' ? octave + 1 : octave;
      const note = `${name}${noteOctave}`;
      const tile = new Tile(note, frequency, key);

      frequencies.push(tile);
    }
  }

  return frequencies;
}

export function chromaticMajor(base = 3, octaves = 2) {
  // TODO: implement this function to return a chromatic major scale
}
