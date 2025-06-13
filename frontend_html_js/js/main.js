// Função para renderizar o menu de navegação principal
function renderizarNavbar() {
    const headerContainer = document.getElementById('main-header');
    if (!headerContainer) return;

    const username = localStorage.getItem('username');
    const token = localStorage.getItem('authToken');

    let navLinks = '';
    let userActions = '';
    let logoLink = 'login.html';

    // NOVO: Botão Hambúrguer para telas móveis
    const hamburgerBtn = `<button id="hamburger-btn" aria-label="Abrir menu">☰</button>`;

    if (token && username) {
        logoLink = 'dashboard.html';
        navLinks = `
            <nav class="nav-menu" id="nav-menu-links">
                <a href="dashboard.html">Dashboard</a>
                <a href="modelos.html">Modelos</a>
                <a href="materias_primas.html">Matérias-Primas</a>
                <a href="fornecedores.html">Fornecedores</a>
                <a href="fichas_tecnicas.html">Fichas Técnicas</a>
                <a href="ordens_producao.html">Ordens de Produção</a>
            </nav>`;
        userActions = `
            <div class="nav-user">
                <span class="nav-username">Olá, ${username}</span>
                <button id="logoutButtonNav">Sair</button>
            </div>`;
    } else {
        navLinks = '<nav class="nav-menu" id="nav-menu-links"></nav>';
        userActions = `<div class="nav-user"><a href="login.html" class="nav-login-btn">Login</a></div>`;
    }

    // Monta o HTML final, agora incluindo o botão hambúrguer
    const menuHtml = `
        <div class="nav-container">
            <a href="${logoLink}" class="nav-logo">Sistema Calçados</a>
            ${navLinks}
            ${userActions}
            ${hamburgerBtn} 
        </div>`;

    headerContainer.innerHTML = menuHtml;

    // --- LÓGICA DO MENU HAMBÚRGUER ---
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu-links');

    if(hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('menu-aberto'); // Adiciona/remove a classe que mostra o menu
        });
    }

    // Adiciona a funcionalidade ao botão de logout do menu, se ele existir
    const logoutButtonNav = document.getElementById('logoutButtonNav');
    if (logoutButtonNav) {
        logoutButtonNav.addEventListener('click', function() {
            // ... (lógica de logout permanece a mesma)
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', renderizarNavbar);