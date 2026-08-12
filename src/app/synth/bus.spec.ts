import { FakeAudioContext, chainFrom, reaches } from './audio-context.fake';
import { createBus } from './bus';

describe('bus de salida', () => {
  const build = () => {
    const context = new FakeAudioContext() as unknown as AudioContext;

    return { context, bus: createBus(context) };
  };

  it('lo que toca el instrumento pasa por el analisis; el metronomo no', () => {
    const { bus } = build();

    // las tres vias de una voz —seca, eco y reverb— acaban en el analizador
    bus.sends.forEach((send) => expect(reaches(send, bus.analyser)).toBe(true));

    // el clic entra por detras: si pasara por el analizador saldria dibujado en el
    // grafico como una nota que nadie ha tocado
    expect(reaches(bus.clicks, bus.analyser)).toBe(false);
  });

  it('la mezcla se acota antes de saturarla, no despues', () => {
    const { bus } = build();
    const [dry] = bus.sends;

    // El orden es la correccion entera: la curva de saturacion aplasta cuanto le
    // llega por encima de uno, y tres notas ya suman eso. Detras del techo la
    // saturacion recibe siempre lo mismo, suene una nota o suenen doce.
    expect(chainFrom(dry)).toEqual([
      'gain',
      'ceiling',
      'shaper',
      'analyser',
      'gain',
      'destination',
    ]);
  });

  it('nada sale sin pasar antes por el volumen', () => {
    const { context, bus } = build();

    [...bus.sends, bus.clicks].forEach((entry) => {
      expect(reaches(entry, bus.master)).toBe(true);
      expect(reaches(entry, context.destination)).toBe(true);
    });

    // el volumen es lo ultimo: sube lo que ya viene acotado, no al reves
    expect(reaches(bus.master, bus.analyser)).toBe(false);
  });
});
