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
    console.log('📋 Carregando tickets para usuário:', usuarioAtual.id);
    tickets = await suporteAPI.chamarAPI(`/Ticket/user/${usuarioAtual.id.toString()}`);
    console.log('✅ Tickets carregados:', tickets.length);
    suporteAPI.renderizarListaTickets(tickets, selecionarTicket);
}

async function carregarEspecialidades() {
    const especialidades = await suporteAPI.chamarAPI('/Spec');
    if (especialidades && Array.isArray(especialidades)) {
        especialidadesDisponiveis = especialidades;
        renderizarEspecialidadesDisponiveis('novo-ticket');
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
    await suporteAPI.carregarMensagens(ticketId, mensagens, () => {
        suporteAPI.renderizarMensagensChat(mensagens);
    });
}

function renderizarListaTickets() {
    suporteAPI.renderizarListaTickets(tickets, selecionarTicket);
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
    suporteAPI.renderizarMensagensChat(mensagens);
}

async function atualizarDetalhesTicket(ticket) {
    await suporteAPI.atualizarDetalhesTicket(ticket);
    await carregarInformacoesTecnico(ticket);
    await carregarEspecialidadesDoTicket(ticket.id);
}

async function carregarInformacoesTecnico(ticket) {
    const elemTechName = document.getElementById('tech-name');
    const elemTechSpec = document.getElementById('tech-spec');
    if (!elemTechName || !elemTechSpec) return;
    
    console.log('🔍 Carregando informações do técnico para ticket:', ticket.id, 'tecUserId:', ticket.tecUserId);
    
    elemTechName.textContent = 'Não atribuído';
    elemTechSpec.textContent = '-';
    
    if (!ticket.tecUserId) {
        console.log('⚠️ Ticket sem técnico atribuído');
        return;
    }
    
    console.log('👤 Buscando dados do técnico ID:', ticket.tecUserId);
    const tecnico = await suporteAPI.chamarAPI(`/User/${ticket.tecUserId.toString()}`, 'GET');
    
    if (tecnico) {
        console.log('✅ Técnico encontrado:', tecnico.email);
        elemTechName.textContent = tecnico.email || tecnico.username || 'Nome não disponível';
        await carregarEspecialidadesTecnico(ticket.tecUserId, elemTechSpec);
    } else {
        console.log('❌ Técnico não encontrado');
        elemTechName.textContent = 'Técnico não encontrado';
    }
}

async function carregarEspecialidadesTecnico(tecnicoId, elemTechSpec) {
    console.log('🔧 Carregando especialidades do técnico:', tecnicoId);
    const registros = await suporteAPI.chamarAPI('/TecRegister', 'GET');
    
    if (registros && Array.isArray(registros)) {
        console.log('📋 Registros técnicos encontrados:', registros.length);
        const registroTecnico = registros.find(reg => reg.userId === tecnicoId);
        
        if (registroTecnico && registroTecnico.specId) {
            console.log('✅ Registro encontrado para técnico, specId:', registroTecnico.specId);
            const especialidade = await suporteAPI.chamarAPI(`/Spec/${registroTecnico.specId.toString()}`, 'GET');
            elemTechSpec.textContent = (especialidade && especialidade.name) ? especialidade.name : 'Especialidade não encontrada';
            console.log('🎯 Especialidade do técnico:', especialidade?.name);
        } else {
            console.log('⚠️ Nenhum registro de especialidade para técnico:', tecnicoId);
            elemTechSpec.textContent = 'Sem especialidade registrada';
        }
    } else {
        console.log('❌ Nenhum registro técnico disponível');
        elemTechSpec.textContent = 'Sem registros disponíveis';
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
    const novaMensagem = {
        TicketId: ticketId,
        Text: textoUsuario,
        AuthorName: authorName,
        Time: new Date().toISOString()
    };
    
    // Adiciona otimisticamente
    mensagens.push({ text: novaMensagem.Text, authorName: novaMensagem.AuthorName, time: novaMensagem.Time });
    suporteAPI.renderizarMensagensChat(mensagens);
    
    try {
        await suporteAPI.chamarAPI('/Message', 'POST', novaMensagem);
        await carregarMensagens(ticketId);
        suporteAPI.mostrarMensagem('Mensagem enviada com sucesso', 'success');
    } catch (error) {
        // Remove a mensagem otimista em caso de erro
        mensagens.pop();
        suporteAPI.renderizarMensagensChat(mensagens);
    }
}

async function pedirEscalacao() {
    if (!ticketSelecionado) return suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
    
    console.log('🚀 Solicitando escalação para ticket:', ticketSelecionado.id);
    
    await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id.toString()}/routeTicket`, 'PATCH');
    
    console.log('✅ Ticket roteado com sucesso');
    
    // Buscar ticket atualizado
    const ticketAtualizado = await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id.toString()}`);
    
    if (ticketAtualizado) {
        // Atualizar ticketSelecionado ANTES de chamar atualizarDetalhesTicket
        ticketSelecionado = ticketAtualizado;
        await atualizarDetalhesTicket(ticketAtualizado);
        atualizarEstadoChat();
    }
    
    await carregarTickets();
    
    suporteAPI.mostrarMensagem('Ticket escalado para técnico disponível', 'success');
}

async function criarTicket(dadosTicket) {
    const ticketCriado = await suporteAPI.chamarAPI('/Ticket', 'POST', {
        title: dadosTicket.title,
        description: dadosTicket.description,
        specIds: dadosTicket.specIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    if (dadosTicket.specIds && dadosTicket.specIds.length > 0) {
        for (const specId of dadosTicket.specIds) {
            console.log('Adicionando especialidade ao ticket:', specId);
            await suporteAPI.chamarAPI(`/Ticket/${ticketCriado.id}/addSpec`, 'PATCH', specId.toString());
        }
    }
    
    await carregarTickets();
    suporteAPI.mostrarMensagem(`Ticket criado com ${dadosTicket.specIds.length} especialidade(s)`, 'success');
}

async function carregarEspecialidadesDoTicket(ticketId) {
    if (!ticketId) return;
    
    let specs = await suporteAPI.chamarAPI(`/Ticket/${ticketId}/specs`);
    
    if (!specs || specs.length === 0) {
        for (const spec of specs) {
            const spec = await suporteAPI.chamarAPI(`/Spec/${spec.id.toString()}`);
            if (spec) specs.push(spec);
        }
    }
    
    renderizarEspecialidadesDoTicket(specs || []);
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
    let specsDoTicket = await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/specs`) || [];
    
    if (!specsDoTicket || specsDoTicket.length === 0) {
        for (const spec of specsDoTicket) {
            const spec = await suporteAPI.chamarAPI(`/Spec/${spec.id.toString()}`);
            if (spec) specsDoTicket.push(spec);
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
}
async function confirmarAdicionarEspecialidades() {
    if (!ticketSelecionado || especialidadesModalSelecionadas.length === 0) {
        return suporteAPI.mostrarMensagem('Selecione pelo menos uma especialidade', 'error');
    }
    
    for (const spec of especialidadesModalSelecionadas) {
        await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/addSpec`, 'PATCH', spec.id.toString());
    }
    await carregarEspecialidadesDoTicket(ticketSelecionado.id);
    suporteAPI.mostrarMensagem(`${especialidadesModalSelecionadas.length} especialidade(s) adicionada(s)`, 'success');
    suporteAPI.closeModal('manage-specs-modal');
    especialidadesModalSelecionadas = [];
}

async function confirmarRemocaoEspecialidade(spec) {
    if (!ticketSelecionado) return;
    
    if (confirm(`Tem certeza que deseja remover a especialidade "${spec.name}" deste ticket?`)) {
        await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/removeSpec`, 'PATCH', spec.id.toString());
        await carregarEspecialidadesDoTicket(ticketSelecionado.id);
        suporteAPI.mostrarMensagem('Especialidade removida com sucesso', 'success');
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