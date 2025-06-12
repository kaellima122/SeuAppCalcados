from rest_framework import viewsets, permissions
# Adicionamos ValorAtributoGrade à importação dos modelos
from .models import (
    MateriaPrima, Fornecedor, ProdutoModelo, ProdutoVariacao, FichaTecnica,
    ValorAtributoGrade
)
# Adicionamos ValorAtributoGradeSerializer à importação dos serializadores
from .serializers import (
    MateriaPrimaSerializer, FornecedorSerializer, ProdutoModeloSerializer,
    ProdutoVariacaoSerializer, FichaTecnicaSerializer, ValorAtributoGradeSerializer
)

class FornecedorViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para visualizar e editar Fornecedores.
    """
    queryset = Fornecedor.objects.all().order_by('nome_razao_social')
    serializer_class = FornecedorSerializer
    permission_classes = [permissions.IsAuthenticated] # Protegendo o endpoint

class MateriaPrimaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as matérias-primas sejam vistas ou editadas.
    """
    queryset = MateriaPrima.objects.all().order_by('nome')
    serializer_class = MateriaPrimaSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProdutoModeloViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que os modelos de produto sejam vistos ou editados.
    """
    queryset = ProdutoModelo.objects.all().order_by('nome_modelo')
    serializer_class = ProdutoModeloSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProdutoVariacaoViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para Variações de Produto (SKUs).
    """
    queryset = ProdutoVariacao.objects.all().order_by('sku')
    serializer_class = ProdutoVariacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

class FichaTecnicaViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para Fichas Técnicas e seus itens.
    """
    queryset = FichaTecnica.objects.all()
    serializer_class = FichaTecnicaSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- NOVA VIEWSET ADICIONADA AQUI ---
class ValorAtributoGradeViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API para ver os Valores de Atributos da Grade (ex: Cores, Tamanhos).
    """
    queryset = ValorAtributoGrade.objects.all().select_related('atributo').order_by('atributo__nome', 'valor')
    serializer_class = ValorAtributoGradeSerializer
    permission_classes = [permissions.IsAuthenticated]