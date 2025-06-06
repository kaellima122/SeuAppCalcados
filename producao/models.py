from django.db import models
from produtos.models import ProdutoVariacao

# Modelo para a Ordem de Produção (OP)
class OrdemProducao(models.Model):
    # Definindo as opções de status para a OP
    class StatusOp(models.TextChoices):
        PLANEJADA = 'PLANEJADA', 'Planejada'
        LIBERADA = 'LIBERADA', 'Liberada para Produção'
        EM_PRODUCAO = 'EM_PRODUCAO', 'Em Produção'
        CONCLUIDA = 'CONCLUIDA', 'Concluída'
        CANCELADA = 'CANCELADA', 'Cancelada'

    numero_op = models.CharField(max_length=50, unique=True, help_text="Número único da Ordem de Produção")

    # Qual produto específico (SKU) será produzido
    produto_variacao = models.ForeignKey(ProdutoVariacao, on_delete=models.PROTECT, related_name='ordens_de_producao')

    quantidade_a_produzir = models.PositiveIntegerField()

    # Datas
    data_emissao = models.DateTimeField(auto_now_add=True)
    data_previsao_inicio = models.DateField()
    data_previsao_termino = models.DateField()
    data_inicio_real = models.DateTimeField(blank=True, null=True)
    data_termino_real = models.DateTimeField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=StatusOp.choices,
        default=StatusOp.PLANEJADA
    )

    observacoes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"OP {self.numero_op} - {self.quantidade_a_produzir}x {self.produto_variacao.sku}"

    class Meta:
        verbose_name = "Ordem de Produção"
        verbose_name_plural = "Ordens de Produção"
        ordering = ['-data_emissao']