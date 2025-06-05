from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MateriaPrimaViewSet, FornecedorViewSet

# Cria um router e registra nossas viewsets com ele.
router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'materias-primas', MateriaPrimaViewSet, basename='materiaprima')

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]