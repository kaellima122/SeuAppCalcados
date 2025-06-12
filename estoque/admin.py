from django.contrib import admin
from .models import MovimentacaoMateriaPrima, MovimentacaoProdutoAcabado

@admin.register(MovimentacaoMateriaPrima)
class MovimentacaoMateriaPrimaAdmin(admin.ModelAdmin):
    list_display = ('data_hora', 'materia_prima', 'tipo', 'quantidade', 'ordem_producao', 'responsavel')
    list_filter = ('tipo', 'materia_prima')
    search_fields = ('materia_prima__nome', 'ordem_producao__numero_op')
    list_per_page = 30

@admin.register(MovimentacaoProdutoAcabado)
class MovimentacaoProdutoAcabadoAdmin(admin.ModelAdmin):
    list_display = ('data_hora', 'produto_variacao', 'tipo', 'quantidade', 'ordem_producao', 'responsavel')
    list_filter = ('tipo', 'produto_variacao')
    search_fields = ('produto_variacao__sku', 'ordem_producao__numero_op')
    list_per_page = 30