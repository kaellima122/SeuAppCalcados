from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Importe a nova ViewSet que você criou
from .views import MateriaPrimaViewSet, FornecedorViewSet, ProdutoModeloViewSet

# Cria um router e registra nossas viewsets com ele.
router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'materias-primas', MateriaPrimaViewSet, basename='materiaprima')
# --- NOVA ROTA REGISTRADA AQUI ---
router.register(r'modelos', ProdutoModeloViewSet, basename='produtomodelo')

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]