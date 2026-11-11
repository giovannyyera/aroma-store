
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Categoria,
  Produto,
  PaginatedResponse
} from '../../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Listar categorias cadastradas no Django
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${this.apiUrl}/categorias/`
    );
  }

  // Listar produtos com paginação e categoria
  listarProdutos(
    page: number = 1,
    categoria: number | null = null,
    pageSize: number = 20
  ): Observable<PaginatedResponse<Produto>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (categoria !== null) {
      params = params.set(
        'categoria',
        categoria.toString()
      );
    }

    return this.http.get<PaginatedResponse<Produto>>(
      `${this.apiUrl}/produtos/`,
      { params }
    );
  }

  // Buscar detalhes de um produto
  buscarProduto(id: number): Observable<Produto> {
    return this.http.get<Produto>(
      `${this.apiUrl}/produtos/${id}/`
    );
  }
}
