import { TestBed } from '@angular/core/testing';

import { DataforumlaService } from './dataforumla.service';

describe('DataforumlaService', () => {
  let service: DataforumlaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataforumlaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
