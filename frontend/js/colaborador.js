let usuarioAtual = null, ticketSelecionado = null, tickets = [], mensagens = [];
let especialidadesDisponiveis = [], especialidadesSelecionadas = [], especialidadesModalSelecionadas = [];

function inicializarPagina() {
    setTimeout(() => {
        if (typeof suporteAPI === 'undefined') return setTimeout(inicializarPagina, 500);
        
        const usuarioStorage = getCookie('usuarioAtual') || localStorage.getItem('usuarioAtual');
        try {
            const dados = JSON.parse(usuarioStorage);
            usuarioAtual = { id: dados.id || 1, username: dados.email, role: dados.role || 'User' };
        } catch {
            usuarioAtual = { id: 1, username: 'Usuário Demo', role: 'User' };
        }
        
        const infoUsuario = document.querySelector('.user-info span');
        if (infoUsuario) {
            infoUsuario.textContent = usuarioAtual.username;
            if (usuarioAtual.username.includes('Demo')) {
                infoUsuario.style.color = '#ff6b6b';
                infoUsuario.title = 'Usuário demo - dados não salvos no servidor';
            }
        }
        
        configurarEntradaChat();
        atualizarEstadoChat();
        carregarTickets();
        carregarEspecialidades();
    }, 500);
}

async function carregarTickets() {
    try {
        tickets = await suporteAPI.chamarAPI('/Ticket');
        renderizarListaTickets();
    } catch (error) {
        console.error('❌ Erro ao carregar tickets:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar tickets', 'error');
    }
}

async function carregarEspecialidades() {
    try {
        const especialidades = await suporteAPI.chamarAPI('/Spec');
        if (especialidades && Array.isArray(especialidades)) {
            especialidadesDisponiveis = especialidades;
            renderizarEspecialidadesDisponiveis('novo-ticket');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar especialidades', 'error');
    }
}

function renderizarEspecialidadesDisponiveis(contexto = 'novo-ticket') {
    const containerId = contexto === 'novo-ticket' ? 'available-specs-list' : 'modal-available-specs-list';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const disponiveis = especialidadesDisponiveis.filter(spec => !especialidadesSel.some(sel => sel.id === spec.id));
    
    if (disponiveis.length === 0) {
        container.innerHTML = '<em style="color: #666;">Todas as especialidades foram selecionadas</em>';
        return;
    }
    
    container.innerHTML = '';
    disponiveis.forEach(spec => {
        const el = document.createElement('span');
        el.className = 'spec-item available';
        el.textContent = spec.name;
        el.onclick = () => selecionarEspecialidade(spec, contexto);
        container.appendChild(el);
    });
}

function renderizarEspecialidadesSelecionadas(contexto = 'novo-ticket') {
    const containerId = contexto === 'novo-ticket' ? 'selected-specs-list' : 'modal-selected-specs-list';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (especialidadesSel.length === 0) {
        container.innerHTML = '<em style="color: #666;">Nenhuma especialidade selecionada</em>';
    } else {
        container.innerHTML = '';
        especialidadesSel.forEach(spec => {
            const el = document.createElement('span');
            el.className = 'spec-item selected';
            el.textContent = spec.name;
            el.onclick = () => removerEspecialidade(spec, contexto);
            container.appendChild(el);
        });
    }
    atualizarValidacaoEspecialidades(contexto);
}

function selecionarEspecialidade(spec, contexto = 'novo-ticket') {
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    if (!especialidadesSel.some(sel => sel.id === spec.id)) {
        (contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas).push(spec);
        renderizarEspecialidadesDisponiveis(contexto);
        renderizarEspecialidadesSelecionadas(contexto);
    }
}

function removerEspecialidade(spec, contexto = 'novo-ticket') {
    if (contexto === 'novo-ticket') {
        especialidadesSelecionadas = especialidadesSelecionadas.filter(sel => sel.id !== spec.id);
    } else {
        especialidadesModalSelecionadas = especialidadesModalSelecionadas.filter(sel => sel.id !== spec.id);
    }
    renderizarEspecialidadesDisponiveis(contexto);
    renderizarEspecialidadesSelecionadas(contexto);
}

function atualizarValidacaoEspecialidades(contexto = 'novo-ticket') {
    const validationId = contexto === 'novo-ticket' ? '.validation-message' : '#modal-validation-message';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    const validationMessage = document.querySelector(validationId);
    if (!validationMessage) return;
    
    validationMessage.textContent = especialidadesSel.length === 0 
        ? (contexto === 'novo-ticket' ? 'Selecione pelo menos uma especialidade' : 'Selecione as especialidades para adicionar')
        : `${especialidadesSel.length} especialidade(s) selecionada(s)`;
    validationMessage.className = especialidadesSel.length > 0 ? 'validation-message valid' : 'validation-message';
}

function limparSelecaoEspecialidades(contexto = 'novo-ticket') {
    if (contexto === 'novo-ticket') {
        especialidadesSelecionadas = [];
    } else {
        especialidadesModalSelecionadas = [];
    }
    renderizarEspecialidadesDisponiveis(contexto);
    renderizarEspecialidadesSelecionadas(contexto);
}

async function carregarMensagens(ticketId) {
    try {
        const resultado = await suporteAPI.chamarAPI(`/Message/${ticketId}`, 'GET');
        mensagens = (resultado && Array.isArray(resultado)) ? resultado : [];
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
    ticketSelecionado = ticket;
    document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    carregarMensagens(ticket.id);
    await atualizarDetalhesTicket(ticket);
    atualizarEstadoChat();
}

function renderizarMensagensChat() {
    const chatMensagens = document.getElementById('chat-messages');
    if (!chatMensagens) return;
    
    chatMensagens.innerHTML = '';
    mensagens.forEach(msg => {
        if (msg.text) {
            const el = document.createElement('div');
            el.className = msg.authorName === 'SuporteBot' ? 'message suporte-bot' : 'message user';
            el.innerHTML = `
                <div class="message-author">${msg.authorName}</div>
                <div>${msg.text}</div>
                <div class="message-time">${suporteAPI.formatarData(msg.time)}</div>
            `;
            chatMensagens.appendChild(el);
        }
    });
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

async function atualizarDetalhesTicket(ticket) {
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
    
    await carregarInformacoesTecnico(ticket);
    await carregarEspecialidadesDoTicket(ticket.id);
}

async function carregarInformacoesTecnico(ticket) {
    const elemTechName = document.getElementById('tech-name');
    const elemTechSpec = document.getElementById('tech-spec');
    if (!elemTechName || !elemTechSpec) return;
    
    elemTechName.textContent = 'Não atribuído';
    elemTechSpec.textContent = '-';
    if (!ticket.tecUserId) return;
    
    try {
        const tecnico = await suporteAPI.chamarAPI(`/User/${ticket.tecUserId}`, 'GET');
        if (tecnico) {
            elemTechName.textContent = tecnico.email || 'Nome não disponível';
            await carregarEspecialidadesTecnico(ticket.tecUserId, elemTechSpec);
        } else {
            elemTechName.textContent = 'Técnico não encontrado';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar informações do técnico:', error);
        elemTechName.textContent = 'Erro ao carregar';
        elemTechSpec.textContent = 'Erro ao carregar';
    }
}

async function carregarEspecialidadesTecnico(tecnicoId, elemTechSpec) {
    try {
        const registros = await suporteAPI.chamarAPI('/TecRegister', 'GET');
        if (registros && Array.isArray(registros)) {
            const registroTecnico = registros.find(reg => reg.userId === tecnicoId);
            if (registroTecnico && registroTecnico.specId) {
                const especialidade = await suporteAPI.chamarAPI(`/Spec/${registroTecnico.specId}`, 'GET');
                elemTechSpec.textContent = (especialidade && especialidade.name) ? especialidade.name : 'Especialidade não encontrada';
            } else {
                elemTechSpec.textContent = 'Sem especialidade registrada';
            }
        } else {
            elemTechSpec.textContent = 'Sem registros disponíveis';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades:', error);
        elemTechSpec.textContent = 'Erro ao carregar especialidade';
    }
}

function configurarEntradaChat() {
    const entradaChat = document.getElementById('chat-input');
    const botaoEnviar = document.getElementById('send-btn');
    
    if (entradaChat && botaoEnviar) {
        const enviarMensagem = async () => {
            const texto = entradaChat.value.trim();
            if (!texto) return suporteAPI.mostrarMensagem('Digite uma mensagem antes de enviar', 'warning');
            if (!ticketSelecionado) return suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
            if (!usuarioAtual) return suporteAPI.mostrarMensagem('Usuário não identificado', 'error');
            if (!verificarChatAberto()) return suporteAPI.mostrarMensagem('Chat não disponível. Solicite escalação para um técnico primeiro.', 'warning');
            
            await enviarMensagemChat(ticketSelecionado.id, texto, usuarioAtual.username);
            entradaChat.value = '';
        };
        
        botaoEnviar.onclick = enviarMensagem;
        entradaChat.onkeypress = (e) => { if (e.key === 'Enter') enviarMensagem(); };
    }
}

function verificarChatAberto() {
    return ticketSelecionado && ticketSelecionado.status === 'Aberto';
}

function atualizarEstadoChat() {
    const entradaChat = document.getElementById('chat-input');
    const botaoEnviar = document.getElementById('send-btn');
    const cabecalhoChat = document.getElementById('chat-header');
    
    if (!ticketSelecionado) {
        if (entradaChat) entradaChat.disabled = true;
        if (botaoEnviar) botaoEnviar.disabled = true;
        if (cabecalhoChat) cabecalhoChat.textContent = 'Selecione um ticket para iniciar o chat';
        return;
    }
    
    const chatAberto = verificarChatAberto();
    
    if (chatAberto) {
        if (entradaChat) {
            entradaChat.disabled = false;
            entradaChat.placeholder = 'Digite sua mensagem...';
        }
        if (botaoEnviar) botaoEnviar.disabled = false;
        if (cabecalhoChat) cabecalhoChat.textContent = `Chat - ${ticketSelecionado.title} 💬`;
    } else {
        if (entradaChat) {
            entradaChat.disabled = true;
            entradaChat.placeholder = 'chat com agente encerrado';
        }
        if (botaoEnviar) botaoEnviar.disabled = true;
        if (cabecalhoChat) cabecalhoChat.textContent = `${ticketSelecionado.title} - ⚠️ Chat indisponível`;
    }
}

async function enviarMensagemChat(ticketId, textoUsuario, authorName) {
    try {
        const novaMensagem = {
            TicketId: ticketId,
            Text: textoUsuario,
            AuthorName: authorName,
            Time: new Date().toISOString()
        };
        
        mensagens.push({ text: novaMensagem.Text, authorName: novaMensagem.AuthorName, time: novaMensagem.Time });
        renderizarMensagensChat();
        
        await suporteAPI.chamarAPI('/Message', 'POST', novaMensagem);
        
        await carregarMensagens(ticketId);

        renderizarMensagensChat();
        suporteAPI.mostrarMensagem('Mensagem enviada com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        mensagens.pop();
        renderizarMensagensChat();
    }
}

async function pedirEscalacao() {
    if (!ticketSelecionado) return suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
    
    try {
        await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/routeTicket`, 'PATCH');
        await carregarTickets();
        
        const ticketsAtualizados = await suporteAPI.chamarAPI('/Ticket', 'GET');
        const ticketAtualizado = ticketsAtualizados.find(t => t.id === ticketSelecionado.id);
        if (ticketAtualizado) {
            await atualizarDetalhesTicket(ticketAtualizado);
            ticketSelecionado = ticketAtualizado;
            atualizarEstadoChat();
        }
        
        suporteAPI.mostrarMensagem('Ticket escalado para técnico disponível', 'success');
    } catch (error) {
        console.error('❌ Erro ao escalar ticket:', error);
    }
}

async function encerrarTicket() {
    if (!ticketSelecionado) return suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
    
    if (confirm('Tem certeza que deseja encerrar este ticket?')) {
        try {
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/finish`, 'PATCH');
            await carregarTickets();
            suporteAPI.mostrarMensagem('Ticket encerrado com sucesso', 'success');
        } catch (error) {
            console.error('❌ Erro ao encerrar ticket:', error);
        }
    }
}

async function criarTicket(dadosTicket) {
    try {
        const ticketCriado = await suporteAPI.chamarAPI('/Ticket', 'POST', {
            title: dadosTicket.title,
            description: dadosTicket.description,
            specIds: dadosTicket.specIds || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        if (dadosTicket.specIds && dadosTicket.specIds.length > 0) {
            for (const specId of dadosTicket.specIds) {
                try {
                    console.log('Adicionando especialidade ao ticket:', specId);
                    await suporteAPI.chamarAPI(`/Ticket/${ticketCriado.id}/addSpec`, 'PATCH', specId.toString());
                } catch (error) {
                    console.warn('⚠️ Erro ao adicionar especialidade:', specId, error);
                }
            }
        }
        
        await carregarTickets();
        suporteAPI.mostrarMensagem(`Ticket criado com ${dadosTicket.specIds.length} especialidade(s)`, 'success');
    } catch (error) {
        console.error('❌ Erro ao criar ticket:', error);
        suporteAPI.mostrarMensagem('Erro ao criar ticket', 'error');
    }
}

async function carregarEspecialidadesDoTicket(ticketId) {
    if (!ticketId) return;
    
    try {
        let specs = await suporteAPI.chamarAPI(`/Ticket/${ticketId}/specs`);
        
        if (!specs || specs.length === 0) {
            const relacoes = await suporteAPI.chamarAPI('/TicketSpecRelation');
            const relacoesDoTicket = relacoes.filter(rel => rel.ticketId === ticketId);
            specs = [];
            for (const relacao of relacoesDoTicket) {
                try {
                    const spec = await suporteAPI.chamarAPI(`/Spec/${relacao.specId}`);
                    if (spec) specs.push(spec);
                } catch (error) {
                    console.warn('⚠️ Erro ao carregar especialidade:', relacao.specId);
                }
            }
        }
        
        renderizarEspecialidadesDoTicket(specs || []);
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades do ticket:', error);
        renderizarEspecialidadesDoTicket([]);
    }
}

function renderizarEspecialidadesDoTicket(specs) {
    const container = document.getElementById('ticket-specs-list');
    if (!container) return console.error('❌ Container ticket-specs-list não encontrado');
    
    container.innerHTML = specs.length === 0 
        ? '<em style="color: #666;">Nenhuma especialidade associada</em>'
        : '';
    
    specs.forEach(spec => {
        const el = document.createElement('span');
        el.className = 'spec-item selected';
        el.textContent = spec.name || 'Especialidade sem nome';
        el.onclick = () => confirmarRemocaoEspecialidade(spec);
        el.title = 'Clique para remover';
        container.appendChild(el);
    });
}

function abrirModalAdicionarEspecialidades() {
    if (!ticketSelecionado) return suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
    especialidadesModalSelecionadas = [];
    carregarEspecialidadesParaModal();
    suporteAPI.openModal('manage-specs-modal');
}

async function carregarEspecialidadesParaModal() {
    try {
        let specsDoTicket = [];
        try {
            specsDoTicket = await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/specs`) || [];
        } catch (error) {
            const relacoes = await suporteAPI.chamarAPI('/TicketSpecRelation');
            const relacoesDoTicket = relacoes.filter(rel => rel.ticketId === parseInt(ticketSelecionado.id));
            for (const relacao of relacoesDoTicket) {
                try {
                    const spec = await suporteAPI.chamarAPI(`/Spec/${relacao.specId}`);
                    if (spec) specsDoTicket.push(spec);
                } catch (err) {
                    console.warn('⚠️ Erro ao carregar especialidade no modal:', relacao.specId);
                }
            }
        }
        
        const idsDoTicket = specsDoTicket.map(spec => spec.id);
        const especialidadesDisponiveisParaAdicionar = especialidadesDisponiveis.filter(spec => !idsDoTicket.includes(spec.id));
        const especialidadesOriginais = [...especialidadesDisponiveis];
        especialidadesDisponiveis = especialidadesDisponiveisParaAdicionar;
        renderizarEspecialidadesDisponiveis('modal');
        renderizarEspecialidadesSelecionadas('modal');
        especialidadesDisponiveis = especialidadesOriginais;
        
        if (especialidadesDisponiveisParaAdicionar.length === 0) {
            const container = document.getElementById('modal-available-specs-list');
            if (container) container.innerHTML = '<em style="color: #666;">Todas as especialidades já estão no ticket</em>';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades para o modal:', error);
        const container = document.getElementById('modal-available-specs-list');
        if (container) container.innerHTML = '<em style="color: #e74c3c;">Erro ao carregar especialidades</em>';
    }
}
async function confirmarAdicionarEspecialidades() {
    if (!ticketSelecionado || especialidadesModalSelecionadas.length === 0) {
        return suporteAPI.mostrarMensagem('Selecione pelo menos uma especialidade', 'error');
    }
    
    try {
        for (const spec of especialidadesModalSelecionadas) {
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/addSpec`, 'PATCH', spec.id.toString());
        }
        await carregarEspecialidadesDoTicket(ticketSelecionado.id);
        suporteAPI.mostrarMensagem(`${especialidadesModalSelecionadas.length} especialidade(s) adicionada(s)`, 'success');
        suporteAPI.closeModal('manage-specs-modal');
        especialidadesModalSelecionadas = [];
    } catch (error) {
        console.error('❌ Erro ao adicionar especialidades:', error);
        suporteAPI.mostrarMensagem('Erro ao adicionar especialidades', 'error');
    }
}

async function confirmarRemocaoEspecialidade(spec) {
    if (!ticketSelecionado) return;
    
    if (confirm(`Tem certeza que deseja remover a especialidade "${spec.name}" deste ticket?`)) {
        try {
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/removeSpec`, 'PATCH', spec.id.toString());
            await carregarEspecialidadesDoTicket(ticketSelecionado.id);
            suporteAPI.mostrarMensagem('Especialidade removida com sucesso', 'success');
        } catch (error) {
            console.error('❌ Erro ao remover especialidade:', error);
            suporteAPI.mostrarMensagem('Erro ao remover especialidade', 'error');
        }
    }
}

window.abrirModalAdicionarEspecialidades = abrirModalAdicionarEspecialidades;
window.confirmarAdicionarEspecialidades = confirmarAdicionarEspecialidades;

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
    
    const formNovoTicket = document.getElementById('new-ticket-form');
    if (formNovoTicket) {
        formNovoTicket.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (especialidadesSelecionadas.length === 0) {
                return suporteAPI.mostrarMensagem('É obrigatório selecionar pelo menos uma especialidade', 'error');
            }
            
            criarTicket({
                title: document.getElementById('ticket-title-input').value,
                description: document.getElementById('ticket-description-input').value,
                specIds: especialidadesSelecionadas.map(spec => spec.id),
                status: 'Aberto'
            });
            
            suporteAPI.closeModal('new-ticket-modal');
            document.getElementById('ticket-title-input').value = '';
            document.getElementById('ticket-description-input').value = '';
            limparSelecaoEspecialidades('novo-ticket');
        });
    }
});