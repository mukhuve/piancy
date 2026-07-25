/** Una nota del teclado: como se llama, a que frecuencia suena y con que tecla se toca. */
export class Note {
  /** Lo que se pinta en la tecla: el nombre completo, o `#` si es sostenida. */
  readonly label: string;
  readonly sharp: boolean;
  readonly octave: number;

  constructor(
    public readonly name: string,
    public readonly frequency: number,
    public readonly key: string
  ) {
    this.octave = Math.floor(Math.log2(frequency / 440) + 4);
    this.sharp = name.includes('#');
    this.label = this.sharp ? '#' : name;
  }
}
