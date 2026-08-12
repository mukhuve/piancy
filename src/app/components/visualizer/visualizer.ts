import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { animate, fit, themeReader } from '../../canvas/paint';
import { I18n } from '../../i18n/i18n';
import { Keyboard } from '../../keyboard/keyboard';
import { chordOf } from '../../music/chords';
import { pitchOf } from '../../music/pitch';
import { Settings } from '../../settings';
import { Synth } from '../../synth/synth';
import { drawGrid, drawSpectrum, drawVoices, drawWaves } from './visualizer.paint';

const COLORS = ['neutral-300', 'accent-300', 'accent-800'] as const;

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.html',
  styleUrls: ['./visualizer.scss'],
})
export class Visualizer {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly synth = inject(Synth);
  private readonly keyboard = inject(Keyboard);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly palette = themeReader(this.host.nativeElement, COLORS);

  private readonly settings = inject(Settings);

  protected readonly t = inject(I18n).t;
  protected readonly playing = computed(() => this.synth.playing().length > 0);

  /** La ayuda de arranque se retira en cuanto se toca algo, y no vuelve. */
  protected readonly touched = signal(false);

  /** Lo que se lee sobre el grafico es lo que suena: la nota, su afinacion y cuantas. */
  protected readonly reading = computed(() => {
    const playing = this.synth.playing();

    if (!playing.length) return '';

    const { name, root } = chordOf(playing);
    const tuning = root === undefined ? '' : `${pitchOf(root).frequency.toFixed(1)} Hz`;
    const voices = playing.length > 1 ? `${playing.length} ${this.t('visualizer.voices')}` : '';

    return [name, tuning, voices].filter(Boolean).join(' · ');
  });

  constructor() {
    effect(() => {
      if (this.playing()) this.touched.set(true);
    });

    animate(() => {
      const canvas = fit(this.canvas().nativeElement);

      if (!canvas) return;

      const colors = this.palette();
      const notes = this.synth.playing();
      /* sin color por nota todo se pinta con la tinta del tema, y lo que separa una
         voz de otra pasa a ser donde cae y que forma tiene, no de que color es */
      const tint = this.settings.colour() ? undefined : colors['accent-800'];

      drawGrid(canvas, colors['neutral-300']);
      if (this.settings.spectrum()) {
        drawSpectrum(canvas, this.synth.spectrum(), colors['accent-300']);
      }
      drawVoices(canvas, this.keyboard.keys(), notes, tint);
      drawWaves(canvas, this.synth.waves(), colors['accent-800'], tint);
    });
  }
}
