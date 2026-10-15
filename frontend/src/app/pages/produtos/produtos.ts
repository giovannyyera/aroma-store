import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogoService } from '../../core/services/catalogo.service';
import { Produto } from '../../models/catalogo.model';

@Component({
  selector: 'app-produtos',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos implements OnInit {

  produtos = signal<Produto[]>([]);
  carregando = signal(true);
  erro = signal('');
  paginaAtual = signal(1);
  totalProdutos = signal(0);
  temProxima = signal(false);
  temAnterior = signal(false);

  constructor(
    private catalogoService: CatalogoService
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(page: number = 1): void {
    this.carregando.set(true);
    this.erro.set('');

    this.catalogoService.listarProdutos(page).subscribe({
      next: (resposta) => {
        this.produtos.set(resposta.results);

        this.totalProdutos.set(resposta.count);
        this.paginaAtual.set(page);

        this.temProxima.set(resposta.next !== null);
        this.temAnterior.set(resposta.previous !== null);

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

  paginaAnterior(): void {
    if (this.temAnterior()) {
      this.carregarProdutos(
        this.paginaAtual() - 1
      );
    }
  }

  proximaPagina(): void {
    if (this.temProxima()) {
      this.carregarProdutos(
        this.paginaAtual() + 1
      );
    }
  }
}