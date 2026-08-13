import { Injectable, signal } from '@angular/core';
import { mediaQuery } from './media';

/**
 * Un telefono, cogido como se coja: la app se pone de lado ella sola, asi que lo que
 * lo delata es el lado corto. La misma consulta esta en `styles/_media.scss` como
 * mixin `compact`: alli se recoge el diseño y aqui se decide que llega a dibujarse.
 */
const COMPACT = '(hover: none) and ((max-width: 600px) or (max-height: 600px))';

/** El tamaño de la ventana como estado: quien pinta pregunta, no mide. */
@Injectable({ providedIn: 'root' })
export class Viewport {
  /** Los mandos se recogen en una sola franja para dejarle el alto al teclado. */
  readonly compact = mediaQuery(COMPACT);

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
