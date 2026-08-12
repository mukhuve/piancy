import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { I18n } from '../../i18n/i18n';
import { SHIFT_KEYS } from '../../input/computer-keys';
import { Keyboard } from '../../keyboard/keyboard';
import { WHITE_KEYS } from '../../music/keyboard';
import { Settings } from '../../settings';
import { Synth } from '../../synth/synth';
import { Keymap } from '../keymap/keymap';
import { Legend } from '../legend/legend';
import { Tile } from '../tile/tile';

/** Rueda acumulada que hace falta para desplazar una tecla. */
const WHEEL_STEP = 26;

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
  /** Cual de los paneles laterales esta abierto, para marcar el boton del suyo. */
  readonly aside = input<string | null>(null);

  /** El boton que lo pide, que es a quien hay que devolverle el foco al cerrar. */
  readonly asideToggled = output<HTMLElement>();

  private readonly synth = inject(Synth);
  private readonly tiles = viewChildren(Tile);

  protected readonly keyboard = inject(Keyboard);
  protected readonly settings = inject(Settings);
  protected readonly t = inject(I18n).t;

  readonly focused = signal(WHITE_KEYS[0]);

  /**
   * Tecla que entra en el orden de tabulacion; las flechas mueven el foco entre las
   * demas. Si la enfocada se sale al desplazar la ventana, entra la primera visible:
   * el teclado nunca puede quedarse sin punto de entrada.
   */
  readonly tabStop = computed(() => {
    const midis = this.keyboard.keys().map(({ pitch }) => pitch.midi);

    return midis.includes(this.focused()) ? this.focused() : Math.min(...midis);
  });

  private wheel = 0;

  constructor() {
    effect(() => this.keyboard.octaves.set(this.octaves()));
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
      this.keyboard.move(SHIFT_KEYS[key]);

      return;
    }

    const midi = this.keyboard.midiFor(key);

    if (midi === undefined) return;

    event.preventDefault();
    this.synth.noteOn(midi);
  }

  release(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (key === ' ') {
      this.synth.sustain.set(false);

      return;
    }

    const midi = this.keyboard.midiFor(key);

    if (midi !== undefined) this.synth.noteOff(midi);
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
      this.keyboard.move(Math.sign(this.wheel));
      this.wheel -= Math.sign(this.wheel) * WHEEL_STEP;
    }
  }

  /** Mueve el foco a la tecla contigua, que es como se recorre un grupo de botones. */
  moveFocus(steps: number) {
    const midis = this.keyboard
      .keys()
      .map(({ pitch }) => pitch.midi)
      .sort((a, b) => a - b);
    const next =
      midis[Math.max(0, Math.min(midis.length - 1, midis.indexOf(this.tabStop()) + steps))];

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
