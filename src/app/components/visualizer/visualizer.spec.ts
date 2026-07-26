import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Synth } from '../../synth/synth';
import { Visualizer } from './visualizer';

describe('Visualizer', () => {
  let fixture: ComponentFixture<Visualizer>;
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [Visualizer] });
    fixture = TestBed.createComponent(Visualizer);
    synth = TestBed.inject(Synth);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('anuncia la tonalidad y las voces que suenan', () => {
    const reading = () => fixture.nativeElement.querySelector('.reading').textContent.trim();

    expect(reading()).toBe('C major');

    synth.noteOn(60);
    synth.noteOn(64);
    fixture.detectChanges();
    expect(reading()).toBe('2 voices · C major');
  });

  it('retira la ayuda de arranque en cuanto se toca algo, y no vuelve', () => {
    const empty = () => fixture.nativeElement.querySelector('.empty');

    expect(empty()).toBeTruthy();

    synth.noteOn(60);
    fixture.detectChanges();
    expect(empty()).toBeNull();

    synth.noteOff(60);
    fixture.detectChanges();
    expect(empty()).toBeNull();
  });
});
