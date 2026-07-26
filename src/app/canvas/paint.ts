import { DestroyRef, afterNextRender, inject } from '@angular/core';

/** Un lienzo listo para pintar, ya escalado a la densidad de la pantalla. */
export interface Canvas {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
}

/**
 * Ajusta el lienzo a su tamaño real en pixeles y lo deja limpio. Devuelve null
 * mientras no tenga tamaño, que es lo que pasa si esta oculto.
 */
export function fit(canvas: HTMLCanvasElement): Canvas | null {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const { clientWidth: width, clientHeight: height } = canvas;

  if (!width || !height) return null;

  if (canvas.width !== Math.floor(width * ratio)) canvas.width = Math.floor(width * ratio);
  if (canvas.height !== Math.floor(height * ratio)) canvas.height = Math.floor(height * ratio);

  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  return { ctx, width, height };
}

/**
 * Repinta en cada fotograma hasta que se destruye quien lo pidio. Hay que llamarlo
 * desde un contexto de inyeccion.
 */
export function animate(draw: () => void) {
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    let frame = requestAnimationFrame(function tick() {
      frame = requestAnimationFrame(tick);
      draw();
    });

    destroyRef.onDestroy(() => cancelAnimationFrame(frame));
  });
}

/**
 * Colores del tema para pintar en un lienzo, releidos solo cuando cambia el tema:
 * consultarlos en cada fotograma obligaria a recalcular estilos sesenta veces por
 * segundo.
 */
export function themeReader(element: HTMLElement, names: readonly string[]) {
  let theme: string | undefined;
  let colors: Record<string, string> = {};

  return () => {
    const current = document.documentElement.className;

    if (current !== theme) {
      const styles = getComputedStyle(element);

      theme = current;
      colors = Object.fromEntries(
        names.map((name) => [name, styles.getPropertyValue(`--color-${name}`).trim()])
      );
    }

    return colors;
  };
}
