export class Tile {
  name: string;
  sharp: boolean;
  octave: number;

  constructor(
    public note: string,
    public frequency: number,
    public key: string
  ) {
    this.octave = Math.floor(Math.log(frequency / 440) / Math.log(2) + 4);
    this.sharp = note.includes('#');
    this.name = this.sharp ? '#' : note;
  }
}
