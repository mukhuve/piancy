interface Rgb {
  r: number;
  g: number;
  b: number;
}

const VISIBLE_SPECTRUM: [number, number] = [630, 400]; // nm, del rojo al violeta

/** Reparte el rango audible del piano sobre el espectro visible. */
function soundToLight(frequency: number, [minSound, maxSound]: [number, number]) {
  const [red, violet] = VISIBLE_SPECTRUM;
  const proportion = (violet - red) / (maxSound - minSound);

  return red + (frequency - minSound) * proportion;
}

/** Longitud de onda visible (nm) a RGB. */
function lightToRgb(light: number): Rgb {
  const scale = (value: number, from: number, to: number) => (value - from) / (to - from);
  const channels: [number, number, number] =
    light < 380 ? [0, 0, 0]
    : light < 440 ? [scale(light, 440, 380), 0, 1]
    : light < 490 ? [0, scale(light, 440, 490), 1]
    : light < 510 ? [0, 1, scale(light, 510, 490)]
    : light < 580 ? [scale(light, 510, 580), 1, 0]
    : light < 645 ? [1, scale(light, 645, 580), 0]
    : light <= 780 ? [1, 0, 0]
    : [0, 0, 0];

  const [r, g, b] = channels.map((channel) => Math.round(channel * 255));

  return { r, g, b };
}

/**
 * Color de las notas que suenan: suma el RGB de cada una, sin recortar, de modo
 * que un acorde ilumina mas que una nota suelta. Cadena vacia si no suena nada.
 */
export function notesToColor(notes: number[], range: [number, number]) {
  const { r, g, b } = notes
    .map((frequency) => lightToRgb(soundToLight(frequency, range)))
    .reduce((total, rgb) => ({ r: total.r + rgb.r, g: total.g + rgb.g, b: total.b + rgb.b }), {
      r: 0,
      g: 0,
      b: 0,
    });

  return r + g + b === 0 ? '' : `rgb(${r}, ${g}, ${b})`;
}
