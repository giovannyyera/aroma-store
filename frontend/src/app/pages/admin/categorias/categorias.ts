
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { AdminCategoriasService } from '../../../core/services/admin-categorias.service';
import { AdminCategoria } from '../../../models/admin-categoria.model';

@Component({
  selector: 'app-categorias',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  categorias = signal<AdminCategoria[]>([]);

  carregando = signal(true);
  erro = signal('');

  categoriaAtualizando = signal<number | null>(null);

  excluindoConfirmacaoId = signal<number | null>(null);

  constructor(
    private categoriasService: AdminCategoriasService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.categoriasService.listar().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
        this.carregando.set(false);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar as categorias.'
        );
        this.carregando.set(false);
      }
    });
  }

  ativar(id: number): void {
    if (this.categoriaAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.categoriaAtualizando.set(id);

    this.categoriasService.ativar(id)
      .pipe(
        finalize(() => this.categoriaAtualizando.set(null))
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: () => {
          this.erro.set(
            'Não foi possível ativar a categoria.'
          );
        }
      });
  }

  desativar(id: number): void {
    if (this.categoriaAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.categoriaAtualizando.set(id);

    this.categoriasService.desativar(id)
      .pipe(
        finalize(() => this.categoriaAtualizando.set(null))
      )
      .subscribe({
        next: () => {
          this.carregar();
        },

        error: () => {
          this.erro.set(
            'Não foi possível desativar a categoria.'
          );
        }
      });
  }

  pedirConfirmacaoExclusao(id: number): void {
    if (this.categoriaAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.excluindoConfirmacaoId.set(id);
  }

  cancelarExclusao(): void {
    this.excluindoConfirmacaoId.set(null);
  }

  excluir(id: number): void {
    if (this.categoriaAtualizando() !== null) {
      return;
    }

    this.erro.set('');
    this.categoriaAtualizando.set(id);

    this.categoriasService.excluir(id)
      .pipe(
        finalize(() => {
          this.categoriaAtualizando.set(null);
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
