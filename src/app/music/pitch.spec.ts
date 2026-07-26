import { PIANO_RANGE, frequencyOf, pitchOf, pitchesBetween } from './pitch';

describe('pitch', () => {
  it('afina por temperamento igual desde A4 = 440 Hz', () => {
    expect(frequencyOf(69)).toBe(440);
    expect(frequencyOf(70) / frequencyOf(69)).toBeCloseTo(2 ** (1 / 12), 6);
    expect(frequencyOf(81) / frequencyOf(69)).toBeCloseTo(2, 6);
  });

  it('cambia de octava en el do, no en el la', () => {
    expect(pitchOf(59).name).toBe('B3');
    expect(pitchOf(60).name).toBe('C4');
    expect(pitchOf(69).name).toBe('A4');
  });

  it('marca las sostenidas, cinco por octava', () => {
    const octave = pitchesBetween(60, 71);

    expect(octave.filter(({ sharp }) => sharp)).toHaveLength(5);
    expect(pitchOf(61)).toMatchObject({ step: 'C#', sharp: true, pitchClass: 1, octave: 4 });
  });

  it('cubre las 88 teclas del piano, de A0 a C8', () => {
    const piano = pitchesBetween(...PIANO_RANGE);

    expect(piano).toHaveLength(88);
    expect(piano.at(0)?.name).toBe('A0');
    expect(piano.at(-1)?.name).toBe('C8');
    expect(piano.at(0)?.frequency).toBeCloseTo(27.5, 4);
  });
});
