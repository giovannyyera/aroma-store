from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView

from .models import Pedido
from .services import (
    confirmar_pedido,
    concluir_pedido,
    cancelar_pedido,
)

from .serializers import (
    CheckoutSerializer,
    PedidoSerializer,
    PedidoAdminSerializer,
)


class CheckoutView(generics.CreateAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        pedido = serializer.save()

        resposta = PedidoSerializer(pedido)

        return Response(
            resposta.data,
            status=status.HTTP_201_CREATED
        )

class PedidoAdminListView(generics.ListAPIView):
    serializer_class = PedidoAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Pedido.objects
            .select_related("cliente")
            .prefetch_related(
                "itens__produto"
            )
            .order_by("-criado_em")
        )

        status_param = (
            self.request.query_params
            .get("status", "")
            .strip()
            .upper()
        )

        if status_param:
            queryset = queryset.filter(
                status=status_param
            )

        return queryset


class PedidoAdminDetailView(generics.RetrieveAPIView):
    serializer_class = PedidoAdminSerializer
    permission_classes = [IsAdminUser]

    queryset = (
        Pedido.objects
        .select_related("cliente")
        .prefetch_related(
            "itens__produto"
        )
    )


class ConfirmarPedidoView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            pedido = confirmar_pedido(pk)

        except ValidationError as erro:
            return Response(
                {
                    "detail": erro.message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            PedidoAdminSerializer(pedido).data
        )


class ConcluirPedidoView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            pedido = concluir_pedido(pk)

        except ValidationError as erro:
            return Response(
                {
                    "detail": erro.message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            PedidoAdminSerializer(pedido).data
        )


class CancelarPedidoView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            pedido = cancelar_pedido(pk)

        except ValidationError as erro:
            return Response(
                {
                    "detail": erro.message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            PedidoAdminSerializer(pedido).data
        )