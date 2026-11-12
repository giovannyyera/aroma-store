import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminProdutosService } from './admin-produtos.service';

describe('AdminProdutosService', () => {
  let service: AdminProdutosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminProdutosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('exclui o produto com DELETE na URL do recurso', () => {
    let concluiu = false;
    service.excluir(9).subscribe(() => { concluiu = true; });

    const request = http.expectOne('http://127.0.0.1:8000/api/admin/produtos/9/');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(concluiu).toBe(true);
  });
});
