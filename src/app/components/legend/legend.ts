import { Component, computed, inject } from '@angular/core';
import { I18n } from '../../i18n/i18n';
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

  protected readonly t = inject(I18n).t;

  /**
   * Solo las notas de la escala. Las de fuera no llevan color en el teclado, asi que
   * en la leyenda no explicaban nada: ocupaban sitio, apagadas, para decir que no
   * eran de aqui. Lo que se lee es la escala en la que se esta tocando.
   */
  protected readonly notes = computed(() =>
    NOTE_NAMES.map((name, pitchClass) => ({
      name,
      degree: this.tonality.label(REFERENCE + pitchClass),
      color: toCss(colorOf(REFERENCE + pitchClass)),
    })).filter(({ degree }) => degree)
  );

  protected readonly key = computed(() => this.tonality.name());
}
