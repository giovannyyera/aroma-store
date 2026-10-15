from django.db import models

from apps.clientes.models import Cliente
from apps.catalogo.models import Produto


class Pedido(models.Model):
    class Status(models.TextChoices):
        PENDENTE = "PENDENTE", "Pendente"
        CONFIRMADO = "CONFIRMADO", "Confirmado"
        CONCLUIDO = "CONCLUIDO", "Concluído"
        CANCELADO = "CANCELADO", "Cancelado"

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="pedidos"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE
    )

    observacao = models.TextField(blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pedido"
        ordering = ["-criado_em"]
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.nome}"

class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name="itens"
    )

    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name="itens_pedido"
    )

    quantidade = models.PositiveIntegerField()
    preco_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        db_table = "item_pedido"
        verbose_name = "Item do Pedido"
        verbose_name_plural = "Itens do Pedido"

    def __str__(self):
        return f"{self.produto.nome} x {self.quantidade}"