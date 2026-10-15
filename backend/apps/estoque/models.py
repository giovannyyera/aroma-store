from django.db import models

from apps.catalogo.models import Produto
from apps.pedidos.models import Pedido


class MovimentacaoEstoque(models.Model):
    class Tipo(models.TextChoices):
        SAIDA = "SAIDA", "Saída"
        ENTRADA = "ENTRADA", "Entrada"

    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name="movimentacoes_estoque"
    )

    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.PROTECT,
        related_name="movimentacoes_estoque",
        null=True,
        blank=True
    )

    tipo = models.CharField(
        max_length=10,
        choices=Tipo.choices
    )

    quantidade = models.PositiveIntegerField()

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "movimentacao_estoque"
        ordering = ["-criado_em"]
        verbose_name = "Movimentação de Estoque"
        verbose_name_plural = "Movimentações de Estoque"

    def __str__(self):
        return f"{self.tipo} - {self.produto.nome} - {self.quantidade}"