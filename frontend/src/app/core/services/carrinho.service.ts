import { Injectable, computed, signal } from '@angular/core';

import { Produto } from '../../models/catalogo.model';
import { ItemCarrinho } from '../../models/carrinho.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private readonly itensSignal = signal<ItemCarrinho[]>([]);

  itens = this.itensSignal.asReadonly();

  quantidadeTotal = computed(() =>
    this.itensSignal().reduce(
      (total, item) => total + item.quantidade,
      0
    )
  );

  valorTotal = computed(() =>
    this.itensSignal().reduce(
      (total, item) =>
        total + Number(item.produto.preco) * item.quantidade,
      0
    )
  );

  adicionarProduto(produto: Produto): void {
    const itens = [...this.itensSignal()];

    const itemExistente = itens.find(
      item => item.produto.id === produto.id
    );

    if (itemExistente) {
      if (itemExistente.quantidade < produto.estoque) {
        itemExistente.quantidade++;
      }
    } else {
      if (produto.estoque > 0) {
        itens.push({
          produto,
          quantidade: 1
        });
      }
    }

    this.itensSignal.set([...itens]);
  }

  aumentarQuantidade(produtoId: number): void {
    const itens = [...this.itensSignal()];

    const item = itens.find(
      item => item.produto.id === produtoId
    );

    if (
      item &&
      item.quantidade < item.produto.estoque
    ) {
      item.quantidade++;

      this.itensSignal.set([...itens]);
    }
  }

  diminuirQuantidade(produtoId: number): void {
    const itens = [...this.itensSignal()];

    const item = itens.find(
      item => item.produto.id === produtoId
    );

    if (!item) {
      return;
    }

    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      const indice = itens.indexOf(item);
      itens.splice(indice, 1);
    }

    this.itensSignal.set([...itens]);
  }

  removerProduto(produtoId: number): void {
    this.itensSignal.set(
      this.itensSignal().filter(
        item => item.produto.id !== produtoId
      )
    );
  }

  limpar(): void {
    this.itensSignal.set([]);
  }
}