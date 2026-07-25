import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppComponent],
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('colorize', () => {
    const range: [number, number] = [220, 880];

    it('pinta de rojo la nota mas grave y de violeta la mas aguda', () => {
      const app = TestBed.createComponent(AppComponent).componentInstance;

      app.colorize({ notes: [220], range }); // 630 nm
      expect(app.color()).toBe('rgb(255, 59, 0)');

      app.colorize({ notes: [880], range }); // 400 nm
      expect(app.color()).toBe('rgb(170, 0, 255)');
    });

    it('suma el color de las notas de un acorde', () => {
      const app = TestBed.createComponent(AppComponent).componentInstance;

      app.colorize({ notes: [220, 880], range });

      expect(app.color()).toBe('rgb(425, 59, 255)');
    });

    it('se queda sin color cuando no suena nada', () => {
      const app = TestBed.createComponent(AppComponent).componentInstance;

      app.colorize({ notes: [220], range });
      app.colorize({ notes: [], range });

      expect(app.color()).toBe('');
    });
  });
});
