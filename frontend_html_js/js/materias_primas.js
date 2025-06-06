document.addEventListener('DOMContentLoaded', function () {
    const formMateriaPrima = document.getElementById('formMateriaPrima');
    const tabelaMateriasPrimasBody = document.getElementById('tabelaMateriasPrimas');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const mensagemRetornoTabela = document.getElementById('mensagemRetornoTabela');
    const editMateriaPrimaIdInput = document.getElementById('editMateriaPrimaId');
    const formButton = formMateriaPrima.querySelector('button[type="submit"]');
    const formTitle = document.querySelector('.form-section h1');

    const apiUrl = 'http://127.0.0.1:8000/api/produtos/materias-primas/';
    const token = localStorage.getItem('authToken'); // Pega o token do localStorage

    // --- FUNÇÃO PARA CRIAR CABEÇALHOS DE AUTORIZAÇÃO (NOVO) ---
    function getAuthHeaders(includeContentType = true) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    // --- FUNÇÃO PARA LISTAR AS MATÉRIAS-PRIMAS (ATUALIZADA) ---
    function listarMateriasPrimas() {
        tabelaMateriasPrimasBody.innerHTML = '';

        fetch(apiUrl, { headers: getAuthHeaders(false) }) // Envia o token na requisição GET
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    // Se não estiver autenticado, redireciona para o login
                    alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
                    window.location.href = 'login.html';
                    throw new Error('Não autenticado');
                }
                if (!response.ok) throw new Error('Erro ao buscar dados.');
                return response.json();
            })
            .then(data => {
                // ... (lógica para preencher a tabela continua a mesma) ...
                if (data.length === 0) {
                    mensagemRetornoTabela.innerHTML = 'Nenhuma matéria-prima cadastrada.';
                } else {
                    data.forEach(materiaPrima => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', materiaPrima.id);
                        tr.innerHTML = `<td><span class="math-inline">\{materiaPrima\.id\}</td\><td\></span>{materiaPrima.codigo}</td><td><span class="math-inline">\{materiaPrima\.nome\}</td\><td\></span>{materiaPrima.saldo_em_estoque}</td><td>${materiaPrima.unidade_medida}</td><td><button class="btn-editar">Editar</button><button class="btn-excluir">Excluir</button></td>`;
                        tabelaMateriasPrimasBody.appendChild(tr);
                    });
                }
            })
            .catch(error => {
                if (error.message !== 'Não autenticado') {
                    console.error('Erro ao buscar matérias-primas:', error);
                    mensagemRetornoTabela.innerHTML = `Erro ao carregar dados: ${error.message}`;
                    mensagemRetornoTabela.classList.add('erro');
                }
            });
    }

    // --- FUNÇÃO PARA LIDAR COM O ENVIO DO FORMULÁRIO (ATUALIZADA) ---
    formMateriaPrima.addEventListener('submit', function (event) {
        event.preventDefault();

        const idParaEditar = editMateriaPrimaIdInput.value;
        const dadosMateriaPrima = { /* ... (código para pegar os dados do form continua o mesmo) ... */ 
            codigo: document.getElementById('codigo').value,
            nome: document.getElementById('nome').value,
            unidade_medida: document.getElementById('unidadeMedida').value,
            estoque_minimo: document.getElementById('estoqueMinimo').value,
            fornecedor_padrao: document.getElementById('fornecedorId').value || null
        };

        let url = apiUrl;
        let metodo = 'POST';
        if (idParaEditar) {
            url = `<span class="math-inline">\{apiUrl\}</span>{idParaEditar}/`;
            metodo = 'PUT';
        }

        fetch(url, {
            method: metodo,
            headers: getAuthHeaders(), // Usa a função para pegar os cabeçalhos com o token
            body: JSON.stringify(dadosMateriaPrima)
        })
        // ... (o resto do .then() e .catch() do formulário continua o mesmo) ...
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(dataObj => {
            const sucesso = (metodo === 'POST' && dataObj.status === 201) || (metodo === 'PUT' && dataObj.status === 200);
            if (sucesso) {
                const acao = (metodo === 'POST') ? 'adicionada' : 'atualizada';
                resetarFormulario();
                listarMateriasPrimas();
                mensagemRetornoTabela.innerHTML = `Matéria-prima "${dataObj.body.nome}" ${acao} com sucesso!`;
                mensagemRetornoTabela.className = 'mensagem sucesso';
            } else {
                let erroMsg = 'Erro: ';
                for (const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `; }
                mensagemRetornoForm.innerHTML = erroMsg;
                mensagemRetornoForm.className = 'mensagem erro';
            }
        });
    });

    // --- FUNÇÃO PARA LIDAR COM CLIQUES NA TABELA (ATUALIZADA) ---
    tabelaMateriasPrimasBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idMateriaPrima = linha.getAttribute('data-id');

        if (event.target.classList.contains('btn-excluir')) {
            if (confirm(`Tem certeza de que deseja excluir a matéria-prima com ID ${idMateriaPrima}?`)) {
                fetch(`<span class="math-inline">\{apiUrl\}</span>{idMateriaPrima}/`, { 
                    method: 'DELETE',
                    headers: getAuthHeaders(false) // Usa a função para pegar o cabeçalho de autorização
                })
                .then(response => {
                    if (response.status === 204) {
                        alert('Matéria-prima excluída com sucesso!');
                        listarMateriasPrimas();
                    } else { /* ... (lógica de erro continua a mesma) ... */ 
                        response.json().then(data => alert(`Erro ao excluir: ${data.detail || 'Erro desconhecido.'}`));
                    }
                });
            }
        }

        if (event.target.classList.contains('btn-editar')) {
            // Para editar, a função de listar já precisa estar funcionando,
            // então o fetch dentro de prepararEdicao também precisa do token.
            prepararEdicao(idMateriaPrima);
        }
    });

    // --- FUNÇÃO PARA PREPARAR EDIÇÃO (ATUALIZADA) ---
    function prepararEdicao(id) {
        fetch(`<span class="math-inline">\{apiUrl\}</span>{id}/`, { headers: getAuthHeaders(false) }) // Envia o token para buscar os detalhes
            .then(response => response.json())
            .then(data => {
                // ... (o resto da função para preencher o formulário continua o mesmo) ...
                formTitle.textContent = 'Editar Matéria-Prima'; 
                document.getElementById('codigo').value = data.codigo;
                document.getElementById('nome').value = data.nome;
                document.getElementById('unidadeMedida').value = data.unidade_medida;
                document.getElementById('estoqueMinimo').value = data.estoque_minimo;
                document.getElementById('fornecedorId').value = data.fornecedor_padrao;
                editMateriaPrimaIdInput.value = data.id;
                formButton.textContent = 'Salvar Alterações';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
    }

    // Função resetarFormulario não precisa de alterações
    function resetarFormulario() { /* ... (código existente sem alterações) ... */ 
        formMateriaPrima.reset();
        editMateriaPrimaIdInput.value = '';
        formButton.textContent = 'Adicionar Matéria-Prima';
        formTitle.textContent = 'Adicionar Nova Matéria-Prima';
        mensagemRetornoForm.innerHTML = '';
        mensagemRetornoForm.className = 'mensagem';
    }

    // --- CHAMADA INICIAL ---
    listarMateriasPrimas();
});