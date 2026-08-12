import { DestroyRef, Signal, inject, signal } from '@angular/core';

/**
 * Una consulta de medio leida como signal, para poder decidirlo en la plantilla igual
 * que cualquier otro estado. Se desengancha sola con quien la crea, asi que hay que
 * pedirla dentro de un contexto de inyeccion.
 *
 * Sin `matchMedia` —al renderizar fuera del navegador— la consulta no se cumple, que
 * es lo mismo que decir que manda el diseño de siempre.
 */
export function mediaQuery(query: string): Signal<boolean> {
  const list = globalThis.matchMedia?.(query);
  const matches = signal(list?.matches ?? false);

  if (!list) return matches.asReadonly();

  const listen = () => matches.set(list.matches);

  list.addEventListener('change', listen);
  inject(DestroyRef).onDestroy(() => list.removeEventListener('change', listen));

  return matches.asReadonly();
}
