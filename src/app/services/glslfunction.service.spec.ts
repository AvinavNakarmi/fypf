import { TestBed } from '@angular/core/testing';

import { GLSLFunctionService } from './glslfunction.service';

describe('GLSLFunctionService', () => {
  let service: GLSLFunctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GLSLFunctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
