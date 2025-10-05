
# SuporteAPI

API para gerenciamento de tickets, usuários, técnicos, mensagens e integração com IA.

## Requisitos

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server
- Git


## Testes de Endpoints

- Utilize o arquivo `SuporteAPI.http`, Postman ou acesse [https://localhost:7096/index.html](https://localhost:7096/index.html) para testar os endpoints.

## Estrutura do Projeto

- **Controllers/**: Endpoints da API
- **Models/**: Modelos de dados
- **Repositorys/**: Repositórios de acesso a dados
- **Service/**: Lógica de negócio
- **Interface/**: Interfaces dos repositórios e serviços
- **DTO/**: Objetos de transferência de dados
- **Utils/**: Utilitários

## Diagramas

- Utilize a ferramenta https://www.plantuml.com/plantuml/uml/ para interpretar os arquivos .platuml

## Documentação

- Acesse a documentação Swagger em `http://localhost:5262` após iniciar o projeto.