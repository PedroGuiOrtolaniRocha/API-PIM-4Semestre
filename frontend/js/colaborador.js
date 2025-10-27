// Estado do colaborador
let usuarioAtual = null;
let ticketSelecionado = null;
let tickets = [];
let mensagens = [];

// Inicializar página
function inicializarPagina() {
    console.log('🚀 Inicializando página do colaborador');
    console.log('📍 URL atual:', window.location.href);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Aguardar um momento para garantir que todos os scripts carregaram
    setTimeout(() => {
        console.log('🔍 Verificando estado inicial do localStorage:');
        console.log('📊 Total de itens no localStorage:', localStorage.length);
        
        // Listar todos os itens do localStorage
        if (localStorage.length === 0) {
            console.log('⚠️ localStorage está completamente vazio!');
        } else {
            console.log('📋 Itens no localStorage:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                console.log(`  - ${key}: ${value}`);
            }
        }
        
        // Verificações específicas - cookies primeiro, localStorage como fallback
        const authTokenCookie = getCookie('authToken');
        const authTokenStorage = localStorage.getItem('authToken');
        const usuarioAtualCookie = getCookie('usuarioAtual');
        const usuarioAtualStorage = localStorage.getItem('usuarioAtual');
        
        console.log('🔑 authToken (cookie):', authTokenCookie ? `presente (${authTokenCookie.length} chars)` : '❌ ausente');
        console.log('🔑 authToken (localStorage):', authTokenStorage ? `presente (${authTokenStorage.length} chars)` : '❌ ausente');
        console.log('👤 usuarioAtual (cookie):', usuarioAtualCookie ? `presente: ${usuarioAtualCookie}` : '❌ ausente');
        console.log('👤 usuarioAtual (localStorage):', usuarioAtualStorage ? `presente: ${usuarioAtualStorage}` : '❌ ausente');
        console.log('🔧 suporteAPI disponível:', typeof suporteAPI !== 'undefined');
        
        // Verificar se suporteAPI foi carregado
        if (typeof suporteAPI === 'undefined') {
            console.error('❌ suporteAPI não foi carregado ainda - aguardando...');
            setTimeout(inicializarPagina, 500);
            return;
        }
        
        console.log('✅ suporteAPI carregado - continuando inicialização sem verificação de auth');
        continuarInicializacao();
    }, 500);
}

function continuarInicializacao() {
    // Carregar dados do usuário dos cookies primeiro, depois localStorage como fallback
    let usuarioStorage = getCookie('usuarioAtual');
    if (!usuarioStorage) {
        console.log('⚠️ Nenhum cookie de usuário encontrado, tentando localStorage...');
        usuarioStorage = localStorage.getItem('usuarioAtual');
    }
    
    if (usuarioStorage) {
        try {
            const dadosUsuario = JSON.parse(usuarioStorage);
            console.log('📋 Dados do usuário carregados dos cookies:', dadosUsuario);
            
            usuarioAtual = {
                id: dadosUsuario.id || 1,
                username: dadosUsuario.email,
                role: dadosUsuario.role || 'User'
            };
            console.log('✅ Colaborador autenticado:', usuarioAtual.username);
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
            // Usar dados demo ao invés de fazer logout
            usuarioAtual = {
                id: 1,
                username: 'Usuário Demo',
                role: 'User'
            };
            console.log('⚠️ Usando dados demo devido a erro');
        }
    } else {
        console.log('⚠️ Nenhum dado de usuário encontrado nos cookies nem localStorage');
        console.log('💡 Possíveis causas:');
        console.log('  1. Usuário não fez login ainda');
        console.log('  2. Dados foram limpos por logout');
        console.log('  3. Sessão/cookies expiraram');
        console.log('  4. Navegador limpou dados');
        console.log('🎭 Usando dados demo para permitir navegação');
        
        usuarioAtual = {
            id: 1,
            username: 'Usuário Demo (Não Logado)',
            role: 'User'
        };
    }
    
    // Continuar com a inicialização da página
    finalizarInicializacao();
}

function finalizarInicializacao() {
    console.log('🎨 Finalizando inicialização da página...');
    
    // Atualizar info do usuário no header
    const infoUsuario = document.querySelector('.user-info span');
    if (infoUsuario) {
        infoUsuario.textContent = usuarioAtual.username;
        
        // Adicionar indicador visual se é usuário demo
        if (usuarioAtual.username.includes('Demo')) {
            infoUsuario.style.color = '#ff6b6b';
            infoUsuario.title = 'Usuário demo - dados não salvos no servidor';
        }
    } else {
        console.log('⚠️ Elemento .user-info span não encontrado no DOM');
    }
    
    // Mostrar informações de debug no console
    console.log('📋 Status final da inicialização:');
    console.log('- Usuario atual:', usuarioAtual);
    console.log('- Token presente (cookie):', !!getCookie('authToken'));
    console.log('- Token presente (localStorage):', !!localStorage.getItem('authToken'));
    console.log('- Modo:', usuarioAtual.username.includes('Demo') ? 'DEMO' : 'AUTENTICADO');
    
    // Instruções de debug para o console
    console.log('');
    console.log('🛠️ COMANDOS DE DEBUG DISPONÍVEIS:');
    console.log('- debugCookies() - Ver estado dos cookies');
    console.log('- suporteAPI.debugLocalStorage() - Ver estado do localStorage');
    console.log('- suporteAPI.simularLogin("user@test.com", "User") - Simular login');
    console.log('- suporteAPI.limparStorage() - Limpar localStorage');
    console.log('- location.reload() - Recarregar página');
    console.log('');
    
    // Configurar entrada de chat
    configurarEntradaChat();
    
    // Carregar tickets
    carregarTickets();
}

// Carregar tickets do usuário
async function carregarTickets() {
    try {
        console.log('🎫 Carregando tickets do usuário:', usuarioAtual.id);
        // GET /Ticket - Lista todos os tickets (filtrar no cliente por userId se necessário)
        tickets = await suporteAPI.chamarAPI('/Ticket');
        console.log('✅ Tickets carregados:', tickets.length);
        renderizarListaTickets();
    } catch (error) {
        console.error('❌ Erro ao carregar tickets:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar tickets', 'error');
    }
}

// Carregar mensagens do ticket
async function carregarMensagens(ticketId) {
    try {
        console.log('💬 Carregando mensagens do ticket:', ticketId);
        
        const resultado = await suporteAPI.chamarAPI(`/Message/${ticketId}`, 'GET');
        
        if (resultado.sucesso) {
            mensagens = resultado.dados || [];
            console.log('✅ Mensagens carregadas com sucesso:', mensagens.length, 'mensagens');
        } else {
            console.log('⚠️ Não foi possível carregar mensagens, usando lista vazia');
            mensagens = [];
        }
        
        renderizarMensagensChat();
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        console.log('⚠️ Usando lista vazia como fallback');
        mensagens = [];
        renderizarMensagensChat();
        suporteAPI.mostrarMensagem('Erro ao carregar mensagens', 'error');
    }
}

// Renderizar lista de tickets
function renderizarListaTickets() {
    const listaTickets = document.getElementById('ticket-list');
    if (!listaTickets) return;
    
    listaTickets.innerHTML = '';
    console.log('Renderizando', tickets.length, 'tickets');
    
    const ticketsAbertos = tickets.filter(ticket => ticket.status !== 'Fechado');
    
    ticketsAbertos.forEach(ticket => {
        const elementoTicket = document.createElement('div');
        elementoTicket.className = 'list-item';
        elementoTicket.onclick = () => selecionarTicket(ticket);
        
        elementoTicket.innerHTML = `
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-status ${suporteAPI.obterClasseStatus(ticket.status)}">
                <span class="status-badge">${ticket.status}</span>
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                ${suporteAPI.formatarData(ticket.createdAt)}
            </div>
        `;
        
        listaTickets.appendChild(elementoTicket);
    });
}

// Selecionar ticket
function selecionarTicket(ticket) {
    console.log('Ticket selecionado:', ticket.title);
    ticketSelecionado = ticket;
    
    // Atualizar estado ativo
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Carregar mensagens
    carregarMensagens(ticket.id);
    
    // Atualizar cabeçalho do chat
    const cabecalhoChat = document.getElementById('chat-header');
    if (cabecalhoChat) {
        cabecalhoChat.textContent = `Chat - ${ticket.title}`;
    }
    
    // Atualizar detalhes do ticket
    atualizarDetalhesTicket(ticket);
}

// Renderizar mensagens do chat
function renderizarMensagensChat() {
    const chatMensagens = document.getElementById('chat-messages');
    if (!chatMensagens) return;
    
    chatMensagens.innerHTML = '';
    console.log('Renderizando', mensagens.length, 'mensagens');
    
    mensagens.forEach(mensagem => {
        if (mensagem.userText) {
            const elementoMensagem = document.createElement('div');
            elementoMensagem.className = 'message user';
            elementoMensagem.innerHTML = `
                <div>${mensagem.userText}</div>
                <div class="message-time">${suporteAPI.formatarData(mensagem.time)}</div>
            `;
            chatMensagens.appendChild(elementoMensagem);
        }
        
        if (mensagem.botText) {
            const elementoMensagemBot = document.createElement('div');
            elementoMensagemBot.className = 'message bot';
            elementoMensagemBot.innerHTML = `
                <div>${mensagem.botText}</div>
                <div class="message-time">${suporteAPI.formatarData(mensagem.time)}</div>
            `;
            chatMensagens.appendChild(elementoMensagemBot);
        }
    });
    
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

// Atualizar detalhes do ticket
function atualizarDetalhesTicket(ticket) {
    const elementos = {
        'ticket-status': ticket.status,
        'ticket-title': ticket.title,
        'ticket-description': ticket.description,
        'ticket-created': suporteAPI.formatarData(ticket.createdAt),
        'ticket-updated': suporteAPI.formatarData(ticket.updatedAt)
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

// Configurar entrada de chat
function configurarEntradaChat() {
    const entradaChat = document.getElementById('chat-input');
    const botaoEnviar = document.getElementById('send-btn');
    
    if (entradaChat && botaoEnviar) {
        const enviarMensagem = async () => {
            const texto = entradaChat.value.trim();
            if (texto && ticketSelecionado && usuarioAtual) {
                console.log('Enviando mensagem:', texto);
                await enviarMensagem(ticketSelecionado.id, texto, usuarioAtual.id);
                entradaChat.value = '';
            }
        };
        
        botaoEnviar.onclick = enviarMensagem;
        entradaChat.onkeypress = (e) => {
            if (e.key === 'Enter') {
                enviarMensagem();
            }
        };
    }
}

// Enviar mensagem
async function enviarMensagem(ticketId, textoUsuario, autorId) {
    try {
        console.log('📤 Enviando mensagem para ticket:', ticketId);
        
        // POST /Message - Baseado no Swagger, usando MessageDto
        const dadosMensagem = {
            ticketId: ticketId,
            userText: textoUsuario,
            authorId: autorId,
            time: new Date().toISOString()
        };
        
        await suporteAPI.chamarAPI('/Message', 'POST', dadosMensagem);
        console.log('✅ Mensagem enviada com sucesso');
        await carregarMensagens(ticketId);
        suporteAPI.mostrarMensagem('Mensagem enviada com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        suporteAPI.mostrarMensagem('Erro ao enviar mensagem', 'error');
    }
}

// Pedir escalação
function pedirEscalacao() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    console.log('Solicitando escalação para ticket:', ticketSelecionado.id);
    suporteAPI.mostrarMensagem('Solicitação de escalação enviada', 'success');
}

// Encerrar ticket
async function encerrarTicket() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja encerrar este ticket?')) {
        try {
            console.log('🔐 Encerrando ticket:', ticketSelecionado.id);
            // PATCH /Ticket/{id}/finish - Endpoint específico para finalizar ticket
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/finish`, 'PATCH');
            console.log('✅ Ticket finalizado com sucesso');
            await carregarTickets();
            suporteAPI.mostrarMensagem('Ticket encerrado com sucesso', 'success');
        } catch (error) {
            console.error('❌ Erro ao encerrar ticket:', error);
            suporteAPI.mostrarMensagem('Erro ao encerrar ticket', 'error');
        }
    }
}

// Criar ticket
async function criarTicket(dadosTicket) {
    try {
        console.log('🎫 Criando novo ticket:', dadosTicket);
        
        // POST /Ticket - Baseado no TicketCreateDto do Swagger
        const ticketDto = {
            title: dadosTicket.title,
            description: dadosTicket.description,
            userId: dadosTicket.userId,
            status: dadosTicket.status || 'Aberto'
        };
        
        await suporteAPI.chamarAPI('/Ticket', 'POST', ticketDto);
        console.log('✅ Ticket criado com sucesso');
        await carregarTickets();
        suporteAPI.mostrarMensagem('Ticket criado com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro ao criar ticket:', error);
        suporteAPI.mostrarMensagem('Erro ao criar ticket', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
    
    // Formulário de novo ticket
    const formNovoTicket = document.getElementById('new-ticket-form');
    if (formNovoTicket) {
        formNovoTicket.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titulo = document.getElementById('ticket-title-input').value;
            const descricao = document.getElementById('ticket-description-input').value;
            
            const dadosTicket = {
                title: titulo,
                description: descricao,
                userId: usuarioAtual.id,
                status: 'Aberto',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            criarTicket(dadosTicket);
            suporteAPI.closeModal('new-ticket-modal');
            
            // Limpar formulário
            document.getElementById('ticket-title-input').value = '';
            document.getElementById('ticket-description-input').value = '';
        });
    }
});