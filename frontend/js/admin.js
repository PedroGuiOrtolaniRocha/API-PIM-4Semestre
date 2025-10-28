let adminAtual = null;
let usuarios = [];
let especialidades = [];
let registrosTecnicos = [];

function inicializarPagina() {
    console.log('🚀 Inicializando página do administrador');
    
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
                
                adminAtual = {
                    id: dadosUsuario.id || 3,
                    username: dadosUsuario.email,
                    role: dadosUsuario.role || 'Admin'
                };
                console.log('✅ Administrador autenticado:', adminAtual.username);
            } catch (error) {
                console.error('❌ Erro ao carregar dados do administrador:', error);
                adminAtual = {
                    id: 3,
                    username: 'Admin Demo',
                    role: 'Admin'
                };
                console.log('⚠️ Usando dados demo devido a erro');
            }
        } else {
            console.log('⚠️ Nenhum dado de usuário encontrado nos cookies nem localStorage - usando dados demo');
            adminAtual = {
                id: 3,
                username: 'Admin Demo',
                role: 'Admin'
            };
        }
        
        finalizarInicializacaoAdmin();
    }, 100);
}

function finalizarInicializacaoAdmin() {
    const infoUsuario = document.querySelector('.user-info span');
    if (infoUsuario) {
        infoUsuario.textContent = adminAtual.username;
    }
    
    carregarUsuarios();
    carregarEspecialidades();
    carregarRegistrosTecnicos();
}

async function carregarUsuarios() {
    try {
        console.log('👥 Carregando lista de usuários');
        usuarios = await suporteAPI.chamarAPI('/User');
        console.log('✅ Usuários carregados:', usuarios.length);
        renderizarTabelaUsuarios();
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar usuários', 'error');
    }
}

async function carregarEspecialidades() {
    try {
        console.log('🔧 Carregando especialidades');
        especialidades = await suporteAPI.chamarAPI('/Spec');
        console.log('✅ Especialidades carregadas:', especialidades.length);
        renderizarListaEspecialidades();
    } catch (error) {
        console.error('❌ Erro ao carregar especialidades:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar especialidades', 'error');
    }
}

async function carregarRegistrosTecnicos() {
    try {
        console.log('📋 Carregando registros técnicos');
        registrosTecnicos = await suporteAPI.chamarAPI('/TecRegister');
        console.log('✅ Registros técnicos carregados:', registrosTecnicos.length);
    } catch (error) {
        console.error('❌ Erro ao carregar registros técnicos:', error);
        suporteAPI.mostrarMensagem('Erro ao carregar registros técnicos', 'error');
    }
}

function renderizarTabelaUsuarios() {
    const corpoTabela = document.getElementById('users-table-body');
    if (!corpoTabela) return;
    
    corpoTabela.innerHTML = '';
    console.log('Renderizando', usuarios.length, 'usuários na tabela');

    usuarios.forEach(usuario => {
        const especsUsuario = obterEspecialidadesUsuario(usuario.id);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.username}</td>
            <td>${usuario.email}</td>
            <td>${obterNomeFuncao(usuario.role)}</td>
            <td>${especsUsuario.join(', ') || '-'}</td>
            <td>
                <button class="action-btn btn-primary" onclick="editarUsuario(${usuario.id})" style="padding: 0.3rem 0.6rem; margin-right: 0.3rem;">
                    Editar
                </button>
                ${usuario.role === 'Technician' ? 
                    `<button class="action-btn btn-warning" onclick="gerenciarEspecsUsuario(${usuario.id}, '${usuario.username}')" style="padding: 0.3rem 0.6rem;">
                        Especialidades
                    </button>` : ''
                }
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}

function renderizarListaEspecialidades() {
    const listaEspecs = document.getElementById('specs-list');
    if (!listaEspecs) return;
    
    listaEspecs.innerHTML = '';
    console.log('Renderizando', especialidades.length, 'especialidades');

    especialidades.forEach(spec => {
        const elementoSpec = document.createElement('div');
        elementoSpec.className = 'detail-item';
        elementoSpec.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;">
                <div>
                    <strong>${spec.name}</strong>
                    <br>
                    <small style="color: #666;">${spec.description || 'Sem descrição'}</small>
                </div>
                <button class="btn-danger" onclick="excluirEspecialidade(${spec.id})" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">
                    Excluir
                </button>
            </div>
        `;
        listaEspecs.appendChild(elementoSpec);
    });
}

function obterEspecialidadesUsuario(userId) {
    return registrosTecnicos
        .filter(rt => rt.userId === userId)
        .map(rt => {
            const spec = especialidades.find(s => s.id === rt.specId);
            return spec ? spec.name : 'Especialidade desconhecida';
        });
}

function obterNomeFuncao(role) {
    const nomesFuncoes = {
        'User': 'Colaborador',
        'Technician': 'Técnico',
        'Admin': 'Administrador'
    };
    return nomesFuncoes[role] || role;
}

async function criarUsuario(dadosUsuario) {
    try {
        console.log('👤 Criando novo usuário:', dadosUsuario.username);
        await suporteAPI.chamarAPI('/User', 'POST', dadosUsuario);
        console.log('✅ Usuário criado com sucesso');
        await carregarUsuarios();
        suporteAPI.mostrarMensagem('Usuário criado com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        suporteAPI.mostrarMensagem('Erro ao criar usuário', 'error');
    }
}

async function atualizarUsuario(userId, dadosUsuario) {
    try {
        console.log('✏️ Atualizando usuário:', userId);
        await suporteAPI.chamarAPI('/User', 'PATCH', dadosUsuario);
        console.log('✅ Usuário atualizado com sucesso');
        await carregarUsuarios();
        suporteAPI.mostrarMensagem('Usuário atualizado com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        suporteAPI.mostrarMensagem('Erro ao atualizar usuário', 'error');
    }
}

function editarUsuario(userId) {
    const usuario = usuarios.find(u => u.id === userId);
    if (!usuario) {
        console.error('Usuário não encontrado:', userId);
        return;
    }

    console.log('Editando usuário:', usuario.username);
    document.getElementById('edit-user-id').value = usuario.id;
    document.getElementById('edit-user-username').value = usuario.username;
    document.getElementById('edit-user-email').value = usuario.email;
    document.getElementById('edit-user-role').value = usuario.role;

    suporteAPI.abrirModal('edit-user-modal');
}

async function gerenciarEspecsUsuario(userId, username) {
    console.log('Gerenciando especialidades do usuário:', username);
    document.getElementById('modal-tech-id').value = userId;
    document.getElementById('modal-tech-name').textContent = username;

    const divEspecsDisponiveis = document.getElementById('available-specs');
    divEspecsDisponiveis.innerHTML = '';

    const idsEspecsUsuario = registrosTecnicos
        .filter(rt => rt.userId === userId)
        .map(rt => rt.specId);

    especialidades.forEach(spec => {
        const estaAtribuida = idsEspecsUsuario.includes(spec.id);
        const elementoSpec = document.createElement('div');
        elementoSpec.innerHTML = `
            <label style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <input type="checkbox" ${estaAtribuida ? 'checked' : ''} 
                       onchange="alternarEspecUsuario(${userId}, ${spec.id}, this.checked)"
                       style="margin-right: 0.5rem;">
                <span><strong>${spec.name}</strong> - ${spec.description || 'Sem descrição'}</span>
            </label>
        `;
        divEspecsDisponiveis.appendChild(elementoSpec);
    });

    suporteAPI.abrirModal('manage-specs-modal');
}

async function alternarEspecUsuario(userId, specId, estaAtribuida) {
    try {
        if (estaAtribuida) {
            console.log('Adicionando especialidade', specId, 'ao usuário', userId);
            await suporteAPI.chamarAPI('/TecRegister', 'POST', {
                userId: userId,
                specId: specId
            });
        } else {
            console.log('Removendo especialidade', specId, 'do usuário', userId);
            const registroTecnico = registrosTecnicos.find(rt => rt.userId === userId && rt.specId === specId);
            if (registroTecnico) {
                await suporteAPI.chamarAPI(`/TecRegister/${registroTecnico.id}`, 'DELETE');
            }
        }
        
        await carregarRegistrosTecnicos();
        await carregarUsuarios();
        suporteAPI.mostrarMensagem('Especialidade atualizada com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao alterar especialidade do usuário:', error);
        suporteAPI.mostrarMensagem('Erro ao alterar especialidade', 'error');
    }
}

async function criarEspecialidade(dadosEspec) {
    try {
        console.log('Criando nova especialidade:', dadosEspec.name);
        await suporteAPI.chamarAPI('/Spec', 'POST', dadosEspec);
        await carregarEspecialidades();
        suporteAPI.mostrarMensagem('Especialidade criada com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao criar especialidade:', error);
        suporteAPI.mostrarMensagem('Erro ao criar especialidade', 'error');
    }
}

async function excluirEspecialidade(specId) {
    if (!confirm('Tem certeza que deseja excluir esta especialidade?')) {
        return;
    }

    try {
        console.log('Excluindo especialidade:', specId);
        await suporteAPI.chamarAPI(`/Spec/${specId}`, 'DELETE');
        await carregarEspecialidades();
        await carregarRegistrosTecnicos();
        await carregarUsuarios();
        suporteAPI.mostrarMensagem('Especialidade excluída com sucesso', 'success');
    } catch (error) {
        console.error('Erro ao excluir especialidade:', error);
        suporteAPI.mostrarMensagem('Erro ao excluir especialidade', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarPagina();
    
    const formNovoUsuario = document.getElementById('new-user-form');
    if (formNovoUsuario) {
        formNovoUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dadosUsuario = {
                username: document.getElementById('user-username').value,
                email: document.getElementById('user-email').value,
                passwordHash: document.getElementById('user-password').value,
                role: document.getElementById('user-role').value
            };
            
            criarUsuario(dadosUsuario);
            suporteAPI.fecharModal('new-user-modal');
            
            formNovoUsuario.reset();
        });
    }

    const formEditarUsuario = document.getElementById('edit-user-form');
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('edit-user-id').value;
            const dadosUsuario = {
                username: document.getElementById('edit-user-username').value,
                email: document.getElementById('edit-user-email').value,
                role: document.getElementById('edit-user-role').value
            };
            
            atualizarUsuario(userId, dadosUsuario);
            suporteAPI.fecharModal('edit-user-modal');
        });
    }

    const formNovaSpec = document.getElementById('new-spec-form');
    if (formNovaSpec) {
        formNovaSpec.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dadosSpec = {
                name: document.getElementById('spec-name').value,
                description: document.getElementById('spec-description').value
            };
            
            criarEspecialidade(dadosSpec);
            suporteAPI.fecharModal('new-spec-modal');
            
            formNovaSpec.reset();
        });
    }
});