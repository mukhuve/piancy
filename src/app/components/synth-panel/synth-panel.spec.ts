import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tonality } from '../../music/scales';
import { FakeAudioContext } from '../../synth/audio-context.fake';
import { PRESETS } from '../../synth/presets';
import { Synth } from '../../synth/synth';
import { SynthPanel } from './synth-panel';

describe('SynthPanel', () => {
  let fixture: ComponentFixture<SynthPanel>;
  let synth: Synth;

  const find = (selector: string) => fixture.nativeElement.querySelector(selector);
  const all = (selector: string) => [...fixture.nativeElement.querySelectorAll(selector)];

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [SynthPanel] });
    fixture = TestBed.createComponent(SynthPanel);
    synth = TestBed.inject(Synth);
    fixture.detectChanges();
  });

  it('muestra los cinco grupos del motor, desplegados', () => {
    expect(all('.head .title').map((el) => el.textContent.trim())).toEqual([
      'Oscillators',
      'Envelope',
      'Filter',
      'Modulation',
      'Space',
    ]);
    expect(all('.rows').length).toBe(5);
  });

  it('pliega y despliega un grupo, y todos a la vez', () => {
    const head = find('.head');

    head.click();
    fixture.detectChanges();
    expect(all('.rows').length).toBe(4);
    expect(head.getAttribute('aria-expanded')).toBe('false');

    find('.fold-all').click();
    fixture.detectChanges();
    expect(all('.rows').length).toBe(0);

    find('.fold-all').click();
    fixture.detectChanges();
    expect(all('.rows').length).toBe(5);
  });

  it('un mando cambia el parametro y su lectura', () => {
    const attack = find('#attack');

    attack.value = '0.5';
    attack.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(synth.params().attack).toBe(0.5);
    expect(find('label[for="attack"]').parentElement.textContent).toContain('500m');
  });

  it('un selector cambia el parametro de texto', () => {
    const wave = find('#oscAType');

    wave.value = 'square';
    wave.dispatchEvent(new Event('change'));

    expect(synth.params().oscAType).toBe('square');
  });

  it('cambiar de preset recarga todos los parametros', () => {
    const preset = find('#preset');

    preset.value = 'Pluck';
    preset.dispatchEvent(new Event('change'));

    expect(synth.params()).toEqual(PRESETS.Pluck);
  });

  it('cambia la tonalidad y la escala', () => {
    const scale = find('#key-scale');

    scale.value = 'minor';
    scale.dispatchEvent(new Event('change'));

    expect(TestBed.inject(Tonality).mode()).toBe('minor');
  });
});
