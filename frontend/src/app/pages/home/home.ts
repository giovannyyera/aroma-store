import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../core/services/carrinho.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  menuOpen: boolean = false;
  searchOpen: boolean = false;
  searchTerm: string = '';

  constructor(public carrinhoService: CarrinhoService) {}

  get cartCount(): number {
    return this.carrinhoService.quantidadeTotal();
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