const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMITONES = NAMES.length;
const A4_MIDI = 69;
const A4_HZ = 440;

/** Las 88 teclas de un piano acustico: de A0 a C8. */
export const PIANO_RANGE = [21, 108] as const;

/** Una nota. Su identidad es el numero MIDI; todo lo demas se deriva de el. */
export interface Pitch {
  readonly midi: number;
  /** Nombre completo con octava: `C#4`. */
  readonly name: string;
  /** Nombre sin octava: `C#`. */
  readonly step: string;
  /** Posicion dentro de la octava, 0 = do. */
  readonly pitchClass: number;
  readonly octave: number;
  readonly frequency: number;
  readonly sharp: boolean;
}

/** Temperamento igual desde el la de referencia: A4 = 440 Hz. */
export function frequencyOf(midi: number) {
  return A4_HZ * 2 ** ((midi - A4_MIDI) / SEMITONES);
}

export function pitchClassOf(midi: number) {
  return ((midi % SEMITONES) + SEMITONES) % SEMITONES;
}

/** La octava cambia en el do, no en el la: C4 es el do central (MIDI 60). */
export function octaveOf(midi: number) {
  return Math.floor(midi / SEMITONES) - 1;
}

export function pitchOf(midi: number): Pitch {
  const step = NAMES[pitchClassOf(midi)];
  const octave = octaveOf(midi);

  return {
    midi,
    step,
    octave,
    name: `${step}${octave}`,
    pitchClass: pitchClassOf(midi),
    frequency: frequencyOf(midi),
    sharp: step.length > 1,
  };
}

/** Notas entre dos MIDI, ambos incluidos. Por defecto, el piano entero. */
export function pitchesBetween(from: number = PIANO_RANGE[0], to: number = PIANO_RANGE[1]) {
  return Array.from({ length: to - from + 1 }, (_, i) => pitchOf(from + i));
}
