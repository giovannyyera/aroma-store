
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
    CommonModule,
    RouterLink
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

    if (this.carregando() && this.resumo() !== null) {
      return;
    }

    this.carregando.set(true);
    this.erro.set('');

    forkJoin({
      resumo: this.relatorioService.buscarResumo(),

      produtos: this.relatorioService.buscarProdutosVendidos(),

      categorias: this.relatorioService.buscarVendasPorCategoria(),

      pivot: this.relatorioService.buscarPivot()
    })
    .pipe(
      finalize(() => {
        this.carregando.set(false);
      })
    )
    .subscribe({

      next: (dados) => {

        this.resumo.set(dados.resumo);

        this.produtos.set(dados.produtos);

        this.categorias.set(dados.categorias);

        this.pivot.set(dados.pivot);

      },

      error: (erro) => {

        console.error(
          'Erro ao carregar relatórios:',
          erro
        );

        if (erro.status === 0) {
          this.erro.set(
            'Não foi possível conectar ao servidor. Verifique sua conexão.'
          );

          return;
        }

        if (erro.status === 401 || erro.status === 403) {
          this.erro.set(
            'Você não possui autorização para acessar os relatórios.'
          );

          return;
        }

        this.erro.set(
          'Não foi possível carregar os relatórios. Tente novamente.'
        );
      }

    });
  }
}
