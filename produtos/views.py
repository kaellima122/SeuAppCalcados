
from rest_framework import viewsets
# A linha abaixo precisa importar TODOS os modelos que usamos no arquivo
from .models import (
    MateriaPrima, Fornecedor, ProdutoModelo, ProdutoVariacao, FichaTecnica
)
# A linha abaixo precisa importar TODOS os serializadores que usamos no arquivo
from .serializers import (
    MateriaPrimaSerializer, FornecedorSerializer, ProdutoModeloSerializer,
    ProdutoVariacaoSerializer, FichaTecnicaSerializer
)

class FornecedorViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para visualizar e editar Fornecedores.
    """
    queryset = Fornecedor.objects.all().order_by('nome_razao_social')
    serializer_class = FornecedorSerializer

class MateriaPrimaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as matérias-primas sejam vistas ou editadas.
    """
    queryset = MateriaPrima.objects.all().order_by('nome')
    serializer_class = MateriaPrimaSerializer

class ProdutoModeloViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que os modelos de produto sejam vistos ou editados.
    """
    queryset = ProdutoModelo.objects.all().order_by('nome_modelo')
    serializer_class = ProdutoModeloSerializer

class ProdutoVariacaoViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para Variações de Produto (SKUs).
    """
    queryset = ProdutoVariacao.objects.all().order_by('sku')
    serializer_class = ProdutoVariacaoSerializer


# --- VIEWSET PARA FICHA TÉCNICA (com as importações corretas) ---
class FichaTecnicaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para Fichas Técnicas e seus itens.
    """
    queryset = FichaTecnica.objects.all()
    serializer_class = FichaTecnicaSerializer