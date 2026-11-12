from django.urls import path

from .views import (
    PopularCategoriasView,
    PopularClientesView,
    LimparCategoriasView,
    LimparClientesView,
)


urlpatterns = [
    path(
        "popular-categorias/",
        PopularCategoriasView.as_view(),
        name="dados-popular-categorias"
    ),

    path(
        "popular-clientes/",
        PopularClientesView.as_view(),
        name="dados-popular-clientes"
    ),

    path(
        "limpar-categorias/",
        LimparCategoriasView.as_view(),
        name="dados-limpar-categorias"
    ),

    path(
        "limpar-clientes/",
        LimparClientesView.as_view(),
        name="dados-limpar-clientes"
    ),
]
