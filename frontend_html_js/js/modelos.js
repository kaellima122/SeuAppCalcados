document.addEventListener('DOMContentLoaded', function () {
    // Seleciona os elementos do DOM que vamos usar
    const formModelo = document.getElementById('formModelo');
    const tabelaModelosBody = document.getElementById('tabelaModelos');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');

    // URL da nossa API para Modelos de Produto
    const apiUrl = 'http://127.0.0.1:8000/api/produtos/modelos/';

    // --- FUNÇÃO PARA BUSCAR E EXIBIR OS MODELOS NA TABELA ---
    function listarModelos() {
        tabelaModelosBody.innerHTML = ''; // Limpa a tabela antes de adicionar os novos dados

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro de rede: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Para cada modelo na resposta da API, cria uma linha na tabela
                data.forEach(modelo => {
                    const tr = document.createElement('tr');
                    
                    // Conteúdo da linha da tabela (com as crases corretas)
                    tr.innerHTML = `
                        <td>${modelo.id}</td>
                        <td>${modelo.codigo_modelo}</td>
                        <td>${modelo.nome_modelo}</td>
                        <td>
                            <button class="btn-editar">Editar</button>
                            <button class="btn-excluir">Excluir</button>
                        </td>
                    `;
                    
                    tabelaModelosBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar modelos:', error);
                // Você pode adicionar uma mensagem de erro na página se quiser
                // mensagemRetornoTabela.innerHTML = 'Não foi possível carregar os modelos.';
            });
    }

    // --- FUNÇÃO PARA ADICIONAR UM NOVO MODELO (QUANDO O FORMULÁRIO É ENVIADO) ---
    if (formModelo) {
        formModelo.addEventListener('submit', function (event) {
            event.preventDefault(); // Impede o recarregamento da página

            const dadosModelo = {
                codigo_modelo: document.getElementById('codigo_modelo').value,
                nome_modelo: document.getElementById('nome_modelo').value,
                descricao: document.getElementById('descricao').value
            };

            // Faz a requisição POST para criar o novo modelo
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Envia cookies de sessão se houver
                body: JSON.stringify(dadosModelo)
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(dataObj => {
                if (dataObj.status === 201) { // 201 Created = Sucesso na criação
                    mensagemRetornoForm.innerHTML = `Modelo "${dataObj.body.nome_modelo}" adicionado com sucesso!`;
                    mensagemRetornoForm.className = 'mensagem sucesso';
                    formModelo.reset();      // Limpa o formulário
                    listarModelos();         // Atualiza a tabela com o novo item
                } else {
                    // Monta uma mensagem de erro clara a partir da resposta da API
                    let erroMsg = 'Erro ao adicionar: ';
                    for (const campo in dataObj.body) {
                        erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `;
                    }
                    mensagemRetornoForm.innerHTML = erroMsg;
                    mensagemRetornoForm.className = 'mensagem erro';
                }
            })
            .catch(error => {
                console.error('Erro ao adicionar modelo:', error);
                mensagemRetornoForm.innerHTML = 'Não foi possível conectar ao servidor.';
                mensagemRetornoForm.className = 'mensagem erro';
            });
        });
    }

    // --- CHAMADA INICIAL ---
    // Chama a função para listar os modelos assim que a página terminar de carregar
    listarModelos();
});