from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
import json

# Importações para a função de login
from django.contrib.auth import authenticate, login, logout

from .models import Perfil # UserProfile é criado automaticamente pelo signal

@csrf_exempt
def registrar_usuario_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            username = data.get('username') # Obrigatório para o User do Django
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            perfil_id = data.get('perfil_id') # ID do Perfil que queremos associar

            if not email or not password or not username:
                return HttpResponseBadRequest(
                    json.dumps({'error': 'Email, senha e nome de usuário são obrigatórios.'}),
                    content_type="application/json",
                    status=400
                )

            perfil_obj = None
            if perfil_id:
                try:
                    # Tenta converter perfil_id para inteiro, caso venha como string no JSON
                    perfil_obj = Perfil.objects.get(id=int(perfil_id))
                except Perfil.DoesNotExist:
                    return HttpResponseBadRequest(
                        json.dumps({'error': f'Perfil com ID {perfil_id} não encontrado.'}),
                        content_type="application/json",
                        status=400
                    )
                except (ValueError, TypeError): # Trata caso perfil_id não seja um número válido
                     return HttpResponseBadRequest(
                        json.dumps({'error': f'Perfil ID "{perfil_id}" é inválido. Deve ser um número.'}),
                        content_type="application/json",
                        status=400
                    )

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            if perfil_obj:
                # user.profile já existe por causa do signal
                user.profile.perfil = perfil_obj
                user.profile.save()

            return JsonResponse({
                'message': 'Usuário criado com sucesso!',
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'perfil': perfil_obj.nome if perfil_obj else None
            }, status=201)

        except json.JSONDecodeError:
            return HttpResponseBadRequest(json.dumps({'error': 'JSON inválido.'}), content_type="application/json", status=400)
        except IntegrityError:
            return HttpResponseBadRequest(json.dumps({'error': 'Nome de usuário ou email já existe.'}), content_type="application/json", status=400)
        except Exception as e:
            return HttpResponseBadRequest(json.dumps({'error': f'Ocorreu um erro: {str(e)}'}), content_type="application/json", status=400)

    return HttpResponseBadRequest(json.dumps({'error': 'Método não permitido. Use POST.'}), content_type="application/json", status=405)


@csrf_exempt # Para APIs simples; em produção, considere autenticação por token para APIs sem estado
def login_usuario_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username') # Pode ser o username ou o email, dependendo da configuração do seu backend de autenticação
            password = data.get('password')

            if not username or not password:
                return HttpResponseBadRequest(
                    json.dumps({'error': 'Nome de usuário (ou email) e senha são obrigatórios.'}),
                    content_type="application/json",
                    status=400
                )

            # Autentica o usuário
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # Se o usuário foi autenticado com sucesso, cria uma sessão para ele
                login(request, user) # Cria a sessão e envia o cookie de sessão
                
                perfil_nome = None
                # Tenta acessar o perfil através do related_name 'profile' que definimos no UserProfile
                if hasattr(user, 'profile') and user.profile and user.profile.perfil:
                    perfil_nome = user.profile.perfil.nome

                return JsonResponse({
                    'message': 'Login bem-sucedido!',
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'perfil': perfil_nome
                }, status=200)
            else:
                # Se a autenticação falhar
                return HttpResponseBadRequest(
                    json.dumps({'error': 'Credenciais inválidas.'}),
                    content_type="application/json",
                    status=401 # 401 Unauthorized
                )

        except json.JSONDecodeError:
            return HttpResponseBadRequest(json.dumps({'error': 'JSON inválido.'}), content_type="application/json", status=400)
        except Exception as e:
            # Em produção, logar o erro 'e' e retornar uma mensagem mais genérica
            return HttpResponseBadRequest(json.dumps({'error': f'Ocorreu um erro no login: {str(e)}'}), content_type="application/json", status=400)

    return HttpResponseBadRequest(json.dumps({'error': 'Método não permitido. Use POST.'}), content_type="application/json", status=405)