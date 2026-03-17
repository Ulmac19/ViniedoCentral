import { TestBed } from '@angular/core/testing';

import { Product } from '../models/producto.model';
import { ProductsService } from './producto.service';

describe('Tareas', () => {
  let service: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
