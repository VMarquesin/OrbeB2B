OrbeB2B - Master Plan & Arquitetura de Software
1. Visão Geral do Produto
O OrbeB2B é um ecossistema SaaS (Software as a Service) Multi-Tenant projetado para digitalizar e automatizar a esteira de vendas de indústrias e distribuidoras (ex: A Caseira). O sistema é dividido em dois Contextos Delimitados (Bounded Contexts) que consomem a mesma base de dados:

Módulo CRM (Retaguarda Administrativa): Focado no controle interno da fábrica. Gestão de catálogo, aprovação de cadastros, fluxo de produção/logística, gestão de funcionários e inteligência de mercado (BI).

Módulo AutoAtendimento (Portal B2B/B2C): Focado no cliente final (Lojista/Varejo/Atacado). Catálogo inteligente com precificação dinâmica (por volume/perfil), histórico de pedidos, recompra ágil e interface focada em conversão.

2. Pilha Tecnológica (Tech Stack)
Linguagem: C# (.NET 8/9).

Banco de Dados: PostgreSQL.

Escrita de Dados (Commands): Entity Framework Core (EF Core) com Migrations e Fluent API.

Leitura de Dados (Queries/BI): Dapper (Micro-ORM para SQL puro e alta performance).

Front-end: React.js (Comunicação via APIs RESTful e Tokens JWT).

3. Padrões Arquiteturais e "Guardrails" (Regras Inegociáveis)
Domain-Driven Design (DDD): Entidades ricas e blindadas (private set). Toda alteração de estado passa obrigatoriamente por métodos de domínio. Sem modelos anêmicos.

CQRS (Command and Query Responsibility Segregation): Separação estrita entre quem grava no banco (EF Core) e quem lê para a tela (Dapper).

Entidades Enxutas: Uso de IDs (Guid) para relacionamentos. Sem propriedades de navegação virtuais (objetos inteiros) para evitar over-fetching.

Tipagem Criptográfica e Temporal: Chaves primárias usam UUID (geradas no C#). Todas as datas são timestamptz (salvas em UTC).

Nomenclatura Padrão: C# utiliza PascalCase. Banco de dados utiliza snake_case (mapeado via Fluent API). Todas as tabelas no singular, sem abreviações obscuras.

4. Mapeamento de Domínio (Entidades e Agregados)
4.1. Base SaaS e Localização
Empresa: O "Tenant" (Fábrica assinante). Controla o isolamento dos dados.

Estado & Cidade: Tabelas de domínio fixo (padrão IBGE) para garantir integridade em relatórios de BI.

4.2. Identidade e Acessos (RBAC Centralizado)
Usuario: Tabela central de credenciais (E-mail, SenhaHash, Token).

PerfilUsuario: Papéis de acesso (Admin, Gerente, Faturista, CompradorB2B).

EmpresaFuncionario: A pessoa física que trabalha na indústria, ligada a um usuário.

4.3. Ecossistema Comercial
Cliente: O comprador (B2B com CNPJ ou B2C com CPF). Vinculado a uma Empresa específica e dependente de aprovação via StatusCadastro.

Fornecedor: Origem de manufatura de um item.

Categoria & Produto: Catálogo com precificação base múltipla (Atacado, Lojista, Varejo) e flag de roteamento logístico (EhFabricacaoPropria).

Pedido & PedidoItem: Snapshot financeiro da venda. Possui controle de origem (App ou Manual), fila logística e espelho do ERP.

5. Roadmap de Implementação (Status Atual e Próximos Passos)
🟢 Fase 1: Fundação de Dados (CRM) - CONCLUÍDO
[x] Modelagem do Banco de Dados Relacional (MER).

[x] Criação do projeto .NET estruturado em camadas (Domain, Application, Infrastructure, API).

[x] Desenvolvimento das Entidades Ricas (Padrão Ouro: Empresa.cs).

[x] Configuração do EF Core e mapeamentos Fluent API (Padrão Ouro: EmpresaConfiguration.cs).

🟡 Fase 2: Infraestrutura e Primeiro Deploy Local - ONDE ESTAMOS
[ ] Configurar a ConnectionString do PostgreSQL no appsettings.json.

[ ] Registrar o CrmDbContext na injeção de dependência (Program.cs).

[ ] Gerar e rodar a Primeira Migration do EF Core para criar as tabelas no banco de dados físico.

⚪ Fase 3: Segurança e Autenticação (API CRM)
[ ] Implementar a geração e validação de Tokens JWT.

[ ] Criar o Caso de Uso de Login (Validar credenciais na tabela Usuarios).

[ ] Configurar os atributos de autorização RBAC (ex: [Authorize(Roles = "Admin")]).

⚪ Fase 4: Casos de Uso do CRM (Commands & Queries)
[ ] Leitura (Dapper): Criar endpoints de listagem para popular os Dashboards do React (Listar Pedidos, BI de Vendas).

[ ] Escrita (EF Core): Criar fluxos de aprovação de Clientes e alteração do status de Pedidos na esteira logística.

[ ] Integração com ViaCEP para auto-completar endereços no cadastro de novas Empresas/Clientes.

⚪ Fase 5: Contexto do AutoAtendimento (Portal B2B)
[ ] Replicar o esqueleto do Portal.Domain usando entidades "modo leitura" exclusivas para o cliente.

[ ] Criar endpoint de Vitrine (Catálogo) com cálculo dinâmico de preço baseado no perfil logado.

[ ] Desenvolver o motor do Carrinho de Compras e Checkout autônomo.