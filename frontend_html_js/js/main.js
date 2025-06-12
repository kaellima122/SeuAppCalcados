// Função para renderizar o menu de navegação principal
function renderizarNavbar() {
    // Encontra o elemento <header> no HTML que servirá como container para o menu
    const headerContainer = document.getElementById('main-header');
    if (!headerContainer) return; // Se não houver container na página, não faz nada

    // Pega o nome do usuário e o token do localStorage
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('authToken');

    let menuHtml = `
        <div class="nav-container">
            <a href="dashboard.html" class="nav-logo">Sistema Calçados</a>
            <nav class="nav-menu">
                <a href="dashboard.html">Dashboard</a>
                <a href="modelos.html">Modelos</a>
                <a href="materias_primas.html">Matérias-Primas</a>
                </nav>
            <div class="nav-user">
    `;

    if (token && username) {
        // Se o usuário está logado, mostra o nome e o botão de logout
        menuHtml += `
            <span class="nav-username">Olá, ${username}</span>
            <button id="logoutButtonNav">Sair</button>
        `;
    } else {
        // Se não está logado, mostra o botão de login
        menuHtml += `<a href="login.html" class="nav-login-btn">Login</a>`;
    }

    menuHtml += `
            </div>
        </div>
    `;

    headerContainer.innerHTML = menuHtml;

    // Adiciona a funcionalidade ao botão de logout do menu, se ele existir
    const logoutButtonNav = document.getElementById('logoutButtonNav');
    if (logoutButtonNav) {
        logoutButtonNav.addEventListener('click', function() {
            const headers = { 'Authorization': `Token ${token}` };
            // Chama a API de logout
            fetch('http://127.0.0.1:8000/api/usuarios/logout/', { method: 'POST', headers: headers })
                .finally(() => {
                    // Independentemente da resposta do servidor, limpa o localStorage e redireciona
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('username');
                    alert('Você foi desconectado.');
                    window.location.href = 'login.html';
                });
        });
    }
}

// Roda a função para renderizar o menu assim que o conteúdo da página carregar
document.addEventListener('DOMContentLoaded', renderizarNavbar);