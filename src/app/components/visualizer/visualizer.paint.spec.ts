import { Canvas } from '../../canvas/paint';
import { drawGrid, drawSpectrum, drawVoices, drawWave } from './visualizer.paint';

/** Contexto de pega que apunta lo que se le pide: jsdom no trae canvas de verdad. */
function spyCanvas(width = 320, height = 160) {
  const strokes: string[] = [];
  const rects: number[][] = [];
  const lines: number[][] = [];
  let stroke = '';

  const ctx = {
    lineWidth: 0,
    globalAlpha: 1,
    fillStyle: '',
    get strokeStyle() {
      return stroke;
    },
    set strokeStyle(value: string) {
      stroke = value;
      strokes.push(value);
    },
    beginPath: () => undefined,
    moveTo: (x: number, y: number) => lines.push([x, y]),
    lineTo: () => undefined,
    stroke: () => undefined,
    fillRect: (...args: number[]) => rects.push(args),
  };

  return { canvas: { ctx, width, height } as unknown as Canvas, strokes, rects, lines };
}

describe('dibujo del visualizador', () => {
  it('la reticula traza quince verticales y cinco horizontales', () => {
    const { canvas, lines } = spyCanvas();

    drawGrid(canvas, '#ccc');

    expect(lines).toHaveLength(15 + 5);
    expect(canvas.ctx.globalAlpha).toBe(1); // deja la opacidad como la encontro
  });

  it('el espectro pinta una barra por tramo, saltandose los tramos vacios', () => {
    const { canvas, rects } = spyCanvas();
    const espectro = new Uint8Array(2048);

    expect(rects).toHaveLength(0);

    espectro.fill(255);
    drawSpectrum(canvas, espectro, '#abc');
    expect(rects).toHaveLength(64);

    // media altura del lienzo para una lectura al maximo
    expect(rects[0][3]).toBeCloseTo(160 * 0.5, 5);
  });

  it('sin lecturas del analizador no se pinta nada', () => {
    const { canvas, rects, lines } = spyCanvas();

    drawSpectrum(canvas, undefined, '#abc');
    drawWave(canvas, undefined, [60], '#abc');

    expect([...rects, ...lines]).toHaveLength(0);
  });

  it('cada nota traza su linea con su propio color', () => {
    const { canvas, strokes, lines } = spyCanvas();

    drawVoices(canvas, [60, 64, 67]);

    expect(lines).toHaveLength(3);
    expect(new Set(strokes).size).toBe(3);
    // la mas grave a la izquierda y la mas aguda a la derecha
    expect(lines[0][0]).toBeLessThan(lines[2][0]);
  });

  it('la onda se tiñe con la nota mas grave, o con el color de reserva', () => {
    const conNotas = spyCanvas();
    const wave = new Uint8Array(64).fill(128);

    drawWave(conNotas.canvas, wave, [67, 60], '#fallback');
    expect(conNotas.strokes.at(-1)).toBe('rgb(0, 255, 184)'); // C4

    const sinNotas = spyCanvas();
    drawWave(sinNotas.canvas, wave, [], '#fallback');
    expect(sinNotas.strokes.at(-1)).toBe('#fallback');
  });
});
