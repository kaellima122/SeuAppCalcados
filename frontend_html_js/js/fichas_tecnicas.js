document.addEventListener('DOMContentLoaded', function() {
    const listaContainer = document.getElementById('listaFichasTecnicas');
    const token = localStorage.getItem('authToken');
    const apiUrl = 'http://127.0.0.1:8000/api/produtos/fichas-tecnicas/';

    if (!token) {
        alert('Você não está autenticado. Por favor, faça login.');
        window.location.href = 'login.html';
        return;
    }

    const headers = { 'Authorization': 'Token ' + token };

    // Busca e lista as Fichas Técnicas
    fetch(apiUrl, { headers: headers })
        .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar dados.'))
        .then(data => {
            if (data.length === 0) {
                listaContainer.innerHTML = '<p>Nenhuma ficha técnica encontrada.</p>';
                return;
            }

            listaContainer.innerHTML = ''; 

            data.forEach(ficha => {
                let itensHtml = '';
                if (ficha.itens && ficha.itens.length > 0) {
                    ficha.itens.forEach(item => {
                        const nome = item.materia_prima_nome || 'Nome Indisponível';
                        const quantidade = parseFloat(item.quantidade).toFixed(4);
                        const unidade = item.unidade_medida || 'N/D';
                        itensHtml += `<li><span>${nome}</span><span>${quantidade} ${unidade}</span></li>`;
                    });
                } else {
                    itensHtml = '<li>Nenhum componente cadastrado.</li>';
                }

                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-id', ficha.id);

                const nomeDoModelo = ficha.produto_modelo_nome || 'Modelo não definido';

                card.innerHTML = `
                    <div class="card-header">
                        <h3>${nomeDoModelo}</h3>
                        <p>ID da Ficha: ${ficha.id}</p>
                    </div>
                    <div class="card-body">
                        <h4>Componentes:</h4>
                        <ul>${itensHtml}</ul>
                    </div>
                    <div class="card-footer">
                        <a href="ficha_tecnica_form.html?id=${ficha.id}" class="btn-editar">Editar</a>
                        <button class="btn-excluir">Excluir</button>
                    </div>
                `;

                listaContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro ao processar Fichas Técnicas:', error);
            listaContainer.innerHTML = '<p class="mensagem erro">Não foi possível carregar as fichas técnicas.</p>';
        });

    // Lógica para o botão Excluir
    listaContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-excluir')) {
            const confirmou = window.confirm('Tem certeza que deseja excluir esta ficha técnica? Esta ação não pode ser desfeita.');

            if (confirmou) {
                const card = event.target.closest('.card');
                const fichaId = card.dataset.id;
                excluirFichaTecnica(fichaId, card);
            }
        }
    });

    // Função que faz a exclusão via API
    async function excluirFichaTecnica(id, cardElement) {
        try {
            const response = await fetch(`${apiUrl}${id}/`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                alert('Ficha técnica excluída com sucesso.');
                cardElement.remove();
            } else {
                alert('Não foi possível excluir a ficha técnica.');
            }
        } catch (error) {
            alert('Erro de comunicação com o servidor ao tentar excluir.');
        }
    }
});