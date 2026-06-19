import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTitle } from './account-title';

describe('AccountTitle', () => {
  let component: AccountTitle;
  let fixture: ComponentFixture<AccountTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTitle],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTitle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
