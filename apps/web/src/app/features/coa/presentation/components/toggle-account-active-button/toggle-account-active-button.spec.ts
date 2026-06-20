import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleAccountActiveButton } from './toggle-account-active-button';

describe('ToggleAccountActiveButton', () => {
  let component: ToggleAccountActiveButton;
  let fixture: ComponentFixture<ToggleAccountActiveButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleAccountActiveButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleAccountActiveButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
