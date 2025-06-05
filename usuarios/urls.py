from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('registrar/', views.registrar_usuario_view, name='registrar_usuario'),
    path('login/', views.login_usuario_view, name='login_usuario'),
    path('logout/', views.logout_usuario_view, name='logout_usuario'), # NOVA LINHA ADICIONADA
]