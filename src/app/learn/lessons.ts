import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Keyboard } from '../keyboard/keyboard';
import { EAR_RANGE, LESSONS, Lesson } from '../music/lessons';
import { pitchOf } from '../music/pitch';
import { Settings } from '../settings';
import { Synth } from '../synth/synth';

const STORAGE_KEY = 'piancy.progress';
/** Margen para dar por simultaneas las notas de un acorde. */
const CHORD_WINDOW = 300;
const WRONG_HINT = 600;
const DEMO = { step: 620, hold: 460, tone: 900, velocity: 0.75 };

/** Como va la leccion: que toca ahora, que se ha fallado y que esta superado. */
@Injectable({ providedIn: 'root' })
export class Lessons {
  readonly lessons = LESSONS;
  readonly index = signal(0);
  readonly step = signal(0);
  readonly status = signal('Ready');
  readonly ok = signal(false);
  readonly wrong = signal<number | undefined>(undefined);
  readonly done = signal<ReadonlySet<string>>(load());

  readonly lesson = computed(() => this.lessons[this.index()]);
  readonly cleared = computed(() => this.step() >= this.lesson().steps.length);

  /** Notas que hay que tocar ahora mismo. Las de oido no se enseñan. */
  readonly targets = computed<readonly number[]>(() =>
    this.lesson().kind === 'ear' ? [] : (this.lesson().steps[this.step()] ?? [])
  );

  readonly labels = computed(() =>
    this.targets().map((midi) => pitchOf(midi).name)
  );

  private readonly synth = inject(Synth);
  private readonly keyboard = inject(Keyboard);
  private readonly settings = inject(Settings);

  private readonly target = signal<number | undefined>(undefined);
  /** Cuando se pulso cada nota, para admitir acordes tocados casi a la vez. */
  private readonly recent = new Map<number, number>();
  /** Notas que esta tocando el propio sistema: no las ha tocado el alumno. */
  private readonly auto = new Set<number>();
  private previous: readonly number[] = [];
  private wrongTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const playing = this.synth.playing();
      const fresh = playing.filter((midi) => !this.previous.includes(midi));

      this.previous = playing;
      fresh.forEach((midi) => this.check(midi));
    });

    // el teclado sigue a lo que toca estudiar, pero solo mientras se estudia
    effect(() => {
      if (this.settings.mode() !== 'learn') return;

      const notes = this.targets();

      if (!notes.length) return;

      const center = notes.reduce((total, midi) => total + midi, 0) / notes.length;

      this.keyboard.centerOn(Math.round(center));
    });
  }

  choose(index: number) {
    this.index.set(index);
    this.restart();
  }

  next() {
    this.choose(Math.min(this.lessons.length - 1, this.index() + 1));
  }

  restart() {
    this.step.set(0);
    this.status.set('Ready');
    this.ok.set(false);
    this.wrong.set(undefined);
    this.target.set(undefined);
    this.recent.clear();

    if (this.lesson().kind === 'ear') setTimeout(() => this.playTarget(), 200);
  }

  /** Toca lo que hay que aprender, para poder oirlo antes de intentarlo. */
  demo() {
    if (this.lesson().kind === 'ear') {
      this.playTarget();

      return;
    }

    this.lesson().steps.forEach((notes, i) => {
      setTimeout(() => notes.forEach((midi) => this.sound(midi, DEMO.velocity, DEMO.hold)), i * DEMO.step);
    });
  }

  /** Sortea una nota nueva y la hace sonar; es lo que hay que reconocer. */
  playTarget() {
    const midi =
      this.target() ?? EAR_RANGE.from + Math.floor(Math.random() * EAR_RANGE.notes);

    this.target.set(midi);
    this.status.set('Listening…');
    this.ok.set(false);
    this.sound(midi, 0.8, DEMO.tone);
  }

  /**
   * Toca una nota en nombre del sistema. Queda apuntada mientras suena para que la
   * comprobacion no la confunda con el alumno: si no, la demostracion superaria la
   * leccion ella sola.
   */
  private sound(midi: number, velocity: number, ms: number) {
    this.auto.add(midi);
    this.synth.noteOn(midi, velocity);

    setTimeout(() => {
      this.synth.noteOff(midi);
      this.auto.delete(midi);
    }, ms);
  }

  private check(midi: number) {
    if (this.cleared() || this.auto.has(midi)) return;

    if (this.lesson().kind === 'ear') {
      this.checkEar(midi);

      return;
    }

    this.recent.set(midi, performance.now());
    this.flagWrong(midi);

    const now = performance.now();
    const held = new Set([...this.synth.playing(), midi]);

    this.recent.forEach((at, note) => {
      if (now - at > CHORD_WINDOW) this.recent.delete(note);
      else held.add(note);
    });

    if (!this.targets().every((note) => held.has(note))) return;

    this.recent.clear();
    this.advance();
  }

  private checkEar(midi: number) {
    if (this.target() === undefined) return;

    if (midi !== this.target()) {
      this.status.set('Not that one — listen again');
      this.ok.set(false);

      return;
    }

    this.target.set(undefined);
    this.advance('Correct — next tone');

    if (!this.cleared()) setTimeout(() => this.playTarget(), 700);
  }

  private advance(message = 'Good — next step') {
    const step = this.step() + 1;

    this.step.set(step);
    this.wrong.set(undefined);
    this.ok.set(true);

    if (step >= this.lesson().steps.length) {
      this.status.set('Lesson complete');
      this.markDone(this.lesson());
    } else {
      this.status.set(message);
    }
  }

  /** Avisa un momento de que esa no era la tecla, y dice cual se esperaba. */
  private flagWrong(midi: number) {
    if (this.targets().includes(midi)) return;

    this.wrong.set(midi);
    this.ok.set(false);
    this.status.set(`Expected ${this.labels().join(' + ')}`);

    clearTimeout(this.wrongTimer);
    this.wrongTimer = setTimeout(() => this.wrong.set(undefined), WRONG_HINT);
  }

  private markDone({ id }: Lesson) {
    if (this.done().has(id)) return;

    const done = new Set(this.done()).add(id);

    this.done.set(done);
    save(done);
  }

  resetProgress() {
    this.done.set(new Set());
    save(new Set());
  }
}

function load(): ReadonlySet<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function save(done: ReadonlySet<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    // sin almacenamiento se pierde el progreso, pero la leccion sigue
  }
}
