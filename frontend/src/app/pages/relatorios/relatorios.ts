import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RelatorioService } from '../../core/services/relatorio.service';

import {
  CategoriaVendas,
  ProdutoVendido,
  ResumoGeral,
  VendasMensaisPivot
} from '../../models/relatorio.model';

@Component({
  selector: 'app-relatorios',
  imports: [
    CommonModule
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class Relatorios implements OnInit {

  resumo = signal<ResumoGeral | null>(null);

  produtos = signal<ProdutoVendido[]>([]);
  categorias = signal<CategoriaVendas[]>([]);

  pivot = signal<VendasMensaisPivot | null>(null);

  carregando = signal(true);
  erro = signal('');

  constructor(
    private relatorioService: RelatorioService
  ) {}

  ngOnInit(): void {
    this.carregarRelatorios();
  }

  carregarRelatorios(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.relatorioService.buscarResumo().subscribe({
      next: (dados) => {
        this.resumo.set(dados);
      },

      error: () => {
        this.erro.set(
          'Não foi possível acessar os relatórios. Verifique se você está autenticado como administrador.'
        );

        this.carregando.set(false);
      }
    });

    this.relatorioService.buscarProdutosVendidos().subscribe({
      next: (dados) => {
        this.produtos.set(dados);
      }
    });

    this.relatorioService.buscarVendasPorCategoria().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
      }
    });

    this.relatorioService.buscarPivot().subscribe({
      next: (dados) => {
        this.pivot.set(dados);
        this.carregando.set(false);
      }
    });
  }
}