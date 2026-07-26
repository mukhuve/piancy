import { Component, inject } from '@angular/core';
import { Synth } from '../../synth/synth';
import { Player } from '../../transport/player';
import { BPM_RANGE, Transport as TransportState } from '../../transport/transport';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.html',
  styleUrls: ['./transport.scss'],
})
export class Transport {
  protected readonly transport = inject(TransportState);
  protected readonly player = inject(Player);
  protected readonly synth = inject(Synth);
  protected readonly range = BPM_RANGE;

  protected choose(name: string) {
    this.player.choose(this.player.songs.find((song) => song.name === name));
  }

  protected toggle() {
    if (this.player.busy()) this.player.stop();
    else this.player.countIn();
  }
}
