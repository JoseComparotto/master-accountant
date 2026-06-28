import { TestBed } from '@angular/core/testing';

import { CoaApiClient } from './coa-api-client';

describe('ApiClient', () => {
  let service: CoaApiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoaApiClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
