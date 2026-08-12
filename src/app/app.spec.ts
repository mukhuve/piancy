import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { FakeAudioContext } from './synth/audio-context.fake';
import { Synth } from './synth/synth';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({ imports: [App] });
  });

  it('should create the app', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('publica el color de las notas que suenan como variable css', () => {
    const fixture = TestBed.createComponent(App);

    TestBed.inject(Synth).noteOn(60);
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('--tone-color')).toBe('rgb(0, 255, 184)');
  });
});
