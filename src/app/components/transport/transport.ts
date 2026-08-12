import { Component, computed, inject } from '@angular/core';
import { I18n } from '../../i18n/i18n';
import { Settings } from '../../settings';
import { Synth } from '../../synth/synth';
import { Player } from '../../transport/player';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.html',
  styleUrls: ['./transport.scss'],
})
export class Transport {
  protected readonly player = inject(Player);
  protected readonly synth = inject(Synth);
  protected readonly t = inject(I18n).t;

  private readonly settings = inject(Settings);

  protected readonly isPlay = computed(() => this.settings.mode() === 'play');

  protected choose(name: string) {
    this.player.choose(this.player.songs.find((song) => song.name === name));
  }

  protected toggle() {
    if (this.player.busy()) this.player.stop();
    else this.player.countIn();
  }
}
