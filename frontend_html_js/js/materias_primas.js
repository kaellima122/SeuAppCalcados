document.addEventListener('DOMContentLoaded', function() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const tabelaMateriasPrimasBody = document.getElementById('tabelaMateriasPrimas');
    const formMateriaPrima = document.getElementById('formMateriaPrima');
    const mensagemRetornoForm = document.getElementById('mensagemRetornoForm');
    const editMateriaPrimaIdInput = document.getElementById('editMateriaPrimaId');
    const formButton = formMateriaPrima.querySelector('button[type="submit"]');
    const formTitle = document.querySelector('.form-section h1');

    // --- CONFIGURAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const apiUrl = 'http://127.0.0.1:8000/api/produtos/materias-primas/';

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
    function listarMateriasPrimas() {
        const headers = getAuthHeaders(false);
        if (!headers) return;

        fetch(apiUrl, { headers: headers })
            .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar matérias-primas'))
            .then(data => {
                tabelaMateriasPrimasBody.innerHTML = '';
                data.forEach(materiaPrima => {
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-id', materiaPrima.id);

                    // --- CORREÇÃO AQUI: Construindo o HTML de forma segura ---
                    let linhaHtml = '';
                    linhaHtml += '<td>' + materiaPrima.id + '</td>';
                    linhaHtml += '<td>' + materiaPrima.codigo + '</td>';
                    linhaHtml += '<td>' + materiaPrima.nome + '</td>';
                    linhaHtml += '<td>' + materiaPrima.saldo_em_estoque + '</td>';
                    linhaHtml += '<td>' + materiaPrima.unidade_medida + '</td>';
                    linhaHtml += '<td><button class="btn-editar">Editar</button><button class="btn-excluir">Excluir</button></td>';

                    tr.innerHTML = linhaHtml;
                    tabelaMateriasPrimasBody.appendChild(tr);
                });
            }).catch(error => {
                console.error(error);
                tabelaMateriasPrimasBody.innerHTML = '<tr><td colspan="6" class="mensagem erro">Não foi possível carregar as matérias-primas.</td></tr>';
            });
    }

    function prepararEdicao(id) {
        fetch(apiUrl + id + '/', { headers: getAuthHeaders(false) })
            .then(res => res.json())
            .then(data => {
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

    function resetarFormulario() {
        formMateriaPrima.reset();
        editMateriaPrimaIdInput.value = '';
        formButton.textContent = 'Adicionar Matéria-Prima';
        formTitle.textContent = 'Adicionar Nova Matéria-Prima';
        mensagemRetornoForm.className = 'mensagem';
        mensagemRetornoForm.innerHTML = '';
    }

    // --- Event Listeners ---
    formMateriaPrima.addEventListener('submit', function(event) {
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
        let method = 'POST';
        if (idParaEditar) {
            url = apiUrl + idParaEditar + '/';
            method = 'PUT';
        }
        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(dadosMateriaPrima)
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(dataObj => {
            if (dataObj.status === 201 || dataObj.status === 200) {
                resetarFormulario();
                listarMateriasPrimas();
            } else {
                let erroMsg = "Erro: ";
                for(const campo in dataObj.body) { erroMsg += `${campo}: ${dataObj.body[campo].join(', ')} `; }
                mensagemRetornoForm.innerHTML = erroMsg;
                mensagemRetornoForm.className = 'mensagem erro';
            }
        });
    });

    tabelaMateriasPrimasBody.addEventListener('click', function(event) {
        const linha = event.target.closest('tr');
        if (!linha) return;
        const idMateriaPrima = linha.getAttribute('data-id');
        if (event.target.classList.contains('btn-editar')) {
            prepararEdicao(idMateriaPrima);
        } else if (event.target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir a matéria-prima ID ' + idMateriaPrima + '?')) {
                fetch(apiUrl + idMateriaPrima + '/', { method: 'DELETE', headers: getAuthHeaders(false) })
                    .then(response => {
                        if (response.status === 204) {
                            listarMateriasPrimas();
                        } else {
                            alert('Erro ao excluir. Verifique se este item não está em uso.');
                        }
                    });
            }
        }
    });

    // --- CHAMADA INICIAL ---
    listarMateriasPrimas();
});