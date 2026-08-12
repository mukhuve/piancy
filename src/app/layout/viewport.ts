import { Injectable, signal } from '@angular/core';
import { mediaQuery } from './media';

/**
 * Movil tumbado. La misma consulta esta en `styles/_media.scss` como mixin `compact`:
 * alli se recoge el diseño y aqui se decide que llega siquiera a dibujarse.
 */
const COMPACT = '(hover: none) and (max-height: 600px)';

/** Movil de pie. Un teclado necesita ancho, y de pie no lo hay. */
const PORTRAIT = '(hover: none) and (orientation: portrait) and (max-width: 700px)';

/** El tamaño de la ventana como estado: quien pinta pregunta, no mide. */
@Injectable({ providedIn: 'root' })
export class Viewport {
  /** Los mandos se recogen en una sola franja para dejarle el alto al teclado. */
  readonly compact = mediaQuery(COMPACT);
  /** No hay diseño que salve un teclado de 17 px por tecla: se pide girar el movil. */
  readonly portrait = mediaQuery(PORTRAIT);

  /**
   * En el movil la barra del navegador se come una quinta parte del alto, que es
   * justo lo que falta. iOS no da pantalla completa fuera del video, asi que alli el
   * boton no tiene nada que ofrecer y no se pone.
   */
  readonly fullscreenAvailable = !!document.documentElement.requestFullscreen;

  readonly fullscreen = signal(false);

  constructor() {
    document.addEventListener('fullscreenchange', () =>
      this.fullscreen.set(!!document.fullscreenElement)
    );
  }

  /** Se sale igual con el gesto del sistema, asi que el boton solo tiene que alternar. */
  toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  }
}
