import { Canvas } from '../../canvas/paint';
import { colorOf, toCss } from '../../music/color';

const GRID = { columns: 16, rows: 6 };
const BARS = 64;
/** Primeros bins del analizador: son subgraves y solo ensucian el dibujo. */
const SKIP = 4;
/** Solo se pinta el tercio bajo del espectro, que es donde cae lo que se toca. */
const SPECTRUM = 3;

/** Retícula de fondo, que es lo que le da al panel su aire de instrumento. */
export function drawGrid({ ctx, width, height }: Canvas, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;

  for (let i = 1; i < GRID.columns; i++) {
    line(ctx, Math.round((width * i) / GRID.columns) + 0.5, 0, undefined, height);
  }

  for (let i = 1; i < GRID.rows; i++) {
    line(ctx, 0, Math.round((height * i) / GRID.rows) + 0.5, width, undefined);
  }

  ctx.globalAlpha = 1;
}

/** Barras del analizador, cada una con el pico de su tramo de frecuencias. */
export function drawSpectrum(
  { ctx, width, height }: Canvas,
  spectrum: Uint8Array | undefined,
  color: string
) {
  if (!spectrum) return;

  const step = Math.floor((spectrum.length / SPECTRUM - SKIP) / BARS);

  ctx.fillStyle = color;

  for (let bar = 0; bar < BARS; bar++) {
    let peak = 0;

    for (let i = 0; i < step; i++) peak = Math.max(peak, spectrum[SKIP + bar * step + i]);

    const bearing = (peak / 255) * height * 0.5;

    if (bearing > 1.5) {
      ctx.fillRect((bar * width) / BARS + 1, height - bearing, width / BARS - 2, bearing);
    }
  }
}

/** Una linea por nota sonando, repartidas por altura y en el color de su nota. */
export function drawVoices({ ctx, width, height }: Canvas, notes: readonly number[]) {
  if (!notes.length) return;

  const lowest = Math.min(...notes);
  const highest = Math.max(Math.max(...notes), lowest + 1);

  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;

  notes.forEach((midi) => {
    const x = Math.round(((midi - lowest) / (highest - lowest)) * width * 0.8 + width * 0.1) + 0.5;

    ctx.strokeStyle = toCss(colorOf(midi));
    line(ctx, x, 0, undefined, height);
  });

  ctx.globalAlpha = 1;
}

/** La onda tal cual sale del instrumento, teñida por la nota mas grave. */
export function drawWave(
  { ctx, width, height }: Canvas,
  wave: Uint8Array | undefined,
  notes: readonly number[],
  fallback: string
) {
  if (!wave) return;

  ctx.strokeStyle = notes.length ? toCss(colorOf(Math.min(...notes))) : fallback;
  ctx.lineWidth = 1.6;
  ctx.beginPath();

  for (let i = 0; i < wave.length; i++) {
    const x = (i / (wave.length - 1)) * width;
    const y = height * 0.5 + ((wave[i] - 128) / 128) * height * 0.42;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, x: number, y: number, toX = x, toY = y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}
