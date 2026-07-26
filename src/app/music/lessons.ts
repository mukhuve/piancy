/**
 * Como se supera un paso: tocando las notas en orden, pulsandolas a la vez, o
 * encontrando de oido la que ha sonado.
 */
export type LessonKind = 'sequence' | 'chord' | 'ear';

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly kind: LessonKind;
  /** Notas de cada paso. En las de oido solo cuenta cuantos pasos hay. */
  readonly steps: readonly (readonly number[])[];
  readonly labels?: readonly string[];
}

export const LESSONS: readonly Lesson[] = [
  {
    id: 'scale',
    title: 'C Major Scale',
    hint: 'Eight steps up. Play each highlighted key in order — the tonic is the darkest.',
    kind: 'sequence',
    steps: [[60], [62], [64], [65], [67], [69], [71], [72]],
  },
  {
    id: 'penta',
    title: 'A Minor Pentatonic',
    hint: 'Five notes, no wrong turns. This is the shape most solos are built on.',
    kind: 'sequence',
    steps: [[69], [72], [74], [76], [79], [81]],
  },
  {
    id: 'triads',
    title: 'Triads',
    hint: 'Press all three keys at once. Hold them until the step clears.',
    kind: 'chord',
    steps: [
      [60, 64, 67],
      [62, 65, 69],
      [64, 67, 71],
      [65, 69, 72],
    ],
    labels: ['C', 'Dm', 'Em', 'F'],
  },
  {
    id: 'prog',
    title: 'I — V — vi — IV',
    hint: 'The four chords behind a thousand songs. Play them in sequence.',
    kind: 'chord',
    steps: [
      [60, 64, 67],
      [67, 71, 74],
      [69, 72, 76],
      [65, 69, 72],
    ],
    labels: ['C', 'G', 'Am', 'F'],
  },
  {
    id: 'ear',
    title: 'Ear Training',
    hint: 'Listen to the tone, then find it on the keyboard. Six in a row clears the drill.',
    kind: 'ear',
    steps: [[], [], [], [], [], []],
  },
];

/** Octava desde la que se sortean las notas de las lecciones de oido. */
export const EAR_RANGE = { from: 60, notes: 13 };
