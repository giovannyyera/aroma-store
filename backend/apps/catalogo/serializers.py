from rest_framework import serializers

from .models import Categoria, Produto, ProdutoImagem
from django.db import transaction

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

class ProdutoAdminSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(
        source="categoria.nome",
        read_only=True
    )

    imagem_principal = serializers.SerializerMethodField()

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
            "ativo",
            "criado_em",
            "imagem_principal",
        ]

        read_only_fields = [
            "id",
            "criado_em",
            "imagem_principal",
        ]

    def validate_preco(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "O preço deve ser maior que zero."
            )

        return value

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

class ProdutoImagemAdminSerializer(serializers.ModelSerializer):
    imagem_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ProdutoImagem
        fields = [
            "id",
            "imagem",
            "imagem_url",
            "thumbnail_url",
            "principal",
            "ordem",
            "alt_text",
        ]

        extra_kwargs = {
            "imagem": {
                "write_only": True
            }
        }

    def get_imagem_url(self, obj):
        request = self.context.get("request")

        if not obj.imagem:
            return None

        url = obj.imagem.url

        return (
            request.build_absolute_uri(url)
            if request
            else url
        )

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")

        if not obj.thumbnail:
            return None

        url = obj.thumbnail.url

        return (
            request.build_absolute_uri(url)
            if request
            else url
        )

    @transaction.atomic
    def create(self, validated_data):
        produto = validated_data["produto"]

        # Primeira imagem vira principal automaticamente.
        if not produto.imagens.exists():
            validated_data["principal"] = True

        elif validated_data.get("principal"):
            produto.imagens.filter(
                principal=True
            ).update(
                principal=False
            )

        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        principal = validated_data.get(
            "principal",
            instance.principal
        )

        if principal:
            instance.produto.imagens.exclude(
                pk=instance.pk
            ).filter(
                principal=True
            ).update(
                principal=False
            )

        return super().update(
            instance,
            validated_data
        )

class CategoriaAdminSerializer(serializers.ModelSerializer):
    quantidade_produtos = serializers.IntegerField(
        source="produtos.count",
        read_only=True
    )

    class Meta:
        model = Categoria
        fields = [
            "id",
            "nome",
            "descricao",
            "ativo",
            "quantidade_produtos",
        ]

        read_only_fields = [
            "id",
            "quantidade_produtos",
        ]

    def validate_nome(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Informe um nome válido."
            )

        return value