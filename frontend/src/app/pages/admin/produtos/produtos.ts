import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminProdutosService } from '../../../core/services/admin-produtos.service';
import { AdminProduto } from '../../../models/admin-produto.model';



@Component({
  selector: 'app-produtos-admin',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css'
})
export class ProdutosAdmin implements OnInit {

  produtos = signal<AdminProduto[]>([]);

  carregando = signal(true);
  erro = signal('');

  busca = '';

  constructor(
    private produtosService: AdminProdutosService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(
    ativo = ''
  ): void {

    this.carregando.set(true);
    this.erro.set('');

    this.produtosService
      .listar(this.busca, ativo)
      .subscribe({

        next: (dados) => {
          this.produtos.set(dados);
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

  ativar(id: number): void {
    this.produtosService.ativar(id).subscribe({
      next: () => this.carregar()
    });
  }

  desativar(id: number): void {
    this.produtosService.desativar(id).subscribe({
      next: () => this.carregar()
    });
  }
}