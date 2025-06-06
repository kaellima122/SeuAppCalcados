from django.contrib import admin
from .models import OrdemProducao

@admin.register(OrdemProducao)
class OrdemProducaoAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'numero_op', 
        'produto_variacao', 
        'quantidade_a_produzir', 
        'status', 
        'data_emissao', 
        'data_previsao_termino'
    )
    list_filter = ('status', 'produto_variacao__produto_modelo') # Filtra por status e pelo modelo do produto
    search_fields = ('numero_op', 'produto_variacao__sku')
    list_per_page = 25
    # raw_id_fields é útil para selecionar a variação do produto
    raw_id_fields = ('produto_variacao',)
    # Define campos que são apenas para leitura no admin
    readonly_fields = ('data_emissao', 'data_inicio_real', 'data_termino_real')