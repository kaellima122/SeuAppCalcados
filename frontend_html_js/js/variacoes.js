document.addEventListener('DOMContentLoaded', function() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const nomeModeloSpan = document.getElementById('nomeModelo');
    const tabelaVariacoesBody = document.getElementById('tabelaVariacoes');
    const btnAdicionarVariacao = document.getElementById('btnAdicionarVariacao');
    
    // Elementos do Modal
    const modal = document.getElementById('modalVariacao');
    const formVariacao = document.getElementById('formVariacao');
    const formTitle = document.getElementById('formVariacaoTitulo');
    const editVariacaoIdInput = document.getElementById('editVariacaoId');
    const formButton = document.getElementById('btnSalvarVariacao');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const valoresAtributosSelect = document.getElementById('valores_atributos');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    
    // --- CONFIGURAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const urlParams = new URLSearchParams(window.location.search);
    const modeloId = urlParams.get('modelo_id');

    if (!modeloId || !token) {
        alert('Erro: ID do Modelo ou Token de autenticação não encontrado. Redirecionando para login.');
        window.location.href = 'login.html';
        return;
    }

    const apiUrlVariacoes = 'http://127.0.0.1:8000/api/produtos/variacoes/';
    const apiUrlModeloDetalhe = `http://127.0.0.1:8000/api/produtos/modelos/${modeloId}/`;
    const apiUrlValoresAtributos = 'http://127.0.0.1:8000/api/produtos/valores-atributos/';
    
    function getAuthHeaders(includeContentType = true) {
        const headers = { 'Authorization': `Token ${token}` };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    // --- FUNÇÕES DO MODAL ---
    function abrirModal() { modal.classList.remove('modal-hidden'); }
    function fecharModal() { modal.classList.add('modal-hidden'); }
    
    function resetarFormulario() {
        formVariacao.reset();
        editVariacaoIdInput.value = '';
        mensagemRetornoForm.innerHTML = '';
        mensagemRetornoForm.className = 'mensagem';
        for (const option of valoresAtributosSelect.options) { option.selected = false; }
    }

    function prepararFormParaAdicionar() {
        resetarFormulario();
        formTitle.textContent = 'Adicionar Nova Variação';
        formButton.textContent = 'Adicionar';
        abrirModal();
    }

    function prepararFormParaEditar(id) {
        resetarFormulario();
        fetch(`${apiUrlVariacoes}${id}/`, { headers: getAuthHeaders(false) })
            .then(res => res.json())
            .then(data => {
                formTitle.textContent = 'Editar Variação';
                document.getElementById('sku').value = data.sku;
                document.getElementById('preco_venda').value = data.preco_venda;
                editVariacaoIdInput.value = data.id;
                
                const valoresIds = data.valores_atributos;
                for (const option of valoresAtributosSelect.options) {
                    option.selected = valoresIds.includes(parseInt(option.value));
                }
                formButton.textContent = 'Salvar Alterações';
                abrirModal();
            });
    }

    // --- FUNÇÕES DE API ---
    function listarVariacoes() {
        fetch(`${apiUrlVariacoes}?produto_modelo=${modeloId}`, { headers: getAuthHeaders(false) })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                tabelaVariacoesBody.innerHTML = '';
                if (data.length === 0) {
                    tabelaVariacoesBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhuma variação cadastrada para este modelo.</td></tr>`;
                } else {
                    data.forEach(variacao => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', variacao.id);
                        const atributos = variacao.valores_atributos_nomes.join(', ');
                        
                        let linhaHtml = '<td>' + variacao.id + '</td>';
                        linhaHtml += '<td>' + variacao.sku + '</td>';
                        linhaHtml += '<td>R$ ' + parseFloat(variacao.preco_venda).toFixed(2) + '</td>';
                        linhaHtml += '<td>' + variacao.saldo_em_estoque + '</td>';
                        linhaHtml += '<td>' + atributos + '</td>';
                        linhaHtml += '<td><button class="btn-editar">Editar</button><button class="btn-excluir">Excluir</button></td>';
                        tr.innerHTML = linhaHtml;
                        tabelaVariacoesBody.appendChild(tr);
                    });
                }
            }).catch(() => tabelaVariacoesBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar variações.</td></tr>`);
    }

    function popularAtributos() {
        fetch(apiUrlValoresAtributos, { headers: getAuthHeaders(false) })
            .then(res => res.json())
            .then(data => {
                valoresAtributosSelect.innerHTML = '';
                data.forEach(valor => {
                    const option = document.createElement('option');
                    option.value = valor.id;
                    option.textContent = `${valor.atributo_nome}: ${valor.valor}`;
                    valoresAtributosSelect.appendChild(option);
                });
            });
    }

    // --- EVENT LISTENERS ---
    btnAdicionarVariacao.addEventListener('click', prepararFormParaAdicionar);
    btnFecharModal.addEventListener('click', fecharModal);
    btnCancelarModal.addEventListener('click', fecharModal);

    formVariacao.addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedOptions = Array.from(valoresAtributosSelect.selectedOptions).map(option => parseInt(option.value));
        if (selectedOptions.length === 0) {
            alert("Por favor, selecione pelo menos um atributo.");
            return;
        }
        const dadosVariacao = {
            produto_modelo: modeloId,
            sku: document.getElementById('sku').value,
            preco_venda: document.getElementById('preco_venda').value,
            valores_atributos: selectedOptions,
            saldo_em_estoque: 0 
        };
        const idParaEditar = editVariacaoIdInput.value;
        let url = apiUrlVariacoes;
        let method = 'POST';
        if (idParaEditar) {
            url = `${apiUrlVariacoes}${idParaEditar}/`;
            method = 'PUT';
            delete dadosVariacao.saldo_em_estoque; // Não atualiza o saldo de estoque pelo formulário de edição
        }
        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosVariacao)
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(dataObj => {
            const sucesso = (method === 'POST' && dataObj.status === 201) || (method === 'PUT' && dataObj.status === 200);
            if (sucesso) {
                fecharModal();
                listarVariacoes();
            } else {
                let erroMsg = "Erro:\n";
                for(const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')}\n`;}
                mensagemRetornoForm.innerHTML = `<span class="mensagem erro" style="display:block;">${erroMsg}</span>`;
            }
        });
    });

    tabelaVariacoesBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idVariacao = linha.getAttribute('data-id');
        if (event.target.classList.contains('btn-editar')) {
            prepararFormParaEditar(idVariacao);
        } else if (event.target.classList.contains('btn-excluir')) {
            if (confirm(`Tem certeza que deseja excluir a variação ID ${idVariacao}?`)) {
                fetch(`${apiUrlVariacoes}${idVariacao}/`, { method: 'DELETE', headers: getAuthHeaders(false) })
                    .then(response => {
                        if (response.status === 204) {
                            listarVariacoes();
                        } else {
                            response.json().then(data => alert(`Erro ao excluir: ${data.detail || 'Verifique se esta variação não está em uso em uma Ordem de Produção.'}`));
                        }
                    });
            }
        }
    });

    // --- CHAMADAS INICIAIS ---
    fetch(apiUrlModeloDetalhe, { headers: getAuthHeaders(false) }).then(res => res.json()).then(data => { nomeModeloSpan.textContent = `"${data.nome_modelo}"`; });
    popularAtributos();
    listarVariacoes();
});