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

    if (this.enviando()) {
      return;
    }

    this.erro.set('');

    const usuario = this.username.trim();

    if (!usuario || !this.password) {
      this.erro.set(
        'Informe seu usuário e sua senha.'
      );
      return;
    }

    this.enviando.set(true);

    this.authService.login(
      usuario,
      this.password
    ).subscribe({

      next: () => {
        this.enviando.set(false);

        this.password = '';

        this.router.navigate(['/admin']);
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

        if (erro.status === 0) {
          this.erro.set(
            'Não foi possível conectar ao servidor. Verifique sua conexão.'
          );
          return;
        }

        this.erro.set(
          'Não foi possível realizar o login. Tente novamente.'
        );
      }
    });
  }
}
