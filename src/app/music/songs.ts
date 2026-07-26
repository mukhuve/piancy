/** Una nota de una cancion. `at` y `duration` van en pulsos, no en segundos. */
export interface SongNote {
  readonly midi: number;
  readonly at: number;
  readonly duration: number;
}

export interface Song {
  readonly name: string;
  readonly bpm: number;
  readonly notes: readonly SongNote[];
}

const note = ([midi, at, duration]: [number, number, number]): SongNote => ({ midi, at, duration });

export const SONGS: readonly Song[] = [
  {
    name: 'Ode to Joy',
    bpm: 96,
    notes: ([
      [64, 0, 1], [64, 1, 1], [65, 2, 1], [67, 3, 1], [67, 4, 1], [65, 5, 1], [64, 6, 1],
      [62, 7, 1], [60, 8, 1], [60, 9, 1], [62, 10, 1], [64, 11, 1], [64, 12, 1.5],
      [62, 13.5, 0.5], [62, 14, 2], [64, 16, 1], [64, 17, 1], [65, 18, 1], [67, 19, 1],
      [67, 20, 1], [65, 21, 1], [64, 22, 1], [62, 23, 1], [60, 24, 1], [60, 25, 1],
      [62, 26, 1], [64, 27, 1], [62, 28, 1.5], [60, 29.5, 0.5], [60, 30, 2],
    ] as [number, number, number][]).map(note),
  },
  {
    name: 'Twinkle',
    bpm: 104,
    notes: ([
      [60, 0, 1], [60, 1, 1], [67, 2, 1], [67, 3, 1], [69, 4, 1], [69, 5, 1], [67, 6, 2],
      [65, 8, 1], [65, 9, 1], [64, 10, 1], [64, 11, 1], [62, 12, 1], [62, 13, 1], [60, 14, 2],
      [67, 16, 1], [67, 17, 1], [65, 18, 1], [65, 19, 1], [64, 20, 1], [64, 21, 1], [62, 22, 2],
    ] as [number, number, number][]).map(note),
  },
  {
    name: 'Für Elise',
    bpm: 76,
    notes: ([
      [76, 0, 0.5], [75, 0.5, 0.5], [76, 1, 0.5], [75, 1.5, 0.5], [76, 2, 0.5], [71, 2.5, 0.5],
      [74, 3, 0.5], [72, 3.5, 0.5], [69, 4, 1], [60, 5, 0.5], [64, 5.5, 0.5], [69, 6, 0.5],
      [71, 6.5, 1], [64, 8, 0.5], [68, 8.5, 0.5], [71, 9, 0.5], [72, 9.5, 1],
    ] as [number, number, number][]).map(note),
  },
];

/** Nota mas grave y mas aguda de la cancion, para centrar el teclado en ella. */
export function songRange({ notes }: Song): [number, number] {
  const midis = notes.map(({ midi }) => midi);

  return [Math.min(...midis), Math.max(...midis)];
}
