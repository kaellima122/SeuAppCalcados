from django.db import transaction
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import OrdemProducao
from .serializers import OrdemProducaoSerializer
# Agora importamos os dois modelos de movimentação
from estoque.models import MovimentacaoMateriaPrima, MovimentacaoProdutoAcabado

class OrdemProducaoViewSet(viewsets.ModelViewSet):
    queryset = OrdemProducao.objects.all().order_by('-data_emissao')
    serializer_class = OrdemProducaoSerializer
    permission_classes = [permissions.IsAuthenticated] # Tornando a API segura por padrão

    @action(detail=True, methods=['post'])
    def liberar_producao(self, request, pk=None):
        # ... (código da ação liberar_producao que você já tem, sem alterações) ...
        ordem_producao = self.get_object()
        if ordem_producao.status != OrdemProducao.StatusOp.PLANEJADA:
            return Response({'error': ...}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                # ... (lógica de verificação e consumo de estoque) ...
                ficha_tecnica = ordem_producao.produto_variacao.produto_modelo.ficha_tecnica
                itens_da_ficha = ficha_tecnica.itemfichatecnica_set.all()
                if not itens_da_ficha.exists():
                    raise ValidationError("O produto desta OP não tem Ficha Técnica.")
                for item in itens_da_ficha:
                    materia_prima = item.materia_prima
                    quantidade_necessaria = item.quantidade * ordem_producao.quantidade_a_produzir
                    if materia_prima.saldo_em_estoque < quantidade_necessaria:
                        raise ValidationError(f"Estoque insuficiente para '{materia_prima.nome}'.")
                    materia_prima.saldo_em_estoque -= quantidade_necessaria
                    materia_prima.save()
                    MovimentacaoMateriaPrima.objects.create(
                        materia_prima=materia_prima, tipo='SAIDA', quantidade=quantidade_necessaria,
                        observacao=f"Consumo para a OP {ordem_producao.numero_op}",
                        ordem_producao=ordem_producao, responsavel=request.user
                    )
                ordem_producao.status = OrdemProducao.StatusOp.EM_PRODUCAO
                ordem_producao.save()
            return Response({'status': f"OP {ordem_producao.numero_op} liberada com sucesso."})
        except ValidationError as e:
            return Response({'error': e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # --- NOVA AÇÃO CUSTOMIZADA ADICIONADA AQUI ---
    @action(detail=True, methods=['post'])
    def finalizar_producao(self, request, pk=None):
        """
        Ação para finalizar uma Ordem de Produção 'Em Produção'.
        Dá entrada do produto acabado no estoque e muda o status para 'Concluída'.
        """
        ordem_producao = self.get_object()

        # 1. Validação: só podemos finalizar OPs 'Em Produção'
        if ordem_producao.status != OrdemProducao.StatusOp.EM_PRODUCAO:
            return Response(
                {'error': f"Apenas OPs com status 'Em Produção' podem ser finalizadas. Status atual: {ordem_producao.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                produto_acabado = ordem_producao.produto_variacao
                quantidade_produzida = ordem_producao.quantidade_a_produzir

                # 2. Dá entrada do produto acabado no estoque
                produto_acabado.saldo_em_estoque += quantidade_produzida
                produto_acabado.save()

                # 3. Cria um registro da movimentação de estoque
                MovimentacaoProdutoAcabado.objects.create(
                    produto_variacao=produto_acabado,
                    tipo='ENTRADA',
                    quantidade=quantidade_produzida,
                    observacao=f"Entrada de produção da OP {ordem_producao.numero_op}",
                    ordem_producao=ordem_producao,
                    responsavel=request.user
                )

                # 4. Atualiza o status da Ordem de Produção
                ordem_producao.status = OrdemProducao.StatusOp.CONCLUIDA
                ordem_producao.save()

            return Response({'status': f"OP {ordem_producao.numero_op} finalizada com sucesso. {quantidade_produzida} unidades de '{produto_acabado.sku}' adicionadas ao estoque."})

        except Exception as e:
            return Response({'error': f"Ocorreu um erro inesperado: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)