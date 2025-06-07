document.addEventListener('DOMContentLoaded', function() {
    console.log("--- INICIANDO SCRIPT VARIACOES.JS (VERSÃO SEGURA) ---");

    // Seleciona os elementos da página
    const nomeModeloSpan = document.getElementById('nomeModelo');
    const tabelaVariacoesBody = document.getElementById('tabelaVariacoes');

    // Pega o token e o ID do modelo
    const token = localStorage.getItem('authToken');
    const urlParams = new URLSearchParams(window.location.search);
    const modeloId = urlParams.get('modelo_id');

    // Validação inicial
    if (!modeloId) {
        nomeModeloSpan.textContent = "ERRO: ID do Modelo não especificado na URL!";
        return;
    }
    if (!token) {
        alert('Você não está autenticado. Por favor, faça login.');
        window.location.href = 'login.html';
        return;
    }

    // Define as URLs e os cabeçalhos
    const apiUrlModeloDetalhe = `http://127.0.0.1:8000/api/produtos/modelos/${modeloId}/`;
    const apiUrlVariacoes = `http://127.0.0.1:8000/api/produtos/variacoes/?produto_modelo=${modeloId}`;
    const headers = { 'Authorization': `Token ${token}` };

    // Busca o nome do modelo para o título
    fetch(apiUrlModeloDetalhe, { headers: headers })
        .then(response => response.json())
        .then(data => {
            nomeModeloSpan.textContent = `"${data.nome_modelo}"`;
        });

    // Função principal para buscar e listar as variações
    function listarVariacoes() {
        fetch(apiUrlVariacoes, { headers: headers })
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
                        const atributos = variacao.valores_atributos_nomes.join(', ');

                        // --- MUDANÇA IMPORTANTE AQUI: Construindo o HTML linha por linha ---
                        let linhaHtml = '';
                        linhaHtml += '<td>' + variacao.id + '</td>';
                        linhaHtml += '<td>' + variacao.sku + '</td>';
                        linhaHtml += '<td>R$ ' + parseFloat(variacao.preco_venda).toFixed(2) + '</td>';
                        linhaHtml += '<td>' + variacao.saldo_em_estoque + '</td>';
                        linhaHtml += '<td>' + atributos + '</td>';
                        linhaHtml += '<td>' +
                                     '<button class="btn-editar">Editar</button>' +
                                     '<button class="btn-excluir">Excluir</button>' +
                                     '</td>';

                        tr.innerHTML = linhaHtml;
                        tabelaVariacoesBody.appendChild(tr);
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao listar variações:', error);
                tabelaVariacoesBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${error.message}</td></tr>`;
            });
    }

    // Chamada inicial
    listarVariacoes();
});