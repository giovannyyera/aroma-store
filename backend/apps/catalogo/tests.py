from io import BytesIO
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.clientes.models import Cliente
from apps.estoque.models import MovimentacaoEstoque
from apps.pedidos.models import ItemPedido, Pedido

from .models import Categoria, Produto, ProdutoImagem


class ExclusaoAdminTests(APITestCase):
    def setUp(self):
        media = TemporaryDirectory()
        self.addCleanup(media.cleanup)
        settings = override_settings(MEDIA_ROOT=media.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.admin = get_user_model().objects.create_user(
            username="admin", is_staff=True
        )
        self.client.force_authenticate(self.admin)
        self.categoria = Categoria.objects.create(nome="Aromas")
        self.produto = Produto.objects.create(
            nome="Lavanda", categoria=self.categoria, preco="25.00"
        )
        self.categoria_url = reverse(
            "admin-categoria-detail", args=[self.categoria.pk]
        )
        self.produto_url = reverse(
            "admin-produto-detail", args=[self.produto.pk]
        )

    def criar_imagem(self, **kwargs):
        buffer = BytesIO()
        Image.new("RGB", (10, 10), "purple").save(buffer, format="PNG")
        return ProdutoImagem.objects.create(
            produto=self.produto,
            imagem=SimpleUploadedFile(
                "lavanda.png", buffer.getvalue(), content_type="image/png"
            ),
            **kwargs,
        )

    def test_admin_exclui_categoria_sem_produtos(self):
        categoria = Categoria.objects.create(nome="Sem produtos")

        response = self.client.delete(
            reverse("admin-categoria-detail", args=[categoria.pk])
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Categoria.objects.filter(pk=categoria.pk).exists())

    def test_categoria_com_produto_retorna_conflito_e_persiste(self):
        response = self.client.delete(self.categoria_url)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json(), {
            "detail": "Não é possível excluir esta categoria porque ela possui "
            "produtos vinculados. Desative-a ou exclua/mova os produtos antes."
        })
        self.assertTrue(Categoria.objects.filter(pk=self.categoria.pk).exists())
        self.assertTrue(Produto.objects.filter(pk=self.produto.pk).exists())

    def test_produto_sem_vinculos_remove_imagens_somente_apos_commit(self):
        imagem = self.criar_imagem(principal=True)
        arquivos = [imagem.imagem, imagem.thumbnail]
        self.assertTrue(all(arquivo.storage.exists(arquivo.name) for arquivo in arquivos))

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(self.produto_url)
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            self.assertFalse(Produto.objects.filter(pk=self.produto.pk).exists())
            self.assertFalse(ProdutoImagem.objects.filter(pk=imagem.pk).exists())
            for arquivo in arquivos:
                self.assertTrue(arquivo.storage.exists(arquivo.name))

        for arquivo in arquivos:
            self.assertFalse(arquivo.storage.exists(arquivo.name))

    def test_produto_com_item_pedido_retorna_conflito_e_preserva_arquivos(self):
        cliente = Cliente.objects.create(
            nome="Cliente", telefone="11999999999", cep="01001-000",
            endereco="Praça da Sé", numero="1", bairro="Sé",
            cidade="São Paulo", estado="SP",
        )
        pedido = Pedido.objects.create(cliente=cliente)
        item = ItemPedido.objects.create(
            pedido=pedido, produto=self.produto,
            quantidade=1, preco_unitario="25.00",
        )
        imagem = self.criar_imagem()

        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            response = self.client.delete(self.produto_url)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json(), {
            "detail": "Não é possível excluir este produto porque ele já possui "
            "pedidos ou movimentações de estoque. Use a opção Desativar."
        })
        self.assertTrue(Produto.objects.filter(pk=self.produto.pk).exists())
        self.assertTrue(ItemPedido.objects.filter(pk=item.pk).exists())
        self.assertTrue(ProdutoImagem.objects.filter(pk=imagem.pk).exists())
        self.assertTrue(imagem.imagem.storage.exists(imagem.imagem.name))
        self.assertTrue(imagem.thumbnail.storage.exists(imagem.thumbnail.name))
        self.assertEqual(callbacks, [])

    def test_produto_com_movimentacao_estoque_retorna_conflito_e_persiste(self):
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=self.produto, tipo=MovimentacaoEstoque.Tipo.ENTRADA,
            quantidade=1,
        )

        response = self.client.delete(self.produto_url)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json(), {
            "detail": "Não é possível excluir este produto porque ele já possui "
            "pedidos ou movimentações de estoque. Use a opção Desativar."
        })
        self.assertTrue(Produto.objects.filter(pk=self.produto.pk).exists())
        self.assertTrue(MovimentacaoEstoque.objects.filter(pk=movimentacao.pk).exists())

    def test_anonimo_nao_pode_excluir(self):
        self.client.force_authenticate(user=None)

        for url in [self.categoria_url, self.produto_url]:
            with self.subTest(url=url):
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_usuario_sem_staff_nao_pode_excluir(self):
        usuario = get_user_model().objects.create_user(username="cliente")
        self.client.force_authenticate(usuario)

        for url in [self.categoria_url, self.produto_url]:
            with self.subTest(url=url):
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_exclusao_individual_de_imagem_aguarda_commit_e_substitui_principal(self):
        imagem = self.criar_imagem(principal=True)
        proxima = self.criar_imagem(ordem=1)
        arquivos = [imagem.imagem, imagem.thumbnail]

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(reverse(
                "admin-produto-imagem-detail", args=[self.produto.pk, imagem.pk]
            ))
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            for arquivo in arquivos:
                self.assertTrue(arquivo.storage.exists(arquivo.name))

        self.assertFalse(ProdutoImagem.objects.filter(pk=imagem.pk).exists())
        proxima.refresh_from_db()
        self.assertTrue(proxima.principal)
        for arquivo in arquivos:
            self.assertFalse(arquivo.storage.exists(arquivo.name))

    def test_rollback_preserva_imagem_e_arquivos(self):
        imagem = self.criar_imagem(principal=True)

        with self.captureOnCommitCallbacks(execute=True) as callbacks:
            with self.assertRaisesMessage(RuntimeError, "cancelar transação"):
                with transaction.atomic():
                    response = self.client.delete(reverse(
                        "admin-produto-imagem-detail", args=[self.produto.pk, imagem.pk]
                    ))
                    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
                    raise RuntimeError("cancelar transação")

        self.assertTrue(ProdutoImagem.objects.filter(pk=imagem.pk).exists())
        self.assertTrue(imagem.imagem.storage.exists(imagem.imagem.name))
        self.assertTrue(imagem.thumbnail.storage.exists(imagem.thumbnail.name))
        self.assertEqual(callbacks, [])
