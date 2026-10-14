from django.urls import path

from .views import (
    CategoriaListView,
    ProdutoListView,
    ProdutoDetailView,
)

urlpatterns = [
    path(
        "categorias/",
        CategoriaListView.as_view(),
        name="categoria-list"
    ),
    path(
        "produtos/",
        ProdutoListView.as_view(),
        name="produto-list"
    ),
    path(
        "produtos/<int:pk>/", #indica que o Django receberá um identificador numérico para localizar o produto
        ProdutoDetailView.as_view(),
        name="produto-detail"
    ),
]