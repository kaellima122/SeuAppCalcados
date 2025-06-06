from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.models import User
from django.db import IntegrityError
import json
from django.contrib.auth import authenticate, login, logout

# --- Novas importações do Django REST Framework (DRF) ---
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

from .models import Perfil


# --- VIEW DE REGISTRO ATUALIZADA COM DECORATORS DO DRF ---
# @csrf_exempt não é mais necessário quando usamos os decorators do DRF
@api_view(['POST']) # Define que esta view só aceita o método POST
@permission_classes([AllowAny]) # Permite que qualquer um (mesmo não logado) acesse esta view
def registrar_usuario_view(request):
    # O 'if request.method == 'POST':' não é mais necessário, pois o @api_view já faz essa checagem.
    try:
        data = request.data # Com @api_view, usamos request.data em vez de json.loads(request.body)
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


# --- VIEW DE LOGIN ATUALIZADA PARA RETORNAR O TOKEN ---
@api_view(['POST'])
@permission_classes([AllowAny]) # O login também precisa ser acessível publicamente
def login_usuario_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Nome de usuário e senha são obrigatórios.'}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user) # Mantemos o login de sessão para o Admin e a API Navegável
            
            # AQUI ESTÁ A MÁGICA: Buscamos ou criamos um token para o usuário
            token, created = Token.objects.get_or_create(user=user)
            
            perfil_nome = user.profile.perfil.nome if hasattr(user, 'profile') and user.profile.perfil else None

            # Retornamos o token na resposta JSON!
            return JsonResponse({
                'message': 'Login bem-sucedido!',
                'token': token.key, # <<<<< A CHAVE DO SUCESSO!
                'user_id': user.id,
                'username': user.username,
                'perfil': perfil_nome
            }, status=200)
        else:
            return JsonResponse({'error': 'Credenciais inválidas.'}, status=401)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro no login: {str(e)}'}, status=400)


# --- VIEW DE LOGOUT ATUALIZADA PARA INVALIDAR O TOKEN ---
# Esta view usará a permissão padrão que definimos no settings.py (IsAuthenticated)
# Ou seja, só um usuário logado (que envia um token válido) pode fazer logout.
@api_view(['POST'])
def logout_usuario_view(request):
    try:
        # Deleta o token de autenticação associado ao usuário
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        # Se o usuário não estava logado com token, não faz nada
        pass
    
    # Encerra a sessão do Django também, para uma limpeza completa
    logout(request)
    
    return JsonResponse({'message': 'Logout bem-sucedido.'}, status=200)