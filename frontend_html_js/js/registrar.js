// Aguarda o conteúdo da página ser totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona o formulário de registro pelo ID
    const formRegistro = document.getElementById('formRegistro');
    // Seleciona a div onde as mensagens de retorno serão exibidas
    const mensagemRetornoDiv = document.getElementById('mensagemRetorno');

    // Adiciona um "ouvinte" para o evento de 'submit' (envio) do formulário
    formRegistro.addEventListener('submit', function (event) {
        // Previne o comportamento padrão do formulário (que seria recarregar a página)
        event.preventDefault();

        // Limpa mensagens anteriores
        mensagemRetornoDiv.innerHTML = '';
        mensagemRetornoDiv.className = 'mensagem'; // Reseta classes

        // Coleta os dados do formulário
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const perfilId = document.getElementById('perfilId').value;

        // Validação simples (campos obrigatórios)
        if (!username || !email || !password || !perfilId) {
            exibirMensagem('Por favor, preencha todos os campos obrigatórios (Nome de Usuário, Email, Senha e ID do Perfil).', 'erro');
            return;
        }

        // Monta o objeto de dados para enviar como JSON
        const dadosUsuario = {
            username: username,
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            perfil_id: parseInt(perfilId) // Converte perfilId para número inteiro
        };

        // Faz a requisição POST para a API usando fetch
        fetch('http://127.0.0.1:8000/api/usuarios/registrar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Não precisamos de X-CSRFToken aqui porque a view Django está com @csrf_exempt
                // e o CORS está configurado para permitir credenciais se necessário para futuras requisições de sessão
            },
            body: JSON.stringify(dadosUsuario) // Converte o objeto JavaScript para uma string JSON
        })
        .then(response => {
            // O primeiro .then() trata a resposta HTTP inicial
            // response.json() também retorna uma Promise, por isso o próximo .then()
            return response.json().then(data => ({ status: response.status, body: data }));
        })
        .then(dataObj => {
            // O segundo .then() trata os dados JSON da resposta
            if (dataObj.status === 201) { // 201 Created - Sucesso!
                exibirMensagem(dataObj.body.message || 'Usuário registrado com sucesso!', 'sucesso');
                formRegistro.reset(); // Limpa o formulário
                // Opcional: redirecionar para a página de login após um tempo
                // setTimeout(() => {
                //     window.location.href = 'login.html';
                // }, 2000);
            } else {
                // Se o status não for 201, consideramos um erro vindo da API
                // A API deve retornar um JSON com uma chave 'error'
                exibirMensagem(dataObj.body.error || 'Ocorreu um erro ao registrar.', 'erro');
            }
        })
        .catch(error => {
            // Trata erros de rede ou falhas na requisição fetch em si
            console.error('Erro na requisição fetch:', error);
            exibirMensagem('Não foi possível conectar ao servidor. Tente novamente mais tarde.', 'erro');
        });
    });

    // Função auxiliar para exibir mensagens na div de retorno
    function exibirMensagem(mensagem, tipo) {
        mensagemRetornoDiv.innerHTML = mensagem;
        mensagemRetornoDiv.className = 'mensagem'; // Reseta classes
        if (tipo === 'sucesso') {
            mensagemRetornoDiv.classList.add('sucesso');
        } else if (tipo === 'erro') {
            mensagemRetornoDiv.classList.add('erro');
        }
    }
});