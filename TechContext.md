# Contexto Técnico e Arquitetural - OrbeB2B CRM B2B

## 1. Stack Tecnológica
- **Backend:** C# (.NET 10)
- **Banco de Dados:** PostgreSQL
- **ORM Escrita:** Entity Framework Core 10
- **Micro-ORM Leitura:** Dapper
- **Segurança:** Autenticação JWT com RBAC (Role-Based Access Control) e BCrypt para senhas.

## 2. Arquitetura
O projeto segue os princípios de **Clean Architecture** e **DDD (Domain-Driven Design)**, dividido nas seguintes camadas:
- `Domain`: Entidades ricas, Enums, Regras de Negócio e Interfaces de Domínio. Sem dependências externas.
- `Application`: Casos de uso, DTOs (Records), Interfaces de Repositórios e Serviços (Ex: Hashing).
- `Infrastructure`: Implementação do EF Core (DbContext, Write Repositories), Dapper (Connection Factory, Read Repositories).
- `API`: Controllers isolados e limpos, orquestrando validações de Token e injeção de dependência.

## 3. Padrões de Código e Regras Inegociáveis

### 3.1. Isolamento Multi-Tenant (Segurança)
- O ID da Empresa (`empresa_id` ou `TenantId`) **NUNCA** deve ser recebido pelo payload/body do Front-end (DTOs).
- Ele deve ser lido *exclusivamente* da claim do Token JWT do usuário logado diretamente no Controller:
  `var tenantIdClaim = User.FindFirst("TenantId")?.Value;`
- Esse ID é repassado para as queries do Dapper ou para as inserções do EF Core para garantir o isolamento total dos dados entre clientes do SaaS.

### 3.2. Padrão CQRS Simplificado
**Para Leitura (Queries):**
- Uso exclusivo do **Dapper**.
- As consultas devem usar SQL nativo formatado em "escadinha" (vírgula no início da linha para os campos do SELECT).
- O retorno sempre será mapeado para `records` leves criados na camada `Application/DTOs`.
- Não se usa o `DbContext` para métodos GET (Listagem/Visualização).

**Para Escrita (Commands - POST, PUT, DELETE):**
- Uso exclusivo do **Entity Framework Core**.
- Uso obrigatório de `BeginTransactionAsync` quando duas ou mais tabelas precisarem ser salvas (Ex: Usuário e Vínculo).
- Respeitar a ordem de dependência das Chaves Estrangeiras (Salvar a tabela principal antes da tabela dependente usando `.SaveChangesAsync()` intermediários).

### 3.3. Padrão DDD Estrito nas Entidades
- Propriedades devem ser de leitura (`get; private set;` ou `init;`).
- O construtor oficial deve exigir os dados obrigatórios para que o objeto nunca nasça em estado inválido.
- A geração do ID (`Id = Guid.NewGuid()`), status de ativo e datas de criação devem acontecer internamente, dentro do construtor da Entidade. NUNCA gere o ID no Controller.

### 3.4. Regra de Chaves Estrangeiras Nulas (Fluent API)
- No PostgreSQL, se uma coluna de Chave Estrangeira aceita nulo (`uuid` sem `NOT NULL`), o Entity Framework Core tenta inferir obrigatoriedade se usar `HasOne` sem explicitar.
- **Regra de Ouro:** Toda Foreign Key configurada como `Guid?` na Entidade **deve** conter a diretiva `.IsRequired(false)` no mapeamento Fluent API (`OnModelCreating`), caso contrário, o EF Core tentará gravar `Guid.Empty` (00000000-0000...) no banco, gerando erro de Constraint Violation (`23503`).

## 4. Domínio Core (Tabelas e Relacionamentos Base)
- `empresas`: O Tenant (A matriz SaaS).
- `cidades` e `estados`: Tabelas de apoio para endereços.
- `usuarios`: Credenciais de acesso e vínculo com `perfis_usuario` (RBAC). A chave `cliente_id` é `NULL` para funcionários internos.
- `empresa_funcionarios`: Tabela associativa que define os cargos e departamentos dos usuários dentro do Tenant.
- `clientes`: Empresas/B2B que a indústria atende. Pertencem obrigatoriamente a um `empresa_id` e a uma `cidade_id`.
- `fornecedores`: Fornecedores de insumos ou produtos da indústria.
- `produtos` e `categorias`: O catálogo de vendas.
- `pedidos` e `pedido_itens`: Registro das vendas, possuindo Enums de `status_fila_logistica` e `status_integracao_erp`.