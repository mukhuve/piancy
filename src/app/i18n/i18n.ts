import { Injectable, computed, effect, signal } from '@angular/core';
import { EN } from './locales/en';
import { TextKey, Texts } from './locales/en.type';
import { ES } from './locales/es';

export { type TextKey } from './locales/en.type';

/** Idiomas montados. Añadir uno es añadir su diccionario aqui y nada mas. */
export const LOCALES: Record<string, Texts> = { en: EN, es: ES };

export type Lang = keyof typeof LOCALES;

const FALLBACK: Lang = 'en';
const STORAGE = 'piancy.lang';

/**
 * El idioma de la interfaz. Se cambia en caliente porque los textos salen de un
 * signal: no hay bundle por idioma ni recarga de por medio, que para una app de una
 * sola pagina servida como estatica es lo unico que se sostiene.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  readonly languages = Object.keys(LOCALES);
  readonly lang = signal<Lang>(preferred());

  private readonly texts = computed(() => LOCALES[this.lang()] ?? LOCALES[FALLBACK]);

  constructor() {
    effect(() => {
      const lang = this.lang();

      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE, lang);
      } catch {
        /* sin almacenamiento se pierde la eleccion al recargar, y ya esta */
      }
    });
  }

  /**
   * Se pasa tal cual a las plantillas (`protected readonly t = inject(I18n).t`), asi
   * que va atada al servicio y no a quien la llama. Al leer el signal dentro, la
   * plantilla que la use se vuelve a pintar sola al cambiar de idioma.
   */
  readonly t = (key: TextKey) => this.texts()[key];
}

/** Lo ultimo que se eligio; si no, lo que pida el navegador; si no, ingles. */
function preferred(): Lang {
  const stored = safeRead();
  const navigatorLang = globalThis.navigator?.language?.slice(0, 2);

  return [stored, navigatorLang].find((lang) => lang && lang in LOCALES) ?? FALLBACK;
}

function safeRead() {
  try {
    return localStorage.getItem(STORAGE) ?? undefined;
  } catch {
    return undefined;
  }
}
