import { Injectable, signal } from '@angular/core';

/** Lo que el usuario decide ver o no ver. */
@Injectable({ providedIn: 'root' })
export class Settings {
  /** Tocar libremente o seguir las lecciones. */
  readonly mode = signal<'play' | 'learn'>('play');

  /** Nombres de nota y grados escritos en las teclas. */
  readonly hints = signal(true);
  /**
   * Color por nota. Es una ayuda para diferenciar y recordar, no la unica forma de
   * leer nada: quien no la quiera se queda con los nombres y los grados.
   */
  readonly colour = signal(true);
  /**
   * Barra del transporte al pie. Apagada de salida: lo que se abre es un instrumento,
   * y las piezas son un segundo paso que se pide cuando se quiere.
   */
  readonly transport = signal(false);
  /**
   * Teclas del ordenador escritas sobre las del piano. Apagadas de salida: el
   * instrumento de verdad es un controlador MIDI o el dedo, y esas letras solo
   * sirven para probar desde el ordenador.
   */
  readonly typing = signal(false);
  /** Espectro de fondo en el visualizador. */
  readonly spectrum = signal(true);
}
