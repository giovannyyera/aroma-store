import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CategoriaVendas,
  ProdutoVendido,
  ResumoGeral,
  VendasMensaisPivot,
} from '../../models/relatorio.model';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/relatorios';

  constructor(private http: HttpClient) {}

  buscarResumo(): Observable<ResumoGeral> {
    return this.http.get<ResumoGeral>(`${this.apiUrl}/resumo/`);
  }

  buscarProdutosVendidos(): Observable<ProdutoVendido[]> {
    return this.http.get<ProdutoVendido[]>(`${this.apiUrl}/produtos-vendidos/`);
  }

  buscarVendasPorCategoria(): Observable<CategoriaVendas[]> {
    return this.http.get<CategoriaVendas[]>(`${this.apiUrl}/vendas-por-categoria/`);
  }

  buscarPivot(): Observable<VendasMensaisPivot> {
    return this.http.get<VendasMensaisPivot>(`${this.apiUrl}/vendas-mensais-pivot/`);
  }
}
