console.log('Arquivo login.js carregado com sucesso');

function fillLogin(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
}

async function login(email, password) {
    console.log('Tentativa de login para:', email);
    
    try {
        console.log('Enviando credenciais para validação...');
        
        const credenciais = {
            email: email,
            password: password
        };
        
        const response = await fetch('http://localhost:5262/User/validateCredentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credenciais)
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('Resposta da API:', resultado);
        
        if (resultado.token) {
            console.log('Login bem-sucedido para:', email);
            
            const dadosUsuario = {
                email: email,
                role: resultado.user?.role || resultado.role || resultado.userRole,
                id: resultado.user?.id || resultado.userId || resultado.id
            };

            setCookie('authToken', resultado.token, 7);
            setCookie('usuarioAtual', JSON.stringify(dadosUsuario), 7);
            
            localStorage.setItem('authToken', resultado.token);
            localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));

            console.log('Token e dados do usuário armazenados nos cookies e localStorage');
            console.log('Usuário logado:', dadosUsuario);
            
            const mapaPaginas = {
                'User': 'colaborador.html',
                'Technician': 'tecnico.html', 
                'Admin': 'admin.html'
            };
            
            const paginaDestino = mapaPaginas[dadosUsuario.role];
            if (paginaDestino) {
                console.log('Redirecionando para:', paginaDestino);
                
                try {
                    localStorage.setItem('authToken', resultado.token);
                    localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));
                    
                    const tokenVerificacao = localStorage.getItem('authToken');
                    const usuarioVerificacao = localStorage.getItem('usuarioAtual');
                    
                    console.log('� Verificação final antes do redirecionamento:');
                    console.log('- Token salvo:', tokenVerificacao);
                    console.log('- Usuário salvo:', usuarioVerificacao);
                    
                    if (!tokenVerificacao || !usuarioVerificacao) {
                        console.error('❌ Erro: dados não foram salvos no localStorage');
                        alert('Erro interno: não foi possível salvar dados de autenticação');
                        return;
                    }
                    
                    sessionStorage.setItem('loginRedirect', 'true');
                    
                    console.log('🔄 Executando redirecionamento...');
                    window.location.replace(paginaDestino);
                    
                    
                } catch (error) {
                    console.error('❌ Erro ao salvar no localStorage:', error);
                    alert('Erro interno: problema com armazenamento local');
                }
            } else {
                console.error('Role não reconhecido:', dadosUsuario.role);
                alert('Erro: Role do usuário não reconhecido');
            }
        } else {
            console.log('Credenciais inválidas - token ausente');
            alert('Credenciais inválidas!');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIALIZANDO PÁGINA DE LOGIN ===');
    
    const formularioLogin = document.getElementById('login-form');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            login(email, password);
        });
    }
    
    console.log('✅ Página de login carregada - aguardando ação do usuário');
    
    const token = localStorage.getItem('authToken');
    const usuario = localStorage.getItem('usuarioAtual');
    
    if (token && usuario) {
        console.log('ℹ️ Usuário já possui sessão ativa, mas permanecendo na tela de login');
        console.log('Para acessar o sistema, faça login novamente ou acesse diretamente a página desejada');
    }
});