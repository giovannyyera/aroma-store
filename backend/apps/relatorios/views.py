from decimal import Decimal

from django.db.models import (
    DecimalField,
    ExpressionWrapper,
    F,
    Sum,
)
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth

from apps.pedidos.models import Pedido, ItemPedido

from .serializers import (
    CategoriaVendasSerializer,
    ProdutoVendidoSerializer,
    ResumoGeralSerializer,
)


class ResumoGeralView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        itens_concluidos = ItemPedido.objects.filter(
            pedido__status=Pedido.Status.CONCLUIDO
        )

        valor_item = ExpressionWrapper(
            F("quantidade") * F("preco_unitario"),
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2
            )
        )

        faturamento = (
            itens_concluidos
            .aggregate(total=Sum(valor_item))
            ["total"]
            or Decimal("0.00")
        )

        dados = {
            "total_pedidos": Pedido.objects.count(),

            "pedidos_pendentes": Pedido.objects.filter(
                status=Pedido.Status.PENDENTE
            ).count(),

            "pedidos_confirmados": Pedido.objects.filter(
                status=Pedido.Status.CONFIRMADO
            ).count(),

            "pedidos_concluidos": Pedido.objects.filter(
                status=Pedido.Status.CONCLUIDO
            ).count(),

            "pedidos_cancelados": Pedido.objects.filter(
                status=Pedido.Status.CANCELADO
            ).count(),

            "faturamento_realizado": faturamento,
        }

        serializer = ResumoGeralSerializer(dados)

        return Response(serializer.data)


class ProdutosVendidosView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        valor_item = ExpressionWrapper(
            F("quantidade") * F("preco_unitario"),
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2
            )
        )

        consulta = (
            ItemPedido.objects
            .filter(
                pedido__status=Pedido.Status.CONCLUIDO
            )
            .values(
                id_produto=F("produto_id"),
                produto_nome=F("produto__nome"),
                categoria_nome=F(
                    "produto__categoria__nome"
                ),
            )
            .annotate(
                quantidade_vendida=Sum("quantidade"),
                faturamento=Sum(valor_item),
            )
            .order_by("-quantidade_vendida")
        )

        serializer = ProdutoVendidoSerializer(
            consulta,
            many=True
        )

        return Response(serializer.data)


class VendasPorCategoriaView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        valor_item = ExpressionWrapper(
            F("quantidade") * F("preco_unitario"),
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2
            )
        )

        consulta = (
            ItemPedido.objects
            .filter(
                pedido__status=Pedido.Status.CONCLUIDO
            )
            .values(
                categoria_id=F(
                    "produto__categoria__id"
                ),
                categoria_nome=F(
                    "produto__categoria__nome"
                ),
            )
            .annotate(
                quantidade_vendida=Sum("quantidade"),
                faturamento=Sum(valor_item),
            )
            .order_by("-faturamento")
        )

        serializer = CategoriaVendasSerializer(
            consulta,
            many=True
        )

        return Response(serializer.data)

class VendasMensaisPivotView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        valor_item = ExpressionWrapper(
            F("quantidade") * F("preco_unitario"),
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2
            )
        )

        consulta = (
            ItemPedido.objects
            .filter(
                pedido__status=Pedido.Status.CONCLUIDO
            )
            .annotate(
                mes=TruncMonth("pedido__criado_em")
            )
            .values(
                "mes",
                categoria_nome=F(
                    "produto__categoria__nome"
                ),
            )
            .annotate(
                faturamento=Sum(valor_item)
            )
            .order_by(
                "categoria_nome",
                "mes"
            )
        )

        meses = sorted({
            registro["mes"]
            for registro in consulta
            if registro["mes"]
        })

        categorias = {}

        for registro in consulta:
            categoria = registro["categoria_nome"]
            mes = registro["mes"]
            faturamento = registro["faturamento"] or Decimal("0.00")

            if categoria not in categorias:
                categorias[categoria] = {
                    "categoria": categoria,
                    "meses": {},
                    "total": Decimal("0.00"),
                }

            chave_mes = mes.strftime("%Y-%m")

            categorias[categoria]["meses"][chave_mes] = faturamento
            categorias[categoria]["total"] += faturamento

        resultado = {
            "colunas": [
                mes.strftime("%Y-%m")
                for mes in meses
            ],
            "linhas": list(categorias.values()),
        }

        return Response(resultado)