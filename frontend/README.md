# Frontend - Sistema de Suporte

Este diretório contém as páginas HTML, CSS e JavaScript do sistema de suporte.

## Estrutura dos Arquivos

### Páginas Principais
- `index.html` - Página de login com contas de demonstração
- `colaborador.html` - Interface para colaboradores (usuários finais)
- `tecnico.html` - Interface para técnicos de suporte
- `admin.html` - Interface para administradores do sistema

### Recursos
- `css/styles.css` - Estilos CSS compartilhados
- `js/comum.js` - Funções JavaScript comuns (API calls, utilitários)
- `js/colaborador.js` - Lógica específica da página do colaborador
- `js/tecnico.js` - Lógica específica da página do técnico
- `js/admin.js` - Lógica específica da página do administrador

## Como Usar

### 1. Servir os Arquivos
Para testar as páginas, você pode usar um servidor HTTP simples:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver http-server instalado)
npx http-server

# PHP
php -S localhost:8000
```

### 2. Acessar o Sistema
1. Abra `http://localhost:8000` no navegador
2. Use uma das contas de demonstração disponíveis na tela de login
3. Navegue pelas diferentes interfaces conforme o tipo de usuário

### 3. Contas de Demonstração

**Colaborador:**
- Email: `user@example.com`
- Senha: `user123`
- Acesso: Interface de criação e acompanhamento de tickets

**Técnico:**
- Email: `tecnico@example.com` 
- Senha: `tech123`
- Acesso: Interface de resolução de tickets atribuídos

**Administrador:**
- Email: `admin@example.com`
- Senha: `admin123`
- Acesso: Gerenciamento de usuários e especialidades

## Funcionalidades por Tela

### Tela Colaborador (`colaborador.html`)
- **Região Esquerda:** Lista de tickets abertos pelo usuário
- **Região Central:** Chat com histórico de mensagens (usuário, bot, técnico)
- **Região Direita:** Detalhes do ticket e ações (escalar, encerrar)

### Tela Técnico (`tecnico.html`)
- **Região Esquerda:** Lista de tickets atribuídos ao técnico
- **Região Central:** Histórico completo do chat
- **Região Direita:** Informações do colaborador e campo para resolução

### Tela Admin (`admin.html`)
- **Região Esquerda:** Tabela de usuários com opções de edição
- **Região Direita:** Lista de especialidades cadastradas

## Integração com API

As páginas estão configuradas para fazer chamadas para a API em `http://localhost:5000`. Para conectar com a API real:

1. Certifique-se que a SuporteAPI está rodando na porta 5000
2. Configure CORS na API para aceitar requisições do frontend
3. Ajuste a constante `API_BASE_URL` em `js/app.js` se necessário

## Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **CSS3** - Estilos e layout responsivo
- **JavaScript ES6+** - Lógica do frontend e chamadas de API
- **Fetch API** - Comunicação com o backend
- **Local Storage** - Simulação de sessão do usuário

## Observações Importantes

- Este é um frontend de **demonstração acadêmica**
- A autenticação é simulada (não há verificação real de senhas)
- Os dados são carregados via chamadas de API mockadas
- Em produção, implementar autenticação JWT adequada
- Adicionar validações de segurança e tratamento de erros mais robusto