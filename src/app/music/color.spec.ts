import { Rgb, chordColor, colorOf, isPale, toCss } from './color';

/** Angulo del color en el circulo cromatico, para comparar tonos sin mirar canales. */
function hueOf({ r, g, b }: { r: number; g: number; b: number }) {
  const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];

  if (max === min) return 0;

  const sector =
    max === r ? (g - b) / (max - min)
    : max === g ? 2 + (b - r) / (max - min)
    : 4 + (r - g) / (max - min);

  return (sector * 60 + 360) % 360;
}

describe('color', () => {
  it('da el mismo tono a la misma nota en cualquier octava', () => {
    const octaves = [36, 48, 60, 72, 84].map(colorOf);

    octaves.forEach((color) => expect(hueOf(color)).toBeCloseTo(hueOf(octaves[0]), 0));
  });

  it('reparte el arcoiris en semitonos de 25 grados', () => {
    const semitone = (hueOf(colorOf(61)) - hueOf(colorOf(60)) + 360) % 360;

    expect(semitone).toBeCloseTo(25, 0);
    // las doce notas de la octava son doce tonos distintos
    const hues = new Set([...Array(12)].map((_, i) => Math.round(hueOf(colorOf(60 + i)))));
    expect(hues.size).toBe(12);
  });

  it('oscurece los graves y aclara los agudos', () => {
    const brightness = ({ r, g, b }: { r: number; g: number; b: number }) => r + g + b;

    expect(brightness(colorOf(24))).toBeLessThan(brightness(colorOf(60)));
    expect(brightness(colorOf(96))).toBeGreaterThan(brightness(colorOf(60)));
  });

  it('ilumina mas un acorde que una nota suelta, y nada si no suena nada', () => {
    expect(chordColor([])).toBe('');
    expect(chordColor([60])).toBe('rgb(0, 255, 184)');
  });

  it('un acorde se pinta del color de su fundamental, no de la mezcla', () => {
    expect(chordColor([60, 64, 67])).toBe(toCss(colorOf(60))); // do mayor
    expect(chordColor([62, 65, 69])).toBe(toCss(colorOf(62))); // re menor
    expect(chordColor([60, 63, 67])).toBe(toCss(colorOf(60))); // do menor: la misma raiz

    // invertido, la fundamental esta una octava mas arriba: mismo tono, mas brillo
    const invertido = chordColor([64, 67, 72]);

    expect(invertido).toBe(toCss(colorOf(72)));
    expect(hueOf(colorOf(72))).toBeCloseTo(hueOf(colorOf(60)), 0);
  });

  it('sabe cuando un color pide tinta oscura encima', () => {
    /** Contraste WCAG entre dos colores, de 1:1 a 21:1. */
    const contrast = (a: Rgb, b: Rgb) => {
      const luminance = ({ r, g, b: blue }: Rgb) => {
        const channel = (v: number) =>
          v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4;

        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(blue);
      };
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);

      return (high + 0.05) / (low + 0.05);
    };

    const ink = { light: { r: 245, g: 245, b: 248 }, dark: { r: 43, g: 43, b: 45 } };

    expect(isPale(colorOf(68))).toBe(true); // sol sostenido, amarillo
    expect(isPale(colorOf(64))).toBe(false); // mi, violeta

    // en las doce notas de las siete octavas del piano la tinta elegida gana a la
    // otra, y ninguna baja del 3:1 que pide AA para un texto de este tamaño
    for (let midi = 24; midi < 96; midi++) {
      const color = colorOf(midi);
      const chosen = isPale(color) ? ink.dark : ink.light;
      const other = isPale(color) ? ink.light : ink.dark;

      expect(contrast(color, chosen)).toBeGreaterThanOrEqual(contrast(color, other));
      expect(contrast(color, chosen)).toBeGreaterThan(3);
    }
  });

  it('lo que no es un acorde se mezcla, y la mezcla cabe siempre en el canal', () => {
    const canales = (color: string) => color.match(/\d+/g)!.map(Number);
    const racimos = [
      [60, 61, 62],
      [60, 61, 62, 63, 64, 65],
      Array.from({ length: 12 }, (_, i) => 60 + i),
    ];

    racimos.forEach((racimo) => {
      expect(canales(chordColor(racimo)).every((canal) => canal >= 0 && canal <= 255)).toBe(true);
    });

    // la mezcla aprovecha todo el rango: su canal mas alto llega al tope
    expect(Math.max(...canales(chordColor(racimos[1])))).toBe(255);
  });
});
