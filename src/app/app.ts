import { Component, signal } from '@angular/core';
import { Piano, PianoNotes } from './components/piano/piano';
import { notesToColor } from './helpers/colors';

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
  readonly color = signal('');
  readonly darkmode = signal(false);

  colorize({ notes, range }: PianoNotes) {
    this.color.set(notesToColor(notes, range));
  }

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
