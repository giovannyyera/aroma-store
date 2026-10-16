import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminCategoria } from '../../models/admin-categoria.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoriasService {

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/admin/categorias';

  constructor(
    private http: HttpClient
  ) {}

  listar(): Observable<AdminCategoria[]> {
    return this.http.get<AdminCategoria[]>(
      `${this.apiUrl}/`
    );
  }

  buscar(id: number): Observable<AdminCategoria> {
    return this.http.get<AdminCategoria>(
      `${this.apiUrl}/${id}/`
    );
  }

  criar(dados: {
    nome: string;
    descricao: string;
    ativo: boolean;
  }): Observable<AdminCategoria> {

    return this.http.post<AdminCategoria>(
      `${this.apiUrl}/`,
      dados
    );
  }

  atualizar(
    id: number,
    dados: {
      nome: string;
      descricao: string;
      ativo: boolean;
    }
  ): Observable<AdminCategoria> {

    return this.http.patch<AdminCategoria>(
      `${this.apiUrl}/${id}/`,
      dados
    );
  }

  ativar(id: number): Observable<AdminCategoria> {
    return this.http.post<AdminCategoria>(
      `${this.apiUrl}/${id}/ativar/`,
      {}
    );
  }

  desativar(id: number): Observable<AdminCategoria> {
    return this.http.post<AdminCategoria>(
      `${this.apiUrl}/${id}/desativar/`,
      {}
    );
  }
}