import { frequencyOf, octaveOf } from './pitch';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const VIOLET = 380; // nm
const RED = VIOLET * 2;
const LIGHT_SPEED = 2.99792458e17; // nm/s

/** Grados que ocupa el arcoiris en el circulo cromatico; el resto son purpuras. */
const SPECTRUM_ARC = 300;

/** Octava que se pinta con su color puro; el resto se aclara u oscurece. */
const MIDDLE_OCTAVE = 4;
/** Cuanto se aleja del medio el brillo de los extremos del teclado, de 0 a 0.5. */
const SHADE = 0.25;

/**
 * El espectro visible abarca casi exactamente una octava de luz (380-760 nm), asi
 * que subir la nota de octava en octava hasta que su frecuencia es luz da siempre
 * el mismo color para la misma nota: la octava no cambia el tono, solo el brillo.
 */
function soundToLight(frequency: number) {
  const octaves = Math.ceil(Math.log2(LIGHT_SPEED / RED / frequency));

  return LIGHT_SPEED / (frequency * 2 ** octaves);
}

/**
 * Longitud de onda al angulo del circulo cromatico: 0 el rojo y 300 el violeta. El
 * reparto es logaritmico como el de las notas, asi que cada semitono avanza los
 * mismos 25 grados y las doce notas se distinguen entre si.
 */
function lightToHue(light: number) {
  return Math.log2(RED / light) * SPECTRUM_ARC;
}

/** Los graves se pintan oscuros y los agudos claros. */
function lightnessOf(octave: number) {
  return 0.5 + ((octave - MIDDLE_OCTAVE) / MIDDLE_OCTAVE) * SHADE;
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const wrap = (n: number) => (n + hue / 30) % 12;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) =>
    Math.round(255 * (lightness - chroma * Math.max(-1, Math.min(wrap(n) - 3, 9 - wrap(n), 1))));

  return { r: channel(0), g: channel(8), b: channel(4) };
}

/** Color de una nota: el tono lo pone la nota y el brillo la octava. */
export function colorOf(midi: number): Rgb {
  return hslToRgb(lightToHue(soundToLight(frequencyOf(midi))), 1, lightnessOf(octaveOf(midi)));
}

export function toCss({ r, g, b }: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Color de lo que suena ahora: los canales se suman, de modo que un acorde ilumina
 * mas que una nota suelta, y la mezcla se reescala entera para que quepa en el
 * canal. Escalar en vez de recortar conserva el tono —un acorde queda claro, no
 * blanco— y sobre todo devuelve siempre un color valido: sumar sin mas se sale de
 * 255 en cuanto hay dos notas, y CSS descarta ese color y no pinta nada.
 */
export function chordColor(midis: number[]) {
  if (!midis.length) return '';

  const sum = midis
    .map(colorOf)
    .reduce((total, rgb) => ({ r: total.r + rgb.r, g: total.g + rgb.g, b: total.b + rgb.b }));

  const scale = 255 / Math.max(sum.r, sum.g, sum.b, 255);

  return toCss({
    r: Math.round(sum.r * scale),
    g: Math.round(sum.g * scale),
    b: Math.round(sum.b * scale),
  });
}
