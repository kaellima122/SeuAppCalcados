from rest_framework import viewsets
from .models import OrdemProducao
from .serializers import OrdemProducaoSerializer

class OrdemProducaoViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as Ordens de Produção sejam vistas ou editadas.
    """
    queryset = OrdemProducao.objects.all().order_by('-data_emissao')
    serializer_class = OrdemProducaoSerializer
    # permission_classes = [permissions.IsAuthenticated] # Adicionaremos permissões no futuro