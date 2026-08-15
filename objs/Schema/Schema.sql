-- =============================================================================
-- OrbeB2B CRM — Schema PostgreSQL
-- Gerado a partir da Migration: 20260708013413_InitialCreate
-- e do CrmDbContextModelSnapshot.cs
--
-- IMPORTANTE: Este arquivo reflete o estado REAL do banco.
-- Todos os IDs são gerados pela aplicação (Guid.NewGuid()) — não usamos
-- gen_random_uuid() no banco. Os defaults abaixo são apenas documentativos.
--
-- Enums armazenados como INTEGER (EF Core padrão):
--   OrigemPedido       : APP=0, MANUAL=1
--   StatusFilaLogistica: AguardandoValidacao=0, Faturado=1, EmSeparacao=2,
--                        Enviado=3, Entregue=4, Cancelado=5
--   StatusIntegracaoErp: Pendente=0, Aprovado=1, Rejeitado=2
--   StatusCadastroCliente: Pendente=0, Aprovado=1, Rejeitado=2
--   TipoSegmentoCliente:   B2B=0, B2C=1
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. perfis_usuario  (tabela raiz — sem FK)
-- -----------------------------------------------------------------------------
CREATE TABLE "perfis_usuario" (
    "id" uuid NOT NULL,
    "nome_perfil" varchar(50) NOT NULL,
    "descricao" text NOT NULL,
    CONSTRAINT "PK_perfis_usuario" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IX_perfis_usuario_nome_perfil" ON "perfis_usuario" ("nome_perfil");

-- -----------------------------------------------------------------------------
-- 2. estados  (tabela raiz — sem FK)
-- -----------------------------------------------------------------------------
CREATE TABLE "estados" (
    "id" uuid NOT NULL,
    "sigla" varchar(2) NOT NULL,
    "nome" varchar(50) NOT NULL,
    CONSTRAINT "PK_estados" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IX_estados_sigla" ON "estados" ("sigla");

-- -----------------------------------------------------------------------------
-- 3. cidades  (depende de: estados)
-- -----------------------------------------------------------------------------
CREATE TABLE "cidades" (
    "id" uuid NOT NULL,
    "estado_id" uuid NOT NULL,
    "nome" varchar(100) NOT NULL,
    CONSTRAINT "PK_cidades" PRIMARY KEY ("id"),
    CONSTRAINT "FK_cidades_estados_estado_id" FOREIGN KEY ("estado_id") REFERENCES "estados" ("id") ON DELETE CASCADE
);

CREATE INDEX "IX_cidades_estado_id" ON "cidades" ("estado_id");

-- -----------------------------------------------------------------------------
-- 4. empresas  (depende de: cidades)
-- -----------------------------------------------------------------------------
CREATE TABLE "empresas" (
    "id" uuid NOT NULL,
    "cidade_id" uuid NOT NULL,
    "cnpj" varchar(14) NOT NULL,
    "razao_social" varchar(200) NOT NULL,
    "nome_fantasia" varchar(200) NOT NULL,
    "cep" varchar(8) NOT NULL,
    "logradouro" varchar(150) NOT NULL,
    "numero" varchar(20) NOT NULL,
    "bairro" varchar(100) NOT NULL,
    "esta_ativa" boolean NOT NULL,
    "data_cadastro" timestamptz NOT NULL,
    CONSTRAINT "PK_empresas" PRIMARY KEY ("id"),
    CONSTRAINT "FK_empresas_cidades_cidade_id" FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IX_empresas_cidade_id" ON "empresas" ("cidade_id");

CREATE UNIQUE INDEX "IX_empresas_cnpj" ON "empresas" ("cnpj");

-- -----------------------------------------------------------------------------
-- 5. categorias  (depende de: empresas)
-- -----------------------------------------------------------------------------
CREATE TABLE "categorias" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "nome" varchar(100) NOT NULL,
    CONSTRAINT "PK_categorias" PRIMARY KEY ("id"),
    CONSTRAINT "FK_categorias_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IX_categorias_empresa_id" ON "categorias" ("empresa_id");

-- -----------------------------------------------------------------------------
-- 6. fornecedores  (depende de: empresas)
-- -----------------------------------------------------------------------------
CREATE TABLE "fornecedores" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "cnpj" varchar(14) NOT NULL,
    "razao_social" varchar(200) NOT NULL,
    "esta_ativo" boolean NOT NULL,
    "data_cadastro" timestamptz NOT NULL,
    CONSTRAINT "PK_fornecedores" PRIMARY KEY ("id"),
    CONSTRAINT "FK_fornecedores_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_fornecedores_empresa_id_cnpj" ON "fornecedores" ("empresa_id", "cnpj");

-- -----------------------------------------------------------------------------
-- 7. clientes  (depende de: empresas, cidades)
-- -----------------------------------------------------------------------------
CREATE TABLE "clientes" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "cidade_id" uuid NOT NULL,
    "documento" varchar(14) NOT NULL,
    "nome_ou_razao_social" varchar(200) NOT NULL,
    "nome_fantasia" varchar(200) NOT NULL,
    "tipo_segmento" integer NOT NULL, -- TipoSegmentoCliente: B2B=0, B2C=1
    "cep" varchar(8) NOT NULL,
    "logradouro" varchar(150) NOT NULL,
    "numero" varchar(20) NOT NULL,
    "bairro" varchar(100) NOT NULL,
    "status_cadastro" integer NOT NULL, -- StatusCadastroCliente: Pendente=0, Aprovado=1, Rejeitado=2
    "data_cadastro" timestamptz NOT NULL,
    CONSTRAINT "PK_clientes" PRIMARY KEY ("id"),
    CONSTRAINT "FK_clientes_cidades_cidade_id" FOREIGN KEY ("cidade_id") REFERENCES "cidades" ("id") ON DELETE RESTRICT,
    CONSTRAINT "FK_clientes_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE
);

CREATE INDEX "IX_clientes_cidade_id" ON "clientes" ("cidade_id");

CREATE UNIQUE INDEX "IX_clientes_empresa_id_documento" ON "clientes" ("empresa_id", "documento");

-- -----------------------------------------------------------------------------
-- 8. usuarios  (depende de: perfis_usuario, clientes [nullable])
-- -----------------------------------------------------------------------------
CREATE TABLE "usuarios" (
    "id" uuid NOT NULL,
    "perfil_id" uuid NOT NULL,
    "nome" varchar(150) NOT NULL,
    "email" varchar(150) NOT NULL,
    "senha_hash" varchar(255) NOT NULL,
    "esta_ativo" boolean NOT NULL,
    "data_criacao" timestamptz NOT NULL,
    "cliente_id" uuid NULL, -- FK opcional: usuário externo (portal do cliente)
    CONSTRAINT "PK_usuarios" PRIMARY KEY ("id"),
    CONSTRAINT "FK_usuarios_perfis_usuario_perfil_id" FOREIGN KEY ("perfil_id") REFERENCES "perfis_usuario" ("id") ON DELETE RESTRICT,
    CONSTRAINT "FK_usuarios_clientes_cliente_id" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE CASCADE
);

CREATE INDEX "IX_usuarios_perfil_id" ON "usuarios" ("perfil_id");

CREATE INDEX "IX_usuarios_cliente_id" ON "usuarios" ("cliente_id");

CREATE UNIQUE INDEX "IX_usuarios_email" ON "usuarios" ("email");

-- -----------------------------------------------------------------------------
-- 9. empresa_funcionarios  (depende de: empresas, usuarios)
-- -----------------------------------------------------------------------------
CREATE TABLE "empresa_funcionarios" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "usuario_id" uuid NOT NULL,
    "cargo" varchar(100) NOT NULL,
    "departamento" varchar(100) NOT NULL,
    "data_admissao" timestamptz NOT NULL,
    CONSTRAINT "PK_empresa_funcionarios" PRIMARY KEY ("id"),
    CONSTRAINT "FK_empresa_funcionarios_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_empresa_funcionarios_usuarios_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE
);

CREATE INDEX "IX_empresa_funcionarios_empresa_id" ON "empresa_funcionarios" ("empresa_id");

CREATE UNIQUE INDEX "IX_empresa_funcionarios_usuario_id" ON "empresa_funcionarios" ("usuario_id");
-- Índice único em usuario_id garante que um usuário só pode ser funcionário de uma empresa.

-- -----------------------------------------------------------------------------
-- 10. produtos  (depende de: empresas, categorias, fornecedores)
-- -----------------------------------------------------------------------------
CREATE TABLE "produtos" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "categoria_id" uuid NOT NULL,
    "fornecedor_id" uuid NOT NULL,
    "codigo_comercial" varchar(50) NOT NULL,
    "descricao" varchar(255) NOT NULL,
    "embalagem" varchar(50) NOT NULL,
    "eh_fabricacao_propria" boolean NOT NULL,
    "preco_atacado" numeric(12, 2) NOT NULL,
    "preco_lojista" numeric(12, 2) NOT NULL,
    "preco_varejo" numeric(12, 2) NOT NULL,
    "esta_ativo" boolean NOT NULL,
    CONSTRAINT "PK_produtos" PRIMARY KEY ("id"),
    CONSTRAINT "FK_produtos_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE RESTRICT,
    CONSTRAINT "FK_produtos_categorias_categoria_id" FOREIGN KEY ("categoria_id") REFERENCES "categorias" ("id") ON DELETE RESTRICT,
    CONSTRAINT "FK_produtos_fornecedores_fornecedor_id" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IX_produtos_empresa_id" ON "produtos" ("empresa_id");

CREATE INDEX "IX_produtos_categoria_id" ON "produtos" ("categoria_id");

CREATE INDEX "IX_produtos_fornecedor_id" ON "produtos" ("fornecedor_id");

-- -----------------------------------------------------------------------------
-- 11. pedidos  (depende de: empresas, clientes)
-- -----------------------------------------------------------------------------
CREATE TABLE "pedidos" (
    "id" uuid NOT NULL,
    "empresa_id" uuid NOT NULL,
    "cliente_id" uuid NOT NULL,
    "codigo_pedido_formatado" varchar(50) NOT NULL,
    "origem" integer NOT NULL, -- OrigemPedido: APP=0, MANUAL=1
    "status_logistica" integer NOT NULL, -- StatusFilaLogistica: AguardandoValidacao=0..Cancelado=5
    "status_erp" integer NOT NULL, -- StatusIntegracaoErp: Pendente=0, Aprovado=1, Rejeitado=2
    "valor_total_pedido" numeric(12, 2) NOT NULL,
    "observacao_negociacao" text NOT NULL,
    "data_criacao" timestamptz NOT NULL,
    CONSTRAINT "PK_pedidos" PRIMARY KEY ("id"),
    CONSTRAINT "FK_pedidos_empresas_empresa_id" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE RESTRICT,
    CONSTRAINT "FK_pedidos_clientes_cliente_id" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IX_pedidos_empresa_id" ON "pedidos" ("empresa_id");

CREATE INDEX "IX_pedidos_cliente_id" ON "pedidos" ("cliente_id");

CREATE UNIQUE INDEX "IX_pedidos_codigo_pedido_formatado" ON "pedidos" ("codigo_pedido_formatado");

-- -----------------------------------------------------------------------------
-- 12. pedido_itens  (depende de: pedidos, produtos)
-- -----------------------------------------------------------------------------
CREATE TABLE "pedido_itens" (
    "id" uuid NOT NULL,
    "pedido_id" uuid NOT NULL,
    "produto_id" uuid NOT NULL,
    "quantidade_solicitada" integer NOT NULL,
    "preco_unitario_aplicado" numeric(12, 2) NOT NULL,
    "eh_fabricacao_propria_snapshot" boolean NOT NULL,
    CONSTRAINT "PK_pedido_itens" PRIMARY KEY ("id"),
    CONSTRAINT "FK_pedido_itens_pedidos_pedido_id" FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_pedido_itens_produtos_produto_id" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT
);

CREATE INDEX "IX_pedido_itens_pedido_id" ON "pedido_itens" ("pedido_id");

CREATE INDEX "IX_pedido_itens_produto_id" ON "pedido_itens" ("produto_id");

-- =============================================================================
-- Resumo de Relacionamentos
-- =============================================================================
-- estados          ← cidades           (1:N, CASCADE)
-- cidades          ← empresas          (1:N, RESTRICT)
-- cidades          ← clientes          (1:N, RESTRICT)
-- empresas         ← categorias        (1:N, RESTRICT)
-- empresas         ← fornecedores      (1:N, CASCADE)
-- empresas         ← clientes          (1:N, CASCADE)
-- empresas         ← empresa_funcionarios (1:N, CASCADE)
-- empresas         ← produtos          (1:N, RESTRICT)
-- empresas         ← pedidos           (1:N, RESTRICT)
-- perfis_usuario   ← usuarios          (1:N, RESTRICT)
-- clientes         ← usuarios          (1:N, CASCADE, NULLABLE)
-- clientes         ← pedidos           (1:N, RESTRICT)
-- categorias       ← produtos          (1:N, RESTRICT)
-- fornecedores     ← produtos          (1:N, RESTRICT)
-- usuarios         ← empresa_funcionarios (1:1, CASCADE)  -- único por usuário
-- pedidos          ← pedido_itens      (1:N, CASCADE)
-- produtos         ← pedido_itens      (1:N, RESTRICT)
-- =============================================================================