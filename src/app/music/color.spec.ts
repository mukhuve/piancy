import { chordColor, colorOf } from './color';

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
    expect(chordColor([60, 64, 67])).toBe('rgb(354, 418, 439)');
  });
});
