from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Categoria, Produto
from .serializers import CategoriaSerializer, ProdutoSerializer


class CategoriaListView(generics.ListAPIView): #cria uma API de listagem usando GET
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny] #permite que visitantes consultem o catálogo sem login

    def get_queryset(self):
        return Categoria.objects.filter(ativo=True)


class ProdutoListView(generics.ListAPIView):
    serializer_class = ProdutoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self): #monta a consulta de acordo com os filtros enviados na URL
        queryset = Produto.objects.filter(
            ativo=True,
            categoria__ativo=True
        ).select_related("categoria") #otimiza a consulta ao relacionamento com categoria

        busca = self.request.query_params.get("busca", "").strip() #recupera os parâmetros busca e categoria
        categoria = self.request.query_params.get("categoria", "").strip()

        if busca:
            queryset = queryset.filter(nome__icontains=busca) #pesquisa nomes sem diferenciar letras maiúsculas e minúsculas

        if categoria:
            if not categoria.isdecimal():
                return queryset.none() #retorna uma lista vazia quando o identificador da categoria não é numérico

            queryset = queryset.filter(categoria_id=int(categoria)) #filtra os produtos pela chave estrangeira da categoria

        return queryset


class ProdutoDetailView(generics.RetrieveAPIView): #retorna um único produto pelo ID
    serializer_class = ProdutoSerializer
    permission_classes = [AllowAny]

    queryset = Produto.objects.filter(
        ativo=True,
        categoria__ativo=True
    ).select_related("categoria")