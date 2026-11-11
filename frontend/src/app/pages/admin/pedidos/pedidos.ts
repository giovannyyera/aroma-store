
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminPedidosService } from '../../../core/services/admin-pedidos.service';
import { AdminPedido } from '../../../models/admin-pedido.model';

type FiltroPedido =
  | ''
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'CONCLUIDO'
  | 'CANCELADO';

@Component({
  selector: 'app-pedidos',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos implements OnInit {

  pedidos = signal<AdminPedido[]>([]);
  carregando = signal(true);
  erro = signal('');
  filtroStatus = signal<FiltroPedido>('');
  pedidoAtualizando = signal<number | null>(null);

  constructor(
    private pedidosService: AdminPedidosService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(status?: FiltroPedido): void {

    if (status !== undefined) {
      this.filtroStatus.set(status);
    }

    this.carregando.set(true);
    this.erro.set('');

    const filtroAtual = this.filtroStatus();

    this.pedidosService.listar(filtroAtual).subscribe({
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

    if (this.pedidoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.pedidoAtualizando.set(id);

    this.pedidosService.confirmar(id)
      .pipe(
        finalize(() => {
          this.pedidoAtualizando.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: (erro) => {
          this.tratarErro(
            erro,
            'Não foi possível confirmar o pedido.'
          );
        }
      });
  }

  concluir(id: number): void {

    if (this.pedidoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.pedidoAtualizando.set(id);

    this.pedidosService.concluir(id)
      .pipe(
        finalize(() => {
          this.pedidoAtualizando.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: (erro) => {
          this.tratarErro(
            erro,
            'Não foi possível concluir o pedido.'
          );
        }
      });
  }

  cancelar(id: number): void {

    if (this.pedidoAtualizando() !== null) {
      return;
    }

    const confirmarCancelamento = window.confirm(
      'Deseja realmente cancelar este pedido?'
    );

    if (!confirmarCancelamento) {
      return;
    }

    this.erro.set('');
    this.pedidoAtualizando.set(id);

    this.pedidosService.cancelar(id)
      .pipe(
        finalize(() => {
          this.pedidoAtualizando.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: (erro) => {
          this.tratarErro(
            erro,
            'Não foi possível cancelar o pedido.'
          );
        }
      });
  }

  private tratarErro(
    erro: any,
    mensagemPadrao: string
  ): void {

    if (erro.status === 0) {
      this.erro.set(
        'Não foi possível conectar ao servidor.'
      );
      return;
    }

    const detalhe = erro.error?.detail;

    if (typeof detalhe === 'string' && detalhe.trim()) {
      this.erro.set(detalhe);
      return;
    }

    this.erro.set(mensagemPadrao);
  }
}
