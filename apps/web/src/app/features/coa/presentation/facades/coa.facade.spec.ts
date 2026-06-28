import { TestBed } from '@angular/core/testing';

import { CoaFacade } from './coa.facade';

describe('CoaFacade', () => {
  let service: CoaFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoaFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
