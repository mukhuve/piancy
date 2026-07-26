import { ComponentFixture, TestBed } from '@angular/core/testing';

import { pitchOf } from '../../music/pitch';
import { FakeAudioContext } from '../../synth/audio-context.fake';
import { Synth } from '../../synth/synth';
import { Tile } from './tile';

describe('Tile', () => {
  let component: Tile;
  let fixture: ComponentFixture<Tile>;
  let synth: Synth;

  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    TestBed.configureTestingModule({
      imports: [Tile],
    });
    fixture = TestBed.createComponent(Tile);
    fixture.componentRef.setInput('pitch', pitchOf(69));
    fixture.componentRef.setInput('shortcut', 'q');
    component = fixture.componentInstance;
    synth = TestBed.inject(Synth);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hace sonar su nota mientras esta pulsada', () => {
    component.push(true);
    fixture.detectChanges();
    expect(synth.playing()).toEqual([69]);
    expect(fixture.nativeElement.classList).toContain('active');

    component.push(false);
    fixture.detectChanges();
    expect(synth.playing()).toEqual([]);
    expect(fixture.nativeElement.classList).not.toContain('active');
  });

  it('ignora las teclas del teclado que no son la suya', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(component.active()).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    expect(component.active()).toBe(true);
  });
});
