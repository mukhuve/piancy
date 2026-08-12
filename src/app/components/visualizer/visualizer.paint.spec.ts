import { Canvas } from '../../canvas/paint';
import { layout } from '../../music/keyboard';
import { drawGrid, drawSpectrum, drawVoices, drawWaves } from './visualizer.paint';

/** Contexto de pega que apunta lo que se le pide: jsdom no trae canvas de verdad. */
function spyCanvas(width = 320, height = 160) {
  const strokes: string[] = [];
  const rects: number[][] = [];
  const lines: number[][] = [];
  let stroke = '';

  const ctx = {
    lineWidth: 0,
    lineJoin: '',
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
    quadraticCurveTo: () => undefined,
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

  it('sin lecturas del analizador no se pinta el espectro', () => {
    const { canvas, rects } = spyCanvas();

    drawSpectrum(canvas, undefined, '#abc');

    expect(rects).toHaveLength(0);
  });

  it('cada nota traza su linea sobre su tecla, y con su propio color', () => {
    const { canvas, strokes, lines } = spyCanvas();
    const octava = layout([60, 62, 64, 65, 67, 69, 71]);
    const centro = (midi: number) => {
      const { x, width } = octava.find(({ pitch }) => pitch.midi === midi)!;

      return Math.round((x + width / 2) * 320) + 0.5;
    };

    drawVoices(canvas, octava, [60, 64, 67]);

    expect(lines).toHaveLength(3);
    expect(new Set(strokes).size).toBe(3);
    // sobre la tecla, no repartidas por el rango de lo que suena: con do, mi y sol
    // en una octava, el sol cae en el centro de su blanca y no en el borde derecho
    expect(lines.map(([x]) => x)).toEqual([centro(60), centro(64), centro(67)]);
  });

  it('lo que suena fuera de la ventana visible no se pinta: no hay tecla debajo', () => {
    const { canvas, lines } = spyCanvas();

    drawVoices(canvas, layout([60, 62, 64, 65, 67, 69, 71]), [36, 96]);

    expect(lines).toHaveLength(0);
  });

  it('cada nota traza su onda, con su color y sobre el mismo eje que las demas', () => {
    const { canvas, strokes, lines } = spyCanvas();
    const wave = () => new Uint8Array(64).fill(128);

    drawWaves(canvas, [{ midi: 60, wave: wave() }, { midi: 64, wave: wave() }], '#idle');

    // dos trazos, cada uno con su color, y los dos partiendo del centro del lienzo:
    // superpuestas, no repartidas en carriles
    expect(strokes).toEqual(['rgb(0, 255, 184)', 'rgb(99, 0, 255)']);
    expect(lines.map(([, y]) => y)).toEqual([80, 80]);
    expect(canvas.ctx.globalAlpha).toBe(1); // deja la opacidad como la encontro
  });

  it('en silencio queda la linea de reposo, y suene lo que suene no falta ninguna', () => {
    const quieto = spyCanvas();

    drawWaves(quieto.canvas, [], '#idle');
    expect(quieto.strokes).toEqual(['#idle']);
    expect(quieto.lines).toEqual([[0, 160 / 2 + 0.5]]);

    const racimo = spyCanvas();
    const notas = Array.from({ length: 10 }, (_, i) => ({
      midi: 60 + i,
      wave: new Uint8Array(64).fill(128),
    }));

    drawWaves(racimo.canvas, notas, '#idle');
    expect(racimo.lines).toHaveLength(10);
  });
});
