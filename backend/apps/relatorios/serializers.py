from rest_framework import serializers


class ResumoGeralSerializer(serializers.Serializer):
    total_pedidos = serializers.IntegerField()
    pedidos_pendentes = serializers.IntegerField()
    pedidos_confirmados = serializers.IntegerField()
    pedidos_concluidos = serializers.IntegerField()
    pedidos_cancelados = serializers.IntegerField()

    faturamento_realizado = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


class ProdutoVendidoSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField(
        source="id_produto"
    )

    produto_nome = serializers.CharField()
    categoria_nome = serializers.CharField()

    quantidade_vendida = serializers.IntegerField()

    faturamento = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )


class CategoriaVendasSerializer(serializers.Serializer):
    categoria_id = serializers.IntegerField()
    categoria_nome = serializers.CharField()

    quantidade_vendida = serializers.IntegerField()

    faturamento = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )