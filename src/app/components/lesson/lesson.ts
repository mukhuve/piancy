import { Component, computed, inject } from '@angular/core';
import { Lessons } from '../../learn/lessons';
import { colorOf, toCss } from '../../music/color';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.html',
  styleUrls: ['./lesson.scss'],
})
export class Lesson {
  protected readonly lessons = inject(Lessons);

  protected readonly number = computed(() => String(this.lessons.index() + 1).padStart(2, '0'));

  protected readonly progress = computed(() => {
    const steps = this.lessons.lesson().steps.length;

    return `${Math.min(this.lessons.step() + 1, steps)} / ${steps}`;
  });

  /** Lo que hay que tocar ahora, con el color de cada nota. */
  protected readonly targets = computed(() => {
    const lesson = this.lessons.lesson();

    if (lesson.kind === 'ear') {
      return [{ label: 'Mystery tone', color: 'transparent' }];
    }

    return this.lessons.targets().map((midi, i) => ({
      label: lesson.labels?.[this.lessons.step()] ?? this.lessons.labels()[i],
      color: toCss(colorOf(midi)),
    }));
  });
}
