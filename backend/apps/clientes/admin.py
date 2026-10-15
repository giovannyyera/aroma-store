from django.contrib import admin

from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "telefone",
        "email",
        "cidade",
        "estado",
        "ativo",
        "criado_em",
    )

    list_filter = (
        "ativo",
        "estado",
    )

    search_fields = (
        "nome",
        "telefone",
        "email",
        "cidade",
    )

    ordering = ("nome",)
    list_per_page = 20