import { Component, inject } from '@angular/core';
import { Synth } from '../../synth/synth';
import { BPM_RANGE, Transport as TransportState } from '../../transport/transport';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.html',
  styleUrls: ['./transport.scss'],
})
export class Transport {
  protected readonly transport = inject(TransportState);
  protected readonly synth = inject(Synth);
  protected readonly range = BPM_RANGE;
}
