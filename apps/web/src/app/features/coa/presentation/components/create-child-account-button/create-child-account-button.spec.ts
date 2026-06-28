import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChildAccountButton } from './create-child-account-button';

describe('CreateChildAccountButton', () => {
  let component: CreateChildAccountButton;
  let fixture: ComponentFixture<CreateChildAccountButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateChildAccountButton],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateChildAccountButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
