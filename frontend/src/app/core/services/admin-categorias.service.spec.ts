import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminCategoriasService } from './admin-categorias.service';

describe('AdminCategoriasService', () => {
  let service: AdminCategoriasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminCategoriasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('exclui a categoria com DELETE na URL do recurso', () => {
    let concluiu = false;
    service.excluir(7).subscribe(() => { concluiu = true; });

    const request = http.expectOne('http://127.0.0.1:8000/api/admin/categorias/7/');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(concluiu).toBe(true);
  });
});
