from django.contrib import admin, messages
from django.core.exceptions import ValidationError

from .models import Pedido, ItemPedido
from .services import (
    confirmar_pedido,
    cancelar_pedido,
    concluir_pedido,
)


# Quando o pedido não estiver pendente,
# os itens continuam visíveis, mas não podem ser alterados.
class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0

    def has_add_permission(self, request, obj=None):
        if obj and obj.status != Pedido.Status.PENDENTE:
            return False

        return super().has_add_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if obj and obj.status != Pedido.Status.PENDENTE:
            return False

        return super().has_delete_permission(request, obj)

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != Pedido.Status.PENDENTE:
            return (
                "produto",
                "quantidade",
                "preco_unitario",
            )

        return ()


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cliente",
        "status",
        "criado_em",
        "atualizado_em",
    )

    list_filter = (
        "status",
        "criado_em",
    )

    search_fields = (
        "cliente__nome",
        "cliente__telefone",
    )

    ordering = ("-criado_em",)

    readonly_fields = ("status",)

    # Permite visualizar e cadastrar os produtos dentro do pedido.
    inlines = [ItemPedidoInline]

    actions = (
        "confirmar_pedidos",
        "concluir_pedidos",
        "cancelar_pedidos",
    )

    @admin.action(description="Confirmar pedidos selecionados")
    def confirmar_pedidos(self, request, queryset):
        for pedido in queryset:
            try:
                confirmar_pedido(pedido.id)

                self.message_user(
                    request,
                    f"Pedido #{pedido.id} confirmado com sucesso.",
                    messages.SUCCESS,
                )

            except ValidationError as erro:
                self.message_user(
                    request,
                    f"Pedido #{pedido.id}: {erro.message}",
                    messages.ERROR,
                )

    @admin.action(description="Concluir pedidos selecionados")
    def concluir_pedidos(self, request, queryset):
        for pedido in queryset:
            try:
                concluir_pedido(pedido.id)

                self.message_user(
                    request,
                    f"Pedido #{pedido.id} concluído com sucesso.",
                    messages.SUCCESS,
                )

            except ValidationError as erro:
                self.message_user(
                    request,
                    f"Pedido #{pedido.id}: {erro.message}",
                    messages.ERROR,
                )

    @admin.action(description="Cancelar pedidos selecionados")
    def cancelar_pedidos(self, request, queryset):
        for pedido in queryset:
            try:
                cancelar_pedido(pedido.id)

                self.message_user(
                    request,
                    f"Pedido #{pedido.id} cancelado com sucesso.",
                    messages.SUCCESS,
                )

            except ValidationError as erro:
                self.message_user(
                    request,
                    f"Pedido #{pedido.id}: {erro.message}",
                    messages.ERROR,
                )