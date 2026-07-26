import { Component, computed, inject, signal } from '@angular/core';
import { Piano } from './components/piano/piano';
import { chordColor } from './music/color';
import { Synth } from './synth/synth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [Piano],
  host: {
    '[style.--tone-color]': 'color()',
  },
})
export class App {
  private readonly synth = inject(Synth);

  readonly color = computed(() => chordColor(this.synth.playing()));
  readonly playing = computed(() => this.synth.playing().length > 0);
  readonly darkmode = signal(false);

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
