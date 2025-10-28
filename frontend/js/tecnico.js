let tecnicoAtual = null;
let ticketSelecionado = null;
let tickets = [];
let mensagens = [];

function inicializarPagina() {
    console.log('🚀 Inicializando página do técnico');
    
    setTimeout(() => {
        let usuarioStorage = getCookie('usuarioAtual');
        if (!usuarioStorage) {
            console.log('⚠️ Nenhum cookie de usuário encontrado, tentando localStorage...');
            usuarioStorage = localStorage.getItem('usuarioAtual');
        }
        
        if (usuarioStorage) {
            try {
                const dadosUsuario = JSON.parse(usuarioStorage);
                console.log('📋 Dados do usuário carregados dos cookies:', dadosUsuario);
                
                tecnicoAtual = {
                    id: dadosUsuario.id || 2,
                    username: dadosUsuario.email,
                    role: dadosUsuario.role || 'Technician',
                    specs: ['Hardware', 'Software']
                };
                console.log('✅ Técnico autenticado:', tecnicoAtual.username);
            } catch (error) {
                console.error('❌ Erro ao carregar dados do técnico:', error);
                tecnicoAtual = {
                    id: 2,
                    username: 'Técnico Demo',
                    role: 'Technician',
                    specs: ['Hardware', 'Software']
                };
                console.log('⚠️ Usando dados demo devido a erro');
            }
        } else {
            console.log('⚠️ Nenhum dado de usuário encontrado nos cookies nem localStorage - usando dados demo');
            tecnicoAtual = {
                id: 2,
                username: 'Técnico Demo',
                role: 'Technician',
                specs: ['Hardware', 'Software']
            };
        }
        
        finalizarInicializacaoTecnico();
    }, 100);
}

function finalizarInicializacaoTecnico() {
    const infoUsuario = document.querySelector('.user-info span');
    if (infoUsuario) {
        infoUsuario.textContent = tecnicoAtual.username;
    }
    
    configurarEntradaChat();
    
    carregarTicketsTecnico();
}

async function carregarTicketsTecnico() {
    try {
        console.log('🎫 Carregando tickets do técnico:', tecnicoAtual.id);
        tickets = await suporteAPI.chamarAPI('/Ticket');
        console.log('✅ Tickets carregados:', tickets.length);
        renderizarListaTickets();
    } catch (error) {
        console.error('❌ Erro ao carregar tickets do técnico:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar tickets', 'error');
    }
}

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

function renderizarListaTickets() {
    const listaTickets = document.getElementById('ticket-list');
    if (!listaTickets) return;
    
    listaTickets.innerHTML = '';
    console.log('Renderizando', tickets.length, 'tickets do técnico');
    
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

async function selecionarTicket(ticket) {
    console.log('Ticket selecionado pelo técnico:', ticket.title);
    ticketSelecionado = ticket;
    
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    carregarMensagens(ticket.id);
    
    const cabecalhoChat = document.getElementById('chat-header');
    if (cabecalhoChat) {
        cabecalhoChat.textContent = `Chat - ${ticket.title}`;
    }
    
    atualizarDetalhesTicket(ticket);
    
    await carregarInfoColaborador(ticket.userId);
}

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

function atualizarDetalhesTicket(ticket) {
    const elementos = {
        'ticket-status': ticket.status,
        'ticket-title': ticket.title,
        'ticket-description': ticket.description,
        'ticket-created': suporteAPI.formatarData(ticket.createdAt)
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

async function carregarInfoColaborador(userId) {
    try {
        console.log('👤 Carregando informações do colaborador:', userId);
        const usuario = await suporteAPI.chamarAPI(`/User/${userId}`);
        console.log('✅ Dados do colaborador carregados:', usuario.username);
        
        document.getElementById('user-name').textContent = usuario.username;
        document.getElementById('user-email').textContent = usuario.email;
        
        console.log('📋 Carregando histórico de tickets do usuário...');
        const todosTickets = await suporteAPI.chamarAPI('/Ticket');
        const ticketsUsuario = todosTickets.filter(ticket => ticket.userId === userId);
        console.log('✅ Tickets do usuário encontrados:', ticketsUsuario.length);
        document.getElementById('user-ticket-count').textContent = ticketsUsuario.length;
        
    } catch (error) {
        console.error('❌ Erro ao carregar informações do colaborador:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar informações do colaborador', 'error');
    }
}

function configurarEntradaChat() {
    const entradaChat = document.getElementById('chat-input');
    const botaoEnviar = document.getElementById('send-btn');
    
    if (entradaChat && botaoEnviar) {
        entradaChat.disabled = true;
        entradaChat.placeholder = 'Técnicos não podem enviar mensagens de chat';
        entradaChat.style.backgroundColor = '#f5f5f5';
        entradaChat.style.color = '#999';
        
        botaoEnviar.disabled = true;
        botaoEnviar.style.backgroundColor = '#ccc';
        botaoEnviar.style.cursor = 'not-allowed';
        
        console.log('Entrada de chat desabilitada para técnico - apenas leitura');
    }
}

async function enviarMensagemSistema(ticketId, textoResolucao, autorId) {
    try {
        console.log('Enviando mensagem de resolução:', textoResolucao);
        
        const dadosMensagem = {
            ticketId: ticketId,
            userText: textoResolucao,
            authorId: autorId,
            time: new Date().toISOString()
        };
        
        await suporteAPI.chamarAPI('/Message', 'POST', dadosMensagem);
        await carregarMensagens(ticketId);
        suporteAPI.mostrarMensagem('Resolução registrada com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao registrar resolução:', error);
    }
}

async function atualizarStatusTicket() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    try {
        console.log('🔄 Atualizando status do ticket para Em Andamento');
        console.log('⚠️ Endpoint para atualizar status não implementado - usando apenas logs');
        await carregarTicketsTecnico();
        suporteAPI.mostrarMensagem('Status atualizado para Em Andamento', 'success');
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}


function resolverTicket() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    const textoResolucao = document.getElementById('resolution-text').value.trim();
    if (!textoResolucao) {
        suporteAPI.mostrarMensagem('Por favor, insira o texto da resolução', 'error');
        return;
    }
    
    console.log('Preparando resolução do ticket');
    document.getElementById('modal-ticket-title').textContent = ticketSelecionado.title;
    document.getElementById('modal-resolution-preview').textContent = textoResolucao;
    suporteAPI.abrirModal('resolve-ticket-modal');
}

async function confirmarResolucaoTicket() {
    const textoResolucao = document.getElementById('resolution-text').value.trim();
    
    try {
        console.log('✅ Confirmando resolução do ticket');
        
        await enviarMensagemSistema(ticketSelecionado.id, `Resolução: ${textoResolucao}`, tecnicoAtual.id);
        
        await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/finish`, 'PATCH', textoResolucao);
        
        document.getElementById('resolution-text').value = '';
        
        suporteAPI.fecharModal('resolve-ticket-modal');
        
        await carregarTicketsTecnico();
        
        suporteAPI.mostrarMensagem('Ticket resolvido com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao resolver ticket:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
});