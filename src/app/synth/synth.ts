import { Injectable, effect, signal } from '@angular/core';
import { frequencyOf } from '../music/pitch';
import { Bus, createBus } from './bus';
import { DEFAULT_PRESET, PRESETS, PresetName, SynthParams } from './presets';
import { Voice, playVoice } from './voice';

/** Voces simultaneas antes de robar la mas antigua. */
const MAX_VOICES = 12;

/**
 * Ciclos de la nota mas grave que se encuadran en el grafico. Pocos dejan la onda
 * sin forma y muchos la aprietan hasta que no se distingue de un rayado.
 */
const SCOPE_CYCLES = 4;

/**
 * El instrumento entero: una voz por nota sonando sobre un bus de efectos comun.
 * El contexto de audio no se abre hasta la primera nota, que es lo que exige la
 * politica de reproduccion de los navegadores.
 */
@Injectable({ providedIn: 'root' })
export class Synth {
  readonly preset = signal<PresetName>(DEFAULT_PRESET);
  readonly params = signal<SynthParams>({ ...PRESETS[DEFAULT_PRESET] });
  readonly volume = signal(0.7);
  readonly sustain = signal(false);
  /** Notas que suenan ahora, de la mas antigua a la mas reciente. */
  readonly playing = signal<number[]>([]);

  private context?: AudioContext;
  private bus?: Bus;
  private frequencies?: Uint8Array<ArrayBuffer>;
  private readonly voices = new Map<number, Voice>();
  /** Notas ya soltadas que el pedal mantiene sonando. */
  private readonly pedal = new Set<number>();

  constructor() {
    effect(() => {
      const params = this.params();
      this.bus?.tune(params);
    });

    effect(() => {
      const volume = this.volume();

      if (this.bus) this.bus.master.gain.value = volume;
    });

    effect(() => {
      if (!this.sustain()) this.releasePedal();
    });
  }

  /**
   * Lecturas del analizador para quien quiera dibujarlas. Vienen vacias mientras no
   * haya sonado nada, que es cuando aun no existe el contexto de audio. El buffer
   * se reaprovecha: se leen sesenta veces por segundo.
   */
  spectrum() {
    if (!this.bus) return undefined;

    this.frequencies ??= new Uint8Array(this.bus.analyser.frequencyBinCount);
    this.bus.analyser.getByteFrequencyData(this.frequencies);

    return this.frequencies;
  }

  /**
   * La onda de cada nota por separado, de la mas grave a la mas aguda. Una sola onda
   * para todas es la suma de las que suenan, donde no se distingue ninguna: lo que
   * deja ver que hace cada nota es tenerlas aparte.
   *
   * Todas se miran por la misma ventana de tiempo, y la ventana la marca la nota mas
   * grave. Eso es lo que convierte el dibujo en una lectura de la armonia: en la
   * ventana en la que la grave da cuatro ciclos, la octava de encima da ocho justos y
   * la quinta seis, y la relacion se ve sin contar nada. Recortando cada una a su
   * propio periodo —que es lo que se hacia— un la de 440 y el de 220 salian iguales.
   */
  waves() {
    const midis = [...this.voices.keys()].sort((a, b) => a - b);

    if (!midis.length || !this.context) return [];

    const window = (this.context.sampleRate / frequencyOf(midis[0])) * SCOPE_CYCLES;

    return midis.map((midi) => ({ midi, wave: this.voices.get(midi)!.waveform(window) }));
  }

  noteOn(midi: number, velocity = 0.85) {
    const context = this.open();

    this.release(midi);
    this.voices.set(
      midi,
      playVoice(context, this.bus!.sends, this.params(), frequencyOf(midi), velocity)
    );

    if (this.voices.size > MAX_VOICES) {
      this.release(this.voices.keys().next().value!);
    }

    this.sync();
  }

  noteOff(midi: number) {
    if (this.sustain() && this.voices.has(midi)) {
      this.pedal.add(midi);
      this.sync();

      return;
    }

    this.release(midi);
    this.sync();
  }

  /**
   * Un pitido corto y seco, para el metronomo y las cuentas atras. Entra por detras
   * del analisis: no es una nota, no debe arrastrar eco ni reverb, y sobre todo no
   * debe salir dibujado en el grafico como si alguien la hubiera tocado.
   */
  blip(frequency: number, seconds: number, gain: number) {
    const context = this.open();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const amp = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(gain, now + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0005, now + seconds);

    oscillator.connect(amp);
    amp.connect(this.bus!.clicks);
    oscillator.start(now);
    oscillator.stop(now + seconds + 0.05);
  }

  /** Suelta todo lo que suene: al cambiar de rango quedarian notas colgadas. */
  panic() {
    [...this.voices.keys()].forEach((midi) => this.release(midi));
    this.sync();
  }

  usePreset(name: PresetName) {
    this.preset.set(name);
    this.params.set({ ...PRESETS[name] });
  }

  setParam<K extends keyof SynthParams>(key: K, value: SynthParams[K]) {
    this.params.update((params) => ({ ...params, [key]: value }));
  }

  private release(midi: number) {
    this.voices.get(midi)?.stop(this.params().release);
    this.voices.delete(midi);
    this.pedal.delete(midi);
  }

  private releasePedal() {
    this.pedal.forEach((midi) => this.release(midi));
    this.sync();
  }

  /** El estado que ve la UI sale siempre de las voces vivas, nunca en paralelo. */
  private sync() {
    this.playing.set([...this.voices.keys()]);
  }

  private open() {
    if (!this.context) {
      this.context = new AudioContext();
      this.bus = createBus(this.context);
      this.bus.tune(this.params());
      this.bus.master.gain.value = this.volume();
    }

    if (this.context.state === 'suspended') void this.context.resume();

    return this.context;
  }
}
