import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'piancy';
  ctx!: AudioContext;
  keymap: Record<string, [string, OscillatorNode]> = {};

  constructor() {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.error('Tu navegador no soporta la API de AudioContext.');
      return;
    }

    this.ctx = new AudioContext();

    this.keymap = {
      a: ['LA', this.getNote(220.0)],
      w: ['LA#', this.getNote(233.08)],
      s: ['SI', this.getNote(246.94)],
      d: ['DO', this.getNote(261.63)],
      r: ['DO#', this.getNote(277.18)],
      f: ['RE', this.getNote(293.66)],
      t: ['RE#', this.getNote(311.13)],
      g: ['MI', this.getNote(329.63)],
      h: ['FA', this.getNote(349.23)],
      u: ['FA#', this.getNote(369.99)],
      j: ['SOL', this.getNote(392.0)],
      i: ['SOL#', this.getNote(415.3)],
    };
  }

  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    const key = event.key;
    if (!this.keymap[key]) return;
    const [note, oscillator] = this.keymap[key];
    const button = document.getElementById(note) as HTMLButtonElement;
    if (this.keymap[key]) {
      oscillator.connect(this.ctx.destination);
      button.style.backgroundColor = 'green';
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyup(event: KeyboardEvent) {
    const key = event.key;
    if (!this.keymap[key]) return;
    const [note, oscillator] = this.keymap[key];
    const button = document.getElementById(note) as HTMLButtonElement;
    oscillator.disconnect(this.ctx.destination);
    button.style.backgroundColor = '';
  }

  oscillator(frecuency: number) {
    // Verificamos si el navegador soporta la API de AudioContext
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.error('Tu navegador no soporta la API de AudioContext.');
      return;
    }

    // Creamos una instancia de AudioContext
    const audioContext = new AudioContext();

    // Creamos un oscilador
    const oscillator = audioContext.createOscillator();

    // Establecemos la frecuency deseada para el oscilador
    oscillator.frequency.value = frecuency;

    // Conectamos el oscilador al destino de audio (altavoces)
    oscillator.connect(audioContext.destination);

    // Iniciamos el oscilador para generar el sonido
    oscillator.start();

    // Detenemos el sonido después de un tiempo (en este caso, 1 segundo)
    setTimeout(() => oscillator.stop(), 300);
  }

  getNote(frecuency: number) {
    // Creamos un oscilador
    const oscillator = this.ctx.createOscillator();
    // Establecemos la frecuencia deseada para el oscilador
    oscillator.frequency.value = frecuency;
    // Conectamos el oscilador al destino de audio (altavoces)
    oscillator.start();

    return oscillator;
  }
}
