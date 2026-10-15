from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError

from apps.catalogo.models import Categoria, Produto
from apps.clientes.models import Cliente
from apps.estoque.models import MovimentacaoEstoque

from .models import Pedido, ItemPedido
from .services import confirmar_pedido, cancelar_pedido, concluir_pedido


class PedidoTests(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome="Velas",
            descricao="Categoria de teste",
            ativo=True
        )

        self.produto = Produto.objects.create(
            categoria=self.categoria,
            nome="Vela de Lavanda",
            descricao="Produto de teste",
            preco=Decimal("39.90"),
            estoque=10,
            ativo=True
        )

        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            email="cliente@teste.com",
            telefone="14999999999",
            cep="19800-000",
            endereco="Rua Teste",
            numero="100",
            complemento="",
            bairro="Centro",
            cidade="Assis",
            estado="SP",
            ativo=True
        )

    def test_confirmar_pedido_reduz_estoque(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        ItemPedido.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade=2,
            preco_unitario=self.produto.preco
        )

        confirmar_pedido(pedido.id)

        self.produto.refresh_from_db()
        pedido.refresh_from_db()

        self.assertEqual(self.produto.estoque, 8)
        self.assertEqual(
            pedido.status,
            Pedido.Status.CONFIRMADO
        )

        self.assertEqual(
            MovimentacaoEstoque.objects.filter(
                pedido=pedido,
                tipo=MovimentacaoEstoque.Tipo.SAIDA
            ).count(),
            1
        )

    def test_confirmar_pedido_duas_vezes_nao_duplica_saida(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        ItemPedido.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade=2,
            preco_unitario=self.produto.preco
        )

        confirmar_pedido(pedido.id)
        confirmar_pedido(pedido.id)

        self.produto.refresh_from_db()

        self.assertEqual(self.produto.estoque, 8)

        self.assertEqual(
            MovimentacaoEstoque.objects.filter(
                pedido=pedido,
                tipo=MovimentacaoEstoque.Tipo.SAIDA
            ).count(),
            1
        )

    def test_cancelar_pedido_confirmado_devolve_estoque(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        ItemPedido.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade=2,
            preco_unitario=self.produto.preco
        )

        confirmar_pedido(pedido.id)
        cancelar_pedido(pedido.id)

        self.produto.refresh_from_db()
        pedido.refresh_from_db()

        self.assertEqual(self.produto.estoque, 10)
        self.assertEqual(
            pedido.status,
            Pedido.Status.CANCELADO
        )

        self.assertEqual(
            MovimentacaoEstoque.objects.filter(
                pedido=pedido,
                tipo=MovimentacaoEstoque.Tipo.ENTRADA
            ).count(),
            1
        )

    def test_cancelar_duas_vezes_nao_duplica_entrada(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        ItemPedido.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade=2,
            preco_unitario=self.produto.preco
        )

        confirmar_pedido(pedido.id)
        cancelar_pedido(pedido.id)
        cancelar_pedido(pedido.id)

        self.produto.refresh_from_db()

        self.assertEqual(self.produto.estoque, 10)

        self.assertEqual(
            MovimentacaoEstoque.objects.filter(
                pedido=pedido,
                tipo=MovimentacaoEstoque.Tipo.ENTRADA
            ).count(),
            1
        )

class CheckoutApiTests(TestCase):
    def setUp(self):
        categoria = Categoria.objects.create(
            nome="Velas",
            ativo=True
        )

        self.produto = Produto.objects.create(
            categoria=categoria,
            nome="Vela de Lavanda",
            descricao="",
            preco=Decimal("39.90"),
            estoque=10,
            ativo=True
        )

    def test_checkout_cria_pedido_pendente_sem_alterar_estoque(self):
        dados = {
            "nome": "Cliente Checkout",
            "email": "checkout@teste.com",
            "telefone": "14999999999",
            "cep": "19800000",
            "endereco": "Rua Teste",
            "numero": "100",
            "complemento": "",
            "bairro": "Centro",
            "cidade": "Assis",
            "estado": "sp",
            "observacao": "Teste automatizado",
            "itens": [
                {
                    "produto_id": self.produto.id,
                    "quantidade": 2
                }
            ]
        }

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=dados,
            content_type="application/json"
        )

        self.assertEqual(resposta.status_code, 201)

        pedido = Pedido.objects.latest("id")

        self.assertEqual(
            pedido.status,
            Pedido.Status.PENDENTE
        )

        self.produto.refresh_from_db()

        self.assertEqual(
            self.produto.estoque,
            10
        )

        item = ItemPedido.objects.get(
            pedido=pedido
        )

        self.assertEqual(
            item.preco_unitario,
            Decimal("39.90")
        )

        self.assertEqual(
            item.quantidade,
            2
        )

class PedidoRegraNegocioTests(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome="Velas",
            ativo=True
        )

        self.produto = Produto.objects.create(
            categoria=self.categoria,
            nome="Vela de Lavanda",
            preco=Decimal("39.90"),
            estoque=2,
            ativo=True
        )

        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            email="cliente@teste.com",
            telefone="14999999999",
            cep="19800-000",
            endereco="Rua Teste",
            numero="100",
            complemento="",
            bairro="Centro",
            cidade="Assis",
            estado="SP",
            ativo=True
        )

    def test_nao_confirma_pedido_sem_itens(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        with self.assertRaises(ValidationError):
            confirmar_pedido(pedido.id)

        pedido.refresh_from_db()

        self.assertEqual(
            pedido.status,
            Pedido.Status.PENDENTE
        )

    def test_nao_confirma_com_estoque_insuficiente(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        ItemPedido.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade=5,
            preco_unitario=self.produto.preco
        )

        with self.assertRaises(ValidationError):
            confirmar_pedido(pedido.id)

        self.produto.refresh_from_db()
        pedido.refresh_from_db()

        self.assertEqual(self.produto.estoque, 2)
        self.assertEqual(
            pedido.status,
            Pedido.Status.PENDENTE
        )

        self.assertEqual(
            MovimentacaoEstoque.objects.count(),
            0
        )

    def test_nao_conclui_pedido_pendente(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        with self.assertRaises(ValidationError):
            concluir_pedido(pedido.id)

        pedido.refresh_from_db()

        self.assertEqual(
            pedido.status,
            Pedido.Status.PENDENTE
        )

    def test_nao_confirma_pedido_cancelado(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            status=Pedido.Status.PENDENTE
        )

        cancelar_pedido(pedido.id)

        with self.assertRaises(ValidationError):
            confirmar_pedido(pedido.id)

        pedido.refresh_from_db()

        self.assertEqual(
            pedido.status,
            Pedido.Status.CANCELADO
        )

class CheckoutValidacaoTests(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome="Velas",
            ativo=True
        )

        self.produto = Produto.objects.create(
            categoria=self.categoria,
            nome="Vela de Lavanda",
            preco=Decimal("39.90"),
            estoque=2,
            ativo=True
        )

        self.dados_validos = {
            "nome": "Cliente Checkout",
            "email": "checkout@teste.com",
            "telefone": "14999999999",
            "cep": "19800000",
            "endereco": "Rua Teste",
            "numero": "100",
            "complemento": "",
            "bairro": "Centro",
            "cidade": "Assis",
            "estado": "SP",
            "observacao": "",
            "itens": [
                {
                    "produto_id": self.produto.id,
                    "quantidade": 1
                }
            ]
        }

    def test_checkout_rejeita_produto_inativo(self):
        self.produto.ativo = False
        self.produto.save(update_fields=["ativo"])

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=self.dados_validos,
            content_type="application/json"
        )

        self.assertEqual(
            resposta.status_code,
            400
        )

        self.assertEqual(
            Pedido.objects.count(),
            0
        )

    def test_checkout_rejeita_quantidade_maior_que_estoque(self):
        self.dados_validos["itens"][0]["quantidade"] = 5

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=self.dados_validos,
            content_type="application/json"
        )

        self.assertEqual(
            resposta.status_code,
            400
        )

        self.assertEqual(
            Pedido.objects.count(),
            0
        )

    def test_checkout_rejeita_cep_invalido(self):
        self.dados_validos["cep"] = "123"

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=self.dados_validos,
            content_type="application/json"
        )

        self.assertEqual(
            resposta.status_code,
            400
        )

        self.assertIn(
            "cep",
            resposta.json()
        )

    def test_checkout_rejeita_telefone_invalido(self):
        self.dados_validos["telefone"] = "123"

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=self.dados_validos,
            content_type="application/json"
        )

        self.assertEqual(
            resposta.status_code,
            400
        )

        self.assertIn(
            "telefone",
            resposta.json()
        )

    def test_checkout_rejeita_estado_invalido(self):
        self.dados_validos["estado"] = "S"

        resposta = self.client.post(
            "/api/pedidos/checkout/",
            data=self.dados_validos,
            content_type="application/json"
        )

        self.assertEqual(
            resposta.status_code,
            400
        )

        self.assertIn(
            "estado",
            resposta.json()
        )