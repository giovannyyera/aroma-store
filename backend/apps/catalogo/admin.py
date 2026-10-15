from django.contrib import admin

from .models import Categoria, Produto, ProdutoImagem


class ProdutoImagemInline(admin.TabularInline):
    model = ProdutoImagem
    extra = 1

    fields = (
        "imagem",
        "thumbnail",
        "principal",
        "ordem",
        "alt_text",
    )

    readonly_fields = (
        "thumbnail",
    )


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "ativo",
    )

    list_filter = (
        "ativo",
    )

    search_fields = (
        "nome",
        "descricao",
    )

    ordering = (
        "nome",
    )


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

    list_filter = (
        "categoria",
        "ativo",
    )

    search_fields = (
        "nome",
        "descricao",
    )

    ordering = (
        "nome",
    )

    list_per_page = 20

    inlines = [
        ProdutoImagemInline,
    ]


@admin.register(ProdutoImagem)
class ProdutoImagemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "produto",
        "principal",
        "ordem",
        "criado_em",
    )

    list_filter = (
        "principal",
        "criado_em",
    )

    search_fields = (
        "produto__nome",
        "alt_text",
    )

    ordering = (
        "produto",
        "ordem",
    )