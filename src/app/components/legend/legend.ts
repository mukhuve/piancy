import { Component, computed, inject } from '@angular/core';
import { colorOf, toCss } from '../../music/color';
import { NOTE_NAMES } from '../../music/pitch';
import { Tonality } from '../../music/scales';

/** El do central: la octava en la que se lee el color sin aclarar ni oscurecer. */
const REFERENCE = 60;

/**
 * Que color le toca a cada nota. Es la clave de lectura de todo lo que se pinta:
 * las teclas, las notas del carril y las lineas del visualizador salen de aqui.
 */
@Component({
  selector: 'app-legend',
  templateUrl: './legend.html',
  styleUrls: ['./legend.scss'],
})
export class Legend {
  private readonly tonality = inject(Tonality);

  protected readonly notes = computed(() =>
    NOTE_NAMES.map((name, pitchClass) => ({
      name,
      color: toCss(colorOf(REFERENCE + pitchClass)),
      degree: this.tonality.label(REFERENCE + pitchClass),
    }))
  );

  protected readonly key = computed(() => this.tonality.name());
}
