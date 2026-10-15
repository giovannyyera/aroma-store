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

  constructor(
    private catalogoService: CatalogoService
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.catalogoService.listarProdutos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
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
}