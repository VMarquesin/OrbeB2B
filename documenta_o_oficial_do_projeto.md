# OrbeB2B
**Plataforma Integrada de CRM e Autoatendimento B2B**

[![Repositório](https://img.shields.io/badge/GitHub-VMarquesin%2FOrbeB2B-181717?logo=github)](https://github.com/VMarquesin/OrbeB2B)
[![Stack](https://img.shields.io/badge/.NET_10-React_Vite-blue?logo=dotnet)](https://github.com/VMarquesin/OrbeB2B)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon.tech-336791?logo=postgresql)](https://neon.tech)

O **OrbeB2B** é um sistema digitalizador de vendas corporativas em atacado desenvolvido para a fábrica de doces **"A Caseira"** (Projeto InovAskill 2026). A solução moderniza o fluxo de orçamentos, substituindo processos manuais e pedidos por papel/mensagens por um ecossistema integrado que conecta o cliente final diretamente ao setor logístico e de produção.

---

## 1. Visão Geral e Objetivos
O projeto é dividido em dois módulos principais integrados a uma única base de dados:
* **Portal de Autoatendimento B2B:** Interface voltada para o cliente corporativo, permitindo visualização do catálogo, aplicação de filtros avançados e finalização autônoma de pedidos com escolha de forma de pagamento.
* **Portal CRM (Administrativo):** Ferramenta para uso interno da fábrica, centralizando a captação de pedidos, gestão de clientes, controle de catálogo e fornecendo dados em tempo real para planejamento da capacidade fabril (ex: cálculo de mesas de produção necessárias).

---

## 2. Arquitetura de Software
A aplicação foi construída em um padrão **Monorepo**, mantendo front-ends e back-ends logicamente separados, mas controlados no mesmo repositório para facilitar o CI/CD.
A arquitetura baseia-se em **Client-Server RESTful**, onde as interfaces em React se comunicam de forma assíncrona com as APIs em .NET, isolando a regra de negócio e garantindo alta segurança e escalabilidade.

---

## 3. Stack Tecnológica
* **Front-end:** React.js, Vite (bundler), Tailwind CSS (estilização), Axios (requisições HTTP).
* **Back-end:** C# .NET 10, ASP.NET Core REST API.
* **Acesso a Dados:** Entity Framework Core (Code-First Migrations).
* **Banco de Dados:** PostgreSQL relacional.
* **Containers:** Docker.

---

## 4. Infraestrutura e Nuvem (Cloud)
O sistema encontra-se 100% em nuvem com alta disponibilidade:

| Camada | Tecnologia/Provedor | Configurações Principais |
| :--- | :--- | :--- |
| **Banco de Dados** | **Neon.tech** | PostgreSQL serverless. Schema completo aplicado. |
| **APIs (Back-end)** | **Render** | Contêineres Docker expostos na porta 8080. Variáveis de ambiente configuradas para a connection string do Neon. Política de CORS restrita apenas aos domínios da Vercel. |
| **Front-ends** | **Vercel** | CI/CD nativo com o GitHub. Injeção de variáveis via `.env.production` em tempo de build (Vite). |

**URLs de Produção:**
* Autoatendimento (Front): `https://orbe-b2-b.vercel.app`
* CRM (Front): `https://orbe-b2-b-zsua.vercel.app`
* APIs: `https://orbeb2b-api.onrender.com` / `https://orbeb2b-api-autoatendimento.onrender.com`

---

## 5. Estrutura de Diretórios
O Monorepo está organizado da seguinte forma:

```text
OrbeB2B/
│
├── AutoAtendimento/
│   ├── Api/                    # Backend .NET 10 (Controllers, Services, Dockerfile)
│   └── Front/                  # Frontend React/Vite para clientes B2B
│
├── CRM/
│   ├── Api/                    # Backend .NET 10 do painel administrativo
│   └── Front/                  # Frontend React/Vite para a equipe interna
│
└── docker-compose.yml          # Orquestração para desenvolvimento local
```

---

## 6. Modelagem de Dados (MER Principal)
O schema foi desenhado para suportar o conceito **Multi-Tenant** (múltiplas empresas) de forma escalável. As principais entidades incluem:
* **`empresas` / `cidades`:** Base da arquitetura Multi-Tenant.
* **`clientes` / `usuarios`:** Controle de acesso (interno e externo).
* **`produtos` / `categorias` / `fornecedores`:** Catálogo de vendas. Separa a origem do produto (fabricação própria vs. revenda/terceiros) para cálculo de ROI e comissionamento.
* **`pedidos` / `pedido_itens`:** Transacional. Inclui origem do pedido, formas de pagamento e snapshots de preços.

---

## 7. Guia de Execução Local

Para rodar o projeto na sua máquina de desenvolvimento, siga os passos abaixo:

### Pré-requisitos
* [.NET 10 SDK](https://dotnet.microsoft.com/)
* [Node.js v18+](https://nodejs.org/)
* [Docker e Docker Compose](https://www.docker.com/)

### 7.1. Subindo o Banco de Dados (Local)
Na raiz do projeto, execute o docker-compose para subir uma instância do PostgreSQL:
```bash
docker-compose up -d db
```

### 7.2. Aplicando as Migrations (C#)
Navegue até a pasta da API desejada e atualize o banco de dados:
```bash
cd AutoAtendimento/Api
dotnet ef database update
```

### 7.3. Executando a API (Docker ou Kestrel)
**Via Kestrel (recomendado para dev):**
```bash
dotnet run
```
**Via Docker (simulando produção):**
```bash
docker build -t orbeb2b-api -f Dockerfile .
docker run -p 5213:8080 -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;..." orbeb2b-api
```

### 7.4. Executando o Front-end (React)
Certifique-se de configurar o arquivo `.env` com a URL local (ex: `VITE_API_URL=http://localhost:5213`).
```bash
cd AutoAtendimento/Front
npm install
npm run dev
```