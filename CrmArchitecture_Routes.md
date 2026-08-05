# 🏛️ Documentação de Arquitetura e Rotas - OrbeB2B CRM 

Este documento descreve a arquitetura, as decisões de design (ADR) e o catálogo de rotas da API do CRM B2B. Ele serve como base de conhecimento técnico obrigatória para manutenção e evolução do sistema.

---

## 1. Stack Tecnológica
*   **Plataforma:** .NET 10 (C#)
*   **Banco de Dados:** PostgreSQL (padrão `snake_case` nas tabelas e colunas).
*   **ORM (Escrita/Commands):** Entity Framework Core 10.
*   **Micro-ORM (Leitura/Queries):** Dapper.
*   **Autenticação:** JWT (JSON Web Tokens) com BCrypt para hash de senhas.

---

## 2. Decisões Arquiteturais e Padrões (Regras de Ouro)

### 2.1. Arquitetura
O sistema utiliza **Clean Architecture** dividida em: `Domain`, `Application`, `Infrastructure` e `API`. Aplicamos os conceitos de **DDD (Domain-Driven Design)** onde as entidades são "Ricas" (possuem comportamentos e regras internas, ex: método `CalcularValorTotal` dentro de `Pedido`).
*   **Construtores Fechados:** Entidades geram seus próprios `Guid.NewGuid()` internamente e não possuem `setters` públicos (uso de `private set` ou `init`).

### 2.2. Isolamento Multi-Tenant
*   Exceto pela rota de criação de Empresa (Onboarding), o front-end **NUNCA** envia o `EmpresaId` (TenantId) no payload (JSON).
*   O `TenantId` é extraído de forma silenciosa e segura nos Controllers a partir da Claim do JWT: `User.FindFirst("TenantId")?.Value`.

### 2.3. Padrão CQRS Simplificado
*   **Comandos (POST/PUT/DELETE):** Feitos via **EF Core**. Garantem a validação de regras de negócio, bloqueio de duplicidades (ex: CNPJ duplicado) e transações seguras (`BeginTransactionAsync` para inserts múltiplos, como Pedido + Itens).
*   **Consultas (GET):** Feitas via **Dapper**. Utilizam SQL nativo altamente otimizado retornando DTOs (`records`). O Dapper está configurado com `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true`, eliminando a necessidade de *aliases* no SQL, exceto para resolução de nomes duplicados em JOINs (ex: `cidades.nome AS NomeCidade`).

### 2.4. Regra de Chaves Estrangeiras Nulas
*   No mapeamento Fluent API (EF Core), toda chave estrangeira opcional (como `Guid? ClienteId` em Usuários) **deve** usar `.IsRequired(false)`. Isso impede que o Change Tracker do EF Core envie um `Guid.Empty` para o banco de dados, o que causaria erro de violação de Foreign Key no PostgreSQL.

---

## 3. Catálogo de Rotas e Módulos Implementados

### 🏢 Módulo 1: Onboarding e Tenant (Empresa)
Responsável pelo nascimento do ecossistema SaaS.
*   `POST /api/empresas` **(Sem Token / AllowAnonymous)**
    *   **Funcionalidade:** Cria a matriz SaaS.
    *   **Regra:** Não exige JWT pois o Tenant está nascendo. Valida se o CNPJ já existe na base geral.
*   `GET /api/empresas` **(Exige Token)**
    *   **Funcionalidade:** Lista as empresas (visão administrativa). Faz JOIN com cidades e estados via Dapper.

### 👥 Módulo 2: Acessos e Equipe (Usuários e EmpresaFuncionario)
Gestão de quem acessa o sistema e qual o seu papel no Tenant.
*   `POST /api/usuarios`
    *   **Funcionalidade:** Cria um usuário (credenciais) e automaticamente cria o vínculo na tabela `empresa_funcionarios` (cargo/departamento) atrelando ao Tenant.
    *   **Regra:** Grava o `cliente_id` como `NULL` (pois trata-se de funcionário interno, não B2B). Protegido por Transaction EF Core.
*   `GET /api/equipe`
    *   **Funcionalidade:** Lista os funcionários da empresa logada.
    *   **Regra:** JOIN entre `empresa_funcionarios` e `usuarios`, filtrando pelo Tenant do JWT.

### 🤝 Módulo 3: Clientes B2B
A carteira de clientes que a indústria atende.
*   `POST /api/clientes`
    *   **Funcionalidade:** Cadastra um novo cliente amarrado à empresa do usuário logado.
    *   **Regra:** Valida para impedir CNPJ duplicado *dentro* do mesmo Tenant.
*   `GET /api/clientes`
    *   **Funcionalidade:** Listagem rápida de clientes, formatando o Endereço (JOIN com tabelas `cidade` e `estado`).

### 📦 Módulo 4: Catálogo (Fornecedores, Categorias e Produtos)
A base para a geração de vendas.
*   `POST / GET /api/categorias`: Gestão de categorias do catálogo (valida nome duplicado no Tenant).
*   `POST / GET /api/fornecedores`: Gestão de fornecedores (usando CNPJ).
*   `POST /api/produtos`
    *   **Funcionalidade:** Cadastra os itens de venda.
    *   **Regra:** Exige as FKs `CategoriaId` e `FornecedorId`. Bloqueia `CodigoComercial` (SKU) duplicado por Tenant.
*   `GET /api/produtos`
    *   **Funcionalidade:** Lista o catálogo. JOIN com `categorias` e `fornecedores` para trazer os nomes em vez de IDs.

### 🛒 Módulo 5: Motor de Vendas (Pedidos)
O coração transacional (Agregado Master-Detail do DDD).
*   `POST /api/pedidos`
    *   **Funcionalidade:** Cria a "Capa" do pedido e adiciona múltiplos "Itens" (`PedidoItem`) numa tacada só.
    *   **Regra de Domínio:** A entidade `Pedido` calcula automaticamente o `ValorTotalPedido` ao adicionar os itens. O array de itens vem do front-end apenas com ID, Quantidade e Preço Unitário.
    *   **Regra de Banco:** Usa `BeginTransactionAsync`. Se a inserção de um item falhar, a capa do pedido não é gerada no banco (Rollback).
    *   **Status Iniciais:** Nasce como `APP` (Origem), `AguardandoValidacao` (Logística) e `Pendente` (ERP).
*   `GET /api/pedidos`
    *   **Funcionalidade:** Traz o resumo dos pedidos de vendas (ID formatado, Nome do Cliente, Valor Total e Status) ordenado do mais recente para o mais antigo.

### 🔒 Módulo 6: Autenticação & Segurança (JWT)
*   `POST /api/auth/login` (AllowAnonymous)
    *   **Funcionalidade:** Autentica credenciais e emite o Token JWT com os dados da sessão.
    *   **Fluxo:** Dapper busca UsuarioAuthModel -> BCrypt.Verify -> Valida EstaAtivo -> Emite JWT com as claims:
        *   `ClaimTypes.NameIdentifier` (UsuarioId)
        *   `ClaimTypes.Email`
        *   `ClaimTypes.Role` (NomePerfil)
        *   `"TenantId"` (EmpresaId)

*************************************

# 🏛️ Documentação de Arquitetura e Rotas - OrbeB2B CRM 

Este documento descreve a arquitetura, as decisões de design (ADR) e o catálogo de rotas da API do CRM B2B. Ele serve como base de conhecimento técnica obrigatória para o Front-end e novos desenvolvedores.

---

## 1. Stack Tecnológica
*   **Plataforma:** .NET 10 (C#)
*   **Banco de Dados:** PostgreSQL (padrão `snake_case`).
*   **ORM (Escrita/Commands):** Entity Framework Core 10.
*   **Micro-ORM (Leitura/Queries):** Dapper (`MatchNamesWithUnderscores = true`).
*   **Autenticação:** JWT (JSON Web Tokens) com BCrypt para hash de senhas.

---

## 2. Decisões Arquiteturais (Regras de Ouro)
*   **CQRS Simplificado:** EF Core gerencia comandos (POST/PUT/PATCH) com transações e validações de regras de negócios. Dapper gerencia consultas (GET) retornando DTOs ultra-rápidos sem sobrecarregar o Change Tracker.
*   **Segurança Multi-Tenant:** O payload do Front-end NUNCA envia o `TenantId` (`EmpresaId`). O Backend extrai esse dado das Claims do JWT de forma invisível.
*   **Prevenção de IDOR:** Endpoints de alteração (`PATCH`, `PUT`) filtram o ID do recurso cruzando com o `EmpresaId` do JWT. Se houver tentativa de acessar dados de outro Tenant, a API retorna `404 Not Found` (mascarando a existência do registro).
*   **Domínio Rico (DDD):** Entidades são responsáveis por sua própria inteligência (ex: recálculo de valor total de pedidos ao adicionar itens).

---

## 3. Catálogo de Rotas (Módulos)

### 🏢 Módulo 1: Onboarding (Empresa)
*   `POST /api/empresas` **[AllowAnonymous]** - Cria um novo Tenant (Matriz).
*   `GET /api/empresas` **[Authorize]** - Lista os Tenants.

### 🔑 Módulo 2: Autenticação (Login)
*   `POST /api/auth/login` **[AllowAnonymous]**
    *   **Ação:** Valida E-mail e Senha (BCrypt). Se inativo, retorna `403`.
    *   **Retorno:** JWT contendo `UsuarioId`, `Email`, `NomePerfil` e `TenantId`.

### 👥 Módulo 3: Equipe (Usuários)
*   `POST /api/usuarios` - Cria acesso interno e vincula ao Tenant.
*   `GET /api/equipe` - Lista os funcionários do Tenant logado.

### 🤝 Módulo 4: Clientes B2B
*   `POST /api/clientes` - Cadastra um cliente.
*   `GET /api/clientes` - Lista os clientes (com formatação de Endereço via JOIN).

### 📦 Módulo 5: Catálogo Base
*   `GET | POST /api/categorias` - Gestão de agrupadores.
*   `GET | POST /api/fornecedores` - Gestão de origens.
*   `GET | POST /api/produtos` - Cadastro de SKUs exigindo Categorias e Fornecedores.

### 🛒 Módulo 6: Motor de Vendas (Pedidos)
*   `POST /api/pedidos` - Grava "Capa" e "Itens" em transação única (`BeginTransactionAsync`). Valor calculado no back-end.
*   `GET /api/pedidos` - Lista histórico resumido de vendas.

### ⚙️ Módulo 7: Workflow (Avanço de Status / Máquina de Estados)
*   `PATCH /api/clientes/{id}/status` - Aprova/Rejeita cadastro.
*   `PATCH /api/pedidos/{id}/status-logistica` - Avança status físico (Aguardando -> Separacao -> Enviado).
*   `PATCH /api/pedidos/{id}/status-erp` - Avança integração sistêmica.

### 🗂️ Módulo 8: Rotas de Apoio (Lookups)
Usadas pelo Front-end para popular selects e comboboxes:
*   `GET /api/lookups/perfis` - Lista os papéis de acesso do sistema.
*   `GET /api/lookups/estados` - Lista as UFs.
*   `GET /api/lookups/estados/{estadoId}/cidades` - Lista as cidades vinculadas a um estado.