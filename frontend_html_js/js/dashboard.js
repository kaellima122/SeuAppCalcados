document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');

    // Define uma mensagem de boas-vindas genérica
    mensagemBoasVindas.textContent = 'Bem-vindo ao seu painel de controle.';

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Faz a requisição POST para a API de logout
            fetch('http://127.0.0.1:8000/api/usuarios/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // LINHA CRUCIAL ADICIONADA AQUI:
                // Diz ao navegador para enviar cookies (como o de sessão)
                // mesmo em requisições de origens diferentes.
                credentials: 'include', 
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(dataObj => {
                // Mostra a mensagem de sucesso ou erro vinda do servidor
                alert(dataObj.body.message || 'Você foi desconectado.'); 
                
                // Redireciona o usuário para a página de login após o logout
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Erro na requisição de logout:', error);
                alert('Ocorreu um erro ao tentar fazer logout.');
                // Mesmo com erro, tentamos redirecionar para o login
                window.location.href = 'login.html';
            });
        });
    }
});