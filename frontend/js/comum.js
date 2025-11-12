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
        
        // Tratamento de autenticação expirada
        if (response.status === 401) {
            console.log('Token JWT expirado ou inválido - fazendo logout');
            mostrarMensagem('Sessão expirada. Faça login novamente.', 'error');
            logout();
            return null;
        }

        // Tratamento de erros de validação ou requisição inválida
        if (response.status === 400) {
            const erroDados = await response.json().catch(() => ({}));
            const mensagemErro = erroDados.message || erroDados.error || 'Requisição inválida';
            mostrarMensagem(mensagemErro, 'error');
            throw new Error(mensagemErro);
        }
        
        // Tratamento de outros erros HTTP
        if (!response.ok) {
            const erroDados = await response.json().catch(() => ({}));
            const mensagemErro = erroDados.message || erroDados.error || `Erro na requisição: ${response.status}`;
            mostrarMensagem(mensagemErro, 'error');
            throw new Error(mensagemErro);
        }
        
        const resultado = await response.json();
        console.log('Resposta da API recebida:', resultado);
        return resultado;
    } catch (error) {
        // Se o erro já foi tratado acima (Bad Request, etc), apenas propaga
        if (error.message && !error.message.includes('fetch')) {
            throw error;
        }
        
        // Tratamento de erros de rede ou outros erros inesperados
        console.error('❌ Erro na requisição:', error);
        mostrarMensagem('Erro de conexão com o servidor', 'error');
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

// Funções comuns para renderização de tickets e mensagens
async function carregarMensagens(ticketId, mensagensArray, renderCallback) {
    const resultado = await chamarAPI(`/Message/${ticketId.toString()}`, 'GET');
    const msgs = (resultado && Array.isArray(resultado)) ? resultado : [];
    
    // Atualiza o array de mensagens passado por referência
    mensagensArray.length = 0;
    mensagensArray.push(...msgs);
    
    if (renderCallback) {
        renderCallback();
    }
    
    return msgs;
}

function renderizarMensagensChat(mensagensArray) {
    const chatMensagens = document.getElementById('chat-messages');
    if (!chatMensagens) return;
    
    chatMensagens.innerHTML = '';
    mensagensArray.forEach(msg => {
        if (msg.text) {
            const el = document.createElement('div');
            el.className = msg.authorName === 'SuporteBot' ? 'message suporte-bot' : 'message user';
            el.innerHTML = `
                <div class="message-author">${msg.authorName}</div>
                <div>${msg.text}</div>
                <div class="message-time">${formatarData(msg.time)}</div>
            `;
            chatMensagens.appendChild(el);
        }
    });
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function renderizarListaTickets(ticketsArray, selecionarCallback) {
    const listaTickets = document.getElementById('ticket-list');
    if (!listaTickets) return;
    
    listaTickets.innerHTML = '';
    const ticketsAbertos = ticketsArray.filter(ticket => ticket.status !== 'Fechado');
    
    ticketsAbertos.forEach(ticket => {
        const elementoTicket = document.createElement('div');
        elementoTicket.className = 'list-item';
        elementoTicket.onclick = () => selecionarCallback(ticket);
        
        elementoTicket.innerHTML = `
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-status ${obterClasseStatus(ticket.status)}">
                <span class="status-badge">${ticket.status}</span>
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                ${formatarData(ticket.createdAt)}
            </div>
        `;
        
        listaTickets.appendChild(elementoTicket);
    });
}

async function atualizarDetalhesTicket(ticket) {
    const elementos = {
        'ticket-status': ticket.status,
        'ticket-title': ticket.title,
        'ticket-description': ticket.description,
        'ticket-created': formatarData(ticket.createdAt),
        'ticket-updated': formatarData(ticket.updatedAt)
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
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
    deleteCookie,
    // Funções comuns de renderização
    carregarMensagens,
    renderizarMensagensChat,
    renderizarListaTickets,
    atualizarDetalhesTicket
};


