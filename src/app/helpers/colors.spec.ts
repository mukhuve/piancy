import { notesToColor } from './colors';

describe('notesToColor', () => {
  const range: [number, number] = [220, 880];

  it('pinta de rojo la nota mas grave y de violeta la mas aguda', () => {
    expect(notesToColor([220], range)).toBe('rgb(255, 59, 0)'); // 630 nm
    expect(notesToColor([880], range)).toBe('rgb(170, 0, 255)'); // 400 nm
  });

  it('suma el color de las notas de un acorde', () => {
    expect(notesToColor([220, 880], range)).toBe('rgb(425, 59, 255)');
  });

  it('se queda sin color cuando no suena nada', () => {
    expect(notesToColor([], range)).toBe('');
  });
});
