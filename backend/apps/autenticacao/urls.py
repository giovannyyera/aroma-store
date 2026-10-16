from django.urls import path

from .views import (
    LoginAdminView,
    LogoutAdminView,
    UsuarioAtualView,
)


urlpatterns = [
    path(
        "login/",
        LoginAdminView.as_view(),
        name="admin-login"
    ),

    path(
        "me/",
        UsuarioAtualView.as_view(),
        name="admin-me"
    ),

    path(
        "logout/",
        LogoutAdminView.as_view(),
        name="admin-logout"
    ),
]