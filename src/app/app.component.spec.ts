import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [AppComponent] }));

  it('should create the app', () => {
    expect(TestBed.createComponent(AppComponent).componentInstance).toBeTruthy();
  });

  it('publica el color de las notas que suenan como variable css', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.componentInstance.colorize({ notes: [220], range: [220, 880] });
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('--tone-color')).toBe('rgb(255, 59, 0)');
  });
});
