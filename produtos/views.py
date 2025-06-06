from rest_framework import viewsets, permissions
# Adicionamos ProdutoModelo à lista de importações dos modelos
from .models import MateriaPrima, Fornecedor, ProdutoModelo
# Adicionamos ProdutoModeloSerializer à lista de importações dos serializadores
from .serializers import MateriaPrimaSerializer, FornecedorSerializer, ProdutoModeloSerializer

class FornecedorViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para visualizar e editar Fornecedores.
    """
    queryset = Fornecedor.objects.all().order_by('nome_razao_social')
    serializer_class = FornecedorSerializer
    # No futuro, podemos adicionar permissões, como:
    # permission_classes = [permissions.IsAuthenticated]

class MateriaPrimaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as matérias-primas sejam vistas ou editadas.
    """
    queryset = MateriaPrima.objects.all().order_by('nome')
    serializer_class = MateriaPrimaSerializer
    # permission_classes = [permissions.IsAuthenticated]


# --- NOVA VIEWSET ADICIONADA AQUI ---
class ProdutoModeloViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que os modelos de produto sejam vistos ou editados.
    """
    queryset = ProdutoModelo.objects.all().order_by('nome_modelo')
    serializer_class = ProdutoModeloSerializer
    # permission_classes = [permissions.IsAuthenticated] # Adicionaremos permissões depois