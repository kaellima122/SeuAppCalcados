from django.db import models

# Modelo para Fornecedores (JÁ EXISTE)
class Fornecedor(models.Model):
    nome_razao_social = models.CharField(max_length=255, unique=True)
    nome_fantasia = models.CharField(max_length=255, blank=True, null=True)
    cnpj = models.CharField(max_length=18, unique=True, help_text="Formato: XX.XXX.XXX/XXXX-XX")
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


# Modelo para Matérias-Primas (JÁ EXISTE)
class MateriaPrima(models.Model):
    UNIDADES_DE_MEDIDA = [
        ('UN', 'Unidade'), ('M', 'Metro'), ('M2', 'Metro Quadrado'),
        ('KG', 'Quilograma'), ('L', 'Litro'), ('PAR', 'Par'),
    ]
    codigo = models.CharField(max_length=50, unique=True, help_text="Código ou SKU da matéria-prima")
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    unidade_medida = models.CharField(max_length=3, choices=UNIDADES_DE_MEDIDA, default='UN')
    saldo_em_estoque = models.DecimalField(max_digits=10, decimal_places=3, default=0.000)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=3, default=0.000)
    custo_medio = models.DecimalField(max_digits=10, decimal_places=4, default=0.0000, help_text="Custo médio de aquisição")
    fornecedor_padrao = models.ForeignKey(
        Fornecedor, on_delete=models.SET_NULL, blank=True, null=True, related_name='materias_primas'
    )
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.nome}"

    class Meta:
        verbose_name = "Matéria-Prima"
        verbose_name_plural = "Matérias-Primas"
        ordering = ['nome']


# --- NOVOS MODELOS ADICIONADOS A PARTIR DAQUI ---

# Modelo para o Produto Base (ex: "Bota Adventure X")
class ProdutoModelo(models.Model):
    codigo_modelo = models.CharField(max_length=50, unique=True, help_text="Referência principal do modelo")
    nome_modelo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome_modelo

    class Meta:
        verbose_name = "Modelo de Produto"
        verbose_name_plural = "Modelos de Produto"
        ordering = ['nome_modelo']

# Modelo para a Ficha Técnica (Bill of Materials - BOM)
class FichaTecnica(models.Model):
    produto_modelo = models.OneToOneField(ProdutoModelo, on_delete=models.CASCADE, related_name='ficha_tecnica')
    descricao = models.CharField(max_length=255, help_text="Ex: Ficha Padrão V1.0")
    materias_primas = models.ManyToManyField(
        MateriaPrima,
        through='ItemFichaTecnica', # Usa o modelo 'ItemFichaTecnica' para a relação
        related_name='fichas_tecnicas'
    )

    def __str__(self):
        return f"Ficha Técnica para {self.produto_modelo.nome_modelo}"
    
    class Meta:
        verbose_name = "Ficha Técnica"
        verbose_name_plural = "Fichas Técnicas"

# Modelo para os Itens da Ficha Técnica (relação Many-to-Many com dados extras)
class ItemFichaTecnica(models.Model):
    ficha_tecnica = models.ForeignKey(FichaTecnica, on_delete=models.CASCADE)
    materia_prima = models.ForeignKey(MateriaPrima, on_delete=models.PROTECT) # Protege para não deletar matéria-prima em uso
    quantidade = models.DecimalField(max_digits=10, decimal_places=4, help_text="Quantidade necessária para 1 unidade do produto")

    def __str__(self):
        return f"{self.quantidade} de {self.materia_prima.nome} para {self.ficha_tecnica.produto_modelo.nome_modelo}"

    class Meta:
        verbose_name = "Item da Ficha Técnica"
        verbose_name_plural = "Itens da Ficha Técnica"
        unique_together = ('ficha_tecnica', 'materia_prima') # Garante que cada matéria-prima só apareça uma vez por ficha

# Modelo para os Atributos da Grade (ex: "Cor", "Tamanho")
class AtributoGrade(models.Model):
    nome = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Atributo da Grade"
        verbose_name_plural = "Atributos da Grade"

# Modelo para os Valores dos Atributos (ex: "Preto", "39", "Branco", "40")
class ValorAtributoGrade(models.Model):
    atributo = models.ForeignKey(AtributoGrade, on_delete=models.CASCADE, related_name='valores')
    valor = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.atributo.nome}: {self.valor}"

    class Meta:
        verbose_name = "Valor de Atributo"
        verbose_name_plural = "Valores de Atributos"
        unique_together = ('atributo', 'valor') # Garante que "Cor: Preto" seja único

# Modelo para a Variação do Produto (o item real em estoque, o SKU)
class ProdutoVariacao(models.Model):
    produto_modelo = models.ForeignKey(ProdutoModelo, on_delete=models.CASCADE, related_name='variacoes')
    sku = models.CharField(max_length=100, unique=True, help_text="SKU único para esta variação específica")
    codigo_barras = models.CharField(max_length=50, blank=True, null=True, unique=True)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    saldo_em_estoque = models.IntegerField(default=0)
    # Relação com os valores de atributo que definem esta variação
    valores_atributos = models.ManyToManyField(ValorAtributoGrade, related_name='variacoes')

    def __str__(self):
        # Cria uma representação legível da variação, ex: "Bota Adventure X (Cor: Preto, Tamanho: 40)"
        valores = ", ".join([str(valor) for valor in self.valores_atributos.all()])
        return f"{self.produto_modelo.nome_modelo} ({valores})"

    class Meta:
        verbose_name = "Variação de Produto (SKU)"
        verbose_name_plural = "Variações de Produto (SKUs)"
        ordering = ['produto_modelo__nome_modelo', 'sku']