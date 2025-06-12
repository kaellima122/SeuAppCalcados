from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importa TODAS as Viewsets do seu arquivo de views
from .views import (
    MateriaPrimaViewSet, 
    FornecedorViewSet, 
    ProdutoModeloViewSet,
    ProdutoVariacaoViewSet, 
    FichaTecnicaViewSet, 
    ValorAtributoGradeViewSet
)

# Cria um router
router = DefaultRouter()

# Registra CADA ViewSet com o router
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'materias-primas', MateriaPrimaViewSet, basename='materiaprima')
router.register(r'modelos', ProdutoModeloViewSet, basename='produtomodelo')
router.register(r'variacoes', ProdutoVariacaoViewSet, basename='produtovariacao')
router.register(r'fichas-tecnicas', FichaTecnicaViewSet, basename='fichatecnica')
router.register(r'valores-atributos', ValorAtributoGradeViewSet, basename='valoratributograde')

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]