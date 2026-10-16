import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminPedido } from '../../models/admin-pedido.model';

@Injectable({
  providedIn: 'root'
})
export class AdminPedidosService {

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/pedidos/admin';

  constructor(
    private http: HttpClient
  ) {}

  listar(status = ''): Observable<AdminPedido[]> {
    const url = status
      ? `${this.apiUrl}/?status=${status}`
      : `${this.apiUrl}/`;

    return this.http.get<AdminPedido[]>(url);
  }

  buscar(id: number): Observable<AdminPedido> {
    return this.http.get<AdminPedido>(
      `${this.apiUrl}/${id}/`
    );
  }

  confirmar(id: number): Observable<AdminPedido> {
    return this.http.post<AdminPedido>(
      `${this.apiUrl}/${id}/confirmar/`,
      {}
    );
  }

  concluir(id: number): Observable<AdminPedido> {
    return this.http.post<AdminPedido>(
      `${this.apiUrl}/${id}/concluir/`,
      {}
    );
  }

  cancelar(id: number): Observable<AdminPedido> {
    return this.http.post<AdminPedido>(
      `${this.apiUrl}/${id}/cancelar/`,
      {}
    );
  }
}