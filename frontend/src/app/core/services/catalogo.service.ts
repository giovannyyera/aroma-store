import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Categoria, Produto } from '../../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${this.apiUrl}/categorias/`
    );
  }

  listarProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(
      `${this.apiUrl}/produtos/`
    );
  }

  buscarProduto(id: number): Observable<Produto> {
    return this.http.get<Produto>(
      `${this.apiUrl}/produtos/${id}/`
    );
  }
}