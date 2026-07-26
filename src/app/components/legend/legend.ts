import { Component, computed, inject } from '@angular/core';
import { colorOf, toCss } from '../../music/color';
import { NOTE_NAMES } from '../../music/pitch';
import { Tonality } from '../../music/scales';

/** El do central, que es donde se lee la escala de color sin teñir. */
const REFERENCE_OCTAVE = 60;

/** La escala de color: que color le toca a cada nota y cual esta en la tonalidad. */
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
      color: toCss(colorOf(REFERENCE_OCTAVE + pitchClass)),
      degree: this.tonality.label(REFERENCE_OCTAVE + pitchClass),
    }))
  );
}
