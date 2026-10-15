from django.contrib import admin

from .models import MovimentacaoEstoque


@admin.register(MovimentacaoEstoque)
class MovimentacaoEstoqueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "produto",
        "pedido",
        "tipo",
        "quantidade",
        "criado_em",
    )

    list_filter = (
        "tipo",
        "criado_em",
    )

    search_fields = (
        "produto__nome",
        "pedido__cliente__nome",
    )

    ordering = ("-criado_em",)