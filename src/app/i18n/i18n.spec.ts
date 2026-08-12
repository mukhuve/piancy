import { TestBed } from '@angular/core/testing';
import { I18n, LOCALES } from './i18n';
import { EN } from './locales/en';

describe('I18n', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('traduce en caliente y deja constancia del idioma en el documento', () => {
    const i18n = TestBed.inject(I18n);

    i18n.lang.set('en');
    TestBed.tick();
    expect(i18n.t('mode.play')).toBe('Play');
    expect(document.documentElement.lang).toBe('en');

    i18n.lang.set('es');
    TestBed.tick();
    expect(i18n.t('mode.play')).toBe('Tocar');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem('piancy.lang')).toBe('es');
  });

  it('ningun idioma se deja claves sin traducir ni copia el ingles entero', () => {
    const keys = Object.keys(EN) as (keyof typeof EN)[];

    Object.entries(LOCALES).forEach(([lang, texts]) => {
      expect(Object.keys(texts).sort()).toEqual(keys.sort());
      Object.values(texts).forEach((text) => expect(text.trim()).not.toBe(''));

      if (lang === 'en') return;

      // si un idioma repitiera casi todas las cadenas del ingles estaria sin traducir
      const shared = keys.filter((key) => texts[key] === EN[key]);
      expect(shared.length).toBeLessThan(keys.length / 2);
    });
  });
});
