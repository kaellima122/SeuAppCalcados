from django.urls import path
from . import views # Importa o views.py da pasta atual (usuarios)

app_name = 'usuarios' # Boa prática para namespacing

urlpatterns = [
    path('registrar/', views.registrar_usuario_view, name='registrar_usuario'),
    # Outras URLs do app 'usuarios' virão aqui no futuro
]