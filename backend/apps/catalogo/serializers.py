from rest_framework import serializers

from .models import Categoria, Produto, ProdutoImagem


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = [
            "id",
            "nome",
            "descricao",
        ]


class ProdutoImagemSerializer(serializers.ModelSerializer):
    imagem_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ProdutoImagem
        fields = [
            "id",
            "imagem_url",
            "thumbnail_url",
            "principal",
            "ordem",
            "alt_text",
        ]

    def get_imagem_url(self, obj):
        request = self.context.get("request")

        if not obj.imagem:
            return None

        url = obj.imagem.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")

        if not obj.thumbnail:
            return None

        url = obj.thumbnail.url

        if request:
            return request.build_absolute_uri(url)

        return url


class ProdutoBaseSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(
        source="categoria.nome",
        read_only=True
    )

    imagem_principal = serializers.SerializerMethodField()

    def get_imagem_principal(self, obj):
        imagem = (
            obj.imagens
            .filter(principal=True)
            .first()
        )

        if not imagem:
            return None

        arquivo = (
            imagem.thumbnail
            if imagem.thumbnail
            else imagem.imagem
        )

        if not arquivo:
            return None

        request = self.context.get("request")
        url = arquivo.url

        if request:
            return request.build_absolute_uri(url)

        return url


class ProdutoListSerializer(ProdutoBaseSerializer):
    class Meta:
        model = Produto
        fields = [
            "id",
            "nome",
            "descricao",
            "preco",
            "estoque",
            "categoria",
            "categoria_nome",
            "imagem_principal",
        ]


class ProdutoDetailSerializer(ProdutoBaseSerializer):
    imagens = ProdutoImagemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Produto
        fields = [
            "id",
            "nome",
            "descricao",
            "preco",
            "estoque",
            "categoria",
            "categoria_nome",
            "imagem_principal",
            "imagens",
        ]