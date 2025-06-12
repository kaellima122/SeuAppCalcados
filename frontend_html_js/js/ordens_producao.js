document.addEventListener('DOMContentLoaded', function() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const tabelaOrdensProducaoBody = document.getElementById('tabelaOrdensProducao');
    const formOrdemProducao = document.getElementById('formOrdemProducao');
    
    // --- CONFIGURAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const apiUrl = 'http://127.0.0.1:8000/api/producao/ordens-de-producao/';

    function getAuthHeaders(includeContentType = true) {
        if (!token) {
            window.location.href = 'login.html';
            return null;
        }
        const headers = { 'Authorization': 'Token ' + token };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    // --- FUNÇÃO PARA LISTAR AS ORDENS DE PRODUÇÃO ---
    function listarOrdensProducao() {
        // ... (código da função listarOrdensProducao que você já tem, sem alterações) ...
        const headers = getAuthHeaders(false);
        if (!headers) return;
        fetch(apiUrl, { headers: headers })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                tabelaOrdensProducaoBody.innerHTML = '';
                data.forEach(op => {
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-id', op.id);
                    let acoesHtml = '';
                    if (op.status === 'PLANEJADA') {
                        acoesHtml = '<button class="btn-liberar">Liberar Produção</button>';
                    } else if (op.status === 'EM_PRODUCAO') {
                        acoesHtml = '<button class="btn-finalizar">Finalizar Produção</button>';
                    } else {
                        acoesHtml = '---';
                    }
                    let linhaHtml = '<td>' + op.id + '</td>';
                    linhaHtml += '<td>' + op.numero_op + '</td>';
                    linhaHtml += '<td>' + op.produto_variacao_sku + '</td>';
                    linhaHtml += '<td>' + op.quantidade_a_produzir + '</td>';
                    linhaHtml += '<td><span class="status-' + op.status.toLowerCase() + '">' + op.status_display + '</span></td>';
                    linhaHtml += '<td>' + acoesHtml + '</td>';
                    tr.innerHTML = linhaHtml;
                    tabelaOrdensProducaoBody.appendChild(tr);
                });
            }).catch(() => {
                tabelaOrdensProducaoBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar Ordens de Produção.</td></tr>';
            });
    }

    // --- EVENT LISTENER PARA CRIAR NOVA OP (sem alterações) ---
    if (formOrdemProducao) {
        formOrdemProducao.addEventListener('submit', function(event) {
            // ... (código do submit que você já tem, sem alterações) ...
            event.preventDefault();
            const dadosOP = {
                numero_op: document.getElementById('numero_op').value,
                produto_variacao: document.getElementById('produto_variacao_id').value,
                quantidade_a_produzir: document.getElementById('quantidade').value,
                data_previsao_inicio: document.getElementById('data_previsao_inicio').value,
                data_previsao_termino: document.getElementById('data_previsao_termino').value,
            };
            fetch(apiUrl, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(dadosOP)
            })
            .then(res => res.json().then(data => ({ ok: res.ok, status: res.status, body: data })))
            .then(responseObj => {
                if (responseObj.ok) {
                    alert('Ordem de Produção criada com sucesso!');
                    formOrdemProducao.reset();
                    listarOrdensProducao();
                } else {
                    let erroMsg = "Erro ao criar OP:\n";
                    for(const campo in responseObj.body) { erroMsg += `${campo}: ${responseObj.body[campo].join(', ')}\n`; }
                    alert(erroMsg);
                }
            });
        });
    }

    // --- EVENT LISTENER PARA OS BOTÕES DE AÇÃO NA TABELA (COM A ADIÇÃO) ---
    tabelaOrdensProducaoBody.addEventListener('click', function(event) {
        const opId = event.target.closest('tr')?.getAttribute('data-id');
        if (!opId) return;

        let urlAcao = '';
        // Verifica se clicou em Liberar
        if (event.target.classList.contains('btn-liberar')) {
            urlAcao = `${apiUrl}${opId}/liberar_producao/`;
        } 
        // ADIÇÃO: Verifica se clicou em Finalizar
        else if (event.target.classList.contains('btn-finalizar')) {
            urlAcao = `${apiUrl}${opId}/finalizar_producao/`;
        }

        // Se uma ação foi identificada, executa
        if (urlAcao) {
            if (!confirm('Tem certeza que deseja executar esta ação?')) return;
            
            fetch(urlAcao, {
                method: 'POST',
                headers: getAuthHeaders(false)
            })
            .then(res => res.json().then(data => ({ ok: res.ok, body: data })))
            .then(responseObj => {
                if (responseObj.ok) {
                    alert(responseObj.body.status || 'Ação executada com sucesso!');
                    listarOrdensProducao(); // Atualiza a lista
                } else {
                    alert(`Erro: ${responseObj.body.error || 'Ocorreu um problema.'}`);
                }
            });
        }
    });

    // --- CHAMADA INICIAL ---
    listarOrdensProducao();
});