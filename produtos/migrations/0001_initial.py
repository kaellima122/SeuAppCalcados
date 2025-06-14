# Generated by Django 5.2.2 on 2025-06-05 22:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Fornecedor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome_razao_social', models.CharField(max_length=255, unique=True)),
                ('nome_fantasia', models.CharField(blank=True, max_length=255, null=True)),
                ('cnpj', models.CharField(help_text='Formato: XX.XXX.XXX/XXXX-XX', max_length=18, unique=True)),
                ('email', models.EmailField(blank=True, max_length=255, null=True)),
                ('telefone', models.CharField(blank=True, max_length=20, null=True)),
                ('endereco', models.TextField(blank=True, null=True)),
                ('ativo', models.BooleanField(default=True)),
                ('data_cadastro', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Fornecedor',
                'verbose_name_plural': 'Fornecedores',
                'ordering': ['nome_razao_social'],
            },
        ),
        migrations.CreateModel(
            name='MateriaPrima',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo', models.CharField(help_text='Código ou SKU da matéria-prima', max_length=50, unique=True)),
                ('nome', models.CharField(max_length=255)),
                ('descricao', models.TextField(blank=True, null=True)),
                ('unidade_medida', models.CharField(choices=[('UN', 'Unidade'), ('M', 'Metro'), ('M2', 'Metro Quadrado'), ('KG', 'Quilograma'), ('L', 'Litro'), ('PAR', 'Par')], default='UN', max_length=3)),
                ('saldo_em_estoque', models.DecimalField(decimal_places=3, default=0.0, max_digits=10)),
                ('estoque_minimo', models.DecimalField(decimal_places=3, default=0.0, max_digits=10)),
                ('custo_medio', models.DecimalField(decimal_places=4, default=0.0, help_text='Custo médio de aquisição', max_digits=10)),
                ('ativo', models.BooleanField(default=True)),
                ('data_cadastro', models.DateTimeField(auto_now_add=True)),
                ('fornecedor_padrao', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='materias_primas', to='produtos.fornecedor')),
            ],
            options={
                'verbose_name': 'Matéria-Prima',
                'verbose_name_plural': 'Matérias-Primas',
                'ordering': ['nome'],
            },
        ),
    ]
