import { Injectable, signal } from '@angular/core';

/** Lo que el usuario decide ver o no ver. */
@Injectable({ providedIn: 'root' })
export class Settings {
  /** Nombres de nota y grados escritos en las teclas. */
  readonly hints = signal(true);
  /** Barra del transporte al pie. */
  readonly transport = signal(true);
}
