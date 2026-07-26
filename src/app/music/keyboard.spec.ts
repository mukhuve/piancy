import { WHITE_KEYS, layout } from './keyboard';

describe('keyboard', () => {
  it('el piano tiene 52 blancas, de A0 a C8', () => {
    expect(WHITE_KEYS).toHaveLength(52);
    expect(WHITE_KEYS.at(0)).toBe(21);
    expect(WHITE_KEYS.at(-1)).toBe(108);
  });

  it('reparte las blancas a lo ancho y deja las negras a caballo entre dos', () => {
    const keys = layout([60, 62, 64, 65, 67, 69, 71, 72]); // do a do
    const whites = keys.filter(({ black }) => !black);
    const blacks = keys.filter(({ black }) => black);

    expect(whites).toHaveLength(8);
    expect(blacks.map(({ pitch }) => pitch.name)).toEqual(['C#4', 'D#4', 'F#4', 'G#4', 'A#4']);

    // las blancas se reparten el ancho entero, sin huecos ni solapes
    expect(whites.at(0)?.x).toBe(0);
    expect(whites.at(-1)!.x + whites.at(-1)!.width).toBeCloseTo(1, 10);

    // cada negra queda centrada en la junta de las dos blancas que la rodean
    const [first] = blacks;
    expect(first.width).toBeCloseTo(whites[0].width * 0.6, 10);
    expect(first.x + first.width / 2).toBeCloseTo(whites[1].x, 10);
  });

  it('no cuelga una negra despues de la ultima blanca visible', () => {
    const keys = layout([60, 62]); // do y re: la negra de la derecha se queda fuera

    expect(keys.filter(({ black }) => black).map(({ pitch }) => pitch.name)).toEqual(['C#4']);
  });
});
