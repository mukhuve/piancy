import { Component, computed, inject, signal } from '@angular/core';
import { ComingSoon } from './components/coming-soon/coming-soon';
import { Lane } from './components/lane/lane';
import { Piano } from './components/piano/piano';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { SynthPanel } from './components/synth-panel/synth-panel';
import { Transport } from './components/transport/transport';
import { Visualizer } from './components/visualizer/visualizer';
import { I18n } from './i18n/i18n';
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
  private readonly synth = inject(Synth);
  private readonly player = inject(Player);

  protected readonly settings = inject(Settings);
  protected readonly transport = inject(TransportState);
  protected readonly bpmRange = BPM_RANGE;
  protected readonly t = inject(I18n).t;

  readonly isPlay = computed(() => this.settings.mode() === 'play');
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
