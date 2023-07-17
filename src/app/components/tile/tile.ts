export class Tile {
  constructor(
    public key: string,
    public frequency: number,
    public note: string,
    public sharp: boolean,
    public oscillator: OscillatorNode
  ) {}
}
