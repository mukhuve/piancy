import { FakeAudioContext, reaches } from './audio-context.fake';
import { PRESETS, SynthParams } from './presets';
import { playVoice } from './voice';

/** El do central, del que cuelgan las demas notas de los ejemplos. */
const C4 = 261.63;
const PIANO = PRESETS['Grand Piano'];

/**
 * Una nota montada sobre un contexto recien hecho, con los nodos que interesan a la
 * vista. Contexto nuevo en cada nota a proposito: los espias se acumulan, y con uno
 * compartido el primer gain seria siempre el de la primera nota que se toco.
 */
function play(params: SynthParams = PIANO, frequency = C4, velocity = 0.8) {
  const context = new FakeAudioContext();
  const send = context.createGain();
  const gains = vi.spyOn(context, 'createGain');
  const filters = vi.spyOn(context, 'createBiquadFilter');
  const noises = vi.spyOn(context, 'createBufferSource');

  playVoice(context as unknown as AudioContext, [send as unknown as AudioNode], params, frequency, velocity);

  return {
    send,
    noises,
    /** La envolvente de amplitud, que es el primer gain que monta la voz. */
    amp: gains.mock.results[0].value.gain,
    filter: filters.mock.results[0].value.frequency,
  };
}

describe('playVoice', () => {
  it('la nota se apaga en curva, que es como pierde energia una cuerda', () => {
    const [silence, peak, decay] = play().amp.ramps;

    expect(silence.value).toBe(0);
    expect(peak.curve).toBe('linear');
    // en rampa recta la nota se sostiene entera y se corta al final: suena a organo
    expect(decay.curve).toBe('exponential');
    expect(decay.value).toBeLessThan(peak.value);
  });

  it('la grave dura mucho mas que la aguda, con el mismo preset', () => {
    const decayOf = (frequency: number) => play(PIANO, frequency).amp.ramps[2].at;

    const middle = decayOf(C4);

    expect(decayOf(C4 / 4) / middle).toBeCloseTo(2, 1);
    expect(decayOf(C4 * 4) / middle).toBeCloseTo(0.5, 1);
  });

  it('el golpe del martillo va al bus por su cuenta, y solo si el preset lo pide', () => {
    const { noises, send } = play();

    expect(noises).toHaveBeenCalledTimes(1);
    // por el bus y no por la voz: tiene que sonar antes de que la envolvente abra
    expect(reaches(noises.mock.results[0].value, send)).toBe(true);

    expect(play(PRESETS['Steel Pad']).noises).not.toHaveBeenCalled();
  });

  it('cuanto mas fuerte se toca, mas se abre el filtro', () => {
    const brightness = (velocity: number) => play(PIANO, C4, velocity).filter.ramps[1].value;

    expect(brightness(0.3)).toBeLessThan(brightness(1));
  });
});
