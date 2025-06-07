

from django.db import transaction
from rest_framework import viewsets, status, permissions # Adicionamos 'permissions' aqui
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import OrdemProducao
from .serializers import OrdemProducaoSerializer
from estoque.models import MovimentacaoMateriaPrima

class OrdemProducaoViewSet(viewsets.ModelViewSet):
    """
    Endpoint da API que permite que as Ordens de Produção sejam vistas ou editadas.
    """
    queryset = OrdemProducao.objects.all().order_by('-data_emissao')
    serializer_class = OrdemProducaoSerializer

    # --- LINHA DE DEBUG ADICIONADA AQUI ---
    # Vamos temporariamente permitir qualquer um para isolar o problema.
    # Depois de testar, vamos trocar por uma permissão mais segura.
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def liberar_producao(self, request, pk=None):
        """
        Ação para liberar uma Ordem de Produção 'Planejada'.
        Verifica o estoque, consome as matérias-primas e muda o status.
        """
        ordem_producao = self.get_object()

        # 1. Validação inicial do status
        if ordem_producao.status != OrdemProducao.StatusOp.PLANEJADA:
            return Response(
                {'error': f"Apenas OPs com status 'Planejada' podem ser liberadas. Status atual: {ordem_producao.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 2. Transação atômica para garantir a integridade
            with transaction.atomic():
                ficha_tecnica = ordem_producao.produto_variacao.produto_modelo.ficha_tecnica
                itens_da_ficha = ficha_tecnica.itemfichatecnica_set.all()

                if not itens_da_ficha.exists():
                    raise ValidationError("O produto desta OP não tem uma Ficha Técnica com itens.")

                # 3. Verificação e Consumo de Estoque
                for item in itens_da_ficha:
                    materia_prima = item.materia_prima
                    quantidade_necessaria = item.quantidade * ordem_producao.quantidade_a_produzir

                    if materia_prima.saldo_em_estoque < quantidade_necessaria:
                        raise ValidationError(f"Estoque insuficiente para '{materia_prima.nome}'.")

                    # Consome o estoque
                    materia_prima.saldo_em_estoque -= quantidade_necessaria
                    materia_prima.save()

                    # Cria o registro de movimentação
                    MovimentacaoMateriaPrima.objects.create(
                        materia_prima=materia_prima, tipo='SAIDA', quantidade=quantidade_necessaria,
                        observacao=f"Consumo para a OP {ordem_producao.numero_op}",
                        ordem_producao=ordem_producao,
                        # Usamos o usuário da requisição como responsável
                        responsavel=request.user if request.user.is_authenticated else None
                    )

                # 4. Atualiza o status da OP
                ordem_producao.status = OrdemProducao.StatusOp.EM_PRODUCAO
                ordem_producao.save()

            return Response({'status': f"OP {ordem_producao.numero_op} liberada com sucesso."})

        except ValidationError as e:
            return Response({'error': e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Ocorreu um erro inesperado: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)