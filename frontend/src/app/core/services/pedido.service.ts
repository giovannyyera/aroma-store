import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CheckoutPayload,
  PedidoResposta
} from '../../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/pedidos';

  constructor(
    private http: HttpClient
  ) {}

  criarCheckout(
    dados: CheckoutPayload
  ): Observable<PedidoResposta> {

    return this.http.post<PedidoResposta>(
      `${this.apiUrl}/checkout/`,
      dados
    );
  }
}