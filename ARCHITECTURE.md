# OrbeB2B - Diretrizes de Arquitetura, Clean Code e Fluxo de Trabalho

Este documento define de forma mandatória os padrões de código, a separação física das soluções (.sln) e o fluxo de ramificação no Git que o Agente de IA e toda a equipe de desenvolvimento devem seguir estritamente.

---

## 1. Princípios de Código Limpo (Clean Code)

*   **Nomes Significativos e Autoexplicativos:** É terminantemente PROIBIDO o uso de variáveis, parâmetros, argumentos ou classes com letras únicas ou abreviações confusas (ex: `a`, `b`, `c`, `req`, `res`, `ctx`, `tbl`). Use nomes limpos e descritivos: `orderRepository`, `customerPayload`, `paymentIntention`, `pricingTable`.
*   **Métodos Focados:** Cada método deve possuir uma única responsabilidade. Métodos longos com múltiplos desvios condicionais complexos devem ser refatorados em subfunções limpas.
*   **Tratamento de Erros Isolado:** Exceções de negócio devem ser tratadas de forma global nas camadas de API, evitando poluir as regras de domínio com blocos excessivos de `try-catch`.

---

## 2. Abordagem Arquitetural: Soluções Independentes (DDD Simplificado)

O ecossistema OrbeB2B é composto por dois sistemas independentes que não compartilham dependências de compilação direta. Cada um possui sua própria Solução (.sln) e seu próprio ciclo de desenvolvimento.

### 🏢 Solução 1: `OrbeB2B.AutoAtendimento.sln` (AutoAtendimento do Cliente)
Responsável pela jornada de compra, vitrine inteligente e histórico de pedidos do lojista.
*   **`OrbeB2B.AutoAtendimento.Domain`**: Entidades, contratos de repositório e validações exclusivas do AutoAtendimento B2B.
*   **`OrbeB2B.AutoAtendimento.Application`**: Casos de uso específicos (ex: `AdicionarAoCarrinho`, `FinalizarPedidoAutonomo`).
*   **`OrbeB2B.AutoAtendimento.Infrastructure`**: Camada de persistência de dados (EF Core mapeando o PostgreSQL para o contexto do cliente).
*   **`OrbeB2B.AutoAtendimento.API`**: Endpoint de exposição pública para o Web App. Rota base: `/api/v1/AutoAtendimento/`

### 🏭 Solução 2: `OrbeB2B.Crm.sln` (Retaguarda e Gestão da Fábrica)
Responsável pela esteira de validação de pedidos, dashboards financeiros e separação de logística.
*   **`OrbeB2B.Crm.Domain`**: Entidades administrativas, contratos e regras de roteamento da fábrica.
*   **`OrbeB2B.Crm.Application`**: Casos de uso gerenciais (ex: `AprovarPedidoAtacadista`, `RotearDemandaProducao`).
*   **`OrbeB2B.Crm.Infrastructure`**: Persistência de dados administrativa e queries de relatórios complexos.
*   **`OrbeB2B.Crm.API`**: Endpoint privado de retaguarda. Rota base: `/api/v1/crm/`

---

## 3. Governança de Código e Fluxo de Trabalho (Git Workflow)

O gerenciamento do repositório é rígido e focado em manter a estabilidade das aplicações.

*   **Branch `master` Protegida:** A branch `master` representa o ambiente estável de produção. É proibido realizar commits diretos nela.
*   **Desenvolvimento Isolado:** Cada integrante da equipe deve criar uma branch de desenvolvimento específica a partir da `master` para codificar sua tarefa (ex: `feature/AutoAtendimento-auth`, `feature/crm-dashboard`, `fix/api-cors`).
*   **Integração via Merge Request (MR):** A união de qualquer código para a branch `master` ocorre exclusivamente por meio de um Merge Request. 
*   **Revisão Centralizada:** Nenhum Merge Request será aprovado sem a revisão de código e o aceite do Tech Lead/Administrador do repositório.

---

## 4. Instruções Específicas para o Agente de IA
Ao interagir com este repositório para gerar código:
1. Identifique qual arquivo `.sln` está sendo modificado e limite suas alterações estritamente aos limites físicos daquela solução.
2. Siga as convenções de nomenclatura corporativa do C# (.NET) e os princípios DDD definidos.
3. Se os dados de integração ou schemas finais não estiverem disponíveis, implemente os contratos de interface utilizando dados simulados (*mocks*) descritivos.