from django.core.exceptions import ValidationError
from django.db import transaction

from apps.catalogo.models import Produto
from apps.estoque.models import MovimentacaoEstoque
from .models import Pedido


@transaction.atomic
def confirmar_pedido(pedido_id):
    pedido = (
        Pedido.objects
        .select_for_update()
        .prefetch_related("itens")
        .get(id=pedido_id)
    )

    if pedido.status == Pedido.Status.CONFIRMADO:
        return pedido

    if pedido.status != Pedido.Status.PENDENTE:
        raise ValidationError(
            "Somente pedidos pendentes podem ser confirmados."
        )

    itens = list(pedido.itens.select_related("produto"))

    if not itens:
        raise ValidationError(
            "O pedido não possui itens."
        )

    for item in itens:
        produto = Produto.objects.select_for_update().get(
            id=item.produto_id
        )

        if produto.estoque < item.quantidade:
            raise ValidationError(
                f"Estoque insuficiente para o produto {produto.nome}."
            )

        produto.estoque -= item.quantidade
        produto.save(update_fields=["estoque"])

        MovimentacaoEstoque.objects.create(
            produto=produto,
            pedido=pedido,
            tipo=MovimentacaoEstoque.Tipo.SAIDA,
            quantidade=item.quantidade
        )

    pedido.status = Pedido.Status.CONFIRMADO
    pedido.save(update_fields=["status", "atualizado_em"])

    return pedido

@transaction.atomic #confirmação precisa ser uma operação única
def cancelar_pedido(pedido_id):
    pedido = (
        Pedido.objects
        .select_for_update() #bloqueia temporariamente aquela linha do banco durante a transação
        .prefetch_related("itens")
        .get(id=pedido_id)
    )

    if pedido.status == Pedido.Status.CANCELADO:
        return pedido

    if pedido.status == Pedido.Status.CONFIRMADO:
        itens = list(pedido.itens.select_related("produto"))

        for item in itens:
            produto = Produto.objects.select_for_update().get(
                id=item.produto_id
            )

            produto.estoque += item.quantidade
            produto.save(update_fields=["estoque"])

            MovimentacaoEstoque.objects.create(
                produto=produto,
                pedido=pedido,
                tipo=MovimentacaoEstoque.Tipo.ENTRADA,
                quantidade=item.quantidade
            )

    elif pedido.status != Pedido.Status.PENDENTE:
        raise ValidationError(
            "Este pedido não pode ser cancelado."
        )

    pedido.status = Pedido.Status.CANCELADO
    pedido.save(update_fields=["status", "atualizado_em"])

    return pedido

@transaction.atomic
def concluir_pedido(pedido_id):
    pedido = (
        Pedido.objects
        .select_for_update()
        .get(id=pedido_id)
    )

    if pedido.status == Pedido.Status.CONCLUIDO:
        return pedido

    if pedido.status != Pedido.Status.CONFIRMADO:
        raise ValidationError(
            "Somente pedidos confirmados podem ser concluídos."
        )

    pedido.status = Pedido.Status.CONCLUIDO
    pedido.save(update_fields=["status", "atualizado_em"])

    return pedido