document.addEventListener('DOMContentLoaded', function() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const tabelaFornecedoresBody = document.getElementById('tabelaFornecedores');
    const formFornecedor = document.getElementById('formFornecedor');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const editFornecedorIdInput = document.getElementById('editFornecedorId');
    const formButton = formFornecedor.querySelector('button[type="submit"]');
    const formTitle = document.getElementById('formFornecedorTitulo');

    // --- CONFIGURAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const apiUrl = 'http://127.0.0.1:8000/api/produtos/fornecedores/';

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

    // --- FUNÇÕES DE LÓGICA E API ---
    function listarFornecedores() {
        const headers = getAuthHeaders(false);
        if (!headers) return;
        fetch(apiUrl, { headers: headers })
            .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar fornecedores'))
            .then(data => {
                tabelaFornecedoresBody.innerHTML = '';
                data.forEach(fornecedor => {
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-id', fornecedor.id);
                    let linhaHtml = '<td>' + fornecedor.id + '</td>';
                    linhaHtml += '<td>' + fornecedor.nome_razao_social + '</td>';
                    linhaHtml += '<td>' + fornecedor.cnpj + '</td>';
                    linhaHtml += '<td>' + (fornecedor.email || '---') + '</td>';
                    linhaHtml += '<td>' + (fornecedor.telefone || '---') + '</td>';
                    linhaHtml += '<td><button class="btn-editar">Editar</button><button class="btn-excluir">Excluir</button></td>';
                    tr.innerHTML = linhaHtml;
                    tabelaFornecedoresBody.appendChild(tr);
                });
            }).catch(error => {
                console.error(error);
                tabelaFornecedoresBody.innerHTML = '<tr><td colspan="6" class="mensagem erro">Não foi possível carregar os fornecedores.</td></tr>';
            });
    }

    function prepararEdicao(id) {
        fetch(apiUrl + id + '/', { headers: getAuthHeaders(false) })
            .then(res => res.json())
            .then(data => {
                formTitle.textContent = 'Editar Fornecedor';
                document.getElementById('nome_razao_social').value = data.nome_razao_social;
                document.getElementById('cnpj').value = data.cnpj;
                document.getElementById('email').value = data.email || '';
                document.getElementById('telefone').value = data.telefone || '';
                editFornecedorIdInput.value = data.id;
                formButton.textContent = 'Salvar Alterações';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
    }
    
    function resetarFormulario() {
        formFornecedor.reset();
        editFornecedorIdInput.value = '';
        formButton.textContent = 'Adicionar Fornecedor';
        formTitle.textContent = 'Adicionar Novo Fornecedor';
        mensagemRetornoForm.className = 'mensagem';
        mensagemRetornoForm.innerHTML = '';
    }

    // Event Listener para o Formulário (Adicionar e Editar)
    formFornecedor.addEventListener('submit', function(event) {
        event.preventDefault();
        const idParaEditar = editFornecedorIdInput.value;
        const dadosFornecedor = {
            nome_razao_social: document.getElementById('nome_razao_social').value,
            cnpj: document.getElementById('cnpj').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
        };
        let url = apiUrl;
        let method = 'POST';
        if (idParaEditar) {
            url = apiUrl + idParaEditar + '/';
            method = 'PUT';
        }
        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosFornecedor)
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(dataObj => {
            if (dataObj.status === 201 || dataObj.status === 200) {
                resetarFormulario();
                listarFornecedores();
            } else {
                let erroMsg = "Erro: ";
                for(const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `; }
                mensagemRetornoForm.innerHTML = erroMsg;
                mensagemRetornoForm.className = 'mensagem erro';
            }
        });
    });

    // Event Listener para a Tabela (Editar e Excluir)
    tabelaFornecedoresBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idFornecedor = linha.getAttribute('data-id');
        
        if (event.target.classList.contains('btn-editar')) {
            prepararEdicao(idFornecedor);
        } else if (event.target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir o fornecedor ID ' + idFornecedor + '?')) {
                fetch(apiUrl + idFornecedor + '/', { method: 'DELETE', headers: getAuthHeaders(false) })
                    .then(response => {
                        if (response.status === 204) {
                            alert('Fornecedor excluído com sucesso!');
                            listarFornecedores();
                        } else {
                            // Se houver um erro (como ProtectedError), a API retorna um JSON
                            response.json().then(data => {
                                alert('Erro ao excluir: ' + (data.detail || 'Verifique se este fornecedor não está em uso.'));
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Erro de rede ao excluir:', error);
                        alert('Erro de conexão ao tentar excluir.');
                    });
            }
        }
    });

    // --- CHAMADA INICIAL ---
    listarFornecedores();
});