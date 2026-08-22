# 🛠️ Relatório Técnico Consolidado: Ajustes de Backend (CRM)

**Objetivo:** Este documento mapeia os ajustes necessários nos endpoints, DTOs e queries da API para viabilizar a integração, leitura e edição completa de dados no Frontend (React), eliminando erros 500 e falhas de sincronização (Buracos Negros de Dados).

---

## Módulo 1: Gestão de Clientes

### 1. Omissão de Dados de Endereço na Listagem (DTO Incompleto)
Atualmente, o Frontend é incapaz de preencher os campos de endereço ao abrir o modal de edição porque a API não fornece essas informações na consulta geral.
* **Endpoint Afetado:** `GET /api/clientes`
* **Problema:** O DTO de resposta (`ClienteListResponse`) e a respectiva query retornam apenas um resumo do cliente, omitindo os dados granulares de endereço.
* **Ação Necessária:** Incluir as propriedades abaixo no DTO de resposta da listagem e garantir que o `SELECT` do banco as retorne populadas:
  * `Cep` (string)
  * `Logradouro` (string)
  * `Numero` (string)
  * `Bairro` (string)
  * `EstadoId` (Guid/Int)
  * `CidadeId` (Guid/Int)

### 2. Ausência de Rota REST para Leitura Individual
O padrão REST dita que o detalhe de um registro seja buscado pelo seu ID, mas o backend atual bloqueia esse método.
* **Endpoint Afetado:** `GET /api/clientes/{id}`
* **Problema:** A requisição retorna `405 Method Not Allowed`. A rota aceita apenas o método `PUT`.
* **Ação Necessária:** Criar/liberar o método `[HttpGet("{id}")]` no controller, retornando o DTO completo da ficha cadastral (`ClienteResponse`).

### 3. Divergência de Fonte de Verdade no Status ("Efeito Miragem")
Conflito arquitetural entre a leitura e a escrita do status do cliente.
* **Endpoints Afetados:** `PATCH /api/clientes/{id}/inativar` (e `/reativar`) vs `GET /api/clientes`
* **Problema:** As rotas de PATCH atualizam uma coluna booleana (`esta_ativo`). No entanto, o GET lê o status de uma coluna de string/enum (`status_cadastro`). Uma alteração via PATCH nunca reflete no GET.
* **Ação Necessária:** Unificar a fonte de verdade (fazer o inativar atualizar o `status_cadastro`, ou o GET ler prioritariamente o `esta_ativo`).

### 4. Lookup de Cidades Incompleto
* **Endpoint Afetado:** `GET /api/lookups/estados/{id}/cidades`
* **Problema:** Ao consultar as cidades de São Paulo (SP), a API retornou um array contendo apenas a capital ("São Paulo"), omitindo os demais municípios do estado.
* **Ação Necessária:** Revisar a query do lookup para garantir o retorno de **todos** os municípios vinculados ao `estadoId`.

---

## Módulo 2: Gestão Comercial (Pedidos e Faturamento)

### 1. Faturamento: Erro de Tipagem (IS NULL)
* **Endpoint Afetado:** `GET /api/inteligencia/faturamento`
* **Problema:** Erro `42P18: could not determine data type of parameter` ao chamar a rota sem enviar Query Parameters de data.
* **Causa-Raiz:** No `InteligenciaReadRepository.cs`, a query Dapper utiliza `(@DataInicio IS NULL OR ...)`. O Npgsql (driver do PostgreSQL) não suporta parâmetros nulos sem que o tipo `DbType` seja explicitamente tipado no Dapper.
* **Mitigação Atual (Frontend):** O React envia `?dataInicio=2000-01-01&dataFim=2100-12-31` como fallback permanente.
* **Ação Desejada:** Tratar a montagem dinâmica da query com um `SqlBuilder` ou tipar o parâmetro explicitamente no Dapper quando a data for nula.

### 2. Pedidos: Erro Fatal de Casting (Int vs String)
* **Endpoint Afetado:** `GET /api/pedidos`
* **Problema:** Erro `InvalidCastException` estourando Status 500. A rota está permanentemente inacessível.
* **Causa-Raiz:** A coluna `status_logistica` foi criada nas migrações do PostgreSQL como um `integer`. Contudo, o DTO `PedidoResumoListResponse` define a propriedade como `string StatusLogistica`. O Dapper falha ao tentar serializar o Int diretamente para String.
* **Ação Desejada:** Corrigir a propriedade `StatusLogistica` no DTO para utilizar o Enum correto (`StatusFilaLogistica`), ou corrigir a query no `PedidoReadRepository.cs` realizando o CAST adequado.

---

## Módulo 3: Controle de Acesso e Colaboradores

### 1. Omissão de Propriedades no DTO (Buraco Negro de Dados)
* **Endpoint Afetado:** `GET /api/usuarios` (Listagem)
* **Problema:** O formulário do Frontend salva corretamente os dados via POST/PUT, mas o GET retorna com colunas em branco.
* **Causa-Raiz:** O DTO de resposta está omitindo as colunas secundárias do usuário (retorna apenas id, nome, email, nomePerfil e estaAtivo).
* **Ação Desejada:** Atualizar o DTO de listagem e a query do banco para incluir e serializar as propriedades:
  * `Cargo` (string)
  * `Departamento` (string)
  * `DataAdmissao` (string/DateTime)