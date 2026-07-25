import { PIANO_KEYS, chromaticMinor } from './scales';

describe('chromaticMinor', () => {
  it('afina por temperamento igual desde A0 = 27.5 Hz', () => {
    const notes = chromaticMinor(4, 1);
    const a4 = notes.find(({ name }) => name === 'A4');

    // el la de referencia: A4 = 440 Hz exactos
    expect(a4?.frequency).toBeCloseTo(440, 6);
    // el semitono siguiente es la raiz doceava de 2
    expect(notes[1].frequency / notes[0].frequency).toBeCloseTo(2 ** (1 / 12), 6);
    // y una octava entera duplica la frecuencia
    expect(chromaticMinor(5, 1)[0].frequency / notes[0].frequency).toBeCloseTo(2, 6);
  });

  it('genera doce semitonos por octava, con las sostenidas marcadas', () => {
    const notes = chromaticMinor(3, 4);

    expect(notes).toHaveLength(48);
    expect(notes.filter(({ sharp }) => sharp)).toHaveLength(20);
  });

  it('cambia de octava en el do, no en el la', () => {
    const [a3, , b3, c4] = chromaticMinor(3, 1);

    expect([a3.name, b3.name, c4.name]).toEqual(['A3', 'B3', 'C4']);
  });

  it('mapea las teclas por posicion y deja sin tecla las que sobran', () => {
    const notes = chromaticMinor(3, 4);

    expect(notes.map(({ key }) => key).slice(0, 3)).toEqual(PIANO_KEYS.slice(0, 3));
    expect(notes.at(-1)?.key).toBe('');
  });
});
