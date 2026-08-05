## 🚀 Ecossistema B2B: Portal de AutoAtendimento (BFF)
**Projeto:** `OrbeB2B.AutoAtendimento.API` (Porta 7001)
**Arquitetura:** Padrão BFF (Backend For Frontend) com Shared Kernel. 
**Regra de Ouro:** Compartilha o `Domain` e `Infrastructure` do CRM. Nunca aceita IDs sensíveis do Front-end; o `TenantId` e o `ClienteId` são estritamente extraídos do JWT (`Role: CompradorB2B`).

### 🔐 Módulo 1: Acesso do Comprador
*   `POST /api/auth-cliente/login` **[AllowAnonymous]**
    *   **Funcionalidade:** Autentica o usuário na tabela `usuarios` fazendo INNER JOIN com `clientes` para garantir que apenas compradores externos (com `cliente_id` preenchido) entrem.
    *   **Retorno:** JWT contendo `UsuarioId`, `ClienteId`, `TenantId` e `Role = CompradorB2B`.

### 🛍️ Módulo 2: Catálogo do Cliente
*   `GET /api/vitrine/produtos` **[Authorize(Roles = "CompradorB2B")]**
    *   **Funcionalidade:** Lista os produtos ativos filtrados pelo `TenantId` do JWT. Retorna visão simplificada (sem Fornecedor) e preco_atacado.

### 🛒 Módulo 3: Checkout (Tirar Pedido)
*   `POST /api/pedidos-cliente` **[Authorize(Roles = "CompradorB2B")]**
    *   **Funcionalidade:** Criação do Pedido pelo próprio cliente.
    *   **Segurança:** Extrai o `ClienteId` e `TenantId` exclusivamente do JWT. Reutiliza o `IPedidoWriteRepository` e o Transactional EF Core do projeto CRM para garantir integridade.