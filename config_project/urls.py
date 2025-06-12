from django.contrib import admin
from django.urls import path, include
from usuarios.views import homepage_view

urlpatterns = [
    path('', homepage_view, name='homepage'),
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/produtos/', include('produtos.urls')),
    path('api/producao/', include('producao.urls')),
]