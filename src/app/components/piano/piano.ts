import { Component, computed, inject, input, signal, viewChildren } from '@angular/core';
import { KEY_MAP, KEY_MAP_RANGE, SHIFT_KEYS } from '../../input/computer-keys';
import { Key, WHITE_KEYS, layout } from '../../music/keyboard';
import { Settings } from '../../settings';
import { Synth } from '../../synth/synth';
import { Legend } from '../legend/legend';
import { Keymap } from '../keymap/keymap';
import { Tile } from '../tile/tile';

const OCTAVE = 12;
/** Blancas minimas visibles, para que el teclado no se quede en nada. */
const MIN_KEYS = 10;
/** Rueda acumulada que hace falta para desplazar una tecla. */
const WHEEL_STEP = 26;

export interface PianoKey extends Key {
  readonly shortcut: string;
}

@Component({
  selector: 'app-piano',
  imports: [Tile, Keymap, Legend],
  templateUrl: './piano.html',
  styleUrls: ['./piano.scss'],
  host: {
    '(window:keydown)': 'press($event)',
    '(window:keyup)': 'release($event)',
    '(wheel)': 'scroll($event)',
  },
})
export class Piano {
  readonly octaves = input(3);

  private readonly synth = inject(Synth);

  protected readonly settings = inject(Settings);
  private readonly tiles = viewChildren(Tile);

  /** Primera blanca visible, como indice sobre las 52 del piano. */
  readonly first = signal(0);
  readonly size = computed(() => Math.max(MIN_KEYS, Math.round(this.octaves() * 7) + 1));

  readonly whites = computed(() => {
    const first = Math.max(0, Math.min(WHITE_KEYS.length - this.size(), this.first()));

    return WHITE_KEYS.slice(first, first + this.size());
  });

  readonly keys = computed<PianoKey[]>(() => {
    const shortcuts = this.shortcuts();

    return layout(this.whites()).map((key) => ({
      ...key,
      shortcut: shortcuts.get(key.pitch.midi) ?? '',
    }));
  });

  readonly focused = signal(WHITE_KEYS[0]);

  /**
   * Tecla que entra en el orden de tabulacion; las flechas mueven el foco entre las
   * demas. Si la enfocada se sale al desplazar la ventana, entra la primera visible:
   * el teclado nunca puede quedarse sin punto de entrada.
   */
  readonly tabStop = computed(() => {
    const midis = this.keys().map(({ pitch }) => pitch.midi);

    return midis.includes(this.focused()) ? this.focused() : Math.min(...midis);
  });

  /** Do desde el que se reparten las teclas del ordenador sobre la ventana visible. */
  private readonly typingBase = computed(() => {
    const whites = this.whites();
    const octaveStart = Math.ceil(whites[0] / OCTAVE) * OCTAVE;
    const cabe = octaveStart + KEY_MAP_RANGE <= whites[whites.length - 1];

    return cabe ? octaveStart : Math.max(OCTAVE * 2, octaveStart - OCTAVE);
  });

  private readonly shortcuts = computed(
    () =>
      new Map(
        Object.entries(KEY_MAP).map(([key, semitones]) => [this.typingBase() + semitones, key])
      )
  );

  private wheel = 0;

  /** Desplaza la ventana. Lo que sonara queda huerfano, asi que se suelta antes. */
  move(keys: number) {
    const first = Math.max(0, Math.min(WHITE_KEYS.length - this.size(), this.first() + keys));

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

  press(event: KeyboardEvent) {
    if (event.repeat || event.metaKey || event.ctrlKey || isTyping(event.target)) return;

    const key = event.key.toLowerCase();

    if (key === ' ') {
      event.preventDefault();
      this.synth.sustain.set(true);

      return;
    }

    if (key in SHIFT_KEYS) {
      this.move(SHIFT_KEYS[key]);

      return;
    }

    if (!(key in KEY_MAP)) return;

    event.preventDefault();
    this.synth.noteOn(this.typingBase() + KEY_MAP[key]);
  }

  release(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (key === ' ') {
      this.synth.sustain.set(false);
    } else if (key in KEY_MAP) {
      this.synth.noteOff(this.typingBase() + KEY_MAP[key]);
    }
  }

  scroll(event: WheelEvent) {
    const delta =
      event.shiftKey ? event.deltaY
      : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX
      : 0;

    if (!delta) return;

    event.preventDefault();
    this.wheel += delta;

    while (Math.abs(this.wheel) >= WHEEL_STEP) {
      this.move(Math.sign(this.wheel));
      this.wheel -= Math.sign(this.wheel) * WHEEL_STEP;
    }
  }

  /** Mueve el foco a la tecla contigua, que es como se recorre un grupo de botones. */
  moveFocus(steps: number) {
    const midis = this.keys()
      .map(({ pitch }) => pitch.midi)
      .sort((a, b) => a - b);
    const next = midis[Math.max(0, Math.min(midis.length - 1, midis.indexOf(this.tabStop()) + steps))];

    this.focused.set(next);
    this.tiles()
      .find((tile) => tile.key().pitch.midi === next)
      ?.focus();
  }
}

/** Las teclas del piano no deben robarle la escritura a un campo de texto. */
function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName);
}
