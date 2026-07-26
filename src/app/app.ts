import { Component, computed, inject, signal } from '@angular/core';
import { Piano } from './components/piano/piano';
import { SynthPanel } from './components/synth-panel/synth-panel';
import { Lane } from './components/lane/lane';
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
  imports: [Lane, Piano, SynthPanel, Transport, Visualizer],
  host: {
    '[style.--tone-color]': 'color()',
  },
})
export class App {
  private readonly synth = inject(Synth);

  protected readonly settings = inject(Settings);
  private readonly player = inject(Player);

  readonly hasTrack = computed(() => !!this.player.song());

  readonly color = computed(() => chordColor(this.synth.playing()));
  readonly chord = computed(() => chordName(this.synth.playing()));
  readonly playing = computed(() => this.synth.playing().length > 0);
  readonly darkmode = signal(false);
  readonly panel = signal(false);

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
