document.addEventListener('DOMContentLoaded', function () {
    const formLogin = document.getElementById('formLogin');
    const mensagemRetornoDivLogin = document.getElementById('mensagemRetornoLogin');

    formLogin.addEventListener('submit', function (event) {
        event.preventDefault(); // Previne o envio padrão do formulário

        // Limpa mensagens anteriores
        mensagemRetornoDivLogin.innerHTML = '';
        mensagemRetornoDivLogin.className = 'mensagem'; // Reseta classes

        const username = document.getElementById('usernameLogin').value;
        const password = document.getElementById('passwordLogin').value;

        if (!username || !password) {
            exibirMensagemLogin('Por favor, preencha o nome de usuário e a senha.', 'erro');
            return;
        }

        const dadosLogin = {
            username: username, // O backend espera 'username'
            password: password
        };

        fetch('http://127.0.0.1:8000/api/usuarios/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosLogin)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(dataObj => {
            if (dataObj.status === 200) { // 200 OK para login bem-sucedido
                exibirMensagemLogin(`Login bem-sucedido! Bem-vindo, ${dataObj.body.username}! Perfil: ${dataObj.body.perfil || 'Não definido'}`, 'sucesso');
                formLogin.reset();
                // Opcional: Redirecionar para uma página de painel/dashboard
                // Por exemplo, após 2 segundos:
                // setTimeout(() => {
                //     window.location.href = 'dashboard.html'; // (dashboard.html precisaria ser criada)
                // }, 2000);
            } else {
                exibirMensagemLogin(dataObj.body.error || 'Ocorreu um erro ao tentar fazer login.', 'erro');
            }
        })
        .catch(error => {
            console.error('Erro na requisição fetch de login:', error);
            exibirMensagemLogin('Não foi possível conectar ao servidor. Tente novamente mais tarde.', 'erro');
        });
    });

    function exibirMensagemLogin(mensagem, tipo) {
        mensagemRetornoDivLogin.innerHTML = mensagem;
        mensagemRetornoDivLogin.className = 'mensagem'; // Reseta classes
        if (tipo === 'sucesso') {
            mensagemRetornoDivLogin.classList.add('sucesso');
        } else if (tipo === 'erro') {
            mensagemRetornoDivLogin.classList.add('erro');
        }
    }
});