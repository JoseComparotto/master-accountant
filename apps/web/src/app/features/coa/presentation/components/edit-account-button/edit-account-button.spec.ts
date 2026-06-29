import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountButton } from './edit-account-button';

describe('EditAccountButton', () => {
  let component: EditAccountButton;
  let fixture: ComponentFixture<EditAccountButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAccountButton],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAccountButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
