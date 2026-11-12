from rest_framework import generics
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import FormParser, MultiPartParser
from .pagination import ProdutoPagination
from django.db import transaction
from django.db.models.deletion import ProtectedError
from .models import Categoria, Produto, ProdutoImagem
from .serializers import (
    CategoriaSerializer,
    ProdutoListSerializer,
    ProdutoDetailSerializer,
    ProdutoAdminSerializer,
    ProdutoImagemAdminSerializer,
    CategoriaAdminSerializer,
)


class ExclusaoProtegida(APIException):
    status_code = 409


@transaction.atomic
def excluir_com_arquivos(instance, imagens):
    arquivos = [
        (arquivo.storage, arquivo.name)
        for imagem in imagens
        for arquivo in (imagem.imagem, imagem.thumbnail)
        if arquivo
    ]
    instance.delete()

    def remover_arquivos():
        for storage, nome in arquivos:
            storage.delete(nome)

    transaction.on_commit(remover_arquivos)


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

class ProdutoAdminListCreateView(generics.ListCreateAPIView):
    serializer_class = ProdutoAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Produto.objects
            .select_related("categoria")
            .prefetch_related("imagens")
            .order_by("nome")
        )

        busca = (
            self.request.query_params
            .get("busca", "")
            .strip()
        )

        ativo = (
            self.request.query_params
            .get("ativo", "")
            .strip()
            .lower()
        )

        if busca:
            queryset = queryset.filter(
                nome__icontains=busca
            )

        if ativo == "true":
            queryset = queryset.filter(
                ativo=True
            )

        elif ativo == "false":
            queryset = queryset.filter(
                ativo=False
            )

        return queryset


class ProdutoAdminDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ProdutoAdminSerializer
    permission_classes = [IsAdminUser]

    queryset = (
        Produto.objects
        .select_related("categoria")
        .prefetch_related("imagens")
    )

    def perform_destroy(self, instance):
        try:
            excluir_com_arquivos(instance, instance.imagens.all())
        except ProtectedError as exc:
            raise ExclusaoProtegida(
                "Não é possível excluir este produto porque ele já possui "
                "pedidos ou movimentações de estoque. Use a opção Desativar."
            ) from exc


class AtivarProdutoView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        produto = generics.get_object_or_404(
            Produto,
            pk=pk
        )

        produto.ativo = True
        produto.save(
            update_fields=["ativo"]
        )

        return Response(
            ProdutoAdminSerializer(
                produto,
                context={"request": request}
            ).data
        )


class DesativarProdutoView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        produto = generics.get_object_or_404(
            Produto,
            pk=pk
        )

        produto.ativo = False
        produto.save(
            update_fields=["ativo"]
        )

        return Response(
            ProdutoAdminSerializer(
                produto,
                context={"request": request}
            ).data
        )

class ProdutoImagemAdminListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = ProdutoImagemAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_produto(self):
        return generics.get_object_or_404(
            Produto,
            pk=self.kwargs["produto_id"]
        )

    def get_queryset(self):
        return (
            ProdutoImagem.objects
            .filter(
                produto=self.get_produto()
            )
            .order_by(
                "ordem",
                "id"
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            produto=self.get_produto()
        )


class ProdutoImagemAdminDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ProdutoImagemAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_queryset(self):
        return ProdutoImagem.objects.filter(
            produto_id=self.kwargs["produto_id"]
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        produto = instance.produto
        era_principal = instance.principal

        excluir_com_arquivos(instance, [instance])

        # Se apagou a principal, escolhe outra.
        if era_principal:
            proxima = (
                produto.imagens
                .order_by("ordem", "id")
                .first()
            )

            if proxima:
                proxima.principal = True
                proxima.save(
                    update_fields=["principal"]
                )

class CategoriaAdminListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = CategoriaAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Categoria.objects
            .all()
            .order_by("nome")
        )

        busca = (
            self.request.query_params
            .get("busca", "")
            .strip()
        )

        ativo = (
            self.request.query_params
            .get("ativo", "")
            .strip()
            .lower()
        )

        if busca:
            queryset = queryset.filter(
                nome__icontains=busca
            )

        if ativo == "true":
            queryset = queryset.filter(
                ativo=True
            )

        elif ativo == "false":
            queryset = queryset.filter(
                ativo=False
            )

        return queryset


class CategoriaAdminDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CategoriaAdminSerializer
    permission_classes = [IsAdminUser]

    queryset = Categoria.objects.all()

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError as exc:
            raise ExclusaoProtegida(
                "Não é possível excluir esta categoria porque ela possui "
                "produtos vinculados. Desative-a ou exclua/mova os produtos antes."
            ) from exc


class AtivarCategoriaView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        categoria = generics.get_object_or_404(
            Categoria,
            pk=pk
        )

        categoria.ativo = True
        categoria.save(
            update_fields=["ativo"]
        )

        return Response(
            CategoriaAdminSerializer(
                categoria
            ).data
        )


class DesativarCategoriaView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        categoria = generics.get_object_or_404(
            Categoria,
            pk=pk
        )

        categoria.ativo = False
        categoria.save(
            update_fields=["ativo"]
        )

        return Response(
            CategoriaAdminSerializer(
                categoria
            ).data
        )