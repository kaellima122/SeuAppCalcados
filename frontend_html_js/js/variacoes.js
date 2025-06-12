document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os elementos da página que vamos manipular
    const nomeModeloSpan = document.getElementById('nomeModelo');
    const tabelaVariacoesBody = document.getElementById('tabelaVariacoes');
    
    // Pega o token de autenticação guardado no navegador
    const token = localStorage.getItem('authToken');

    // Pega o ID do modelo a partir dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const modeloId = urlParams.get('modelo_id');

    // Se não encontrar um ID de modelo na URL, exibe um erro e para a execução
    if (!modeloId) {
        nomeModeloSpan.textContent = "ERRO: ID do Modelo não especificado na URL!";
        nomeModeloSpan.style.color = 'red';
        return;
    }

    // Define as URLs da API que vamos usar
    const apiUrlModeloDetalhe = `http://127.0.0.1:8000/api/produtos/modelos/${modeloId}/`;
    const apiUrlVariacoes = `http://127.0.0.1:8000/api/produtos/variacoes/`; // URL base
    const apiUrlVariacoesListaFiltrada = `${apiUrlVariacoes}?produto_modelo=${modeloId}`; // URL para listar

    // --- Função ajudante para criar os cabeçalhos com o token ---
    function getAuthHeaders(includeContentType = true) {
        if (!token) {
            alert('Você não está autenticado. Por favor, faça login.');
            window.location.href = 'login.html';
            return null; // Retorna nulo para parar a execução
        }
        const headers = { 'Authorization': `Token ${token}` };
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    const headers = getAuthHeaders();
    if (!headers) return; 

    // --- 1. Busca os detalhes do modelo para exibir no título da página ---
    fetch(apiUrlModeloDetalhe, { headers: getAuthHeaders(false) })
        .then(response => response.json())
        .then(data => {
            nomeModeloSpan.textContent = `"${data.nome_modelo}"`;
        });

    // --- 2. Função para buscar e exibir a lista de variações para este modelo ---
    function listarVariacoes() {
        fetch(apiUrlVariacoesListaFiltrada, { headers: getAuthHeaders(false) })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar as variações.');
                return response.json();
            })
            .then(data => {
                tabelaVariacoesBody.innerHTML = ''; // Limpa a tabela

                if (data.length === 0) {
                    tabelaVariacoesBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhuma variação cadastrada para este modelo.</td></tr>`;
                } else {
                    data.forEach(variacao => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', variacao.id);
                        const atributos = variacao.valores_atributos_nomes ? variacao.valores_atributos_nomes.join(', ') : 'N/A';
                        
                        tr.innerHTML = `
                            <td>${variacao.id}</td>
                            <td>${variacao.sku}</td>
                            <td>R$ ${parseFloat(variacao.preco_venda).toFixed(2)}</td>
                            <td>${variacao.saldo_em_estoque}</td>
                            <td>${atributos}</td>
                            <td>
                                <button class="btn-editar">Editar</button>
                                <button class="btn-excluir">Excluir</button>
                            </td>
                        `;
                        tabelaVariacoesBody.appendChild(tr);
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao listar variações:', error);
                tabelaVariacoesBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${error.message}</td></tr>`;
            });
    }

    // --- NOVO BLOCO DE CÓDIGO PARA DELEÇÃO ---
    tabelaVariacoesBody.addEventListener('click', function(event) {
        // Verifica se o elemento clicado foi um botão com a classe 'btn-excluir'
        if (event.target.classList.contains('btn-excluir')) {
            const linha = event.target.closest('tr');
            const idVariacao = linha.getAttribute('data-id');

            if (confirm(`Tem certeza de que deseja excluir a variação com ID ${idVariacao}?`)) {
                // Se o usuário confirmar, faz a requisição DELETE
                fetch(`${apiUrlVariacoes}${idVariacao}/`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(false) // Apenas o header de autorização é necessário
                })
                .then(response => {
                    if (response.status === 204) { // 204 No Content = Sucesso na exclusão
                        alert('Variação excluída com sucesso!');
                        listarVariacoes(); // Atualiza a tabela para remover o item
                    } else {
                        // Tenta mostrar uma mensagem de erro da API, se houver
                        response.json().then(data => {
                            alert(`Erro ao excluir: ${data.detail || 'Erro desconhecido.'}`);
                        });
                    }
                })
                .catch(error => {
                    console.error('Erro ao excluir variação:', error);
                    alert('Não foi possível conectar ao servidor para excluir o item.');
                });
            }
        }
    });

    // --- Chamada inicial para carregar a lista quando a página abre ---
    listarVariacoes();
});