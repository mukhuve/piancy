import { CommonModule } from '@angular/common';
import { PianoComponent } from './components/piano/piano.component';
import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, PianoComponent],
})
export class AppComponent {
  title = 'piancy';

  @HostBinding('style.background-color')
  color = 'rgb(0, 0, 0)';

  set frequency(frequency: number) {
    const light = this.soundToLight(frequency);
    const rgb = this.lightToRGB(light);

    this.color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  constructor() {}

  soundToLight(frequency: number) {
    const minSound = 220; // 20 Hz (sonido más grave perceptible)
    const maxSound = 800; // 20,000 Hz (sonido más agudo perceptible)
    const minLight = 700; // 700 nm (rojo)
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

  colorize(frequencies: number[]) {
    const colors = frequencies
      .map((frequency) => this.soundToLight(frequency))
      .map((light) => this.lightToRGB(light));

    // conbine rgb colors
    const rgb = colors.reduce(
      (acc, color) => {
        const { r, g, b } = color;
        acc.r += r;
        acc.g += g;
        acc.b += b;
        return acc;
      },
      { r: 0, g: 0, b: 0 }
    );

    this.color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
}
