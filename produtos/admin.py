from django.contrib import admin
from .models import Fornecedor, MateriaPrima # Importa seus novos modelos

# Configuração para o modelo Fornecedor na interface de admin
@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome_razao_social', 'cnpj', 'telefone', 'ativo')
    search_fields = ('nome_razao_social', 'cnpj')
    list_filter = ('ativo',)
    list_per_page = 25

# Configuração para o modelo MateriaPrima na interface de admin
@admin.register(MateriaPrima)
class MateriaPrimaAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'codigo', 
        'nome', 
        'unidade_medida', 
        'saldo_em_estoque', 
        'custo_medio', 
        'fornecedor_padrao', 
        'ativo'
    )
    search_fields = ('codigo', 'nome', 'fornecedor_padrao__nome_razao_social')
    list_filter = ('ativo', 'unidade_medida', 'fornecedor_padrao')
    list_per_page = 25
    # raw_id_fields é útil quando você tem muitos fornecedores
    raw_id_fields = ('fornecedor_padrao',)