from rest_framework import serializers
from .models import MateriaPrima, Fornecedor

class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__' # Inclui todos os campos do modelo Fornecedor

class MateriaPrimaSerializer(serializers.ModelSerializer):
    # Para mostrar o nome do fornecedor em vez de apenas o ID (opcional, mas melhora a API)
    fornecedor_padrao_nome = serializers.CharField(source='fornecedor_padrao.nome_razao_social', read_only=True)

    class Meta:
        model = MateriaPrima
        fields = [
            'id', 
            'codigo', 
            'nome', 
            'descricao', 
            'unidade_medida', 
            'saldo_em_estoque', 
            'estoque_minimo', 
            'custo_medio', 
            'fornecedor_padrao', # Enviamos/recebemos o ID do fornecedor
            'fornecedor_padrao_nome', # Apenas para leitura, mostra o nome
            'ativo',
            'data_cadastro'
        ]
        read_only_fields = ('data_cadastro',) # Campos que não podem ser editados via API