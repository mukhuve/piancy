import { Injectable, computed, inject, signal } from '@angular/core';
import { Synth } from '../synth/synth';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const COMMAND = 0xf0;
const MAX_VELOCITY = 127;

/**
 * Teclados MIDI conectados al ordenador. Suenan por el mismo motor que el teclado
 * de pantalla, con la fuerza con la que se pulsa cada tecla.
 *
 * El permiso se pide solo cuando alguien lo manda: el navegador abre un dialogo, y
 * hacerlo al arrancar recibe al usuario con una pregunta que casi nunca esperaba,
 * ademas de dejar la promesa colgada —y el estado a medias— si la ignora.
 */
@Injectable({ providedIn: 'root' })
export class Midi {
  readonly status = signal(supported() ? 'MIDI off' : 'MIDI N/A');
  readonly connected = computed(() => this.status().includes('IN'));
  readonly available = computed(() => supported() && !this.connected());

  private readonly synth = inject(Synth);

  async connect() {
    if (!supported()) return;

    this.status.set('Connecting…');

    try {
      const access = await navigator.requestMIDIAccess();
      const inputs = [...access.inputs.values()];

      this.status.set(inputs.length ? `MIDI ${inputs.length} IN` : 'MIDI READY');
      inputs.forEach((input) => (input.onmidimessage = (message) => this.receive(message)));
    } catch {
      this.status.set('MIDI denied');
    }
  }

    /** Un note on sin fuerza es en realidad un note off: asi lo mandan muchos teclados. */
  private receive({ data }: MIDIMessageEvent) {
    if (!data) return;

    const [status, note, velocity] = data;

    if ((status & COMMAND) === NOTE_ON && velocity > 0) {
      this.synth.noteOn(note, velocity / MAX_VELOCITY);
    } else if ((status & COMMAND) === NOTE_OFF || (status & COMMAND) === NOTE_ON) {
      this.synth.noteOff(note);
    }
  }
}

function supported() {
  return typeof navigator.requestMIDIAccess === 'function';
}
