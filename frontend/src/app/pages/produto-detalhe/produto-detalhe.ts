import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { Produto } from '../../models/catalogo.model';

@Component({
  selector: 'app-produto-detalhe',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css'
})
export class ProdutoDetalhe implements OnInit {

  produto = signal<Produto | null>(null);
  carregando = signal(true);
  erro = signal('');

  constructor(
    private route: ActivatedRoute,
    private catalogoService: CatalogoService,
    private carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.erro.set('Produto inválido.');
      this.carregando.set(false);
      return;
    }

    this.catalogoService.buscarProduto(id).subscribe({
      next: (produto) => {
        this.produto.set(produto);
        this.carregando.set(false);
      },

      error: () => {
        this.erro.set('Produto não encontrado.');
        this.carregando.set(false);
      }
    });
  }

  adicionarAoCarrinho(): void {
    const produto = this.produto();

    if (produto) {
      this.carrinhoService.adicionarProduto(produto);
    }
  }
}