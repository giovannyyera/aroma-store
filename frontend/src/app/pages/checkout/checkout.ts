import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CarrinhoService } from '../../core/services/carrinho.service';
import { PedidoService } from '../../core/services/pedido.service';
import { CheckoutPayload } from '../../models/pedido.model';

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
  erro = signal('');
  pedidoCriado = signal<number | null>(null);
  whatsappUrl = signal('');

  formatarTelefone(): void {
    let numeros = this.telefone.replace(/\D/g, '');

    numeros = numeros.slice(0, 11);

    if (numeros.length <= 2) {
      this.telefone = numeros;
      return;
    }

    if (numeros.length <= 6) {
      this.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
      return;
    }

    if (numeros.length <= 10) {
      this.telefone = `(${numeros.slice(0, 2)}) ` + `${numeros.slice(2, 6)}-${numeros.slice(6)}`;
      return;
    }

    this.telefone = `(${numeros.slice(0, 2)}) ` + `${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  constructor(
    public carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
  ) {}

  finalizarPedido(): void {
    if (this.carrinhoService.itens().length === 0) {
      this.erro.set('O carrinho está vazio.');
      return;
    }

    const dados: CheckoutPayload = {
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      cep: this.cep,
      endereco: this.endereco,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      estado: this.estado,
      observacao: this.observacao,

      itens: this.carrinhoService.itens().map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
      })),
    };

    this.enviando.set(true);
    this.erro.set('');

    this.pedidoService.criarCheckout(dados).subscribe({
      next: (pedido) => {
        this.enviando.set(false);

        this.pedidoCriado.set(pedido.id);
        this.whatsappUrl.set(pedido.whatsapp_url);

        this.carrinhoService.limpar();
      },

      error: (erro) => {
        this.enviando.set(false);

        console.error(erro);

        const dadosErro = erro.error;

        if (dadosErro && typeof dadosErro === 'object') {
          const campo = Object.keys(dadosErro)[0];
          const mensagens = dadosErro[campo];

          if (Array.isArray(mensagens) && mensagens.length > 0) {
            this.erro.set(mensagens[0]);
            return;
          }
        }

        this.erro.set('Não foi possível finalizar o pedido.');
      },
    });
  }

  abrirWhatsApp(): void {
    const url = this.whatsappUrl();

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
