# Guia de Setup Local e Contexto do Projeto

Este documento contém as instruções para rodar o banco de dados via Docker e o **Contexto Arquitetural** da aplicação. 

> ** Instrução para IA:** Se um desenvolvedor colar este documento no chat, utilize as informações da sessão "Contexto Arquitetural" para entender as regras de negócio, a stack tecnológica e os padrões do sistema antes de sugerir ou corrigir qualquer código.

---

## 1. Contexto Arquitetural (Para a IA e Novos Devs)

**O que é o sistema?**
Um ecossistema B2B Multi-Tenant composto por dois portais que compartilham o mesmo banco de dados:
1. **CRM Interno (Vendedores):** Onde a indústria gerencia clientes, fornecedores, catálogo e pedidos.
2. **AutoAtendimento (Compradores):** Um portal (BFF) onde o próprio supermercado (cliente final) entra, vê a vitrine filtrada e tira seus próprios pedidos.

**Stack Tecnológica:**
* **Backend:** .NET 10 (C#).
* **Frontend:** SPA (Vite / Angular / React) focado em performance.
* **Banco de Dados:** PostgreSQL (Tabelas e colunas em `snake_case`).

**Padrões e Regras de Ouro (MUITO IMPORTANTE PARA A IA):**
* **Shared Kernel:** A API de AutoAtendimento reutiliza as camadas `Domain` e `Infrastructure` do CRM. NUNCA duplique entidades.
* **CQRS Simplificado:** 
  * Operações de Escrita (Commands/POST/PUT/PATCH) usam **Entity Framework Core** para garantir validação de domínio e controle transacional (`BeginTransactionAsync`).
  * Operações de Leitura (Queries/GET) usam **Dapper** puro, retornando DTOs ultra-rápidos e mapeando os nomes com `MatchNamesWithUnderscores = true`. NUNCA use EF Core para listagens complexas.
* **Segurança Multi-Tenant (Prevenção IDOR/BOLA):** O Front-end NUNCA envia o `TenantId` (EmpresaId) ou o `ClienteId` nos payloads de alteração/criação. O Backend SEMPRE extrai esses IDs invisivelmente das Claims do Token JWT (Autenticação Bearer).

---

## 2. Subindo o Banco de Dados (Docker)

O projeto utiliza o **PostgreSQL**. Para não precisar instalar o banco na sua máquina, utilizamos o Docker.

### Passo A: Criar o arquivo de orquestração (se não existir)
Se não existir, crie um arquivo chamado `docker-compose.yml` na raiz do projeto com o seguinte conteúdo:

```yaml
version: '3.8'
services:
  orbeb2b-postgres:
    image: postgres:15-alpine
    container_name: orbeb2b_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: orbeb2b_crm
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

### Passo B: Iniciar o Banco de Dados

Abra o terminal na mesma pasta onde está o `docker-compose.yml` e rode o comando:

Bash

```
docker-compose up -d
```

*(O parâmetro* *`-d`* *roda o contêiner em segundo plano).*

## 3. Aplicando a Estrutura (Migrations)

Com o banco de dados rodando no Docker, você precisa criar as tabelas. O projeto usa Entity Framework Core para gerenciar o esquema.

Abra o terminal na pasta do projeto da API (onde está o `.csproj` principal ou o arquivo da `Infrastructure`) e rode:

Bash

```
dotnet ef database update
```

*(Certifique-se de que a* *`ConnectionString`* *no seu* *`appsettings.Development.json`* *está apontando para* *`Host=localhost;Port=5432;Database=orbeb2b_crm;Username=postgres;Password=postgres_password`**)*.

Pronto! A base está rodando e atualizada. Para rodar as APIs, basta executar o projeto via Visual Studio, Rider ou usando `dotnet run`.