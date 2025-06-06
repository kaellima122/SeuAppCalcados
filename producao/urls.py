from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrdemProducaoViewSet

# Cria um router e registra nossa viewset com ele.
router = DefaultRouter()
router.register(r'ordens-de-producao', OrdemProducaoViewSet, basename='ordemproducao')

# As URLs da API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]