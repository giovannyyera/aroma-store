
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CarrinhoService } from '../../core/services/carrinho.service';
import { PedidoService } from '../../core/services/pedido.service';
import { CheckoutPayload } from '../../models/pedido.model';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {

  nome = '';
  email = '';
  telefone = '';

  cep = '';
  endereco = '';
  numero = '';
  complemento = '';
  bairro = '';
  cidade = '';
  estado = '';

  observacao = '';

  enviando = signal(false);
  buscandoCep = signal(false);

  erro = signal('');
  erroCep = signal('');

  pedidoCriado = signal<number | null>(null);
  whatsappUrl = signal('');
  menuOpen = false;
  searchOpen = false;
  searchTerm = '';

  constructor(
    public carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private http: HttpClient
  ) {}

  get cartCount(): number {
    return this.carrinhoService.quantidadeTotal();
  }

  valorItem(
    preco: string | number,
    quantidade: number
  ): number {
    return Number(preco) * quantidade;
  }

  formatarTelefone(): void {
    let numeros = this.telefone.replace(/\D/g, '');

    numeros = numeros.slice(0, 11);

    if (numeros.length <= 2) {
      this.telefone = numeros;
      return;
    }

    if (numeros.length <= 6) {
      this.telefone =
        `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
      return;
    }

    if (numeros.length <= 10) {
      this.telefone =
        `(${numeros.slice(0, 2)}) ` +
        `${numeros.slice(2, 6)}-${numeros.slice(6)}`;
      return;
    }

    this.telefone =
      `(${numeros.slice(0, 2)}) ` +
      `${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  formatarCep(): void {
    const numeros = this.cep.replace(/\D/g, '').slice(0, 8);

    if (numeros.length > 5) {
      this.cep =
        `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    } else {
      this.cep = numeros;
    }

    this.erroCep.set('');
  }

  buscarCep(): void {
    const cepNumerico = this.cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.erroCep.set('Informe um CEP com 8 dígitos.');
      return;
    }

    this.buscandoCep.set(true);
    this.erroCep.set('');

    this.http.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${cepNumerico}/json/`
    ).subscribe({
      next: (dados) => {
        this.buscandoCep.set(false);

        if (dados.erro) {
          this.erroCep.set('CEP não encontrado.');
          return;
        }

        this.endereco = dados.logradouro || '';
        this.bairro = dados.bairro || '';
        this.cidade = dados.localidade || '';
        this.estado = dados.uf || '';

      },

      error: () => {
        this.buscandoCep.set(false);
        this.erroCep.set(
          'Não foi possível consultar o CEP. Preencha o endereço manualmente.'
        );
      }
    });
  }

  private validarDados(): boolean {
    if (!this.nome.trim()) {
      this.erro.set('Informe seu nome completo.');
      return false;
    }

    const telefoneNumerico = this.telefone.replace(/\D/g, '');

    if (telefoneNumerico.length !== 11) {
      this.erro.set(
        'Informe um WhatsApp válido com DDD e 9 dígitos.'
      );
      return false;
    }

    if (
      this.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
    ) {
      this.erro.set('Informe um e-mail válido.');
      return false;
    }

    if (this.cep.replace(/\D/g, '').length !== 8) {
      this.erro.set('Informe um CEP válido.');
      return false;
    }

    if (
      !this.endereco.trim() ||
      !this.numero.trim() ||
      !this.bairro.trim() ||
      !this.cidade.trim()
    ) {
      this.erro.set(
        'Preencha todos os campos obrigatórios do endereço.'
      );
      return false;
    }

    if (!/^[A-Za-z]{2}$/.test(this.estado.trim())) {
      this.erro.set('Informe a UF com duas letras.');
      return false;
    }

    return true;
  }

  finalizarPedido(): void {
    if (this.enviando() || this.pedidoCriado() !== null) {
      return;
    }

    this.erro.set('');

    if (this.carrinhoService.itens().length === 0) {
      this.erro.set('O carrinho está vazio.');
      return;
    }

    if (!this.validarDados()) {
      return;
    }

    const dados: CheckoutPayload = {
      nome: this.nome.trim(),
      email: this.email.trim(),
      telefone: this.telefone.trim(),

      cep: this.cep.trim(),
      endereco: this.endereco.trim(),
      numero: this.numero.trim(),
      complemento: this.complemento.trim(),
      bairro: this.bairro.trim(),
      cidade: this.cidade.trim(),
      estado: this.estado.trim().toUpperCase(),

      observacao: this.observacao.trim(),

      itens: this.carrinhoService.itens().map(item => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade
      }))
    };

    this.enviando.set(true);

    this.pedidoService.criarCheckout(dados).subscribe({
      next: (pedido) => {
        this.enviando.set(false);

        this.pedidoCriado.set(pedido.id);
        this.whatsappUrl.set(pedido.whatsapp_url);

        this.carrinhoService.limpar();
      },

      error: (erro) => {
        this.enviando.set(false);

        console.error('Erro ao criar pedido:', erro);

        const dadosErro = erro.error;

        if (typeof dadosErro === 'string' && dadosErro.trim()) {
          this.erro.set(dadosErro);
          return;
        }

        if (dadosErro && typeof dadosErro === 'object') {
          if (typeof dadosErro.detail === 'string') {
            this.erro.set(dadosErro.detail);
            return;
          }

          const campo = Object.keys(dadosErro)[0];
          const mensagens = dadosErro[campo];

          if (Array.isArray(mensagens) && mensagens.length > 0) {
            this.erro.set(String(mensagens[0]));
            return;
          }

          if (typeof mensagens === 'string') {
            this.erro.set(mensagens);
            return;
          }
        }

        this.erro.set(
          'Não foi possível finalizar o pedido. Tente novamente.'
        );
      }
    });
  }

  abrirWhatsApp(): void {
    const url = this.whatsappUrl();

    if (!url) {
      this.erro.set(
        'O link do WhatsApp não está disponível.'
      );
      return;
    }
    if (!/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(url)) {
      this.erro.set('O link do WhatsApp é inválido.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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
}
