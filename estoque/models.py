from django.db import models
from produtos.models import MateriaPrima, ProdutoVariacao
from producao.models import OrdemProducao

class MovimentacaoEstoque(models.Model):
    """
    Modelo abstrato base para movimentações de estoque.
    Não cria uma tabela no banco, serve apenas para ser herdado.
    """
    TIPOS_MOVIMENTACAO = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]

    data_hora = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=7, choices=TIPOS_MOVIMENTACAO)
    quantidade = models.DecimalField(max_digits=10, decimal_places=3)
    # related_query_name nos permite usar 'movimentacoes' para filtrar
    responsavel = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='%(class)s_movimentacoes'
    )
    observacao = models.TextField(blank=True, null=True)

    class Meta:
        abstract = True # Define que este modelo é abstrato
        ordering = ['-data_hora']

class MovimentacaoMateriaPrima(MovimentacaoEstoque):
    materia_prima = models.ForeignKey(MateriaPrima, on_delete=models.CASCADE, related_name='movimentacoes')
    # Podemos ligar a saída a uma Ordem de Produção
    ordem_producao = models.ForeignKey(
        OrdemProducao, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='movimentacoes_materias_primas'
    )

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.quantidade} {self.materia_prima.unidade_medida} de {self.materia_prima.nome}"

class MovimentacaoProdutoAcabado(MovimentacaoEstoque):
    produto_variacao = models.ForeignKey(ProdutoVariacao, on_delete=models.CASCADE, related_name='movimentacoes')
    # Podemos ligar a entrada a uma Ordem de Produção
    ordem_producao = models.ForeignKey(
        OrdemProducao, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='movimentacoes_produtos_acabados'
    )

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.quantidade} UN de {self.produto_variacao.sku}"