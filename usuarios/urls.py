from django.urls import path
from . import views # Importa o views.py da pasta atual (usuarios)

app_name = 'usuarios'

urlpatterns = [
    path('registrar/', views.registrar_usuario_view, name='registrar_usuario'),
    path('login/', views.login_usuario_view, name='login_usuario'), # NOVA LINHA ADICIONADA
    # Outras URLs do app 'usuarios' virão aqui no futuro
]