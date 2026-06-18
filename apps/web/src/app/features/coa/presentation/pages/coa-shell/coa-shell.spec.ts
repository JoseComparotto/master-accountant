import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaShell } from './coa-shell';

describe('CoaShell', () => {
  let component: CoaShell;
  let fixture: ComponentFixture<CoaShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoaShell],
    }).compileComponents();

    fixture = TestBed.createComponent(CoaShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
