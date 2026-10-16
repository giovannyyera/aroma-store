import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminPedidosService } from '../../../core/services/admin-pedidos.service';
import { AdminPedido } from '../../../models/admin-pedido.model';

@Component({
  selector: 'app-pedidos',
  imports: [
    CommonModule
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos implements OnInit {

  pedidos = signal<AdminPedido[]>([]);
  carregando = signal(true);
  erro = signal('');

  constructor(
    private pedidosService: AdminPedidosService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(status = ''): void {
    this.carregando.set(true);
    this.erro.set('');

    this.pedidosService.listar(status).subscribe({
      next: (dados) => {
        this.pedidos.set(dados);
        this.carregando.set(false);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar os pedidos.'
        );
        this.carregando.set(false);
      }
    });
  }

  confirmar(id: number): void {
    this.pedidosService.confirmar(id).subscribe({
      next: () => this.carregar(),
      error: (erro) => {
        this.erro.set(
          erro.error?.detail ||
          'Não foi possível confirmar o pedido.'
        );
      }
    });
  }

  concluir(id: number): void {
    this.pedidosService.concluir(id).subscribe({
      next: () => this.carregar(),
      error: (erro) => {
        this.erro.set(
          erro.error?.detail ||
          'Não foi possível concluir o pedido.'
        );
      }
    });
  }

  cancelar(id: number): void {
    this.pedidosService.cancelar(id).subscribe({
      next: () => this.carregar(),
      error: (erro) => {
        this.erro.set(
          erro.error?.detail ||
          'Não foi possível cancelar o pedido.'
        );
      }
    });
  }
}