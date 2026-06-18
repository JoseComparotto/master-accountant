import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaFooter } from './coa-footer';

describe('CoaFooter', () => {
  let component: CoaFooter;
  let fixture: ComponentFixture<CoaFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoaFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(CoaFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
