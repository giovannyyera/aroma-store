
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminProdutosService } from '../../../core/services/admin-produtos.service';
import { AdminProduto } from '../../../models/admin-produto.model';

type FiltroStatus = '' | 'true' | 'false';

@Component({
  selector: 'app-produtos-admin',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class ProdutosAdmin implements OnInit {

  produtos = signal<AdminProduto[]>([]);

  carregando = signal(true);
  erro = signal('');

  busca = '';

  filtroAtivo = signal<FiltroStatus>('');

  produtoAtualizando = signal<number | null>(null);

  excluindoConfirmacaoId = signal<number | null>(null);

  constructor(
    private produtosService: AdminProdutosService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(ativo?: FiltroStatus): void {

    if (ativo !== undefined) {
      this.filtroAtivo.set(ativo);
    }

    this.carregando.set(true);
    this.erro.set('');

    const buscaAtual = this.busca.trim();
    const statusAtual = this.filtroAtivo();

    this.produtosService
      .listar(buscaAtual, statusAtual)
      .subscribe({

        next: (dados) => {
          this.produtos.set(dados);
          this.carregando.set(false);
        },

        error: () => {
          this.erro.set(
            'Não foi possível carregar os produtos.'
          );

          this.carregando.set(false);
        }
      });
  }

  ativar(id: number): void {

    if (this.produtoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.produtoAtualizando.set(id);

    this.produtosService
      .ativar(id)
      .pipe(
        finalize(() => {
          this.produtoAtualizando.set(null);
        })
      )
      .subscribe({

        next: () => {
          this.carregar();
        },

        error: () => {
          this.erro.set(
            'Não foi possível reativar o produto.'
          );
        }
      });
  }

  desativar(id: number): void {

    if (this.produtoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.produtoAtualizando.set(id);

    this.produtosService
      .desativar(id)
      .pipe(
        finalize(() => {
          this.produtoAtualizando.set(null);
        })
      )
      .subscribe({

        next: () => {
          this.carregar();
        },

        error: () => {
          this.erro.set(
            'Não foi possível desativar o produto.'
          );
        }
      });
  }

  pedirConfirmacaoExclusao(id: number): void {
    if (this.produtoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.excluindoConfirmacaoId.set(id);
  }

  cancelarExclusao(): void {
    this.excluindoConfirmacaoId.set(null);
  }

  excluir(id: number): void {
    if (this.produtoAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.produtoAtualizando.set(id);

    this.produtosService.excluir(id)
      .pipe(
        finalize(() => {
          this.produtoAtualizando.set(null);
          this.excluindoConfirmacaoId.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: (resposta: HttpErrorResponse) => {
          this.erro.set(
            resposta.error?.detail || 'Não foi possível excluir.'
          );
        }
      });
  }
}
