from django.urls import path

from .views import (
    ProdutosVendidosView,
    ResumoGeralView,
    VendasPorCategoriaView,
    VendasMensaisPivotView,
)


urlpatterns = [
    path(
        "resumo/",
        ResumoGeralView.as_view(),
        name="relatorio-resumo"
    ),

    path(
        "produtos-vendidos/",
        ProdutosVendidosView.as_view(),
        name="relatorio-produtos-vendidos"
    ),

    path(
        "vendas-por-categoria/",
        VendasPorCategoriaView.as_view(),
        name="relatorio-vendas-categoria"
    ),

    path(
        "vendas-mensais-pivot/",
        VendasMensaisPivotView.as_view(),
        name="relatorio-vendas-mensais-pivot"
    ),
]