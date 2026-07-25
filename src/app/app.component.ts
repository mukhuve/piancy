import { Component, signal } from '@angular/core';
import { PianoComponent, PianoNotes } from './components/piano/piano.component';
import { notesToColor } from './helpers/colors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [PianoComponent],
  host: {
    '[style.--tone-color]': 'color()',
  },
})
export class AppComponent {
  readonly color = signal('');
  readonly darkmode = signal(false);

  colorize({ notes, range }: PianoNotes) {
    this.color.set(notesToColor(notes, range));
  }

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
