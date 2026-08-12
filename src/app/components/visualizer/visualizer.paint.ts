import { Canvas } from '../../canvas/paint';
import { colorOf, toCss } from '../../music/color';
import { Key } from '../../music/keyboard';

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

/**
 * Una linea por nota sonando, cada una plantada sobre su tecla y del color de esa
 * nota. Cae justo encima porque el lienzo y el teclado miden lo mismo, que es lo
 * que permite leer el grafico mirando el teclado. Lo que suene fuera de la ventana
 * visible no se pinta: no hay tecla debajo sobre la que ponerlo.
 */
export function drawVoices(
  { ctx, width, height }: Canvas,
  keys: readonly Key[],
  notes: readonly number[],
  tint?: string
) {
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;

  keys
    .filter(({ pitch }) => notes.includes(pitch.midi))
    .forEach(({ pitch, x, width: keyWidth }) => {
      ctx.strokeStyle = tint ?? toCss(colorOf(pitch.midi));
      line(ctx, Math.round((x + keyWidth / 2) * width) + 0.5, 0, undefined, height);
    });

  ctx.globalAlpha = 1;
}

/** Lo que una voz devuelve de si misma para poder dibujarla. */
export interface VoiceWave {
  readonly midi: number;
  readonly wave: Uint8Array;
}

/** Grosor del trazo de una onda. Es la linea que manda del grafico. */
const WAVE_WIDTH = 2.2;
/** Cuanto del alto ocupa una onda a plena pulsacion, de su eje a su cresta. */
const WAVE_FILL = 0.82;
/**
 * Pico al que llega una voz suelta a plena pulsacion, que es el fondo de escala del
 * grafico. Sin escalar, la onda ocuparia la mitad del sitio que tiene y se veria
 * mucho mas plana de lo que suena.
 */
const VOICE_PEAK = 0.55;
/** Opacidad de cada onda: por debajo del cruce tienen que verse las dos. */
const WAVE_ALPHA = 0.75;

/**
 * Una onda por nota, todas sobre el mismo eje. Una sola linea para todas es la que
 * sale del bus, o sea la suma: en cuanto suenan dos notas no se distingue ninguna de
 * las dos. Trazadas aparte y superpuestas se ve que hace cada una —su periodo, su
 * envolvente, su color— y ademas donde se cruzan, que es lo que hace el acorde.
 */
export function drawWaves(
  { ctx, width, height }: Canvas,
  voices: readonly VoiceWave[],
  idle: string,
  tint?: string
) {
  const middle = height / 2;

  ctx.lineWidth = WAVE_WIDTH;
  ctx.lineJoin = 'round';

  if (!voices.length) {
    ctx.strokeStyle = idle;
    line(ctx, 0, Math.round(middle) + 0.5, width, undefined);

    return;
  }

  const amplitude = middle * WAVE_FILL;

  ctx.globalAlpha = WAVE_ALPHA;

  voices.forEach(({ midi, wave }) => {
    ctx.strokeStyle = tint ?? toCss(colorOf(midi));
    ctx.beginPath();
    trace(ctx, wave, width, middle, amplitude);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
}

/** Muestras por pixel de ancho. Mas no se ven, y una nota grave trae miles. */
const SAMPLES_PER_PIXEL = 2;

/**
 * La onda, punto a punto y redondeando las esquinas. Uniendo las muestras con rectas
 * la curva sale poligonal —una nota aguda trae pocas muestras por ciclo y cada una
 * se estira sobre varios pixeles—, asi que cada muestra pasa a ser el tirador de una
 * curva cuadratica y el trazo se cierra por el punto medio entre ella y la
 * siguiente: la linea sale continua sin inventarse nada entre medias.
 *
 * La ventana la marca la nota mas grave, y un la grave trae siete mil muestras para
 * mil y pico pixeles: de esas se toma una de cada tantas, porque dibujar mas puntos
 * que pixeles no añade nada a lo que se ve y son doce voces por fotograma.
 */
function trace(
  ctx: CanvasRenderingContext2D,
  wave: Uint8Array,
  width: number,
  middle: number,
  amplitude: number
) {
  const step = Math.max(1, Math.ceil(wave.length / (width * SAMPLES_PER_PIXEL)));
  const at = (i: number) => {
    const level = Math.max(-1, Math.min(1, (wave[i] - 128) / 128 / VOICE_PEAK));

    return { x: (i / (wave.length - 1)) * width, y: middle + level * amplitude };
  };

  let previous = at(0);

  ctx.moveTo(previous.x, previous.y);

  for (let i = step; i < wave.length; i += step) {
    const point = at(i);

    ctx.quadraticCurveTo(
      previous.x,
      previous.y,
      (previous.x + point.x) / 2,
      (previous.y + point.y) / 2
    );
    previous = point;
  }

  ctx.lineTo(previous.x, previous.y);
}

function line(ctx: CanvasRenderingContext2D, x: number, y: number, toX = x, toY = y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}
