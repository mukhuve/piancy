import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Keyboard } from '../keyboard/keyboard';
import { SONGS, Song, songRange } from '../music/songs';
import { Synth } from '../synth/synth';

/** Margen para dar una nota por acertada, en segundos a cada lado. */
const WINDOW = 0.26;
/** Cada cuanto se revisa si han pasado notas sin tocar. */
const TICK = 60;
/** Silencio que se deja al final antes de dar la cancion por terminada. */
const TAIL = 1.6;

const COUNT_IN = { from: 3, every: 700, beep: 1400, last: 1800 };

export type NoteState = 'pending' | 'hit' | 'miss';

/** Como va la cancion: que nota toca, cuales se han acertado y cuales se han ido. */
@Injectable({ providedIn: 'root' })
export class Player {
  readonly songs = SONGS;
  readonly song = signal<Song | undefined>(undefined);
  readonly running = signal(false);
  readonly countdown = signal(0);
  /** Entre 0.5 y 1: por debajo de 1 la cancion se toca mas despacio. */
  readonly speed = signal(1);

  readonly hits = signal(0);
  readonly misses = signal(0);
  readonly streak = signal(0);
  readonly states = signal<readonly NoteState[]>([]);

  readonly busy = computed(() => this.running() || this.countdown() > 0);

  private readonly synth = inject(Synth);
  private readonly keyboard = inject(Keyboard);

  private startedAt = 0;
  private ticker?: ReturnType<typeof setInterval>;
  private counter?: ReturnType<typeof setInterval>;
  private previous: readonly number[] = [];

  constructor() {
    // las notas que se acaban de pulsar son las que se juzgan
    effect(() => {
      const playing = this.synth.playing();
      const fresh = playing.filter((midi) => !this.previous.includes(midi));

      this.previous = playing;

      if (this.running()) fresh.forEach((midi) => this.judge(midi));
    });
  }

  /** Segundos que dura un pulso al tempo y la velocidad elegidos. */
  secondsPerBeat(song = this.song()) {
    return song ? 60 / (song.bpm * this.speed()) : 0;
  }

  /** Segundos desde que arranco la cancion. */
  elapsed() {
    return this.running() ? (performance.now() - this.startedAt) / 1000 : 0;
  }

  choose(song: Song | undefined) {
    this.stop();
    this.song.set(song);
    this.reset();

    if (song) {
      const [lowest, highest] = songRange(song);

      this.keyboard.centerOn(Math.round((lowest + highest) / 2));
    }
  }

  /** Tres pitidos de entrada y a tocar; el ultimo suena mas agudo. */
  countIn() {
    const song = this.song();

    if (!song) return;

    let remaining = COUNT_IN.from;

    this.countdown.set(remaining);
    this.synth.blip(COUNT_IN.beep, 0.06, 0.12);

    clearInterval(this.counter);
    this.counter = setInterval(() => {
      remaining--;
      this.countdown.set(Math.max(0, remaining));

      if (remaining > 0) {
        this.synth.blip(COUNT_IN.beep, 0.06, 0.12);

        return;
      }

      clearInterval(this.counter);
      this.synth.blip(COUNT_IN.last, 0.09, 0.16);
      this.start();
    }, COUNT_IN.every);
  }

  start() {
    const song = this.song();

    if (!song) return;

    this.reset();
    this.startedAt = performance.now();
    this.running.set(true);

    clearInterval(this.ticker);
    this.ticker = setInterval(() => this.tick(), TICK);
  }

  stop() {
    clearInterval(this.ticker);
    clearInterval(this.counter);
    this.running.set(false);
    this.countdown.set(0);
  }

  private reset() {
    this.states.set(this.song()?.notes.map(() => 'pending' as NoteState) ?? []);
    this.hits.set(0);
    this.misses.set(0);
    this.streak.set(0);
  }

  /** Marca como perdidas las notas cuyo momento ya paso, y cierra al terminar. */
  private tick() {
    const song = this.song();

    if (!song) return this.stop();

    const beat = this.secondsPerBeat(song);
    const now = this.elapsed();
    const states = [...this.states()];
    let lost = 0;
    let last = 0;

    song.notes.forEach((note, i) => {
      last = Math.max(last, (note.at + note.duration) * beat);

      if (states[i] === 'pending' && now > note.at * beat + WINDOW) {
        states[i] = 'miss';
        lost++;
      }
    });

    if (lost) {
      this.states.set(states);
      this.misses.update((misses) => misses + lost);
      this.streak.set(0);
    }

    if (now > last + TAIL) this.stop();
  }

  private judge(midi: number) {
    const song = this.song();

    if (!song) return;

    const beat = this.secondsPerBeat(song);
    const now = this.elapsed();
    const index = song.notes.findIndex(
      (note, i) =>
        this.states()[i] === 'pending' &&
        note.midi === midi &&
        Math.abs(note.at * beat - now) < WINDOW
    );

    if (index < 0) return;

    this.states.update((states) => states.map((state, i) => (i === index ? 'hit' : state)));
    this.hits.update((hits) => hits + 1);
    this.streak.update((streak) => streak + 1);
  }
}
