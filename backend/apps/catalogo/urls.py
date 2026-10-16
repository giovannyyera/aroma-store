from django.urls import path

from .views import (
    CategoriaListView,
    ProdutoListView,
    ProdutoDetailView,
    ProdutoAdminListCreateView,
    ProdutoAdminDetailView,
    AtivarProdutoView,
    DesativarProdutoView,
    ProdutoImagemAdminListCreateView,
    ProdutoImagemAdminDetailView,
    CategoriaAdminListCreateView,
    CategoriaAdminDetailView,
    AtivarCategoriaView,
    DesativarCategoriaView,

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
    path(
        "admin/produtos/",
        ProdutoAdminListCreateView.as_view(),
        name="admin-produtos"
    ),

    path(
        "admin/produtos/<int:pk>/",
        ProdutoAdminDetailView.as_view(),
        name="admin-produto-detail"
    ),

    path(
        "admin/produtos/<int:pk>/ativar/",
        AtivarProdutoView.as_view(),
        name="admin-produto-ativar"
    ),

    path(
        "admin/produtos/<int:pk>/desativar/",
        DesativarProdutoView.as_view(),
        name="admin-produto-desativar"
    ),

    path(
        "admin/produtos/<int:produto_id>/imagens/",
        ProdutoImagemAdminListCreateView.as_view(),
        name="admin-produto-imagens"
    ),

    path(
        "admin/produtos/<int:produto_id>/imagens/<int:pk>/",
        ProdutoImagemAdminDetailView.as_view(),
        name="admin-produto-imagem-detail"
    ),

    path(
        "admin/categorias/",
        CategoriaAdminListCreateView.as_view(),
        name="admin-categorias"
    ),

    path(
        "admin/categorias/<int:pk>/",
        CategoriaAdminDetailView.as_view(),
        name="admin-categoria-detail"
    ),

    path(
        "admin/categorias/<int:pk>/ativar/",
        AtivarCategoriaView.as_view(),
        name="admin-categoria-ativar"
    ),

    path(
        "admin/categorias/<int:pk>/desativar/",
        DesativarCategoriaView.as_view(),
        name="admin-categoria-desativar"
    ),
]