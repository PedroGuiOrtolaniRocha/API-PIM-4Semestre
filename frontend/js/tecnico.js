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
    tickets = await suporteAPI.chamarAPI(`/Ticket/tec/${tecnicoAtual.id.toString()}`);
    suporteAPI.renderizarListaTickets(tickets, selecionarTicket);
}

async function selecionarTicket(ticket) {
    console.log('🎫 Técnico selecionou ticket:', ticket.title);
    ticketSelecionado = ticket;
    
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    await suporteAPI.carregarMensagens(ticket.id, mensagens, () => {
        suporteAPI.renderizarMensagensChat(mensagens);
    });
    
    const cabecalhoChat = document.getElementById('chat-header');
    if (cabecalhoChat) {
        cabecalhoChat.textContent = `Chat - ${ticket.title} 👁️ (Visualização)`;
    }
    
    await suporteAPI.atualizarDetalhesTicket(ticket);
    
    await carregarInfoColaborador(ticket.userId);
}

function renderizarMensagensChat() {
    // Usa a função do comum.js
    suporteAPI.renderizarMensagensChat(mensagens);
}

function atualizarDetalhesTicket(ticket) {
    // Usa a função do comum.js
    suporteAPI.atualizarDetalhesTicket(ticket);
}

async function carregarInfoColaborador(userId) {
    const usuario = await suporteAPI.chamarAPI(`/User/${userId.toString()}`);
    
    document.getElementById('user-name').textContent = usuario.username;
    document.getElementById('user-email').textContent = usuario.email;
    
    const todosTickets = await suporteAPI.chamarAPI('/Ticket');
    const ticketsUsuario = todosTickets.filter(ticket => ticket.userId === userId);
    document.getElementById('user-ticket-count').textContent = ticketsUsuario.length;
}

function configurarEntradaChat() {
    const entradaChat = document.getElementById('chat-input');
    const botaoEnviar = document.getElementById('send-btn');
    
    if (entradaChat) {
        entradaChat.disabled = true;
        entradaChat.placeholder = '🔒 Modo visualização - Técnicos não podem enviar mensagens';
        entradaChat.style.backgroundColor = '#f5f5f5';
        entradaChat.style.color = '#999';
        entradaChat.style.cursor = 'not-allowed';
    }
    
    if (botaoEnviar) {
        botaoEnviar.disabled = true;
        botaoEnviar.style.backgroundColor = '#ccc';
        botaoEnviar.style.cursor = 'not-allowed';
        botaoEnviar.style.opacity = '0.5';
        botaoEnviar.title = 'Técnicos não podem enviar mensagens no chat';
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
    
    console.log('✅ Técnico confirmou resolução do ticket');
    
    // Finalizar o ticket com o texto de resolução
    await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id.toString()}/finish`, 'PATCH', textoResolucao);
    
    // Recarregar mensagens para mostrar a atualização
    await suporteAPI.carregarMensagens(ticketSelecionado.id, mensagens, () => {
        suporteAPI.renderizarMensagensChat(mensagens);
    });
    
    document.getElementById('resolution-text').value = '';
    
    suporteAPI.fecharModal('resolve-ticket-modal');
    
    await carregarTicketsTecnico();
    
    suporteAPI.mostrarMensagem('Ticket resolvido com sucesso!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
});