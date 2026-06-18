import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaHeader } from './coa-header';

describe('CoaHeader', () => {
  let component: CoaHeader;
  let fixture: ComponentFixture<CoaHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoaHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(CoaHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
