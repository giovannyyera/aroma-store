"""
Rotas para popular e limpar dados de teste (clientes e categorias).

Funcionam como o GerarDadosController do projeto ESCOLABCC, mas com
proteções: só administrador logado e só com DEBUG=True.

O "popular" apenas ADICIONA registros (nunca apaga antes).
O "limpar" apenas REMOVE registros e preserva os que estão vinculados
a outros dados (clientes com pedidos, categorias com produtos).
"""

from django.conf import settings
from django.db import transaction
from django.db.models import ProtectedError
from rest_framework.permissions import BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalogo.models import Categoria
from apps.clientes.models import Cliente


CATEGORIAS_DEMO = [
    {
        "nome": "Velas Aromáticas",
        "descricao": "Velas artesanais de cera vegetal com fragrâncias marcantes.",
        "ativo": True,
    },
    {
        "nome": "Difusores de Ambiente",
        "descricao": "Difusores com varetas para perfumar a casa por semanas.",
        "ativo": True,
    },
    {
        "nome": "Home Sprays",
        "descricao": "", 
        "ativo": True,
    },
    {
        "nome": "Sabonetes Artesanais",
        "descricao": "Sabonetes em barra feitos com óleos essenciais.",
        "ativo": True,
    },
    {
        "nome": "Incensos",
        "descricao": "Incensos naturais para relaxar e meditar.",
        "ativo": False,  
    },
]

CLIENTES_DEMO = [
    {
        "nome": "Mariana Costa Ribeiro",
        "email": "mariana.ribeiro@example.com",
        "telefone": "(11) 98765-4321",
        "cep": "01310-100",
        "endereco": "Avenida Paulista",
        "numero": "1000",
        "complemento": "Apto 52",
        "bairro": "Bela Vista",
        "cidade": "São Paulo",
        "estado": "SP",
    },
    {
        "nome": "Rafael Almeida Souza",
        "email": "rafael.souza@example.com",
        "telefone": "(21) 99876-5432",
        "cep": "20040-020",
        "endereco": "Rua da Assembleia",
        "numero": "45",
        "complemento": "",
        "bairro": "Centro",
        "cidade": "Rio de Janeiro",
        "estado": "RJ",
    },
    {
        "nome": "Camila Ferreira Lima",
        "email": "camila.lima@example.com",
        "telefone": "(31) 98123-4567",
        "cep": "30130-010",
        "endereco": "Avenida Afonso Pena",
        "numero": "250",
        "complemento": "Sala 3",
        "bairro": "Centro",
        "cidade": "Belo Horizonte",
        "estado": "MG",
    },
    {
        "nome": "Lucas Martins Pereira",
        "email": "lucas.pereira@example.com",
        "telefone": "(41) 99654-3210",
        "cep": "80010-000",
        "endereco": "Rua XV de Novembro",
        "numero": "780",
        "complemento": "",
        "bairro": "Centro",
        "cidade": "Curitiba",
        "estado": "PR",
    },
    {
        "nome": "Beatriz Nunes Carvalho",
        "email": "beatriz.carvalho@example.com",
        "telefone": "(71) 98877-6655",
        "cep": "40020-000",
        "endereco": "Avenida Sete de Setembro",
        "numero": "310",
        "complemento": "Casa 2",
        "bairro": "Centro",
        "cidade": "Salvador",
        "estado": "BA",
    },
]


# Proteção: só roda em desenvolvimento

class ApenasEmDesenvolvimento(BasePermission):
    message = "Esta rota só está disponível com DEBUG=True."

    def has_permission(self, request, view):
        return settings.DEBUG


class DadosDemoBaseView(APIView):
    permission_classes = [IsAdminUser, ApenasEmDesenvolvimento]


# Popular

class PopularCategoriasView(DadosDemoBaseView):
    """POST /api/admin/dados/popular-categorias/"""

    @transaction.atomic
    def post(self, request):
        criadas = []
        ja_existiam = []

        for dados in CATEGORIAS_DEMO:
            # nome é único: se já existir, não duplica
            categoria, criada = Categoria.objects.get_or_create(
                nome=dados["nome"],
                defaults={
                    "descricao": dados["descricao"],
                    "ativo": dados["ativo"],
                },
            )
            (criadas if criada else ja_existiam).append(categoria.nome)

        return Response({
            "mensagem": f"{len(criadas)} categoria(s) criada(s).",
            "criadas": criadas,
            "ja_existiam": ja_existiam,
            "total_na_tabela": Categoria.objects.count(),
        })


class PopularClientesView(DadosDemoBaseView):
    """POST /api/admin/dados/popular-clientes/"""

    @transaction.atomic
    def post(self, request):
        criados = []
        ja_existiam = []

        for dados in CLIENTES_DEMO:
            # o e-mail identifica o cliente de teste: não duplica ao repetir
            cliente, criado = Cliente.objects.get_or_create(
                email=dados["email"],
                defaults=dados,
            )
            (criados if criado else ja_existiam).append(cliente.nome)

        return Response({
            "mensagem": f"{len(criados)} cliente(s) criado(s).",
            "criados": criados,
            "ja_existiam": ja_existiam,
            "total_na_tabela": Cliente.objects.count(),
        })


# Limpar

def _apagar_sem_vinculos(queryset):
    """
    Apaga um a um. Quem estiver protegido (PROTECT) por outros dados
    não é apagado e é devolvido na lista de mantidos.
    """
    apagados = []
    mantidos = []

    for objeto in queryset:
        nome = str(objeto)
        try:
            with transaction.atomic():
                objeto.delete()
            apagados.append(nome)
        except ProtectedError:
            mantidos.append(nome)

    return apagados, mantidos


class LimparCategoriasView(DadosDemoBaseView):
    """POST /api/admin/dados/limpar-categorias/"""

    def post(self, request):
        apagadas, mantidas = _apagar_sem_vinculos(Categoria.objects.all())

        return Response({
            "mensagem": f"{len(apagadas)} categoria(s) apagada(s).",
            "apagadas": apagadas,
            "mantidas": mantidas,
            "motivo_mantidas": "possuem produtos vinculados" if mantidas else "",
        })


class LimparClientesView(DadosDemoBaseView):
    """POST /api/admin/dados/limpar-clientes/"""

    def post(self, request):
        apagados, mantidos = _apagar_sem_vinculos(Cliente.objects.all())

        return Response({
            "mensagem": f"{len(apagados)} cliente(s) apagado(s).",
            "apagados": apagados,
            "mantidos": mantidos,
            "motivo_mantidos": "possuem pedidos vinculados" if mantidos else "",
        })
