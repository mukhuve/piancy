import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { animate, fit, themeReader } from '../../canvas/paint';
import { Keyboard } from '../../keyboard/keyboard';
import { Player } from '../../transport/player';
import { drawCountdown, drawGuides, drawHitLine, drawNotes } from './lane.paint';

const COLORS = ['neutral-300', 'neutral-400', 'accent-800', 'accent-900'] as const;

/** El carril por el que caen las notas de la cancion hasta la linea de golpeo. */
@Component({
  selector: 'app-lane',
  templateUrl: './lane.html',
  styleUrls: ['./lane.scss'],
})
export class Lane {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly keyboard = inject(Keyboard);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly palette = themeReader(this.host.nativeElement, COLORS);

  protected readonly player = inject(Player);

  protected readonly score = computed(
    () =>
      `${this.player.hits()} hit · ${this.player.misses()} missed · streak ${this.player.streak()}`
  );

  constructor() {
    animate(() => {
      const canvas = fit(this.canvas().nativeElement);
      const song = this.player.song();

      if (!canvas || !song) return;

      const colors = this.palette();

      drawGuides(canvas, this.keyboard.keys(), colors['neutral-300']);
      drawNotes(
        canvas,
        {
          song,
          keys: this.keyboard.keys(),
          states: this.player.states(),
          secondsPerBeat: this.player.secondsPerBeat(),
          elapsed: this.player.elapsed(),
        },
        colors['neutral-400'],
        colors['accent-900']
      );
      drawHitLine(canvas, colors['accent-800']);
      drawCountdown(canvas, this.player.countdown(), colors['accent-800']);
    });
  }
}
