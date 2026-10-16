import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  enviando = signal(false);
  erro = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar(): void {
    this.erro.set('');
    this.enviando.set(true);

    this.authService.login(
      this.username,
      this.password
    ).subscribe({
      next: () => {
        this.enviando.set(false);

        this.router.navigate([
          '/admin'
        ]);
      },

      error: (erro) => {
        this.enviando.set(false);

        if (erro.status === 401) {
          this.erro.set(
            'Usuário ou senha inválidos.'
          );

          return;
        }

        if (erro.status === 403) {
          this.erro.set(
            'Usuário sem permissão administrativa.'
          );

          return;
        }

        this.erro.set(
          'Não foi possível realizar o login.'
        );
      }
    });
  }
}