import { TestBed } from '@angular/core/testing';
import { mediaQuery } from './media';

/** Un `MediaQueryList` de mentira con el interruptor a la vista. */
function fakeMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const list = {
    matches,
    addEventListener: (_: string, fn: () => void) => void listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => void listeners.delete(fn),
  };

  return {
    list,
    listeners,
    set(value: boolean) {
      list.matches = value;
      listeners.forEach((fn) => fn());
    },
  };
}

describe('mediaQuery', () => {
  it('sigue a la consulta y se desengancha con quien la creo', () => {
    const media = fakeMatchMedia(false);

    vi.stubGlobal('matchMedia', () => media.list);

    const matches = TestBed.runInInjectionContext(() => mediaQuery('(hover: none)'));

    expect(matches()).toBe(false);

    media.set(true);
    expect(matches()).toBe(true);

    TestBed.resetTestingModule();
    expect(media.listeners.size).toBe(0);
  });

  it('sin matchMedia se queda con el diseño de siempre', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(TestBed.runInInjectionContext(() => mediaQuery('(hover: none)'))()).toBe(false);
  });
});
