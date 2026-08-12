import { Component, computed, inject, signal } from '@angular/core';
import { ComingSoon } from './components/coming-soon/coming-soon';
import { Lane } from './components/lane/lane';
import { Piano } from './components/piano/piano';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { SynthPanel } from './components/synth-panel/synth-panel';
import { Transport } from './components/transport/transport';
import { Visualizer } from './components/visualizer/visualizer';
import { I18n } from './i18n/i18n';
import { Viewport } from './layout/viewport';
import { chordName } from './music/chords';
import { chordColor } from './music/color';
import { Settings } from './settings';
import { Synth } from './synth/synth';
import { Player } from './transport/player';
import { BPM_RANGE, Transport as TransportState } from './transport/transport';

/** Los dos paneles laterales comparten sitio: abrir uno cierra el otro. */
type Aside = 'synth' | 'settings' | null;

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [ComingSoon, Lane, Piano, SettingsPanel, SynthPanel, Transport, Visualizer],
  host: {
    '[style.--tone-color]': 'color()',
    '(document:keydown.escape)': 'closeAside()',
  },
})
export class App {
  private readonly player = inject(Player);

  protected readonly synth = inject(Synth);
  protected readonly settings = inject(Settings);
  protected readonly transport = inject(TransportState);
  protected readonly viewport = inject(Viewport);
  protected readonly bpmRange = BPM_RANGE;
  protected readonly t = inject(I18n).t;

  readonly isPlay = computed(() => this.settings.mode() === 'play');
  /**
   * Cuantas octavas caben tocandose con el dedo. En un movil tumbado, tres octavas
   * dejan la tecla blanca en 38 px y dos en 56: por debajo de 44 se falla la nota.
   */
  readonly octaves = computed(() => (this.viewport.compact() ? 2 : 3));
  /**
   * En un movil tumbado no caben el escenario y el teclado a la vez, y en Aprender lo
   * que hay que leer es el escenario: en la franja de 69 px que le quedaba, el cartel
   * salia con barra de desplazamiento. Se retira el teclado y la pantalla es entera
   * para el. En Tocar manda el teclado, que es justo al reves.
   */
  readonly poster = computed(() => this.viewport.compact() && !this.isPlay());
  /**
   * En un movil el grafico se mete en la franja de arriba, junto a los botones. Como
   * panel se llevaba 69 px de 390 para decir lo mismo que dice de tira: la onda de lo
   * que suena. Esos 69 px son un tercio de tecla.
   */
  readonly scopeInStrip = computed(() => this.viewport.compact() && this.isPlay());
  /** El escenario solo existe si le queda algo que enseñar: el carril o el cartel. */
  readonly hasStage = computed(() => !this.scopeInStrip() || this.hasTrack());
  /** Lo que dura un pulso: la aguja tarda justo eso en cruzar de un lado al otro. */
  readonly beatSeconds = computed(() => (60 / this.transport.bpm()).toFixed(3));
  readonly hasTrack = computed(() => !!this.player.song());

  readonly color = computed(() =>
    this.settings.colour() ? chordColor(this.synth.playing()) : 'transparent'
  );
  readonly chord = computed(() => chordName(this.synth.playing()));
  readonly darkmode = signal(false);
  readonly aside = signal<Aside>(null);

  /** Boton que abrio el panel, para devolverle el foco cuando se cierre solo. */
  private opener: HTMLElement | null = null;

  toggleAside(which: Exclude<Aside, null>, opener: HTMLElement) {
    const open = this.aside() === which ? null : which;

    this.aside.set(open);
    this.opener = open ? opener : null;
  }

  /** Al cerrar con Escape el foco se quedaria dentro de un panel que ya no esta. */
  closeAside() {
    if (!this.aside()) return;

    this.aside.set(null);
    this.opener?.focus();
    this.opener = null;
  }

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
