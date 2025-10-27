// Configuração da API
const API_BASE_URL = 'http://localhost:5262';

// Debug - verificar se o arquivo está carregando
console.log('Arquivo comum.js carregado com sucesso');

// Funções para manipular cookies
function setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    console.log('🍪 Cookie definido:', name);
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
            console.log('🍪 Cookie lido:', name, '=', value);
            return value;
        }
    }
    console.log('🍪 Cookie não encontrado:', name);
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    console.log('🗑️ Cookie removido:', name);
}

function debugCookies() {
    console.log('🍪 DEBUG - Todos os cookies:');
    const cookies = document.cookie.split(';');
    if (cookies.length === 1 && cookies[0] === '') {
        console.log('- Nenhum cookie encontrado');
    } else {
        cookies.forEach((cookie, index) => {
            const [name, value] = cookie.trim().split('=');
            console.log(`- ${name}: ${decodeURIComponent(value || '')}`);
        });
    }
}

// Funções utilitárias
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar notificação toast simples
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background-color: ${tipo === 'success' ? '#27ae60' : tipo === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        max-width: 300px;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function obterClasseStatus(status) {
    switch (status?.toLowerCase()) {
        case 'aberto':
            return 'pending';
        case 'em andamento':
            return 'in-progress';
        case 'fechado':
            return 'closed';
        default:
            return 'active';
    }
}

// Funções de API
async function chamarAPI(endpoint, metodo = 'GET', dados = null) {
    const config = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Adicionar token JWT se disponível (primeiro tenta cookies, depois localStorage)
    const token = getCookie('authToken') || localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Token JWT adicionado à requisição (fonte:', getCookie('authToken') ? 'cookie' : 'localStorage', ')');
    }
    
    if (dados) {
        config.body = JSON.stringify(dados);
    }
    
    try {
        console.log(`Fazendo chamada ${metodo} para ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Verificar se o token expirou
        if (response.status === 401) {
            console.log('Token JWT expirado ou inválido - fazendo logout');
            mostrarMensagem('Sessão expirada. Faça login novamente.', 'error');
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('Resposta da API recebida:', resultado);
        return resultado;
    } catch (error) {
        console.error('Falha na chamada da API:', error);
        mostrarMensagem('Erro na comunicação com o servidor', 'error');
        throw error;
    }
}

// Funções de modal
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        console.log(`Modal ${modalId} aberto`);
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log(`Modal ${modalId} fechado`);
    }
}

// Configurar fechamento de modais
document.addEventListener('DOMContentLoaded', () => {
    // Fechar modais clicando fora
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // Fechar modais clicando no X
    document.querySelectorAll('.close').forEach(botaoFechar => {
        botaoFechar.onclick = () => {
            botaoFechar.closest('.modal').style.display = 'none';
        };
    });
});

// Função de logout
function logout() {
    console.log('🚪 Fazendo logout...');
    
    // Limpar cookies de autenticação
    deleteCookie('authToken');
    deleteCookie('usuarioAtual');
    
    // Limpar também localStorage e sessionStorage como fallback
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Dados e token JWT limpos - redirecionando para login');
    
    // Redirecionar para login
    window.location.href = 'index.html';
}

// Verificar se o usuário está autenticado (apenas para logs, sem redirecionamento)
function verificarAutenticacao() {
    console.log('🔍 Verificando autenticação...');
    console.log('📍 URL atual:', window.location.href);
    
    // Verificar cookies primeiro, depois localStorage como fallback
    const tokenCookie = getCookie('authToken');
    const usuarioCookie = getCookie('usuarioAtual');
    const tokenLocal = localStorage.getItem('authToken');
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    
    const token = tokenCookie || tokenLocal;
    const usuario = usuarioCookie || usuarioLocal;
    
    console.log('📊 Estado da autenticação:');
    console.log('- Token (cookie):', !!tokenCookie);
    console.log('- Token (localStorage):', !!tokenLocal);
    console.log('- Usuário (cookie):', !!usuarioCookie);
    console.log('- Usuário (localStorage):', !!usuarioLocal);
    console.log('- Token ativo:', token ? token.substring(0, 50) + '...' : 'null');
    
    if (usuario) {
        try {
            const dadosUsuario = JSON.parse(usuario);
            console.log('- Dados do usuário:', dadosUsuario);
        } catch (error) {
            console.error('❌ Erro ao parsear dados do usuário:', error);
        }
    }
    
    if (!token || !usuario) {
        console.log('⚠️ Usuário não autenticado - continuando sem redirecionamento');
        return false;
    }
    
    console.log('✅ Usuário autenticado com sucesso');
    return true;
}

// Função de debug para testar armazenamento
function debugStorage() {
    console.log('🔍 DEBUG - Estado completo do armazenamento:');
    
    // Debug cookies
    debugCookies();
    
    // Debug localStorage
    console.log('📦 localStorage:');
    console.log('- Todas as chaves:', Object.keys(localStorage));
    console.log('- authToken:', localStorage.getItem('authToken'));
    console.log('- usuarioAtual:', localStorage.getItem('usuarioAtual'));
    
    // Debug sessionStorage
    console.log('🗂️ sessionStorage:');
    console.log('- loginRedirect:', sessionStorage.getItem('loginRedirect'));
    
    console.log('🌐 URL atual:', window.location.href);
    
    // Tentar parsear dados do usuário
    const usuarioCookie = getCookie('usuarioAtual');
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    const usuario = usuarioCookie || usuarioLocal;
    
    if (usuario) {
        try {
            const user = JSON.parse(usuario);
            console.log('👤 Dados do usuário parseados:', user);
        } catch (e) {
            console.log('❌ Erro ao parsear usuário:', e);
        }
    }
}

// Função para simular login (para debug/teste)
function simularLogin(email, role) {
    console.log('🧪 Simulando login para debug:', email, role);
    
    const dadosUsuario = {
        email: email,
        role: role,
        id: role === 'User' ? 1 : role === 'Technician' ? 2 : 3
    };
    
    const tokenFake = 'fake-jwt-token-' + Date.now();
    
    // Salvar em cookies (preferencial)
    setCookie('authToken', tokenFake, 7);
    setCookie('usuarioAtual', JSON.stringify(dadosUsuario), 7);
    
    // Salvar também em localStorage como fallback
    localStorage.setItem('authToken', tokenFake);
    localStorage.setItem('usuarioAtual', JSON.stringify(dadosUsuario));
    
    console.log('✅ Dados de teste salvos em cookies e localStorage');
    console.log('Token:', tokenFake);
    console.log('Usuário:', dadosUsuario);
    
    mostrarMensagem('Login simulado com sucesso! Recarregue a página.', 'success');
}

// Função para limpar todo o armazenamento
function limparStorage() {
    console.log('🧹 Limpando todo o armazenamento...');
    
    // Limpar cookies
    deleteCookie('authToken');
    deleteCookie('usuarioAtual');
    
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Todo o armazenamento limpo');
    mostrarMensagem('Armazenamento limpo com sucesso!', 'success');
}

// Exportar funções globais
window.suporteAPI = {
    abrirModal,
    fecharModal,
    // Manter compatibilidade com nomes antigos
    openModal: abrirModal,
    closeModal: fecharModal,
    logout,
    mostrarMensagem,
    chamarAPI,
    formatarData,
    obterClasseStatus,
    verificarAutenticacao,
    // Funções de armazenamento
    setCookie,
    getCookie,
    deleteCookie,
    // Funções de debug
    debugStorage,
    debugCookies,
    simularLogin,
    limparStorage,
    // Compatibilidade
    debugLocalStorage: debugStorage
};

// Debug - verificar se as funções foram exportadas
console.log('Funções suporteAPI exportadas:', Object.keys(window.suporteAPI));

// Teste adicional - verificar se a função logout está acessível
console.log('Função logout disponível:', typeof window.suporteAPI.logout === 'function');

// Função de teste que pode ser chamada no console
window.testarLogout = function() {
    console.log('🧪 TESTE DE LOGOUT CHAMADO MANUALMENTE');
    logout();
};