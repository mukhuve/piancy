import { Component, inject, output } from '@angular/core';
import { Lessons } from '../../learn/lessons';
import { Midi } from '../../input/midi';
import { Settings } from '../../settings';

/** Los interruptores que no caben en la barra: lo que se ve y lo que se guarda. */
@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.html',
  styleUrls: ['./settings-menu.scss'],
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class SettingsMenu {
  readonly closed = output<void>();

  protected readonly settings = inject(Settings);
  protected readonly midi = inject(Midi);
  protected readonly lessons = inject(Lessons);

  protected readonly toggles = [
    { label: 'Typing hints on keys', state: this.settings.typing },
    { label: 'Spectrum in visualiser', state: this.settings.spectrum },
  ];

  protected resetProgress() {
    this.lessons.resetProgress();
    this.closed.emit();
  }
}
