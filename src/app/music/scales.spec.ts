import { TestBed } from '@angular/core/testing';
import { Tonality, degreeOf } from './scales';

describe('degreeOf', () => {
  it('numera los grados de la escala mayor y deja fuera las alteraciones', () => {
    const scale = [60, 62, 64, 65, 67, 69, 71].map((midi) => degreeOf(midi, 0, 'major'));

    expect(scale).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(degreeOf(61, 0, 'major')).toBeNull();
  });

  it('cambia el tercer grado entre mayor y menor', () => {
    expect(degreeOf(64, 0, 'major')).toBe(2); // mi natural
    expect(degreeOf(64, 0, 'minor')).toBeNull();
    expect(degreeOf(63, 0, 'minor')).toBe(2); // mi bemol
  });

  it('no depende de la octava y transporta con la tonica', () => {
    expect(degreeOf(72, 0, 'major')).toBe(0);
    expect(degreeOf(36, 0, 'major')).toBe(0);
    expect(degreeOf(62, 2, 'major')).toBe(0); // re en re mayor
  });
});

describe('Tonality', () => {
  it('etiqueta los grados en numeros romanos', () => {
    const tonality = TestBed.inject(Tonality);

    expect(tonality.name()).toBe('C major');
    expect(tonality.label(60)).toBe('I');
    expect(tonality.label(67)).toBe('V');
    expect(tonality.label(61)).toBe('');

    tonality.root.set(7);
    expect(tonality.name()).toBe('G major');
    expect(tonality.label(67)).toBe('I');
  });
});
