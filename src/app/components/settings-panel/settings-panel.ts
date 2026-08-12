import { Component, WritableSignal, inject } from '@angular/core';
import { I18n, TextKey } from '../../i18n/i18n';
import { Midi } from '../../input/midi';
import { Settings } from '../../settings';

/** Lo que se ve y en que idioma. Comparte sitio con el panel de sonido. */
@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.html',
  styleUrls: ['./settings-panel.scss'],
})
export class SettingsPanel {
  protected readonly settings = inject(Settings);
  protected readonly midi = inject(Midi);
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  protected readonly toggles: readonly { key: TextKey; state: WritableSignal<boolean> }[] = [
    { key: 'settings.typing', state: this.settings.typing },
    { key: 'settings.hints', state: this.settings.hints },
    { key: 'settings.colour', state: this.settings.colour },
    { key: 'settings.spectrum', state: this.settings.spectrum },
    { key: 'settings.transport', state: this.settings.transport },
  ];
}
