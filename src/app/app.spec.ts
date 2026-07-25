import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [App] }));

  it('should create the app', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('publica el color de las notas que suenan como variable css', () => {
    const fixture = TestBed.createComponent(App);

    fixture.componentInstance.colorize({ notes: [220], range: [220, 880] });
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('--tone-color')).toBe('rgb(255, 59, 0)');
  });
});
