import { Component, computed, inject, signal } from '@angular/core';
import { Lane } from './components/lane/lane';
import { Lesson } from './components/lesson/lesson';
import { Piano } from './components/piano/piano';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { SynthPanel } from './components/synth-panel/synth-panel';
import { Transport } from './components/transport/transport';
import { Visualizer } from './components/visualizer/visualizer';
import { chordName } from './music/chords';
import { chordColor } from './music/color';
import { Settings } from './settings';
import { Synth } from './synth/synth';
import { Player } from './transport/player';

/** Los dos paneles laterales comparten sitio: abrir uno cierra el otro. */
type Aside = 'synth' | 'settings' | null;

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [Lane, Lesson, Piano, SettingsPanel, SynthPanel, Transport, Visualizer],
  host: {
    '[style.--tone-color]': 'color()',
  },
})
export class App {
  private readonly synth = inject(Synth);
  private readonly player = inject(Player);

  protected readonly settings = inject(Settings);

  readonly isPlay = computed(() => this.settings.mode() === 'play');
  readonly hasTrack = computed(() => !!this.player.song());

  readonly color = computed(() => chordColor(this.synth.playing()));
  readonly chord = computed(() => chordName(this.synth.playing()));
  readonly darkmode = signal(false);
  readonly aside = signal<Aside>(null);

  toggleAside(which: Exclude<Aside, null>) {
    this.aside.update((open) => (open === which ? null : which));
  }

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
