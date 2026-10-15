from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.catalogo.models import Produto
from apps.clientes.models import Cliente
from .models import Pedido, ItemPedido
from .utils import gerar_whatsapp_pedido


class ItemCheckoutSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=150)
    email = serializers.EmailField(
        required=False,
        allow_blank=True
    )
    telefone = serializers.CharField(max_length=20)

    cep = serializers.CharField(max_length=9)
    endereco = serializers.CharField(max_length=200)
    numero = serializers.CharField(max_length=20)
    complemento = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )
    bairro = serializers.CharField(max_length=100)
    cidade = serializers.CharField(max_length=100)
    estado = serializers.CharField(max_length=2)

    observacao = serializers.CharField(
        required=False,
        allow_blank=True
    )

    itens = ItemCheckoutSerializer(many=True)

    def validate_nome(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Informe um nome válido."
            )

        return value

    def validate_estado(self, value):
        value = value.strip().upper()

        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError(
                "Informe o estado utilizando a UF com 2 letras."
            )

        return value

    def validate_cep(self, value):
        cep = value.replace("-", "").strip()

        if not cep.isdigit() or len(cep) != 8:
            raise serializers.ValidationError(
                "Informe um CEP válido."
            )

        return f"{cep[:5]}-{cep[5:]}"

    def validate_telefone(self, value):
        numeros = "".join(
            caractere
            for caractere in value
            if caractere.isdigit()
        )

        if len(numeros) < 10 or len(numeros) > 11:
            raise serializers.ValidationError(
                "Informe um telefone válido com DDD."
            )

        return value.strip()

    def validate_itens(self, itens):
        if not itens:
            raise serializers.ValidationError(
                "O pedido deve possuir pelo menos um item."
            )

        produtos_ids = [
            item["produto_id"]
            for item in itens
        ]

        if len(produtos_ids) != len(set(produtos_ids)):
            raise serializers.ValidationError(
                "O mesmo produto não pode aparecer mais de uma vez."
            )

        return itens

    @transaction.atomic
    def create(self, validated_data):
        itens_data = validated_data.pop("itens")
        observacao = validated_data.pop("observacao", "")

        cliente = Cliente.objects.create(
            **validated_data
        )

        pedido = Pedido.objects.create(
            cliente=cliente,
            observacao=observacao,
            status=Pedido.Status.PENDENTE
        )

        for item_data in itens_data:
            produto_id = item_data["produto_id"]
            quantidade = item_data["quantidade"]

            try:
                produto = Produto.objects.get(
                    id=produto_id,
                    ativo=True,
                    categoria__ativo=True
                )
            except Produto.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        "itens":
                        f"Produto {produto_id} não encontrado ou inativo."
                    }
                )

            if quantidade > produto.estoque:
                raise serializers.ValidationError(
                    {
                        "itens":
                        f"Estoque insuficiente para {produto.nome}."
                    }
                )

            ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                quantidade=quantidade,
                preco_unitario=produto.preco
            )

        return pedido

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(
        source="produto.nome",
        read_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = [
            "produto",
            "produto_nome",
            "quantidade",
            "preco_unitario",
            "subtotal",
        ]

    def get_subtotal(self, obj):
        return obj.preco_unitario * obj.quantidade


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(
        many=True,
        read_only=True
    )

    total = serializers.SerializerMethodField()

    whatsapp_mensagem = serializers.SerializerMethodField()
    whatsapp_url = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            "id",
            "status",
            "observacao",
            "criado_em",
            "itens",
            "total",
            "whatsapp_mensagem",
            "whatsapp_url",
        ]

    def get_total(self, obj):
        return sum(
            (
                item.preco_unitario * item.quantidade
                for item in obj.itens.all()
            ),
            Decimal("0.00")
        )

    def get_whatsapp_mensagem(self, obj):
        mensagem, _ = gerar_whatsapp_pedido(obj)
        return mensagem

    def get_whatsapp_url(self, obj):
        _, url = gerar_whatsapp_pedido(obj)
        return url