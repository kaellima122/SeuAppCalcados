"""
URL configuration for config_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

# --- NOVA IMPORTAÇÃO ---
# Importamos a view da homepage que criamos no app 'usuarios'
from usuarios.views import homepage_view

urlpatterns = [
    # --- ROTA PRINCIPAL ADICIONADA ---
    # A string vazia '' significa a raiz do site (ex: http://127.0.0.1:8000/)
    # Ela vai chamar a nossa homepage_view.
    path('', homepage_view, name='homepage'),

    # --- Rotas existentes ---
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/produtos/', include('produtos.urls')),
    path('api/producao/', include('producao.urls')), 
]