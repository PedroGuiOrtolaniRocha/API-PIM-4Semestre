let tecnicoAtual = null;
let ticketSelecionado = null;
let tickets = [];
let mensagens = [];

function inicializarPagina() {
    
    setTimeout(() => {
        let usuarioStorage = getCookie('usuarioAtual');
        if (!usuarioStorage) {
            usuarioStorage = localStorage.getItem('usuarioAtual');
        }
        
        if (usuarioStorage) {
            try {
                const dadosUsuario = JSON.parse(usuarioStorage);
                
                tecnicoAtual = {
                    id: dadosUsuario.id || 2,
                    username: dadosUsuario.email,
                    role: dadosUsuario.role || 'Technician',
                    specs: ['Hardware', 'Software']
                };
                console.log('👤 Técnico logado:', tecnicoAtual.username);
            } catch (error) {
                console.error('❌ Erro ao carregar dados do técnico:', error);
                tecnicoAtual = {
                    id: 2,
                    username: 'Técnico Demo',
                    role: 'Technician',
                    specs: ['Hardware', 'Software']
                };
            }
        } else {
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
        tickets = await suporteAPI.chamarAPI('/Ticket');
        renderizarListaTickets();
    } catch (error) {
        console.error('❌ Erro ao carregar tickets do técnico:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar tickets', 'error');
    }
}

async function carregarMensagens(ticketId) {
    try {
        
        const resultado = await suporteAPI.chamarAPI(`/Message/${ticketId}`, 'GET');
        
        if (resultado.sucesso) {
            mensagens = resultado.dados || [];
        } else {
            mensagens = [];
        }
        
        renderizarMensagensChat();
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        mensagens = [];
        renderizarMensagensChat();  
        suporteAPI.mostrarMensagem('Erro ao carregar mensagens', 'error');
    }
}

function renderizarListaTickets() {
    const listaTickets = document.getElementById('ticket-list');
    if (!listaTickets) return;
    
    listaTickets.innerHTML = '';
    
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
    console.log('🎫 Técnico selecionou ticket:', ticket.title);
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
    
    mensagens.forEach(mensagem => {
        if (mensagem.text) {
            const elementoMensagem = document.createElement('div');
            
            // Determinar a classe baseada no authorName
            let classeMsg = 'message user'; // padrão para usuário
            if (mensagem.authorName === 'SuporteBot') {
                classeMsg = 'message suporte-bot';
            }
            
            elementoMensagem.className = classeMsg;
            elementoMensagem.innerHTML = `
                <div class="message-author">${mensagem.authorName}</div>
                <div>${mensagem.text}</div>
                <div class="message-time">${suporteAPI.formatarData(mensagem.time)}</div>
            `;
            chatMensagens.appendChild(elementoMensagem);
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
        const usuario = await suporteAPI.chamarAPI(`/User/${userId}`);
        
        document.getElementById('user-name').textContent = usuario.username;
        document.getElementById('user-email').textContent = usuario.email;
        
        const todosTickets = await suporteAPI.chamarAPI('/Ticket');
        const ticketsUsuario = todosTickets.filter(ticket => ticket.userId === userId);
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
        
    }
}

async function enviarMensagemSistema(ticketId, textoResolucao, autorId) {
    try {
        console.log('💬 Técnico enviou mensagem de resolução:', textoResolucao);
        
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
    
    console.log('🔧 Técnico preparou resolução do ticket');
    document.getElementById('modal-ticket-title').textContent = ticketSelecionado.title;
    document.getElementById('modal-resolution-preview').textContent = textoResolucao;
    suporteAPI.abrirModal('resolve-ticket-modal');
}

async function confirmarResolucaoTicket() {
    const textoResolucao = document.getElementById('resolution-text').value.trim();
    
    try {
        console.log('✅ Técnico confirmou resolução do ticket');
        
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