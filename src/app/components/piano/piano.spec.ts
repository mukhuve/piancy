import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Piano } from './piano';

describe('Piano', () => {
  let component: Piano;
  let fixture: ComponentFixture<Piano>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Piano],
    });
    fixture = TestBed.createComponent(Piano);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
