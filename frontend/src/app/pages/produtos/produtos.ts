
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CatalogoService } from '../../core/services/catalogo.service';
import { CarrinhoService } from '../../core/services/carrinho.service';

import { Categoria, Produto } from '../../models/catalogo.model';

@Component({
  selector: 'app-produtos',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class Produtos implements OnInit {

  produtos = signal<Produto[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriaSelecionada = signal<number | null>(null);
  carregando = signal(true);
  erro = signal('');
  paginaAtual = signal(1);
  totalProdutos = signal(0);
  temProxima = signal(false);
  temAnterior = signal(false);
  menuOpen = false;
  searchOpen = false;
  searchTerm = '';

  constructor(
    private catalogoService: CatalogoService,
    public carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarProdutos();
  }

  get cartCount(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  carregarCategorias(): void {
    this.catalogoService.listarCategorias().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
      },
      error: (erro) => {
        console.error('Erro ao carregar categorias:', erro);
      }
    });
  }

  carregarProdutos(page: number = 1): void {
    this.carregando.set(true);
    this.erro.set('');

    const categoria = this.categoriaSelecionada();

    this.catalogoService.listarProdutos(
      page,
      categoria
    ).subscribe({
      next: (resposta) => {
        this.produtos.set(resposta.results);
        this.totalProdutos.set(resposta.count);
        this.paginaAtual.set(page);

        this.temProxima.set(resposta.next !== null);
        this.temAnterior.set(resposta.previous !== null);

        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os produtos.');
        this.carregando.set(false);
      }
    });
  }

  selecionarCategoria(id: number | null): void {
    this.categoriaSelecionada.set(id);
    this.carregarProdutos(1);
  }

  paginaAnterior(): void {
    if (this.temAnterior()) {
      this.carregarProdutos(this.paginaAtual() - 1);
    }
  }

  proximaPagina(): void {
    if (this.temProxima()) {
      this.carregarProdutos(this.paginaAtual() + 1);
    }
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

    if (!term) {
      return;
    }

    console.log('Pesquisa:', term);
  }
}
