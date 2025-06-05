from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
import json

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
            perfil_id = data.get('perfil_id') # Novo: ID do Perfil que queremos associar

            if not email or not password or not username:
                return HttpResponseBadRequest(
                    json.dumps({'error': 'Email, senha e nome de usuário são obrigatórios.'}),
                    content_type="application/json",
                    status=400
                )

            # Verifica se o perfil_id foi fornecido e se é válido
            perfil_obj = None
            if perfil_id:
                try:
                    perfil_obj = Perfil.objects.get(id=perfil_id)
                except Perfil.DoesNotExist:
                    return HttpResponseBadRequest(
                        json.dumps({'error': f'Perfil com ID {perfil_id} não encontrado.'}),
                        content_type="application/json",
                        status=400
                    )
            # Você pode decidir se o perfil é obrigatório. Se for, adicione um 'else' aqui e retorne um erro.
            # Por enquanto, ele será opcional (o usuário será criado sem perfil se perfil_id não for enviado ou for inválido e não tratado como erro fatal).

            # Cria o usuário do Django (a senha é automaticamente hasheada)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # O UserProfile é criado automaticamente pelo signal.
            # Agora, associamos o Perfil ao UserProfile, se um perfil_obj foi encontrado.
            if perfil_obj:
                user.profile.perfil = perfil_obj
                user.profile.save() # Salva a alteração no UserProfile

            return JsonResponse({
                'message': 'Usuário criado com sucesso!',
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'perfil': perfil_obj.nome if perfil_obj else None # Mostra o nome do perfil na resposta
            }, status=201)

        except json.JSONDecodeError:
            return HttpResponseBadRequest(json.dumps({'error': 'JSON inválido.'}), content_type="application/json", status=400)
        except IntegrityError: # Ocorre se o username ou email já existir (User model defaults)
            return HttpResponseBadRequest(json.dumps({'error': 'Nome de usuário ou email já existe.'}), content_type="application/json", status=400)
        except Exception as e:
            # Em produção, seria bom logar o erro 'e' para depuração,
            # e retornar uma mensagem de erro mais genérica para o usuário.
            return HttpResponseBadRequest(json.dumps({'error': f'Ocorreu um erro: {str(e)}'}), content_type="application/json", status=400)

    return HttpResponseBadRequest(json.dumps({'error': 'Método não permitido. Use POST.'}), content_type="application/json", status=405)