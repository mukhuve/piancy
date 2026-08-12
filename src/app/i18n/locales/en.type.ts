import { EN } from './en';

/** Cada clave de la interfaz. Un idioma al que le falte una no compila. */
export type TextKey = keyof typeof EN;

export type Texts = Record<TextKey, string>;
