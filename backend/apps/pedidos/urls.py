from django.urls import path

from .views import CheckoutView

from .views import (
    CheckoutView,
    PedidoAdminListView,
    PedidoAdminDetailView,
    ConfirmarPedidoView,
    ConcluirPedidoView,
    CancelarPedidoView,
)


urlpatterns = [
    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout"
    ),

    path(
        "admin/",
        PedidoAdminListView.as_view(),
        name="admin-pedidos"
    ),

    path(
        "admin/<int:pk>/",
        PedidoAdminDetailView.as_view(),
        name="admin-pedido-detail"
    ),

    path(
        "admin/<int:pk>/confirmar/",
        ConfirmarPedidoView.as_view(),
        name="admin-pedido-confirmar"
    ),

    path(
        "admin/<int:pk>/concluir/",
        ConcluirPedidoView.as_view(),
        name="admin-pedido-concluir"
    ),

    path(
        "admin/<int:pk>/cancelar/",
        CancelarPedidoView.as_view(),
        name="admin-pedido-cancelar"
    ),
]