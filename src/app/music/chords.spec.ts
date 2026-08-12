import { chordName } from './chords';

describe('chordName', () => {
  it('nombra la nota suelta con su octava', () => {
    expect(chordName([])).toBe('');
    expect(chordName([60])).toBe('C4');
  });

  it('reconoce las triadas y los acordes de septima', () => {
    expect(chordName([60, 64, 67])).toBe('C');
    expect(chordName([60, 63, 67])).toBe('Cm');
    expect(chordName([62, 65, 69])).toBe('Dm');
    expect(chordName([60, 64, 67, 70])).toBe('C7');
    expect(chordName([60, 64, 67, 71])).toBe('Cmaj7');
  });

  it('reconoce las inversiones y los acordes repartidos por octavas', () => {
    expect(chordName([64, 67, 72])).toBe('C'); // primera inversion
    expect(chordName([67, 72, 76])).toBe('C'); // segunda inversion
    expect(chordName([48, 64, 79])).toBe('C'); // do, mi y sol muy separados
  });

  it('cuando no encaja en ningun acorde, enumera las notas', () => {
    expect(chordName([60, 61, 62])).toBe('C C# D');
  });
});
