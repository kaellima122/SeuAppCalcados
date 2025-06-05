from django.db import models

# Modelo para Fornecedores (Item 1.16 da nossa lista)
class Fornecedor(models.Model):
    nome_razao_social = models.CharField(max_length=255, unique=True)
    nome_fantasia = models.CharField(max_length=255, blank=True, null=True)
    cnpj = models.CharField(max_length=18, unique=True, help_text="Formato: XX.XXX.XXX/XXXX-XX") # 18 chars para incluir máscara
    email = models.EmailField(max_length=255, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome_razao_social

    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ['nome_razao_social']


# Modelo para Matérias-Primas (Item 1.11 da nossa lista)
class MateriaPrima(models.Model):
    # Definindo escolhas para a unidade de medida
    UNIDADES_DE_MEDIDA = [
        ('UN', 'Unidade'),
        ('M', 'Metro'),
        ('M2', 'Metro Quadrado'),
        ('KG', 'Quilograma'),
        ('L', 'Litro'),
        ('PAR', 'Par'),
    ]

    codigo = models.CharField(max_length=50, unique=True, help_text="Código ou SKU da matéria-prima")
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    unidade_medida = models.CharField(max_length=3, choices=UNIDADES_DE_MEDIDA, default='UN')

    # Estoque
    saldo_em_estoque = models.DecimalField(max_digits=10, decimal_places=3, default=0.000)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=3, default=0.000)

    # Custo e Fornecedor
    custo_medio = models.DecimalField(max_digits=10, decimal_places=4, default=0.0000, help_text="Custo médio de aquisição")
    fornecedor_padrao = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL, # Se o fornecedor for deletado, este campo fica nulo
        blank=True,
        null=True,
        related_name='materias_primas'
    )

    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.nome}"

    class Meta:
        verbose_name = "Matéria-Prima"
        verbose_name_plural = "Matérias-Primas"
        ordering = ['nome']