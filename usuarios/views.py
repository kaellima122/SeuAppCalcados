from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.models import User
from django.db import IntegrityError
import json
from django.contrib.auth import authenticate, login, logout

# --- Novas importações do Django REST Framework (DRF) ---
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

# --- NOVA IMPORTAÇÃO PARA RENDERIZAR TEMPLATES HTML ---
from django.shortcuts import render

from .models import Perfil


# --- NOVA VIEW PARA A HOMEPAGE (ADICIONADA AQUI) ---
def homepage_view(request):
    """
    Esta view renderiza e retorna o template HTML da página inicial.
    """
    return render(request, 'homepage.html')


# --- Nossas views de API existentes ---

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_usuario_view(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        perfil_id = data.get('perfil_id')

        if not email or not password or not username:
            return JsonResponse({'error': 'Email, senha e nome de usuário são obrigatórios.'}, status=400)

        perfil_obj = None
        if perfil_id:
            try:
                perfil_obj = Perfil.objects.get(id=int(perfil_id))
            except (Perfil.DoesNotExist, ValueError, TypeError):
                 return JsonResponse({'error': f'Perfil ID "{perfil_id}" é inválido.'}, status=400)

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name
        )

        if perfil_obj:
            user.profile.perfil = perfil_obj
            user.profile.save()

        return JsonResponse({
            'message': 'Usuário criado com sucesso!',
            'user_id': user.id,
            'username': user.username,
        }, status=201)

    except IntegrityError:
        return JsonResponse({'error': 'Nome de usuário ou email já existe.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro: {str(e)}'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_usuario_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Nome de usuário e senha são obrigatórios.'}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            perfil_nome = user.profile.perfil.nome if hasattr(user, 'profile') and user.profile.perfil else None

            return JsonResponse({
                'message': 'Login bem-sucedido!',
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'perfil': perfil_nome
            }, status=200)
        else:
            return JsonResponse({'error': 'Credenciais inválidas.'}, status=401)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro no login: {str(e)}'}, status=400)


@api_view(['POST'])
def logout_usuario_view(request):
    try:
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        pass
    
    logout(request)
    
    return JsonResponse({'message': 'Logout bem-sucedido.'}, status=200)