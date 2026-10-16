from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginAdminSerializer


class LoginAdminView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginAdminSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        usuario = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if usuario is None:
            return Response(
                {
                    "detail": "Usuário ou senha inválidos."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not usuario.is_active or not usuario.is_staff:
            return Response(
                {
                    "detail": "Usuário sem permissão administrativa."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        token, _ = Token.objects.get_or_create(
            user=usuario
        )

        return Response(
            {
                "token": token.key,
                "usuario": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "email": usuario.email,
                    "is_staff": usuario.is_staff,
                    "is_superuser": usuario.is_superuser,
                }
            }
        )


class UsuarioAtualView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        usuario = request.user

        return Response(
            {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
                "is_staff": usuario.is_staff,
                "is_superuser": usuario.is_superuser,
            }
        )


class LogoutAdminView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        Token.objects.filter(
            user=request.user
        ).delete()

        return Response(
            {
                "detail": "Logout realizado com sucesso."
            }
        )