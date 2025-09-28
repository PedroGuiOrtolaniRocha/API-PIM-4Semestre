# SuporteAPI

API desenvolvida para gerenciamento de tickets, usuários, mensagens e integração com agente de IA.

## Requisitos

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- Git

## Passo a passo para instalar e rodar

1. **Clone o repositório**
   ```sh
   git clone https://github.com/seu-usuario/API-PIM-4Semestre.git
   cd API-PIM-4Semestre/SuporteAPI/SuporteAPI
   ```

2. **Restaure os pacotes**
   ```sh
   dotnet restore
   ```

3. **Configure o ambiente**
   - Edite o arquivo `appsettings.Development.json` com suas configurações de banco de dados e chaves de API, se necessário.

4. **Compile o projeto**
   ```sh
   dotnet build
   ```

5. **Execute a API**
   ```sh
   dotnet run
   ```
   Acesse em `http://localhost:5262`.

## Testes de Endpoints

- Utilize o arquivo `SuporteAPI.http`, ferramentas como Postman ou acesse [https://localhost:7096/index.html](https://localhost:7096/index.html) para testar os endpoints da API.

## Estrutura do Projeto

- **Controllers/**: Endpoints da API
- **Models/**: Modelos de dados
- **Utils/**: Utilitários
- **Repositorys/**: Interfaces de repositório

## Documentação

- Acesse a documentação Swagger em `http://localhost:5262` após iniciar o projeto.

---