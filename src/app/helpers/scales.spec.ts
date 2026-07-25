import { PIANO_KEYS } from '../components/piano/piano.constants';
import { chromaticMinor } from './scales';

describe('chromaticMinor', () => {
  it('afina por temperamento igual desde A0 = 27.5 Hz', () => {
    const tiles = chromaticMinor(4, 1);
    const a4 = tiles.find(({ note }) => note === 'A4');

    // el la de referencia: A4 = 440 Hz exactos
    expect(a4?.frequency).toBeCloseTo(440, 6);
    // el semitono siguiente es la raiz doceava de 2
    expect(tiles[1].frequency / tiles[0].frequency).toBeCloseTo(2 ** (1 / 12), 6);
    // y una octava entera duplica la frecuencia
    expect(chromaticMinor(5, 1)[0].frequency / tiles[0].frequency).toBeCloseTo(2, 6);
  });

  it('genera doce semitonos por octava, con las sostenidas marcadas', () => {
    const tiles = chromaticMinor(3, 4);

    expect(tiles).toHaveLength(48);
    expect(tiles.filter(({ sharp }) => sharp)).toHaveLength(20);
  });

  it('cambia de octava en el do, no en el la', () => {
    const [a3, , b3, c4] = chromaticMinor(3, 1);

    expect([a3.note, b3.note, c4.note]).toEqual(['A3', 'B3', 'C4']);
  });

  it('mapea las teclas por posicion y deja sin tecla las que sobran', () => {
    const tiles = chromaticMinor(3, 4);

    expect(tiles.map(({ key }) => key).slice(0, 3)).toEqual(PIANO_KEYS.slice(0, 3));
    expect(tiles.at(-1)?.key).toBe('');
  });
});
