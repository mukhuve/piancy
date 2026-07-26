import { Component, inject } from '@angular/core';
import { Midi } from '../../input/midi';
import { Lessons } from '../../learn/lessons';
import { Settings } from '../../settings';

/** Lo que se ve y lo que se guarda. Comparte sitio con el panel de sonido. */
@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.html',
  styleUrls: ['./settings-panel.scss'],
})
export class SettingsPanel {
  protected readonly settings = inject(Settings);
  protected readonly midi = inject(Midi);
  protected readonly lessons = inject(Lessons);

  protected readonly toggles = [
    { label: 'Typing hints on keys', state: this.settings.typing },
    { label: 'Note names and degrees', state: this.settings.hints },
    { label: 'Spectrum in visualiser', state: this.settings.spectrum },
    { label: 'Practice bar', state: this.settings.transport },
  ];
}
