from django.db import models


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