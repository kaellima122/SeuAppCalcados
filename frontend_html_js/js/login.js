document.addEventListener('DOMContentLoaded', function () {
    const formLogin = document.getElementById('formLogin');
    const mensagemRetornoDivLogin = document.getElementById('mensagemRetornoLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', function (event) {
            event.preventDefault();

            mensagemRetornoDivLogin.innerHTML = '';
            mensagemRetornoDivLogin.className = 'mensagem';

            const username = document.getElementById('usernameLogin').value;
            const password = document.getElementById('passwordLogin').value;

            if (!username || !password) {
                exibirMensagemLogin('Por favor, preencha o nome de usuário e a senha.', 'erro');
                return;
            }

            const dadosLogin = {
                username: username,
                password: password
            };

            fetch('http://127.0.0.1:8000/api/usuarios/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLogin)
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(dataObj => {
                if (dataObj.status === 200) {
                    // O login foi um sucesso!
                    // Primeiro, guardamos o token e o username.
                    localStorage.setItem('authToken', dataObj.body.token);
                    localStorage.setItem('username', dataObj.body.username);

                    // AGORA, REDIRECIONAMOS IMEDIATAMENTE.
                    window.location.href = 'dashboard.html';

                } else {
                    // Se o login falhar, mostramos o erro.
                    exibirMensagemLogin(dataObj.body.error || 'Ocorreu um erro ao tentar fazer login.', 'erro');
                }
            })
            .catch(error => {
                console.error('Erro na requisição fetch de login:', error);
                exibirMensagemLogin('Não foi possível conectar ao servidor. Tente novamente mais tarde.', 'erro');
            });
        });
    }

    function exibirMensagemLogin(mensagem, tipo) {
        if (mensagemRetornoDivLogin) {
            mensagemRetornoDivLogin.innerHTML = mensagem;
            mensagemRetornoDivLogin.className = 'mensagem';
            if (tipo === 'sucesso') {
                mensagemRetornoDivLogin.classList.add('sucesso');
            } else if (tipo === 'erro') {
                mensagemRetornoDivLogin.classList.add('erro');
            }
        }
    }
});