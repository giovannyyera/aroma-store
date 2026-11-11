
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CarrinhoService } from '../../core/services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  menuOpen = false;
  searchOpen = false;
  searchTerm = '';

  constructor(public carrinhoService: CarrinhoService) {}

  get cartCount(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  submitSearch(): void {
    const term = this.searchTerm.trim();

    if (!term) return;

    console.log('Pesquisa:', term);
  }

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
