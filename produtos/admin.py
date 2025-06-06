from django.contrib import admin
from .models import (
    Fornecedor, MateriaPrima, ProdutoModelo, FichaTecnica, ItemFichaTecnica,
    AtributoGrade, ValorAtributoGrade, ProdutoVariacao
)

# Admin para Fornecedor e Matéria-Prima (JÁ EXISTENTES)
@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome_razao_social', 'cnpj', 'telefone', 'ativo')
    search_fields = ('nome_razao_social', 'cnpj')
    list_filter = ('ativo',)
    list_per_page = 25

@admin.register(MateriaPrima)
class MateriaPrimaAdmin(admin.ModelAdmin):
    list_display = ('id', 'codigo', 'nome', 'unidade_medida', 'saldo_em_estoque', 'custo_medio', 'fornecedor_padrao', 'ativo')
    search_fields = ('codigo', 'nome', 'fornecedor_padrao__nome_razao_social')
    list_filter = ('ativo', 'unidade_medida', 'fornecedor_padrao')
    list_per_page = 25
    raw_id_fields = ('fornecedor_padrao',)

# --- REGISTRO DOS NOVOS MODELOS ---

# Permite adicionar Itens da Ficha Técnica diretamente na Ficha Técnica
class ItemFichaTecnicaInline(admin.TabularInline):
    model = ItemFichaTecnica
    extra = 1  # Quantos campos extras para adicionar por padrão
    raw_id_fields = ('materia_prima',)

@admin.register(FichaTecnica)
class FichaTecnicaAdmin(admin.ModelAdmin):
    inlines = [ItemFichaTecnicaInline]
    list_display = ('id', 'produto_modelo', 'descricao')
    search_fields = ('produto_modelo__nome_modelo',)

@admin.register(ProdutoModelo)
class ProdutoModeloAdmin(admin.ModelAdmin):
    list_display = ('id', 'codigo_modelo', 'nome_modelo', 'data_cadastro')
    search_fields = ('codigo_modelo', 'nome_modelo')

# Permite adicionar Valores de Atributo diretamente no Atributo da Grade
class ValorAtributoGradeInline(admin.TabularInline):
    model = ValorAtributoGrade
    extra = 1

@admin.register(AtributoGrade)
class AtributoGradeAdmin(admin.ModelAdmin):
    inlines = [ValorAtributoGradeInline]
    list_display = ('id', 'nome')
    search_fields = ('nome',)

@admin.register(ProdutoVariacao)
class ProdutoVariacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'sku', 'produto_modelo', 'preco_venda', 'saldo_em_estoque')
    search_fields = ('sku', 'produto_modelo__nome_modelo')
    list_filter = ('produto_modelo',)
    list_per_page = 25
    # 'filter_horizontal' é ótimo para campos ManyToManyField
    filter_horizontal = ('valores_atributos',)

# Não precisamos registrar ValorAtributoGrade e ItemFichaTecnica separadamente
# porque eles já são editáveis através dos "inlines" que criamos.
# Mas se você quisesse, poderia registrá-los normalmente também.