import { Injectable, effect, inject, signal } from '@angular/core';
import { Synth } from '../synth/synth';

export const BPM_RANGE = { min: 40, max: 240 };

/** Un compas de cuatro: el primer pulso suena mas agudo y mas fuerte. */
const CLICK = {
  accent: { frequency: 1600, gain: 0.16 },
  beat: { frequency: 1100, gain: 0.09 },
  seconds: 0.05,
  perBar: 4,
};

/** El pulso al que se toca: lo comparten el metronomo y las canciones. */
@Injectable({ providedIn: 'root' })
export class Transport {
  readonly bpm = signal(96);
  readonly metronome = signal(false);
  /**
   * Pulso que suena ahora dentro del compas. El metronomo se oye, pero mirando la
   * pantalla no habia forma de saber si estaba puesto ni por donde iba el compas.
   */
  readonly beat = signal(0);

  readonly perBar = CLICK.perBar;

  private readonly synth = inject(Synth);

  constructor() {
    effect((onCleanup) => {
      if (!this.metronome()) return;

      let beat = 0;
      const timer = setInterval(() => {
        const { frequency, gain } = beat % CLICK.perBar ? CLICK.beat : CLICK.accent;

        this.synth.blip(frequency, CLICK.seconds, gain);
        this.beat.set(beat++ % CLICK.perBar);
      }, 60_000 / this.bpm());

      onCleanup(() => {
        clearInterval(timer);
        this.beat.set(0);
      });
    });
  }

  setBpm(bpm: number) {
    if (isNaN(bpm)) return;

    this.bpm.set(Math.max(BPM_RANGE.min, Math.min(BPM_RANGE.max, Math.round(bpm))));
  }
}
