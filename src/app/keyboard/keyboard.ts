import { Injectable, computed, inject, signal } from '@angular/core';
import { KEY_MAP, KEY_MAP_RANGE } from '../input/computer-keys';
import { Key, WHITE_KEYS, layout } from '../music/keyboard';
import { Synth } from '../synth/synth';

const OCTAVE = 12;
/** Blancas minimas visibles: una octava justa, de do a do, que es lo que se toca. */
const MIN_KEYS = 8;
/**
 * Por donde se abre el piano. Empezaba en A0, el extremo grave, que con veintidos
 * teclas a la vista ya era un arranque raro y con una octava no vale para nada:
 * lo que se toca al sentarse esta alrededor del do central.
 */
const START = WHITE_KEYS.indexOf(48);

/** Una tecla colocada, con la tecla del ordenador que le toca si la hay. */
export interface PianoKey extends Key {
  readonly shortcut: string;
}

/**
 * Que trozo del piano se esta viendo. Lo comparten el teclado, el mapa que lo
 * resume y el carril de notas, que tiene que caer justo sobre las teclas.
 */
@Injectable({ providedIn: 'root' })
export class Keyboard {
  readonly octaves = signal(3);
  /** Primera blanca visible, como indice sobre las 52 del piano. */
  readonly first = signal(START);

  readonly size = computed(() => Math.max(MIN_KEYS, Math.round(this.octaves() * 7) + 1));

  readonly whites = computed(() => {
    const first = this.clamp(this.first());

    return WHITE_KEYS.slice(first, first + this.size());
  });

  readonly keys = computed<PianoKey[]>(() => {
    const shortcuts = this.shortcuts();

    return layout(this.whites()).map((key) => ({
      ...key,
      shortcut: shortcuts.get(key.pitch.midi) ?? '',
    }));
  });

  /** Do desde el que se reparten las teclas del ordenador sobre la ventana visible. */
  readonly typingBase = computed(() => {
    const whites = this.whites();
    const octaveStart = Math.ceil(whites[0] / OCTAVE) * OCTAVE;
    const fits = octaveStart + KEY_MAP_RANGE <= whites[whites.length - 1];

    return fits ? octaveStart : Math.max(OCTAVE * 2, octaveStart - OCTAVE);
  });

  private readonly shortcuts = computed(
    () =>
      new Map(
        Object.entries(KEY_MAP).map(([key, semitones]) => [this.typingBase() + semitones, key])
      )
  );

  private readonly synth = inject(Synth);

  /** Desplaza la ventana. Lo que sonara queda huerfano, asi que se suelta antes. */
  move(keys: number) {
    const first = this.clamp(this.first() + keys);

    if (first === this.first()) return;

    this.synth.panic();
    this.first.set(first);
  }

  /** Deja la nota lo mas centrada posible en la ventana. */
  centerOn(midi: number) {
    const closest = WHITE_KEYS.reduce(
      (best, white, i) => (Math.abs(white - midi) < Math.abs(WHITE_KEYS[best] - midi) ? i : best),
      0
    );

    this.move(closest - Math.floor(this.size() / 2) - this.first());
  }

  /** Nota del teclado del ordenador, en la octava que se este viendo. */
  midiFor(key: string) {
    return key in KEY_MAP ? this.typingBase() + KEY_MAP[key] : undefined;
  }

  private clamp(first: number) {
    return Math.max(0, Math.min(WHITE_KEYS.length - this.size(), first));
  }
}
