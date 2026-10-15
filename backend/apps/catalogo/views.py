from rest_framework import generics
from rest_framework.permissions import AllowAny
from .pagination import ProdutoPagination

from .models import Categoria, Produto
from .serializers import (
    CategoriaSerializer,
    ProdutoListSerializer,
    ProdutoDetailSerializer,
)


class CategoriaListView(generics.ListAPIView):  # cria uma API de listagem usando GET
    serializer_class = CategoriaSerializer
    permission_classes = [
        AllowAny
    ]  # permite que visitantes consultem o catálogo sem login

    def get_queryset(self):
        return Categoria.objects.filter(ativo=True)


class ProdutoListView(generics.ListAPIView):
    serializer_class = ProdutoListSerializer
    permission_classes = [AllowAny]
    pagination_class = ProdutoPagination

    def get_queryset(self):
        queryset = (
            Produto.objects.filter(ativo=True, categoria__ativo=True)
            .select_related("categoria")
            .prefetch_related("imagens")
        )

        busca = self.request.query_params.get("busca", "").strip()

        categoria = self.request.query_params.get("categoria", "").strip()

        if busca:
            queryset = queryset.filter(nome__icontains=busca)

        if categoria:
            if not categoria.isdecimal():
                return queryset.none()

            queryset = queryset.filter(categoria_id=int(categoria))

        return queryset


class ProdutoDetailView(generics.RetrieveAPIView):
    serializer_class = ProdutoDetailSerializer
    permission_classes = [AllowAny]

    queryset = (
        Produto.objects
        .filter(
            ativo=True,
            categoria__ativo=True
        )
        .select_related("categoria")
        .prefetch_related("imagens")
    )
