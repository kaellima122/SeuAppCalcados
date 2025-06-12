// Função para renderizar o menu de navegação principal
function renderizarNavbar() {
    // Encontra o elemento <header> no HTML que servirá como container para o menu
    const headerContainer = document.getElementById('main-header');
    if (!headerContainer) return;

    // Pega o nome do usuário e o token do localStorage
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('authToken');

    let navLinks = '';
    let userActions = '';
    let logoLink = 'login.html'; 

    // Verifica se o usuário ESTÁ logado
    if (token && username) {
        logoLink = 'dashboard.html';

        // Monta os links de navegação para um usuário logado
        navLinks = `
            <nav class="nav-menu">
                <a href="dashboard.html">Dashboard</a>
                <a href="modelos.html">Modelos</a>
                <a href="materias_primas.html">Matérias-Primas</a>
                <a href="fornecedores.html">Fornecedores</a> <a href="ordens_producao.html">Ordens de Produção</a>
            </nav>
        `;

        // Monta a área do usuário com nome e botão de sair
        userActions = `
            <div class="nav-user">
                <span class="nav-username">Olá, ${username}</span>
                <button id="logoutButtonNav">Sair</button>
            </div>
        `;
    } 
    // Se o usuário NÃO está logado
    else {
        navLinks = '<nav class="nav-menu"></nav>';
        
        if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('registrar.html')) {
            userActions = '<div class="nav-user"></div>';
        } else {
            userActions = `
                <div class="nav-user">
                    <a href="login.html" class="nav-login-btn">Login</a>
                </div>
            `;
        }
    }

    // Junta todas as partes para formar o HTML final do menu
    const menuHtml = `
        <div class="nav-container">
            <a href="${logoLink}" class="nav-logo">Sistema Calçados</a>
            ${navLinks}
            ${userActions}
        </div>
    `;

    headerContainer.innerHTML = menuHtml;

    // Adiciona a funcionalidade ao botão de logout do menu, se ele existir
    const logoutButtonNav = document.getElementById('logoutButtonNav');
    if (logoutButtonNav) {
        logoutButtonNav.addEventListener('click', function() {
            const currentToken = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Token ${currentToken}` };
            
            fetch('http://127.0.0.1:8000/api/usuarios/logout/', { method: 'POST', headers: headers })
                .finally(() => {
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