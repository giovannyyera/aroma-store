from decimal import Decimal
from urllib.parse import quote

from django.conf import settings


def formatar_valor(valor):
    return f"{valor:.2f}".replace(".", ",")


def gerar_whatsapp_pedido(pedido):
    total = Decimal("0.00")

    linhas = [
        "Olá! Gostaria de confirmar meu pedido.",
        "",
        f"Pedido #{pedido.id}",
        f"Cliente: {pedido.cliente.nome}",
        "",
        "Itens:",
    ]

    for item in pedido.itens.select_related("produto").all():
        subtotal = item.preco_unitario * item.quantidade
        total += subtotal

        linhas.append(
            f"- {item.produto.nome} | "
            f"Qtd: {item.quantidade} | "
            f"R$ {formatar_valor(subtotal)}"
        )

    linhas.extend([
        "",
        f"Total: R$ {formatar_valor(total)}",
        "",
        "Dados para entrega:",
        (
            f"{pedido.cliente.endereco}, "
            f"{pedido.cliente.numero}"
        ),
        (
            f"{pedido.cliente.bairro} - "
            f"{pedido.cliente.cidade}/"
            f"{pedido.cliente.estado}"
        ),
        f"CEP: {pedido.cliente.cep}",
    ])

    if pedido.cliente.complemento:
        linhas.append(
            f"Complemento: {pedido.cliente.complemento}"
        )

    if pedido.observacao:
        linhas.extend([
            "",
            f"Observação: {pedido.observacao}",
        ])

    mensagem = "\n".join(linhas)

    numero = "".join(
        caractere
        for caractere in settings.WHATSAPP_NUMBER
        if caractere.isdigit()
    )

    url = (
        f"https://wa.me/{numero}"
        f"?text={quote(mensagem)}"
    )

    return mensagem, url