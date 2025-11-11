let usuarioAtual = null;
let ticketSelecionado = null;
let tickets = [];
let mensagens = [];

function inicializarPagina() {
    setTimeout(() => {
        if (typeof suporteAPI === 'undefined') {
            setTimeout(inicializarPagina, 500);
            return;
        }
        
        continuarInicializacao();
    }, 500);
}

function continuarInicializacao() {
    let usuarioStorage = getCookie('usuarioAtual');
    if (!usuarioStorage) {
        usuarioStorage = localStorage.getItem('usuarioAtual');
    }
    
    if (usuarioStorage) {
        try {
            const dadosUsuario = JSON.parse(usuarioStorage);
            usuarioAtual = {
                id: dadosUsuario.id || 1,
                username: dadosUsuario.email,
                role: dadosUsuario.role || 'User'
            };
            console.log('👤 Colaborador logado:', usuarioAtual.username);
        } catch (error) {
            usuarioAtual = {
                id: 1,
                username: 'Usuário Demo',
                role: 'User'
            };
        }
    } else {
        usuarioAtual = {
            id: 1,
            username: 'Usuário Demo (Não Logado)',
            role: 'User'
        };
    }
    
    finalizarInicializacao();
}

function finalizarInicializacao() {
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
    
    // Configurar event listeners para modais
    setTimeout(() => {
        const btnConfirmar = document.getElementById('confirm-add-specs');
        if (btnConfirmar) {
            btnConfirmar.onclick = confirmarAdicionarEspecialidades;
            console.log('✅ Event listener do botão confirmar configurado');
        }
    }, 1000);
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

let especialidadesDisponiveis = [];
let especialidadesSelecionadas = []; // Para novo ticket
let especialidadesModalSelecionadas = []; // Para adicionar a ticket existente

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

// Função genérica para renderizar especialidades disponíveis
function renderizarEspecialidadesDisponiveis(contexto = 'novo-ticket') {
    const containerId = contexto === 'novo-ticket' ? 'available-specs-list' : 'modal-available-specs-list';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    
    const containerDisponiveis = document.getElementById(containerId);
    if (!containerDisponiveis) return;
    
    containerDisponiveis.innerHTML = '';
    
    const disponiveisParaMostrar = especialidadesDisponiveis.filter(spec => 
        !especialidadesSel.some(sel => sel.id === spec.id)
    );
    
    if (disponiveisParaMostrar.length === 0) {
        containerDisponiveis.innerHTML = '<em style="color: #666;">Todas as especialidades foram selecionadas</em>';
        return;
    }
    
    disponiveisParaMostrar.forEach(spec => {
        const specElement = document.createElement('span');
        specElement.className = 'spec-item available';
        specElement.textContent = spec.name;
        specElement.onclick = () => selecionarEspecialidade(spec, contexto);
        containerDisponiveis.appendChild(specElement);
    });
}

// Função genérica para renderizar especialidades selecionadas
function renderizarEspecialidadesSelecionadas(contexto = 'novo-ticket') {
    const containerId = contexto === 'novo-ticket' ? 'selected-specs-list' : 'modal-selected-specs-list';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    
    const containerSelecionadas = document.getElementById(containerId);
    if (!containerSelecionadas) return;
    
    containerSelecionadas.innerHTML = '';
    
    if (especialidadesSel.length === 0) {
        containerSelecionadas.innerHTML = '<em style="color: #666;">Nenhuma especialidade selecionada</em>';
    } else {
        especialidadesSel.forEach(spec => {
            const specElement = document.createElement('span');
            specElement.className = 'spec-item selected';
            specElement.textContent = spec.name;
            specElement.onclick = () => removerEspecialidade(spec, contexto);
            containerSelecionadas.appendChild(specElement);
        });
    }
    
    atualizarValidacaoEspecialidades(contexto);
}

// Função genérica para selecionar especialidade
function selecionarEspecialidade(spec, contexto = 'novo-ticket') {
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    
    if (!especialidadesSel.some(sel => sel.id === spec.id)) {
        if (contexto === 'novo-ticket') {
            especialidadesSelecionadas.push(spec);
        } else {
            especialidadesModalSelecionadas.push(spec);
        }
        
        renderizarEspecialidadesDisponiveis(contexto);
        renderizarEspecialidadesSelecionadas(contexto);
        console.log('✅ Especialidade selecionada:', spec.name);
    }
}

// Função genérica para remover especialidade
function removerEspecialidade(spec, contexto = 'novo-ticket') {
    if (contexto === 'novo-ticket') {
        especialidadesSelecionadas = especialidadesSelecionadas.filter(sel => sel.id !== spec.id);
    } else {
        especialidadesModalSelecionadas = especialidadesModalSelecionadas.filter(sel => sel.id !== spec.id);
    }
    
    renderizarEspecialidadesDisponiveis(contexto);
    renderizarEspecialidadesSelecionadas(contexto);
    console.log('❌ Especialidade removida:', spec.name);
}

// Função genérica para atualizar validação
function atualizarValidacaoEspecialidades(contexto = 'novo-ticket') {
    const validationId = contexto === 'novo-ticket' ? '.validation-message' : '#modal-validation-message';
    const especialidadesSel = contexto === 'novo-ticket' ? especialidadesSelecionadas : especialidadesModalSelecionadas;
    
    const validationMessage = document.querySelector(validationId);
    if (!validationMessage) return;
    
    if (especialidadesSel.length === 0) {
        validationMessage.textContent = contexto === 'novo-ticket' ? 'Selecione pelo menos uma especialidade' : 'Selecione as especialidades para adicionar';
        validationMessage.className = contexto === 'novo-ticket' ? 'validation-message' : 'validation-message';
    } else {
        validationMessage.textContent = `${especialidadesSel.length} especialidade(s) selecionada(s)`;
        validationMessage.className = contexto === 'novo-ticket' ? 'validation-message valid' : 'validation-message valid';
    }
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
        
        if (resultado && Array.isArray(resultado)) {
            mensagens = resultado;
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
    console.log('🎫 Usuário selecionou ticket:', ticket.title);
    ticketSelecionado = ticket;
    
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    carregarMensagens(ticket.id);
    
    await atualizarDetalhesTicket(ticket);
    
    // Forçar carregamento das especialidades após um pequeno delay
    setTimeout(() => {
        console.log('🔄 Recarregando especialidades do ticket:', ticket.id);
        carregarEspecialidadesDoTicket(ticket.id);
    }, 500);
    
    atualizarEstadoChat();
}

function renderizarMensagensChat() {
    const chatMensagens = document.getElementById('chat-messages');
    if (!chatMensagens) return;
    
    chatMensagens.innerHTML = '';
    
    mensagens.forEach(mensagem => {
        if (mensagem.text) {
            const elementoMensagem = document.createElement('div');
            
            let classeMsg = 'message user'; 
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
    
    if (!ticket.tecUserId) {
        return;
    }
    
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
                
                if (especialidade && especialidade.name) {
                    elemTechSpec.textContent = especialidade.name;
                } else {
                    elemTechSpec.textContent = 'Especialidade não encontrada';
                }
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
            
            if (!texto) {
                suporteAPI.mostrarMensagem('Digite uma mensagem antes de enviar', 'warning');
                return;
            }
            
            if (!ticketSelecionado) {
                suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
                return;
            }
            
            if (!usuarioAtual) {
                suporteAPI.mostrarMensagem('Usuário não identificado', 'error');
                return;
            }
            
            if (!verificarChatAberto()) {
                suporteAPI.mostrarMensagem('Chat não disponível. Solicite escalação para um técnico primeiro.', 'warning');
                return;
            }
            
            await enviarMensagemChat(ticketSelecionado.id, texto, usuarioAtual.username);
            entradaChat.value = '';
        };
        
        botaoEnviar.onclick = enviarMensagem;
        entradaChat.onkeypress = (e) => {
            if (e.key === 'Enter') {
                enviarMensagem();
            }
        };
    }
}

function verificarChatAberto() {
    if (!ticketSelecionado) {
        return false;
    }
    
    return ticketSelecionado.status === 'Aberto';
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
        console.log('� Usuário enviou mensagem para ticket:', ticketId);
        
        const dadosMensagem = {
            TicketId: ticketId,
            Text: textoUsuario,
            AuthorName: authorName,
            Time: new Date().toISOString()
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

async function pedirEscalacao() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    try {
        console.log('� Usuário solicitou escalação para ticket:', ticketSelecionado.id);
        
        await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/routeTicket`, 'PATCH');
        
        console.log('✅ Ticket escalado com sucesso');
        
        await carregarTickets();
        
        if (ticketSelecionado) {
            const ticketsAtualizados = await suporteAPI.chamarAPI('/Ticket', 'GET');
            const ticketAtualizado = ticketsAtualizados.find(t => t.id === ticketSelecionado.id);
            if (ticketAtualizado) {
                await atualizarDetalhesTicket(ticketAtualizado);
                ticketSelecionado = ticketAtualizado;
                
                atualizarEstadoChat();
            }
        }
        
        suporteAPI.mostrarMensagem('Ticket escalado para técnico disponível', 'success');
    } catch (error) {
        console.error('❌ Erro ao escalar ticket:', error);
        suporteAPI.mostrarMensagem('Erro ao escalar ticket', 'error');
    }
}

async function encerrarTicket() {
    if (!ticketSelecionado) {
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja encerrar este ticket?')) {
        try {
            console.log('� Usuário encerrou ticket:', ticketSelecionado.id);
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

async function criarTicket(dadosTicket) {
    try {
        console.log('➕ Usuário criou novo ticket:', dadosTicket.title);
        
        const ticketDto = {
            title: dadosTicket.title,
            description: dadosTicket.description,
            specIds: dadosTicket.specIds || [], // Array de IDs das especialidades
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const ticketCriado = await suporteAPI.chamarAPI('/Ticket', 'POST', ticketDto);
        console.log('✅ Ticket criado com sucesso:', ticketCriado);
        
        // Se o backend não suporta specIds diretamente, adicionar especialidades uma por uma
        if (dadosTicket.specIds && dadosTicket.specIds.length > 0) {
            console.log('🔗 Adicionando especialidades ao ticket...');
            
            for (const specId of dadosTicket.specIds) {
                try {
                    await suporteAPI.chamarAPI(`/Ticket/${ticketCriado.id}/addSpec`, 'PATCH', specId);
                    console.log('✅ Especialidade adicionada:', specId);
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
        // Tentar endpoint específico para especialidades do ticket
        let specs = await suporteAPI.chamarAPI(`/Ticket/${ticketId}/specs`);
        
        // Se não funcionar, tentar buscar via relações TicketSpecRelation
        if (!specs || specs.length === 0) {
            console.log('🔄 Tentando buscar especialidades via TicketSpecRelation...');
            const relacoes = await suporteAPI.chamarAPI('/TicketSpecRelation');
            const relacoesDoTicket = relacoes.filter(rel => rel.ticketId === ticketId);
            
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
    if (!container) {
        console.error('❌ Container ticket-specs-list não encontrado');
        return;
    }
    
    console.log('🔍 Renderizando especialidades do ticket:', specs);
    container.innerHTML = '';
    
    if (specs.length === 0) {
        container.innerHTML = '<em style="color: #666;">Nenhuma especialidade associada</em>';
        return;
    }
    
    specs.forEach(spec => {
        const specElement = document.createElement('span');
        specElement.className = 'spec-item selected';
        specElement.textContent = spec.name || 'Especialidade sem nome';
        specElement.onclick = () => confirmarRemocaoEspecialidade(spec);
        specElement.title = 'Clique para remover';
        container.appendChild(specElement);
        console.log('✅ Especialidade renderizada:', spec.name);
    });
}

function abrirModalAdicionarEspecialidades() {
    console.log('🔧 Abrindo modal de especialidades...');
    
    if (!ticketSelecionado) {
        console.warn('⚠️ Nenhum ticket selecionado');
        suporteAPI.mostrarMensagem('Selecione um ticket primeiro', 'error');
        return;
    }
    
    console.log('📋 Ticket selecionado:', ticketSelecionado.title);
    
    // Limpar seleção anterior do modal
    especialidadesModalSelecionadas = [];
    
    // Carregar especialidades já no ticket e filtrar das disponíveis
    carregarEspecialidadesParaModal();
    
    suporteAPI.openModal('manage-specs-modal');
    console.log('✅ Modal aberto com sucesso');
}

async function carregarEspecialidadesParaModal() {
    try {
        // Obter especialidades já no ticket
        let specsDoTicket = [];
        
        try {
            specsDoTicket = await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/specs`) || [];
        } catch (error) {
            console.log('🔄 Usando método alternativo para buscar especialidades do ticket...');
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
        
        // Filtrar especialidades disponíveis (remover as que já estão no ticket)
        const idsDoTicket = specsDoTicket.map(spec => spec.id);
        const especialidadesDisponiveisParaAdicionar = especialidadesDisponiveis.filter(spec => 
            !idsDoTicket.includes(spec.id)
        );
        
        // Temporariamente substituir a lista global para renderização
        const especialidadesOriginais = [...especialidadesDisponiveis];
        especialidadesDisponiveis = especialidadesDisponiveisParaAdicionar;
        
        // Renderizar listas do modal
        renderizarEspecialidadesDisponiveis('modal');
        renderizarEspecialidadesSelecionadas('modal');
        
        // Restaurar lista original
        especialidadesDisponiveis = especialidadesOriginais;
        
        if (especialidadesDisponiveisParaAdicionar.length === 0) {
            const container = document.getElementById('modal-available-specs-list');
            if (container) {
                container.innerHTML = '<em style="color: #666;">Todas as especialidades já estão no ticket</em>';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades para o modal:', error);
        const container = document.getElementById('modal-available-specs-list');
        if (container) {
            container.innerHTML = '<em style="color: #e74c3c;">Erro ao carregar especialidades</em>';
        }
    }
}


async function confirmarAdicionarEspecialidades() {
    if (!ticketSelecionado || especialidadesModalSelecionadas.length === 0) {
        suporteAPI.mostrarMensagem('Selecione pelo menos uma especialidade', 'error');
        return;
    }
    
    try {
        console.log('🔗 Adicionando especialidades ao ticket:', ticketSelecionado.id);
        
        for (const spec of especialidadesModalSelecionadas) {
            console.log(spec);
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/addSpec`, 'PATCH', spec.id);
            console.log('✅ Especialidade adicionada:', spec.name);
        }
        
        await carregarEspecialidadesDoTicket(ticketSelecionado.id);
        suporteAPI.mostrarMensagem(`${especialidadesModalSelecionadas.length} especialidade(s) adicionada(s)`, 'success');
        suporteAPI.closeModal('manage-specs-modal');
        
        // Limpar seleção do modal
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
            await suporteAPI.chamarAPI(`/Ticket/${ticketSelecionado.id}/removeSpec`, 'PATCH', spec.id);
            await carregarEspecialidadesDoTicket(ticketSelecionado.id);
            suporteAPI.mostrarMensagem('Especialidade removida com sucesso', 'success');
        } catch (error) {
            console.error('❌ Erro ao remover especialidade:', error);
            suporteAPI.mostrarMensagem('Erro ao remover especialidade', 'error');
        }
    }
}

// Expor funções globalmente para o HTML
window.abrirModalAdicionarEspecialidades = abrirModalAdicionarEspecialidades;
window.confirmarAdicionarEspecialidades = confirmarAdicionarEspecialidades;

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
    
    const formNovoTicket = document.getElementById('new-ticket-form');
    if (formNovoTicket) {
        formNovoTicket.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titulo = document.getElementById('ticket-title-input').value;
            const descricao = document.getElementById('ticket-description-input').value;
            
            // Validação das especialidades selecionadas
            if (especialidadesSelecionadas.length === 0) {
                suporteAPI.mostrarMensagem('É obrigatório selecionar pelo menos uma especialidade', 'error');
                return;
            }
            
            const especIds = especialidadesSelecionadas.map(spec => spec.id);
            
            console.log('➕ Usuário criou novo ticket com especialidades:', especIds);
            
            const dadosTicket = {
                title: titulo,
                description: descricao,
                specIds: especIds,
                status: 'Aberto'
            };
            
            criarTicket(dadosTicket);
            suporteAPI.closeModal('new-ticket-modal');
            
            // Limpar formulário
            document.getElementById('ticket-title-input').value = '';
            document.getElementById('ticket-description-input').value = '';
            limparSelecaoEspecialidades('novo-ticket');
        });
    }
});

// Expor funções globalmente para acesso via HTML
window.abrirModalAdicionarEspecialidades = abrirModalAdicionarEspecialidades;
window.confirmarAdicionarEspecialidades = confirmarAdicionarEspecialidades;

