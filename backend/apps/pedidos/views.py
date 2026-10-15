from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import (
    CheckoutSerializer,
    PedidoSerializer,
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