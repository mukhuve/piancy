import { pitchOf } from './pitch';

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

/**
 * Nombre de lo que suena: la nota suelta si es una, el acorde si las notas encajan
 * en alguno probando cada una como fundamental, y si no la lista de notas. Las
 * octavas no cuentan, asi que las inversiones se reconocen igual.
 */
export function chordName(midis: number[]): string {
  if (!midis.length) return '';
  if (midis.length === 1) return pitchOf(midis[0]).name;

  const classes = [...new Set(midis.map((midi) => pitchOf(midi).pitchClass))];

  for (const root of classes) {
    const intervals = classes
      .map((pitchClass) => (pitchClass - root + 12) % 12)
      .sort((a, b) => a - b)
      .join(',');

    if (intervals in CHORDS) return pitchOf(root).step + CHORDS[intervals];
  }

  return classes.map((pitchClass) => pitchOf(pitchClass).step).join(' ');
}
