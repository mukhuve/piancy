import { fit, themeReader } from './paint';

describe('fit', () => {
  it('escala el lienzo a la densidad de la pantalla y lo deja listo', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, {
      clientWidth: { value: 300 },
      clientHeight: { value: 150 },
    });
    // jsdom no trae contexto 2D: lo justo para comprobar el escalado
    canvas.getContext = (() => ({ setTransform: () => undefined, clearRect: () => undefined })) as never;

    const painted = fit(canvas);

    expect(painted?.width).toBe(300);
    expect(painted?.height).toBe(150);
    expect(canvas.width).toBe(300 * Math.min(2, window.devicePixelRatio || 1));
  });

  it('no pinta un lienzo sin tamaño, que es lo que pasa si esta oculto', () => {
    expect(fit(document.createElement('canvas'))).toBeNull();
  });
});

describe('themeReader', () => {
  it('solo vuelve a leer los colores cuando cambia el tema', () => {
    const element = document.createElement('div');
    document.body.append(element);
    element.style.setProperty('--color-accent-300', 'rgb(1, 2, 3)');

    let reads = 0;
    const spy = vi.spyOn(window, 'getComputedStyle');
    spy.mockImplementation(((el: Element) => {
      reads++;

      return { getPropertyValue: (name: string) => (el as HTMLElement).style.getPropertyValue(name) };
    }) as never);

    const palette = themeReader(element, ['accent-300']);

    expect(palette()['accent-300']).toBe('rgb(1, 2, 3)');
    palette();
    palette();
    expect(reads).toBe(1);

    document.documentElement.classList.add('dark');
    palette();
    expect(reads).toBe(2);

    document.documentElement.classList.remove('dark');
    spy.mockRestore();
    element.remove();
  });
});
