document.addEventListener('DOMContentLoaded', function () {
    // === VARIÁVEIS GLOBAIS E SELETORES DO DOM ===
    const fichaTecnicaForm = document.getElementById('fichaTecnicaForm');
    const produtoModeloSelect = document.getElementById('produtoModelo');
    const descricaoInput = document.getElementById('descricao');
    const itensContainer = document.getElementById('itens-container');
    const formTitle = document.getElementById('form-title');
    const btnAdicionarItem = document.getElementById('btnAdicionarItem');

    const token = localStorage.getItem('authToken');
    const apiUrlBase = 'http://127.0.0.1:8000/api';
    
    const urlParams = new URLSearchParams(window.location.search);
    const fichaTecnicaId = urlParams.get('id');

    let materiasPrimasDisponiveis = [];
    
    // === LÓGICA PRINCIPAL (INICIALIZAÇÃO) ===
    if (!token) {
        alert('Você não está autenticado. Por favor, faça login.');
        window.location.href = 'login.html';
        return;
    }
    
    inicializarFormulario();
    
    // === FUNÇÕES DE LÓGICA DE NEGÓCIO ===
    async function inicializarFormulario() {
        await Promise.all([
            carregarModelos(),
            carregarMateriasPrimas()
        ]);

        if (fichaTecnicaId) {
            formTitle.textContent = 'Editar Ficha Técnica';
            carregarFichaParaEdicao(fichaTecnicaId);
        }
    }

    async function carregarModelos() {
        try {
            const response = await fetch(`${apiUrlBase}/produtos/modelos/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao carregar modelos.');
            const modelos = await response.json();
            produtoModeloSelect.innerHTML = '<option value="">Selecione um modelo</option>'; 
            modelos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo.id;
                option.textContent = `${modelo.codigo_modelo} - ${modelo.nome_modelo}`;
                produtoModeloSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
        }
    }

    async function carregarMateriasPrimas() {
        try {
            const response = await fetch(`${apiUrlBase}/produtos/materias-primas/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao carregar matérias-primas.');
            materiasPrimasDisponiveis = await response.json();
        } catch (error) {
            console.error('Erro ao carregar matérias-primas:', error);
        }
    }

    async function carregarFichaParaEdicao(id) {
        try {
            const response = await fetch(`${apiUrlBase}/produtos/fichas-tecnicas/${id}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Não foi possível carregar os dados da ficha técnica para edição.');
            const ficha = await response.json();
            
            setTimeout(() => {
                produtoModeloSelect.value = ficha.produto_modelo;
                descricaoInput.value = ficha.descricao;
                itensContainer.innerHTML = '';
                ficha.itens.forEach(item => {
                    adicionarNovaLinhaItem(item);
                });
            }, 0);
        } catch (error) {
            console.error('Erro ao carregar ficha para edição:', error);
            window.location.href = 'fichas_tecnicas.html';
        }
    }
    
    // ==========================================================
    // === ATUALIZAÇÃO FINAL NA FUNÇÃO handleSubmit =============
    // ==========================================================
    async function handleSubmit(event) {
        event.preventDefault();

        const itens = [];
        const itemRows = document.querySelectorAll('.item-row');
        itemRows.forEach(row => {
            const materiaPrimaId = row.querySelector('.item-materia-prima').value;
            const quantidade = row.querySelector('.item-quantidade').value;
            if (materiaPrimaId && quantidade) {
                itens.push({
                    materia_prima: parseInt(materiaPrimaId),
                    quantidade: quantidade
                });
            }
        });

        if (itens.length === 0) {
            alert('Você precisa adicionar pelo menos uma matéria-prima à ficha técnica.');
            return;
        }

        const payload = {
            produto_modelo: parseInt(produtoModeloSelect.value),
            descricao: descricaoInput.value,
            itens_para_cadastrar: itens
        };

        // --- LÓGICA INTELIGENTE AQUI ---
        let method;
        let url;

        if (fichaTecnicaId) {
            // MODO EDIÇÃO
            method = 'PUT'; // Usamos PUT para substituir o objeto inteiro
            url = `${apiUrlBase}/produtos/fichas-tecnicas/${fichaTecnicaId}/`;
        } else {
            // MODO CRIAÇÃO
            method = 'POST';
            url = `${apiUrlBase}/produtos/fichas-tecnicas/`;
        }
        // --- FIM DA LÓGICA INTELIGENTE ---

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const acao = fichaTecnicaId ? 'atualizada' : 'salva';
                alert(`Ficha técnica ${acao} com sucesso!`);
                window.location.href = 'fichas_tecnicas.html';
            } else {
                const errorData = await response.json();
                let errorMessage = 'Ocorreu um erro ao salvar.\n';
                for (const key in errorData) {
                    errorMessage += `${key}: ${errorData[key]}\n`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            alert('Não foi possível se comunicar com o servidor.');
        }
    }

    // === FUNÇÕES AUXILIARES / RENDERIZAÇÃO ===
    function adicionarNovaLinhaItem(item = null) {
        const newRow = document.createElement('div');
        newRow.className = 'item-row';
        let selectOptions = '<option value="">Selecione...</option>';
        materiasPrimasDisponiveis.forEach(mp => {
            selectOptions += `<option value="${mp.id}">${mp.codigo} - ${mp.nome}</option>`;
        });
        newRow.innerHTML = `
            <div class="form-group-item">
                <select name="materia_prima" class="item-materia-prima" required>${selectOptions}</select>
                <input type="number" name="quantidade" class="item-quantidade" placeholder="Quantidade" required step="0.0001">
                <button type="button" class="btn-remover-item">&times;</button>
            </div>
        `;
        itensContainer.appendChild(newRow);
        if (item) {
            newRow.querySelector('.item-materia-prima').value = item.materia_prima;
            newRow.querySelector('.item-quantidade').value = item.quantidade;
        }
        newRow.querySelector('.btn-remover-item').addEventListener('click', () => newRow.remove());
    }

    // === EVENT LISTENERS ===
    btnAdicionarItem.addEventListener('click', () => adicionarNovaLinhaItem());
    fichaTecnicaForm.addEventListener('submit', handleSubmit);
});