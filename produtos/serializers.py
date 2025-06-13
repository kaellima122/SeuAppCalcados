

from rest_framework import serializers
from .models import (
    MateriaPrima, Fornecedor, ProdutoModelo, ProdutoVariacao,
    FichaTecnica, ItemFichaTecnica, ValorAtributoGrade
)

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


# --- SERIALIZADORES CORRIGIDOS PARA FICHA TÉCNICA ---

class ItemFichaTecnicaSerializer(serializers.ModelSerializer):
    # Campos extras para leitura, para facilitar a vida do frontend
    materia_prima_nome = serializers.CharField(source='materia_prima.nome', read_only=True)
    unidade_medida = serializers.CharField(source='materia_prima.get_unidade_medida_display', read_only=True)

    class Meta:
        model = ItemFichaTecnica
        fields = ['materia_prima', 'quantidade', 'materia_prima_nome', 'unidade_medida']

class FichaTecnicaSerializer(serializers.ModelSerializer):
    itens = ItemFichaTecnicaSerializer(source='itemfichatecnica_set', many=True, read_only=True)
    itens_para_cadastrar = ItemFichaTecnicaSerializer(many=True, write_only=True)

    # ESTA É A LINHA QUE ADICIONA O NOME DO MODELO
    produto_modelo_nome = serializers.CharField(source='produto_modelo.nome_modelo', read_only=True)

    class Meta:
        model = FichaTecnica
        # E ESTA É A LISTA DE CAMPOS QUE INCLUI O NOME DO MODELO
        fields = ['id', 'produto_modelo', 'produto_modelo_nome', 'descricao', 'itens', 'itens_para_cadastrar']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens_para_cadastrar')
        ficha_tecnica = FichaTecnica.objects.create(**validated_data)
        for item_data in itens_data:
            ItemFichaTecnica.objects.create(ficha_tecnica=ficha_tecnica, **item_data)
        return ficha_tecnica

    def update(self, instance, validated_data):
        itens_data = validated_data.pop('itens_para_cadastrar')
        instance.descricao = validated_data.get('descricao', instance.descricao)
        instance.save()
        instance.itemfichatecnica_set.all().delete()
        for item_data in itens_data:
            ItemFichaTecnica.objects.create(ficha_tecnica=instance, **item_data)
        return instance

class ValorAtributoGradeSerializer(serializers.ModelSerializer):
    atributo_nome = serializers.CharField(source='atributo.nome', read_only=True)
    class Meta:
        model = ValorAtributoGrade
        fields = ['id', 'valor', 'atributo_nome']