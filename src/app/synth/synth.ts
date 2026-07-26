import { Injectable, effect, signal } from '@angular/core';
import { frequencyOf } from '../music/pitch';
import { Bus, createBus } from './bus';
import { DEFAULT_PRESET, PRESETS, PresetName, SynthParams } from './presets';
import { Voice, playVoice } from './voice';

/** Voces simultaneas antes de robar la mas antigua. */
const MAX_VOICES = 12;

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
  private times?: Uint8Array<ArrayBuffer>;
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

  waveform() {
    if (!this.bus) return undefined;

    this.times ??= new Uint8Array(this.bus.analyser.fftSize);
    this.bus.analyser.getByteTimeDomainData(this.times);

    return this.times;
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
