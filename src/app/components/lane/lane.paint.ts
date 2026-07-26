import { Canvas } from '../../canvas/paint';
import { colorOf, toCss } from '../../music/color';
import { Key } from '../../music/keyboard';
import { Song } from '../../music/songs';
import { NoteState } from '../../transport/player';

/** Altura del carril que recorre una nota por segundo. */
const SPEED = 1 / 2.6;
/** A que altura del carril se golpea la nota. */
const HIT_LINE = 22;
const MIN_NOTE = 10;

export interface LaneFrame {
  readonly song: Song;
  readonly keys: readonly Key[];
  readonly states: readonly NoteState[];
  readonly secondsPerBeat: number;
  readonly elapsed: number;
}

/** Guias verticales alineadas con las blancas, para leer a que tecla cae cada nota. */
export function drawGuides({ ctx, width, height }: Canvas, keys: readonly Key[], color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;

  keys
    .filter(({ black }) => !black)
    .forEach(({ x }) => {
      const at = Math.round(x * width) + 0.5;

      ctx.beginPath();
      ctx.moveTo(at, 0);
      ctx.lineTo(at, height);
      ctx.stroke();
    });

  ctx.globalAlpha = 1;
}

/**
 * Las notas caen hacia la linea de golpeo: cuanto mas lejos esta su momento, mas
 * arriba se dibujan. Las acertadas se apagan y las perdidas pierden el color.
 */
export function drawNotes(canvas: Canvas, frame: LaneFrame, missed: string, edge: string) {
  const { ctx, width, height } = canvas;
  const { song, states, secondsPerBeat, elapsed } = frame;
  const positions = keyPositions(frame.keys);
  const hitLine = height - HIT_LINE;

  song.notes.forEach((note, i) => {
    const key = positions.get(note.midi);

    if (!key) return;

    const length = Math.max(MIN_NOTE, note.duration * secondsPerBeat * height * SPEED);
    const bottom = hitLine - (note.at * secondsPerBeat - elapsed) * height * SPEED;

    if (bottom < -length || bottom - length > height) return;

    ctx.globalAlpha = states[i] === 'hit' ? 0.25 : 1;
    ctx.fillStyle = states[i] === 'miss' ? missed : toCss(colorOf(note.midi));
    ctx.fillRect(key.x * width + 2, bottom - length, key.width * width - 4, length);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.strokeRect(key.x * width + 2.5, bottom - length + 0.5, key.width * width - 5, length - 1);
  });
}

export function drawHitLine({ ctx, width, height }: Canvas, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height - HIT_LINE);
  ctx.lineTo(width, height - HIT_LINE);
  ctx.stroke();
}

export function drawCountdown({ ctx, width, height }: Canvas, count: number, color: string) {
  if (count <= 0) return;

  ctx.fillStyle = color;
  ctx.font = '600 64px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(count), width / 2, height / 2 + 22);
  ctx.textAlign = 'left';
}

function keyPositions(keys: readonly Key[]) {
  return new Map(keys.map((key) => [key.pitch.midi, key]));
}
