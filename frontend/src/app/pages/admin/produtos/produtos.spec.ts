import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProdutosAdmin } from './produtos';

describe('ProdutosAdmin', () => {
  let component: ProdutosAdmin;
  let fixture: ComponentFixture<ProdutosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosAdmin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutosAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
