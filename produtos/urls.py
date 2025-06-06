from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Importe TODAS as ViewSets, incluindo a FichaTecnicaViewSet
from .views import (
    MateriaPrimaViewSet, 
    FornecedorViewSet, 
    ProdutoModeloViewSet,
    ProdutoVariacaoViewSet, 
    FichaTecnicaViewSet # <<<--- IMPORTAÇÃO ADICIONADA AQUI
)

# Cria um router e registra nossas viewsets com ele.
router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'materias-primas', MateriaPrimaViewSet, basename='materiaprima')
router.register(r'modelos', ProdutoModeloViewSet, basename='produtomodelo')
router.register(r'variacoes', ProdutoVariacaoViewSet, basename='produtovariacao')
# --- NOVA ROTA PARA FICHA TÉCNICA REGISTRADA AQUI ---
router.register(r'fichas-tecnicas', FichaTecnicaViewSet, basename='fichatecnica')


# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]