import { Component, computed, inject, signal } from '@angular/core';
import { Piano } from './components/piano/piano';
import { SynthPanel } from './components/synth-panel/synth-panel';
import { Lane } from './components/lane/lane';
import { Lesson } from './components/lesson/lesson';
import { Transport } from './components/transport/transport';
import { Visualizer } from './components/visualizer/visualizer';
import { chordName } from './music/chords';
import { chordColor } from './music/color';
import { Settings } from './settings';
import { Player } from './transport/player';
import { Synth } from './synth/synth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [Lane, Lesson, Piano, SynthPanel, Transport, Visualizer],
  host: {
    '[style.--tone-color]': 'color()',
  },
})
export class App {
  private readonly synth = inject(Synth);

  protected readonly settings = inject(Settings);
  private readonly player = inject(Player);

  readonly isPlay = computed(() => this.settings.mode() === 'play');
  readonly hasTrack = computed(() => !!this.player.song());
  /** El visualizador se aparta cuando hay carril o leccion que enseñar. */
  readonly compact = computed(() => !this.isPlay() || this.hasTrack());

  readonly color = computed(() => chordColor(this.synth.playing()));
  readonly chord = computed(() => chordName(this.synth.playing()));
  readonly playing = computed(() => this.synth.playing().length > 0);
  readonly darkmode = signal(false);
  readonly panel = signal(false);

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
