import { TestBed } from '@angular/core/testing';

import { DataformService } from './dataform.service';

describe('DataformService', () => {
  let service: DataformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
