/**
 * Dos filas del teclado del ordenador sobre una octava y media, contadas en
 * semitonos desde un do: la fila de abajo son las blancas y la de arriba las
 * negras, como en un piano.
 */
export const KEY_MAP: Readonly<Record<string, number>> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6,
  g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13,
  l: 14, p: 15,
};

/** Semitonos que abarca el mapa, para saber si cabe en la ventana visible. */
export const KEY_MAP_RANGE = Math.max(...Object.values(KEY_MAP)) + 1;

/** Teclas que desplazan el teclado una septima a izquierda o derecha. */
export const SHIFT_KEYS: Readonly<Record<string, number>> = { z: -7, x: 7 };
