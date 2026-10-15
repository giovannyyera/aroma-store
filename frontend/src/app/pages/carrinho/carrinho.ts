import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CarrinhoService } from '../../core/services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  constructor(public carrinhoService: CarrinhoService) {}

  aumentar(produtoId: number): void {
    this.carrinhoService.aumentarQuantidade(produtoId);
  }

  diminuir(produtoId: number): void {
    this.carrinhoService.diminuirQuantidade(produtoId);
  }

  remover(produtoId: number): void {
    this.carrinhoService.removerProduto(produtoId);
  }
}
