import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminCategoriasService } from '../../../core/services/admin-categorias.service';
import { AdminCategoria } from '../../../models/admin-categoria.model';

@Component({
  selector: 'app-categorias',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  categorias = signal<AdminCategoria[]>([]);
  carregando = signal(true);
  erro = signal('');

  constructor(
    private categoriasService: AdminCategoriasService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.categoriasService.listar().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
        this.carregando.set(false);
      },

      error: () => {
        this.erro.set(
          'Não foi possível carregar as categorias.'
        );

        this.carregando.set(false);
      }
    });
  }

  ativar(id: number): void {
    this.categoriasService.ativar(id).subscribe({
      next: () => this.carregar()
    });
  }

  desativar(id: number): void {
    this.categoriasService.desativar(id).subscribe({
      next: () => this.carregar()
    });
  }
}