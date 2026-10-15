from pathlib import Path
from uuid import uuid4
from io import BytesIO

from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models import Q
from django.core.files.base import ContentFile
from PIL import Image

class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True) #obrigatório e único
    descricao = models.TextField(blank=True) #opcional
    ativo = models.BooleanField(default=True) #permite desativar uma categoria sem excluí-la

    class Meta:
        db_table = "categoria" #nome da tabela
        ordering = ["nome"] #ordena categoria por nome
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.nome

class Produto(models.Model):
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT, #impede excluir uma categoria que tenha produtos vinculados
        related_name="produtos"
    )

    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.PositiveIntegerField(default=0) #não permite num negativo
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "produto"
        ordering = ["nome"]
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def __str__(self):
        return self.nome

def caminho_imagem_produto(instance, filename):
    extensao = Path(filename).suffix.lower()

    nome_arquivo = f"{uuid4().hex}{extensao}"

    return (
        f"produtos/"
        f"{instance.produto_id}/"
        f"{nome_arquivo}"
    )


def validar_tamanho_imagem(arquivo):
    limite = 8 * 1024 * 1024

    if arquivo.size > limite:
        from django.core.exceptions import ValidationError

        raise ValidationError(
            "A imagem deve possuir no máximo 8 MB."
        )


class ProdutoImagem(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name="imagens"
    )

    imagem = models.ImageField(
        upload_to=caminho_imagem_produto,
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "jpg",
                    "jpeg",
                    "png",
                    "webp",
                ]
            ),
            validar_tamanho_imagem,
        ]
    )

    thumbnail = models.ImageField(
        upload_to="produtos/thumbnails/",
        blank=True
    )

    principal = models.BooleanField(
        default=False
    )

    ordem = models.PositiveSmallIntegerField(
        default=0
    )

    alt_text = models.CharField(
        max_length=200,
        blank=True
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "produto_imagem"

        ordering = [
            "ordem",
            "id",
        ]

        verbose_name = "Imagem do Produto"
        verbose_name_plural = "Imagens do Produto"

        constraints = [
            models.UniqueConstraint(
                fields=["produto"],
                condition=Q(principal=True),
                name="unique_imagem_principal_por_produto"
            )
        ]

    def gerar_thumbnail(self):
        if not self.imagem:
            return

        self.imagem.open()

        with Image.open(self.imagem) as img:
            img = img.convert("RGB")

            img.thumbnail(
                (500, 500),
                Image.Resampling.LANCZOS
            )

            buffer = BytesIO()

            img.save(
                buffer,
                format="WEBP",
                quality=80,
                optimize=True
            )

            nome_thumbnail = (
                f"thumb_{uuid4().hex}.webp"
            )

            self.thumbnail.save(
                nome_thumbnail,
                ContentFile(buffer.getvalue()),
                save=False
            )

    def save(self, *args, **kwargs):
        imagem_alterada = True

        if self.pk:
            imagem_anterior = (
                ProdutoImagem.objects
                .filter(pk=self.pk)
                .values_list("imagem", flat=True)
                .first()
            )

            imagem_alterada = (
                imagem_anterior != self.imagem.name
            )

        if imagem_alterada and self.imagem:
            self.gerar_thumbnail()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Imagem de {self.produto.nome}"

    