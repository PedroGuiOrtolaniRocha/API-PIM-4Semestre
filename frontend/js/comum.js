const API_BASE_URL = 'http://localhost:5262';

console.log('Arquivo comum.js carregado com sucesso');

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

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

function mostrarMensagem(mensagem, tipo = 'info') {
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

async function chamarAPI(endpoint, metodo = 'GET', dados = null) {
    const config = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
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
        
        if (response.status === 401) {
            console.log('Token JWT expirado ou inválido - fazendo logout');
            mostrarMensagem('Sessão expirada. Faça login novamente.', 'error');
            logout();
            return;
        }

        if (response.status === 400) {
            const erroDados = await response.json();
            mostrarMensagem(`Erro: ${erroDados.message || 'Requisição inválida.'}`, 'error');
        }
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log('Resposta da API recebida:', resultado);
        return resultado;
    } catch (error) {
        throw error;
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    document.querySelectorAll('.close').forEach(botaoFechar => {
        botaoFechar.onclick = () => {
            botaoFechar.closest('.modal').style.display = 'none';
        };
    });
});

function logout() {
    console.log('🚪 Fazendo logout...');
    
    deleteCookie('authToken');
    deleteCookie('usuarioAtual');
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Dados e token JWT limpos - redirecionando para login');
    
    window.location.href = 'index.html';
}

function verificarAutenticacao() {
    console.log('🔍 Verificando autenticação...');
    console.log('📍 URL atual:', window.location.href);
    
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

window.suporteAPI = {
    abrirModal,
    fecharModal,
    openModal: abrirModal,
    closeModal: fecharModal,
    logout,
    mostrarMensagem,
    chamarAPI,
    formatarData,
    obterClasseStatus,
    verificarAutenticacao,
    setCookie,
    getCookie,
    deleteCookie
};

