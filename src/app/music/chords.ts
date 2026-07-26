import { pitchClassOf, pitchOf } from './pitch';

/**
 * Acordes por sus intervalos en semitonos desde la fundamental. La cadena vacia es
 * la triada mayor, que se nombra solo con su nota.
 */
const CHORDS: Readonly<Record<string, string>> = {
  '0,4,7': '',
  '0,3,7': 'm',
  '0,3,6': 'dim',
  '0,4,8': 'aug',
  '0,5,7': 'sus4',
  '0,2,7': 'sus2',
  '0,4,7,11': 'maj7',
  '0,3,7,10': 'm7',
  '0,4,7,10': '7',
  '0,3,6,9': 'dim7',
  '0,4,7,9': '6',
  '0,2,4,7': 'add9',
  '0,7': '5',
  '0,4': '3',
  '0,3': 'm3',
};

/** Lo que suena: como se llama y cual es su nota fundamental. */
export interface Chord {
  readonly name: string;
  /** La nota que da nombre a lo que suena, la mas grave de su clase. */
  readonly root?: number;
}

/**
 * Reconoce lo que suena probando cada nota como fundamental. Las octavas no
 * cuentan, asi que las inversiones se reconocen igual; la fundamental que se
 * devuelve es la nota real mas grave de esa clase, para poder darle su color.
 */
export function chordOf(midis: readonly number[]): Chord {
  if (!midis.length) return { name: '' };

  const lowest = (pitchClass: number) =>
    Math.min(...midis.filter((midi) => pitchClassOf(midi) === pitchClass));

  if (midis.length === 1) return { name: pitchOf(midis[0]).name, root: midis[0] };

  const classes = [...new Set(midis.map(pitchClassOf))];

  for (const root of classes) {
    const intervals = classes
      .map((pitchClass) => (pitchClass - root + 12) % 12)
      .sort((a, b) => a - b)
      .join(',');

    if (intervals in CHORDS) {
      return { name: pitchOf(root).step + CHORDS[intervals], root: lowest(root) };
    }
  }

  return { name: classes.map((pitchClass) => pitchOf(pitchClass).step).join(' ') };
}

export function chordName(midis: readonly number[]) {
  return chordOf(midis).name;
}
