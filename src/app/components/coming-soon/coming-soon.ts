import { Component, inject } from '@angular/core';
import { I18n, TextKey } from '../../i18n/i18n';

/** Las cinco pistas de la carrera, que avanzan en paralelo y no en fila. */
const TRACKS: readonly { name: TextKey; about: TextKey }[] = [
  { name: 'soon.instrument', about: 'soon.instrumentAt' },
  { name: 'soon.language', about: 'soon.languageAt' },
  { name: 'soon.ear', about: 'soon.earAt' },
  { name: 'soon.harmony', about: 'soon.harmonyAt' },
  { name: 'soon.creation', about: 'soon.creationAt' },
];

/**
 * Lo que ocupa el sitio de Aprender mientras se rehace. Un cartel vacio no dice
 * nada, asi que enseña de que va a ir: las pistas del temario y sus seis niveles.
 */
@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.html',
  styleUrls: ['./coming-soon.scss'],
})
export class ComingSoon {
  protected readonly t = inject(I18n).t;
  protected readonly tracks = TRACKS;
  protected readonly levels = [1, 2, 3, 4, 5, 6];
}
