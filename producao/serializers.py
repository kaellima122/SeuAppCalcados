from rest_framework import serializers
from .models import OrdemProducao

class OrdemProducaoSerializer(serializers.ModelSerializer):
    # Campos extras (apenas para leitura) para deixar a API mais amigável.
    # Mostra o SKU do produto em vez de apenas o ID.
    produto_variacao_sku = serializers.CharField(source='produto_variacao.sku', read_only=True)
    # Mostra o "nome" do status (ex: "Planejada") em vez do código interno ("PLANEJADA").
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OrdemProducao
        # Lista de todos os campos que queremos que apareçam na nossa API.
        fields = [
            'id',
            'numero_op',
            'produto_variacao',         # Campo para escrita (recebe o ID da Variação)
            'produto_variacao_sku',     # Campo para leitura
            'quantidade_a_produzir',
            'data_emissao',
            'data_previsao_inicio',
            'data_previsao_termino',
            'data_inicio_real',
            'data_termino_real',
            'status',                   # Campo para escrita (recebe 'PLANEJADA', 'LIBERADA', etc.)
            'status_display',           # Campo para leitura
            'observacoes'
        ]
        # Define campos que não podem ser alterados via API, apenas lidos.
        read_only_fields = ('data_emissao', 'data_inicio_real', 'data_termino_real')