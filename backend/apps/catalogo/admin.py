from django.contrib import admin
from .models import Categoria, Produto


@admin.register(Categoria) #registra o modelo no painel admin
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "ativo") #define as colunas exibidas no painel
    list_filter = ("ativo",) #adiciona filtros laterais
    search_fields = ("nome", "descricao") #permite pesquisar registros
    ordering = ("nome",) #ordenação padrão


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "categoria",
        "preco",
        "estoque",
        "ativo",
        "criado_em",
    )

    list_filter = ("categoria", "ativo")
    search_fields = ("nome", "descricao")
    ordering = ("nome",)
    list_per_page = 20 #limita a quantidade de registros por pg