document.addEventListener('DOMContentLoaded', function () {
    // Selecionando os elementos do DOM
    const formMateriaPrima = document.getElementById('formMateriaPrima');
    const tabelaMateriasPrimasBody = document.getElementById('tabelaMateriasPrimas');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const mensagemRetornoTabela = document.getElementById('mensagemRetornoTabela');
    const editMateriaPrimaIdInput = document.getElementById('editMateriaPrimaId'); // Pega o campo escondido do HTML
    const formButton = formMateriaPrima.querySelector('button[type="submit"]'); // Pega o botão do formulário
    const formTitle = document.querySelector('.form-section h1'); // Pega o título do formulário

    const apiUrl = 'http://127.0.0.1:8000/api/produtos/materias-primas/';

    // --- FUNÇÃO PARA LISTAR AS MATÉRIAS-PRIMAS (já inclui a coluna de Ações) ---
    function listarMateriasPrimas() {
        tabelaMateriasPrimasBody.innerHTML = '';
        mensagemRetornoTabela.innerHTML = '';
        mensagemRetornoTabela.className = 'mensagem';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    mensagemRetornoTabela.innerHTML = 'Nenhuma matéria-prima cadastrada.';
                } else {
                    data.forEach(materiaPrima => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', materiaPrima.id);
                        tr.innerHTML = `
                            <td>${materiaPrima.id}</td>
                            <td>${materiaPrima.codigo}</td>
                            <td>${materiaPrima.nome}</td>
                            <td>${materiaPrima.saldo_em_estoque}</td>
                            <td>${materiaPrima.unidade_medida}</td>
                            <td>
                                <button class="btn-editar">Editar</button>
                                <button class="btn-excluir">Excluir</button>
                            </td>
                        `;
                        tabelaMateriasPrimasBody.appendChild(tr);
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao buscar matérias-primas:', error);
                mensagemRetornoTabela.innerHTML = `Erro ao carregar dados: ${error.message}`;
                mensagemRetornoTabela.classList.add('erro');
            });
    }

    // --- FUNÇÃO PARA PREPARAR O FORMULÁRIO PARA EDIÇÃO (NOVA) ---
    function prepararEdicao(id) {
        fetch(`${apiUrl}${id}/`)
            .then(response => response.json())
            .then(data => {
                // Preenche o formulário com os dados do item
                formTitle.textContent = 'Editar Matéria-Prima'; // Muda o título do formulário
                document.getElementById('codigo').value = data.codigo;
                document.getElementById('nome').value = data.nome;
                document.getElementById('unidadeMedida').value = data.unidade_medida;
                document.getElementById('estoqueMinimo').value = data.estoque_minimo;
                document.getElementById('fornecedorId').value = data.fornecedor_padrao;
                
                editMateriaPrimaIdInput.value = data.id; // Guarda o ID no campo escondido
                formButton.textContent = 'Salvar Alterações'; // Muda o texto do botão
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página para o topo
            });
    }
    
    // --- FUNÇÃO PARA RESETAR O FORMULÁRIO PARA O MODO DE ADIÇÃO (NOVA) ---
    function resetarFormulario() {
        formMateriaPrima.reset();
        editMateriaPrimaIdInput.value = ''; // Limpa o ID do campo escondido
        formButton.textContent = 'Adicionar Matéria-Prima'; // Volta o texto do botão ao original
        formTitle.textContent = 'Adicionar Nova Matéria-Prima'; // Volta o título ao original
        mensagemRetornoForm.innerHTML = '';
        mensagemRetornoForm.className = 'mensagem';
    }

    // --- FUNÇÃO PARA LIDAR COM O ENVIO DO FORMULÁRIO (MODIFICADA) ---
    formMateriaPrima.addEventListener('submit', function (event) {
        event.preventDefault();

        const idParaEditar = editMateriaPrimaIdInput.value;
        
        const dadosMateriaPrima = {
            codigo: document.getElementById('codigo').value,
            nome: document.getElementById('nome').value,
            unidade_medida: document.getElementById('unidadeMedida').value,
            estoque_minimo: document.getElementById('estoqueMinimo').value,
            fornecedor_padrao: document.getElementById('fornecedorId').value || null
        };

        let url = apiUrl;
        let metodo = 'POST';

        // Se tiver um ID, estamos editando, então muda a URL e o método
        if (idParaEditar) {
            url = `${apiUrl}${idParaEditar}/`;
            metodo = 'PUT'; // PUT atualiza o objeto inteiro
        }

        fetch(url, {
            method: metodo,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dadosMateriaPrima)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(dataObj => {
            const sucesso = (metodo === 'POST' && dataObj.status === 201) || (metodo === 'PUT' && dataObj.status === 200);
            if (sucesso) {
                const acao = (metodo === 'POST') ? 'adicionada' : 'atualizada';
                resetarFormulario();
                listarMateriasPrimas();
                // Mostra a mensagem de sucesso na div da TABELA, para melhor visibilidade
                mensagemRetornoTabela.innerHTML = `Matéria-prima "${dataObj.body.nome}" ${acao} com sucesso!`;
                mensagemRetornoTabela.className = 'mensagem sucesso';
            } else {
                let erroMsg = 'Erro: ';
                for (const campo in dataObj.body) {
                    erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `;
                }
                mensagemRetornoForm.innerHTML = erroMsg;
                mensagemRetornoForm.className = 'mensagem erro';
            }
        });
    });

    // --- FUNÇÃO PARA LIDAR COM CLIQUES NA TABELA (MODIFICADA) ---
    tabelaMateriasPrimasBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        
        const idMateriaPrima = linha.getAttribute('data-id');

        // Verifica se o clique foi no botão de EDITAR
        if (event.target.classList.contains('btn-editar')) {
            prepararEdicao(idMateriaPrima);
        }
        
        // Verifica se o clique foi no botão de EXCLUIR
        if (event.target.classList.contains('btn-excluir')) {
            if (confirm(`Tem certeza de que deseja excluir a matéria-prima com ID ${idMateriaPrima}?`)) {
                fetch(`${apiUrl}${idMateriaPrima}/`, { method: 'DELETE' })
                    .then(response => {
                        if (response.status === 204) {
                            alert('Matéria-prima excluída com sucesso!');
                            listarMateriasPrimas();
                        } else {
                            response.json().then(data => alert(`Erro ao excluir: ${data.detail || 'Erro desconhecido.'}`));
                        }
                    });
            }
        }
    });

    // --- CHAMADA INICIAL ---
    listarMateriasPrimas();
});