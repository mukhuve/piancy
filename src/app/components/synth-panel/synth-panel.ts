import { Component, computed, inject, signal } from '@angular/core';
import { NOTE_NAMES } from '../../music/pitch';
import { SCALE_MODES, ScaleMode, Tonality } from '../../music/scales';
import { SYNTH_GROUPS, SynthControl } from '../../synth/controls';
import { PRESET_NAMES, PresetName, SynthParams } from '../../synth/presets';
import { Synth } from '../../synth/synth';

@Component({
  selector: 'app-synth-panel',
  templateUrl: './synth-panel.html',
  styleUrls: ['./synth-panel.scss'],
})
export class SynthPanel {
  protected readonly synth = inject(Synth);
  protected readonly tonality = inject(Tonality);

  protected readonly groups = SYNTH_GROUPS;
  protected readonly presets = PRESET_NAMES;
  protected readonly modes = SCALE_MODES;
  protected readonly notes = NOTE_NAMES;

  private readonly folded = signal<ReadonlySet<string>>(new Set());

  protected readonly allFolded = computed(() => this.folded().size >= this.groups.length);

  protected isOpen(title: string) {
    return !this.folded().has(title);
  }

  protected toggle(title: string) {
    this.folded.update((folded) => {
      const next = new Set(folded);

      if (!next.delete(title)) next.add(title);

      return next;
    });
  }

  protected foldAll() {
    this.folded.set(this.allFolded() ? new Set() : new Set(this.groups.map(({ title }) => title)));
  }

  protected valueOf({ key }: SynthControl) {
    return this.synth.params()[key];
  }

  protected display(control: SynthControl) {
    const value = this.valueOf(control);

    return typeof value === 'number' ? (control.format?.(value) ?? value.toFixed(2)) : '';
  }

  /**
   * Los mandos son genericos, asi que el tipo concreto del parametro solo se sabe
   * en tiempo de ejecucion: los selectores dan texto y los deslizadores numeros.
   */
  protected set(control: SynthControl, value: string) {
    const parsed = control.options ? value : parseFloat(value);

    this.synth.setParam(control.key as keyof SynthParams, parsed as never);
  }

  protected usePreset(name: string) {
    this.synth.usePreset(name as PresetName);
  }

  protected setMode(mode: string) {
    this.tonality.mode.set(mode as ScaleMode);
  }
}
