document.addEventListener('DOMContentLoaded', function() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const nomeModeloSpan = document.getElementById('nomeModelo');
    const tabelaVariacoesBody = document.getElementById('tabelaVariacoes');
    const formVariacao = document.getElementById('formVariacao');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const valoresAtributosSelect = document.getElementById('valores_atributos');
    const editVariacaoIdInput = document.getElementById('editVariacaoId'); // Não esqueça de adicionar <input type="hidden" id="editVariacaoId"> no seu HTML
    const formButton = formVariacao.querySelector('button[type="submit"]');
    const formTitle = document.getElementById('formVariacaoTitulo');

    // --- CONFIGURAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const urlParams = new URLSearchParams(window.location.search);
    const modeloId = urlParams.get('modelo_id');

    if (!modeloId || !token) {
        alert('Erro: ID do Modelo ou Token de autenticação não encontrado. Redirecionando para login.');
        window.location.href = 'login.html';
        return;
    }

    const apiUrlVariacoes = `http://127.0.0.1:8000/api/produtos/variacoes/`;
    const apiUrlModeloDetalhe = `http://127.0.0.1:8000/api/produtos/modelos/${modeloId}/`;
    const apiUrlValoresAtributos = `http://127.0.0.1:8000/api/produtos/valores-atributos/`;

    function getAuthHeaders(includeContentType = true) {
        const headers = { 'Authorization': `Token ${token}` };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    // --- FUNÇÕES PRINCIPAIS ---

    // 1. Função para buscar e listar as variações
    function listarVariacoes() {
        fetch(`<span class="math-inline">\{apiUrlVariacoes\}?produto\_modelo\=</span>{modeloId}`, { headers: getAuthHeaders(false) })
            .then(res => res.json())
            .then(data => {
                tabelaVariacoesBody.innerHTML = '';
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
            });
    }

    // 2. Função para buscar e preencher o dropdown de atributos
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

    // 3. Função para preparar o formulário para edição
    function prepararEdicao(id) {
        fetch(`<span class="math-inline">\{apiUrlVariacoes\}</span>{id}/`, { headers: getAuthHeaders(false) })
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
    }

    // 4. Função para resetar o formulário
    function resetarFormulario() {
        formVariacao.reset();
        editVariacaoIdInput.value = '';
        formButton.textContent = 'Adicionar Variação';
        formTitle.textContent = 'Adicionar Nova Variação';
        for (const option of valoresAtributosSelect.options) { option.selected = false; }
    }

    // --- EVENT LISTENERS ---

    // Listener para o formulário (Adicionar e Editar)
    formVariacao.addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedOptions = Array.from(valoresAtributosSelect.selectedOptions).map(option => option.value);
        if (selectedOptions.length === 0) {
            alert("Por favor, selecione pelo menos um atributo.");
            return;
        }
        const dadosVariacao = {
            produto_modelo: modeloId,
            sku: document.getElementById('sku').value,
            preco_venda: document.getElementById('preco_venda').value,
            valores_atributos: selectedOptions
        };
        const idParaEditar = editVariacaoIdInput.value;
        let url = apiUrlVariacoes;
        let method = 'POST';
        if (idParaEditar) {
            url = `<span class="math-inline">\{apiUrlVariacoes\}</span>{idParaEditar}/`;
            method = 'PUT';
        }
        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosVariacao)
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(dataObj => {
            if (dataObj.status === 201 || dataObj.status === 200) {
                const acao = method === 'POST' ? 'criada' : 'atualizada';
                alert(`Variação "${dataObj.body.sku}" ${acao} com sucesso!`);
                resetarFormulario();
                listarVariacoes();
            } else {
                let erroMsg = "Erro:\n";
                for(const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')}\n`;}
                alert(erroMsg);
            }
        });
    });

    // Listener para a tabela (Editar e Excluir)
    tabelaVariacoesBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idVariacao = linha.getAttribute('data-id');

        if (event.target.classList.contains('btn-editar')) {
            prepararEdicao(idVariacao);
        } else if (event.target.classList.contains('btn-excluir')) {
            if (confirm(`Tem certeza que deseja excluir a variação ID ${idVariacao}?`)) {
                fetch(`<span class="math-inline">\{apiUrlVariacoes\}</span>{idVariacao}/`, { method: 'DELETE', headers: getAuthHeaders(false) })
                    .then(response => {
                        if (response.status === 204) {
                            alert('Variação excluída com sucesso!');
                            listarVariacoes();
                        } else {
                            response.json().then(data => alert(`Erro ao excluir: ${data.detail || 'Erro desconhecido.'}`));
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