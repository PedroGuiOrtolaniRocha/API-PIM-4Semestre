// Arquivo dedicado para lógica de login
console.log('Arquivo login.js carregado com sucesso');

// Preencher campos de login (para contas demo)
function fillLogin(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
}

// Função de login com validação via API
async function login(email, password) {
    console.log('Tentativa de login para:', email);
    
    try {
        // Fazer chamada para API de validação
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
            
            // Extrair dados do usuário da resposta
            const dadosUsuario = {
                email: email,
                role: resultado.user?.role || resultado.role || resultado.userRole,
                id: resultado.user?.id || resultado.userId || resultado.id
            };

            // Armazenar token e dados do usuário nos cookies e localStorage
            setCookie('authToken', resultado.token, 7);
            setCookie('usuarioAtual', JSON.stringify(dadosUsuario), 7);
            
            // Manter localStorage como fallback
            localStorage.setItem('authToken', resultado.token);
            localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));

            console.log('Token e dados do usuário armazenados nos cookies e localStorage');
            console.log('Usuário logado:', dadosUsuario);
            
            // Redirecionar baseado no role
            const mapaPaginas = {
                'User': 'colaborador.html',
                'Technician': 'tecnico.html', 
                'Admin': 'admin.html'
            };
            
            const paginaDestino = mapaPaginas[dadosUsuario.role];
            if (paginaDestino) {
                console.log('Redirecionando para:', paginaDestino);
                
                // Forçar persistência do localStorage
                try {
                    localStorage.setItem('authToken', resultado.token);
                    localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));
                    
                    // Verificar se realmente foi salvo
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
                    
                    // Adicionar flag para evitar loop
                    sessionStorage.setItem('loginRedirect', 'true');
                    
                    console.log('🔄 Executando redirecionamento...');
                    setTimeout(() => {
                        window.location.replace(paginaDestino);
                    }, 5000);
                    
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

// Configurar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIALIZANDO PÁGINA DE LOGIN ===');
    
    // Configurar evento de submit do formulário
    const formularioLogin = document.getElementById('login-form');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            login(email, password);
        });
    }
    
    // REMOVIDO: Redirecionamento automático para evitar loops
    console.log('✅ Página de login carregada - aguardando ação do usuário');
    
    const token = localStorage.getItem('authToken');
    const usuario = localStorage.getItem('usuarioAtual');
    
    if (token && usuario) {
        console.log('ℹ️ Usuário já possui sessão ativa, mas permanecendo na tela de login');
        console.log('Para acessar o sistema, faça login novamente ou acesse diretamente a página desejada');
    }
});