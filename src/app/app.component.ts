import { Component, signal } from '@angular/core';
import { PianoComponent, PianoNotes } from './components/piano/piano.component';

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
  title = 'piancy';

  readonly color = signal('');
  readonly darkmode = signal(false);

  soundToLight(frequency: number, range: [number, number] = [220, 880]) {
    const [minSound, maxSound] = range; // [220, 880] Hz (sonido más grave y más agudo del piano)
    const minLight = 630; // 700 nm (rojo)
    const maxLight = 400; // 400 nm (violeta)
    const deltaSound = maxSound - minSound; // Diferencia entre la frecuencia más aguda y la más grave
    const deltaLight = maxLight - minLight; // Diferencia entre la longitud de onda más larga y la más corta
    const proportion = deltaLight / deltaSound;

    return minLight + (frequency - minSound) * proportion;
  }

  // Función para convertir una longitud de onda visible (en nm) a un objeto RGB
  lightToRGB(light: number) {
    let r, g, b;
    if (light >= 380 && light < 440) {
      r = -(light - 440) / (440 - 380);
      g = 0.0;
      b = 1.0;
    } else if (light >= 440 && light < 490) {
      r = 0.0;
      g = (light - 440) / (490 - 440);
      b = 1.0;
    } else if (light >= 490 && light < 510) {
      r = 0.0;
      g = 1.0;
      b = -(light - 510) / (510 - 490);
    } else if (light >= 510 && light < 580) {
      r = (light - 510) / (580 - 510);
      g = 1.0;
      b = 0.0;
    } else if (light >= 580 && light < 645) {
      r = 1.0;
      g = -(light - 645) / (645 - 580);
      b = 0.0;
    } else if (light >= 645 && light <= 780) {
      r = 1.0;
      g = 0.0;
      b = 0.0;
    } else {
      r = 0.0;
      g = 0.0;
      b = 0.0;
    }

    const factor = 255;
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);

    return { r, g, b };
  }

  colorize({ notes, range }: PianoNotes) {
    const rgb = notes
      .map((frequency) => this.soundToLight(frequency, range))
      .map((light) => this.lightToRGB(light))
      .reduce(
        (acc, { r, g, b }) => ({ r: acc.r + r, g: acc.g + g, b: acc.b + b }),
        { r: 0, g: 0, b: 0 }
      );

    const silent = rgb.r + rgb.g + rgb.b === 0;
    this.color.set(silent ? '' : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  }

  toggleDarkMode() {
    this.darkmode.set(document.documentElement.classList.toggle('dark'));
  }
}
