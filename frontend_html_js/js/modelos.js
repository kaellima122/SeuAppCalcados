document.addEventListener('DOMContentLoaded', function () {
    // Selecionando os elementos do DOM
    const formModelo = document.getElementById('formModelo');
    const tabelaModelosBody = document.getElementById('tabelaModelos');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const editModeloIdInput = document.getElementById('editModeloId');
    const formButton = formModelo.querySelector('button[type="submit"]');
    const formTitle = document.querySelector('.form-section h1');

    const apiUrl = 'http://127.0.0.1:8000/api/produtos/modelos/';
    const token = localStorage.getItem('authToken');

    // --- FUNÇÃO PARA CRIAR CABEÇALHOS DE AUTORIZAÇÃO ---
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

    // --- FUNÇÃO PARA LISTAR OS MODELOS ---
    function listarModelos() {
        tabelaModelosBody.innerHTML = ''; 

        fetch(apiUrl, { headers: getAuthHeaders(false) })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão inválida ou expirada. Por favor, faça login novamente.');
                    window.location.href = 'login.html';
                    throw new Error('Não autenticado');
                }
                if (!response.ok) {
                    throw new Error('Erro ao buscar dados dos modelos.');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    const tr = document.createElement('tr');
                    const td = document.createElement('td');
                    td.colSpan = 4; // Ocupa todas as 4 colunas
                    td.textContent = 'Nenhum modelo de produto cadastrado.';
                    td.style.textAlign = 'center';
                    tr.appendChild(td);
                    tabelaModelosBody.appendChild(tr);
                } else {
                    data.forEach(modelo => {
                        const tr = document.createElement('tr');
                        tr.setAttribute('data-id', modelo.id);
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
                }
            })
            .catch(error => {
                if (error.message !== 'Não autenticado') {
                    console.error('Erro ao buscar modelos:', error);
                }
            });
    }

    // --- FUNÇÃO PARA PREPARAR O FORMULÁRIO PARA EDIÇÃO ---
    function prepararEdicao(id) {
        fetch(`${apiUrl}${id}/`, { headers: getAuthHeaders(false) })
            .then(response => response.json())
            .then(data => {
                formTitle.textContent = 'Editar Modelo de Produto';
                document.getElementById('codigo_modelo').value = data.codigo_modelo;
                document.getElementById('nome_modelo').value = data.nome_modelo;
                document.getElementById('descricao').value = data.descricao;
                editModeloIdInput.value = data.id;
                formButton.textContent = 'Salvar Alterações';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
    }
    
    // --- FUNÇÃO PARA RESETAR O FORMULÁRIO ---
    function resetarFormulario() {
        formModelo.reset();
        editModeloIdInput.value = '';
        formButton.textContent = 'Adicionar Modelo';
        formTitle.textContent = 'Adicionar Novo Modelo de Produto';
        mensagemRetornoForm.innerHTML = '';
        mensagemRetornoForm.className = 'mensagem';
    }

    // --- EVENT LISTENER PARA O FORMULÁRIO (ADICIONAR E EDITAR) ---
    formModelo.addEventListener('submit', function (event) {
        event.preventDefault();
        const idParaEditar = editModeloIdInput.value;
        const dadosModelo = {
            codigo_modelo: document.getElementById('codigo_modelo').value,
            nome_modelo: document.getElementById('nome_modelo').value,
            descricao: document.getElementById('descricao').value
        };
        let url = apiUrl;
        let metodo = 'POST';

        if (idParaEditar) {
            url = `${apiUrl}${idParaEditar}/`;
            metodo = 'PUT';
        }

        fetch(url, {
            method: metodo,
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosModelo)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(dataObj => {
            const sucesso = (metodo === 'POST' && dataObj.status === 201) || (metodo === 'PUT' && dataObj.status === 200);
            if (sucesso) {
                const acao = (metodo === 'POST') ? 'adicionado' : 'atualizado';
                alert(`Modelo "${dataObj.body.nome_modelo}" ${acao} com sucesso!`);
                resetarFormulario();
                listarModelos();
            } else {
                let erroMsg = 'Erro ao salvar: ';
                for (const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `; }
                mensagemRetornoForm.innerHTML = erroMsg;
                mensagemRetornoForm.className = 'mensagem erro';
            }
        });
    });

    // --- EVENT LISTENER PARA A TABELA (EDITAR E EXCLUIR) ---
    tabelaModelosBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idModelo = linha.getAttribute('data-id');

        if (event.target.classList.contains('btn-editar')) {
            prepararEdicao(idModelo);
        }
        
        if (event.target.classList.contains('btn-excluir')) {
            if (confirm(`Tem certeza de que deseja excluir o modelo com ID ${idModelo}?`)) {
                fetch(`${apiUrl}${idModelo}/`, { method: 'DELETE', headers: getAuthHeaders(false) })
                    .then(response => {
                        if (response.status === 204) {
                            alert('Modelo excluído com sucesso!');
                            listarModelos();
                        } else {
                            response.json().then(data => alert(`Erro ao excluir: ${data.detail || 'Erro desconhecido.'}`));
                        }
                    });
            }
        }
    });

    // --- CHAMADA INICIAL ---
    listarModelos();
});