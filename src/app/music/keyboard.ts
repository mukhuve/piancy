import { PIANO_RANGE, Pitch, pitchOf, pitchesBetween } from './pitch';

/** Los midis de las teclas blancas, que son las que reparten el ancho del teclado. */
export const WHITE_KEYS = pitchesBetween(...PIANO_RANGE)
  .filter(({ sharp }) => !sharp)
  .map(({ midi }) => midi);

/** Ancho de una negra en proporcion al de una blanca. */
const BLACK_WIDTH = 0.6;

/** Una tecla colocada. `x` y `width` van en fracciones del teclado visible. */
export interface Key {
  readonly pitch: Pitch;
  readonly x: number;
  readonly width: number;
  readonly black: boolean;
}

/**
 * Reparte las blancas a lo ancho y cuelga cada negra a caballo entre las dos que
 * la rodean. Las blancas van primero para que las negras las tapen por orden.
 */
export function layout(whites: number[]): Key[] {
  const width = 1 / whites.length;

  const keys: Key[] = whites.map((midi, i) => ({
    pitch: pitchOf(midi),
    x: i * width,
    width,
    black: false,
  }));

  whites.forEach((midi, i) => {
    const black = pitchOf(midi + 1);

    if (!black.sharp || i + 1 >= whites.length) return;

    keys.push({
      pitch: black,
      x: (i + 1) * width - (width * BLACK_WIDTH) / 2,
      width: width * BLACK_WIDTH,
      black: true,
    });
  });

  return keys;
}
