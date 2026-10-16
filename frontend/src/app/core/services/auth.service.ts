import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginResposta, UsuarioAdmin } from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/auth';

  private readonly tokenKey = 'admin_token';

  usuario = signal<UsuarioAdmin | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResposta> {
    return this.http
      .post<LoginResposta>(`${this.apiUrl}/login/`, {
        username,
        password,
      })
      .pipe(
        tap((resposta) => {
          localStorage.setItem(this.tokenKey, resposta.token);

          this.usuario.set(resposta.usuario);
        }),
      );
  }

  obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }

  limparSessao(): void {
    localStorage.removeItem(this.tokenKey);

    this.usuario.set(null);
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/logout/`, {}).pipe(
      tap(() => {
        this.limparSessao();
      }),
    );
  }
}
