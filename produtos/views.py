from rest_framework import viewsets
from .models import MateriaPrima, Fornecedor
from .serializers import MateriaPrimaSerializer, FornecedorSerializer

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    # Adicione aqui permissões no futuro, se necessário
    # permission_classes = [permissions.IsAuthenticated]

class MateriaPrimaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as matérias-primas sejam vistas ou editadas.
    """
    queryset = MateriaPrima.objects.all().order_by('nome')
    serializer_class = MateriaPrimaSerializer
    # Adicione aqui permissões no futuro, se necessário
    # permission_classes = [permissions.IsAuthenticated]