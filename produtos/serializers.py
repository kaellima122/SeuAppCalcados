from rest_framework import serializers
from .models import (
    MateriaPrima, Fornecedor, ProdutoModelo, ProdutoVariacao,
    FichaTecnica, ItemFichaTecnica
)

# ... (Os outros serializadores: Fornecedor, MateriaPrima, ProdutoModelo, ProdutoVariacao permanecem os mesmos) ...
class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'

class MateriaPrimaSerializer(serializers.ModelSerializer):
    fornecedor_padrao_nome = serializers.CharField(source='fornecedor_padrao.nome_razao_social', read_only=True)
    class Meta:
        model = MateriaPrima
        fields = '__all__'
        read_only_fields = ('data_cadastro', 'fornecedor_padrao_nome')

class ProdutoModeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProdutoModelo
        fields = '__all__'

class ProdutoVariacaoSerializer(serializers.ModelSerializer):
    valores_atributos_nomes = serializers.StringRelatedField(many=True, read_only=True, source='valores_atributos')
    produto_modelo_nome = serializers.CharField(source='produto_modelo.nome_modelo', read_only=True)
    class Meta:
        model = ProdutoVariacao
        fields = ['id', 'sku', 'produto_modelo', 'produto_modelo_nome', 'codigo_barras', 'preco_venda', 'saldo_em_estoque', 'valores_atributos', 'valores_atributos_nomes']


# --- CORREÇÃO FINAL NOS SERIALIZADORES PARA FICHA TÉCNICA ---

class ItemFichaTecnicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemFichaTecnica
        fields = ['materia_prima', 'quantidade']

class FichaTecnicaSerializer(serializers.ModelSerializer):
    # Campo para LEITURA: Mostra os detalhes dos itens.
    # Ele é 'read_only' e busca os dados da fonte correta no modelo.
    itens = ItemFichaTecnicaSerializer(
        source='itemfichatecnica_set', 
        many=True, 
        read_only=True
    )

    # Campo para ESCRITA: Recebe os dados para criar/atualizar os itens.
    # Ele é 'write_only', então não aparecerá na resposta da API, apenas nos formulários de criação/edição.
    itens_para_cadastrar = ItemFichaTecnicaSerializer(
        many=True, 
        write_only=True
    )

    produto_modelo_nome = serializers.CharField(source='produto_modelo.nome_modelo', read_only=True)

    class Meta:
        model = FichaTecnica
        fields = [
            'id', 
            'produto_modelo', 
            'produto_modelo_nome', 
            'descricao', 
            'itens', # Campo de leitura
            'itens_para_cadastrar' # Campo de escrita
        ]

    def create(self, validated_data):
        # Agora pegamos os dados do campo de escrita 'itens_para_cadastrar'
        itens_data = validated_data.pop('itens_para_cadastrar')

        ficha_tecnica = FichaTecnica.objects.create(**validated_data)

        for item_data in itens_data:
            ItemFichaTecnica.objects.create(ficha_tecnica=ficha_tecnica, **item_data)

        return ficha_tecnica

    def update(self, instance, validated_data):
        # O mesmo aqui, pegamos os dados do campo de escrita
        itens_data = validated_data.pop('itens_para_cadastrar')

        instance.descricao = validated_data.get('descricao', instance.descricao)
        instance.save()

        instance.itemfichatecnica_set.all().delete()

        for item_data in itens_data:
            ItemFichaTecnica.objects.create(ficha_tecnica=instance, **item_data)

        return instance